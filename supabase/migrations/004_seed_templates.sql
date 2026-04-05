-- ============================================================
-- Migration: 004_seed_templates.sql
-- Seeds WhatsApp notification templates for all 8 template types
-- across all 8 GoMiGo languages (en, ta, te, kn, ml, hi, mr, or).
-- Total: 64 rows (8 types × 8 languages)
-- ============================================================

BEGIN;

INSERT INTO notification_templates
  (id, template_name, language_code, channel, message_body, variables, is_active, created_at, updated_at)
VALUES

-- ============================================================
-- 1. booking_confirmation  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'booking_confirmation', 'en', 'whatsapp',
E'✅ Booking Confirmed!\n\nHi {{tourist_name}},\nYour GoMiGo booking is confirmed.\n\n📋 Ref: {{booking_ref}}\n🚗 Service: {{service_name}}\n📅 Date: {{service_date}}\n💰 Amount: ₹{{amount}}\n\nProvider: {{provider_name}}\nContact: {{provider_phone}}\n\nHave a wonderful trip! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'booking_confirmation', 'ta', 'whatsapp',
E'✅ பதிவு உறுதிப்படுத்தப்பட்டது!\n\nவணக்கம் {{tourist_name}},\nஉங்கள் GoMiGo பதிவு உறுதிப்படுத்தப்பட்டது.\n\n📋 பதிவு எண்: {{booking_ref}}\n🚗 சேவை: {{service_name}}\n📅 தேதி: {{service_date}}\n💰 தொகை: ₹{{amount}}\n\nசேவையாளர்: {{provider_name}}\nதொடர்பு: {{provider_phone}}\n\nமகிழ்ச்சியான பயணம்! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'booking_confirmation', 'te', 'whatsapp',
E'✅ బుకింగ్ నిర్ధారించబడింది!\n\nహాయ్ {{tourist_name}},\nమీ GoMiGo బుకింగ్ నిర్ధారించబడింది.\n\n📋 రెఫ్: {{booking_ref}}\n🚗 సేవ: {{service_name}}\n📅 తేదీ: {{service_date}}\n💰 మొత్తం: ₹{{amount}}\n\nసేవా ప్రదాత: {{provider_name}}\nసంప్రదింపు: {{provider_phone}}\n\nమంచి ప్రయాణం! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'booking_confirmation', 'kn', 'whatsapp',
E'✅ ಬುಕಿಂಗ್ ದೃಢಪಡಿಸಲಾಗಿದೆ!\n\nನಮಸ್ಕಾರ {{tourist_name}},\nನಿಮ್ಮ GoMiGo ಬುಕಿಂಗ್ ದೃಢಪಡಿಸಲಾಗಿದೆ.\n\n📋 ರೆಫ್: {{booking_ref}}\n🚗 ಸೇವೆ: {{service_name}}\n📅 ದಿನಾಂಕ: {{service_date}}\n💰 ಮೊತ್ತ: ₹{{amount}}\n\nಸೇವಾ ಪೂರೈಕೆದಾರ: {{provider_name}}\nಸಂಪರ್ಕ: {{provider_phone}}\n\nಶುಭ ಪ್ರಯಾಣ! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'booking_confirmation', 'ml', 'whatsapp',
E'✅ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു!\n\nഹലോ {{tourist_name}},\nനിങ്ങളുടെ GoMiGo ബുക്കിംഗ് സ്ഥിരീകരിച്ചു.\n\n📋 റഫ്: {{booking_ref}}\n🚗 സേവനം: {{service_name}}\n📅 തീയതി: {{service_date}}\n💰 തുക: ₹{{amount}}\n\nദാതാവ്: {{provider_name}}\nബന്ധപ്പെടാൻ: {{provider_phone}}\n\nസുഖകരമായ യാത്ര! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'booking_confirmation', 'hi', 'whatsapp',
E'✅ बुकिंग की पुष्टि हो गई!\n\nनमस्ते {{tourist_name}},\nआपकी GoMiGo बुकिंग की पुष्टि हो गई है।\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n💰 राशि: ₹{{amount}}\n\nसेवा प्रदाता: {{provider_name}}\nसंपर्क: {{provider_phone}}\n\nशुभ यात्रा! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'booking_confirmation', 'mr', 'whatsapp',
E'✅ बुकिंग निश्चित झाली!\n\nनमस्कार {{tourist_name}},\nतुमची GoMiGo बुकिंग निश्चित झाली आहे.\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n💰 रक्कम: ₹{{amount}}\n\nसेवा देणारा: {{provider_name}}\nसंपर्क: {{provider_phone}}\n\nशुभ प्रवास! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'booking_confirmation', 'or', 'whatsapp',
E'✅ ବୁକିଂ ନିଶ୍ଚିତ ହୋଇଛି!\n\nନମସ୍କାର {{tourist_name}},\nଆପଣଙ୍କ GoMiGo ବୁକିଂ ନିଶ୍ଚିତ ହୋଇଛି।\n\n📋 ରେଫ: {{booking_ref}}\n🚗 ସେବା: {{service_name}}\n📅 ତାରିଖ: {{service_date}}\n💰 ପରିମାଣ: ₹{{amount}}\n\nସେବା ପ୍ରଦାନକାରୀ: {{provider_name}}\nଯୋଗାଯୋଗ: {{provider_phone}}\n\nଶୁଭ ଯାତ୍ରା! 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','amount','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 2. driver_assigned  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'driver_assigned', 'en', 'whatsapp',
E'🚗 Driver Assigned!\n\nHi {{tourist_name}},\nYour driver has been assigned for booking {{booking_ref}}.\n\nDriver: {{driver_name}}\nVehicle: {{vehicle_details}}\nContact: {{driver_phone}}\n\nYour pickup is on {{service_date}}. Safe travels! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'driver_assigned', 'ta', 'whatsapp',
E'🚗 டிரைவர் நியமிக்கப்பட்டார்!\n\nவணக்கம் {{tourist_name}},\nஉங்கள் பதிவு {{booking_ref}} க்கு டிரைவர் நியமிக்கப்பட்டார்.\n\nடிரைவர்: {{driver_name}}\nவாகனம்: {{vehicle_details}}\nதொடர்பு: {{driver_phone}}\n\nஉங்கள் பிக்கப் {{service_date}} அன்று உள்ளது. பாதுகாப்பான பயணம்! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'driver_assigned', 'te', 'whatsapp',
E'🚗 డ్రైవర్ నియమించబడ్డారు!\n\nహాయ్ {{tourist_name}},\nమీ బుకింగ్ {{booking_ref}} కు డ్రైవర్ నియమించబడ్డారు.\n\nడ్రైవర్: {{driver_name}}\nవాహనం: {{vehicle_details}}\nసంప్రదింపు: {{driver_phone}}\n\nమీ పికప్ {{service_date}}న ఉంది. సురక్షితమైన ప్రయాణం! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'driver_assigned', 'kn', 'whatsapp',
E'🚗 ಚಾಲಕ ನಿಯೋಜಿಸಲಾಗಿದೆ!\n\nನಮಸ್ಕಾರ {{tourist_name}},\nನಿಮ್ಮ ಬುಕಿಂಗ್ {{booking_ref}} ಗೆ ಚಾಲಕ ನಿಯೋಜಿಸಲಾಗಿದೆ.\n\nಚಾಲಕ: {{driver_name}}\nವಾಹನ: {{vehicle_details}}\nಸಂಪರ್ಕ: {{driver_phone}}\n\nನಿಮ್ಮ ಪಿಕಪ್ {{service_date}} ರಂದು ಇದೆ. ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'driver_assigned', 'ml', 'whatsapp',
E'🚗 ഡ്രൈവർ നിയോഗിക്കപ്പെട്ടു!\n\nഹലോ {{tourist_name}},\nനിങ്ങളുടെ ബുക്കിംഗ് {{booking_ref}} ലേക്ക് ഡ്രൈവർ നിയോഗിക്കപ്പെട്ടു.\n\nഡ്രൈവർ: {{driver_name}}\nവാഹനം: {{vehicle_details}}\nബന്ധപ്പെടാൻ: {{driver_phone}}\n\nനിങ്ങളുടെ പിക്കപ്പ് {{service_date}} ന് ആണ്. സുരക്ഷിത യാത്ര! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'driver_assigned', 'hi', 'whatsapp',
E'🚗 ड्राइवर नियुक्त किया गया!\n\nनमस्ते {{tourist_name}},\nआपकी बुकिंग {{booking_ref}} के लिए ड्राइवर नियुक्त हो गया है।\n\nड्राइवर: {{driver_name}}\nगाड़ी: {{vehicle_details}}\nसंपर्क: {{driver_phone}}\n\nआपका पिकअप {{service_date}} को है। सुरक्षित सफ़र! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'driver_assigned', 'mr', 'whatsapp',
E'🚗 चालक नियुक्त झाला!\n\nनमस्कार {{tourist_name}},\nतुमच्या बुकिंग {{booking_ref}} साठी चालक नियुक्त झाला आहे.\n\nचालक: {{driver_name}}\nगाडी: {{vehicle_details}}\nसंपर्क: {{driver_phone}}\n\nतुमचा पिकअप {{service_date}} रोजी आहे. सुरक्षित प्रवास! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'driver_assigned', 'or', 'whatsapp',
E'🚗 ଚାଳକ ନିଯୁକ୍ତ ହୋଇଛନ୍ତି!\n\nନମସ୍କାର {{tourist_name}},\nଆପଣଙ୍କ ବୁକିଂ {{booking_ref}} ପାଇଁ ଚାଳକ ନିଯୁକ୍ତ ହୋଇଛନ୍ତି।\n\nଚାଳକ: {{driver_name}}\nଯାନ: {{vehicle_details}}\nଯୋଗାଯୋଗ: {{driver_phone}}\n\nଆପଣଙ୍କ ପିକଅପ୍ {{service_date}} ରେ ଅଛି। ସୁରକ୍ଷିତ ଯାତ୍ରା! 🌿',
ARRAY['tourist_name','booking_ref','driver_name','vehicle_details','driver_phone','service_date'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 3. otp_login  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'otp_login', 'en', 'whatsapp',
E'🔐 Your GoMiGo OTP\n\nYour one-time password is: *{{otp_code}}*\n\nValid for {{otp_expiry_minutes}} minutes.\n\n⚠️ Never share this OTP with anyone. GoMiGo will never ask for it.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'otp_login', 'ta', 'whatsapp',
E'🔐 உங்கள் GoMiGo OTP\n\nஉங்கள் ஒருமுறை கடவுச்சொல்: *{{otp_code}}*\n\n{{otp_expiry_minutes}} நிமிடங்களுக்கு செல்லுபடியாகும்.\n\n⚠️ இந்த OTP யை யாரிடமும் பகிர வேண்டாம். GoMiGo ஒருபோதும் இதை கேட்காது.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'otp_login', 'te', 'whatsapp',
E'🔐 మీ GoMiGo OTP\n\nమీ వన్-టైమ్ పాస్‌వర్డ్: *{{otp_code}}*\n\n{{otp_expiry_minutes}} నిమిషాలు చెల్లుతుంది.\n\n⚠️ ఈ OTP ని ఎవరితోనూ పంచుకోకండి. GoMiGo దీనిని ఎప్పుడూ అడగదు.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'otp_login', 'kn', 'whatsapp',
E'🔐 ನಿಮ್ಮ GoMiGo OTP\n\nನಿಮ್ಮ ಒಂದು-ಬಾರಿ ಪಾಸ್‌ವರ್ಡ್: *{{otp_code}}*\n\n{{otp_expiry_minutes}} ನಿಮಿಷಗಳ ಕಾಲ ಮಾನ್ಯ.\n\n⚠️ ಈ OTP ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. GoMiGo ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'otp_login', 'ml', 'whatsapp',
E'🔐 നിങ്ങളുടെ GoMiGo OTP\n\nനിങ്ങളുടെ ഒറ്റത്തവണ പാസ്‌വേഡ്: *{{otp_code}}*\n\n{{otp_expiry_minutes}} മിനിറ്റ് സാധുവാണ്.\n\n⚠️ ഈ OTP ആരോടും പങ്കുവെക്കരുത്. GoMiGo ഒരിക്കലും ഇത് ചോദിക്കില്ല.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'otp_login', 'hi', 'whatsapp',
E'🔐 आपका GoMiGo OTP\n\nआपका एक-बार का पासवर्ड: *{{otp_code}}*\n\n{{otp_expiry_minutes}} मिनट के लिए वैध है।\n\n⚠️ यह OTP किसी के साथ साझा न करें। GoMiGo कभी नहीं मांगेगा।',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'otp_login', 'mr', 'whatsapp',
E'🔐 तुमचा GoMiGo OTP\n\nतुमचा एकवेळ पासवर्ड: *{{otp_code}}*\n\n{{otp_expiry_minutes}} मिनिटांसाठी वैध आहे.\n\n⚠️ हा OTP कोणाशीही शेअर करू नका. GoMiGo कधीही विचारत नाही.',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'otp_login', 'or', 'whatsapp',
E'🔐 ଆପଣଙ୍କ GoMiGo OTP\n\nଆପଣଙ୍କ ଏକ-ଥର ପାସୱାର୍ଡ: *{{otp_code}}*\n\n{{otp_expiry_minutes}} ମିନିଟ ପାଇଁ ବୈଧ।\n\n⚠️ ଏହି OTP କାହାସହ ଶେୟାର କରନ୍ତୁ ନାହିଁ। GoMiGo କେବେ ଏହା ଚାହେଁ ନାହିଁ।',
ARRAY['otp_code','otp_expiry_minutes'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 4. booking_reminder_24h  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'booking_reminder_24h', 'en', 'whatsapp',
E'⏰ Trip Reminder — Tomorrow!\n\nHi {{tourist_name}},\nJust a reminder — your trip is tomorrow!\n\n📋 Ref: {{booking_ref}}\n🚗 Service: {{service_name}}\n📅 Date: {{service_date}}\n🕐 Time: {{service_time}}\n\nProvider: {{provider_name}}\nContact: {{provider_phone}}\n\nNeed to change? Reply to this message.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'booking_reminder_24h', 'ta', 'whatsapp',
E'⏰ பயண நினைவூட்டல் — நாளை!\n\nவணக்கம் {{tourist_name}},\nஒரு நினைவூட்டல் — உங்கள் பயணம் நாளை!\n\n📋 பதிவு எண்: {{booking_ref}}\n🚗 சேவை: {{service_name}}\n📅 தேதி: {{service_date}}\n🕐 நேரம்: {{service_time}}\n\nசேவையாளர்: {{provider_name}}\nதொடர்பு: {{provider_phone}}\n\nமாற்றம் தேவையா? இந்த செய்திக்கு பதிலளிக்கவும்.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'booking_reminder_24h', 'te', 'whatsapp',
E'⏰ ట్రిప్ రిమైండర్ — రేపు!\n\nహాయ్ {{tourist_name}},\nఒక రిమైండర్ — మీ ప్రయాణం రేపు!\n\n📋 రెఫ్: {{booking_ref}}\n🚗 సేవ: {{service_name}}\n📅 తేదీ: {{service_date}}\n🕐 సమయం: {{service_time}}\n\nసేవా ప్రదాత: {{provider_name}}\nసంప్రదింపు: {{provider_phone}}\n\nమార్పు కావాలా? ఈ సందేశానికి రిప్లై చేయండి.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'booking_reminder_24h', 'kn', 'whatsapp',
E'⏰ ಪ್ರಯಾಣ ನೆನಪೋಲೆ — ನಾಳೆ!\n\nನಮಸ್ಕಾರ {{tourist_name}},\nನಿಮ್ಮ ಪ್ರಯಾಣ ನಾಳೆ ಇದೆ ಎಂಬ ನೆನಪೋಲೆ!\n\n📋 ರೆಫ್: {{booking_ref}}\n🚗 ಸೇವೆ: {{service_name}}\n📅 ದಿನಾಂಕ: {{service_date}}\n🕐 ಸಮಯ: {{service_time}}\n\nಸೇವಾ ಪೂರೈಕೆದಾರ: {{provider_name}}\nಸಂಪರ್ಕ: {{provider_phone}}\n\nಬದಲಾವಣೆ ಬೇಕಾದರೆ ಈ ಸಂದೇಶಕ್ಕೆ ಉತ್ತರಿಸಿ.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'booking_reminder_24h', 'ml', 'whatsapp',
E'⏰ യാത്രാ ഓർമ്മപ്പെടുത്തൽ — നാളെ!\n\nഹലോ {{tourist_name}},\nഒരു ഓർമ്മപ്പെടുത്തൽ — നിങ്ങളുടെ യാത്ര നാളെ!\n\n📋 റഫ്: {{booking_ref}}\n🚗 സേവനം: {{service_name}}\n📅 തീയതി: {{service_date}}\n🕐 സമയം: {{service_time}}\n\nദാതാവ്: {{provider_name}}\nബന്ധപ്പെടാൻ: {{provider_phone}}\n\nമാറ്റം വേണോ? ഈ സന്ദേശത്തിന് മറുപടി നൽകൂ.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'booking_reminder_24h', 'hi', 'whatsapp',
E'⏰ यात्रा रिमाइंडर — कल!\n\nनमस्ते {{tourist_name}},\nएक याद दिलाना — आपकी यात्रा कल है!\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n🕐 समय: {{service_time}}\n\nसेवा प्रदाता: {{provider_name}}\nसंपर्क: {{provider_phone}}\n\nबदलाव चाहिए? इस संदेश का जवाब दें।',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'booking_reminder_24h', 'mr', 'whatsapp',
E'⏰ प्रवास आठवण — उद्या!\n\nनमस्कार {{tourist_name}},\nएक आठवण — तुमचा प्रवास उद्या आहे!\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n🕐 वेळ: {{service_time}}\n\nसेवा देणारा: {{provider_name}}\nसंपर्क: {{provider_phone}}\n\nबदल हवा? या संदेशाला उत्तर द्या.',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'booking_reminder_24h', 'or', 'whatsapp',
E'⏰ ଯାତ୍ରା ମନେ ରଖିବା — ଆସନ୍ତାକାଲ!\n\nନମସ୍କାର {{tourist_name}},\nଏକ ମନେ ରଖିବା — ଆପଣଙ୍କ ଯାତ୍ରା ଆସନ୍ତାକାଲ!\n\n📋 ରେଫ: {{booking_ref}}\n🚗 ସେବା: {{service_name}}\n📅 ତାରିଖ: {{service_date}}\n🕐 ସମୟ: {{service_time}}\n\nସେବା ପ୍ରଦାନକାରୀ: {{provider_name}}\nଯୋଗାଯୋଗ: {{provider_phone}}\n\nପରିବର୍ତ୍ତନ ଦରକାର? ଏହି ବାର୍ତ୍ତାକୁ ଉତ୍ତର ଦିଅନ୍ତୁ।',
ARRAY['tourist_name','booking_ref','service_name','service_date','service_time','provider_name','provider_phone'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 5. booking_cancelled  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'booking_cancelled', 'en', 'whatsapp',
E'❌ Booking Cancelled\n\nHi {{tourist_name}},\nYour booking has been cancelled.\n\n📋 Ref: {{booking_ref}}\n🚗 Service: {{service_name}}\n📅 Date: {{service_date}}\n\nReason: {{cancellation_reason}}\n\n💰 Refund of ₹{{refund_amount}} will be processed within {{refund_days}} days.\n\nBook again at gomigo.in 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'booking_cancelled', 'ta', 'whatsapp',
E'❌ பதிவு ரத்து செய்யப்பட்டது\n\nவணக்கம் {{tourist_name}},\nஉங்கள் பதிவு ரத்து செய்யப்பட்டது.\n\n📋 பதிவு எண்: {{booking_ref}}\n🚗 சேவை: {{service_name}}\n📅 தேதி: {{service_date}}\n\nகாரணம்: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} திரும்பப் பெறல் {{refund_days}} நாட்களுக்குள் செயல்படுத்தப்படும்.\n\nமீண்டும் பதிவு செய்ய gomigo.in 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'booking_cancelled', 'te', 'whatsapp',
E'❌ బుకింగ్ రద్దు చేయబడింది\n\nహాయ్ {{tourist_name}},\nమీ బుకింగ్ రద్దు చేయబడింది.\n\n📋 రెఫ్: {{booking_ref}}\n🚗 సేవ: {{service_name}}\n📅 తేదీ: {{service_date}}\n\nకారణం: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} రిఫండ్ {{refund_days}} రోజులలో ప్రాసెస్ అవుతుంది.\n\nమళ్ళీ బుక్ చేయడానికి gomigo.in 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'booking_cancelled', 'kn', 'whatsapp',
E'❌ ಬುಕಿಂಗ್ ರದ್ದುಗೊಂಡಿದೆ\n\nನಮಸ್ಕಾರ {{tourist_name}},\nನಿಮ್ಮ ಬುಕಿಂಗ್ ರದ್ದುಗೊಂಡಿದೆ.\n\n📋 ರೆಫ್: {{booking_ref}}\n🚗 ಸೇವೆ: {{service_name}}\n📅 ದಿನಾಂಕ: {{service_date}}\n\nಕಾರಣ: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} ರಿಫಂಡ್ {{refund_days}} ದಿನಗಳಲ್ಲಿ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತದೆ.\n\nಮತ್ತೆ ಬುಕ್ ಮಾಡಲು gomigo.in 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'booking_cancelled', 'ml', 'whatsapp',
E'❌ ബുക്കിംഗ് റദ്ദാക്കി\n\nഹലോ {{tourist_name}},\nനിങ്ങളുടെ ബുക്കിംഗ് റദ്ദാക്കി.\n\n📋 റഫ്: {{booking_ref}}\n🚗 സേവനം: {{service_name}}\n📅 തീയതി: {{service_date}}\n\nകാരണം: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} റീഫണ്ട് {{refund_days}} ദിവസത്തിനുള്ളിൽ ലഭിക്കും.\n\nവീണ്ടും ബുക്ക് ചെയ്യാൻ gomigo.in 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'booking_cancelled', 'hi', 'whatsapp',
E'❌ बुकिंग रद्द हो गई\n\nनमस्ते {{tourist_name}},\nआपकी बुकिंग रद्द कर दी गई है।\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n\nकारण: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} रिफ़ंड {{refund_days}} दिनों में प्रोसेस होगा।\n\nफिर से बुक करें gomigo.in पर 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'booking_cancelled', 'mr', 'whatsapp',
E'❌ बुकिंग रद्द झाली\n\nनमस्कार {{tourist_name}},\nतुमची बुकिंग रद्द केली गेली आहे.\n\n📋 रेफ: {{booking_ref}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n\nकारण: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} परतावा {{refund_days}} दिवसांत होईल.\n\nपुन्हा बुक करा gomigo.in वर 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'booking_cancelled', 'or', 'whatsapp',
E'❌ ବୁକିଂ ବାତିଲ ହୋଇଛି\n\nନମସ୍କାର {{tourist_name}},\nଆପଣଙ୍କ ବୁକିଂ ବାତିଲ ହୋଇଛି।\n\n📋 ରେଫ: {{booking_ref}}\n🚗 ସେବା: {{service_name}}\n📅 ତାରିଖ: {{service_date}}\n\nକାରଣ: {{cancellation_reason}}\n\n💰 ₹{{refund_amount}} ଫেরत {{refund_days}} ଦିନ ଭିତରେ ହେବ।\n\nପୁଣି ବୁକ କରନ୍ତୁ gomigo.in ରେ 🌿',
ARRAY['tourist_name','booking_ref','service_name','service_date','cancellation_reason','refund_amount','refund_days'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 6. review_request  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'review_request', 'en', 'whatsapp',
E'⭐ How was your GoMiGo trip?\n\nHi {{tourist_name}},\nHope you had a great time at {{destination_name}}!\n\nYour feedback helps other travellers choose the best services.\n\n👉 Rate your experience: {{review_link}}\n\nTakes just 30 seconds! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'review_request', 'ta', 'whatsapp',
E'⭐ உங்கள் GoMiGo பயணம் எப்படி இருந்தது?\n\nவணக்கம் {{tourist_name}},\n{{destination_name}} இல் நல்ல நேரம் கழித்தீர்கள் என்று நம்புகிறோம்!\n\nஉங்கள் கருத்து மற்ற பயணிகளுக்கு சிறந்த சேவைகளை தேர்வு செய்ய உதவுகிறது.\n\n👉 உங்கள் அனுபவத்தை மதிப்பிடுங்கள்: {{review_link}}\n\nமுப்பது வினாடிகளே ஆகும்! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'review_request', 'te', 'whatsapp',
E'⭐ మీ GoMiGo యాత్ర ఎలా ఉంది?\n\nహాయ్ {{tourist_name}},\n{{destination_name}} లో మీకు మంచి సమయం గడిచిందని ఆశిస్తున్నాం!\n\nమీ అభిప్రాయం ఇతర ప్రయాణికులకు అత్యుత్తమ సేవలు ఎంచుకోవడంలో సహాయపడుతుంది.\n\n👉 మీ అనుభవాన్ని రేట్ చేయండి: {{review_link}}\n\nకేవలం 30 సెకన్లు! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'review_request', 'kn', 'whatsapp',
E'⭐ ನಿಮ್ಮ GoMiGo ಪ್ರಯಾಣ ಹೇಗಿತ್ತು?\n\nನಮಸ್ಕಾರ {{tourist_name}},\n{{destination_name}} ನಲ್ಲಿ ಉತ್ತಮ ಸಮಯ ಕಳೆದಿರುವಿರೆಂದು ಆಶಿಸುತ್ತೇವೆ!\n\nನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಇತರ ಪ್ರಯಾಣಿಕರಿಗೆ ಉತ್ತಮ ಸೇವೆಗಳನ್ನು ಆರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.\n\n👉 ನಿಮ್ಮ ಅನುಭವ ರೇಟ್ ಮಾಡಿ: {{review_link}}\n\nಕೇವಲ 30 ಸೆಕೆಂಡ್! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'review_request', 'ml', 'whatsapp',
E'⭐ നിങ്ങളുടെ GoMiGo യാത്ര എങ്ങനെ ആയിരുന്നു?\n\nഹലോ {{tourist_name}},\n{{destination_name}} ൽ നല്ല സമയം ചെലവഴിച്ചു എന്ന് പ്രതീക്ഷിക്കുന്നു!\n\nനിങ്ങളുടെ അഭിപ്രായം മറ്റ് യാത്രക്കാർക്ക് മികച്ച സേവനങ്ങൾ തിരഞ്ഞെടുക്കാൻ സഹായിക്കുന്നു.\n\n👉 നിങ്ങളുടെ അനുഭവം റേറ്റ് ചെയ്യൂ: {{review_link}}\n\nകേവലം 30 സെക്കൻഡ്! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'review_request', 'hi', 'whatsapp',
E'⭐ आपकी GoMiGo यात्रा कैसी रही?\n\nनमस्ते {{tourist_name}},\nउम्मीद है {{destination_name}} में अच्छा समय बीता!\n\nआपकी प्रतिक्रिया अन्य यात्रियों को बेहतरीन सेवाएं चुनने में मदद करती है।\n\n👉 अपना अनुभव रेट करें: {{review_link}}\n\nसिर्फ 30 सेकंड लगेंगे! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'review_request', 'mr', 'whatsapp',
E'⭐ तुमचा GoMiGo प्रवास कसा होता?\n\nनमस्कार {{tourist_name}},\n{{destination_name}} मध्ये छान वेळ गेला असेल अशी आशा आहे!\n\nतुमचा अभिप्राय इतर प्रवाशांना सर्वोत्तम सेवा निवडण्यास मदत करतो.\n\n👉 तुमचा अनुभव रेट करा: {{review_link}}\n\nफक्त 30 सेकंद लागतात! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'review_request', 'or', 'whatsapp',
E'⭐ ଆପଣଙ୍କ GoMiGo ଯାତ୍ରା କିପରି ଥିଲା?\n\nନମସ୍କାର {{tourist_name}},\nଆଶା କରୁଛୁ {{destination_name}} ରେ ଭଲ ସମୟ ଗଲା!\n\nଆପଣଙ୍କ ମତ ଅନ୍ୟ ଯାତ୍ରୀଙ୍କୁ ସର୍ବୋତ୍ତମ ସେବା ଚୟନ କରିବାରେ ସାହାଯ୍ୟ କରୁଛି।\n\n👉 ଆପଣଙ୍କ ଅଭିଜ୍ଞତା ରେଟ୍ କରନ୍ତୁ: {{review_link}}\n\nମାତ୍ର ୩୦ ସେକେଣ୍ଡ! 🙏',
ARRAY['tourist_name','destination_name','review_link'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 7. provider_new_booking  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'provider_new_booking', 'en', 'whatsapp',
E'🔔 New Booking Alert!\n\nHi {{provider_name}},\nYou have a new GoMiGo booking.\n\n📋 Ref: {{booking_ref}}\n👤 Tourist: {{tourist_name}}\n📞 Contact: {{tourist_phone}}\n🚗 Service: {{service_name}}\n📅 Date: {{service_date}}\n🕐 Time: {{service_time}}\n📍 Pickup: {{pickup_location}}\n\nConfirm or manage: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'provider_new_booking', 'ta', 'whatsapp',
E'🔔 புதிய பதிவு விழிப்பு!\n\nவணக்கம் {{provider_name}},\nஉங்களுக்கு புதிய GoMiGo பதிவு உள்ளது.\n\n📋 பதிவு எண்: {{booking_ref}}\n👤 சுற்றுலாவாலர்: {{tourist_name}}\n📞 தொடர்பு: {{tourist_phone}}\n🚗 சேவை: {{service_name}}\n📅 தேதி: {{service_date}}\n🕐 நேரம்: {{service_time}}\n📍 எடுக்கும் இடம்: {{pickup_location}}\n\nஒப்புக்கொள்ள அல்லது நிர்வகிக்க: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'provider_new_booking', 'te', 'whatsapp',
E'🔔 కొత్త బుకింగ్ అలర్ట్!\n\nహాయ్ {{provider_name}},\nమీకు కొత్త GoMiGo బుకింగ్ వచ్చింది.\n\n📋 రెఫ్: {{booking_ref}}\n👤 పర్యాటకుడు: {{tourist_name}}\n📞 సంప్రదింపు: {{tourist_phone}}\n🚗 సేవ: {{service_name}}\n📅 తేదీ: {{service_date}}\n🕐 సమయం: {{service_time}}\n📍 పికప్ స్థలం: {{pickup_location}}\n\nనిర్ధారించండి: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'provider_new_booking', 'kn', 'whatsapp',
E'🔔 ಹೊಸ ಬುಕಿಂಗ್ ಎಚ್ಚರಿಕೆ!\n\nನಮಸ್ಕಾರ {{provider_name}},\nನಿಮಗೆ ಹೊಸ GoMiGo ಬುಕಿಂಗ್ ಬಂದಿದೆ.\n\n📋 ರೆಫ್: {{booking_ref}}\n👤 ಪ್ರವಾಸಿ: {{tourist_name}}\n📞 ಸಂಪರ್ಕ: {{tourist_phone}}\n🚗 ಸೇವೆ: {{service_name}}\n📅 ದಿನಾಂಕ: {{service_date}}\n🕐 ಸಮಯ: {{service_time}}\n📍 ಪಿಕಪ್ ಸ್ಥಳ: {{pickup_location}}\n\nದೃಢಪಡಿಸಲು: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'provider_new_booking', 'ml', 'whatsapp',
E'🔔 പുതിയ ബുക്കിംഗ് അലർട്ട്!\n\nഹലോ {{provider_name}},\nനിങ്ങൾക്ക് ഒരു പുതിയ GoMiGo ബുക്കിംഗ് ലഭിച്ചു.\n\n📋 റഫ്: {{booking_ref}}\n👤 ടൂറിസ്റ്റ്: {{tourist_name}}\n📞 ബന്ധപ്പെടാൻ: {{tourist_phone}}\n🚗 സേവനം: {{service_name}}\n📅 തീയതി: {{service_date}}\n🕐 സമയം: {{service_time}}\n📍 പിക്കപ്പ്: {{pickup_location}}\n\nസ്ഥിരീകരിക്കൂ: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'provider_new_booking', 'hi', 'whatsapp',
E'🔔 नई बुकिंग अलर्ट!\n\nनमस्ते {{provider_name}},\nआपको एक नई GoMiGo बुकिंग मिली है।\n\n📋 रेफ: {{booking_ref}}\n👤 पर्यटक: {{tourist_name}}\n📞 संपर्क: {{tourist_phone}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n🕐 समय: {{service_time}}\n📍 पिकअप: {{pickup_location}}\n\nपुष्टि करें: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'provider_new_booking', 'mr', 'whatsapp',
E'🔔 नवीन बुकिंग सूचना!\n\nनमस्कार {{provider_name}},\nतुम्हाला एक नवीन GoMiGo बुकिंग मिळाली आहे.\n\n📋 रेफ: {{booking_ref}}\n👤 पर्यटक: {{tourist_name}}\n📞 संपर्क: {{tourist_phone}}\n🚗 सेवा: {{service_name}}\n📅 तारीख: {{service_date}}\n🕐 वेळ: {{service_time}}\n📍 पिकअप: {{pickup_location}}\n\nपुष्टी करा: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'provider_new_booking', 'or', 'whatsapp',
E'🔔 ନୂଆ ବୁକିଂ ସତର୍କତା!\n\nନମସ୍କାର {{provider_name}},\nଆପଣଙ୍କୁ ଏକ ନୂଆ GoMiGo ବୁକିଂ ମିଳିଛି।\n\n📋 ରେଫ: {{booking_ref}}\n👤 ପର୍ଯ୍ୟଟକ: {{tourist_name}}\n📞 ଯୋଗାଯୋଗ: {{tourist_phone}}\n🚗 ସେବା: {{service_name}}\n📅 ତାରିଖ: {{service_date}}\n🕐 ସମୟ: {{service_time}}\n📍 ପିକଅପ: {{pickup_location}}\n\nନିଶ୍ଚିତ କରନ୍ତୁ: {{booking_link}}',
ARRAY['provider_name','booking_ref','tourist_name','tourist_phone','service_name','service_date','service_time','pickup_location','booking_link'],
TRUE, NOW(), NOW()),

-- ============================================================
-- 8. payment_receipt  (8 languages)
-- ============================================================

-- English
(gen_random_uuid(), 'payment_receipt', 'en', 'whatsapp',
E'🧾 Payment Received\n\nHi {{tourist_name}},\nWe received your payment for booking {{booking_ref}}.\n\n💳 Payment ID: {{payment_id}}\n💰 Amount Paid: ₹{{amount}}\n📅 Date: {{payment_date}}\n🔐 Method: {{payment_method}}\n\nService: {{service_name}} on {{service_date}}\n\nView receipt: {{receipt_link}}\n\nThank you for choosing GoMiGo! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Tamil
(gen_random_uuid(), 'payment_receipt', 'ta', 'whatsapp',
E'🧾 கட்டணம் பெறப்பட்டது\n\nவணக்கம் {{tourist_name}},\nபதிவு {{booking_ref}} க்கான உங்கள் கட்டணம் பெறப்பட்டது.\n\n💳 கட்டண ID: {{payment_id}}\n💰 செலுத்திய தொகை: ₹{{amount}}\n📅 தேதி: {{payment_date}}\n🔐 முறை: {{payment_method}}\n\nசேவை: {{service_name}} - {{service_date}} அன்று\n\nரசீது காண: {{receipt_link}}\n\nGoMiGo ஐ தேர்ந்தெடுத்தமைக்கு நன்றி! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Telugu
(gen_random_uuid(), 'payment_receipt', 'te', 'whatsapp',
E'🧾 చెల్లింపు స్వీకరించబడింది\n\nహాయ్ {{tourist_name}},\nబుకింగ్ {{booking_ref}} కు మీ చెల్లింపు స్వీకరించబడింది.\n\n💳 పేమెంట్ ID: {{payment_id}}\n💰 చెల్లించిన మొత్తం: ₹{{amount}}\n📅 తేదీ: {{payment_date}}\n🔐 పద్ధతి: {{payment_method}}\n\nసేవ: {{service_name}} - {{service_date}}\n\nరశీదు చూడండి: {{receipt_link}}\n\nGoMiGo ని ఎంచుకున్నందుకు ధన్యవాదాలు! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Kannada
(gen_random_uuid(), 'payment_receipt', 'kn', 'whatsapp',
E'🧾 ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ\n\nನಮಸ್ಕಾರ {{tourist_name}},\nಬುಕಿಂಗ್ {{booking_ref}} ಗಾಗಿ ನಿಮ್ಮ ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.\n\n💳 ಪಾವತಿ ID: {{payment_id}}\n💰 ಪಾವತಿ ಮೊತ್ತ: ₹{{amount}}\n📅 ದಿನಾಂಕ: {{payment_date}}\n🔐 ವಿಧಾನ: {{payment_method}}\n\nಸೇವೆ: {{service_name}} - {{service_date}}\n\nರಸೀದಿ ನೋಡಿ: {{receipt_link}}\n\nGoMiGo ಆಯ್ಕೆ ಮಾಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Malayalam
(gen_random_uuid(), 'payment_receipt', 'ml', 'whatsapp',
E'🧾 പേമെന്റ് ലഭിച്ചു\n\nഹലോ {{tourist_name}},\nബുക്കിംഗ് {{booking_ref}} ലേക്കുള്ള പേമെന്റ് ലഭിച്ചു.\n\n💳 പേമെന്റ് ID: {{payment_id}}\n💰 അടച്ച തുക: ₹{{amount}}\n📅 തീയതി: {{payment_date}}\n🔐 രീതി: {{payment_method}}\n\nസേവനം: {{service_name}} - {{service_date}}\n\nരസീത് കാണൂ: {{receipt_link}}\n\nGoMiGo തിരഞ്ഞെടുത്തതിന് നന്ദി! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Hindi
(gen_random_uuid(), 'payment_receipt', 'hi', 'whatsapp',
E'🧾 भुगतान प्राप्त हुआ\n\nनमस्ते {{tourist_name}},\nबुकिंग {{booking_ref}} के लिए आपका भुगतान प्राप्त हुआ।\n\n💳 पेमेंट ID: {{payment_id}}\n💰 राशि: ₹{{amount}}\n📅 तारीख: {{payment_date}}\n🔐 तरीका: {{payment_method}}\n\nसेवा: {{service_name}} - {{service_date}}\n\nरसीद देखें: {{receipt_link}}\n\nGoMiGo को चुनने के लिए धन्यवाद! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Marathi
(gen_random_uuid(), 'payment_receipt', 'mr', 'whatsapp',
E'🧾 पेमेंट प्राप्त झाले\n\nनमस्कार {{tourist_name}},\nबुकिंग {{booking_ref}} साठी तुमचे पेमेंट प्राप्त झाले.\n\n💳 पेमेंट ID: {{payment_id}}\n💰 रक्कम: ₹{{amount}}\n📅 तारीख: {{payment_date}}\n🔐 पद्धत: {{payment_method}}\n\nसेवा: {{service_name}} - {{service_date}}\n\nपावती पहा: {{receipt_link}}\n\nGoMiGo निवडल्याबद्दल धन्यवाद! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW()),

-- Odia
(gen_random_uuid(), 'payment_receipt', 'or', 'whatsapp',
E'🧾 ଭୁଗତାଣ ପ୍ରାପ୍ତ ହୋଇଛି\n\nନମସ୍କାର {{tourist_name}},\nବୁକିଂ {{booking_ref}} ପାଇଁ ଆପଣଙ୍କ ଭୁଗତାଣ ପ୍ରାପ୍ତ ହୋଇଛି।\n\n💳 ପେମେଣ୍ଟ ID: {{payment_id}}\n💰 ପ୍ରଦତ୍ତ ରାଶି: ₹{{amount}}\n📅 ତାରିଖ: {{payment_date}}\n🔐 ପ୍ରଣାଳୀ: {{payment_method}}\n\nସେବା: {{service_name}} - {{service_date}}\n\nରସିଦ ଦେଖନ୍ତୁ: {{receipt_link}}\n\nGoMiGo ବାଛିବା ପାଇଁ ଧନ୍ୟବାଦ! 🌿',
ARRAY['tourist_name','booking_ref','payment_id','amount','payment_date','payment_method','service_name','service_date','receipt_link'],
TRUE, NOW(), NOW());

COMMIT;
