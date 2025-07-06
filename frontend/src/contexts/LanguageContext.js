import React, { createContext, useState, useContext, useEffect } from "react";

// Language translations
const translations = {
  hi: {
    // Header
    appTitle: "संवाद सहायक",
    appSubtitle: "सरकारी योजनाओं की जानकारी अपनी भाषा में",
    searchSchemes: "योजनाएँ खोजें",
    chat: "चैट",

    // Welcome message
    welcomeTitle: "संवाद सहायक में आपका स्वागत है!",
    welcomeDesc: "सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें",

    // Input area
    typeQuestion: "अपना प्रश्न यहां टाइप करें...",
    send: "भेजें",
    recording: "रिकॉर्डिंग...",

    // Message actions
    listen: "सुनें",
    listenAgain: "फिर से सुनें",
    save: "सहेजें",
    saveNote: "नोट सहेजें",
    noteSaved: "नोट सहेज लिया गया है!",

    // Yojana Buddy
    yojanaBuddy: "योजना बडी - व्यक्तिगत सहायता",
    yojanaBuddyDesc:
      "कुछ सवालों के जवाब देकर अपने लिए उपयुक्त सरकारी योजनाएँ खोजें",
    personalInfo: "व्यक्तिगत जानकारी",
    age: "आयु",
    select: "चुनें",
    years: "वर्ष",
    above: "से अधिक",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    next: "अगला",
    back: "पीछे",
    occupationIncome: "व्यवसाय और आय",
    occupation: "व्यवसाय",
    farmer: "किसान",
    selfEmployed: "स्वरोजगार",
    salaried: "वेतनभोगी",
    unemployed: "बेरोजगार",
    student: "छात्र",
    retired: "सेवानिवृत्त",
    informalWorker: "असंगठित क्षेत्र कर्मचारी",
    monthlyIncome: "मासिक आय",
    belowTenK: "₹10,000 से कम",
    aboveFiftyK: "₹50,000 से अधिक",
    location: "निवास स्थान",
    rural: "ग्रामीण",
    urban: "शहरी",
    interests: "रुचि के क्षेत्र",
    selectInterests: "अपनी रुचि के क्षेत्र चुनें",
    housing: "आवास",
    education: "शिक्षा",
    healthcare: "स्वास्थ्य सेवा",
    insurance: "बीमा",
    pension: "पेंशन",
    skillDev: "कौशल विकास",
    financial: "वित्तीय सेवाएँ",
    agriculture: "कृषि",
    findSchemes: "योजनाएँ खोजें",
    recommendedSchemes: "आपके लिए अनुशंसित योजनाएँ",
    noSchemesFound: "आपकी प्रोफ़ाइल के लिए कोई उपयुक्त योजना नहीं मिली",
    tryAgain: "पुनः प्रयास करें",
    learnMore: "अधिक जानकारी",
    startOver: "नए सिरे से शुरू करें",

    // Language selector
    language: "भाषा",
    hindi: "हिन्दी",
    english: "अंग्रेजी",
    bengali: "बंगाली",
    tamil: "तमिल",
    telugu: "तेलुगु",

    // Error messages
    error: "त्रुटि",
    tryAgainLater: "बाद में पुनः प्रयास करें",
    offlineMessage: "इंटरनेट कनेक्शन नहीं है। बाद में पुनः प्रयास करें।",

    // PWA
    installApp: "ऐप इंस्टॉल करें",
    install: "इंस्टॉल",
    dismiss: "बंद करें",
  },
  en: {
    // Header
    appTitle: "Samvaad Sahayak",
    appSubtitle: "Government scheme information in your language",
    searchSchemes: "Search Schemes",
    chat: "Chat",

    // Welcome message
    welcomeTitle: "Welcome to Samvaad Sahayak!",
    welcomeDesc: "Ask any question about government schemes",

    // Input area
    typeQuestion: "Type your question here...",
    send: "Send",
    recording: "Recording...",

    // Message actions
    listen: "Listen",
    listenAgain: "Listen Again",
    save: "Save",
    saveNote: "Save Note",
    noteSaved: "Note saved successfully!",

    // Yojana Buddy
    yojanaBuddy: "Yojana Buddy - Personal Assistant",
    yojanaBuddyDesc:
      "Answer a few questions to find suitable government schemes for you",
    personalInfo: "Personal Information",
    age: "Age",
    select: "Select",
    years: "Years",
    above: "Above",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    next: "Next",
    back: "Back",
    occupationIncome: "Occupation and Income",
    occupation: "Occupation",
    farmer: "Farmer",
    selfEmployed: "Self Employed",
    salaried: "Salaried",
    unemployed: "Unemployed",
    student: "Student",
    retired: "Retired",
    informalWorker: "Informal Worker",
    monthlyIncome: "Monthly Income",
    belowTenK: "Below ₹10,000",
    aboveFiftyK: "Above ₹50,000",
    location: "Location",
    rural: "Rural",
    urban: "Urban",
    interests: "Interests",
    selectInterests: "Select your areas of interest",
    housing: "Housing",
    education: "Education",
    healthcare: "Healthcare",
    insurance: "Insurance",
    pension: "Pension",
    skillDev: "Skill Development",
    financial: "Financial Services",
    agriculture: "Agriculture",
    findSchemes: "Find Schemes",
    recommendedSchemes: "Recommended schemes for you",
    noSchemesFound: "No suitable schemes found for your profile",
    tryAgain: "Try Again",
    learnMore: "Learn More",
    startOver: "Start Over",

    // Language selector
    language: "Language",
    hindi: "Hindi",
    english: "English",
    bengali: "Bengali",
    tamil: "Tamil",
    telugu: "Telugu",

    // Error messages
    error: "Error",
    tryAgainLater: "Try again later",
    offlineMessage: "No internet connection. Please try again later.",

    // PWA
    installApp: "Install App",
    install: "Install",
    dismiss: "Dismiss",
  },
  ta: {
    // Header
    appTitle: "சம்வாத் சகாயக்",
    appSubtitle: "அரசு திட்டங்கள் பற்றிய தகவல்கள் உங்கள் மொழியில்",
    searchSchemes: "திட்டங்களைத் தேடுங்கள்",
    chat: "செயட்",

    // Welcome message
    welcomeTitle: "சம்வாத் சகாயக்கில் வரவேற்கிறோம்!",
    welcomeDesc: "அரசு திட்டங்கள் பற்றிய எந்த கேள்வியையும் கேளுங்கள்",

    // Input area
    typeQuestion: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...",
    send: "அனுப்பு",
    recording: "பதிவு செய்கிறது...",

    // Message actions
    listen: "கேளுங்கள்",
    listenAgain: "மீண்டும் கேளுங்கள்",
    save: "சேமி",
    saveNote: "குறிப்பு சேமி",
    noteSaved: "குறிப்பு வெற்றிகரமாக சேமிக்கப்பட்டது!",

    // Yojana Buddy
    yojanaBuddy: "யோஜனா நண்பர் - தனிப்பட்ட உதவி",
    yojanaBuddyDesc:
      "சில கேள்விகளுக்கு பதிலளித்து உங்களுக்கான அரசு திட்டங்களைக் கண்டறியுங்கள்",
    personalInfo: "தனிப்பட்ட தகவல்",
    age: "வயது",
    select: "தேர்ந்தெடு",
    years: "ஆண்டுகள்",
    above: "மேல்",
    gender: "பாலினம்",
    male: "ஆண்",
    female: "பெண்",
    other: "மற்றவை",
    next: "அடுத்து",
    back: "பின்னால்",
    occupationIncome: "தொழில் மற்றும் வருமானம்",
    occupation: "தொழில்",
    farmer: "விவசாயி",
    selfEmployed: "சுய தொழில்",
    salaried: "சம்பளம்",
    unemployed: "வேலையில்லாதவர்",
    student: "மாணவர்",
    retired: "ஓய்வுபெற்றவர்",
    informalWorker: "முறைசாரா துறை பணியாளர்",
    monthlyIncome: "மாத வருமானம்",
    belowTenK: "₹10,000 க்கும் குறைவு",
    aboveFiftyK: "₹50,000 க்கும் அதிகம்",
    location: "வசிப்பிடம்",
    rural: "கிராமப்புறம்",
    urban: "நகர்ப்புறம்",
    interests: "ஆர்வமுள்ள துறைகள்",
    selectInterests: "உங்கள் ஆர்வமுள்ள துறைகளைத் தேர்ந்தெடுங்கள்",
    housing: "வீட்டுவசதி",
    education: "கல்வி",
    healthcare: "சுகாதார சேவை",
    insurance: "காப்பீடு",
    pension: "ஓய்வூதியம்",
    skillDev: "திறன் மேம்பாடு",
    financial: "நிதி சேவைகள்",
    agriculture: "விவசாயம்",
    findSchemes: "திட்டங்களைக் கண்டறி",
    recommendedSchemes: "உங்களுக்கு பரிந்துரைக்கப்பட்ட திட்டங்கள்",
    noSchemesFound:
      "உங்கள் சுயவிவரத்திற்கு பொருத்தமான திட்டங்கள் எதுவும் காணப்படவில்லை",
    tryAgain: "மீண்டும் முயற்சி செய்யுங்கள்",
    learnMore: "மேலும் அறிய",
    startOver: "மீண்டும் தொடங்கு",

    // Language selector
    language: "மொழி",
    hindi: "இந்தி",
    english: "ஆங்கிலம்",
    bengali: "வங்காளம்",
    tamil: "தமிழ்",
    telugu: "தெலுங்கு",

    // Error messages
    error: "பிழை",
    tryAgainLater: "பின்னர் மீண்டும் முயற்சிக்கவும்",
    offlineMessage: "இணைய இணைப்பு இல்லை। பின்னர் முயற்சிக்கவும்.",

    // PWA
    installApp: "ஆப்பை நிறுவு",
    install: "நிறுவு",
    dismiss: "மூடு",
  },
  te: {
    // Header
    appTitle: "సంవాద్ సహాయక్",
    appSubtitle: "ప్రభుత్వ పథకాల గురించిన సమాచారం మీ భాషలో",
    searchSchemes: "పథకాలను వెతకండి",
    chat: "చాట్",

    // Welcome message
    welcomeTitle: "సంవాద్ సహాయక్‌కు స్వాగతం!",
    welcomeDesc: "ప్రభుత్వ పథకాల గురించి ఏదైనా ప్రశ్న అడగండి",

    // Input area
    typeQuestion: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...",
    send: "పంపండి",
    recording: "రికార్డింగ్...",

    // Message actions
    listen: "వినండి",
    listenAgain: "మళ్లీ వినండి",
    save: "సేవ్",
    saveNote: "నోట్ సేవ్ చేయండి",
    noteSaved: "నోట్ విజయవంతంగా సేవ్ చేయబడింది!",

    // Yojana Buddy
    yojanaBuddy: "యోజనా బడ్డీ - వ్యక్తిగత సహాయం",
    yojanaBuddyDesc:
      "కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వడం ద్వారా మీకు తగిన ప్రభుత్వ పథకాలను కనుగొనండి",
    personalInfo: "వ్యక్తిగత సమాచారం",
    age: "వయస్సు",
    select: "ఎంచుకోండి",
    years: "సంవత్సరాలు",
    above: "మీద",
    gender: "లింగం",
    male: "పురుషుడు",
    female: "స్త్రీ",
    other: "ఇతర",
    next: "తదుపరి",
    back: "వెనుకకు",
    occupationIncome: "వృత్తి మరియు ఆదాయం",
    occupation: "వృత్తి",
    farmer: "రైతు",
    selfEmployed: "స్వయం ఉపాధి",
    salaried: "జీతగాడు",
    unemployed: "నిరుద్యోగి",
    student: "విద్యార్థి",
    retired: "పదవీ విరమణ పొందినవాడు",
    informalWorker: "అసంఘటిత రంగ కార్మికుడు",
    monthlyIncome: "నెలవారీ ఆదాయం",
    belowTenK: "₹10,000 కంటే తక్కువ",
    aboveFiftyK: "₹50,000 కంటే ఎక్కువ",
    location: "నివాసం",
    rural: "గ్రామీణ",
    urban: "పట్టణ",
    interests: "ఆసక్తి ఉన్న రంగాలు",
    selectInterests: "మీ ఆసక్తి ఉన్న రంగాలను ఎంచుకోండి",
    housing: "గృహాలు",
    education: "విద్య",
    healthcare: "ఆరోగ్య సేవ",
    insurance: "బీమా",
    pension: "పెన్షన్",
    skillDev: "నైపుణ్య అభివృద్ధి",
    financial: "ఆర్థిక సేవలు",
    agriculture: "వ్యవసాయం",
    findSchemes: "పథకాలను కనుగొనండి",
    recommendedSchemes: "మీకు సిఫార్సు చేయబడిన పథకాలు",
    noSchemesFound: "మీ ప్రొఫైల్‌కు తగిన పథకాలేవీ కనుగొనబడలేదు",
    tryAgain: "మళ్లీ ప్రయత్నించండి",
    learnMore: "మరింత తెలుసుకోండి",
    startOver: "మళ్లీ ప్రారంభించండి",

    // Language selector
    language: "భాష",
    hindi: "హిందీ",
    english: "ఆంగ్లం",
    bengali: "బెంగాలీ",
    tamil: "తమిళం",
    telugu: "తెలుగు",

    // Error messages
    error: "లోపం",
    tryAgainLater: "తర్వాత మళ్లీ ప్రయత్నించండి",
    offlineMessage: "ఇంటర్నెట్ కనెక్షన్ లేదు. దయచేసి తర్వాత ప్రయత్నించండి.",

    // PWA
    installApp: "యాప్ ఇన్‌స్టాల్ చేయండి",
    install: "ఇన్‌స్టాల్",
    dismiss: "మూసివేయండి",
  },
  bn: {
    // Header
    appTitle: "সংবাদ সহায়ক",
    appSubtitle: "সরকারি প্রকল্প সম্পর্কে নিজের ভাষায় তথ্য",
    searchSchemes: "প্রকল্প খুঁজুন",
    chat: "চ্যাট",

    // Welcome message
    welcomeTitle: "সংবাদ সহায়কে আপনাকে স্বাগতম!",
    welcomeDesc: "সরকারি প্রকল্প সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন",

    // Input area
    typeQuestion: "আপনার প্রশ্ন এখানে টাইপ করুন...",
    send: "পাঠান",
    recording: "রেকর্ডিং...",

    // Message actions
    listen: "শুনুন",
    listenAgain: "আবার শুনুন",
    save: "সংরক্ষণ",
    saveNote: "নোট সংরক্ষণ করুন",
    noteSaved: "নোট সফলভাবে সংরক্ষিত হয়েছে!",

    // Yojana Buddy
    yojanaBuddy: "যোজনা বন্ধু - ব্যক্তিগত সহায়তা",
    yojanaBuddyDesc:
      "কিছু প্রশ্নের উত্তর দিয়ে আপনার জন্য উপযুক্ত সরকারি প্রকল্প খুঁজুন",

    // Error messages
    error: "ত্রুটি",
    tryAgainLater: "পরে আবার চেষ্টা করুন",
    offlineMessage: "ইন্টারনেট সংযোগ নেই। পরে আবার চেষ্টা করুন।",

    // PWA
    installApp: "অ্যাপ ইনস্টল করুন",
    install: "ইনস্টল",
    dismiss: "বন্ধ করুন",
  },
};

// Create the context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to Hindi
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || "hi";
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Function to translate text
  const translateText = (key, lang = language) => {
    if (!translations[lang] || !translations[lang][key]) {
      // Fallback to Hindi if translation is missing
      return translations["hi"][key] || key;
    }
    return translations[lang][key];
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, translations, translateText }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext);

// Default export for the context itself (optional)
export default LanguageContext;
