-- 016_unique_meta_page_id.sql
-- Description: Ensures one Meta Page ID (Facebook account) is bound to only one User Email.

CREATE OR REPLACE FUNCTION public.check_unique_meta_page_id()
RETURNS TRIGGER AS $$
DECLARE
  existing_email TEXT;
BEGIN
  IF NEW.meta_page_id IS NOT NULL AND NEW.meta_page_id <> '' THEN
    SELECT auth.users.email INTO existing_email
    FROM public.autochat_clients
    JOIN auth.users ON auth.users.id = public.autochat_clients.user_id
    WHERE public.autochat_clients.meta_page_id = NEW.meta_page_id
      AND public.autochat_clients.user_id <> NEW.user_id
    LIMIT 1;

    IF existing_email IS NOT NULL THEN
      RAISE EXCEPTION 'akun sudah digunakan di % silahkan logout dan gunakan email tersebut', existing_email;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_unique_meta_page_id ON public.autochat_clients;

CREATE TRIGGER trg_check_unique_meta_page_id
BEFORE INSERT OR UPDATE OF meta_page_id ON public.autochat_clients
FOR EACH ROW
EXECUTE FUNCTION public.check_unique_meta_page_id();
