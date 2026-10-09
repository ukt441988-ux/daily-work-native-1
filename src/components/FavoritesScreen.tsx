import React, { useState, useEffect } from 'react';
import { Screen, Job, JobSeeker } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { getTranslatedJob, getTranslatedSeeker } from '../utils/translator';
import {
  Heart,
  Briefcase,
  Users,
  MapPin,
  PhoneCall,
  Calendar,
  IndianRupee,
  Share2,
  Trash2,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import {
  getFavoriteJobIds,
  getFavoriteWorkerIds,
  toggleJobFavorite,
  toggleWorkerFavorite,
} from '../utils/favoriteStorage';

interface FavoritesScreenProps {
  jobs: Job[];
  seekers: JobSeeker[];
  onNavigate: (screen: Screen) => void;
  onSelectJob: (job: Job) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  jobs,
  seekers,
  onNavigate,
  onSelectJob,
}) => {
  const { language, loc, getCategoryName } = useLanguage();
  const [activeTab, setActiveTab] = useState<'jobs' | 'workers'>('jobs');
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(() => getFavoriteJobIds());
  const [favoriteWorkerIds, setFavoriteWorkerIds] = useState<string[]>(() => getFavoriteWorkerIds());

  useEffect(() => {
    const handleUpdate = () => {
      setFavoriteJobIds(getFavoriteJobIds());
      setFavoriteWorkerIds(getFavoriteWorkerIds());
    };
    window.addEventListener('dw_favorites_updated', handleUpdate);
    return () => window.removeEventListener('dw_favorites_updated', handleUpdate);
  }, []);

  const savedJobs = (jobs || []).filter((j) => favoriteJobIds.includes(j.id));
  const savedWorkers = (seekers || []).filter((s) => favoriteWorkerIds.includes(s.id));

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({ title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title} - ${text}`);
      alert(loc('இணைப்பு நகலெடுக்கப்பட்டது!', 'Link copied to clipboard!'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-3 px-3 sm:px-6 max-w-2xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={loc('பின்செல்', 'Go Back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-rose-100 text-rose-600 inline-flex shadow-xs">
                <Heart className="w-5 h-5 fill-rose-600" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {loc('விருப்பப் பட்டியல்', 'Favorites / Saved', 'पसंदीदा सूची', 'ఇష్టమైనవి', 'ഇഷ്ടപ്പെട്ടവ', 'ನೆಚ್ಚಿನವು')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {loc(
                'நீங்கள் சேமித்து வைத்த வேலைகள் மற்றும் தொழிலாளர்கள்',
                'Jobs and Workers you bookmarked for quick contact'
              )}
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{loc('வேலைகள்', 'Jobs', 'काम')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {savedJobs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'workers'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{loc('தொழிலாளர்கள்', 'Workers', 'कारीगर')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
              {savedWorkers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                <Heart className="w-7 h-7 fill-rose-200" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {loc('சேமிக்கப்பட்ட வேலைகள் எதுவும் இல்லை', 'No saved jobs yet', 'कोई पसंदीदा काम नहीं')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {loc(
                  'வேலைகள் அட்டையில் உள்ள ❤️ இதயக் குறியீட்டைத் தொட்டு உங்களுக்குத் தேவையான வேலைகளை இங்கே சேமிக்கலாம்.',
                  'Tap the ❤️ heart icon on any job card to save it here for quick access.'
                )}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('jobs')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>{loc('வேலைகளைக் காண்க', 'Browse Jobs')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedJobs.map((job) => {
                const tJob = getTranslatedJob(job, language);
                const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
                const magic = getCategoryMagicTheme(job.category);
                const cleanPhone = (job.contactNumber || (job as any).phone || '').replace(/[^0-9]/g, '');
                const catName =
                  tJob.categoryName ||
                  (job.category === 'other'
                    ? job.customCategoryName || job.categoryCustomName || loc('பிற வேலை', 'Other Work')
                    : cat ? getCategoryName(cat) : job.category);

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center shrink-0`}>
                          <CategoryIcon name={cat ? cat.iconName : 'Briefcase'} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                              {catName}
                            </span>
                            {job.urgent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                ⚡ {loc('அவசரம்', 'Urgent')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-slate-900 text-sm mt-1 leading-tight">
                            {tJob.employerName}
                          </h4>
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{job.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleJobFavorite(job.id)}
                          className="p-1.5 rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          title={loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-emerald-700 font-black text-base">
                            <span>₹{job.dailyWage}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold -mt-0.5 block">
                            {job.wageType === 'hourly'
                              ? loc('/ மணி', '/ hr')
                              : job.wageType === 'half_day'
                              ? loc('/ அரை நாள்', '/ half day')
                              : loc('/ நாள்', '/ day')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {job.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {job.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{loc('அழைக்க', 'Call Now')}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => onSelectJob(job)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{loc('விவரம்', 'Details')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(tJob.employerName, `Wage: ₹${job.dailyWage} at ${job.location}`)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title={loc('பகிர்', 'Share')}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Workers Tab Content */}
      {activeTab === 'workers' && (
        <div className="space-y-3">
          {savedWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {loc('சேமிக்கப்பட்ட தொழிலாளர்கள் யாரும் இல்லை', 'No saved workers yet', 'कोई पसंदीदा कारीगर नहीं')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {loc(
                  'தொழிலாளர்கள் அட்டையில் உள்ள ❤️ இதயக் குறியீட்டைத் தொட்டு உங்களுக்குத் தேவையான தொழிலாளர்களை இங்கே சேமிக்கலாம்.',
                  'Tap the ❤️ heart icon on any worker card to save their contact here.'
                )}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('seekers-list')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>{loc('தொழிலாளர்களைக் காண்க', 'Browse Workers')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedWorkers.map((worker) => {
                const tWorker = getTranslatedSeeker(worker, language);
                const cat = WORK_CATEGORIES.find((c) => c.id === worker.category);
                const magic = getCategoryMagicTheme(worker.category);
                const cleanPhone = (worker.mobileNumber || '').replace(/[^0-9]/g, '');
                const catName =
                  tWorker.categoryName ||
                  (cat ? getCategoryName(cat) : worker.customCategoryName || worker.category);

                return (
                  <div
                    key={worker.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center shrink-0`}>
                          <CategoryIcon name={cat ? cat.iconName : 'Users'} className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                            {catName}
                          </span>
                          <h4 className="font-black text-slate-900 text-sm mt-1 leading-tight">
                            {tWorker.name}
                          </h4>
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tWorker.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleWorkerFavorite(worker.id)}
                          className="p-1.5 rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          title={loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-emerald-700 font-black text-base">
                            <span>₹{worker.expectedDailyWage}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold -mt-0.5 block">
                            {loc('/ நாள்', '/ day')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{loc('அழைக்க', 'Call Now')}</span>
                      </a>
                      <a
                        href={`https://wa.me/91${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
