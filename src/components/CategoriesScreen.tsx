import React, { useState } from 'react';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import { Screen, Job } from '../types';
import { ArrowLeft, Search, HardHat, Sparkles } from 'lucide-react';

interface CategoriesScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectCategory: (categoryId: string) => void;
  jobs?: Job[];
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onNavigate,
  onSelectCategory,
  jobs = [],
}) => {
  const { loc, getCategoryName } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredCategories = WORK_CATEGORIES.filter((cat) => {
    const q = search.toLowerCase();
    const name = getCategoryName(cat).toLowerCase();
    const enName = cat.nameEn.toLowerCase();
    const taName = cat.nameTa.toLowerCase();
    return name.includes(q) || enName.includes(q) || taName.includes(q);
  });

  const getJobCount = (catId: string) => {
    return jobs.filter((j) => j.category === catId).length;
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header - Magic Aurora Gradient */}
      <div className="bg-gradient-to-r from-violet-800 via-indigo-800 to-purple-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-violet-500/30 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-violet-400/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/20">
                <HardHat className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {loc('வேலை வகைகள்', 'Work Categories', 'कार्य श्रेणियां', 'పని వర్గాలు', 'ജോലി വിഭാഗങ്ങൾ', 'ಕೆಲಸದ ವರ್ಗಗಳು')}
              </h2>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <p className="text-xs text-violet-200 font-medium mt-1">
              {loc(
                'உங்களுக்குத் தேவையான வேலை வகையை தேர்வு செய்து தொழிலாளர்களை அல்லது வேலைவாய்ப்புகளை பாருங்கள்',
                'Browse trade categories to view open job vacancies and skilled workers',
                'उपलब्ध नौकरियां और कुशल श्रमिक देखने के लिए कार्य श्रेणी चुनें',
                'ఉద్యోగాలు మరియు కార్మికులను చూడటానికి వర్గాన్ని ఎంచుకోండి',
                'ജോലികളും തൊഴിലാളികളെയും കാണാൻ വിഭാഗം തിരഞ്ഞെടുക്കുക',
                'ಉದ್ಯೋಗಗಳು ಮತ್ತು ಕಾರ್ಮಿಕರನ್ನು ನೋಡಲು ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ'
              )}
            </p>
          </div>
        </div>

        {/* Search inside categories */}
        <div className="mt-3.5 relative z-10">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={loc(
              'வேலை வகைகளை தேட... (எ.கா: மேஸ்திரி, பெயிண்டர்)',
              'Search category... (e.g., Mason, Painter)',
              'श्रेणी खोजें... (उदा: मेसन, पेंटर)',
              'వర్గాన్ని శోధించండి... (ఉదా: మేస్త్రీ, పెయింటర్)',
              'വിഭാഗം തിരയുക... (ഉദാ: മേസൺ, പെയിന്റർ)',
              'ವರ್ಗ ಹುಡುಕಿ... (ಉದಾ: ಮೇಸ್ತ್ರಿ, ಪೇಂಟರ್)'
            )}
            className="w-full pl-10 pr-3.5 py-2.5 bg-white/95 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
          />
        </div>
      </div>

      {/* Category Grid with Individual Magic Color Identities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredCategories.map((cat) => {
          const count = getJobCount(cat.id);
          const magic = getCategoryMagicTheme(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('jobs');
              }}
              className={`bg-white rounded-2xl p-3.5 border ${magic.border} ${magic.hoverBorder} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-95 relative overflow-hidden`}
            >
              {/* Subtle magic background tint on hover */}
              <div className={`absolute inset-0 ${magic.bg} opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none`} />

              <div className="flex items-start justify-between relative z-10">
                <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${count > 0 ? magic.badge : 'bg-slate-100 text-slate-600'}`}>
                  {count > 0 ? `${count} ${loc('வேலைகள்', 'jobs', 'काम', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸಗಳು')}` : loc('புதியது', 'Active', 'सक्रिय', 'యాక్టివ్', 'സജീവം', 'ಸಕ್ರಿಯ')}
                </span>
              </div>

              <div className="mt-3 relative z-10">
                <h4 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-slate-950 leading-tight">
                  {getCategoryName(cat)}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                  {loc(cat.nameTa, cat.nameEn)}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <span className="text-slate-400 font-normal">{loc('கூலி:', 'Wage:')}</span>
                  <span className="text-emerald-700">~₹{cat.suggestedWage}</span>
                </div>
              </div>

              <div className={`mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] ${magic.accentText} font-black relative z-10`}>
                <span>{loc('வேலைகளைப் பார்க்க', 'View Jobs', 'काम देखें', 'పనులను చూడండి', 'ജോലികൾ കാണുക', 'ಕೆಲಸಗಳನ್ನು ವೀಕ್ಷಿಸಿ')}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
