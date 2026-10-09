import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Briefcase,
  PhoneCall,
  MessageCircle,
  Users2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Share2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetOnboarding?: () => void;
}

export const ONBOARDING_STORAGE_KEY = 'daily_work_onboarding_completed_v1';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onResetOnboarding,
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'step-jobs',
      icon: Briefcase,
      iconColor: 'bg-emerald-600 text-white',
      badgeTa: 'படி 1 / 4',
      badgeEn: 'Step 1 of 4',
      titleTa: 'நேரடி தினக்கூலி வேலைகளை கண்டறியுங்கள்',
      titleEn: 'Discover Direct Daily Wage Jobs',
      descTa:
        'கொத்தனார், பெயிண்டர், விவசாயம், ஓட்டுநர், சுமை தூக்குதல் உள்ளிட்ட அனைத்து தினசரி வேலைகளையும் உடனடி கூலி விவரங்களுடன் எளிதாக பாருங்கள்.',
      descEn:
        'Browse masonry, painting, farming, driving, and loading jobs with verified daily wages in your local area across Tamil Nadu.',
      highlightTa: 'தினசரி புது வேலைகள் • நேரடி கூலி விவரம்',
      highlightEn: 'Updated Daily • Transparent Wages',
    },
    {
      id: 'step-contact',
      icon: PhoneCall,
      iconColor: 'bg-green-600 text-white',
      badgeTa: 'படி 2 / 4',
      badgeEn: 'Step 2 of 4',
      titleTa: 'இடைத்தரகர் இன்றி நேரடி WhatsApp & போன்',
      titleEn: 'Direct WhatsApp & Phone Calls - No Middlemen',
      descTa:
        'ஒரே கிளிக்கில் முதலாளியுடன் அல்லது தொழிலாளியுடன் வாட்ஸ்அப் அல்லது போன் மூலம் நேரில் பேசலாம். எந்த கமிஷனும் இல்லை, 100% இலவசம்.',
      descEn:
        'Connect directly via 1-click WhatsApp or Phone call. Zero commission, zero brokerage, 100% free direct communication.',
      highlightTa: '100% இலவசம் • கமிஷன் ஏதும் இல்லை',
      highlightEn: '100% Free • No Brokerage or Cuts',
    },
    {
      id: 'step-post',
      icon: Users2,
      iconColor: 'bg-amber-500 text-slate-950',
      badgeTa: 'படி 3 / 4',
      badgeEn: 'Step 3 of 4',
      titleTa: '60 வினாடிகளில் வேலை பதிவு செய்யுங்கள்',
      titleEn: 'Post Job Requirements in 60 Seconds',
      descTa:
        'உங்களுக்கு கட்டிட, பண்ணை அல்லது கடை வேலைக்கு உடனடியாக ஆட்கள் தேவையா? குரல் மூலமாகவோ அல்லது படிவம் மூலமாகவோ நொடியில் பதிவு செய்யுங்கள்.',
      descEn:
        'Need skilled or helper workers today? Post your requirement with daily wages in seconds or use Tamil Voice Search.',
      highlightTa: 'குரல் தேடல் (Voice Search) • உடனடி ஆட்கள்',
      highlightEn: 'Voice Search Enabled • Instant Hiring',
    },
    {
      id: 'step-community',
      icon: Share2,
      iconColor: 'bg-indigo-600 text-white',
      badgeTa: 'படி 4 / 4',
      badgeEn: 'Step 4 of 4',
      titleTa: 'சமூக ஊடகங்களில் வேலை வாய்ப்புகளை பகிருங்கள்',
      titleEn: 'Share Jobs & Join Social Media Groups',
      descTa:
        'WhatsApp, Telegram, Facebook மற்றும் X வழியாக வேலை விவரங்களை உங்கள் நண்பர்களுடன் பகிருங்கள். தினசரி வேலை அறிவிப்புகளுக்கு எங்கள் குழுக்களில் இணையுங்கள்.',
      descEn:
        'Share jobs across WhatsApp, Telegram, and Facebook. Join community channels to receive instant daily wage alert broadcasts.',
      highlightTa: 'சமூக ஊடக பகிர்வு • வாட்ஸ்அப் வேலை குழு',
      highlightEn: 'Social Media Sharing • WhatsApp Job Alerts',
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  return (
    <div
      id="onboarding-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100 relative">
        {/* Header Close & Skip */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {language === 'ta' ? step.badgeTa : step.badgeEn}
          </span>

          <button
            onClick={handleComplete}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            title="மூடுக / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Visual Art */}
        <div className="text-center py-2 space-y-3">
          <div className="relative inline-block">
            <div
              className={`w-16 h-16 rounded-2xl ${step.iconColor} flex items-center justify-center shadow-lg mx-auto transition-all`}
            >
              <StepIcon className="w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-snug">
              {language === 'ta' ? step.titleTa : step.titleEn}
            </h3>
            {language === 'bilingual' && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {language === 'bilingual' && (currentStep === 0 ? step.titleTa : step.titleEn)}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed px-1">
            {language === 'ta' ? step.descTa : step.descEn}
          </p>

          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{language === 'ta' ? step.highlightTa : step.highlightEn}</span>
          </div>
        </div>

        {/* Dots Pagination */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors active:scale-95"
              title="முந்தைய / Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>
              {currentStep === steps.length - 1
                ? language === 'ta'
                  ? 'தொடங்கலாம் (Get Started)'
                  : 'Get Started'
                : language === 'ta'
                ? 'அடுத்து (Next)'
                : 'Next'}
            </span>
            {currentStep < steps.length - 1 ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Reset Onboarding Option */}
        {onResetOnboarding && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                onResetOnboarding();
                setCurrentStep(0);
              }}
              className="text-[10px] text-slate-400 hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{language === 'ta' ? 'அறிமுகத்தை மீண்டும் முதன்முறைக்கு ரீசெட் செய்' : 'Reset Onboarding Tour'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
