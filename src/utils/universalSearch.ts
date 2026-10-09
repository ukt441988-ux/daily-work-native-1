import { Job, JobSeeker, ShopItem } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import {
  tamilToTanglish,
  getPhoneticKey,
  hasTamilScript,
  getCrossLanguageTokenVariants,
  matchesCrossLanguage,
  MULTILINGUAL_DICTIONARY,
} from './transliteration';

// Category synonyms mapping across languages and colloquial terms
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  masonry: [
    'mason', 'masonry', 'bricklayer', 'construction', 'building', 'rajmistri',
    'கொத்தனார்', 'சித்தாள்', 'மேஸ்திரி', 'கட்டிடம்', 'சிமெண்ட்', 'பூச்சு', 'கட்டுமானம்',
    'கட்டுமான', 'चिनाई', 'राजमिस्त्री', 'మేస్త్రీ', 'നിർമ്മാണം', 'ಗಾರೆ'
  ],
  painting: [
    'paint', 'painter', 'painting', 'whitewash', 'distemper',
    'பெயிண்ட்', 'பெயிண்டர்', 'பெயிண்டிங்', 'வர்ணம்', 'வெள்ளை அடிப்பது',
    'रंग', 'पेंटर', 'పెయింటింగ్', 'പെയിന്റിംഗ്', 'ಬಣ್ಣ'
  ],
  agriculture: [
    'agri', 'agriculture', 'farm', 'farmer', 'farming', 'field', 'harvest', 'crop',
    'விவசாயம்', 'கூலி', 'தோட்டம்', 'பண்ணை', 'களை', 'வாழை', 'நெல்', 'கரும்பு', 'வயல்',
    'कृषि', 'खेती', 'వ్యవసాయం', 'കൃഷി', 'ಕೃಷಿ'
  ],
  loading: [
    'load', 'loading', 'unload', 'unloading', 'coolie', 'warehouse', 'luggage',
    'ஏற்றுதல்', 'இறக்குதல்', 'சுமை', 'மூட்டை', 'குடோன்', 'லோடு', 'சுமைதூக்குபவர்',
    'लोडिंग', 'కూలీ', 'ലോഡിംഗ്', 'ಹೇರುವಿಕೆ'
  ],
  carpentry: [
    'carpenter', 'carpentry', 'wood', 'furniture', 'door', 'window', 'polish',
    'தச்சு', 'மரவேலை', 'கார்பெண்டர்', 'கதவு', 'ஜன்னல்', 'பாலிஷ்',
    'बढ़ई', 'వడ్రంగి', 'മരപ്പണി', 'ಬಡಗಿ'
  ],
  plumbing: [
    'plumber', 'plumbing', 'pipe', 'leak', 'tap', 'water', 'motor',
    'பிளம்பர்', 'பிளம்பிங்', 'குழாய்', 'தண்ணீர்', 'மோட்டார்', 'பைப்',
    'प्लंबर', 'ప్లంబింగ్', 'പ്ലംബിംഗ്', 'ಪ್ಲಂಬಿಂಗ್'
  ],
  electrical: [
    'electric', 'electrical', 'electrician', 'wireman', 'wiring', 'switch', 'light', 'current',
    'எலக்ட்ரீசியன்', 'மின்சாரம்', 'மின்', 'வயரிங்', 'சுவிட்ச்', 'கரண்ட்',
    'बिजली', 'इलेक्ट्रीशियन', 'ఎలక్ట్రీషియన్', 'ഇലക്ട്രീഷ്യൻ', 'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್'
  ],
  housekeeping: [
    'housekeeping', 'maid', 'clean', 'cleaner', 'cook', 'cooking', 'cleaning', 'utensils',
    'வீட்டு வேலை', 'சமையல்', 'பாத்திரம்', 'சுத்தம்', 'பணிப்பெண்', 'கிளீனிங்',
    'घरेलू', 'सफाई', 'ఇంటి పని', 'പാചകം', 'ಮನೆ ಕೆಲಸ'
  ],
  driver: [
    'driver', 'driving', 'delivery', 'auto', 'car', 'lorry', 'truck', 'van', 'taxi', 'vehicle',
    'ஓட்டுநர்', 'டிரைவர்', 'ஆட்டோ', 'கார்', 'லாரி', 'டெலிவரி', 'வாகனம்',
    'ड्राइवर', 'चालक', 'డ్రైవర్', 'ഡ്രൈവർ', 'ಚಾಲಕ'
  ],
  gardening: [
    'garden', 'gardener', 'gardening', 'lawn', 'plants', 'tree',
    'தோட்டம்', 'தோட்டக்காரர்', 'புல்', 'செடி', 'மரம்',
    'बागवानी', 'తోట', 'തോട്ടപ്പണി', 'ತೋಟ'
  ],
  welding: [
    'weld', 'welder', 'welding', 'workshop', 'iron', 'steel', 'fabrication',
    'வெல்டர்', 'வெல்டிங்', 'பட்டறை', 'இரும்பு', 'மெக்கானிக்',
    'वेल्डिंग', 'వెల్డింగ్', 'വെൽഡിംഗ്', 'ವೆಲ್ಡಿಂಗ್'
  ],
  general_helper: [
    'helper', 'labour', 'labor', 'general', 'coolie', 'assistant', 'worker',
    'உதவியாளர்', 'ஹெல்பர்', 'ஆட்கள்', 'கூலி', 'ஆள்', 'உதவி',
    'मजदूर', 'सहायक', 'సహాయకుడు', 'ഹെൽപ്പർ', 'ಸಹಾಯಕ'
  ],
  other: [
    'cinema', 'cinima', 'sinima', 'movie', 'film', 'shooting', 'theatre', 'actor', 'lightman', 'camera', 'set',
    'சினிமா', 'திரைப்படம்', 'படப்பிடிப்பு', 'தியேட்டர்', 'லைட்மேன்', 'கேமரா', 'நடிகர்', 'ஸ்டுடியோ',
    'tailor', 'டெய்லர்', 'தையல்', 'security', 'செக்யூரிட்டி', 'வாட்ச்மேன்',
    'hotel', 'ஹோட்டல்', 'டீக்கடை', 'tea master', 'parotta master', 'பரோட்டா',
    'poultry', 'chicken', 'கோழி', 'கோழிப்பண்ணை', 'fish', 'மீன்', 'மீன்பிடி',
    'mechanic', 'மெக்கானிக்', 'பஞ்சர்', 'டயர்', 'salon', 'சலூன்',
    'dairy', 'மாடு', 'பால்', 'delivery', 'டெலிவரி', 'courier'
  ],
};

