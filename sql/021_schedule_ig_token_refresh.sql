-- Schedule the Instagram token refresh function
-- Run every day at 01:00 UTC (08:00 WIB)
SELECT cron.schedule(
    'refresh-ig-tokens',
    '0 1 * * *',
    $$
    SELECT net.http_post(
        url := 'https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/refresh-ig-token',
        headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
    );
    $$
);
