-- 009_add_button3_quick_reply.sql
-- Add 3rd button columns to support up to 3 Quick Reply buttons in the automation wizard
-- Quick Replies: button_url = NULL means text-only quick reply (user tap sends text back to bot)
-- Run this in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-06

ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS button_text_3 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS button_url_3  TEXT DEFAULT NULL;

COMMENT ON COLUMN public.autochat_triggers.button_text_3 IS '3rd quick reply button text. NULL url = quick reply (text sent back to bot). Non-null url = web_url redirect.';
COMMENT ON COLUMN public.autochat_triggers.button_url_3  IS 'URL for 3rd button. If NULL, button_text_3 is rendered as Instagram Quick Reply.';

-- Update comment on sequence_type to reflect new values
COMMENT ON COLUMN public.autochat_triggers.sequence_type IS
  'Step 5 sequence type: "opening_dm" = quick reply ice breaker, "follow_check" = verify follow before link, NULL = direct DM';

-- basa_basi column is deprecated (replaced by opening_dm quick reply system)
-- Safe to leave existing data; new triggers will have basa_basi = NULL
COMMENT ON COLUMN public.autochat_triggers.basa_basi IS 'DEPRECATED: Use opening_dm sequence_type + button_text/button_text_2/button_text_3 instead.';