// Common conversational query stopwords (intent words, fillers, generic suffixes)
const SEARCH_STOPWORDS = new Set([
  'வேலை', 'வேலைகள்', 'வேலைவாய்ப்பு', 'வேலைவாய்ப்புகள்', 'வேலைக்கு', 'வேலைகள்',
  'ஆட்கள்', 'தொழிலாளி', 'தொழிலாளர்கள்', 'ஆள்', 'காரியஸ்தர்', 'நபர்கள்', 'நபர்களை', 'நபர்களைக்', 'கூலியாட்கள்', 'ஹெல்பர்கள்',
  'கடை', 'கடைகள்', 'ஷாப்', 'தேடு', 'தேடுக', 'வேண்டும்', 'வேணும்', 'இருக்கா', 'உள்ளதா', 'தேவை', 'தேவையா', 'வேண்டுமா', 'வேணுமா',
  'கேட்கும்', 'கொடுக்கும்', 'கொடுப்பவர்கள்', 'சொல்லுங்க', 'சொல்லுங்கள்', 'பார்க்க', 'பார்க்கணும்',
  'பகுதி', 'பகுதியில்', 'பகுதிக்கான', 'பகுதிக்கு', 'ஏரியா', 'ஏரியாவில்', 'ஏரியாவுக்கு', 'ஏரியாவுக்கான',
  'இடம்', 'இடத்தில்', 'ஊர்', 'ஊரில்', 'நகரம்', 'நகரில்', 'பக்கம்', 'பக்கத்தில்',
  'உள்ள', 'இருக்கும்', 'சார்ந்த', 'பற்றி', 'பத்தின', 'அந்த', 'இந்த', 'ஒரு', 'என்ற',
  'job', 'jobs', 'work', 'worker', 'workers', 'labour', 'labourer', 'labor', 'seeker', 'seekers', 'helper', 'helpers',
  'people', 'person', 'persons', 'men', 'manpower',
  'shop', 'shops', 'store', 'stores', 'find', 'search', 'need', 'needed', 'wanted', 'require', 'required', 'looking',
  'in', 'at', 'for', 'area', 'locality', 'location', 'place',
  'போன்', 'நம்பர்', 'எண்', 'phone', 'contact', 'mobile',
  'काम', 'मजदूर', 'दुकान', 'दुकानें', 'पनि', 'కార్మికులు', 'షాపులు', 'ജോലി', 'തൊഴിലാളികൾ', 'ഷോപ്പ്', 'ಕೆಲಸ', 'ಕೆಲಸಗಾರರು', 'ಅಂಗಡಿ'
]);

