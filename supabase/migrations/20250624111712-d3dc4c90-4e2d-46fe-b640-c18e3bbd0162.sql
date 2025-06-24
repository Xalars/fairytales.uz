
-- Create storage bucket for fairytale covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('fairytale-covers', 'fairytale-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the fairytale-covers bucket
CREATE POLICY "Allow public access to cover images" ON storage.objects
FOR SELECT USING (bucket_id = 'fairytale-covers');

CREATE POLICY "Allow authenticated users to upload cover images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fairytale-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update cover images" ON storage.objects
FOR UPDATE USING (bucket_id = 'fairytale-covers' AND auth.role() = 'authenticated');
