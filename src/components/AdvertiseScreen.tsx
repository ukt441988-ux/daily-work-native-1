import React, { useState, useEffect } from 'react';
import {
  Advertisement,
  PaymentTransaction,
  OwnerPaymentConfig,
  AdPricingPlan,
  Language,
} from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import {
  COUNTRIES_LIST,
  findNearestLocation,
  POPULAR_LOCATIONS,
  getSavedUserLocation,
} from '../data/locations';
import {
  getStatesForCountry,
  getDistrictsForState,
  getCitiesForDistrict,
} from '../data/allLocationsData';
import {
  PRICING_CONFIG,
  DEFAULT_OWNER_PAYMENT_CONFIG,
  AD_SCOPE_PRICING_TIERS,
  AdTargetScope,
  AdScopePricingTier,
  getSavedScopePricingTiers,
  getPlanPriceForMedia,
} from '../data/monetizationData';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { PaymentModal } from './PaymentModal';
import { AdBannerCarousel } from './AdBannerCarousel';
import { AdMediaUploader, AdMediaValue } from './AdMediaUploader';
import { OwnerAdPricingModal } from './OwnerAdPricingModal';
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  Store,
  Phone,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  BadgePercent,
  ExternalLink,
  Trash2,
  QrCode,
  Building2,
  Copy,
  Check,
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Repeat,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  Film,
  Globe,
  Map,
  Building,
  IndianRupee,
  Crosshair,
  Loader2,
} from 'lucide-react';

interface AdvertiseScreenProps {
  ads?: Advertisement[];
  onAddAd?: (newAd: Advertisement, tx: PaymentTransaction) => void;
  onAddAdvertisement?: (newAd: any, tx: PaymentTransaction) => void;
  onRenewAd?: (adId: string, days: number, tx?: PaymentTransaction) => void;
  onDeleteAd?: (adId: string) => void;
  ownerPaymentConfig?: OwnerPaymentConfig;
  adPricingPlans?: AdPricingPlan[];
  onNavigateToHome?: () => void;
}

