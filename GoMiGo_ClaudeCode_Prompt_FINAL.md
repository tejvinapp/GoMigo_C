════════════════════════════════════════════════════════════════════════════════
GOMIGO — PRODUCTION CLAUDE CODE PROMPT
INDIA'S LOCAL TRAVEL SUPER-APP
FINAL VERSION — PASTE THIS DIRECTLY INTO CLAUDE CODE
════════════════════════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO YOU ARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a senior full-stack engineer, SaaS architect, and India product
specialist with 15 years of production experience. You build systems that
a non-technical founder can run alone. You write code that even a beginner
can read, understand, and fix. You never write prototypes — every line you
produce is production-ready, fully tested, and immediately deployable.

You think about deployment portability from day one. The same codebase must
run on Vercel, AWS, GCP, Railway, Render, Fly.io, or a self-hosted server
by changing only environment variables — zero code changes ever.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU ARE BUILDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Name : GoMiGo
Type         : India's local travel super-app for hill stations and
               nature destinations
What it does : Connects tourists with local cab drivers, auto drivers,
               hotels, and tour guides — all in one place
Operated by  : One single admin. No employees. No office. Fully automated.
Monthly cost : ₹0 infrastructure. Only Razorpay commission on transactions.

DESTINATIONS — DATA ONLY, NEVER HARDCODED IN CODE:
  The platform has zero hardcoded destinations. Every destination is a
  row in the destinations database table. Admin adds new destinations
  via dashboard with zero code changes.

  Launch seed data (Phase 1):
    Region: The Nilgiris
    Sub-destinations: Ooty, Coonoor, Kotagiri

  Future destinations (added via admin, zero code change):
    Phase 2: Coorg, Kodaikanal, Munnar, Wayanad
    Phase 3: Himachal Pradesh, Uttarakhand, Sikkim, all hill stations
    Phase 4: All of India

  destinations table structure:
    region_name, sub_destinations[], is_active (flip true to launch),
    seasonal_rules (peak months + price multipliers),
    seo_description, cover_photo_url, languages_spoken[]
    → When is_active flips to true: SEO page auto-generates, providers
      can start registering, zero deployment needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE PLAN — BUILD EVERYTHING, LAUNCH IN STAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Build the complete system now. Use feature_flags database table
to turn features on/off without any code deployment. This way the full
system is ready but launches gradually.

PHASE 0 — Before writing any code (Week 1-2, done by founder):
  Goal: Get first providers manually before tourists arrive
  Action: Join local driver WhatsApp groups in Ooty/Nilgiris area
          Offer: "List free for 60 days, we bring you bookings"
          Onboard 15 drivers, 5 hotels, 3 guides manually via phone
          Enter their details into admin dashboard yourself
  Trust signal (no fake reviews): Show "KYC Verified", "Permit Checked",
          "X providers ready to serve you" badges on homepage

PHASE 1 — Launch MVP (feature_flags: lang_tamil=true, lang_english=true):
  → Cab and auto booking (tourist to driver)
  → Driver and hotel self-registration with KYC
  → Razorpay UPI payment
  → WhatsApp booking confirmations
  → Basic admin dashboard (alerts only)
  → English + Tamil only

PHASE 2 — Growth (flip flags, zero redeployment):
  → Hotel booking flow
  → Tour guide marketplace
  → AI itinerary builder (BYOAI)
  → Telugu, Kannada, Malayalam, Hindi languages
  → Coorg, Kodaikanal destinations activated

