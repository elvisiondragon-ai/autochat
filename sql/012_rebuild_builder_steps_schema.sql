-- 012_rebuild_builder_steps_schema.sql
-- Exact rebuilding of the Autochat Triggers table to match the user's strict 3-step sequence
-- Step 4: Text + (Quick Replies OR Web URL) Max 2
-- Step 5: Text + (Quick Replies OR Web URL) Max 2
-- Step 6: Text + Web URL Max 1
-- Date: 2026-03-06

-- 1. DROP the temporary JSONB if it exists (from the previous attempt)
ALTER TABLE public.autochat_triggers DROP COLUMN IF EXISTS quick_replies;

-- 2. RENAME existing columns to match Step 4 (The default trigger reply)
-- The existing reply_message, button_text, button_text_2 will become Step 4
ALTER TABLE public.autochat_triggers 
  RENAME COLUMN reply_message TO step4_text;
ALTER TABLE public.autochat_triggers 
  RENAME COLUMN button_text TO step4_button1_text;
ALTER TABLE public.autochat_triggers 
  RENAME COLUMN button_url TO step4_button1_url;
ALTER TABLE public.autochat_triggers 
  RENAME COLUMN button_text_2 TO step4_button2_text;
ALTER TABLE public.autochat_triggers 
  RENAME COLUMN button_url_2 TO step4_button2_url;

-- Drop the 3rd button as user strictly requested Max 2 for Step 4 & 5
ALTER TABLE public.autochat_triggers DROP COLUMN IF EXISTS button_text_3;
ALTER TABLE public.autochat_triggers DROP COLUMN IF EXISTS button_url_3;

-- 3. ADD Columns for Step 5
ALTER TABLE public.autochat_triggers 
  ADD COLUMN IF NOT EXISTS step5_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button1_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button1_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button2_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step5_button2_url TEXT NULL;

-- 4. ADD Columns for Step 6
ALTER TABLE public.autochat_triggers 
  ADD COLUMN IF NOT EXISTS step6_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step6_button_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS step6_button_url TEXT NULL;

-- 5. Add a flag/type to determine if Step 4/5 is using Quick Replies or Web URLs
ALTER TABLE public.autochat_triggers 
  ADD COLUMN IF NOT EXISTS step4_button_type TEXT DEFAULT 'quick_reply', -- 'quick_reply' or 'web_url'
  ADD COLUMN IF NOT EXISTS step5_button_type TEXT DEFAULT 'quick_reply';

-- Clean up unused old sequence columns
ALTER TABLE public.autochat_triggers DROP COLUMN IF EXISTS sequence_type;
ALTER TABLE public.autochat_triggers DROP COLUMN IF EXISTS basa_basi;