export const AdvertiseScreen: React.FC<AdvertiseScreenProps> = ({
  ads = [],
  onAddAd,
  onAddAdvertisement,
  onRenewAd,
  onDeleteAd,
  ownerPaymentConfig = DEFAULT_OWNER_PAYMENT_CONFIG,
  adPricingPlans,
}) => {
  const { language, loc } = useLanguage();
  const userLoc = getSavedUserLocation();

  // Posting Language State (User chosen language for advertisement)
  const [postingLanguage, setPostingLanguage] = useState<Language>(language);

  useEffect(() => {
    setPostingLanguage(language);
  }, [language]);

  // Target Visibility Scope (Country, State, District, City) - Tiered Pricing
  const [targetScope, setTargetScope] = useState<AdTargetScope>('district');

  // Cascading Location States (matching PostJobScreen)
  const [selectedCountry, setSelectedCountry] = useState(userLoc.countryCode || 'IN');
  const [selectedState, setSelectedState] = useState('TN');
  const [customState, setCustomState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('chennai');
  const [customDistrict, setCustomDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState(userLoc.city || 'சென்னை');
  const [customCity, setCustomCity] = useState('');
  const [locality, setLocality] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic available states, districts, and cities based on cascading selections
  const availableStates = getStatesForCountry(selectedCountry);
  const availableDistricts = selectedState !== 'OTHER_STATE' ? getDistrictsForState(selectedCountry, selectedState) : [];
  const availableCities = selectedDistrict !== 'OTHER_DISTRICT' ? getCitiesForDistrict(selectedCountry, selectedState, selectedDistrict) : [];

  // Cascading location change handlers
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

  // GPS Auto-Detection Handler
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

  // Scope-based Dynamic Pricing Packages managed by Owner
  const [scopePricingTiers, setScopePricingTiers] = useState<Record<AdTargetScope, AdScopePricingTier>>(getSavedScopePricingTiers);
  const [isOwnerPricingModalOpen, setIsOwnerPricingModalOpen] = useState(false);

  useEffect(() => {
    const handlePricingUpdated = () => {
      setScopePricingTiers(getSavedScopePricingTiers());
    };
    window.addEventListener('dailywork_scope_pricing_updated', handlePricingUpdated);
    return () => window.removeEventListener('dailywork_scope_pricing_updated', handlePricingUpdated);
  }, []);

  const activeTier = scopePricingTiers[targetScope] || AD_SCOPE_PRICING_TIERS[targetScope] || AD_SCOPE_PRICING_TIERS.district;
  const plans = activeTier.plans;

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [headlineEn, setHeadlineEn] = useState('');
  const [headlineTa, setHeadlineTa] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionTa, setDescriptionTa] = useState('');
  const [targetCategory, setTargetCategory] = useState('all');
  const [actionTextEn, setActionTextEn] = useState('Call Shop');
  const [actionTextTa, setActionTextTa] = useState('கடையை அழைக்க');
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [mediaValue, setMediaValue] = useState<AdMediaValue>({
    mediaType: 'none',
    mediaUrl: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showHowToRemoveHelp, setShowHowToRemoveHelp] = useState(false);
  const [submittedSuccessAd, setSubmittedSuccessAd] = useState<{ ad: Advertisement; tx: PaymentTransaction } | null>(null);

  // Safe selected plan with boundary check
  const selectedPlanBase = plans[selectedPlanIdx] || plans[0] || {
    id: 'plan-default',
    days: 7,
    price: 499,
    labelEn: 'Standard Banner',
    labelTa: 'பட்டியல் விளம்பரம்',
  };
  const effectiveCost = getPlanPriceForMedia(selectedPlanBase, mediaValue.mediaType, mediaValue.videoDurationTier);
  const selectedPlan = { ...selectedPlanBase, price: effectiveCost };

  // Ad Expiry and Renewal State
  const [renewingAd, setRenewingAd] = useState<Advertisement | null>(null);
  const [renewalDays, setRenewalDays] = useState<number>(7);
  const [isRenewalCheckoutOpen, setIsRenewalCheckoutOpen] = useState(false);

  const getAdExpiryTime = (ad: Advertisement): number => {
    if (ad.expiresAt) {
      const t = new Date(ad.expiresAt).getTime();
      if (!isNaN(t)) return t;
    }
    const baseTime = ad.approvedAt ? new Date(ad.approvedAt).getTime() : new Date(ad.submittedAt).getTime();
    const days = ad.days || 7;
    return baseTime + days * 24 * 60 * 60 * 1000;
  };

  const getAdExpiryStatus = (ad: Advertisement) => {
    const expiry = getAdExpiryTime(ad);
    const now = Date.now();
    const isExpired = now >= expiry;
    const hoursLeft = Math.max(0, Math.round((expiry - now) / (1000 * 60 * 60)));
    const daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
    const isExpiringSoon = !isExpired && hoursLeft <= 24;
    return { expiry, isExpired, isExpiringSoon, hoursLeft, daysLeft };
  };

  const calculateRenewalPrice = (ad: Advertisement | null, days: number) => {
    if (!ad) return 399;
    const matchedPlan = plans.find((p) => p.days === days) || plans[0];
    return getPlanPriceForMedia(matchedPlan, ad.mediaType || 'none', ad.videoDurationTier);
  };

  const handleOpenRenewal = (ad: Advertisement) => {
    setRenewingAd(ad);
    setRenewalDays(ad.days || 7);
  };

  const handleRenewalPaymentSuccess = (tx: PaymentTransaction) => {
    if (!renewingAd) return;
    if (onRenewAd) {
      onRenewAd(renewingAd.id, renewalDays, tx);
    }
    setIsRenewalCheckoutOpen(false);
    setRenewingAd(null);
  };

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !contactPerson.trim()) {
      setError(
        loc(
          'தயவுசெய்து வணிகப் பெயர் மற்றும் தொடர்பாளர் பெயரை உள்ளிடவும்.',
          'Please enter business name and contact person.',
          'कृपया व्यवसाय का नाम और संपर्क व्यक्ति का नाम दर्ज करें।',
          'దయచేసి వ్యాపార పేరు మరియు సంప్రదింపు వ్యక్తి పేరును నమోదు చేయండి.',
          'ദയവായി ബിസിനസ്സ് പേരും ബന്ധപ്പെടേണ്ട വ്യക്തിയുടെ പേരും നൽകുക.',
          'ದಯವಿಟ್ಟು ವ್ಯಾಪಾರದ ಹೆಸರು ಮತ್ತು ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(
        loc(
          'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
          'Please enter valid 10-digit mobile number.',
          'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
          'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.',
          'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    if (!headlineEn.trim() && !headlineTa.trim()) {
      setError(
        loc(
          'விளம்பர தலைப்பை உள்ளிடவும்.',
          'Please enter an advertisement headline.',
          'कृपया विज्ञापन शीर्षक दर्ज करें।',
          'దయచేసి ప్రకటన శీర్షికను నమోదు చేయండి.',
          'പരസ്യ തലക്കെട്ട് നൽകുക.',
          'ದಯವಿಟ್ಟು ಜಾಹೀರಾತು ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    const finalHeadlineEn = headlineEn.trim() || headlineTa.trim();
    const finalHeadlineTa = headlineTa.trim() || headlineEn.trim();
    const finalDescEn = descriptionEn.trim() || descriptionTa.trim();
    const finalDescTa = descriptionTa.trim() || descriptionEn.trim();

    const finalCity = selectedCity === 'OTHER_CITY' ? (customCity.trim() || 'Tamil Nadu') : (selectedCity || 'Tamil Nadu');
    const finalDistrict = selectedDistrict === 'OTHER_DISTRICT' ? (customDistrict.trim() || 'chennai') : selectedDistrict;
    const finalState = selectedState === 'OTHER_STATE' ? (customState.trim() || 'Tamil Nadu') : selectedState;

    const newAd: Advertisement = {
      id: `ad-${Date.now()}`,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.replace(/[^0-9]/g, ''),
      headlineEn: finalHeadlineEn,
      headlineTa: finalHeadlineTa,
      descriptionEn: finalDescEn,
      descriptionTa: finalDescTa,
      targetCategory,
      location: finalCity,
      actionTextEn: actionTextEn.trim() || 'Call Now',
      actionTextTa: actionTextTa.trim() || 'அழைக்க',
      bannerType: 'feed',
      mediaType: mediaValue.mediaType !== 'none' ? mediaValue.mediaType : undefined,
      mediaUrl: mediaValue.mediaUrl || undefined,
      mediaFileName: mediaValue.mediaFileName || undefined,
      mediaFileSizeMb: mediaValue.fileSizeBytes ? parseFloat((mediaValue.fileSizeBytes / (1024 * 1024)).toFixed(1)) : undefined,
      videoDurationSeconds: mediaValue.videoDurationSeconds,
      videoDurationTier: mediaValue.videoDurationTier,
      days: selectedPlanBase.days,
      cost: effectiveCost,
      status: 'pending', // Awaiting Admin Approval
      paymentStatus: 'successful',
      submittedAt: new Date().toISOString(),
      targetScope: targetScope,
      country: selectedCountry,
      state: finalState,
      district: finalDistrict,
      city: finalCity,
      postingLanguage: postingLanguage,
    };

    if (onAddAd) {
      onAddAd(newAd, tx);
    } else if (onAddAdvertisement) {
      onAddAdvertisement(newAd, tx);
    }
    setIsCheckoutOpen(false);
    setSubmittedSuccessAd({ ad: newAd, tx });

    // Reset Form
    setBusinessName('');
    setContactPerson('');
    setPhone('');
    setHeadlineEn('');
    setHeadlineTa('');
    setDescriptionEn('');
    setDescriptionTa('');
    setMediaValue({ mediaType: 'none', mediaUrl: '' });
  };

  const copyUpi = () => {
    navigator.clipboard?.writeText(ownerPaymentConfig.ownerUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
            <Megaphone className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              <span>உள்ளூர் வணிக விளம்பரம் / Local Ads</span>
            </span>
            <h2 className="text-lg font-bold leading-tight">
              {loc(
                'எங்களுடன் விளம்பரம் செய்யுங்கள்',
                'Advertise With Us',
                'हमारे साथ विज्ञापन करें',
                'మాతో ప్రకటన చేయండి',
                'ഞങ്ങളോടൊപ്പം പരസ്യം ചെയ്യുക',
                'ನಮ್ಮೊಂದಿಗೆ ಜಾಹೀರಾತು ನೀಡಿ'
              )}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              {loc(
                'ஆயிரக்கணக்கான உள்ளூர் கட்டிட ஒப்பந்ததாரர்கள் மற்றும் தொழிலாளர்களை அடையுங்கள்.',
                'Reach thousands of daily workers, building owners & local contractors.',
                'हजारों दैनिक श्रमिकों, भवन मालिकों और स्थानीय ठेकेदारों तक पहुँचें।',
                'వేలాది మంది రోజువారీ కార్మికులు, భవన యజమానులు మరియు స్థానిక కాంట్రాక్టర్లను చేరుకోండి.',
                'ആയിരക്കണക്കിന് ദിവസവേതന തൊഴിലാളികൾ, കെട്ടിട ഉടമകൾ, കോൺട്രാക്ടർമാർ എന്നിവരിലേക്ക് എത്തിച്ചേരുക.',
                'ಸಾವಿರಾರು ದಿನಗೂಲಿ ಕಾರ್ಮಿಕರು, ಕಟ್ಟಡ ಮಾಲೀಕರು ಮತ್ತು ಗುತ್ತಿಗೆದಾರರನ್ನು ತಲುಪಿ.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Owner Direct Payment Info Box for Advertisement Customers */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {loc(
                  'உரிமையாளர் நேரடி கட்டண முறை',
                  'Owner Direct Payment Options',
                  'मालिक प्रत्यक्ष भुगतान विकल्प',
                  'యజమాని ప్రత్యక్ష చెల్లింపు ఎంపికలు',
                  'ഉടമയുടെ നേരിട്ടുള്ള പേയ്‌മെന്റ് ഓപ്ഷനുകൾ',
                  'ಮಾಲೀಕರ ನೇರ ಪಾವತಿ ಆಯ್ಕೆಗಳು'
                )}
              </span>
              <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                {ownerPaymentConfig.ownerName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`tel:${ownerPaymentConfig.ownerPhone}`}
              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] text-slate-700 font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-700" />
              <span>{loc('அழைக்க', 'Call', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}</span>
            </a>
            <a
              href={`https://wa.me/91${(ownerPaymentConfig?.ownerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                'வணக்கம், எனது கடைக்கு Daily Work செயலியில் விளம்பரம் செய்ய விரும்புகிறேன்.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">
          {loc(
            'விளம்பர கட்டணத்தை நீங்கள் உரிமையாளரின் UPI QR கோடு, Google Pay, PhonePe அல்லது வங்கி கணக்கு மூலம் நேரடியாக செலுத்தலாம். அல்லது ரொக்கமாகவும் வழங்கலாம்.',
            'You can pay the ad fee directly to the owner via UPI QR, GPay, PhonePe, Bank Transfer, or Cash.',
            'आप विज्ञापन शुल्क का भुगतान सीधे UPI QR, Google Pay, PhonePe या बैंक खाते के माध्यम से कर सकते हैं।',
            'మీరు ప్రకటన రుసుమును నేరుగా యజమాని యొక్క UPI QR, Google Pay, PhonePe లేదా బ్యాంక్ ఖాతా ద్వారా చెల్లించవచ్చు.',
            'പരസ്യ ഫീസ് ഉടമയുടെ UPI QR, Google Pay, PhonePe അല്ലെങ്കിൽ ബാങ്ക് അക്കൗണ്ട് വഴി നേരിട്ട് നൽകാം.',
            'ಜಾಹೀರಾತು ಶುಲ್ಕವನ್ನು ನೀವು ನೇರವಾಗಿ UPI QR, Google Pay, PhonePe ಅಥವಾ ಬ್ಯಾಂಕ್ ಖಾತೆಯ ಮೂಲಕ ಪಾವತಿಸಬಹುದು.'
          )}
        </p>

        {/* Quick Payment Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60 font-mono text-[11px]">
          <div className="bg-white p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[9px] text-slate-400 block font-sans">Owner UPI ID:</span>
              <span className="font-bold text-slate-900 truncate block">{ownerPaymentConfig.ownerUpiId}</span>
            </div>
            <button
              type="button"
              onClick={copyUpi}
              className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
              title="Copy UPI"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-white p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">Owner Bank & A/c:</span>
              <span className="font-bold text-slate-900 block font-sans text-[10px]">
                {ownerPaymentConfig.bankName} • {ownerPaymentConfig.accountNumber.slice(-4)}
              </span>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold font-sans">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Value Proposition Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-base font-black text-indigo-700">10,000+</p>
          <p className="text-[10px] text-slate-500">
            {loc('தினசரி பார்வைகள்', 'Daily Views', 'दैनिक दृश्य', 'రోజువారీ వీక్షణలు', 'പ്രതിദിന കാഴ്ചകൾ', 'ದೈನಂದಿನ ವೀಕ್ಷಣೆಗಳು')}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-base font-black text-emerald-700">100%</p>
          <p className="text-[10px] text-slate-500">
            {loc('உள்ளூர் வாடிக்கையாளர்கள்', 'Local Audience', 'स्थानीय दर्शक', 'స్థానిక ప్రేక్షకులు', 'പ്രാദേശിക പ്രേക്ഷകർ', 'ಸ್ಥಳೀಯ ಪ್ರೇಕ್ಷಕರು')}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-base font-black text-amber-600">₹499</p>
          <p className="text-[10px] text-slate-500">
            {loc('தொடக்க விலை', 'Starting From', 'शुरुआती कीमत', 'ప్రారంభ ధర', 'പ്രാരംഭ വില', 'ಪ್ರಾರಂಭಿಕ ಬೆಲೆ')}
          </p>
        </div>
      </div>

      {/* SHOWCASE OF MOVING ADVERTISEMENTS */}
      <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {loc(
                'நேரலை நகரும் விளம்பர பலகை',
                'Live Moving Ads Showcase',
                'लाइव विज्ञापन शोकेस',
                'ప్రత్యక్ష ప్రకటనల ప్రదర్శన',
                'തത്സമയ പരസ്യ പ്രദർശനം',
                'ಲೈವ್ ಜಾಹೀರಾತು ಪ್ರದರ್ಶನ'
              )}
            </span>
          </span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
            {loc('சுழலும் & நகரும்', 'Auto Slider & Ticker', 'ऑटो स्लाइडर', 'ఆటో స్లైడర్', 'ഓട്ടോ സ്ലൈഡർ', 'ಆಟೋ ಸ್ಲೈಡರ್')}
          </span>
        </div>
        <p className="text-[11px] text-slate-600">
          {loc(
            'உங்கள் விளம்பரம் முகப்பு திரை மற்றும் வேலை பட்டியலில் இப்படித்தான் தானாக சுழன்று பயனர்களை சென்றடையும்.',
            'Your advertisement will automatically rotate in the carousel and marquee ticker across all app screens.',
            'आपका विज्ञापन ऐप की स्क्रीन पर कैरोसेल और टिकर में अपने आप घूमेगा।',
            'మీ ప్రకటన యాప్ స్క్రీన్‌లలో రంగులరాట్నం మరియు టిక్కర్‌లో స్వయంచಾಲితంగా తిరుగుతుంది.',
            'നിങ്ങളുടെ പരസ്യം ആപ്പ് സ്ക്രീനുകളിൽ സ്വയമേവ കറങ്ങും.',
            'ನಿಮ್ಮ ಜಾಹೀರಾತು ಅಪ್ಲಿಕೇಶನ್ ಪರದೆಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತಿರುಗುತ್ತದೆ.'
          )}
        </p>

        <AdBannerCarousel
          ads={ads}
          defaultMode="ticker"
          showControls={true}
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Ad Submission Form */}
      <form onSubmit={handleOpenCheckout} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Store className="w-4 h-4 text-indigo-700" />
            <span>
              {loc(
                'புதிய விளம்பரம் பதிவு செய்க',
                'Create Advertisement',
                'नया विज्ञापन बनाएं',
                'కొత్త ప్రకటనను సృష్టించండి',
                'പുതിയ പരസ്യം സൃഷ്ടിക്കുക',
                'ಹೊಸ ಜಾಹೀರಾತು ರಚಿಸಿ'
              )}
            </span>
          </h3>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? loc('மறைக்க', 'Hide Preview', 'पूर्वावलोकन छिपाएं', 'ప్రివ్యూ దాచు', 'പ്രിവ്യൂ മറയ്ക്കുക', 'ಮುನ್ನೋಟ ಮರೆಮಾಡಿ') : loc('நேரலை மாதிரி', 'Live Preview', 'लाइव पूर्वावलोकन', 'లైవ్ ప్రివ్యూ', 'തത്സമയ പ്രിവ്യൂ', 'ಲೈವ್ ಮುನ್ನೋಟ')}</span>
          </button>
        </div>

        {/* 1. Language Selection Bar for posting ad */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{loc('விளம்பர மொழி', 'Ad Language', 'विज्ञापन की भाषा', 'ప్రకటన భాష', 'പരസ്യ ഭാഷ', 'ಜಾಹೀರಾತು ಭಾಷೆ')}</span>
            <span className="text-[10px] font-normal text-slate-500 ml-auto">
              {loc('தேர்ந்தெடுக்கப்பட்ட மொழி', 'Selected Language')}: <strong className="text-indigo-700">{SUPPORTED_LANGUAGES.find(l => l.code === postingLanguage)?.nativeName}</strong>
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
                    ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Ad Target Scope & Tiered Pricing Selection (USER REQUEST 3) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{loc('விளம்பரம் எந்தப் பகுதியில் தெரிய வேண்டும்? (கட்டணத் தேர்வு)', 'Where should ad appear? (Scope & Tiered Pricing)', 'विज्ञापन कहां दिखना चाहिए? (मूल्य निर्धारण)', 'ప్రకటన ఎక్కడ కనిపించాలి? (ధరల ఎంపిక)', 'പരസ്യം எവിടെ കാണിക്കണം? (വില ഓപ്ഷൻ)', 'ಜಾಹೀರಾತು ಎಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳಬೇಕು? (ಬೆಲೆ ಆಯ್ಕೆ)')}</span>
            </label>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsOwnerPricingModalOpen(true)}
                className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                title={loc('விளம்பரக் கட்டணங்களை மாற்றியமைக்க', 'Owner Ad Pricing Settings')}
              >
                <IndianRupee className="w-3 h-3 text-amber-700" />
                <span>{loc('நிர்வாக விலை நிர்ணயம்', 'Owner Pricing')}</span>
              </button>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {loc(activeTier.titleTa, activeTier.titleEn, activeTier.titleEn, activeTier.titleEn, activeTier.titleEn, activeTier.titleEn)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              {
                scope: 'country' as AdTargetScope,
                titleTa: 'நாடு முழுவதும்',
                titleEn: 'Pan-India',
                badgeTa: 'அதிகபட்ச பார்வை',
                badgeEn: 'Max Reach',
                startPrice: '₹999',
                icon: Globe,
                color: 'border-purple-300 bg-purple-50/70 text-purple-900',
                activeColor: 'border-purple-600 ring-2 ring-purple-500 bg-purple-100/90 shadow-sm',
              },
              {
                scope: 'state' as AdTargetScope,
                titleTa: 'மாநிலம் முழுவதும்',
                titleEn: 'Entire State',
                badgeTa: 'மாநில முன்னுரிமை',
                badgeEn: 'Statewide',
                startPrice: '₹699',
                icon: Map,
                color: 'border-blue-300 bg-blue-50/70 text-blue-900',
                activeColor: 'border-blue-600 ring-2 ring-blue-500 bg-blue-100/90 shadow-sm',
              },
              {
                scope: 'district' as AdTargetScope,
                titleTa: 'மாவட்டம் முழுவதும்',
                titleEn: 'Entire District',
                badgeTa: 'அதிக விருப்பம்',
                badgeEn: 'Popular',
                startPrice: '₹499',
                icon: Building,
                color: 'border-indigo-300 bg-indigo-50/70 text-indigo-900',
                activeColor: 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-100/90 shadow-sm',
              },
              {
                scope: 'city' as AdTargetScope,
                titleTa: 'நகரம் / உள்ளூர் பகுதி',
                titleEn: 'City / Local',
                badgeTa: 'குறைந்த கட்டணம்',
                badgeEn: 'Budget',
                startPrice: '₹249',
                icon: MapPin,
                color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900',
                activeColor: 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-100/90 shadow-sm',
              },
            ]).map((item) => {
              const IconComponent = item.icon;
              const isSelected = targetScope === item.scope;
              const dynamicStartPrice = scopePricingTiers[item.scope]?.plans?.[0]?.price !== undefined
                ? `₹${scopePricingTiers[item.scope].plans[0].price}`
                : item.startPrice;
              return (
                <button
                  key={item.scope}
                  type="button"
                  onClick={() => {
                    setTargetScope(item.scope);
                    setSelectedPlanIdx(0);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                    isSelected ? item.activeColor : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`} />
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {language === 'ta' ? item.badgeTa : item.badgeEn}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs leading-tight">
                      {loc(item.titleTa, item.titleEn, item.titleEn, item.titleEn, item.titleEn, item.titleEn)}
                    </h5>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-[10px] text-slate-500">{loc('தொடக்கம்', 'From')}:</span>
                      <span className="text-xs font-extrabold text-indigo-700">{dynamicStartPrice}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic bg-amber-50/80 p-2 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {loc(
                activeTier.descriptionTa,
                activeTier.descriptionEn,
                activeTier.descriptionEn,
                activeTier.descriptionEn,
                activeTier.descriptionEn,
                activeTier.descriptionEn
              )}
            </span>
          </p>
        </div>

        {/* 3. Cascading Location Selection (Country -> State -> District -> City) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>{loc('விளம்பர இருப்பிடம் (நாடு, மாநிலம், மாவட்டம், நகரம்)', 'Ad Location (Country, State, District, City)', 'स्थान (देश, राज्य, ज़िला, शहर)', 'స్థానం (దేశం, రాష్ట్రం, జిల్లా, నగరం)', 'സ്ഥലം (രാജ്യം, സംസ്ഥാനം, ജില്ല, നഗരം)', 'ಸ್ಥಳ (ದೇಶ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ, ನಗರ)')}</span>
            </label>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              ) : (
                <Crosshair className="w-3 h-3 text-indigo-600" />
              )}
              <span>{isLocating ? loc('கண்டுபிடிக்கிறது...', 'Detecting...') : loc('GPS இடம்', 'GPS Detect')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Country Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {loc('நாடு', 'Country', 'देश', 'దేశం', 'രാജ്യം', 'ದೇಶ')}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* District Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {loc('மாவட்டம்', 'District', 'ज़िला', 'జిల్లా', 'ജില്ല', 'ಜಿಲ್ಲೆ')}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
                <option value="OTHER_CITY">
                  {loc('மற்ற நகரம் / புதிய ஊர்', 'Other City / Town', 'अन्य शहर', 'ఇతర నగరం', 'മറ്റ് നഗരം', 'ಇತರ ನಗರ')}
                </option>
              </select>
            </div>
          </div>

          {(selectedDistrict === 'OTHER_DISTRICT' || selectedCity === 'OTHER_CITY') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedDistrict === 'OTHER_DISTRICT' && (
                <input
                  type="text"
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  placeholder={loc('மாவட்ட பெயரை உள்ளிடவும்', 'Enter District Name')}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              )}
              {selectedCity === 'OTHER_CITY' && (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder={loc('நகரத்தின் பெயரை உள்ளிடவும்', 'Enter City Name')}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              )}
            </div>
          )}

          <div>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder={loc('தெரு / பகுதி / அடையாள இடம் (ஆப்ஷன்)', 'Locality / Landmark / Street (Optional)', 'सड़क / इलाका (वैकल्पिक)', 'వీధి / ప్రాంతం (ఐచ్ఛికం)', 'സ്ട്രീറ്റ് / ഏരിയ (ഓപ്ഷണൽ)', 'ಬೀದಿ / ಪ್ರದೇಶ (ಐಚ್ಛಿಕ)')}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Live Card Preview if toggled */}
        {previewMode && (
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-indigo-800 font-bold uppercase tracking-wide">
              <span>{loc('வேலை பட்டியலில் தோற்றம்', 'Feed Preview', 'फ़ीड पूर्वावलोकन', 'ఫీడ్ ప్రివ్యూ', 'ഫീഡ് प्रിവ്യൂ', 'ಫೀಡ್ ಮುನ್ನೋಟ')}:</span>
              <div className="flex items-center gap-1.5">
                <span className="bg-indigo-700 text-white px-1.5 py-0.2 rounded font-black text-[9px]">
                  {targetScope === 'country' ? 'PAN-INDIA' : targetScope === 'state' ? 'STATEWIDE' : targetScope === 'district' ? 'DISTRICT' : 'LOCAL'}
                </span>
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black text-[9px]">SPONSORED</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-xs space-y-1">
              <h5 className="font-bold text-xs text-slate-900">
                {headlineTa || headlineEn || loc('உங்கள் கடை அல்லது வணிக விளம்பர தலைப்பு', 'Your Shop or Business Headline', 'आपके व्यवसाय का शीर्षक', 'మీ వ్యాపార ప్రకటన శీర్షిక', 'നിങ്ങളുടെ ബിസിനസ്സ് തലക്കെട്ട്', 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ಶೀರ್ಷಿಕೆ')}
              </h5>
              <p className="text-[11px] text-slate-600">
                {descriptionTa || descriptionEn || loc('சிமெண்ட், கம்பி, உபகரணங்கள் மற்றும் பிற பொருட்கள் சலுகை விலை.', 'Cement, steel, tools and materials at special offer price.', 'सीमेंट, स्टील, उपकरण और सामग्री विशेष रियायती दरों पर।', 'సిమెంట్, స్టీల్, పరికరాలు ప్రత్యేక ఆఫర్ ధరకు లభిస్తాయి.', 'സിമന്റ്, സ്റ്റീൽ, ഉപകരണങ്ങൾ എന്നിവ പ്രത്യേക ഓഫർ നിരക്കിൽ ലഭ്യമാണ്.', 'ಸಿಮೆಂಟ್, ಉಕ್ಕು, ಉಪಕರಣಗಳು ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ಲಭ್ಯವಿದೆ.')}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="font-semibold text-slate-700">
                  {businessName || loc('வணிகப் பெயர்', 'Business Name', 'व्यापार का नाम', 'వ్యాపార పేరు', 'ബിസിനസ്സ് പേര്', 'ವ್ಯಾಪಾರ ಹೆಸರು')} ({selectedCity || selectedDistrict})
                </span>
                <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                  {actionTextTa || loc('அழைக்க', 'Call Shop', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Business & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('வணிகம் / கடையின் பெயர்', 'Business / Shop Name', 'व्यापार / दुकान का नाम', 'వ్యాపారం / దుకాణం పేరు', 'ബിസിനസ്സ് / കടയുടെ പേര്', 'ವ್ಯಾಪಾರ / ಅಂಗಡಿ ಹೆಸರು')} *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={loc('எ.கா: அம்மன் ஹார்டுவேர்ஸ்', 'e.g. Amman Hardwares', 'उदा: अमन हार्डवेयर', 'ఉదా: అమ్మన్ హార్డ్‌వేర్', 'ഉദാ: അമ്മൻ ഹാർഡ്‌വെയർ', 'ಉದಾ: ಅಮ್ಮನ್ ಹಾರ್ಡ್‌ವೇರ್')}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('தொடர்பாளர் பெயர்', 'Contact Person', 'संपर्क व्यक्ति', 'సంప్రదించవలసిన వ్యక్తి', 'ബന്ധപ്പെടേണ്ട വ്യക്തി', 'ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ')} *
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder={loc('எ.கா: கே. ராஜேந்திரன்', 'e.g. K. Rajendran', 'उदा: के. राजेंद्रन', 'ఉదా: కె. రాజేంద్రన్', 'ഉദാ: കെ. രാജേന്ദ്രൻ', 'ಉದಾ: ಕೆ. ರಾಜೇಂದ್ರನ್')}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 5. Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {loc('தொடர்பு எண் (Phone/WhatsApp)', 'Contact Phone / WhatsApp', 'संपर्क फ़ोन / व्हाट्सएप', 'సంప్రదింపు ఫోన్ / వాట్సాప్', 'ഫോൺ / വാട്ട്‌സ്ആപ്പ്', 'ಸಂಪರ್ಕ ಫೋನ್ / ವಾಟ್ಸಾಪ್')} *
          </label>
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="9840123456"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 3. Headlines */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('விளம்பர தலைப்பு (தமிழ்)', 'Ad Headline (Tamil)', 'विज्ञापन शीर्षक (तमिल)', 'ప్రకటన శీర్షిక (తమిళం)', 'പരസ്യ തലക്കെട്ട് (തമിഴ്)', 'ಜಾಹೀರಾತು ಶೀರ್ಷಿಕೆ (ತಮಿಳು)')} *
            </label>
            <input
              type="text"
              value={headlineTa}
              onChange={(e) => setHeadlineTa(e.target.value)}
              placeholder={loc('எ.கா: சிமெண்ட், கம்பி மொத்த விலையில் கிடைக்கும்', 'e.g. Best Cement & TMT Steel at Wholesale Price', 'उदा: सीमेंट और स्टील थोक मूल्य पर', 'ఉదా: సిమెంట్, స్టీల్ హోల్‌సేల్ ధరకు లభిస్తాయి', 'ഉദാ: സിമന്റും കമ്പിയും മൊത്തവിലയ്ക്ക് ലഭ്യമാണ്', 'ಉದಾ: ಸಿಮೆಂಟ್, ಉಕ್ಕು ಸಗಟು ದರದಲ್ಲಿ ಲಭ್ಯವಿದೆ')}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('விளம்பர தலைப்பு (English)', 'Ad Headline (English)', 'विज्ञापन शीर्षक (अंग्रेज़ी)', 'ప్రకటన శీర్షిక (ఇంగ్లీష్)', 'പരസ്യ തലക്കെട്ട് (ഇംഗ്ലീഷ്)', 'ಜಾಹೀರಾತು ಶೀರ್ಷಿಕೆ (ಇಂಗ್ಲಿಷ್)')}
            </label>
            <input
              type="text"
              value={headlineEn}
              onChange={(e) => setHeadlineEn(e.target.value)}
              placeholder="e.g. Best Cement & TMT Steel at Wholesale Price"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 4. Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {loc('முழு விவரம் / சலுகை', 'Description / Offer Details', 'विवरण / ऑफ़र विवरण', 'వివరణ / ఆఫర్ వివరాలు', 'വിവരണം / ഓഫർ വിവരങ്ങൾ', 'ವಿವರಣೆ / ಆಫರ್ ವಿವರಗಳು')}
          </label>
          <textarea
            rows={2}
            value={descriptionTa}
            onChange={(e) => setDescriptionTa(e.target.value)}
            placeholder={loc('எ.கா: 10 கி.மீ வரை இலவச டெலிவரி. ஒப்பந்ததாரர்களுக்கு சிறப்பு தள்ளுபடி உண்டு.', 'e.g. Free delivery up to 10 km. Special discounts for building contractors.', 'उदा: 10 किमी तक मुफ्त डिलीवरी। ठेकेदारों के लिए विशेष छूट।', 'ఉదా: 10 కి.మీ వరకు ఉచిత డెలివరీ. కాంట్రాక్టర్లకు ప్రత్యేక తగ్గింపు.', 'ഉദാ: 10 കി.മീ വരെ സൗജന്യ ഡെലിവറി. കോൺട്രാക്ടർമാർക്ക് പ്രത്യേക കിഴിവ്.', 'ಉದಾ: 10 ಕಿ.ಮೀ ವರೆಗೆ ಉಚಿತ ವಿತರಣೆ. ಗುತ್ತಿಗೆದಾರರಿಗೆ ವಿಶೇಷ ರಿಯಾಯಿತಿ.')}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 5. Target Category & Button CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('எந்த வேலை பிரிவில் காட்டப்பட வேண்டும்?', 'Target Category', 'लक्षित श्रेणी', 'లక్ష్య విభాగం', 'ലക്ഷ്യ വിഭാഗം', 'ಉದ್ದೇಶಿತ ವರ್ಗ')}
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">
                {loc('அனைத்து பிரிவுகளிலும்', 'All Categories', 'सभी श्रेणियां', 'అన్ని వర్గాలు', 'എല്ലാ വിഭാഗങ്ങളും', 'ಎಲ್ಲಾ ವರ್ಗಗಳು')}
              </option>
              {WORK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {loc(c.nameTa, c.nameEn, c.nameEn, c.nameEn, c.nameEn, c.nameEn)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {loc('பட்டன் வாசகம்', 'Button Label', 'बटन टेक्स्ट', 'బటన్ లేబుల్', 'ബട്ടൺ ലേബൽ', 'ಬಟನ್ ಲೇಬಲ್')}
            </label>
            <input
              type="text"
              value={actionTextTa}
              onChange={(e) => setActionTextTa(e.target.value)}
              placeholder={loc('எ.கா: கடையை அழைக்க', 'e.g. Call Shop', 'उदा: कॉल करें', 'ఉదా: కాల్ చేయండి', 'ഉദാ: വിളിക്കുക', 'ಉದಾ: ಕರೆ ಮಾಡಿ')}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 6. Photo & Video Upload (Advertiser Media Option) */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold text-slate-800">
            {loc(
              'விளம்பர புகைப்படம் / வீடியோ பதிவேற்றம் (ஆப்ஷன்)',
              'Upload Photo or Video for Ad Banner (Optional)',
              'विज्ञापन फ़ोटो या वीडियो अपलोड करें (वैकल्पिक)',
              'ప్రకటన ఫోటో లేదా వీడియో అప్‌లోడ్ చేయండి (ఐచ్ఛికం)',
              'പരസ്യ ഫോട്ടോ അല്ലെങ്കിൽ വീഡിയോ അപ്‌ലോഡ് ചെയ്യുക (ഓപ്ഷണൽ)',
              'ಜಾಹೀರಾತು ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)'
            )}
          </label>
          <p className="text-[11px] text-slate-500 leading-snug">
            {loc(
              'உங்கள் கடை, நிறுவனம் அல்லது பணி உபகரணங்களின் போட்டோ அல்லது சிறு வீடியோவை பதிவேற்றலாம். அட்மின் போர்டு சரிபார்த்த பிறகு நேரலையில் தோன்றும்.',
              'Upload photo or short video of your shop/business. Control Board verifies before approving it live.',
              'दुकान/व्यवसाय की फ़ोटो या वीडियो अपलोड करें। नियंत्रण बोर्ड सत्यापन के बाद लाइव होगा।',
              'షాప్/వ్యాపారం ఫోటో లేదా వీడియో అప్‌లోడ్ చేయండి. కంట్రోల్ బోర్డ్ ధృవీకరణ తర్వాత లైవ్ అవుతుంది.',
              'ഷോപ്പ്/ബിസിനസ്സ് ഫോട്ടോ അല്ലെങ്കിൽ വീഡിയോ അപ്‌ലോഡ് ചെയ്യുക. അഡ്മിൻ പരിശോധിച്ച ശേഷം ലൈവ് ആകും.',
              'ಅಂಗಡಿ/ವ್ಯವಹಾರದ ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನಿಯಂತ್ರಣ ಮಂಡಳಿ ಪರಿಶೀಲಿಸಿದ ನಂತರ ಲೈವ್ ಆಗುತ್ತದೆ.'
            )}
          </p>
          <AdMediaUploader
            value={mediaValue}
            onChange={setMediaValue}
          />
        </div>

        {/* 7. Pricing Duration Package Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {loc('விளம்பர கால அளவு & கட்டணம்', 'Select Ad Duration & Pricing', 'विज्ञापन अवधि और मूल्य', 'ప్రకటన వ్యవధి మరియు ధర', 'പരസ്യ കാലയളവും വിലയും', 'ಜಾಹೀರಾತು ಅವಧಿ ಮತ್ತು ಬೆಲೆ')}
            </label>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {mediaValue.mediaType === 'video'
                ? loc('📹 வீடியோ விளம்பரம்', '📹 Video Ad', '📹 वीडियो विज्ञापन', '📹 వీడియో ప్రకటన', '📹 വീഡിയോ പരസ്യം', '📹 ವೀಡಿಯೊ ಜಾಹೀರಾತು')
                : mediaValue.mediaType === 'image'
                ? loc('📸 புகைப்பட விளம்பரம்', '📸 Photo Ad', '📸 फोटो विज्ञापन', '📸 ఫోటో ప్రకటన', '📸 ഫോട്ടോ പരസ്യം', '📸 ಫೋಟೋ ಜಾಹೀರಾತು')
                : loc('📝 எழுத்து விளம்பரம் (குறைந்த கட்டணம்)', '📝 Text Ad (Budget)', '📝 टेक्स्ट विज्ञापन', '📝 టెక్స్ట్ ప్రకటన', '📝 ടെക്സ്റ്റ് പരസ്യം', '📝 ಪಠ್ಯ ಜಾಹೀರಾತು')}
            </span>
          </div>
          <div className={`grid gap-2 ${plans.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {plans.map((pkg, idx) => {
              const pkgPrice = getPlanPriceForMedia(pkg, mediaValue.mediaType, mediaValue.videoDurationTier);
              return (
                <button
                  key={pkg.id || idx}
                  type="button"
                  onClick={() => setSelectedPlanIdx(idx)}
                  className={`p-2 rounded-xl border text-center transition-all relative overflow-hidden flex flex-col justify-between ${
                    selectedPlanIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-bl uppercase tracking-tight">
                      POPULAR
                    </span>
                  )}
                  <div>
                    <span className="text-xs block font-extrabold">{pkg.days} {loc('நாட்கள்', 'Days', 'दिन', 'రోజులు', 'ദിവസങ്ങൾ', 'ದಿನಗಳು')}</span>
                    <span className="text-sm block font-black text-indigo-700">₹{pkgPrice}</span>
                  </div>
                  {(pkg.labelTa || pkg.labelEn) && (
                    <span className="text-[9px] text-slate-500 block truncate mt-0.5 leading-tight">
                      {language === 'ta' ? pkg.labelTa : pkg.labelEn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        <button
          id="btn-submit-advertisement"
          type="submit"
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>
            {loc(
              `₹${effectiveCost} செலுத்தி விளம்பரம் சமர்ப்பிக்க`,
              `Submit & Pay ₹${effectiveCost}`,
              `₹${effectiveCost} का भुगतान करें और जमा करें`,
              `₹${effectiveCost} చెల్లించి సమర్పించండి`,
              `₹${effectiveCost} അടച്ച് സമർപ്പിക്കുക`,
              `₹${effectiveCost} ಪಾವತಿಸಿ ಸಲ್ಲಿಸಿ`
            )}
          </span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>

        <p className="text-[11px] text-slate-500 text-center">
          {loc(
            'நிர்வாக ஒப்புதலுக்குப் பின் 1 மணி நேரத்தில் உங்கள் விளம்பரம் நேரலையில் தோன்றும்.',
            'Ads go live within 1 hour after standard admin review for local safety.',
            'मानक व्यवस्थापक समीक्षा के बाद 1 घंटे के भीतर विज्ञापन लाइव हो जाते हैं।',
            'ప్రామాణిక నిర్వాహక సమీక్ష తర్వాత 1 గంటలోపు ప్రకటనలు ప్రత్యక్ష ప్రసారం అవుతాయి.',
            'അഡ്മിൻ അവലോകനത്തിന് ശേഷം 1 മണിക്കൂറിനുള്ളിൽ പരസ്യങ്ങൾ തത്സമയമാകും.',
            'ನಿರ್ವಾಹಕರ ಪರಿಶೀಲನೆಯ ನಂತರ 1 ಗಂಟೆಯೊಳಗೆ ಜಾಹೀರಾತುಗಳು ಲೈವ್ ಆಗುತ್ತವೆ.'
          )}
        </p>
      </form>

      {/* Submitted Ads Status List */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {loc('சமர்ப்பிக்கப்பட்ட விளம்பரங்கள்', 'Your Submitted Ads', 'आपके सबमिट किए गए विज्ञापन', 'మీరు సమర్పించిన ప్రకటనలు', 'നിങ്ങൾ സമർപ്പിച്ച പരസ്യങ്ങൾ', 'ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯಾದ ಜಾಹೀರಾತುಗಳು')} ({ads.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowHowToRemoveHelp(!showHowToRemoveHelp)}
            className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{loc('நீக்குவது எப்படி?', 'How to remove?', 'कैसे हटाएं?', 'ఎలా తీసివేయాలి?', 'എങ്ങനെ നീക്കംചെയ്യാം?', 'ಹೇಗೆ ತೆಗೆದುಹಾಕುವುದು?')}</span>
          </button>
        </div>

        {/* How to remove help card */}
        {showHowToRemoveHelp && (
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{loc('பழைய விளம்பரங்களை நீக்குவது எப்படி?', 'How to remove old advertisements', 'पुराने विज्ञापन कैसे हटाएं', 'పాత ప్రకటనలను ఎలా తీసివేయాలి', 'പഴയ പരസ്യങ്ങൾ എങ്ങനെ നീക്കംചെയ്യാം', 'ಹಳೆಯ ಜಾಹೀರಾತುಗಳನ್ನು ಹೇಗೆ ತೆಗೆದುಹಾಕುವುದು')}</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-indigo-900/80 whitespace-pre-line">
              {loc(
                '1. நீங்கள் பதிவிட்ட விளம்பரத்திற்கு அருகில் உள்ள சிவப்பு குப்பைத் தொட்டி (Trash) பட்டனை அழுத்தி நீக்கலாம். \n2. செயலி உரிமையாளர்/நிர்வாகி (Admin) பழைய அல்லது காலாவதியான விளம்பரங்களை Admin Dashboard மூலம் நீக்க முடியும்.',
                '1. Click the red trash icon next to any of your submitted ads to remove it. \n2. The App Owner / Admin can also delete or batch-clean expired advertisements from the Admin Dashboard.',
                '1. अपने किसी भी विज्ञापन को हटाने के लिए उसके बगल में लाल ट्रैश आइकन पर क्लिक करें।\n2. व्यवस्थापक भी एडমিন डैशबोर्ड से विज्ञापनों को हटा सकते हैं।',
                '1. మీ ప్రకటనలను తొలగించడానికి దాని పక్కన ఉన్న ఎరుపు ట్రాష్ చిహ్నాన్ని క్లిక్ చేయండి.\n2. అడ్మిన్ డాష్‌బోర్డ్ నుండి ప్రకటనలను కూడా తొలగించవచ్చు.',
                '1. നിങ്ങളുടെ പരസ്യങ്ങൾ നീക്കംചെയ്യാൻ ചുവന്ന ട്രാഷ് ഐക്കണിൽ ക്ലിക്കുചെയ്യുക.\n2. അഡ്മിന് ഡാഷ്‌ബോർഡിൽ നിന്നും പരസ്യങ്ങൾ നീക്കംചെയ്യാം.',
                '1. ನಿಮ್ಮ ಜಾಹೀರಾತುಗಳನ್ನು ತೆಗೆದುಹಾಕಲು ಅದರ ಪಕ್ಕದಲ್ಲಿರುವ ಕೆಂಪು ಟ್ರ್ಯಾಶ್ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.\n2. ನಿರ್ವಾಹಕರು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದಲೂ ಜಾಹೀರಾತುಗಳನ್ನು ಅಳಿಸಬಹುದು.'
              )}
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {/* Top Expiry Notification Alert Banner for Advertisers */}
          {(() => {
            const expiredAdsList = ads.filter((a) => a.status === 'approved' && getAdExpiryStatus(a).isExpired);
            const expiringSoonList = ads.filter((a) => a.status === 'approved' && getAdExpiryStatus(a).isExpiringSoon);

            if (expiredAdsList.length > 0) {
              return (
                <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-rose-950">
                        {language === 'ta'
                          ? `⚠️ உங்கள் ${expiredAdsList.length} விளம்பரத்தின் ஒளிபரப்பு காலம் முடிவடைந்தது!`
                          : `⚠️ Broadcast period ended for ${expiredAdsList.length} advertisement(s)!`}
                      </h4>
                      <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                        {language === 'ta'
                          ? 'ஒளிபரப்பு காலம் முடிவடைந்துள்ளதால் நேரலை பலகையில் ஒளிபரப்பு நிறுத்தப்பட்டுள்ளது. தொடர்ந்து வாடிக்கையாளர் அழைப்புகளை பெற உடனே புதுப்பிக்கவும்.'
                          : 'Ad broadcast is paused because the duration ended. Renew now to resume showing your ad to active users.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRenewal(expiredAdsList[0])}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0 cursor-pointer shadow-xs flex items-center gap-1 self-end sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'உடனே புதுப்பிக்க' : 'Renew Now'}</span>
                  </button>
                </div>
              );
            }

            if (expiringSoonList.length > 0) {
              return (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-amber-950">
                      {language === 'ta'
                        ? '⏳ உங்கள் விளம்பரம் அடுத்த 24 மணி நேரத்திற்குள் முடிவடைகிறது. தடையின்றி இயங்க முன்கூட்டியே புதுப்பிக்கவும்.'
                        : '⏳ Your ad will expire within 24 hours. Renew early for uninterrupted promotion.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRenewal(expiringSoonList[0])}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer"
                  >
                    {language === 'ta' ? 'புதுப்பிக்க' : 'Renew'}
                  </button>
                </div>
              );
            }

            return null;
          })()}

          {ads.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center border border-slate-200 text-slate-500 text-xs">
              {loc('இன்னும் விளம்பரங்கள் சமர்ப்பிக்கப்படவில்லை.', 'No advertisements submitted yet.', 'अभी तक कोई विज्ञापन सबमिट नहीं किया गया है।', 'ఇంకా ప్రకటనలు సమర్పించబడలేదు.', 'പരസ്യങ്ങളൊന്നും ഇതുവരെ സമർപ്പിച്ചിട്ടില്ല.', 'ಇನ್ನೂ ಯಾವುದೇ ಜಾಹೀರಾತುಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.')}
            </div>
          ) : (
            ads.map((ad) => {
              const expiryInfo = getAdExpiryStatus(ad);

              return (
                <div
                  key={ad.id}
                  className={`bg-white rounded-xl p-3.5 border shadow-xs space-y-2.5 transition-all ${
                    ad.status === 'approved' && expiryInfo.isExpired
                      ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                      : ad.status === 'approved' && expiryInfo.isExpiringSoon
                      ? 'border-amber-300 ring-1 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{ad.businessName}</span>
                        
                        {/* Status Badge */}
                        {ad.status === 'rejected' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-800">
                            {loc('நிராகரிக்கப்பட்டது', 'Rejected', 'अस्वीकृत', 'తిరస్కరించబడింది', 'നിരസിച്ചു', 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ')}
                          </span>
                        )}

                        {ad.status === 'pending' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{loc('ஆய்வில் உள்ளது', 'Pending Review', 'समीक्षा लंबित', 'సమీక్ష పెండింగ్‌లో ఉంది', 'പരിശോധനയിലാണ്', 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ')}</span>
                          </span>
                        )}

                        {ad.status === 'approved' && expiryInfo.isExpired && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                            <span>{language === 'ta' ? 'ஒளிபரப்பு முடிந்தது (காலாவதியானது)' : 'Expired'}</span>
                          </span>
                        )}

                        {ad.status === 'approved' && !expiryInfo.isExpired && expiryInfo.isExpiringSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>{language === 'ta' ? `விரைவில் முடிகிறது (${expiryInfo.hoursLeft} மணி)` : `Expiring Soon (${expiryInfo.hoursLeft}h)`}</span>
                          </span>
                        )}

                        {ad.status === 'approved' && !expiryInfo.isExpired && !expiryInfo.isExpiringSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{language === 'ta' ? `நேரலை (${expiryInfo.daysLeft} நாட்கள்)` : `Live (${expiryInfo.daysLeft}d)`}</span>
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-semibold text-indigo-900 mt-1">
                        {loc(ad.headlineTa, ad.headlineEn, ad.headlineEn, ad.headlineEn, ad.headlineEn, ad.headlineEn)}
                      </h5>

                      {/* Media Type Preview */}
                      <div className="mt-2 space-y-2">
                        {ad.mediaType === 'video' && ad.mediaUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black max-w-xs">
                            <video
                              src={ad.mediaUrl}
                              controls
                              playsInline
                              className="w-full max-h-36 object-contain"
                              preload="metadata"
                            />
                            <span className="absolute top-1 left-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                              📹 VIDEO AD
                            </span>
                          </div>
                        )}

                        {ad.mediaType === 'image' && ad.mediaUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                            <img
                              src={ad.mediaUrl}
                              alt={ad.businessName}
                              className="w-full max-h-32 object-cover"
                            />
                            <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              📸 PHOTO AD
                            </span>
                          </div>
                        )}

                        {/* Status detail notices */}
                        {ad.status === 'pending' && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              {language === 'ta'
                                ? 'ஓனர் ஆப் பேனலில் சரிபார்க்கப்படுகிறது. நிர்வாகம் அனுமதித்ததும் பயன்பாட்டின் பேனர் மற்றும் வேலைப் பட்டியலில் தானாகத் தோன்றும்.'
                                : 'Under verification in the Owner App Panel. It will be publicly visible across the app once approved by administration.'}
                            </span>
                          </div>
                        )}

                        {ad.status === 'approved' && expiryInfo.isExpired && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-[11px] space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-rose-950 block">
                                  {language === 'ta'
                                    ? 'விளம்பர ஒளிபரப்பு காலம் முடிவடைந்தது!'
                                    : 'Advertisement Broadcast Duration Concluded!'}
                                </span>
                                <span className="text-[10px] text-rose-700 block mt-0.5">
                                  {language === 'ta'
                                    ? `இந்த விளம்பரத்தின் ${ad.days || 7} நாட்கள் ஒளிபரப்பு முடிவடைந்தது. பயன்பாட்டில் தொடர்ந்து ஒளிபரப்பவும், புதிய வாடிக்கையாளர்களை ஈர்க்கவும் உடனடியாக மீண்டும் புதுப்பிக்க நினைவூட்டப்படுகிறது.`
                                    : `The ${ad.days || 7}-day broadcast for this ad has ended. Renew now to resume promotion and attract new customer calls.`}
                                </span>
                              </div>
                            </div>

                            {/* Prominent Renewal Action Buttons */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenRenewal(ad)}
                                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{language === 'ta' ? '🔄 மீண்டும் புதுப்பிக்க (Renew)' : '🔄 Renew Ad'}</span>
                              </button>

                              <a
                                href={`https://wa.me/91${ownerPaymentConfig?.ownerPhone ? ownerPaymentConfig.ownerPhone.replace(/[^0-9]/g, '') : '9876543210'}?text=${encodeURIComponent(
                                  `வணக்கம் Daily Work நிர்வாகம், எனது "${ad.businessName}" விளம்பரத்தின் ${ad.days || 7} நாட்கள் ஒளிபரப்பு முடிவடைந்தது. அதனை மேலும் நாட்களுக்கு உடனடியாக புதுப்பிக்க விரும்புகிறேன். Ad ID: ${ad.id}`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp மூலம் புதுப்பிக்க</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {ad.status === 'approved' && !expiryInfo.isExpired && expiryInfo.isExpiringSoon && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 font-bold text-amber-950">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>
                                {language === 'ta'
                                  ? `அடுத்த ${expiryInfo.hoursLeft} மணி நேரத்தில் முடிவடைகிறது`
                                  : `Ending in ${expiryInfo.hoursLeft} hours`}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenRenewal(ad)}
                              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{language === 'ta' ? 'புதுப்பிக்க' : 'Renew'}</span>
                            </button>
                          </div>
                        )}

                        {ad.status === 'approved' && !expiryInfo.isExpired && !expiryInfo.isExpiringSoon && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {language === 'ta'
                                  ? `நேரலையில் இயங்குகிறது • இன்னும் ${expiryInfo.daysLeft} நாட்கள் மீதம்`
                                  : `Currently live across banners • ${expiryInfo.daysLeft} days remaining`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenRenewal(ad)}
                              className="text-indigo-700 hover:text-indigo-900 font-bold text-[10px] underline cursor-pointer"
                            >
                              {language === 'ta' ? 'நாட்களை கூட்ட (Extend)' : 'Extend Days'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700">₹{ad.cost}</span>
                        <p className="text-[10px] text-slate-400">{ad.days} {loc('நாட்கள்', 'days', 'दिन', 'రోజులు', 'ദിവസങ്ങൾ', 'ದಿನಗಳು')}</p>
                      </div>

                      {/* Delete button */}
                      {onDeleteAd && (
                        <button
                          type="button"
                          onClick={() => setDeletingAdId(ad.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={loc('விளம்பரத்தை நீக்குக', 'Delete Advertisement', 'विज्ञापन हटाएं', 'ప్రకటనను తొలగించండి', 'പരസ്യം ഇല്ലാതാക്കുക', 'ಜಾಹೀರಾತು ಅಳಿಸಿ')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Deletion Confirmation */}
                  {deletingAdId === ad.id && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs gap-2">
                      <span className="text-rose-900 font-semibold">
                        {loc('இந்த விளம்பரத்தை நீக்கவா?', 'Delete this advertisement?', 'क्या आप इस विज्ञापन को हटाना चाहते हैं?', 'ఈ ప్రకటనను తొలగించాలా?', 'ഈ പരസ്യം ഇല്ലാതാക്കണോ?', 'ಈ ಜಾಹೀರಾತನ್ನು ಅಳಿಸಬೇಕೇ?')}
                      </span>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteAd) onDeleteAd(ad.id);
                            setDeletingAdId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          {loc('ஆம், நீக்குக', 'Yes, Delete', 'हाँ, हटाएं', 'అవును, తొలగించు', 'അതെ, ഇല്ലാതാക്കുക', 'ಹೌದು, ಅಳಿಸಿ')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAdId(null)}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                        >
                          {loc('ரத்து', 'Cancel', 'रद्द करें', 'రద్దు', 'റദ്ദാക്കുക', 'ರದ್ದು')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{ad.location} • {ad.targetCategory}</span>
                    <span>
                      {language === 'ta'
                        ? `பதிவு: ${new Date(ad.submittedAt).toLocaleDateString()}`
                        : `Posted: ${new Date(ad.submittedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isCheckoutOpen && (
        <PaymentModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          titleEn={`Local Ad Banner (${selectedPlan.days} Days)`}
          titleTa={`உள்ளூர் விளம்பரம் (${selectedPlan.days} நாட்கள்)`}
          amount={selectedPlan.price}
          purpose="advertisement"
          payerName={businessName}
          payerPhone={phone}
          ownerPaymentConfig={ownerPaymentConfig}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Ad Renewal Modal */}
      {renewingAd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white p-5 text-center relative">
              <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {language === 'ta'
                  ? 'விளம்பரத்தை மீண்டும் புதுப்பிக்க'
                  : 'Renew Advertisement'}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {language === 'ta'
                  ? 'ஒளிபரப்பு நாட்களை நீட்டித்து வாடிக்கையாளர்களைத் தொடர்ந்து பெறுங்கள்'
                  : 'Extend ad broadcast duration and keep getting client calls'}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Business details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{renewingAd.businessName}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    {renewingAd.mediaType === 'video' ? '📹 VIDEO' : renewingAd.mediaType === 'image' ? '📸 PHOTO' : '📝 TEXT'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] truncate">{renewingAd.headlineTa || renewingAd.headlineEn}</p>
                <p className="text-slate-500 text-[10px]">{renewingAd.location} • {renewingAd.phone}</p>
              </div>

              {/* Select Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {language === 'ta' ? 'புதுப்பிக்கும் கால அளவை தேர்வு செய்யவும்' : 'Select Renewal Duration'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 30].map((days) => {
                    const price = calculateRenewalPrice(renewingAd, days);
                    const isSelected = renewalDays === days;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRenewalDays(days)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400 font-black text-slate-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="block text-sm font-extrabold">{days} {language === 'ta' ? 'நாட்கள்' : 'Days'}</span>
                        <span className="block text-xs font-bold text-emerald-700 mt-0.5">₹{price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total summary */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-950 font-bold block">
                    {language === 'ta' ? 'புதுப்பித்தல் கட்டணம்' : 'Total Renewal Fee'}
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {renewalDays} {language === 'ta' ? 'நாட்கள் நேரலை பலகை ஒளிபரப்பு' : 'Days live banner broadcast'}
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  ₹{calculateRenewalPrice(renewingAd, renewalDays)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsRenewalCheckoutOpen(true)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'ta'
                    ? `₹${calculateRenewalPrice(renewingAd, renewalDays)} கட்டணம் செலுத்தி உடனே புதுப்பிக்க`
                    : `Pay ₹${calculateRenewalPrice(renewingAd, renewalDays)} & Renew Now`}
                </span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/91${ownerPaymentConfig?.ownerPhone ? ownerPaymentConfig.ownerPhone.replace(/[^0-9]/g, '') : '9876543210'}?text=${encodeURIComponent(
                    `வணக்கம் Daily Work நிர்வாகம், எனது "${renewingAd.businessName}" விளம்பரத்தை ${renewalDays} நாட்களுக்கு மீண்டும் புதுப்பிக்க விரும்புகிறேன். Ad ID: ${renewingAd.id}, கட்டணம்: ₹${calculateRenewalPrice(renewingAd, renewalDays)}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp மூலம்</span>
                </a>

                <button
                  type="button"
                  onClick={() => setRenewingAd(null)}
                  className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Checkout Modal */}
      {isRenewalCheckoutOpen && renewingAd && (
        <PaymentModal
          isOpen={isRenewalCheckoutOpen}
          onClose={() => setIsRenewalCheckoutOpen(false)}
          titleEn={`Ad Renewal: ${renewingAd.businessName} (${renewalDays} Days)`}
          titleTa={`விளம்பரம் புதுப்பித்தல்: ${renewingAd.businessName} (${renewalDays} நாட்கள்)`}
          amount={calculateRenewalPrice(renewingAd, renewalDays)}
          purpose="advertisement"
          payerName={renewingAd.businessName}
          payerPhone={renewingAd.phone}
          ownerPaymentConfig={ownerPaymentConfig}
          onPaymentSuccess={handleRenewalPaymentSuccess}
        />
      )}

      {/* Owner Scope Pricing Manager Modal */}
      {isOwnerPricingModalOpen && (
        <OwnerAdPricingModal
          isOpen={isOwnerPricingModalOpen}
          onClose={() => setIsOwnerPricingModalOpen(false)}
          onPricingUpdated={(updated) => setScopePricingTiers(updated)}
        />
      )}

      {/* SUBMISSION & ADMIN APPROVAL WORKFLOW MODAL */}
      {submittedSuccessAd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 text-center relative">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-400/40 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {language === 'ta'
                  ? 'விளம்பரம் மற்றும் கட்டணம் பெறப்பட்டது!'
                  : 'Payment Received & Ad Submitted!'}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {language === 'ta'
                  ? 'ஓனர் ஆப் பேனலுக்கு ஒப்புதலுக்காக அனுப்பப்பட்டுள்ளது'
                  : 'Sent to Owner App Panel for Admin Approval'}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Approval status banner */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950">
                  <p className="font-extrabold text-amber-900">
                    {language === 'ta'
                      ? 'நிர்வாக அனுமதி நிலை: ஆய்வில் உள்ளது (Pending Approval)'
                      : 'Status: Pending Admin Approval'}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                    {language === 'ta'
                      ? 'நிர்வாகம் (Admin) உங்கள் விளம்பரத்தை சரிபார்த்து ஒப்புதல் அளித்த பிறகு, பயன்பாட்டின் முகப்பு பேனர், வேலைப் பட்டியல் மற்றும் ஊடகப் பக்கங்களில் விளம்பரம் தானாகவே நேரலையாகத் தெரியும்.'
                      : 'Once the application owner / admin verifies and grants approval, your advertisement will automatically appear across the home screen banner and jobs feed.'}
                  </p>
                </div>
              </div>

              {/* Ad Card Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">{submittedSuccessAd.ad.businessName}</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {submittedSuccessAd.ad.mediaType === 'video' ? '📹 VIDEO AD' : submittedSuccessAd.ad.mediaType === 'image' ? '📸 PHOTO AD' : '📝 TEXT AD'}
                  </span>
                </div>

                {/* Media Preview if attached */}
                {submittedSuccessAd.ad.mediaType === 'video' && submittedSuccessAd.ad.mediaUrl && (
                  <div className="rounded-lg overflow-hidden bg-black border border-slate-300">
                    <video
                      src={submittedSuccessAd.ad.mediaUrl}
                      controls
                      playsInline
                      className="w-full max-h-48 object-contain"
                    />
                    <div className="p-1.5 bg-slate-900 text-amber-400 text-[10px] font-bold text-center">
                      {language === 'ta' ? 'வீடியோ வெற்றிகரமாக சேமிக்கப்பட்டது' : 'Video Ad Successfully Saved'}
                    </div>
                  </div>
                )}

                {submittedSuccessAd.ad.mediaType === 'image' && submittedSuccessAd.ad.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-300">
                    <img
                      src={submittedSuccessAd.ad.mediaUrl}
                      alt={submittedSuccessAd.ad.businessName}
                      className="w-full max-h-40 object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'ta' ? 'தொடர்பு எண்' : 'Phone'}</span>
                    <span className="font-bold text-slate-800">{submittedSuccessAd.ad.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'ta' ? 'கால அளவு' : 'Duration'}</span>
                    <span className="font-bold text-slate-800">{submittedSuccessAd.ad.days} {language === 'ta' ? 'நாட்கள்' : 'Days'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'ta' ? 'செலுத்திய கட்டணம்' : 'Amount Paid'}</span>
                    <span className="font-extrabold text-emerald-700">₹{submittedSuccessAd.ad.cost}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'ta' ? 'பரிவர்த்தனை ஐடி' : 'Transaction ID'}</span>
                    <span className="font-mono text-slate-700 text-[10px] truncate block">{submittedSuccessAd.tx.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                id="btn-close-ad-submitted-modal"
                onClick={() => setSubmittedSuccessAd(null)}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                {language === 'ta' ? 'சரி, புரிந்தது' : 'OK, Understood'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedSuccessAd(null);
                  const el = document.getElementById('submitted-ads-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                {language === 'ta' ? 'எனது விளம்பரங்கள்' : 'View My Ads'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
