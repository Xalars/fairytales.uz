
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudio = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const generateAndPlayAudio = async (
    text: string, 
    storyId: string, 
    storyType: 'folk' | 'user_generated' | 'ai_generated',
    existingAudioUrl?: string
  ) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        setIsPlaying(false);
      }

      let audioUrl = existingAudioUrl;

      // If no existing audio URL, generate new audio
      if (!audioUrl) {
        setIsGenerating(true);
        
        const { data, error } = await supabase.functions.invoke('generate-audio', {
          body: { text, storyId, storyType }
        });

        if (error) {
          console.error('Error generating audio:', error);
          throw new Error('Failed to generate audio');
        }

        audioUrl = data.audioUrl;
        setIsGenerating(false);
      }

      // Play the audio
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          console.error('Audio playback error');
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error in generateAndPlayAudio:', error);
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  return {
    isGenerating,
    isPlaying,
    generateAndPlayAudio,
    stopAudio
  };
};
