-- Rollback for 001_init.sql
BEGIN;

DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS translation_gaps CASCADE;
DROP TABLE IF EXISTS referral_conversions CASCADE;
DROP TABLE IF EXISTS ai_usage_logs CASCADE;
DROP TABLE IF EXISTS rate_limit_counters CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS provider_profiles CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;

DROP FUNCTION IF EXISTS fn_set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS create_updated_at_trigger(text) CASCADE;
DROP FUNCTION IF EXISTS fn_update_listing_search_vector() CASCADE;
DROP FUNCTION IF EXISTS fn_generate_booking_reference() CASCADE;
DROP FUNCTION IF EXISTS fn_enforce_review_eligibility() CASCADE;
DROP FUNCTION IF EXISTS fn_update_provider_reputation() CASCADE;

COMMIT;
