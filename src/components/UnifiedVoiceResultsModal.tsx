import React, { useState, useEffect, useMemo } from 'react';
import { Job, JobSeeker, ShopItem, Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getSavedShops } from '../data/shopsData';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { matchJobWithQuery, matchSeekerWithQuery, matchShopWithQuery, detectQueryIntent } from '../utils/universalSearch';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  X,
  Briefcase,
  Users,
  Store,
  Phone,
  MessageSquare,
  MapPin,
  IndianRupee,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface UnifiedVoiceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  jobs: Job[];
  seekers: JobSeeker[];
  onNavigate: (screen: Screen) => void;
  onSelectJobSearch: (query: string) => void;
  onSelectSeekerSearch: (query: string) => void;
  onSelectShopSearch: (query: string) => void;
}

export const UnifiedVoiceResultsModal: React.FC<UnifiedVoiceResultsModalProps> = ({
  isOpen,
  onClose,
  query,
  jobs = [],
  seekers = [],
  onNavigate,
  onSelectJobSearch,
  onSelectSeekerSearch,
  onSelectShopSearch,
}) => {
  const { loc, language, getCategoryName } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'workers' | 'shops'>('all');
  const [searchTerm, setSearchTerm] = useState(query === 'all' ? '' : query);

  useEffect(() => {
    setSearchTerm(query === 'all' ? '' : query);
    if (query && query !== 'all') {
      const intent = detectQueryIntent(query);
      setActiveTab(intent);
    } else {
      setActiveTab('all');
    }
  }, [query]);

  // Handle hardware / browser back button and Escape key to close modal smoothly
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Push state for mobile hardware back button
    const stateObj = { dw_modal: 'unified_results' };
    try {
      window.history.pushState(stateObj, '');
    } catch {}

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const allShops: ShopItem[] = useMemo(() => getSavedShops(), []);
  const activeQuery = searchTerm.trim();
  const isBrowseAll = !activeQuery || activeQuery.toLowerCase() === 'all';

  // Safe universal filter Jobs (memoized)
  const matchedJobs = useMemo(() => {
    return isBrowseAll
      ? jobs
      : jobs.filter((job) => matchJobWithQuery(job, activeQuery));
  }, [jobs, activeQuery, isBrowseAll]);

  // Safe universal filter Workers / Seekers (memoized)
  const matchedWorkers = useMemo(() => {
    return isBrowseAll
      ? seekers
      : seekers.filter((seeker) => matchSeekerWithQuery(seeker, activeQuery));
  }, [seekers, activeQuery, isBrowseAll]);

  // Safe universal filter Shops (memoized)
  const matchedShops = useMemo(() => {
    return isBrowseAll
      ? allShops
      : allShops.filter((shop) => matchShopWithQuery(shop, activeQuery));
  }, [allShops, activeQuery, isBrowseAll]);

  const totalResults = matchedJobs.length + matchedWorkers.length + matchedShops.length;

  const handleGoToJobs = () => {
    onSelectJobSearch(isBrowseAll ? '' : activeQuery);
    onNavigate('jobs');
    onClose();
  };

  const handleGoToWorkers = () => {
    onSelectSeekerSearch(isBrowseAll ? '' : activeQuery);
    onNavigate('seekers-list');
    onClose();
  };

  const handleGoToShops = () => {
    onSelectShopSearch(isBrowseAll ? '' : activeQuery);
    onNavigate('shops');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-3.5 sm:p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 text-white flex items-center gap-1 text-xs font-bold transition-all cursor-pointer mr-0.5"
                title={loc('பின்செல்ல', 'Back', 'वापस', 'వెనుకకు', 'തിരികെ', 'ಹಿಂದೆ')}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[11px] font-bold">{loc('பின்செல்ல', 'Back', 'वापस', 'వెనుకకు', 'തിരികെ', 'ಹಿಂದೆ')}</span>
              </button>
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg leading-tight flex items-center gap-1.5">
                  <span>{loc('ஒருங்கிணைந்த தேடல் (வேலை • ஆட்கள் • கடைகள்)', 'All Search: Jobs, Workers & Shops', 'सर्व-इन-वन खोज: काम, कारीगर और दुकानें', 'ఆల్-ఇన్-వన్ శోధన: పనులు, కార్మికులు, దుకాణాలు', 'ഓൾ-ഇൻ-വൺ തിരയൽ: ജോലികൾ, തൊഴിലാളികൾ, കടകൾ', 'ಎಲ್ಲಾ-ಇನ್-ಒನ್ ಹುಡುಕಾಟ: ಕೆಲಸ, ಕೆಲಸಗಾರರು ಮತ್ತು ಅಂಗಡಿಗಳು')}</span>
                </h3>
                <p className="text-xs text-emerald-200 flex items-center gap-1.5 mt-0.5">
                  <span>
                    {isBrowseAll
                      ? loc('அனைத்து பிரிவுகளும் ஒரே இடத்தில்:', 'All listings across all 3 sections:', 'सभी सूचियां:', 'అన్ని విభాగాలు:', 'എല്ലാ ലിസ്റ്റിംഗുകളും:', 'ಎಲ್ಲಾ ಪಟ್ಟಿಗಳು:')
                      : loc('தேடப்பட்ட சொல்:', 'Searched query:', 'खोजा गया:', 'శోధించిన పదం:', 'തിരഞ്ഞ വാക്ക്:', 'ಹುಡುಕಿದ ಪದ:')}
                  </span>
                  {!isBrowseAll && (
                    <span className="font-bold bg-emerald-950/70 text-amber-300 px-2 py-0.5 rounded-md border border-emerald-600/50">
                      "{activeQuery}"
                    </span>
                  )}
                  <span className="text-[11px] bg-emerald-500/30 text-white px-1.5 py-0.5 rounded-full font-bold">
                    {totalResults} {loc('முடிவுகள்', 'results', 'परिणाम', 'ఫలితాలు', 'ഫലങ്ങൾ', 'ಫಲಿತಾಂಶಗಳು')}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={loc('மூடு', 'Close', 'बंद करें', 'మూసివేయి', 'അടയ്ക്കുക', 'ಮುಚ್ಚಿ')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time search filter input */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={loc(
                'வேலை, ஆட்கள் அல்லது கடைகளை தேட தட்டச்சு செய்க...',
                'Type to search Jobs, Workers or Shops...',
                'काम, कारीगर या दुकान खोजने के लिए टाइप करें...',
                'పని, కార్మికుడు లేదా దుకాణం కోసం టైప్ చేయండి...',
                'ജോലി, തൊഴിലാളി അല്ലെങ്കിൽ കട തിരയാൻ ടൈപ്പ് ചെയ്യുക...',
                'ಕೆಲಸ, ಕೆಲಸಗಾರ ಅಥವಾ ಅಂಗಡಿ ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ...'
              )}
              className="w-full pl-9 pr-8 py-2 bg-emerald-950/70 border border-emerald-600/60 rounded-xl text-xs sm:text-sm text-white placeholder:text-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Filter Tabs */}
          <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-emerald-700/50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{loc('அனைத்தும்', 'All', 'सभी', 'అన్నీ', 'എല്ലാം', 'ಎಲ್ಲಾ')}</span>
              <span className="text-[10px] opacity-80">({totalResults})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{loc('வேலைகள்', 'Jobs', 'काम', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸಗಳು')}</span>
              <span className="text-[10px] opacity-80">({matchedJobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workers')}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{loc('ஆட்கள்', 'Workers', 'कारीगर', 'కార్మికులు', 'ആളുകൾ', 'ಕೆಲಸಗಾರರು')}</span>
              <span className="text-[10px] opacity-80">({matchedWorkers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shops')}
              className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'shops'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-emerald-950/50 text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{loc('கடைகள்', 'Shops', 'दुकानें', 'షాపులు', 'ഷോപ്പുകൾ', 'ಅಂಗಡಿಗಳು')}</span>
              <span className="text-[10px] opacity-80">({matchedShops.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Results List */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {totalResults === 0 && (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">
                {loc('முடிவுகள் எதுவும் கிடைக்கவில்லை', 'No matches found', 'कोई परिणाम नहीं मिला', 'ఫలితాలు కనుగొనబడలేదు', 'ഫലങ്ങളൊന്നും ലഭ്യമല്ല', 'ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ')}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {loc(
                  'வேறு வார்த்தைகளை கூறி மீண்டும் பேசவும் அல்லது கீழே உள்ள பிரிவுகளை தேர்ந்தெடுக்கவும்.',
                  'Try speaking different keywords like "Mason", "Painter", "Cement shop", or "Chennai".',
                  'अन्य कीवर्ड बोलकर पुनः प्रयास करें।',
                  'మరొక పదం మాట్లాడి ప్రయత్నించండి.',
                  'മറ്റൊരു വാക്ക് സംസാരിച്ച് ശ്രമിക്കുക.',
                  'ಮತ್ತೊಂದು ಪದ ಮಾತನಾಡಿ ಪ್ರಯತ್ನಿಸಿ.'
                )}
              </p>
            </div>
          )}

          {/* SECTION 1: JOBS */}
          {(activeTab === 'all' || activeTab === 'jobs') && matchedJobs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>{loc('பொருந்தும் வேலைகள்', 'Matching Jobs', 'संबंधित काम', 'సరిపోలే పనులు', 'പൊരുത്തപ്പെടുന്ന ജോലികൾ', 'ಹೊಂದಾಣಿಕೆಯ ಕೆಲಸಗಳು')}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {matchedJobs.length}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={handleGoToJobs}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{loc('அனைத்து வேலைகள் பார்க்க', 'View all jobs', 'सभी काम देखें', 'అన్ని పనులు చూడండి', 'എല്ലാ ജോലികളും കാണുക', 'ಎಲ್ಲಾ ಕೆಲಸ ನೋಡಿ')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid gap-2.5">
                {matchedJobs.slice(0, activeTab === 'jobs' ? 10 : 3).map((job) => {
                  const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
                  const magic = getCategoryMagicTheme(job.category);
                  const catName = cat ? getCategoryName(cat) : (job.customCategoryName || job.category);
                  const cleanPhone = (job.contactNumber || (job as any).phone || '').replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={job.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${magic.iconBg}`}>
                            <CategoryIcon name={cat ? cat.iconName : 'Briefcase'} className="w-5 h-5" />
                          </div>
                          <div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${magic.badge}`}>
                              {catName}
                            </span>
                            <h5 className="font-black text-slate-900 text-sm leading-snug mt-1">
                              {job.employerName}
                            </h5>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{job.location}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-block border border-emerald-200/60">
                            ₹{job.dailyWage || 500}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {job.workersNeeded || 1} {loc('ஆட்கள் தேவை', 'workers needed', 'श्रमिक चाहिए', 'కార్మికులు అవసరం', 'തൊഴിലാളികൾ വേണം', 'ಕೆಲಸಗಾರರು ಬೇಕು')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">
                          {job.location}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-xl text-xs"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`tel:${cleanPhone}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs shadow-xs"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{loc('அழைக்க', 'Call', 'कॉल', 'కాల్', 'വിളിക്കുക', 'ಕರೆ')}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: WORKERS / SEEKERS */}
          {(activeTab === 'all' || activeTab === 'workers') && matchedWorkers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{loc('பொருந்தும் தொழிலாளர்கள்', 'Matching Workers / People', 'संबंधित कामगार', 'సరిపోలే కార్మికులు', 'പൊരുത്തപ്പെടുന്ന തൊഴിലാളികൾ', 'ಹೊಂದಾಣಿಕೆಯ ಕೆಲಸಗಾರರು')}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {matchedWorkers.length}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={handleGoToWorkers}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{loc('அனைத்து தொழிலாளர்கள்', 'View all workers', 'सभी कामगार देखें', 'అన్ని కార్మికులను చూడండి', 'എല്ലാ തൊഴിലാളികളെയും കാണുക', 'ಎಲ್ಲಾ ಕೆಲಸಗಾರರನ್ನು ನೋಡಿ')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid gap-2.5">
                {matchedWorkers.slice(0, activeTab === 'workers' ? 10 : 3).map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-black text-slate-900 text-sm">
                            {worker.name}
                          </h5>
                          {worker.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-blue-700 font-bold mt-0.5">
                          {worker.category} • {worker.experienceYears || 2}+ {loc('வருட அனுபவம்', 'yrs exp', 'वर्ष अनुभव', 'సం. అనుభవం', 'വർഷ പരിചയം', 'ವರ್ಷ ಅನುಭವ')}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{worker.location}</span>
                        </p>
                      </div>
                      {worker.dailyWageExpected && (
                        <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                          ₹{worker.dailyWageExpected}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-emerald-600 font-bold">
                        ● {loc('பணிக்கு தயார்', 'Available now', 'उपलब्ध', 'అందుబాటులో ఉంది', 'ലഭ്യമാണ്', 'ಲಭ್ಯವಿದೆ')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {worker.phone && (
                          <a
                            href={`https://wa.me/91${worker.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-xl text-xs"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`tel:${worker.phone}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{loc('அழைக்க', 'Call', 'कॉल', 'కాల్', 'വിളിക്കുക', 'ಕರೆ')}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: SHOPS & MATERIALS */}
          {(activeTab === 'all' || activeTab === 'shops') && matchedShops.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>{loc('பொருந்தும் கடைகள் & நிறுவனங்கள்', 'Matching Stores & Shops', 'संबंधित दुकानें', 'సరిపోలే షాపులు', 'പൊരുത്തപ്പെടുന്ന ഷോപ്പുകൾ', 'ಹೊಂದಾಣಿಕೆಯ ಅಂಗಡಿಗಳು')}</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {matchedShops.length}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={handleGoToShops}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{loc('அனைத்து கடைகள் பார்க்க', 'View all shops', 'सभी दुकानें देखें', 'అన్ని షాపులను చూడండి', 'എല്ലാ ഷോപ്പുകളും കാണുക', 'ಎಲ್ಲಾ ಅಂಗಡಿಗಳನ್ನು ನೋಡಿ')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid gap-2.5">
                {matchedShops.slice(0, activeTab === 'shops' ? 10 : 3).map((shop) => (
                  <div
                    key={shop.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        {shop.imageUrl ? (
                          <img
                            src={shop.imageUrl}
                            alt={shop.name}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                            <Store className="w-6 h-6 text-amber-700" />
                          </div>
                        )}
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">
                            {language === 'ta' && shop.nameTa ? shop.nameTa : shop.name}
                          </h5>
                          <p className="text-xs text-amber-700 font-bold mt-0.5">
                            {language === 'ta' && shop.categoryLabelTa ? shop.categoryLabelTa : shop.categoryLabelEn}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{shop.address || `${shop.city}, Tamil Nadu`}</span>
                          </p>
                        </div>
                      </div>
                      {shop.deliveryAvailable && (
                        <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0 border border-emerald-200/50 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {loc('டெலிவரி உண்டு', 'Delivery', 'डिलीवरी', 'డెలివరీ', 'ഡെലിവറി', 'ವಿತರಣೆ')}
                        </span>
                      )}
                    </div>

                    {shop.materialsList && shop.materialsList.length > 0 && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-1">
                        📦 {(language === 'ta' && shop.materialsListTa ? shop.materialsListTa : shop.materialsList).join(', ')}
                      </div>
                    )}

                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-slate-500">
                        {shop.phone}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {shop.whatsapp && (
                          <a
                            href={`https://wa.me/91${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-xl text-xs"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`tel:${shop.phone}`}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{loc('அழைக்க', 'Call', 'कॉल', 'కాల్', 'വിളിക്കുക', 'ಕರೆ')}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Short-Cuts */}
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGoToJobs}
            className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">{loc('வேலைகள் தளம்', 'Jobs Portal', 'काम पोर्टल', 'పనుల పోర్టల్', 'ജോലികൾ', 'ಕೆಲಸಗಳು')}</span>
          </button>

          <button
            type="button"
            onClick={handleGoToWorkers}
            className="py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1 border border-blue-200 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">{loc('ஆட்கள் தளம்', 'Workers Portal', 'कारीगर पोर्टल', 'కార్మికుల పోర్టల్', 'തൊഴിലാളികൾ', 'ಕೆಲಸಗಾರರು')}</span>
          </button>

          <button
            type="button"
            onClick={handleGoToShops}
            className="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1 border border-amber-200 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-amber-700" />
            <span className="truncate">{loc('கடைகள் தளம்', 'Shops Portal', 'दुकानें पोर्टल', 'షాపుల పోర్టల్', 'ഷോപ്പുകൾ', 'ಅಂಗಡಿಗಳು')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
