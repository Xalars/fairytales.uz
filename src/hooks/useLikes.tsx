
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
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserLikes(data || []);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (fairytaleId: string, fairytaleType: 'folk' | 'user_generated' | 'ai_generated') => {
    if (!user) return false;

    try {
      const existingLike = userLikes.find(
        like => like.fairytale_id === fairytaleId && like.fairytale_type === fairytaleType
      );

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        
        // Update local state immediately
        setUserLikes(prev => prev.filter(like => like.id !== existingLike.id));
        return false;
      } else {
        // Like
        const { data, error } = await supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            fairytale_id: fairytaleId,
            fairytale_type: fairytaleType
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Update local state immediately
        setUserLikes(prev => [...prev, data]);
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
  }, [user]);

  return {
    userLikes,
    loading,
    toggleLike,
    isLiked,
    refetch: fetchUserLikes
  };
};
