
-- Create a new folk_fairytales table with proper structure
CREATE TABLE public.folk_fairytales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'ru',
  type TEXT DEFAULT 'folk',
  audio_url TEXT,
  image_url TEXT,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Migrate data from the existing Fairytales table to the new structure
INSERT INTO public.folk_fairytales (title, content, language, type, audio_url, image_url, like_count, created_at)
SELECT 
  COALESCE(title, 'Без названия') as title,
  COALESCE(text_ru, 'Содержание недоступно') as content,
  COALESCE(language, 'ru') as language,
  COALESCE(type, 'folk') as type,
  audio_url,
  image_url,
  COALESCE(like_count, 0) as like_count,
  COALESCE(created_at, now()) as created_at
FROM public."Fairytales"
WHERE text_ru IS NOT NULL AND text_ru != '';

-- Enable RLS for the new table (optional, since these are public folk tales)
ALTER TABLE public.folk_fairytales ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow everyone to read folk tales
CREATE POLICY "Everyone can read folk tales" 
  ON public.folk_fairytales 
  FOR SELECT 
  USING (true);
