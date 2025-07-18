import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useImageGeneration } from '@/hooks/useImageGeneration';

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
  created_by_user_id?: string;
}

export const useFairytales = () => {
  const { user } = useAuth();
  const { generateCoverImage } = useImageGeneration();
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
    
    // Listen for like updates to refetch data
    const handleLikesUpdated = () => {
      fetchFairytales();
    };
    
    window.addEventListener('likesUpdated', handleLikesUpdated);
    
    return () => {
      window.removeEventListener('likesUpdated', handleLikesUpdated);
    };
  }, []);

  const addUserFairytale = async (title: string, content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_fairytales')
        .insert([{ title, content, author_id: authorId, status: 'published' }])
        .select()
        .single();

      if (error) throw error;
      
      // Generate cover image for user fairytale
      try {
        await generateCoverImage(title, content, data.id, 'user_generated');
      } catch (coverError) {
        console.error('Failed to generate cover image for user fairytale:', coverError);
        // Don't fail the whole operation if cover generation fails
      }
      
      await fetchFairytales();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const addAIFairytale = async (title: string, content: string, parameters?: any, coverImageUrl?: string) => {
    try {
      console.log('Saving AI fairytale:', { title: title.substring(0, 50) + '...', contentLength: content.length });
      
      if (!user) {
        throw new Error('User must be authenticated to save AI fairytales');
      }

      if (!title || !content) {
        throw new Error('Title and content are required');
      }

      const fairytaleData = { 
        title: title.trim(), 
        content: content.trim(), 
        parameters: parameters || {},
        language: parameters?.language || 'russian',
        created_by_user_id: user.id,
        cover_image_url: coverImageUrl || null
      };

      console.log('Inserting AI fairytale data:', fairytaleData);

      const { data, error } = await supabase
        .from('ai_fairytales')
        .insert([fairytaleData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving AI fairytale:', error);
        throw error;
      }
      
      console.log('AI fairytale saved successfully:', data);
      
      // Generate cover image automatically for AI fairytales if not provided
      if (!coverImageUrl) {
        try {
          await generateCoverImage(title, content, data.id, 'ai_generated');
          console.log('Cover image generated for AI fairytale:', data.id);
        } catch (coverError) {
          console.error('Failed to generate cover image for AI fairytale:', coverError);
          // Don't fail the whole operation if cover generation fails
        }
      }
      
      // Refresh the fairytales list to show the new story immediately
      await fetchFairytales();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error in addAIFairytale:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the fairytale';
      return { data: null, error: errorMessage };
    }
  };

  const deleteUserFairytale = async (fairytaleId: string) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to delete fairytales');
      }

      console.log('Deleting user fairytale:', fairytaleId);

      const { error } = await supabase
        .from('user_fairytales')
        .delete()
        .eq('id', fairytaleId)
        .eq('author_id', user.id); // Ensure only the author can delete

      if (error) {
        console.error('Supabase error deleting user fairytale:', error);
        throw error;
      }

      console.log('User fairytale deleted successfully');
      
      // Refresh the fairytales list
      await fetchFairytales();
      
      return { error: null };
    } catch (err) {
      console.error('Error in deleteUserFairytale:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the fairytale';
      return { error: errorMessage };
    }
  };

  const deleteAIFairytale = async (fairytaleId: string) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to delete fairytales');
      }

      console.log('Deleting AI fairytale:', fairytaleId);

      const { error } = await supabase
        .from('ai_fairytales')
        .delete()
        .eq('id', fairytaleId)
        .eq('created_by_user_id', user.id); // Ensure only the creator can delete

      if (error) {
        console.error('Supabase error deleting AI fairytale:', error);
        throw error;
      }

      console.log('AI fairytale deleted successfully');
      
      // Refresh the fairytales list
      await fetchFairytales();
      
      return { error: null };
    } catch (err) {
      console.error('Error in deleteAIFairytale:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the fairytale';
      return { error: errorMessage };
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
    deleteUserFairytale,
    deleteAIFairytale,
    refetch: fetchFairytales,
  };
};