// Transliteration pairs between English and Tamil for common names, locations, and terms
const TRANSLITERATION_PAIRS: [string, string][] = [
  ['palanivel', 'பழனிவேல்'],
  ['ramasamy', 'ராமசாமி'],
  ['saravanan', 'சரவணன்'],
  ['ganesan', 'கணேசன்'],
  ['kumar', 'குமார்'],
  ['murugan', 'முருகன்'],
  ['selvam', 'செல்வம்'],
  ['karthik', 'கார்த்திக்'],
  ['ramesh', 'ரமேஷ்'],
  ['suresh', 'சுரேஷ்'],
  ['balaji', 'பாலாஜி'],
  ['kannan', 'கண்ணன்'],
  ['thirunavukkarasu', 'திருநாவுக்கரசு'],
  ['raja', 'ராஜா'],
  ['rajesh', 'ராஜேஷ்'],
  ['mani', 'மணி'],
  ['siva', 'சிவா'],
  ['sakthi', 'சக்தி'],
  ['vignesh', 'விக்னேஷ்'],
  ['arumugam', 'ஆறுமுகம்'],
  // Tamil Nadu Districts, Cities, Towns, Localities
  ['chennai', 'சென்னை'],
  ['madurai', 'மதுரை'],
  ['coimbatore', 'கோவை'],
  ['coimbatore', 'கோயம்புத்தூர்'],
  ['salem', 'சேலம்'],
  ['trichy', 'திருச்சி'],
  ['trichy', 'திருச்சிராப்பள்ளி'],
  ['tirunelveli', 'திருநெல்வேலி'],
  ['tirunelveli', 'நெல்லை'],
  ['vellore', 'வேலூர்'],
  ['tiruppur', 'திருப்பூர்'],
  ['erode', 'ஈரோடு'],
  ['thanjavur', 'தஞ்சாவூர்'],
  ['dindigul', 'திண்டுக்கல்'],
  ['kanchipuram', 'காஞ்சிபுரம்'],
  ['tiruvallur', 'திருவள்ளூர்'],
  ['chengalpattu', 'செங்கல்பட்டு'],
  ['cuddalore', 'கடலூர்'],
  ['villupuram', 'விழுப்புரம்'],
  ['tiruvannamalai', 'திருவண்ணாமலை'],
  ['karur', 'கரூர்'],
  ['namakkal', 'நாமக்கல்'],
  ['dharmapuri', 'தர்மபுரி'],
  ['krishnagiri', 'கிருஷ்ணகிரி'],
  ['hosur', 'ஓசூர்'],
  ['ranipet', 'ராணிப்பேட்டை'],
  ['arakkonam', 'அரக்கோணம்'],
  ['kumbakonam', 'கும்பகோணம்'],
  ['pudukkottai', 'புதுக்கோட்டை'],
  ['nagapattinam', 'நாகப்பட்டினம்'],
  ['theni', 'தேனி'],
  ['virudhunagar', 'விருதுநகர்'],
  ['sivakasi', 'சிவகாசி'],
  ['ramanathapuram', 'ராமநாதபுரம்'],
  ['sivagangai', 'சிவகங்கை'],
  ['tenkasi', 'தென்காசி'],
  ['thoothukudi', 'தூத்துக்குடி'],
  ['tuticorin', 'தூத்துக்குடி'],
  ['kanniyakumari', 'கன்னியாகுமரி'],
  ['nagercoil', 'நாகர்கோவில்'],
  ['pollachi', 'பொள்ளாச்சி'],
  ['nilgiris', 'நீலகிரி'],
  ['ooty', 'ஊட்டி'],
  // Specific suburban / town localities in initial data & common areas
  ['tambaram', 'தாம்பரம்'],
  ['guindy', 'கிண்டி'],
  ['velachery', 'வேளச்சேரி'],
  ['ambattur', 'அம்பத்தூர்'],
  ['avadi', 'ஆவடி'],
  ['porur', 'போரூர்'],
  ['vadapalani', 'வடபழனி'],
  ['koyambedu', 'கோயம்பேடு'],
  ['chromepet', 'குரோம்பேட்டை'],
  ['medavakkam', 'மேடவாக்கம்'],
  ['sholinganallur', 'சோழிங்கநல்லூர்'],
  ['poonamallee', 'பூந்தமல்லி'],
  ['katpadi', 'காட்பாடி'],
  ['vadipatti', 'வாடிப்பட்டி'],
  ['singanallur', 'சிங்காநல்லூர்'],
  ['hasthampatti', 'அஸ்தம்பட்டி'],
  ['palayamkottai', 'பாளையங்கோட்டை'],
  ['thillainagar', 'தில்லை நகர்'],
  ['thillainagar', 'தில்லைநகர்'],
  // Trades / Business / Categories
  ['builder', 'பில்டர்'],
  ['builders', 'பில்டர்ஸ்'],
  ['logistics', 'லாகிஸ்டிக்ஸ்'],
  ['decors', 'டெக்கார்ஸ்'],
  ['electricals', 'எலக்ட்ரிக்கல்ஸ்'],
  ['caterers', 'கேட்டரிங்'],
  ['gardeners', 'பூந்தோட்டம்'],
  ['mason', 'கொத்தனார்'],
  ['painter', 'பெயிண்டர்'],
  ['electrician', 'எலக்ட்ரீசியன்'],
  ['plumber', 'பிளம்பர்'],
  ['carpenter', 'கார்பெண்டர்'],
  ['helper', 'உதவியாளர்'],
  ['driver', 'டிரைவர்'],
  ['welder', 'வெல்டர்'],
  ['hardware', 'ஹார்டுவேர்'],
  ['cement', 'சிமெண்ட்'],
  ['cinema', 'சினிமா'],
  ['cinima', 'சினிமா'],
  ['sinima', 'சினிமா'],
  ['movie', 'சினிமா'],
  ['film', 'சினிமா'],
  ['shooting', 'படப்பிடிப்பு'],
  ['theatre', 'தியேட்டர்'],
  ['studio', 'ஸ்டுடியோ'],
  ['tailor', 'டெய்லர்'],
  ['tailor', 'தையல்'],
  ['security', 'செக்யூரிட்டி'],
  ['watchman', 'வாட்ச்மேன்'],
  ['hotel', 'ஹோட்டல்'],
  ['restaurant', 'உணவகம்'],
  ['tea', 'டீ'],
  ['parotta', 'பரோட்டா'],
  ['chicken', 'கோழி'],
  ['koli', 'கோழி'],
  ['kozhi', 'கோழி'],
  ['fish', 'மீன்'],
  ['meen', 'மீன்'],
  ['mechanic', 'மெக்கானிக்'],
  ['puncture', 'பஞ்சர்'],
  ['puncher', 'பஞ்சர்'],
  ['tyre', 'டயர்'],
  ['salon', 'சலூன்'],
  ['saloon', 'சலூன்'],
  ['barber', 'நாவிதர்'],
  ['milk', 'பால்'],
  ['paal', 'பால்'],
  ['cow', 'மாடு'],
  ['maadu', 'மாடு'],
  ['dairy', 'பால் பண்ணை'],
  ['delivery', 'டெலிவரி'],
  ['courier', 'கூரியர்'],
  ['grocery', 'மளிகை'],
  ['groceries', 'மளிகை'],
  ['provisions', 'மளிகை'],
  ['medical', 'மருந்தகம்'],
  ['pharmacy', 'மருந்தகம்'],
  ['pandal', 'பந்தல்'],
  ['pandhal', 'பந்தல்'],
  ['sound', 'சவுண்ட்'],
  ['kothanar', 'கொத்தனார்'],
  ['sithal', 'சித்தாள்'],
  ['mesthri', 'மேஸ்திரி'],
  ['thachhu', 'தச்சு'],
  ['thatchu', 'தச்சு'],
  ['vivasayam', 'விவசாயம்'],
  ['thottam', 'தோட்டம்'],
  ['panna', 'பண்ணை'],
  ['load', 'லோடு'],
  ['coolie', 'கூலி'],
  ['aal', 'ஆள்'],
  ['aatkal', 'ஆட்கள்'],
  ['velai', 'வேலை'],
];

