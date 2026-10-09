/**
 * Dynamic Bidirectional Transliteration & Multilingual Search Engine
 * 
 * Supports cross-language matching across:
 * - English / Tanglish (e.g. "cinima", "cinema", "sinima", "kothanar", "sithal", "vivasayam", "meen", "koli")
 * - Tamil Script (e.g. "சினிமா", "கொத்தனார்", "சித்தாள்", "விவசாயம்", "மீன்", "கோழி")
 * - Hindi, Telugu, Malayalam, Kannada scripts
 * - Phonetic sound-matching (handles spelling variants automatically)
 */

// 1. Tamil Unicode Character Maps
const TAMIL_VOWELS: Record<string, string[]> = {
  '\u0B85': ['a'],              // அ
  '\u0B86': ['aa', 'a'],        // ஆ
  '\u0B87': ['i', 'e'],         // இ
  '\u0B88': ['ee', 'ii', 'i'],   // ஈ
  '\u0B89': ['u', 'oo'],        // உ
  '\u0B8A': ['oo', 'uu', 'u'],   // ஊ
  '\u0B8E': ['e'],              // எ
  '\u0B8F': ['ae', 'ee', 'e'],   // ஏ
  '\u0B90': ['ai', 'ay'],        // ஐ
  '\u0B92': ['o'],              // ஒ
  '\u0B93': ['oo', 'o'],        // ஓ
  '\u0B94': ['au', 'ow'],        // ஔ
  '\u0B83': ['ah', 'ak'],        // ஃ
};

const TAMIL_VOWEL_SIGNS: Record<string, string[]> = {
  '\u0BBE': ['aa', 'a'],        // ா
  '\u0BBF': ['i', 'e'],         // ி (e.g. சி -> ci, si, chi)
  '\u0BC0': ['ee', 'ii', 'i'],   // ீ
  '\u0BC1': ['u', 'oo'],        // ு
  '\u0BC2': ['oo', 'uu', 'u'],   // ூ
  '\u0BC6': ['e'],              // ெ
  '\u0BC7': ['ae', 'ee', 'e'],   // ே
  '\u0BC8': ['ai', 'ay', 'ey'],  // ை
  '\u0BCA': ['o'],              // ொ
  '\u0BCB': ['oo', 'o'],        // ோ
  '\u0BCC': ['au', 'ow'],        // ௌ
};

const TAMIL_CONSONANTS: Record<string, { base: string[]; full: string[] }> = {
  '\u0B95': { base: ['k', 'g', 'c'], full: ['ka', 'ga', 'ca'] },        // க
  '\u0B99': { base: ['ng'], full: ['nga'] },                             // ங
  '\u0B9A': { base: ['s', 'c', 'ch', 'sh'], full: ['sa', 'ca', 'cha'] }, // ச
  '\u0B9E': { base: ['nj', 'gn'], full: ['nja', 'gna'] },                // ஞ
  '\u0B9F': { base: ['t', 'd', 'th'], full: ['ta', 'da', 'tha'] },       // ட
  '\u0BA3': { base: ['n'], full: ['na'] },                               // ண
  '\u0BA4': { base: ['th', 't', 'd'], full: ['tha', 'ta', 'da'] },       // த
  '\u0BA8': { base: ['n'], full: ['na'] },                               // ந
  '\u0BAA': { base: ['p', 'b'], full: ['pa', 'ba'] },                   // ப
  '\u0BAE': { base: ['m'], full: ['ma'] },                               // ம
  '\u0BAF': { base: ['y'], full: ['ya'] },                               // ய
  '\u0BB0': { base: ['r'], full: ['ra'] },                               // ர
  '\u0BB2': { base: ['l'], full: ['la'] },                               // ல
  '\u0BB5': { base: ['v', 'w'], full: ['va', 'wa'] },                   // வ
  '\u0BB4': { base: ['zh', 'z', 'l'], full: ['zha', 'za', 'la'] },       // ழ
  '\u0BB3': { base: ['l', 'll', 'lh'], full: ['la', 'lla'] },            // ள
  '\u0BB1': { base: ['r', 'rr', 'tr'], full: ['ra', 'rra', 'tra'] },     // ற
  '\u0BA9': { base: ['n'], full: ['na'] },                               // ன
  '\u0B9C': { base: ['j'], full: ['ja'] },                               // ஜ
  '\u0BB6': { base: ['sh', 's'], full: ['sha', 'sa'] },                 // ஶ
  '\u0BB7': { base: ['sh'], full: ['sha'] },                             // ஷ
  '\u0BB8': { base: ['s'], full: ['sa'] },                               // ஸ
  '\u0BB9': { base: ['h'], full: ['ha'] },                               // ஹ
};

