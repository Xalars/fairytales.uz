
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudio = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const generateAndPlayAudio = async (
    content: string, 
    storyId: string, 
    storyType: 'folk' | 'user_generated' | 'ai_generated',
    existingAudioUrl?: string
  ) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // If we have existing audio URL, play it directly
      if (existingAudioUrl) {
        console.log('Playing existing audio for story:', storyId);
        const audio = new Audio(existingAudioUrl);
        setCurrentAudio(audio);
        setCurrentStoryId(storyId);
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentStoryId(null);
          setCurrentAudio(null);
        };
        
        audio.onerror = (e) => {
          console.error('Error playing existing audio:', e);
          setIsPlaying(false);
          setCurrentStoryId(null);
          setCurrentAudio(null);
        };
        
        await audio.play();
        return;
      }

      // Generate new audio
      setIsGenerating(true);
      setCurrentStoryId(storyId);
      console.log('Generating audio for story:', storyId, 'type:', storyType);

      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: {
          text: content.substring(0, 4000), // Limit text length
          storyId,
          storyType
        }
      });

      if (error) {
        console.error('Audio generation error:', error);
        throw error;
      }

      if (!data || !data.audioUrl) {
        throw new Error('No audio URL received from generation');
      }

      console.log('Audio generation response:', data);

      // Play the generated audio
      const audio = new Audio(data.audioUrl);
      setCurrentAudio(audio);
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentStoryId(null);
        setCurrentAudio(null);
      };
      
      audio.onerror = (e) => {
        console.error('Error playing generated audio:', e);
        setIsPlaying(false);
        setCurrentStoryId(null);
        setCurrentAudio(null);
      };
      
      await audio.play();
      console.log('Audio playback started for story:', storyId);

    } catch (error) {
      console.error('Error generating/playing audio:', error);
      setIsPlaying(false);
      setCurrentStoryId(null);
      setCurrentAudio(null);
      throw error; // Re-throw so components can handle the error
    } finally {
      setIsGenerating(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentStoryId(null);
    setCurrentAudio(null);
  };

  const isCurrentlyPlaying = (storyId: string) => {
    return isPlaying && currentStoryId === storyId;
  };

  const isCurrentlyGenerating = (storyId: string) => {
    return isGenerating && currentStoryId === storyId;
  };

  return {
    isGenerating,
    isPlaying,
    currentStoryId,
    generateAndPlayAudio,
    stopAudio,
    isCurrentlyPlaying,
    isCurrentlyGenerating
  };
};