// Clean and normalize strings for matching
export function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[(),.\-—_'"’‘“”:;!?/\\#@*&^%$~`|<>+={}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokenize text into words
export function getTokens(str: string): string[] {
  const norm = normalize(str);
  if (!norm) return [];
  return norm.split(' ').filter((t) => t.length > 0);
}

// Stem Tamil words by removing locative, dative, and case suffixes (e.g. தாம்பரத்தில் -> தாம்பரம், சென்னையில் -> சென்னை)
export function stemTamilWord(word: string): string[] {
  const norm = normalize(word);
  if (!norm) return [];
  const stems = new Set<string>([norm]);

  // Locative த்தில் -> ம் (e.g. தாம்பரத்தில் -> தாம்பரம், சேலத்தில் -> சேலம்)
  if (norm.endsWith('த்தில்')) {
    stems.add(norm.slice(0, -5) + 'ம்');
    stems.add(norm.slice(0, -5));
  }
  // த்துக்கான / த்துக்கானது -> ம் (e.g. தாம்பரத்துக்கான -> தாம்பரம்)
  if (norm.endsWith('த்துக்கானது') || norm.endsWith('த்துக்கான')) {
    stems.add(norm.replace(/த்துக்கான(து)?$/, 'ம்'));
    stems.add(norm.replace(/த்துக்கான(து)?$/, ''));
  }
  // த்துக்கு -> ம் (e.g. தாம்பரத்துக்கு -> தாம்பரம்)
  if (norm.endsWith('த்துக்கு')) {
    stems.add(norm.slice(0, -5) + 'ம்');
  }
  // க்கான / க்கானது (e.g. சென்னைக்கான -> சென்னை)
  if (norm.endsWith('க்கானது') || norm.endsWith('க்கான')) {
    stems.add(norm.replace(/க்கான(து)?$/, ''));
  }
  // யில் (e.g. சென்னையில் -> சென்னை, மதுரையில் -> மதுரை, கோவையில் -> கோவை, திருச்சியில் -> திருச்சி)
  if (norm.endsWith('யில்')) {
    stems.add(norm.slice(0, -3));
  }
  // வில் / இல் (e.g. வேலூரில் -> வேலூர், கரூரில் -> கரூர்)
  if (norm.endsWith('வில்')) {
    stems.add(norm.slice(0, -3));
  }
  if (norm.endsWith('இல்')) {
    stems.add(norm.slice(0, -2));
  }
  // ரில், லில், னில், டில், தில், பில்
  if (/(ரில்|லில்|னில்|டில்|தில்|பில்)$/.test(norm)) {
    const base = norm.replace(/(ரில்|லில்|னில்|டில்|தில்|பில்)$/, (match) => {
      if (match === 'ரில்') return 'ர்';
      if (match === 'லில்') return 'ல்';
      if (match === 'னில்') return 'ன்';
      if (match === 'டில்') return 'டு';
      if (match === 'தில்') return 'து';
      return '';
    });
    stems.add(base);
    stems.add(norm.slice(0, -3));
  }
  // ல் (single locative ல், e.g. ஊரில் -> ஊர், இடத்தில் -> இடம், நகரில் -> நகர்)
  if (norm.endsWith('ல்') && norm.length > 3) {
    stems.add(norm.slice(0, -1));
  }
  // கு / க்கு / வுக்கு / ருக்கு (dative: சென்னைக்கு -> சென்னை, வேலூருக்கு -> வேலூர்)
  if (/(வுக்கு|ருக்கு|க்கு|கு)$/.test(norm)) {
    stems.add(norm.replace(/(வுக்கு|ருக்கு|க்கு|கு)$/, (m) => (m === 'ருக்கு' ? 'ர்' : '')));
  }
  // பகுதி / ஏரியா inflections
  if (norm === 'பகுதியில்' || norm === 'பகுதிக்கு' || norm === 'பகுதிக்கான') {
    stems.add('பகுதி');
  }
  if (norm === 'ஏரியாவில்' || norm === 'ஏரியாவுக்கு' || norm === 'ஏரியாவுக்கான') {
    stems.add('ஏரியா');
  }

  return Array.from(stems).filter((s) => s.length >= 2);
}

// Get non-stopword tokens (core search keywords)
export function getMeaningfulTokens(str: string): string[] {
  const tokens = getTokens(str);
  const core = tokens.filter((t) => {
    if (SEARCH_STOPWORDS.has(t)) return false;
    // Check if any Tamil stem of this token is a stopword
    const stems = stemTamilWord(t);
    if (stems.some((s) => SEARCH_STOPWORDS.has(s))) return false;
    return t.length >= 2;
  });
  return core.length > 0 ? core : tokens.filter((t) => t.length >= 2);
}

const expandedTokenVariantsCache = new Map<string, string[]>();

// Expand a token with its Tamil <-> English transliteration equivalents, morphological stems, and dictionary mappings
export function getExpandedTokenVariants(token: string): string[] {
  const norm = normalize(token);
  if (!norm) return [];

  const cached = expandedTokenVariantsCache.get(norm);
  if (cached) return cached;

  const variants = new Set<string>([norm]);

  // 1. Dedicated cross-language engine variants (Tamil <-> English/Tanglish, Hindi, Telugu, etc.)
  const crossLang = getCrossLanguageTokenVariants(norm);
  for (const c of crossLang) {
    variants.add(c);
  }

  // 2. Tamil to Tanglish conversion (e.g. சினிமா -> cinima, cinema, sinima)
  if (hasTamilScript(norm)) {
    const tanglish = tamilToTanglish(norm);
    for (const t of tanglish) {
      variants.add(t);
    }
  }

  // 3. Add Tamil morphological stems (e.g. தாம்பரத்தில் -> தாம்பரம்)
  const stems = stemTamilWord(norm);
  for (const s of stems) {
    variants.add(s);
    if (hasTamilScript(s)) {
      const stemTanglish = tamilToTanglish(s);
      for (const st of stemTanglish) {
        variants.add(st);
      }
    }
  }

  // 4. Cross-reference with transliteration pairs for all stems and raw token
  const wordsToCheck = [norm, ...stems];
  for (const w of wordsToCheck) {
    for (const [en, ta] of TRANSLITERATION_PAIRS) {
      if (w === en || (w.length >= 3 && en.includes(w)) || (en.length >= 3 && w.includes(en))) {
        variants.add(ta);
        variants.add(en);
      }
      if (w === ta || (w.length >= 3 && ta.includes(w)) || (ta.length >= 3 && w.includes(ta))) {
        variants.add(en);
        variants.add(ta);
      }
    }
  }

  const result = Array.from(variants).filter((v) => v.length > 0);
  if (expandedTokenVariantsCache.size < 2000) {
    expandedTokenVariantsCache.set(norm, result);
  }
  return result;
}

// Builds an enriched multilingual haystack with Tamil, Tanglish, and Phonetic Sound Keys in sub-millisecond time
export function buildMultilingualSearchHaystack(fieldList: (string | undefined | null)[]): {
  haystackText: string;
  wordSet: Set<string>;
  phoneticKeys: Set<string>;
} {
  const wordSet = new Set<string>();
  const phoneticKeys = new Set<string>();

  for (const rawField of fieldList) {
    if (!rawField) continue;
    const normField = normalize(rawField);
    if (!normField) continue;
    wordSet.add(normField);

    const tokens = normField.split(' ').filter((t) => t.length > 0);
    for (const token of tokens) {
      wordSet.add(token);

      // Phonetic key for English/Tanglish or romanized words
      const pKey = getPhoneticKey(token);
      if (pKey) phoneticKeys.add(pKey);

      // If Tamil script, generate Tanglish transliterations
      if (hasTamilScript(token)) {
        const tanglishVariants = tamilToTanglish(token);
        for (const tv of tanglishVariants) {
          wordSet.add(tv);
          const tvKey = getPhoneticKey(tv);
          if (tvKey) phoneticKeys.add(tvKey);
        }
      }
    }
  }

  const haystackText = Array.from(wordSet).join(' ');
  return {
    haystackText,
    wordSet,
    phoneticKeys,
  };
}

// Check if category matches search query across all languages and phonetic spellings
export function doesCategoryMatch(categoryId: string, customName: string | undefined, query: string): boolean {
  const qNorm = normalize(query);
  if (!qNorm) return true;

  // Custom name match (direct, transliterated, cross-language, phonetic)
  if (customName) {
    const customNorm = normalize(customName);
    if (customNorm) {
      if (customNorm.includes(qNorm) || qNorm.includes(customNorm)) return true;
      if (matchesCrossLanguage(customName, query)) return true;
    }
  }

  const catObj = WORK_CATEGORIES.find((c) => c.id === categoryId);
  const catNames = [
    categoryId,
    customName || '',
    catObj?.nameEn || '',
    catObj?.nameTa || '',
    catObj?.nameHi || '',
    catObj?.nameTe || '',
    catObj?.nameMl || '',
    catObj?.nameKn || '',
  ].map(normalize).filter(Boolean);

  // Direct check
  if (catNames.some((name) => name.includes(qNorm) || qNorm.includes(name))) {
    return true;
  }

  // Token matching with expanded variants and phonetic checks
  const tokens = getMeaningfulTokens(query);
  for (const token of tokens) {
    const tokenVariants = getExpandedTokenVariants(token);
    const tokenPKey = getPhoneticKey(token);

    for (const name of catNames) {
      if (tokenVariants.some((variant) => name.includes(variant) || variant.includes(name))) {
        return true;
      }
      const namePKey = getPhoneticKey(name);
      if (tokenPKey && namePKey && (tokenPKey === namePKey || namePKey.includes(tokenPKey))) {
        return true;
      }
    }
  }

  // Check synonyms
  const synonyms = CATEGORY_SYNONYMS[categoryId] || [];
  for (const syn of synonyms) {
    const synNorm = normalize(syn);
    if (!synNorm) continue;
    if (qNorm.includes(synNorm) || synNorm.includes(qNorm)) {
      return true;
    }
    for (const token of tokens) {
      const tokenVariants = getExpandedTokenVariants(token);
      for (const variant of tokenVariants) {
        if (synNorm.includes(variant) || variant.includes(synNorm)) {
          return true;
        }
      }
      const tokenPKey = getPhoneticKey(token);
      const synPKey = getPhoneticKey(synNorm);
      if (tokenPKey && synPKey && tokenPKey === synPKey) {
        return true;
      }
    }
  }

  return false;
}

// Helper: check if digits query matches contact number
function matchesPhoneNumber(contactNumber: string | undefined | null, query: string): boolean {
  if (!contactNumber) return false;
  const qDigits = query.replace(/[^0-9]/g, '');
  if (qDigits.length < 3) return false;
  const phoneDigits = contactNumber.replace(/[^0-9]/g, '');
  return phoneDigits.includes(qDigits);
}

// Match a single Job with search query
export function matchJobWithQuery(job: Job, query: string): boolean {
  const qNorm = normalize(query);
  if (!qNorm) return true;

  // General "jobs" keyword matches all jobs
  const jobKeywords = ['வேலை', 'வேலைகள்', 'job', 'jobs', 'vacancy', 'काम', 'పని', 'జோலி', 'ಕೆಲಸ'];
  if (jobKeywords.some((k) => qNorm === k)) {
    return true;
  }

  // Phone number search
  if (matchesPhoneNumber(job.contactNumber, query)) {
    return true;
  }

  // Build comprehensive multi-lingual field collection
  const fieldList: string[] = [
    job.employerName,
    job.location,
    job.locationAddress || '',
    job.city || '',
    job.district || '',
    job.state || '',
    job.notes || '',
    job.category,
    job.customCategoryName || '',
    job.categoryCustomName || '',
    ...(job.benefits || []),
  ];

  // Include all generated translations (ta, en, hi, te, ml, kn)
  if (job.translations) {
    for (const trans of Object.values(job.translations)) {
      if (!trans) continue;
      if (trans.employerName) fieldList.push(trans.employerName);
      if (trans.location) fieldList.push(trans.location);
      if (trans.city) fieldList.push(trans.city);
      if (trans.district) fieldList.push(trans.district);
      if (trans.state) fieldList.push(trans.state);
      if (trans.notes) fieldList.push(trans.notes);
    }
  }

  // Cross language checks on customCategoryName, employerName, notes
  if (job.customCategoryName && (matchesCrossLanguage(query, job.customCategoryName) || matchesCrossLanguage(job.customCategoryName, query))) {
    return true;
  }
  if (job.categoryCustomName && (matchesCrossLanguage(query, job.categoryCustomName) || matchesCrossLanguage(job.categoryCustomName, query))) {
    return true;
  }
  if (matchesCrossLanguage(query, job.employerName) || matchesCrossLanguage(job.employerName, query)) {
    return true;
  }
  if (job.notes && (matchesCrossLanguage(query, job.notes) || matchesCrossLanguage(job.notes, query))) {
    return true;
  }

  const { haystackText, phoneticKeys } = buildMultilingualSearchHaystack(fieldList);

  // 1. Direct exact or substring query match in combined haystack
  if (haystackText.includes(qNorm)) {
    return true;
  }

  // 2. Query without stopwords
  const meaningfulTokens = getMeaningfulTokens(query);
  const cleanQueryWithoutStopwords = meaningfulTokens.join(' ');
  if (cleanQueryWithoutStopwords && haystackText.includes(cleanQueryWithoutStopwords)) {
    return true;
  }

  // 3. Category match
  if (doesCategoryMatch(job.category, job.customCategoryName || job.categoryCustomName, query)) {
    return true;
  }

  // 4. Token-by-token check: Every meaningful token must match at least one field, transliteration variant, or phonetic key
  if (meaningfulTokens.length > 0) {
    const allTokensFound = meaningfulTokens.every((token) => {
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => haystackText.includes(v))) return true;

      const pKey = getPhoneticKey(token);
      if (pKey && phoneticKeys.has(pKey)) return true;

      return false;
    });
    if (allTokensFound) return true;

    // 5. If the query contained a registered person's name or specific word (token >= 3 characters)
    const employerNorm = normalize(job.employerName);
    const hasSpecificNameMatch = meaningfulTokens.some((token) => {
      if (token.length < 3) return false;
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => employerNorm.includes(v))) return true;
      const pKey = getPhoneticKey(token);
      const empPKey = getPhoneticKey(employerNorm);
      return Boolean(pKey && empPKey && pKey === empPKey);
    });
    if (hasSpecificNameMatch) return true;
  }

  return false;
}

