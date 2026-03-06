-- 019_fix_meta_duplicate_connections.sql
-- Fixes the duplicate Meta account checking to include IG accounts, 
-- and fixes the email lookup by pulling from `autochat_clients` directly where possible.

CREATE OR REPLACE FUNCTION public.check_unique_meta_page_id()
RETURNS TRIGGER AS $$
DECLARE
  existing_record RECORD;
  identifier_used TEXT;
BEGIN
  -- We only check if there is an active page id OR instagram id
  IF (NEW.meta_page_id IS NOT NULL AND NEW.meta_page_id <> '') OR (NEW.meta_instagram_id IS NOT NULL AND NEW.meta_instagram_id <> '') THEN
    
    SELECT id, email, display_name INTO existing_record
    FROM public.autochat_clients
    WHERE user_id <> NEW.user_id 
      AND (
        (NEW.meta_page_id IS NOT NULL AND NEW.meta_page_id <> '' AND meta_page_id = NEW.meta_page_id) 
        OR 
        (NEW.meta_instagram_id IS NOT NULL AND NEW.meta_instagram_id <> '' AND meta_instagram_id = NEW.meta_instagram_id)
      )
    LIMIT 1;

    IF existing_record IS NOT NULL THEN
      -- If they have an email, use it. If not, use their display_name. If not, use generic text.
      identifier_used := COALESCE(existing_record.email, existing_record.display_name, 'Akun Lain');
      RAISE EXCEPTION 'akun sudah digunakan di % silahkan logout dan gunakan email tersebut', identifier_used;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger still correctly hooks on BOTH columns
DROP TRIGGER IF EXISTS trg_check_unique_meta_page_id ON public.autochat_clients;

CREATE TRIGGER trg_check_unique_meta_page_id
BEFORE INSERT OR UPDATE OF meta_page_id, meta_instagram_id ON public.autochat_clients
FOR EACH ROW
EXECUTE FUNCTION public.check_unique_meta_page_id();