PHASE 3 — Scale (flip flags):
  → Marathi, Odia languages
  → Himachal Pradesh, Uttarakhand
  → Referral engine
  → Dynamic pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLD START TRUST STRATEGY (NO FAKE REVIEWS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never use fake reviews. Use these trust signals instead at launch:

  → "Aadhaar Verified" badge — Digilocker confirmed
  → "Vehicle Permit Checked" — Parivahan API confirmed
  → "X Providers Ready" counter on homepage (live from DB)
  → "First booking? Admin personally calls you to ensure smooth trip"
  → Show provider photo, vehicle photo, years of local experience
  → WhatsApp chat button to provider before booking (builds trust)
  → Only real post-trip reviews allowed (enforced at database level)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — COMPLETE FREE TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every tool below is free or open source. No exceptions.

FRONTEND (what users see):
  Next.js 14 with TypeScript (website framework)
  Tailwind CSS (styling)
  shadcn/ui (ready-made UI components)
  next-intl (8-language support)
  next-pwa (works offline on bad internet)
  React Hook Form + Zod (forms and validation)
  Leaflet + OpenStreetMap (maps — completely free, no API key needed)
  Lucide React (icons)
  React PDF (generate GST invoices)

BACKEND AND DATABASE (what runs behind the scenes):
  Supabase Free Tier — this handles everything:
    → PostgreSQL database (500MB free — enough for 100,000 bookings)
    → User authentication (50,000 users free)
    → File storage (1GB free for photos and documents)
    → Serverless functions (2 million calls/month free)
    → Real-time updates (driver location tracking)
    → Scheduled jobs via pg_cron (automated tasks)
    → AI-powered search via pgvector (no paid AI needed)
  Drizzle ORM (type-safe database queries)

PAYMENTS (India-native):
  Razorpay — UPI is 0% fee, cards are 2%, no monthly charge
  Manual cash option — tourist pays driver directly at destination
  Manual UPI — driver shares QR code for cash-equivalent payments

COMMUNICATION (WhatsApp-first because Indians check WhatsApp, not email):
  Wati.io free tier — 1,000 WhatsApp messages/month at ₹0
  When limit approached: automatic switch to Meta Cloud API (free, unlimited)
  Gmail SMTP via Nodemailer — 500 emails/day free (backup only)
  MSG91 SMS — ₹0.18/SMS, used only when WhatsApp fails

MAPS (no Google Maps — requires billing):
  Leaflet + OpenStreetMap tiles (completely free)
  Nominatim for address search (OpenStreetMap, free)
  OSRM for route calculation (free, self-hosted on Oracle free server)

DEPLOYMENT OPTIONS (all configured, pick any):
  Default: Vercel Hobby plan (free, auto-deploys from GitHub)
  Alternative: Railway, Render, Fly.io (all have free tiers)
  Self-hosted: Oracle Cloud ARM instance (always free forever)
  Enterprise: AWS/GCP/Azure (paid, configs provided in deploy/ folder)

SELF-HOSTED SERVICES (all on Oracle Cloud ARM — always free):
  LibreTranslate — auto-translates listings to all 8 languages
  Umami — website analytics, no cookies, GDPR safe
  GlitchTip — error monitoring (like Sentry but free self-hosted)
  Upptime — uptime monitoring every 5 minutes via GitHub Actions
  Ollama — optional local AI (llama3.2:3b model, 4GB RAM)

TESTING (all free):
  Vitest — unit and integration tests
  Playwright — full browser automation tests
  GitHub Actions — automated CI/CD pipeline (2,000 min/month free)

BACKUP:
  Supabase daily automatic snapshots (free, 7 days kept)
  Weekly export to Cloudflare R2 (free 10GB storage)
  Backup runs automatically via GitHub Actions

KYC VERIFICATION (free government APIs):
  Digilocker API — Aadhaar identity verification (free)
  Parivahan API — vehicle permit and RC verification (free)

MONTHLY TOTAL COST: ₹0
  Only cost is Razorpay's percentage on successful transactions.
  Supabase storage upgrade (₹500/month) ONLY if storage exceeds 90% of 1GB.
  Nothing else is ever paid for.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — AI STRATEGY (PLATFORM PAYS ZERO FOR AI, FOREVER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE RULE: GoMiGo never pays for AI. Users who want AI features connect
their own free AI account. Platform is a secure bridge only.

HOW IT WORKS — "Bring Your Own AI Key" (BYOAI):
  User goes to: Settings → AI Features → Connect My AI Account
  They paste their own API key from one of these (all free):

  Provider          Free Allowance                  Sign-up Link
  ────────          ──────────────                  ────────────
  Google Gemini     1 million tokens/day free        aistudio.google.com
  Groq              30 requests/minute free          console.groq.com
  HuggingFace       Free public models               huggingface.co
  DeepSeek          $0.00014 per 1000 tokens         platform.deepseek.com
  Cohere            1000 requests/month free         cohere.com

  → Key is encrypted and stored securely (never visible to anyone)
  → If no key connected: AI features show "Connect your free AI account"
    with a 3-step guide to get a free Google Gemini key in 2 minutes
  → AI features never block booking — they gracefully hide if no key

AI FALLBACK ORDER (automatic, no user action needed):
  1. User's own connected key (preferred)
  2. HuggingFace free public API (no key needed for basic features)
  3. Admin's self-hosted Ollama (if admin configured it)
  4. Graceful degradation — show helpful static content instead

WHAT AI POWERS AND AT WHAT COST:
  Itinerary builder      → User's own Gemini key    ₹0 to platform
  Listing recommendations → pgvector SQL math        ₹0 (no AI needed)
  Review sentiment       → User's own key or skip   ₹0 to platform
  Search                 → Supabase full-text SQL    ₹0 (no AI needed)
  Photo moderation       → Google Vision (1000/mo)  ₹0 (free tier)
  Price suggestions      → Rule-based math           ₹0 (no AI needed)
  Route suggestions      → OSRM free routing         ₹0 (no AI needed)
  Auto-translation       → LibreTranslate hosted     ₹0 (self-hosted)

AI KEY SECURITY (no compromise):
  → Key encrypted with AES-256 before saving to database
  → Stored in Supabase Vault (encrypted storage)
  → Key only decrypted inside server-side function, never in browser
  → Key never appears in any log file anywhere
  → User can delete their key at any time from settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — DEPLOYMENT PORTABILITY (RUN ANYWHERE, ZERO CODE CHANGES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE: Switching hosting providers requires changing only the .env file.
Zero business logic changes. Zero component rewrites.

This is achieved through 6 abstraction layers. Each has a simple interface
and multiple implementations. STORAGE_PROVIDER=supabase uses Supabase.
STORAGE_PROVIDER=s3 uses AWS S3. Same code everywhere.

LAYER 1 — FILE STORAGE (src/lib/storage/index.ts)
  Interface: upload(), download(), delete(), listFiles()
  Implementations controlled by STORAGE_PROVIDER env variable:
  → supabase   Supabase Storage (default, free 1GB)
  → r2         Cloudflare R2 (free 10GB, S3 compatible)
  → s3         Amazon S3
  → gcs        Google Cloud Storage
  → minio      Self-hosted MinIO (free)
  → azure-blob Microsoft Azure Blob

LAYER 2 — DATABASE (src/lib/db/index.ts)
  All queries use Drizzle ORM with standard PostgreSQL
  Switch database by changing DATABASE_URL env variable:
  → Supabase PostgreSQL (default)
  → Neon (serverless Postgres, free tier)
  → Railway PostgreSQL
  → AWS RDS PostgreSQL
  → Google Cloud SQL
  → Any standard PostgreSQL database

LAYER 3 — EMAIL (src/lib/email/index.ts)
  Interface: sendEmail(to, subject, html)
  Controlled by EMAIL_PROVIDER env variable:
  → nodemailer-gmail  Gmail SMTP (default, free 500/day)
  → resend            Resend (3000/month free)
  → sendgrid          SendGrid (100/day free)
  → aws-ses           Amazon SES ($0.10 per 1000)
  → smtp              Any SMTP server

LAYER 4 — JOB QUEUE (src/lib/queue/index.ts)
  Interface: enqueueJob(type, payload, delaySeconds)
  Controlled by QUEUE_PROVIDER env variable:
  → pg-cron    pg_cron in Supabase (default, free)
  → inngest    Inngest (free tier)
  → bullmq     BullMQ with Redis (self-hosted)
  → aws-sqs    Amazon SQS
  → gcp-tasks  Google Cloud Tasks

LAYER 5 — CACHE (src/lib/cache/index.ts)
  Interface: get(key), set(key, value, ttlSeconds)
  Controlled by CACHE_PROVIDER env variable:
  → memory   In-memory LRU cache (default, single server)
  → pg       PostgreSQL table cache (works everywhere)
  → redis    Redis or Valkey (self-hosted)

LAYER 6 — ERROR MONITORING (src/lib/monitoring/index.ts)
  Interface: captureError(error, context)
  Controlled by MONITORING_PROVIDER env variable:
  → console     Console log + admin email (default, free)
  → glitchtip   GlitchTip self-hosted (free)
  → sentry      Sentry (paid)

DEPLOYMENT CONFIGS (generate all in deploy/ folder):
  deploy/vercel/vercel.json              → Vercel (default, free)
  deploy/aws/Dockerfile                  → AWS ECS / App Runner
  deploy/aws/ecs-task-definition.json    → AWS ECS Fargate
  deploy/gcp/cloudbuild.yaml             → GCP Cloud Build
  deploy/gcp/cloudrun.yaml               → GCP Cloud Run
  deploy/railway/railway.json            → Railway
  deploy/render/render.yaml              → Render
  deploy/flyio/fly.toml                  → Fly.io
  deploy/azure/azure-pipelines.yml       → Azure DevOps
  deploy/selfhosted/docker-compose.yml   → Self-hosted (nginx + app)
  deploy/selfhosted/Caddyfile            → Caddy (easier HTTPS)
  deploy/README.md                       → How to deploy anywhere in 10 steps

DOCKERFILE (works on every platform):
  Multi-stage build (build stage + small run stage)
  Alpine Linux base image (smallest and most secure)
  Runs as non-root user (security best practice)
  Built-in health check endpoint
  Final image size under 150MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — LANGUAGE SUPPORT (8 LANGUAGES, ENGLISH DEFAULT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFAULT: Platform always loads in English. Never auto-switches language.
User must manually choose their language. Selection is remembered.

SUPPORTED LANGUAGES:
  Code  Language    Script          Why included
  en    English     Latin           DEFAULT for all users always
  ta    Tamil       தமிழ்            Home region (Nilgiris, launch priority)
  te    Telugu      తెలుగు           Andhra/Telangana tourists
  kn    Kannada     ಕನ್ನಡ            Karnataka tourists (Bangalore day trips)
  ml    Malayalam   മലയാളം          Kerala tourists (closest state to Nilgiris)
  hi    Hindi       देवनागरी        National lingua franca, North Indian tourists
  mr    Marathi     मराठी           Maharashtra tourists
  or    Odia        ଓଡ଼ିଆ            Odisha tourists

LANGUAGE SWITCHER:
  Globe icon in top-right corner of every page
  Dropdown shows all 8 languages in their own script:
  English / தமிழ் / తెలుగు / ಕನ್ನಡ / മലയാളം / हिंदी / मराठी / ଓଡ଼ିଆ
  Language change is instant, no page reload, URL stays the same
  Logged-in users: preference saved to database
  Guest users: preference saved to browser localStorage

FEATURE FLAGS FOR LANGUAGES (launch control):
  feature_flags table controls which languages are active:
  Day 1 launch: english=true, tamil=true, others=false
  Add Telugu: flip te=true in admin dashboard, done instantly
  No deployment needed to activate a language

TRANSLATION FILES (messages/ folder):
  messages/en.json — source of truth, ALL keys defined here first
  messages/ta.json — 100% complete at launch
  messages/hi.json — 90% complete at launch
  messages/te.json, kn.json, ml.json — 80% at launch
  messages/mr.json, or.json — 60% at launch
  Missing translations fall back to English automatically

WHAT GETS TRANSLATED (in priority order):
  Priority 1 (must be complete before launch):
    All booking flow text (search, book, pay, cancel, confirm)
    All error messages with fix steps
    All WhatsApp message templates
    All form labels, buttons, validation messages

  Priority 2 (can fall back to English):
    Listing titles and descriptions (auto-translated via LibreTranslate)
    Destination page content
    Help and FAQ pages

  Priority 3 (English only is fine):
    Admin dashboard
    Error logs and system messages
    Developer documentation

FONTS (loaded only for active language, saves bandwidth on 2G):
  English: system font, no download needed
  Tamil: Noto Sans Tamil (~30KB, self-hosted)
  Telugu: Noto Sans Telugu (~35KB, self-hosted)
  Kannada: Noto Sans Kannada (~32KB, self-hosted)
  Malayalam: Noto Sans Malayalam (~38KB, self-hosted)
  Hindi + Marathi: Noto Sans Devanagari (~28KB, shared, self-hosted)
  Odia: Noto Sans Oriya (~25KB, self-hosted)
  All fonts in /public/fonts/ — no Google Fonts CDN dependency

AUTO-TRANSLATION PIPELINE (LibreTranslate, self-hosted, free):
  When provider saves a listing:
  Step 1: Detect which language they typed in
  Step 2: Translate title and description to all 7 other languages
  Step 3: Store all 8 versions in database
  Step 4: Mark as "auto-translated — click to correct" in dashboard
  Step 5: Provider can fix any translation manually

WHATSAPP TEMPLATES (8 languages × 8 message types = 64 templates):
  All templates need Meta approval before launch (takes 2–7 days)
  Submit all 64 BEFORE development is complete.
  Template names: gomigo_{message_type}_{language_code}
  Example: gomigo_booking_confirmed_ta, gomigo_otp_verification_hi

  8 required message types:
  booking_confirmed, driver_assigned, trip_reminder_30min,
  review_request, trial_warning, trial_expired,
  payment_failed, otp_verification

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — ERROR HANDLING (READABLE BY ANYONE, AUTO-FIXES ITSELF)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHILOSOPHY: Every error in this system must answer three things instantly:
  1. What went wrong? (simple words, no technical jargon)
  2. Why did it happen? (one plain sentence)
  3. How do I fix it? (numbered steps a child can follow)

Every production error also:
  → Sends an email to admin immediately with full details
  → Writes to error_logs table in database
  → Tries to fix itself automatically (where possible)
  → Tells admin whether the auto-fix worked or needs human action

ERROR CLASS (every error in the system uses this structure):
  code          → Human-readable name like ERR_BOOKING_NO_DRIVER
  title         → Short title in all 8 languages
  userMessage   → Plain explanation in all 8 languages
  fixSteps      → Numbered fix steps in all 8 languages
  adminMessage  → Technical detail for admin email only
  severity      → low / medium / high / critical
  autoFixable   → true or false
  autoFixFn     → the function that automatically fixes it (if autoFixable)

EXAMPLE OF HOW AN ERROR LOOKS TO A USER:
  Title:    "We couldn't find a driver"
  Message:  "No drivers are available in your area right now."
  Fix steps:
    1. Wait 15 minutes and search again
    2. Try a slightly different pickup location
    3. Call us on WhatsApp: +91-XXXXXXXXXX and we will find one for you

EXAMPLE OF HOW THE SAME ERROR LOOKS IN ADMIN EMAIL:
  Subject: [HIGH] ERR_BOOKING_NO_DRIVER — GoMiGo Production
  Body:
    What happened: Tourist searched for cab, zero available drivers found
    User: user_id abc123, phone +91-XXXXXXXXXX, location: Ooty Lake area
    Time: 2024-03-15 14:32 IST
    Route: POST /api/bookings/search
    Auto-fix attempted: Yes — sent push alert to 3 offline drivers
    Auto-fix result: 1 driver came online, user can now retry
    Action needed: None (auto-fixed) / Check if more drivers needed in area

ALL ERROR CODES (implement every one with full multilingual messages):

  Login and Authentication:
  ERR_AUTH_SESSION_EXPIRED      Your session timed out, please log in again
  ERR_AUTH_WRONG_OTP            Wrong OTP entered, check the message we sent
  ERR_AUTH_OTP_EXPIRED          OTP expired (valid 10 min), request a new one
  ERR_AUTH_TOO_MANY_ATTEMPTS    Too many tries, wait 30 minutes
  ERR_AUTH_NOT_REGISTERED       Phone not registered, please sign up first

  Booking:
  ERR_BOOKING_NO_DRIVER         No drivers available right now
  ERR_BOOKING_ALREADY_CANCELLED This booking is already cancelled
  ERR_BOOKING_TOO_LATE_CANCEL   Cannot cancel within 2 hours of pickup
  ERR_BOOKING_DRIVER_REJECTED   Driver declined, finding another driver now
  ERR_BOOKING_NOT_FOUND         Booking not found, check your reference number
  ERR_BOOKING_ALREADY_REVIEWED  You already reviewed this trip

  Payment:
  ERR_PAYMENT_TIMEOUT           Payment timed out, money was NOT charged
  ERR_PAYMENT_UPI_FAILED        UPI failed, try a different UPI app
  ERR_PAYMENT_CARD_DECLINED     Card declined, try another card or UPI
  ERR_PAYMENT_SUBSCRIPTION_LAPSED Subscription expired, renew to go live again
  ERR_PAYMENT_REFUND_PENDING    Refund processing, arrives in 5-7 bank days

  Documents and KYC:
  ERR_KYC_DOC_UNREADABLE        Photo is blurry, upload a clearer photo
  ERR_KYC_AADHAAR_MISMATCH      Aadhaar name does not match profile name
  ERR_KYC_DOC_EXPIRED           Document expired, upload a current one
  ERR_KYC_VEHICLE_DUPLICATE     This vehicle is registered by another driver

  File Uploads:
  ERR_UPLOAD_TOO_LARGE          File too large, maximum size is 5MB
  ERR_UPLOAD_WRONG_FORMAT       Wrong file type, use JPG, PNG, or PDF only
  ERR_UPLOAD_STORAGE_FULL       Storage full, admin has been notified

  Listings:
  ERR_LISTING_INCOMPLETE        Fill all required fields before publishing
  ERR_LISTING_NOT_FOUND         This listing no longer exists
  ERR_LISTING_SUSPENDED         Listing suspended, contact support

  Reviews:
  ERR_REVIEW_NOT_ELIGIBLE       Can only review after a completed trip
  ERR_REVIEW_WINDOW_CLOSED      Review window closed (7 days after trip)

  AI Features:
  ERR_AI_KEY_MISSING            Connect your free AI account in Settings
  ERR_AI_KEY_INVALID            AI key stopped working, update in Settings
  ERR_AI_QUOTA_EXCEEDED         Free AI limit reached for today, try tomorrow
  ERR_AI_UNAVAILABLE            AI service is down, try in a few minutes

  System:
  ERR_DB_CONNECTION_LOST        Connection lost, reconnecting automatically
  ERR_STORAGE_ALMOST_FULL       Storage 90% full, admin notified to fix
  ERR_RATE_LIMIT                Too many requests, wait 1 minute
  ERR_WHATSAPP_FAILED           WhatsApp failed, sent email instead
  ERR_TRANSLATION_FAILED        Auto-translation failed, showing English
  ERR_MAP_LOAD_FAILED           Map could not load, check internet connection
  ERR_OFFLINE_SYNC_FAILED       Will sync when internet connection returns
  ERR_BACKUP_FAILED             Weekly backup failed, admin must act now

AUTO-FIX FUNCTIONS (runs automatically when error occurs):
  ERR_DB_CONNECTION_LOST    → Retry 3 times (1s, 2s, 4s gaps)
  ERR_STORAGE_ALMOST_FULL   → Compress photos over 2MB, delete temp files
  ERR_WHATSAPP_FAILED       → Retry once after 5 min, then send email
  ERR_RATE_LIMIT            → Queue request, retry when limit resets
  ERR_TRANSLATION_FAILED    → Retry LibreTranslate, queue for next run
  ERR_BOOKING_NO_DRIVER     → Alert offline nearby drivers via push

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — BUSINESS RULES AND MONEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW GOMIGO MAKES MONEY:

Revenue Stream 1 — Provider Monthly Subscriptions:
  Provider Type       Trial       Basic Plan    Featured Plan
  ─────────────       ─────       ──────────    ─────────────
  Cab driver          60 days     ₹299/month    ₹599/month
  Auto driver         60 days     ₹249/month    ₹499/month
  Hotel owner         60 days     ₹799/month    ₹1,499/month
  Tour guide          60 days     ₹399/month    ₹799/month

  Featured plan benefits (worth paying for):
  → Top of search results (sort_boost value in database)
  → "Featured" badge on listing card
  → Up to 20 listing photos (basic plan: 5 photos)
  → Analytics dashboard showing views, clicks, booking conversion

  Trial strategy (60 days, not 30 — drivers need more time to trust):
  → No credit card at signup, just phone number
  → Trial listings show subtle "Trial" label to tourists
  → Day 45: WhatsApp "15 days left on your free listing"
  → Day 55: WhatsApp "5 days left — 1 tap to subscribe"
  → Day 59: WhatsApp "Last chance — listing pauses tomorrow"
  → Day 60 midnight: listing_visible = false (automated)
  → Day 63: WhatsApp "Listing paused. Reactivate: [payment link]"
  → Day 74: status = churned, no more messages

Revenue Stream 2 — Platform Commission on Bookings:
  Cab bookings:    8% of trip fare
  Auto bookings:   6% of trip fare
  Hotel bookings:  12% of room rate per night
  Tour bookings:   10% of tour price per person
  Instant booking: 2% discount on commission (rewards quick confirmations)
  Commission deducted automatically from provider payout via Razorpay

GST COMPLIANCE (auto-generated, no manual work):
  Platform fee is subject to 18% GST
  GST invoice PDF auto-generated for every subscription payment
  Invoice includes platform GSTIN and provider PAN number
  Provider downloads invoice from their dashboard
  Quarterly GSTR-1 report auto-generated for admin's accountant

CANCELLATION POLICY (all automatic, no admin decisions):
  Tourist cancels more than 24 hours before:  100% refund to tourist
  Tourist cancels 2 to 24 hours before:       50% refund to tourist
  Tourist cancels less than 2 hours before:   No refund
  Provider cancels any time:                  100% refund to tourist
                                              + penalty flag on provider
  3 provider cancellations in 30 days:        Auto-suspend account
  All refunds processed via Razorpay API automatically

DISPUTE RESOLUTION (admin only gets involved here):
  Tourist or provider raises dispute → status becomes 'disputed'
  Both parties get 48 hours to submit their evidence (photo + text)
  Admin dashboard shows case with countdown timer
  Admin chooses: full refund / partial / no refund with one click
  Platform automatically processes chosen refund via Razorpay
  If admin does not act in 48 hours: escalation email is sent

REFERRAL SYSTEM (automated):
  Provider refers another provider: 1 free month added automatically
  Tourist refers another tourist: ₹100 booking credit (expires 90 days)
  referral_code column auto-generated for every user at signup
  Credit applies automatically at checkout, no admin action needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — DATABASE DESIGN (ALL TABLES AND RULES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Drizzle ORM for all database definitions. Generate standard PostgreSQL.
Every table has created_at and updated_at (managed by trigger).
Soft deletes only — never permanently delete production data (deleted_at).
All timestamps stored in UTC. Displayed as IST (Asia/Kolkata) in the UI.
All money stored in paise (₹1 = 100 paise) to avoid decimal errors.

TABLE: destinations
  id, region_name, sub_destinations (text array), is_active (default false),
  cover_photo_url, description_en through description_or (8 language columns),
  seo_title_en through seo_title_or, meta_description_en through _or,
  seasonal_rules (jsonb: peak months and their price multipliers),
  languages_spoken (text array), emergency_contact,
  created_at, updated_at

TABLE: users
  id (uuid), phone (unique, required), email (optional),
  full_name, avatar_url,
  preferred_language (default 'en', must be one of 8 supported codes),
  ai_provider (which AI service they connected),
  ai_key_vault_id (pointer to encrypted key in Supabase Vault, never the key itself),
  ai_key_verified_at,
  referral_code (unique 8-character code, auto-generated at signup),
  referred_by_user_id,
  gdpr_consent_at (required, cannot register without this),
  data_deletion_requested_at,
  last_active_at, created_at, updated_at, deleted_at

TABLE: user_roles
  id, user_id, role (tourist/driver/auto_driver/hotel_owner/tour_guide/admin),
  approved_at, suspended_at, suspension_reason (plain English)
  One user can have multiple roles (driver can also be tour guide)

TABLE: provider_profiles
  id, user_id, display_name,
  bio in all 8 languages (bio_en through bio_or),
  profile_photo_url,
  listing_visible (false until KYC approved),
  reputation_score (0.00 to 5.00, weighted rolling average),
  total_reviews, total_completed, cancellation_count,
  sort_boost (0 for basic, 10 for featured — affects search ranking),
  subscription_id,
  created_at, updated_at, deleted_at

TABLE: kyc_documents
  id, provider_id,
  doc_type (aadhaar/pan/driving_license/vehicle_rc/vehicle_permit/tourism_cert),
  file_url (private Supabase storage path),
  status (pending/approved/rejected/expired),
  rejection_reason (plain English shown directly to provider),
  verified_by (auto/admin), verified_at, expires_at,
  created_at, updated_at

TABLE: subscriptions
  id, provider_id,
  plan (driver_basic/driver_featured/auto_basic/auto_featured/
        hotel_small/hotel_large/guide_individual/guide_agency),
  status (trial/active/past_due/suspended/cancelled/churned),
  trial_ends_at, current_period_start, current_period_end,
  razorpay_subscription_id,
  amount_paise, gst_paise,
  failure_count (increments on payment failure),
  last_payment_attempt_at, next_retry_at,
  created_at, updated_at

TABLE: listings
  id, provider_id,
  destination_id (FK to destinations table — links to Nilgiris, Coorg, etc.),
  listing_type (cab/auto/hotel_room/tour),
  title in all 8 languages (title_en through title_or),
  description in all 8 languages,
  is_auto_translated (tracks which language columns were auto-generated),
  base_price_paise, demand_multiplier (1.00 default, max 2.00),
  platform_fee_percent (default 10),
  is_instant_book, listing_visible,
  seasonal_rules (jsonb: each destination's peak months override global),
  cover_photo_url, photo_urls (array, max 5 basic / 20 featured),
  photo_moderation_status (pending/approved/flagged/rejected),
  location in all 8 languages (location_name_en through _or),
  location_lat, location_lng,
  amenities (text array),
  vehicle_type, vehicle_number, seat_capacity (for cab/auto),
  max_guests (for hotel/tour),
  cancellation_policy (flexible/moderate/strict),
  search_vector (for full-text search, maintained by trigger),
  embedding (for pgvector similarity, 1536 dimensions),
  view_count, booking_count,
  created_at, updated_at, deleted_at

TABLE: bookings
  id, booking_reference (human-readable: YT-2024-00001),
  tourist_id, listing_id, provider_id,
  booking_type (cab/auto/hotel/tour),
  status (pending/confirmed/driver_assigned/in_progress/
          completed/cancelled/disputed/refunded),
  pickup details (lat, lng, name), destination details (lat, lng, name),
  checkin_date, checkout_date, tour_date,
  num_passengers, num_rooms, num_nights,
  base_amount_paise, platform_fee_paise, gst_paise, total_paise,
  provider_payout_paise (total minus platform fee and GST),
  payment_status (unpaid/partial/paid/refunded/partially_refunded),
  payment_method (upi/card/netbanking/cash/wallet),
  razorpay_order_id, razorpay_payment_id,
  driver_lat, driver_lng, driver_location_updated_at (real-time tracking),
  trip_started_at, trip_completed_at,
  cancellation_reason, cancelled_by, cancelled_at,
  refund_amount_paise, refund_status, refund_razorpay_id,
  tourist_language (language at booking time, used for notifications),
  created_at, updated_at
  RULE: checkout_date must be on or after checkin_date (DB constraint)
  RULE: all amounts must be positive (DB constraint)

TABLE: reviews
  id, booking_id (unique — strictly one review per booking),
  reviewer_id, provider_id,
  rating (1 to 5 stars, DB constraint enforced),
  review_text_original, review_language,
  review_text_en (auto-translated),
  provider_reply, provider_replied_at,
  is_flagged, flag_reason,
  created_at, updated_at
  RULE: review only allowed if booking status is 'completed' (DB constraint)
  This is enforced at the database level, not just in code

TABLE: feature_flags
  id, flag_name (unique), is_enabled (default false),
  description, enabled_for_user_ids (empty = all users),
  created_at, updated_at
  Seed with all flags at migration time:
  lang_tamil, lang_telugu, lang_kannada, lang_malayalam, lang_hindi,
  lang_marathi, lang_odia, ai_byoai, hotel_booking, tour_booking,
  itinerary_builder, dynamic_pricing, referral_system,
  dest_coorg, dest_kodaikanal, dest_munnar, dest_himachal

TABLE: error_logs
  id, error_code, error_title, error_message, stack_trace,
  user_id, user_role, route, http_method, http_status, user_agent,
  severity (low/medium/high/critical),
  auto_fix_attempted, auto_fix_succeeded, auto_fix_action,
  admin_notified_at, resolved_at, resolved_by, resolution_notes,
  created_at

TABLE: notifications
  id, recipient_id, booking_id,
  channel (whatsapp/email/sms),
  template_name, language_code, variables_used (jsonb),
  status (pending/sent/delivered/failed),
  external_message_id, failed_reason,
  retry_count, next_retry_at,
  created_at, sent_at, delivered_at

TABLE: notification_templates
  id, template_name, language_code, channel,
  wati_template_name (exact name approved in Meta/Wati),
  subject (for email), message_body (with {{variable}} placeholders),
  variables (list of variable names), approved_at, is_active
  RULE: unique combination of template_name + language_code + channel

TABLE: rate_limit_counters
  id, identifier (user_id or IP), route, count, window_start
  pg_cron resets all counters every hour

TABLE: ai_usage_logs
  id, user_id, ai_provider, feature_used, tokens_used,
  response_time_ms, success, created_at
  IMPORTANT: Never log the actual prompt text or AI response — privacy

TABLE: referral_conversions
  id, referrer_id, referred_id,
  conversion_type (provider_signup/tourist_booking),
  reward_type (free_month/booking_credit), reward_amount_paise,
  reward_applied_at, created_at

TABLE: translation_gaps
  id, language_code, message_key, english_value, reported_at
  Admin dashboard shows which translations are missing

ROW LEVEL SECURITY — define policies for every table:
  users: can only read and update their own row
  bookings: tourist sees their bookings, provider sees their listing's bookings
  reviews: everyone can read, only verified tourists can create
  error_logs: admin role only
  feature_flags: everyone can read, only admin can update
  ai_usage_logs: users see only their own logs
  kyc_documents: only the provider and admin can read

INDEXES for performance:
  listings: on (listing_type, listing_visible, destination_id)
  listings: GIN index on search_vector (full-text search)
  listings: HNSW index on embedding (AI similarity search)
  bookings: on (tourist_id, status, created_at DESC)
  bookings: on (provider_id, status, created_at DESC)
  error_logs: on (severity, created_at DESC)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — ALL AUTOMATION FLOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All automation uses Supabase Edge Functions + pg_cron + database triggers.
Every function must be idempotent (safe to run multiple times, same result).
Every function logs its start, result, and any errors to error_logs table.

AUTOMATION 1: New Provider KYC Verification
  Trigger: provider submits KYC documents
  Step 1: Check all required documents are present for their role type
          Cab driver needs: aadhaar + driving_license + vehicle_rc + vehicle_permit
          Hotel owner needs: aadhaar + pan + gst_cert (if applicable)
          Tour guide needs: aadhaar + tourism_cert (if applicable)
  Step 2: Validate file types by checking file content (not just extension)
  Step 3: Call Digilocker API to verify Aadhaar
  Step 4: Call Parivahan API to verify vehicle permit (for drivers)
  Step 5: Check if vehicle number already registered by another driver
  Step 6a: If all checks pass:
            → Mark all documents as approved
            → Set listing_visible = true
            → Send WhatsApp in provider's language: "Your listing is live!"
            → Send email with link to provider dashboard
  Step 6b: If any check fails:
            → Mark specific document as rejected
            → Set plain-English rejection reason
            → Send WhatsApp: "We need one more thing: [specific document name]"
  Step 6c: If government APIs are unavailable:
            → Hold for manual admin review
            → Send admin email with all document links for manual check
            → Show pending status to provider with estimated time

AUTOMATION 2: Trial and Subscription Management
  pg_cron runs: every day at 9:00 AM IST (03:30 UTC)
  Function: fn_manage_subscriptions()
  Checks all subscriptions and sends appropriate message for each stage:
  → 15 days before trial ends: "15 days left" WhatsApp
  → 5 days before: "5 days left + payment link" WhatsApp
  → 1 day before: "Last chance" WhatsApp
  → Trial ends: listing_visible = false, status = suspended
  → 3 days after expiry: "Listing paused, reactivate" WhatsApp
  → 7 days after: second reminder
  → 14 days after: status = churned, stop all messages
  Guards: check if notification already sent today before sending again

AUTOMATION 3: Booking Lifecycle
  Trigger: booking status changes (Supabase database trigger)

  When status becomes 'confirmed':
  → WhatsApp tourist (in their language): booking reference, provider name, phone
  → WhatsApp provider (in their language): tourist name, phone, pickup details
  → Email both: booking confirmation PDF with full details
  → Schedule reminder: WhatsApp tourist 30 minutes before pickup
  → Increment listing booking_count

  When status becomes 'in_progress':
  → Start accepting driver location updates (Supabase Realtime)

  When status becomes 'completed':
  → Calculate provider payout amount
  → Schedule review request: WhatsApp tourist 2 hours later
  → Update provider reputation_score (weighted rolling average, recent = more weight)
  → Increment provider total_completed

  When status becomes 'cancelled':
  → Calculate refund based on cancellation policy rules
  → If refund > 0: call Razorpay API to process refund automatically
  → If provider cancelled: increment provider cancellation_count
  → If cancellation_count reaches 3 in 30 days: auto-suspend account
  → WhatsApp both parties about cancellation and refund timeline

AUTOMATION 4: Post-Trip Review Request
  Trigger: one-time job scheduled when booking completes
  Delay: 2 hours after completion
  Step 1: Confirm booking is still 'completed' (not disputed after)
  Step 2: Confirm tourist has not already reviewed
  Step 3: Send WhatsApp in tourist's language: "Rate your trip [link]"
  Step 4: If no review after 48 hours: send one follow-up only
  Step 5: After follow-up: stop permanently, never send a third message

AUTOMATION 5: Payment Failure Recovery
  Trigger: Razorpay webhook event for failed payment
  Step 1: Verify webhook is genuinely from Razorpay (signature check)
  Step 2: Find subscription, increment failure_count
  Step 3: Immediately WhatsApp provider with direct payment link
  Failure 1: Admin notified at low severity
  Failure 2 (+3 days): Second WhatsApp + email to provider
  Failure 3 (+7 days): listing_visible = false, "Listing paused" WhatsApp
  Failure 4 (+14 days): status = suspended, admin notified high severity

AUTOMATION 6: New Destination Activation
  Trigger: admin sets destination.is_active = true in dashboard
  Step 1: Generate SEO page for the destination automatically
  Step 2: Create destination-specific WhatsApp template variables
  Step 3: Send admin confirmation: "Coorg is now live on GoMiGo"
  Step 4: Enable provider registration for that destination
  Zero code deployment needed — pure database flag

AUTOMATION 7: Seasonal Pricing
  pg_cron runs: 1st of every month at 00:01 AM IST
  For each listing: read its destination's seasonal_rules
  Find rule matching current month, update demand_multiplier
  If no rule matches: reset multiplier to 1.00 (base price)
  Admin can override any multiplier at any time from dashboard

AUTOMATION 8: Auto-Translation Queue
  pg_cron runs: every 30 minutes
  Find listings where any language column is empty
  Call LibreTranslate to generate missing translations
  Save all 8 language versions, mark as auto-translated
  If LibreTranslate unavailable: log as low severity, retry next run

AUTOMATION 9: Photo Moderation
  Trigger: new photo uploaded to any listing
  Step 1: Send to Google Vision API (free 1000 checks/month)
  Step 2: Score above 0.8 for adult/violence: auto-reject, WhatsApp provider
  Step 3: Score 0.4 to 0.8: flag for admin review (appears in dashboard)
  Step 4: Score below 0.4: auto-approve, listing can proceed
  Step 5: When Vision API quota exhausted: hold all photos for manual review
           Admin notified immediately

AUTOMATION 10: Real-Time Driver Location
  Trigger: driver app sends location update during active trip
  Validation: confirm sender is the driver assigned to this booking
  Update: save new lat/lng to booking record
  Broadcast: send to tourist's real-time channel (tourist sees live map)
  Stop: when booking becomes 'completed' or 'cancelled'
  Alert: if no update received for 5 minutes during active trip → admin notified

AUTOMATION 11: Weekly Database Backup
  GitHub Actions schedule: every Sunday at 2 AM IST
  Step 1: Export full database via Supabase management API
  Step 2: Encrypt the export file (AES-256, key in GitHub Secret)
  Step 3: Upload to Cloudflare R2 storage (free 10GB)
  Step 4: Delete backups older than 30 days from R2
  Step 5: Send admin email confirming backup size and location
  If any step fails: send admin critical error email immediately

AUTOMATION 12: Health Monitoring
  Upptime via GitHub Actions: checks every 5 minutes
  Endpoints: /api/health, /api/health/db, /api/health/storage,
             /api/health/payments, /api/health/whatsapp
  If 3 checks in a row fail: admin email with plain-English fix steps
  Public status page auto-updated (Upptime generates this from GitHub)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — INDIA-SPECIFIC REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENTS (Indian market reality):
  Razorpay handles all payments: UPI (0% fee), cards (2%), netbanking (₹15 flat)
  UPI is always the default payment method shown first
  Cash option: tourist pays driver/guide directly at destination
    Platform sends commission invoice to provider separately
    Provider pays commission within 7 days via UPI link
  All amounts stored in paise, displayed in ₹ format with Indian numbering
  GST invoices auto-generated and downloadable from dashboard

COMMUNICATION (WhatsApp first, always):
  WhatsApp is shown first on every notification — Indians check WhatsApp
  Email is backup only — shown second, for record-keeping
  SMS is last resort — only when WhatsApp delivery fails
  OTP is sent via WhatsApp first (not email — Indians ignore email OTPs)

CONNECTIVITY (Nilgiris and hill stations have 2G zones):
  All pages must work usably at 50 kilobits per second (2G speed)
  Service worker caches all critical pages for offline use
  Booking form saves to device storage if internet drops, syncs when restored
  All listing photos: WebP format, maximum 200KB each (enforced on upload)
  Page load performance target: Lighthouse score 90+ on 3G throttled
  Initial JavaScript bundle: under 200KB (code splitting enforced)

MAPS (no Google Maps — it requires a billing account):
  Leaflet with OpenStreetMap tiles (free, no API key, no billing)
  Address search: Nominatim API (OpenStreetMap, completely free)
  Route calculation: openrouteservice.org free tier OR self-hosted OSRM
  All map tiles cached via Cloudflare CDN to reduce load on tile servers

LEGAL AND REGULATORY:
  Digilocker API: Aadhaar verification (free, register at developers.digilocker.gov.in)
  Parivahan API: vehicle RC and permit check (free, parivahan.gov.in)
  GST: register when revenue exceeds ₹20 lakh per year
  TCS (Tax Collected at Source): 1% on transactions above ₹7.5 lakh/year
  All user data stored in India: Supabase Mumbai region (ap-south-1)
  Data retention: 7 years after account closure (income tax requirement)

INDIA DATA PROTECTION ACT (DPDP 2023):
  Explicit consent checkbox at registration (timestamp logged in database)
  Privacy policy in plain English and Tamil (no legal jargon)
  User can download all their data as a ZIP file (auto-generated)
  User can request account deletion (14-day processing, full data removal)
  Data shared only with Razorpay and Wati.io — stated clearly in privacy policy
  All breach notifications to affected users within 72 hours

ACCESSIBILITY (needed for government tourism platform integrations):
  WCAG 2.1 Level AA compliance across all pages
  All images require alt text (upload form cannot submit without it)
  All form fields have proper labels and descriptions
  All interactive elements work via keyboard alone
  Color contrast meets minimum ratios everywhere
  Tested with axe-playwright in CI pipeline (fails build if violations found)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10 — SECURITY (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOGIN AND SESSIONS:
  Login via phone number with OTP (WhatsApp delivery, SMS fallback)
  Sessions stored in httpOnly cookies (JavaScript cannot access them)
  Cookie settings: sameSite=strict, secure=true (HTTPS only)
  Access token expires: 1 hour. Refresh token: 7 days, rotates on each use.
  OTP rate limit: 5 attempts per phone number per hour

API PROTECTION:
  All /api/ routes verify Supabase JWT before doing anything
  Razorpay webhooks: HMAC-SHA256 signature verified on every call
  File uploads: file content checked (not just filename extension)
  All user input: validated with Zod schemas before any processing
  SQL queries: Drizzle ORM parameterized queries, zero string building
  Error responses: never reveal stack traces or internal details to users

SECURITY HEADERS (applied via next.config.js):
  Content-Security-Policy: restricts what scripts and resources can load
  X-Frame-Options: DENY (prevents embedding in iframes)
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  Strict-Transport-Security: forces HTTPS for 1 year

RATE LIMITING (PostgreSQL-based, no paid service):
  Stored in rate_limit_counters table, reset hourly by pg_cron
  Login routes: 5 requests per hour per phone number
  Booking routes: 50 requests per hour per user
  AI routes: 100 requests per hour per user
  Payment routes: 20 requests per hour per user
  All routes combined: 200 per hour per user
  By IP address: 1000 per hour (bot protection)

FILE UPLOAD SECURITY:
  Maximum size: 5MB per file (enforced server-side, not just browser)
  Allowed types: JPEG, PNG, WebP, PDF (verified by file content)
  Listing photos: stored in public bucket (accessible via CDN)
  KYC documents: stored in private bucket (admin and provider only)
  Private files: accessed only via signed URLs with 1-hour expiry

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11 — TESTING AND AUTOMATED DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE: No code reaches production until all tests pass. Zero exceptions.
Admin gets an email if any step fails, with plain-English explanation.

THREE LEVELS OF TESTING:

Level 1 — Unit Tests (Vitest):
  Test every individual function in isolation
  Coverage requirement: 80% minimum (build fails if below this)
  Must test: all currency functions, all date helpers, all error classes,
             all Zod validation schemas, cancellation policy calculator,
             referral code generator, seasonal price multiplier

Level 2 — Integration Tests (Vitest + local Supabase):
  Test that different parts work together correctly
  Must test: all API routes, all Edge Functions, all payment webhooks,
             all notification triggers, all RLS security policies,
             all database constraints (verify they actually block bad data)

Level 3 — Full Browser Tests (Playwright):
  Simulate real users clicking through the actual website
  Must all pass before any production deployment:

  Tourist booking journey:
    Search for cab in Nilgiris → see listings → view one in detail
    → fill booking form → pay with mocked UPI → see confirmation
    → wait for simulated trip completion → receive review request
    → submit review → see review on listing

  Driver onboarding journey:
    Register with phone → upload KYC documents (test files)
    → receive WhatsApp confirmation (mocked) → listing goes live
    → receive booking request → accept it → mark trip started → mark completed

  Subscription lifecycle:
    Sign up for trial → receive day 45 warning (time mocked)
    → receive day 59 warning → trial expires → listing goes invisible
    → make payment → listing comes back live

  Payment failure:
    Active subscription → payment webhook fires as failed
    → listing suspended after 3 failures → manual payment → restored

  Language switching:
    Load in English → switch to Tamil → verify all text changes to Tamil
    → complete booking in Tamil → verify WhatsApp arrives in Tamil

  Offline booking:
    Load page → disable network in browser → fill booking form
    → submit → verify saved to device storage → restore network
    → verify automatically synced to server

  Accessibility:
    Run axe accessibility checker on every major page
    Zero violations allowed (build fails on any violation)

  New destination activation:
    Admin flips is_active for Coorg in database
    → verify SEO page auto-generated
    → verify providers can register for Coorg

CI/CD PIPELINE (.github/workflows/deploy.yml):
  Trigger: every push to any branch runs tests
           push to main branch also deploys to production

  Step 1: Code quality check
    ESLint (zero warnings — warnings treated as errors)
    TypeScript type check (strict mode, must pass cleanly)
    Prettier formatting check
    If this fails: nothing else runs, admin email sent immediately

  Step 2: Unit tests
    Run Vitest with coverage reporting
    Fail if any test fails or coverage drops below 80%

  Step 3: Integration tests
    Start local Supabase (runs in GitHub Actions)
    Apply database migrations
    Load test seed data
    Run all integration tests
    Run accessibility checks on dev server

  Step 4: Database migration safety check
    Run migrations against staging database as a dry run first
    Run rollback test: apply → rollback → apply again (all must succeed)
    Fail if rollback breaks anything (migration is unsafe)

  Step 5: Deploy to staging
    Deploy to Vercel preview URL (automatic per pull request)
    Run all Playwright browser tests against staging URL
    Post test results summary as pull request comment

  Step 6: Deploy to production (main branch only)
    Vercel production deployment
    Keep last 3 deployments (instant rollback available if needed)

  Step 7: Apply database migrations to production
    Zero-downtime only (add columns, never remove in production)
    If migration fails: immediate rollback + admin email + pager

  Step 8: Smoke tests on production
    Test 5 critical endpoints immediately after deploy:
    → Health check returns 200
    → Database connection working
    → Listings API returns data
    → Payment gateway reachable
    → WhatsApp API reachable
    If any fail: immediately rollback Vercel to previous version

  Step 9: Notify success
    Admin email: "Deploy successful. Version X deployed at Y time."

  ON ANY FAILURE:
    Admin gets email immediately with:
    → Which step failed and exactly what the error said
    → Direct link to the failed GitHub Actions run
    → Numbered steps to fix that specific type of failure
    → Production is never touched if any step before it failed

STAGING ENVIRONMENT:
  Separate Supabase project (free tier, test data only, never real data)
  Separate Vercel preview URL per pull request
  Seeded with realistic fake Indian data:
    50 providers (drivers, hotels, guides) with Tamil/Telugu/Kannada names
    200 listings across Ooty, Coonoor, Kotagiri
    500 completed bookings with reviews
  Fake data generated with Faker.js using Indian locale
  Staging resets fresh on every pull request

DATABASE MIGRATION RULES:
  Every migration file has a matching rollback file
  Naming: 001_create_users.sql + 001_create_users_rollback.sql
  Only additive changes in production (add columns, add tables)
  Never drop columns or tables in a live migration (deprecate first)
  Feature flags handle enabling/disabling new features safely

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12 — DASHBOARDS (WHAT EACH PERSON SEES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOURIST DASHBOARD (/dashboard):
  Active bookings with live driver location on OpenStreetMap
  Past trips with receipt and GST invoice PDF download button
  Saved places (wishlist) and saved itineraries
  Booking credit balance (from referrals)
  Trips waiting for review with one-tap review button
  AI itinerary builder (prompts to connect free Gemini key if not done)
  Language preference and account settings
  Download my data button and delete account request

DRIVER / AUTO DRIVER DASHBOARD (Tamil shown first as default):
  Today's earnings: total completed + pending
  Upcoming bookings in next 24 hours with tourist name, phone, map
  Incoming booking requests with accept/decline and 60-second countdown
  Monthly earnings bar chart for last 6 months
  Subscription status: days remaining, one-tap renewal button
  Star rating breakdown: how many 5-star, 4-star, 3-star etc.
  Cancellation warning if approaching the 3-in-30-days limit
  Edit listing: update vehicle photo, pricing, availability

HOTEL OWNER DASHBOARD (/provider/dashboard):
  Booking calendar showing occupied and empty dates at a glance
  Revenue this month vs last month with plain-English comparison
  Upcoming check-ins in next 7 days with guest names and phones
  Edit listing: room photos, amenities, pricing, seasonal rules
  Review management: read all reviews, write replies to each

TOUR GUIDE DASHBOARD (/provider/dashboard):
  Availability calendar — mark which dates are free or booked
  Upcoming tours with guest count and language preferences noted
  Earnings breakdown by tour type
  Review management
  AI tour planner (BYOAI — prompts to connect key if not done)

ADMIN DASHBOARD (/admin) — ALERT-DRIVEN, ZERO CLUTTER:
  Design rule: show only items needing a human decision right now.
  No scrolling through data tables. No raw numbers without context.
  Every alert has one action button that resolves it directly.

  CRITICAL (red) — Revenue or safety blocked:
  → Payment failures today: X providers (button: send reminder)
  → Disputes needing resolution: X cases with countdown timers
  → Critical system errors in last 24 hours (button: view + auto-fix)

  HIGH (orange) — Needs attention today:
  → KYC documents pending manual review: X (button: view documents)
  → Trials expiring in 7 days: X providers (button: see list)
  → Photos flagged by content moderation: X (button: approve or reject)

  MEDIUM (yellow) — Needs attention this week:
  → Translation gaps: X keys missing in Y language (button: export for translator)
  → Providers with 2 cancellations this month (button: send warning)
  → Listings not updated in 90+ days (button: send nudge to provider)

  INFORMATION (blue) — Summaries, no action needed:
  → Revenue today / this week / this month with trend arrow
  → New signups this week: X tourists, Y providers
  → Active subscriptions: X total (Y on trial, Z paid)
  → WhatsApp quota used: X of 1000 this month
  → Storage used: X MB of 1000 MB (warning when over 900 MB)
  → Last backup: date, size, status

  Admin never needs to see raw booking lists, user lists, or data tables.
  Direct link to Supabase Studio available in admin settings for data exploration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 13 — FEATURES THAT MAKE GOMIGO TRUSTWORTHY AND SCALABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEO PAGES (auto-generated when destination is activated):
  /places/nilgiris, /places/ooty, /places/coonoor, /places/kotagiri
  /cabs/ooty, /hotels/ooty, /tours/ooty, /guides/ooty
  /places/coorg (auto-generated when admin activates Coorg)
  Each page: unique meta title, description, Open Graph image
  Schema.org JSON-LD markup for better Google search results
  sitemap.xml auto-generated including all destination and listing URLs
  robots.txt: allows all search engines on public pages, blocks /admin

PWA (WORKS LIKE AN APP ON MOBILE):
  Add to home screen on Android and iOS
  Works offline for browsing and booking form filling
  Booking confirmations cached for offline viewing
  Install prompt shown after user books 2+ times

PROVIDER DASHBOARD INSIGHTS (not just raw numbers):
  "You earned ₹3,200 more than last month (+18%)"
  "Your busiest booking hours are 8 AM to 10 AM"
  "X tourists viewed your listing this week but did not book"
  "Your cancellation rate is 5%. Platform average is 2%. Fewer cancellations = more bookings."
  "Listings with 10+ photos get 40% more bookings. You have 3 photos. Add more?"

SOCIAL SHARING:
  Every listing has a shareable link with a preview image showing photo, rating, price
  Booking confirmation generates a shareable "I'm going to Ooty!" image card
  WhatsApp share button on all listing pages with pre-filled message and link

PRIVACY AND COOKIES:
  Minimal cookie notice: "We use only essential cookies. No tracking."
  Umami analytics is cookie-free by default — GDPR compliant
  No advertising pixels or third-party tracking scripts anywhere
  Users can download all their data or delete their account from settings

ZERO-DOWNTIME OPERATIONS:
  Feature flags table enables any feature without deployment
  Database migrations are always additive (never remove live data)
  Vercel keeps last 3 deployments — instant rollback in 30 seconds
  Admin can revert to previous version from dashboard if anything breaks

404 AND ERROR PAGES:
  Custom 404: "This page doesn't exist." with 3 helpful links and search
  Custom 500: "Something went wrong. Our team has been notified. Try again in 2 minutes."
  Both pages work completely offline — no API calls needed to display them

BACKUP AND RECOVERY:
  Daily automatic Supabase snapshots kept for 7 days
  Weekly encrypted export to Cloudflare R2, kept for 30 days
  Backup integrity tested monthly via GitHub Actions
  README includes step-by-step restore instructions anyone can follow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 14 — COMPLETE PROJECT FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

gomigo/
├── .github/
│   └── workflows/
│       ├── deploy.yml            Full 9-step CI/CD pipeline
│       ├── backup.yml            Weekly encrypted database backup
│       └── uptime.yml            Health checks every 5 minutes
│
├── deploy/                       Ready configs for every hosting platform
│   ├── vercel/vercel.json
│   ├── aws/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── ecs-task-definition.json
│   ├── gcp/
│   │   ├── Dockerfile
│   │   ├── cloudbuild.yaml
│   │   └── cloudrun.yaml
│   ├── railway/railway.json
│   ├── render/render.yaml
│   ├── flyio/fly.toml
│   ├── azure/azure-pipelines.yml
│   ├── selfhosted/
│   │   ├── docker-compose.yml    Full stack: app + nginx + auto-HTTPS
│   │   └── Caddyfile             Easier HTTPS alternative to nginx
│   └── README.md                 Deploy to any platform in 10 steps
│
├── supabase/
│   ├── config.toml               Local Supabase configuration
│   ├── migrations/
│   │   ├── 001_init.sql          All tables, indexes, constraints
│   │   ├── 001_init_rollback.sql
│   │   ├── 002_rls_policies.sql  All Row Level Security policies
│   │   ├── 002_rls_policies_rollback.sql
│   │   ├── 003_pg_cron_jobs.sql  All scheduled automation jobs
│   │   ├── 003_pg_cron_jobs_rollback.sql
│   │   └── 004_seed_templates.sql All 64 WhatsApp notification templates
│   ├── functions/                Serverless automation functions
│   │   ├── handle-booking/       Booking lifecycle automation
│   │   ├── send-notification/    WhatsApp → email → SMS chain
│   │   ├── handle-payment-webhook/ Razorpay events
│   │   ├── handle-kyc/           Document verification
│   │   ├── auto-fix-errors/      Self-healing error responses
│   │   ├── decrypt-ai-key/       Secure AI key retrieval
│   │   ├── generate-translations/ LibreTranslate batch jobs
│   │   ├── moderate-photos/      Google Vision content check
│   │   ├── track-driver-location/ Real-time GPS updates
│   │   └── activate-destination/ Auto-setup when region goes live
│   └── seed.ts                   Realistic Indian test data
│
├── messages/                     Translation files (one per language)
│   ├── en.json                   Source of truth — all keys here first
│   ├── ta.json
│   ├── te.json
│   ├── kn.json
│   ├── ml.json
│   ├── hi.json
│   ├── mr.json
│   └── or.json
│
├── public/
│   ├── fonts/                    Self-hosted Noto fonts (8 scripts)
│   ├── offline.html              Fully static offline fallback page
│   ├── manifest.json             PWA app manifest
│   └── icons/                    App icons all sizes
│
├── src/
│   ├── app/                      Next.js pages and API routes
│   │   ├── (tourist)/            Tourist-facing pages
│   │   │   ├── page.tsx          Homepage with search
│   │   │   ├── places/[slug]/    Destination detail pages
│   │   │   ├── listings/[id]/    Listing detail with booking CTA
│   │   │   ├── book/[id]/        Booking flow with payment
│   │   │   ├── booking/[id]/     Booking status with live map
│   │   │   ├── my-trips/         Trip history and receipts
│   │   │   ├── itinerary/        AI itinerary builder
│   │   │   └── profile/          Settings and account
│   │   ├── (provider)/           Provider-facing pages
│   │   │   ├── dashboard/        Earnings, bookings, insights
│   │   │   ├── listings/         Manage my listings
│   │   │   ├── listings/new/     Create new listing
│   │   │   ├── bookings/         Booking management
│   │   │   ├── earnings/         Revenue analytics
│   │   │   └── settings/         Account and AI key settings
│   │   ├── (admin)/              Admin-only pages
│   │   │   ├── dashboard/        Alert-driven admin view
│   │   │   ├── disputes/         Dispute resolution cases
│   │   │   ├── errors/           Error log with auto-fix buttons
│   │   │   ├── destinations/     Add and activate destinations
│   │   │   ├── subscriptions/    Subscription management
│   │   │   └── kyc/              Manual KYC review queue
│   │   ├── (auth)/
│   │   │   ├── login/            Phone + OTP login
│   │   │   └── verify/           OTP verification
│   │   ├── api/
│   │   │   ├── health/           System health endpoints
│   │   │   ├── bookings/         Booking CRUD
│   │   │   ├── listings/         Listing search and detail
│   │   │   ├── payments/         Razorpay order creation
│   │   │   ├── webhooks/razorpay/ Payment event webhooks
│   │   │   ├── ai/               Secure AI key proxy
│   │   │   └── upload/           Photo and document upload
│   │   ├── error.tsx             Global error boundary
│   │   ├── not-found.tsx         Custom 404 page
│   │   ├── layout.tsx            Root layout with language provider
│   │   └── sitemap.ts            Auto-generated sitemap
│   │
│   ├── lib/                      Shared business logic
│   │   ├── errors/
│   │   │   ├── AppError.ts       Error class with all codes, 8 languages
│   │   │   ├── errorCodes.ts     All ERR_ constants
│   │   │   ├── notify.ts         Admin email notification sender
│   │   │   └── autoFix.ts        Self-healing functions per error
│   │   ├── ai/
│   │   │   ├── bridge.ts         BYOAI: retrieve key + fallback chain
│   │   │   └── providers/        gemini.ts, groq.ts, deepseek.ts, ollama.ts
│   │   ├── storage/
│   │   │   ├── index.ts          Interface + factory (reads env var)
│   │   │   ├── supabase.ts
│   │   │   ├── r2.ts
│   │   │   ├── s3.ts
│   │   │   ├── gcs.ts
│   │   │   └── minio.ts
│   │   ├── email/
│   │   │   ├── index.ts          Interface + factory
│   │   │   ├── nodemailer.ts
│   │   │   ├── resend.ts
│   │   │   └── templates/        React Email components
│   │   │       ├── booking-confirmed.tsx
│   │   │       ├── gst-invoice.tsx
│   │   │       └── error-alert.tsx
│   │   ├── queue/
│   │   │   ├── index.ts          Interface + factory
│   │   │   └── pg-cron.ts
│   │   ├── cache/
│   │   │   ├── index.ts          Interface + factory
│   │   │   ├── memory.ts
│   │   │   └── pg.ts
│   │   ├── monitoring/
│   │   │   ├── index.ts          Interface + factory
│   │   │   └── glitchtip.ts
│   │   ├── notifications/
│   │   │   ├── whatsapp.ts       Wati + Meta Cloud API fallback
│   │   │   ├── email.ts          Nodemailer + provider abstraction
│   │   │   └── sms.ts            MSG91 fallback
│   │   ├── payments/
│   │   │   ├── razorpay.ts       Orders, subscriptions, refunds
│   │   │   └── gst.ts            GST calculation and invoices
│   │   ├── maps/
│   │   │   ├── nominatim.ts      OpenStreetMap geocoding
│   │   │   └── routing.ts        OSRM route calculation
│   │   ├── translation/
│   │   │   ├── libretranslate.ts Auto-translation client
│   │   │   └── langdetect.ts     Detect source language
│   │   ├── supabase/
│   │   │   ├── client.ts         Browser client
│   │   │   ├── server.ts         Server client with cookies
│   │   │   └── admin.ts          Admin service role client
│   │   └── utils/
│   │       ├── currency.ts       formatINR(), paise conversions, fees
│   │       ├── dates.ts          IST-aware helpers
│   │       ├── crypto.ts         AES-256 for AI keys
│   │       ├── rateLimit.ts      PostgreSQL-based rate limiting
│   │       ├── seasonal.ts       Seasonal price multiplier logic
│   │       └── referral.ts       Referral code and credit logic
│   │
│   ├── components/
│   │   ├── ui/                   shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── Header.tsx        Language switcher + navigation
│   │   │   └── Footer.tsx
│   │   ├── booking/
│   │   │   ├── SearchBar.tsx     Destination and date search
│   │   │   ├── ListingCard.tsx   Listing preview card
│   │   │   ├── BookingForm.tsx   Booking details form
│   │   │   └── PaymentModal.tsx  Razorpay payment integration
│   │   ├── maps/
│   │   │   ├── ListingMap.tsx    OpenStreetMap listing location
│   │   │   └── DriverMap.tsx     Live driver tracking map
│   │   ├── ai/
│   │   │   ├── AIKeySetup.tsx    Connect your free AI account UI
│   │   │   ├── ItineraryBuilder.tsx
│   │   │   └── AIGatekeeper.tsx  Shows connect prompt if no key
│   │   ├── dashboard/
│   │   │   ├── AlertCard.tsx     Admin alert with action button
│   │   │   ├── MetricCard.tsx    Revenue/count display card
│   │   │   └── InsightCard.tsx   Human-readable insight text
│   │   └── common/
│   │       ├── ErrorDisplay.tsx  Human-readable error with fix steps
│   │       ├── LanguageSwitcher.tsx
│   │       ├── TrustBadges.tsx   Verified/KYC/Permit badges
│   │       └── OfflineIndicator.tsx
│   │
│   ├── hooks/
│   │   ├── useBooking.ts
│   │   ├── useLocation.ts        Browser geolocation with fallback
│   │   ├── useLanguage.ts
│   │   └── useOfflineSync.ts     IndexedDB sync when back online
│   │
│   └── types/
│       ├── database.ts           Drizzle-generated TypeScript types
│       ├── api.ts                Request and response types
│       └── i18n.ts               Language code types
│
├── tests/
│   ├── unit/                     Vitest unit tests
│   ├── integration/              Vitest + local Supabase
│   └── e2e/                      Playwright browser tests
│       ├── tourist-booking.spec.ts
│       ├── driver-onboarding.spec.ts
│       ├── subscription-lifecycle.spec.ts
│       ├── payment-failure.spec.ts
│       ├── language-switching.spec.ts
│       ├── offline-booking.spec.ts
│       ├── accessibility.spec.ts
│       └── destination-activation.spec.ts
│
├── scripts/
│   ├── generate-types.ts         Generate TypeScript types from database
│   ├── subset-fonts.sh           Create small Noto font subsets
│   └── check-translations.ts     Find missing translation keys
│
├── .env.example                  Every env variable, documented and grouped
├── next.config.js                Security headers, PWA, bundle settings
├── drizzle.config.ts             Database ORM configuration
├── playwright.config.ts          Test on Chrome, Firefox, Mobile Safari
├── vitest.config.ts              Coverage thresholds
├── tailwind.config.ts
├── tsconfig.json                 TypeScript strict mode
├── Dockerfile                    Multi-stage, Alpine, non-root, under 150MB
└── README.md                     Setup in 10 steps + error reference guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 15 — GENERATE ALL OF THESE FILES IN THIS EXACT ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate every file listed below completely.
No placeholder comments. No "TODO: implement this". No incomplete functions.
Every file must be ready to run in production without any editing.

01  supabase/migrations/001_init.sql
    All tables, all constraints, all indexes from Section 7

02  supabase/migrations/001_init_rollback.sql
    Safe complete rollback for everything in 001

03  supabase/migrations/002_rls_policies.sql
    Every Row Level Security policy for every table

04  supabase/migrations/003_pg_cron_jobs.sql
    All 12 scheduled automation jobs registered

05  supabase/migrations/004_seed_templates.sql
    All 64 WhatsApp templates (8 languages × 8 message types)

06  supabase/migrations/005_feature_flags_seed.sql
    All feature flags seeded with correct default values

07  src/lib/errors/AppError.ts
    Complete error class, all 35 error codes, all 8 languages each

08  src/lib/errors/notify.ts
    Admin email via Nodemailer, writes to error_logs table

09  src/lib/errors/autoFix.ts
    All auto-fix functions, one per autoFixable error code

10  src/lib/storage/index.ts
    Storage interface and factory function

11  src/lib/storage/supabase.ts
    Supabase Storage implementation

12  src/lib/storage/r2.ts
    Cloudflare R2 implementation

13  src/lib/storage/s3.ts
    AWS S3 implementation

14  src/lib/email/index.ts
    Email interface and factory function

15  src/lib/email/nodemailer.ts
    Gmail SMTP implementation

16  src/lib/email/templates/booking-confirmed.tsx
    React Email template with all booking details

17  src/lib/email/templates/gst-invoice.tsx
    GST-compliant invoice template and PDF generation

18  src/lib/email/templates/error-alert.tsx
    Admin error notification email with fix steps

19  src/lib/ai/bridge.ts
    BYOAI: key retrieval from Vault, fallback chain, rate limit check

20  src/lib/ai/providers/gemini.ts
    Google Gemini provider

21  src/lib/ai/providers/groq.ts
    Groq provider

22  src/lib/notifications/whatsapp.ts
    Wati.io + Meta Cloud API fallback + delivery tracking

23  src/lib/notifications/email.ts
    Email notification with template rendering

24  src/lib/notifications/sms.ts
    MSG91 SMS fallback implementation

25  src/lib/payments/razorpay.ts
    Subscriptions, orders, webhook verification, refunds

26  src/lib/payments/gst.ts
    GST calculation and invoice PDF generation

27  src/lib/maps/nominatim.ts
    OpenStreetMap geocoding with 1 req/second rate limiting

28  src/lib/maps/routing.ts
    OSRM route calculation client

29  src/lib/translation/libretranslate.ts
    Batch translation client for all 8 languages

30  src/lib/utils/currency.ts
    formatINR(), paise conversion, calculatePlatformFee(), applyGST()

31  src/lib/utils/seasonal.ts
    getCurrentMultiplier(), applySeasonalPricing()

32  src/lib/utils/rateLimit.ts
    PostgreSQL rate limiter, works on any hosting platform

33  src/lib/utils/referral.ts
    Code generation, conversion tracking, credit application

34  supabase/functions/handle-booking/index.ts
    Complete booking lifecycle automation

35  supabase/functions/send-notification/index.ts
    WhatsApp → email → SMS fallback chain

36  supabase/functions/handle-payment-webhook/index.ts
    All Razorpay events with signature verification

37  supabase/functions/handle-kyc/index.ts
    Digilocker + Parivahan + auto-approve logic

38  supabase/functions/auto-fix-errors/index.ts
    All self-healing error recovery functions

39  supabase/functions/decrypt-ai-key/index.ts
    Vault retrieval — only function that can access AI keys

40  supabase/functions/generate-translations/index.ts
    LibreTranslate batch translation for listing content

41  supabase/functions/activate-destination/index.ts
    Auto-setup when admin activates a new destination

42  src/app/api/health/route.ts
    Overall health check endpoint

43  src/app/api/health/db/route.ts
    Database connection health

44  src/app/api/health/payments/route.ts
    Razorpay API reachability check

45  src/app/api/health/whatsapp/route.ts
    Wati.io API reachability check

46  src/app/api/ai/route.ts
    Secure AI proxy — key never leaves server

47  src/app/api/ai/validate-key/route.ts
    Test and validate user's AI key before saving

48  src/app/api/webhooks/razorpay/route.ts
    Webhook entry point with signature verification

49  src/app/api/upload/route.ts
    Photo and document upload with security checks

50  src/app/(tourist)/page.tsx
    Homepage: search, featured destinations, trust signals, how it works

51  src/app/(tourist)/places/[slug]/page.tsx
    Destination page with listings, map, and SEO metadata

52  src/app/(tourist)/listings/[id]/page.tsx
    Listing detail: photos, map, reviews, booking call-to-action

53  src/app/(tourist)/book/[listingId]/page.tsx
    Complete booking flow with Razorpay UPI payment

54  src/app/(tourist)/my-trips/page.tsx
    Tourist dashboard with active bookings and history

55  src/app/(provider)/dashboard/page.tsx
    Provider dashboard with earnings, bookings, and insights

56  src/app/(provider)/listings/new/page.tsx
    New listing form with auto-translation of content

57  src/app/(admin)/dashboard/page.tsx
    Alert-driven admin view with all 4 severity levels

58  src/app/(admin)/destinations/page.tsx
    Add and activate destinations with one click

59  src/components/common/ErrorDisplay.tsx
    Human-readable error: title, plain message, numbered fix steps

60  src/components/ai/AIKeySetup.tsx
    Connect your free AI account UI with step-by-step guide

61  src/components/layout/Header.tsx
    Language switcher showing all 8 languages in their own script

62  src/components/maps/ListingMap.tsx
    OpenStreetMap listing location map

63  src/components/maps/DriverMap.tsx
    Live driver location tracking map

64  src/components/common/TrustBadges.tsx
    Aadhaar Verified, Permit Checked, KYC badge components

65  messages/en.json
    Complete English translations — minimum 500 keys covering every UI string

66  messages/ta.json
    100% Tamil translation of all Tier 1 keys

67  messages/hi.json
    90% Hindi translation

68  messages/te.json
    80% Telugu translation

69  messages/kn.json
    80% Kannada translation

70  messages/ml.json
    80% Malayalam translation

71  messages/mr.json
    60% Marathi translation

72  messages/or.json
    60% Odia translation

73  deploy/aws/Dockerfile
    Multi-stage, Alpine, non-root user, under 150MB, health check included

74  deploy/selfhosted/docker-compose.yml
    Full self-hosted stack: app + nginx + automatic HTTPS with certbot

75  deploy/selfhosted/Caddyfile
    Caddy configuration as easier HTTPS alternative

76  deploy/gcp/cloudrun.yaml
    Google Cloud Run service definition

77  deploy/railway/railway.json
    Railway deployment configuration

78  .github/workflows/deploy.yml
    Complete 9-step CI/CD pipeline

79  .github/workflows/backup.yml
    Weekly encrypted backup to Cloudflare R2

80  supabase/seed.ts
    Realistic Indian test data: 50 providers, 200 listings, 500 bookings
    All in Nilgiris region with authentic Tamil/Telugu/Kannada names
    Uses Faker.js with Indian locale settings

81  tests/e2e/tourist-booking.spec.ts
    Complete journey: search → book → pay → review

82  tests/e2e/driver-onboarding.spec.ts
    Complete journey: register → KYC → live → accept booking

83  tests/e2e/language-switching.spec.ts
    Switch all 8 languages, verify WhatsApp language matches

84  tests/e2e/offline-booking.spec.ts
    Disable network → fill → verify saved → restore → verify synced

85  tests/e2e/destination-activation.spec.ts
    Admin flips flag → verify SEO page → verify registration opens

86  tests/unit/currency.test.ts
    100% coverage of all currency functions with edge cases

87  tests/unit/appError.test.ts
    Every error code: message in each language, auto-fix behavior

88  tests/unit/seasonal.test.ts
    Every season combination for all destination types

89  .env.example
    Every environment variable
    Comment explaining what it is in plain English
    URL to sign up for the free tier of each service
    Which platform each variable applies to
    Whether it is required or optional
    Grouped by feature: Auth, Database, Payments, WhatsApp, AI, Maps, etc.

90  README.md
    Part 1: Set up in 10 numbered steps (Vercel + Supabase free tier)
    Part 2: Switch to a different hosting platform (5 steps each)
    Part 3: Error code reference table (code → plain English → how to fix)
    Part 4: How to add a new destination (admin guide, no coding needed)
    Part 5: How to activate a new language (5 steps)
    Part 6: How to restore from backup (step by step)
    Written so someone who has never written code can follow Parts 1, 3, 4, 6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 16 — ADMIN INTEGRATION HUB (NO HARDCODING, EVER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORE PRINCIPLE: Zero API keys, credentials, or configuration values are
ever hardcoded in the codebase or set during deployment. The application
ships with only three mandatory environment variables needed to boot:

  NEXT_PUBLIC_SUPABASE_URL      → Your Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY → Your Supabase public key
  SUPABASE_SERVICE_ROLE_KEY     → Your Supabase service key

These three are the only values needed to deploy. Everything else —
Razorpay, WhatsApp, email, maps, AI, SMS, translation, monitoring —
is configured by the admin through the UI after first login.
No developer, no terminal, no .env file editing ever again.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW IT WORKS — THE SETTINGS STORAGE SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TABLE: platform_settings
  All configuration stored in this single database table.
  Only the admin role can read or write to this table (RLS enforced).
  Sensitive values (API keys, passwords) encrypted with AES-256
  before saving. Encryption key is the SUPABASE_SERVICE_ROLE_KEY
  which never leaves the server.

  id              uuid, primary key
  category        text  (payments / whatsapp / email / sms / maps /
                         ai / translation / monitoring / storage /
                         verification / general)
  key             text  (unique setting name, e.g. 'razorpay_key_id')
  value           text  (stored encrypted for sensitive values)
  is_sensitive    bool  (true = encrypted, masked in UI with ***)
  is_configured   bool  (false until admin saves a real value)
  label           text  (human-readable name shown in UI)
  description     text  (plain English explanation of what this is)
  placeholder     text  (example value shown in input field)
  help_url        text  (link to where admin finds this value)
  last_updated_at timestamptz
  updated_by      uuid (FK to users)

SETTINGS HELPER (src/lib/settings/index.ts):
  getSetting(key): Promise<string | null>
    → Reads from platform_settings table
    → Decrypts if is_sensitive = true
    → Returns null if not configured yet
    → Cached in memory for 5 minutes (reduces DB calls)
    → Cache invalidated when admin saves new value

  setSetting(key, value): Promise<void>
    → Encrypts if is_sensitive = true
    → Saves to platform_settings table
    → Clears cache for that key immediately
    → Logs change to admin_activity_log table

  isConfigured(category): Promise<boolean>
    → Returns true only if all required keys in category are set
    → Used by Integration Hub to show green/red status per category

  getAllForCategory(category): Promise<Setting[]>
    → Returns all settings for one category
    → Sensitive values returned as '••••••••' in UI
    → Full values only decrypted server-side when actually used

EVERY SERVICE reads its config from getSetting(), never from process.env:

  // WRONG — never do this
  const key = process.env.RAZORPAY_KEY_ID

  // CORRECT — always do this
  const key = await getSetting('razorpay_key_id')
  if (!key) throw new AppError('ERR_INTEGRATION_NOT_CONFIGURED', ...)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIRST-TIME SETUP WIZARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When admin logs in for the very first time (no settings configured):
  → Automatically redirected to /admin/setup
  → Full-screen setup wizard, step by step
  → Cannot access rest of admin dashboard until Step 1 complete
  → Can skip optional steps and configure them later

WIZARD STEPS:

Step 1 — Welcome (required, cannot skip)
  → GoMiGo logo, welcome message
  → "Let's set up your platform in 5 minutes"
  → Shows what each step does in plain English
  → Single button: "Start Setup"

Step 2 — General Settings (required)
  Fields:
  → Platform name (pre-filled: GoMiGo, can change)
  → Admin email address (where all error alerts go)
  → Admin WhatsApp number (for critical alerts)
  → Support phone number (shown to users in error messages)
  → Support email (shown to users)
  → Default language (pre-selected: English)
  → Timezone (pre-selected: Asia/Kolkata)
  → Currency (pre-selected: INR)

Step 3 — Payments (required to go live)
  Heading: "Connect Razorpay to collect payments"
  Helper text: "Get these from razorpay.com → Settings → API Keys"
  Fields:
  → Razorpay Key ID (sensitive, masked after save)
  → Razorpay Key Secret (sensitive, masked after save)
  → Razorpay Webhook Secret (sensitive, masked after save)
  → Test button: "Verify Connection" → pings Razorpay API
  → Green tick appears when verified successfully
  → Platform commission % (default: 10, admin can change)
  → GST percentage (default: 18, admin can change)

Step 4 — WhatsApp (required to go live)
  Heading: "Connect WhatsApp to message users"
  Helper text: "Get these from wati.io → Account → API"
  Fields:
  → WhatsApp provider (dropdown: Wati.io / Meta Cloud API)
  → If Wati.io selected:
      Wati API Endpoint URL
      Wati API Token (sensitive)
  → If Meta Cloud API selected:
      Meta Phone Number ID
      Meta Access Token (sensitive)
      Meta Webhook Verify Token
  → Test button: sends a test WhatsApp to admin's number
  → Fallback provider toggle: enable second provider as backup

Step 5 — Email (required to go live)
  Heading: "Connect email for booking confirmations and invoices"
  Helper text: "Use your gomigo.app@gmail.com — get App Password from Google"
  Fields:
  → Email provider (dropdown: Gmail SMTP / Resend / SendGrid / Custom SMTP)
  → If Gmail SMTP:
      Gmail address
      Gmail App Password (sensitive) — link to how to get one
  → If Resend:
      Resend API Key (sensitive)
      Sender email address
  → If Custom SMTP:
      SMTP Host, Port, Username, Password (sensitive), Use TLS toggle
  → From name (default: GoMiGo)
  → Test button: sends a test email to admin's address

Step 6 — SMS Backup (optional, can skip)
  Heading: "SMS as backup when WhatsApp fails"
  Helper text: "Only used when WhatsApp delivery fails. Get from msg91.com"
  Fields:
  → SMS provider (dropdown: MSG91 / Twilio / Skip for now)
  → If MSG91:
      MSG91 Auth Key (sensitive)
      Sender ID (default: GOMIGO)
  → Skip button clearly visible

Step 7 — Maps (optional, has free default)
  Heading: "Maps for showing locations and routes"
  Helper text: "OpenStreetMap is free and works by default. No key needed."
  Fields:
  → Maps provider (dropdown: OpenStreetMap — Free / Google Maps)
  → OpenStreetMap is pre-selected (free, no key needed)
  → If admin chooses Google Maps:
      Google Maps API Key (sensitive)
      Warning shown: "Google Maps requires billing account"
  → Routing provider (OpenRouteService free / Self-hosted OSRM)
  → OpenRouteService API Key (optional, free tier has limits)

Step 8 — AI Features (optional, can skip)
  Heading: "AI features for itinerary building and suggestions"
  Helper text: "Your own free AI account — platform pays nothing"
  Fields:
  → Admin's AI provider (dropdown: Google Gemini / Groq / Skip)
  → If Gemini: Gemini API Key (sensitive) — link to aistudio.google.com
  → If Groq: Groq API Key (sensitive) — link to console.groq.com
  → Note shown: "Tourists connect their own AI keys in their settings"
  → Used for: admin moderation, listing suggestions, photo checking

Step 9 — Auto-Translation (optional, can skip)
  Heading: "Auto-translate listings to all 8 languages"
  Helper text: "LibreTranslate runs on your own free Oracle server"
  Fields:
  → Translation provider (dropdown: LibreTranslate / Skip)
  → LibreTranslate URL (your Oracle server address)
  → Test button: translates "Hello" to Tamil as a test
  → If skipped: listings only shown in language provider entered them

Step 10 — Storage (optional, uses Supabase by default)
  Heading: "Where photos and documents are stored"
  Helper text: "Supabase gives 1GB free. Upgrade only if you need more."
  Fields:
  → Storage provider (dropdown: Supabase Storage — Free / Cloudflare R2 / AWS S3)
  → Supabase pre-selected (already configured from boot)
  → If Cloudflare R2:
      R2 Account ID, R2 Access Key (sensitive), R2 Secret Key (sensitive)
      R2 Bucket Name
  → If AWS S3:
      AWS Access Key ID, AWS Secret (sensitive), Region, Bucket Name

Step 11 — Monitoring (optional, can skip)
  Heading: "Get notified when something breaks"
  Helper text: "Admin email alerts are always on. This adds extra monitoring."
  Fields:
  → Error monitoring (dropdown: Email only — Free / GlitchTip / Skip)
  → If GlitchTip:
      GlitchTip DSN URL
  → Uptime monitoring: Upptime automatically configured via GitHub
  → Analytics (dropdown: None / Umami)
  → If Umami:
      Umami URL (your Oracle server), Umami Website ID

Step 12 — Government APIs (optional, required for KYC automation)
  Heading: "Verify driver documents automatically"
  Helper text: "Without these, KYC goes to manual review. Apply now — takes 5-10 days."
  Fields:
  → Digilocker Client ID (sensitive) — link to developers.digilocker.gov.in
  → Digilocker Client Secret (sensitive)
  → Parivahan API Key (sensitive) — link to parivahan.gov.in
  → Note: "If not configured, admin manually reviews all KYC documents"
  → Apply now buttons with direct links to both portals

Step 13 — Setup Complete
  → Green checkmark animation
  → Summary: which integrations are live (green) and which are skipped (grey)
  → "Your GoMiGo platform is ready"
  → Single button: "Go to Admin Dashboard"
  → Skipped integrations shown as actionable cards: "Complete this later"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTEGRATION HUB — PERMANENT ADMIN PAGE (/admin/integrations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After setup, admin can always return to /admin/integrations to:
  → View all integrations and their live status
  → Update any API key at any time (rotate keys safely)
  → Test any integration with one click
  → Switch providers without touching code

INTEGRATION HUB LAYOUT:
  Each integration shown as a card with:
  → Integration name and logo
  → Status badge: Live (green) / Not Configured (grey) / Error (red)
  → Last tested date and result
  → "Configure" button → opens settings panel
  → "Test Connection" button → runs live API ping
  → "Rotate Key" button → lets admin update key safely

INTEGRATION CARDS (all 12):

  1. PAYMENTS — RAZORPAY
     Status: shows Live / Not Configured
     Fields: Key ID, Key Secret, Webhook Secret
     Test: creates ₹1 test order and cancels it immediately
     Shows: total payments collected this month

  2. WHATSAPP — WATI.IO / META CLOUD
     Status: shows Live / Not Configured / Quota Warning
     Fields: provider selection, API credentials
     Test: sends WhatsApp to admin's number saying "GoMiGo test message"
     Shows: messages used this month vs limit (e.g. 234 / 1000)

  3. EMAIL — GMAIL / RESEND / SENDGRID / SMTP
     Status: shows Live / Not Configured
     Fields: provider, credentials, from name
     Test: sends test email to admin's address
     Shows: emails sent this month

  4. SMS — MSG91 / TWILIO
     Status: shows Live / Not Configured / Skipped
     Fields: provider, API key, sender ID
     Test: sends SMS to admin's number
     Shows: SMS credits remaining

  5. MAPS — OPENSTREETMAP / GOOGLE MAPS
     Status: always shows Live (OpenStreetMap needs no key)
     Fields: provider, API key if Google Maps chosen
     Test: geocodes "Ooty, Tamil Nadu" and shows result
     Shows: current map provider in use

  6. AI — GEMINI / GROQ / OLLAMA
     Status: shows Live / Not Configured / Quota Warning
     Fields: provider, API key
     Test: sends "Say hello in Tamil" and shows response
     Shows: tokens used today vs daily limit

  7. AUTO-TRANSLATION — LIBRETRANSLATE
     Status: shows Live / Not Configured / Skipped
     Fields: LibreTranslate server URL
     Test: translates "Welcome to GoMiGo" to Tamil
     Shows: translations run this week

  8. FILE STORAGE — SUPABASE / R2 / S3
     Status: shows Live (Supabase always configured)
     Fields: provider, credentials if switching
     Test: uploads a 1KB test file and deletes it
     Shows: storage used vs limit (e.g. 234 MB / 1000 MB)
     Warning shown at 900 MB with upgrade prompt

  9. ERROR MONITORING — GLITCHTIP / EMAIL
     Status: shows Live / Email Only
     Fields: GlitchTip DSN URL
     Test: sends a test error event
     Shows: errors captured in last 24 hours

  10. ANALYTICS — UMAMI
      Status: shows Live / Not Configured / Skipped
      Fields: Umami URL, Website ID
      Test: pings Umami to confirm connection
      Shows: visitors today (pulled from Umami API)

  11. AADHAAR VERIFICATION — DIGILOCKER
      Status: shows Live / Not Configured / Pending Approval
      Fields: Client ID, Client Secret
      Test: runs API health check (no real Aadhaar used)
      Shows: verifications completed this month
      Note if not configured: "KYC goes to manual review queue"

  12. VEHICLE VERIFICATION — PARIVAHAN
      Status: shows Live / Not Configured / Pending Approval
      Fields: API Key
      Test: runs API health check
      Shows: verifications completed this month
      Note if not configured: "Vehicle permits checked manually"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLATFORM SETTINGS PAGE (/admin/settings)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Separate from integrations. These are business rules, not API keys.
Admin can change any of these without touching code or redeploying.

GENERAL TAB:
  Platform name, tagline, support email, support phone
  Logo upload (replaces GoMiGo text with image)
  Favicon upload
  Primary color (hex code — changes accent color sitewide)
  Default language (affects new visitor default)
  Maintenance mode toggle (shows maintenance page to all users)

BOOKING RULES TAB:
  Platform commission % per booking type (cab, auto, hotel, tour)
  Minimum booking amount (₹ — prevent ₹1 test bookings)
  Maximum advance booking days (default: 90)
  Cancellation window hours (default: 2 hours)
  Auto-cancel if driver not assigned within X minutes (default: 30)
  Cash booking allowed toggle
  Instant booking discount % (default: 2%)

SUBSCRIPTION RULES TAB:
  Trial period days per provider type (default: 60)
  Subscription prices per plan (all editable without code change)
  Trial warning days (when to send day 45, 55, 59 messages)
  Grace period after expiry (days before suspension, default: 3)
  Churned after days (default: 14 after expiry)

TRUST AND MODERATION TAB:
  Auto-approve KYC toggle (on = auto, off = always manual review)
  Photo moderation threshold (0.0 to 1.0, default: 0.8)
  Minimum photos required per listing (default: 3)
  Review window days (days after trip to allow review, default: 7)
  Minimum reviews before reputation score shown (default: 3)
  Auto-suspend after X cancellations (default: 3 in 30 days)

SEASONAL PRICING TAB:
  Visual calendar showing all destinations
  Admin sets multiplier per month per destination
  Changes apply automatically next time pg_cron runs

NOTIFICATION RULES TAB:
  Toggle each notification on or off (without code change):
  → Booking confirmed WhatsApp
  → Driver assigned WhatsApp
  → Pickup reminder (30 min before)
  → Review request (2 hours after trip)
  → Trial warning messages
  → Payment failure messages
  → Each toggle shows estimated WhatsApp messages/month saved

LANGUAGES TAB:
  All 8 languages shown with toggle switch and coverage %
  Admin flips toggle to enable language for users
  Shows: X of Y translation keys complete
  Button: Download missing translations as CSV
  Button: Upload completed translations CSV

DESTINATIONS TAB:
  List of all destinations with is_active toggle
  Add new destination button (name, sub-areas, cover photo, description)
  Edit seasonal rules per destination
  When toggled live: SEO page generates automatically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRACEFUL DEGRADATION WHEN INTEGRATION NOT CONFIGURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every service checks its own config before running.
If not configured: it degrades gracefully and tells admin what to do.
It never crashes the application.

  Razorpay not configured:
    → Booking form shows "Cash only available — online payment coming soon"
    → Admin dashboard shows orange banner: "Configure Razorpay to accept payments"

  WhatsApp not configured:
    → All WhatsApp notifications sent as email instead
    → Admin dashboard shows: "WhatsApp not connected — users receiving email only"

  Email not configured:
    → All notifications logged to notifications table only
    → Admin dashboard shows red banner: "Configure email — users not receiving notifications"

  Digilocker not configured:
    → KYC goes to manual review queue automatically
    → Admin dashboard shows: "KYC is manual — configure Digilocker to automate"

  Parivahan not configured:
    → Vehicle permit check goes to manual review
    → Admin dashboard shows the pending manual review count

  AI not configured:
    → AI features hidden from all users
    → No error shown to users — features simply not displayed
    → Admin can configure later and features appear automatically

  Translation not configured:
    → Listings shown in whatever language provider entered them
    → Other language columns remain empty (fall back to English)

  Storage not configured:
    → Supabase Storage used as default (always available)
    → No degradation needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN ACTIVITY LOG (/admin/activity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every change made through the Integration Hub or Settings is logged:
  who changed it (admin user ID)
  what was changed (setting key, NOT the value for sensitive keys)
  when it was changed
  what the previous state was (configured / not configured — not the actual key)

This gives admin full history of when each integration was set up or changed.

TABLE: admin_activity_log
  id, admin_user_id, action_type, entity_type, entity_id,
  description (plain English: "Razorpay Key ID updated"),
  ip_address, created_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW ERROR CODES FOR INTEGRATION SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these to the AppError system in Section 5:

  ERR_INTEGRATION_NOT_CONFIGURED
    User message: "This feature is not available yet"
    Admin message: "Integration [name] not configured in admin Integration Hub"
    Fix steps for admin:
      1. Go to Admin Dashboard
      2. Click Integrations in the left menu
      3. Find [integration name] and click Configure
      4. Enter your API key and click Save
      5. Click Test Connection to verify it works

  ERR_INTEGRATION_KEY_INVALID
    User message: "A system configuration error occurred. Admin notified."
    Admin message: "API key for [integration] is invalid or expired"
    Fix steps for admin:
      1. Go to Admin → Integrations → [integration name]
      2. Click Rotate Key
      3. Enter your new API key from [provider URL]
      4. Click Save and Test

  ERR_INTEGRATION_QUOTA_EXCEEDED
    User message: "Service temporarily unavailable. Try again tomorrow."
    Admin message: "[integration] free tier quota exceeded for today"
    Fix steps for admin:
      1. Go to Admin → Integrations → [integration name]
      2. Check your usage vs limit shown
      3. Either upgrade the plan at [provider URL]
         or wait until quota resets tomorrow

  ERR_SETTINGS_SAVE_FAILED
    User message: "Settings could not be saved. Try again."
    Admin message: "Failed to save setting [key] to platform_settings table"
    Auto-fix: retry save 3 times with exponential backoff

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES TO GENERATE FOR INTEGRATION HUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these to the output file list in Section 15:

91  supabase/migrations/006_platform_settings.sql
    platform_settings table, admin_activity_log table,
    RLS policies (admin only), seed with all setting definitions
    (labels, descriptions, placeholders, help URLs — but no values)

92  supabase/migrations/006_platform_settings_rollback.sql

93  src/lib/settings/index.ts
    getSetting(), setSetting(), isConfigured(), getAllForCategory()
    In-memory cache with 5-minute TTL
    AES-256 encryption for sensitive values

94  src/app/(admin)/setup/page.tsx
    Full 13-step first-time setup wizard
    Progress bar showing current step
    Skip buttons on optional steps
    Cannot proceed to dashboard until Step 2 and 3 complete

95  src/app/(admin)/setup/steps/
    step-1-welcome.tsx
    step-2-general.tsx
    step-3-payments.tsx
    step-4-whatsapp.tsx
    step-5-email.tsx
    step-6-sms.tsx
    step-7-maps.tsx
    step-8-ai.tsx
    step-9-translation.tsx
    step-10-storage.tsx
    step-11-monitoring.tsx
    step-12-government-apis.tsx
    step-13-complete.tsx

96  src/app/(admin)/integrations/page.tsx
    Integration Hub: all 12 integration cards
    Status badges, test buttons, configure buttons
    Usage meters for quota-limited services

97  src/app/(admin)/integrations/[slug]/page.tsx
    Individual integration configuration page
    Fields specific to that integration
    Test connection button with live result
    Rotate key workflow

98  src/app/(admin)/settings/page.tsx
    Platform settings with 7 tabs:
    General, Booking Rules, Subscription Rules,
    Trust and Moderation, Seasonal Pricing,
    Notification Rules, Languages, Destinations

99  src/app/api/admin/settings/route.ts
    GET: returns settings for a category (sensitive values masked)
    POST: saves new setting value (encrypts if sensitive)
    Validates admin role before any operation

100 src/app/api/admin/integrations/test/route.ts
    Tests any integration by name
    Returns: success bool, latency ms, message
    Runs actual API call (not mock) with read-only operation

101 src/components/admin/IntegrationCard.tsx
    Reusable card for each integration in the hub
    Status badge, usage meter, test button, configure button

102 src/components/admin/SettingField.tsx
    Reusable form field for settings
    Auto-masks sensitive fields after save
    Shows help URL as "Where to find this" link
    Validates format before saving (e.g. URL format, key prefix)

103 src/components/admin/SetupWizard.tsx
    Wrapper for the 13-step wizard
    Progress bar, step navigation, skip logic

104 src/middleware.ts
    Checks if setup is complete on every admin route
    If platform_settings has no values yet: redirect to /admin/setup
    If setup complete: allow through to requested admin page
FINAL RULES — THESE CANNOT BE CHANGED OR IGNORED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.  DESTINATIONS ARE DATA, NEVER CODE.
    Nilgiris is the first row in the destinations table.
    Coorg, Kodaikanal, Himachal Pradesh are future rows added via admin.
    Zero code changes ever needed to add a new destination.

2.  ZERO INFRASTRUCTURE COST.
    Only Razorpay's percentage on successful transactions is ever paid.
    Supabase storage upgrade (₹500/month) only if 90% of 1GB is used.
    No other paid services. No exceptions.

3.  AI COSTS ZERO TO THE PLATFORM.
    Users bring their own free AI key. Platform is a secure bridge only.
    Every AI feature degrades gracefully if no key is connected.

4.  EVERY ERROR IS HUMAN-READABLE.
    Plain language. Numbered fix steps. In all 8 languages.
    Admin gets email for every production error immediately.
    System tries to fix itself automatically where possible.

5.  ZERO PROTOTYPE CODE.
    Every function complete. Every file production-ready.
    No TODO. No placeholder. No incomplete logic.

6.  ALL TEXT IN 8 LANGUAGES WITH ENGLISH AS DEFAULT.
    English always loads first. User switches manually.
    All dates in IST. All amounts in INR displayed, paise stored.

7.  DEPLOY ANYWHERE WITH ZERO CODE CHANGES.
    Only environment variables change between hosting providers.
    All 6 abstraction layers enforced throughout the codebase.

8.  CODE MUST PASS ALL CHECKS BEFORE PRODUCTION.
    TypeScript strict mode: zero errors
    ESLint: zero warnings
    Vitest coverage: 80% minimum
    All Playwright tests: must pass
    Accessibility checks: zero WCAG violations

9.  EVERY DATABASE CHANGE HAS A ROLLBACK FILE.
    Zero-downtime migrations only.
    Rollback tested in CI before any production deploy.

10. ONE ADMIN RUNS THE ENTIRE BUSINESS FOREVER.
    All daily operations automated end to end.
    Admin dashboard shows only decisions needing a human.
    Admin can add new destinations and languages with zero coding.

11. OPENSTREETMAP EVERYWHERE.
    No Google Maps. No billing account required for maps.

12. DATA STAYS IN INDIA.
    Supabase Mumbai region (ap-south-1) always.
    DPDP Act 2023 compliant from day one.

════════════════════════════════════════════════════════════════════════════════
END OF PROMPT — PASTE THIS ENTIRE DOCUMENT INTO CLAUDE CODE
════════════════════════════════════════════════════════════════════════════════
