import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  AdTargetScope,
  AdScopePricingTier,
  getSavedScopePricingTiers,
  saveScopePricingTiers,
  resetScopePricingTiers,
  AD_SCOPE_PRICING_TIERS,
} from '../data/monetizationData';
import {
  X,
  IndianRupee,
  CheckCircle2,
  RotateCcw,
  Globe,
  Map,
  Building,
  MapPin,
  Sparkles,
  ShieldCheck,
  Save,
  AlertCircle,
} from 'lucide-react';

interface OwnerAdPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPricingUpdated?: (tiers: Record<AdTargetScope, AdScopePricingTier>) => void;
}

export const OwnerAdPricingModal: React.FC<OwnerAdPricingModalProps> = ({
  isOpen,
  onClose,
  onPricingUpdated,
}) => {
  const { language, loc } = useLanguage();
  const [tiers, setTiers] = useState<Record<AdTargetScope, AdScopePricingTier>>(getSavedScopePricingTiers);
  const [activeScopeTab, setActiveScopeTab] = useState<AdTargetScope>('district');
  const [saveNotice, setSaveNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTiers(getSavedScopePricingTiers());
      setSaveNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scopes: { id: AdTargetScope; labelTa: string; labelEn: string; icon: any }[] = [
    { id: 'country', labelTa: '🌐 நாடு முழுவதும்', labelEn: '🌐 Entire Country', icon: Globe },
    { id: 'state', labelTa: '🗺️ மாநிலம் முழுவதும்', labelEn: '🗺️ Entire State', icon: Map },
    { id: 'district', labelTa: '🏢 மாவட்டம் முழுவதும்', labelEn: '🏢 Entire District', icon: Building },
    { id: 'city', labelTa: '📍 நகரம் / உள்ளூர்', labelEn: '📍 City / Local', icon: MapPin },
  ];

  const handleUpdatePrice = (scope: AdTargetScope, planIndex: number, newPrice: number) => {
    setTiers((prev) => {
      const currentTier = prev[scope];
      if (!currentTier) return prev;
      const updatedPlans = [...currentTier.plans];
      if (updatedPlans[planIndex]) {
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          price: Math.max(0, newPrice),
        };
      }
      return {
        ...prev,
        [scope]: {
          ...currentTier,
          plans: updatedPlans,
        },
      };
    });
  };

  const handleUpdateDays = (scope: AdTargetScope, planIndex: number, newDays: number) => {
    setTiers((prev) => {
      const currentTier = prev[scope];
      if (!currentTier) return prev;
      const updatedPlans = [...currentTier.plans];
      if (updatedPlans[planIndex]) {
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          days: Math.max(1, newDays),
        };
      }
      return {
        ...prev,
        [scope]: {
          ...currentTier,
          plans: updatedPlans,
        },
      };
    });
  };

  const handleSave = () => {
    saveScopePricingTiers(tiers);
    if (onPricingUpdated) {
      onPricingUpdated(tiers);
    }
    setSaveNotice(true);
    setTimeout(() => {
      setSaveNotice(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    const confirmMsg =
      language === 'ta'
        ? 'அனைத்து விளம்பரப் பகுதி கட்டணங்களையும் (Scope Pricing) ஆரம்ப இயல்புநிலைக்கு மாற்ற உறுதிப்படுத்துகிறீர்களா?'
        : 'Reset all advertisement scope pricing tiers to factory default rates?';
    if (window.confirm(confirmMsg)) {
      const defaultTiers = resetScopePricingTiers();
      setTiers(defaultTiers);
      if (onPricingUpdated) {
        onPricingUpdated(defaultTiers);
      }
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2000);
    }
  };

  const currentTier = tiers[activeScopeTab] || AD_SCOPE_PRICING_TIERS[activeScopeTab];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>{language === 'ta' ? 'நிர்வாக விளம்பர விலை நிர்ணயம்' : 'Owner Advertisement Pricing Control'}</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Admin
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ta'
                  ? 'நாடு, மாநிலம், மாவட்டம், நகரம் வாரியாக விளம்பரக் கட்டணங்களை நிர்ணயிக்கவும்'
                  : 'Set ad pricing based on reach: Country, State, District, and City'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Save Notice */}
        {saveNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'ta'
                ? 'விளம்பரக் கட்டணங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன! அனைத்து திரைகளிலும் புதிய விலை உடனடியாக நடைமுறைக்கு வந்துள்ளது.'
                : 'Ad pricing successfully updated and applied across all app screens!'}
            </span>
          </div>
        )}

        {/* Scope Tabs Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {language === 'ta' ? 'விளம்பரப் பகுதி வகை (Target Scope):' : 'Select Target Reach Scope:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {scopes.map((s) => {
              const Icon = s.icon;
              const isSelected = activeScopeTab === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveScopeTab(s.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      ₹{tiers[s.id]?.plans?.[0]?.price || 0}
                    </span>
                  </div>
                  <span className="text-xs font-bold mt-1.5 truncate">
                    {language === 'ta' ? s.labelTa : s.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope Info Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{language === 'ta' ? currentTier.nameTa : currentTier.nameEn}</span>
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {language === 'ta' ? currentTier.badgeTa : currentTier.badgeEn}
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            {language === 'ta' ? currentTier.descriptionTa : currentTier.descriptionEn}
          </p>
        </div>

        {/* Duration Plans Table */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>
              {language === 'ta'
                ? `${currentTier.nameTa} - கட்டணத் திட்டங்கள்`
                : `${currentTier.nameEn} - Duration Packages`}
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              {language === 'ta' ? 'நாட்கள் & தொகையை மாற்றலாம்' : 'Edit days & amounts'}
            </span>
          </h4>

          <div className="space-y-2">
            {currentTier.plans.map((plan, idx) => (
              <div
                key={plan.id || idx}
                className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-300 transition-all grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
              >
                <div className="sm:col-span-5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'ta' ? plan.labelTa : plan.labelEn}
                    </span>
                  </div>
                  {plan.isPopular && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-1 inline-block">
                      ★ POPULAR
                    </span>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    {language === 'ta' ? 'நாட்கள் (Days)' : 'Days'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={plan.days}
                    onChange={(e) =>
                      handleUpdateDays(activeScopeTab, idx, parseInt(e.target.value) || 1)
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">
                    {language === 'ta' ? 'விலை (₹ Price)' : 'Price (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={plan.price}
                      onChange={(e) =>
                        handleUpdatePrice(activeScopeTab, idx, parseInt(e.target.value) || 0)
                      }
                      className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-indigo-700 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Summary of All 4 Scopes */}
        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'ta' ? 'அனைத்து பகுதிகளின் தொடக்க கட்டணம்:' : 'Current Starting Rates by Scope:'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white/80 p-1.5 rounded-lg border border-indigo-100">
              <span className="text-slate-500 block text-[10px]">🌐 நாடு:</span>
              <span className="font-bold text-indigo-900">₹{tiers.country?.plans?.[0]?.price || 0} / 7d</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-indigo-100">
              <span className="text-slate-500 block text-[10px]">🗺️ மாநிலம்:</span>
              <span className="font-bold text-indigo-900">₹{tiers.state?.plans?.[0]?.price || 0} / 7d</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-indigo-100">
              <span className="text-slate-500 block text-[10px]">🏢 மாவட்டம்:</span>
              <span className="font-bold text-indigo-900">₹{tiers.district?.plans?.[0]?.price || 0} / 7d</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded-lg border border-indigo-100">
              <span className="text-slate-500 block text-[10px]">📍 நகரம்:</span>
              <span className="font-bold text-indigo-900">₹{tiers.city?.plans?.[0]?.price || 0} / 7d</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'இயல்புநிலை விலைக்கு மீட்டமை' : 'Reset Defaults'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {language === 'ta' ? 'மூடுக' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'ta' ? 'விலைகளை சேமிக்கவும்' : 'Save Scope Pricing'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
