import React, { useState, useEffect } from 'react';
import { Job, EmployerSubscription, PaymentTransaction, Advertisement, JobStatus, Language } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { POPULAR_LOCATIONS, COUNTRIES_LIST, findNearestLocation, buildGoogleMapsSearchUrl } from '../data/locations';
import { ALL_INDIAN_STATES, getStatesForCountry, getDistrictsForState, getCitiesForDistrict } from '../data/allLocationsData';
import { generateJobTranslations, LANGUAGE_DISPLAY_NAMES } from '../utils/translator';
import { saveActiveUserProfile, addTrackedPhone } from '../utils/userStorage';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { PaymentModal } from './PaymentModal';
import { AdBannerCarousel } from './AdBannerCarousel';
import {
  PlusCircle,
  Building,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Navigation,
  Compass,
  Crosshair,
  ExternalLink,
  Loader2,
  RefreshCw,
  Globe,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

interface PostJobScreenProps {
  onAddJob: (job: Omit<Job, 'id' | 'createdAt'>, tx?: PaymentTransaction) => void;
  onNavigateToJobs: () => void;
  subscription?: EmployerSubscription;
  allowJobPosting?: boolean;
  ads?: Advertisement[];
  onNavigateToAdvertise?: () => void;
}

export const PostJobScreen: React.FC<PostJobScreenProps> = ({
  onAddJob,
  onNavigateToJobs,
  subscription,
  allowJobPosting = true,
  ads = [],
  onNavigateToAdvertise,
}) => {
  const { language, setLanguage, loc, getCategoryName } = useLanguage();

  // Today and tomorrow dates for quick pick
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // Posting Language State (User chosen language for posting)
  const [postingLanguage, setPostingLanguage] = useState<Language>(language);

  // Sync postingLanguage if global language changes initially
  useEffect(() => {
    setPostingLanguage(language);
  }, [language]);

  // Form State
  const [employerName, setEmployerName] = useState(subscription?.employerName || '');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedState, setSelectedState] = useState('TN');
  const [customState, setCustomState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('chennai');
  const [customDistrict, setCustomDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tambaram');
  const [customCity, setCustomCity] = useState('');
  const [locality, setLocality] = useState('');
  const [landmarkAddress, setLandmarkAddress] = useState('');
  const [category, setCategory] = useState(WORK_CATEGORIES[0].id);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // GPS & Coordinates
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Wage & Details
  const [dailyWage, setDailyWage] = useState<number>(850);
  const [wageType, setWageType] = useState<'daily' | 'hourly' | 'half_day' | 'contract'>('daily');
  const [isWageNegotiable, setIsWageNegotiable] = useState<boolean>(false);
  const [foodProvided, setFoodProvided] = useState<boolean>(false);
  const [travelProvided, setTravelProvided] = useState<boolean>(false);
  const [teaProvided, setTeaProvided] = useState<boolean>(false);
  const [workersNeeded, setWorkersNeeded] = useState<number>(2);
  const [jobDate, setJobDate] = useState<string>(todayStr);
  const [contactNumber, setContactNumber] = useState(subscription?.employerPhone || '');
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus>('active');
  const [makeFeatured, setMakeFeatured] = useState(false);
  const [isVerifiedEmployer, setIsVerifiedEmployer] = useState(true);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const hasFeaturedCredits = (subscription?.featuredCreditsRemaining || 0) > 0;

  // Dynamic available states, districts, and cities based on cascading selections
  const availableStates = getStatesForCountry(selectedCountry);
  const availableDistricts = selectedState !== 'OTHER_STATE' ? getDistrictsForState(selectedCountry, selectedState) : [];
  const availableCities = selectedDistrict !== 'OTHER_DISTRICT' ? getCitiesForDistrict(selectedCountry, selectedState, selectedDistrict) : [];

  // When Country changes
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

  // When State changes
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (newState === 'OTHER_STATE') {
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('OTHER_CITY');
      return;
    }
    const districts = getDistrictsForState(selectedCountry, newState);
    if (districts.length > 0) {
      setSelectedDistrict(districts[0].id);
      const cities = getCitiesForDistrict(selectedCountry, newState, districts[0].id);
      setSelectedCity(cities.length > 0 ? cities[0] : '');
    } else {
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('');
    }
  };

  // When District changes
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    if (newDistrict === 'OTHER_DISTRICT') {
      setSelectedCity('OTHER_CITY');
      return;
    }
    const cities = getCitiesForDistrict(selectedCountry, selectedState, newDistrict);
    setSelectedCity(cities.length > 0 ? cities[0] : '');
  };

  // Detect Current Location with GPS
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(
        loc(
          'உங்கள் உலாவியில் GPS இருப்பிட சேவை இல்லை.',
          'Geolocation is not supported in this browser.',
          'इस ब्राउज़र में जियोलोकेशन समर्थित नहीं है।',
          'ఈ బ్రౌజర్‌లో జియోలొకేషన్ సపోర్ట్ లేదు.',
          'ഈ ബ്രൗസറിൽ ജിയോലൊക്കേഷൻ പിന്തുണയ്ക്കുന്നില്ല.',
          'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಜಿಯೋಲೊಕೇಶನ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.'
        )
      );
      return;
    }

    setIsLocating(true);
    setGeoError(null);

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
          // Match district
          const tnDistricts = getDistrictsForState('IN', 'TN');
          const matchedDistrict = tnDistricts.find((d) =>
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
                `GPS: ${nearest.location.nameTa} அருகில் (${nearest.distanceKm} கி.மீ)`,
                `GPS: Near ${nearest.location.nameEn} (${nearest.distanceKm} km)`,
                `GPS: ${nearest.location.nameEn} के पास (${nearest.distanceKm} किमी)`,
                `GPS: ${nearest.location.nameEn} దగ్గర (${nearest.distanceKm} కి.మీ)`,
                `GPS: ${nearest.location.nameEn} അടുത്ത് (${nearest.distanceKm} കി.മീ)`,
                `GPS: ${nearest.location.nameEn} ಹತ್ತಿರ (${nearest.distanceKm} ಕಿ.ಮೀ)`
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
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  };

  const handleClearLocation = () => {
    setGeoCoords(null);
    setGeoError(null);
  };

  // Pre-set quick wage options
  const wagePresets = [500, 600, 700, 800, 900, 1000, 1200, 1500, 2000];

  const buildJobPayload = (isFeaturedPaid: boolean): Omit<Job, 'id' | 'createdAt'> => {
    const cleanPhone = contactNumber.replace(/[^0-9]/g, '');

    // Resolve human-readable State, District, and City
    const stateObj = availableStates.find((s) => s.id === selectedState);
    const finalStateName = selectedState === 'OTHER_STATE'
      ? (customState.trim() || 'Other State')
      : (stateObj ? (postingLanguage === 'ta' ? stateObj.nameTa : stateObj.nameEn) : selectedState);

    const distObj = availableDistricts.find((d) => d.id === selectedDistrict);
    const finalDistrictName = selectedDistrict === 'OTHER_DISTRICT'
      ? (customDistrict.trim() || 'Other District')
      : (distObj ? (postingLanguage === 'ta' ? distObj.nameTa : distObj.nameEn) : selectedDistrict);

    const finalCityName = selectedCity === 'OTHER_CITY'
      ? customCity.trim()
      : selectedCity;

    // Compose rich location string
    const locParts: string[] = [];
    if (locality.trim()) locParts.push(locality.trim());
    if (finalCityName && !locParts.includes(finalCityName)) locParts.push(finalCityName);
    if (finalDistrictName && !locParts.includes(finalDistrictName)) locParts.push(finalDistrictName);
    if (finalStateName && !locParts.includes(finalStateName)) locParts.push(finalStateName);
    const finalLocation = locParts.join(', ') || 'Tamil Nadu, India';

    const featuredExpiry = new Date();
    featuredExpiry.setDate(featuredExpiry.getDate() + 3);

    const mapsUrl = geoCoords
      ? buildGoogleMapsSearchUrl(finalLocation, geoCoords.lat, geoCoords.lng)
      : buildGoogleMapsSearchUrl(finalLocation);

    const perks: string[] = [];
    if (foodProvided) perks.push('food');
    if (teaProvided) perks.push('tea');
    if (travelProvided) perks.push('travel');

    // Auto-generate translations across all 6 supported languages
    const generatedTranslations = generateJobTranslations(
      {
        employerName: employerName.trim(),
        location: finalLocation,
        notes: notes.trim(),
        state: finalStateName,
        district: finalDistrictName,
        city: finalCityName,
      },
      postingLanguage
    );

    return {
      employerName: employerName.trim(),
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
      translations: generatedTranslations,
      latitude: geoCoords?.lat,
      longitude: geoCoords?.lng,
      geoAccuracy: geoCoords?.accuracy,
      mapsUrl,
      dailyWage: Number(dailyWage),
      wageType,
      isWageNegotiable,
      benefits: perks,
      workersNeeded: Number(workersNeeded),
      jobDate,
      contactNumber: cleanPhone,
      notes: notes.trim(),
      urgent,
      status: urgent ? 'urgent' : jobStatus,
      isVerifiedEmployer,
      isEncryptedSafety: true,
      isFeatured: isFeaturedPaid,
      featuredUntil: isFeaturedPaid ? featuredExpiry.toISOString() : undefined,
      employerTier: subscription?.planId || 'free',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!employerName.trim()) {
      setError(
        loc(
          'தயவுசெய்து முதலாளி அல்லது நிறுவனத்தின் பெயரை உள்ளிடவும்.',
          'Please enter employer or business name.',
          'कृपया नियोक्ता या व्यवसाय का नाम दर्ज करें।',
          'దయచేసి యజమాని లేదా వ్యాపార పేరును నమోదు చేయండి.',
          'തൊഴിലുടമയുടെ അല്ലെങ്കിൽ ബിസിനസ്സിന്റെ പേര് നൽകുക.',
          'ದಯವಿಟ್ಟು ಮಾಲೀಕ ಅಥವಾ ವ್ಯವಹಾರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (category === 'other' && !customCategoryName.trim()) {
      setError(
        loc(
          'தயவுசெய்து புதிய வேலை வகையின் பெயரை உள்ளிடவும்.',
          'Please enter the custom work category name.',
          'कृपया नई कार्य श्रेणी का नाम दर्ज करें।',
          'దయచేసి కొత్త పని వర్గం పేరును నమోదు చేయండి.',
          'ദയവായി പുതിയ തൊഴിൽ വിഭാഗത്തിന്റെ പേര് നൽകുക.',
          'ದಯವಿಟ್ಟು ಹೊಸ ಕೆಲಸದ ವರ್ಗದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    const cleanPhone = contactNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(
        loc(
          'தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
          'Please enter a valid 10-digit mobile contact number.',
          'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।',
          'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.',
          'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (!dailyWage || dailyWage <= 0) {
      setError(
        loc(
          'தயவுசெய்து தினக்கூலியை உள்ளிடவும்.',
          'Please enter valid daily wage amount.',
          'कृपया दैनिक मजदूरी दर्ज करें।',
          'దయచేసి దినసరి వేతనం నమోదు చేయండి.',
          'ദൈനംദിന വേതനം നൽകുക.',
          'ದಯವಿಟ್ಟು ದಿನಗೂಲಿ ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (!workersNeeded || workersNeeded <= 0) {
      setError(
        loc(
          'தேவைப்படும் ஆட்களின் எண்ணிக்கையை குறிப்பிடவும்.',
          'Please enter number of workers needed.',
          'आवश्यक कामगारों की संख्या दर्ज करें।',
          'అవసరమైన కార్మికుల సంఖ్యను నమోదు చేయండి.',
          'ആവശ്യമായ തൊഴിലാളികളുടെ എണ്ണം നൽകുക.',
          'ಅಗತ್ಯವಿರುವ ಕೆಲಸಗಾರರ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    // If employer checked Featured and does not have free subscription credits, open payment modal
    if (makeFeatured && !hasFeaturedCredits) {
      setIsPaymentOpen(true);
      return;
    }

    // Either free standard job or using subscription featured credit
    const jobPayload = buildJobPayload(makeFeatured);
    onAddJob(jobPayload);

    // Auto-save user profile for My Posts page tracking
    const cleanUserPhone = contactNumber.replace(/[^0-9]/g, '');
    saveActiveUserProfile({
      name: employerName.trim(),
      phone: cleanUserPhone,
      role: 'employer',
      location: jobPayload.location,
      category,
    });
    addTrackedPhone(cleanUserPhone);

    setIsSuccess(true);
  };

  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    setIsPaymentOpen(false);
    const jobPayload = buildJobPayload(true);
    onAddJob(jobPayload, tx);

    // Auto-save user profile for My Posts page tracking
    const cleanUserPhone = contactNumber.replace(/[^0-9]/g, '');
    saveActiveUserProfile({
      name: employerName.trim(),
      phone: cleanUserPhone,
      role: 'employer',
      location: jobPayload.location,
      category,
    });
    addTrackedPhone(cleanUserPhone);

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
              'வேலை வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
              'Job Posted Successfully!',
              'नौकरी सफलतापूर्वक पोस्ट की गई!',
              'పని విజయవంతంగా పోస్ట్ చేయబడింది!',
              'ജോലി വിജയകരമായി പോസ്റ്റ് ചെയ്തു!',
              'ಕೆಲಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ!'
            )}
          </h3>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            {loc(
              'உங்கள் வேலை வாய்ப்பு இப்போது தொழிலாளர்களுக்கு தென்படும். தொழிலாளர்கள் உங்களை நேரடியாக போன் அல்லது வாட்ஸ்அப் மூலம் தொடர்புகொள்வார்கள்.',
              'Your daily job is now live. Workers in your area can now view and call you directly.',
              'आपका काम अब लाइव है। आपके क्षेत्र के कामगार अब सीधे आपको कॉल कर सकते हैं।',
              'మీ పని ఇప్పుడు ప్రత్యక్షంగా ఉంది. మీ ప్రాంతంలోని కార్మికులు నేరుగా కాల్ చేయవచ్చు.',
              'നിങ്ങളുടെ ജോലി ഇപ്പോൾ ലൈവാണ്. നിങ്ങളുടെ പ്രദേശത്തെ തൊഴിലാളികൾക്ക് നേരിട്ട് വിളിക്കാം.',
              'ನಿಮ್ಮ ಕೆಲಸ ಈಗ ಲೈವ್ ಆಗಿದೆ. ನಿಮ್ಮ ಪ್ರದೇಶದ ಕೆಲಸಗಾರರು ನೇರವಾಗಿ ಕರೆ ಮಾಡಬಹುದು.'
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={onNavigateToJobs}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs"
          >
            <span>
              {loc('வேலை பட்டியலை பார்க்க', 'View Job Listings', 'काम की सूची देखें', 'పనుల జాబితా చూడండి', 'ജോലി പട്ടിക കാണുക', 'ಕೆಲಸದ ಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsSuccess(false);
              setEmployerName('');
              setLocality('');
              setContactNumber('');
              setNotes('');
            }}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl text-sm"
          >
            {loc('இன்னொரு வேலை பதிய', 'Post Another Job', 'एक और काम पोस्ट करें', 'మరొక పని పోస్ట్ చేయండి', 'മറ്റൊരു ജോലി പോസ്റ്റ് ചെയ്യുക', 'ಮತ್ತೊಂದು ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {loc('புதிய வேலை பதிவு செய்க', 'Post a Daily Job', 'नया काम पोस्ट करें', 'కొత్త పనిని పోస్ట్ చేయండి', 'പുതിയ ജോലി പോസ്റ്റ് ചെയ്യുക', 'ಹೊಸ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ')}
            </h2>
            <p className="text-xs text-slate-600">
              {loc(
                'முதலாளிகளுக்கான எளிய படிவம் - உடனே ஆட்கள் பெறுங்கள்',
                'Free direct job posting for local employers',
                'नियोक्ताओं के लिए सरल फॉर्म - तुरंत कामगार पाएं',
                'యజమానుల కోసం సులభమైన ఫారమ్ - వెంటనే కార్మికులను పొందండి',
                'തൊഴിലുടമകൾക്കുള്ള ലളിതമായ ഫോം - വേഗത്തിൽ ആളുകളെ നേടുക',
                'ಮಾಲೀಕರಿಗಾಗಿ ಸರಳ ಫಾರ್ಮ್ - ತಕ್ಷಣ ಕೆಲಸಗಾರರನ್ನು ಪಡೆಯಿರಿ'
              )}
            </p>
          </div>
        </div>
      </div>

      {!allowJobPosting && (
        <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">
              {loc(
                'வேலை பதிவு தற்காலிகமாக இடைநிறுத்தப்பட்டுள்ளது',
                'New Job Postings Temporarily Paused',
                'नौकरी पोस्टिंग अस्थायी रूप से रोकी गई',
                'పని పోస్టింగ్‌లు తాత్కాలికంగా నిలిపివేయబడ్డాయి',
                'ജോലി പോസ്റ്റിംഗ് താൽക്കാലികമായി നിർത്തിവച്ചു',
                'ಕೆಲಸ ಪೋಸ್ಟಿಂಗ್ ಅನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ'
              )}
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              {loc(
                'நிர்வாக பராமரிப்பு காரணமாக புதிய வேலை பதிவுகள் தற்காலிகமாக நிறுத்தப்பட்டுள்ளன. இருக்கும் வேலைகளை தொடர்பு கொள்ளலாம்.',
                'Job submissions are temporarily paused by app administration. You can still browse and apply to existing jobs.',
                'प्रशासन द्वारा नई पोस्टिंग अस्थायी रूप से रोकी गई हैं।',
                'నిర్వహణ కారణాల వల్ల కొత్త పోస్టింగ్‌లు నిలిపివేయబడ్డాయి.',
                'അഡ്മിൻ കാരണം പുതിയ പോസ്റ്റിംഗുകൾ താൽക്കാലികമായി നിർത്തിവച്ചു.',
                'ಆಡಳಿತದಿಂದ ಹೊಸ ಪೋಸ್ಟಿಂಗ್‌ಗಳನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸಲಾಗಿದೆ.'
              )}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* 0. PROMINENT LANGUAGE SELECTION BAR (User chooses posting language) */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>{loc('பதிவிடும் மொழி', 'Posting Language', 'पोस्टिंग भाषा', 'పోస్టింగ్ భాష', 'പോസ്റ്റിംഗ് ഭാഷ', 'ಪೋಸ್ಟಿಂಗ್ ಭಾಷೆ')}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/90 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {loc('அனைத்து மொழிகளிலும் மொழிபெயர்க்கப்படும்', 'Auto-translated to all languages', 'सभी भाषाओं में अनुवाद होगा', 'అన్ని భాషల్లోకి అనువదించబడుతుంది', 'എല്ലാ ഭാഷകളിലേക്കും വിവർത്തനം ചെയ്യപ്പെടും', 'ಎಲ್ಲಾ ಭಾಷೆಗಳಿಗೆ ಅನುವಾದಿಸಲಾಗುತ್ತದೆ')}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {loc(
                    'நீங்கள் தேர்வு செய்யும் மொழியில் படிவம் மாறும். வேலை பார்ப்பவர்கள் தங்கள் தாய்மொழியில் இதை காண்பார்கள்.',
                    'Select your preferred language. Job seekers will see this translated into their chosen language.',
                    'अपनी भाषा चुनें। कामगार इसे अपनी चुनी हुई भाषा में अनुवादित देखेंगे।',
                    'మీ భాషను ఎంచుకోండి. కార్మికులు దీనిని తమ ఎంచుకున్న భాషలో అనువదించి చూస్తారు.',
                    'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക. തൊഴിലാളികൾ ഇത് അവരുടെ ഭാഷയിൽ കാണും.',
                    'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಕೆಲಸಗಾರರು ಇದನ್ನು ತಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ನೋಡುತ್ತಾರೆ.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 pt-1">
            {SUPPORTED_LANGUAGES.map((langOpt) => {
              const isSelected = postingLanguage === langOpt.code;
              return (
                <button
                  key={langOpt.code}
                  type="button"
                  id={`btn-post-lang-${langOpt.code}`}
                  onClick={() => {
                    setPostingLanguage(langOpt.code);
                    setLanguage(langOpt.code);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02] ring-2 ring-emerald-500 font-black'
                      : 'bg-white hover:bg-emerald-100/60 text-slate-700 border border-emerald-200 shadow-xs'
                  }`}
                >
                  <span className="text-xs leading-none">{langOpt.nativeName}</span>
                  <span className={`text-[10px] font-medium leading-tight mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {langOpt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Employer Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>
              {loc(
                'முதலாளி / நிறுவனத்தின் பெயர்',
                'Employer / Business Name',
                'नियोक्ता / कंपनी का नाम',
                'యజమాని / వ్యాపార పేరు',
                'തൊഴിലുടമ / സ്ഥാപന നാമം',
                'ಮಾಲೀಕ / ಸಂಸ್ಥೆಯ ಹೆಸರು'
              )}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-employer-name"
            type="text"
            required
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            placeholder={loc(
              'எ.கா: ராஜா பில்டர்ஸ் / குமார்',
              'e.g. Raja Builders / Kumar',
              'उदा: राजा बिल्डर्स / कुमार',
              'ఉదా: రాజా బిల్డర్స్ / కుమార్',
              'ഉദാ: രാജാ ബിൽഡേഴ്‌സ് / കുമാർ',
              'ಉದಾ: ರಾಜಾ ಬಿಲ್ಡರ್ಸ್ / ಕುಮಾರ್'
            )}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 2. Work Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <CategoryIcon name="Hammer" className="w-4 h-4 text-emerald-700" />
            <span>
              {loc('வேலை வகை', 'Work Category', 'काम की श्रेणी', 'పని వర్గం', 'ജോലി വിഭാഗം', 'ಕೆಲಸದ ವರ್ಗ')}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            id="input-job-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              const found = WORK_CATEGORIES.find((c) => c.id === e.target.value);
              if (found && !dailyWage && e.target.value !== 'other') {
                setDailyWage(found.suggestedWage);
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

          {category === 'other' && (
            <div className="mt-2.5 animate-in fade-in duration-150 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {loc(
                  'புதிய வேலை வகையின் பெயரை தட்டச்சு செய்க',
                  'Type Custom Work Category Name',
                  'नई कार्य श्रेणी का नाम दर्ज करें',
                  'కొత్త పని వర్గం పేరును టైప్ చేయండి',
                  'പുതിയ തൊഴിൽ വിഭാഗത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക',
                  'ಹೊಸ ಕೆಲಸದ ವರ್ಗದ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ'
                )}
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                id="input-custom-category"
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

        {/* 3. Multi-Tier Cascading Location: Country -> State -> District -> City -> Locality -> Address */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-slate-900">
                {loc(
                  'வேலை செய்யும் இடம் (நாடு, மாநிலம், மாவட்டம் & நகரம்)',
                  'Job Location (Country, State, District & City)',
                  'कार्य स्थान (देश, राज्य, जिला और शहर)',
                  'పని స్థలం (దేశం, రాష్ట్రం, జిల్లా & నగరం)',
                  'ജോലി ചെയ്യുന്ന സ്ഥലം (രാജ്യം, സംസ്ഥാനം, ജില്ല & നഗരം)',
                  'ಕೆಲಸದ ಸ್ಥಳ (ದೇಶ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ ಮತ್ತು ನಗರ)'
                )}
              </span>
              <span className="text-rose-500 font-bold">*</span>
            </div>

            {/* GPS CURRENT LOCATION BUTTON */}
            <button
              id="btn-detect-gps-post-job"
              type="button"
              onClick={handleDetectCurrentLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 transition-all active:scale-95 disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                  <span>{loc('தேடுகிறது...', 'Locating...', 'खोज रहा है...', 'గుర్తిస్తోంది...', 'കണ്ടെത്തുന്നു...', 'ಹುಡುಕುತ್ತಿದೆ...')}</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{loc('📍 தற்போதைய GPS இடம்', '📍 Use Current GPS', '📍 वर्तमान GPS स्थान', '📍 ప్రస్తుత GPS స్థానం', '📍 നിലവിലെ GPS സ്ഥലം', '📍 ಪ್ರಸ್ತುತ GPS ಸ್ಥಳ')}</span>
                </>
              )}
            </button>
          </div>

          {/* Cascading Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Country Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('1. நாடு', '1. Country', '1. देश', '1. దేశం', '1. രാജ്യം', '1. ದೇಶ')}</span>
              </label>
              <select
                id="input-employer-country"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {language === 'ta' ? c.nameTa : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. State Selector (All Indian states & UTs supported) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('2. மாநிலம் (அனைத்து மாநிலங்கள்)', '2. State (All States)', '2. राज्य', '2. రాష్ట్రం', '2. സംസ്ഥാനം', '2. ರಾಜ್ಯ')}</span>
              </label>
              <select
                id="input-job-state"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableStates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {postingLanguage === 'ta' ? s.nameTa : s.nameEn} ({s.nameEn})
                  </option>
                ))}
                <option value="OTHER_STATE">
                  + {loc('பிற மாநிலம் / Other State', '+ Other State', '+ अन्य राज्य', '+ ఇతర రాష్ట్రం', '+ മറ്റ് സംസ്ഥാനം', '+ ಇತರ ರಾಜ್ಯ')}
                </option>
              </select>
            </div>

            {/* 3. District Selector (Cascades dynamically from State) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('3. மாவட்டம்', '3. District', '3. जिला', '3. జిల్లా', '3. ജില്ല', '3. ಜಿಲ್ಲೆ')}</span>
              </label>
              <select
                id="input-job-district"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {postingLanguage === 'ta' ? d.nameTa : d.nameEn} ({d.nameEn})
                  </option>
                ))}
                <option value="OTHER_DISTRICT">
                  + {loc('பிற மாவட்டம் / Other District', '+ Other District', '+ अन्य जिला', '+ ఇతర జిల్లా', '+ മറ്റ് ജില്ല', '+ ಇತರ ಜಿಲ್ಲೆ')}
                </option>
              </select>
            </div>
          </div>

          {/* Custom State or Custom District Inputs if "Other" is chosen */}
          {(selectedState === 'OTHER_STATE' || selectedDistrict === 'OTHER_DISTRICT') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {selectedState === 'OTHER_STATE' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {loc('மாநிலத்தின் பெயர் உள்ளிடவும்', 'Enter State Name', 'राज्य का नाम दर्ज करें', 'రాష్ట్రం పేరు నమోదు చేయండి', 'സംസ്ഥാനത്തിന്റെ പേര് നൽകുക', 'ರಾಜ್ಯದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ')}
                  </label>
                  <input
                    id="input-custom-state"
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    placeholder="e.g. Maharashtra / Goa / Odisha"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
              {selectedDistrict === 'OTHER_DISTRICT' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {loc('மாவட்டத்தின் பெயர் உள்ளிடவும்', 'Enter District Name', 'जिले का नाम दर्ज करें', 'జిల్లా పేరు నమోదు చేయండి', 'ജില്ലയുടെ പേര് നൽകുക', 'ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ')}
                  </label>
                  <input
                    id="input-custom-district"
                    type="text"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="e.g. Coimbatore / Ernakulam / Bengaluru"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. City / Town Selection & Locality / Village Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {loc('4. நகரம் / முக்கிய பேரூராட்சி', '4. City / Town', '4. शहर / कस्बा', '4. నగరం / పట్టణం', '4. നഗരം / ടൗൺ', '4. ನಗರ / ಪಟ್ಟಣ')}
              </label>
              {availableCities.length > 0 && selectedCity !== 'OTHER_CITY' ? (
                <div className="space-y-1.5">
                  <select
                    id="input-job-city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableCities.map((cityItem) => (
                      <option key={cityItem} value={cityItem}>
                        {cityItem}
                      </option>
                    ))}
                    <option value="OTHER_CITY">
                      + {loc('வேறு நகரம் / ஊர் தட்டச்சு செய்க', '+ Type other city/town', '+ अन्य शहर दर्ज करें', '+ ఇతర నగరం టైప్ చేయండి', '+ മറ്റ് നഗരം ടൈപ്പ് ചെയ്യുക', '+ ಇತರ ನಗರ ಟೈಪ್ ಮಾಡಿ')}
                    </option>
                  </select>
                </div>
              ) : (
                <input
                  id="input-custom-city"
                  type="text"
                  value={customCity}
                  onChange={(e) => {
                    setCustomCity(e.target.value);
                    setSelectedCity('OTHER_CITY');
                  }}
                  placeholder={loc(
                    'நகரம் / பேரூராட்சி பெயர்',
                    'City / Town Name',
                    'शहर का नाम',
                    'నగరం పేరు',
                    'നഗരത്തിന്റെ പേര്',
                    'ನಗರದ ಹೆಸರು'
                  )}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* 5. Village / Street / Locality free text */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {loc('5. பகுதி / கிராமம் / தெரு', '5. Locality / Village / Area', '5. क्षेत्र / गाँव / मोहल्ला', '5. ప్రాంతం / గ్రామం', '5. പ്രദേശം / ഗ്രാമം', '5. ಪ್ರದೇಶ / ಹಳ್ಳಿ')}
              </label>
              <input
                id="input-job-locality"
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder={loc(
                  'பகுதி / ஊர் (எ.கா: அண்ணா நகர், காந்தி வீதி)',
                  'Area / Street (e.g. Anna Nagar, Gandhi St)',
                  'क्षेत्र / मोहल्ला (उदा: अन्ना नगर)',
                  'ప్రాంతం / వీధి (ఉదా: అన్నా నగర్)',
                  'പ്രദേശം / തെരുവ് (ഉദാ: അണ്ണാ നഗർ)',
                  'ಪ್ರದೇಶ / ಬೀದಿ (ಉದಾ: ಅಣ್ಣಾ ನಗರ)'
                )}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* EXACT WORK SITE / LANDMARK / NAVIGATION ADDRESS */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {loc('குறிப்பிட்ட பணிமனை முகவரி / அடையாளம் (வழித்தடத்திற்கு பயன்படும்)', 'Exact Work Site Address / Landmark (Helps workers navigate)', 'सटीक कार्य स्थल का पता / लैंडमार्क', 'ఖచ్చితమైన పని ప్రదేశం చిరునామా / ల్యాండ్‌మార్క్', 'കൃത്യമായ ജോലിസ്ഥല വിലാസം / ലാൻഡ്മാർക്ക്', 'ನಿಖರವಾದ ಕೆಲಸದ ಸ್ಥಳದ ವಿಳಾಸ / ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್')}
            </label>
            <input
              id="input-job-landmark-address"
              type="text"
              value={landmarkAddress}
              onChange={(e) => setLandmarkAddress(e.target.value)}
              placeholder={loc(
                'எ.கா: பேருந்து நிலையம் அருகில், 2வது சந்து, புதிய கட்டிடம்',
                'e.g. Near Bus Stand, 2nd Cross, New Construction Site',
                'उदा: बस स्टैंड के पास, दूसरी गली',
                'ఉదా: బస్ స్టాండ్ దగ్గర, 2వ సందు',
                'ഉദാ: ബസ് സ്റ്റാൻഡിന് സമീപം, പുതിയ കെട്ടിടം',
                'ಉದಾ: ಬಸ್ ನಿಲ್ದಾಣದ ಹತ್ತಿರ, ಹೊಸ ಕಟ್ಟಡ'
              )}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* GPS SUCCESS STATUS CARD */}
          {geoCoords && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">
                    {loc('GPS இருப்பிடம் பதிவு செய்யப்பட்டது', 'GPS Location Saved', 'GPS स्थान सहेजा गया', 'GPS స్థానం భద్రపరచబడింది', 'GPS സ്ഥലം സംരക്ഷിച്ചു', 'GPS ಸ್ಥಳ ಉಳಿಸಲಾಗಿದೆ')}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    {geoCoords.lat}, {geoCoords.lng}
                    {geoCoords.accuracy && ` · ±${geoCoords.accuracy}m`}
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
                  <span>{loc('வரைபடம்', 'Map', 'मानचित्र', 'మ్యాప్', 'മാപ്പ്', 'ನಕ್ಷೆ')}</span>
                </a>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title="Remove GPS"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* GPS ERROR WARNING */}
          {geoError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1">
                <span>{geoError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGeoError(null)}
                className="text-amber-700 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* 4. Employer Custom Wage Determination */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>
                {loc(
                  'கூலி நிர்ணயம் (வேலை கொடுப்பவரே முடிவு செய்யலாம்)',
                  'Wage Setting (Employer Sets Own Wage)',
                  'मजदूरी निर्धारण (नियोक्ता खुद तय करें)',
                  'వేతన నిర్ణయం (యజమానే నిర్ణయించవచ్చు)',
                  'കൂലി നിർണ്ണയം (തൊഴിലുടമയ്ക്ക് നിശ്ചയിക്കാം)',
                  'ಕೂಲಿ ನಿಗದಿ (ಮಾಲೀಕರೇ ನಿರ್ಧರಿಸಬಹುದು)'
                )}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
              ✍️ {loc('சுய விருப்ப கூலி', 'Custom Wage', 'अपनी इच्छा से मजदूरी', 'స్వచ్ఛంద వేతనం', 'സ്വന്തം വേതനം', 'ಸ್ವಂತ ಕೂಲಿ')}
            </span>
          </div>

          <p className="text-[11px] text-slate-600">
            {loc(
              'நீங்கள் வழங்கும் கூலித் தொகையை நேரடியாக தட்டச்சு செய்து உள்ளிடலாம் அல்லது கீழே உள்ள விரைவு தொகைகளை அழுத்தலாம்.',
              'Type your custom wage amount directly or select from the quick presets below.',
              'अपनी इच्छानुसार मजदूरी सीधे दर्ज करें या नीचे दिए गए विकल्पों में से चुनें।',
              'మీరు కోరుకున్న వేతన మొత్తాన్ని నేరుగా టైప్ చేయండి లేదా క్రింది ఆప్షన్లను ఎంచుకోండి.',
              'നിങ്ങൾ ആഗ്രഹിക്കുന്ന കൂലി നേരിട്ട് ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ താഴെയുള്ളവ തിരഞ്ഞെടുക്കുക.',
              'ನಿಮಗೆ ಬೇಕಾದ ಕೂಲಿ ಮೊತ್ತವನ್ನು ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿ.'
            )}
          </p>

          {/* Wage Type Selector: Daily / Half-day / Hourly / Contract */}
          <div>
            <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {loc('கூலி கணக்கீட்டு முறை:', 'Wage Basis / Type:', 'मजदूरी का प्रकार:', 'వేతన రకం:', 'കൂലി കണക്കാക്കുന്ന രീതി:', 'ಕೂಲಿ ವಿಧಾನ:')}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setWageType('daily')}
                className={`py-1.5 px-2.5 rounded-xl font-bold border transition-all text-center ${
                  wageType === 'daily'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🌞 {loc('ஒரு நாள் கூலி', 'Per Day', 'प्रति दिन', 'రోజుకు', 'ദിവസേന', 'ದಿನಕ್ಕೆ')}
              </button>
              <button
                type="button"
                onClick={() => setWageType('half_day')}
                className={`py-1.5 px-2.5 rounded-xl font-bold border transition-all text-center ${
                  wageType === 'half_day'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⏱️ {loc('அரை நாள்', 'Half Day', 'आधा दिन', 'అర రోజు', 'അര ദിവസം', 'ಅರ್ಧ ದಿನ')}
              </button>
              <button
                type="button"
                onClick={() => setWageType('hourly')}
                className={`py-1.5 px-2.5 rounded-xl font-bold border transition-all text-center ${
                  wageType === 'hourly'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⏳ {loc('ஒரு மணி நேரத்திற்கு', 'Per Hour', 'प्रति घंटा', 'గంటకు', 'മണിക്കൂറിന്', 'ಗಂಟೆಗೆ')}
              </button>
              <button
                type="button"
                onClick={() => setWageType('contract')}
                className={`py-1.5 px-2.5 rounded-xl font-bold border transition-all text-center ${
                  wageType === 'contract'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                📦 {loc('ஒப்பந்தம் / பணிக்கு', 'Per Task / Contract', 'कार्य के अनुसार', 'పనికి మొత్తం', 'കരാർ അടിസ്‌ഥാനത്തിൽ', 'ಕೆಲಸಕ್ಕೆ')}
              </button>
            </div>
          </div>

          {/* Direct Wage Input Field with Adjustment Controls */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">
                {loc('கூலி தொகை (₹):', 'Wage Amount (₹):', 'मजदूरी राशि (₹):', 'వేతన మొత్తం (₹):', 'കൂലി തുക (₹):', 'ಕೂಲಿ ಮೊತ್ತ (₹):')}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-emerald-700">
                  ₹{dailyWage || 0}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {wageType === 'daily' && loc('/ நாள்', '/ day', '/ दिन', '/ రోజు', '/ ദിവസം', '/ ದಿನ')}
                  {wageType === 'half_day' && loc('/ அரை நாள்', '/ half day', '/ आधा दिन', '/ అర రోజు', '/ അര ദിവസം', '/ ಅರ್ಧ ದಿನ')}
                  {wageType === 'hourly' && loc('/ மணி', '/ hour', '/ घंटा', '/ గంట', '/ മണിക്കൂർ', '/ ಗಂಟೆ')}
                  {wageType === 'contract' && loc('/ மொத்த பணி', '/ task', '/ कार्य', '/ పని', '/ ജോലി', '/ ಕೆಲಸ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-base">₹</span>
                <input
                  id="input-daily-wage"
                  type="number"
                  min="50"
                  max="50000"
                  step="50"
                  required
                  value={dailyWage || ''}
                  onChange={(e) => setDailyWage(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                  placeholder={loc('உங்கள் கூலியை உள்ளிடவும் (எ.கா: 850)', 'Enter custom wage (e.g. 850)', 'अपनी मजदूरी दर्ज करें', 'మీ వేతనం నమోదు చేయండి', 'കൂലി തുക നൽകുക', 'ನಿಮ್ಮ ಕೂಲಿ ನಮೂದಿಸಿ')}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-emerald-400 focus:border-emerald-600 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Step adjustment buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="-₹50"
                  onClick={() => setDailyWage((prev) => Math.max(50, (prev || 0) - 50))}
                  className="h-10 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  -50
                </button>
                <button
                  type="button"
                  title="+₹50"
                  onClick={() => setDailyWage((prev) => (prev || 0) + 50)}
                  className="h-10 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  +50
                </button>
                <button
                  type="button"
                  title="+₹100"
                  onClick={() => setDailyWage((prev) => (prev || 0) + 100)}
                  className="h-10 px-2.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  +100
                </button>
              </div>
            </div>
          </div>

          {/* Quick presets pills */}
          <div>
            <span className="block text-[10px] font-bold text-slate-500 mb-1">
              {loc('விரைவு தொகைகள் (விருப்பத்தேர்வு):', 'Quick Presets (Optional):', 'त्वरित चयन:', 'త్వరిత ఎంపిక:', 'പെട്ടെന്നുള്ള തുകകൾ:', 'ತ್ವರಿತ ಆಯ್ಕೆಗಳು:')}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {wagePresets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDailyWage(amount)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    dailyWage === amount
                      ? 'bg-emerald-700 text-white shadow-xs scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Negotiable Wage Option */}
          <div className="pt-2 border-t border-emerald-200/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isWageNegotiable}
                onChange={(e) => setIsWageNegotiable(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                🤝 {loc('கூலி பேசித் தீர்மானிக்கலாம் (திறமை & பணி அடிப்படையில்)', 'Wage is Negotiable (Based on skill and workload)', 'मजदूरी पर बातचीत संभव है', 'వేతనం చర్చించవచ్చు', 'കൂലി സംസാരിച്ചു തീരുമാനിക്കാം', 'ಕೂಲಿ ಮಾತುಕತೆಗೆ ಒಳಪಟ್ಟಿದೆ')}
              </span>
            </label>
          </div>

          {/* Additional Perks & Facilities */}
          <div className="pt-2 border-t border-emerald-200/60">
            <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {loc('கூடுதல் சலுகைகள் (விருப்பத்தேர்வு):', 'Additional Perks Provided (Optional):', 'अतिरिक्त सुविधाएं:', 'అదనపు సౌకర్యాలు:', 'കൂടുതൽ സൗകര്യങ്ങൾ:', 'ಹೆಚ್ಚುವರಿ ಸೌಲಭ್ಯಗಳು:')}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                foodProvided ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={foodProvided}
                  onChange={(e) => setFoodProvided(e.target.checked)}
                  className="sr-only"
                />
                <span>🍛 {loc('மதிய உணவு உண்டு', 'Lunch Provided', 'दोपहर का भोजन', 'మధ్యాహ్న భోజనం', 'ഉച്ചഭക്ഷണം ഉണ്ട്', 'ಮಧ್ಯಾಹ್ನದ ಊಟ')}</span>
              </label>

              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                teaProvided ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={teaProvided}
                  onChange={(e) => setTeaProvided(e.target.checked)}
                  className="sr-only"
                />
                <span>☕ {loc('டீ / சிற்றுண்டி உண்டு', 'Tea / Snacks Provided', 'चाय / नाश्ता', 'టీ / టిఫిన్', 'ചായ / ലഘുഭക്ഷണം', 'ಚಹಾ / ತಿಂಡಿ')}</span>
              </label>

              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                travelProvided ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={travelProvided}
                  onChange={(e) => setTravelProvided(e.target.checked)}
                  className="sr-only"
                />
                <span>🚌 {loc('பயணப்படி / வண்டி வசதி', 'Travel Allowance', 'यात्रा भत्ता', 'ప్రయాణ భత్యం', 'യാത്രാ ബത്ത', 'ಪ್ರಯಾಣ ಭತ್ಯೆ')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* 5. Number of Workers Needed & Job Date (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Workers needed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>
                {loc('ஆட்கள் எண்ணிக்கை', 'Number of Workers', 'कामगारों की संख्या', 'కార్మికుల సంఖ్య', 'ആളുകളുടെ എണ്ണം', 'ಕೆಲಸಗಾರರ ಸಂಖ್ಯೆ')}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWorkersNeeded(Math.max(1, workersNeeded - 1))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center text-lg active:scale-95"
              >
                -
              </button>
              <div className="flex-1 text-center py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-base text-slate-900">
                {workersNeeded} {loc('நபர்கள்', 'Persons', 'व्यक्ति', 'వ్యక్తులు', 'ആളുകൾ', 'ಜನರು')}
              </div>
              <button
                type="button"
                onClick={() => setWorkersNeeded(workersNeeded + 1)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center text-lg active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Job Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>
                {loc('வேலை நாள்', 'Job Date', 'काम की तारीख', 'పని తేదీ', 'ജോലി തീയതി', 'ಕೆಲಸದ ದಿನಾಂಕ')}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1 mb-1.5">
              <button
                type="button"
                onClick={() => setJobDate(todayStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex-1 ${
                  jobDate === todayStr
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {loc('இன்று', 'Today', 'आज', 'ఈరోజు', 'ഇന്ന്', 'ಇಂದು')}
              </button>
              <button
                type="button"
                onClick={() => setJobDate(tomorrowStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex-1 ${
                  jobDate === tomorrowStr
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {loc('நாளை', 'Tomorrow', 'कल', 'రేపు', 'നാളെ', 'ನಾಳೆ')}
              </button>
            </div>
            <input
              id="input-job-date"
              type="date"
              required
              value={jobDate}
              onChange={(e) => setJobDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 6. Contact Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>
              {loc(
                'தொடர்பு எண் (தொழிலாளர்கள் அழைக்க)',
                'Contact Number (for calls & WhatsApp)',
                'संपर्क नंबर (कॉल और व्हाट्सएप के लिए)',
                'సంప్రదింపు సంఖ్య (కాల్స్ & వాట్సాప్ కోసం)',
                'ബന്ധപ്പെടേണ്ട നമ്പർ (കോളുകൾക്കും വാട്ട്‌സ്ആപ്പിനും)',
                'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ (ಕರೆಗಳು ಮತ್ತು ವಾಟ್ಸಾಪ್‌ಗಾಗಿ)'
              )}
            </span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-xl text-xs font-bold text-slate-600">
              {COUNTRIES_LIST.find((c) => c.code === selectedCountry)?.dialCode || '+91'}
            </span>
            <input
              id="input-contact-number"
              type="tel"
              required
              maxLength={12}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="9840123456"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Job Status & Verified Employer Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Urgent switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {loc('⚡ அவசர வேலை (Urgent)', '⚡ Urgent Today', '⚡ तत्काल काम (Urgent)', '⚡ అత్యవసర పని (Urgent)', '⚡ അടിയന്തര ജോലി (Urgent)', '⚡ ತುರ್ತು ಕೆಲಸ (Urgent)')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {loc('இன்றைய உடனடி ஆட்கள் தேவை', 'Highlights at the top', 'शीर्ष पर दिखाया जाएगा', 'పైభాగంలో హైలైట్ చేయబడుతుంది', 'മുകളിൽ പ്രദർശിപ്പിക്കും', 'ಮೇಲ್ಭಾಗದಲ್ಲಿ ಹೈಲೈಟ್ ಮಾಡಲಾಗುತ್ತದೆ')}
                </p>
              </div>
            </div>
            <input
              id="checkbox-urgent"
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Verified Employer Seal */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {loc('சரிபார்க்கப்பட்ட முதலாளி', 'Verified Employer', 'सत्यापित नियोक्ता', 'ధృవీకరించబడిన యజమాని', 'പരിശോധിച്ച തൊഴിലുടമ', 'ಪರಿಶೀಲಿಸಿದ ಮಾಲೀಕ')}
                </p>
                <p className="text-[10px] text-emerald-700">
                  {loc('நம்பகமான அடையாள முத்திரை', 'Trust badge displayed', 'विश्वसनीयता बैज दिखाया गया', 'విశ్వసనీయ బ్యాడ్జ్ చూపబడింది', 'വിശ്വാസ്യത ബാഡ്ജ് പ്രദർശിപ്പിച്ചു', 'ವಿಶ್ವಾಸಾರ್ಹ ಬ್ಯಾಡ್ಜ್ ಪ್ರದರ್ಶಿಸಲಾಗಿದೆ')}
                </p>
              </div>
            </div>
            <input
              id="checkbox-verified-employer"
              type="checkbox"
              checked={isVerifiedEmployer}
              onChange={(e) => setIsVerifiedEmployer(e.target.checked)}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 7. Additional Notes / Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>
              {loc(
                'கூடுதல் விவரங்கள் (தேவைப்பட்டால்)',
                'Work Notes / Exact Address (Optional)',
                'अतिरिक्त विवरण (वैकल्पिक)',
                'అదనపు వివరాలు (ఐచ్ఛికం)',
                'കൂടുതൽ വിവരങ്ങൾ (ഓപ്ഷണൽ)',
                'ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ಐಚ್ಛಿಕ)'
              )}
            </span>
          </label>
          <textarea
            id="input-job-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={loc(
              'எ.கா: காலை உணவு வழங்கப்படும், வேலை நேரம் 8 AM - 5 PM',
              'e.g. Breakfast provided, timing 8 AM to 5 PM',
              'उदा: नाश्ता दिया जाएगा, समय 8 AM से 5 PM',
              'ఉదా: అల్పాహారం అందించబడుతుంది, సమయం 8 AM - 5 PM',
              'ഉദാ: പ്രഭാതഭക്ഷണം നൽകും, സമയം 8 AM - 5 PM',
              'ಉದಾ: ಉಪಹಾರ ನೀಡಲಾಗುತ್ತದೆ, ಸಮಯ 8 AM - 5 PM'
            )}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 8. MONETIZATION UPGRADE: Make this job Featured */}
        <div
          onClick={() => setMakeFeatured(!makeFeatured)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            makeFeatured
              ? 'bg-amber-50/80 border-2 border-amber-400 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  makeFeatured ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {loc(
                      'சிறப்பு வேலை (Featured Boost) ஆக்குக',
                      'Promote as Featured Job',
                      'फीचर्ड काम के रूप में प्रमोट करें',
                      'ఫీచర్ చేసిన పనిగా ప్రమోట్ చేయండి',
                      'ഫീച്ചർ ചെയ്ത ജോലിയായി പ്രൊമോട്ട് ചെയ്യുക',
                      'ಫೀಚರ್ ಮಾಡಿದ ಕೆಲಸವಾಗಿ ಪ್ರಚಾರ ಮಾಡಿ'
                    )}
                  </h4>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                    3X FAST CALLS
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {loc(
                    'வேலை பட்டியலில் எப்போதும் முதலிடத்தில் தோன்றும். பொன் நிற பேட்ஜ் கிடைக்கும்.',
                    'Pinned to top of job feed with verified gold badge.',
                    'सूची में हमेशा शीर्ष पर दिखेगा और गोल्ड बैज मिलेगा।',
                    'పనుల జాబితాలో ఎల్లప్పుడూ పైభాగంలో కనిపిస్తుంది.',
                    'ജോലി ലിസ്റ്റിൽ എപ്പോഴും മുകളിൽ കാണിക്കും.',
                    'ಕೆಲಸದ ಪಟ್ಟಿಯಲ್ಲಿ ಯಾವಾಗಲೂ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.'
                  )}
                </p>

                <div className="mt-1.5 text-xs font-bold">
                  {hasFeaturedCredits ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {loc(
                        `உங்கள் சந்தாவில் இலவசம் (${subscription?.featuredCreditsRemaining} மீதம்)`,
                        `Included in plan (${subscription?.featuredCreditsRemaining} credits left)`,
                        `योजना में शामिल (${subscription?.featuredCreditsRemaining} शेष)`,
                        `ప్లాన్‌లో చేర్చబడింది (${subscription?.featuredCreditsRemaining} మిగిలి ఉన్నాయి)`,
                        `പ്ലാനിൽ ഉൾപ്പെടുത്തിയിരിക്കുന്നു (${subscription?.featuredCreditsRemaining} ശേഷിക്കുന്നു)`,
                        `ಪ್ಲಾನ್‌ನಲ್ಲಿ ಸೇರಿಸಲಾಗಿದೆ (${subscription?.featuredCreditsRemaining} ಉಳಿದಿದೆ)`
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-800">
                      {loc('கட்டணம்: ₹99 (3 நாட்கள்)', 'Price: ₹99 (3 Days Boost)', 'शुल्क: ₹99 (3 दिन)', 'రుసుము: ₹99 (3 రోజులు)', 'ഫീസ്: ₹99 (3 ദിവസങ്ങൾ)', 'ಶುಲ್ಕ: ₹99 (3 ದಿನಗಳು)')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={makeFeatured}
              onChange={(e) => setMakeFeatured(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0 mt-1"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="btn-submit-job"
          type="submit"
          disabled={!allowJobPosting}
          className={`w-full font-bold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            makeFeatured && !hasFeaturedCredits
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {!allowJobPosting ? (
            <span>
              {loc('வேலை பதிவு தற்காலிகமாக நிறுத்தப்பட்டுள்ளது', 'Job Posting Currently Disabled', 'काम पोस्टिंग अस्थायी रूप से बंद है', 'పని పోస్టింగ్ నిలిపివేయబడింది', 'ജോലി പോസ്റ്റിംഗ് നിർത്തിവച്ചിരിക്കുന്നു', 'ಕೆಲಸ ಪೋಸ್ಟಿಂಗ್ ಅನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ')}
            </span>
          ) : makeFeatured && !hasFeaturedCredits ? (
            <>
              <Sparkles className="w-5 h-5" />
              <span>
                {loc('₹99 செலுத்தி சிறப்பு வேலையாக பதிக', 'Pay ₹99 & Publish Featured Job', '₹99 भुगतान करें और फीचर्ड काम पोस्ट करें', '₹99 చెల్లించి ఫీచర్ చేసిన పనిని పోస్ట్ చేయండి', '₹99 നൽകി ഫീച്ചർ ചെയ്ത ജോലി പോസ്റ്റ് ചെയ്യുക', '₹99 ಪಾವತಿಸಿ ಫೀಚರ್ ಮಾಡಿದ ಕೆಲಸವನ್ನು ಪ್ರಕಟಿಸಿ')}
              </span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>
                {loc('வேலையை உடனடியாக பதிவு செய்க (இலவசம்)', 'Publish Job Requirement (Free)', 'तुरंत काम पोस्ट करें (निःशुल्क)', 'పనిని వెంటనే పోస్ట్ చేయండి (ఉచితం)', 'ഉടൻ ജോലി പോസ്റ്റ് ചെയ്യുക (സൗജന്യം)', 'ಕೆಲಸವನ್ನು ತಕ್ಷಣವೇ ಪೋಸ್ಟ್ ಮಾಡಿ (ಉಚಿತ)')}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Payment Modal for Featured Upgrade */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          titleEn="Featured Job Upgrade (3 Days)"
          titleTa="சிறப்பு வேலை மேம்பாடு (3 நாட்கள்)"
          amount={99}
          purpose="featured_job"
          payerName={employerName}
          payerPhone={contactNumber}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
