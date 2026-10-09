import React, { useState } from 'react';
import { SubscriptionPlan, EmployerSubscription, PaymentTransaction, OwnerPaymentConfig, Screen } from '../types';
import { SUBSCRIPTION_PLANS, DEFAULT_OWNER_PAYMENT_CONFIG } from '../data/monetizationData';
import { useLanguage } from '../context/LanguageContext';
import { PaymentModal } from './PaymentModal';
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Calendar,
  Briefcase,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PricingScreenProps {
  subscription?: EmployerSubscription;
  currentSubscription?: EmployerSubscription;
  onUpdateSubscription?: (newPlanId: 'free' | 'basic' | 'premium', tx: PaymentTransaction) => void;
  onUpgrade?: (newSubOrPlanId: any, tx: PaymentTransaction) => void;
  onNavigateToPostJob?: () => void;
  onNavigate?: (screen: Screen) => void;
  ownerPaymentConfig?: OwnerPaymentConfig;
}

const FALLBACK_SUBSCRIPTION: EmployerSubscription = {
  planId: 'free',
  employerName: '',
  employerPhone: '',
  startedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  featuredCreditsRemaining: 0,
  status: 'active',
};

export const PricingScreen: React.FC<PricingScreenProps> = ({
  subscription,
  currentSubscription,
  onUpdateSubscription,
  onUpgrade,
  onNavigateToPostJob,
  onNavigate,
  ownerPaymentConfig = DEFAULT_OWNER_PAYMENT_CONFIG,
}) => {
  const { language } = useLanguage();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);

  // Robust fallback to prevent 'Cannot read properties of undefined (reading planId)'
  const activeSub: EmployerSubscription = {
    ...FALLBACK_SUBSCRIPTION,
    ...(subscription || currentSubscription || {}),
  };

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === activeSub.planId) || SUBSCRIPTION_PLANS[0];

  const handleCheckoutSuccess = (tx: PaymentTransaction) => {
    if (selectedPlanForCheckout) {
      if (onUpdateSubscription) {
        onUpdateSubscription(selectedPlanForCheckout.id, tx);
      } else if (onUpgrade) {
        onUpgrade(selectedPlanForCheckout.id, tx);
      }
      setSelectedPlanForCheckout(null);
    }
  };

  const handleGoToPostJob = () => {
    if (onNavigateToPostJob) {
      onNavigateToPostJob();
    } else if (onNavigate) {
      onNavigate('post-job');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black shrink-0 border border-white/30">
            <Crown className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-amber-900/20 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              <span>முதலாளிகளுக்கான சந்தா / Employer Membership</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight leading-tight text-slate-950">
              {language === 'ta'
                ? 'முதலாளி பிரீமியம் திட்டங்கள்'
                : language === 'en'
                ? 'Employer Premium Plans'
                : 'முதலாளி சந்தா (Employer Plans)'}
            </h2>
            <p className="text-xs text-amber-950/80 mt-0.5">
              {language === 'ta'
                ? 'அதிக வேலைகள் பதிவு செய்து விரைவாக ஆட்களைப் பெறுங்கள்.'
                : 'Hire verified daily workers faster with priority listing & badges.'}
            </p>
          </div>
        </div>
      </div>

      {/* Reassurance Banner: Workers Free Forever */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">
            {language === 'ta'
              ? 'தொழிலாளர்களுக்கு 100% இலவசம்!'
              : 'Workers & Daily Job Seekers are 100% FREE!'}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            {language === 'ta'
              ? 'தினக்கூலி தொழிலாளர்களிடம் எந்தவித கட்டணமும் வசூலிக்கப்பட மாட்டாது. முதலாளிகள் மட்டுமே விளம்பரம் மற்றும் முன்னுரிமைக்காக செலுத்துகிறார்கள்.'
              : 'We never charge daily wage earners. Only employers subscribe for extra volume and featured placement.'}
          </p>
        </div>
      </div>

      {/* Current Active Plan Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {language === 'ta' ? 'தற்போதைய திட்டம்' : 'Current Active Plan'}
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {language === 'en' ? currentPlan.nameEn : currentPlan.nameTa}
              </h4>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
              activeSub.status === 'active'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {activeSub.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
          <div>
            <span className="text-[10px] text-slate-400 block">
              {language === 'ta' ? 'இலவச சிறப்பு வேலைகள்:' : 'Featured Credits:'}
            </span>
            <span className="font-bold text-slate-800">
              {activeSub.featuredCreditsRemaining} {language === 'ta' ? 'மீதம்' : 'Remaining'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">
              {language === 'ta' ? 'காலாவதி தேதி:' : 'Valid Until:'}
            </span>
            <span className="font-semibold text-slate-800">
              {new Date(activeSub.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {language === 'ta' ? 'திட்டங்களை ஒப்பிடுக' : 'Choose a Plan'}
        </h3>

        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = activeSub.planId === plan.id;
          const isPaid = plan.price > 0;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-4 border transition-all relative ${
                plan.popular
                  ? 'border-2 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase">
                  {language === 'en' ? plan.badgeEn : plan.badgeTa}
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {language === 'en' ? plan.nameEn : plan.nameTa}
                  </h4>
                  {language === 'bilingual' && (
                    <p className="text-[11px] text-slate-500">{plan.nameEn}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-xl font-black text-emerald-700">₹{plan.price}</span>
                    <span className="text-[11px] text-slate-500">
                      /{language === 'en' ? plan.periodEn : plan.periodTa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlights pills */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-600" />
                  {plan.maxJobs === 'unlimited'
                    ? language === 'ta' ? 'வரம்பற்ற வேலைகள்' : 'Unlimited Jobs'
                    : `${plan.maxJobs} ${language === 'ta' ? 'வேலைகள்/மாதம்' : 'Jobs/mo'}`}
                </span>
                {plan.featuredCredits > 0 && (
                  <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {plan.featuredCredits} {language === 'ta' ? 'சிறப்பு வேலைகள்' : 'Featured Credits'}
                  </span>
                )}
              </div>

              {/* Features List */}
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                {(language === 'ta' ? plan.featuresTa : plan.featuresEn).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                {isCurrent ? (
                  <div className="w-full bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs text-center border border-slate-200">
                    {language === 'ta' ? '✓ இது உங்கள் தற்போதைய திட்டம்' : '✓ Current Active Plan'}
                  </div>
                ) : isPaid ? (
                  <button
                    id={`btn-upgrade-${plan.id}`}
                    onClick={() => setSelectedPlanForCheckout(plan)}
                    className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 ${
                      plan.popular
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span>
                      {language === 'ta'
                        ? `₹${plan.price} செலுத்தி மேம்படுத்துக`
                        : `Upgrade for ₹${plan.price}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGoToPostJob}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs text-center"
                  >
                    {language === 'ta' ? 'இலவசமாக வேலை பதிய' : 'Post Free Job'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedPlanForCheckout && (
        <PaymentModal
          isOpen={!!selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          titleEn={`${selectedPlanForCheckout.nameEn} Plan Subscription`}
          titleTa={`${selectedPlanForCheckout.nameTa} சந்தா`}
          amount={selectedPlanForCheckout.price}
          purpose="subscription"
          targetItemId={selectedPlanForCheckout.id}
          payerName={activeSub.employerName}
          payerPhone={activeSub.employerPhone}
          ownerPaymentConfig={ownerPaymentConfig}
          onPaymentSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};
