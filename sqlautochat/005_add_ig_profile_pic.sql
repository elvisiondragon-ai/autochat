-- ================================================
-- Add ig_profile_pic_url column to autochat_clients
-- Date: 2026-03-06
-- Purpose: Store IG profile picture URL persistently
--          so it doesn't need live API call every load
-- ================================================

ALTER TABLE public.autochat_clients
ADD COLUMN IF NOT EXISTS ig_profile_pic_url TEXT;

-- ================================================
