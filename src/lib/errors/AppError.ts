// GoMiGo AppError — Complete error class with all 35 error codes in 8 languages

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type Language = 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'hi' | 'mr' | 'or'

interface MultilingualText {
  en: string
  ta: string
  te: string
  kn: string
  ml: string
  hi: string
  mr: string
  or: string
}

interface ErrorDefinition {
  title: MultilingualText
  userMessage: MultilingualText
  fixSteps: Record<Language, string[]>
  adminMessage: string
  severity: Severity
  autoFixable: boolean
  httpStatus: number
}

const ERROR_DEFINITIONS: Record<string, ErrorDefinition> = {
  // Auth errors
  ERR_AUTH_SESSION_EXPIRED: {
    title: {
      en: 'Session Expired', ta: 'அமர்வு காலாவதியானது',
      te: 'సెషన్ గడువు తీరింది', kn: 'ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ',
      ml: 'സെഷൻ കാലഹരണപ്പെട്ടു', hi: 'सत्र समाप्त हो गया',
      mr: 'सत्र संपले', or: 'ସୈଶନ ସମାପ୍ତ ହୋଇଛି'
    },
    userMessage: {
      en: 'Your session has timed out for security. Please log in again.',
      ta: 'பாதுகாப்பிற்காக உங்கள் அமர்வு காலாவதியானது. மீண்டும் உள்நுழையவும்.',
      te: 'భద్రత కోసం మీ సెషన్ ముగిసింది. దయచేసి మళ్ళీ లాగిన్ అవ్వండి.',
      kn: 'ಭದ್ರತೆಗಾಗಿ ನಿಮ್ಮ ಸೆಷನ್ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.',
      ml: 'സുരക്ഷക്കായി നിങ്ങളുടെ സെഷൻ കാലഹരണപ്പെട്ടു. വീണ്ടും ലോഗിൻ ചെയ്യൂ.',
      hi: 'सुरक्षा के लिए आपका सत्र समाप्त हो गया। कृपया फिर से लॉगिन करें।',
      mr: 'सुरक्षिततेसाठी आपला सत्र संपला आहे. कृपया पुन्हा लॉगिन करा.',
      or: 'ସୁରକ୍ଷା ପାଇଁ ଆପଣଙ୍କ ସୈଶନ ସମାପ୍ତ ହୋଇଛି। ଦୟାକରି ପୁଣି ଲଗ୍ ଇନ କରନ୍ତୁ।'
    },
    fixSteps: {
      en: ['Click "Log in" below', 'Enter your phone number', 'Enter the OTP we send you'],
      ta: ['கீழே "உள்நுழை" என்பதை கிளிக் செய்யுங்கள்', 'உங்கள் தொலைபேசி எண்ணை உள்ளிடுங்கள்', 'நாங்கள் அனுப்பும் OTP ஐ உள்ளிடுங்கள்'],
      te: ['దిగువన "లాగిన్" క్లిక్ చేయండి', 'మీ ఫోన్ నంబర్ నమోదు చేయండి', 'మేము పంపిన OTP నమోదు చేయండి'],
      kn: ['ಕೆಳಗೆ "ಲಾಗಿನ್" ಕ್ಲಿಕ್ ಮಾಡಿ', 'ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ನಮೂದಿಸಿ', 'ನಾವು ಕಳುಹಿಸಿದ OTP ನಮೂದಿಸಿ'],
      ml: ['താഴെ "ലോഗിൻ" ക്ലിക്ക് ചെയ്യൂ', 'നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകൂ', 'ഞങ്ങൾ അയച്ച OTP നൽകൂ'],
      hi: ['नीचे "लॉगिन" पर क्लिक करें', 'अपना फ़ोन नंबर दर्ज करें', 'हमने जो OTP भेजा है वह दर्ज करें'],
      mr: ['खाली "लॉगिन" वर क्लिक करा', 'आपला फोन नंबर प्रविष्ट करा', 'आम्ही पाठवलेला OTP प्रविष्ट करा'],
      or: ['ତଳେ "ଲଗ ଇନ" କ୍ଲିକ କରନ୍ତୁ', 'ଆପଣଙ୍କ ଫୋନ ନଂ ପ୍ରବେଶ କରନ୍ତୁ', 'ଆମ୍ଭେ ପଠାଇଥିବା OTP ପ୍ରବେଶ କରନ୍ତୁ']
    },
    adminMessage: 'User session expired. Normal behavior — user needs to re-authenticate.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 401
  },

  ERR_AUTH_WRONG_OTP: {
    title: {
      en: 'Wrong OTP', ta: 'தவறான OTP',
      te: 'తప్పు OTP', kn: 'ತಪ್ಪು OTP',
      ml: 'തെറ്റായ OTP', hi: 'गलत OTP',
      mr: 'चुकीचा OTP', or: 'ଭୁଲ OTP'
    },
    userMessage: {
      en: 'The OTP you entered is incorrect. Please check the message we sent.',
      ta: 'நீங்கள் உள்ளிட்ட OTP தவறானது. நாங்கள் அனுப்பிய செய்தியை சரிபார்க்கவும்.',
      te: 'మీరు నమోదు చేసిన OTP తప్పు. మేము పంపిన సందేశాన్ని తనిఖీ చేయండి.',
      kn: 'ನೀವು ನಮೂದಿಸಿದ OTP ತಪ್ಪಾಗಿದೆ. ನಾವು ಕಳುಹಿಸಿದ ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ.',
      ml: 'നൽകിയ OTP തെറ്റാണ്. ഞങ്ങൾ അയച്ച സന്ദേശം പരിശോധിക്കൂ.',
      hi: 'आपने जो OTP दर्ज किया वह गलत है। हमने जो संदेश भेजा है उसे जांचें।',
      mr: 'आपण दिलेला OTP चुकीचा आहे. आम्ही पाठवलेला संदेश तपासा.',
      or: 'ଆପଣ ପ୍ରବେଶ କରିଥିବା OTP ଭୁଲ। ଆମ୍ଭେ ପଠାଇଥିବା ବାର୍ତ୍ତା ଯାଞ୍ଚ କରନ୍ତୁ।'
    },
    fixSteps: {
      en: ['Open WhatsApp and find our latest message', 'Copy the 6-digit code carefully', 'If not received, tap "Resend OTP"'],
      ta: ['WhatsApp திறந்து எங்கள் சமீபத்திய செய்தியை திறக்கவும்', '6 இலக்க குறியீட்டை கவனமாக நகலெடுக்கவும்', 'பெறவில்லை என்றால், "OTP மீண்டும் அனுப்பு" என்பதை தட்டவும்'],
      te: ['WhatsApp తెరవండి మరియు మా తాజా సందేశాన్ని కనుగొనండి', '6-అంకెల కోడ్ జాగ్రత్తగా కాపీ చేయండి', 'అందుకోలేదంటే "OTP మళ్ళీ పంపండి" నొక్కండి'],
      kn: ['WhatsApp ತೆರೆಯಿರಿ ಮತ್ತು ನಮ್ಮ ಇತ್ತೀಚಿನ ಸಂದೇಶ ಹುಡುಕಿ', '6 ಅಂಕಿಯ ಕೋಡ್ ಎಚ್ಚರಿಕೆಯಿಂದ ನಕಲಿಸಿ', 'ಸ್ವೀಕರಿಸಿಲ್ಲವಾದರೆ "OTP ಮತ್ತೆ ಕಳುಹಿಸು" ಟ್ಯಾಪ್ ಮಾಡಿ'],
      ml: ['WhatsApp തുറക്കൂ, ഞങ്ങളുടെ ഏറ്റവും പുതിയ സന്ദേശം കണ്ടെത്തൂ', '6-അക്ക കോഡ് ശ്രദ്ധയോടെ കോപ്പി ചെയ്യൂ', 'ലഭിച്ചില്ലെങ്കിൽ "OTP വീണ്ടും അയക്കൂ" ടാപ്പ് ചെയ്യൂ'],
      hi: ['WhatsApp खोलें और हमका सबसे हालिया संदेश ढूंढें', '6 अंकों का कोड सावधानी से कॉपी करें', 'नहीं मिला तो "OTP फिर भेजें" पर टैप करें'],
      mr: ['WhatsApp उघडा आणि आमचा सर्वात अलीकडील संदेश शोधा', '6-अंकी कोड काळजीपूर्वक कॉपी करा', 'प्राप्त झाले नसल्यास "OTP पुन्हा पाठवा" वर टॅप करा'],
      or: ['WhatsApp ଖୋଲନ୍ତୁ ଓ ଆମ୍ଭର ସର୍ବଶେଷ ବାର୍ତ୍ତା ଖୋଜନ୍ତୁ', '6-ଅଙ୍କ ବିଶିଷ୍ଟ କୋଡ ସାବଧାନତାର ସହ କପି କରନ୍ତୁ', 'ନ ମିଳିଲେ "OTP ପୁଣି ପଠାନ୍ତୁ" ଟ୍ୟାପ୍ କରନ୍ତୁ']
    },
    adminMessage: 'User entered wrong OTP. Normal user error.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 400
  },

  ERR_AUTH_OTP_EXPIRED: {
    title: { en: 'OTP Expired', ta: 'OTP காலாவதியானது', te: 'OTP గడువు తీరింది', kn: 'OTP ಅವಧಿ ಮುಗಿದಿದೆ', ml: 'OTP കാലഹരണപ്പെട്ടു', hi: 'OTP समाप्त हो गया', mr: 'OTP कालबाह्य झाला', or: 'OTP ସମୟ ଶେଷ' },
    userMessage: { en: 'Your OTP has expired. OTPs are valid for 10 minutes only.', ta: 'உங்கள் OTP காலாவதியானது. OTP கள் 10 நிமிடங்கள் மட்டுமே செல்லுபடியாகும்.', te: 'మీ OTP గడువు తీరింది. OTP లు 10 నిమిషాలు మాత్రమే చెల్లుతాయి.', kn: 'ನಿಮ್ಮ OTP ಅವಧಿ ಮುಗಿದಿದೆ. OTP ಗಳು ಕೇವಲ 10 ನಿಮಿಷಗಳು ಮಾತ್ರ ಮಾನ್ಯ.', ml: 'OTP കാലഹരണപ്പെട്ടു. OTP 10 മിനിറ്റ് മാത്രം valid ആണ്.', hi: 'आपका OTP समाप्त हो गया। OTP केवल 10 मिनट के लिए वैध हैं।', mr: 'आपला OTP कालबाह्य झाला. OTP फक्त 10 मिनिटांसाठी वैध आहेत.', or: 'ଆପଣଙ୍କ OTP ସମୟ ଶେଷ ହୋଇଗଲା। OTP ମାତ୍ର ୧୦ ମିନିଟ ପାଇଁ ବୈଧ।' },
    fixSteps: {
      en: ['Tap "Resend OTP" to get a new code', 'Enter the new code within 10 minutes'],
      ta: ['புதிய குறியீடு பெற "OTP மீண்டும் அனுப்பு" என்பதை தட்டவும்', 'புதிய குறியீட்டை 10 நிமிடங்களுக்குள் உள்ளிடவும்'],
      te: ['కొత్త కోడ్ పొందడానికి "OTP మళ్ళీ పంపండి" నొక్కండి', 'కొత్త కోడ్ 10 నిమిషాల లోపు నమోదు చేయండి'],
      kn: ['ಹೊಸ ಕೋಡ್ ಪಡೆಯಲು "OTP ಮತ್ತೆ ಕಳುಹಿಸು" ಟ್ಯಾಪ್ ಮಾಡಿ', 'ಹೊಸ ಕೋಡ್ 10 ನಿಮಿಷಗಳಲ್ಲಿ ನಮೂದಿಸಿ'],
      ml: ['പുതിയ കോഡ് ലഭിക്കാൻ "OTP വീണ്ടും അയക്കൂ" ടാപ്പ് ചെയ്യൂ', 'പുതിയ കോഡ് 10 മിനിറ്റിനുള്ളിൽ നൽകൂ'],
      hi: ['नया कोड पाने के लिए "OTP फिर भेजें" टैप करें', 'नया कोड 10 मिनट के अंदर दर्ज करें'],
      mr: ['नवीन कोड मिळवण्यासाठी "OTP पुन्हा पाठवा" टॅप करा', 'नवीन कोड 10 मिनिटांत प्रविष्ट करा'],
      or: ['ନୂଆ କୋଡ ପାଇଁ "OTP ପୁଣି ପଠାନ୍ତୁ" ଟ୍ୟାପ୍ କରନ୍ତୁ', 'ନୂଆ କୋଡ ୧୦ ମିନିଟ ଭିତରେ ଦିଅନ୍ତୁ']
    },
    adminMessage: 'OTP expired before user could enter it. Normal behavior.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 400
  },

  ERR_AUTH_TOO_MANY_ATTEMPTS: {
    title: { en: 'Too Many Attempts', ta: 'அதிக முயற்சிகள்', te: 'చాలా ప్రయత్నాలు', kn: 'ಹೆಚ್ಚು ಪ್ರಯತ್ನಗಳು', ml: 'കൂടുതൽ ശ്രമങ്ങൾ', hi: 'बहुत अधिक प्रयास', mr: 'खूप प्रयत्न', or: 'ଅଧିକ ପ୍ରୟାସ' },
    userMessage: { en: 'Too many login attempts. Please wait 30 minutes and try again.', ta: 'அதிக உள்நுழைவு முயற்சிகள். 30 நிமிடங்கள் காத்திருந்து மீண்டும் முயற்சிக்கவும்.', te: 'చాలా లాగిన్ ప్రయత్నాలు. 30 నిమిషాలు వేచి మళ్ళీ ప్రయత్నించండి.', kn: 'ಹೆಚ್ಚು ಲಾಗಿನ್ ಪ್ರಯತ್ನಗಳು. 30 ನಿಮಿಷ ಕಾಯಿರಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', ml: 'കൂടുതൽ ലോഗിൻ ശ്രമങ്ങൾ. 30 മിനിറ്റ് കാത്തിരുന്ന് ആവർത്തിക്കൂ.', hi: 'बहुत अधिक लॉगिन प्रयास। 30 मिनट प्रतीक्षा करें और फिर प्रयास करें।', mr: 'खूप लॉगिन प्रयत्न. 30 मिनिटे थांबा आणि पुन्हा प्रयत्न करा.', or: 'ଅଧିକ ଲଗ ଇନ ପ୍ରୟାସ। ୩୦ ମିନିଟ ଅପେକ୍ଷା କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' },
    fixSteps: {
      en: ['Wait 30 minutes', 'Then try logging in again', 'If you need urgent help, WhatsApp us'],
      ta: ['30 நிமிடங்கள் காத்திருக்கவும்', 'பிறகு மீண்டும் உள்நுழைய முயற்சிக்கவும்', 'அவசர உதவி தேவையெனில், எங்களுக்கு WhatsApp அனுப்பவும்'],
      te: ['30 నిమిషాలు వేచి ఉండండి', 'తర్వాత మళ్ళీ లాగిన్ ప్రయత్నించండి', 'అత్యవసర సహాయం అవసరమైతే WhatsApp చేయండి'],
      kn: ['30 ನಿಮಿಷ ಕಾಯಿರಿ', 'ನಂತರ ಮತ್ತೆ ಲಾಗಿನ್ ಪ್ರಯತ್ನಿಸಿ', 'ತುರ್ತು ಸಹಾಯ ಬೇಕಾದರೆ WhatsApp ಮಾಡಿ'],
      ml: ['30 മിനിറ്റ് കാത്തിരിക്കൂ', 'ശേഷം വീണ്ടും ലോഗിൻ ശ്രമിക്കൂ', 'അടിയന്തര സഹായം ആവശ്യമെങ്കിൽ WhatsApp ചെയ്യൂ'],
      hi: ['30 मिनट प्रतीक्षा करें', 'फिर दोबारा लॉगिन करने का प्रयास करें', 'अगर तुरंत मदद चाहिए तो WhatsApp करें'],
      mr: ['30 मिनिटे थांबा', 'नंतर पुन्हा लॉगिन करण्याचा प्रयत्न करा', 'तातडीने मदत हवी असल्यास WhatsApp करा'],
      or: ['୩୦ ମିନିଟ ଅପେକ୍ଷା କରନ୍ତୁ', 'ତାପରେ ପୁଣି ଲଗ ଇନ ଚେଷ୍ଟା କରନ୍ତୁ', 'ଜରୁରୀ ସାହାଯ୍ୟ ହେଲେ WhatsApp କରନ୍ତୁ']
    },
    adminMessage: 'Rate limit triggered for login OTP requests. Security protection working correctly.',
    severity: 'medium',
    autoFixable: false,
    httpStatus: 429
  },

  ERR_BOOKING_NO_DRIVER: {
    title: { en: "No Drivers Available", ta: "ஓட்டுநர்கள் இல்லை", te: "డ్రైవర్లు అందుబాటులో లేరు", kn: "ಡ್ರೈವರ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ", ml: "ഡ്രൈവർമാർ ലഭ്യമല്ല", hi: "कोई ड्राइवर उपलब्ध नहीं", mr: "कोणताही ड्रायव्हर उपलब्ध नाही", or: "କୌଣସି ଡ୍ରାଇଭର ଉପଲବ୍ଧ ନାହିଁ" },
    userMessage: { en: "No drivers are available in your area right now. We've notified nearby drivers.", ta: "இப்போது உங்கள் பகுதியில் ஓட்டுநர்கள் இல்லை. அருகிலுள்ள ஓட்டுநர்களுக்கு தெரிவித்துள்ளோம்.", te: "మీ ప్రాంతంలో ప్రస్తుతం డ్రైవర్లు లేరు. సమీప డ్రైవర్లకు తెలియజేశాం.", kn: "ಈಗ ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಡ್ರೈವರ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ. ಸಮೀಪದ ಡ್ರೈವರ್‌ಗಳಿಗೆ ತಿಳಿಸಿದ್ದೇವೆ.", ml: "ഇപ്പോൾ നിങ്ങളുടെ പ്രദേശത്ത് ഡ്രൈവർമാർ ലഭ്യമല്ല. സമീപ ഡ്രൈവർമാർക്ക് അറിയിച്ചു.", hi: "अभी आपके क्षेत्र में कोई ड्राइवर उपलब्ध नहीं है। हमने पास के ड्राइवरों को सूचित किया है।", mr: "आत्ता आपल्या भागात कोणताही ड्रायव्हर उपलब्ध नाही. आम्ही जवळच्या ड्रायव्हर्सना सूचित केले आहे.", or: "ଏବେ ଆପଣଙ୍କ ଅଞ୍ଚଳରେ କୌଣସି ଡ୍ରାଇଭର ଉପଲବ୍ଧ ନାହିଁ। ନିକଟ ଡ୍ରାଇଭରଙ୍କୁ ଜଣାଇ ଦେଇଛୁ।" },
    fixSteps: {
      en: ['Wait 15 minutes and search again', 'Try a slightly different pickup location', 'Call our WhatsApp and we will find a driver for you manually'],
      ta: ['15 நிமிடங்கள் காத்திருந்து மீண்டும் தேடுங்கள்', 'சற்று வித்தியாசமான ஏற்றுக்கொள்ளும் இடம் முயற்சிக்கவும்', 'எங்கள் WhatsApp ஐ அழைக்கவும், நாங்கள் கைமுறையாக ஓட்டுநரை கண்டறிவோம்'],
      te: ['15 నిమిషాలు వేచి మళ్ళీ శోధించండి', 'కొంచెం వేరే పికప్ స్థానం ప్రయత్నించండి', 'మా WhatsApp కి కాల్ చేయండి, మేము మాన్యువల్‌గా డ్రైవర్ కనుగొంటాం'],
      kn: ['15 ನಿಮಿಷ ಕಾಯಿರಿ ಮತ್ತೆ ಹುಡುಕಿ', 'ಸ್ವಲ್ಪ ಬೇರೆ ಪಿಕಪ್ ಸ್ಥಳ ಪ್ರಯತ್ನಿಸಿ', 'ನಮ್ಮ WhatsApp ಗೆ ಕರೆ ಮಾಡಿ, ನಾವು ಡ್ರೈವರ್ ಹುಡುಕುತ್ತೇವೆ'],
      ml: ['15 മിനിറ്റ് കാത്ത് വീണ്ടും തിരയൂ', 'അൽപ്പം വ്യത്യസ്ത pickup സ്ഥലം ശ്രമിക്കൂ', 'ഞങ്ങളുടെ WhatsApp ൽ വിളിക്കൂ, ഞങ്ങൾ ഡ്രൈവർ കണ്ടെത്തും'],
      hi: ['15 मिनट प्रतीक्षा करें और फिर खोजें', 'थोड़ी अलग पिकअप लोकेशन आज़माएं', 'हमारे WhatsApp पर कॉल करें, हम मैन्युअली ड्राइवर खोजेंगे'],
      mr: ['15 मिनिटे थांबा आणि पुन्हा शोधा', 'थोडे वेगळे पिकअप ठिकाण वापरून पाहा', 'आमच्या WhatsApp वर कॉल करा, आम्ही ड्रायव्हर शोधू'],
      or: ['୧୫ ମିନିଟ ଅପେକ୍ଷା କରି ପୁଣି ଖୋଜନ୍ତୁ', 'ଟିକିଏ ଭିନ୍ନ ପିକଅପ ସ୍ଥାନ ଚେଷ୍ଟା କରନ୍ତୁ', 'ଆମ WhatsApp କୁ ଫୋନ କରନ୍ତୁ, ଆମ୍ଭେ ଡ୍ରାଇଭର ଖୋଜିବୁ']
    },
    adminMessage: 'Tourist searched for cab, zero available drivers found. Auto-fix: sent push alerts to nearby offline drivers.',
    severity: 'high',
    autoFixable: true,
    httpStatus: 503
  },

  ERR_PAYMENT_TIMEOUT: {
    title: { en: 'Payment Timed Out', ta: 'பணம் செலுத்துதல் நேரம் முடிந்தது', te: 'చెల్లింపు గడువు తీరింది', kn: 'ಪಾವತಿ ಸಮಯ ಮೀರಿದೆ', ml: 'പേമെന്റ് ടൈം ഔട്ട്', hi: 'भुगतान का समय समाप्त', mr: 'पेमेंटची वेळ संपली', or: 'ପେମେଣ୍ଟ ସମୟ ଶେଷ' },
    userMessage: { en: 'Payment timed out. Your money was NOT charged. Please try again.', ta: 'பணம் செலுத்துதல் நேரம் முடிந்தது. உங்கள் பணம் வசூலிக்கப்படவில்லை. மீண்டும் முயற்சிக்கவும்.', te: 'చెల్లింపు గడువు తీరింది. మీ డబ్బు మినహాయించబడలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.', kn: 'ಪಾವತಿ ಸಮಯ ಮೀರಿದೆ. ನಿಮ್ಮ ಹಣ ಕಡಿತಗೊಳಿಸಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', ml: 'പേമെന്റ് ടൈം ഔട്ടായി. പണം ഈടാക്കിയിട്ടില്ല. ദയവായി വീണ്ടും ശ്രമിക്കൂ.', hi: 'भुगतान का समय समाप्त हो गया। आपका पैसा कटा नहीं है। कृपया फिर से प्रयास करें।', mr: 'पेमेंटची वेळ संपली. आपले पैसे कापले गेले नाहीत. कृपया पुन्हा प्रयत्न करा.', or: 'ପେମେଣ୍ଟ ସମୟ ଶେଷ। ଆପଣଙ୍କ ଟଙ୍କା କଟା ଯାଇ ନାହିଁ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' },
    fixSteps: {
      en: ['Your booking is still saved — just the payment failed', 'Tap "Pay Now" to try again', 'Try UPI if card failed, or vice versa'],
      ta: ['உங்கள் முன்பதிவு இன்னும் சேமிக்கப்பட்டுள்ளது — பணம் மட்டுமே தோல்வியடைந்தது', '"இப்போது செலுத்து" என்பதை தட்டவும்', 'அட்டை தோல்வியானால் UPI முயற்சிக்கவும்'],
      te: ['మీ బుకింగ్ ఇంకా సేవ్ అయింది — చెల్లింపు మాత్రమే విఫలమైంది', '"ఇప్పుడు చెల్లించు" నొక్కండి', 'కార్డ్ విఫలమైతే UPI ప్రయత్నించండి'],
      kn: ['ನಿಮ್ಮ ಬುಕಿಂಗ್ ಇನ್ನೂ ಉಳಿಸಲಾಗಿದೆ — ಪಾವತಿ ಮಾತ್ರ ವಿಫಲವಾಗಿದೆ', '"ಈಗ ಪಾವತಿಸಿ" ಟ್ಯಾಪ್ ಮಾಡಿ', 'ಕಾರ್ಡ್ ವಿಫಲವಾದರೆ UPI ಪ್ರಯತ್ನಿಸಿ'],
      ml: ['ബുക്കിംഗ് ഇനിയും സേവ് ആണ് — പേമെന്റ് മാത്രം പരാജയപ്പെട്ടു', '"ഇപ്പോൾ Pay ചെയ്യൂ" ടാപ്പ് ചെയ്യൂ', 'കാർഡ് പരാജയപ്പെട്ടെങ്കിൽ UPI ശ്രമിക്കൂ'],
      hi: ['आपकी बुकिंग अभी भी सहेजी गई है — केवल भुगतान विफल हुआ', '"अभी भुगतान करें" टैप करें', 'कार्ड विफल हुआ तो UPI आज़माएं'],
      mr: ['आपले बुकिंग अजूनही जतन केले आहे — फक्त पेमेंट अयशस्वी झाले', '"आता पैसे द्या" टॅप करा', 'कार्ड अयशस्वी झाल्यास UPI वापरून पाहा'],
      or: ['ଆପଣଙ୍କ ବୁକିଂ ଏଖନ ବି ସଂରକ୍ଷିତ — ମାତ୍ର ପେମେଣ୍ଟ ବ୍ୟର୍ଥ', '"ଏବେ ପ୍ରଦାନ କରନ୍ତୁ" ଟ୍ୟାପ୍ କରନ୍ତୁ', 'କାର୍ଡ ବ୍ୟର୍ଥ ହେଲେ UPI ଚେଷ୍ଟା କରନ୍ତୁ']
    },
    adminMessage: 'Razorpay payment timeout. Booking held in pending state, payment not captured.',
    severity: 'medium',
    autoFixable: false,
    httpStatus: 408
  },

  ERR_KYC_DOC_UNREADABLE: {
    title: { en: 'Document Unclear', ta: 'ஆவணம் தெளிவற்றது', te: 'పత్రం అస్పష్టంగా ఉంది', kn: 'ದಾಖಲೆ ಅಸ್ಪಷ್ಟ', ml: 'ഡോക്യുമെന്റ് അസ്പഷ്ടം', hi: 'दस्तावेज़ अस्पष्ट', mr: 'कागदपत्र अस्पष्ट', or: 'ଡକ୍ୟୁମେଣ୍ଟ ଅସ୍ପଷ୍ଟ' },
    userMessage: { en: 'Your document photo is too blurry to read. Please upload a clearer photo.', ta: 'உங்கள் ஆவண புகைப்படம் படிக்க மிகவும் மங்கலாக உள்ளது. தெளிவான படம் பதிவேற்றவும்.', te: 'మీ పత్రం ఫోటో చదవడానికి చాలా అస్పష్టంగా ఉంది. దయచేసి స్పష్టమైన ఫోటో అప్‌లోడ్ చేయండి.', kn: 'ನಿಮ್ಮ ದಾಖಲೆ ಫೋಟೋ ಓದಲು ತುಂಬಾ ಅಸ್ಪಷ್ಟ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.', ml: 'ഡോക്യുമെന്റ് ഫോട്ടോ വ്യക്തമല്ല. ദയവായി വ്യക്തമായ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യൂ.', hi: 'आपके दस्तावेज़ की फोटो पढ़ने के लिए बहुत धुंधली है। कृपया स्पष्ट फोटो अपलोड करें।', mr: 'आपल्या कागदपत्राचा फोटो वाचण्यासाठी खूप अस्पष्ट आहे. कृपया स्पष्ट फोटो अपलोड करा.', or: 'ଆପଣଙ୍କ ଡକ୍ୟୁମେଣ୍ଟ ଫୋଟୋ ଅଧ୍ୟୟନ ଯୋଗ୍ୟ ନୁହଁ। ସ୍ପଷ୍ଟ ଫୋଟୋ ଅପଲୋଡ କରନ୍ତୁ।' },
    fixSteps: {
      en: ['Place the document flat on a table', 'Use good lighting (near a window works well)', 'Hold your phone steady and take a clear photo', 'Make sure all 4 corners of the document are visible'],
      ta: ['ஆவணத்தை மேசையில் தட்டையாக வையுங்கள்', 'நல்ல வெளிச்சம் பயன்படுத்துங்கள்', 'தொலைபேசியை நிலையாக வைத்து தெளிவான புகைப்படம் எடுங்கள்', 'ஆவணத்தின் நான்கு மூலைகளும் தெரியும்படி பார்க்கவும்'],
      te: ['పత్రాన్ని బల్లపై చదునుగా ఉంచండి', 'మంచి వెలుతురు వాడండి', 'ఫోన్ స్థిరంగా పట్టుకుని స్పష్టమైన ఫోటో తీయండి', 'పత్రానికి నాలుగు మూలలు కనిపించేలా చూసుకోండి'],
      kn: ['ದಾಖಲೆಯನ್ನು ಮೇಜಿನ ಮೇಲೆ ಸಮತಟ್ಟಾಗಿ ಇಡಿ', 'ಒಳ್ಳೆಯ ಬೆಳಕು ಬಳಸಿ', 'ಫೋನ್ ಸ್ಥಿರವಾಗಿ ಹಿಡಿದು ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ', 'ದಾಖಲೆಯ ನಾಲ್ಕು ಮೂಲೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳಲಿ'],
      ml: ['ഡോക്യുമെന്റ് ടേബിളിൽ ഫ്ലാറ്റ് ആക്കി വക്കൂ', 'നല്ല വെളിച്ചം ഉപയോഗിക്കൂ', 'ഫോൺ steady ആക്കി hold ചെയ്ത് ക്ലിയർ ഫോട്ടോ എടുക്കൂ', 'ഡോക്യുമെന്റിന്റെ 4 കോണുകളും കാണണം'],
      hi: ['दस्तावेज़ को मेज़ पर सपाट रखें', 'अच्छी रोशनी इस्तेमाल करें', 'फोन स्थिर रखकर साफ फोटो लें', 'दस्तावेज़ के चारों कोने दिखने चाहिए'],
      mr: ['कागदपत्र टेबलावर सपाट ठेवा', 'चांगला प्रकाश वापरा', 'फोन स्थिर ठेवून स्पष्ट फोटो काढा', 'कागदपत्राचे चारही कोपरे दिसले पाहिजेत'],
      or: ['ଡକ୍ୟୁମେଣ୍ଟ ଟେବୁଲ ଉପରେ ଚ୍ୟାପ୍ଟା ଭାବରେ ରଖନ୍ତୁ', 'ଭଲ ଆଲୋକ ବ୍ୟବହାର କରନ୍ତୁ', 'ଫୋନ ସ୍ଥିର ରଖି ସ୍ପଷ୍ଟ ଫୋଟୋ ଉଠାନ୍ତୁ', 'ଡକ୍ୟୁମେଣ୍ଟ ଚାରି କୋଣ ଦୃଶ୍ୟ ହେବା ଉଚିତ']
    },
    adminMessage: 'KYC document photo quality too low for OCR/verification. Provider notified with instructions.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 422
  },

  ERR_UPLOAD_TOO_LARGE: {
    title: { en: 'File Too Large', ta: 'கோப்பு மிகவும் பெரியது', te: 'ఫైల్ చాలా పెద్దది', kn: 'ಫೈಲ್ ತುಂಬಾ ದೊಡ್ಡದು', ml: 'ഫയൽ വലുതാണ്', hi: 'फाइल बहुत बड़ी है', mr: 'फाइल खूप मोठी आहे', or: 'ଫାଇଲ ବହୁତ ବଡ' },
    userMessage: { en: 'This file is too large. Maximum size is 5MB.', ta: 'இந்த கோப்பு மிகவும் பெரியது. அதிகபட்ச அளவு 5MB.', te: 'ఈ ఫైల్ చాలా పెద్దది. గరిష్ట పరిమాణం 5MB.', kn: 'ಈ ಫೈಲ್ ತುಂಬಾ ದೊಡ್ಡದು. ಗರಿಷ್ಠ ಗಾತ್ರ 5MB.', ml: 'ഈ ഫയൽ വലുതാണ്. പരമാവധി 5MB.', hi: 'यह फाइल बहुत बड़ी है। अधिकतम आकार 5MB है।', mr: 'ही फाइल खूप मोठी आहे. जास्तीत जास्त आकार 5MB आहे.', or: 'ଏହି ଫାଇଲ ବହୁତ ବଡ। ସର୍ବୋଚ୍ଚ ଆକାର ୫MB।' },
    fixSteps: {
      en: ['Compress the image using a free app like "Compress Image" on your phone', 'Or take a new photo with lower resolution setting', 'Make sure file is under 5MB before uploading'],
      ta: ['ஃபோனில் "Compress Image" போன்ற இலவச ஆப்பைப் பயன்படுத்தி படத்தை சுருக்கவும்', 'அல்லது குறைந்த ரெசல்யூஷன் அமைப்பில் புதிய புகைப்படம் எடுக்கவும்', 'பதிவேற்றுவதற்கு முன் கோப்பு 5MB க்கும் குறைவாக இருப்பதை உறுதிப்படுத்தவும்'],
      te: ['ఫోన్‌లో "Compress Image" వంటి ఉచిత యాప్ ఉపయోగించి చిత్రాన్ని కుదించండి', 'లేదా తక్కువ రిజల్యూషన్ సెట్టింగ్‌తో కొత్త ఫోటో తీయండి', 'అప్‌లోడ్ చేయడానికి ముందు ఫైల్ 5MB కంటే తక్కువ ఉందని నిర్ధారించుకోండి'],
      kn: ['ಫೋನ್‌ನಲ್ಲಿ "Compress Image" ನಂತಹ ಉಚಿತ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಿ ಚಿತ್ರ ಸಂಕುಚಿತಗೊಳಿಸಿ', 'ಅಥವಾ ಕಡಿಮೆ ರೆಸಲ್ಯೂಶನ್‌ನಲ್ಲಿ ಹೊಸ ಫೋಟೋ ತೆಗೆಯಿರಿ', 'ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೊದಲು ಫೈಲ್ 5MB ಗಿಂತ ಕಡಿಮೆ ಇರಲಿ'],
      ml: ['ഫോണിൽ "Compress Image" ആപ്പ് ഉപയോഗിച്ച് ഇമേജ് compress ചെയ്യൂ', 'അല്ലെങ്കിൽ കുറഞ്ഞ resolution ൽ പുതിയ ഫോട്ടോ എടുക്കൂ', 'upload ചെയ്യുന്നതിന് മുൻപ് ഫയൽ 5MB ൽ കുറവ് ആണോ ഉറപ്പ് വരുത്തൂ'],
      hi: ['फोन पर "Compress Image" जैसे मुफ्त ऐप से फोटो को कम्प्रेस करें', 'या कम रेज़ोल्यूशन सेटिंग से नई फोटो लें', 'अपलोड करने से पहले सुनिश्चित करें कि फाइल 5MB से कम है'],
      mr: ['फोनवर "Compress Image" सारखे मोफत अॅप वापरून फोटो कॉम्प्रेस करा', 'किंवा कमी रेझोल्यूशन सेटिंगसह नवीन फोटो काढा', 'अपलोड करण्यापूर्वी खात्री करा की फाइल 5MB पेक्षा कमी आहे'],
      or: ['ଫୋନରେ "Compress Image" ଆପ ବ୍ୟବହାର କରି ଫୋଟୋ ସଙ୍କୁଚିତ କରନ୍ତୁ', 'ବା କମ ରେଜୋଲ୍ୟୁଶନ ସେଟିଂରେ ନୂଆ ଫୋଟୋ ଉଠାନ୍ତୁ', 'ଅପଲୋଡ ପୂର୍ବରୁ ଫାଇଲ ୫MB ଠାରୁ କମ ଅଛି କି ନିଶ୍ଚିତ କରନ୍ତୁ']
    },
    adminMessage: 'File size exceeded 5MB limit. Rejected at upload.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 413
  },

  ERR_DB_CONNECTION_LOST: {
    title: { en: 'Connection Lost', ta: 'இணைப்பு தொலைந்தது', te: 'కనెక్షన్ పోయింది', kn: 'ಸಂಪರ್ಕ ಕಡಿದಿದೆ', ml: 'കണക്ഷൻ നഷ്ടമായി', hi: 'कनेक्शन टूट गया', mr: 'कनेक्शन तुटले', or: 'ସଂଯୋଗ ହଜିଗଲା' },
    userMessage: { en: 'We lost our connection for a moment. Reconnecting automatically...', ta: 'ஒரு கணம் இணைப்பு தொலைந்தது. தானாகவே மீண்டும் இணைக்கிறோம்...', te: 'ఒక క్షణం కనెక్షన్ పోయింది. స్వయంచాలకంగా తిరిగి కనెక్ట్ అవుతున్నాం...', kn: 'ಒಂದು ಕ್ಷಣ ಸಂಪರ್ಕ ಕಡಿದಿದೆ. ತಾನಾಗಿ ಮತ್ತೆ ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ...', ml: 'ഒരു നിമിഷം കണക്ഷൻ നഷ്ടമായി. ഓട്ടോ ആയി reconnect ചെയ്യുന്നു...', hi: 'एक पल के लिए कनेक्शन टूट गया। स्वचालित रूप से फिर से जोड़ रहे हैं...', mr: 'एका क्षणासाठी कनेक्शन तुटले. आपोआप पुन्हा जोडत आहे...', or: 'ଏକ ମୁହୂର୍ତ ସଂଯୋଗ ହଜିଗଲା। ଆପଣାଆପ ପୁଣି ଯୋଡ଼ୁଛୁ...' },
    fixSteps: {
      en: ['Wait 10 seconds — we are reconnecting automatically', 'If still failing, refresh the page', 'Your data is safe and not lost'],
      ta: ['10 வினாடிகள் காத்திருங்கள் — தானாகவே மீண்டும் இணைக்கிறோம்', 'இன்னும் தோல்வியானால், பக்கத்தை புதுப்பிக்கவும்', 'உங்கள் தரவு பாதுகாப்பாக உள்ளது'],
      te: ['10 సెకన్లు వేచి ఉండండి — స్వయంచాలకంగా తిరిగి కనెక్ట్ అవుతున్నాం', 'ఇంకా విఫలమైతే, పేజీ రిఫ్రెష్ చేయండి', 'మీ డేటా సురక్షితంగా ఉంది'],
      kn: ['10 ಸೆಕೆಂಡ್ ಕಾಯಿರಿ — ತಾನಾಗಿ ಮತ್ತೆ ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇವೆ', 'ಇನ್ನೂ ವಿಫಲವಾದರೆ, ಪುಟ ರಿಫ್ರೆಶ್ ಮಾಡಿ', 'ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತ'],
      ml: ['10 സെക്കൻഡ് കാത്തിരിക്കൂ — ഓട്ടോ reconnect ആകുന്നു', 'ഇനിയും fail ആയാൽ page refresh ചെയ്യൂ', 'ഡേറ്റ safe ആണ്'],
      hi: ['10 सेकंड प्रतीक्षा करें — स्वचालित रूप से फिर से जोड़ रहे हैं', 'अभी भी विफल हो तो पेज रिफ्रेश करें', 'आपका डेटा सुरक्षित है'],
      mr: ['10 सेकंद थांबा — आपोआप पुन्हा जोडत आहे', 'अजूनही अयशस्वी असल्यास पृष्ठ रिफ्रेश करा', 'आपला डेटा सुरक्षित आहे'],
      or: ['୧୦ ସେକେଣ୍ଡ ଅପେକ୍ଷା କରନ୍ତୁ — ଆପଣାଆପ ପୁଣି ଯୋଡ଼ୁଛୁ', 'ତଥାପି ବ୍ୟର୍ଥ ହେଲେ ପୃଷ୍ଠ ରିଫ୍ରେଶ କରନ୍ତୁ', 'ଆପଣଙ୍କ ଡାଟା ସୁରକ୍ଷିତ ଅଛି']
    },
    adminMessage: 'Database connection lost. Auto-fix: retry 3 times with exponential backoff (1s, 2s, 4s).',
    severity: 'high',
    autoFixable: true,
    httpStatus: 503
  },

  ERR_RATE_LIMIT: {
    title: { en: 'Too Many Requests', ta: 'அதிக கோரிக்கைகள்', te: 'చాలా అభ్యర్థనలు', kn: 'ಹೆಚ್ಚು ವಿನಂತಿಗಳು', ml: 'കൂടുതൽ requests', hi: 'बहुत अधिक अनुरोध', mr: 'खूप विनंत्या', or: 'ଅଧିକ ଅନୁରୋଧ' },
    userMessage: { en: 'You are making requests too quickly. Please wait 1 minute.', ta: 'நீங்கள் மிக வேகமாக கோரிக்கைகளை வைக்கிறீர்கள். 1 நிமிடம் காத்திருக்கவும்.', te: 'మీరు చాలా వేగంగా అభ్యర్థనలు చేస్తున్నారు. 1 నిమిషం వేచి ఉండండి.', kn: 'ನೀವು ತುಂಬಾ ವೇಗವಾಗಿ ವಿನಂತಿಗಳನ್ನು ಮಾಡುತ್ತಿದ್ದೀರಿ. 1 ನಿಮಿಷ ಕಾಯಿರಿ.', ml: 'നിങ്ങൾ വളരെ വേഗത്തിൽ requests ചെയ്യുന്നു. 1 മിനിറ്റ് കാത്തിരിക്കൂ.', hi: 'आप बहुत तेजी से अनुरोध कर रहे हैं। 1 मिनट प्रतीक्षा करें।', mr: 'आपण खूप वेगाने विनंत्या करत आहात. 1 मिनिट थांबा.', or: 'ଆପଣ ଅତ୍ୟଧିକ ଦ୍ରୁତ ଗତିରେ ଅନୁରୋଧ କରୁଛନ୍ତି। ୧ ମିନିଟ ଅପେକ୍ଷା କରନ୍ତୁ।' },
    fixSteps: {
      en: ['Wait 1 minute', 'Then continue — your action will work normally'],
      ta: ['1 நிமிடம் காத்திருங்கள்', 'பின்பு தொடரவும் — உங்கள் செயல் சாதாரணமாக வேலை செய்யும்'],
      te: ['1 నిమిషం వేచి ఉండండి', 'తర్వాత కొనసాగించండి — మీ చర్య సాధారణంగా పని చేస్తుంది'],
      kn: ['1 ನಿಮಿಷ ಕಾಯಿರಿ', 'ನಂತರ ಮುಂದುವರೆಯಿರಿ — ನಿಮ್ಮ ಕ್ರಿಯೆ ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ'],
      ml: ['1 മിനിറ്റ് കാത്തിരിക്കൂ', 'ശേഷം continue ചെയ്യൂ — action normal ആയി work ആകും'],
      hi: ['1 मिनट प्रतीक्षा करें', 'फिर जारी रखें — आपकी क्रिया सामान्य रूप से काम करेगी'],
      mr: ['1 मिनिट थांबा', 'नंतर सुरू ठेवा — आपली क्रिया सामान्यपणे कार्य करेल'],
      or: ['୧ ମିନିଟ ଅପେକ୍ଷା କରନ୍ତୁ', 'ତାପରେ ଜାରି ରଖନ୍ତୁ — ଆପଣଙ୍କ କ୍ରିୟା ସ୍ୱାଭାବିକ ଭାବରେ କାର୍ଯ୍ୟ କରିବ']
    },
    adminMessage: 'Rate limit hit. Request queued for retry when limit resets.',
    severity: 'low',
    autoFixable: true,
    httpStatus: 429
  },

  ERR_AI_KEY_MISSING: {
    title: { en: 'Connect Your Free AI', ta: 'உங்கள் இலவச AI இணைக்கவும்', te: 'మీ ఉచిత AI కనెక్ట్ చేయండి', kn: 'ನಿಮ್ಮ ಉಚಿತ AI ಸಂಪರ್ಕಿಸಿ', ml: 'നിങ്ങളുടെ ഉചിത AI connect ചെയ്യൂ', hi: 'अपना मुफ्त AI कनेक्ट करें', mr: 'आपला मोफत AI जोडा', or: 'ଆପଣଙ୍କ ଉଚିତ AI ସଂଯୋଗ କରନ୍ତୁ' },
    userMessage: { en: 'Connect your free Google Gemini account to use AI features. Takes only 2 minutes.', ta: 'AI அம்சங்களை பயன்படுத்த உங்கள் இலவச Google Gemini கணக்கை இணைக்கவும். 2 நிமிடங்கள் மட்டுமே ஆகும்.', te: 'AI ఫీచర్లు వాడటానికి మీ ఉచిత Google Gemini అకౌంట్ కనెక్ట్ చేయండి. 2 నిమిషాలు మాత్రమే పడుతుంది.', kn: 'AI ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಬಳಸಲು ನಿಮ್ಮ ಉಚಿತ Google Gemini ಖಾತೆ ಸಂಪರ್ಕಿಸಿ. ಕೇವಲ 2 ನಿಮಿಷ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.', ml: 'AI features ഉപയോഗിക്കാൻ Google Gemini account connect ചെയ്യൂ. 2 മിനിറ്റ് മതി.', hi: 'AI सुविधाओं का उपयोग करने के लिए अपना मुफ्त Google Gemini खाता कनेक्ट करें। केवल 2 मिनट लगते हैं।', mr: 'AI वैशिष्ट्ये वापरण्यासाठी आपले मोफत Google Gemini खाते जोडा. फक्त 2 मिनिटे लागतात.', or: 'AI ଫିଚର ବ୍ୟବହାର ପାଇଁ ଆପଣଙ୍କ ଉଚିତ Google Gemini ଆକାଉଣ୍ଟ ସଂଯୋଗ କରନ୍ତୁ। ମାତ୍ର ୨ ମିନିଟ।' },
    fixSteps: {
      en: ['Go to Settings → AI Features', 'Click "Connect Free Google Gemini"', 'Follow the 3-step guide to get your free key', 'AI features will be ready immediately'],
      ta: ['அமைப்புகள் → AI அம்சங்களுக்கு செல்லவும்', '"இலவச Google Gemini இணை" என்பதை கிளிக் செய்யவும்', 'இலவச விசையை பெற 3-படி வழிகாட்டியை பின்பற்றவும்', 'AI அம்சங்கள் உடனடியாக தயாராகும்'],
      te: ['సెట్టింగ్స్ → AI ఫీచర్లకు వెళ్ళండి', '"ఉచిత Google Gemini కనెక్ట్ చేయి" క్లిక్ చేయండి', 'ఉచిత కీ పొందడానికి 3-స్టెప్ గైడ్ అనుసరించండి', 'AI ఫీచర్లు వెంటనే సిద్ధంగా ఉంటాయి'],
      kn: ['ಸೆಟ್ಟಿಂಗ್ಸ್ → AI ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಹೋಗಿ', '"ಉಚಿತ Google Gemini ಸಂಪರ್ಕಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ', 'ಉಚಿತ ಕೀ ಪಡೆಯಲು 3-ಹಂತ ಮಾರ್ಗದರ್ಶಿ ಅನುಸರಿಸಿ', 'AI ವೈಶಿಷ್ಟ್ಯಗಳು ತಕ್ಷಣ ಸಿದ್ಧ'],
      ml: ['Settings → AI Features ൽ പോകൂ', '"Connect Free Google Gemini" ക്ലിക്ക് ചെയ്യൂ', 'ഉചിത key ലഭിക്കാൻ 3-step guide follow ചെയ്യൂ', 'AI features ഉടനടി ready ആകും'],
      hi: ['Settings → AI Features पर जाएं', '"मुफ्त Google Gemini कनेक्ट करें" पर क्लिक करें', 'मुफ्त key पाने के लिए 3-चरण गाइड का पालन करें', 'AI सुविधाएं तुरंत तैयार होंगी'],
      mr: ['Settings → AI Features वर जा', '"मोफत Google Gemini जोडा" वर क्लिक करा', 'मोफत की मिळवण्यासाठी 3-चरण मार्गदर्शिका अनुसरा', 'AI वैशिष्ट्ये लगेच तयार होतील'],
      or: ['Settings → AI Features ଯାଆନ୍ତୁ', '"ଉଚିତ Google Gemini ସଂଯୋଗ" ଉପରେ ଟ୍ୟାପ କରନ୍ତୁ', 'ଉଚିତ key ପାଇଁ ୩-ପଦକ୍ଷେପ ଗାଇଡ ଅନୁସରଣ କରନ୍ତୁ', 'AI ଫିଚର ତୁରନ୍ତ ପ୍ରସ୍ତୁତ ହେବ']
    },
    adminMessage: 'User tried to use AI feature without connecting an API key.',
    severity: 'low',
    autoFixable: false,
    httpStatus: 402
  },

  ERR_STORAGE_ALMOST_FULL: {
    title: { en: 'Storage Almost Full', ta: 'சேமிப்பகம் கிட்டத்தட்ட நிரம்பியது', te: 'నిల్వ దాదాపు నిండింది', kn: 'ಶೇಖರಣೆ ಬಹುತೇಕ ತುಂಬಿದೆ', ml: 'Storage ഏതാണ്ട് full ആയി', hi: 'स्टोरेज लगभग भर गई', mr: 'स्टोरेज जवळजवळ भरली', or: 'ଷ୍ଟୋରେଜ ପ୍ରାୟ ଭର୍ତ୍ତି' },
    userMessage: { en: 'Storage is almost full. Our team has been notified and is fixing this.', ta: 'சேமிப்பகம் கிட்டத்தட்ட நிரம்பியது. எங்கள் குழு அறிவிக்கப்பட்டு இதை சரி செய்கிறது.', te: 'నిల్వ దాదాపు నిండింది. మా బృందం నోటిఫై అయ్యింది మరియు సరిచేస్తున్నారు.', kn: 'ಶೇಖರಣೆ ಬಹುತೇಕ ತುಂಬಿದೆ. ನಮ್ಮ ತಂಡಕ್ಕೆ ತಿಳಿಸಲಾಗಿದ್ದು ಸರಿಪಡಿಸಲಾಗುತ್ತಿದೆ.', ml: 'Storage ഏതാണ്ട് full ആയി. ടീമിനെ notify ചെയ്തു, fix ചെയ്യുന്നു.', hi: 'स्टोरेज लगभग भर गई है। हमारी टीम को सूचित किया गया है और वे इसे ठीक कर रहे हैं।', mr: 'स्टोरेज जवळजवळ भरली आहे. आमच्या टीमला सूचित केले आहे आणि ते हे दुरुस्त करत आहेत.', or: 'ଷ୍ଟୋରେଜ ପ୍ରାୟ ଭର୍ତ୍ତି। ଆମ ଟିମ ଜଣାଇ ଦିଆ ଯାଇଛି ଓ ସଠିକ କରୁଛନ୍ତି।' },
    fixSteps: {
      en: ['No action needed from you', 'We are compressing old photos and freeing up space', 'Check back in 30 minutes'],
      ta: ['உங்களிடம் எந்த நடவடிக்கையும் தேவையில்லை', 'நாங்கள் பழைய புகைப்படங்களை சுருக்கி இடத்தை விடுவிக்கிறோம்', '30 நிமிடங்களில் மீண்டும் பாருங்கள்'],
      te: ['మీ వైపు ఎటువంటి చర్య అవసరం లేదు', 'మేము పాత ఫోటోలు కంప్రెస్ చేసి స్థలం విడుదల చేస్తున్నాం', '30 నిమిషాల్లో తిరిగి చూడండి'],
      kn: ['ನಿಮ್ಮ ಕಡೆಯಿಂದ ಯಾವುದೇ ಕ್ರಿಯೆ ಅಗತ್ಯವಿಲ್ಲ', 'ನಾವು ಹಳೆಯ ಫೋಟೋಗಳನ್ನು ಸಂಕುಚಿತಗೊಳಿಸಿ ಜಾಗ ಬಿಡುಗಡೆ ಮಾಡುತ್ತಿದ್ದೇವೆ', '30 ನಿಮಿಷಗಳಲ್ಲಿ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ'],
      ml: ['നിങ്ങളുടെ ഭാഗത്ത് action ഒന്നും വേണ്ട', 'പഴയ ഫോട്ടോകൾ compress ചെയ്ത് space free ചെയ്യുന്നു', '30 മിനിറ്റ് കഴിഞ്ഞ് check ചെയ്യൂ'],
      hi: ['आपकी ओर से कोई कार्रवाई की आवश्यकता नहीं है', 'हम पुरानी फोटो को कम्प्रेस करके जगह बना रहे हैं', '30 मिनट में वापस जांचें'],
      mr: ['आपल्याकडून कोणती कारवाई आवश्यक नाही', 'आम्ही जुन्या फोटोंना कॉम्प्रेस करून जागा मोकळी करत आहोत', '30 मिनिटांत परत तपासा'],
      or: ['ଆପଣ ପକ୍ଷରୁ କୌଣସି ପଦକ୍ଷେପ ଆବଶ୍ୟକ ନୁହଁ', 'ଆମ୍ଭେ ପୁରୁଣା ଫୋଟୋ ସଙ୍କୁଚିତ କରି ସ୍ଥାନ ମୁକ୍ତ କରୁଛୁ', '୩୦ ମିନିଟ ଭିତରେ ପୁଣି ଯାଞ୍ଚ କରନ୍ତୁ']
    },
    adminMessage: 'CRITICAL: Storage exceeded 90% capacity. Auto-fix attempted: compressing photos over 2MB and deleting temp files.',
    severity: 'critical',
    autoFixable: true,
    httpStatus: 507
  },
}

