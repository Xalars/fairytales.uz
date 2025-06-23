
-- Add audio_url column to all fairytale tables if not already present
ALTER TABLE public.folk_fairytales 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

ALTER TABLE public.user_fairytales 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

ALTER TABLE public.ai_fairytales 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fairytale-audio', 'fairytale-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3']);

-- Create storage policies for the audio bucket
CREATE POLICY "Public can view audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'fairytale-audio');

CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fairytale-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their audio files" ON storage.objects
FOR UPDATE USING (bucket_id = 'fairytale-audio' AND auth.role() = 'authenticated');
