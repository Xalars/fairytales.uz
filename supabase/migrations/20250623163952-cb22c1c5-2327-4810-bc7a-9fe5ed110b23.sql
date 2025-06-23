
-- Add the missing created_by_user_id column to ai_fairytales table
ALTER TABLE ai_fairytales ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

-- Create the fairytale-audio storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('fairytale-audio', 'fairytale-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the fairytale-audio bucket
CREATE POLICY "Allow public access to fairytale audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'fairytale-audio');

CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fairytale-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their audio files" ON storage.objects
FOR UPDATE USING (bucket_id = 'fairytale-audio' AND auth.role() = 'authenticated');
