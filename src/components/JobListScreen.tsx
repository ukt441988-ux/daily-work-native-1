import React, { useState, useMemo, useEffect } from 'react';
import { Job, Advertisement, PaymentTransaction, JobStatus, JobSeeker, Screen } from '../types';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { POPULAR_LOCATIONS, COUNTRIES_LIST } from '../data/locations';
import { getSavedShops } from '../data/shopsData';
import { getTranslatedJob, LANGUAGE_DISPLAY_NAMES } from '../utils/translator';
import { matchJobWithQuery, matchSeekerWithQuery, matchShopWithQuery, detectQueryIntent } from '../utils/universalSearch';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { JobDetailModal } from './JobDetailModal';
import { PaymentModal } from './PaymentModal';
import { SocialShareModal } from './SocialShareModal';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  IndianRupee,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  Sparkles,
  Heart,
  Info,
  X,
  Store,
  ExternalLink,
  Award,
  Mic,
  Trash2,
  Share2,
  Globe,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  Play,
  Megaphone,
} from 'lucide-react';
import { getFavoriteJobIds, toggleJobFavorite } from '../utils/favoriteStorage';
import { VoiceSearchModal } from './VoiceSearchModal';
import { AdBannerCarousel } from './AdBannerCarousel';

interface JobListScreenProps {
  jobs: Job[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onNavigateToPost: () => void;
  ads?: Advertisement[];
  onFeatureJob?: (jobId: string, tx: PaymentTransaction) => void;
  onBoostJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onNavigateToAdvertise?: () => void;
  initialSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  seekers?: JobSeeker[];
  onNavigate?: (screen: Screen) => void;
  onSelectSeekerQuery?: (query: string) => void;
}

export const JobListScreen: React.FC<JobListScreenProps> = ({
  jobs = [],
  selectedCategory,
  onSelectCategory,
  onNavigateToPost,
  ads = [],
  onFeatureJob,
  onBoostJob,
  onDeleteJob,
  onNavigateToAdvertise,
  initialSearchQuery = '',
  onSearchQueryChange,
  seekers = [],
  onNavigate,
  onSelectSeekerQuery,
}) => {
  const { language, loc, getCategoryName } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [activeJobForModal, setActiveJobForModal] = useState<Job | null>(null);
  const [jobToShare, setJobToShare] = useState<Job | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Sync initial search query if changed externally (e.g. from HomeScreen voice search)
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  const handleVoiceApply = (spoken: string) => {
    const trimmed = spoken.trim();
    setSearchQuery(trimmed);
    if (onSearchQueryChange) {
      onSearchQueryChange(trimmed);
    }

    // Auto-detect and match category if spoken query corresponds to a category
    const qLower = trimmed.toLowerCase();
    const matchedCat = WORK_CATEGORIES.find(
      (c) =>
        c.nameEn.toLowerCase().includes(qLower) ||
        c.nameTa.includes(trimmed) ||
        qLower.includes(c.nameEn.toLowerCase()) ||
        trimmed.includes(c.nameTa)
    );
    if (matchedCat) {
      onSelectCategory(matchedCat.id);
    }

    // Auto-detect and match location if spoken query corresponds to a popular location
    const matchedLoc = POPULAR_LOCATIONS.find(
      (l) =>
        l.nameEn.toLowerCase().includes(qLower) ||
        l.nameTa.includes(trimmed) ||
        qLower.includes(l.nameEn.toLowerCase()) ||
        trimmed.includes(l.nameTa)
    );
    if (matchedLoc) {
      setSelectedLocation(matchedLoc.id);
    }
  };

  // Job for quick "Feature This Job" payment checkout
  const [jobToFeature, setJobToFeature] = useState<Job | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(() => getFavoriteJobIds());

  useEffect(() => {
    const handleFavUpdate = () => {
      setFavoriteJobIds(getFavoriteJobIds());
    };
    window.addEventListener('dw_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('dw_favorites_updated', handleFavUpdate);
  }, []);

  // Filter and sort jobs (Featured jobs pinned at top)
  const filteredJobs = useMemo(() => {
    const hasSearch = Boolean(searchQuery.trim());
    const list = (jobs || []).filter((job) => {
      // Favorites filter
      if (onlyFavorites && !favoriteJobIds.includes(job.id)) {
        return false;
      }

      // Text search query: if provided, check universal match
      if (hasSearch) {
        if (!matchJobWithQuery(job, searchQuery)) {
          return false;
        }
      }

      // Category filter (applied if not searching or if explicitly clicked)
      if (selectedCategory && selectedCategory !== 'all') {
        if (job.category !== selectedCategory && !hasSearch) {
          return false;
        }
      }

      // Country filter (only if not searching)
      if (selectedCountry && selectedCountry !== 'all' && !hasSearch) {
        if (job.countryCode && job.countryCode !== selectedCountry) {
          return false;
        }
      }

      // Status filter (only if not searching)
      if (selectedStatus && selectedStatus !== 'all' && !hasSearch) {
        if (selectedStatus === 'urgent') {
          if (!job.urgent && job.status !== 'urgent') return false;
        } else if (selectedStatus === 'featured') {
          if (!job.isFeatured) return false;
        } else if (selectedStatus === 'completed') {
          if (job.status !== 'completed') return false;
        } else if (selectedStatus === 'active') {
          if (job.status === 'completed') return false;
        }
      }

      // Location filter
      if (selectedLocation && selectedLocation !== 'all' && !hasSearch) {
        const locLower = job.location.toLowerCase();
        const selectedLocObj = POPULAR_LOCATIONS.find((l) => l.id === selectedLocation);
        const matchEn = selectedLocObj ? locLower.includes(selectedLocObj.nameEn.toLowerCase()) : false;
        const matchTa = selectedLocObj ? locLower.includes(selectedLocObj.nameTa) : false;
        if (!matchEn && !matchTa && !locLower.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Priority sorting: Newly posted jobs first (புதிதாக பதிவிடப்பட்ட வேலைகள் முதலில்!), then featured/urgent, then recent
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      const now = Date.now();
      const isVeryRecentA = (now - timeA) < 24 * 60 * 60 * 1000;
      const isVeryRecentB = (now - timeB) < 24 * 60 * 60 * 1000;

      // Brand newly posted jobs (within 24h) always appear first at the very top!
      if (isVeryRecentA && !isVeryRecentB) return -1;
      if (!isVeryRecentA && isVeryRecentB) return 1;

      // Within the same freshness tier, featured and urgent jobs appear first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;

      return timeB - timeA;
    });
  }, [jobs, selectedCategory, selectedLocation, selectedCountry, selectedStatus, searchQuery]);

  // When searching, find registered job seekers / workers matching the query
  const matchingSeekers = useMemo(() => {
    if (!searchQuery.trim() || !seekers) return [];
    return seekers.filter((seeker) => matchSeekerWithQuery(seeker, searchQuery));
  }, [seekers, searchQuery]);

  // Intent of query (workers vs jobs vs shops)
  const queryIntent = useMemo(() => detectQueryIntent(searchQuery), [searchQuery]);

  // When searching, find registered shops matching the query
  const matchingShops = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const shops = getSavedShops();
    return shops.filter((shop) => matchShopWithQuery(shop, searchQuery));
  }, [searchQuery]);

  // Approved advertisements for feed
  const approvedAds = useMemo(() => {
    return ads.filter((a) => a.status === 'approved');
  }, [ads]);

  const handleFeatureSuccess = (tx: PaymentTransaction) => {
    if (jobToFeature && onFeatureJob) {
      onFeatureJob(jobToFeature.id, tx);
      setJobToFeature(null);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* ACTION: FIND DAILY WORK PAGE CARD (தினசரி வேலை தேட பேஜ்) */}
      <div className="bg-white border-2 border-emerald-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6 text-emerald-800" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {loc('வேலை தேடுபவர்', 'Job Seeker', 'नौकरी चाहने वाला', 'ఉద్యోగార్ధి', 'തൊഴിലന്വേഷകൻ', 'ಉದ್ಯೋಗಾಕಾಂಕ್ಷಿ')}
              </span>
              <span className="text-xs text-emerald-700 font-semibold ml-auto">
                {jobs.length} {loc('வேலைகள் தயார்', 'Jobs Open', 'नौकरियां उपलब्ध', 'పనులు సిద్ధంగా ఉన్నాయి', 'ജോലികൾ ലഭ്യമാണ്', 'ಕೆಲಸಗಳು ಲಭ್ಯ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {loc('தினசரி வேலை தேட', 'Find Daily Work', 'दैनिक कार्य खोजें', 'రోజువారీ పనిని కనుగొనండి', 'ദിവസ ജോലി കണ്ടെത്തുക', 'ದೈನಂದಿನ ಕೆಲಸ ಹುಡುಕಿ')}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {loc(
                'கொத்தனார், பெயிண்டிங், விவசாயம், ஏற்றுதல் போன்ற வேலைகளை பாருங்கள். முதலாளிகளை நேரடியாக அழைத்து பேசி வேலைக்கு செல்லலாம்.',
                'Browse construction, farming, loading, painting & daily wage jobs. Call employers directly without commission.',
                'निर्माण, खेती, लोडिंग, पेंटिंग आदि दैनिक कार्य देखें। नियोक्ताओं से सीधे संपर्क करें।',
                'నిర్మాణం, వ్యవసాయం, లోడింగ్, పెయింటింగ్ వంటి పనులను చూడండి. యజమానులను నేరుగా సంప్రదించండి.',
                'നിർമ്മാണം, കൃഷി, ലോഡിംഗ്, പെയിന്റിംഗ് തുടങ്ങിയ ജോലികൾ കാണുക. നേരിട്ട് വിളിക്കാം.',
                'ನಿರ್ಮಾಣ, ಕೃಷಿ, ಲೋಡಿಂಗ್, ಪೇಂಟಿಂಗ್ ಮುಂತಾದ ಕೆಲಸಗಳನ್ನು ವೀಕ್ಷಿಸಿ. ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ.'
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{loc('100% நேரடி தொடர்பு • கமிஷன் இல்லை', '100% Direct Call • No Commission')}</span>
          </div>
          <button
            onClick={onNavigateToPost}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
          >
            <span>+ {loc('வேலை பதிவிட', 'Post a Job')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        {/* Search input with Voice Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="job-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={loc(
              'வேலை, இடம் அல்லது முதலாளி பெயர் தேட...',
              'Search work, location or employer...',
              'कार्य, स्थान या नियोक्ता खोजें...',
              'పని, స్థలం లేదా యజమానిని శోధించండి...',
              'ജോലി, സ്ഥലം അല്ലെങ്കിൽ തൊഴിലുടമയെ തിരയുക...',
              'ಕೆಲಸ, ಸ್ಥಳ ಅಥವಾ ಮಾಲೀಕರನ್ನು ಹುಡುಕಿ...'
            )}
            className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btn-voice-search-job"
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95"
              title={loc('குரல் மூலம் தேட', 'Voice Search', 'आवाज से खोजें', 'వాయిస్ శోధన', 'ശബ്ദം വഴി തിരയുക', 'ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ')}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Active Filter Indicator if search query exists */}
        {searchQuery && (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/90 border border-emerald-200 rounded-lg text-xs text-emerald-900">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <Mic className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>
                {loc('தேடல் சொல்:', 'Filter:', 'फ़िल्टर:', 'ఫిల్టర్:', 'ഫിൽട്ടർ:', 'ಫಿಲ್ಟರ್:')}{' '}
                <strong className="text-emerald-950 font-bold underline decoration-emerald-400">
                  "{searchQuery}"
                </strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-[11px] text-emerald-700 hover:text-emerald-950 font-bold shrink-0 ml-2"
            >
              {loc('அனைத்தும் காட்டு', 'Clear', 'हटाएं', 'తొలగించు', 'മായ്ക്കുക', 'ಅಳಿಸು')}
            </button>
          </div>
        )}

        {/* Filter Dropdowns Grid: Category, Location, Country & All Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Work Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {loc('வேலை வகை', 'Category', 'श्रेणी', 'వర్గం', 'വിഭാഗം', 'ವರ್ಗ')}
            </label>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து வேலைகள் (All)', 'All Categories', 'सभी श्रेणियां', 'అన్ని వర్గాలు', 'എല്ലാ വിഭാഗങ്ങളും', 'ಎಲ್ಲಾ ವರ್ಗಗಳು')}
              </option>
              {WORK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter (Domestic Cities) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {loc('நகரம் / ஊர்', 'City / Area', 'शहर / क्षेत्र', 'నగరం / ప్రాంతం', 'നഗരം / സ്ഥലം', 'ನಗರ / ಪ್ರದೇಶ')}
            </label>
            <select
              id="filter-location-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து இடங்கள் (All)', 'All Locations', 'सभी स्थान', 'అన్ని ప్రాంతాలు', 'എല്ലാ സ്ഥലങ്ങളും', 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು')}
              </option>
              {POPULAR_LOCATIONS.map((locItem) => (
                <option key={locItem.id} value={locItem.id}>
                  {language === 'en' ? locItem.nameEn : `${locItem.nameTa} (${locItem.nameEn})`}
                </option>
              ))}
            </select>
          </div>

          {/* All Country's Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{loc('நாடு', 'Country', 'देश', 'దేశం', 'രാജ്യം', 'ದೇಶ')}</span>
            </label>
            <select
              id="filter-country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து நாடுகள் (All)', 'All Countries', 'सभी देश', 'అన్ని దేశాలు', 'എല്ലാ രാജ്യങ്ങളും', 'ಎಲ್ಲಾ ದೇಶಗಳು')}
              </option>
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {language === 'en' ? c.nameEn : c.nameTa}
                </option>
              ))}
            </select>
          </div>

          {/* All Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" />
              <span>{loc('வேலை நிலை', 'All Status', 'स्थिति', 'స్థితి', 'സ്ഥിതി', 'ಸ್ಥಿತಿ')}</span>
            </label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து நிலை (All Status)', 'All Status', 'सभी स्थितियां', 'అన్ని స్థితులు', 'എല്ലാ നിലകളും', 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು')}
              </option>
              <option value="urgent">
                ⚡ {loc('இன்றைய அவசரம் (Urgent)', 'Urgent Today', 'आज तत्काल', 'ఈరోజు అత్యవసరం', 'ഇന്നത്തെ അടിയന്തരം', 'ಇಂದಿನ ತುರ್ತು')}
              </option>
              <option value="active">
                🟢 {loc('செயலில் உள்ளது (Active)', 'Active Jobs', 'सक्रिय कार्य', 'క్రియాశీల పనులు', 'സജീവ ജോലികൾ', 'ಸಕ್ರಿಯ ಕೆಲಸಗಳು')}
              </option>
              <option value="featured">
                ⭐ {loc('சிறப்பு வேலை (Featured)', 'Featured Jobs', 'विशेष कार्य', 'ఫీచర్ చేయబడిన పనులు', 'ഫീച്ചർ ചെയ്ത ജോലികൾ', 'ವೈಶಿಷ್ಟ್ಯಪೂರ್ಣ ಕೆಲಸಗಳು')}
              </option>
              <option value="completed">
                🤝 {loc('முடிவடைந்தது (Completed)', 'Completed', 'पूर्ण हो गया', 'పూర్తయింది', 'പൂർത്തിയായി', 'ಪೂರ್ಣಗೊಂಡಿದೆ')}
              </option>
            </select>
          </div>
        </div>

        {/* Quick status & category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            id="pill-status-all"
            onClick={() => {
              setSelectedStatus('all');
              setOnlyFavorites(false);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedStatus === 'all' && !onlyFavorites
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {loc('அனைத்தும்', 'All', 'सभी', 'అన్నీ', 'ఎല്ലാം', 'ಎಲ್ಲವೂ')}
          </button>
          <button
            id="pill-status-favorites"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
              onlyFavorites
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'fill-rose-600 text-rose-600'}`} />
            <span>{loc('விருப்பம்', 'Favorites', 'पसंदीदा', 'ఇష్టమైనవి', 'ഇഷ്ടപ്പെട്ടവ', 'ನೆಚ್ಚಿನವು')}</span>
            {favoriteJobIds.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${onlyFavorites ? 'bg-white/30 text-white' : 'bg-rose-200 text-rose-800'}`}>
                {favoriteJobIds.length}
              </span>
            )}
          </button>
          <button
            id="pill-status-urgent"
            onClick={() => setSelectedStatus(selectedStatus === 'urgent' ? 'all' : 'urgent')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
              selectedStatus === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>⚡ {loc('அவசரம்', 'Urgent', 'तत्काल', 'అత్యవసరం', 'അടിയന്തരം', 'ತುರ್ತು')}</span>
          </button>
          <button
            id="pill-status-active"
            onClick={() => setSelectedStatus(selectedStatus === 'active' ? 'all' : 'active')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
              selectedStatus === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span>🟢 {loc('செயலில்', 'Active', 'सक्रिय', 'క్రియాశీలం', 'സജീവം', 'ಸಕ್ರಿಯ')}</span>
          </button>
          <button
            id="pill-status-featured"
            onClick={() => setSelectedStatus(selectedStatus === 'featured' ? 'all' : 'featured')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
              selectedStatus === 'featured'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>⭐ {loc('சிறப்பு', 'Featured', 'विशेष', 'ఫీచర్డ్', 'പ്രത്യേകം', 'ವೈಶಿಷ್ಟ್ಯ')}</span>
          </button>

          <span className="text-slate-300">|</span>

          {WORK_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{getCategoryName(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          <span>
            {loc('கிடைக்கும் வேலைகள்', 'Available Jobs', 'उपलब्ध कार्य', 'అందుబాటులో ఉన్న పనులు', 'ലഭ്യമായ ജോലികൾ', 'ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು')}: {filteredJobs.length}
          </span>
          {selectedCategory !== 'all' && (
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">
              {(() => {
                const c = WORK_CATEGORIES.find((item) => item.id === selectedCategory);
                return c ? getCategoryName(c) : selectedCategory;
              })()}
            </span>
          )}
        </div>

        {(selectedCategory !== 'all' || selectedLocation !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              onSelectCategory('all');
              setSelectedLocation('all');
              setSearchQuery('');
            }}
            className="text-[11px] text-rose-600 hover:underline font-medium"
          >
            {loc('வடிகட்டியை நீக்குக', 'Reset Filters', 'फ़िल्टर हटाएं', 'ఫిల్టర్‌లను రీసెట్ చేయండి', 'ഫിൽട്ടറുകൾ റദ്ദാക്കുക', 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ')}
          </button>
        )}
      </div>

      {/* When jobs exist AND matching registered workers also exist for this search query (for general or job queries) */}
      {searchQuery.trim() && filteredJobs.length > 0 && matchingSeekers.length > 0 && queryIntent !== 'workers' && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {loc(
                  `"${searchQuery}" பெயரில் ${matchingSeekers.length} பதிவு செய்த தொழிலாளர்களும் உள்ளனர்!`,
                  `Also found ${matchingSeekers.length} registered worker(s) for "${searchQuery}"!`,
                  `"${searchQuery}" नाम के ${matchingSeekers.length} पंजीकृत कामगार भी उपलब्ध हैं!`,
                  `"${searchQuery}" పేరుతో ${matchingSeekers.length} మంది కార్మికులు కూడా ఉన్నారు!`,
                  `"${searchQuery}" പേരിൽ ${matchingSeekers.length} രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികളും ഉണ്ട്!`,
                  `"${searchQuery}" ಹೆಸರಿನಲ್ಲಿ ${matchingSeekers.length} ನೋಂದಾಯಿತ ಕೆಲಸಗಾರರೂ ಇದ್ದಾರೆ!`
                )}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => {
                if (onSelectSeekerQuery) onSelectSeekerQuery(searchQuery);
                onNavigate('seekers-list');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <span>{loc('தொழிலாளர்களை பார்க்க', 'View Workers', 'कामगार देखें', 'కార్మికులను చూడండి', 'തൊഴിലാളികളെ കാണുക', 'ಕೆಲಸಗಾರರನ್ನು ನೋಡಿ')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Show full registered worker cards when 0 jobs found, OR when user query specifically asks for workers in an area */}
      {matchingSeekers.length > 0 && (filteredJobs.length === 0 || queryIntent === 'workers') && (
        <div className="bg-emerald-50/80 border-2 border-emerald-400/80 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {loc(
                    `"${searchQuery}" பகுதியில் பதிவு செய்த தொழிலாளர்கள் (${matchingSeekers.length}):`,
                    `Registered Workers for "${searchQuery}" (${matchingSeekers.length}):`,
                    `"${searchQuery}" में पंजीकृत कामगार (${matchingSeekers.length}):`,
                    `"${searchQuery}" ప్రాంతంలో నమోదైన కార్మికులు (${matchingSeekers.length}):`,
                    `"${searchQuery}" പ്രദേശത്ത് രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികൾ (${matchingSeekers.length}):`,
                    `"${searchQuery}" ಪ್ರದೇಶದ ನೋಂದಾಯಿತ ಕೆಲಸಗಾರರು (${matchingSeekers.length}):`
                  )}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {loc('தொழிலாளர்களை நேரடியாக தொடர்பு கொள்ளலாம்:', 'You can contact registered workers directly below:', 'आप सीधे संपर्क कर सकते हैं:', 'మీరు నేరుగా సంప్రదించవచ్చు:', 'നേരിട്ട് ബന്ധപ്പെടാം:', 'ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು:')}
                </p>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => {
                  if (onSelectSeekerQuery) onSelectSeekerQuery(searchQuery);
                  onNavigate('seekers-list');
                }}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span>{loc('தொழிலாளர்கள் பக்கம் செல்ல', 'Open Workers Tab', 'कामगार पेज खोलें', 'కార్మికుల పేజీ తెరవండి', 'തൊഴിലാളി പേജ്', 'ಕೆಲಸಗಾರರ ಪುಟ')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {matchingSeekers.map((seeker) => {
              const cat = WORK_CATEGORIES.find((c) => c.id === seeker.category);
              const cleanPhone = (seeker.mobileNumber || '').replace(/[^0-9]/g, '');
              const waText = encodeURIComponent(
                loc(
                  `வணக்கம் ${seeker.name}, Daily Work செயலியில் உங்கள் விவரத்தை பார்த்தேன். வேலை விஷயமாக பேசலாமா?`,
                  `Hello ${seeker.name}, I saw your profile on Daily Work app. Can we discuss about work?`,
                  `नमस्ते ${seeker.name}, मैंने Daily Work पर आपकी प्रोफ़ाइल देखी। क्या हम काम के बारे में बात कर सकते हैं?`,
                  `నమస్కారం ${seeker.name}, Daily Work లో మీ వివరాలు చూశాను. పని గురించి మాట్లాడవచ్చా?`,
                  `നമസ്കാരം ${seeker.name}, Daily Work-ൽ പ്രൊഫൈൽ കണ്ടു. ജോലിയെക്കുറിച്ച് സംസാരിക്കാമോ?`,
                  `ನಮಸ್ಕಾರ ${seeker.name}, Daily Work ನಲ್ಲಿ ನಿಮ್ಮ ವಿವರ ನೋಡಿದ್ದೇನೆ. ಕೆಲಸದ ಬಗ್ಗೆ ಮಾತನಾಡಬಹುದೇ?`
                )
              );

              return (
                <div
                  key={seeker.id}
                  className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0 border border-emerald-200">
                        {seeker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-black text-slate-900 text-sm">{seeker.name}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {cat ? getCategoryName(cat) : (seeker.customCategoryName || seeker.category)}
                          </span>
                          {seeker.experienceYears && (
                            <span className="text-[10px] font-semibold text-slate-500">
                              {seeker.experienceYears} {loc('வருட அனுபவம்', 'yrs exp', 'वर्ष अनुभव', 'సంవత్సరాల అనుభవం', 'വർഷ പരിചയം', 'ವರ್ಷ ಅನುಭವ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{seeker.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-700 flex items-center justify-end">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{seeker.expectedDailyWage}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">/{loc('நாள்', 'day', 'दिन', 'రోజు', 'ദിവസം', 'ದಿನ')}</span>
                    </div>
                  </div>

                  {seeker.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {seeker.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>{loc('அழைக்க', 'Call Now', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* When user requested workers, but jobs also match that area, show a section header before jobs */}
      {queryIntent === 'workers' && filteredJobs.length > 0 && matchingSeekers.length > 0 && (
        <div className="pt-2 pb-1 border-b border-slate-200">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {loc(
                `"${searchQuery}" பகுதியில் பதிவிடப்பட்ட வேலை வாய்ப்புகள் (${filteredJobs.length}):`,
                `Also Available Job Openings in "${searchQuery}" (${filteredJobs.length}):`,
                `"${searchQuery}" क्षेत्र में उपलब्ध कार्य (${filteredJobs.length}):`,
                `"${searchQuery}" ప్రాంతంలో అందుబాటులో ఉన్న పనులు (${filteredJobs.length}):`,
                `"${searchQuery}" പ്രദേശത്തെ തൊഴിലവസരങ്ങൾ (${filteredJobs.length}):`,
                `"${searchQuery}" ಪ್ರದೇಶದ ಉದ್ಯೋಗಾವಕಾಶಗಳು (${filteredJobs.length}):`
              )}
            </span>
          </p>
        </div>
      )}

      {/* If 0 jobs found, and 0 workers found, but matching shops EXIST! */}
      {filteredJobs.length === 0 && matchingSeekers.length === 0 && matchingShops.length > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {loc(
                    `"${searchQuery}" என்ற பெயரில் ${matchingShops.length} கடைகள் உள்ளன!`,
                    `Found ${matchingShops.length} Shop(s) matching "${searchQuery}"!`,
                    `"${searchQuery}" से मेल खाती ${matchingShops.length} दुकानें मिलीं!`,
                    `"${searchQuery}" తో సరిపోలే ${matchingShops.length} దుకాణాలు ఉన్నాయి!`,
                    `"${searchQuery}" പൊരുത്തപ്പെടുന്ന ${matchingShops.length} കടകൾ ഉണ്ട്!`,
                    `"${searchQuery}" ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ${matchingShops.length} ಅಂಗಡಿಗಳು ಇವೆ!`
                  )}
                </h4>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('shops')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
              >
                <span>{loc('கடைகள் பக்கம் செல்ல', 'Open Shops Tab', 'दुकानें देखें', 'దుకాణాలు చూడండి', 'കടകൾ കാണുക', 'ಅಂಗಡಿಗಳನ್ನು ನೋಡಿ')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Zero State (only when neither jobs, nor workers, nor shops matched) */}
      {filteredJobs.length === 0 && matchingSeekers.length === 0 && matchingShops.length === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              {loc('வேலைகள் எதுவும் கிடைக்கவில்லை', 'No Jobs Found', 'कोई नौकरी नहीं मिली', 'పనులు ఏవీ కనుగొనబడలేదు', 'ജോലികളൊന്നും കണ്ടെത്താനായില്ല', 'ಯಾವುದೇ ಕೆಲಸಗಳು ಕಂಡುಬಂದಿಲ್ಲ')}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {loc(
                'தேர்ந்தெடுத்த வேலை வகை அல்லது இடத்திற்கு தற்போது வேலை இல்லை. வேறு இடத்தை தேர்ந்தெடுக்கவும்.',
                'Try clearing your search or changing the location and category filter.',
                'अपनी खोज हटाएं या स्थान और श्रेणी फ़िल्टर बदलें।',
                'మీ శోధనను క్లియర్ చేయడానికి లేదా స్థానం మరియు వర్గాన్ని మార్చడానికి ప్రయత్నించండి.',
                'തിരയൽ മായ്ക്കുകയോ ലൊക്കേഷനും വിഭാഗവും മാറ്റുകയോ ചെയ്യുക.',
                'ಹುಡುಕಾಟವನ್ನು ತೆರವುಗೊಳಿಸಿ ಅಥವಾ ಸ್ಥಳ ಮತ್ತು ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ.'
              )}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                onSelectCategory('all');
                setSelectedLocation('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              {loc('அனைத்து வேலைகளையும் பார்க்க', 'View All Jobs', 'सभी काम देखें', 'అన్ని పనులను చూడండి', 'എല്ലാ ജോലികളും കാണുക', 'ಎಲ್ಲಾ ಕೆಲಸಗಳನ್ನು ನೋಡಿ')}
            </button>
            <button
              onClick={onNavigateToPost}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              {loc('புதிய வேலை பதிவு செய்ய', 'Post a Job', 'काम पोस्ट करें', 'పనిని పోస్ట్ చేయండి', 'ജോലി പോസ്റ്റ് ചെയ്യുക', 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ')}
            </button>
          </div>
        </div>
      )}

      {/* JOBS LIST CARDS */}
      <div className="space-y-3">
        {filteredJobs.map((job, index) => {
          const tJob = getTranslatedJob(job, language);
          const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
          const magic = getCategoryMagicTheme(job.category);
          const cleanPhone = (job.contactNumber || (job as any).phone || '').replace(/[^0-9]/g, '');
          const catName =
            tJob.categoryName ||
            (job.category === 'other'
              ? job.customCategoryName || job.categoryCustomName || loc('பிற வேலை', 'Other Work', 'अन्य कार्य', 'ఇతర పని', 'മറ്റ് ജോലി', 'ಇತರ ಕೆಲಸ')
              : cat ? getCategoryName(cat) : job.category);
          const isTranslated = tJob.isTranslated || (Boolean(job.postedLanguage) && job.postedLanguage !== language);

          const waText = encodeURIComponent(
            loc(
              `வணக்கம், Daily Work செயலியில் உங்கள் "${tJob.employerName}" வேலை வாய்ப்பை (${catName}) பார்த்தேன். நான் வேலைக்கு வர விரும்புகிறேன். தொடர்பு கொள்ளவும்.`,
              `Hello, I saw your "${tJob.employerName}" job opening (${catName}) on Daily Work. I would like to work. Please contact me.`,
              `नमस्ते, मैंने Daily Work पर आपका "${tJob.employerName}" कार्य (${catName}) देखा। मैं काम करना चाहता हूँ। कृपया संपर्क करें।`,
              `నమస్కారం, నేను Daily Work లో మీ "${tJob.employerName}" పని (${catName}) చూశాను. నేను పని చేయడానికి ఆసక్తిగా ఉన్నాను. దయచేసి సంప్రదించండి.`,
              `നമസ്കാരം, Daily Work-ൽ നിങ്ങളുടെ "${tJob.employerName}" ജോലി (${catName}) കണ്ടു. ജോലി ചെയ്യാൻ താൽപ്പര്യമുണ്ട്. ബന്ധപ്പെടുക.`,
              `ನಮಸ್ಕಾರ, ನಾನು Daily Work ನಲ್ಲಿ ನಿಮ್ಮ "${tJob.employerName}" ಕೆಲಸವನ್ನು (${catName}) ನೋಡಿದ್ದೇನೆ. ನಾನು ಕೆಲಸ ಮಾಡಲು ಇಷ್ಟಪಡುತ್ತೇನೆ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕಿಸಿ.`
            )
          );

          // Check if we should insert an ad after this job (every 3rd job)
          const adIndex = Math.floor(index / 3) % (approvedAds.length || 1);
          const shouldShowAd = approvedAds.length > 0 && (index + 1) % 3 === 0;
          const currentAd = approvedAds[adIndex];

          return (
            <React.Fragment key={job.id}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.35), ease: 'easeOut' }}
                className={`bg-white rounded-2xl p-4 transition-all space-y-3 relative ${
                  job.isFeatured
                    ? 'border-2 border-amber-400 shadow-md ring-2 ring-amber-400/15 bg-gradient-to-b from-amber-50/25 to-white'
                    : 'border border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Featured Badge Pill */}
                {job.isFeatured && (
                  <div className="flex items-center justify-between pb-1 -mt-1 border-b border-amber-100">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wide border border-amber-300">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>{loc('சிறப்பு வேலை (Featured)', 'Featured Priority Job', 'विशेष प्राथमिकता कार्य', 'ప్రత్యేక ప్రాధాన్యత పని', 'പ്രത്യേക ജോലി', 'ವಿಶೇಷ ಆದ್ಯತೆಯ ಕೆಲಸ')}</span>
                    </span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
                      ★ Top Verified
                    </span>
                  </div>
                )}

                {/* Newly Posted Badge Pill (Shown for recently posted jobs) */}
                {!job.isFeatured && (Date.now() - new Date(job.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center justify-between pb-1 -mt-1 border-b border-emerald-100">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide">
                      <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                      <span>{loc('🆕 புதிதாக பதிவிடப்பட்டது', '🆕 Just Posted', '🆕 नई पोस्ट की गई', '🆕 ఇప్పుడే పోస్ట్ చేయబడింది', '🆕 ഇപ്പോൾ പോസ്റ്റ് ചെയ്തത്', '🆕 ಈಗಷ್ಟೇ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ')}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {loc('முதல் வரிசையில்', 'Top Priority', 'शीर्ष पर', 'టాప్ ఆర్డర్', 'ആദ്യം കാണിക്കുന്നു', 'ಮೊದಲ ಆದ್ಯತೆ')}
                    </span>
                  </div>
                )}

                {/* Card Top: Category, Urgent Badge, Wage */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                        job.isFeatured
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-400/20'
                          : magic.iconBg
                      }`}
                    >
                      <CategoryIcon
                        name={cat ? cat.iconName : 'Briefcase'}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                          {catName}
                        </span>
                        {job.countryCode && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                            <span>{COUNTRIES_LIST.find((c) => c.code === job.countryCode)?.flag || '🇮🇳'}</span>
                            <span>{job.countryCode}</span>
                          </span>
                        )}
                        {(tJob.district || job.district) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            📍 {tJob.district || job.district}
                          </span>
                        )}
                        {isTranslated && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1"
                            title={job.postedLanguage ? `Auto-translated from ${LANGUAGE_DISPLAY_NAMES[job.postedLanguage]?.native || job.postedLanguage}` : 'Auto-translated'}
                          >
                            <Globe className="w-2.5 h-2.5 text-teal-600" />
                            <span>{loc('மொழிபெயர்ப்பு', 'Translated', 'अनुवाद', 'అనువాదం', 'വിവർത്തനം', 'ಅನುವಾದ')}</span>
                          </span>
                        )}
                        {job.urgent && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border border-rose-400/40 flex items-center gap-1 animate-pulse shadow-xs">
                            <Sparkles className="w-2.5 h-2.5 fill-white" />
                            {loc('அவசரம்', 'Urgent', 'तत्काल', 'అత్యవసరం', 'അടിയന്തരം', 'ತುರ್ತು')}
                          </span>
                        )}
                        {job.status === 'completed' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-slate-500" />
                            {loc('முடிந்தது', 'Filled', 'पूर्ण', 'పూర్తయింది', 'പൂർത്തിയായി', 'ಭರ್ತಿಯಾಗಿದೆ')}
                          </span>
                        )}
                        {(job.isVerifiedEmployer || job.employerTier === 'premium') && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {loc('சரிபார்க்கப்பட்டது', 'Verified', 'सत्यापित', 'ధృవీకరించబడింది', 'സ്ഥിരീകരിച്ചു', 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ')}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1" title="Safe protected contact">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-[9px]">{loc('பாதுகாப்பானது', 'Safe', 'सुरक्षित', 'సురక్షితం', 'സുരക്ഷിതം', 'ಸುರಕ್ಷಿತ')}</span>
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm mt-1.5 leading-snug">
                        {tJob.employerName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleJobFavorite(job.id);
                        }}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          favoriteJobIds.includes(job.id)
                            ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                            : 'bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={favoriteJobIds.includes(job.id) ? loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites') : loc('விருப்பத்தில் சேமி', 'Save to Favorites')}
                      >
                        <Heart className={`w-4 h-4 ${favoriteJobIds.includes(job.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                      </button>
                      <div className="flex items-center justify-end text-emerald-700">
                        <span className="text-xs font-bold">₹</span>
                        <span className="text-lg font-black">{job.dailyWage}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">
                      {job.wageType === 'hourly'
                        ? loc('/ மணி', '/ hour', '/ घंटा', '/ గంట', '/ മണിക്കൂർ', '/ ಗಂಟೆ')
                        : job.wageType === 'half_day'
                        ? loc('/ அரை நாள்', '/ half day', '/ आधा दिन', '/ అర రోజు', '/ അര ദിവസം', '/ ಅರ್ಧ ದಿನ')
                        : job.wageType === 'contract'
                        ? loc('/ ஒப்பந்தம்', '/ contract', '/ ठेका', '/ ఒప్పందం', '/ കരാർ', '/ ಗುತ್ತಿಗೆ')
                        : loc('/ நாள்', '/ day', '/ दिन', '/ రోజు', '/ ദിവസം', '/ ದಿನ')}
                    </p>
                    {job.isWageNegotiable && (
                      <span className="inline-block text-[9px] font-black text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 rounded-full shadow-xs mt-1">
                        🤝 {loc('பேசலாம்', 'Negotiable', 'बातचीत', 'చర్చించవచ్చు', 'സംసాരിക്കാം', 'ಮಾತುಕತೆ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Benefits / Perks badges if present */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {job.benefits.includes('food') && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full font-bold">
                        🍛 {loc('உணவு', 'Food', 'भोजन', 'భోజనం', 'ഭക്ഷണം', 'ಊಟ')}
                      </span>
                    )}
                    {job.benefits.includes('tea') && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-full font-bold">
                        ☕ {loc('டீ/காபி', 'Tea', 'चाय', 'టీ', 'ചായ', 'ಚಹಾ')}
                      </span>
                    )}
                    {job.benefits.includes('travel') && (
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-950 border border-sky-300 rounded-full font-bold">
                        🚌 {loc('பயணம்', 'Travel', 'यात्रा', 'ప్రయాణం', 'യാത്ര', 'ಪ್ರಯಾಣ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta details strip: Location, Date, Workers Needed */}
                <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-700">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate" title={tJob.location}>{tJob.location}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold">{job.workersNeeded} {loc('ஆட்கள்', 'Workers', 'श्रमिक', 'కార్మికులు', 'തൊഴിലാളികൾ', 'ಕೆಲಸಗಾರರು')}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{job.jobDate}</span>
                  </div>
                </div>

                {/* Notes / Description snippet if any */}
                {(tJob.notes || job.notes) && (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
                    {tJob.notes || job.notes}
                  </p>
                )}

                {/* ACTION BUTTONS: Call, WhatsApp, View Details */}
                <div className="pt-1 flex items-center gap-2">
                  {/* CALL BUTTON */}
                  <a
                    id={`job-call-${job.id}`}
                    href={`tel:${cleanPhone}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs active:scale-95 transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5 fill-white" />
                    <span>
                      {loc('போன் செய்ய', 'Call', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}
                    </span>
                  </a>

                  {/* WHATSAPP BUTTON */}
                  <a
                    id={`job-wa-${job.id}`}
                    href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs active:scale-95 transition-all text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                    <span>
                      {loc('வாட்ஸ்அப்', 'WhatsApp', 'व्हाट्सएप', 'వాట్సాప్', 'വാട്സ്ആപ്പ്', 'ವಾಟ್ಸಾಪ್')}
                    </span>
                  </a>

                  {/* DETAILS MODAL BUTTON */}
                  <button
                    id={`job-details-${job.id}`}
                    onClick={() => setActiveJobForModal(job)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                    title={loc('முழு விவரம்', 'Details', 'विवरण', 'వివరాలు', 'വിശദാംശങ്ങൾ', 'ವಿವರಗಳು')}
                    aria-label="View job details"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* SOCIAL MEDIA SHARE BUTTON */}
                  <button
                    id={`job-share-${job.id}`}
                    onClick={() => setJobToShare(job)}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors shrink-0"
                    title={loc('சமூக ஊடகத்தில் பகிருங்கள்', 'Share Job', 'साझा करें', 'షేర్ చేయండి', 'പങ്കിടുക', 'ಹಂಚಿಕೊಳ್ಳಿ')}
                    aria-label="Share job on social media"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Upgrade to Featured Prompt for Employer (if not already featured) */}
                {!job.isFeatured && onFeatureJob && (
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      {loc('வேலைக்கு அதிக ஆட்கள் தேவையா?', 'Need workers quickly?', 'जल्दी कामगार चाहिए?', 'త్వరగా కార్మికులు కావాలా?', 'കൂടുതൽ ആളുകളെ വേണോ?', 'ಹೆಚ್ಚು ಕೆಲಸಗಾರರು ಬೇಕೇ?')}
                    </span>
                    <button
                      onClick={() => setJobToFeature(job)}
                      className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{loc('₹99 இல் சிறப்பிக்குக', 'Boost Featured (₹99)', '₹99 में फ़ीचर करें', '₹99 లో ఫీచర్ చేయండి', '₹99-ൽ ഫീച്ചർ ചെയ്യുക', '₹99 ರಲ್ಲಿ ಫೀಚರ್ ಮಾಡಿ')}</span>
                    </button>
                  </div>
                )}
              </motion.div>

              {/* DESIGNATED AD SPACE: Local Business Advertisement Banner */}
              {shouldShowAd && currentAd && (
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      SPONSORED / விளம்பரம்
                    </span>
                    <span className="text-[10px] text-indigo-200">
                      {currentAd.location}
                    </span>
                  </div>

                  {/* Uploaded Media Display: Photo or Video visible directly as-is! */}
                  {currentAd?.mediaUrl && (
                    <div className="rounded-xl overflow-hidden bg-black/60 border border-indigo-500/50 relative">
                      {currentAd?.mediaType === 'video' ? (
                        <div className="relative w-full max-h-56 bg-black flex items-center justify-center">
                          <video
                            src={currentAd.mediaUrl}
                            controls
                            playsInline
                            className="w-full max-h-56 object-contain bg-black"
                          />
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs pointer-events-none">
                            <Film className="w-2.5 h-2.5" />
                            <span>VIDEO AD</span>
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-full max-h-56 overflow-hidden">
                          <img
                            src={currentAd.mediaUrl}
                            alt={currentAd.businessName}
                            className="w-full max-h-56 object-cover"
                            loading="lazy"
                          />
                          <span className="absolute top-2 left-2 bg-indigo-950/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs border border-white/20">
                            <ImageIcon className="w-2.5 h-2.5 text-indigo-300" />
                            <span>PHOTO AD</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h5 className="font-bold text-sm text-white leading-tight">
                      {language === 'ta' ? currentAd.headlineTa : currentAd.headlineEn}
                    </h5>
                    <p className="text-xs text-indigo-200 mt-1 line-clamp-2">
                      {language === 'ta' ? currentAd.descriptionTa : currentAd.descriptionEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-indigo-800/80">
                    <div className="flex items-center gap-1 text-xs font-semibold text-white">
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentAd.businessName}</span>
                    </div>

                    <a
                      href={`tel:${currentAd.phone}`}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Phone className="w-3 h-3 fill-slate-950" />
                      <span>{language === 'ta' ? currentAd.actionTextTa : currentAd.actionTextEn}</span>
                    </a>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Feature Upgrade Payment Modal */}
      {jobToFeature && (
        <PaymentModal
          isOpen={!!jobToFeature}
          onClose={() => setJobToFeature(null)}
          titleEn={`Featured Job Upgrade: ${jobToFeature.employerName}`}
          titleTa={`சிறப்பு வேலை மேம்பாடு: ${jobToFeature.employerName}`}
          amount={99}
          purpose="featured_job"
          targetItemId={jobToFeature.id}
          payerName={jobToFeature.employerName}
          payerPhone={jobToFeature.contactNumber}
          onPaymentSuccess={handleFeatureSuccess}
        />
      )}

      {/* Modal component */}
      <JobDetailModal
        job={activeJobForModal}
        onClose={() => setActiveJobForModal(null)}
        onDeleteJob={onDeleteJob}
      />

      {/* Social Media Share Modal */}
      <SocialShareModal
        job={jobToShare}
        isOpen={!!jobToShare}
        onClose={() => setJobToShare(null)}
      />

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyQuery={handleVoiceApply}
        initialQuery={searchQuery}
        contextTitleEn="Search Daily Jobs by Voice"
        contextTitleTa="தினக்கூலி வேலைகளை குரல் மூலம் தேட"
      />
    </div>
  );
};
