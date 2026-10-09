import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  short: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', short: 'தமி' },
  { code: 'en', name: 'English', nativeName: 'English', short: 'Eng' },
  { code: 'bilingual', name: 'Tamil + English', nativeName: 'தமிழ் + Eng', short: 'இரு' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', short: 'हिं' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', short: 'తె' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', short: 'മ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', short: 'ಕ' },
];

interface TranslationEntry {
  en: string;
  ta: string;
  hi?: string;
  te?: string;
  ml?: string;
  kn?: string;
}

export const DICTIONARY: Record<string, TranslationEntry> = {
  appName: {
    en: 'Daily Work',
    ta: 'தினசரி வேலை',
    hi: 'दैनिक कार्य',
    te: 'రోజువారీ పని',
    ml: 'ദിവസവേതന ജോലി',
    kn: 'ದೈನಂದಿನ ಕೆಲಸ',
  },
  appTagline: {
    en: 'Connecting Daily Wage Earners & Local Employers',
    ta: 'தினக்கூலி தொழிலாளர்களையும் முதலாளிகளையும் இணைக்கும் தளம்',
    hi: 'दैनिक वेतन श्रमिकों और स्थानीय नियोक्ताओं को जोड़ना',
    te: 'రోజువారీ వేతన కార్మికులు మరియు యజమానులను కలుపుతోంది',
    ml: 'തൊഴിലാളികളെയും തൊഴിലുടമകളെയും ബന്ധിപ്പിക്കുന്നു',
    kn: 'ದೈನಂದಿನ ಕೂಲಿ ಕಾರ್ಮಿಕರು ಮತ್ತು ಮಾಲೀಕರನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ',
  },
  findWork: {
    en: 'Find Daily Work',
    ta: 'தினசரி வேலை தேட',
    hi: 'दैनिक कार्य खोजें',
    te: 'పనిని కనుగొనండి',
    ml: 'ജോലി കണ്ടെത്തുക',
    kn: 'ಕೆಲಸ ಹುಡುಕಿ',
  },
  postJob: {
    en: 'Post a Job',
    ta: 'வேலை பதிவு செய்ய',
    hi: 'काम पोस्ट करें',
    te: 'పనిని పోస్ట్ చేయండి',
    ml: 'ജോലി പോസ്റ്റ് ചെയ്യുക',
    kn: 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ',
  },
  registerAsWorker: {
    en: 'Worker Registration',
    ta: 'தொழிலாளி பதிவு',
    hi: 'श्रमिक पंजीकरण',
    te: 'కార్మికుల నమోదు',
    ml: 'തൊഴിലാളി രജിസ്ട്രേഷൻ',
    kn: 'ಕಾರ್ಮಿಕ ನೋಂದಣಿ',
  },
  browseWorkers: {
    en: 'Browse Workers',
    ta: 'தொழிலாளர்கள் விவரம்',
    hi: 'श्रमिक देखें',
    te: 'కార్మికులను బ్రౌజ్ చేయండి',
    ml: 'തൊഴിലാളികളെ കാണുക',
    kn: 'ಕಾರ್ಮಿಕರ ಪಟ್ಟಿ',
  },
  jobSeekerRole: {
    en: 'Job Seeker',
    ta: 'வேலை தேடுபவர்',
    hi: 'नौकरी चाहने वाला',
    te: 'ఉద్యోగార్ధి',
    ml: 'തൊഴിലന്വേഷകൻ',
    kn: 'ಉದ್ಯೋಗಾಕಾಂಕ್ಷಿ',
  },
  employerRole: {
    en: 'Employer',
    ta: 'முதலாளி / வேலை தருபவர்',
    hi: 'नियोक्ता / मालिक',
    te: 'యజమాని',
    ml: 'തൊഴിലുടമ',
    kn: 'ಮಾಲೀಕ / ಉದ್ಯೋಗದಾತ',
  },
  allCategories: {
    en: 'All Categories',
    ta: 'அனைத்து வேலைகள்',
    hi: 'सभी श्रेणियां',
    te: 'అన్ని విభాగాలు',
    ml: 'എല്ലാ വിഭാഗങ്ങളും',
    kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
  },
  allLocations: {
    en: 'All Locations',
    ta: 'அனைத்து இடங்கள்',
    hi: 'सभी स्थान',
    te: 'అన్ని స్థలాలు',
    ml: 'എല്ലാ സ്ഥലങ്ങളും',
    kn: 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು',
  },
  filterByCategory: {
    en: 'Filter by Category',
    ta: 'வேலை வகை',
    hi: 'श्रेणी के अनुसार छांटें',
    te: 'విభాగం వారీగా',
    ml: 'വിഭാഗം അനുസരിച്ച്',
    kn: 'ವರ್ಗದ ಪ್ರಕಾರ',
  },
  filterByLocation: {
    en: 'Filter by Location',
    ta: 'இடம் / ஊர்',
    hi: 'स्थान के अनुसार छांटें',
    te: 'స్థలం వారీగా',
    ml: 'സ്ഥലം അനുസരിച്ച്',
    kn: 'ಸ್ಥಳದ ಪ್ರಕಾರ',
  },
  dailyWage: {
    en: 'Daily Wage',
    ta: 'தினக்கூலி',
    hi: 'दैनिक मजदूरी',
    te: 'రోజువారీ కూలి',
    ml: 'ദിവസക്കൂലി',
    kn: 'ದೈನಂದಿನ ಕೂಲಿ',
  },
  expectedWage: {
    en: 'Expected Daily Wage',
    ta: 'எதிர்பார்க்கும் தினக்கூலி',
    hi: 'अपेक्षित दैनिक मजदूरी',
    te: 'ఆశించిన రోజువారీ కూలి',
    ml: 'പ്രതീക്ഷിക്കുന്ന ദിവസക്കൂലി',
    kn: 'ಅಪೇಕ್ಷಿತ ದೈನಂದಿನ ಕೂಲಿ',
  },
  workersNeeded: {
    en: 'Workers Needed',
    ta: 'ஆட்கள் தேவை',
    hi: 'श्रमिकों की आवश्यकता',
    te: 'కార్మికులు అవసరం',
    ml: 'തൊഴിലാളികളെ ആവശ്യമുണ്ട്',
    kn: 'ಕಾರ್ಮಿಕರ ಅಗತ್ಯವಿದೆ',
  },
  jobDate: {
    en: 'Job Date',
    ta: 'வேலை நாள்',
    hi: 'कार्य की तारीख',
    te: 'పని తేదీ',
    ml: 'തീയതി',
    kn: 'ಕೆಲಸದ ದಿನಾಂಕ',
  },
  employerName: {
    en: 'Employer Name / Business',
    ta: 'முதலாளி / நிறுவனப் பெயர்',
    hi: 'नियोक्ता का नाम / व्यवसाय',
    te: 'యజమాని పేరు',
    ml: 'തൊഴിലുടമയുടെ പേര്',
    kn: 'ಮಾಲೀಕರ ಹೆಸರು',
  },
  workerName: {
    en: 'Your Name',
    ta: 'உங்கள் பெயர்',
    hi: 'आपका नाम',
    te: 'మీ పేరు',
    ml: 'നിങ്ങളുടെ പേര്',
    kn: 'ನಿಮ್ಮ ಹೆಸರು',
  },
  mobileNumber: {
    en: 'Mobile Number',
    ta: 'கைபேசி எண்',
    hi: 'मोबाइल नंबर',
    te: 'మొబైల్ నంబర్',
    ml: 'മൊബൈൽ നമ്പർ',
    kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
  },
  contactNumber: {
    en: 'Contact Number',
    ta: 'தொடர்பு எண்',
    hi: 'संपर्क नंबर',
    te: 'సంప్రదింపు నంబర్',
    ml: 'ബന്ധപ്പെടേണ്ട നമ്പർ',
    kn: 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ',
  },
  callNow: {
    en: 'Call Now',
    ta: 'போன் செய்ய',
    hi: 'अभी कॉल करें',
    te: 'ఇప్పుడే కాల్ చేయండి',
    ml: 'വിളിക്കുക',
    kn: 'ಈಗಲೇ ಕರೆ ಮಾಡಿ',
  },
  whatsapp: {
    en: 'WhatsApp',
    ta: 'வாட்ஸ்அப்',
    hi: 'व्हाट्सएप',
    te: 'వాట్సాప్',
    ml: 'വാട്ട്‌സ്ആപ്പ്',
    kn: 'ವಾಟ್ಸಾಪ್',
  },
  jobDetails: {
    en: 'Job Details',
    ta: 'முழு விவரம்',
    hi: 'कार्य विवरण',
    te: 'పని వివరాలు',
    ml: 'വിശദാംശങ്ങൾ',
    kn: 'ಕೆಲಸದ ವಿವರಗಳು',
  },
  notesLabel: {
    en: 'Work Description / Address',
    ta: 'வேலை விவரம் / முழு முகவரி',
    hi: 'कार्य विवरण / पता',
    te: 'పని వివరణ / చిరునామా',
    ml: 'വിവരണം / വിലാസം',
    kn: 'ಕೆಲಸದ ವಿವರಣೆ / ವಿಳಾಸ',
  },
  submitPostJob: {
    en: 'Publish Job Now',
    ta: 'வேலையை உடனடியாக பதிவு செய்க',
    hi: 'कार्य अभी प्रकाशित करें',
    te: 'పనిని ఇప్పుడే ప్రచురించండి',
    ml: 'ജോലി പ്രസിദ്ധീകരിക്കുക',
    kn: 'ಕೆಲಸವನ್ನು ಪ್ರಕಟಿಸಿ',
  },
  submitRegisterSeeker: {
    en: 'Complete Registration',
    ta: 'பதிவை உறுதி செய்க',
    hi: 'पंजीकरण पूरा करें',
    te: 'నమోదు పూర్తి చేయండి',
    ml: 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക',
    kn: 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ',
  },
  urgentBadge: {
    en: 'Urgent Today',
    ta: 'இன்றைய அவசர தேவை',
    hi: 'आज तत्काल आवश्यकता',
    te: 'ఈరోజు అత్యవసరం',
    ml: 'അടിയന്തിരം',
    kn: 'ತುರ್ತು ಅಗತ್ಯ',
  },
  perDay: {
    en: '/ day',
    ta: '/ நாள்',
    hi: '/ दिन',
    te: '/ రోజు',
    ml: '/ ദിവസം',
    kn: '/ ದಿನ',
  },
  people: {
    en: 'Workers',
    ta: 'ஆட்கள்',
    hi: 'श्रमिक',
    te: 'కార్మికులు',
    ml: 'ആളുകൾ',
    kn: 'ಜನರು',
  },
  experience: {
    en: 'Years Experience',
    ta: 'ஆண்டு அனுபவம்',
    hi: 'वर्षों का अनुभव',
    te: 'సంవత్సరాల అనుభవం',
    ml: 'വർഷത്തെ പരിചയം',
    kn: 'ವರ್ಷಗಳ ಅನುಭವ',
  },
  noJobsFound: {
    en: 'No jobs match your selected filters. Try changing location or category.',
    ta: 'தேர்ந்தெடுத்த வகைக்கு வேலைகள் இல்லை. இடத்தை அல்லது வகையை மாற்றி பார்க்கவும்.',
    hi: 'कोई कार्य नहीं मिला। स्थान या श्रेणी बदलकर प्रयास करें।',
    te: 'పనులు దొరకలేదు. స్థలం లేదా విభాగం మార్చి ప్రయత్నించండి.',
    ml: 'ജോലികൾ ലഭ്യമല്ല. സ്ഥലം മാറ്റി നോക്കുക.',
    kn: 'ಯಾವುದೇ ಕೆಲಸ ಕಂಡುಬಂದಿಲ್ಲ. ಸ್ಥಳ ಅಥವಾ ವರ್ಗ ಬದಲಾಯಿಸಿ.',
  },
  noWorkersFound: {
    en: 'No registered workers found in this category.',
    ta: 'இந்த பிரிவில் தொழிலாளர்கள் இல்லை.',
    hi: 'इस श्रेणी में कोई श्रमिक नहीं मिला।',
    te: 'ఈ విభాగంలో కార్మికులు లేరు.',
    ml: 'ഈ വിഭാഗത്തിൽ തൊഴിലാളികളില്ല.',
    kn: 'ಈ ವರ್ಗದಲ್ಲಿ ಕಾರ್ಮಿಕರಿಲ್ಲ.',
  },
  successJobPosted: {
    en: 'Job posted successfully! Workers can now call or WhatsApp you directly.',
    ta: 'வேலை வெற்றிகரமாக பதிவு செய்யப்பட்டது! தொழிலாளர்கள் உங்களை தொடர்புகொள்வார்கள்.',
    hi: 'कार्य सफलतापूर्वक पोस्ट किया गया! श्रमिक अब आपसे सीधे संपर्क कर सकते हैं।',
    te: 'పని విజయవంతంగా పోస్ట్ చేయబడింది! కార్మికులు మిమ్మల్ని నేరుగా సంప్రదించగలరు.',
    ml: 'ജോലി വിജയകരമായി പോസ്റ്റ് ചെയ്തു! തൊഴിലാളികൾക്ക് ബന്ധപ്പെടാം.',
    kn: 'ಕೆಲಸ ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಆಗಿದೆ! ಕಾರ್ಮಿಕರು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.',
  },
  successSeekerRegistered: {
    en: 'You are registered! Local employers can now contact you for daily jobs.',
    ta: 'உங்கள் பதிவு முடிந்தது! உள்ளூர் முதலாளிகள் உங்களை தொடர்புகொள்வார்கள்.',
    hi: 'आपका पंजीकरण पूरा हुआ! स्थानीय नियोक्ता आपसे संपर्क कर सकते हैं।',
    te: 'మీ నమోదు పూర్తయింది! స్థానిక యజమానులు మిమ్మల్ని సంప్రదించగలరు.',
    ml: 'നിങ്ങൾ രജിസ്റ്റർ ചെയ്തു! തൊഴിലുടമകൾക്ക് ബന്ധപ്പെടാം.',
    kn: 'ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ! ಸ್ಥಳೀಯ ಮಾಲೀಕರು ಸಂಪರ್ಕಿಸಬಹುದು.',
  },
  backToHome: {
    en: 'Back to Home',
    ta: 'முகப்புக்கு திரும்புக',
    hi: 'होम पर वापस जाएं',
    te: 'హోమ్‌కు తిరిగి వెళ్ళండి',
    ml: 'ഹോമിലേക്ക് മടങ്ങുക',
    kn: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
  },
  today: {
    en: 'Today',
    ta: 'இன்று',
    hi: 'आज',
    te: 'ఈరోజు',
    ml: 'ഇന്ന്',
    kn: 'ಇಂದು',
  },
  tomorrow: {
    en: 'Tomorrow',
    ta: 'நாளை',
    hi: 'कल',
    te: 'రేపు',
    ml: 'നാളെ',
    kn: 'ನಾಳೆ',
  },
  helpSupport: {
    en: 'Help & Support',
    ta: 'உதவி & ஆதரவு',
    hi: 'सहायता और समर्थन',
    te: 'సహాయం మరియు మద్దతు',
    ml: 'സഹായവും പിന്തുണയും',
    kn: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
  },
  settings: {
    en: 'Settings',
    ta: 'அமைப்புகள்',
    hi: 'सेटिंग्स',
    te: 'సెట్టింగ్‌లు',
    ml: 'ക്രമീകരണങ്ങൾ',
    kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  },
  contactManagement: {
    en: 'Contact Management Team',
    ta: 'நிர்வாகக் குழுவை தொடர்பு கொள்க',
    hi: 'प्रबंधन टीम से संपर्क करें',
    te: 'మేనేజ్‌మెంట్ బృందాన్ని సంప్రదించండి',
    ml: 'മാനേജ്‌മെന്റ് ടീമിനെ ബന്ധപ്പെടുക',
    kn: 'ಆಡಳಿತ ಮಂಡಳಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ',
  },
  securityAndSafety: {
    en: 'Security & Safe Encryption',
    ta: 'பாதுகாப்பு & என்க்ரிப்ஷன்',
    hi: 'सुरक्षा और सुरक्षित एन्क्रिप्शन',
    te: 'భద్రత మరియు ఎన్‌క్రిప్షన్',
    ml: 'സുരക്ഷയും എൻക്രിപ്ഷനും',
    kn: 'ಭದ್ರತೆ ಮತ್ತು ಎನ್‌ಕ್ರಿಪ್ಶನ್',
  },
  navHome: {
    en: 'Home',
    ta: 'முகப்பு',
    hi: 'होम',
    te: 'హోమ్',
    ml: 'ഹോം',
    kn: 'ಮುಖಪುಟ',
  },
  navJobs: {
    en: 'Jobs',
    ta: 'வேலைகள்',
    hi: 'काम खोजें',
    te: 'పనులు',
    ml: 'ജോലികൾ',
    kn: 'ಕೆಲಸಗಳು',
  },
  navPostJob: {
    en: 'Post Job',
    ta: 'பதிவிட',
    hi: 'काम पोस्ट करें',
    te: 'పని పోస్ట్',
    ml: 'ജോലി പോസ്റ്റ്',
    kn: 'ಕೆಲಸ ಪೋಸ್ಟ್',
  },
  navWorkers: {
    en: 'Workers',
    ta: 'ஆட்கள்',
    hi: 'श्रमिक',
    te: 'కార్మికులు',
    ml: 'തൊഴിലാളികൾ',
    kn: 'ಕಾರ್ಮಿಕರು',
  },
  navPlans: {
    en: 'Plans',
    ta: 'சந்தா',
    hi: 'योजनाएं',
    te: 'ప్రణాళికలు',
    ml: 'പ്ലാനുകൾ',
    kn: 'ಯೋಜನೆಗಳು',
  },
};

