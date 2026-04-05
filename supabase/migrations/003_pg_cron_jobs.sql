-- pg_cron Scheduled Jobs
-- Migration: 003_pg_cron_jobs.sql

BEGIN;

-- Job 1: Subscription management - daily at 9:00 AM IST (03:30 UTC)
SELECT cron.schedule(
  'gomigo-subscription-management',
  '30 3 * * *',
  $$SELECT fn_manage_subscriptions()$$
);

-- Job 2: Seasonal pricing - 1st of every month at 00:01 AM IST (18:31 UTC prev day)
SELECT cron.schedule(
  'gomigo-seasonal-pricing',
  '31 18 L * *',
  $$SELECT fn_update_seasonal_pricing()$$
);

-- Job 3: Auto-translation queue - every 30 minutes
SELECT cron.schedule(
  'gomigo-auto-translate',
  '*/30 * * * *',
  $$SELECT fn_auto_translate_listings()$$
);

-- Job 4: Rate limit reset - every hour
SELECT cron.schedule(
  'gomigo-reset-rate-limits',
  '0 * * * *',
  $$DELETE FROM rate_limit_counters WHERE window_start < date_trunc('hour', NOW()) - INTERVAL '2 hours'$$
);

-- Job 5: Clean old notifications - weekly
SELECT cron.schedule(
  'gomigo-clean-notifications',
  '0 2 * * 0',
  $$DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Job 6: Clean old error logs - monthly (keep critical for 1 year)
SELECT cron.schedule(
  'gomigo-clean-error-logs',
  '0 3 1 * *',
  $$
    DELETE FROM error_logs
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND severity IN ('low', 'medium')
    AND resolved_at IS NOT NULL;

    DELETE FROM error_logs
    WHERE created_at < NOW() - INTERVAL '365 days'
    AND severity IN ('high', 'critical');
  $$
);

-- Job 7: Send trial expiry reminders - daily at 10:00 AM IST (04:30 UTC)
SELECT cron.schedule(
  'gomigo-trial-reminders',
  '30 4 * * *',
  $$SELECT fn_send_trial_reminders()$$
);

-- Job 8: Health check cleanup - hourly
SELECT cron.schedule(
  'gomigo-cleanup-ai-logs',
  '15 * * * *',
  $$DELETE FROM ai_usage_logs WHERE created_at < NOW() - INTERVAL '30 days'$$
);

COMMIT;