// Match a single Job Seeker / Worker with search query
export function matchSeekerWithQuery(seeker: JobSeeker, query: string): boolean {
  const qNorm = normalize(query);
  if (!qNorm) return true;

  // General "workers" keywords match all workers
  const workerKeywords = [
    'ஆட்கள்', 'தொழிலாளி', 'தொழிலாளர்கள்', 'ஆள்', 'காரியஸ்தர்',
    'worker', 'workers', 'seeker', 'seekers', 'labour', 'labourers', 'labor',
    'कारीगर', 'मजदूर', 'కార్మికులు', 'തൊഴിലാളികൾ', 'ಕೆಲಸಗಾರರು'
  ];
  if (workerKeywords.some((k) => qNorm === k)) {
    return true;
  }

  // Phone number search
  if (matchesPhoneNumber(seeker.mobileNumber, query)) {
    return true;
  }

  // Cross language checks on customCategoryName, seeker name, notes, skills
  if (seeker.customCategoryName && (matchesCrossLanguage(query, seeker.customCategoryName) || matchesCrossLanguage(seeker.customCategoryName, query))) {
    return true;
  }
  if (seeker.categoryCustomName && (matchesCrossLanguage(query, seeker.categoryCustomName) || matchesCrossLanguage(seeker.categoryCustomName, query))) {
    return true;
  }
  if (matchesCrossLanguage(query, seeker.name) || matchesCrossLanguage(seeker.name, query)) {
    return true;
  }
  if (seeker.skills && seeker.skills.some((sk) => matchesCrossLanguage(query, sk) || matchesCrossLanguage(sk, query))) {
    return true;
  }
  if (seeker.notes && (matchesCrossLanguage(query, seeker.notes) || matchesCrossLanguage(seeker.notes, query))) {
    return true;
  }

  // Build comprehensive multi-lingual field collection
  const fieldList: string[] = [
    seeker.name,
    seeker.location,
    seeker.locationAddress || '',
    seeker.city || '',
    seeker.district || '',
    seeker.state || '',
    seeker.notes || '',
    seeker.category,
    seeker.customCategoryName || '',
    seeker.categoryCustomName || '',
    ...(seeker.skills || []),
  ];

  // Include all generated translations (ta, en, hi, te, ml, kn)
  if (seeker.translations) {
    for (const trans of Object.values(seeker.translations)) {
      if (!trans) continue;
      if (trans.name) fieldList.push(trans.name);
      if (trans.location) fieldList.push(trans.location);
      if (trans.city) fieldList.push(trans.city);
      if (trans.district) fieldList.push(trans.district);
      if (trans.state) fieldList.push(trans.state);
      if (trans.customCategoryName) fieldList.push(trans.customCategoryName);
      if (trans.notes) fieldList.push(trans.notes);
    }
  }

  const { haystackText, phoneticKeys } = buildMultilingualSearchHaystack(fieldList);

  // 1. Direct exact or substring query match in combined haystack
  if (haystackText.includes(qNorm)) {
    return true;
  }

  // 2. Query without stopwords
  const meaningfulTokens = getMeaningfulTokens(query);
  const cleanQueryWithoutStopwords = meaningfulTokens.join(' ');
  if (cleanQueryWithoutStopwords && haystackText.includes(cleanQueryWithoutStopwords)) {
    return true;
  }

  // 3. Category match
  if (doesCategoryMatch(seeker.category, seeker.customCategoryName || seeker.categoryCustomName, query)) {
    return true;
  }

  // 4. Token-by-token check: Every meaningful token must match at least one field, transliteration variant, or phonetic key
  if (meaningfulTokens.length > 0) {
    const allTokensFound = meaningfulTokens.every((token) => {
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => haystackText.includes(v))) return true;

      const pKey = getPhoneticKey(token);
      if (pKey && phoneticKeys.has(pKey)) return true;

      return false;
    });
    if (allTokensFound) return true;

    // 5. If the query contained a registered person's name (token >= 3 characters) that matches seeker name directly
    const nameNorm = normalize(seeker.name);
    const hasSpecificNameMatch = meaningfulTokens.some((token) => {
      if (token.length < 3) return false;
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => nameNorm.includes(v))) return true;
      const pKey = getPhoneticKey(token);
      const namePKey = getPhoneticKey(nameNorm);
      return Boolean(pKey && namePKey && pKey === namePKey);
    });
    if (hasSpecificNameMatch) return true;
  }

  return false;
}

