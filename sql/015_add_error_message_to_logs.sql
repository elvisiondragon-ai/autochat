-- 1. Add error_message column if it's missing (for logs)
ALTER TABLE autochat_audience_logs ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Force Supabase to reload its schema cache so the Edge Function sees the new column instantly
NOTIFY pgrst, 'reload schema';
