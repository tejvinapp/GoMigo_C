-- Platform Settings Initial Seed
-- Migration: 006_platform_settings_seed.sql
-- All settings start as unconfigured. Admin fills them via UI.

BEGIN;

INSERT INTO platform_settings (category, key, is_sensitive, is_configured, label, description, placeholder, help_url) VALUES
  -- General
  ('general', 'platform_name',     FALSE, TRUE,  'Platform Name',        'The name of your platform shown to users', 'GoMiGo', NULL),
  ('general', 'admin_email',       FALSE, FALSE, 'Admin Email',          'All error alerts and system emails go here', 'you@example.com', NULL),
  ('general', 'admin_whatsapp',    FALSE, FALSE, 'Admin WhatsApp',       'Critical alerts sent to this number', '+91XXXXXXXXXX', NULL),
  ('general', 'support_phone',     FALSE, FALSE, 'Support Phone',        'Shown to users in error messages', '+91XXXXXXXXXX', NULL),
  ('general', 'support_email',     FALSE, FALSE, 'Support Email',        'Shown to users for help', 'support@example.com', NULL),
  ('general', 'default_language',  FALSE, TRUE,  'Default Language',     'Language shown to all new visitors', 'en', NULL),
  ('general', 'timezone',          FALSE, TRUE,  'Timezone',             'Your platform timezone', 'Asia/Kolkata', NULL),
  ('general', 'currency',          FALSE, TRUE,  'Currency',             'Your platform currency', 'INR', NULL),
  ('general', 'platform_commission_percent', FALSE, TRUE, 'Platform Commission %', 'Percentage deducted from each booking', '10', NULL),
  ('general', 'gst_percent',       FALSE, TRUE,  'GST %',                'GST percentage on platform fees', '18', NULL),

  -- Payments
  ('payments', 'razorpay_key_id',      FALSE, FALSE, 'Razorpay Key ID',      'From Razorpay → Settings → API Keys', 'rzp_live_XXXXXXXXXX', 'https://dashboard.razorpay.com/app/keys'),
  ('payments', 'razorpay_key_secret',  TRUE,  FALSE, 'Razorpay Key Secret',  'Keep this private — never share it', 'XXXXXXXXXXXXXXXXXXXXXXXX', 'https://dashboard.razorpay.com/app/keys'),
  ('payments', 'razorpay_webhook_secret', TRUE, FALSE, 'Razorpay Webhook Secret', 'From Razorpay → Settings → Webhooks', 'XXXXXXXXXXXXXXXXXXXXXXXX', 'https://dashboard.razorpay.com/app/webhooks'),

  -- WhatsApp
  ('whatsapp', 'whatsapp_provider',    FALSE, FALSE, 'WhatsApp Provider',    'Wati.io or Meta Cloud API', 'wati', NULL),
  ('whatsapp', 'wati_endpoint',        FALSE, FALSE, 'Wati API Endpoint',    'From Wati.io → Account → API', 'https://live-server-XXXXX.wati.io', 'https://app.wati.io/settings/api'),
  ('whatsapp', 'wati_token',           TRUE,  FALSE, 'Wati API Token',       'Your Wati API access token', 'eyJhbGc...', 'https://app.wati.io/settings/api'),
  ('whatsapp', 'meta_phone_number_id', FALSE, FALSE, 'Meta Phone Number ID', 'From Meta Business → WhatsApp → API Setup', '1234567890', 'https://developers.facebook.com/apps'),
  ('whatsapp', 'meta_access_token',    TRUE,  FALSE, 'Meta Access Token',    'Your Meta permanent access token', 'EAABxx...', 'https://developers.facebook.com/apps'),
  ('whatsapp', 'meta_webhook_verify_token', TRUE, FALSE, 'Meta Webhook Verify Token', 'Any random string you choose', 'gomigo_webhook_xxx', NULL),

  -- Email
  ('email', 'email_provider',     FALSE, FALSE, 'Email Provider',     'Gmail SMTP, Resend, SendGrid, or Custom SMTP', 'gmail', NULL),
  ('email', 'gmail_address',      FALSE, FALSE, 'Gmail Address',      'Your Gmail address', 'yourapp@gmail.com', 'https://myaccount.google.com/apppasswords'),
  ('email', 'gmail_app_password', TRUE,  FALSE, 'Gmail App Password', 'Not your Gmail password — get from Google Account → Security', 'xxxx xxxx xxxx xxxx', 'https://myaccount.google.com/apppasswords'),
  ('email', 'resend_api_key',     TRUE,  FALSE, 'Resend API Key',     'From resend.com → API Keys', 're_XXXXXXXXXX', 'https://resend.com/api-keys'),
  ('email', 'email_from_name',    FALSE, TRUE,  'From Name',          'Name shown as email sender', 'GoMiGo', NULL),
  ('email', 'email_from_address', FALSE, FALSE, 'From Email Address', 'Email address used as sender', 'noreply@gomigo.in', NULL),

  -- SMS
  ('sms', 'sms_provider',      FALSE, FALSE, 'SMS Provider',     'MSG91 or Twilio', 'msg91', NULL),
  ('sms', 'msg91_auth_key',    TRUE,  FALSE, 'MSG91 Auth Key',   'From msg91.com → Settings → Auth Key', 'XXXXXXXXXXXXXXXXXXXXXXXX', 'https://msg91.com/dashboard'),
  ('sms', 'msg91_sender_id',   FALSE, FALSE, 'MSG91 Sender ID',  'Your approved 6-char sender ID', 'GOMIGO', 'https://msg91.com/dashboard'),

  -- Maps
  ('maps', 'maps_provider',     FALSE, TRUE,  'Maps Provider',    'OpenStreetMap (free) or Google Maps', 'openstreetmap', NULL),
  ('maps', 'google_maps_key',   TRUE,  FALSE, 'Google Maps Key',  'Only if you chose Google Maps (requires billing)', 'AIzaSy...', 'https://console.cloud.google.com/apis/credentials'),
  ('maps', 'routing_provider',  FALSE, TRUE,  'Routing Provider', 'OpenRouteService (free) or OSRM', 'openrouteservice', NULL),
  ('maps', 'openrouteservice_key', TRUE, FALSE, 'OpenRouteService Key', 'Free tier from openrouteservice.org', 'XXXXXXXXXXXXXXXX', 'https://openrouteservice.org/dev/#/login'),

  -- Translation
  ('translation', 'libretranslate_url', FALSE, FALSE, 'LibreTranslate URL', 'Your self-hosted LibreTranslate instance URL', 'https://libretranslate.yourserver.com', 'https://github.com/LibreTranslate/LibreTranslate'),
  ('translation', 'libretranslate_key', TRUE,  FALSE, 'LibreTranslate API Key', 'API key if your instance requires one', 'XXXXXXXXXX', NULL),

  -- Monitoring
  ('monitoring', 'monitoring_provider', FALSE, TRUE,  'Monitoring Provider', 'console (default, free) or glitchtip', 'console', NULL),
  ('monitoring', 'glitchtip_dsn',      TRUE,  FALSE, 'GlitchTip DSN',       'From your GlitchTip project settings', 'https://xxx@app.glitchtip.com/xxx', NULL),

  -- Verification
  ('verification', 'digilocker_client_id',     FALSE, FALSE, 'Digilocker Client ID',     'From developers.digilocker.gov.in', 'XXXXXXXXXX', 'https://developers.digilocker.gov.in'),
  ('verification', 'digilocker_client_secret', TRUE,  FALSE, 'Digilocker Client Secret', 'Your Digilocker API secret', 'XXXXXXXXXXXXXXXX', 'https://developers.digilocker.gov.in'),
  ('verification', 'parivahan_api_key',        TRUE,  FALSE, 'Parivahan API Key',        'Vehicle RC and permit verification', 'XXXXXXXXXXXXXXXX', 'https://parivahan.gov.in')