// Match a single Shop Item with search query
export function matchShopWithQuery(shop: ShopItem, query: string): boolean {
  const qNorm = normalize(query);
  if (!qNorm) return true;

  // General "shops" keywords match all shops
  const shopKeywords = [
    'கடை', 'கடைகள்', 'ஷாப்', 'store', 'shop', 'shops', 'stores',
    'दुकान', 'दुकानें', 'షాపులు', 'ഷോപ്പുകൾ', 'ಅಂಗಡಿಗಳು'
  ];
  if (shopKeywords.some((k) => qNorm === k)) {
    return true;
  }

  // Phone / WhatsApp search
  if (matchesPhoneNumber(shop.phone, query) || matchesPhoneNumber(shop.whatsapp, query)) {
    return true;
  }

  // Cross language checks on shop name, category, materials
  if (
    matchesCrossLanguage(query, shop.name) ||
    matchesCrossLanguage(shop.name, query) ||
    (shop.nameTa && (matchesCrossLanguage(query, shop.nameTa) || matchesCrossLanguage(shop.nameTa, query)))
  ) {
    return true;
  }
  if (shop.categoryLabelEn && (matchesCrossLanguage(query, shop.categoryLabelEn) || matchesCrossLanguage(shop.categoryLabelEn, query))) {
    return true;
  }
  if (shop.categoryLabelTa && (matchesCrossLanguage(query, shop.categoryLabelTa) || matchesCrossLanguage(shop.categoryLabelTa, query))) {
    return true;
  }
  if (shop.materialsList?.some((m) => matchesCrossLanguage(query, m) || matchesCrossLanguage(m, query))) {
    return true;
  }
  if (shop.materialsListTa?.some((m) => matchesCrossLanguage(query, m) || matchesCrossLanguage(m, query))) {
    return true;
  }

  // Build comprehensive shop field collection
  const fieldList: string[] = [
    shop.name,
    shop.nameTa || '',
    (shop as any).ownerName || '',
    (shop as any).ownerNameTa || '',
    shop.category,
    shop.categoryLabelEn || '',
    shop.categoryLabelTa || '',
    shop.address,
    shop.city,
    shop.cityTa || '',
    shop.stateEn || '',
    shop.stateTa || '',
    ...(shop.materialsList || []),
    ...(shop.materialsListTa || []),
  ];

  const { haystackText, phoneticKeys } = buildMultilingualSearchHaystack(fieldList);

  // 1. Direct exact or substring query match in combined haystack
  if (haystackText.includes(qNorm)) {
    return true;
  }

  // 2. Query without stopwords
  const meaningfulTokens = getMeaningfulTokens(query);
  const cleanQueryWithoutStopwords = meaningfulTokens.join(' ');
  if (cleanQueryWithoutStopwords && haystackText.includes(cleanQueryWithoutStopwords)) {
    return true;
  }

  // 3. Token-by-token check
  if (meaningfulTokens.length > 0) {
    const allTokensFound = meaningfulTokens.every((token) => {
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => haystackText.includes(v))) return true;

      const pKey = getPhoneticKey(token);
      if (pKey && phoneticKeys.has(pKey)) return true;

      return false;
    });
    if (allTokensFound) return true;

    // 4. Specific shop/owner name match
    const shopNameNorm = `${normalize(shop.name)} ${normalize(shop.nameTa)}`;
    const hasSpecificNameMatch = meaningfulTokens.some((token) => {
      if (token.length < 3) return false;
      const variants = getExpandedTokenVariants(token);
      if (variants.some((v) => shopNameNorm.includes(v))) return true;
      const pKey = getPhoneticKey(token);
      const sPKey = getPhoneticKey(shopNameNorm);
      return Boolean(pKey && sPKey && pKey === sPKey);
    });
    if (hasSpecificNameMatch) return true;
  }

  return false;
}

