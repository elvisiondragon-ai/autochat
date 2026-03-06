-- ================================================
-- autochat_clients table
-- Run this in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-05
-- ================================================

-- Create autochat_clients table
CREATE TABLE IF NOT EXISTS public.autochat_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  -- Subscription status
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'paid')),
  -- Meta / Graph API credentials
  meta_access_token TEXT,
  meta_page_id TEXT,
  meta_instagram_id TEXT,
  meta_app_id TEXT,
  meta_app_secret TEXT,
  -- Autochat trigger configuration
  trigger_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.autochat_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "autochat_clients: users view own row"
  ON public.autochat_clients
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "autochat_clients: users insert own row"
  ON public.autochat_clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "autochat_clients: users update own row"
  ON public.autochat_clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.autochat_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER autochat_clients_updated_at
  BEFORE UPDATE ON public.autochat_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.autochat_update_updated_at();

-- ================================================
-- Auto-migrate: when a user from profiles signs into
-- autochat for the first time, seed their row from profiles
-- (handled via the edge function upsert)
-- ================================================
