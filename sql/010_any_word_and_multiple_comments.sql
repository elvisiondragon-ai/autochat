-- 010_any_word_and_multiple_comments.sql
-- Add support for "any word" triggers and multiple randomized comment replies
-- Run this in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-06

ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS is_any_word BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS comment_reply_2 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comment_reply_3 TEXT DEFAULT NULL;

COMMENT ON COLUMN public.autochat_triggers.is_any_word IS 'If true, triggers on any incoming message/comment instead of matching specific keywords';
COMMENT ON COLUMN public.autochat_triggers.comment_reply_2 IS 'Optional secondary comment reply (chosen randomly with others)';
COMMENT ON COLUMN public.autochat_triggers.comment_reply_3 IS 'Optional tertiary comment reply (chosen randomly with others)';
