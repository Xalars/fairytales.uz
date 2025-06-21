
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Fairytale {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFairytales = () => {
  const [fairytales, setFairytales] = useState<Fairytale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFairytales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFairytales(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFairytales();
  }, []);

  const addFairytale = async (title: string, content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('fairytales')
        .insert([{ title, content, author_id: authorId }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    fairytales,
    loading,
    error,
    addFairytale,
    refetch: fetchFairytales,
  };
};
