-- GoMiGo Database Initialization
-- Migration: 001_init.sql
-- Creates all tables with constraints, indexes, and triggers

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Macro to attach the trigger to any table
CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER trg_%s_updated_at
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
    table_name, table_name
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: destinations
-- ============================================================
CREATE TABLE destinations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_name       TEXT NOT NULL,
  sub_destinations  TEXT[] NOT NULL DEFAULT '{}',
  is_active         BOOLEAN NOT NULL DEFAULT FALSE,
  cover_photo_url   TEXT,
  -- SEO content in 8 languages
  description_en    TEXT, description_ta TEXT, description_te TEXT,
  description_kn    TEXT, description_ml TEXT, description_hi TEXT,
  description_mr    TEXT, description_or TEXT,
  seo_title_en      TEXT, seo_title_ta TEXT, seo_title_te TEXT,
  seo_title_kn      TEXT, seo_title_ml TEXT, seo_title_hi TEXT,
  seo_title_mr      TEXT, seo_title_or TEXT,
  meta_description_en TEXT, meta_description_ta TEXT, meta_description_te TEXT,
  meta_description_kn TEXT, meta_description_ml TEXT, meta_description_hi TEXT,
  meta_description_mr TEXT, meta_description_or TEXT,
  seasonal_rules    JSONB NOT NULL DEFAULT '{}',
  languages_spoken  TEXT[] NOT NULL DEFAULT '{"en","ta"}',
  emergency_contact TEXT,
  slug              TEXT UNIQUE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('destinations');
CREATE INDEX idx_destinations_active ON destinations (is_active);
CREATE INDEX idx_destinations_slug ON destinations (slug);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone                    TEXT UNIQUE NOT NULL,
  email                    TEXT,
  full_name                TEXT,
  avatar_url               TEXT,
  preferred_language       TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en','ta','te','kn','ml','hi','mr','or')),
  ai_provider              TEXT CHECK (ai_provider IN ('gemini','groq','deepseek','cohere','huggingface',NULL)),
  ai_key_vault_id          TEXT,
  ai_key_verified_at       TIMESTAMPTZ,
  referral_code            TEXT UNIQUE NOT NULL,
  referred_by_user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  gdpr_consent_at          TIMESTAMPTZ NOT NULL,
  data_deletion_requested_at TIMESTAMPTZ,
  last_active_at           TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at               TIMESTAMPTZ,
  CONSTRAINT phone_format CHECK (phone ~ '^\+91[6-9][0-9]{9}$')
);
SELECT create_updated_at_trigger('users');
CREATE INDEX idx_users_phone ON users (phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_referral_code ON users (referral_code);
CREATE INDEX idx_users_active ON users (last_active_at DESC) WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: user_roles
-- ============================================================
CREATE TABLE user_roles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('tourist','driver','auto_driver','hotel_owner','tour_guide','admin')),
  approved_at      TIMESTAMPTZ,
  suspended_at     TIMESTAMPTZ,
  suspension_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);
SELECT create_updated_at_trigger('user_roles');
CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_user_roles_role ON user_roles (role);

-- ============================================================
-- TABLE: platform_settings
-- ============================================================
CREATE TABLE platform_settings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category       TEXT NOT NULL CHECK (category IN (
    'payments','whatsapp','email','sms','maps','ai',
    'translation','monitoring','storage','verification','general'
  )),
  key            TEXT UNIQUE NOT NULL,
  value          TEXT,
  is_sensitive   BOOLEAN NOT NULL DEFAULT FALSE,
  is_configured  BOOLEAN NOT NULL DEFAULT FALSE,
  label          TEXT NOT NULL,
  description    TEXT,
  placeholder    TEXT,
  help_url       TEXT,
  last_updated_at TIMESTAMPTZ,
  updated_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('platform_settings');
CREATE INDEX idx_platform_settings_category ON platform_settings (category);