const VIRAMA = '\u0BCD'; // ் pulli

// Caches for high performance
const tanglishCache = new Map<string, string[]>();
const phoneticKeyCache = new Map<string, string>();
const tokenVariantsCache = new Map<string, string[]>();

/**
 * Checks if a string contains any Tamil script character
 */
export function hasTamilScript(str: string): boolean {
  return /[\u0B80-\u0BFF]/.test(str);
}

/**
 * Converts a Tamil word into its Romanized/Tanglish phonetic spellings.
 * Example: "சினிமா" -> ["cinima", "sinima", "cinema", "sinema", "seenima"]
 */
export function tamilToTanglish(text: string): string[] {
  if (!text || !hasTamilScript(text)) return [];
  const clean = text.trim();
  if (!clean || clean.length > 40) return [clean];

  const cached = tanglishCache.get(clean);
  if (cached) return cached;

  const results: string[][] = [];
  const chars = Array.from(clean);

  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    const next = i + 1 < chars.length ? chars[i + 1] : '';

    // Check independent vowel
    if (TAMIL_VOWELS[ch]) {
      results.push(TAMIL_VOWELS[ch]);
      i++;
      continue;
    }

    // Check consonant
    if (TAMIL_CONSONANTS[ch]) {
      const consonant = TAMIL_CONSONANTS[ch];

      if (next === VIRAMA) {
        // Pure consonant with pulli: க், ச், ன், etc.
        results.push(consonant.base);
        i += 2;
        continue;
      } else if (next && TAMIL_VOWEL_SIGNS[next]) {
        // Consonant + vowel sign: சி, னி, மா, etc.
        const vowelVariants = TAMIL_VOWEL_SIGNS[next];
        const combinedVariants: string[] = [];

        for (const cBase of consonant.base) {
          for (const vSign of vowelVariants) {
            combinedVariants.push(cBase + vSign);

            // Special colloquial English mapping:
            // "சி" -> "ci", "si", "chi", AND often "ce" in "cinema"!
            if (ch === '\u0B9A' && (next === '\u0BBF' || next === '\u0BC0')) {
              combinedVariants.push('ce', 'se');
            }
            // "னெ" / "னி" in English loan words:
            if ((ch === '\u0BA9' || ch === '\u0BA3' || ch === '\u0BA8') && (next === '\u0BBF' || next === '\u0BC0')) {
              combinedVariants.push('ne');
            }
          }
        }
        results.push(Array.from(new Set(combinedVariants)));
        i += 2;
        continue;
      } else {
        // Consonant with inherent 'a': க, ச, ம, etc.
        results.push(consonant.full);
        i++;
        continue;
      }
    }

    // Whitespace or non-Tamil character
    results.push([ch]);
    i++;
  }

  // Generate Cartesian product combinations (capped to top 12 variants to keep performance ultra fast)
  let combinations: string[] = [''];
  for (const step of results) {
    const nextCombos: string[] = [];
    const limit = Math.min(step.length, 2);
    for (let s = 0; s < limit; s++) {
      const variant = step[s];
      for (const prefix of combinations) {
        nextCombos.push(prefix + variant);
      }
    }
    combinations = nextCombos.slice(0, 12);
  }

  // Also add common loan-word variants (e.g. sinima -> cinema)
  const additionalVariants = new Set<string>(combinations);
  for (const c of combinations) {
    if (c.includes('sinima')) additionalVariants.add(c.replace(/sinima/g, 'cinema'));
    if (c.includes('cinima')) additionalVariants.add(c.replace(/cinima/g, 'cinema'));
    if (c.includes('sinema')) additionalVariants.add(c.replace(/sinema/g, 'cinema'));
    if (c.includes('cinema')) additionalVariants.add(c.replace(/cinema/g, 'cinima'));
  }

  const finalResult = Array.from(additionalVariants);
  if (tanglishCache.size < 1000) {
    tanglishCache.set(clean, finalResult);
  }
  return finalResult;
}