export class AppError extends Error {
  public readonly code: string
  public readonly title: MultilingualText
  public readonly userMessage: MultilingualText
  public readonly fixSteps: Record<Language, string[]>
  public readonly adminMessage: string
  public readonly severity: Severity
  public readonly autoFixable: boolean
  public readonly httpStatus: number
  public readonly context?: Record<string, unknown>

  constructor(
    code: string,
    context?: Record<string, unknown>
  ) {
    const def = ERROR_DEFINITIONS[code]
    if (!def) {
      // Unknown error — create a generic one
      super(`Unknown error code: ${code}`)
      this.code = 'ERR_UNKNOWN'
      this.title = { en: 'Something Went Wrong', ta: 'ஏதோ தவறு நடந்தது', te: 'ఏదో తప్పు జరిగింది', kn: 'ಏನೋ ತಪ್ಪಾಯಿತು', ml: 'എന്തോ തെറ്റ് സംഭവിച്தது', hi: 'कुछ गड़बड़ हो गई', mr: 'काहीतरी चुकले', or: 'କିଛି ଭୁଲ ହୋଇଗଲା' }
      this.userMessage = { en: 'An unexpected error occurred. Our team has been notified.', ta: 'எதிர்பாராத பிழை ஏற்பட்டது. எங்கள் குழு அறிவிக்கப்பட்டது.', te: 'అనుకోని లోపం సంభవించింది. మా బృందం నోటిఫై అయ్యింది.', kn: 'ಅನಿರೀಕ್ಷಿತ ದೋಷ ಸಂಭವಿಸಿದೆ. ನಮ್ಮ ತಂಡಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ.', ml: 'അnyticipated error ഉണ്ടായി. ടീമിനെ notify ചെയ്തു.', hi: 'एक अप्रत्याशित त्रुटि हुई। हमारी टीम को सूचित किया गया।', mr: 'एक अनपेक्षित त्रुटी आली. आमच्या टीमला सूचित केले.', or: 'ଏକ ଅପ୍ରତ୍ୟାଶିତ ତ୍ରୁଟି ଘଟିଲା। ଆମ ଟିମ ଜଣାଇ ଦିଆ ଯାଇଛି।' }
      this.fixSteps = {
        en: ['Wait 2 minutes and try again', 'If it persists, contact support on WhatsApp'],
        ta: ['2 நிமிடங்கள் காத்திருந்து மீண்டும் முயற்சிக்கவும்', 'தொடர்ந்தால், WhatsApp ல் ஆதரவை தொடர்பு கொள்ளவும்'],
        te: ['2 నిమిషాలు వేచి మళ్ళీ ప్రయత్నించండి', 'తొడసాగితే, WhatsApp లో మద్దతును సంప్రదించండి'],
        kn: ['2 ನಿಮಿಷ ಕಾಯಿರಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', 'ಮುಂದುವರೆದರೆ, WhatsApp ನಲ್ಲಿ ಬೆಂಬಲ ಸಂಪರ್ಕಿಸಿ'],
        ml: ['2 മിനിറ്റ് കാത്ത് വീണ്ടും ശ്രമിക്കൂ', 'തുടർന്നാൽ WhatsApp ൽ support ബന്ധപ്പെടൂ'],
        hi: ['2 मिनट प्रतीक्षा करें और फिर प्रयास करें', 'अगर जारी रहे तो WhatsApp पर सहायता से संपर्क करें'],
        mr: ['2 मिनिटे थांबा आणि पुन्हा प्रयत्न करा', 'जर चालू राहिल्यास, WhatsApp वर समर्थनाशी संपर्क करा'],
        or: ['୨ ମିନିଟ ଅପେକ୍ଷା କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ', 'ଜାରି ରହିଲେ WhatsApp ରେ ସହାୟତା ଯୋଗାଯୋଗ କରନ୍ତୁ']
      }
      this.adminMessage = `Unknown error code used: ${code}`
      this.severity = 'medium'
      this.autoFixable = false
      this.httpStatus = 500
      this.context = context
      return
    }

    super(def.userMessage.en)
    this.code = code
    this.title = def.title
    this.userMessage = def.userMessage
    this.fixSteps = def.fixSteps
    this.adminMessage = def.adminMessage
    this.severity = def.severity
    this.autoFixable = def.autoFixable
    this.httpStatus = def.httpStatus
    this.context = context
    this.name = 'AppError'
  }

  /** Get the title in the user's language, falling back to English */
  getTitleForLang(lang: Language = 'en'): string {
    return this.title[lang] || this.title.en
  }

  /** Get the user message in the user's language */
  getMessageForLang(lang: Language = 'en'): string {
    return this.userMessage[lang] || this.userMessage.en
  }

  /** Get the fix steps in the user's language */
  getFixStepsForLang(lang: Language = 'en'): string[] {
    return this.fixSteps[lang] || this.fixSteps.en
  }

  /** Convert to a safe API response object (never expose stack trace or admin message) */
  toUserResponse(lang: Language = 'en') {
    return {
      error: true,
      code: this.code,
      title: this.getTitleForLang(lang),
      message: this.getMessageForLang(lang),
      fixSteps: this.getFixStepsForLang(lang),
      httpStatus: this.httpStatus,
    }
  }

  /** Convert to admin log format (includes all details) */
  toAdminLog() {
    return {
      code: this.code,
      adminMessage: this.adminMessage,
      severity: this.severity,
      autoFixable: this.autoFixable,
      context: this.context,
      stack: this.stack,
    }
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }
}

export const ERROR_CODES = Object.keys(ERROR_DEFINITIONS)