-- ============================================================
-- TABLE: provider_profiles
-- ============================================================
CREATE TABLE provider_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name        TEXT NOT NULL,
  bio_en              TEXT, bio_ta TEXT, bio_te TEXT,
  bio_kn              TEXT, bio_ml TEXT, bio_hi TEXT,
  bio_mr              TEXT, bio_or TEXT,
  profile_photo_url   TEXT,
  listing_visible     BOOLEAN NOT NULL DEFAULT FALSE,
  reputation_score    NUMERIC(3,2) NOT NULL DEFAULT 0.00
    CHECK (reputation_score >= 0 AND reputation_score <= 5),
  total_reviews       INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  total_completed     INTEGER NOT NULL DEFAULT 0 CHECK (total_completed >= 0),
  cancellation_count  INTEGER NOT NULL DEFAULT 0 CHECK (cancellation_count >= 0),
  sort_boost          INTEGER NOT NULL DEFAULT 0 CHECK (sort_boost >= 0),
  subscription_id     UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);
SELECT create_updated_at_trigger('provider_profiles');
CREATE INDEX idx_provider_profiles_user ON provider_profiles (user_id);
CREATE INDEX idx_provider_profiles_visible ON provider_profiles (listing_visible, sort_boost DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABLE: kyc_documents
-- ============================================================
CREATE TABLE kyc_documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id      UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  doc_type         TEXT NOT NULL CHECK (doc_type IN (
    'aadhaar','pan','driving_license','vehicle_rc','vehicle_permit','tourism_cert','gst_cert'
  )),
  file_url         TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired')),
  rejection_reason TEXT,
  verified_by      TEXT CHECK (verified_by IN ('auto','admin')),
  verified_at      TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('kyc_documents');
CREATE INDEX idx_kyc_provider ON kyc_documents (provider_id, status);
CREATE INDEX idx_kyc_pending ON kyc_documents (status, created_at) WHERE status = 'pending';

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id                UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  plan                       TEXT NOT NULL CHECK (plan IN (
    'driver_basic','driver_featured',
    'auto_basic','auto_featured',
    'hotel_small','hotel_large',
    'guide_individual','guide_agency'
  )),
  status                     TEXT NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','past_due','suspended','cancelled','churned')),
  trial_ends_at              TIMESTAMPTZ,
  current_period_start       TIMESTAMPTZ,
  current_period_end         TIMESTAMPTZ,
  razorpay_subscription_id   TEXT,
  amount_paise               INTEGER NOT NULL CHECK (amount_paise >= 0),
  gst_paise                  INTEGER NOT NULL DEFAULT 0 CHECK (gst_paise >= 0),
  failure_count              INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  last_payment_attempt_at    TIMESTAMPTZ,
  next_retry_at              TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('subscriptions');
CREATE INDEX idx_subscriptions_provider ON subscriptions (provider_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status, current_period_end);
CREATE INDEX idx_subscriptions_trial ON subscriptions (trial_ends_at) WHERE status = 'trial';

-- ============================================================
-- TABLE: listings
-- ============================================================
CREATE TABLE listings (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id              UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  destination_id           UUID NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  listing_type             TEXT NOT NULL CHECK (listing_type IN ('cab','auto','hotel_room','tour')),
  -- Multilingual titles
  title_en                 TEXT, title_ta TEXT, title_te TEXT,
  title_kn                 TEXT, title_ml TEXT, title_hi TEXT,
  title_mr                 TEXT, title_or TEXT,
  -- Multilingual descriptions
  description_en           TEXT, description_ta TEXT, description_te TEXT,
  description_kn           TEXT, description_ml TEXT, description_hi TEXT,
  description_mr           TEXT, description_or TEXT,
  is_auto_translated       BOOLEAN NOT NULL DEFAULT FALSE,
  base_price_paise         INTEGER NOT NULL CHECK (base_price_paise > 0),
  demand_multiplier        NUMERIC(4,2) NOT NULL DEFAULT 1.00
    CHECK (demand_multiplier >= 1.00 AND demand_multiplier <= 2.00),
  platform_fee_percent     NUMERIC(5,2) NOT NULL DEFAULT 10.00
    CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 30),
  is_instant_book          BOOLEAN NOT NULL DEFAULT FALSE,
  listing_visible          BOOLEAN NOT NULL DEFAULT FALSE,
  seasonal_rules           JSONB NOT NULL DEFAULT '{}',
  cover_photo_url          TEXT,
  photo_urls               TEXT[] NOT NULL DEFAULT '{}',
  photo_moderation_status  TEXT NOT NULL DEFAULT 'pending'
    CHECK (photo_moderation_status IN ('pending','approved','flagged','rejected')),
  -- Multilingual location names
  location_name_en         TEXT, location_name_ta TEXT, location_name_te TEXT,
  location_name_kn         TEXT, location_name_ml TEXT, location_name_hi TEXT,
  location_name_mr         TEXT, location_name_or TEXT,
  location_lat             DOUBLE PRECISION,
  location_lng             DOUBLE PRECISION,
  amenities                TEXT[] NOT NULL DEFAULT '{}',
  -- Cab/auto specific
  vehicle_type             TEXT,
  vehicle_number           TEXT,
  seat_capacity            INTEGER CHECK (seat_capacity > 0),
  -- Hotel/tour specific
  max_guests               INTEGER CHECK (max_guests > 0),
  cancellation_policy      TEXT NOT NULL DEFAULT 'moderate'
    CHECK (cancellation_policy IN ('flexible','moderate','strict')),
  -- Search
  search_vector            TSVECTOR,
  embedding                vector(1536),
  view_count               INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  booking_count            INTEGER NOT NULL DEFAULT 0 CHECK (booking_count >= 0),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at               TIMESTAMPTZ
);
SELECT create_updated_at_trigger('listings');

