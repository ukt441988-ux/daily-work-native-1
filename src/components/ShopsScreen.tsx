import React, { useState, useEffect } from 'react';
import { Screen, ShopItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getSavedUserLocation } from '../data/locations';
import { getSavedShops, saveShopItem } from '../data/shopsData';
import {
  filterShopsByLocationAndCategory,
  generateCallAndOrderDraft,
  calculateJobMaterialRequirements,
  extractShopDetailsFromRawInput,
  MaterialEstimationResult,
} from '../utils/aiPromptsHelper';
import {
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Search,
  ArrowLeft,
  Sparkles,
  Truck,
  CheckCircle2,
  Cpu,
  Calculator,
  FileText,
  PlusCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  Mic,
} from 'lucide-react';
import { VoiceSearchModal } from './VoiceSearchModal';

interface ShopsScreenProps {
  onNavigate: (screen: Screen) => void;
  initialTab?: 'browse' | 'estimate' | 'order_draft' | 'onboarding';
  initialSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export const ShopsScreen: React.FC<ShopsScreenProps> = ({
  onNavigate,
  initialTab,
  initialSearchQuery = '',
  onSearchQueryChange,
}) => {
  const { loc, language } = useLanguage();
  const userLoc = getSavedUserLocation();

  // Active view tab: 'browse' (Prompt 1), 'estimate' (Prompt 3), 'order_draft' (Prompt 2), 'onboarding' (Prompt 4)
  const [activeTab, setActiveTab] = useState<'browse' | 'estimate' | 'order_draft' | 'onboarding'>(
    initialTab || 'browse'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Shops State
  const [shopsList, setShopsList] = useState<ShopItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const updateSearchQuery = (q: string) => {
    setSearchQuery(q);
    if (onSearchQueryChange) onSearchQueryChange(q);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShopForDraft, setSelectedShopForDraft] = useState<ShopItem | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Prompt 2 State: Call & Order Draft ---
  const [draftItems, setDraftItems] = useState('• அல்ட்ராடெக் சிமெண்ட் - 10 மூட்டைகள்\n• 12mm TMT கம்பி - 200 கிலோ');
  const [draftAddress, setDraftAddress] = useState(`${userLoc.city || 'சென்னை'}, ${userLoc.state || 'தமிழ்நாடு'}`);
  const [draftBuyerName, setDraftBuyerName] = useState('');
  const [draftBuyerPhone, setDraftBuyerPhone] = useState('');

  // --- Prompt 3 State: Material Recommendation ---
  const [jobTypeInput, setJobTypeInput] = useState('சுவர் கட்டுதல் (Brickwork & Plastering)');
  const [jobDimensionsInput, setJobDimensionsInput] = useState('10 அடி x 10 அடி சுவர்');
  const [estimationResult, setEstimationResult] = useState<MaterialEstimationResult | null>(null);

  // --- Prompt 4 State: Store Registration & Onboarding ---
  const [rawStoreText, setRawStoreText] = useState(
    'ஸ்ரீ அம்மன் ஹார்டுவேர், ஜிஎஸ்டி ரோடு, குரோம்பேட்டை, சென்னை.\nசிமெண்ட், மணல், TMT கம்பிகள், பிளம்பிங் பைப் கிடைக்கும்.\nபோன்: 9841234567\nடெலிவரி உண்டு.'
  );
  const [extractedPreview, setExtractedPreview] = useState<Partial<ShopItem> | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // Direct Registration Form State
  const [formShopName, setFormShopName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formCategory, setFormCategory] = useState<ShopItem['category']>('hardware');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState(userLoc.city || 'சென்னை');
  const [formMaterials, setFormMaterials] = useState('');
  const [formDelivery, setFormDelivery] = useState(true);
  const [formError, setFormError] = useState('');
  const [regMode, setRegMode] = useState<'form' | 'ai_paste'>('form');

  useEffect(() => {
    const loaded = getSavedShops();
    setShopsList(loaded);
    if (loaded.length > 0) {
      setSelectedShopForDraft(loaded[0]);
    }
  }, []);

  const filteredShops = filterShopsByLocationAndCategory(
    shopsList,
    userLoc.city,
    userLoc.state,
    selectedCategory,
    searchQuery
  );

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleRunEstimation = () => {
    const res = calculateJobMaterialRequirements(jobTypeInput, jobDimensionsInput);
    setEstimationResult(res);
  };

  const handleExtractStore = () => {
    const parsed = extractShopDetailsFromRawInput(rawStoreText);
    setExtractedPreview(parsed);
    if (parsed.name) setFormShopName(parsed.nameTa || parsed.name);
    if (parsed.phone) setFormPhone(parsed.phone);
    if (parsed.whatsapp) setFormWhatsapp(parsed.whatsapp || parsed.phone);
    if (parsed.address) setFormAddress(parsed.address);
    if (parsed.category) setFormCategory(parsed.category);
    if (parsed.materialsListTa && parsed.materialsListTa.length > 0) {
      setFormMaterials(parsed.materialsListTa.join(', '));
    } else if (parsed.materialsList && parsed.materialsList.length > 0) {
      setFormMaterials(parsed.materialsList.join(', '));
    }
    if (parsed.deliveryAvailable !== undefined) setFormDelivery(parsed.deliveryAvailable);
    setRegMode('form');
  };

  const handleUseSample = (type: 'hardware' | 'cement' | 'rental') => {
    if (type === 'hardware') {
      setFormShopName('ஸ்ரீ அம்மன் ஹார்டுவேர் & எலக்ட்ரிக்கல்ஸ்');
      setFormPhone('9841234567');
      setFormWhatsapp('9841234567');
      setFormCategory('hardware');
      setFormAddress('45, மெயின் ரோடு, பேருந்து நிலையம் அருகில்');
      setFormCity(userLoc.city || 'சென்னை');
      setFormMaterials('சிமெண்ட், TMT கம்பிகள், PVC பைப், பெயிண்ட், பவர் டூல்ஸ்');
      setFormDelivery(true);
      setFormError('');
    } else if (type === 'cement') {
      setFormShopName('கே.பி.ஆர் சிமெண்ட் & மணல் சப்ளையர்ஸ்');
      setFormPhone('9842155667');
      setFormWhatsapp('9842155667');
      setFormCategory('cement_building');
      setFormAddress('12/A, பைபாஸ் சாலை, தொழிற்பேட்டை');
      setFormCity(userLoc.city || 'மதுரை');
      setFormMaterials('அல்ட்ராடெக் சிமெண்ட், எம்-சாண்ட், செங்கல், TMT கம்பி 12mm, கட்டுக்கம்பி');
      setFormDelivery(true);
      setFormError('');
    } else {
      setFormShopName('பாரதி கன்ஸ்ட்ரக்ஷன் டூல்ஸ் வாடகை நிறுவனம்');
      setFormPhone('9443211223');
      setFormWhatsapp('9443211223');
      setFormCategory('tools_rental');
      setFormAddress('78, ரிங் ரோடு, லாரி ஷெட் எதிரில்');
      setFormCity(userLoc.city || 'கோயம்புத்தூர்');
      setFormMaterials('கான்கிரீட் மிக்சர், அதிர்வு இயந்திரம், சாரப்பலகை இரும்பு பைப், வெல்டிங் மெஷின்');
      setFormDelivery(true);
      setFormError('');
    }
  };

  const handleResetForm = () => {
    setFormShopName('');
    setFormPhone('');
    setFormWhatsapp('');
    setFormCategory('hardware');
    setFormAddress('');
    setFormCity(userLoc.city || 'சென்னை');
    setFormMaterials('');
    setFormDelivery(true);
    setFormError('');
    setExtractedPreview(null);
  };

  const handleSaveStore = () => {
    const name = formShopName.trim() || extractedPreview?.name?.trim();
    const phone = formPhone.trim() || extractedPreview?.phone?.trim();

    if (!name) {
      setFormError(loc('தயவுசெய்து கடையின் பெயரை உள்ளிடவும்', 'Please enter shop name', 'कृपया दुकान का नाम दर्ज करें', 'దయచేసి దుకాణం పేరును నమోదు చేయండి', 'ദയവായി ഷോപ്പ് പേര് നൽകുക', 'ದಯವಿಟ್ಟು ಅಂಗಡಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ'));
      return;
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 8) {
      setFormError(loc('தயவுசெய்து சரியான தொடர்பு எண்ணை உள்ளிடவும்', 'Please enter valid contact phone number', 'कृपया वैध फोन नंबर दर्ज करें', 'దయచేసి సరైన ఫోన్ నంబర్ నమోదు చేయండి', 'ദയവായി സാധുവായ ഫോൺ നമ്പർ നൽകുക', 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'));
      return;
    }

    setFormError('');
    const newId = `shop-${Date.now()}`;
    const materialsArr = formMaterials.trim()
      ? formMaterials.split(',').map((s) => s.trim()).filter(Boolean)
      : (extractedPreview?.materialsList || ['General Materials']);

    const categoryLabels: Record<string, { en: string; ta: string }> = {
      hardware: { en: 'Hardware & Tools', ta: 'ஹார்டுவேர் & டூல்ஸ்' },
      cement_building: { en: 'Cement & Building Materials', ta: 'சிமெண்ட் & கட்டுமான பொருட்கள்' },
      electrical_plumbing: { en: 'Electrical & Plumbing', ta: 'எலக்ட்ரிக்கல் & பிளம்பிங்' },
      paint: { en: 'Paint & Surface Coatings', ta: 'பெயிண்ட் & வார்னிஷ்' },
      tools_rental: { en: 'Tools & Machinery Rental', ta: 'இயந்திர வாடகை' },
      timber_carpentry: { en: 'Timber & Carpentry', ta: 'மரவேலை & பலகைகள்' },
      general: { en: 'General Building Mart', ta: 'பொது கட்டுமான பொருட்கள்' },
    };

    const catInfo = categoryLabels[formCategory] || { en: 'Hardware Store', ta: 'ஹார்டுவேர்' };

    const newShop: ShopItem = {
      id: newId,
      name: name,
      nameTa: name,
      category: formCategory,
      categoryLabelEn: catInfo.en,
      categoryLabelTa: catInfo.ta,
      address: formAddress.trim() || `${formCity || userLoc.city || 'Tamil Nadu'} Main Road`,
      city: formCity.trim() || userLoc.city || 'Tamil Nadu',
      cityTa: formCity.trim() || userLoc.city || 'தமிழ்நாடு',
      stateEn: userLoc.state || 'Tamil Nadu',
      stateTa: userLoc.state || 'தமிழ்நாடு',
      countryCode: userLoc.countryCode || 'IN',
      phone: phone,
      whatsapp: formWhatsapp.trim() || phone,
      materialsList: materialsArr,
      materialsListTa: materialsArr,
      deliveryAvailable: formDelivery,
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      isVerified: true,
    };

    const updated = saveShopItem(newShop);
    setShopsList(updated);
    setNewlyAddedId(newId);
    setOnboardSuccess(true);

    handleResetForm();

    setTimeout(() => {
      setOnboardSuccess(false);
      setActiveTab('browse');
    }, 1800);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white p-4 rounded-3xl shadow-md border border-emerald-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-300" />
                <h2 className="text-xl font-black tracking-tight">
                  {loc('பொருட்கள் & கடைகள்', 'Shops & Building Materials', 'दुकानें और सामग्री', 'దుకాణాలు & సామగ్రి', 'ഷോപ്പുകളും സാമഗ്രികളും', 'ಅಂಗಡಿಗಳು ಮತ್ತು ಸಾಮಗ್ರಿಗಳು')}
                </h2>
              </div>
              <p className="text-xs text-emerald-100">
                {loc(
                  'கட்டுமான பொருட்கள், சிமெண்ட், டூல்ஸ் வாடகை மற்றும் உள்ளூர் கடைகள் (AI உதவி)',
                  'AI-powered store finder, call order drafting & material recommendations',
                  'एआई-संचालित स्टोर खोजक और सामग्री अनुशंसा',
                  'AI స్టోర్ ఫైండర్ మరియు మెటీరియల్ సిఫార్సు',
                  'AI സ്റ്റോർ ഫൈൻഡറും സാമഗ്രി ശുപാർശയും',
                  'AI ಸ್ಟೋರ್ ಫೈಂಡರ್ ಮತ್ತು ವಸ್ತು ಶಿಫಾರಸು'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-emerald-700/60 px-2.5 py-1.5 rounded-xl border border-emerald-500/40">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold text-white text-[11px] truncate max-w-[110px]">
              {userLoc.city || 'Tamil Nadu'}
            </span>
          </div>
        </div>

        {/* 4 Feature Tabs corresponding to the 4 AI Prompts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-emerald-700/60">
          {/* Tab 1: Store Finder */}
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{loc('1. கடை தேடல்', '1. Store Finder', '1. स्टोर खोज', '1. స్టోర్ ఫైండర్', '1. സ്റ്റോർ', '1. ಅಂಗಡಿ ಹುಡುಕಾಟ')}</span>
          </button>

          {/* Tab 2: Material Recommendation */}
          <button
            onClick={() => {
              setActiveTab('estimate');
              if (!estimationResult) handleRunEstimation();
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'estimate'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{loc('2. AI கணக்கீடு', '2. Material Calc', '2. सामग्री गणना', '2. మెటీరియల్', '2. കണക്കുകൂട്ടൽ', '2. ವಸ್ತು ಲೆಕ್ಕಾಚಾರ')}</span>
          </button>

          {/* Tab 3: Call & Order Draft */}
          <button
            onClick={() => setActiveTab('order_draft')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'order_draft'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{loc('3. ஆர்டர் வரைவு', '3. Call & Order', '3. ऑर्डर ड्राफ्ट', '3. ఆర్డర్ డ్రాఫ్ట్', '3. ഓർഡർ ഡ്രാഫ്റ്റ്', '3. ಆದೇಶ ಕರಡು')}</span>
          </button>

          {/* Tab 4: Store Onboarding */}
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'onboarding'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{loc('4. கடை சேர்க்க', '4. Add Store AI', '4. दुकान जोड़ें', '4. దుకాణం చేర్చండి', '4. ഷോപ്പ് ചേർക്കുക', '4. ಅಂಗಡಿ ಸೇರಿಸಿ')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: STORE FINDER (GPS & City Location Based)
         ======================================================== */}
      {activeTab === 'browse' && (
        <div className="space-y-3.5">
          {/* Search bar & Category filter */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                placeholder={loc(
                  'பொருட்கள் அல்லது கடையின் பெயர் தேட... (எ.கா: சிமெண்ட், TMT கம்பி, வாடகை இயந்திரங்கள்)',
                  'Search materials or shops... (e.g., Cement, TMT steel rods, Power tools)',
                  'सामग्री या दुकान खोजें... (उदा: सीमेंट, सरिया, टूल्स)',
                  'సామగ్రి లేదా దుకాణాన్ని శోధించండి...',
                  'സാമഗ്രികൾ തിരയുക...',
                  'ಸಾಮಗ್ರಿಗಳನ್ನು ಹುಡುಕಿ...'
                )}
                className="w-full pl-9 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10px] flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                title={loc('குரல் மூலம் கடை தேட', 'Voice Search Shops')}
              >
                <Mic className="w-3 h-3 animate-pulse" />
                <span>{loc('குரல்', 'Mic')}</span>
              </button>
            </div>

            {/* Horizontal Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs pb-0.5">
              {[
                { id: 'all', label: loc('அனைத்தும்', 'All Shops') },
                { id: 'cement_building', label: loc('சிமெண்ட் & மணல்', 'Cement & Sand') },
                { id: 'tools_rental', label: loc('இயந்திர வாடகை', 'Tools Rental') },
                { id: 'electrical_plumbing', label: loc('எலக்ட்ரிக்கல் & பைப்', 'Electrical & Plumbing') },
                { id: 'paint', label: loc('பெயிண்ட்', 'Paints') },
                { id: 'timber_carpentry', label: loc('மரவேலை', 'Timber') },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold text-xs transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shops List & Add Shop CTA */}
          <div className="space-y-3">
            {/* Quick Add Shop Banner */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-emerald-500/15 border border-amber-300/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  {loc('உங்கள் கடையை இங்கு இலவசமாக பதிவு செய்ய வேண்டுமா?', 'Want to register your shop here for free?')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('onboarding')}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{loc('+ கடை சேர்க்க', '+ Add Shop')}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-xs text-slate-600">
              <span className="font-bold">
                {loc('அருகிலுள்ள கடைகள்', 'Stores in / near')} {userLoc.city || 'Tamil Nadu'} ({filteredShops.length})
              </span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {loc('100% சரிபார்க்கப்பட்ட கடைகள்', 'Verified Merchants')}
              </span>
            </div>

            {filteredShops.map((shop) => {
              const cleanPhone = (shop.phone || '').replace(/[^0-9]/g, '');
              const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const waText = encodeURIComponent(
                `வணக்கம் ${shop.nameTa || shop.name}, நான் Daily Work ஆப் மூலம் பொருட்களை விசாரிக்க விரும்புகிறேன்.`
              );

              return (
                <div
                  key={shop.id}
                  className={`bg-white rounded-3xl border p-4 shadow-xs hover:shadow-md transition-all space-y-3 group ${
                    newlyAddedId === shop.id ? 'border-2 border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:scale-105 transition-transform">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm sm:text-base text-slate-950 leading-tight">
                            {language === 'ta' ? shop.nameTa || shop.name : shop.name}
                          </h4>
                          {newlyAddedId === shop.id && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                              ✨ {loc('புதிய பதிவு', 'Just Added')}
                            </span>
                          )}
                          {shop.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 rounded-full shadow-xs">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{loc('சரிபார்க்கப்பட்டது', 'Verified')}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{shop.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 py-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                        <span>{shop.rating || 4.8}</span>
                      </span>
                      {shop.deliveryAvailable && (
                        <span className="text-[10px] text-white bg-gradient-to-r from-sky-500 to-blue-600 font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 mt-1.5">
                          <Truck className="w-3 h-3" />
                          <span>{loc('டெலிவரி உண்டு', 'Delivery')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Materials tags */}
                  <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-emerald-600" />
                      <span>{loc('கிடைக்கும் பொருட்கள் / சேவைகள்:', 'Available Materials & Equipment:')}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(language === 'ta' && shop.materialsListTa ? shop.materialsListTa : shop.materialsList).map(
                        (mat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800"
                          >
                            ✓ {mat}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Action Touchbars */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    {/* AI Order Draft Button */}
                    <button
                      onClick={() => {
                        setSelectedShopForDraft(shop);
                        setActiveTab('order_draft');
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{loc('AI ஆர்டர் வரைவு', 'AI Order Draft')}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 fill-white" />
                        <span>{loc('அழைக்க', 'Call Store')}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: MATERIAL RECOMMENDATION CALCULATOR (Prompt 3)
         ======================================================== */}
      {activeTab === 'estimate' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm sm:text-base">
                {loc(
                  'குறிப்பிட்ட வேலைக்கான AI பொருட்கள் பரிந்துரை',
                  'AI Material Recommendation & Cost Estimator',
                  'विशिष्ट कार्य के लिए एआई सामग्री अनुशंसा',
                  'నిర్దిష్ట పనికి AI మెటీరియల్ సిఫార్సు',
                  'പ്രത്യേക ജോലിക്കായുള്ള AI സാമഗ്രി ശുപാർശ',
                  'ನಿರ್ದಿಷ್ಟ ಕೆಲಸಕ್ಕಾಗಿ AI ವಸ್ತು ಶಿಫಾರಸು'
                )}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {loc(
                'வேலை வகை மற்றும் அளவை உள்ளிடுங்கள். AI துல்லியமான பொருட்கள் பட்டியல், மூட்டைகள்/அளவுகள், உத்தேச பட்ஜெட் மற்றும் பாதுகாப்பு வழிகாட்டலை வழங்கும்.',
                'Enter job type and area dimensions. AI will calculate the exact materials, quantities, estimated budget, and safety gear needed.',
                'कार्य का प्रकार और आयाम दर्ज करें। एआई सामग्री, मात्रा और अनुमानित बजट की गणना करेगा।',
                'పని రకం మరియు కొలతలను నమోదు చేయండి.',
                'ജോലി തരവും അളവുകളും നൽകുക.',
                'ಕೆಲಸದ ಪ್ರಕಾರ ಮತ್ತು ಅಳತೆಗಳನ್ನು ನಮೂದಿಸಿ.'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('வேலை வகை (Job Type)', 'Job Type')}
                </label>
                <select
                  value={jobTypeInput}
                  onChange={(e) => setJobTypeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                >
                  <option value="கான்கிரீட் கூரை (Roof Concrete Pouring)">
                    🏗️ {loc('கான்கிரீட் கூரை ஸ்லாப் (Roof Slab Concrete)', 'Roof Slab Concrete (M20 Grade)')}
                  </option>
                  <option value="சுவர் கட்டுதல் (Brickwork & Plastering)">
                    🧱 {loc('செங்கல் சுவர் & கட்டுமானம் (Brickwork & Mortar)', 'Brickwork & Masonry Wall')}
                  </option>
                  <option value="டைல்ஸ் பதித்தல் (Floor Tile Laying 500 sqft)">
                    ✨ {loc('டைல்ஸ் & தரை பதித்தல் (Tiles Laying)', 'Floor Tiles Laying')}
                  </option>
                  <option value="வீடு பெயிண்டிங் (Painting 2BHK House)">
                    🎨 {loc('வீடு / சுவர் பெயிண்டிங் (Painting 2 Coats)', 'Wall & House Painting')}
                  </option>
                  <option value="பிளம்பிங் பைப்லைன் (Plumbing & Motor Line)">
                    🔧 {loc('குழாய் பதித்தல் & மோட்டார் லைன் (Plumbing & PVC Line)', 'Plumbing & PVC Piping')}
                  </option>
                  <option value="பொதுவான மராமத்து (General Renovation)">
                    🔨 {loc('பொதுவான மராமத்து & பழுதுபார்த்தல் (General Repair)', 'General Civil & Renovation')}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('அளவு / பரப்பளவு (Dimensions / Area sq.ft)', 'Dimensions / Area (sq.ft)')}
                </label>
                <input
                  type="text"
                  value={jobDimensionsInput}
                  onChange={(e) => setJobDimensionsInput(e.target.value)}
                  placeholder="எ.கா: 1000 அல்லது 10x10 அல்லது 1200 sq.ft"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Area Presets */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                {loc('விரைவு அளவுகள் (Quick Sq.Ft Presets):', 'Quick Sq.Ft Presets:')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '100 sq.ft (10x10)', val: '100 sq.ft' },
                  { label: '500 sq.ft', val: '500 sq.ft' },
                  { label: '800 sq.ft', val: '800 sq.ft' },
                  { label: '1000 sq.ft', val: '1000 sq.ft' },
                  { label: '1200 sq.ft', val: '1200 sq.ft' },
                  { label: '1500 sq.ft', val: '1500 sq.ft' },
                  { label: '2000 sq.ft', val: '2000 sq.ft' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setJobDimensionsInput(preset.val);
                      const res = calculateJobMaterialRequirements(jobTypeInput, preset.val);
                      setEstimationResult(res);
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all cursor-pointer ${
                      jobDimensionsInput === preset.val
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunEstimation}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loc('துல்லியமாக கணக்கிடு (Calculate Materials & Cost)', 'Calculate Materials with AI')}</span>
            </button>
          </div>

          {/* Estimation Output Card */}
          {estimationResult && (
            <div className="bg-white rounded-3xl border border-emerald-300 p-4 sm:p-5 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    AI ESTIMATION REPORT
                  </span>
                  <h4 className="font-black text-base text-slate-900 mt-1">
                    {estimationResult.jobTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {loc('அளவு:', 'Measurement:')} <span className="font-bold text-slate-800">{estimationResult.unitMeasurement}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">{loc('மொத்த உத்தேச பட்ஜெட்', 'Est. Total Budget')}</span>
                  <span className="text-base font-black text-emerald-700">
                    {estimationResult.totalEstimatedBudget}
                  </span>
                </div>
              </div>

              {/* Materials Table / Cards */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{loc('தேவைப்படும் பொருட்களின் பட்டியல் & துல்லிய அளவு:', 'Recommended Materials & Precise Quantities:')}</span>
                </h5>

                <div className="space-y-2">
                  {estimationResult.recommendedMaterials.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="font-bold text-xs text-slate-900">
                            {language === 'ta' ? item.nameTa : item.name}
                          </p>
                        </div>
                        {item.unitCost && (
                          <p className="text-[11px] text-emerald-800 font-semibold ml-7 mt-0.5">
                            🏷️ {loc('சந்தை விலை:', 'Unit Rate:')} {item.unitCost}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 ml-7 mt-0.5">💡 {item.tips}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 ml-7 sm:ml-0">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg shadow-2xs">
                          {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {item.estimatedCostRange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Gear */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>{loc('தொழிலாளர் பாதுகாப்பு உபகரணங்கள்:', 'Recommended Safety Gear:')}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {estimationResult.safetyGear.map((gear, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white text-amber-950 font-medium text-[11px] rounded-md border border-amber-200"
                    >
                      🛡️ {gear}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action: Copy list or send to draft */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const text = estimationResult.recommendedMaterials
                      .map((m) => `• ${m.nameTa} (${m.quantity})`)
                      .join('\n');
                    setDraftItems(text);
                    setActiveTab('order_draft');
                  }}
                  className="w-full sm:w-auto flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{loc('இதை ஆர்டர் வரைவாக மாற்று', 'Draft WhatsApp Order with this list')}</span>
                </button>

                <button
                  onClick={() => {
                    const fullText = `*Daily Work AI பொருட்கள் கணக்கீடு*\nவேலை: ${estimationResult.jobTitle}\nஅளவு: ${estimationResult.unitMeasurement}\n\nபொருட்கள்:\n${estimationResult.recommendedMaterials.map((m) => `• ${m.nameTa}: ${m.quantity} (${m.estimatedCostRange})`).join('\n')}\nமொத்த உத்தேச பட்ஜெட்: ${estimationResult.totalEstimatedBudget}`;
                    handleCopy(fullText, 'est_copy');
                  }}
                  className="w-full sm:w-auto py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {copiedKey === 'est_copy'
                      ? loc('நகலெடுக்கப்பட்டது!', 'Copied!')
                      : loc('பட்டியலை நகலெடு', 'Copy Material List')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: CALL & ORDER DRAFT (Prompt 2)
         ======================================================== */}
      {activeTab === 'order_draft' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <FileText className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm sm:text-base">
                {loc(
                  'ஆர்டர் மற்றும் அழைப்புக்கான AI செய்தி வரைவு',
                  'AI Call & Order Message Drafting',
                  'ऑर्डर और कॉल के लिए एआई संदेश ड्राफ्ट',
                  'ఆర్డర్ మరియు కాల్ కోసం AI సందేశ ముసాయిదా',
                  'ഓർഡറിനും കോളിനുമുള്ള AI സന്ദേശ ഡ്രാഫ്റ്റ്',
                  'ಆದೇಶ ಮತ್ತು ಕರೆಗಾಗಿ AI ಸಂದೇಶ ಕರಡು'
                )}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {loc(
                'நீங்கள் வாங்க விரும்பும் கடையை தேர்வு செய்து பொருட்களை உள்ளிடுங்கள். கடைக்காரரிடம் பேசுவதற்கான போன் ஸ்கிரிப்ட் மற்றும் வாட்ஸ்அப்பில் அனுப்பும் தொழில்முறை ஆர்டர் மெசேஜை AI உடனடியாக உருவாக்கி தரும்.',
                'Select a store and enter materials. AI will generate a tailored phone calling script and professional WhatsApp purchase order draft.',
                'दुकान चुनें और सामग्री दर्ज करें। एआई तुरंत फोन कॉल स्क्रिप्ट और व्हाट्सएप ऑर्डर मैसेज तैयार करेगा।',
                'దుకాణాన్ని ఎంచుకుని సామగ్రిని నమోదు చేయండి.',
                'ഷോപ്പ് തിരഞ്ഞെടുത്ത് സാമഗ്രികൾ നൽകുക.',
                'ಅಂಗಡಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ವಸ್ತುಗಳನ್ನು ನಮೂದಿಸಿ.'
              )}
            </p>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('கடையை தேர்வு செய்க', 'Select Target Shop')}
                </label>
                <select
                  value={selectedShopForDraft?.id || ''}
                  onChange={(e) => {
                    const found = shopsList.find((s) => s.id === e.target.value);
                    if (found) setSelectedShopForDraft(found);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-semibold"
                >
                  {shopsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameTa || s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('தேவைப்படும் பொருட்கள் பட்டியல்', 'Required Materials & Quantities')}
                </label>
                <textarea
                  rows={3}
                  value={draftItems}
                  onChange={(e) => setDraftItems(e.target.value)}
                  placeholder="எ.கா: சிமெண்ட் 10 மூட்டை, TMT கம்பி 100 கிலோ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('உங்கள் பெயர் (விருப்பத்தேர்வு)', 'Your Name')}
                  </label>
                  <input
                    type="text"
                    value={draftBuyerName}
                    onChange={(e) => setDraftBuyerName(e.target.value)}
                    placeholder="எ.கா: சுரேஷ் மேஸ்திரி"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('டெலிவரி முகவரி', 'Delivery Site Location')}
                  </label>
                  <input
                    type="text"
                    value={draftAddress}
                    onChange={(e) => setDraftAddress(e.target.value)}
                    placeholder="கட்டுமான தள முகவரி"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generated Result */}
          {selectedShopForDraft && (() => {
            const drafts = generateCallAndOrderDraft(
              selectedShopForDraft,
              draftItems,
              draftAddress,
              draftBuyerName,
              draftBuyerPhone
            );
            const cleanPhone = (selectedShopForDraft.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            return (
              <div className="space-y-3">
                {/* 1. WhatsApp Order Card */}
                <div className="bg-white rounded-3xl border border-green-300 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>{loc('வாட்ஸ்அப் ஆர்டர் வரைவு (WhatsApp Draft)', 'WhatsApp Order Draft')}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(drafts.whatsappTextTa, 'wa_draft')}
                      className="text-[11px] font-bold text-green-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'wa_draft' ? loc('நகலெடுக்கப்பட்டது', 'Copied') : loc('நகலெடு', 'Copy')}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-green-50/70 border border-green-200 rounded-2xl text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {language === 'ta' ? drafts.whatsappTextTa : drafts.whatsappTextEn}
                  </pre>

                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      language === 'ta' ? drafts.whatsappTextTa : drafts.whatsappTextEn
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {loc(
                        `கடைக்காரரின் வாட்ஸ்அப்பிற்கு இந்த ஆர்டரை அனுப்பவும்`,
                        `Send this order to Store via WhatsApp`
                      )}
                    </span>
                  </a>
                </div>

                {/* 2. Phone Call Script Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{loc('போன் பேசும் வழிகாட்டல் (Phone Script)', 'Phone Calling Script')}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(drafts.phoneScriptTa, 'phone_script')}
                      className="text-[11px] font-bold text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'phone_script' ? loc('நகலெடுக்கப்பட்டது', 'Copied') : loc('நகலெடு', 'Copy')}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed italic">
                    "{language === 'ta' ? drafts.phoneScriptTa : drafts.phoneScriptEn}"
                  </div>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>
                      {loc('கடைக்கு நேரடியாக அழைக்கவும்', 'Call Store Directly')}
                    </span>
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================
          TAB 4: STORE & BUSINESS REGISTRATION AND SAVING (Prompt 4)
         ======================================================== */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900">
                <PlusCircle className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-sm sm:text-base">
                  {loc(
                    'கடைகள் & வணிக நிறுவனங்கள் பதிவு செய்து சேமித்தல்',
                    'Register & Save Shop / Business Establishment',
                    'दुकान और व्यवसाय पंजीकरण और बचत',
                    'దుకాణం & వ్యాపార నమోదు & సేవ్',
                    'ഷോപ്പും ബിസിനസ്സും രജിസ്റ്റർ ചെയ്ത് സേവ് ചെയ്യുക',
                    'ಅಂಗಡಿ ಮತ್ತು ವ್ಯಾಪಾರ ನೋಂದಣಿ ಮತ್ತು ಉಳಿಸಿ'
                  )}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {loc(
                'கட்டுமான பொருட்கள், சிமெண்ட், ஹார்டுவேர், எலக்ட்ரிக்கல் மற்றும் இயந்திர வாடகை கடைகள் தங்களின் வணிக விவரங்களை இங்கே பதிவு செய்து சேமிக்கலாம்.',
                'Register hardware stores, cement marts, electrical shops, and tool rental businesses to make them instantly discoverable.',
                'सामग्री, सीमेंट, हार्डवेयर और टूल्स स्टोर का विवरण यहां पंजीकृत और सहेजें।',
                'సామగ్రి, సిమెంట్, హార్డ్‌వేర్ దుకాణాల వివరాలను ఇక్కడ నమోదు చేసి సేవ్ చేయండి.',
                'സാമഗ്രികൾ, സിമന്റ്, ഹാർഡ്‌വെയർ കടകളുടെ വിവരങ്ങൾ ഇവിടെ രജിസ്റ്റർ ചെയ്ത് സൂക്ഷിക്കുക.',
                'ಸಾಮಗ್ರಿ, ಸಿಮೆಂಟ್, ಹಾರ್ಡ್‌ವೇರ್ ಅಂಗಡಿಗಳ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ ಮತ್ತು ಉಳಿಸಿ.'
              )}
            </p>

            {/* Quick Sample Buttons */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{loc('விரைவு மாதிரி விவரங்கள் (1-கிளிக் சோதனை):', 'Quick Sample Presets (1-Click Test):')}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  {loc('படிவத்தை அழி', 'Reset Form')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUseSample('hardware')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  🔧 {loc('மாதிரி 1: ஹார்டுவேர் கடை', 'Sample 1: Hardware')}
                </button>
                <button
                  type="button"
                  onClick={() => handleUseSample('cement')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  🧱 {loc('மாதிரி 2: சிமெண்ட் & மணல்', 'Sample 2: Cement & Sand')}
                </button>
                <button
                  type="button"
                  onClick={() => handleUseSample('rental')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  🏗️ {loc('மாதிரி 3: டூல்ஸ் வாடகை', 'Sample 3: Tools Rental')}
                </button>
              </div>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRegMode('form')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  regMode === 'form' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 {loc('நேரடி பதிவு படிவம்', 'Direct Registration Form')}
              </button>
              <button
                type="button"
                onClick={() => setRegMode('ai_paste')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  regMode === 'ai_paste' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✨ {loc('AI விசிட்டிங் கார்டு / பில் விவரம்', 'AI Smart Paste Text')}
              </button>
            </div>

            {/* AI Smart Paste Textarea */}
            {regMode === 'ai_paste' && (
              <div className="space-y-2 p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700">
                  {loc('விசிட்டிங் கார்டு, பில் அல்லது உரை விவரம் (Raw Store Text)', 'Raw Store Text / Visiting Card')}
                </label>
                <textarea
                  rows={3}
                  value={rawStoreText}
                  onChange={(e) => setRawStoreText(e.target.value)}
                  placeholder="எ.கா: முருகன் ஹார்டுவேர், மெயின் ரோடு, மதுரை. சிமெண்ட், கம்பி, பைப். போன்: 9842100000"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleExtractStore}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-amber-300" />
                  <span>{loc('AI மூலம் விவரங்களை பிரித்தெடுத்து நிரப்பு', 'Extract & Populate Form with AI')}</span>
                </button>
              </div>
            )}

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <span>⚠️ {formError}</span>
              </div>
            )}

            {/* Main Form Fields */}
            <div className="space-y-3 pt-1">
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('கடையின் பெயர் / வணிக நிறுவனம் (Shop Name)', 'Shop Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formShopName}
                  onChange={(e) => {
                    setFormShopName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder={loc('எ.கா: ஸ்ரீ அம்மன் ஹார்டுவேர் & சிமெண்ட் மார்ட்', 'e.g., Sri Amman Hardware & Cement Mart')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Category & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {loc('வணிகப் பிரிவு (Category)', 'Business Category')}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ShopItem['category'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {loc('நகரம் / மாவட்டம் (City / Town)', 'City / Town')}
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="எ.கா: சென்னை, மதுரை, கோவை"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {loc('தொடர்பு எண் (Phone)', 'Contact Phone')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => {
                        setFormPhone(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="10 இலக்க எண் (எ.கா: 9841234567)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {loc('வாட்ஸ்அப் எண் (WhatsApp)', 'WhatsApp Number')}
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-green-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={formWhatsapp}
                      onChange={(e) => setFormWhatsapp(e.target.value)}
                      placeholder={formPhone ? `${formPhone} (அல்லது தனி எண்)` : 'வாட்ஸ்அப் எண்'}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('கடை முகவரி & முக்கிய அடையாளம் (Address / Landmark)', 'Shop Address & Landmark')}
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="எ.கா: 45, ஜிஎஸ்டி மெயின் ரோடு, குரோம்பேட்டை, சென்னை"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Materials Sold */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {loc('கிடைக்கும் முக்கிய பொருட்கள் / சேவைகள் (Materials Sold - காற்புள்ளியிட்டு பிரிக்கவும்)', 'Available Materials & Services (comma-separated)')}
                </label>
                <textarea
                  rows={2}
                  value={formMaterials}
                  onChange={(e) => setFormMaterials(e.target.value)}
                  placeholder="எ.கா: சிமெண்ட், TMT கம்பி, மணல், PVC பைப், கான்கிரீட் மிக்சர் வாடகை"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              {/* Delivery Option Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {loc('கட்டுமான தளத்திற்கு டெலிவரி வசதி (Site Delivery)', 'Site Delivery Available')}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {loc('வாடிக்கையாளர் இடத்திற்கே டெலிவரி செய்யப்படும்', 'Materials will be delivered to site')}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formDelivery}
                  onChange={(e) => setFormDelivery(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* PRIMARY ACTION BUTTON: REGISTER & SAVE */}
              <button
                type="button"
                id="btn-register-save-shop"
                onClick={handleSaveStore}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer"
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
            </div>
          </div>

          {/* Success Notification Banner */}
          {onboardSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-950 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-md">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <p className="font-black text-sm">
                  {loc('கடை வெற்றிகரமாக பதிவு செய்யப்பட்டு சேமிக்கப்பட்டது!', 'Shop Registered & Saved Successfully!')}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {loc(
                    'இப்போது தொழிலாளர்கள் மற்றும் வேலை வழங்குபவர்கள் உங்கள் கடையை காணலாம்.',
                    'Workers & employers can now find your shop on Daily Work.'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Search Modal for Shops */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onApplyQuery={(q) => updateSearchQuery(q)}
        initialQuery={searchQuery}
        initialTarget="shops"
        contextTitleEn="Voice Search Building Materials & Shops"
        contextTitleTa="கட்டுமான கடைகள் & பொருட்கள் குரல் தேடல்"
      />
    </div>
  );
};
