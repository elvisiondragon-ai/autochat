-- 003_trigger_wizard_fields.sql
-- Add new columns to support the step-by-step Automation Wizard

ALTER TABLE public.ig_triggers
ADD COLUMN IF NOT EXISTS target_post TEXT,        -- "semua_post" or "post_tertentu"
ADD COLUMN IF NOT EXISTS trigger_source TEXT,     -- "komentar_ig_fb", "story_ig_fb", "chat_ig_fb"
ADD COLUMN IF NOT EXISTS sequence_type TEXT;      -- "direct_url" or "follow_check"

-- Optional comments for schema clarity
COMMENT ON COLUMN public.ig_triggers.target_post IS 'Wizard Step 1: Which post triggers this';
COMMENT ON COLUMN public.ig_triggers.trigger_source IS 'Wizard Step 2: Where the trigger comes from (Comment, Story, Chat)';
COMMENT ON COLUMN public.ig_triggers.sequence_type IS 'Wizard Step 6: What action happens after DM (Direct URL or Follow Sequence)';