ON CONFLICT (key) DO NOTHING;

-- Set platform_name default value
UPDATE platform_settings SET value = 'GoMiGo', is_configured = TRUE WHERE key = 'platform_name';
UPDATE platform_settings SET value = 'en', is_configured = TRUE WHERE key = 'default_language';
UPDATE platform_settings SET value = 'Asia/Kolkata', is_configured = TRUE WHERE key = 'timezone';
UPDATE platform_settings SET value = 'INR', is_configured = TRUE WHERE key = 'currency';
UPDATE platform_settings SET value = '10', is_configured = TRUE WHERE key = 'platform_commission_percent';
UPDATE platform_settings SET value = '18', is_configured = TRUE WHERE key = 'gst_percent';
UPDATE platform_settings SET value = 'GoMiGo', is_configured = TRUE WHERE key = 'email_from_name';
UPDATE platform_settings SET value = 'openstreetmap', is_configured = TRUE WHERE key = 'maps_provider';
UPDATE platform_settings SET value = 'openrouteservice', is_configured = TRUE WHERE key = 'routing_provider';
UPDATE platform_settings SET value = 'console', is_configured = TRUE WHERE key = 'monitoring_provider';

-- Seed destination: The Nilgiris
INSERT INTO destinations (
  region_name, sub_destinations, is_active, slug,
  description_en, description_ta, description_hi,
  seo_title_en, seo_title_ta,
  meta_description_en, meta_description_ta,
  seasonal_rules, languages_spoken,
  emergency_contact
) VALUES (
  'The Nilgiris',
  ARRAY['Ooty', 'Coonoor', 'Kotagiri'],
  TRUE,
  'nilgiris',
  'The Nilgiris — Blue Mountains of Tamil Nadu. Home to rolling tea gardens, misty valleys, and the charming hill stations of Ooty, Coonoor, and Kotagiri. Experience cool climate, colonial architecture, and breathtaking viewpoints.',
  'நீலகிரி மலைகள் — தமிழ்நாட்டின் நீல மலைகள். தேயிலை தோட்டங்கள், பனி மூட்டமான பள்ளத்தாக்குகள், மற்றும் ஊட்டி, கூனூர், கோத்தகிரி போன்ற மலை நகரங்கள்.',
  'नीलगिरि — तमिलनाडु के नीले पहाड़। चाय के बागान, धुंधरी घाटियाँ और ऊटी, कूनूर, कोटागिरि के खूबसूरत हिल स्टेशन।',
  'Nilgiris Hill Station — Cabs, Hotels & Tour Guides | GoMiGo',
  'நீலகிரி மலை நிலையம் — டாக்சி, ஹோட்டல் & சுற்றுலா வழிகாட்டி | GoMiGo',
  'Book verified cabs, hotels, and tour guides in Ooty, Coonoor, and Kotagiri. Aadhaar verified local providers. Instant WhatsApp confirmation.',
  'ஊட்டி, கூனூர், கோத்தகிரியில் சரிபார்க்கப்பட்ட டாக்சி, ஹோட்டல் மற்றும் சுற்றுலா வழிகாட்டிகளை பதிவு செய்யுங்கள்.',
  '{
    "peak_months": [4, 5, 10, 11, 12, 1],
    "peak_multiplier": 1.5,
    "off_peak_multiplier": 1.0,
    "shoulder_months": [2, 3, 6, 7],
    "shoulder_multiplier": 1.2
  }'::jsonb,
  ARRAY['ta', 'en', 'kn', 'ml'],
  '+91-423-244-3977'
) ON CONFLICT (slug) DO NOTHING;

COMMIT;
