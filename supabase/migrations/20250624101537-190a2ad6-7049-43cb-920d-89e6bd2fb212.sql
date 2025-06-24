
-- Fix the update_like_count function to handle UUID conversion properly
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment like count
    CASE NEW.fairytale_type
      WHEN 'folk' THEN
        UPDATE folk_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id;
      WHEN 'user_generated' THEN
        UPDATE user_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id;
      WHEN 'ai_generated' THEN
        UPDATE ai_fairytales SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.fairytale_id;
    END CASE;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement like count
    CASE OLD.fairytale_type
      WHEN 'folk' THEN
        UPDATE folk_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id;
      WHEN 'user_generated' THEN
        UPDATE user_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id;
      WHEN 'ai_generated' THEN
        UPDATE ai_fairytales SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.fairytale_id;
    END CASE;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all like counts based on existing likes
UPDATE folk_fairytales SET like_count = (
  SELECT COUNT(*) FROM likes WHERE fairytale_id = folk_fairytales.id AND fairytale_type = 'folk'
);

UPDATE user_fairytales SET like_count = (
  SELECT COUNT(*) FROM likes WHERE fairytale_id = user_fairytales.id AND fairytale_type = 'user_generated'
);

UPDATE ai_fairytales SET like_count = (
  SELECT COUNT(*) FROM likes WHERE fairytale_id = ai_fairytales.id AND fairytale_type = 'ai_generated'
);