// Global fallback translation dictionary by English and Tamil keys
export const GLOBAL_TRANSLATIONS: Record<string, { hi: string; te: string; ml: string; kn: string; ta?: string; en?: string }> = {
  'Home': { ta: 'முகப்பு', en: 'Home', hi: 'होम', te: 'హోమ్', ml: 'ഹോം', kn: 'ಮುಖಪುಟ' },
  'Find Work': { ta: 'வேலை தேட', en: 'Find Work', hi: 'काम खोजें', te: 'పనిని కనుగొనండి', ml: 'ജോലി കണ്ടെത്തുക', kn: 'ಕೆಲಸ ಹುಡುಕಿ' },
  'Jobs': { ta: 'வேலைகள்', en: 'Jobs', hi: 'काम', te: 'పనులు', ml: 'ജോലികൾ', kn: 'ಕೆಲಸಗಳು' },
  'Post Job': { ta: 'வேலை பதிவு', en: 'Post Job', hi: 'काम पोस्ट करें', te: 'పనిని పోస్ట్ చేయండి', ml: 'ജോലി പോസ്റ്റ് ചെയ്യുക', kn: 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ' },
  'Workers': { ta: 'ஆட்கள்', en: 'Workers', hi: 'श्रमिक', te: 'కార్మికులు', ml: 'തൊഴിലാളികൾ', kn: 'ಕಾರ್ಮಿಕರು' },
  'Plans': { ta: 'சந்தா', en: 'Plans', hi: 'योजनाएं', te: 'ప్రణాళికలు', ml: 'പ്ലാനുകൾ', kn: 'ಯೋಜನೆಗಳು' },
  'Daily Wage': { ta: 'தினக்கூலி', en: 'Daily Wage', hi: 'दैनिक मजदूरी', te: 'రోజువారీ కూలి', ml: 'ദിവസക്കൂലി', kn: 'ದೈನಂದಿನ ಕೂಲಿ' },
  'Direct Call': { ta: 'நேரடி அழைப்பு', en: 'Direct Call', hi: 'सीधा कॉल', te: 'ప్రత్యక్ష కాల్', ml: 'നേരിട്ടുള്ള കോൾ', kn: 'ನೇರ ಕರೆ' },
  'Direct Call & WhatsApp': { ta: 'நேரடி அழைப்பு & வாட்ஸ்அப்', en: 'Direct Call & WhatsApp', hi: 'सीधा कॉल और व्हाट्सएप', te: 'ప్రత్యక్ష కాల్ మరియు వాట్సాప్', ml: 'നേരിട്ടുള്ള കോളും വാട്ട്‌സ്ആപ്പും', kn: 'ನೇರ ಕರೆ ಮತ್ತು ವಾಟ್ಸಾಪ್' },
  'Clear': { ta: 'அழி', en: 'Clear', hi: 'साफ़ करें', te: 'క్లియర్', ml: 'മായ്ക്കുക', kn: 'ತೆರವುಗೊಳಿಸಿ' },
  'Search': { ta: 'தேடுக', en: 'Search', hi: 'खोजें', te: 'శోధించండి', ml: 'തിരയുക', kn: 'ಹುಡುಕಿ' },
  'Category': { ta: 'வேலை வகை', en: 'Category', hi: 'श्रेणी', te: 'విభాగం', ml: 'വിഭാഗം', kn: 'ವರ್ಗ' },
  'Location': { ta: 'இடம்', en: 'Location', hi: 'स्थान', te: 'స్థలం', ml: 'സ്ഥലം', kn: 'ಸ್ಥಳ' },
  'Country': { ta: 'நாடு', en: 'Country', hi: 'देश', te: 'దేశం', ml: 'രാജ്യം', kn: 'ದೇಶ' },
  'Status': { ta: 'நிலை', en: 'Status', hi: 'स्थिति', te: 'స్థితి', ml: 'നില', kn: 'ಸ್ಥಿತಿ' },
  'All Categories': { ta: 'அனைத்து வேலைகள்', en: 'All Categories', hi: 'सभी श्रेणियां', te: 'అన్ని విభాగాలు', ml: 'എല്ലാ വിഭാഗങ്ങളും', kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು' },
  'All Locations': { ta: 'அனைத்து இடங்கள்', en: 'All Locations', hi: 'सभी स्थान', te: 'అన్ని స్థలాలు', ml: 'എല്ലാ സ്ഥലങ്ങളും', kn: 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು' },
  'All Countries': { ta: 'அனைத்து நாடுகள்', en: 'All Countries', hi: 'सभी देश', te: 'అన్ని దేశాలు', ml: 'എല്ലാ രാജ്യങ്ങളും', kn: 'ಎಲ್ಲಾ ದೇಶಗಳು' },
  'All Status': { ta: 'அனைத்து நிலைகளும்', en: 'All Status', hi: 'सभी स्थितियां', te: 'అన్ని స్థితులు', ml: 'എല്ലാ നിലകളും', kn: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು' },
  'Urgent': { ta: 'அவசரம்', en: 'Urgent', hi: 'तत्काल', te: 'అత్యవసరం', ml: 'അടിയന്തിരം', kn: 'ತುರ್ತು' },
  'Call': { ta: 'அழைக்க', en: 'Call', hi: 'कॉल करें', te: 'కాల్ చేయండి', ml: 'വിളിക്കുക', kn: 'ಕರೆ ಮಾಡಿ' },
  'WhatsApp': { ta: 'வாட்ஸ்அப்', en: 'WhatsApp', hi: 'व्हाट्सएप', te: 'వాట్సాప్', ml: 'വാട്ട്‌സ്ആപ്പ്', kn: 'ವಾಟ್ಸಾಪ್' },
  'Verified': { ta: 'சரிபார்க்கப்பட்டது', en: 'Verified', hi: 'सत्यापित', te: 'ధృవీకరించబడింది', ml: 'സ്ഥിരീകരിച്ചു', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' },
  'Featured': { ta: 'சிறப்பு வேலை', en: 'Featured', hi: 'विशेष', te: 'ఫీచర్ చేయబడింది', ml: 'ഫീച്ചർ ചെയ്തത്', kn: 'ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ' },
  'Speak': { ta: 'பேச', en: 'Speak', hi: 'बोलें', te: 'మాట్లాడండి', ml: 'സംസാരിക്കുക', kn: 'ಮಾತನಾಡಿ' },
  'Settings': { ta: 'அமைப்புகள்', en: 'Settings', hi: 'सेटिंग्स', te: 'సెట్టింగ్‌లు', ml: 'ക്രമീകരണങ്ങൾ', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  'Help': { ta: 'உதவி', en: 'Help', hi: 'सहायता', te: 'సహాయం', ml: 'സഹായം', kn: 'ಸಹಾಯ' },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loc: (
    taText: string,
    enText: string,
    hiText?: string,
    teText?: string,
    mlText?: string,
    knText?: string
  ) => string;
  getDualText: (
    taText: string,
    enText: string,
    hiText?: string,
    teText?: string,
    mlText?: string,
    knText?: string
  ) => string;
  getCategoryName: (category: {
    id: string;
    nameEn: string;
    nameTa: string;
    nameHi?: string;
    nameTe?: string;
    nameMl?: string;
    nameKn?: string;
  }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('daily_work_lang');
      if (saved && ['bilingual', 'ta', 'en', 'hi', 'te', 'ml', 'kn'].includes(saved)) {
        return saved as Language;
      }
    } catch {
      // ignore
    }
    return 'bilingual';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('daily_work_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const entry = DICTIONARY[key];
    if (!entry) return key;

    if (language === 'ta') return entry.ta;
    if (language === 'en') return entry.en;
    if (language === 'hi') return entry.hi || entry.en;
    if (language === 'te') return entry.te || entry.en;
    if (language === 'ml') return entry.ml || entry.en;
    if (language === 'kn') return entry.kn || entry.en;

    // Default 'bilingual': Tamil primary with English subtitle/bracket
    return `${entry.ta} (${entry.en})`;
  };

  const loc = (
    taText: string,
    enText: string,
    hiText?: string,
    teText?: string,
    mlText?: string,
    knText?: string
  ): string => {
    if (language === 'ta') return taText;
    if (language === 'en') return enText;
    if (language === 'bilingual') return `${taText} / ${enText}`;

    // Language specific resolution with global fallback
    if (language === 'hi') {
      return hiText || GLOBAL_TRANSLATIONS[enText]?.hi || GLOBAL_TRANSLATIONS[taText]?.hi || enText;
    }
    if (language === 'te') {
      return teText || GLOBAL_TRANSLATIONS[enText]?.te || GLOBAL_TRANSLATIONS[taText]?.te || enText;
    }
    if (language === 'ml') {
      return mlText || GLOBAL_TRANSLATIONS[enText]?.ml || GLOBAL_TRANSLATIONS[taText]?.ml || enText;
    }
    if (language === 'kn') {
      return knText || GLOBAL_TRANSLATIONS[enText]?.kn || GLOBAL_TRANSLATIONS[taText]?.kn || enText;
    }

    return enText || taText;
  };

  const getDualText = (
    taText: string,
    enText: string,
    hiText?: string,
    teText?: string,
    mlText?: string,
    knText?: string
  ): string => {
    return loc(taText, enText, hiText, teText, mlText, knText);
  };

  const getCategoryName = (category: {
    id: string;
    nameEn: string;
    nameTa: string;
    nameHi?: string;
    nameTe?: string;
    nameMl?: string;
    nameKn?: string;
  }): string => {
    if (language === 'ta') return category.nameTa;
    if (language === 'en') return category.nameEn;
    if (language === 'hi') return category.nameHi || category.nameEn;
    if (language === 'te') return category.nameTe || category.nameEn;
    if (language === 'ml') return category.nameMl || category.nameEn;
    if (language === 'kn') return category.nameKn || category.nameEn;
    return `${category.nameTa} / ${category.nameEn}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loc, getDualText, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
