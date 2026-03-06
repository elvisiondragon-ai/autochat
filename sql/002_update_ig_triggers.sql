-- 002_update_ig_triggers.sql
-- Add missing columns to ig_triggers for full AutoChat functionality
-- This script safely adds columns if they don't exist yet based on your existing schema

ALTER TABLE public.ig_triggers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS comment_reply TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS button_url TEXT,
ADD COLUMN IF NOT EXISTS button_text_2 TEXT,
ADD COLUMN IF NOT EXISTS button_url_2 TEXT;

-- Note: Because existing triggers have `user_id` as NULL, 
-- they might disappear if we apply strict RLS. 
-- You may need to run: UPDATE public.ig_triggers SET user_id = 'your-user-id' WHERE user_id IS NULL;
-- to claim your old triggers before applying the RLS below.

-- Update RLS policy to enforce user isolation
DROP POLICY IF EXISTS "Allow authenticated users full access to ig_triggers" ON public.ig_triggers;
DROP POLICY IF EXISTS "Users can only view and manage their own triggers" ON public.ig_triggers;

CREATE POLICY "Users can only view and manage their own triggers"
ON public.ig_triggers
FOR ALL
TO authenticated
USING (auth.uid() = user_id);
