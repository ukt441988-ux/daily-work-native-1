import React, { useState } from 'react';
import { Screen, ShopItem, Language } from '../types';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { COUNTRIES_LIST, findNearestLocation, getSavedUserLocation } from '../data/locations';
import {
  getStatesForCountry,
  getDistrictsForState,
  getCitiesForDistrict,
} from '../data/allLocationsData';
import { saveShopItem, getSavedShops } from '../data/shopsData';
import { extractShopDetailsFromRawInput } from '../utils/aiPromptsHelper';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle2,
  Sparkles,
  Cpu,
  ShieldCheck,
  Building2,
  Package,
  PlusCircle,
  Home,
  Layers,
  Globe,
  Crosshair,
  Loader2,
  Compass,
} from 'lucide-react';

interface AddShopScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const AddShopScreen: React.FC<AddShopScreenProps> = ({ onNavigate }) => {
  const { loc, language } = useLanguage();
  const userLoc = getSavedUserLocation();

  // Posting Language State
  const [postingLanguage, setPostingLanguage] = useState<Language>(language);

  // Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [category, setCategory] = useState<ShopItem['category']>('hardware');
  const [address, setAddress] = useState('');
  const [materials, setMaterials] = useState('');
  const [delivery, setDelivery] = useState(true);
  const [formError, setFormError] = useState('');

  // Cascading Location States (Country -> State -> District -> City)
  const [selectedCountry, setSelectedCountry] = useState<string>(userLoc.countryCode || 'IN');
  const [selectedState, setSelectedState] = useState<string>(
    userLoc.countryCode === 'IN' || !userLoc.countryCode ? 'TN' : 'OTHER_STATE'
  );
  const [customState, setCustomState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('chennai');
  const [customDistrict, setCustomDistrict] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>(userLoc.city || 'சென்னை (Chennai)');
  const [customCity, setCustomCity] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoCoords, setGeoCoords] = useState<{ lat?: number; lng?: number }>({});

  // Dynamic dropdown lists
  const availableStates = getStatesForCountry(selectedCountry);
  const availableDistricts = getDistrictsForState(selectedCountry, selectedState);
  const availableCities = getCitiesForDistrict(selectedCountry, selectedState, selectedDistrict);