/**
 * Phonetic normalizer key (Indian language & English sound key).
 * Reduces spelling ambiguities so "cinima", "cinema", "sinima", "sinema", and "சினிமா"
 * ALL map to the exact same key: "SNM".
 */
export function getPhoneticKey(str: string): string {
  if (!str) return '';

  const clean = str.toLowerCase().trim();
  if (!clean) return '';

  const cached = phoneticKeyCache.get(clean);
  if (cached !== undefined) return cached;

  let s = clean;

  // If input is in Tamil script, first convert to its primary Tanglish sound
  if (hasTamilScript(s)) {
    const tanglish = tamilToTanglish(s);
    if (tanglish.length > 0) {
      s = tanglish[0];
    }
  }

  // Clean non-letters
  s = s.replace(/[^a-z0-9]/g, '');
  if (!s) {
    phoneticKeyCache.set(clean, '');
    return '';
  }

  // 1. Unify initial/soft 'c' to 's' if followed by 'e', 'i', 'y' (e.g. cinema, cinima -> sinima)
  s = s.replace(/c(?=[eiy])/g, 's');

  // 2. Unify 'ch' to 's' or 'c'
  s = s.replace(/ch/g, 's');

  // 3. Unify 'ck' or 'c' elsewhere to 'k'
  s = s.replace(/ck/g, 'k');
  s = s.replace(/c/g, 'k');

  // 4. Unify aspirated / dental consonants common in Indian languages:
  s = s.replace(/(th|dh)/g, 't');
  s = s.replace(/d/g, 't');
  s = s.replace(/b/g, 'p');
  s = s.replace(/g/g, 'k');
  s = s.replace(/w/g, 'v');
  s = s.replace(/zh/g, 'l');
  s = s.replace(/z/g, 's');
  s = s.replace(/sh/g, 's');
  s = s.replace(/j/g, 's');

  // 5. Unify vowel clusters:
  s = s.replace(/(ee|ea|ii)/g, 'i');
  s = s.replace(/(oo|ou|uu)/g, 'u');
  s = s.replace(/(ai|ay|ey|ae)/g, 'e');
  s = s.replace(/e/g, 'i');

  // 6. Squeeze double letters
  s = s.replace(/([a-z])\1+/g, '$1');

  // Consonant skeleton (extract consonants with first vowel if any)
  const firstLetter = s.charAt(0);
  const consonants = s.slice(1).replace(/[aeiou]/g, '');

  const key = (firstLetter + consonants).toUpperCase();
  if (phoneticKeyCache.size < 2000) {
    phoneticKeyCache.set(clean, key);
  }
  return key;
}

/**
 * Rich multilingual dictionary of everyday professions, industries, colloquial trades,
 * materials, and daily terms.
 * If user types ANY of these in ANY language, it automatically matches all sister terms!
 */
