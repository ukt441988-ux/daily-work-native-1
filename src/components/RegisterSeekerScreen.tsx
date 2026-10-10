import React, { useState } from 'react';
import { JobSeeker, Language } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { findNearestLocation, buildGoogleMapsSearchUrl, COUNTRIES_LIST } from '../data/locations';
import {
  getStatesForCountry,
  getDistrictsForState,
  getCitiesForDistrict,
} from '../data/allLocationsData';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { generateSeekerTranslations } from '../utils/translator';
import { saveActiveUserProfile, addTrackedPhone } from '../utils/userStorage';
import {
  UserCheck,
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Crosshair,
  ExternalLink,
  Loader2,
  Globe,
  Languages,
  X,
  Compass,
} from 'lucide-react';

interface RegisterSeekerScreenProps {
  onRegisterSeeker: (seeker: Omit<JobSeeker, 'id' | 'registeredAt'>) => void;
  onNavigateToJobs: () => void;
  allowSeekerRegistration?: boolean;
}

export const RegisterSeekerScreen: React.FC<RegisterSeekerScreenProps> = ({
  onRegisterSeeker,
  onNavigateToJobs,
  allowSeekerRegistration = true,
}) => {
  const { language, loc, getCategoryName } = useLanguage();

  // 1. Posting Language - Allows worker to post in their mother tongue
  const [postingLanguage, setPostingLanguage] = useState<Language>(
    language === 'bilingual' ? 'ta' : language
  );

  // 2. Personal Information
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // 3. Category & Custom Category Option
  const [category, setCategory] = useState(WORK_CATEGORIES[0].id);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // 4. Cascading Multi-Tier Location State
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('TN');
  const [selectedDistrict, setSelectedDistrict] = useState('che');
  const [selectedCity, setSelectedCity] = useState('சென்னை');

  // Custom text fallback if "OTHER_*" is picked
  const [customState, setCustomState] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customCity, setCustomCity] = useState('');

  // Street / Village / Locality / Landmark
  const [locality, setLocality] = useState('');
  const [landmarkAddress, setLandmarkAddress] = useState('');

  // GPS / Geolocation
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // 5. Wage & Experience
  const [expectedDailyWage, setExpectedDailyWage] = useState<number>(850);
  const [experienceYears, setExperienceYears] = useState<number>(2);

  // Form State
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const wagePresets = [600, 700, 800, 900, 1000, 1200];

  // Dynamic cascading lists based on selection
  const availableStates = getStatesForCountry(selectedCountry);
  const availableDistricts =
    selectedState !== 'OTHER_STATE' ? getDistrictsForState(selectedCountry, selectedState) : [];
  const availableCities =
    selectedDistrict !== 'OTHER_DISTRICT'
      ? getCitiesForDistrict(selectedCountry, selectedState, selectedDistrict)
      : [];

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    const states = getStatesForCountry(newCountry);
    if (states.length > 0) {
      const defaultState = newCountry === 'IN' ? 'TN' : states[0].id;
      setSelectedState(defaultState);
      const districts = getDistrictsForState(newCountry, defaultState);
      if (districts.length > 0) {
        setSelectedDistrict(districts[0].id);
        const cities = getCitiesForDistrict(newCountry, defaultState, districts[0].id);
        setSelectedCity(cities.length > 0 ? cities[0] : '');
      } else {
        setSelectedDistrict('OTHER_DISTRICT');
        setSelectedCity('');
      }
    } else {
      setSelectedState('OTHER_STATE');
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('');
    }
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (newState !== 'OTHER_STATE') {
      const districts = getDistrictsForState(selectedCountry, newState);
      if (districts.length > 0) {
        setSelectedDistrict(districts[0].id);
        const cities = getCitiesForDistrict(selectedCountry, newState, districts[0].id);
        setSelectedCity(cities.length > 0 ? cities[0] : '');
      } else {
        setSelectedDistrict('OTHER_DISTRICT');
        setSelectedCity('');
      }
    } else {
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('');
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    if (newDistrict !== 'OTHER_DISTRICT') {
      const cities = getCitiesForDistrict(selectedCountry, selectedState, newDistrict);
      setSelectedCity(cities.length > 0 ? cities[0] : '');
    } else {
      setSelectedCity('');
    }
  };

  // Localized Display Helpers
  const getStateDisplayName = (s: any) => {
    if (postingLanguage === 'ta' && s.nameTa) return s.nameTa;
    if (postingLanguage === 'hi' && s.nameHi) return s.nameHi;
    if (postingLanguage === 'te' && s.nameTe) return s.nameTe;
    if (postingLanguage === 'ml' && s.nameMl) return s.nameMl;
    if (postingLanguage === 'kn' && s.nameKn) return s.nameKn;
    return s.nameEn || s.nameTa;
  };

  const getDistrictDisplayName = (d: any) => {
    if (postingLanguage === 'ta' && d.nameTa) return d.nameTa;
    if (postingLanguage === 'hi' && d.nameHi) return d.nameHi;
    if (postingLanguage === 'te' && d.nameTe) return d.nameTe;
    if (postingLanguage === 'ml' && d.nameMl) return d.nameMl;
    if (postingLanguage === 'kn' && d.nameKn) return d.nameKn;
    return d.nameEn || d.nameTa;
  };

  // Geolocation handler with automatic district & city detection
  const handleDetectCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError(
        loc(
          'உங்கள் உலாவியில் GPS சேவை கிடைக்கவில்லை. கீழே உள்ள பட்டியலில் மாநிலம் மற்றும் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.',
          'Geolocation is not supported. Please select your state and district from the list below.',
          'आपके ब्राउज़र में जीपीएस सेवा उपलब्ध नहीं है। कृपया नीचे सूची से चुनें।',
          'మీ బ్రౌజర్‌లో GPS స్థాన సేవ అందుబాటులో లేదు. దయచేసి క్రింద నుండి ఎంచుకోండి.',
          'ബ്രൗസറിൽ GPS ലഭ്യമല്ല. ദയവായി താഴെ നിന്ന് തിരഞ്ഞെടുക്കുക.',
          'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ GPS ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಟ್ಟಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ.'
        )
      );
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const accuracy = Math.round(pos.coords.accuracy);

          setGeoCoords({ lat, lng, accuracy });

          // Auto-match nearest location
          const nearest = findNearestLocation(lat, lng);
          if (nearest && nearest.location) {
            setSelectedCountry('IN');
            setSelectedState('TN');
            const tnDistricts = getDistrictsForState('IN', 'TN');
            const matchedDistrict = tnDistricts.find(
              (d) =>
                d.nameTa.toLowerCase().includes(nearest.location.nameTa.toLowerCase()) ||
                nearest.location.nameEn.toLowerCase().includes(d.nameEn.toLowerCase())
            );
            if (matchedDistrict) {
              setSelectedDistrict(matchedDistrict.id);
              const cities = getCitiesForDistrict('IN', 'TN', matchedDistrict.id);
              if (cities.length > 0) {
                setSelectedCity(cities[0]);
              }
            }

            if (!locality.trim()) {
              setLocality(
                loc(
                  `GPS: ${nearest.location.nameTa} அருகில்`,
                  `GPS: Near ${nearest.location.nameEn}`,
                  `GPS: ${nearest.location.nameEn} के पास`,
                  `GPS: ${nearest.location.nameEn} సమీపంలో`,
                  `GPS: ${nearest.location.nameEn} സമീപം`,
                  `GPS: ${nearest.location.nameEn} ಹತ್ತಿರ`
                )
              );
            }
          }
        },
        (err) => {
          setIsLocating(false);
          const errCode = err?.code ?? 0;
          let msg = loc(
            'தற்போதைய இருப்பிடத்தை கண்டறிய முடியவில்லை. தயவுசெய்து பட்டியலில் மாநிலம் மற்றும் மாவட்டத்தை தேர்ந்தெடுக்கவும்.',
            'Unable to detect location. Please select your state and district from the list.',
            'स्थान का पता लगाने में असमर्थ। कृपया सूची से अपना राज्य और जिला चुनें।',
            'లొకేషన్‌ను గుర్తించలేకపోయాము. దయచేసి జాబితా నుండి రాష్ట్రాన్ని ఎంచుకోండి.',
            'ലൊക്കേഷൻ കണ്ടെത്താനായില്ല. പട്ടികയിൽ നിന്ന് സംസ്ഥാനം തിരഞ്ഞെടുക്കുക.',
            'ಸ್ಥಳವನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಪಟ್ಟಿಯಿಂದ ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
          );
          if (errCode === 1) {
            msg = loc(
              'இருப்பிட அனுமதி மறுக்கப்பட்டது (GPS Permission Denied). கீழே உள்ள பட்டியலை பயன்படுத்தவும்.',
              'Location permission was denied. Please use the dropdown lists below.',
              'स्थान अनुमति अस्वीकार कर दी गई। कृपया नीचे दी गई सूची का उपयोग करें।',
              'స్థాన అనుమతి నిరాకరించబడింది. దయచేసి దిగువ జాబితాను ఉపయోగించండి.',
              'ലൊക്കേഷൻ അനുമതി നിരസിച്ചു. താഴെയുള്ള പട്ടിക ഉപയോഗിക്കുക.',
              'ಸ್ಥಳದ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿ.'
            );
          }
          setGeoError(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch {
      setIsLocating(false);
      setGeoError(
        loc(
          'GPS தொடர்புகொள்ள முடியவில்லை. கீழே உள்ள பட்டியலில் ஊரைத் தேர்ந்தெடுக்கவும்.',
          'Could not access GPS. Please pick your city below.',
          'जीपीएस से कनेक्ट नहीं हो सका। कृपया नीचे शहर चुनें।',
          'GPS ని యాక్సెస్ చేయలేకపోయాము. దయచేసి క్రింద నగరాన్ని ఎంచుకోండి.',
          'GPS ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. ദയവായി താഴെ നഗരം തിരഞ്ഞെടുക്കുക.',
          'GPS ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗೆ ನಗರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
        )
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allowSeekerRegistration) {
      setError(
        loc(
          'தொழிலாளர் பதிவு தற்காலிகமாக நிர்வாகத்தால் இடைநிறுத்தப்பட்டுள்ளது.',
          'Worker registration is temporarily disabled by administration.',
          'प्रशासन द्वारा कामगार पंजीकरण अस्थायी रूप से निलंबित कर दिया गया है।',
          'కార్మికుల నమోదు తాత్కాలికంగా నిలిపివేయబడింది.',
          'തൊഴിലാളി രജിസ്ട്രേഷൻ താൽക്കാലികമായി നിർത്തിവച്ചിരിക്കുന്നു.',
          'ಕೆಲಸಗಾರರ ನೋಂದಣಿಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದೆ.'
        )
      );
      return;
    }

    if (!name.trim()) {
      setError(
        loc(
          'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.',
          'Please enter your name.',
          'कृपया अपना नाम दर्ज करें।',
          'దయచేసి మీ పేరు నమోదు చేయండి.',
          'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.',
          'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (category === 'other' && !customCategoryName.trim()) {
      setError(
        loc(
          'தயவுசெய்து புதிய வேலை வகையின் பெயரை உள்ளிடவும்.',
          'Please enter your custom work category / skill name.',
          'कृपया अपने काम की श्रेणी का नाम दर्ज करें।',
          'దయచేసి మీ పని వర్గం పేరును నమోదు చేయండి.',
          'ദയവായി പുതിയ തൊഴിൽ വിഭാഗത്തിന്റെ പേര് നൽകുക.',
          'ದಯವಿಟ್ಟು ಹೊಸ ಕೆಲಸದ ವರ್ಗದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(
        loc(
          'தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
          'Please enter a valid 10-digit mobile number.',
          'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।',
          'దయచేసి సరైన 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి.',
          'ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (!expectedDailyWage || expectedDailyWage <= 0) {
      setError(
        loc(
          'தயவுசெய்து எதிர்பார்க்கும் தினக்கூலியை உள்ளிடவும்.',
          'Please enter expected daily wage.',
          'कृपया अपेक्षित दैनिक मजदूरी दर्ज करें।',
          'దయచేసి ఆశించే దినసరి వేతనాన్ని నమోదు చేయండి.',
          'ദയവായി പ്രതീക്ഷിക്കുന്ന ദിവസവേതനം നൽകുക.',
          'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿತ ದೈನಂದಿನ ಕೂಲಿಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    // Resolve human-readable location hierarchy strings
    const finalStateName =
      selectedState === 'OTHER_STATE'
        ? customState.trim()
        : availableStates.find((s) => s.id === selectedState)?.nameTa ||
          availableStates.find((s) => s.id === selectedState)?.nameEn ||
          selectedState;

    const finalDistrictName =
      selectedDistrict === 'OTHER_DISTRICT'
        ? customDistrict.trim()
        : availableDistricts.find((d) => d.id === selectedDistrict)?.nameTa ||
          availableDistricts.find((d) => d.id === selectedDistrict)?.nameEn ||
          selectedDistrict;

    const finalCityName = selectedCity === 'OTHER_CITY' ? customCity.trim() : selectedCity;

    // Compose cohesive finalLocation string
    const locationParts: string[] = [];
    if (locality.trim()) locationParts.push(locality.trim());
    if (finalCityName) locationParts.push(finalCityName);
    if (finalDistrictName && finalDistrictName !== finalCityName) locationParts.push(finalDistrictName);
    if (finalStateName && (selectedCountry !== 'IN' || selectedState !== 'TN')) {
      locationParts.push(finalStateName);
    }
    if (selectedCountry !== 'IN') {
      const c = COUNTRIES_LIST.find((item) => item.code === selectedCountry);
      if (c) locationParts.push(c.nameTa || c.nameEn);
    }

    const finalLocation = locationParts.filter(Boolean).join(', ') || 'தமிழ்நாடு';

    // Google Maps Navigation URL
    const mapsUrl = geoCoords
      ? buildGoogleMapsSearchUrl(finalLocation, geoCoords.lat, geoCoords.lng)
      : buildGoogleMapsSearchUrl(finalLocation);

    // Pre-generate translation entries across all 6 languages
    const translations = generateSeekerTranslations(
      {
        name: name.trim(),
        location: finalLocation,
        state: finalStateName,
        district: finalDistrictName,
        city: finalCityName,
        customCategoryName: category === 'other' ? customCategoryName.trim() : undefined,
      },
      postingLanguage
    );

    onRegisterSeeker({
      name: name.trim(),
      mobileNumber: cleanPhone,
      category,
      customCategoryName: category === 'other' ? customCategoryName.trim() : undefined,
      categoryCustomName: category === 'other' ? customCategoryName.trim() : undefined,
      location: finalLocation,
      locationAddress: landmarkAddress.trim() || undefined,
      state: finalStateName,
      district: finalDistrictName,
      city: finalCityName,
      countryCode: selectedCountry,
      postedLanguage: postingLanguage,
      translations,
      latitude: geoCoords?.lat,
      longitude: geoCoords?.lng,
      geoAccuracy: geoCoords?.accuracy,
      mapsUrl,
      expectedDailyWage: Number(expectedDailyWage),
      experienceYears: Number(experienceYears),
    });

    // Auto-save user profile for My Posts page tracking
    saveActiveUserProfile({
      name: name.trim(),
      phone: cleanPhone,
      role: 'seeker',
      location: finalLocation,
      category,
    });
    addTrackedPhone(cleanPhone);

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4 my-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {loc(
              'உங்கள் பதிவு வெற்றிகரமாக முடிந்தது!',
              'Registration Completed!',
              'आपका पंजीकरण सफलतापूर्वक पूरा हुआ!',
              'మీ నమోదు విజయవంతంగా పూర్తయింది!',
              'നിങ്ങളുടെ രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി!',
              'ನಿಮ್ಮ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ!'
            )}
          </h3>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            {loc(
              'உங்கள் பெயர் மற்றும் தொழில் விவரங்கள் பதிவு செய்யப்பட்டுள்ளது. உள்ளூர் முதலாளிகள் மற்றும் ஒப்பந்ததாரர்கள் உங்களை நேரடியாக தொடர்பு கொள்வார்கள்.',
              'Your worker profile is registered. Local employers and contractors can now find you and call directly for daily jobs.',
              'आपका विवरण पंजीकृत हो गया है। स्थानीय नियोक्ता और ठेकेदार आपसे सीधे संपर्क करेंगे।',
              'మీ ప్రొఫైల్ నమోదైంది. యజమానులు మరియు కాంట్రాక్టర్లు మిమ్మల్ని నేరుగా సంప్రదిస్తారు.',
              'നിങ്ങളുടെ വിവരങ്ങൾ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. തൊഴിലുടമകൾ നിങ്ങളെ നേരിട്ട് ബന്ധപ്പെടും.',
              'ನಿಮ್ಮ ವಿವರಗಳು ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿವೆ. ಸ್ಥಳೀಯ ಉದ್ಯೋಗದಾತರು ನಿಮ್ಮನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.'
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={onNavigateToJobs}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs"
          >
            <span>
              {loc(
                'இன்றைய வேலைகளை பார்க்க',
                'Browse Available Jobs',
                'उपलब्ध नौकरियां देखें',
                'అందుబాటులో ఉన్న పనులను చూడండి',
                'ലഭ്യമായ ജോലികൾ കാണുക',
                'ಲಭ್ಯವಿರುವ ಉದ್ಯೋಗಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
              )}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Language Preference Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {loc(
                'பதிவிடும் மொழி (பதிவு செய்யும் உங்கள் மொழி):',
                'Registration Language (Language you are using):',
                'पंजीकरण की भाषा (आपकी पसंदीदा भाषा):',
                'నమోదు భాష (మీరు ఉపయోగించే భాష):',
                'രജിസ്ട്രേഷൻ ഭാഷ (നിങ്ങൾ ഉപയോഗിക്കുന്ന ഭാഷ):',
                'ನೋಂದಣಿ ಭಾಷೆ (ನೀವು ಬಳಸುವ ಭಾಷೆ):'
              )}
            </span>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            {loc('தானியங்கி மொழிபெயர்ப்பு', 'Auto Translation', 'स्वचालित अनुवाद', 'ఆటో అనువాదం', 'ഓട്ടോ വിവർത്തനം', 'ಸ್ವಯಂಚಾಲಿತ ಅನುವಾದ')}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setPostingLanguage(lang.code as Language)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                postingLanguage === lang.code
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {loc(
              'நீங்கள் எந்த மொழியில் பதிவு செய்தாலும் முதலாளிகள் அவர்கள் விரும்பும் மொழியில் காண முடியும்.',
              'No matter which language you register in, employers will see it in their chosen language.',
              'आप जिस भी भाषा में विवरण दर्ज करेंगे, नियोक्ता अपनी भाषा में देख सकेंगे।',
              'మీరు ఏ భాషలో నమోదు చేసినా, యజమానులు తమ ఎంచుకున్న భాషలో చూడగలరు.',
              'നിങ്ങൾ ഏത് ഭാഷയിൽ രജിസ്റ്റർ ചെയ്താലും തൊഴിലുടമകൾ അവരുടെ ഭാഷയിൽ കാണും.',
              'ನೀವು ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ನೋಂದಾಯಿಸಿದರೂ, ಉದ್ಯೋಗದಾತರು ತಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ನೋಡಬಹುದು.'
            )}
          </span>
        </p>
      </div>

      {/* Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {loc(
                'தொழிலாளி பதிவு படிவம்',
                'Job Seeker Registration',
                'कामगार पंजीकरण प्रपत्र',
                'కార్మికుల నమోదు ఫారం',
                'തൊഴിലാളി രജിസ്ട്രേഷൻ ഫോം',
                'ಕೆಲಸಗಾರರ ನೋಂದಣಿ ನಮೂನೆ'
              )}
            </h2>
            <p className="text-xs text-slate-600">
              {loc(
                'தினக்கூலி வேலை பெற உங்கள் விவரங்களை பதியுங்கள்',
                'Register your skill to get hired by local employers',
                'दैनिक वेतन काम पाने के लिए अपना विवरण दर्ज करें',
                'దినసరి పని పొందడానికి మీ వివరాలను నమోదు చేయండి',
                'ദിവസവേതന ജോലി ലഭിക്കാൻ നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക',
                'ದೈನಂದಿನ ಕೆಲಸ ಪಡೆಯಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನೋಂದಾಯಿಸಿ'
              )}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* 1. Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-700" />
            <span>
              {loc('உங்கள் பெயர்', 'Full Name', 'पूरा नाम', 'పూర్తి పేరు', 'മുഴുവൻ പേര്', 'ಪೂರ್ಣ ಹೆಸರು')}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-seeker-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={loc(
              'எ.கா: மு. பழனிவேல் / அருண்',
              'e.g. M. Palanivel / Arun',
              'उदा. रमेश कुमार / अरुण',
              'ఉదా. రమేష్ కుమార్ / అరుణ్',
              'ഉദാ. രമേഷ് കുമാർ / അരുൺ',
              'ಉದಾ. ರಮೇಶ್ ಕುಮಾರ್ / ಅರುಣ್'
            )}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 2. Country & Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>
              {loc(
                'நாடு & கைபேசி எண் (முதலாளிகள் அழைக்க)',
                'Country & Mobile Number',
                'देश और मोबाइल नंबर',
                'దేశం మరియు మొబైల్ నంబర్',
                'രാജ്യവും മൊബൈൽ നമ്പറും',
                'ದೇಶ ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'
              )}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              id="input-seeker-country"
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {postingLanguage === 'ta' ? c.nameTa : c.nameEn} ({c.dialCode})
                </option>
              ))}
            </select>

            <div className="sm:col-span-2 flex items-center">
              <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-xl text-xs font-bold text-slate-600">
                {COUNTRIES_LIST.find((c) => c.code === selectedCountry)?.dialCode || '+91'}
              </span>
              <input
                id="input-seeker-mobile"
                type="tel"
                required
                maxLength={12}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="9840998877"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Work Category (Only category name, NO wages attached, + Custom Category option) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-700" />
            <span>
              {loc(
                'நீங்கள் செய்யும் வேலை வகை',
                'Your Work Category / Skill',
                'काम की श्रेणी / कौशल',
                'పని వర్గం / నైపుణ్యం',
                'തൊഴിൽ വിഭാഗം / വൈദഗ്ധ്യം',
                'ಕೆಲಸದ ವರ್ಗ / ಕೌಶಲ್ಯ'
              )}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            id="input-seeker-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              const found = WORK_CATEGORIES.find((c) => c.id === e.target.value);
              if (found && e.target.value !== 'other') {
                setExpectedDailyWage(found.suggestedWage);
              }
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {WORK_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat)}
              </option>
            ))}
          </select>

          {/* Custom Category Input if "other" is selected */}
          {category === 'other' && (
            <div className="mt-2.5 animate-in fade-in duration-150 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {loc(
                  'புதிய வேலை வகையின் பெயரை தட்டச்சு செய்க',
                  'Type Custom Work Category / Skill Name',
                  'नई कार्य श्रेणी का नाम दर्ज करें',
                  'కొత్త పని వర్గం పేరును టైప్ చేయండి',
                  'പുതിയ തൊഴിൽ വിഭാഗത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക',
                  'ಹೊಸ ಕೆಲಸದ ವರ್ಗದ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ'
                )}
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                id="input-seeker-custom-category"
                type="text"
                required
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder={loc(
                  'எ.கா: வெல்டிங் / டைல்ஸ் வேலை / தையல் / சமையல் / கிளீனிங்...',
                  'e.g. Welding / Tiles Work / Tailoring / Catering / Cleaning...',
                  'उदा: वेल्डिंग / टाइल्स का काम / दर्जी / खानपान...',
                  'ఉదా: వెల్డింగ్ / టైల్స్ పని / టైలర్ / క్యాటరింగ్...',
                  'ഉദാ: വെൽഡിംഗ് / ടൈൽസ് ജോലി / തയ്യൽ / കാറ്ററിംഗ്...',
                  'ಉದಾ: ವೆಲ್ಡಿಂಗ್ / ಟೈಲ್ಸ್ ಕೆಲಸ / ಟೈಲರ್ / ಅಡುಗೆ...'
                )}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* 4. Multi-Tier Cascading Location: Country -> State -> District -> City -> Locality -> Address */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                {loc(
                  'வேலை செய்யும் இடம் / பகுதி (அனைத்து மாநிலங்களும்):',
                  'Work Location / Region (All States Supported):',
                  'कार्य स्थान / क्षेत्र (सभी राज्य समर्थित):',
                  'పని ప్రదేశం / ప్రాంతం (అన్ని రాష్ట్రాలు):',
                  'ജോലി സ്ഥലം / പ്രദേശം (എല്ലാ സംസ്ഥാനങ്ങളും):',
                  'ಕೆಲಸದ ಸ್ಥಳ / ಪ್ರದೇಶ (ಎಲ್ಲಾ ರಾಜ್ಯಗಳು):'
                )}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              id="btn-detect-gps-seeker"
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 disabled:opacity-60 shadow-xs"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{loc('தேடுகிறது...', 'Locating...', 'खोज रहा है...', 'గుర్తిస్తోంది...', 'കണ്ടെത്തുന്നു...', 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...')}</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{loc('தற்போதைய GPS இடம்', 'Current GPS', 'वर्तमान GPS', 'ప్రస్తుత GPS', 'നിലവിലെ GPS', 'ಪ್ರಸ್ತುತ GPS')}</span>
                </>
              )}
            </button>
          </div>

          {/* Row 1: State & District Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* State Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {loc('மாநிலம் / பிரதேசம் (State)', 'State / Province', 'राज्य / प्रांत', 'రాష్ట్రం', 'സംസ്ഥാനം', 'ರಾಜ್ಯ')}
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <select
                id="select-seeker-state"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableStates.map((st) => (
                  <option key={st.id} value={st.id}>
                    {getStateDisplayName(st)}
                  </option>
                ))}
                <option value="OTHER_STATE">
                  {loc('+ பிற மாநிலம் (Other State)', '+ Other State', '+ अन्य राज्य', '+ ఇతర రాష్ట్రం', '+ മറ്റ് സംസ്ഥാനം', '+ ಇತರ ರಾಜ್ಯ')}
                </option>
              </select>

              {selectedState === 'OTHER_STATE' && (
                <input
                  id="input-seeker-custom-state"
                  type="text"
                  required
                  placeholder={loc('மாநிலத்தின் பெயர்', 'State name', 'राज्य का नाम', 'రాష్ట్రం పేరు', 'സംസ്ഥാനത്തിന്റെ പേര്', 'ರಾಜ್ಯದ ಹೆಸರು')}
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  className="mt-1.5 w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {loc('மாவட்டம் (District)', 'District / Region', 'जिला', 'జిల్లా', 'ജില്ല', 'ಜಿಲ್ಲೆ')}
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              {selectedState !== 'OTHER_STATE' && availableDistricts.length > 0 ? (
                <select
                  id="select-seeker-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {getDistrictDisplayName(dist)}
                    </option>
                  ))}
                  <option value="OTHER_DISTRICT">
                    {loc('+ பிற மாவட்டம் (Other District)', '+ Other District', '+ अन्य जिला', '+ ఇతర జిల్లా', '+ മറ്റ് ജില്ല', '+ ಇತರ ಜಿಲ್ಲೆ')}
                  </option>
                </select>
              ) : (
                <input
                  id="input-seeker-custom-district-fallback"
                  type="text"
                  required
                  placeholder={loc('மாவட்டத்தின் பெயர்', 'District name', 'जिले का नाम', 'జిల్లా పేరు', 'ജില്ലയുടെ പേര്', 'ಜಿಲ್ಲೆಯ ಹೆಸರು')}
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              )}

              {selectedDistrict === 'OTHER_DISTRICT' && availableDistricts.length > 0 && (
                <input
                  id="input-seeker-custom-district"
                  type="text"
                  required
                  placeholder={loc('மாவட்டத்தின் பெயர்', 'District name', 'जिले का नाम', 'జిల్లా పేరు', 'ജില്ലയുടെ പേര്', 'ಜಿಲ್ಲೆಯ ಹೆಸರು')}
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  className="mt-1.5 w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Row 2: City / Town & Area / Village */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* City / Major Town */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {loc('நகரம் / பெருநகரம் (City / Town)', 'City / Major Town', 'शहर / कस्बा', 'నగరం / పట్టణం', 'നഗരം', 'ನಗರ / ಪಟ್ಟಣ')}
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              {availableCities.length > 0 && selectedDistrict !== 'OTHER_DISTRICT' ? (
                <select
                  id="select-seeker-city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                  <option value="OTHER_CITY">
                    {loc('+ பிற நகரம் (Type City Name)', '+ Type other city', '+ अन्य शहर', '+ ఇతర నగరం', '+ മറ്റ് നഗരം', '+ ಇತರ ನಗರ')}
                  </option>
                </select>
              ) : (
                <input
                  id="input-seeker-custom-city-fallback"
                  type="text"
                  required
                  placeholder={loc('நகரத்தின் பெயர்', 'City / Town name', 'शहर का नाम', 'నగరం పేరు', 'നഗരത്തിന്റെ പേര്', 'ನಗರದ ಹೆಸರು')}
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              )}

              {selectedCity === 'OTHER_CITY' && availableCities.length > 0 && (
                <input
                  id="input-seeker-custom-city"
                  type="text"
                  required
                  placeholder={loc('நகரத்தின் பெயர்', 'City name', 'शहर का नाम', 'నగరం పేరు', 'നഗരത്തിന്റെ പേര്', 'ನಗರದ ಹೆಸರು')}
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="mt-1.5 w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Locality / Village / Area */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {loc('பகுதி / கிராமம் / தெரு (Area / Village)', 'Locality / Area / Street', 'इलाका / मोहल्ला / गांव', 'ప్రాంతం / గ్రామం', 'പ്രദേശം / ഗ്രാമം', 'ಪ್ರದೇಶ / ಗ್ರಾಮ')}
              </label>
              <input
                id="input-seeker-locality"
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder={loc(
                  'எ.கா: அண்ணா நகர், பேருந்து நிலையம் அருகில்...',
                  'e.g. Anna Nagar, Main Road...',
                  'उदा: शास्त्री नगर, बस स्टैंड के पास...',
                  'ఉదా: గాంధీ నగర్, మెయిన్ రోడ్డు...',
                  'ഉദാ: മെയിൻ റോഡ്, ജംഗ്ഷൻ...',
                  'ಉದಾ: ಗಾಂಧಿ ನಗರ, ಮುಖ್ಯ ರಸ್ತೆ...'
                )}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Landmark / Navigation Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {loc('அடையாளம் அல்லது முகவரி (Landmark / Exact Address)', 'Landmark / Address (Optional)', 'लैंडमार्क / पता', 'ల్యాండ్‌మార్క్ / చిరునామా', 'ലാൻഡ്മാർക്ക് / വിലാസം', 'ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ / ವಿಳಾಸ')}
            </label>
            <input
              id="input-seeker-landmark"
              type="text"
              value={landmarkAddress}
              onChange={(e) => setLandmarkAddress(e.target.value)}
              placeholder={loc(
                'எ.கா: அரசு மருத்துவமனை எதிரில் / பேருந்து நிறுத்தம் அருகில்...',
                'e.g. Opposite Government Hospital / Near Bus Stop...',
                'उदा: सरकारी अस्पताल के सामने / बस स्टॉप के पास...',
                'ఉదా: ప్రభుత్వ ఆసుపత్రి ఎదురుగా / బస్ స్టాప్ దగ్గర...',
                'ഉദാ: ഗവൺമെന്റ് ആശുപത്രിക്ക് എതിർവശം...',
                'ಉದಾ: ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯ ಎದುರು / ಬಸ್ ನಿಲ್ದಾಣದ ಹತ್ತಿರ...'
              )}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* GPS Coordinates Preview Card */}
          {geoCoords && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">
                    {loc(
                      'GPS இருப்பிடம் இணைக்கப்பட்டது',
                      'GPS Location Attached',
                      'जीपीएस स्थान संलग्न',
                      'GPS స్థానం జోడించబడింది',
                      'GPS ലൊക്കേഷൻ ചേർത്തു',
                      'GPS ಸ್ಥಳ ಲಗತ್ತಿಸಲಾಗಿದೆ'
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    {geoCoords.lat}, {geoCoords.lng}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${geoCoords.lat},${geoCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 shadow-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{loc('வரைபடம்', 'Map', 'नक्शा', 'మ్యాప్', 'മാപ്പ്', 'ನಕ್ಷೆ')}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setGeoCoords(null)}
                  className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {geoError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span>{geoError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGeoError(null)}
                className="text-amber-700 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 5. Expected Daily Wage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>
                {loc(
                  'எதிர்பார்க்கும் தினக்கூலி',
                  'Expected Daily Wage',
                  'अपेक्षित दैनिक मजदूरी',
                  'ఆశించే దినసరి వేతనం',
                  'പ്രതീക്ഷിക്കുന്ന ദിവസവേതനം',
                  'ನಿರೀಕ್ಷಿತ ದೈನಂದಿನ ಕೂಲಿ'
                )}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-sm font-black text-emerald-700">₹{expectedDailyWage} / {loc('நாள்', 'day', 'दिन', 'రోజు', 'ദിവസം', 'ದಿನ')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pb-1.5">
            {wagePresets.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setExpectedDailyWage(amount)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  expectedDailyWage === amount
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>

          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
            <input
              id="input-seeker-expected-wage"
              type="number"
              min="200"
              max="10000"
              required
              value={expectedDailyWage || ''}
              onChange={(e) => setExpectedDailyWage(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 6. Experience Years */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <span>
              {loc(
                'அனுபவம் (ஆண்டுகள்)',
                'Experience (Years)',
                'अनुभव (वर्ष)',
                'అనుభవం (సంవత్సరాలు)',
                'പരിചയം (വർഷങ്ങൾ)',
                'ಅನುಭವ (ವರ್ಷಗಳು)'
              )}
            </span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 5, 8, 10].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setExperienceYears(yr)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  experienceYears === yr
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {yr}+ {loc('வருடம்', 'Yrs', 'वर्ष', 'సంవత్సరాలు', 'വർഷം', 'ವರ್ಷ')}
              </button>
            ))}
          </div>
        </div>

        {/* Guarantee note */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            {loc(
              'உங்கள் எண் வேலை வாய்ப்புக்காக மட்டுமே பயன்படுத்தப்படும். கட்டணங்கள் எதுவும் கிடையாது.',
              'Your phone number will be used solely for job inquiries. 100% free service.',
              'आपका नंबर केवल काम के अवसरों के लिए उपयोग किया जाएगा। कोई शुल्क नहीं है।',
              'మీ నంబర్ పని అవకాశాల కోసం మాత్రమే ఉపయోగించబడుతుంది. ఎటువంటి రుసుములు లేవు.',
              'നിങ്ങളുടെ നമ്പർ തൊഴിൽ ആവശ്യങ്ങൾക്ക് മാത്രം ഉപയോഗിക്കും. യാതൊരു ഫീസും ഇല്ല.',
              'ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಕೆಲಸದ ಅವಕಾಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಶುಲ್ಕಗಳಿಲ್ಲ.'
            )}
          </p>
        </div>

        {/* Submit Button */}
        <button
          id="btn-submit-seeker-reg"
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <UserCheck className="w-5 h-5" />
          <span>
            {loc('பதிவை உறுதி செய்க', 'Complete Registration', 'पंजीकरण पूरा करें', 'నమోదు నిర్ధారించండి', 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക', 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ')}
          </span>
        </button>
      </form>
    </div>
  );
};
