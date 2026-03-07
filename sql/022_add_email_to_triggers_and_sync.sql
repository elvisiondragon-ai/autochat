-- 022_add_email_to_triggers_and_sync.sql
-- 1. Add email column to autochat_triggers
ALTER TABLE public.autochat_triggers ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Backfill email from autochat_clients
UPDATE public.autochat_triggers t
SET email = c.email
FROM public.autochat_clients c
WHERE t.user_id = c.user_id
AND t.email IS NULL;

-- 3. Create function to sync triggers to autochat_clients.trigger_list
CREATE OR REPLACE FUNCTION public.sync_triggers_to_client_jsonb()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);

  UPDATE public.autochat_clients
  SET trigger_list = (
    SELECT COALESCE(jsonb_agg(to_jsonb(sub)), '[]'::jsonb)
    FROM (
      SELECT * 
      FROM public.autochat_triggers 
      WHERE user_id = target_user_id
      ORDER BY created_at ASC
    ) sub
  )
  WHERE user_id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to call the sync function
DROP TRIGGER IF EXISTS trg_sync_triggers ON public.autochat_triggers;
CREATE TRIGGER trg_sync_triggers
AFTER INSERT OR UPDATE OR DELETE ON public.autochat_triggers
FOR EACH ROW
EXECUTE FUNCTION public.sync_triggers_to_client_jsonb();

-- 5. Final sync: Update all existing clients with their current triggers
UPDATE public.autochat_clients c
SET trigger_list = (
  SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
  FROM public.autochat_triggers t
  WHERE t.user_id = c.user_id
);
