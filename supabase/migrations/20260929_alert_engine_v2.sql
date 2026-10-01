-- Apply after 20260928_atomic_alert_notifications.sql

-- 1. Expand alerts table for V2
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_status_check;

ALTER TABLE public.alerts 
  ADD COLUMN IF NOT EXISTS entity_type text NOT NULL DEFAULT 'STOCK',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cooldown_until timestamptz,
  ADD COLUMN IF NOT EXISTS trigger_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dedupe_key text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add check for valid statuses including new V2 statuses
ALTER TABLE public.alerts ADD CONSTRAINT alerts_status_check 
  CHECK (status IN ('active', 'paused', 'triggered', 'expired', 'disabled'));

-- 2. Expand notifications for V2 delivery architecture
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'IN_APP',
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'SENT',
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_code text;

-- 3. Update the atomic trigger function to handle trigger_count and cooldown
CREATE OR REPLACE FUNCTION public.trigger_alert_v2(alert_id uuid, event_dedupe_key text, notification_title text, notification_msg text, cooldown_interval interval)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  claimed public.alerts%rowtype;
BEGIN
  -- We only trigger if active, and if cooldown has passed
  UPDATE public.alerts 
  SET 
    status = CASE WHEN cooldown_interval IS NULL THEN 'triggered' ELSE 'active' END,
    triggered_at = now(),
    last_evaluated_at = now(),
    trigger_count = trigger_count + 1,
    cooldown_until = CASE WHEN cooldown_interval IS NOT NULL THEN now() + cooldown_interval ELSE NULL END
  WHERE id = alert_id 
    AND status = 'active'
    AND (cooldown_until IS NULL OR cooldown_until <= now())
  RETURNING * INTO claimed;
  
  IF NOT FOUND THEN RETURN false; END IF;
  
  INSERT INTO public.notifications(user_id, alert_id, type, title, message, channel, event_id, delivery_status)
  VALUES(claimed.user_id, claimed.id, 'alert', notification_title, notification_msg, 'IN_APP', event_dedupe_key, 'SENT');
  
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_alert_v2(uuid, text, text, text, interval) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_alert_v2(uuid, text, text, text, interval) TO service_role;