-- Composite index for main search query
CREATE INDEX idx_listings_search ON listings (listing_type, listing_visible, destination_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_listings_provider ON listings (provider_id) WHERE deleted_at IS NULL;
-- Full-text search index
CREATE INDEX idx_listings_fts ON listings USING GIN (search_vector);
-- pgvector HNSW index for AI similarity search
CREATE INDEX idx_listings_embedding ON listings USING hnsw (embedding vector_cosine_ops);

-- Auto-update search_vector from English title and description
CREATE OR REPLACE FUNCTION fn_update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title_en, '') || ' ' ||
    COALESCE(NEW.description_en, '') || ' ' ||
    COALESCE(NEW.location_name_en, '') || ' ' ||
    COALESCE(array_to_string(NEW.amenities, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION fn_update_listing_search_vector();

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE bookings (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference           TEXT UNIQUE NOT NULL,
  tourist_id                  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  listing_id                  UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  provider_id                 UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  booking_type                TEXT NOT NULL CHECK (booking_type IN ('cab','auto','hotel','tour')),
  status                      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','driver_assigned','in_progress',
    'completed','cancelled','disputed','refunded'
  )),
  -- Location
  pickup_lat                  DOUBLE PRECISION,
  pickup_lng                  DOUBLE PRECISION,
  pickup_name                 TEXT,
  destination_lat             DOUBLE PRECISION,
  destination_lng             DOUBLE PRECISION,
  destination_name            TEXT,
  -- Dates
  checkin_date                DATE,
  checkout_date               DATE,
  tour_date                   DATE,
  -- Counts
  num_passengers              INTEGER CHECK (num_passengers > 0),
  num_rooms                   INTEGER CHECK (num_rooms > 0),
  num_nights                  INTEGER CHECK (num_nights > 0),
  -- Money (all in paise)
  base_amount_paise           INTEGER NOT NULL CHECK (base_amount_paise > 0),
  platform_fee_paise          INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_paise >= 0),
  gst_paise                   INTEGER NOT NULL DEFAULT 0 CHECK (gst_paise >= 0),
  total_paise                 INTEGER NOT NULL CHECK (total_paise > 0),
  provider_payout_paise       INTEGER NOT NULL DEFAULT 0 CHECK (provider_payout_paise >= 0),
  -- Payment
  payment_status              TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','partial','paid','refunded','partially_refunded')),
  payment_method              TEXT CHECK (payment_method IN ('upi','card','netbanking','cash','wallet')),
  razorpay_order_id           TEXT,
  razorpay_payment_id         TEXT,
  -- Driver tracking
  driver_lat                  DOUBLE PRECISION,
  driver_lng                  DOUBLE PRECISION,
  driver_location_updated_at  TIMESTAMPTZ,
  -- Timestamps
  trip_started_at             TIMESTAMPTZ,
  trip_completed_at           TIMESTAMPTZ,
  -- Cancellation
  cancellation_reason         TEXT,
  cancelled_by                TEXT CHECK (cancelled_by IN ('tourist','provider','admin','system')),
  cancelled_at                TIMESTAMPTZ,
  -- Refund
  refund_amount_paise         INTEGER DEFAULT 0 CHECK (refund_amount_paise >= 0),
  refund_status               TEXT CHECK (refund_status IN ('pending','processing','completed','failed')),
  refund_razorpay_id          TEXT,
  -- Language at booking time (for notifications)
  tourist_language            TEXT NOT NULL DEFAULT 'en'
    CHECK (tourist_language IN ('en','ta','te','kn','ml','hi','mr','or')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraints
  CONSTRAINT checkout_after_checkin CHECK (checkout_date IS NULL OR checkout_date >= checkin_date),
  CONSTRAINT all_amounts_positive CHECK (
    base_amount_paise > 0 AND total_paise > 0
  )
);
SELECT create_updated_at_trigger('bookings');
CREATE INDEX idx_bookings_tourist ON bookings (tourist_id, status, created_at DESC);
CREATE INDEX idx_bookings_provider ON bookings (provider_id, status, created_at DESC);
CREATE INDEX idx_bookings_status ON bookings (status, created_at DESC);
CREATE INDEX idx_bookings_reference ON bookings (booking_reference);

