
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  like_count?: number;
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
  like_count?: number;
}

export const useFairytales = () => {
  const [fairytales, setFairytales] = useState<Fairytale[]>([]);
  const [userFairytales, setUserFairytales] = useState<Fairytale[]>([]);
  const [aiFairytales, setAiFairytales] = useState<AIFairytale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFairytales = async () => {
    try {
      setLoading(true);
      
      // Fetch from original Fairytales table (folk tales)
      console.log('Fetching folk tales from Fairytales table...');
      const { data: fairytalesData, error: fairytalesError } = await supabase
        .from('Fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (fairytalesError) {
        console.error('Error fetching folk tales:', fairytalesError);
        throw fairytalesError;
      }

      console.log('Folk tales fetched:', fairytalesData);
      
      // Process folk tales data to ensure consistent structure
      const processedFairytales = (fairytalesData || []).map(tale => ({
        ...tale,
        content: tale.text_ru || tale.content || '', // Use text_ru as primary content
        like_count: tale.like_count || 0
      }));

      // Fetch from user_fairytales table (user-generated stories)
      const { data: userFairytalesData, error: userFairytalesError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('status', 'published') // Only show published stories
        .order('created_at', { ascending: false });

      if (userFairytalesError) {
        console.error('Error fetching user fairytales:', userFairytalesError);
        throw userFairytalesError;
      }

      // Fetch from ai_fairytales table (AI-generated stories)
      const { data: aiFairytalesData, error: aiFairytalesError } = await supabase
        .from('ai_fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (aiFairytalesError) {
        console.error('Error fetching AI fairytales:', aiFairytalesError);
        setAiFairytales([]);
      } else {
        setAiFairytales(aiFairytalesData || []);
      }

      setFairytales(processedFairytales);
      setUserFairytales(userFairytalesData || []);
      
      console.log('All data fetched successfully:', {
        folkTales: processedFairytales.length,
        userTales: (userFairytalesData || []).length,
        aiTales: (aiFairytalesData || []).length
      });
      
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
      
      // Refresh the list
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addAIFairytale = async (title: string, content: string, parameters?: any) => {
    try {
      const { data, error } = await supabase
        .from('ai_fairytales')
        .insert([{ title, content, parameters }])
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
    fairytales, // Folk tales from Fairytales table
    userFairytales, // User-generated fairytales
    aiFairytales, // AI-generated fairytales
    loading,
    error,
    addUserFairytale,
    addAIFairytale,
    refetch: fetchFairytales,
  };
};
