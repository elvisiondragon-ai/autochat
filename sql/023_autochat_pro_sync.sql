-- ========================================================
-- SYNC AUTOCHAT_CLIENTS PRO STATUS FROM PRO_SUBSCRIPTIONS
-- ========================================================

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.sync_autochat_pro_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When a pro_subscription becomes 'active'
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'active' THEN
    UPDATE public.autochat_clients
    SET status = 'paid', updated_at = now()
    WHERE user_id = NEW.user_id;

  -- When a pro_subscription is no longer active (expired or deleted)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') 
     OR (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    UPDATE public.autochat_clients
    SET status = 'free', updated_at = now()
    WHERE user_id = OLD.user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_autochat_pro ON public.pro_subscriptions;

-- 3. Create the AFTER trigger on pro_subscriptions
CREATE TRIGGER trigger_sync_autochat_pro
  AFTER INSERT OR UPDATE OR DELETE ON public.pro_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_autochat_pro_status();