-- Auto-generate booking reference
CREATE OR REPLACE FUNCTION fn_generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := to_char(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num FROM bookings
    WHERE created_at >= date_trunc('year', NOW());
  NEW.booking_reference := 'GM-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookings_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW WHEN (NEW.booking_reference IS NULL OR NEW.booking_reference = '')
  EXECUTE FUNCTION fn_generate_booking_reference();

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id           UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id          UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  rating               SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text_original TEXT,
  review_language      TEXT DEFAULT 'en',
  review_text_en       TEXT,
  provider_reply       TEXT,
  provider_replied_at  TIMESTAMPTZ,
  is_flagged           BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('reviews');
CREATE INDEX idx_reviews_provider ON reviews (provider_id, rating DESC);
CREATE INDEX idx_reviews_flagged ON reviews (is_flagged) WHERE is_flagged = TRUE;

-- Enforce: review only allowed after completed booking
CREATE OR REPLACE FUNCTION fn_enforce_review_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  booking_status TEXT;
BEGIN
  SELECT status INTO booking_status FROM bookings WHERE id = NEW.booking_id;
  IF booking_status != 'completed' THEN
    RAISE EXCEPTION 'ERR_REVIEW_NOT_ELIGIBLE: Can only review completed bookings';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_eligibility
  BEFORE INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_review_eligibility();

-- Update provider reputation when review added
CREATE OR REPLACE FUNCTION fn_update_provider_reputation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET
    reputation_score = (
      SELECT ROUND(
        SUM(r.rating * POWER(0.95, EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400)) /
        NULLIF(SUM(POWER(0.95, EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400)), 0),
      2)
      FROM reviews r WHERE r.provider_id = NEW.provider_id AND NOT r.is_flagged
    ),
    total_reviews = total_reviews + 1
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_reputation
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION fn_update_provider_reputation();

-- ============================================================
-- TABLE: feature_flags
-- ============================================================
CREATE TABLE feature_flags (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_name            TEXT UNIQUE NOT NULL,
  is_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  description          TEXT,
  enabled_for_user_ids UUID[] DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT create_updated_at_trigger('feature_flags');

-- ============================================================
-- TABLE: error_logs
-- ============================================================
CREATE TABLE error_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_code          TEXT NOT NULL,
  error_title         TEXT NOT NULL,
  error_message       TEXT,
  stack_trace         TEXT,
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  user_role           TEXT,
  route               TEXT,
  http_method         TEXT,
  http_status         INTEGER,
  user_agent          TEXT,
  severity            TEXT NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  auto_fix_attempted  BOOLEAN NOT NULL DEFAULT FALSE,
  auto_fix_succeeded  BOOLEAN,
  auto_fix_action     TEXT,
  admin_notified_at   TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  resolved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_error_logs_severity ON error_logs (severity, created_at DESC);
CREATE INDEX idx_error_logs_code ON error_logs (error_code, created_at DESC);
CREATE INDEX idx_error_logs_unresolved ON error_logs (created_at DESC) WHERE resolved_at IS NULL;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id         UUID REFERENCES bookings(id) ON DELETE SET NULL,
  channel            TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms')),
  template_name      TEXT NOT NULL,
  language_code      TEXT NOT NULL DEFAULT 'en',
  variables_used     JSONB NOT NULL DEFAULT '{}',
  status             TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','delivered','failed')),
  external_message_id TEXT,
  failed_reason      TEXT,
  retry_count        INTEGER NOT NULL DEFAULT 0,
  next_retry_at      TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at            TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ
);
CREATE INDEX idx_notifications_recipient ON notifications (recipient_id, created_at DESC);
CREATE INDEX idx_notifications_retry ON notifications (next_retry_at)
  WHERE status = 'failed' AND retry_count < 3;

-- ============================================================
-- TABLE: notification_templates
-- ============================================================
CREATE TABLE notification_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name     TEXT NOT NULL,
  language_code     TEXT NOT NULL,
  channel           TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms')),
  wati_template_name TEXT,
  subject           TEXT,
  message_body      TEXT NOT NULL,
  variables         TEXT[] NOT NULL DEFAULT '{}',
  approved_at       TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(template_name, language_code, channel)
);
SELECT create_updated_at_trigger('notification_templates');

