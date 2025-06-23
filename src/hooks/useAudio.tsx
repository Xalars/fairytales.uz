
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
        
        audio.onerror = () => {
          console.error('Error playing existing audio');
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
      console.log('Generating audio for story:', storyId);

      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: {
          text: content.substring(0, 4000), // Limit text length
          storyId,
          storyType
        }
      });

      if (error) throw error;

      // Play the generated audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      setCurrentAudio(audio);
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentStoryId(null);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        console.error('Error playing generated audio');
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
