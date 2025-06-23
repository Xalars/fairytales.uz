
-- Add cover_image_url field to all fairytale tables
ALTER TABLE public.folk_fairytales 
ADD COLUMN cover_image_url text;

ALTER TABLE public.user_fairytales 
ADD COLUMN cover_image_url text;

ALTER TABLE public.ai_fairytales 
ADD COLUMN cover_image_url text;

-- Create a function to update like counts automatically
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment like count
    CASE NEW.fairytale_type
      WHEN 'folk' THEN
        UPDATE folk_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id::uuid;
      WHEN 'user_generated' THEN
        UPDATE user_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id::uuid;
      WHEN 'ai_generated' THEN
        UPDATE ai_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id::uuid;
    END CASE;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement like count
    CASE OLD.fairytale_type
      WHEN 'folk' THEN
        UPDATE folk_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id::uuid;
      WHEN 'user_generated' THEN
        UPDATE user_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id::uuid;
      WHEN 'ai_generated' THEN
        UPDATE ai_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id::uuid;
    END CASE;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update like counts
CREATE TRIGGER trigger_update_like_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();
