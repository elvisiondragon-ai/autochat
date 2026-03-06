-- 011_add_quick_replies_json_array.sql
-- Drop the legacy max-3 button fields and add a scalable 'quick_replies' JSONB array 
-- to support Meta's official 13 Quick Replies limit in the Visual Builder.
-- Run this in elvisiongroup Supabase SQL Editor
-- Date: 2026-03-06

-- 1. Add the new flexible JSONB array for quick replies
ALTER TABLE public.autochat_triggers
  ADD COLUMN IF NOT EXISTS quick_replies JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.autochat_triggers.quick_replies IS 'JSON array of quick replies. Max 13 items for Instagram. Format: [{"title": "Book Call", "payload": "BOOK_CALL"}]';

-- 2. Migrate existing button_text/url data into the new quick_replies JSONB column
-- (Only keeps buttons without URLs, as URLs belong to generic templates)
UPDATE public.autochat_triggers
SET quick_replies = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'title', btn.title,
      'payload', btn.title
    )
  )
  FROM (
    SELECT button_text AS title, button_url AS url FROM public.autochat_triggers t2 WHERE t2.id = public.autochat_triggers.id
    UNION ALL
    SELECT button_text_2 AS title, button_url_2 AS url FROM public.autochat_triggers t2 WHERE t2.id = public.autochat_triggers.id
    UNION ALL
    SELECT button_text_3 AS title, button_url_3 AS url FROM public.autochat_triggers t2 WHERE t2.id = public.autochat_triggers.id
  ) btn
  WHERE btn.title IS NOT NULL AND (btn.url IS NULL OR btn.url = '')
)
WHERE button_text IS NOT NULL OR button_text_2 IS NOT NULL OR button_text_3 IS NOT NULL;

-- 3. Replace NULLs with empty array if migration resulted in null
UPDATE public.autochat_triggers SET quick_replies = '[]'::jsonb WHERE quick_replies IS NULL;

-- Optional: We keep button_url around for Generic Templates, but the user is rewriting the UI.
-- For now we just add the JSONB.