export const MULTILINGUAL_DICTIONARY: Array<{
  en: string[];
  ta: string[];
  hi?: string[];
  te?: string[];
  ml?: string[];
  kn?: string[];
}> = [
  // Cinema / Media / Entertainment
  {
    en: ['cinema', 'cinima', 'sinima', 'sinema', 'movie', 'film', 'shooting', 'theatre', 'theater', 'actor', 'lightman', 'camera', 'cameraman', 'spotboy', 'artist', 'studio', 'editing', 'production'],
    ta: ['சினிமா', 'திரைப்படம்', 'படப்பிடிப்பு', 'தியேட்டர்', 'திரையரங்கம்', 'லைட்மேன்', 'கேமரா', 'நடிகர்', 'ஸ்டுடியோ', 'செட் வேலை', 'ஸ்பாட் பாய்', 'சினிமா வேலை'],
    hi: ['सिनेमा', 'फिल्म', 'मूवी', 'शूटिंग', 'थिएटर'],
    te: ['సినిమా', 'చిత్రం', 'షూటింగ్', 'థియేటర్'],
    ml: ['സിനിമ', 'ചലച്ചിത്രം', 'ഷൂട്ടിംഗ്', 'തിയേറ്റർ'],
    kn: ['ಸಿನಿಮಾ', 'ಚಲನಚಿತ್ರ', 'ಶೂಟಿಂಗ್', 'ಚಿತ್ರಮಂದಿರ'],
  },
  // Masonry / Construction
  {
    en: ['mason', 'masonry', 'kothanar', 'sithal', 'chithal', 'mesthri', 'construction', 'building', 'brick', 'cement', 'rajmistri', 'concrete', 'plastering'],
    ta: ['கொத்தனார்', 'சித்தாள்', 'மேஸ்திரி', 'கட்டிடம்', 'கட்டுமானம்', 'சிமெண்ட்', 'செங்கல்', 'பூச்சு', 'கான்கிரீட்'],
    hi: ['राजमिस्त्री', 'चिनाई', 'भवन निर्माण', 'मजदूर', 'सीमेंट'],
    te: ['మేస్త్రీ', 'భవన నిర్మాణం', 'సిమెంట్', 'ఇటుక'],
    ml: ['മേസ്തിരി', 'നിർമ്മാണം', 'സിമന്റ്', 'കല്ല്'],
    kn: ['ಗಾರೆ ಕೆಲಸ', 'ಕಟ್ಟಡ ಕಾಮಗಾರಿ', 'ಸಿಮೆಂಟ್'],
  },
  // Painting
  {
    en: ['paint', 'painter', 'painting', 'whitewash', 'distemper', 'color', 'polish', 'varnish'],
    ta: ['பெயிண்டர்', 'பெயிண்டிங்', 'பெயிண்ட்', 'வர்ணம்', 'வெள்ளை அடிப்பது', 'பாலிஷ்', 'வண்ணம்'],
    hi: ['पेंटर', 'रंग', 'सफेदी', 'पेंटिंग'],
    te: ['పెయింటర్', 'రంగులు', 'పెయింటింగ్'],
    ml: ['പെയിന്റർ', 'പെയിന്റിംഗ്'],
    kn: ['ಪೇಂಟರ್', 'ಬಣ್ಣ ಬಳಿಯುವುದು'],
  },
  // Carpentry
  {
    en: ['carpenter', 'carpentry', 'wood', 'furniture', 'door', 'window', 'thachhu', 'thatchu', 'thachu', 'woodwork', 'timber'],
    ta: ['தச்சு', 'மரவேலை', 'கார்பெண்டர்', 'மரச்சாமான்கள்', 'கதவு', 'ஜன்னல்'],
    hi: ['बढ़ई', 'लकड़ी काम', 'फर्नीचर'],
    te: ['వడ్రంగి', 'చెక్క పని'],
    ml: ['ആശാരി', 'മരപ്പണി'],
    kn: ['ಬಡಗಿ', 'ಮರದ ಕೆಲಸ'],
  },
  // Plumbing
  {
    en: ['plumber', 'plumbing', 'pipe', 'leak', 'tap', 'motor', 'pipeline', 'tank', 'drainage'],
    ta: ['பிளம்பர்', 'பிளம்பிங்', 'குழாய்', 'தண்ணீர்', 'மோட்டார்', 'பைப்', 'குழாய் வேலை'],
    hi: ['प्लंबर', 'नलसाज', 'पाइपलाइन'],
    te: ['ప్లంబర్', 'పైపులు'],
    ml: ['പ്ലംബർ', 'പൈപ്പ്'],
    kn: ['ಪ್ಲಂಬರ್', 'ಪೈಪ್'],
  },
  // Electrical
  {
    en: ['electric', 'electrical', 'electrician', 'wireman', 'wiring', 'switch', 'light', 'current', 'motor wiring', 'generator'],
    ta: ['எலக்ட்ரீசியன்', 'மின்சாரம்', 'மின்', 'வயரிங்', 'சுவிட்ச்', 'கரண்ட்', 'மின்வேலை'],
    hi: ['इलेक्ट्रीशियन', 'बिजली मिस्त्री', 'वायरिंग'],
    te: ['ఎలక్ట్రీషియన్', 'విద్యుత్'],
    ml: ['ഇലക്ട്രീഷ്യൻ', 'വൈദ്യുതി'],
    kn: ['ಎಲೆಕ್ಟ್ರಿಷಿಯನ್', 'ವಿದ್ಯುತ್'],
  },
  // Driver
  {
    en: ['driver', 'driving', 'auto', 'car', 'lorry', 'truck', 'van', 'taxi', 'ottunar', 'delivery driver', 'heavy driver'],
    ta: ['ஓட்டுநர்', 'டிரைவர்', 'ஆட்டோ', 'கார்', 'லாரி', 'வேன்', 'வாகனம்', 'டாக்சி'],
    hi: ['ड्राइवर', 'चालक', 'गाड़ी चलाना'],
    te: ['డ్రైవర్', 'ఆటో డ్రైవర్'],
    ml: ['ഡ്രൈവർ'],
    kn: ['ಚಾಲಕ'],
  },
  // Agriculture / Farming
  {
    en: ['agriculture', 'agri', 'farm', 'farmer', 'farming', 'field', 'harvest', 'crop', 'vivasayam', 'thottam', 'panna', 'paddy', 'sugarcane'],
    ta: ['விவசாயம்', 'தோட்டம்', 'பண்ணை', 'வயல்', 'அறுவடை', 'களை', 'வாழை', 'நெல்', 'கரும்பு', 'விவசாயி'],
    hi: ['खेती', 'किसान', 'कृषि', 'खेत'],
    te: ['వ్యవసాయం', 'రైతు', 'తోట'],
    ml: ['കൃഷി', 'കർഷകൻ', 'തോട്ടം'],
    kn: ['ಕೃಷಿ', 'ರೈತ', 'ತೋಟ'],
  },
  // Loading / Coolie
  {
    en: ['loading', 'unload', 'unloading', 'coolie', 'kooli', 'load', 'warehouse', 'luggage', 'parcel', 'moottai', 'hamali'],
    ta: ['லோடிங்', 'ஏற்றுதல்', 'இறக்குதல்', 'சுமை', 'மூட்டை', 'கூலி', 'குடோன்', 'சுமைதூக்குபவர்', 'சுமை ஆட்கள்'],
    hi: ['हमाली', 'लोडिंग', 'मजदूर', 'बोरी उठाना'],
    te: ['కూలీ', 'లోడింగ్'],
    ml: ['ഭാരം ചുമക്കൽ', 'ലോഡിംഗ്'],
    kn: ['ಹೊರೆ ಹೊರುವುದು', 'ಕೂಲಿ'],
  },
  // Helper / Assistant
  {
    en: ['helper', 'assistant', 'worker', 'labour', 'labor', 'coolie', 'all-rounder', 'aatkal', 'aal'],
    ta: ['உதவியாளர்', 'ஹெல்பர்', 'ஆட்கள்', 'ஆள்', 'கூலி', 'உதவி'],
    hi: ['सहायक', 'हेल्पर', 'मजदूर'],
    te: ['సహాయకుడు', 'హెల్పర్'],
    ml: ['സഹായി', 'ഹെൽപ്പർ'],
    kn: ['ಸಹಾಯಕ', 'ಕೆಲಸಗಾರ'],
  },
  // Welding / Fabrication
  {
    en: ['weld', 'welder', 'welding', 'workshop', 'iron', 'steel', 'fabrication', 'grill', 'lathe'],
    ta: ['வெல்டர்', 'வெல்டிங்', 'பட்டறை', 'இரும்பு', 'கிரில்', 'லேத்'],
    hi: ['वेल्डर', 'वेल्डिंग', 'लोहार'],
    te: ['వెల్డర్', 'వెల్డింగ్'],
    ml: ['വെൽഡർ'],
    kn: ['ವೆಲ್ಡರ್'],
  },
  // Tailor / Stitching
  {
    en: ['tailor', 'tailoring', 'stitching', 'sewing', 'cloth', 'dress', 'thayal', 'garments', 'fashion'],
    ta: ['தையல்', 'டைலர்', 'டெய்லர்', 'தையல்காரர்', 'துணி தைத்தல்', 'துணி'],
    hi: ['दर्जी', 'सिलाई'],
    te: ['దర్జీ', 'కుట్టు పని'],
    ml: ['തയ്യൽക്കാരൻ'],
    kn: ['ದರ್ಜಿ', 'ಹೊಲಿಗೆ'],
  },
  // Cooking / Catering / Chef
  {
    en: ['cook', 'cooking', 'chef', 'catering', 'samayal', 'master', 'tea master', 'parotta master', 'sweets', 'baker', 'bakery'],
    ta: ['சமையல்', 'குக்', 'சமையல்காரர்', 'கேட்டரிங்', 'டீ மாஸ்டர்', 'பரோட்டா மாஸ்டர்', 'பந்தி', 'உணவு'],
    hi: ['रसोइया', 'कुक', 'खानसामा', 'कैटरिंग'],
    te: ['వంటమనిషి', 'క్యాటరింగ్'],
    ml: ['പാചകക്കാരൻ', 'കറ്ററിംഗ്'],
    kn: ['ಅಡುಗೆಯವನು', 'ಕ್ಯಾಟರಿಂಗ್'],
  },
  // Housekeeping / Cleaning
  {
    en: ['housekeeping', 'cleaner', 'cleaning', 'sweep', 'sweeper', 'maid', 'servant', 'veettu velai', 'thuppuravu', 'washing'],
    ta: ['வீட்டு வேலை', 'துப்புரவு', 'சுத்தம்', 'கிளீனிங்', 'பணிப்பெண்', 'பாத்திரம்', 'பெருக்குதல்'],
    hi: ['सफाई कर्मचारी', 'झाड़ू-पोंछा', 'घरेलू सहायिका'],
    te: ['ఇంటి పని', 'స్వీపర్'],
    ml: ['വീട്ടുജോലി', 'ശുചീകരണം'],
    kn: ['ಮನೆ ಕೆಲಸ', 'ಸ್ವಚ್ಛತೆ'],
  },
  // Security / Watchman
  {
    en: ['security', 'watchman', 'guard', 'kaavalaali', 'gatekeeper', 'night watchman'],
    ta: ['செக்யூரிட்டி', 'வாட்ச்மேன்', 'காவலாளி', 'பாதுகாவலர்'],
    hi: ['सुरक्षा गार्ड', 'चौकीदार'],
    te: ['సెక్యూరిటీ గార్డు', 'వాచ్‌మెన్'],
    ml: ['സെക്യൂരിറ്റി', 'വാച്ച്മാൻ'],
    kn: ['ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ', 'ವಾಚ್‌ಮನ್'],
  },
  // Mechanic / Automobile
  {
    en: ['mechanic', 'garage', 'two wheeler', 'four wheeler', 'puncher', 'puncture', 'tyre', 'tire', 'service', 'water wash', 'auto mechanic'],
    ta: ['மெக்கானிக்', 'ஒர்க்ஷாப்', 'பஞ்சர்', 'டயர்', 'இருசக்கர வாகனம்', 'சர்வீஸ்'],
    hi: ['मैकेनिक', 'पंचर', 'गैराज'],
    te: ['మెకానిక్', 'పంచర్'],
    ml: ['മെക്കാനിക്'],
    kn: ['ಮೆಕ್ಯಾನಿಕ್'],
  },
  // Hotel / Restaurant / Tea Shop
  {
    en: ['hotel', 'restaurant', 'tea shop', 'bakery', 'lodge', 'canteen', 'dhaba', 'mess'],
    ta: ['ஹோட்டல்', 'உணவகம்', 'டீக்கடை', 'பேக்கரி', 'லாட்ஜ்', 'மெஸ்'],
    hi: ['होटल', 'रेस्टोरेंट', 'चाय की दुकान'],
    te: ['హోటల్', 'రెస్టారెంట్'],
    ml: ['ഹോട്ടൽ', 'റെസ്റ്റോറന്റ്'],
    kn: ['ಹೋಟೆಲ್'],
  },
  // Poultry / Chicken / Farm
  {
    en: ['poultry', 'chicken', 'broiler', 'koli', 'kozhi', 'egg', 'muttai', 'farm'],
    ta: ['கோழி', 'கோழிப்பண்ணை', 'முட்டை', 'பிராய்லர்', 'நாட்டுக்கோழி'],
    hi: ['पोल्ट्री फार्म', 'मुर्गी', 'अंडे'],
    te: ['కోళ్ల ఫారం', 'చికెన్'],
    ml: ['കോഴി ഫാം'],
    kn: ['ಕೋಳಿ ಸಾಕಣೆ'],
  },
  // Fish / Marine
  {
    en: ['fish', 'fishing', 'meen', 'fisherman', 'fishermen', 'seafood', 'boat'],
    ta: ['மீன்', 'மீன்பிடி', 'மீனவர்', 'மீன் கடை', 'படகு'],
    hi: ['मछली', 'मछुआरा'],
    te: ['చేపలు', 'మత్స్యకారుడు'],
    ml: ['മത്സ്യം', 'മീൻപിടുത്തം'],
    kn: ['ಮೀನು'],
  },
  // Cattle / Dairy / Milk
  {
    en: ['cattle', 'cow', 'buffalo', 'dairy', 'milk', 'paal', 'maadu', 'farm'],
    ta: ['மாடு', 'பால்', 'கறவை மாடு', 'பால் பண்ணை', 'பசு'],
    hi: ['डेयरी', 'गाय', 'भैंस', 'दूध'],
    te: ['డైరీ', 'ఆవు', 'పాలు'],
    ml: ['ക്ഷീരോൽപാദനം', 'പശു', 'പാൽ'],
    kn: ['ಹೈನುಗಾರಿಕೆ', 'ಹಸು', 'ಹಾಲು'],
  },
  // Event / Pandal / Sounds
  {
    en: ['pandal', 'pandhal', 'tent', 'sound', 'sounds', 'lights', 'speaker', 'mic', 'stage', 'decoration', 'event'],
    ta: ['பந்தல்', 'டெக்கரேஷன்', 'சவுண்ட் சர்வீஸ்', 'ஒளி ஒலி', 'மேடை', 'திருவிழா'],
    hi: ['टेंट हाउस', 'पंडाल', 'साउंड सिस्टम'],
    te: ['టెంట్ హౌస్', 'పందిరి'],
    ml: ['പന്തൽ', 'സൗണ്ട്'],
    kn: ['ಪಂಡಾಲ್', 'ಟೆಂಟ್'],
  },
  // Grocery / Provision / Materials
  {
    en: ['grocery', 'provision', 'maligai', 'supermarket', 'store', 'shop'],
    ta: ['மளிகை', 'மளிகைக்கடை', 'சரக்கு', 'கடை'],
    hi: ['किराना', 'दुकान'],
    te: ['కిరాణా', 'దుకాణం'],
    ml: ['പലചരക്ക് കട'],
    kn: ['ಕಿರಾಣಿ'],
  },
  // Hardware / Building Materials
  {
    en: ['hardware', 'cement', 'steel', 'iron', 'sand', 'brick', 'electricals', 'sanitary'],
    ta: ['ஹார்டுவேர்', 'சிமெண்ட்', 'கம்பி', 'மணல்', 'செங்கல்', 'சானிடரி'],
    hi: ['हार्डवेयर', 'सीमेंट', 'लोहा'],
    te: ['హార్డ్‌వేర్', 'సిమెంట్'],
    ml: ['ഹാർഡ്‌വെയർ', 'സിമന്റ്'],
    kn: ['ಹಾರ್ಡ್‌ವೇರ್'],
  },
  // Salon / Beauty
  {
    en: ['salon', 'saloon', 'barber', 'haircut', 'beauty parlour', 'beautician', 'spa'],
    ta: ['சலூன்', 'முடி திருத்துபவர்', 'பியூட்டி பார்லர்', 'அழகு நிலையம்'],
    hi: ['सैलून', 'नाई', 'ब्यूटी पार्लर'],
    te: ['సెలూన్', 'బార్బర్'],
    ml: ['സലൂൺ'],
    kn: ['ಸಲೂನ್'],
  },
  // Delivery / Courier
  {
    en: ['delivery', 'courier', 'parcel', 'delivery boy', 'swiggy', 'zomato', 'shipping'],
    ta: ['டெலிவரி', 'கூரியர்', 'பார்சல்', 'டெலிவரி பாய்', 'விநியோகம்'],
    hi: ['डिलीवरी', 'कूरियर'],
    te: ['డెలివరీ', 'కొరియర్'],
    ml: ['ഡെലിവറി'],
    kn: ['ಡೆಲಿವರಿ'],
  },
];

