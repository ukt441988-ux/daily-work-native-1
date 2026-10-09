import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Screen, Language } from '../types';
import {
  Briefcase,
  HardHat,
  Clover,
  ArrowLeft,
  Languages,
  Bell,
  Shield,
  HelpCircle,
  Settings,
  LifeBuoy,
  ChevronDown,
  Check,
  User,
  Heart,
  Download,
} from 'lucide-react';
import { getFavoriteCount } from '../utils/favoriteStorage';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenOnboarding?: () => void;
  onOpenSettings?: () => void;
  onOpenGitHub?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenOnboarding,
  onOpenSettings,
  onOpenGitHub,
  onOpenHelp,
}) => {
  const { language, setLanguage, loc } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState<number>(() => getFavoriteCount());

  useEffect(() => {
    const handleFavSync = () => {
      setFavoriteCount(getFavoriteCount());
    };
    window.addEventListener('dw_favorites_updated', handleFavSync);
    return () => window.removeEventListener('dw_favorites_updated', handleFavSync);
  }, []);

  const ALL_LANGUAGES: { id: Language; label: string; sub: string }[] = [
    { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
    { id: 'en', label: 'English', sub: 'English' },
    { id: 'bilingual', label: 'தமிழ் + Eng', sub: 'Bilingual' },
    { id: 'hi', label: 'हिंदी', sub: 'Hindi' },
    { id: 'te', label: 'తెలుగు', sub: 'Telugu' },
    { id: 'ml', label: 'മലയാളം', sub: 'Malayalam' },
    { id: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  ];

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const currentLangLabel = ALL_LANGUAGES.find((l) => l.id === language)?.label || 'தமிழ்';

  return (
    <header className="sticky top-0 z-40 bg-emerald-700 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back or Brand */}
          <div className="flex items-center gap-2">
            {currentScreen !== 'home' ? (
              <button
                id="header-back-button"
                onClick={() => onNavigate('home')}
                className="p-1.5 -ml-1 text-white hover:bg-emerald-800 rounded-full transition-colors flex items-center gap-1 active:scale-95"
                title={loc('முகப்பு', 'Back', 'पीछे', 'వెనుకకు', 'തിരികെ', 'ಹಿಂದೆ')}
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}

            <div
              id="header-brand-logo"
              className="cursor-pointer flex items-center gap-2"
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md border border-amber-200">
                <Clover className="w-5 h-5 text-emerald-950 fill-emerald-900" />
              </div>
              <div>
                <h1 className="font-black text-lg leading-none tracking-tight flex items-center gap-1.5 text-white">
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent font-black">
                    Lucky
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase tracking-wider">
                    APP
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Actions (Admin button, Notification bell, Language switch) */}
          <div className="flex items-center gap-1.5">
            {/* Favorites / Saved Button */}
            <button
              id="btn-header-favorites"
              onClick={() => onNavigate(currentScreen === 'favorites' ? 'home' : 'favorites')}
              className={`p-1.5 rounded-lg relative transition-colors cursor-pointer ${
                currentScreen === 'favorites'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800'
              }`}
              title={loc('விருப்பப் பட்டியல்', 'Favorites / Saved', 'पसंदीदा सूची', 'ఇష్టమైనవి', 'ഇഷ്ടപ്പെട്ടവ', 'ನೆಚ್ಚಿನವು')}
              aria-label="Favorites"
            >
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? 'fill-rose-400 text-rose-300' : ''}`} />
              {favoriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            {onOpenNotifications && (
              <button
                id="btn-header-notifications"
                onClick={onOpenNotifications}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 relative transition-colors"
                title={loc('அறிவிப்புகள்', 'Notifications', 'सूचनाएं', 'నోటిఫికేషన్‌లు', 'അറിയിപ്പുകൾ', 'ಅಧಿಸೂಚನೆಗಳು')}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Guide / Onboarding */}
            {onOpenOnboarding && (
              <button
                id="btn-header-guide"
                onClick={onOpenOnboarding}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
                title={loc('வழிகாட்டி', 'Quick Guide', 'मार्गदर्शिका', 'గైడ్', 'വഴികാട്ടി', 'ಮಾರ್ಗದರ್ಶಿ')}
                aria-label="Quick App Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            {/* Help & Support Button */}
            {onOpenHelp && (
              <button
                id="btn-header-help"
                onClick={onOpenHelp}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
                title={loc('உதவி & ஆதரவு', 'Help & Support', 'सहायता और समर्थन', 'సహాయం మరియు మద్దతు', 'സഹായവും പിന്തുണയും', 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ')}
                aria-label="Help and Support"
              >
                <LifeBuoy className="w-4 h-4" />
              </button>
            )}

            {/* Settings Button */}
            {onOpenSettings && (
              <button
                id="btn-header-settings"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
                title={loc('அமைப்புகள்', 'Settings', 'सेटिंग्स', 'సెట్టింగ్‌లు', 'ക്രമീകരണങ്ങൾ', 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು')}
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Direct GitHub Upload Button */}
            <button
              id="btn-header-github-upload"
              onClick={onOpenGitHub || onOpenSettings}
              className="px-2 py-1 bg-emerald-800 hover:bg-emerald-900 border border-emerald-400/50 rounded-lg text-emerald-100 hover:text-white transition-all flex items-center gap-1 font-bold text-[11px] shadow-xs active:scale-95"
              title={loc('GitHub நேரடி அப்லோட் (1-Click Sync)', 'GitHub Direct Upload (1-Click Sync)', 'सीधा गिटहब अपलोड', 'డైరెక్ట్ గిట్‌హబ్ అప్‌లోడ్', 'ഡയറക്ട് ഗിറ്റ്ഹബ് അപ്‌ലോഡ്', 'ಡೈರೆಕ್ಟ್ ಗಿಟ್‌ಹಬ್ ಅಪ್‌ಲೋಡ್')}
              aria-label="Direct GitHub Upload"
            >
              <span>🐙</span>
              <span className="font-bold">GitHub</span>
            </button>

            {/* Direct Project ZIP Download Button */}
            <a
              id="btn-header-download-zip"
              href="/api/download-zip"
              download="daily-work-app.zip"
              className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-emerald-800 transition-colors"
              title={loc('முழு செயலி பதிவிறக்கம் (ZIP - 0.9MB)', 'Download Full App ZIP (0.9MB)', 'पूरा ऐप डाउनलोड करें', 'యాప్ జిప్ డౌన్‌లోడ్ చేయండి', 'ആപ്പ് സിപ്പ് ഡൗൺലോഡ് ചെയ്യുക', 'ಅಪ್ಲಿಕೇಶನ್ ಜಿಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ')}
              aria-label="Download Project ZIP"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* My Posts / Profile Button */}
            <button
              id="btn-header-my-posts"
              onClick={() => onNavigate(currentScreen === 'my-posts' ? 'home' : 'my-posts')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                currentScreen === 'my-posts' || currentScreen === 'profile'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800'
              }`}
              title={loc('என் பதிவுகள் & சுயவிவரம்', 'My Posts & Profile', 'मेरी पोस्ट्स', 'నా పోస్ట్‌లు', 'എന്റെ പോസ്റ്റുകൾ', 'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು')}
              aria-label="My Posts and Profile"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Admin Switch */}
            <button
              id="btn-header-admin"
              onClick={() => onNavigate(currentScreen === 'admin' ? 'home' : 'admin')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                currentScreen === 'admin'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800'
              }`}
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Admin</span>
            </button>

            {/* All Languages Toggle Dropdown */}
            <div className="relative">
              <button
                id="btn-all-language-toggle"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 bg-emerald-800 hover:bg-emerald-850 px-2 py-1 rounded-lg border border-emerald-600/60 text-xs font-bold text-amber-300 transition-all shadow-xs"
                title={loc('மொழியை மாற்றுக', 'Change Language', 'भाषा बदलें', 'భాషను మార్చండి', 'ഭാഷ മാറ്റുക', 'ಭಾಷೆ ಬದಲಾಯಿಸಿ')}
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] max-w-[50px] truncate">{currentLangLabel}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu */}
              {isLangMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      {loc('மொழியை தேர்வு செய்க', 'Select Language', 'भाषा चुनें', 'భాషను ఎంచుకోండి', 'ഭാഷ തിരഞ്ഞെടുക്കുക', 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ')}
                    </div>
                    {ALL_LANGUAGES.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLangChange(item.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          language === item.id
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{item.sub}</p>
                        </div>
                        {language === item.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
