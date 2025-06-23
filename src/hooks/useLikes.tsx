
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
        console.log('Successfully removed like');
        
        // Trigger a custom event to update like counts everywhere
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('likesUpdated', {
            detail: { fairytaleId, fairytaleType, action: 'unlike' }
          }));
        }, 100);
        
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
        console.log('Successfully added like:', data);
        
        // Trigger a custom event to update like counts everywhere
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('likesUpdated', {
            detail: { fairytaleId, fairytaleType, action: 'like' }
          }));
        }, 100);
        
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

  useEffect(() => {
    fetchUserLikes();
  }, [user?.id]);

  return {
    userLikes,
    loading,
    toggleLike,
    isLiked,
    refetch: fetchUserLikes
  };
};
