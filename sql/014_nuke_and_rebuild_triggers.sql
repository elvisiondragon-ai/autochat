-- 014_nuke_and_rebuild_triggers.sql
-- FULL RESET: Truncate corrupted data + rebuild clean schema for autochat_triggers
-- This fixes the mismatch between Dashboard (step4/5/6 columns) and Webhook (old columns)
-- Date: 2026-03-06
--
-- ⚠️ WARNING: This will DELETE ALL existing triggers and audience logs!

-- 1. TRUNCATE CASCADE (fixes FK constraint error)
TRUNCATE TABLE public.autochat_triggers CASCADE;
-- ↑ This also truncates autochat_audience_logs due to FK on trigger_id

-- 2. DROP ALL legacy columns that no longer exist in the wizard
ALTER TABLE public.autochat_triggers
  DROP COLUMN IF EXISTS reply_message,
  DROP COLUMN IF EXISTS button_text,
  DROP COLUMN IF EXISTS button_url,
  DROP COLUMN IF EXISTS button_text_2,
  DROP COLUMN IF EXISTS button_url_2,
  DROP COLUMN IF EXISTS button_text_3,
  DROP COLUMN IF EXISTS button_url_3,
  DROP COLUMN IF EXISTS quick_replies,
  DROP COLUMN IF EXISTS sequence_type,
  DROP COLUMN IF EXISTS basa_basi,
  DROP COLUMN IF EXISTS dm_reply;

-- 3. Ensure all required columns exist (idempotent with IF NOT EXISTS)

-- Core columns (these should already exist from the original table)
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS user_id UUID NULL,
  ADD COLUMN IF NOT EXISTS keyword TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_any_word BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS trigger_source TEXT NULL,
  ADD COLUMN IF NOT EXISTS target_post TEXT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Comment reply columns (randomized replies under the post)
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS comment_reply TEXT NULL,
  ADD COLUMN IF NOT EXISTS comment_reply_2 TEXT NULL,
  ADD COLUMN IF NOT EXISTS comment_reply_3 TEXT NULL;

-- Step 4: Opening DM
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS step4_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step4_button_type TEXT DEFAULT 'quick_reply',
  ADD COLUMN IF NOT EXISTS step4_button1_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step4_button1_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS step4_button2_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step4_button2_url TEXT NULL;

-- Step 5: Follow-up DM
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS step5_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button_type TEXT DEFAULT 'quick_reply',
  ADD COLUMN IF NOT EXISTS step5_button1_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button1_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button2_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button2_url TEXT NULL;

-- Step 6: Ending (Website URL only, max 1 button)
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS step6_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step6_button_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step6_button_url TEXT NULL;

-- 4. Add comments for clarity
COMMENT ON TABLE public.autochat_triggers IS 'Stores automation triggers with 3-step DM sequence (Step 4, 5, 6). Clean schema as of 2026-03-06.';
COMMENT ON COLUMN public.autochat_triggers.step4_button_type IS 'quick_reply or web_url — determines button rendering for Step 4';
COMMENT ON COLUMN public.autochat_triggers.step5_button_type IS 'quick_reply or web_url — determines button rendering for Step 5';
COMMENT ON COLUMN public.autochat_triggers.trigger_source IS 'komentar_ig_fb, story_ig_fb, or chat_ig_fb';

-- Done! Now run the updated webhook and dashboard code.
