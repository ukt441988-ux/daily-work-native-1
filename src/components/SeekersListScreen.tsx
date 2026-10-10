import React, { useState, useMemo, useEffect } from 'react';
import { JobSeeker, Job, Screen } from '../types';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { POPULAR_LOCATIONS } from '../data/locations';
import { getSavedShops } from '../data/shopsData';
import { getTranslatedSeeker, getTranslatedJob } from '../utils/translator';
import { matchSeekerWithQuery, matchJobWithQuery, matchShopWithQuery, detectQueryIntent } from '../utils/universalSearch';
import { useLanguage } from '../context/LanguageContext';
import { handleDirectDial } from '../utils/phoneUtils';
import { CategoryIcon } from './CategoryIcon';
import {
  Users,
  Search,
  MapPin,
  IndianRupee,
  Phone,
  MessageSquare,
  Award,
  UserCheck,
  Briefcase,
  X,
  Mic,
  Globe,
  ExternalLink,
  Store,
  AlertCircle,
  Sun,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { getFavoriteWorkerIds, toggleWorkerFavorite } from '../utils/favoriteStorage';
import { VoiceSearchModal } from './VoiceSearchModal';

interface SeekersListScreenProps {
  seekers?: JobSeeker[];
  onNavigateToRegister: () => void;
  initialSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  jobs?: Job[];
  onNavigate?: (screen: Screen) => void;
  onSelectJobQuery?: (query: string) => void;
}

export const SeekersListScreen: React.FC<SeekersListScreenProps> = ({
  seekers = [],
  onNavigateToRegister,
  initialSearchQuery = '',
  onSearchQueryChange,
  jobs = [],
  onNavigate,
  onSelectJobQuery,
}) => {
  const { language, loc, getCategoryName } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteWorkerIds, setFavoriteWorkerIds] = useState<string[]>(() => getFavoriteWorkerIds());

  useEffect(() => {
    const handleFavUpdate = () => {
      setFavoriteWorkerIds(getFavoriteWorkerIds());
    };
    window.addEventListener('dw_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('dw_favorites_updated', handleFavUpdate);
  }, []);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const updateQuery = (newQ: string) => {
    setSearchQuery(newQ);
    if (onSearchQueryChange) onSearchQueryChange(newQ);
  };

  const handleVoiceApply = (spoken: string) => {
    const trimmed = spoken.trim();
    updateQuery(trimmed);

    // Smart category matching
    const qLower = trimmed.toLowerCase();
    const matchedCat = WORK_CATEGORIES.find(
      (c) =>
        c.nameEn.toLowerCase().includes(qLower) ||
        c.nameTa.includes(trimmed) ||
        qLower.includes(c.nameEn.toLowerCase()) ||
        trimmed.includes(c.nameTa)
    );
    if (matchedCat) {
      setSelectedCategory(matchedCat.id);
    }

    // Smart location matching
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

  const filteredSeekers = useMemo(() => {
    const hasSearch = Boolean(searchQuery.trim());
    const list = (seekers || []).filter((seeker) => {
      if (onlyFavorites && !favoriteWorkerIds.includes(seeker.id)) {
        return false;
      }
      // Text search query: universal match for workers
      if (hasSearch) {
        if (!matchSeekerWithQuery(seeker, searchQuery)) {
          return false;
        }
      }

      // Category filter (only strictly apply if not actively searching or if matching category)
      if (selectedCategory && selectedCategory !== 'all') {
        if (seeker.category !== selectedCategory && !hasSearch) {
          return false;
        }
      }

      // Location filter (only strictly apply if not actively searching)
      if (selectedLocation && selectedLocation !== 'all' && !hasSearch) {
        const locLower = seeker.location.toLowerCase();
        const selectedLocObj = POPULAR_LOCATIONS.find((l) => l.id === selectedLocation);
        const matchEn = selectedLocObj ? locLower.includes(selectedLocObj.nameEn.toLowerCase()) : false;
        const matchTa = selectedLocObj ? locLower.includes(selectedLocObj.nameTa) : false;
        if (!matchEn && !matchTa && !locLower.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort registered workers by newest first
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [seekers, selectedCategory, selectedLocation, searchQuery]);

  // When searching, find registered jobs matching the query
  const matchingJobs = useMemo(() => {
    if (!searchQuery.trim() || !jobs) return [];
    return jobs.filter((job) => matchJobWithQuery(job, searchQuery));
  }, [jobs, searchQuery]);

  // Intent of query (workers vs jobs vs shops)
  const queryIntent = useMemo(() => detectQueryIntent(searchQuery), [searchQuery]);

  // When searching, find registered shops matching the query
  const matchingShops = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return getSavedShops().filter((shop) => matchShopWithQuery(shop, searchQuery));
  }, [searchQuery]);

  return (
    <div className="space-y-3 pb-24">
      {/* Top Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {loc('கிடைக்கும் தொழிலாளர்கள்', 'Available Workers', 'उपलब्ध कामगार', 'అందుబాటులో ఉన్న కార్మికులు', 'ലഭ്യമായ തൊഴിലാളികൾ', 'ಲಭ್ಯವಿರುವ ಕೆಲಸಗಾರರು')}
            </h2>
            <p className="text-xs text-slate-600">
              {loc(
                'வேலைக்கு தேவையான ஆட்களை நேரடியாக அழைக்கலாம்',
                'Contact skilled daily wage workers directly',
                'दैनिक वेतन कामगारों से सीधे संपर्क करें',
                'దినసరి వేతన కార్మికులను నేరుగా సంప్రదించండి',
                'ദിവസവേതന തൊഴിലാളികളെ നേരിട്ട് ബന്ധപ്പെടുക',
                'ದೈನಂದಿನ ಕೂಲಿ ಕೆಲಸಗಾರರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToRegister}
          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl shadow-xs shrink-0"
        >
          {loc('+ புதிய பதிவு', '+ Register', '+ नया पंजीकरण', '+ నమోదు చేయండి', '+ പുതിയ രജിസ്ട്രേഷൻ', '+ ಹೊಸ ನೋಂದಣಿ')}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        {/* Search Input with Voice Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="seeker-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={loc(
              'தொழிலாளி பெயர், ஊர் அல்லது வேலை தேட...',
              'Search worker name, location or skill...',
              'कामगार का नाम, स्थान या कौशल खोजें...',
              'కార్మికుడి పేరు, ప్రాంతం లేదా నైపుణ్యం శోధించండి...',
              'തൊഴിലാളിയുടെ പേര്, സ്ഥലം അല്ലെങ്കിൽ വൈദഗ്ധ്യം തിരയുക...',
              'ಕೆಲಸಗಾರನ ಹೆಸರು, ಸ್ಥಳ ಅಥವಾ ಕೌಶಲ್ಯ ಹುಡುಕಿ...'
            )}
            className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btn-voice-search-seeker"
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-all flex items-center gap-1 text-[11px] font-bold shadow-xs active:scale-95"
              title={loc('குரல் மூலம் தேட (Voice Search)', 'Voice Search', 'आवाज़ से खोजें', 'వాయిస్ సెర్చ్', 'വോയ്‌സ് തിരയൽ', 'ಧ್ವನಿ ಹುಡುಕಾಟ')}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Active Filter Indicator */}
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
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-emerald-700 hover:text-emerald-950 font-bold shrink-0 ml-2"
            >
              {loc('அனைத்தும் காட்டு', 'Clear', 'हटाएं', 'తొలగించు', 'മായ്ക്കുക', 'ತೆರವುಗೊಳಿಸಿ')}
            </button>
          </div>
        )}

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {loc('வேலை வகை', 'Category', 'श्रेणी', 'వర్గం', 'വിഭാഗം', 'ವರ್ಗ')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து வேலைகள்', 'All Categories', 'सभी श्रेणियां', 'అన్ని వర్గాలు', 'എല്ലാ വിഭാഗങ്ങളും', 'ಎಲ್ಲಾ ವರ್ಗಗಳು')}
              </option>
              {WORK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {loc('இடம் / ஊர்', 'Location', 'स्थान', 'ప్రాంతం', 'സ്ഥലം', 'ಸ್ಥಳ')}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              <option value="all">
                {loc('அனைத்து இடங்கள்', 'All Locations', 'सभी स्थान', 'అన్ని ప్రాంతాలు', 'എല്ലാ സ്ഥലങ്ങളും', 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು')}
              </option>
              {POPULAR_LOCATIONS.map((locItem) => (
                <option key={locItem.id} value={locItem.id}>
                  {locItem.nameTa} ({locItem.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header with Favorites Filter Pill */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-semibold flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              onlyFavorites
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'fill-rose-600 text-rose-600'}`} />
            <span>{loc('விருப்பம்', 'Favorites', 'पसंदीदा', 'ఇష్టమైనవి', 'ഇഷ്ടപ്പെട്ടവ', 'ನೆಚ್ಚಿನವು')}</span>
            {favoriteWorkerIds.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${onlyFavorites ? 'bg-white/30 text-white' : 'bg-rose-200 text-rose-800'}`}>
                {favoriteWorkerIds.length}
              </span>
            )}
          </button>
        </div>
        <span>
          {loc(
            `பதிவு செய்த தொழிலாளர்கள்: ${filteredSeekers.length}`,
            `Registered Workers: ${filteredSeekers.length}`,
            `पंजीकृत कामगार: ${filteredSeekers.length}`,
            `నమోదైన కార్మికులు: ${filteredSeekers.length}`,
            `രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികൾ: ${filteredSeekers.length}`,
            `ನೋಂದಾಯಿತ ಕೆಲಸಗಾರರು: ${filteredSeekers.length}`
          )}
        </span>
      </div>

      {/* When workers exist AND matching registered jobs also exist for this search query (for general queries) */}
      {searchQuery.trim() && filteredSeekers.length > 0 && matchingJobs.length > 0 && queryIntent !== 'jobs' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {loc(
                  `"${searchQuery}" பெயரில் ${matchingJobs.length} வேலை வாய்ப்புகளும் உள்ளன!`,
                  `Also found ${matchingJobs.length} job vacancies for "${searchQuery}"!`,
                  `"${searchQuery}" नाम के ${matchingJobs.length} काम के अवसर भी उपलब्ध हैं!`,
                  `"${searchQuery}" పేరుతో ${matchingJobs.length} పనులు కూడా ఉన్నాయి!`,
                  `"${searchQuery}" പേരിൽ ${matchingJobs.length} ജോലികളും ഉണ്ട്!`,
                  `"${searchQuery}" ಹೆಸರಿನಲ್ಲಿ ${matchingJobs.length} ಕೆಲಸಗಳೂ ಇವೆ!`
                )}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => {
                if (onSelectJobQuery) onSelectJobQuery(searchQuery);
                onNavigate('jobs');
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-xs"
            >
              <span>{loc('வேலைகளை பார்க்க', 'View Jobs', 'काम देखें', 'పనులు చూడండి', 'ജോലികൾ കാണുക', 'ಕೆಲಸಗಳನ್ನು ನೋಡಿ')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* If 0 workers found, OR user specifically asked for jobs in this area */}
      {matchingJobs.length > 0 && (filteredSeekers.length === 0 || queryIntent === 'jobs') && (
        <div className="bg-blue-50/80 border-2 border-blue-300/80 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  {loc(
                    `"${searchQuery}" பகுதியில் பதிவிடப்பட்ட வேலை வாய்ப்புகள் (${matchingJobs.length}):`,
                    `Job Vacancies for "${searchQuery}" (${matchingJobs.length}):`,
                    `"${searchQuery}" क्षेत्र में उपलब्ध कार्य (${matchingJobs.length}):`,
                    `"${searchQuery}" ప్రాంతంలో ఉద్యోగ అవకాశాలు (${matchingJobs.length}):`,
                    `"${searchQuery}" പ്രദേശത്തെ തൊഴിലവസരങ്ങൾ (${matchingJobs.length}):`,
                    `"${searchQuery}" ಪ್ರದೇಶದ ಉದ್ಯೋಗಾವಕಾಶಗಳು (${matchingJobs.length}):`
                  )}
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  {loc('வேலை தரும் நிறுவனங்களை நேரடியாக தொடர்பு கொள்ளலாம்:', 'You can contact employers directly below:', 'आप सीधे संपर्क कर सकते हैं:', 'మీరు నేరుగా సంप्रదించవచ్చు:', 'നേരിട്ട് ബന്ധപ്പെടാം:', 'നേರವಾಗಿ ಸಂಪರ್ಕಿಸಬಹುದು:')}
                </p>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => {
                  if (onSelectJobQuery) onSelectJobQuery(searchQuery);
                  onNavigate('jobs');
                }}
                className="text-xs font-bold text-blue-800 hover:text-blue-950 bg-white border border-blue-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0 shadow-xs"
              >
                <span>{loc('வேலைகள் பக்கம் செல்ல', 'Open Jobs Tab', 'काम पेज खोलें', 'పనుల పేజీ తెరవండి', 'ജോലി പേജ്', 'ಕೆಲಸದ ಪುಟ')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {matchingJobs.map((job) => {
              const tJob = getTranslatedJob(job, language);
              const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
              const cleanPhone = (job.contactNumber || (job as any).phone || '').replace(/[^0-9]/g, '');
              const catName =
                tJob.categoryName ||
                (job.category === 'other'
                  ? job.customCategoryName || job.categoryCustomName || loc('பிற வேலை', 'Other Work', 'अन्य कार्य', 'ఇతర పని', 'മറ്റ് ജോലി', 'ಇತರ ಕೆಲಸ')
                  : cat ? getCategoryName(cat) : job.category);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs hover:border-blue-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-base shrink-0 border border-blue-200">
                        {job.employerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-black text-slate-900 text-sm">{job.employerName}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {catName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-blue-700 flex items-center justify-end">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{job.wagePerDay}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">/{loc('நாள்', 'day', 'दिन', 'రోజు', 'ദിവസം', 'ದಿನ')}</span>
                    </div>
                  </div>

                  {job.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {job.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={(e) => handleDirectDial(cleanPhone, e)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>{loc('அழைக்க', 'Call Now', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* When user requested jobs in an area, but workers also match that area, show a section header before workers */}
      {queryIntent === 'jobs' && filteredSeekers.length > 0 && matchingJobs.length > 0 && (
        <div className="pt-2 pb-1 border-b border-slate-200">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {loc(
                `"${searchQuery}" பகுதியில் பதிவு செய்த தொழிலாளர்களும் (${filteredSeekers.length}):`,
                `Also Registered Workers in "${searchQuery}" (${filteredSeekers.length}):`,
                `"${searchQuery}" क्षेत्र में पंजीकृत कामगार (${filteredSeekers.length}):`,
                `"${searchQuery}" ప్రాంతంలో నమోదైన కార్మికులు (${filteredSeekers.length}):`,
                `"${searchQuery}" പ്രദേശത്ത് രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികൾ (${filteredSeekers.length}):`,
                `"${searchQuery}" ಪ್ರದೇಶದ ನೋಂದಾಯಿತ ಕೆಲಸಗಾರರು (${filteredSeekers.length}):`
              )}
            </span>
          </p>
        </div>
      )}

      {/* If 0 workers found, and 0 jobs found, but matching shops EXIST! */}
      {filteredSeekers.length === 0 && matchingJobs.length === 0 && matchingShops.length > 0 && (
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

      {/* Zero State (only when truly nothing matched) */}
      {filteredSeekers.length === 0 && matchingJobs.length === 0 && matchingShops.length === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            {searchQuery.trim() ? (
              loc(
                `"${searchQuery}" - தகவல்கள் எதுவும் கிடைக்கவில்லை`,
                `No results found for "${searchQuery}"`,
                `"${searchQuery}" के लिए कोई परिणाम नहीं मिला`,
                `"${searchQuery}" కోసం ఫలితాలు ఏవీ కనుగొనబడలేదు`,
                `"${searchQuery}" ഫലങ്ങളൊന്നും കണ്ടെത്താനായില്ല`,
                `"${searchQuery}" ಗಾಗಿ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ`
              )
            ) : (
              loc(
                'இந்த பிரிவில் தொழிலாளர்கள் இல்லை. வடிகட்டிகளை மாற்றவும்.',
                'No registered workers found for this filter.',
                'इस फ़िल्टर के लिए कोई पंजीकृत कामगार नहीं मिला।',
                'ఈ ఫిల్టర్‌కు కార్మికులు కనుగొనబడలేదు.',
                'തൊഴിലാളികളെ കണ്ടെത്തിയില്ല.',
                'ಕೆಲಸಗಾರರು ಕಂಡುಬಂದಿಲ್ಲ.'
              )
            )}
          </h4>
        </div>
      )}

      {/* Seekers Cards List */}
      <div className="space-y-3">
        {filteredSeekers.map((seeker) => {
          const tSeeker = getTranslatedSeeker(seeker, language);
          const cat = WORK_CATEGORIES.find((c) => c.id === seeker.category);
          const magic = getCategoryMagicTheme(seeker.category);
          const cleanPhone = (seeker.mobileNumber || '').replace(/[^0-9]/g, '');
          const catName =
            tSeeker.categoryName ||
            (cat ? getCategoryName(cat) : seeker.customCategoryName || seeker.category);

          const waText = encodeURIComponent(
            `வணக்கம் ${tSeeker.name}, Daily Work செயலியில் உங்கள் "${catName}" விவரங்களை பார்த்தேன். தினக்கூலி வேலைக்கு வர விருப்பமா? (Hello, contacting from Daily Work for job).`
          );

          return (
            <div
              key={seeker.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center shrink-0`}>
                    <CategoryIcon
                      name={cat ? cat.iconName : 'User'}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                        {catName}
                      </span>
                      {tSeeker.isTranslated && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                          <Globe className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{loc('மொழிபெயர்ப்பு', 'Translated', 'अनुवाद', 'అనువాదం', 'വിവർത്തനം', 'ಅನುವಾದ')}</span>
                        </span>
                      )}

                      {/* Today Free / Seeking Work Indicator */}
                      {seeker.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5 text-slate-600" />
                          <span>{loc('வேலை கிடைத்தது', 'Job Done', 'काम मिल गया', 'పని దొరికింది', 'ജോലി ലഭിച്ചു', 'ಕೆಲಸ ಸಿಕ್ಕಿದೆ')}</span>
                        </span>
                      ) : (seeker.isFreeToday || seeker.status === 'available') ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                          <Sun className="w-2.5 h-2.5 text-amber-600" />
                          <span>{loc('இன்று தயார்', 'Free Today', 'आज उपलब्ध', 'ఈరోజు సిద్ధం', 'ഇന്ന് തയ്യാർ', 'ಇಂದು ಸಿದ್ಧ')}</span>
                        </span>
                      ) : null}
                    </div>
                    <h4 className="font-black text-slate-900 text-sm mt-1 leading-tight">
                      {tSeeker.name}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkerFavorite(seeker.id);
                      }}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        favoriteWorkerIds.includes(seeker.id)
                          ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300'
                          : 'bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={favoriteWorkerIds.includes(seeker.id) ? loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites') : loc('விருப்பத்தில் சேமி', 'Save to Favorites')}
                    >
                      <Heart className={`w-4 h-4 ${favoriteWorkerIds.includes(seeker.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                    </button>
                    <div className="flex items-center justify-end text-emerald-700">
                      <span className="text-xs font-bold">₹</span>
                      <span className="text-lg font-black">{seeker.expectedDailyWage}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">
                    {loc('எதிர்பார்க்கும் கூலி', 'expected / day', 'अपेक्षित मजदूरी / दिन', 'ఆశించే వేతనం / రోజు', 'പ്രതീക്ഷിക്കുന്ന വേതനം', 'ನಿರೀಕ್ಷಿತ ಕೂಲಿ / ದಿನ')}
                  </p>
                </div>
              </div>

              {/* Location & Experience */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-700">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium">{tSeeker.location}</span>
                </div>
                {seeker.experienceYears ? (
                  <div className="flex items-center gap-1">
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] shadow-xs flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-950" />
                      <span>{seeker.experienceYears} {loc('வருட அனுபவம்', 'Yrs Exp', 'वर्ष का अनुभव', 'సంవత్సరాల అనుభవం', 'വർഷത്തെ പരിചയം', 'ವರ್ಷಗಳ ಅನುಭವ')}</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold truncate">
                    <span>{seeker.availableDate ? `தேதி: ${seeker.availableDate}` : loc('இன்று கிடைக்கும்', 'Available Today')}</span>
                  </div>
                )}
              </div>

              {seeker.statusNote && (
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                  <Sun className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{seeker.statusNote}</span>
                </div>
              )}

              {/* Contact Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <a
                  id={`seeker-call-${seeker.id}`}
                  href={`tel:${cleanPhone}`}
                  onClick={(e) => handleDirectDial(cleanPhone, e)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {loc('போன் செய்ய', 'Call Worker', 'कॉल करें', 'కాల్ చేయండి', 'വിളിക്കുക', 'ಕರೆ ಮಾಡಿ')}
                  </span>
                </a>

                <a
                  id={`seeker-wa-${seeker.id}`}
                  href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs active:scale-95 transition-all text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {loc('வாட்ஸ்அப்', 'WhatsApp', 'व्हाट्सएप', 'వాట్సాప్', 'വാട്ട്‌സ്ആപ്പ്', 'ವಾಟ್ಸಾಪ್')}
                  </span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyQuery={handleVoiceApply}
        initialQuery={searchQuery}
        contextTitleEn="Voice Search Workers & Skills"
        contextTitleTa="தொழிலாளர்கள் மற்றும் திறன்களை குரல் மூலம் தேட"
      />
    </div>
  );
};
