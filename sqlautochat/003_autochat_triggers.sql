-- ================================================
-- autochat_triggers table — multi-tenant per client
-- Run in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-05
-- ================================================

-- Each client gets their own triggers, linked by user_id
CREATE TABLE IF NOT EXISTS public.autochat_triggers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword         TEXT NOT NULL,           -- IG/FB comment keyword to match
  reply_message   TEXT NOT NULL,           -- DM text to send
  button_text     TEXT,                    -- optional CTA button label
  button_url      TEXT,                    -- optional CTA button URL
  button_text_2   TEXT,
  button_url_2    TEXT,
  comment_reply   TEXT DEFAULT 'kak silahkan cek dm sudah dikirim 🚀',
  platform        TEXT DEFAULT 'both' CHECK (platform IN ('instagram','facebook','both')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Logs per-client DM sends
CREATE TABLE IF NOT EXISTS public.autochat_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        TEXT,                    -- 'instagram' | 'facebook'
  ig_user_id      TEXT NOT NULL,
  trigger_keyword TEXT NOT NULL,
  status          TEXT NOT NULL,           -- 'success' | 'failed'
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.autochat_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autochat_logs     ENABLE ROW LEVEL SECURITY;

-- Clients only see their own triggers
CREATE POLICY "autochat_triggers: owner access"
  ON public.autochat_triggers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Clients only see their own logs
CREATE POLICY "autochat_logs: owner access"
  ON public.autochat_logs FOR SELECT
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER autochat_triggers_updated_at
  BEFORE UPDATE ON public.autochat_triggers
  FOR EACH ROW EXECUTE FUNCTION public.autochat_update_updated_at();

-- Index for fast webhook lookups (find client by page_id or ig_user_id)
CREATE INDEX IF NOT EXISTS idx_autochat_clients_meta_page
  ON public.autochat_clients(meta_page_id);

CREATE INDEX IF NOT EXISTS idx_autochat_clients_meta_ig
  ON public.autochat_clients(meta_instagram_id);
