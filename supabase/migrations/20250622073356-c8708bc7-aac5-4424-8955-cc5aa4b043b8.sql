
-- Add a status column to user_fairytales for moderation tracking
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS original_content TEXT;
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS moderated_content TEXT;

-- Add language support to ai_fairytales
ALTER TABLE ai_fairytales ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'russian';

-- Add audio URL storage for TTS
ALTER TABLE user_fairytales ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE ai_fairytales ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE "Fairytales" ADD COLUMN IF NOT EXISTS audio_url TEXT;
