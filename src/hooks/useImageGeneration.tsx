
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCoverImage = async (title: string, content: string, storyId: string, storyType: 'folk' | 'user_generated' | 'ai_generated') => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-cover-image', {
        body: {
          title,
          content: content.substring(0, 500), // Limit content length for prompt
          storyId,
          storyType
        }
      });

      if (error) throw error;
      
      return data.coverImageUrl;
    } catch (error) {
      console.error('Error generating cover image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCoverForExistingStory = async (storyId: string, title: string, content: string, storyType: 'folk' | 'user_generated' | 'ai_generated') => {
    try {
      setIsGenerating(true);
      
      const coverImageUrl = await generateCoverImage(title, content, storyId, storyType);
      
      // Update the story record with the new cover image
      let tableName = '';
      switch (storyType) {
        case 'folk':
          tableName = 'folk_fairytales';
          break;
        case 'user_generated':
          tableName = 'user_fairytales';
          break;
        case 'ai_generated':
          tableName = 'ai_fairytales';
          break;
      }

      const { error: updateError } = await supabase
        .from(tableName)
        .update({ cover_image_url: coverImageUrl })
        .eq('id', storyId);

      if (updateError) throw updateError;
      
      return coverImageUrl;
    } catch (error) {
      console.error('Error generating cover for existing story:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateCoverImage,
    generateCoverForExistingStory
  };
};
