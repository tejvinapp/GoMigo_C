-- Feature Flags Initial Seed
-- Migration: 005_feature_flags_seed.sql

BEGIN;

INSERT INTO feature_flags (flag_name, is_enabled, description) VALUES
  ('lang_english',        TRUE,  'English language support'),
  ('lang_tamil',          TRUE,  'Tamil language support (launch priority)'),
  ('lang_telugu',         FALSE, 'Telugu language support (Phase 2)'),
  ('lang_kannada',        FALSE, 'Kannada language support (Phase 2)'),
  ('lang_malayalam',      FALSE, 'Malayalam language support (Phase 2)'),
  ('lang_hindi',          FALSE, 'Hindi language support (Phase 2)'),
  ('lang_marathi',        FALSE, 'Marathi language support (Phase 3)'),
  ('lang_odia',           FALSE, 'Odia language support (Phase 3)'),
  ('ai_byoai',            FALSE, 'Bring Your Own AI Key feature'),
  ('hotel_booking',       FALSE, 'Hotel booking flow (Phase 2)'),
  ('tour_booking',        FALSE, 'Tour guide marketplace (Phase 2)'),
  ('itinerary_builder',   FALSE, 'AI itinerary builder (Phase 2)'),
  ('dynamic_pricing',     FALSE, 'Dynamic pricing engine (Phase 3)'),
  ('referral_system',     FALSE, 'Referral system (Phase 3)'),
  ('dest_nilgiris',       TRUE,  'Nilgiris region (launch destination)'),
  ('dest_coorg',          FALSE, 'Coorg destination (Phase 2)'),
  ('dest_kodaikanal',     FALSE, 'Kodaikanal destination (Phase 2)'),
  ('dest_munnar',         FALSE, 'Munnar destination (Phase 2)'),
  ('dest_wayanad',        FALSE, 'Wayanad destination (Phase 2)'),
  ('dest_himachal',       FALSE, 'Himachal Pradesh (Phase 3)'),
  ('dest_uttarakhand',    FALSE, 'Uttarakhand (Phase 3)'),
  ('dest_sikkim',         FALSE, 'Sikkim (Phase 3)'),
  ('cab_booking',         TRUE,  'Cab booking (Phase 1 launch feature)'),
  ('auto_booking',        TRUE,  'Auto rickshaw booking (Phase 1)'),
  ('kyc_auto_verify',     TRUE,  'Automatic KYC verification via APIs'),
  ('photo_moderation',    TRUE,  'Google Vision photo moderation'),
  ('whatsapp_primary',    TRUE,  'WhatsApp as primary notification channel'),
  ('sms_fallback',        FALSE, 'SMS as fallback when WhatsApp fails'),
  ('provider_analytics',  FALSE, 'Analytics insights for providers (Phase 2)'),
  ('pwa_install_prompt',  TRUE,  'Show PWA install prompt after 2 bookings')
ON CONFLICT (flag_name) DO NOTHING;

COMMIT;
