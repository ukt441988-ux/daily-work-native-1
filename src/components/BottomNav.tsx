import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Home, Search, PlusCircle, Users, Crown, User, Heart } from 'lucide-react';
import { getFavoriteCount } from '../utils/favoriteStorage';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  jobsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, jobsCount = 0 }) => {
  const { loc } = useLanguage();
  const [favCount, setFavCount] = useState<number>(() => getFavoriteCount());

  useEffect(() => {
    const handleFavSync = () => {
      setFavCount(getFavoriteCount());
    };
    window.addEventListener('dw_favorites_updated', handleFavSync);
    return () => window.removeEventListener('dw_favorites_updated', handleFavSync);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-1 py-1.5 flex items-center justify-around">
        {/* Home */}
        <button
          id="nav-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'home'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">
            {loc('முகப்பு', 'Home', 'होम', 'హోమ్', 'ഹോം', 'ಮುಖಪುಟ')}
          </span>
        </button>

        {/* Find Work */}
        <button
          id="nav-jobs"
          onClick={() => onNavigate('jobs')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'jobs'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Search className="w-5 h-5 mb-0.5" />
            {jobsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-1 ring-white">
                {jobsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight font-medium">
            {loc('வேலைகள்', 'Jobs', 'काम खोजें', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸಗಳು')}
          </span>
        </button>

        {/* Post a Job (Primary Action Button) */}
        <button
          id="nav-post-job"
          onClick={() => onNavigate('post-job')}
          className={`flex flex-col items-center justify-center py-0.5 px-1.5 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'post-job'
              ? 'text-emerald-700 font-bold'
              : 'text-emerald-600 hover:text-emerald-800'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm -mt-2.5 ring-2 ring-white">
            <PlusCircle className="w-5 h-5 text-emerald-950" />
          </div>
          <span className="text-[9px] font-bold mt-0.5 text-emerald-900">
            {loc('பதிவிட', 'Post', 'पोस्ट', 'పోస్ట్', 'പോസ്റ്റ്', 'ಪೋಸ್ಟ್')}
          </span>
        </button>

        {/* Workers List */}
        <button
          id="nav-workers"
          onClick={() => onNavigate('seekers-list')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'seekers-list' || currentScreen === 'register-seeker'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">
            {loc('ஆட்கள்', 'Workers', 'श्रमिक', 'కార్మికులు', 'തൊഴിലാളികൾ', 'ಕಾರ್ಮಿಕರು')}
          </span>
        </button>

        {/* Favorites / விருப்பம் */}
        <button
          id="nav-favorites"
          onClick={() => onNavigate('favorites')}
          className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'favorites'
              ? 'text-rose-600 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 mb-0.5 ${currentScreen === 'favorites' ? 'fill-rose-600 text-rose-600' : ''}`} />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-1 ring-white">
                {favCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight font-medium">
            {loc('விருப்பம்', 'Saved', 'पसंदीदा', 'ఇష్టమైనవి', 'ഇഷ്ടപ്പെട്ടവ', 'ನೆಚ್ಚಿನವು')}
          </span>
        </button>

        {/* My Posts & Profile */}
        <button
          id="nav-my-posts"
          onClick={() => onNavigate('my-posts')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all cursor-pointer ${
            currentScreen === 'my-posts' || currentScreen === 'profile'
              ? 'text-emerald-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">
            {loc('சுயவிவரம்', 'Profile', 'प्रोफ़ाइल', 'ప్రొఫైల్', 'പ്രൊഫൈൽ', 'ಪ್ರೊಫೈಲ್')}
          </span>
        </button>
      </div>
    </nav>
  );
};
