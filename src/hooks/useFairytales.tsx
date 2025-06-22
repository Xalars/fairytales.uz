
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
  status?: string;
  original_content?: string;
  moderated_content?: string;
}

export interface AIFairytale {
  id: string;
  title: string;
  content: string;
  parameters?: any;
  created_at: string;
  updated_at: string;
  language?: string;
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
      
      // Fetch from original Fairytales table (preloaded stories)
      const { data: fairytalesData, error: fairytalesError } = await supabase
        .from('Fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (fairytalesError) {
        console.error('Error fetching fairytales:', fairytalesError);
        setFairytales([]);
      } else {
        console.log('Fetched fairytales:', fairytalesData);
        setFairytales(fairytalesData || []);
      }

      // Fetch from user_fairytales table (user-generated stories)
      const { data: userFairytalesData, error: userFairytalesError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (userFairytalesError) {
        console.error('Error fetching user fairytales:', userFairytalesError);
        setUserFairytales([]);
      } else {
        setUserFairytales(userFairytalesData || []);
      }

      // Fetch from ai_fairytales table (AI-generated stories)
      const { data: aiFairytalesData, error: aiFairytalesError } = await supabase
        .from('ai_fairytales')
        .select('*')
        .order('created_at', { ascending: false });

      if (aiFairytalesError) {
        console.log('AI fairytales table might not exist yet:', aiFairytalesError);
        setAiFairytales([]);
      } else {
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

  const moderateContent = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Content moderation error:', err);
      return { isAppropriate: false, moderatedContent: content };
    }
  };

  const generateImage = async (title: string, content: string, language: string = 'russian') => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { title, content, language }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (err) {
      console.error('Image generation error:', err);
      return null;
    }
  };

  const addUserFairytale = async (title: string, content: string, authorId: string) => {
    try {
      // First moderate the content
      const moderationResult = await moderateContent(content);
      
      if (!moderationResult.isAppropriate) {
        return { 
          data: null, 
          error: moderationResult.reason || 'В сказке содержится неподобающий контент',
          moderationFailed: true
        };
      }

      // Generate image for the story
      const imageUrl = await generateImage(title, moderationResult.moderatedContent || content);

      const { data, error } = await supabase
        .from('user_fairytales')
        .insert([{ 
          title, 
          content: moderationResult.moderatedContent || content,
          original_content: content,
          moderated_content: moderationResult.moderatedContent,
          author_id: authorId,
          status: 'approved',
          image_url: imageUrl
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchFairytales();
      return { 
        data, 
        error: null, 
        wasModerated: !!moderationResult.moderatedContent,
        moderatedContent: moderationResult.moderatedContent,
        message: moderationResult.message
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addAIFairytale = async (title: string, content: string, parameters?: any, language?: string) => {
    try {
      // Generate image for the AI story
      const imageUrl = await generateImage(title, content, language);

      const { data, error } = await supabase
        .from('ai_fairytales')
        .insert([{ 
          title, 
          content, 
          parameters, 
          language: language || 'russian',
          image_url: imageUrl
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Refresh the list
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      console.error('Error saving AI fairytale:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const generateTTS = async (text: string, language: string = 'russian') => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: { text, language }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('TTS generation error:', err);
      return { error: err instanceof Error ? err.message : 'TTS generation failed' };
    }
  };

  const getUserFairytales = async (userId: string) => {
    try {
      const { data: userStories, error: userError } = await supabase
        .from('user_fairytales')
        .select('*')
        .eq('author_id', userId);

      const { data: aiStories, error: aiError } = await supabase
        .from('ai_fairytales')
        .select('*');

      if (userError || aiError) {
        console.error('Error fetching user stories:', userError || aiError);
        return [];
      }

      return [
        ...(userStories || []).map(story => ({ ...story, source: 'user' })),
        ...(aiStories || []).map(story => ({ ...story, source: 'ai' }))
      ];
    } catch (err) {
      console.error('Error in getUserFairytales:', err);
      return [];
    }
  };

  return {
    fairytales, // Original preloaded fairytales
    userFairytales, // User-generated fairytales
    aiFairytales, // AI-generated fairytales
    loading,
    error,
    addUserFairytale,
    addAIFairytale,
    generateTTS,
    getUserFairytales,
    refetch: fetchFairytales,
  };
};
