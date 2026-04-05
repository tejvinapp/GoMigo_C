-- Row Level Security Policies
-- Migration: 002_rls_policies.sql

BEGIN;

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION fn_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND suspended_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's provider profile id
CREATE OR REPLACE FUNCTION fn_my_provider_id()
RETURNS UUID AS $$
  SELECT id FROM provider_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- destinations: public read, admin write
-- ============================================================
CREATE POLICY "destinations_public_read" ON destinations
  FOR SELECT USING (is_active = TRUE OR fn_is_admin());

CREATE POLICY "destinations_admin_all" ON destinations
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- users: self read/write, admin all
-- ============================================================
CREATE POLICY "users_self_select" ON users
  FOR SELECT USING (id = auth.uid() OR fn_is_admin());

CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- user_roles: self read, admin all
-- ============================================================
CREATE POLICY "user_roles_self_read" ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR fn_is_admin());

CREATE POLICY "user_roles_admin_write" ON user_roles
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- platform_settings: admin only
-- ============================================================
CREATE POLICY "platform_settings_admin_only" ON platform_settings
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- provider_profiles: public read visible, self update, admin all
-- ============================================================
CREATE POLICY "provider_profiles_public_read" ON provider_profiles
  FOR SELECT USING (
    (listing_visible = TRUE AND deleted_at IS NULL) OR
    user_id = auth.uid() OR
    fn_is_admin()
  );

CREATE POLICY "provider_profiles_self_update" ON provider_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "provider_profiles_insert" ON provider_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "provider_profiles_admin_all" ON provider_profiles
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- kyc_documents: provider + admin only
-- ============================================================
CREATE POLICY "kyc_provider_read" ON kyc_documents
  FOR SELECT USING (
    provider_id = fn_my_provider_id() OR fn_is_admin()
  );

CREATE POLICY "kyc_provider_insert" ON kyc_documents
  FOR INSERT WITH CHECK (provider_id = fn_my_provider_id());

CREATE POLICY "kyc_admin_all" ON kyc_documents
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- subscriptions: self read, admin all
-- ============================================================
CREATE POLICY "subscriptions_self_read" ON subscriptions
  FOR SELECT USING (
    provider_id = fn_my_provider_id() OR fn_is_admin()
  );

CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- listings: public read active, provider manage own, admin all
-- ============================================================
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (
    (listing_visible = TRUE AND deleted_at IS NULL) OR
    provider_id = fn_my_provider_id() OR
    fn_is_admin()
  );

CREATE POLICY "listings_provider_insert" ON listings
  FOR INSERT WITH CHECK (provider_id = fn_my_provider_id());

CREATE POLICY "listings_provider_update" ON listings
  FOR UPDATE USING (provider_id = fn_my_provider_id())
  WITH CHECK (provider_id = fn_my_provider_id());

CREATE POLICY "listings_admin_all" ON listings
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- bookings: tourist sees own, provider sees their listing's bookings
-- ============================================================
CREATE POLICY "bookings_tourist_read" ON bookings
  FOR SELECT USING (
    tourist_id = auth.uid() OR
    provider_id = fn_my_provider_id() OR
    fn_is_admin()
  );

CREATE POLICY "bookings_tourist_insert" ON bookings
  FOR INSERT WITH CHECK (tourist_id = auth.uid());

CREATE POLICY "bookings_tourist_update" ON bookings
  FOR UPDATE USING (
    tourist_id = auth.uid() OR
    provider_id = fn_my_provider_id()
  );

CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- reviews: public read, verified tourist create, admin all
-- ============================================================
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (NOT is_flagged OR fn_is_admin());

CREATE POLICY "reviews_tourist_insert" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_provider_reply" ON reviews
  FOR UPDATE USING (provider_id = fn_my_provider_id())
  WITH CHECK (
    provider_id = fn_my_provider_id() AND
    reviewer_id = OLD.reviewer_id AND
    rating = OLD.rating
  );

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- feature_flags: everyone read, admin write
-- ============================================================
CREATE POLICY "feature_flags_public_read" ON feature_flags
  FOR SELECT USING (TRUE);

CREATE POLICY "feature_flags_admin_write" ON feature_flags
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- error_logs: admin only
-- ============================================================
CREATE POLICY "error_logs_admin_only" ON error_logs
  FOR ALL USING (fn_is_admin());

-- ============================================================
-- notifications: self read
-- ============================================================
CREATE POLICY "notifications_self_read" ON notifications
  FOR SELECT USING (recipient_id = auth.uid() OR fn_is_admin());

-- ============================================================
-- ai_usage_logs: self read
-- ============================================================
CREATE POLICY "ai_usage_self_read" ON ai_usage_logs
  FOR SELECT USING (user_id = auth.uid() OR fn_is_admin());

CREATE POLICY "ai_usage_self_insert" ON ai_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- referral_conversions: self read
-- ============================================================
CREATE POLICY "referrals_self_read" ON referral_conversions
  FOR SELECT USING (
    referrer_id = auth.uid() OR referred_id = auth.uid() OR fn_is_admin()
  );

-- ============================================================
-- admin_activity_log: admin only
-- ============================================================
CREATE POLICY "admin_log_admin_only" ON admin_activity_log
  FOR ALL USING (fn_is_admin());

COMMIT;
