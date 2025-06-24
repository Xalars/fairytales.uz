
-- Add missing RLS policies for ai_fairytales table

-- Policy to allow authenticated users to INSERT their own AI fairytales
CREATE POLICY "Users can create their own AI fairytales" 
  ON public.ai_fairytales 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by_user_id);

-- Policy to allow users to UPDATE their own AI fairytales
CREATE POLICY "Users can update their own AI fairytales" 
  ON public.ai_fairytales 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by_user_id) 
  WITH CHECK (auth.uid() = created_by_user_id);

-- Policy to allow users to DELETE their own AI fairytales
CREATE POLICY "Users can delete their own AI fairytales" 
  ON public.ai_fairytales 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = created_by_user_id);
