import React, { useState } from 'react';
import { RecruitmentRequest, PaymentTransaction, OwnerPaymentConfig, Screen } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { POPULAR_LOCATIONS } from '../data/locations';
import { PRICING_CONFIG, DEFAULT_OWNER_PAYMENT_CONFIG } from '../data/monetizationData';
import { useLanguage } from '../context/LanguageContext';
import { PaymentModal } from './PaymentModal';
import {
  Users2,
  Phone,
  Calendar,
  MapPin,
  IndianRupee,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface FindWorkersScreenProps {
  requests?: RecruitmentRequest[];
  onAddRequest?: (req: RecruitmentRequest, tx: PaymentTransaction) => void;
  onSubmitRequest?: (req: RecruitmentRequest, tx: PaymentTransaction) => void;
  onNavigateToHome?: () => void;
  onNavigate?: (screen: Screen) => void;
  ownerPaymentConfig?: OwnerPaymentConfig;
}

export const FindWorkersScreen: React.FC<FindWorkersScreenProps> = ({
  requests = [],
  onAddRequest,
  onSubmitRequest,
  onNavigateToHome,
  onNavigate,
  ownerPaymentConfig = DEFAULT_OWNER_PAYMENT_CONFIG,
}) => {
  const { language, loc } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [employerName, setEmployerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [category, setCategory] = useState(WORK_CATEGORIES[0].id);
  const [workersNeeded, setWorkersNeeded] = useState<number>(4);
  const [selectedCity, setSelectedCity] = useState(POPULAR_LOCATIONS[0].nameTa);
  const [dailyWage, setDailyWage] = useState<number>(850);
  const [requiredDate, setRequiredDate] = useState(todayStr);
  const [specificRequirements, setSpecificRequirements] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const facilitationFee = PRICING_CONFIG.recruitmentServiceFee;

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employerName.trim()) {
      setError(language === 'ta' ? 'தயவுசெய்து முதலாளி அல்லது நிறுவனத்தின் பெயரை உள்ளிடவும்.' : 'Please enter contractor/business name.');
      return;
    }

    const cleanPhone = contactNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError(language === 'ta' ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter valid 10-digit phone number.');
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (tx: PaymentTransaction) => {
    const newReq: RecruitmentRequest = {
      id: `req-${Date.now()}`,
      employerName: employerName.trim(),
      contactNumber: contactNumber.replace(/[^0-9]/g, ''),
      category,
      location: selectedCity,
      workersNeeded: Number(workersNeeded),
      dailyWage: Number(dailyWage),
      requiredDate,
      specificRequirements: specificRequirements.trim(),
      serviceFee: facilitationFee,
      paymentStatus: 'successful',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const callback = onAddRequest || onSubmitRequest;
    if (callback) {
      callback(newReq, tx);
    }
    setIsCheckoutOpen(false);

    // Reset Form
    setEmployerName('');
    setContactNumber('');
    setSpecificRequirements('');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
            <Users2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              <span>பிரத்யேக ஆட்கள் சேவை / Recruitment Service</span>
            </span>
            <h2 className="text-lg font-bold leading-tight">
              {language === 'ta'
                ? 'ஆட்கள் பெற்றுத்தரும் சேவை'
                : language === 'en'
                ? 'Find Workers Recruitment Service'
                : 'ஆட்கள் தேவை சேவை / Find Workers'}
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              {language === 'ta'
                ? 'ஒரே அழைப்பில் 5 முதல் 50 தினக்கூலி ஆட்களை எங்கள் குழு மூலம் உறுதி செய்யுங்கள்.'
                : 'Get 5 to 50 verified daily wage workers arranged directly by our local team.'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Guarantee Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>சரிபார்க்கப்பட்ட தொழிலாளர்கள் & மாற்று ஆட்கள் உத்தரவாதம் (Replacement Guarantee)</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 shrink-0">₹{facilitationFee} கட்டணம்</span>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleOpenCheckout} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <FileCheck className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'ta' ? 'ஆட்கள் தேவை படிவம்' : 'Worker Requirement Form'}
          </span>
        </h3>

        {/* 1. Employer Name & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'முதலாளி / நிறுவனப் பெயர்' : 'Employer / Contractor Name'} *
            </label>
            <input
              type="text"
              required
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              placeholder="எ.கா: பாபு கன்ஸ்ட்ரக்ஷன்ஸ்"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'தொடர்பு எண்' : 'Mobile Number'} *
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="9840123456"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 2. Category & Workers Needed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'வேலை வகை' : 'Category'} *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {WORK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameTa} — {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'தேவைப்படும் ஆட்கள் எண்ணிக்கை' : 'Workers Needed'} *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={workersNeeded}
              onChange={(e) => setWorkersNeeded(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 3. Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'வேலை நடக்கும் இடம் / ஊர்' : 'Site Location'}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.id} value={`${loc.nameTa} (${loc.nameEn})`}>
                  {loc.nameTa} ({loc.nameEn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ta' ? 'தேவைப்படும் நாள்' : 'Required Date'}
            </label>
            <input
              type="date"
              required
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 4. Daily Wage Offered */}
        <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              {loc('வழங்கப்படும் தினக்கூலி (வேலை கொடுப்பவர் விருப்பம்)', 'Daily Wage Offered (Employer Choice)', 'दैनिक मजदूरी (नियोक्ता की पसंद)', 'దినసరి వేతనం', 'ദൈനംദിന വേതനം', 'ದಿನಗೂಲಿ')} *
            </label>
            <span className="text-xs font-black text-emerald-700">₹{dailyWage}/நாள்</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[600, 700, 800, 900, 1000, 1200, 1500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setDailyWage(amt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  dailyWage === amt
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="100"
                max="50000"
                step="50"
                required
                value={dailyWage || ''}
                onChange={(e) => setDailyWage(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                placeholder={loc('கூலியை தட்டச்சு செய்யவும்', 'Type custom wage', 'मजदूरी दर्ज करें', 'వేతనం టైప్ చేయండి', 'കൂലി നൽകുക', 'ಕೂಲಿ ನಮೂದಿಸಿ')}
                className="w-full pl-8 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setDailyWage((prev) => Math.max(50, (prev || 0) - 50))}
              className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              -50
            </button>
            <button
              type="button"
              onClick={() => setDailyWage((prev) => (prev || 0) + 50)}
              className="px-2.5 py-2 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-200 cursor-pointer"
            >
              +50
            </button>
          </div>
        </div>

        {/* 5. Specific Requirements */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {language === 'ta' ? 'கூடுதல் தேவைகள் (உணவு, போக்குவரத்து, நேரம்)' : 'Special Requirements'}
          </label>
          <textarea
            rows={2}
            value={specificRequirements}
            onChange={(e) => setSpecificRequirements(e.target.value)}
            placeholder="எ.கா: காலை 8 மணி முதல் மாலை 5 மணி வரை, மதிய உணவு வழங்கப்படும்"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Facilitation Fee notice */}
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-950">
              {language === 'ta' ? 'ஒருங்கிணைப்பு சேவை கட்டணம்:' : 'Facilitation & Coordination Fee:'}
            </p>
            <p className="text-[11px] text-amber-800">
              தொழிலாளர்கள் உறுதி செய்யப்படாவிட்டால் 100% கட்டணம் திரும்ப வழங்கப்படும் (Refund Guarantee).
            </p>
          </div>
          <span className="text-base font-black text-emerald-800 shrink-0 ml-2">₹{facilitationFee}</span>
        </div>

        {/* Submit button */}
        <button
          id="btn-submit-recruitment"
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Users2 className="w-4 h-4" />
          <span>
            {language === 'ta'
              ? `₹${facilitationFee} செலுத்தி ஆட்களைக் கோருக`
              : `Submit Request (₹${facilitationFee})`}
          </span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>
      </form>

      {/* Existing Requests Track list */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          {language === 'ta' ? 'உங்கள் ஆட்கள் சேவை கோரிக்கைகள்' : 'Your Recruitment Requests'} ({(requests || []).length})
        </h3>

        <div className="space-y-2.5">
          {(requests || []).map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{req.employerName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.status === 'assigned'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : req.status === 'completed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'assigned'
                        ? 'தொழிலாளர்கள் ஒதுக்கப்பட்டனர் (Assigned)'
                        : req.status === 'in-progress'
                        ? 'செயல்பாட்டில் உள்ளது (In Progress)'
                        : req.status === 'completed'
                        ? 'முடிந்தது (Completed)'
                        : 'புதிய கோரிக்கை (New)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {req.workersNeeded} Workers • ₹{req.dailyWage}/day • {req.location}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700">₹{req.serviceFee} Paid</span>
                  <p className="text-[10px] text-slate-400">{req.requiredDate}</p>
                </div>
              </div>

              {req.assignedWorkersNotes && (
                <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                  <span className="font-bold">நிர்வாக குறிப்பு / Note:</span> {req.assignedWorkersNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {isCheckoutOpen && (
        <PaymentModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          titleEn={`Recruitment Facilitation (${workersNeeded} Workers)`}
          titleTa={`ஆட்கள் பெற்றுத்தரும் சேவை (${workersNeeded} தொழிலாளர்கள்)`}
          amount={facilitationFee}
          purpose="recruitment_service"
          payerName={employerName}
          payerPhone={contactNumber}
          ownerPaymentConfig={ownerPaymentConfig}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
