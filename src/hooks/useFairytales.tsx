import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Fairytale {
  id: string;
  title: string;
  content?: string;
  text_ru?: string;
  author_id?: string | null;
  created_at: string;
  updated_at?: string;
  language?: string;
  type?: string;
  audio_url?: string;
  image_url?: string;
  cover_image_url?: string;
  like_count?: number;
}

export interface FolkFairytale {
  id: string;
  title: string;
  content: string;
  language?: string;
  type?: string;
  audio_url?: string;
  image_url?: string;
  cover_image_url?: string;
  like_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface AIFairytale {
  id: string;
  title: string;
  content: string;
  parameters?: any;
  created_at: string;
  updated_at: string;
  audio_url?: string;
  image_url?: string;
  cover_image_url?: string;
  like_count?: number;
}

export const useFairytales = () => {
  const { user } = useAuth();
  const [fairytales, setFairytales] = useState<FolkFairytale[]>([]);
  const [userFairytales, setUserFairytales] = useState<Fairytale[]>([]);
  const [aiFairytales, setAiFairytales] = useState<AIFairytale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFairytales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from new folk_fairytales table
      console.log('Fetching folk tales from folk_fairytales table...');
      const { data: folkFairytalesData, error: folkFairytalesError } = await supabase
        .from('folk_fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (folkFairytalesError) {
        console.error('Error fetching folk tales:', folkFairytalesError);
      } else {
        console.log('Folk tales fetched successfully:', folkFairytalesData?.length || 0);
        setFairytales(folkFairytalesData || []);
      }

      // Fetch from user_fairytales table (user-generated stories)
      console.log('Fetching user fairytales...');
      const { data: userFairytalesData, error: userFairytalesError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (userFairytalesError) {
        console.error('Error fetching user fairytales:', userFairytalesError);
      } else {
        console.log('User fairytales fetched successfully:', userFairytalesData?.length || 0);
        setUserFairytales(userFairytalesData || []);
      }

      // Fetch from ai_fairytales table (AI-generated stories)
      console.log('Fetching AI fairytales...');
      const { data: aiFairytalesData, error: aiFairytalesError } = await supabase
        .from('ai_fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (aiFairytalesError) {
        console.error('Error fetching AI fairytales:', aiFairytalesError);
      } else {
        console.log('AI fairytales fetched successfully:', aiFairytalesData?.length || 0);
        setAiFairytales(aiFairytalesData || []);
      }
      
    } catch (err) {
      console.error('Error in fetchFairytales:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFairytales();
  }, []);

  const addUserFairytale = async (title: string, content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_fairytales')
        .insert([{ title, content, author_id: authorId, status: 'published' }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addAIFairytale = async (title: string, content: string, parameters?: any) => {
    try {
      console.log('Saving AI fairytale:', { title, content: content.substring(0, 100) + '...' });
      
      const { data, error } = await supabase
        .from('ai_fairytales')
        .insert([{ 
          title: title.trim(), 
          content: content.trim(), 
          parameters: parameters || {},
          language: parameters?.language || 'russian',
          created_by_user_id: user?.id || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving AI fairytale:', error);
        throw error;
      }
      
      console.log('AI fairytale saved successfully:', data);
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      console.error('Error in addAIFairytale:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    fairytales,
    userFairytales,
    aiFairytales,
    loading,
    error,
    addUserFairytale,
    addAIFairytale,
    refetch: fetchFairytales,
  };
};
