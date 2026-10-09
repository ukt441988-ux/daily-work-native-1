import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  AlertCircle,
  Check,
  Search,
  Languages,
  RotateCcw,
  Briefcase,
  Users,
  Store,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export type VoiceSearchTarget = 'jobs' | 'workers' | 'shops' | 'all';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (query: string, target?: VoiceSearchTarget) => void;
  initialQuery?: string;
  initialTarget?: VoiceSearchTarget;
  contextTitleEn?: string;
  contextTitleTa?: string;
  allowedTargets?: VoiceSearchTarget[];
}

// Popular voice search prompt tags categorized by target
export const VOICE_SEARCH_TAGS_BY_TARGET: Record<
  VoiceSearchTarget,
  Array<{ en: string; ta: string }>
> = {
  jobs: [
    { en: 'Mason Job', ta: 'மேசன் வேலை' },
    { en: 'Painter Work', ta: 'பெயிண்டர் வேலை' },
    { en: 'Electrician', ta: 'எலக்ட்ரீஷியன்' },
    { en: 'Plumber', ta: 'பிளம்பர் பணி' },
    { en: 'Carpenter', ta: 'தச்சர் வேலை' },
    { en: 'Daily Helper Wage', ta: 'தினசரி கூலி வேலை' },
    { en: 'Cleaning Work', ta: 'துப்புரவு பணி' },
    { en: 'Chennai Jobs', ta: 'சென்னை வேலைகள்' },
    { en: 'Coimbatore Jobs', ta: 'கோவை வேலைகள்' },
    { en: 'Madurai Jobs', ta: 'மதுரை வேலைகள்' },
  ],
  workers: [
    { en: 'Mason Worker', ta: 'மேசன் தொழிலாளி' },
    { en: 'Painter Crew', ta: 'பெயிண்டர் ஆட்கள்' },
    { en: 'Helpers Needed', ta: 'கூலி ஆட்கள் தேவை' },
    { en: 'Tiles Mason', ta: 'டைல்ஸ் மேஸ்திரி' },
    { en: 'Welder', ta: 'வெல்டர் தொழிலாளி' },
    { en: 'Electrician Man', ta: 'எலக்ட்ரீஷியன் ஆள்' },
    { en: 'Bar Bender', ta: 'கட்டுக்கம்பி தொழிலாளி' },
    { en: 'Trichy Workers', ta: 'திருச்சி ஆட்கள்' },
    { en: 'Salem Workers', ta: 'சேலம் தொழிலாளர்கள்' },
  ],
  shops: [
    { en: 'Cement Shop', ta: 'சிமெண்ட் கடை' },
    { en: 'Hardware Mart', ta: 'ஹார்டுவேர் கடை' },
    { en: 'Sand & Bricks', ta: 'எம்-சாண்ட் & செங்கல்' },
    { en: 'TMT Steel Rods', ta: 'TMT கம்பி கடை' },
    { en: 'Mixer Machine Rental', ta: 'கான்கிரீட் மிக்சர் வாடகை' },
    { en: 'Plumbing Supplies', ta: 'பிளம்பிங் பைப் கடை' },
    { en: 'Paint Mart', ta: 'பெயிண்ட் கடை' },
    { en: 'Chennai Shops', ta: 'சென்னை கடைகள்' },
    { en: 'Madurai Stores', ta: 'மதுரை கட்டுமான பொருட்கள்' },
  ],
  all: [
    { en: 'Mason', ta: 'மேசன்' },
    { en: 'Cement Store', ta: 'சிமெண்ட் கடை' },
    { en: 'Painter Crew', ta: 'பெயிண்டர் ஆட்கள்' },
    { en: 'Electrician', ta: 'எலக்ட்ரீஷியன்' },
    { en: 'Hardware Mart', ta: 'ஹார்டுவேர் மார்ட்' },
    { en: 'Machinery Rental', ta: 'இயந்திர வாடகை' },
    { en: 'Daily Helpers', ta: 'தினக்கூலி ஆட்கள்' },
    { en: 'Chennai', ta: 'சென்னை' },
    { en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
  ],
};

export function detectSmartTarget(text: string): VoiceSearchTarget | null {
  const lower = text.toLowerCase();
  if (
    lower.includes('கடை') ||
    lower.includes('சிமெண்ட்') ||
    lower.includes('ஹார்டுவேர்') ||
    lower.includes('மணல்') ||
    lower.includes('செங்கல்') ||
    lower.includes('கம்பி') ||
    lower.includes('வாடகை') ||
    lower.includes('பொருள்') ||
    lower.includes('டூல்ஸ்') ||
    lower.includes('பைப்') ||
    lower.includes('shop') ||
    lower.includes('hardware') ||
    lower.includes('cement') ||
    lower.includes('material') ||
    lower.includes('rental')
  ) {
    return 'shops';
  }
  if (
    lower.includes('ஆட்கள்') ||
    lower.includes('ஆள்') ||
    lower.includes('தொழிலாளி') ||
    lower.includes('தொழிலாளர்கள்') ||
    lower.includes('மேஸ்திரி') ||
    lower.includes('கூலியாள்') ||
    lower.includes('worker') ||
    lower.includes('helper') ||
    lower.includes('labour')
  ) {
    return 'workers';
  }
  if (
    lower.includes('வேலை') ||
    lower.includes('வேலைகள்') ||
    lower.includes('பணி') ||
    lower.includes('job') ||
    lower.includes('vacancy') ||
    lower.includes('salary') ||
    lower.includes('கூலி')
  ) {
    return 'jobs';
  }
  return null;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onApplyQuery,
  initialQuery = '',
  initialTarget = 'all',
  contextTitleEn = 'Voice Search for Jobs, Workers & Shops',
  contextTitleTa = 'வேலை, ஆட்கள், கடைகள் குரல் தேடல்',
  allowedTargets = ['all', 'jobs', 'workers', 'shops'],
}) => {
  const { language, loc } = useLanguage();

  const getLangCode = (l: string): 'ta-IN' | 'en-IN' | 'hi-IN' | 'te-IN' | 'ml-IN' | 'kn-IN' => {
    switch (l) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-IN';
    }
  };

  const [speechLang, setSpeechLang] = useState<string>(getLangCode(language));
  const [target, setTarget] = useState<VoiceSearchTarget>(initialTarget);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(initialQuery);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Reference to SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Update speechLang if app language changes
  useEffect(() => {
    setSpeechLang(getLangCode(language));
  }, [language]);

  // Sync initial target
  useEffect(() => {
    if (initialTarget) {
      setTarget(initialTarget);
    }
  }, [initialTarget]);

  // Clean up recognition when unmounting or closing
  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      setInterimTranscript('');
    }
  }, [isOpen]);

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
    const stateObj = { dw_modal: 'voice_search' };
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

  // Start listening automatically when modal opens if supported
  useEffect(() => {
    if (isOpen) {
      setTranscript(initialQuery);
      setInterimTranscript('');
      setErrorMsg(null);
      startListening();
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      setErrorMsg(null);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          const cleaned = currentFinal.trim();
          setTranscript(cleaned);
          setInterimTranscript('');
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMsg(
            speechLang === 'ta-IN'
              ? 'குரல் எதுவும் கேட்கவில்லை. மீண்டும் பேசவும்.'
              : 'No speech detected. Please speak clearly.'
          );
        } else if (event.error === 'not-allowed') {
          setErrorMsg(
            speechLang === 'ta-IN'
              ? 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவியில் அனுமதிக்கவும்.'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else {
          setErrorMsg(
            speechLang === 'ta-IN'
              ? 'குரல் அடையாளம் காண முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : `Voice error: ${event.error}. Please try again.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMsg(err?.message || 'Unable to start microphone');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleApply = (explicitTarget?: VoiceSearchTarget, textToApply?: string) => {
    const finalQuery = (textToApply !== undefined ? textToApply : transcript).trim();
    const finalTarget = explicitTarget || target;
    onApplyQuery(finalQuery, finalTarget);
    onClose();
  };

  const handleSelectTag = (tag: { en: string; ta: string }) => {
    const chosen = speechLang === 'ta-IN' ? tag.ta.split('/')[0].trim() : tag.en;
    setTranscript(chosen);
    handleApply(target, chosen);
  };

  const detectedIntent = transcript.trim() ? detectSmartTarget(transcript.trim()) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-3.5 py-3.5 flex items-center justify-between">
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
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                {loc('குரல் வழி தேடல்', 'Voice Search', 'ध्वनि खोज', 'వాయిస్ శోధన', 'ശബ്ദ തിരയൽ', 'ಧ್ವನಿ ಹುಡುಕಾಟ')}
              </h3>
              <p className="text-[11px] text-emerald-100 line-clamp-1">
                {loc(
                  contextTitleTa,
                  contextTitleEn,
                  'काम, कामगार या दुकानें खोजें',
                  'ఉద్యోగాలు, కార్మికులు లేదా దుకాణాలను శోధించండి',
                  'ജോലികൾ, തൊഴിലാളികൾ അല്ലെങ്കിൽ കടകൾ തിരയുക',
                  'ಕೆಲಸಗಳು, ಕೆಲಸಗಾರರು ಅಥವಾ ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಿ'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            title={loc('மூடு', 'Close', 'बंद करें', 'మూసివేయి', 'അടയ്ക്കുക', 'ಮುಚ್ಚಿ')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Selector Tabs (Prompt requirement: Search Jobs, Workers, Shops, All) */}
        {allowedTargets.length > 1 && (
          <div className="bg-slate-100 p-2 border-b border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1 mb-1 block">
              {loc('எதனை தேட விரும்புகிறீர்கள்?', 'What do you want to search?', 'आप क्या खोजना चाहते हैं?', 'మీరు ఏమి శోధించాలనుకుంటున్నారు?', 'നിങ്ങൾ എന്താണ് തിരയാൻ ആഗ്രഹിക്കുന്നത്?', 'ನೀವು ಏನನ್ನು ಹುಡುಕಲು ಬಯಸುತ್ತೀರಿ?')}
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  target === 'all'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{loc('அனைத்தும்', 'All', 'सभी', 'అన్నీ', 'എല്ലാം', 'ಎಲ್ಲಾ')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTarget('jobs')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  target === 'jobs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>{loc('வேலைகள்', 'Jobs', 'काम', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸ')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTarget('workers')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  target === 'workers'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>{loc('ஆட்கள்', 'Workers', 'कारीगर', 'కార్మికులు', 'ആളുകൾ', 'ಆಳು')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTarget('shops')}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  target === 'shops'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>{loc('கடைகள்', 'Shops', 'दुकानें', 'షాపులు', 'കടകൾ', 'ಅಂಗಡಿ')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 text-center space-y-3.5">
          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200">
            <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              onClick={() => {
                setSpeechLang(getLangCode(language));
                if (isListening) stopListening();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                speechLang !== 'en-IN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {loc('தமிழ்', 'Native', 'हिन्दी', 'తెలుగు', 'മലയാളം', 'ಕನ್ನಡ')}
            </button>
            <button
              onClick={() => {
                setSpeechLang('en-IN');
                if (isListening) stopListening();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                speechLang === 'en-IN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Big Microphone Visual */}
          <div className="py-1 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Pulsing rings when listening */}
              {isListening && (
                <>
                  <div className="absolute -inset-3 rounded-full bg-emerald-400/30 animate-ping opacity-75 pointer-events-none" />
                  <div className="absolute -inset-6 rounded-full bg-emerald-400/15 animate-pulse pointer-events-none" />
                </>
              )}

              <button
                id="btn-voice-mic-toggle"
                onClick={isListening ? stopListening : startListening}
                className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-4 ring-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title={isListening ? 'Stop recording' : 'Start speaking'}
              >
                {isListening ? (
                  <Mic className="w-8 h-8 text-white animate-bounce" />
                ) : (
                  <MicOff className="w-7 h-7 text-slate-400" />
                )}
              </button>
            </div>

            {/* Listening Status Text */}
            <p className="mt-2.5 text-xs font-bold">
              {isListening ? (
                <span className="text-emerald-700 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {target === 'jobs' && loc('வேலைகள் தேட பேசவும்...', 'Listening for jobs...', 'काम के लिए बोलें...', 'పనుల కోసం మాట్లాడండి...', 'ജോലികൾക്കായി സംസാരിക്കുക...', 'ಕೆಲಸಕ್ಕಾಗಿ ಮಾತನಾಡಿ...')}
                  {target === 'workers' && loc('ஆட்கள் / தொழிலாளர்கள் தேட பேசவும்...', 'Listening for workers...', 'कारीगरों के लिए बोलें...', 'కార్మికుల కోసం మాట్లాడండి...', 'തൊഴിലാളികൾക്കായി സംസാരിക്കുക...', 'ಕೆಲಸಗಾರರಿಗಾಗಿ ಮಾತನಾಡಿ...')}
                  {target === 'shops' && loc('கடைகள் & கட்டுமான பொருட்கள் தேட பேசவும்...', 'Listening for shops...', 'दुकानों के लिए बोलें...', 'షాపుల కోసం మాట్లాడండి...', 'കടകൾക്കായി സംസാരിക്കുക...', 'ಅಂಗಡಿಗಳಿಗಾಗಿ ಮಾತನಾಡಿ...')}
                  {target === 'all' && loc('வேலை, ஆட்கள், கடைகள் அனைத்தையும் தேட பேசவும்...', 'Listening for all information...', 'सभी जानकारी के लिए बोलें...', 'అన్ని వివరాల కోసం మాట్లాడండి...', 'എല്ലാ വിവരങ്ങൾക്കുമായി സംസാരിക്കുക...', 'ಎಲ್ಲಾ ವಿವರಗಳಿಗಾಗಿ ಮಾತನಾಡಿ...')}
                </span>
              ) : (
                <span className="text-slate-500">
                  {loc('பேச மைக் பட்டனை அழுத்தவும்', 'Tap mic to start speaking', 'माइक दबाकर बोलें', 'మాట్లాడటానికి మైక్ నొక్కండి', 'സംസാരിക്കാൻ മൈക്ക് അമർത്തുക', 'ಮಾತನಾಡಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿರಿ')}
                </span>
              )}
            </p>
          </div>

          {/* Spoken Text Display Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-h-[64px] flex flex-col items-center justify-center text-center">
            {transcript || interimTranscript ? (
              <p className="text-base font-black text-slate-900 break-words">
                "{transcript}"
                {interimTranscript && (
                  <span className="text-slate-400 font-normal ml-1 italic">
                    {interimTranscript}...
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {target === 'jobs' && loc('எ.கா: "மேசன் வேலை சென்னை", "பெயிண்டர்", "கூலி வேலை"', 'e.g., "Mason job Chennai", "Painter work"', 'उदा: "मेसन काम चेन्नई"', 'ఉదా: "మేసన్ పని చెన్నై"', 'ഉദാ: "മേസൻ ജോലി"', 'ಉದಾ: "ಮೇಸನ್ ಕೆಲಸ"')}
                {target === 'workers' && loc('எ.கா: "கொத்தனார் ஆட்கள்", "பெயிண்டர் தேவை", "கோவை தொழிலாளி"', 'e.g., "Mason workers", "Painter needed"', 'उदा: "कारीगर चाहिए"', 'ఉదా: "కార్మికులు కావాలి"', 'ഉദാ: "തൊഴിലാളികൾ വേണം"', 'ಉದಾ: "ಕೆಲಸಗಾರರು ಬೇಕು"')}
                {target === 'shops' && loc('எ.கா: "சிமெண்ட் கடை", "ஹார்டுவேர் மார்ட்", "இயந்திர வாடகை"', 'e.g., "Cement shop", "Hardware mart"', 'उदा: "सीमेंट की दुकान"', 'ఉదా: "సిమెంట్ దుకాణం"', 'ഉദാ: "സിമന്റ് കട"', 'ಉದಾ: "ಸಿಮೆಂಟ್ ಅಂಗಡಿ"')}
                {target === 'all' && loc('எ.கா: "மேசன்", "சிமெண்ட் கடை", "பெயிண்டர் ஆட்கள்"', 'e.g., "Mason", "Cement shop", "Painters"', 'उदा: "मेसन", "सीमेंट दुकान"', 'ఉదా: "మేసన్", "సిమెంట్ షాప్"', 'ഉദാ: "മേസൻ", "സിമന്റ് കട"', 'ಉದಾ: "ಮೇಸನ್", "ಸಿಮೆಂಟ್ ಅಂಗಡಿ"')}
              </p>
            )}

            {/* Smart Intent Detection Pill */}
            {detectedIntent && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{loc('கண்டறியப்பட்ட பிரிவு:', 'Detected intent:', 'पहचाना गया:', 'గుర్తించబడింది:', 'തിരിച്ചറിഞ്ഞത്:', 'ಗುರುತಿಸಲಾಗಿದೆ:')}</span>
                <span className="underline font-black">
                  {detectedIntent === 'jobs' && loc('வேலைகள்', 'Jobs', 'काम', 'పనులు', 'ജോലികൾ', 'ಕೆಲಸ')}
                  {detectedIntent === 'workers' && loc('ஆட்கள்', 'Workers', 'कारीगर', 'కార్మికులు', 'ആളുകൾ', 'ಕೆಲಸಗಾರರು')}
                  {detectedIntent === 'shops' && loc('கடைகள்', 'Shops', 'दुकानें', 'షాపులు', 'കടകൾ', 'ಅಂಗಡಿಗಳು')}
                </span>
              </div>
            )}
          </div>

          {/* Quick Direct Category Action Buttons when text is present */}
          {transcript.trim() && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-left px-1">
                {loc('எதில் தேட விரும்புகிறீர்கள்?', 'Choose search destination:', 'कहाँ खोजना चाहते हैं?', 'ఎక్కడ శోధించాలి?', 'എവിടെ തിരയണം?', 'ಎಲ್ಲಿ ಹುಡುಕಬೇಕು?')}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApply('jobs')}
                  className="py-1.5 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Briefcase className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{loc('வேலைகளில்', 'In Jobs', 'काम में', 'పనులలో', 'ജോലികളിൽ', 'ಕೆಲಸಗಳಲ್ಲಿ')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply('workers')}
                  className="py-1.5 px-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Users className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{loc('ஆட்களில்', 'In Workers', 'कारीगर में', 'కార్మికులలో', 'ആളുകളിൽ', 'ಕೆಲಸಗಾರರಲ್ಲಿ')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply('shops')}
                  className="py-1.5 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Store className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{loc('கடைகளில்', 'In Shops', 'दुकानों में', 'షాపులలో', 'കടകളിൽ', 'ಅಂಗಡಿಗಳಲ್ಲಿ')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply('all')}
                  className="py-1.5 px-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{loc('அனைத்தும்', 'All 3', 'सभी 3', 'అన్నీ', 'എല്ലാം', 'ಎಲ್ಲಾ')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-800 font-medium leading-tight">{errorMsg}</p>
            </div>
          )}

          {/* Quick Spoken Tag Presets based on active target */}
          <div className="space-y-1.5 text-left pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {target === 'jobs' && loc('பிரபலமான வேலை தேடல்கள்:', 'Popular job search tags:', 'लोकप्रिय काम खोजें:', 'ప్రముఖ ఉద్యోగ శోధనలు:', 'ജനപ്രിയ തൊഴിൽ തിരയലുകൾ:', 'ಜನಪ್ರಿಯ ಉದ್ಯೋಗ ಹುಡುಕಾಟಗಳು:')}
              {target === 'workers' && loc('பிரபலமான ஆட்கள் தேடல்கள்:', 'Popular worker search tags:', 'लोकप्रिय कामगार खोजें:', 'ప్రముఖ కార్మిక శోధనలు:', 'ജനപ്രിയ തൊഴിലാളി തിരയലുകൾ:', 'ಜನಪ್ರಿಯ ಕೆಲಸಗಾರ ಹುಡುಕಾಟಗಳು:')}
              {target === 'shops' && loc('பிரபலமான கடை தேடல்கள்:', 'Popular store search tags:', 'लोकप्रिय दुकान खोजें:', 'ప్రముఖ దుకాణ శోధనలు:', 'ജനപ്രിയ കട തിരയലുകൾ:', 'ಜನಪ್ರಿಯ ಅಂಗಡಿ ಹುಡುಕಾಟಗಳು:')}
              {target === 'all' && loc('பிரபலமான விரைவுத் தேடல்கள்:', 'Popular quick search tags:', 'त्वरित खोज शब्द:', 'త్వరిత శోధనలు:', 'ദ്രുത തിരയലുകൾ:', 'ತ್ವರಿತ ಹುಡುಕಾಟಗಳು:')}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {(VOICE_SEARCH_TAGS_BY_TARGET[target] || VOICE_SEARCH_TAGS_BY_TARGET.all).map((tag, idx) => {
                const label = speechLang.startsWith('ta') ? tag.ta : tag.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setInterimTranscript('');
                startListening();
              }}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{loc('மீண்டும் பேச', 'Retry', 'पुनः प्रयास', 'మళ్లీ మాట్లాడండి', 'വീണ്ടും സംസാരിക്കുക', 'ಮತ್ತೆ ಮಾತನಾಡಿ')}</span>
            </button>

            <button
              id="btn-voice-search-confirm"
              type="button"
              disabled={!transcript.trim()}
              onClick={() => handleApply()}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>
                {target === 'jobs' && loc('வேலைகள் தேடுக', 'Search Jobs', 'काम खोजें', 'పనులు వెతకండి', 'ജോലികൾ തിരയുക', 'ಕೆಲಸ ಹುಡುಕಿ')}
                {target === 'workers' && loc('ஆட்கள் தேடுக', 'Search Workers', 'कारीगर खोजें', 'కార్మికులను వెతకండి', 'തൊഴിലാളികളെ തിരയുക', 'ಕೆಲಸಗಾರರನ್ನು ಹುಡುಕಿ')}
                {target === 'shops' && loc('கடைகள் தேடுக', 'Search Shops', 'दुकानें खोजें', 'షాపులు వెతకండి', 'കടകൾ തിരയുക', 'ಅಂಗಡಿಗಳನ್ನು ಹುಡುಕಿ')}
                {target === 'all' && loc('அனைத்தும் தேடுக', 'Search All', 'सभी खोजें', 'అన్నీ వెతకండి', 'എല്ലാം തിരയുക', 'ಎಲ್ಲಾ ಹುಡುಕಿ')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