-- ============================================================
-- TABLE: rate_limit_counters
-- ============================================================
CREATE TABLE rate_limit_counters (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier   TEXT NOT NULL,
  route        TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', NOW()),
  UNIQUE(identifier, route, window_start)
);
CREATE INDEX idx_rate_limit_lookup ON rate_limit_counters (identifier, route, window_start);

-- ============================================================
-- TABLE: ai_usage_logs
-- ============================================================
CREATE TABLE ai_usage_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_provider      TEXT NOT NULL,
  feature_used     TEXT NOT NULL,
  tokens_used      INTEGER,
  response_time_ms INTEGER,
  success          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_usage_user ON ai_usage_logs (user_id, created_at DESC);

-- ============================================================
-- TABLE: referral_conversions
-- ============================================================
CREATE TABLE referral_conversions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversion_type   TEXT NOT NULL CHECK (conversion_type IN ('provider_signup','tourist_booking')),
  reward_type       TEXT NOT NULL CHECK (reward_type IN ('free_month','booking_credit')),
  reward_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (reward_amount_paise >= 0),
  reward_applied_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_referrals_referrer ON referral_conversions (referrer_id);

-- ============================================================
-- TABLE: translation_gaps
-- ============================================================
CREATE TABLE translation_gaps (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language_code  TEXT NOT NULL,
  message_key    TEXT NOT NULL,
  english_value  TEXT,
  reported_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(language_code, message_key)
);

-- ============================================================
-- TABLE: admin_activity_log
-- ============================================================
CREATE TABLE admin_activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_log_admin ON admin_activity_log (admin_id, created_at DESC);
CREATE INDEX idx_admin_log_entity ON admin_activity_log (entity_type, entity_id);

COMMIT;