// Pre-indexed lookup maps for O(1) instant dictionary variant retrieval
const DICT_EXACT_MAP = new Map<string, string[]>();
const DICT_PKEY_MAP = new Map<string, string[]>();

// Build fast indexes once on startup
(() => {
  for (const entry of MULTILINGUAL_DICTIONARY) {
    const allWords = [
      ...entry.en,
      ...entry.ta,
      ...(entry.hi || []),
      ...(entry.te || []),
      ...(entry.ml || []),
      ...(entry.kn || []),
    ]
      .map((w) => w.toLowerCase().trim())
      .filter(Boolean);

    const uniqueAll = Array.from(new Set(allWords));

    for (const w of uniqueAll) {
      if (!DICT_EXACT_MAP.has(w)) {
        DICT_EXACT_MAP.set(w, uniqueAll);
      } else {
        const existing = DICT_EXACT_MAP.get(w)!;
        for (const item of uniqueAll) {
          if (!existing.includes(item)) existing.push(item);
        }
      }

      const pk = getPhoneticKey(w);
      if (pk && pk.length >= 2) {
        if (!DICT_PKEY_MAP.has(pk)) {
          DICT_PKEY_MAP.set(pk, [...uniqueAll]);
        } else {
          const existing = DICT_PKEY_MAP.get(pk)!;
          for (const item of uniqueAll) {
            if (!existing.includes(item)) existing.push(item);
          }
        }
      }
    }
  }
})();

