
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

  return {
    isGenerating,
    generateCoverImage
  };
};
