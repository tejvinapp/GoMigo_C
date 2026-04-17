// GoMiGo — Drizzle ORM Schema
// Mirrors supabase/migrations/001_init.sql exactly.
// All tables use pgTable from drizzle-orm/pg-core.

import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  smallint,
  numeric,
  date,
  timestamp,
  jsonb,
  customType,
} from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// ---------------------------------------------------------------------------
// Custom type: tsvector (not exposed by drizzle-orm/pg-core directly)
// ---------------------------------------------------------------------------
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

// ---------------------------------------------------------------------------
// Custom type: vector(1536) — pgvector extension
// ---------------------------------------------------------------------------
const vector1536 = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)'
  },
})

// ---------------------------------------------------------------------------
// destinations
// ---------------------------------------------------------------------------
export const destinations = pgTable('destinations', {
  id: uuid('id').primaryKey().defaultRandom(),
  region_name: text('region_name').notNull(),
  sub_destinations: text('sub_destinations').array().notNull().default([]),
  is_active: boolean('is_active').notNull().default(false),
  cover_photo_url: text('cover_photo_url'),
  // Multilingual SEO content (8 languages)
  description_en: text('description_en'),
  description_ta: text('description_ta'),
  description_te: text('description_te'),
  description_kn: text('description_kn'),
  description_ml: text('description_ml'),
  description_hi: text('description_hi'),
  description_mr: text('description_mr'),
  description_or: text('description_or'),
  seo_title_en: text('seo_title_en'),
  seo_title_ta: text('seo_title_ta'),
  seo_title_te: text('seo_title_te'),
  seo_title_kn: text('seo_title_kn'),
  seo_title_ml: text('seo_title_ml'),
  seo_title_hi: text('seo_title_hi'),
  seo_title_mr: text('seo_title_mr'),
  seo_title_or: text('seo_title_or'),
  meta_description_en: text('meta_description_en'),
  meta_description_ta: text('meta_description_ta'),
  meta_description_te: text('meta_description_te'),
  meta_description_kn: text('meta_description_kn'),
  meta_description_ml: text('meta_description_ml'),
  meta_description_hi: text('meta_description_hi'),
  meta_description_mr: text('meta_description_mr'),
  meta_description_or: text('meta_description_or'),
  seasonal_rules: jsonb('seasonal_rules').notNull().default({}),
  languages_spoken: text('languages_spoken').array().notNull().default(['en', 'ta']),
  emergency_contact: text('emergency_contact'),
  slug: text('slug').unique().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectDestination = typeof destinations.$inferSelect
export type InsertDestination = typeof destinations.$inferInsert

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').unique().notNull(),
  email: text('email'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  preferred_language: text('preferred_language').notNull().default('en'),
  ai_provider: text('ai_provider'),
  ai_key_vault_id: text('ai_key_vault_id'),
  ai_key_verified_at: timestamp('ai_key_verified_at', { withTimezone: true }),
  referral_code: text('referral_code').unique().notNull(),
  referred_by_user_id: uuid('referred_by_user_id'),
  gdpr_consent_at: timestamp('gdpr_consent_at', { withTimezone: true }).notNull(),
  data_deletion_requested_at: timestamp('data_deletion_requested_at', { withTimezone: true }),
  last_active_at: timestamp('last_active_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export type SelectUser = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

// ---------------------------------------------------------------------------
// user_roles
// ---------------------------------------------------------------------------
export const user_roles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // tourist | driver | auto_driver | hotel_owner | tour_guide | admin
  approved_at: timestamp('approved_at', { withTimezone: true }),
  suspended_at: timestamp('suspended_at', { withTimezone: true }),
  suspension_reason: text('suspension_reason'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectUserRole = typeof user_roles.$inferSelect
export type InsertUserRole = typeof user_roles.$inferInsert

// ---------------------------------------------------------------------------
// platform_settings
// ---------------------------------------------------------------------------
export const platform_settings = pgTable('platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  key: text('key').unique().notNull(),
  value: text('value'),
  is_sensitive: boolean('is_sensitive').notNull().default(false),
  is_configured: boolean('is_configured').notNull().default(false),
  label: text('label').notNull(),
  description: text('description'),
  placeholder: text('placeholder'),
  help_url: text('help_url'),
  last_updated_at: timestamp('last_updated_at', { withTimezone: true }),
  updated_by: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectPlatformSetting = typeof platform_settings.$inferSelect
export type InsertPlatformSetting = typeof platform_settings.$inferInsert

// ---------------------------------------------------------------------------
// provider_profiles
// ---------------------------------------------------------------------------
export const provider_profiles = pgTable('provider_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  display_name: text('display_name').notNull(),
  bio_en: text('bio_en'),
  bio_ta: text('bio_ta'),
  bio_te: text('bio_te'),
  bio_kn: text('bio_kn'),
  bio_ml: text('bio_ml'),
  bio_hi: text('bio_hi'),
  bio_mr: text('bio_mr'),
  bio_or: text('bio_or'),
  profile_photo_url: text('profile_photo_url'),
  listing_visible: boolean('listing_visible').notNull().default(false),
  reputation_score: numeric('reputation_score', { precision: 3, scale: 2 })
    .notNull()
    .default('0.00'),
  total_reviews: integer('total_reviews').notNull().default(0),
  total_completed: integer('total_completed').notNull().default(0),
  cancellation_count: integer('cancellation_count').notNull().default(0),
  sort_boost: integer('sort_boost').notNull().default(0),
  subscription_id: uuid('subscription_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export type SelectProviderProfile = typeof provider_profiles.$inferSelect
export type InsertProviderProfile = typeof provider_profiles.$inferInsert

// ---------------------------------------------------------------------------
// kyc_documents
// ---------------------------------------------------------------------------
export const kyc_documents = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider_id: uuid('provider_id')
    .notNull()
    .references(() => provider_profiles.id, { onDelete: 'cascade' }),
  doc_type: text('doc_type').notNull(),
  // aadhaar | pan | driving_license | vehicle_rc | vehicle_permit | tourism_cert | gst_cert
  file_url: text('file_url').notNull(),
  status: text('status').notNull().default('pending'),
  // pending | approved | rejected | expired
  rejection_reason: text('rejection_reason'),
  verified_by: text('verified_by'), // auto | admin
  verified_at: timestamp('verified_at', { withTimezone: true }),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectKycDocument = typeof kyc_documents.$inferSelect
export type InsertKycDocument = typeof kyc_documents.$inferInsert

// ---------------------------------------------------------------------------
// subscriptions
// ---------------------------------------------------------------------------
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider_id: uuid('provider_id')
    .notNull()
    .references(() => provider_profiles.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull(),
  status: text('status').notNull().default('trial'),
  trial_ends_at: timestamp('trial_ends_at', { withTimezone: true }),
  current_period_start: timestamp('current_period_start', { withTimezone: true }),
  current_period_end: timestamp('current_period_end', { withTimezone: true }),
  razorpay_subscription_id: text('razorpay_subscription_id'),
  amount_paise: integer('amount_paise').notNull(),
  gst_paise: integer('gst_paise').notNull().default(0),
  failure_count: integer('failure_count').notNull().default(0),
  last_payment_attempt_at: timestamp('last_payment_attempt_at', { withTimezone: true }),
  next_retry_at: timestamp('next_retry_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectSubscription = typeof subscriptions.$inferSelect
export type InsertSubscription = typeof subscriptions.$inferInsert

// ---------------------------------------------------------------------------
// listings
// ---------------------------------------------------------------------------
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider_id: uuid('provider_id')
    .notNull()
    .references(() => provider_profiles.id, { onDelete: 'cascade' }),
  destination_id: uuid('destination_id')
    .notNull()
    .references(() => destinations.id, { onDelete: 'restrict' }),
  listing_type: text('listing_type').notNull(), // cab | auto | hotel_room | tour
  // Multilingual titles
  title_en: text('title_en'),
  title_ta: text('title_ta'),
  title_te: text('title_te'),
  title_kn: text('title_kn'),
  title_ml: text('title_ml'),
  title_hi: text('title_hi'),
  title_mr: text('title_mr'),
  title_or: text('title_or'),
  // Multilingual descriptions
  description_en: text('description_en'),
  description_ta: text('description_ta'),
  description_te: text('description_te'),
  description_kn: text('description_kn'),
  description_ml: text('description_ml'),
  description_hi: text('description_hi'),
  description_mr: text('description_mr'),
  description_or: text('description_or'),
  is_auto_translated: boolean('is_auto_translated').notNull().default(false),
  base_price_paise: integer('base_price_paise').notNull(),
  demand_multiplier: numeric('demand_multiplier', { precision: 4, scale: 2 })
    .notNull()
    .default('1.00'),
  platform_fee_percent: numeric('platform_fee_percent', { precision: 5, scale: 2 })
    .notNull()
    .default('10.00'),
  is_instant_book: boolean('is_instant_book').notNull().default(false),
  listing_visible: boolean('listing_visible').notNull().default(false),
  seasonal_rules: jsonb('seasonal_rules').notNull().default({}),
  cover_photo_url: text('cover_photo_url'),
  photo_urls: text('photo_urls').array().notNull().default([]),
  photo_moderation_status: text('photo_moderation_status').notNull().default('pending'),
  // Multilingual location names
  location_name_en: text('location_name_en'),
  location_name_ta: text('location_name_ta'),
  location_name_te: text('location_name_te'),
  location_name_kn: text('location_name_kn'),
  location_name_ml: text('location_name_ml'),
  location_name_hi: text('location_name_hi'),
  location_name_mr: text('location_name_mr'),
  location_name_or: text('location_name_or'),
  location_lat: numeric('location_lat'),
  location_lng: numeric('location_lng'),
  amenities: text('amenities').array().notNull().default([]),
  // Cab/auto specific
  vehicle_type: text('vehicle_type'),
  vehicle_number: text('vehicle_number'),
  seat_capacity: integer('seat_capacity'),
  // Hotel/tour specific
  max_guests: integer('max_guests'),
  cancellation_policy: text('cancellation_policy').notNull().default('moderate'),
  // Search
  search_vector: tsvector('search_vector'),
  embedding: vector1536('embedding'),
  view_count: integer('view_count').notNull().default(0),
  booking_count: integer('booking_count').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export type SelectListing = typeof listings.$inferSelect
export type InsertListing = typeof listings.$inferInsert

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  booking_reference: text('booking_reference').unique().notNull(),
  tourist_id: uuid('tourist_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  listing_id: uuid('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'restrict' }),
  provider_id: uuid('provider_id')
    .notNull()
    .references(() => provider_profiles.id, { onDelete: 'restrict' }),
  booking_type: text('booking_type').notNull(), // cab | auto | hotel | tour
  status: text('status').notNull().default('pending'),
  // Location
  pickup_lat: numeric('pickup_lat'),
  pickup_lng: numeric('pickup_lng'),
  pickup_name: text('pickup_name'),
  destination_lat: numeric('destination_lat'),
  destination_lng: numeric('destination_lng'),
  destination_name: text('destination_name'),
  // Dates
  checkin_date: date('checkin_date'),
  checkout_date: date('checkout_date'),
  tour_date: date('tour_date'),
  // Counts
  num_passengers: integer('num_passengers'),
  num_rooms: integer('num_rooms'),
  num_nights: integer('num_nights'),
  // Money (all in paise)
  base_amount_paise: integer('base_amount_paise').notNull(),
  platform_fee_paise: integer('platform_fee_paise').notNull().default(0),
  gst_paise: integer('gst_paise').notNull().default(0),
  total_paise: integer('total_paise').notNull(),
  provider_payout_paise: integer('provider_payout_paise').notNull().default(0),
  // Payment
  payment_status: text('payment_status').notNull().default('unpaid'),
  payment_method: text('payment_method'),
  razorpay_order_id: text('razorpay_order_id'),
  razorpay_payment_id: text('razorpay_payment_id'),
  // Driver tracking
  driver_lat: numeric('driver_lat'),
  driver_lng: numeric('driver_lng'),
  driver_location_updated_at: timestamp('driver_location_updated_at', { withTimezone: true }),
  // Timestamps
  trip_started_at: timestamp('trip_started_at', { withTimezone: true }),
  trip_completed_at: timestamp('trip_completed_at', { withTimezone: true }),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  // Cancellation
  cancellation_reason: text('cancellation_reason'),
  cancelled_by: text('cancelled_by'),
  cancelled_at: timestamp('cancelled_at', { withTimezone: true }),
  // Refund
  refund_amount_paise: integer('refund_amount_paise').default(0),
  refund_status: text('refund_status'),
  refund_razorpay_id: text('refund_razorpay_id'),
  // Language preference
  tourist_language: text('tourist_language').notNull().default('en'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectBooking = typeof bookings.$inferSelect
export type InsertBooking = typeof bookings.$inferInsert

// ---------------------------------------------------------------------------
// reviews
// ---------------------------------------------------------------------------
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  booking_id: uuid('booking_id')
    .notNull()
    .unique()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  reviewer_id: uuid('reviewer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider_id: uuid('provider_id')
    .notNull()
    .references(() => provider_profiles.id, { onDelete: 'cascade' }),
  rating: smallint('rating').notNull(),
  review_text_original: text('review_text_original'),
  review_language: text('review_language').default('en'),
  review_text_en: text('review_text_en'),
  provider_reply: text('provider_reply'),
  provider_replied_at: timestamp('provider_replied_at', { withTimezone: true }),
  is_flagged: boolean('is_flagged').notNull().default(false),
  flag_reason: text('flag_reason'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectReview = typeof reviews.$inferSelect
export type InsertReview = typeof reviews.$inferInsert

// ---------------------------------------------------------------------------
// feature_flags
// ---------------------------------------------------------------------------
export const feature_flags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  flag_name: text('flag_name').unique().notNull(),
  is_enabled: boolean('is_enabled').notNull().default(false),
  description: text('description'),
  enabled_for_user_ids: uuid('enabled_for_user_ids').array().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectFeatureFlag = typeof feature_flags.$inferSelect
export type InsertFeatureFlag = typeof feature_flags.$inferInsert

// ---------------------------------------------------------------------------
// error_logs
// ---------------------------------------------------------------------------
export const error_logs = pgTable('error_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  error_code: text('error_code').notNull(),
  error_title: text('error_title').notNull(),
  error_message: text('error_message'),
  stack_trace: text('stack_trace'),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  user_role: text('user_role'),
  route: text('route'),
  http_method: text('http_method'),
  http_status: integer('http_status'),
  user_agent: text('user_agent'),
  severity: text('severity').notNull().default('medium'), // low | medium | high | critical
  auto_fix_attempted: boolean('auto_fix_attempted').notNull().default(false),
  auto_fix_succeeded: boolean('auto_fix_succeeded'),
  auto_fix_action: text('auto_fix_action'),
  admin_notified_at: timestamp('admin_notified_at', { withTimezone: true }),
  resolved_at: timestamp('resolved_at', { withTimezone: true }),
  resolved_by: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolution_notes: text('resolution_notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectErrorLog = typeof error_logs.$inferSelect
export type InsertErrorLog = typeof error_logs.$inferInsert

// ---------------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------------
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipient_id: uuid('recipient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  booking_id: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  channel: text('channel').notNull(), // whatsapp | email | sms
  template_name: text('template_name').notNull(),
  language_code: text('language_code').notNull().default('en'),
  variables_used: jsonb('variables_used').notNull().default({}),
  status: text('status').notNull().default('pending'), // pending | sent | delivered | failed
  external_message_id: text('external_message_id'),
  failed_reason: text('failed_reason'),
  retry_count: integer('retry_count').notNull().default(0),
  next_retry_at: timestamp('next_retry_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  delivered_at: timestamp('delivered_at', { withTimezone: true }),
})

export type SelectNotification = typeof notifications.$inferSelect
export type InsertNotification = typeof notifications.$inferInsert

// ---------------------------------------------------------------------------
// notification_templates
// ---------------------------------------------------------------------------
export const notification_templates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  template_name: text('template_name').notNull(),
  language_code: text('language_code').notNull(),
  channel: text('channel').notNull(), // whatsapp | email | sms
  wati_template_name: text('wati_template_name'),
  subject: text('subject'),
  message_body: text('message_body').notNull(),
  variables: text('variables').array().notNull().default([]),
  approved_at: timestamp('approved_at', { withTimezone: true }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectNotificationTemplate = typeof notification_templates.$inferSelect
export type InsertNotificationTemplate = typeof notification_templates.$inferInsert

// ---------------------------------------------------------------------------
// rate_limit_counters
// ---------------------------------------------------------------------------
export const rate_limit_counters = pgTable('rate_limit_counters', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  route: text('route').notNull(),
  count: integer('count').notNull().default(1),
  window_start: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectRateLimitCounter = typeof rate_limit_counters.$inferSelect
export type InsertRateLimitCounter = typeof rate_limit_counters.$inferInsert

// ---------------------------------------------------------------------------
// ai_usage_logs
// ---------------------------------------------------------------------------
export const ai_usage_logs = pgTable('ai_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ai_provider: text('ai_provider').notNull(),
  feature_used: text('feature_used').notNull(),
  tokens_used: integer('tokens_used'),
  response_time_ms: integer('response_time_ms'),
  success: boolean('success').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectAiUsageLog = typeof ai_usage_logs.$inferSelect
export type InsertAiUsageLog = typeof ai_usage_logs.$inferInsert

// ---------------------------------------------------------------------------
// referral_conversions
// ---------------------------------------------------------------------------
export const referral_conversions = pgTable('referral_conversions', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrer_id: uuid('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referred_id: uuid('referred_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  conversion_type: text('conversion_type').notNull(), // provider_signup | tourist_booking
  reward_type: text('reward_type').notNull(), // free_month | booking_credit
  reward_amount_paise: integer('reward_amount_paise').notNull().default(0),
  reward_applied_at: timestamp('reward_applied_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectReferralConversion = typeof referral_conversions.$inferSelect
export type InsertReferralConversion = typeof referral_conversions.$inferInsert

// ---------------------------------------------------------------------------
// translation_gaps
// ---------------------------------------------------------------------------
export const translation_gaps = pgTable('translation_gaps', {
  id: uuid('id').primaryKey().defaultRandom(),
  language_code: text('language_code').notNull(),
  message_key: text('message_key').notNull(),
  english_value: text('english_value'),
  reported_at: timestamp('reported_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectTranslationGap = typeof translation_gaps.$inferSelect
export type InsertTranslationGap = typeof translation_gaps.$inferInsert

// ---------------------------------------------------------------------------
// admin_activity_log
// ---------------------------------------------------------------------------
export const admin_activity_log = pgTable('admin_activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  admin_id: uuid('admin_id')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity_type: text('entity_type'),
  entity_id: uuid('entity_id'),
  old_value: jsonb('old_value'),
  new_value: jsonb('new_value'),
  ip_address: text('ip_address'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SelectAdminActivityLog = typeof admin_activity_log.$inferSelect
export type InsertAdminActivityLog = typeof admin_activity_log.$inferInsert

// ---------------------------------------------------------------------------
// Aggregate schema object (used by drizzle() instance)
// ---------------------------------------------------------------------------
export const schema = {
  destinations,
  users,
  user_roles,
  platform_settings,
  provider_profiles,
  kyc_documents,
  subscriptions,
  listings,
  bookings,
  reviews,
  feature_flags,
  error_logs,
  notifications,
  notification_templates,
  rate_limit_counters,
  ai_usage_logs,
  referral_conversions,
  translation_gaps,
  admin_activity_log,
}

// ---------------------------------------------------------------------------
// Database client (singleton — safe for Next.js edge/serverless)
// ---------------------------------------------------------------------------
const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