/**
 * Returns all cross-language variants for a token (transliteration, phonetic equivalents, dictionary synonyms)
 * Executes in sub-millisecond time via pre-indexed maps and memoization.
 */
export function getCrossLanguageTokenVariants(token: string): string[] {
  if (!token) return [];
  const clean = token.toLowerCase().trim();
  if (!clean) return [];

  const cached = tokenVariantsCache.get(clean);
  if (cached) return cached;

  const variants = new Set<string>([clean]);

  // 1. If token is in Tamil script -> convert to Tanglish / English phonetic variants
  if (hasTamilScript(clean)) {
    const tanglishList = tamilToTanglish(clean);
    for (const t of tanglishList) {
      variants.add(t);
    }
  }

  // 2. Direct exact dictionary lookup: O(1) instant hit
  const exactHits = DICT_EXACT_MAP.get(clean);
  if (exactHits) {
    for (const w of exactHits) {
      variants.add(w);
    }
  } else {
    // 3. Phonetic key lookup: O(1) instant hit (handles typos like cinima -> cinema)
    const pKey = getPhoneticKey(clean);
    if (pKey && pKey.length >= 2) {
      const pHits = DICT_PKEY_MAP.get(pKey);
      if (pHits) {
        for (const w of pHits) {
          variants.add(w);
        }
      }
    }
  }

  const result = Array.from(variants);
  if (tokenVariantsCache.size < 2000) {
    tokenVariantsCache.set(clean, result);
  }
  return result;
}

/**
 * Evaluates whether two tokens or phrases match phonetically or semantically across languages.
 * Ultra fast: checks direct substring, pre-indexed cross-language variants, and phonetic keys.
 */
export function matchesCrossLanguage(queryToken: string, targetText: string): boolean {
  if (!queryToken || !targetText) return false;

  const qClean = queryToken.toLowerCase().trim();
  const tClean = targetText.toLowerCase().trim();
  if (!qClean || !tClean) return false;

  // Direct substring
  if (tClean.includes(qClean) || qClean.includes(tClean)) return true;

  // Check all cross-language variants of the query token
  const qVariants = getCrossLanguageTokenVariants(qClean);
  for (const variant of qVariants) {
    if (tClean.includes(variant)) {
      return true;
    }
  }

  // Check phonetic key equality for single tokens
  if (qClean.length >= 2 && !qClean.includes(' ')) {
    const qKey = getPhoneticKey(qClean);
    if (qKey.length >= 2) {
      const targetWords = tClean.split(/[^a-zA-Z0-9\u0B80-\u0BFF]+/);
      for (const word of targetWords) {
        if (word.length >= 2 && getPhoneticKey(word) === qKey) {
          return true;
        }
      }
    }
  }

  return false;
}