// Automatically detect the most relevant tab based on user's query intent
export function detectQueryIntent(query: string): 'all' | 'jobs' | 'workers' | 'shops' {
  const qNorm = normalize(query);
  if (!qNorm) return 'all';

  // 1. Check strong multi-word or distinct worker intent first:
  // e.g. "தாம்பரம் ஆட்கள் வேண்டும்", "ஆட்கள் தேவை", "தொழிலாளர்கள் வேண்டும்", "வேலைக்கு ஆட்கள்", "workers needed in tambaram"
  const workerPhrases = [
    'ஆட்கள் வேண்டும்', 'ஆட்கள் தேவை', 'ஆட்கள் வேணும்', 'ஆள் வேண்டும்', 'ஆள் தேவை', 'ஆள் வேணும்',
    'தொழிலாளர்கள் வேண்டும்', 'தொழிலாளர்கள் தேவை', 'தொழிலாளி வேண்டும்', 'தொழிலாளி தேவை',
    'வேலைக்கு ஆட்கள்', 'வேலைக்கு ஆள்', 'வேலை செய்ய ஆட்கள்',
    'நபர்கள் வேண்டும்', 'நபர்கள் தேவை', 'நபர்களை',
    'ஆட்கள்', 'தொழிலாளர்கள்', 'தொழிலாளி', 'காரியஸ்தர்', 'கூலியாள்', 'கூலியாட்கள்', 'ஹெல்பர்கள்',
    'workers needed', 'workers wanted', 'helpers needed', 'helpers wanted', 'labour needed',
    'people needed', 'people wanted', 'manpower needed', 'need workers', 'need helpers', 'need labour',
    'worker in', 'workers in', 'labour in', 'helpers in',
    'worker', 'workers', 'seeker', 'seekers', 'labour', 'labourer', 'labor',
    'कारीगर', 'मजदूर', 'కార్మికులు', 'തൊഴിലാളികൾ', 'ಕೆಲಸಗಾರರು'
  ];
  if (workerPhrases.some((w) => qNorm.includes(w))) {
    return 'workers';
  }

  // 2. Strong job intent phrases:
  // e.g. "தாம்பரத்தில் வேலை வேண்டும்", "சென்னையில் வேலை தேவை", "வேலை வாய்ப்பு", "jobs in chennai"
  const jobPhrases = [
    'வேலை வேண்டும்', 'வேலை வேணும்', 'வேலை தேவை', 'வேலை வாய்ப்பு', 'வேலைவாய்ப்பு',
    'வேலை வாய்ப்புகள்', 'வேலை தேடுகிறேன்', 'வேலை இருக்கா', 'வேலை உள்ளதா',
    'வேலைக்கு சேர', 'வேலை செய்ய',
    'jobs in', 'job in', 'work in', 'jobs needed', 'job needed', 'work needed',
    'looking for job', 'looking for work', 'jobs wanted', 'job wanted',
    'need job', 'need work', 'vacancy', 'vacancies',
    'வேலை', 'வேலைகள்', 'job', 'jobs',
    'काम चाहिए', 'नौकरी', 'పని కావాలి', 'ജോലി വേണം', 'ಕೆಲಸ ಬೇಕು'
  ];
  if (jobPhrases.some((j) => qNorm.includes(j))) {
    return 'jobs';
  }

  // 3. Shop phrases:
  const shopPhrases = [
    'கடை', 'கடைகள்', 'ஷாப்', 'சிமெண்ட் கடை', 'ஹார்டுவேர்', 'கட்டுமான பொருட்கள்',
    'shop', 'shops', 'store', 'stores', 'hardware', 'cement', 'दुकान', 'ஷாపులు', 'ഷോപ്പ്'
  ];
  if (shopPhrases.some((s) => qNorm.includes(s))) {
    return 'shops';
  }

  return 'all';
}
