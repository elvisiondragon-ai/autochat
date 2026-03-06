-- ================================================
-- 006: Migrate ig_logs → autochat_audience_logs & drop ig_logs
-- Date: 2026-03-06
-- Purpose: ig_logs (115 rows) is redundant with autochat_audience_logs.
--          Migrate data then drop the old table.
-- ================================================

-- Step 1: Migrate 115 rows from ig_logs → autochat_audience_logs
-- Mapping:
--   ig_logs.ig_user_id       → ig_username
--   ig_logs.trigger_keyword  → interaction_text
--   ig_logs.status           → auto_chat_status ('success' → 'sent')
--   ig_logs.created_at       → created_at
--   interaction_type         → 'dm' (ig_logs only tracked DM sends)
--   follow_status            → 'unknown' (ig_logs didn't track this)
--   user_id                  → NULL (ig_logs didn't have user_id)

INSERT INTO public.autochat_audience_logs (
    ig_username,
    interaction_type,
    auto_chat_status,
    interaction_text,
    follow_status,
    created_at,
    updated_at
)
SELECT
    ig_user_id,
    'dm',
    CASE WHEN status = 'success' THEN 'sent' ELSE 'failed' END,
    trigger_keyword,
    'unknown',
    created_at,
    created_at
FROM public.ig_logs
ON CONFLICT DO NOTHING;

-- Step 2: Verify migration count (should show 115)
-- SELECT COUNT(*) FROM public.autochat_audience_logs WHERE interaction_type = 'dm' AND follow_status = 'unknown';

-- Step 3: Drop old redundant table
DROP TABLE IF EXISTS public.ig_logs;

-- ================================================
