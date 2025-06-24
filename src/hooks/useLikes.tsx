
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Like {
  id: string;
  user_id: string;
  fairytale_id: string;
  fairytale_type: 'folk' | 'user_generated' | 'ai_generated';
  created_at: string;
}

export const useLikes = () => {
  const { user } = useAuth();
  const [userLikes, setUserLikes] = useState<Like[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchUserLikes = async () => {
    if (!user) {
      setUserLikes([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user likes:', error);
        throw error;
      }
      
      console.log('Fetched user likes:', data?.length || 0);
      setUserLikes(data || []);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeCounts = async () => {
    try {
      // Fetch like counts for all stories
      const { data: folkCounts, error: folkError } = await supabase
        .from('folk_fairytales')
        .select('id, like_count');

      const { data: userCounts, error: userError } = await supabase
        .from('user_fairytales')
        .select('id, like_count');

      const { data: aiCounts, error: aiError } = await supabase
        .from('ai_fairytales')
        .select('id, like_count');

      if (folkError || userError || aiError) {
        console.error('Error fetching like counts:', { folkError, userError, aiError });
        return;
      }

      const counts: Record<string, number> = {};
      
      [...(folkCounts || []), ...(userCounts || []), ...(aiCounts || [])].forEach(story => {
        counts[story.id] = story.like_count || 0;
      });

      setLikeCounts(counts);
    } catch (error) {
      console.error('Error fetching like counts:', error);
    }
  };

  const toggleLike = async (fairytaleId: string, fairytaleType: 'folk' | 'user_generated' | 'ai_generated') => {
    if (!user) {
      console.log('User not authenticated, cannot toggle like');
      return false;
    }

    try {
      const existingLike = userLikes.find(
        like => like.fairytale_id === fairytaleId && like.fairytale_type === fairytaleType
      );

      if (existingLike) {
        // Unlike - remove from database
        console.log('Removing like:', existingLike.id);
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) {
          console.error('Error removing like:', error);
          throw error;
        }
        
        // Update local state immediately for better UX
        setUserLikes(prev => prev.filter(like => like.id !== existingLike.id));
        setLikeCounts(prev => ({
          ...prev,
          [fairytaleId]: Math.max((prev[fairytaleId] || 1) - 1, 0)
        }));
        console.log('Successfully removed like');
        
        return false;
      } else {
        // Like - add to database
        console.log('Adding like for:', fairytaleId, fairytaleType);
        const { data, error } = await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            fairytale_id: fairytaleId,
            fairytale_type: fairytaleType
          }])
          .select()
          .single();

        if (error) {
          console.error('Error adding like:', error);
          throw error;
        }
        
        // Update local state immediately for better UX
        setUserLikes(prev => [...prev, data]);
        setLikeCounts(prev => ({
          ...prev,
          [fairytaleId]: (prev[fairytaleId] || 0) + 1
        }));
        console.log('Successfully added like:', data);
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  };

  const isLiked = (fairytaleId: string, fairytaleType: 'folk' | 'user_generated' | 'ai_generated') => {
    return userLikes.some(
      like => like.fairytale_id === fairytaleId && like.fairytale_type === fairytaleType
    );
  };

  const getLikeCount = (fairytaleId: string) => {
    return likeCounts[fairytaleId] || 0;
  };

  useEffect(() => {
    fetchUserLikes();
    fetchLikeCounts();
  }, [user?.id]);

  // Listen for like updates to refetch counts
  useEffect(() => {
    const handleLikesUpdated = () => {
      fetchLikeCounts();
    };
    
    window.addEventListener('likesUpdated', handleLikesUpdated);
    
    return () => {
      window.removeEventListener('likesUpdated', handleLikesUpdated);
    };
  }, []);

  return {
    userLikes,
    loading,
    toggleLike,
    isLiked,
    getLikeCount,
    refetch: () => {
      fetchUserLikes();
      fetchLikeCounts();
    }
  };
};
