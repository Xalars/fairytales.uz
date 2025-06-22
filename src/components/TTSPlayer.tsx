
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { useFairytales } from '@/hooks/useFairytales';
import { useToast } from '@/hooks/use-toast';

interface TTSPlayerProps {
  text: string;
  language?: string;
}

export const TTSPlayer = ({ text, language = 'russian' }: TTSPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { generateTTS } = useFairytales();
  const { toast } = useToast();

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateTTS(text, language);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Create audio from base64
      const audioBlob = new Blob([
        Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать аудио",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      <Button
        size="sm"
        variant="outline"
        onClick={handlePlay}
        disabled={isLoading}
        className="border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-full font-medium flex items-center gap-1"
      >
        {isLoading ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isLoading ? 'Генерация...' : isPlaying ? 'Пауза' : 'Слушать'}
      </Button>
      
      {isPlaying && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          className="border-2 border-red-300 text-red-700 hover:bg-red-100 rounded-full font-medium"
        >
          <Square className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
