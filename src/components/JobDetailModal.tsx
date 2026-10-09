import React, { useState } from 'react';
import { Job } from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedJob, LANGUAGE_DISPLAY_NAMES } from '../utils/translator';
import { CategoryIcon } from './CategoryIcon';
import {
  X,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Building,
  Clock,
  Share2,
  Trash2,
  Copy,
  Check,
  Send,
  Facebook,
  Twitter,
  Globe,
  Heart,
} from 'lucide-react';
import { isJobFavorite, toggleJobFavorite } from '../utils/favoriteStorage';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onDeleteJob?: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onDeleteJob }) => {
  const { language, loc } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(() => (job ? isJobFavorite(job.id) : false));

  React.useEffect(() => {
    if (job) {
      setIsFav(isJobFavorite(job.id));
    }
  }, [job]);

  if (!job) return null;

  const tJob = getTranslatedJob(job, language);
  const category = WORK_CATEGORIES.find((c) => c.id === job.category);
  const cleanPhone = (job.contactNumber || (job as any).phone || '').replace(/[^0-9]/g, '');

  const categoryName =
    tJob.categoryName ||
    (job.category === 'other'
      ? job.customCategoryName || job.categoryCustomName || loc('பிற வேலை', 'Other Work', 'अन्य कार्य', 'ఇతర పని', 'മറ്റ് ജോലി', 'ಇತರ ಕೆಲಸ')
      : category
      ? loc(
          category.nameTa,
          category.nameEn,
          category.nameEn,
          category.nameEn,
          category.nameEn,
          category.nameEn
        )
      : job.category);

  const waMessage = encodeURIComponent(
    `வணக்கம், நான் Daily Work செயலி மூலம் தொடர்பு கொள்கிறேன். உங்கள் "${categoryName}" வேலைக்கு ஆட்கள் தேவையா? (Hello, contacting from Daily Work app for the ${categoryName} job).`
  );

  const isTranslated = tJob.isTranslated || (Boolean(job.postedLanguage) && job.postedLanguage !== language);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header with Close */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CategoryIcon
                name={category ? category.iconName : 'Briefcase'}
                className="w-6 h-6"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {categoryName}
                </span>
                {isTranslated && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                    <Globe className="w-2.5 h-2.5 text-teal-600" />
                    {loc('மொழிபெயர்ப்பு', 'Translated', 'अनुवाद', 'అనువాదం', 'വിവർത്തനം', 'ಅನುವಾದ')}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 leading-snug mt-0.5">
                {tJob.employerName}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const res = toggleJobFavorite(job.id);
                setIsFav(res);
              }}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
              }`}
              title={isFav ? loc('விருப்பத்திலிருந்து நீக்கு', 'Remove from Favorites') : loc('விருப்பத்தில் சேமி', 'Save to Favorites')}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Translation Banner if applicable */}
        {isTranslated && (
          <div className="flex items-center gap-2 p-2 bg-teal-50/80 border border-teal-200/80 rounded-xl text-xs text-teal-900">
            <Globe className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {loc(
                `இந்த வேலை விவரம் உங்கள் மொழியில் (${LANGUAGE_DISPLAY_NAMES[language]?.native || language}) மொழிபெயர்க்கப்பட்டுள்ளது`,
                `This listing is translated into your language (${LANGUAGE_DISPLAY_NAMES[language]?.name || language})`,
                `यह कार्य आपकी भाषा में अनुवादित है`,
                `ఈ పని వివరాలు మీ భాషలోకి అనువదించబడ్డాయి`,
                `ഈ ജോലി വിവരങ്ങൾ നിങ്ങളുടെ ഭാഷയിലേക്ക് വിവർത്തനം ചെയ്തു`,
                `ಈ ಕೆಲಸದ ವಿವರಗಳು ನಿಮ್ಮ ಭಾಷೆಗೆ ಅನುವಾದಿಸಲಾಗಿದೆ`
              )}
            </span>
          </div>
        )}

        {/* Wage & Workers Highlights */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">
                {job.wageType === 'hourly'
                  ? loc('மணி நேர கூலி', 'Hourly Wage', 'प्रति घंटा मजदूरी', 'గంట వేతనం', 'മണിക്കൂർ കൂലി', 'ಗಂಟೆ ಕೂಲಿ')
                  : job.wageType === 'half_day'
                  ? loc('அரை நாள் கூலி', 'Half Day Wage', 'आधा दिन मजदूरी', 'అర రోజు వేతనం', 'അര ദിവസ കൂലി', 'ಅರ್ಧ ದಿನ ಕೂಲಿ')
                  : job.wageType === 'contract'
                  ? loc('ஒப்பந்த கூலி', 'Task / Contract Pay', 'कार्य भुगतान', 'పని మొత్తం', 'കരാർ കൂലി', 'ಕೆಲಸದ ಮೊತ್ತ')
                  : loc('தினக்கூலி', 'Daily Wage', 'दैनिक मजदूरी', 'రోజువారీ వేతనం', 'ദിവസവേതനം', 'ದೈನಂದಿನ ಕೂಲಿ')}
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-black text-emerald-700">
                  ₹{job.dailyWage}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {job.wageType === 'hourly'
                    ? loc('/ மணி', '/ hour', '/ घंटा', '/ గంట', '/ മണിക്കൂർ', '/ ಗಂಟೆ')
                    : job.wageType === 'half_day'
                    ? loc('/ அரை நாள்', '/ half day', '/ आधा दिन', '/ అర రోజు', '/ അര ദിവസം', '/ ಅರ್ಧ ದಿನ')
                    : job.wageType === 'contract'
                    ? loc('/ பணி', '/ task', '/ कार्य', '/ పని', '/ ജോലി', '/ ಕೆಲಸ')
                    : loc('/ நாள்', '/ day', '/ दिन', '/ రోజు', '/ ദിവസം', '/ ದಿನ')}
                </span>
              </div>
              {job.isWageNegotiable && (
                <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                  🤝 {loc('கூலி பேசித் தீர்மானிக்கலாம்', 'Wage is Negotiable', 'बातचीत संभव है', 'చర్చించవచ్చు', 'സംസാരിക്കാം', 'ಮಾತುಕತೆ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">
                {loc('ஆட்கள் தேவை', 'Workers Needed', 'श्रमिक आवश्यक', 'కార్మికులు అవసరం', 'തൊഴിലാളികൾ ആവശ്യമുണ്ട്', 'ಕಾರ್ಮಿಕರು ಬೇಕಾಗಿದ್ದಾರೆ')}
              </p>
              <p className="text-lg font-black text-amber-900">
                {job.workersNeeded} {loc('நபர்கள்', 'Workers', 'श्रमिक', 'మంది', 'പേർ', 'ಜನರು')}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits / Workplace Perks */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <p className="text-[11px] font-bold text-emerald-950 mb-1">
              ✨ {loc('வழங்கப்படும் கூடுதல் சலுகைகள்:', 'Workplace Perks Provided:', 'अतिरिक्त सुविधाएं:', 'అదనపు సౌకర్యాలు:', 'കൂടുതൽ ആനുകൂല്യങ്ങൾ:', 'ಹೆಚ್ಚುವರಿ ಸೌಲಭ್ಯಗಳು:')}
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {job.benefits.includes('food') && (
                <span className="px-2 py-1 bg-white border border-emerald-300 text-emerald-900 font-bold rounded-lg flex items-center gap-1">
                  🍛 {loc('மதிய உணவு உண்டு', 'Free Lunch Provided', 'दोपहर का भोजन', 'భోజనం', 'ഭക്ഷണം', 'ಊಟ')}
                </span>
              )}
              {job.benefits.includes('tea') && (
                <span className="px-2 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg flex items-center gap-1">
                  ☕ {loc('டீ & சிற்றுண்டி உண்டு', 'Tea & Snacks Provided', 'चाय / नाश्ता', 'టీ', 'ചായ', 'ಚಹಾ')}
                </span>
              )}
              {job.benefits.includes('travel') && (
                <span className="px-2 py-1 bg-white border border-blue-300 text-blue-900 font-bold rounded-lg flex items-center gap-1">
                  🚌 {loc('பயணப்படி உண்டு', 'Travel Allowance', 'यात्रा भत्ता', 'ప్రయాణ భత్యం', 'യാത്രാ ബത്ത', 'ಪ್ರಯಾಣ')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Key Job Info list */}
        <div className="space-y-2.5 text-sm text-slate-700">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] text-slate-500">
                {loc('வேலை செய்யும் இடம்', 'Job Location', 'कार्यस्थल', 'పని ప్రదేశం', 'ജോലി സ്ഥലം', 'ಕೆಲಸದ ಸ್ಥಳ')}
              </p>
              <p className="font-semibold text-slate-900">{tJob.location}</p>
              {(tJob.district || job.district || tJob.state || job.state) && (
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {[tJob.district || job.district, tJob.state || job.state, job.countryCode].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">
                {loc('வேலை நாள்', 'Job Date', 'कार्य तिथि', 'పని తేదీ', 'ജോലി തീയതി', 'ಕೆಲಸದ ದಿನಾಂಕ')}
              </p>
              <p className="font-semibold text-slate-900">{job.jobDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
            <Building className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500">
                {loc('முதலாளி / தொடர்பாளர்', 'Employer / Contact', 'नियोक्ता / संपर्क', 'యజమాని / సంప్రదించండి', 'തൊഴിലുടമ / ബന്ധപ്പെടുക', 'ಉದ್ಯೋಗದಾತ / ಸಂಪರ್ಕಿಸಿ')}
              </p>
              <p className="font-semibold text-slate-900">{tJob.employerName}</p>
            </div>
          </div>
        </div>

        {/* Notes / Description */}
        {(tJob.notes || job.notes) && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              {loc('கூடுதல் விவரங்கள்', 'Notes & Details', 'अतिरिक्त विवरण', 'అదనపు వివరాలు', 'കൂടുതൽ വിവരങ്ങൾ', 'ಹೆಚ್ಚುವರಿ ವಿವರಗಳು')}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">{tJob.notes || job.notes}</p>
          </div>
        )}

        {/* PRIMARY CALL & WHATSAPP ACTIONS */}
        <div className="pt-2 space-y-2">
          <div className="flex gap-2">
            <a
              id="modal-btn-call"
              href={`tel:${cleanPhone}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 transition-all text-center"
            >
              <Phone className="w-5 h-5 fill-white" />
              <span>
                {loc('உடனே அழைக்க', 'Call Now', 'अभी कॉल करें', 'ఇప్పుడే కాల్ చేయండి', 'ഇപ്പോൾ വിളിക്കുക', 'ಈಗಲೇ ಕರೆ ಮಾಡಿ')}
              </span>
            </a>

            <a
              id="modal-btn-whatsapp"
              href={`https://wa.me/91${cleanPhone}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 transition-all text-center"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>
                {loc('வாட்ஸ்அப்', 'WhatsApp', 'व्हाट्सएप', 'వాట్సాప్', 'വാട്ട്‌സ്ആപ്പ്', 'ವಾಟ್ಸಾಪ್')}
              </span>
            </a>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            {loc('தொடர்பு எண்', 'Contact Number', 'संपर्क नंबर', 'సంప్రదింపు సంఖ్య', 'ബന്ധപ്പെടേണ്ട നമ്പർ', 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ')}: {job.contactNumber}
          </p>

          {/* Social Media Sharing Options */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                {loc('சமூக ஊடகத்தில் பகிருங்கள்', 'Share Job Opportunity', 'सोशल मीडिया पर साझा करें', 'సోషల్ మీడియాలో భాగస్వామ్యం చేయండి', 'സോഷ്യൽ മീഡിയയിൽ പങ്കിടുക', 'ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮದಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ')}
              </span>
              <button
                type="button"
                onClick={() => {
                  const txt = `👷‍♂️ தினக்கூலி வேலை: ${job.employerName} - ${categoryName}, ₹${job.dailyWage}/நாள், ${job.location}. தொடர்பு: ${job.contactNumber}`;
                  navigator.clipboard?.writeText(txt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>
                  {copied
                    ? loc('நகலெடுக்கப்பட்டது!', 'Copied!', 'कॉपी किया गया!', 'కాపీ చేయబడింది!', 'പകർത്തി!', 'ನಕಲಿಸಲಾಗಿದೆ!')
                    : loc('நகலெடு', 'Copy Text', 'कॉपी करें', 'కాపీ చేయండి', 'പകർത്തുക', 'ನಕಲಿಸಿ')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `👷‍♂️ தினக்கூலி வேலை வாய்ப்பு: ${job.employerName} (${categoryName})\n📍 இடம்: ${job.location}\n💰 கூலி: ₹${job.dailyWage} / நாள்\n📞 தொடர்பு: ${job.contactNumber}\nDaily Work செயலி மூலம் பார்க்கவும்.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-center transition-all text-[11px] font-bold"
                title="WhatsApp Share"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span>WhatsApp</span>
              </a>

              {/* Telegram Share */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(
                  `👷‍♂️ தினக்கூலி வேலை: ${job.employerName} (${categoryName}) - ₹${job.dailyWage}/நாள், இடம்: ${job.location}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-center transition-all text-[11px] font-bold"
                title="Telegram Share"
              >
                <Send className="w-4 h-4 text-sky-600 mb-0.5" />
                <span>Telegram</span>
              </a>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-center transition-all text-[11px] font-bold"
                title="Facebook Share"
              >
                <Facebook className="w-4 h-4 text-blue-600 mb-0.5" />
                <span>Facebook</span>
              </a>

              {/* X / Twitter Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Daily Work Alert: ${job.employerName} hiring ${job.workersNeeded} workers for ${categoryName} in ${job.location}. Wage: ₹${job.dailyWage}/day.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-center transition-all text-[11px] font-bold"
                title="X (Twitter) Share"
              >
                <Twitter className="w-4 h-4 text-slate-700 mb-0.5" />
                <span>X</span>
              </a>
            </div>
          </div>

          {/* Delete Old / Completed Job Option */}
          {onDeleteJob && (
            <div className="pt-2 border-t border-slate-100">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {loc(
                      'இந்த வேலைப் பதிவை நீக்குக',
                      'Delete This Job Post',
                      'यह नौकरी पोस्ट हटाएं',
                      'ఈ ఉద్యోగ పోస్ట్‌ను తొలగించండి',
                      'ഈ തൊഴിൽ പോസ്റ്റ് ഇല്ലാതാക്കുക',
                      'ಈ ಉದ್ಯೋಗ ಪೋಸ್ಟ್ ಅಳಿಸಿ'
                    )}
                  </span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-center">
                  <p className="text-xs font-bold text-rose-900">
                    {loc(
                      'இந்த வேலைப் பதிவை நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
                      'Are you sure you want to remove this job post?',
                      'क्या आप वाकई इस नौकरी पोस्ट को हटाना चाहते हैं?',
                      'మీరు ఖచ్చితంగా ఈ ఉద్యోగ పోస్ట్‌ను తీసివేయాలనుకుంటున్నారా?',
                      'ഈ ജോലി പോസ്റ്റ് നീക്കംചെയ്യണമെന്ന് ഉറപ്പാണോ?',
                      'ನೀವು ಖಚಿತವಾಗಿ ಈ ಉದ್ಯೋಗ ಪೋಸ್ಟ್ ತೆಗೆದುಹಾಕಲು ಬಯಸುವಿರಾ?'
                    )}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteJob(job.id);
                        onClose();
                      }}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                    >
                      {loc('ஆம், நீக்குக', 'Yes, Delete', 'हाँ, हटाएं', 'అవును, తొలగించు', 'അതെ, ഇല്ലാതാക്കുക', 'ಹೌದು, ಅಳಿಸಿ')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
                    >
                      {loc('ரத்து', 'Cancel', 'रद्द करें', 'రద్దు', 'റദ്ദാക്കുക', 'ರದ್ದುಮಾಡಿ')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
