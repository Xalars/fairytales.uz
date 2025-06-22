
-- Create likes table for favorite system
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fairytale_id UUID NOT NULL,
  fairytale_type TEXT NOT NULL CHECK (fairytale_type IN ('folk', 'user', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fairytale_id, fairytale_type)
);

-- Enable RLS on likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes table
CREATE POLICY "Users can view their own likes" 
  ON public.likes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own likes" 
  ON public.likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add image_url columns to all fairytale tables
ALTER TABLE "Fairytales" ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE ai_fairytales ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add like_count columns for performance
ALTER TABLE "Fairytales" ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE ai_fairytales ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