  // Location Handlers
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const newStates = getStatesForCountry(countryCode);
    if (newStates.length > 0) {
      const firstState = newStates[0].id;
      setSelectedState(firstState);
      const newDistricts = getDistrictsForState(countryCode, firstState);
      if (newDistricts.length > 0) {
        const firstDistrict = newDistricts[0].id;
        setSelectedDistrict(firstDistrict);
        const newCities = getCitiesForDistrict(countryCode, firstState, firstDistrict);
        setSelectedCity(newCities.length > 0 ? newCities[0] : '');
      } else {
        setSelectedDistrict('OTHER_DISTRICT');
        setSelectedCity('');
      }
    } else {
      setSelectedState('OTHER_STATE');
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('OTHER_CITY');
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    if (stateId === 'OTHER_STATE') {
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('OTHER_CITY');
      return;
    }
    const newDistricts = getDistrictsForState(selectedCountry, stateId);
    if (newDistricts.length > 0) {
      const firstDistrict = newDistricts[0].id;
      setSelectedDistrict(firstDistrict);
      const newCities = getCitiesForDistrict(selectedCountry, stateId, firstDistrict);
      setSelectedCity(newCities.length > 0 ? newCities[0] : '');
    } else {
      setSelectedDistrict('OTHER_DISTRICT');
      setSelectedCity('');
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    if (districtId === 'OTHER_DISTRICT') {
      setSelectedCity('OTHER_CITY');
      return;
    }
    const newCities = getCitiesForDistrict(selectedCountry, selectedState, districtId);
    if (newCities.length > 0) {
      setSelectedCity(newCities[0]);
    } else {
      setSelectedCity('OTHER_CITY');
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert(loc('உங்கள் உலாவியில் GPS வசதி இல்லை.', 'GPS is not supported in this browser.'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const nearest = findNearestLocation(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          setSelectedCity(nearest.location.nameTa);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // AI Paste Mode State
  const [regMode, setRegMode] = useState<'form' | 'ai_paste'>('form');
  const [rawStoreText, setRawStoreText] = useState(
    'ஸ்ரீ அம்மன் ஹார்டுவேர், ஜிஎஸ்டி ரோடு, குரோம்பேட்டை, சென்னை.\nசிமெண்ட், மணல், TMT கம்பிகள், பிளம்பிங் பைப் கிடைக்கும்.\nபோன்: 9841234567\nடெலிவரி உண்டு.'
  );

  // Success State & Newly Registered Shop
  const [savedSuccessShop, setSavedSuccessShop] = useState<ShopItem | null>(null);

  // 1-Click Sample Presets
  const handleUseSample = (type: 'hardware' | 'cement' | 'rental') => {
    setSelectedCountry('IN');
    setSelectedState('TN');
    if (type === 'hardware') {
      setShopName('ஸ்ரீ அம்மன் ஹார்டுவேர் & எலக்ட்ரிக்கல்ஸ்');
      setOwnerName('கே. ராஜேந்திரன்');
      setPhone('9841234567');
      setWhatsapp('9841234567');
      setCategory('hardware');
      setSelectedDistrict('chennai');
      setSelectedCity('சென்னை (Chennai)');
      setAddress('45, ஜிஎஸ்டி மெயின் ரோடு, குரோம்பேட்டை');
      setLocality('பேருந்து நிலையம் அருகில்');
      setMaterials('அல்ட்ராடெக் சிமெண்ட், TMT கம்பிகள், PVC பைப், பெயிண்ட், பவர் டூல்ஸ், கட்டுக்கம்பி');
      setDelivery(true);
      setFormError('');
    } else if (type === 'cement') {
      setShopName('கே.பி.ஆர் சிமெண்ட் & மணல் சப்ளையர்ஸ்');
      setOwnerName('பி. ராமசாமி');
      setPhone('9842155667');
      setWhatsapp('9842155667');
      setCategory('cement_building');
      setSelectedDistrict('madurai');
      setSelectedCity('மதுரை (Madurai)');
      setAddress('12/A, பைபாஸ் சாலை');
      setLocality('தொழிற்பேட்டை');
      setMaterials('அல்ட்ராடெக் சிமெண்ட், எம்-சாண்ட், பி-சாண்ட், செங்கல், TMT கம்பி 12mm, ஜல்லி');
      setDelivery(true);
      setFormError('');
    } else {
      setShopName('பாரதி கன்ஸ்ட்ரக்ஷன் டூல்ஸ் வாடகை நிறுவனம்');
      setOwnerName('எஸ். சண்முகம்');
      setPhone('9443211223');
      setWhatsapp('9443211223');
      setCategory('tools_rental');
      setSelectedDistrict('coimbatore');
      setSelectedCity('கோயம்புத்தூர் (Coimbatore)');
      setAddress('78, ரிங் ரோடு');
      setLocality('லாரி ஷெட் எதிரில்');
      setMaterials('கான்கிரீட் மிக்சர், அதிர்வு இயந்திரம் (Vibrator), சாரப்பலகை இரும்பு பைப், வெல்டிங் மெஷின், கட்டிங் மெஷின்');
      setDelivery(true);
      setFormError('');
    }
  };

  const handleResetForm = () => {
    setShopName('');
    setOwnerName('');
    setPhone('');
    setWhatsapp('');
    setCategory('hardware');
    setAddress('');
    setLocality('');
    setSelectedCountry(userLoc.countryCode || 'IN');
    setSelectedState('TN');
    setCustomState('');
    setSelectedDistrict('chennai');
    setCustomDistrict('');
    setSelectedCity('சென்னை (Chennai)');
    setCustomCity('');
    setMaterials('');
    setDelivery(true);
    setFormError('');
    setSavedSuccessShop(null);
  };

  const handleExtractFromRaw = () => {
    const parsed = extractShopDetailsFromRawInput(rawStoreText);
    if (parsed.name) setShopName(parsed.nameTa || parsed.name);
    if (parsed.phone) setPhone(parsed.phone);
    if (parsed.whatsapp) setWhatsapp(parsed.whatsapp || parsed.phone);
    if (parsed.address) setAddress(parsed.address);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.materialsListTa && parsed.materialsListTa.length > 0) {
      setMaterials(parsed.materialsListTa.join(', '));
    } else if (parsed.materialsList && parsed.materialsList.length > 0) {
      setMaterials(parsed.materialsList.join(', '));
    }
    if (parsed.deliveryAvailable !== undefined) setDelivery(parsed.deliveryAvailable);
    setRegMode('form');
  };

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = shopName.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!trimmedName) {
      setFormError(
        loc(
          'தயவுசெய்து கடையின் பெயரை உள்ளிடவும்',
          'Please enter the shop name',
          'कृपया दुकान का नाम दर्ज करें',
          'దయచేసి దుకాణం పేరును నమోదు చేయండి',
          'ദയവായി ഷോപ്പ് പേര് നൽകുക',
          'ದಯವಿಟ್ಟು ಅಂಗಡಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ'
        )
      );
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError(
        loc(
          'தயவுசெய்து சரியான தொடர்பு கைபேசி எண்ணை உள்ளிடவும் (10 இலக்கங்கள்)',
          'Please enter valid contact phone number (10 digits)',
          'कृपया वैध 10 अंकों का फोन नंबर दर्ज करें',
          'దయచేసి సరైన 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి',
          'ദയവായി സാധുവായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯ 10 ಅಂಕಿಗಳ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'
        )
      );
      return;
    }

    setFormError('');

    const categoryLabels: Record<string, { en: string; ta: string }> = {
      hardware: { en: 'Hardware & Tools', ta: 'ஹார்டுவேர் & டூல்ஸ்' },
      cement_building: { en: 'Cement & Building Materials', ta: 'சிமெண்ட் & கட்டுமான பொருட்கள்' },
      electrical_plumbing: { en: 'Electrical & Plumbing', ta: 'எலக்ட்ரிக்கல் & பிளம்பிங்' },
      paint: { en: 'Paint & Surface Coatings', ta: 'பெயிண்ட் & வார்னிஷ்' },
      tools_rental: { en: 'Tools & Machinery Rental', ta: 'இயந்திர வாடகை' },
      timber_carpentry: { en: 'Timber & Carpentry', ta: 'மரவேலை & பலகைகள்' },
      general: { en: 'General Building Mart', ta: 'பொது கட்டுமான பொருட்கள்' },
    };

    const catInfo = categoryLabels[category] || { en: 'Hardware Mart', ta: 'ஹார்டுவேர்' };

    const materialsArray = materials.trim()
      ? materials.split(',').map((s) => s.trim()).filter(Boolean)
      : ['General Building Materials', 'Tools'];

    // Resolve location names
    const resolvedState =
      selectedState === 'OTHER_STATE'
        ? customState || 'Other State'
        : availableStates.find((s) => s.id === selectedState)?.nameTa || selectedState;
    const resolvedStateEn =
      selectedState === 'OTHER_STATE'
        ? customState || 'Other State'
        : availableStates.find((s) => s.id === selectedState)?.nameEn || selectedState;

    const resolvedDistrict =
      selectedDistrict === 'OTHER_DISTRICT'
        ? customDistrict || 'Other District'
        : availableDistricts.find((d) => d.id === selectedDistrict)?.nameTa || selectedDistrict;
    const resolvedDistrictEn =
      selectedDistrict === 'OTHER_DISTRICT'
        ? customDistrict || 'Other District'
        : availableDistricts.find((d) => d.id === selectedDistrict)?.nameEn || selectedDistrict;

    const resolvedCity =
      selectedCity === 'OTHER_CITY'
        ? customCity || resolvedDistrict
        : selectedCity;

    const finalAddress = address.trim()
      ? locality.trim()
        ? `${address.trim()}, ${locality.trim()}`
        : address.trim()
      : `${resolvedCity}, ${resolvedDistrict}`;

    const newShop: ShopItem = {
      id: `shop-${Date.now()}`,
      name: trimmedName,
      nameTa: trimmedName,
      category: category,
      categoryLabelEn: catInfo.en,
      categoryLabelTa: catInfo.ta,
      address: finalAddress,
      city: resolvedCity,
      cityTa: resolvedCity,
      district: resolvedDistrictEn,
      districtTa: resolvedDistrict,
      stateEn: resolvedStateEn,
      stateTa: resolvedState,
      countryCode: selectedCountry,
      postingLanguage: postingLanguage,
      latitude: geoCoords.lat,
      longitude: geoCoords.lng,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      materialsList: materialsArray,
      materialsListTa: materialsArray,
      deliveryAvailable: delivery,
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      isVerified: true,
    };

    saveShopItem(newShop);
    setSavedSuccessShop(newShop);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Navigation Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 rounded-3xl shadow-md border border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-95 transition-all"
            title={loc('முகப்புக்குச் செல்ல', 'Back to Home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {loc('வணிகர் பதிவு', 'Merchant Portal')}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white mt-0.5">
              {loc(
                'கடைகள் & வணிக நிறுவனங்கள் பதிவு செய்து சேமித்தல்',
                'Shop & Business Registration Portal',
                'दुकान और व्यवसाय पंजीकरण और बचत',
                'దుకాణం & వ్యాపార నమోదు & సేవ్',
                'ഷോപ്പും ബിസിനസ്സും രജിസ്റ്റർ ചെയ്യുക',
                'ಅಂಗಡಿ ಮತ್ತು ವ್ಯಾಪಾರ ನೋಂದಣಿ ಮತ್ತು ಉಳಿಸಿ'
              )}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{loc('முகப்பு', 'Home')}</span>
        </button>
      </div>

      {/* Success View when Shop is Saved */}
      {savedSuccessShop ? (
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-black text-emerald-950 text-base">
                {loc('கடை விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது!', 'Shop Registered & Saved Successfully!')}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                {loc(
                  'உங்கள் கடை இப்போது Daily Work செயலியில் ஆயிரக்கணக்கான தொழிலாளர்கள் மற்றும் வாடிக்கையாளர்களுக்கு காட்டப்படும்.',
                  'Your store is now registered and discoverable by local workers and contractors.'
                )}
              </p>
            </div>
          </div>

          {/* Registered Shop Card Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {savedSuccessShop.categoryLabelTa}
                </span>
                <h4 className="text-base font-black text-slate-900 mt-1">
                  {savedSuccessShop.name}
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{savedSuccessShop.address}</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full shrink-0 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('சரிபார்க்கப்பட்டது', 'Verified')}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {savedSuccessShop.materialsListTa.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white text-slate-800 rounded-lg text-xs border border-slate-200 font-medium"
                >
                  • {item}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${savedSuccessShop.phone}`}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{savedSuccessShop.phone}</span>
                </a>
                <a
                  href={`https://wa.me/91${savedSuccessShop.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
              {savedSuccessShop.deliveryAvailable && (
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{loc('டெலிவரி உண்டு', 'Site Delivery')}</span>
                </span>
              )}
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>{loc('+ மற்றொரு கடையை பதிவு செய்ய', '+ Register Another Shop')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('shops')}
              className="py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Store className="w-4 h-4 text-amber-300" />
              <span>{loc('அனைத்து கடைகள் பட்டியலைப் பார்க்க', 'View All Shops Directory')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Registration Form */
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-700" />
              <span>
                {loc(
                  'கடை & வணிக விவரங்களை உள்ளிடவும்',
                  'Enter Store & Business Details',
                  'दुकान और व्यवसाय का विवरण दर्ज करें',
                  'దుకాణం మరియు వ్యాపార వివరాలను నమోదు చేయండి',
                  'ഷോപ്പും ബിസിനസ്സ് വിവരങ്ങളും നൽകുക',
                  'ಅಂಗಡಿ ಮತ್ತು ವ್ಯಾಪಾರ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ'
                )}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {loc(
                'சிமெண்ட், ஹார்டுவேர், எலக்ட்ரிக்கல், பிளம்பிங் மற்றும் இயந்திர வாடகை கடைகள் தங்கள் வணிக தகவல்களை இங்கே எளிதாக பதிவு செய்து சேமிக்கலாம்.',
                'Easily register your hardware, cement, electrical, plumbing, or tools rental shop to make it instantly visible to workers and clients.',
                'हार्डवेयर, सीमेंट, इलेक्ट्रिकल और टूल्स किराये की दुकानों का विवरण आसानी से सहेजें।'
              )}
            </p>
          </div>

          {/* Quick Presets (1-Click Fill) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{loc('விரைவு மாதிரி தேர்வுகள் (1-கிளிக் சோதனை):', 'Quick Sample Presets (1-Click Test):')}</span>
              </span>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {loc('படிவத்தை அழி', 'Reset')}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleUseSample('hardware')}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                🔧 {loc('மாதிரி 1: ஹார்டுவேர் கடை', 'Sample 1: Hardware')}
              </button>
              <button
                type="button"
                onClick={() => handleUseSample('cement')}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                🧱 {loc('மாதிரி 2: சிமெண்ட் & மணல்', 'Sample 2: Cement & Sand')}
              </button>
              <button
                type="button"
                onClick={() => handleUseSample('rental')}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                🏗️ {loc('மாதிரி 3: இயந்திர வாடகை', 'Sample 3: Machinery Rental')}
              </button>
            </div>
          </div>

          {/* Mode Switch: Direct Form vs AI Smart Paste */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setRegMode('form')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                regMode === 'form' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 {loc('நேரடி படிவம் (Direct Form)', 'Direct Form')}
            </button>
            <button
              type="button"
              onClick={() => setRegMode('ai_paste')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                regMode === 'ai_paste' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ {loc('AI விசிட்டிங் கார்டு உரை', 'AI Visiting Card Text')}
            </button>
          </div>

          {/* AI Smart Paste Area */}
          {regMode === 'ai_paste' && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-800">
                {loc('விசிட்டிங் கார்டு அல்லது பில் விவரங்களை கீழே ஒட்டவும் (Paste Card / Bill Details)', 'Raw Store Text / Visiting Card')}
              </label>
              <textarea
                rows={3}
                value={rawStoreText}
                onChange={(e) => setRawStoreText(e.target.value)}
                placeholder="எ.கா: முருகன் ஹார்டுவேர், மெயின் ரோடு, மதுரை. சிமெண்ட், கம்பி, பைப். போன்: 9842100000"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none text-slate-900"
              />
              <button
                type="button"
                onClick={handleExtractFromRaw}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Cpu className="w-4 h-4 text-amber-300" />
                <span>{loc('AI மூலம் பிரித்தெடுத்து படிவத்தில் நிரப்பவும்', 'Extract & Fill Form with AI')}</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <span>⚠️ {formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveShop} className="space-y-4">
            {/* 1. Language Selection Bar for posting store */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>{loc('பதிவு செய்யும் மொழி', 'Posting Language', 'पंजीकरण भाषा', 'నమోదు భాష', 'രജിസ്ട്രേഷൻ ഭാഷ', 'ನೋಂದಣಿ ಭಾಷೆ')}</span>
                <span className="text-[10px] font-normal text-slate-500 ml-auto">
                  {loc('தேர்ந்தெடுக்கப்பட்ட மொழி', 'Selected Language')}: <strong className="text-emerald-800">{SUPPORTED_LANGUAGES.find(l => l.code === postingLanguage)?.nativeName}</strong>
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setPostingLanguage(lang.code)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      postingLanguage === lang.code
                        ? 'bg-emerald-700 text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {loc('கடையின் பெயர் / வணிக நிறுவனம் (Shop Name)', 'Shop Name')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder={loc('எ.கா: ஸ்ரீ அம்மன் ஹார்டுவேர் & சிமெண்ட் மார்ட்', 'e.g., Sri Amman Hardware & Cement Mart')}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Owner Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('உரிமையாளர் பெயர் / நபர் (Owner / Contact Person)', 'Owner Name')}
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="எ.கா: கே. ராஜேந்திரன்"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('வணிகப் பிரிவு (Business Category)', 'Business Category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShopItem['category'])}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900"
                >
                  <option value="hardware">🔧 {loc('ஹார்டுவேர் & டூல்ஸ்', 'Hardware & Tools')}</option>
                  <option value="cement_building">🧱 {loc('சிமெண்ட் & மணல் / செங்கல்', 'Cement & Sand / Bricks')}</option>
                  <option value="electrical_plumbing">💡 {loc('எலக்ட்ரிக்கல் & பிளம்பிங்', 'Electrical & Plumbing')}</option>
                  <option value="paint">🎨 {loc('பெயிண்ட் & வார்னிஷ்', 'Paints & Wall Coatings')}</option>
                  <option value="tools_rental">🏗️ {loc('இயந்திர வாடகை (Mixer/Scaffolding)', 'Machinery Rental')}</option>
                  <option value="timber_carpentry">🪵 {loc('மரவேலை & பலகைகள்', 'Timber & Carpentry')}</option>
                  <option value="general">🏢 {loc('பொது கட்டுமானப் பொருட்கள்', 'General Building Supplies')}</option>
                </select>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('தொடர்பு கைபேசி எண் (Phone Number)', 'Contact Phone')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="10 இலக்க எண் (எ.கா: 9841234567)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('வாட்ஸ்அப் எண் (WhatsApp Number)', 'WhatsApp Number')}
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-green-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder={phone ? `${phone} (அல்லது தனி எண்)` : 'வாட்ஸ்அப் எண்'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cascading Location Selection: Country -> State -> District -> City + GPS */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>
                    {loc(
                      'கடையின் இருப்பிடம் (நாடு, மாநிலம், மாவட்டம், நகரம்)',
                      'Shop Location (Country, State, District, City)',
                      'दुकान का स्थान (देश, राज्य, ज़िला, शहर)',
                      'దుకాణం స్థానం (దేశం, రాష్ట్రం, జిల్లా, నగరం)',
                      'ഷോപ്പ് സ്ഥലം (രാജ്യം, സംസ്ഥാനം, ജില്ല, നഗരം)',
                      'ಅಂಗಡಿ ಸ್ಥಳ (ದೇಶ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ, ನಗರ)'
                    )}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                >
                  {isLocating ? (
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                  ) : (
                    <Crosshair className="w-3 h-3 text-emerald-700" />
                  )}
                  <span>{isLocating ? loc('கண்டுபிடிக்கிறது...', 'Detecting...') : loc('GPS இடம்', 'GPS Detect')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Country Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('நாடு', 'Country', 'देश', 'దేశం', 'രാജ്യം', 'ದೇಶ')}
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                  >
                    {COUNTRIES_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {language === 'ta' ? c.nameTa : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('மாநிலம்', 'State', 'राज्य', 'రాష్ట్రం', 'സംസ്ഥാനം', 'ರಾಜ್ಯ')}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                  >
                    {availableStates.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'ta' ? s.nameTa : s.nameEn}
                      </option>
                    ))}
                    <option value="OTHER_STATE">
                      {loc('மற்ற மாநிலம்', 'Other State', 'अन्य राज्य', 'ఇతర రాష్ట్రం', 'മറ്റ് സംസ്ഥാനം', 'ಇತರ ರಾಜ್ಯ')}
                    </option>
                  </select>
                </div>
              </div>

              {selectedState === 'OTHER_STATE' && (
                <div>
                  <input
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    placeholder={loc('உங்கள் மாநிலத்தின் பெயரை உள்ளிடவும்', 'Enter your state name')}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* District Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('மாவட்டம்', 'District', 'ज़िला', 'జిల్లా', 'ജില്ല', 'ಜಿಲ್ಲೆ')}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === 'ta' ? d.nameTa : d.nameEn}
                      </option>
                    ))}
                    <option value="OTHER_DISTRICT">
                      {loc('மற்ற மாவட்டம்', 'Other District', 'अन्य ज़िला', 'ఇతర జిల్లా', 'മറ്റ് ജില്ല', 'ಇತರ ಜಿಲ್ಲೆ')}
                    </option>
                  </select>
                </div>

                {/* City Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('நகரம் / ஊர்', 'City / Town', 'शहर / कस्बा', 'నగరం / పట్టణం', 'നഗരം / പട്ടണം', 'ನಗರ / ಪಟ್ಟಣ')}
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER_CITY">
                      {loc('மற்ற நகரம் / புதிய ஊர்', 'Other City / Town', 'अन्य शहर', 'ఇతర నగరం', 'മറ്റ് നഗരം', 'ಇತರ ನಗರ')}
                    </option>
                  </select>
                </div>
              </div>

              {(selectedDistrict === 'OTHER_DISTRICT' || selectedCity === 'OTHER_CITY') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedDistrict === 'OTHER_DISTRICT' && (
                    <input
                      type="text"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      placeholder={loc('மாவட்ட பெயரை உள்ளிடவும்', 'Enter District Name')}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  )}
                  {selectedCity === 'OTHER_CITY' && (
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder={loc('நகரத்தின் பெயரை உள்ளிடவும்', 'Enter City Name')}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  )}
                </div>
              )}

              {/* Address / Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('தெரு / கடை எண் / சாலை முகவரி', 'Shop No & Street Address')}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={loc('எ.கா: 45, ஜிஎஸ்டி மெயின் ரோடு', 'e.g. 45, GST Main Road')}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {loc('அருகிலுள்ள முக்கிய அடையாளம் / பகுதி', 'Landmark / Locality / Area')}
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder={loc('எ.கா: பழைய பேருந்து நிலையம் எதிரில்', 'e.g. Opposite Old Bus Stand')}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Materials / Services */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {loc('விற்பனை செய்யும் பொருட்கள் / சேவைகள் (Materials & Services - காற்புள்ளியிட்டு பிரிக்கவும்)', 'Materials Sold & Services (comma-separated)')}
              </label>
              <div className="relative">
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="எ.கா: சிமெண்ட், TMT கம்பி, மணல், PVC பைப், பெயிண்ட், மிக்சர் வாடகை"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Site Delivery Available Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {loc('கட்டுமான தளத்திற்கு டெலிவரி வசதி (Site Delivery Available)', 'Site Delivery Available')}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {loc('பொருட்கள் வாடிக்கையாளரின் தளத்திற்கே அனுப்பப்படும்', 'Materials will be delivered to site')}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={delivery}
                onChange={(e) => setDelivery(e.target.checked)}
                className="w-5 h-5 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* PRIMARY SAVE BUTTON */}
            <button
              type="submit"
              id="btn-register-save-shop-screen"
              className="w-full py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
              <span>
                {loc(
                  'கடைகள் / வணிக நிறுவனங்கள் பதிவு செய்து சேமிக்கவும்',
                  'Register & Save Shop / Business Establishment',
                  'दुकान और व्यवसाय पंजीकरण सहेजें',
                  'దుకాణం నమోదును సేవ్ చేయండి',
                  'ഷോപ്പ് രജിസ്ട്രേഷൻ സേവ് ചെയ്യുക',
                  'ಅಂಗಡಿ ನೋಂದಣಿಯನ್ನು ಉಳಿಸಿ'
                )}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
