
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Like {
  id: string;
  user_id: string;
  fairytale_id: string;
  fairytale_type: 'folk' | 'user' | 'ai';
  created_at: string;
}

export const useLikes = () => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
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
      setLikes(data || []);
    } catch (err) {
      console.error('Error fetching likes:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (fairytaleId: string, fairytaleType: 'folk' | 'user' | 'ai') => {
    if (!user) return false;

    try {
      const existingLike = likes.find(
        like => like.fairytale_id === fairytaleId && like.fairytale_type === fairytaleType
      );

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        setLikes(prev => prev.filter(like => like.id !== existingLike.id));
        return false;
      } else {
        // Add like
        const { data, error } = await supabase
          .from('likes')
          .insert([{
            fairytale_id: fairytaleId,
            fairytale_type: fairytaleType,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;
        setLikes(prev => [...prev, data]);
        return true;
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      return false;
    }
  };

  const isLiked = (fairytaleId: string, fairytaleType: 'folk' | 'user' | 'ai') => {
    return likes.some(
      like => like.fairytale_id === fairytaleId && like.fairytale_type === fairytaleType
    );
  };

  useEffect(() => {
    fetchUserLikes();
  }, [user]);

  return {
    likes,
    loading,
    toggleLike,
    isLiked,
    refetch: fetchUserLikes
  };
};
