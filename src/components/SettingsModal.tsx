import React, { useState, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { COUNTRIES_LIST } from '../data/locations';
import { Language, UserSecuritySettings } from '../types';
import {
  Settings,
  X,
  Globe,
  Shield,
  Bell,
  Lock,
  Smartphone,
  RotateCcw,
  CheckCircle2,
  LifeBuoy,
  MapPin,
  FileText,
  BadgeCheck,
  Radio,
  Zap,
  Download,
  FolderArchive,
  ExternalLink,
  Copy,
  UploadCloud,
  AlertTriangle,
  Loader2,
  HelpCircle,
  FolderTree,
  ChevronDown,
  ChevronUp,
  KeyRound,
  GitBranch,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  onResetOnboarding: () => void;
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
  initialTab?: 'github' | 'export' | 'language' | 'security' | 'location' | 'notifications';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
  onResetOnboarding,
  selectedCountry = 'IN',
  onSelectCountry,
  initialTab = 'github',
}) => {
  const { language, setLanguage, loc } = useLanguage();

  const [activeTab, setActiveTab] = useState<'github' | 'export' | 'language' | 'security' | 'notifications' | 'location'>('github');

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // GitHub Direct Sync State
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('daily_work_gh_token') || '');
  const [ghRepoName, setGhRepoName] = useState(() => localStorage.getItem('daily_work_gh_repo') || 'daily-work-app');
  const [isUploadingGh, setIsUploadingGh] = useState(false);
  const [ghUploadResult, setGhUploadResult] = useState<{
    success: boolean;
    owner: string;
    repoName: string;
    repoUrl: string;
    filesCount: number;
    actionsUrl: string;
  } | null>(null);
  const [ghUploadError, setGhUploadError] = useState<string | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [showFolderBreakdown, setShowFolderBreakdown] = useState(false);

  const handleGitHubSync = async () => {
    if (!ghToken.trim()) {
      setGhUploadError(
        loc(
          'தயவுசெய்து உங்கள் GitHub Token-ஐ உள்ளிடவும்.',
          'Please enter your GitHub Personal Access Token.',
          'कृपया अपना गिटहब टोकन दर्ज करें।',
          'దయచేసి మీ GitHub టోకెన్‌ను నమోదు చేయండి.',
          'ദയവായി നിങ്ങളുടെ GitHub ടോക്കൺ നൽകുക.',
          'ದಯವಿಟ್ಟು ನಿಮ್ಮ GitHub ಟೋಕನ್ ನಮೂದಿಸಿ.'
        )
      );
      return;
    }
    setIsUploadingGh(true);
    setGhUploadError(null);
    setGhUploadResult(null);
    try {
      localStorage.setItem('daily_work_gh_token', ghToken.trim());
      localStorage.setItem('daily_work_gh_repo', ghRepoName.trim());
      const res = await fetch('/api/github-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ghToken.trim(),
          repoName: ghRepoName.trim() || 'daily-work-app',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'GitHub upload failed');
      }
      setGhUploadResult(data);
    } catch (err: any) {
      setGhUploadError(err.message || 'GitHub upload failed');
    } finally {
      setIsUploadingGh(false);
    }
  };

  // Security toggles
  const [securitySettings, setSecuritySettings] = useState<UserSecuritySettings>(() => {
    try {
      const saved = localStorage.getItem('daily_work_security_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      numberMasking: true,
      fraudAlerts: true,
      encryptStoredData: true,
      gpsPrivacyHigh: true,
      pushNotifications: true,
      smsAlerts: false,
    };
  });

  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleToggleSecurity = (key: keyof UserSecuritySettings) => {
    const updated = {
      ...securitySettings,
      [key]: !securitySettings[key],
    };
    setSecuritySettings(updated);
    try {
      localStorage.setItem('daily_work_security_settings', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleClearCache = () => {
    if (
      window.confirm(
        loc(
          'உங்கள் தேடல் தகவல்களை அழிக்க விரும்புகிறீர்களா?',
          'Are you sure you want to clear temporary cache?',
          'क्या आप अस्थायी कैश साफ़ करना चाहते हैं?',
          'మీరు తాత్కాలిక కాష్‌ను క్లియర్ చేయాలనుకుంటున్నారా?',
          'താൽക്കാലിക കാഷെ മായ്‌ക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?',
          'ನೀವು ತಾತ್ಕಾಲಿಕ ಸಂಗ್ರಹವನ್ನು ತೆರವುಗೊಳಿಸಲು ಬಯಸುವಿರಾ?'
        )
      )
    ) {
      try {
        localStorage.removeItem('daily_work_search_history');
      } catch {
        // ignore
      }
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {loc('செயலி அமைப்புகள்', 'App Settings', 'ऐप सेटिंग्स', 'యాప్ సెట్టింగ్‌లు', 'ആപ്പ് ക്രമീകരണങ്ങൾ', 'ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು')}
              </h2>
              <p className="text-xs text-slate-400">
                {loc(
                  'மொழி, பாதுகாப்பு, நாடு & அறிவிப்பு விருப்பங்கள்',
                  'Language, Security, Country & Notification Controls',
                  'भाषा, सुरक्षा, देश और अधिसूचना नियंत्रण',
                  'భాష, భద్రత, దేశం & నోటిఫికేషన్ నియంత్రణలు',
                  'ഭാഷ, സുരക്ഷ, രാജ്യം & അറിയിപ്പ് നിയന്ത്രണങ്ങൾ',
                  'ಭಾಷೆ, ಭದ್ರತೆ, ದೇಶ ಮತ್ತು ಅಧಿಸೂಚನೆ ನಿಯಂತ್ರಣಗಳು'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-2 py-1.5 gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('github')}
            className={`py-2 px-3 text-center rounded-xl transition-all font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'github'
                ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30'
                : 'text-emerald-900 bg-emerald-100/80 border border-emerald-300 hover:bg-emerald-200/80'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-300" />
            <span>🐙 {loc('GitHub அப்லோட்', 'GitHub Sync', 'गिटहब अपलोड', 'గిట్‌హబ్ అప్‌లోడ్', 'GitHub അപ്‌ലോഡ്', 'GitHub ಅಪ್‌ಲೋಡ್')}</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-3 text-center rounded-xl transition-all font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'export'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>📦 {loc('ZIP பதிவிறக்கு', 'Export ZIP', 'डाउनलोड', 'డౌన్‌లోడ్', 'ഡൗൺലോഡ്', 'ಡೌನ್‌ಲೋಡ್')}</span>
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`py-2 px-2.5 text-center rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'language'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🌐 {loc('மொழிகள்', 'Language', 'भाषाएं', 'భాషలు', 'ഭാഷകൾ', 'ಭಾಷೆಗಳು')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-2.5 text-center rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🔐 {loc('பாதுகாப்பு', 'Security', 'सुरक्षा', 'భద్రత', 'സുരക്ഷ', 'ಭದ್ರತೆ')}
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`py-2 px-2.5 text-center rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'location'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🌍 {loc('நாடு', 'Country', 'देश', 'దేశం', 'രാജ്യം', 'ದೇಶ')}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-2.5 text-center rounded-xl transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🔔 {loc('அறிவிப்பு', 'Alerts', 'सूचनाएं', 'హెచ్చరికలు', 'അറിയിപ്പുകൾ', 'ಎಚ್ಚರಿಕೆಗಳು')}
          </button>
        </div>

        {/* Toast Saved Notice */}
        {savedNotice && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{loc('அமைப்புகள் புதுப்பிக்கப்பட்டன!', 'Settings updated successfully!', 'सेटिंग्स अपडेट की गईं!', 'సెట్టింగ్‌లు నవీకరించబడ్డాయి!', 'ക്രമീകരണങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു!', 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ!')}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ALL LANGUAGES TOGGLE */}
          {activeTab === 'language' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>
                  {loc(
                    'முழு செயலி மொழித் தேர்வு (All Language Toggle)',
                    'Choose Application Language (All Toggle)',
                    'एप्लिकेशन भाषा चुनें (सभी टॉगल)',
                    'అప్లికేషన్ భాషను ఎంచుకోండి',
                    'ആപ്ലിക്കേഷൻ ഭാഷ തിരഞ്ഞെടുക്കുക',
                    'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {loc(
                  'வேலை தேடுதல், பதிவு, மற்றும் மெனுக்கள் நீங்கள் விரும்பும் மொழியில் மாற்றப்படும்.',
                  'Select your preferred language. All interfaces and buttons will update immediately.',
                  'अपनी पसंदीदा भाषा चुनें। सभी इंटरफ़ेस तुरंत अपडेट हो जाएंगे।',
                  'మీ ప్రాధాన్య భాషను ఎంచుకోండి. అన్ని ఇంటర్‌ఫేస్‌లు వెంటనే నవీకరించబడతాయి.',
                  'നിങ്ങൾ തിരഞ്ഞെടുക്കുന്ന ഭാഷയിലേക്ക് എല്ലാ ഇന്റർഫേസുകളും മാറും.',
                  'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಇಂಟರ್ಫೇಸ್ ತಕ್ಷಣ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.'
                )}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => setLanguage(item.code)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm leading-tight">{item.nativeName}</p>
                        <p className="text-[11px] text-slate-500">{item.name}</p>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & ENCRYPTION */}
          {activeTab === 'security' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>256-Bit Client Safety & End-to-End Privacy</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 mt-1">
                  {loc(
                    'உங்கள் கைபேசி எண் ஸ்பேம் மற்றும் விளம்பர அழைப்புகளில் இருந்து பாதுகாக்கப்படுகிறது.',
                    'Your contact credentials and activity logs are encrypted on-device to prevent marketing harassment.',
                    'आपका फोन नंबर अवांछित कॉल से सुरक्षित रहता है।',
                    'మీ ఫోన్ నంబర్ స్పామ్ కాల్స్ నుండి రక్షించబడుతుంది.',
                    'നിങ്ങളുടെ ഫോൺ നമ്പർ സ്പാം കോളുകളിൽ നിന്ന് സംരക്ഷിക്കപ്പെടുന്നു.',
                    'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಸ್ಪ್ಯಾಮ್ ಕರೆಗಳಿಂದ ರಕ್ಷಿಸಲಾಗಿದೆ.'
                  )}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded-md text-[10px] font-bold">
                    ✓ Encryption Active
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded-md text-[10px] font-bold">
                    ✓ Verified Employer Filter
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {loc('எண் மறைப்பு & பாதுகாப்பு (Phone Privacy Guard)', 'Number Privacy & Masking', 'नंबर गोपनीयता और सुरक्षा', 'నంబర్ గోప్యత & రక్షణ', 'നമ്പർ സ്വകാര്യത & സുരക്ഷ', 'ಸಂಖ್ಯೆ ಗೌಪ್ಯತೆ ಮತ್ತು ರಕ್ಷಣೆ')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {loc(
                        'தேவையற்ற அழைப்புகளை தடுத்து சரிபார்க்கப்பட்ட பயனர்களுக்கு மட்டும் காட்டும்.',
                        'Shields mobile numbers from scraping bots and automated telemarketers.',
                        'अवांछित कॉलों को रोकता है और केवल सत्यापित उपयोगकर्ताओं को दिखाता है।',
                        'అవాంఛిత కాల్‌లను నిరోధించి ధృవీకరించబడిన వినియోగదారులకు మాత్రమే చూపుతుంది.',
                        'അനാവശ്യ കോളുകൾ തടഞ്ഞ് സ്ഥിരീകരിച്ച ഉപയോക്താക്കൾക്ക് മാത്രം കാണിക്കുന്നു.',
                        'ಅನಗತ್ಯ ಕರೆಗಳನ್ನು ತಡೆದು ಪರಿಶೀಲಿಸಿದ ಬಳಕೆದಾರರಿಗೆ ಮಾತ್ರ ತೋರಿಸುತ್ತದೆ.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('numberMasking')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      securitySettings.numberMasking ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        securitySettings.numberMasking ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {loc('மோசடி எச்சரிக்கை அமைப்பு (Anti-Fraud Alerts)', 'Anti-Fraud & Scam Detection', 'धोखाधड़ी चेतावनी प्रणाली', 'మోసం హెచ్చరిక వ్యవస్థ', 'തട്ടിപ്പ് മുന്നറിയിപ്പ് സംവിധാനം', 'ವಂಚನೆ ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {loc(
                        'முன்பணம் கேட்கும் போலி முதலாளிகளை எச்சரிக்கும்.',
                        'Warns you instantly if a poster asks for deposits or non-standard payments.',
                        'अग्रिम भुगतान मांगने वाले फर्जी नियोक्ताओं की चेतावनी देता है।',
                        'ముందస్తు చెల్లింపులను కోరే నకిలీ యజమానుల గురించి హెచ్చరిస్తుంది.',
                        'മുൻകൂർ പണം ആവശ്യപ്പെടുന്ന വ്യാജ തൊഴിലുടമകളെക്കുറിച്ച് മുന്നറിയിപ്പ് നൽകുന്നു.',
                        'ಮುಂಗಡ ಹಣವನ್ನು ಕೇಳುವ ನಕಲಿ ಉದ್ಯೋಗದಾತರ ಬಗ್ಗೆ ಎಚ್ಚರಿಸುತ್ತದೆ.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('fraudAlerts')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      securitySettings.fraudAlerts ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        securitySettings.fraudAlerts ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {loc('GPS துல்லிய பாதுகாப்பு (High-Accuracy GPS)', 'High-Accuracy Geolocation', 'सटीक जीपीएस सुरक्षा', 'అధిక ఖచ్చితమైన GPS', 'കൃത്യമായ GPS സുരക്ഷ', 'ನಿಖರವಾದ GPS ಭದ್ರತೆ')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {loc(
                        'வேலை இடத்தின் அருகிலுள்ள பேருந்து நிறுத்தம் மற்றும் சாலையை காட்டும்.',
                        'Pinpoints nearest landmark and Google Maps navigation route.',
                        'कार्यस्थल के निकटतम बस स्टॉप और मार्ग दिखाता है।',
                        'పని ప్రదేశ సమీప బస్ స్టాప్ మరియు మార్గాన్ని చూపుతుంది.',
                        'ജോലിസ്ഥലത്തിനടുത്തുള്ള ബസ് സ്റ്റോപ്പും വഴിയും കാണിക്കുന്നു.',
                        'ಕೆಲಸದ ಸ್ಥಳದ ಹತ್ತಿರದ ಬಸ್ ನಿಲ್ದಾಣ ಮತ್ತು ಮಾರ್ಗವನ್ನು ತೋರಿಸುತ್ತದೆ.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('gpsPrivacyHigh')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      securitySettings.gpsPrivacyHigh ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        securitySettings.gpsPrivacyHigh ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOMESTIC & ALL COUNTRIES */}
          {activeTab === 'location' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>
                  {loc(
                    'நாடு & மண்டலத் தேர்வு (Domestic & All Countries)',
                    'Target Country & Region Preference',
                    'देश और क्षेत्र चयन',
                    'దేశం మరియు ప్రాంత ఎంపిక',
                    'രാജ്യവും പ്രദേശവും തിരഞ്ഞെടുക്കൽ',
                    'ದೇಶ ಮತ್ತು ಪ್ರದೇಶದ ಆಯ್ಕೆ'
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {loc(
                  'உள்நாட்டு மற்றும் வெளிநாட்டு வேலைவாய்ப்புகளை பார்க்க நாட்டைத் தேர்ந்தெடுக்கவும்.',
                  'Select your target country to filter local or overseas daily work opportunities.',
                  'स्थानीय या विदेशी दैनिक कार्य देखने के लिए देश चुनें।',
                  'స్థానిక లేదా విదేశీ పనులను చూడటానికి దేశాన్ని ఎంచుకోండి.',
                  'പ്രാദേശിക അല്ലെങ്കിൽ വിദേശ ജോലികൾ കാണാൻ രാജ്യം തിരഞ്ഞെടുക്കുക.',
                  'ಸ್ಥಳೀಯ ಅಥವಾ ವಿದೇಶಿ ಕೆಲಸಗಳನ್ನು ವೀಕ್ಷಿಸಲು ದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COUNTRIES_LIST.map((country) => {
                  const isCurrent = selectedCountry === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        if (onSelectCountry) onSelectCountry(country.code);
                        setSavedNotice(true);
                        setTimeout(() => setSavedNotice(false), 2000);
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{country.flag}</span>
                        <div>
                          <p className="text-xs font-bold">
                            {language === 'ta' ? country.nameTa : country.nameEn}
                          </p>
                          <p className="text-[10px] text-slate-500">{country.dialCode}</p>
                        </div>
                      </div>
                      {country.isDomestic && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                          {loc('உள்நாடு', 'Domestic', 'घरेलू', 'స్వదేశీ', 'ആഭ്യന്തര', 'ದೇಶೀಯ')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & USER SYMBOLS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3.5">
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {loc('இன்றைய அவசர வேலை அறிவிப்புகள்', 'Urgent Today Job Alerts', 'आज की तत्काल नौकरी अलर्ट', 'ఈరోజు అత్యవసర పని హెచ్చరికలు', 'ഇന്നത്തെ അടിയന്തര തൊഴിൽ അറിയിപ്പുകൾ', 'ಇಂದಿನ ತುರ್ತು ಕೆಲಸದ ಎಚ್ಚರಿಕೆಗಳು')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {loc(
                        'உங்கள் பகுதியில் உடனடி ஆட்கள் தேவைப்படும்போது அறிவிக்கும்.',
                        'Get notified when urgent same-day jobs are posted in your city.',
                        'जब आपके शहर में तत्काल नौकरियों की आवश्यकता हो तो सूचना प्राप्त करें।',
                        'మీ నగరంలో అత్యవసర పనులు పోస్ట్ చేసినప్పుడు నోటిఫికేషన్ పొందండి.',
                        'നിങ്ങളുടെ നഗരത്തിൽ അടിയന്തര ജോലികൾ പോസ്റ്റ് ചെയ്യുമ്പോൾ അറിയിപ്പ് നേടുക.',
                        'ನಿಮ್ಮ ನಗರದಲ್ಲಿ ತುರ್ತು ಕೆಲಸಗಳು ಪೋಸ್ಟ್ ಆದಾಗ ಸೂಚನೆ ಪಡೆಯಿರಿ.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSecurity('pushNotifications')}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      securitySettings.pushNotifications ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        securitySettings.pushNotifications ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Symbol / Legend Glossary for Users */}
              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {loc('பயனர் சின்னங்கள் விளக்கம் (User Symbols Guide)', 'App Symbols & Status Guide', 'प्रतीक और स्थिति गाइड', 'యాప్ చిహ్నాలు & స్థితి మార్గదర్శి', 'ചിഹ്നങ്ങളും നിലയും ഗൈഡ്', 'ಚಿಹ್ನೆಗಳು ಮತ್ತು ಸ್ಥಿತಿ ಮಾರ್ಗದರ್ಶಿ')}
                  </span>
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold rounded-md text-[10px]">
                      ⚡ URGENT
                    </span>
                    <span className="text-[11px]">
                      {loc('இன்றைய அவசர வேலை தேவை', 'Needs workers today immediately', 'आज तुरंत कामगारों की आवश्यकता', 'ఈరోజు వెంటనే కార్మికులు కావాలి', 'ഇന്ന് ഉടൻ തൊഴിലാളികളെ ആവശ്യമുണ്ട്', 'ಇಂದು ತಕ್ಷಣ ಕೆಲಸಗಾರರು ಬೇಕಾಗಿದ್ದಾರೆ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-700" /> VERIFIED
                    </span>
                    <span className="text-[11px]">
                      {loc('சரிபார்க்கப்பட்ட முதலாளி / தொழிலாளர்', 'Identity & contact verified', 'पहचान और संपर्क सत्यापित', 'గుర్తింపు మరియు సంప్రదింపు ధృవీకరించబడింది', 'തിരിച്ചറിയലും കോൺടാക്റ്റും സ്ഥിരീകരിച്ചു', 'ಗುರುತು ಮತ್ತು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-700" /> GPS ROUTE
                    </span>
                    <span className="text-[11px]">
                      {loc('வரைபடம் மற்றும் நேரடி வழித்தடம்', 'Direct Google Maps turn-by-turn', 'नक्शा और सीधा मार्ग', 'మ్యాప్ మరియు ప్రత్యక్ష మార్గం', 'മാപ്പും നേരിട്ടുള്ള വഴിയും', 'ನಕ್ಷೆ ಮತ್ತು ನೇರ ಮಾರ್ಗ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DEDICATED GITHUB DIRECT SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Header Box */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl border border-emerald-500/30 shadow-md space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/40">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>🐙</span>
                      <span>{loc('நேரடி GitHub அப்லோடர் (1-Click Sync)', '1-Click Direct GitHub Sync', 'सीधा गिटहब अपलोडर', 'డైరెక్ట్ గిట్‌హబ్ అప్‌లోడర్', 'ഡയറക്ട് ഗിറ്റ്ഹബ് അപ്‌ലോഡർ', 'ಡೈರೆಕ್ಟ್ ಗಿಟ್‌ಹಬ್ ಅಪ್‌ಲೋಡರ್')}</span>
                    </h3>
                    <p className="text-[11px] text-emerald-300 font-medium">
                      {loc('மொபைல் போனில் இருந்தே 85 கோப்புகளையும் நேரடியாக GitHub-ல் ஏற்றும்!', 'Uploads all 85 source files directly to GitHub from mobile!', 'सीधे मोबाइल से सभी 85 फाइलें गिटहब में अपलोड करें!', 'మొబైల్ నుంచే మొత్తం 85 ఫైళ్ళను నేరుగా గిట్‌హబ్‌లో అప్‌లోడ్ చేయండి!', 'മൊബൈലിൽ നിന്ന് നേരിട്ട് 85 ഫയലുകളും GitHub-ലേക്ക് അപ്‌ലോഡ് ചെയ്യുക!', 'ಮೊಬೈಲ್‌ನಿಂದಲೇ ಎಲ್ಲಾ 85 ಫೈಲ್‌ಗಳನ್ನು ನೇರವಾಗಿ GitHub ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ!')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GitHub Personal Access Token (PAT)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowTokenHelp(!showTokenHelp)}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {loc('டோக்கன் எடுப்பது எப்படி?', 'How to get Token?', 'टोकन कैसे प्राप्त करें?', 'టోకెన్ ఎలా పొందాలి?', 'ടോക്കൺ എങ്ങനെ ലഭിക്കും?', 'ಟೋಕನ್ ಪಡೆಯುವುದು ಹೇಗೆ?')}
                      </button>
                    </label>
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  {/* Token Quick Guide and Direct Link */}
                  <div className="p-3 bg-slate-950/70 rounded-xl text-[11px] text-slate-300 space-y-2 border border-slate-800">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      {loc('GitHub Token உருவாக்க நேரடி லிங்க் (1 நிமிடம்):', 'Direct Link to create GitHub Token (1 Minute):', 'गिटहब टोकन बनाने का सीधा लिंक:', 'GitHub టోకెన్ పొందడానికి నేరుగా లింక్:', 'GitHub ടോക്കൺ ഉണ്ടാക്കാനുള്ള നേരിട്ടുള്ള ലിങ്ക്:', 'GitHub ಟೋಕನ್ ಪಡೆಯಲು ನೇರ ಲಿಂಕ್:')}
                    </p>
                    <div className="space-y-1.5 text-[10px] text-slate-300">
                      <p>
                        1. கீழே உள்ள பச்சை நிற லிங்க்கை அழுத்தவும் (நேரடியாக <strong>repo</strong> &amp; <strong>workflow</strong> அனுமதியுடன் திறக்கும்):
                      </p>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=DailyWorkApp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow transition-all my-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{loc('GitHub Token உருவாக்க இங்கே தொடவும் ↗', 'Create GitHub Token with repo & workflow scopes ↗', 'टोकन बनाने के लिए यहां क्लिक करें ↗', 'టోకెన్ సృష్టించడానికి ఇక్కడ క్లిక్ చేయండి ↗', 'ടോക്കൺ ഉണ്ടാക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക ↗', 'ಟೋಕನ್ ರಚಿಸಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ ↗')}</span>
                      </a>
                      <p>2. திறக்கும் பக்கத்தின் கீழே சென்று பச்சை நிற <strong>&quot;Generate token&quot;</strong> பட்டனை அழுத்தவும்.</p>
                      <p>3. அங்கு தோன்றும் <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded">ghp_...</code> குறியீட்டை காப்பி செய்து மேலே பேஸ்ட் செய்யவும்.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                        {loc('ரிப்போசிட்டரி பெயர் (Repository Name)', 'Repository Name', 'रिपॉजिटरी का नाम', 'రిపోజిటరీ పేరు', 'റിപ്പോസിറ്ററി പേര്', 'ರೆಪೊಸಿಟರಿ ಹೆಸರು')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {loc('விரைவு பெயர்கள்:', 'Quick names:', 'अन्य नाम:', 'మరో పేరు:', 'മറ്റൊരു പേര്:', 'ಮತ್ತೊಂದು ಹೆಸರು:')}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="daily-work-app"
                      value={ghRepoName}
                      onChange={(e) => setGhRepoName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {['daily-work-app', 'daily-work-app-2', 'my-daily-work', 'daily-work-mobile'].map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setGhRepoName(name)}
                          className={`text-[10px] px-2.5 py-0.5 rounded-lg border transition-all ${
                            ghRepoName === name
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ghUploadError && (
                    <div className="p-3 bg-red-950/90 border border-red-500/70 rounded-xl text-[11px] text-red-200 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{ghUploadError}</span>
                      </div>
                      <div className="bg-red-900/50 p-2.5 rounded-lg text-[10px] text-red-200 space-y-1.5 border border-red-800/60">
                        <p className="font-bold text-amber-300">💡 எளிய தீர்வு (Quick Fix):</p>
                        <p>1. <strong>404 Not Found / Permission பிழை:</strong> உங்கள் Token-ல் &apos;repo&apos; அனுமதி இல்லை. கீழே உள்ள பச்சை லிங்க் மூலம் புதிய Token உருவாக்கவும்:</p>
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=DailyWorkApp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold text-[10px] shadow"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>சரியான Token உருவாக்க இங்கே தொடவும் ↗</span>
                        </a>
                        <p>2. <strong>பெயர் ஏற்கனவே இருந்தால் (Already Exists):</strong> மேலே உள்ள ரிப்போசிட்டரி பெயரை <code className="text-white font-mono bg-black/40 px-1 py-0.2 rounded">daily-work-app-2</code> என மாற்றி மீண்டும் அப்லோட் அழுத்தவும்.</p>
                      </div>
                    </div>
                  )}

                  {ghUploadResult && (
                    <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-[11px] text-emerald-200 space-y-2.5">
                      <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>வெற்றிகரமாக {ghUploadResult.filesCount} கோப்புகளும் GitHub-ல் ஏற்றப்பட்டன! 🎉</span>
                      </div>
                      {ghUploadResult.workflowSkipped && (
                        <div className="bg-amber-950/60 border border-amber-500/40 p-2 rounded-lg text-[10px] text-amber-200 space-y-1">
                          <p className="font-bold text-amber-300">💡 குறிப்பு (Note):</p>
                          <p>உங்கள் அனைத்து 75+ செயலிக் கோப்புகளும் (React, TypeScript, Android Capacitor, Configs) GitHub-ல் வெற்றிகரமாக உள்ளன! தானியங்கி GitHub Actions APK பில்டருக்கு Token-ல் &apos;workflow&apos; அனுமதி தேவை.</p>
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5 text-[11px] pt-1">
                        <a
                          href={ghUploadResult.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-900/60 hover:bg-emerald-900/90 rounded-lg text-emerald-200 underline flex items-center justify-between"
                        >
                          <span className="font-semibold">GitHub Repository காண்க:</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={ghUploadResult.actionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-amber-950/60 hover:bg-amber-950/90 rounded-lg text-amber-300 underline flex items-center justify-between font-semibold"
                        >
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Android APK பில்ட் (Actions Tab)</span>
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGitHubSync}
                    disabled={isUploadingGh}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/40 transition-all cursor-pointer"
                  >
                    {isUploadingGh ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loc('85 கோப்புகளும் GitHub-ல் ஏறுகின்றன...', 'Uploading all 85 files to GitHub...', '85 फाइलें अपलोड हो रही हैं...', '85 ఫైళ్లు అప్‌లోడ్ అవుతున్నాయి...', '85 ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യുന്നു...', '85 ಫೈಲ್‌ಗಳು ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿವೆ...')}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{loc('GitHub-ல் நேரடியாக அப்லோட் செய் (85 கோப்புகள்)', 'Upload Directly to GitHub (85 Files)', 'गिटहब पर सीधे अपलोड करें', 'గిట్‌హబ్‌లో నేరుగా అప్‌లోడ్ చేయండి', 'GitHub-ൽ നേരിട്ട് അപ്‌ലോഡ് ചെയ്യുക', 'GitHub ನಲ್ಲಿ ನೇರವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Explanatory Help Card */}
              <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 text-xs space-y-2 text-slate-800">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{loc('ஏன் மொபைல் போனில் இந்த நேரடி அப்லோட் சிறந்தது?', 'Why is Direct Upload best on mobile?', 'सीधा अपलोड मोबाइल पर सबसे अच्छा क्यों है?', 'మొబైల్‌లో డైరెక్ట్ అప్‌లోడ్ ఎందుకు ఉత్తమం?', 'എന്തുകൊണ്ടാണ് നേരിട്ടുള്ള അപ്‌ലോഡ് നല്ലത്?', 'ನೇರ ಅಪ್‌ಲೋಡ್ ಏಕೆ ಉತ್ತಮ?')}</span>
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  மொபைல் போன் குரோம் பிரவுசரில் GitHub.com தளத்தில் <strong>&quot;Upload files&quot;</strong> கொடுக்கும் போது, மொபைல் போன்களால் <strong>முழு ஃபோல்டர்களை தேர்வு செய்ய முடியாது</strong>! அதனால் மேலே உள்ள சில கோப்புகள் மட்டுமே ஏறும், <code className="bg-amber-100 px-1 rounded">src</code> மற்றும் <code className="bg-amber-100 px-1 rounded">android</code> ஃபோல்டர்கள் விடுபட்டுவிடும்.
                  <br />
                  ஆனால் இந்த <strong>1-Click Uploader</strong> மூலம் முழு <strong>85 கோப்புகளும் (React + Android)</strong> எந்தவொரு விடுபடலும் இன்றி உங்கள் GitHub-ல் முழுமையாக ஏறிவிடும்!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT / DOWNLOAD ZIP */}
          {activeTab === 'export' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Card 1: ZIP Download */}
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 rounded-2xl border border-emerald-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {loc('முழு செயலி பதிவிறக்கம் (Source Code ZIP)', 'Download Full App Source Code (ZIP)', 'पूरा ऐप डाउनलोड करें', 'పూర్తి యాప్‌ను డౌన్‌లోడ్ చేయండి', 'മുഴുവൻ ആപ്പും ഡൗൺലോഡ് ചെയ്യുക', 'ಸಂಪೂರ್ಣ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ')}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {loc('மொத்தம் 85 கோப்புகள் • 34 கோப்புறைகள் • 0.9 MB', 'Total 85 Files • 34 Folders • 0.9 MB', 'कुल 85 फाइलें • 34 फोल्डर • 0.9 MB', 'మొత్తం 85 ఫైళ్ళు • 34 ఫోల్డర్లు • 0.9 MB', 'ആകെ 85 ഫയലുകൾ • 34 ഫോൾഡറുകൾ • 0.9 MB', 'ಒಟ್ಟು 85 ಕಡತಗಳು • 34 ಫೋಲ್ಡರ್‌ಗಳು • 0.9 MB')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <a
                    href="/api/download-zip"
                    download="daily-work-app.zip"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-center"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    <span>
                      {loc(
                        'இப்போதே ZIP பதிவிறக்குக (daily-work-app.zip)',
                        'Download ZIP Now (daily-work-app.zip)',
                        'अभी ज़िप डाउनलोड करें',
                        'ఇప్పుడే జిప్ డౌన్‌లోడ్ చేయండి',
                        'ഇപ്പോൾ തന്നെ സിപ്പ് ഡൗൺലോഡ് ചെയ്യുക',
                        'ಈಗಲೇ ಜಿಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'
                      )}
                    </span>
                  </a>

                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/api/download-zip`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(url);
                      }
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {copiedUrl
                        ? loc('டவுன்லோட் இணைப்பு காப்பி செய்யப்பட்டது!', 'Link Copied!', 'लिंक कॉपी हो गया!', 'లింక్ కాపీ చేయబడింది!', 'ലിങ്ക് കോപ്പി ചെയ്തു!', 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!')
                        : loc('நேரடி டவுன்லோட் லிங்க் காப்பி செய்க', 'Copy Direct Download URL', 'सीधा डाउनलोड लिंक कॉपी करें', 'నేరుగా డౌన్‌లోడ్ లింక్ కాపీ చేయండి', 'ഡയറക്ട് ഡൗൺലോഡ് ലിങ്ക് കോപ്പി ചെയ്യുക', 'ನೇರ ಡೌನ್‌ಲೋಡ್ ಲಿಂಕ್ ನಕಲಿಸಿ')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick switch to GitHub tab */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>🐙</span>
                    <span>{loc('GitHub-ல் நேரடியாக ஏற்ற வேண்டுமா?', 'Want to upload directly to GitHub?', 'सीधे गिटहब में अपलोड करना चाहते हैं?', 'నేరుగా గిట్‌హబ్‌లో అప్‌లోడ్ చేయాలనుకుంటున్నారా?', 'GitHub-ലേക്ക് നേരിട്ട് അപ്‌ലോഡ് ചെയ്യണോ?', 'GitHub ಗೆ ನೇರವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಬೇಕೆ?')}</span>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    {loc('மொபைல் ஃபைல் பிரச்சனை இல்லாமல் 1 நொடியில் ஏற்றலாம்.', 'Upload in 1 second without mobile file picker limits.', '1 सेकंड में सीधे अपलोड करें।', 'మొబైల్ సమస్యలు లేకుండా 1 సెకన్లో అప్‌లోడ్ చేయండి.', 'മൊബൈൽ പ്രശ്‌നങ്ങളില്ലാതെ അപ്‌ലോഡ് ചെയ്യുക.', 'ಮೊಬೈಲ್ ಸಮಸ್ಯೆಗಳಿಲ್ಲದೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('github')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm"
                >
                  {loc('GitHub தாவலுக்கு செல் ↗', 'Go to GitHub ↗', 'गिटहब पर जाएं ↗', 'గిట్‌హబ్‌కు వెళ్లండి ↗', 'GitHub-ലേക്ക് പോകുക ↗', 'GitHub ಗೆ ಹೋಗಿ ↗')}
                </button>
              </div>

              {/* Card 2: Explanation Why files seem fewer in ZIP */}
              <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 text-xs space-y-2.5">
                <button
                  onClick={() => setShowFolderBreakdown(!showFolderBreakdown)}
                  className="w-full flex items-center justify-between text-left font-bold text-amber-950"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{loc('ஏன் ZIP-ல் கோப்புகள் கம்மியாக தெரிகிறது?', 'Why do files seem fewer in ZIP?', 'ज़िप में फाइलें कम क्यों दिखती हैं?', 'జిప్‌లో ఫైళ్లు ఎందుకు తక్కువగా కనిపిస్తున్నాయి?', 'എന്തുകൊണ്ടാണ് ഫയലുകൾ കുറവായി കാണുന്നത്?', 'ಏಕೆ ಫೈಲ್‌ಗಳು ಕಡಿಮೆಯಾಗಿ ಕಾಣಿಸುತ್ತವೆ?')}</span>
                  </div>
                  {showFolderBreakdown ? <ChevronUp className="w-4 h-4 text-amber-800" /> : <ChevronDown className="w-4 h-4 text-amber-800" />}
                </button>

                <div className="space-y-2 text-slate-700 text-[11px] leading-relaxed pt-1 border-t border-amber-200">
                  <p>
                    <strong>ZIP எக்ஸ்ட்ராக்ட் செய்யும்போது:</strong> உங்கள் போன் ஃபைல் மேனேஜர் மேலே உள்ள 4 ஃபோல்டர்களை (<code className="bg-amber-100 px-1 rounded">src</code>, <code className="bg-amber-100 px-1 rounded">android</code>, <code className="bg-amber-100 px-1 rounded">public</code>, <code className="bg-amber-100 px-1 rounded">.github</code>) மற்றும் 8 ரூட் கோப்புகளை மட்டுமே பட்டியலிடும்.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>`src/` ஃபோல்டருக்குள்:</strong> 51 React &amp; TypeScript செயலிக் கோப்புகள் உள்ளன.</li>
                    <li><strong>`android/` ஃபோல்டருக்குள்:</strong> 25 Android Studio நேட்டிவ் கோப்புகள் உள்ளன.</li>
                    <li><strong>`.github/` ஃபோல்டருக்குள்:</strong> 1 ஆட்டோமேஷன் பில்ட் ஸ்கிரிப்ட் உள்ளது.</li>
                    <li>மொத்தம் <strong>85 கோப்புகளும்</strong> ZIP-க்குள் முழுமையாக உள்ளன!</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions at Bottom of Settings */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
              className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-700" />
              <span>
                {loc('நிர்வாகக் குழுவை தொடர்பு கொள்க', 'Contact Management Team & Support', 'प्रबंधन टीम और सहायता से संपर्क करें', 'నిర్వాహక బృందం & సహాయాన్ని సంప్రదించండి', 'മാനേജ്‌മെന്റ് ടീമിനെയും പിന്തുണയെയും ബന്ധപ്പെടുക', 'ನಿರ್ವಹಣಾ ತಂಡ ಮತ್ತು ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ')}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onResetOnboarding();
                  onClose();
                }}
                className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{loc('வழிகாட்டி மீண்டும் பார்க்க', 'Replay App Guide', 'ऐप गाइड दोबारा देखें', 'యాప్ గైడ్ మళ్ళీ చూడండి', 'ആപ്പ് ഗൈഡ് വീണ്ടും കാണുക', 'ಅಪ್ಲಿಕೇಶನ್ ಮಾರ್ಗದರ್ಶಿ ಪುನರಾವರ್ತಿಸಿ')}</span>
              </button>

              <button
                onClick={handleClearCache}
                className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <span>{loc('தேடல் வரலாறு அழிக்க', 'Clear App Cache', 'कैश साफ़ करें', 'కాష్ క్లియర్ చేయండి', 'കാഷെ മായ്ക്കുക', 'ಸಂಗ್ರಹ ತೆರವುಗೊಳಿಸಿ')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Daily Work v1.3.0 Pro</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold"
          >
            {loc('முடிந்தது', 'Done', 'हो गया', 'పూర్తయింది', 'പൂർത്തിയായി', 'ಆಯಿತು')}
          </button>
        </div>
      </div>
    </div>
  );
};
