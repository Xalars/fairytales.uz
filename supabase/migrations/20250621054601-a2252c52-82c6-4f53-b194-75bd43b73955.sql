
-- First, let's rename the fairytales table to user_fairytales
ALTER TABLE public.fairytales RENAME TO user_fairytales;

-- Update the RLS policies to reference the new table name
DROP POLICY IF EXISTS "Anyone can view published fairytales" ON public.user_fairytales;
DROP POLICY IF EXISTS "Users can insert their own fairytales" ON public.user_fairytales;
DROP POLICY IF EXISTS "Users can update their own fairytales" ON public.user_fairytales;
DROP POLICY IF EXISTS "Users can delete their own fairytales" ON public.user_fairytales;

CREATE POLICY "Anyone can view published user fairytales" 
  ON public.user_fairytales 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own user fairytales" 
  ON public.user_fairytales 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own user fairytales" 
  ON public.user_fairytales 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own user fairytales" 
  ON public.user_fairytales 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Fix the profiles table to ensure registration works properly
-- Make sure the profiles table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Update the trigger function to handle registration properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create AI fairytales table for future use
CREATE TABLE IF NOT EXISTS public.ai_fairytales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_fairytales
ALTER TABLE public.ai_fairytales ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view AI fairytales
CREATE POLICY "Anyone can view AI fairytales" 
  ON public.ai_fairytales 
  FOR SELECT 
  USING (true);
