import { Job, JobSeeker, Language } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { POPULAR_LOCATIONS, COUNTRIES_LIST } from '../data/locations';
import { ALL_INDIAN_STATES } from '../data/allLocationsData';
import { MULTILINGUAL_DICTIONARY, tamilToTanglish, hasTamilScript } from './transliteration';

// Detect the primary language of a text based on script unicode points
export function detectScriptLanguage(text: string): Language {
  if (!text || typeof text !== 'string') return 'en';

  let taCount = 0;
  let hiCount = 0;
  let teCount = 0;
  let mlCount = 0;
  let knCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0b80 && code <= 0x0bff) taCount++;
    else if (code >= 0x0900 && code <= 0x097f) hiCount++;
    else if (code >= 0x0c00 && code <= 0x0c7f) teCount++;
    else if (code >= 0x0d00 && code <= 0x0d7f) mlCount++;
    else if (code >= 0x0c80 && code <= 0x0cff) knCount++;
  }

  const max = Math.max(taCount, hiCount, teCount, mlCount, knCount);
  if (max === 0) return 'en';
  if (max === taCount) return 'ta';
  if (max === hiCount) return 'hi';
  if (max === teCount) return 'te';
  if (max === mlCount) return 'ml';
  if (max === knCount) return 'kn';
  return 'en';
}

