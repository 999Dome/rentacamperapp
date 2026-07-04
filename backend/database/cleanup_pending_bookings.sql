-- SQL Script: Cleanup expired PENDING reservations

-- This function deletes all bookings with status 'pending' where the expires_at timestamp is in the past.
-- It can be executed manually, or scheduled via pg_cron in Supabase.

CREATE OR REPLACE FUNCTION cleanup_expired_pending_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all bookings that are pending and have expired
  DELETE FROM public.bookings
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$;

-- To test the function manually:
-- SELECT cleanup_expired_pending_bookings();

-- ==============================================================================
-- OPTIONAL: If you want to use pg_cron in Supabase to run this automatically
-- ==============================================================================
-- Note: You must enable the pg_cron extension first via Supabase Dashboard -> Database -> Extensions

-- 1. Enable pg_cron (requires superuser privileges, can be done via dashboard)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the job to run every 15 minutes
-- SELECT cron.schedule(
--   'cleanup-expired-bookings', -- Job name
--   '*/15 * * * *',             -- Cron schedule: Every 15 minutes
--   'SELECT cleanup_expired_pending_bookings()'
-- );

-- 3. To unschedule the job later if needed
-- SELECT cron.unschedule('cleanup-expired-bookings');
