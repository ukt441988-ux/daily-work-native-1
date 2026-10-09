import React, { useState } from 'react';
import { Screen, Job, Advertisement, JobSeeker } from '../types';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { VoiceSearchModal, VoiceSearchTarget } from './VoiceSearchModal';
import { UnifiedVoiceResultsModal } from './UnifiedVoiceResultsModal';
import { AdBannerCarousel } from './AdBannerCarousel';
import { detectQueryIntent, matchJobWithQuery, matchSeekerWithQuery, matchShopWithQuery } from '../utils/universalSearch';
import { getSavedShops } from '../data/shopsData';
import { getFavoriteJobIds, toggleJobFavorite } from '../utils/favoriteStorage';
import {
  Briefcase,
  Search,
  PlusCircle,
  UserCheck,
  PhoneCall,
  Calendar,
  MapPin,
  Heart,
  Users,
  IndianRupee,
  ShieldCheck,
  Clock,
  ArrowRight,
  Users2,
  Megaphone,
  Crown,
  Sparkles,
  Phone,
  Mic,
  Share2,
  Send,
  MessageCircle,
  LifeBuoy,
  Settings,
  Lock,
  HardHat,
  Sun,
  Clover,
  Store,
  Film,
  User,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  jobs: Job[];
  seekers?: JobSeeker[];
  onSelectCategory: (categoryId: string) => void;
  ads?: Advertisement[];
  onVoiceSearch?: (query: string, target?: VoiceSearchTarget) => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  onOpenGitHub?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  jobs = [],
  seekers = [],
  onSelectCategory,
  ads = [],
  onVoiceSearch,
  onOpenHelp,
  onOpenSettings,
  onOpenGitHub,
}) => {
  const { loc, getCategoryName } = useLanguage();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [homeQuery, setHomeQuery] = useState('');
  const [homeSearchTarget, setHomeSearchTarget] = useState<VoiceSearchTarget>('jobs');
  const [unifiedResultsQuery, setUnifiedResultsQuery] = useState<string | null>(null);
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(() => getFavoriteJobIds());

  React.useEffect(() => {
    const handleFavUpdate = () => {
      setFavoriteJobIds(getFavoriteJobIds());
    };
    window.addEventListener('dw_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('dw_favorites_updated', handleFavUpdate);
  }, []);

  const safeJobs = jobs || [];
  const safeSeekers = seekers || [];

  const handleExecuteSearch = (rawQuery: string, target: VoiceSearchTarget = homeSearchTarget) => {
    const trimmed = rawQuery.trim();

    if (target === 'workers') {
      if (onVoiceSearch) onVoiceSearch(trimmed, 'workers');
      else onNavigate('seekers-list');
      return;
    }

    if (target === 'shops') {
      if (onVoiceSearch) onVoiceSearch(trimmed, 'shops');
      else onNavigate('shops');
      return;
    }

    if (target === 'jobs') {
      if (onVoiceSearch) onVoiceSearch(trimmed, 'jobs');
      else onNavigate('jobs');
      return;
    }

    // When target === 'all':
    // Search across Jobs, Workers, and Shops simultaneously
    setUnifiedResultsQuery(trimmed || 'all');
  };

  const handleVoiceApply = (spoken: string, spokenTarget?: VoiceSearchTarget) => {
    const selectedTgt = spokenTarget || homeSearchTarget;
    handleExecuteSearch(spoken, selectedTgt);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(homeQuery, homeSearchTarget);
  };

  // Find recent jobs to display as visual highlights (show 4 items with icons)
  const recentJobs = safeJobs.slice(0, 4);
  const approvedHeroAd = (ads || []).find((a) => a.status === 'approved');

  return (
    <div className="space-y-4 pb-20">
      {/* Pictorial Universal Top Banner: "டெய்லி ஒர்க் / DAILY WORK" */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-emerald-500/30">
        {/* Subtle decorative glow circles */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Centerpiece & Logo: Lucky */}
        <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            {/* Lucky Brand Emblem: Four-leaf clover & golden glow */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg border-2 border-amber-200 shrink-0">
              <Clover className="w-8 h-8 text-emerald-950 fill-emerald-900 drop-shadow-xs" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-tight leading-none drop-shadow-sm font-sans">
                  Lucky
                </h2>
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] sm:text-[11px] rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  APP
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  {loc('தினசரி வேலை & நேரடி கூலி', 'Daily Work & Direct Wage', 'दैनिक कार्य और प्रत्यक्ष मजदूरी', 'రోజువారీ పని & ప్రత్యక్ష వేతనం', 'ദിവസ ജോലി & നേരിട്ടുള്ള കൂലി', 'ದೈನಂದಿನ ಕೆಲಸ & ನೇರ ಕೂಲಿ')}
                </span>
              </div>
            </div>
          </div>

          {/* Profile & My Posts Button + 100% Direct badge */}
          <div className="flex items-center gap-2">
            <button
              id="home-btn-profile"
              type="button"
              onClick={() => onNavigate('my-posts')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-200 active:scale-95 transition-all cursor-pointer"
              title={loc('என் சுயவிவரம் & பதிவுகள்', 'My Profile & Posts', 'प्रोफ़ाइल', 'ప్రొఫైల్', 'പ്രൊഫൈൽ', 'ಪ್ರೊಫೈಲ್')}
            >
              <User className="w-4 h-4 text-slate-950" />
              <span>{loc('சுயவிவரம்', 'Profile', 'प्रोफ़ाइल', 'ప్రొఫైల్', 'പ്രൊഫൈൽ', 'ಪ್ರೊಫೈಲ್')}</span>
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black rounded-xl flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {loc('100% நேரடி தொடர்பு', '100% Direct Call', '100% सीधा संपर्क', '100% ప్రత్యక్షం', '100% നേരിട്ട്', '100% ನೇರ')}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Pure Pictogram Navigation Tiles: Pure symbols only without text as requested */}
        <div className="relative z-10 grid grid-cols-5 gap-2 pt-3">
          {/* Symbol 1: HAT -> Work Category Screen */}
          <button
            id="tile-symbol-categories"
            type="button"
            onClick={() => onNavigate('categories')}
            title={loc('வேலை வகைகள்', 'Work Categories', 'कार्य श्रेणियां', 'పని వర్గాలు', 'ജോലി വിഭാഗങ്ങൾ', 'ಕೆಲಸದ ವರ್ಗಗಳು')}
            aria-label="Work Categories"
            className="h-14 sm:h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <HardHat className="w-8 h-8 text-slate-950 drop-shadow-md group-hover:rotate-6 transition-transform" />
          </button>

          {/* Symbol 2: PEOPLE -> Workers Screen */}
          <button
            id="tile-symbol-seekers"
            type="button"
            onClick={() => onNavigate('seekers-list')}
            title={loc('தொழிலாளர்கள்', 'Workers', 'श्रमिक', 'కార్మికులు', 'തൊഴിലാളികൾ', 'ಕಾರ್ಮಿಕರು')}
            aria-label="Workers Screen"
            className="h-14 sm:h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-400 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <Users className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
          </button>

          {/* Symbol 3: RUPEE -> Advertise / Subscription Screen */}
          <button
            id="tile-symbol-pricing"
            type="button"
            onClick={() => onNavigate('pricing')}
            title={loc('சந்தா & விளம்பரம்', 'Advertise / Plans', 'सब्स्क्रिप्शन', 'సబ్‌స్క్రిప్షన్', 'പ്ലാനുകൾ', 'ಚಂದಾದಾರಿಕೆ')}
            aria-label="Pricing"
            className="h-14 sm:h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-emerald-400 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <IndianRupee className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
          </button>

          {/* Symbol 4: SHOP / BUSINESS -> Shops & Materials Screen */}
          <button
            id="tile-symbol-shops"
            type="button"
            onClick={() => onNavigate('shops')}
            title={loc('கடைகள் & பொருட்கள்', 'Shops & Materials', 'दुकानें', 'దుకాణాలు', 'ഷോപ്പുകൾ', 'ಅಂಗಡಿಗಳು')}
            aria-label="Shops"
            className="h-14 sm:h-16 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-300 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <Store className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
          </button>

          {/* Symbol 5: MEDIA -> Media Ads Screen */}
          <button
            id="tile-symbol-media"
            type="button"
            onClick={() => onNavigate('media-ads')}
            title={loc('மீடியா & வீடியோ விளம்பரங்கள்', 'Media Ads', 'मीडिया विज्ञापन', 'మీడియా ప్రకటనలు', 'മീഡിയ പരസ്യങ്ങൾ', 'ಮಾಧ್ಯಮ ಜಾಹೀರಾತು')}
            aria-label="Media Ads"
            className="h-14 sm:h-16 bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg border-2 border-rose-300 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            <Film className="w-8 h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Pictorial Action Touchbars (Direct Find Work, Hire, & Shop Mart) */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-emerald-800/40">
          <button
            type="button"
            id="home-hero-btn-find-work"
            onClick={() => onNavigate('jobs')}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1 text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <HardHat className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">
              {loc('வேலை தேட', 'Find Work', 'काम खोजें', 'పని వెతకండి', 'ജോലി', 'ಕೆಲಸ')}
            </span>
          </button>

          <button
            type="button"
            id="home-hero-btn-post-job"
            onClick={() => onNavigate('post-job')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1 text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white shrink-0" />
            <span className="truncate">
              {loc('ஆட்கள் தேவை', 'Hire', 'श्रमिक चाहिए', 'కార్మికులు', 'ആളുകൾ', 'ಕಾರ್ಮಿಕರು')}
            </span>
          </button>

          <button
            type="button"
            id="home-hero-btn-add-shop"
            onClick={() => onNavigate('add-shop')}
            title={loc('கடைகள் & வணிக நிறுவனங்கள் பதிவு செய்து சேமிக்க', 'Add & Register Shop', 'दुकान जोड़ें', 'దుకాణం చేర్చండి', 'ഷോപ്പ് ചേർക്കുക', 'ಅಂಗಡಿ ಸೇರಿಸಿ')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1 text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">
              {loc('கடை சேர்க்க', 'Add Shop', 'दुकान जोड़ें', 'దుకాణం చేర్చండి', 'ഷോപ്പ് ചേർക്കുക', 'ಅಂಗಡಿ ಸೇರಿಸಿ')}
            </span>
          </button>
        </div>
      </div>

      {/* VOICE SEARCH BAR */}
      <div className="bg-white rounded-3xl p-3 sm:p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        {/* Search Target Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 rounded-2xl">
          <button
            type="button"
            onClick={() => setHomeSearchTarget('jobs')}
            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              homeSearchTarget === 'jobs'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔨</span>
            <span className="truncate">{loc('வேலைகள்', 'Jobs', 'काम', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸ')}</span>
          </button>
          <button
            type="button"
            onClick={() => setHomeSearchTarget('shops')}
            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
              homeSearchTarget === 'shops'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏪</span>
            <span className="truncate">{loc('கடைகள்', 'Shops', 'दुकानें', 'షాపులు', 'കടകൾ', 'ಅಂಗಡಿ')}</span>
          </button>
        </div>

        {/* Search Input with Search & Mic Buttons */}
        <form onSubmit={handleManualSearchSubmit} className="relative flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="home-voice-search-input"
              type="text"
              value={homeQuery}
              onChange={(e) => setHomeQuery(e.target.value)}
              placeholder={
                homeSearchTarget === 'workers'
                  ? loc(
                      'தொழிலாளர்களைத் தேட (எ.கா: பழனிவேல், பெயிண்டர்)...',
                      'Search workers (e.g. Palanivel, Painter)...',
                      'कारीगर खोजें (उदा: पेंटर, प्लंबर)...',
                      'కార్మికులను శోధించండి...',
                      'തൊഴിലാളികളെ തിരയുക...',
                      'ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ...'
                    )
                  : homeSearchTarget === 'shops'
                  ? loc(
                      'கடைகளைத் தேட (எ.கா: சிமெண்ட், ஹார்டுவேர், கம்பிகள்)...',
                      'Search shops (e.g. Cement, Hardware, TMT)...',
                      'दुकानें खोजें (उदा: सीमेंट, हार्डवेयर)...',
                      'షాపులను శోధించండి...',
                      'കടകൾ തിരയുക...',
                      'ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಿ...'
                    )
                  : homeSearchTarget === 'jobs'
                  ? loc(
                      'வேலைகளைத் தேட (எ.கா: கொத்தனார், டிரைவர், சென்னை)...',
                      'Search jobs (e.g. Mason, Driver, Chennai)...',
                      'काम खोजें (उदा: राजमिस्त्री, ड्राइवर)...',
                      'పనులను శోధించండి...',
                      'ജോലികൾ തിരയുക...',
                      'ಕೆಲಸ ಹುಡುಕಿ...'
                    )
                  : loc(
                      'வேலை, ஆட்கள், கடைகள் அனைத்தையும் தேட...',
                      'Type or speak to search jobs, workers & shops...',
                      'काम, कारीगर या दुकानें खोजें...',
                      'పనులు, కార్మికులు, షாపులను శోధించండి...',
                      'ജോലികൾ, തൊഴിലാளികൾ, കടകൾ തിരയുക...',
                      'ಕೆಲಸ, ಕೆಲಸಗಾರರು, ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಿ...'
                    )
              }
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            <button
              id="home-btn-mic"
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
              title={loc('குரல் மூலம் பேச / Voice Search', 'Voice Search', 'बोलकर खोजें', 'వాయిస్ శోధన', 'വോയ്‌സ് തിരയൽ', 'ಧ್ವನಿ ಹುಡುಕಾಟ')}
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
            </button>
          </div>

          <button
            id="home-btn-search"
            type="submit"
            className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            title={loc('தேட கிளிக் செய்க', 'Search', 'खोजें', 'శోధించండి', 'തിരயുക', 'ಹುಡುಕಿ')}
          >
            <Search className="w-4 h-4" />
            <span>{loc('தேடு', 'Search', 'खोजें', 'శోధించండి', 'തിരயുക', 'ಹುಡುಕಿ')}</span>
          </button>
        </form>
      </div>


      {/* MOVING AD BANNER / SPONSOR SHOWCASE (LOCATED DIRECTLY BELOW VOICE SEARCH AS SPECIFIED) */}
      <div id="home-ad-banner-section" className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-700 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span>{loc('ஓடும் விளம்பர பலகை', 'Running Sponsor Banner', 'चलती विज्ञापन पट्टी', 'నడుస్తున్న ప్రకటన బోర్డు', 'ഓടുന്ന പരസ്യ ബോർഡ്', 'ಚಲಿಸುವ ಜಾಹೀರಾತು ಫಲಕ')}</span>
            <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-rose-200 animate-pulse">
              LIVE
            </span>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('advertise')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{loc('விளம்பரம் செய்ய', 'Post Ad', 'विज्ञापन दें', 'ప్రకటన ఇవ్వండి', 'പരസ്യം ചെയ്യുക', 'ಜಾಹೀರಾತು ನೀಡಿ')}</span>
            <span>→</span>
          </button>
        </div>
        <AdBannerCarousel
          ads={ads}
          defaultMode="ticker"
          showControls={true}
          onNavigateToAdvertise={() => onNavigate('advertise')}
        />
      </div>

      {/* CORE 2 PRIMARY USER ACTIONS REQUIRED BY PROMPT */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {loc('முதன்மை சேவைகள்', 'Main Services', 'मुख्य सेवाएं', 'ప్రధాన సేవలు', 'പ്രധാന സേവനങ്ങൾ', 'ಪ್ರಮುಖ ಸೇವೆಗಳು')}
        </h3>

        {/* ACTION 1: FIND DAILY WORK (Job Seeker) */}
        <div className="bg-white border-2 border-emerald-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {loc('வேலை தேடுபவர்', 'Job Seeker', 'नौकरी चाहने वाला', 'ఉద్యోగార్ధి', 'തൊഴിലന്വേഷകൻ', 'ಉದ್ಯೋಗಾಕಾಂಕ್ಷಿ')}
                </span>
                <span className="text-xs text-emerald-700 font-semibold ml-auto">
                  {safeJobs.length} {loc('வேலைகள் தயார்', 'Jobs Open', 'नौकरियां उपलब्ध', 'పనులు సిద్ధంగా ఉన్నాయి', 'ജോലികൾ ലഭ്യമാണ്', 'ಕೆಲಸಗಳು ಲಭ್ಯ')}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {loc('தினசரி வேலை தேட', 'Find Daily Work', 'दैनिक कार्य खोजें', 'రోజువారీ పనిని కనుగొనండి', 'ദിവസ ജോലി കണ്ടെത്തുക', 'ದೈನಂದಿನ ಕೆಲಸ ಹುಡುಕಿ')}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {loc(
                  'கொத்தனார், பெயிண்டிங், விவசாயம், ஏற்றுதல் போன்ற வேலைகளை பாருங்கள்.',
                  'Browse construction, farming, loading, painting & daily jobs.',
                  'निर्माण, खेती, लोडिंग, पेंटिंग आदि दैनिक कार्य देखें।',
                  'నిర్మాణం, వ్యవసాయం, లోడింగ్, పెయింటింగ్ వంటి పనులను చూడండి.',
                  'നിർമ്മാണം, കൃഷി, ലോഡിംഗ്, പെയിന്റിംഗ് തുടങ്ങിയ ജോലികൾ കാണുക.',
                  'ನಿರ್ಮಾಣ, ಕೃಷಿ, ಲೋಡಿಂಗ್, ಪೇಂಟಿಂಗ್ ಮುಂತಾದ ಕೆಲಸಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
                )}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
            <button
              id="home-btn-find-work"
              onClick={() => onNavigate('jobs')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>
                {loc('வேலைகளை பார்க்க', 'View Available Jobs', 'काम देखें', 'పనులను చూడండి', 'ജോലികൾ കാണുക', 'ಕೆಲಸಗಳನ್ನು ನೋಡಿ')}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              id="home-btn-register-seeker"
              onClick={() => onNavigate('register-seeker')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs active:scale-[0.98] transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>
                {loc('தொழிலாளியாக பதிய', 'Register as Worker', 'श्रमिक के रूप में पंजीकृत हों', 'కార్మికుడిగా నమోదు చేయండి', 'തൊഴിലാളിയായി രജിസ്റ്റർ ചെയ്യുക', 'ಕಾರ್ಮಿಕರಾಗಿ ನೋಂದಾಯಿಸಿ')}
              </span>
            </button>
          </div>
        </div>

        {/* ACTION 2: POST A JOB (Employer) */}
        <div className="bg-white border-2 border-amber-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {loc('முதலாளி / வேலை தருபவர்', 'Employer', 'नियोक्ता / मालिक', 'యజమాని', 'തൊഴിലുടമ', 'ಮಾಲೀಕ')}
                </span>
                <span className="text-[11px] text-amber-800 font-medium ml-auto">
                  {loc('இலவச பதிவு', 'Free Posting', 'मुफ्त पोस्टिंग', 'ఉచిత పోస్టింగ్', 'സൗജന്യ പോസ്റ്റിംഗ്', 'ಉಚಿತ ಪೋಸ್ಟಿಂಗ್')}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {loc('வேலை பதிவு செய்ய', 'Post a Job', 'काम पोस्ट करें', 'పనిని పోస్ట్ చేయండి', 'ജോലി പോസ്റ്റ് ചെയ്യുക', 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ')}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {loc(
                  'உங்கள் பணிக்கு தேவையான ஆட்களை உடனே பெற வேலை விவரங்களை பதியுங்கள்.',
                  'Post your daily work requirement and hire workers immediately.',
                  'अपनी आवश्यकता पोस्ट करें और तुरंत श्रमिक प्राप्त करें।',
                  'మీ పని అవసరాలను పోస్ట్ చేసి వెంటనే కార్మికులను పొందండి.',
                  'നിങ്ങളുടെ ജോലി ആവശ്യകത പോസ്റ്റ് ചെയ്ത് ഉടൻ തൊഴിലാളികളെ കണ്ടെത്തുക.',
                  'ನಿಮ್ಮ ಕೆಲಸದ ಅಗತ್ಯವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ ಮತ್ತು ತಕ್ಷಣವೇ ಕಾರ್ಮಿಕರನ್ನು ಪಡೆಯಿರಿ.'
                )}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
            <button
              id="home-btn-post-job"
              onClick={() => onNavigate('post-job')}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {loc('புதிய வேலை பதிவு', 'Post a Daily Job', 'नया कार्य पोस्ट करें', 'కొత్త పనిని పోస్ట్ చేయండి', 'പുതിയ ജോലി പോസ്റ്റ് ചെയ്യുക', 'ಹೊಸ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ')}
              </span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              id="home-btn-browse-workers"
              onClick={() => onNavigate('seekers-list')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs active:scale-[0.98] transition-all"
            >
              <Users className="w-4 h-4 text-amber-800" />
              <span>
                {loc('ஆட்களை பார்க்க', 'Browse Workers', 'श्रमिक देखें', 'కార్మికులను చూడండి', 'തൊഴിലാളികളെ കാണുക', 'ಕಾರ್ಮಿಕರನ್ನು ನೋಡಿ')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MONETIZATION SERVICE 1: FIND WORKERS (RECRUITMENT SERVICE) */}
      <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white rounded-2xl p-4 shadow-sm border border-teal-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Users2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {loc('அதிக ஆட்கள் தேவைக்கு', 'Bulk Worker Recruitment', 'थोक श्रमिक भर्ती', 'భారీగా కార్మికుల నియామకం', 'കൂടുതൽ തൊഴിലാളികൾക്ക്', 'ಹೆಚ್ಚಿನ ಕಾರ್ಮಿಕರ ಅಗತ್ಯಕ್ಕೆ')}
              </span>
              <h3 className="font-bold text-sm text-white mt-1">
                {loc('ஆட்கள் பெற்றுத்தரும் சேவை', 'Recruitment & Worker Arrangement', 'श्रमिक व्यवस्था सेवा', 'కార్మికుల ఏర్పాట్ల సేవ', 'തൊഴിലാളി ക്രമീകരണ സേവനം', 'ಕಾರ್ಮಿಕ ವ್ಯವಸ್ಥೆ ಸೇವೆ')}
              </h3>
              <p className="text-xs text-teal-200 mt-0.5 leading-relaxed">
                {loc(
                  'ஒரே நேரத்தில் 5 முதல் 50 தினக்கூலி ஆட்கள் தேவையா? எங்கள் உள்ளூர் மேலாளர் மூலம் உறுதி செய்க.',
                  'Need 5 to 50 daily workers for your site? Let our platform arrange verified workers for you.',
                  'क्या आपको एक साथ 5 से 50 दैनिक श्रमिकों की आवश्यकता है? हमारे प्लेटफॉर्म से सत्यापित श्रमिक प्राप्त करें।',
                  'మీ సైట్ కోసం 5 నుండి 50 మంది కార్మికులు అవసరమా? ధృవీకరించబడిన కార్మికులను పొందండి.',
                  'നിങ്ങളുടെ ജോലിക്ക് 5 മുതൽ 50 തൊഴിലാളികളെ ആവശ്യമുണ്ടോ? സ്ഥിരീകരിച്ച തൊഴിലാളികളെ നേടുക.',
                  'ನಿಮ್ಮ ಕೆಲಸಕ್ಕೆ 5 ರಿಂದ 50 ಕಾರ್ಮಿಕರ ಅಗತ್ಯವಿದೆಯೇ? ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಮಿಕರನ್ನು ಪಡೆಯಿರಿ.'
                )}
              </p>
            </div>
          </div>
        </div>

        <button
          id="home-btn-find-workers"
          onClick={() => onNavigate('find-workers')}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <Users2 className="w-4 h-4" />
          <span>
            {loc('ஆட்கள் தேவை கோரிக்கை அனுப்புக (₹199)', 'Request Workers Now (₹199)', 'श्रमिकों का अनुरोध करें (₹199)', 'కార్మికులను అభ్యర్థించండి (₹199)', 'തൊഴിലാളികളെ ആവശ്യപ്പെടുക (₹199)', 'ಕಾರ್ಮಿಕರ ವಿನಂತಿ ಸಲ್ಲಿಸಿ (₹199)')}
          </span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>
      </div>

      {/* MONETIZATION GRID: ADVERTISE + EMPLOYER PLANS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Local Business Ads */}
        <div
          onClick={() => onNavigate('advertise')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-indigo-400 shadow-xs cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-tight">
              {loc('விளம்பரம் செய்ய', 'Advertise With Us', 'हमारे साथ विज्ञापन दें', 'మాతో ప్రకటన చేయండి', 'പരസ്യം ചെയ്യുക', 'ಜಾಹೀರಾತು ನೀಡಿ')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {loc('கடை & தொழில் விளம்பரம்', 'Promote shop or trade', 'दुकान या व्यापार को बढ़ावा दें', 'దుకాణం లేదా వ్యాపార ప్రచారం', 'വ്യാപാരം പ്രോത്സാഹിപ്പിക്കുക', 'ವ್ಯಾಪಾರ ಪ್ರಚಾರ')}
            </p>
          </div>
          <span className="text-[10px] text-indigo-700 font-bold block pt-1 border-t border-slate-100">
            ₹499 {loc('முதல்', 'onwards', 'से शुरू', 'నుండి', 'മുതൽ', 'ಪ್ರಾರಂಭ')} &rarr;
          </span>
        </div>

        {/* Employer Premium Plans */}
        <div
          onClick={() => onNavigate('pricing')}
          className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-amber-400 shadow-xs cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-tight">
              {loc('முதலாளி சந்தா', 'Employer Plans', 'नियोक्ता योजनाएं', 'యజమాని ప్రణాళికలు', 'തൊഴിലുടമ പ്ലാനുകൾ', 'ಮಾಲೀಕರ ಯೋಜನೆಗಳು')}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {loc('வரம்பற்ற பதிவுகள் & பேட்ஜ்', 'Unlimited & Featured', 'असीमित और विशेष', 'అపరిమిత & ఫీచర్ చేయబడింది', 'പരിധിയില്ലാത്തതും ഫീച്ചർ ചെയ്തതും', 'ಅನಿಯಮಿತ & ವೈಶಿಷ್ಟ್ಯ')}
            </p>
          </div>
          <span className="text-[10px] text-amber-700 font-bold block pt-1 border-t border-slate-100">
            {loc('திட்டங்களை காண்க', 'View Plans', 'योजनाएं देखें', 'ప్రణాళికలను చూడండి', 'പ്ലാനുകൾ കാണുക', 'ಯೋಜನೆಗಳನ್ನು ನೋಡಿ')} &rarr;
          </span>
        </div>
      </div>

      {/* WORK CATEGORIES QUICK ACCESS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {loc('வேலை வகைகள்', 'Work Categories', 'कार्य श्रेणियां', 'పని విభాగాలు', 'ജോലി വിഭാഗങ്ങൾ', 'ಕೆಲಸದ ವರ್ಗಗಳು')}
            </h3>
            <p className="text-[11px] text-slate-500">
              {loc('வகை வாரியாக வேலைகளை தேட அழுத்தவும்', 'Tap to filter jobs by skill', 'कौशल के अनुसार काम खोजने के लिए टैप करें', 'నైపుణ్యం ఆధారంగా శోధించడానికి నొక్కండి', 'വിഭാഗം അനുസരിച്ച് ജോലി തിരയാൻ ക്ലിക്ക് ചെയ്യുക', 'ವರ್ಗವಾರು ಕೆಲಸ ಹುಡುಕಲು ಟ್ಯಾಪ್ ಮಾಡಿ')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            {loc('அனைத்தும்', 'View All', 'सभी देखें', 'అన్నీ చూడండి', 'എല്ലാം കാണുക', 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ')} &rarr;
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {WORK_CATEGORIES.slice(0, 6).map((cat) => {
            const magic = getCategoryMagicTheme(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onNavigate('jobs');
                }}
                className={`flex flex-col items-center justify-center p-2.5 bg-white hover:bg-slate-50 border ${magic.border} ${magic.hoverBorder} hover:shadow-md rounded-2xl text-center transition-all active:scale-95 group relative overflow-hidden`}
              >
                <div className={`w-11 h-11 rounded-xl ${magic.iconBg} flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110`}>
                  <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight group-hover:text-slate-950">
                  {getCategoryName(cat)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  ~₹{cat.suggestedWage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECENT POSTED JOBS PREVIEW */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-sm">
              {loc('சமீபத்திய வேலைகள்', 'Latest Jobs', 'नवीनतम नौकरियां', 'తాజా పనులు', 'ഏറ്റവും പുതിയ ജോലികൾ', 'ಇತ್ತೀಚಿನ ಕೆಲಸಗಳು')}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {loc('மேலும் காண்க', 'See all', 'सभी देखें', 'అన్నీ చూడండి', 'കൂടുതൽ കാണുക', 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ')} ({safeJobs.length})
          </button>
        </div>

        <div className="space-y-2.5">
          {recentJobs.map((job) => {
            const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
            const magic = getCategoryMagicTheme(job.category);
            return (
              <div
                key={job.id}
                onClick={() => onNavigate('jobs')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-all hover:shadow-xs relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${magic.iconBg}`}>
                      <CategoryIcon name={cat ? cat.iconName : 'Briefcase'} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${magic.badge}`}>
                        {cat ? getCategoryName(cat) : job.category}
                      </span>
                      <h5 className="font-bold text-sm text-slate-900 mt-1">
                        {job.employerName}
                      </h5>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJobFavorite(job.id);
                      }}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        favoriteJobIds.includes(job.id)
                          ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                          : 'bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-xs'
                      }`}
                      title={favoriteJobIds.includes(job.id) ? loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites') : loc('விருப்பத்தில் சேமி', 'Save to Favorites')}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favoriteJobIds.includes(job.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-700">
                        ₹{job.dailyWage}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                      {job.wageType === 'hourly'
                        ? loc('/ மணி', '/ hour', '/ घंटा', '/ గంట', '/ മണിക്കൂർ', '/ ಗಂಟೆ')
                        : job.wageType === 'half_day'
                        ? loc('/ அரை நாள்', '/ half day', '/ आधा दिन', '/ అర రోజు', '/ അര ദിവസം', '/ ಅರ್ಧ ದಿನ')
                        : job.wageType === 'contract'
                        ? loc('/ ஒப்பந்தம்', '/ contract', '/ ठेका', '/ ఒప్పందం', '/ കരാർ', '/ ಗುತ್ತಿಗೆ')
                        : loc('/ நாள்', '/ day', '/ दिन', '/ రోజు', '/ ദിവസം', '/ ದಿನ')}
                    </p>
                    {job.isWageNegotiable && (
                      <span className="inline-block text-[9px] font-black text-amber-900 bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 rounded-full shadow-xs">
                        🤝 {loc('பேசலாம்', 'Negotiable', 'बातचीत', 'చర్చించవచ్చు', 'സംസാരിക്കാം', 'ಮಾತುಕತೆ')}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-600 font-bold mt-1">
                      {job.workersNeeded} {loc('ஆட்கள் தேவை', 'Workers Needed', 'श्रमिक चाहिए', 'కార్మికులు అవసరం', 'തൊഴിലാളികൾ ആവശ്യമുണ്ട്', 'ಕಾರ್ಮಿಕರು ಬೇಕು')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Social Media Community & Daily Alerts Section */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                {loc('சமூக ஊடக குழுக்கள் & அறிவிப்புகள்', 'Social Media & Daily Alerts', 'सोशल मीडिया और दैनिक अलर्ट', 'సోషల్ మీడియా & రోజువారీ హెచ్చరికలు', 'സോഷ്യൽ മീഡിയ & അറിയിപ്പുകൾ', 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ ಮತ್ತು ದೈನಂದಿನ ಎಚ್ಚರಿಕೆಗಳು')}
              </h4>
              <p className="text-[10px] text-emerald-200/90">
                {loc('உடனடி வேலை தகவல்களை பெற இணையுங்கள்', 'Join channels for live daily jobs', 'लाइव जॉब अपडेट के लिए जुड़ें', 'లైవ్ జాబ్ అప్‌డేట్‌ల కోసం చేరండి', 'തത്സമയ ജോലികൾക്കായി ചേരുക', 'ದೈನಂದಿನ ಉದ್ಯೋಗ ನವೀಕರಣಗಳಿಗಾಗಿ ಸೇರಿ')}
              </p>
            </div>
          </div>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* WhatsApp Channel */}
          <a
            href="https://whatsapp.com/channel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2.5 bg-emerald-700/60 hover:bg-emerald-600/70 border border-emerald-500/40 rounded-xl transition-all active:scale-95"
          >
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-[11px] leading-tight">WhatsApp</p>
              <p className="text-[9px] text-emerald-200">{loc('தினசரி வேலைகள்', 'Daily Jobs', 'दैनिक कार्य', 'రోజువారీ పనులు', 'ദിവസ ജോലികൾ', 'ದೈನಂದಿನ ಕೆಲಸಗಳು')}</p>
            </div>
          </a>

          {/* Telegram Channel */}
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2.5 bg-emerald-700/60 hover:bg-emerald-600/70 border border-emerald-500/40 rounded-xl transition-all active:scale-95"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-[11px] leading-tight">Telegram</p>
              <p className="text-[9px] text-emerald-200">{loc('வேலை அறிவிப்புகள்', 'Job Alerts', 'कार्य अलर्ट', 'ఉద్యోగ హెచ్చరికలు', 'തൊഴിൽ മുന്നറിയിപ്പുകൾ', 'ಉದ್ಯೋಗ ಎಚ್ಚರಿಕೆಗಳು')}</p>
            </div>
          </a>
        </div>

        {/* Share App Button */}
        <button
          type="button"
          onClick={async () => {
            const shareData = {
              title: 'Daily Work',
              text: 'Daily Wage Jobs Platform - நேரடி தினக்கூலி வேலைவாய்ப்புகள்!',
              url: window.location.href,
            };
            if (navigator.share) {
              try {
                await navigator.share(shareData);
              } catch (e) {
                // Ignore cancel
              }
            } else {
              navigator.clipboard?.writeText(window.location.href);
              alert(loc('லிங்க் நகலெடுக்கப்பட்டது!', 'App link copied to clipboard!', 'ऐप लिंक कॉपी किया गया!', 'యాప్ లింక్ కాపీ చేయబడింది!', 'ആപ്പ് ലിങ്ക് പകർത്തി!', 'ಅಪ್ಲಿಕೇಶನ್ ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!'));
            }
          }}
          className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {loc('செயலியை நண்பர்களுக்கு பகிருங்கள் (Share App)', 'Share Daily Work App with Friends', 'दोस्तों के साथ ऐप शेयर करें', 'స్నేహితులతో యాప్‌ను పంచుకోండి', 'സുഹൃത്തുക്കളുമായി ആപ്പ് പങ്കിടുക', 'ಸ್ನೇಹಿತರೊಂದಿಗೆ ಅಪ್ಲಿಕೇಶನ್ ಹಂಚಿಕೊಳ್ಳಿ')}
          </span>
        </button>
      </div>

      {/* 1-Click GitHub Direct Sync Quick Action */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-sm border border-emerald-500/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg shrink-0">
            🐙
          </div>
          <div className="min-w-0 truncate">
            <p className="font-bold text-xs text-white truncate">
              {loc('GitHub நேரடி அப்லோடர் (1-Click Sync)', '1-Click Direct GitHub Sync', 'सीधा गिटहब अपलोडर', 'డైరెక్ట్ గిట్‌హబ్ అప్‌లోడర్', 'ഡയറക്ട് ഗിറ്റ്ഹബ് അപ്‌ലോഡർ', 'ಡೈರೆಕ್ಟ್ ಗಿಟ್‌ಹಬ್ ಅಪ್‌ಲೋಡರ್')}
            </p>
            <p className="text-[10px] text-emerald-300 truncate">
              {loc('முழு 85 செயலிக் கோப்புகளையும் GitHub-ல் ஏற்றவும்', 'Upload all 85 source files to GitHub', 'सभी 85 फाइलें गिटहब में अपलोड करें', 'మొత్తం 85 ఫైళ్ళను గిట్‌హబ్‌లో అప్‌లోడ్ చేయండి', '85 ഫയലുകളും GitHub-ലേക്ക് അപ്‌ലോഡ് ചെയ്യുക', 'ಎಲ್ಲಾ 85 ಕಡತಗಳನ್ನು GitHub ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenGitHub || onOpenSettings}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 shadow transition-all active:scale-95 cursor-pointer"
        >
          {loc('திறக்க ↗', 'Open ↗', 'खोलें ↗', 'తెరవండి ↗', 'തുറക്കുക ↗', 'ತೆರೆಯಿರಿ ↗')}
        </button>
      </div>

      {/* Help & Support / Contact Management & Security Quick Action */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenHelp}
          className="p-3 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center gap-2.5 text-left transition-all shadow-xs hover:shadow active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-800 leading-tight truncate">
              {loc('உதவி & ஆதரவு', 'Help & Support', 'सहायता और समर्थन', 'సహాయం మరియు మద్దతు', 'സഹായവും പിന്തുണയും', 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ')}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {loc('நிர்வாக குழு தொடர்பு', 'Contact Management', 'प्रबंधन से संपर्क करें', 'మేనేజ్‌మెంట్‌ను సంప్రదించండి', 'മാനേജ്‌മെന്റുമായി ബന്ധപ്പെടുക', 'ಆಡಳಿತವನ್ನು ಸಂಪರ್ಕಿಸಿ')}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-3 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl flex items-center gap-2.5 text-left transition-all shadow-xs hover:shadow active:scale-95 group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-800 leading-tight truncate">
              {loc('பாதுகாப்பு & அமைப்புகள்', 'Safety & Settings', 'सुरक्षा और सेटिंग्स', 'భద్రత మరియు సెట్టింగ్‌లు', 'സുരക്ഷയും ക്രമീകരണങ്ങളും', 'ಭದ್ರತೆ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು')}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {loc('என்க்ரிப்ஷன் & மொழிகள்', 'Encryption & Language', 'एन्क्रिप्शन और भाषा', 'ఎన్‌క్రిప్షన్ మరియు భాష', 'എൻക്രിപ്ഷനും ഭാഷയും', 'ಎನ್‌ಕ್ರಿಪ್ಶನ್ ಮತ್ತು ಭಾಷೆ')}
            </p>
          </div>
        </button>
      </div>

      {/* Trust & Safety notice */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">
            {loc('நேரடி தினக்கூலி - கட்டணம் இல்லை', 'Direct Daily Wages - No Middlemen', 'प्रत्यक्ष दैनिक वेतन - कोई बिचौलिया नहीं', 'ప్రత్యక్ష రోజువారీ వేతనాలు - మధ్యవర్తులు లేరు', 'നേരിട്ടുള്ള ദിവസക്കൂലി - ഇടനിലക്കാരില്ല', 'ನೇರ ದೈನಂದಿನ ಕೂಲಿ - ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            {loc(
              'முதலாளிகளும் தொழிலாளர்களும் நேரடியாக பேசிக்கொள்ளலாம். எந்த மறைமுக கட்டணமும் இல்லை.',
              'Direct communication between workers and employers. No charges or cuts.',
              'श्रमिक और नियोक्ता सीधे संवाद कर सकते हैं। कोई छिपे हुए शुल्क नहीं।',
              'కార్మికులు మరియు యజమానులు నేరుగా మాట్లాడుకోవచ్చు. ఎటువంటి రుసుములు లేవు.',
              'തൊഴിലാളികളും തൊഴിലുടമകളും നേരിട്ട് ആശയവിനിമയം നടത്തുന്നു. മറഞ്ഞിരിക്കുന്ന ചാർജുകളൊന്നുമില്ല.',
              'ಕಾರ್ಮಿಕರು ಮತ್ತು ಮಾಲೀಕರು ನೇರವಾಗಿ ಸಂವಹನ ನಡೆಸಬಹುದು. ಯಾವುದೇ ಶುಲ್ಕಗಳಿಲ್ಲ.'
            )}
          </p>
        </div>
      </div>

      {/* Multi-Category Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onApplyQuery={handleVoiceApply}
        initialQuery={homeQuery}
        initialTarget="all"
        allowedTargets={['all']}
        contextTitleEn="Voice Search Jobs, Workers or Shops"
        contextTitleTa="வேலை, ஆட்கள், கடைகள் குரல் தேடல்"
      />

      {/* Unified Voice Search Results Modal */}
      {unifiedResultsQuery && (
        <UnifiedVoiceResultsModal
          isOpen={Boolean(unifiedResultsQuery)}
          onClose={() => setUnifiedResultsQuery(null)}
          query={unifiedResultsQuery}
          jobs={safeJobs}
          seekers={seekers}
          onNavigate={onNavigate}
          onSelectJobSearch={(q) => {
            if (onVoiceSearch) onVoiceSearch(q, 'jobs');
            else {
              onNavigate('jobs');
            }
          }}
          onSelectSeekerSearch={(q) => {
            if (onVoiceSearch) onVoiceSearch(q, 'workers');
            else {
              onNavigate('seekers-list');
            }
          }}
          onSelectShopSearch={(q) => {
            if (onVoiceSearch) onVoiceSearch(q, 'shops');
            else {
              onNavigate('shops');
            }
          }}
        />
      )}
    </div>
  );
};