export const LANGUAGE_DISPLAY_NAMES: Record<Language, { label: string; flag: string; native: string }> = {
  ta: { label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  en: { label: 'English', flag: '🌐', native: 'English' },
  hi: { label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  te: { label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  ml: { label: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
  kn: { label: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  bilingual: { label: 'Bilingual (தமிழ் + Eng)', flag: '🇮🇳', native: 'இருமொழி' },
};

// Comprehensive phrase and keyword map across all 6 supported languages
interface TranslationTerm {
  ta: string;
  en: string;
  hi: string;
  te: string;
  ml: string;
  kn: string;
}

const COMMON_DICTIONARY: TranslationTerm[] = [
  // Work phrases
  {
    ta: 'கட்டிட வேலை மற்றும் சிமெண்ட் கலவை வேலை',
    en: 'Masonry & cement mixing construction work',
    hi: 'चिनाई और सीमेंट मिश्रण निर्माण कार्य',
    te: 'భవన నిర్మాణ మరియు సిమెంట్ మిక్సింగ్ పని',
    ml: 'നിർമ്മാണവും സിമന്റ് മിക്സിംഗ് ജോലിയും',
    kn: 'ಕಟ್ಟಡ ಕಾಮಗಾರಿ ಮತ್ತು ಸಿಮೆಂಟ್ ಕೆಲಸ',
  },
  {
    ta: 'வாழைத்தோட்டம் வெட்டுதல் மற்றும் களை எடுத்தல் வேலை',
    en: 'Banana plantation cutting & weeding work',
    hi: 'केले के खेत की कटाई और निराई का काम',
    te: 'అరటి తోట కోత మరియు కలుపు తీసే పని',
    ml: 'വാഴത്തോട്ടം വെട്ടലും കളപറിക്കലും ജോലി',
    kn: 'ಬಾಳೆ ತೋಟ ಕಟಾವು ಮತ್ತು ಕಳೆ ಕೀಳುವ ಕೆಲಸ',
  },
  {
    ta: 'சரக்கு லோடிங் மற்றும் அன்லோடிங் வேலை',
    en: 'Goods loading and unloading work',
    hi: 'सामान की लोडिंग और अनलोडिंग का काम',
    te: 'సరుకుల లోడింగ్ మరియు అన్‌లోడింగ్ పని',
    ml: 'സാധനങ്ങൾ കയറ്റലും ഇറക്കലും ജോലി',
    kn: 'ಸರಕು ಲೋಡಿಂಗ್ ಮತ್ತು ಅನ್‌ಲೋಡಿಂಗ್ ಕೆಲಸ',
  },
  {
    ta: 'வீட்டு வேலை மற்றும் சமையல் உதவி',
    en: 'Housekeeping and cooking assistance',
    hi: 'घरेलू काम और खाना पकाने में मदद',
    te: 'ఇంటి పని మరియు వంట సహాయం',
    ml: 'വീട്ടുജോലിയും പാചക സഹായവും',
    kn: 'ಮನೆ ಕೆಲಸ ಮತ್ತು ಅಡುಗೆ ಸಹಾಯ',
  },
  {
    ta: 'வீடு மற்றும் அலுவலகம் பெயிண்டிங் வேலை',
    en: 'House and office painting work',
    hi: 'घर और कार्यालय पेंटिंग कार्य',
    te: 'ఇల్లు మరియు కార్యాలయం పెయింటింగ్ పని',
    ml: 'വീടും ഓഫീസും പെയിന്റിംഗ് ജോലി',
    kn: 'ಮನೆ ಮತ್ತು ಕಚೇರಿ ಪೇಂಟಿಂಗ್ ಕೆಲಸ',
  },
  {
    ta: 'மின்சார வயரிங் மற்றும் பிளம்பிங் வேலை',
    en: 'Electrical wiring and plumbing work',
    hi: 'बिजली वायरिंग और प्लंबिंग का काम',
    te: 'ఎలక్ట్రికల్ వైరింగ్ మరియు ప్లంబింగ్ పని',
    ml: 'ഇലക്ട്രിക്കൽ വയറിങ്ങും പ്ലംബിംഗ് ജോലിയും',
    kn: 'ವಿದ್ಯುತ್ ವೈರಿಂಗ್ ಮತ್ತು ಪ್ಲಂಬಿಂಗ್ ಕೆಲಸ',
  },
  {
    ta: 'விவசாய அறுவடை மற்றும் நாற்று நடுதல் வேலை',
    en: 'Agricultural harvesting and planting work',
    hi: 'कृषि कटाई और पौध रोपण कार्य',
    te: 'వ్యవసాయ కోత మరియు నాట్లు వేసే పని',
    ml: 'കാർഷിക വിളവെടുപ്പും നടീൽ ജോലിയും',
    kn: 'ಕೃಷಿ ಕೊಯ್ಲು ಮತ್ತು ನಾಟಿ ಕೆಲಸ',
  },
  // Perks and amenities
  {
    ta: 'காலை உணவு & தேநீர் வழங்கப்படும்',
    en: 'Morning breakfast & tea provided',
    hi: 'सुबह का नाश्ता और चाय उपलब्ध है',
    te: 'ఉదయం టిఫిన్ మరియు టీ ఇవ్వబడుతుంది',
    ml: 'പ്രഭാതഭക്ഷണവും ചായയും നൽകും',
    kn: 'ಬೆಳಗಿನ ಉಪಹಾರ ಮತ್ತು ಚಹಾ ನೀಡಲಾಗುವುದು',
  },
  {
    ta: 'காலை உணவு வழங்கப்படும்',
    en: 'Breakfast provided',
    hi: 'नाश्ता दिया जाएगा',
    te: 'అల్పాహారం అందించబడుతుంది',
    ml: 'പ്രഭാതഭക്ഷണം നൽകും',
    kn: 'ಉಪಹಾರ ನೀಡಲಾಗುತ್ತದೆ',
  },
  {
    ta: 'மதிய உணவு உண்டு',
    en: 'Lunch provided',
    hi: 'दोपहर का भोजन उपलब्ध',
    te: 'మధ్యాహ్న భోజనం ఉంది',
    ml: 'ഉച്ചഭക്ഷണം ഉണ്ട്',
    kn: 'ಮಧ್ಯಾಹ್ನದ ಊಟ ಲಭ್ಯವಿದೆ',
  },
  {
    ta: 'டீ மற்றும் சிற்றுண்டி உண்டு',
    en: 'Tea and snacks provided',
    hi: 'चाय और नाश्ता उपलब्ध',
    te: 'టీ మరియు చిరుతిండి అందించబడుతుంది',
    ml: 'ചായയും ലഘുഭക്ഷണവും ഉണ്ട്',
    kn: 'ಚಹಾ ಮತ್ತು ತಿಂಡಿ ನೀಡಲಾಗುವುದು',
  },
  {
    ta: 'பயணப்படி மற்றும் வண்டி வசதி உண்டு',
    en: 'Travel allowance and transport provided',
    hi: 'यात्रा भत्ता और वाहन सुविधा उपलब्ध',
    te: 'ప్రయాణ భత్యం మరియు రవాణా సౌకర్యం ఉంది',
    ml: 'യാത്രാ ബത്തയും വാഹന സൗകര്യവും ഉണ്ട്',
    kn: 'ಪ್ರಯಾಣ ಭತ್ಯೆ ಮತ್ತು ವಾಹನ ಸೌಲಭ್ಯವಿದೆ',
  },
  {
    ta: 'தங்குமிடம் வசதி உண்டு',
    en: 'Accommodation / room provided',
    hi: 'रहने की सुविधा उपलब्ध है',
    te: 'వసతి సౌకర్యం ఉంది',
    ml: 'താമസ സൗകര്യം ഉണ്ട്',
    kn: 'ವಸತಿ ಸೌಲಭ್ಯವಿದೆ',
  },
  {
    ta: 'வேலை நேரம்: காலை 8 மணி முதல் மாலை 5 மணி வரை',
    en: 'Work timing: 8:00 AM to 5:00 PM',
    hi: 'कार्य समय: सुबह 8:00 बजे से शाम 5:00 बजे तक',
    te: 'పని సమయం: ఉదయం 8:00 నుండి సాయంత్రం 5:00 వరకు',
    ml: 'ജോലി സമയം: രാവിലെ 8:00 മുതൽ വൈകുന്നേരം 5:00 വരെ',
    kn: 'ಕೆಲಸದ ಸಮಯ: ಬೆಳಗ್ಗೆ 8:00 ರಿಂದ ಸಂಜೆ 5:00 ರವರೆಗೆ',
  },
  {
    ta: 'கூலி பேசித் தீர்மானிக்கலாம் (திறமை அடிப்படையில்)',
    en: 'Wage is negotiable based on skill and workload',
    hi: 'कौशल के आधार पर मजदूरी पर बातचीत संभव है',
    te: 'నైపుణ్యం ఆధారంగా వేతనం చర్చించవచ్చు',
    ml: 'കഴിവ് അനുസരിച്ച് കൂലി സംസാരിച്ചു തീരുമാനിക്കാം',
    kn: 'ಕೌಶಲ್ಯದ ಆಧಾರದ ಮೇಲೆ ಕೂಲಿ ಮಾತುಕತೆಗೆ ಒಳಪಟ್ಟಿದೆ',
  },
  {
    ta: 'உடனடி ஆட்கள் தேவை (இன்றே தொடக்கம்)',
    en: 'Urgent workers needed (starts today)',
    hi: 'तत्काल कामगारों की आवश्यकता (आज ही शुरू)',
    te: 'తక్షణమే కార్మికులు కావాలి (ఈరోజే ప్రారంభం)',
    ml: 'ഉടൻ ആളുകളെ ആവശ്യമുണ്ട് (ഇന്ന് തന്നെ തുടക്കം)',
    kn: 'ತಕ್ಷಣದ ಕೆಲಸಗಾರರು ಬೇಕಾಗಿದ್ದಾರೆ (ಇಂದೇ ಪ್ರಾರಂಭ)',
  },
  {
    ta: 'அனுபவம் உள்ள ஆட்கள் தேவை',
    en: 'Experienced workers needed',
    hi: 'अनुभवी कामगारों की आवश्यकता है',
    te: 'అనుభవం ఉన్న కార్మికులు కావాలి',
    ml: 'പരിചയസമ്പന്നരായ ആളുകളെ ആവശ്യമുണ്ട്',
    kn: 'ಅನುಭವವಿರುವ ಕೆಲಸಗಾರರು ಬೇಕಾಗಿದ್ದಾರೆ',
  },
  {
    ta: 'அனுபவம் தேவையில்லை, புதியவர்களும் வரலாம்',
    en: 'No experience needed, freshers welcome',
    hi: 'अनुभव की आवश्यकता नहीं, नए लोग भी आ सकते हैं',
    te: 'అనుభవం అవసరం లేదు, కొత్తవారు కూడా రావచ్చు',
    ml: 'പരിചയം ആവശ്യമില്ല, തുടക്കക്കാർക്കും വരാം',
    kn: 'ಅನುಭವ ಅಗತ್ಯವಿಲ್ಲ, ಹೊಸಬರಿಗೂ ಸ್ವಾಗತ',
  },
];

// Keywords mapper for words/phrases
const KEYWORD_MAP: Array<{ regex: RegExp; ta: string; en: string; hi: string; te: string; ml: string; kn: string }> = [
  {
    regex: /(சினிமா|திரைப்படம்|படப்பிடிப்பு|cinema|cinima|movie|film|shooting)/i,
    ta: 'சினிமா / திரைப்படப் பணி',
    en: 'Cinema / Film Industry work',
    hi: 'सिनेमा व फिल्म कार्य',
    te: 'సినిమా పని',
    ml: 'സിനിമ ജോലി',
    kn: 'ಸಿನಿಮಾ ಕೆಲಸ',
  },
  {
    regex: /(கட்டிட வேலை|சிமெண்ட்|கொத்தனார்|masonry|construction|चिनाई)/i,
    ta: 'கட்டிட வேலை',
    en: 'Masonry / Construction work',
    hi: 'चिनाई व निर्माण कार्य',
    te: 'భవన నిర్మాణ పని',
    ml: 'നിർമ്മാണ ജോലി',
    kn: 'ಕಟ್ಟಡ ಕಾಮಗಾರಿ ಕೆಲಸ',
  },
  {
    regex: /(விவசாயம்|பண்ணை|தோட்டம்|வயல்|agriculture|farm|farming|खेती)/i,
    ta: 'விவசாயப் பணி',
    en: 'Agricultural work',
    hi: 'कृषि कार्य',
    te: 'వ్యవసాయ పని',
    ml: 'കാർഷിക ജോലി',
    kn: 'ಕೃಷಿ ಕೆಲಸ',
  },
  {
    regex: /(லோடிங்|ஏற்றுதல்|சுமை|loading|unloading|हमाली)/i,
    ta: 'சுமை ஏற்றுதல் / இறக்குதல் பணி',
    en: 'Loading and unloading work',
    hi: 'लोडिंग व अनलोडिंग कार्य',
    te: 'లోడింగ్ & అన్‌లోడింగ్ పని',
    ml: 'ഭാരം കയറ്റൽ ജോലി',
    kn: 'ಲೋಡಿಂಗ್ ಕೆಲಸ',
  },
  {
    regex: /(ஓட்டுநர்|டிரைவர்|driver|driving|चालक)/i,
    ta: 'வாகன ஓட்டுநர் பணி',
    en: 'Driver work',
    hi: 'ड्राइवर कार्य',
    te: 'డ్రైవర్ పని',
    ml: 'ഡ്രൈവർ ജോലി',
    kn: 'ಚಾಲಕ ಕೆಲಸ',
  },
  {
    regex: /(பெயிண்டிங்|வண்ணம்|painting|painter|पेंटर)/i,
    ta: 'பெயிண்டிங் பணி',
    en: 'Painting work',
    hi: 'पेंटिंग का काम',
    te: 'పెయింటింగ్ పని',
    ml: 'പെയിന്റിംഗ് ജോലി',
    kn: 'ಪೇಂಟಿಂಗ್ ಕೆಲಸ',
  },
  {
    regex: /(பிளம்பிங்|குழாய்|plumbing|plumber|नलसाज)/i,
    ta: 'பிளம்பிங் வேலை',
    en: 'Plumbing work',
    hi: 'प्लंबिंग कार्य',
    te: 'ప్లంబింగ్ పని',
    ml: 'പ്ലംബിംഗ് ജോലി',
    kn: 'ಪ್ಲಂಬಿಂಗ್ ಕೆಲಸ',
  },
  {
    regex: /(எலக்ட்ரீசியன்|மின்சாரம்|electrician|wiring|इलेक्ट्रीशियन)/i,
    ta: 'எலக்ட்ரீசியன் வேலை',
    en: 'Electrical work',
    hi: 'इलेक्ट्रिशियन कार्य',
    te: 'ఎలక్ట్రీషియన్ పని',
    ml: 'ഇലക്ട്രീഷ്യൻ ജോലി',
    kn: 'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಕೆಲಸ',
  },
  {
    regex: /(காலை உணவு|breakfast|नाश्ता|టిఫిన్|പ്രഭാതഭക്ഷണം|ಉಪಹಾರ)/i,
    ta: 'காலை உணவு உண்டு',
    en: 'Breakfast provided',
    hi: 'नाश्ता उपलब्ध',
    te: 'అల్పాహారం ఉంది',
    ml: 'പ്രഭാതഭക്ഷണം ഉണ്ട്',
    kn: 'ಉಪಹಾರ ಲಭ್ಯವಿದೆ',
  },
  {
    regex: /(மதிய உணவு|lunch|भोजन|భోజనం|ഉച്ചഭക്ഷണം|ಊಟ)/i,
    ta: 'மதிய உணவு உண்டு',
    en: 'Lunch provided',
    hi: 'दोपहर का भोजन उपलब्ध',
    te: 'మధ్యాహ్న భోజనం ఉంది',
    ml: 'ഉച്ചഭക്ഷണം ഉണ്ട്',
    kn: 'ಮಧ್ಯಾಹ್ನದ ಊಟ ಲಭ್ಯವಿದೆ',
  },
  {
    regex: /(டீ|தேநீர்|tea|snacks|चाय|టీ|ചായ|ಚಹಾ)/i,
    ta: 'டீ & சிற்றுண்டி உண்டு',
    en: 'Tea & snacks provided',
    hi: 'चाय व नाश्ता उपलब्ध',
    te: 'టీ & స్నాక్స్ ఉన్నాయి',
    ml: 'ചായയും ലഘുഭക്ഷണവും ഉണ്ട്',
    kn: 'ಚಹಾ ಮತ್ತು ತಿಂಡಿ ಲಭ್ಯವಿದೆ',
  },
  {
    regex: /(வண்டி வசதி|பயணப்படி|travel|transport|यात्रा भत्ता|రవాణా|യാത്രാ|ಪ್ರಯಾಣ)/i,
    ta: 'பயணப்படி உண்டு',
    en: 'Travel allowance provided',
    hi: 'यात्रा भत्ता उपलब्ध',
    te: 'ప్రయాణ భత్యం ఉంది',
    ml: 'യാത്രാ ബത്ത ഉണ്ട്',
    kn: 'ಪ್ರಯಾಣ ಭತ್ಯೆ ಲಭ್ಯವಿದೆ',
  },
  {
    regex: /(தங்குமிடம்|room|stay|accommodation|रहने|వసతి|താമസം|ವಸತಿ)/i,
    ta: 'தங்குமிடம் உண்டு',
    en: 'Accommodation provided',
    hi: 'रहने की सुविधा उपलब्ध',
    te: 'వసతి ఉంది',
    ml: 'താമസം ഉണ്ട്',
    kn: 'ವಸತಿ ಲಭ್ಯವಿದೆ',
  },
];

// Helper to translate arbitrary text using dictionary and phrase matching
export function translateTextToLanguage(text: string, targetLang: Language): string {
  if (!text || !text.trim()) return '';
  if (targetLang === 'bilingual') {
    // If user selected bilingual, return a combined or clean representation
    return text;
  }

  const detected = detectScriptLanguage(text);
  if (detected === targetLang) {
    return text;
  }

  // 1. Direct dictionary full phrase match
  for (const item of COMMON_DICTIONARY) {
    if (text.includes(item.ta) || text.includes(item.en) || text.includes(item.hi) || text.includes(item.te) || text.includes(item.ml) || text.includes(item.kn)) {
      return item[targetLang] || item.en || text;
    }
  }

  // 2. Keyword substitution pass
  let translated = text;
  let matchedAny = false;

  // Extract common perks or job details
  const matchedPhrases: string[] = [];
  for (const km of KEYWORD_MAP) {
    if (km.regex.test(text)) {
      matchedPhrases.push(km[targetLang] || km.en);
      matchedAny = true;
    }
  }

  if (matchedAny && matchedPhrases.length > 0) {
    // Preserve any time/numbers found (e.g. 8 AM - 5 PM, 500, etc.)
    const timeMatch = text.match(/\d{1,2}\s*(?:AM|PM|am|pm|மணி|बजे)/g);
    let extra = '';
    if (timeMatch && timeMatch.length > 0) {
      extra = ` (${timeMatch.join(' - ')})`;
    }
    return matchedPhrases.join('. ') + extra + '.';
  }

  // 3. Check MULTILINGUAL_DICTIONARY for cross-language word or phrase
  const trimmed = text.trim().toLowerCase();
  const dictEntry = MULTILINGUAL_DICTIONARY[trimmed];
  if (dictEntry) {
    const list = dictEntry[targetLang];
    if (list && list.length > 0) {
      // Capitalize first letter if English
      const res = list[0];
      return targetLang === 'en' ? res.charAt(0).toUpperCase() + res.slice(1) : res;
    }
  }

  // 4. If target is English and source has Tamil script, provide romanized Tanglish
  if (targetLang === 'en' && hasTamilScript(text)) {
    const tanglish = tamilToTanglish(text);
    if (tanglish.length > 0 && tanglish[0]) {
      const romanized = tanglish[0];
      return romanized.charAt(0).toUpperCase() + romanized.slice(1);
    }
  }

  // Fallback: return original text safely
  return text;
}

// Translate location string into target language
export function translateLocation(locationStr: string, targetLang: Language): string {
  if (!locationStr) return '';
  if (targetLang === 'bilingual') return locationStr;

  // Check Indian states
  for (const state of ALL_INDIAN_STATES) {
    if (locationStr.toLowerCase().includes(state.nameEn.toLowerCase()) || (state.nameTa && locationStr.includes(state.nameTa))) {
      const stateTargetName = (state as any)[`name${targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}`] || (targetLang === 'ta' ? state.nameTa : state.nameEn);
      // Check district inside this state
      for (const dist of state.districts) {
        if (locationStr.toLowerCase().includes(dist.nameEn.toLowerCase()) || (dist.nameTa && locationStr.includes(dist.nameTa))) {
          const distTargetName = (dist as any)[`name${targetLang.charAt(0).toUpperCase() + targetLang.slice(1)}`] || (targetLang === 'ta' ? dist.nameTa : dist.nameEn);
          return `${distTargetName}, ${stateTargetName}`;
        }
      }
      return stateTargetName;
    }
  }

  // Check popular locations
  for (const pl of POPULAR_LOCATIONS) {
    if (locationStr.toLowerCase().includes(pl.nameEn.toLowerCase()) || locationStr.includes(pl.nameTa)) {
      if (targetLang === 'ta') return pl.nameTa;
      const plAny = pl as any;
      if (targetLang === 'hi') return plAny.nameHi || pl.nameEn;
      if (targetLang === 'te') return plAny.nameTe || pl.nameEn;
      if (targetLang === 'ml') return plAny.nameMl || pl.nameEn;
      if (targetLang === 'kn') return plAny.nameKn || pl.nameEn;
      return pl.nameEn;
    }
  }

  return locationStr;
}

// Clean employer name for bilingual and target language display
export function translateEmployerName(name: string, targetLang: Language): string {
  if (!name) return '';
  if (targetLang === 'bilingual') return name;

  // If employer name is written with parentheses like "Selvam Builders (செல்வம் பில்டர்ஸ்)"
  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim();
    const part2 = parenMatch[2].trim();
    const lang1 = detectScriptLanguage(part1);
    const lang2 = detectScriptLanguage(part2);

    if (targetLang === 'ta') {
      if (lang2 === 'ta') return part2;
      if (lang1 === 'ta') return part1;
    }
    if (targetLang === 'en') {
      if (lang1 === 'en') return part1;
      if (lang2 === 'en') return part2;
    }
    // Return the one matching target script, or fallback to clean part1
    if (lang1 === targetLang) return part1;
    if (lang2 === targetLang) return part2;
  }

  return name;
}

// Category translation
export function getCategoryNameInLanguage(categoryId: string, targetLang: Language): string {
  const cat = WORK_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return categoryId;

  if (targetLang === 'ta') return cat.nameTa;
  if (targetLang === 'hi') return cat.nameHi || cat.nameEn;
  if (targetLang === 'te') return cat.nameTe || cat.nameEn;
  if (targetLang === 'ml') return cat.nameMl || cat.nameEn;
  if (targetLang === 'kn') return cat.nameKn || cat.nameEn;
  if (targetLang === 'bilingual') return `${cat.nameTa} / ${cat.nameEn}`;
  return cat.nameEn;
}

export interface TranslatedJobView {
  employerName: string;
  location: string;
  categoryName: string;
  notes: string;
  state?: string;
  district?: string;
  city?: string;
  isTranslated: boolean;
  sourceLanguage: Language;
  targetLanguage: Language;
}

// Main function to get a job fully translated into the viewer's chosen language
export function getTranslatedJob(job: Job, currentViewerLanguage: Language): TranslatedJobView {
  const targetLang = currentViewerLanguage === 'bilingual' ? 'ta' : currentViewerLanguage;
  const postedLang: Language = job.postedLanguage || detectScriptLanguage(job.notes || job.employerName || '') || 'en';

  // Check if job already has precomputed translations
  const savedTranslation = job.translations?.[targetLang];

  const translatedEmployer = savedTranslation?.employerName || translateEmployerName(job.employerName, targetLang);
  const translatedLocation = savedTranslation?.location || translateLocation(job.location, targetLang);
  let categoryName = '';
  if (job.category === 'other' && (job.customCategoryName || job.categoryCustomName)) {
    categoryName = job.customCategoryName || job.categoryCustomName || '';
  } else {
    categoryName = getCategoryNameInLanguage(job.category, currentViewerLanguage);
  }
  const translatedNotes = savedTranslation?.notes || (job.notes ? translateTextToLanguage(job.notes, targetLang) : '');
  const translatedState = savedTranslation?.state || (job.state ? translateLocation(job.state, targetLang) : undefined);
  const translatedDistrict = savedTranslation?.district || (job.district ? translateLocation(job.district, targetLang) : undefined);
  const translatedCity = savedTranslation?.city || job.city;

  // Is translation active?
  const isTranslated = postedLang !== targetLang && (Boolean(job.notes) || job.employerName.includes('('));

  return {
    employerName: translatedEmployer || job.employerName,
    location: translatedLocation || job.location,
    categoryName,
    notes: translatedNotes || job.notes || '',
    state: translatedState || job.state,
    district: translatedDistrict || job.district,
    city: translatedCity || job.city,
    isTranslated,
    sourceLanguage: postedLang,
    targetLanguage: currentViewerLanguage,
  };
}

// Pre-generate translation entries for all 6 languages when creating a job
export function generateJobTranslations(
  jobData: {
    employerName: string;
    location: string;
    notes?: string;
    state?: string;
    district?: string;
    city?: string;
  },
  sourceLang: Language
): Record<string, { employerName?: string; notes?: string; location?: string; state?: string; district?: string; city?: string }> {
  const allLangs: Language[] = ['ta', 'en', 'hi', 'te', 'ml', 'kn'];
  const result: Record<string, any> = {};

  for (const lang of allLangs) {
    if (lang === sourceLang) {
      result[lang] = {
        employerName: jobData.employerName,
        location: jobData.location,
        notes: jobData.notes || '',
        state: jobData.state,
        district: jobData.district,
        city: jobData.city,
      };
    } else {
      result[lang] = {
        employerName: translateEmployerName(jobData.employerName, lang),
        location: translateLocation(jobData.location, lang),
        notes: jobData.notes ? translateTextToLanguage(jobData.notes, lang) : '',
        state: jobData.state ? translateLocation(jobData.state, lang) : undefined,
        district: jobData.district ? translateLocation(jobData.district, lang) : undefined,
        city: jobData.city,
      };
    }
  }

  return result;
}

// Pre-generate translation entries for all 6 languages when registering a worker
export function generateSeekerTranslations(
  seekerData: {
    name: string;
    location: string;
    state?: string;
    district?: string;
    city?: string;
    customCategoryName?: string;
    notes?: string;
  },
  sourceLang: Language
): Record<string, { name?: string; location?: string; state?: string; district?: string; city?: string; customCategoryName?: string; notes?: string }> {
  const allLangs: Language[] = ['ta', 'en', 'hi', 'te', 'ml', 'kn'];
  const result: Record<string, any> = {};

  for (const lang of allLangs) {
    if (lang === sourceLang) {
      result[lang] = {
        name: seekerData.name,
        location: seekerData.location,
        state: seekerData.state,
        district: seekerData.district,
        city: seekerData.city,
        customCategoryName: seekerData.customCategoryName,
        notes: seekerData.notes || '',
      };
    } else {
      result[lang] = {
        name: translateEmployerName(seekerData.name, lang),
        location: translateLocation(seekerData.location, lang),
        state: seekerData.state ? translateLocation(seekerData.state, lang) : undefined,
        district: seekerData.district ? translateLocation(seekerData.district, lang) : undefined,
        city: seekerData.city,
        customCategoryName: seekerData.customCategoryName ? translateTextToLanguage(seekerData.customCategoryName, lang) : undefined,
        notes: seekerData.notes ? translateTextToLanguage(seekerData.notes, lang) : '',
      };
    }
  }

  return result;
}

export interface TranslatedSeekerView {
  name: string;
  location: string;
  categoryName: string;
  state?: string;
  district?: string;
  city?: string;
  isTranslated: boolean;
  sourceLanguage: Language;
  targetLanguage: Language;
}

export function getTranslatedSeeker(seeker: JobSeeker, currentViewerLanguage: Language): TranslatedSeekerView {
  const targetLang = currentViewerLanguage === 'bilingual' ? 'ta' : currentViewerLanguage;
  const postedLang: Language = seeker.postedLanguage || detectScriptLanguage(seeker.name || '') || 'ta';

  let translatedName = seeker.name;
  let translatedLocation = seeker.location;
  let translatedState = seeker.state;
  let translatedDistrict = seeker.district;
  let translatedCity = seeker.city;

  if (seeker.translations && seeker.translations[targetLang]) {
    const cached = seeker.translations[targetLang];
    if (cached.name) translatedName = cached.name;
    if (cached.location) translatedLocation = cached.location;
    if (cached.state) translatedState = cached.state;
    if (cached.district) translatedDistrict = cached.district;
    if (cached.city) translatedCity = cached.city;
  } else if (postedLang !== targetLang) {
    translatedName = translateEmployerName(seeker.name, targetLang);
    translatedLocation = translateLocation(seeker.location, targetLang);
    if (seeker.state) translatedState = translateLocation(seeker.state, targetLang);
    if (seeker.district) translatedDistrict = translateLocation(seeker.district, targetLang);
  }

  let categoryName = '';
  if (seeker.category === 'other' && (seeker.customCategoryName || seeker.categoryCustomName)) {
    categoryName = seeker.customCategoryName || seeker.categoryCustomName || '';
  } else {
    categoryName = getCategoryNameInLanguage(seeker.category, currentViewerLanguage);
  }

  const isTranslated = postedLang !== targetLang && (Boolean(seeker.district) || Boolean(seeker.state) || seeker.name.includes('('));

  return {
    name: translatedName || seeker.name,
    location: translatedLocation || seeker.location,
    categoryName,
    state: translatedState || seeker.state,
    district: translatedDistrict || seeker.district,
    city: translatedCity || seeker.city,
    isTranslated,
    sourceLanguage: postedLang,
    targetLanguage: currentViewerLanguage,
  };
}
