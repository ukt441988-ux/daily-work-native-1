import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SupportTicket } from '../types';
import {
  LifeBuoy,
  X,
  PhoneCall,
  MessageCircle,
  Mail,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Headphones,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: SupportTicket) => void;
  supportPhone?: string;
  supportWhatsApp?: string;
  supportEmail?: string;
  supportHours?: string;
  onOpenAdminControl?: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  supportPhone = '9840123456',
  supportWhatsApp = '9840123456',
  supportEmail = 'management@dailywork.app',
  supportHours,
  onOpenAdminControl,
}) => {
  const { language, loc } = useLanguage();
  const [activeTab, setActiveTab] = useState<'contact' | 'faqs' | 'safety' | 'ticket'>('contact');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Contact Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('management_inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  if (!isOpen) return null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `TK-${Math.floor(100000 + Math.random() * 900000)}`,
      senderName: name.trim(),
      senderPhone: phone.trim(),
      category,
      subject: subject.trim() || loc('நிர்வாக உதவி கோரிக்கை', 'Management Support Request', 'प्रबंधन सहायता अनुरोध', 'నిర్వాహక మద్దతు అభ్యర్థన', 'മാനേജ്‌മെന്റ് പിന്തുണ അഭ്യർത്ഥന', 'ನಿರ್ವಹಣಾ ಬೆಂಬಲ ವಿನಂತಿ'),
      message: message.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket(newTicket);
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      // Save locally
      try {
        const saved = localStorage.getItem('daily_work_tickets_v1');
        const list = saved ? JSON.parse(saved) : [];
        localStorage.setItem('daily_work_tickets_v1', JSON.stringify([newTicket, ...list]));
      } catch (err) {
        console.error('Error saving ticket:', err);
      }
    }, 600);
  };

  const handleCopyText = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2500);
    } catch {
      // ignore
    }
  };

  const rawWa = (supportWhatsApp || supportPhone).replace(/[^0-9]/g, '');
  const waNumber = rawWa.length === 10 ? `91${rawWa}` : rawWa;

  const whatsappMessage = encodeURIComponent(
    loc(
      `வணக்கம் Daily Work நிர்வாகக் குழு, எனக்கு உதவி தேவைப்படுகிறது. எனது தொலைபேசி எண்: ${phone || ''}`,
      `Hello Daily Work Management Team, I need assistance with the Daily Work app.`,
      `नमस्ते डेली वर्क प्रबंधन टीम, मुझे डेली वर्क ऐप में सहायता चाहिए।`,
      `హలో డెయిలీ వర్క్ నిర్వహణ బృందం, నాకు సహాయం కావాలి.`,
      `ഹലോ ഡെയ്‌ലി വർക്ക് മാനേജ്‌മെന്റ് ടീം, എനിക്ക് സഹായം ആവശ്യമാണ്.`,
      `ಹಲೋ ಡೈಲಿ ವರ್ಕ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ತಂಡ, ನನಗೆ ಸಹಾಯ ಬೇಕು.`
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {loc('உதவி & நிர்வாக ஆதரவு', 'Help & Management Support', 'सहायता और प्रबंधन समर्थन', 'సహాయం & నిర్వహణ మద్దతు', 'സഹായവും മാനേജ്‌മെന്റ് പിന്തുണയും', 'ಸಹಾಯ ಮತ್ತು ನಿರ್ವಹಣಾ ಬೆಂಬಲ')}
              </h2>
              <p className="text-xs text-emerald-100/90">
                {loc(
                  'நிர்வாகக் குழுவுடன் நேரடி தொடர்பு மற்றும் வழிகாட்டுதல்',
                  'Direct Assistance from the Daily Work Management Team',
                  'डेली वर्क प्रबंधन टीम से सीधा संपर्क और मार्गदर्शन',
                  'డెయిలీ వర్క్ నిర్వహణ బృందంతో ప్రత్యక్ష సంప్రదింపులు',
                  'മാനേജ്‌മെന്റ് ടീമുമായി നേരിട്ടുള്ള ബന്ധപ്പെടൽ',
                  'ನಿರ್ವಹಣಾ ತಂಡದೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ'
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-2 py-1 gap-1">
          <button
            onClick={() => {
              setActiveTab('contact');
              setSubmittedTicket(null);
            }}
            className={`flex-1 py-2 px-1 text-center rounded-xl transition-all ${
              activeTab === 'contact'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            📞 {loc('தொடர்பு', 'Contact Team', 'संपर्क', 'సంప్రదించండి', 'ബന്ധപ്പെടുക', 'ಸಂಪರ್ಕಿಸಿ')}
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 px-1 text-center rounded-xl transition-all ${
              activeTab === 'ticket'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            ✉️ {loc('புகார் / மனு', 'Send Ticket', 'शिकायत / टिकट', 'ఫిర్యాదు / టికెట్', 'പരാതി / ടിക്കറ്റ്', 'ದೂರು / ಟಿಕೆಟ್')}
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-2 px-1 text-center rounded-xl transition-all ${
              activeTab === 'safety'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🛡️ {loc('பாதுகாப்பு', 'Safety & Trust', 'सुरक्षा', 'భద్రత', 'സുരക്ഷ', 'ಭದ್ರತೆ')}
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex-1 py-2 px-1 text-center rounded-xl transition-all ${
              activeTab === 'faqs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            ❓ {loc('கேள்விகள்', 'FAQs', 'सामान्य प्रश्न', 'ప్రశ్నలు', 'ചോദ്യങ്ങൾ', 'ಪ್ರಶ್ನೋತ್ತರಗಳು')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DIRECT CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Headphones className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">
                    {loc('நிர்வாக வாடிக்கையாளர் சேவை மையம்', 'Official Management Desk', 'आधिकारिक प्रबंधन सहायता डेस्क', 'అధికారిక నిర్వహణ సహాయ డెస్క్', 'ഔദ്യോഗിക മാനേജ്‌മെന്റ് ഡെസ്ക്', 'ಅಧಿಕೃತ ನಿರ್ವಹಣಾ ಬೆಂಬಲ ಡೆಸ್ಕ್')}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    {loc(
                      'வேலைவாய்ப்பு, கட்டண விவரங்கள், கணக்கு பிரச்சனைகள் குறித்த உதவிகளுக்கு எங்கள் நிர்வாகக் குழு தயாராக உள்ளது. கீழே உள்ள பொத்தானைத் தொட்டவுடன் நேரடியாக தொடர்பு கொள்ளலாம்.',
                      'Our dedicated management team is on standby to assist you. Tap the buttons below to connect directly.',
                      'नौकरी लिस्टिंग, भुगतान और शिकायतों के लिए हमारी प्रबंधन टीम उपलब्ध है। सीधे जुड़ने के लिए नीचे टैप करें।',
                      'సమస్యల కోసం మా బృందం అందుబాటులో ఉంది. నేరుగా కనెక్ట్ కావడానికి క్రింద నొక్కండి.',
                      'സഹായങ്ങൾക്കായി ഞങ്ങളുടെ മാനേജ്‌മെന്റ് ടീം ലഭ്യമാണ്. നേരിട്ട് ബന്ധപ്പെടാൻ താഴെ ടാപ്പ് ചെയ്യുക.',
                      'ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ನಿರ್ವಹಣಾ ತಂಡ ಲಭ್ಯವಿದೆ. ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಲು ಕೆಳಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ.'
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-800 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {supportHours ||
                        loc(
                          'இயங்கும் நேரம்: தினமும் காலை 7:00 முதல் இரவு 9:00 வரை',
                          'Hours: Daily 7:00 AM – 9:00 PM IST',
                          'समय: प्रतिदिन सुबह 7:00 से रात 9:00 बजे तक',
                          'సమయం: ప్రతిరోజు ఉదయం 7:00 నుండి రాత్రి 9:00 వరకు',
                          'സമയം: ദിവസവും രാവിലെ 7:00 മുതൽ രാത്രി 9:00 വരെ',
                          'ಸಮಯ: ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ 7:00 ರಿಂದ ರಾತ್ರಿ 9:00 ರವರೆಗೆ'
                        )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons with direct tap actions without exposing raw numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Direct Phone Call Button - Number hidden from customer */}
                <a
                  id="btn-direct-support-call"
                  href={`tel:${supportPhone}`}
                  className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-700 hover:to-teal-800 rounded-2xl flex items-center gap-3 shadow-md hover:shadow-lg transition-all group active:scale-95 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-emerald-100">
                      {loc('நேரடி அழைப்பு', 'Direct Management Call', 'सीधा प्रबंधन कॉल', 'ప్రత్యక్ష నిర్వహణ కాల్', 'നേരിട്ടുള്ള മാനേജ്‌മെന്റ് കോൾ', 'ನೇರ ನಿರ್ವಹಣಾ ಕರೆ')}
                    </p>
                    <p className="font-black text-sm text-white truncate">
                      {loc('தொடர்பு கொள்ள அழுத்தவும்', 'Tap to Call Directly', 'सीधे कॉल करने के लिए टैप करें', 'కాల్ చేయడానికి నొక్కండి', 'വിളിക്കാൻ ടാപ്പ് ചെയ്യുക', 'ಕರೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ')}
                    </p>
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                      {loc('தொட்டவுடன் நேரடி இணைப்பு', 'Instant 1-Tap Connect', 'तुरंत 1-टैप कनेक्ट', 'తక్షణ 1-ట్యాప్ కనెక్ట్', 'തത്സമയ 1-ടാപ്പ് കണക്റ്റ്', 'ತಕ್ಷಣದ 1-ಟ್ಯಾಪ್ ಸಂಪರ್ಕ')} →
                    </span>
                  </div>
                </a>

                {/* 2. WhatsApp Support - Number hidden from customer */}
                <a
                  id="btn-direct-whatsapp-chat"
                  href={`https://wa.me/${waNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 rounded-2xl flex items-center gap-3 shadow-md hover:shadow-lg transition-all group active:scale-95 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-green-100">
                      {loc('வாட்ஸ்அப் நேரடி உதவி', 'WhatsApp Support Chat', 'व्हाट्सएप सहायता चैट', 'వాట్సాప్ సహాయ చాట్', 'വാട്ട്‌സ്ആപ്പ് സഹായ ചാറ്റ്', 'ವಾಟ್ಸಾಪ್ ಸಹಾಯ ಚಾಟ್')}
                    </p>
                    <p className="font-black text-sm text-white truncate">
                      {loc('வாட்ஸ்அப்பில் பேச அழுத்தவும்', 'Tap for WhatsApp Chat', 'व्हाट्सएप चैट के लिए टैप करें', 'వాట్సాప్ చాట్ కోసం నొక్కండి', 'വാട്ട്‌സ്ആപ്പ് ചാറ്റിനായി ടാപ്പ് ചെയ്യുക', 'ವಾಟ್ಸಾಪ್ ಚಾಟ್‌ಗಾಗಿ ಟ್ಯಾಪ್ ಮಾಡಿ')}
                    </p>
                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                      {loc('வாட்ஸ்அப் லிங்க் செல்ல', 'Direct WhatsApp Link', 'सीधा व्हाट्सएप लिंक', 'నేరుగా వాట్సాప్ లింక్', 'നേരിട്ടുള്ള വാട്ട്‌സ്ആപ്പ് ലിങ്ക്', 'ನೇರ ವಾಟ್ಸಾಪ್ ಲಿಂಕ್')} →
                    </span>
                  </div>
                </a>

                {/* 3. Official Email */}
                <div className="p-3.5 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all group sm:col-span-2">
                  <a
                    href={`mailto:${supportEmail}?subject=Daily%20Work%20App%20Support`}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 font-medium">
                        {loc('மின்னஞ்சல்', 'Official Management Email', 'आधिकारिक प्रबंधन ईमेल', 'అధికారిక నిర్వహణ ఇమెయిల్', 'ഔദ്യോഗിക ഇമെയിൽ', 'ಅಧಿಕೃತ ಇಮೇಲ್')}
                      </p>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 font-mono break-all">
                        {supportEmail}
                      </p>
                      <span className="text-[10px] text-blue-700 font-bold">
                        {loc('மின்னஞ்சல் அனுப்ப', 'Send Official Email', 'ईमेल भेजें', 'ఇమెయిల్ పంపండి', 'ഇമെയിൽ അയക്കുക', 'ಇಮೇಲ್ ಕಳುಹಿಸಿ')} →
                      </span>
                    </div>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(supportEmail, 'email')}
                    title="Copy Email Address"
                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors ml-1"
                  >
                    {copiedItem === 'email' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 px-1 py-0.5 border border-slate-200 rounded">
                        Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Note */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <p className="font-bold">
                    {loc('அவசர புகார் அல்லது ஆலோசனை?', 'Grievance or Escalation?', 'शिकायत या सुझाव?', 'ఫిర్యాదు లేదా సలహా?', 'പരാതിയോ നിർദ്ദേശമോ?', 'ದೂರು ಅಥವಾ ಸಲಹೆ?')}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    {loc(
                      'கீழே உள்ள "மனு / Ticket" தாவலில் செய்தி அனுப்பவும். 24 மணி நேரத்திற்குள் தீர்வு காண்போம்.',
                      'Submit an in-app ticket to get a tracked resolution within 24 hours.',
                      '24 घंटों के भीतर समाधान पाने के लिए इन-ऐप टिकट सबमिट करें।',
                      '24 గంటల్లో పరిష్కారం కోసం యాప్ టికెట్ సమర్పించండి.',
                      '24 മണിക്കൂറിനുള്ളിൽ പരിഹാരത്തിനായി ആപ്പ് ടിക്കറ്റ് സമർപ്പിക്കുക.',
                      '24 ಗಂಟೆಗಳಲ್ಲಿ ಪರಿಹಾರಕ್ಕಾಗಿ ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ.'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shrink-0 shadow-xs"
                >
                  {loc('மனு அனுப்புக', 'Send Ticket', 'टिकट भेजें', 'టికెట్ పంపండి', 'ടിക്കറ്റ് അയക്കുക', 'ಟಿಕೆಟ್ ಕಳುಹಿಸಿ')}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMIT TICKET / FORM */}
          {activeTab === 'ticket' && (
            <div className="space-y-3.5">
              {submittedTicket ? (
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-emerald-950">
                    {loc('மனு வெற்றிகரமாக பதிவானது!', 'Ticket Submitted Successfully!', 'टिकट सफलतापूर्वक सबमिट किया गया!', 'టికెట్ విజయవంతంగా సమర్పించబడింది!', 'ടിക്കറ്റ് വിജയകരമായി സമർപ്പിച്ചു!', 'ಟಿಕೆಟ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!')}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-white border border-emerald-300 rounded-full text-xs font-mono font-bold text-emerald-800">
                    {loc('டிக்கெட் எண்', 'Ticket ID', 'टिकट आईडी', 'టికెట్ ఐడి', 'ടിക്കറ്റ് ഐഡി', 'ಟಿಕೆಟ್ ಐಡಿ')}: {submittedTicket.ticketNumber}
                  </div>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    {loc(
                      `எங்கள் நிர்வாகக் குழு உங்கள் தகவலை ஆய்வு செய்து ${submittedTicket.senderPhone} எண்ணில் விரைவில் தொடர்புகொள்வர்.`,
                      `Our team will review your ticket and contact you at ${submittedTicket.senderPhone} shortly.`,
                      `हमारी टीम आपके टिकट की समीक्षा करेगी और जल्द ही ${submittedTicket.senderPhone} पर संपर्क करेगी।`,
                      `మా బృందం సమీక్షించి త్వరలో ${submittedTicket.senderPhone} లో సంప్రదిస్తుంది.`,
                      `ഞങ്ങളുടെ ടീം ഇത് പരിശോധിച്ച് ${submittedTicket.senderPhone} എന്ന നമ്പറിൽ ഉടൻ ബന്ധപ്പെടും.`,
                      `ನಮ್ಮ ತಂಡ ಪರಿಶೀಲಿಸಿ ಶೀಘ್ರದಲ್ಲೇ ${submittedTicket.senderPhone} ರಲ್ಲಿ ಸಂಪರ್ಕಿಸುತ್ತದೆ.`
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `*வணக்கம் Daily Work நிர்வாகம்*,\nபுதிய உதவி மனு பதிவு செய்யப்பட்டுள்ளது:\n• டிக்கெட் எண்: ${submittedTicket.ticketNumber}\n• பெயர்: ${submittedTicket.senderName}\n• கைபேசி: ${submittedTicket.senderPhone}\n• வகை: ${submittedTicket.category}\n• விவரம்: ${submittedTicket.message}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {loc('மேலாண்மைக்கு WhatsApp மூலம் அனுப்ப', 'Forward to Management WhatsApp', 'प्रबंधन व्हाट्सएप पर भेजें', 'నిర్వహణ వాట్సాప్‌కు పంపండి', 'മാനേജ്‌മെന്റ് വാട്ട്‌സ്ആപ്പിലേക്ക് അയക്കുക', 'ನಿರ್ವಹಣಾ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಿ')}
                    </a>
                    <button
                      onClick={() => {
                        setSubmittedTicket(null);
                        setName('');
                        setPhone('');
                        setMessage('');
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                    >
                      {loc('மற்றொரு மனு அனுப்ப', 'Submit Another Ticket', 'एक और टिकट सबमिट करें', 'మరొక టికెట్ సమర్పించండి', 'മറ്റൊരു ടിക്കറ്റ് സമർപ്പിക്കുക', 'ಮತ್ತೊಂದು ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ')}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {loc('உங்கள் பெயர்', 'Your Name', 'आपका नाम', 'మీ పేరు', 'നിങ്ങളുടെ പേര്', 'ನಿಮ್ಮ ಹೆಸರು')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={loc('எ.கா: குமார்', 'e.g. Kumar', 'उदा: कुमार', 'ఉదా: కుమార్', 'ഉദാ: കുമാർ', 'ಉದಾ: ಕುಮಾರ್')}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {loc('கைபேசி எண்', 'Mobile Number', 'मोबाइल नंबर', 'మొబైల్ నంబర్', 'മൊബൈൽ നമ്പർ', 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ')} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {loc('காரணம் / வகை', 'Category', 'श्रेणी', 'వర్గం', 'വിഭാഗം', 'ವರ್ಗ')}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="management_inquiry">
                          {loc('நிர்வாக ஆலோசனை', 'Management Inquiry', 'प्रबंधन पूछताछ', 'నిర్వహణ విచారణ', 'മാനേജ്‌മെന്റ് അന്വേഷണം', 'ನಿರ್ವಹಣಾ ವಿಚಾರಣೆ')}
                        </option>
                        <option value="payment">
                          {loc('கட்டணம் / ரசீது', 'Payment / Billing', 'भुगतान / बिलिंग', 'చెల్లింపు / బిల్లింగ్', 'പേയ്‌മെന്റ് / ബില്ലിംഗ്', 'ಪಾವತಿ / ಬಿಲ್ಲಿಂಗ್')}
                        </option>
                        <option value="job_issue">
                          {loc('வேலை சம்பந்தப்பட்ட பிரச்சனை', 'Job Listing Issue', 'नौकरी लिस्टिंग समस्या', 'ఉద్యోగ జాబితా సమస్య', 'തൊഴിൽ ലിസ്റ്റിംഗ് പ്രശ്നം', 'ಉದ್ಯೋಗ ಪಟ್ಟಿ ಸಮಸ್ಯೆ')}
                        </option>
                        <option value="recruitment">
                          {loc('மொத்த ஆட்கள் தேவை', 'Bulk Recruitment', 'थोक भर्ती', 'బల్క్ రిక్రూట్‌మెంట్', 'ബൾക്ക് റിക്രൂട്ട്മെന്റ്', 'ಬೃಹತ್ ನೇಮಕಾತಿ')}
                        </option>
                        <option value="safety_report">
                          {loc('மோசடி புகார் / பாதுகாப்பு', 'Report Scam / Safety', 'घोटाला रिपोर्ट / सुरक्षा', 'మోసం నివేదిక / భద్రత', 'തട്ടിപ്പ് റിപ്പോർട്ട് / സുരക്ഷ', 'ವಂಚನೆ ವರದಿ / ಭದ್ರತೆ')}
                        </option>
                        <option value="general">
                          {loc('பொதுவான உதவி', 'General Help', 'सामान्य सहायता', 'సాధారణ సహాయం', 'പൊതു സഹായം', 'ಸಾಮಾನ್ಯ ಸಹಾಯ')}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {loc('தலைப்பு (விருப்பத்தேர்வு)', 'Subject (Optional)', 'विषय (वैकल्पिक)', 'విషయం (ఐచ్ఛికం)', 'വിഷയം (ഓപ്ഷണൽ)', 'ವಿಷಯ (ಐಚ್ಛಿಕ)')}
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={loc('விளக்கம்', 'Short subject', 'संक्षिप्त विषय', 'చిన్న విషయం', 'ഹ്രസ്വ വിഷയം', 'ಸಂಕ್ಷಿಪ್ತ ವಿಷಯ')}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {loc('விவரம் / செய்தி', 'Detailed Message', 'विस्तृत संदेश', 'వివరణాత్మక సందేశం', 'വിശദമായ സന്ദേശം', 'ವಿವರವಾದ ಸಂದೇಶ')} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={loc(
                        'உங்கள் கேள்வியை அல்லது பிரச்சனையை தெளிவாக விவரிக்கவும்...',
                        'Please describe your request or issue in detail...',
                        'कृपया अपने अनुरोध या समस्या का विस्तार से वर्णन करें...',
                        'దయచేసి మీ అభ్యర్థన లేదా సమస్యను వివరంగా వివరించండి...',
                        'ദയവായി നിങ്ങളുടെ അഭ്യർത്ഥനയോ പ്രശ്നമോ വിശദമായി വിവരിക്കുക...',
                        'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿನಂತಿ ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ...'
                      )}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>{loc('அனுப்பப்படுகிறது...', 'Submitting...', 'भेजा जा रहा है...', 'సమర్పిస్తోంది...', 'സമർപ്പിക്കുന്നു...', 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...')}</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {loc('நிர்வாகத்திற்கு மனு சமர்ப்பிக்கவும்', 'Submit Ticket to Management', 'प्रबंधन को टिकट सबमिट करें', 'నిర్వహణకు టికెట్ సమర్పించండి', 'മാനേജ്‌മെന്റിന് ടിക്കറ്റ് സമർപ്പിക്കുക', 'ನಿರ್ವಹಣೆಗೆ ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ')}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SAFETY & ENCRYPTION */}
          {activeTab === 'safety' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-teal-950">
                    {loc('100% பாதுகாப்பான & குறியாக்கம் செய்யப்பட்ட தளம்', '256-Bit Encrypted & Privacy Protected', '256-बिट एन्क्रिप्टेड और गोपनीयता सुरक्षित', '256-బిట్ ఎన్‌క్రిప్టెడ్ & గోప్యతా రక్షణ', '256-ബിറ്റ് എൻക്രിപ്റ്റ് ചെയ്തതും സ്വകാര്യത സംരക്ഷിച്ചതും', '256-ಬಿಟ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾದ ಮತ್ತು ಗೌಪ್ಯತೆ ಸಂರಕ್ಷಿತ')}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    {loc(
                      'உங்கள் தொடர்பு எண்கள் மற்றும் தனிப்பட்ட விவரங்கள் பாதுகாப்பாக வைக்கப்படுகின்றன. மோசடிகளுக்கு எதிராக நேரடி கண்காணிப்பு உள்ளது.',
                      'Your contact numbers, transaction logs, and location data are safeguarded with client-side protections and active fraud monitoring.',
                      'आपकी संपर्क जानकारी और लेन-देन लॉग धोखाधड़ी निगरानी के साथ सुरक्षित हैं।',
                      'మీ సంప్రదింపు వివరాలు మరియు లావాదేవీ లాగ్‌లు సురక్షితంగా రక్షించబడతాయి.',
                      'നിങ്ങളുടെ ഫോൺ നമ്പറുകളും ഇടപാട് വിവരങ്ങളും സുരക്ഷിതമായി സംരക്ഷിക്കപ്പെടുന്നു.',
                      'ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳು ಮತ್ತು ವಹಿವಾಟು ದಾಖಲೆಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ.'
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    🛡️ {loc('சரிபார்க்கப்பட்ட முதலாளி முத்திரை', 'Verified Employer Seal', 'सत्यापित नियोक्ता मुहर', 'ధృవీకరించబడిన యజమాని ముద్ర', 'പരിശോധിച്ച തൊഴിലുടമ മുദ്ര', 'ಪರಿಶೀಲಿಸಿದ ಉದ್ಯೋಗದಾತ ಮುದ್ರೆ')}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                    Active
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    🔒 {loc('எண் பாதுகாப்பு & ஸ்பேம் தடுப்பு', 'Number Privacy & Spam Filter', 'नंबर गोपनीयता और स्पैम फ़िल्टर', 'నంబర్ గోప్యత & స్పామ్ ఫిల్టర్', 'നമ്പർ സ്വകാര്യതയും സ്പാം ഫിൽട്ടറും', 'ಸಂಖ್ಯೆ ಗೌಪ್ಯತೆ ಮತ್ತು ಸ್ಪ್ಯಾಮ್ ಫಿಲ್ಟರ್')}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                    Enabled
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    📍 {loc('நேரடி கூகுள் மேப்ஸ் வழித்தடம்', 'Direct Google Maps GPS Route', 'सीधा गूगल मैप्स जीपीएस मार्ग', 'డైరెక్ట్ గూగుల్ మ్యాప్స్ GPS మార్గం', 'നേരിട്ടുള്ള ഗൂഗിൾ മാപ്സ് ജിപിഎസ് റൂട്ട്', 'ನೇರ ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಜಿಪಿಎಸ್ ಮಾರ್ಗ')}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                    Verified
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                <p className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{loc('முக்கிய பாதுகாப்பு எச்சரிக்கை', 'Crucial Safety Rules', 'महत्वपूर्ण सुरक्षा नियम', 'ముఖ్యమైన భద్రతా నియమాలు', 'പ്രധാന സുരക്ഷാ നിയമങ്ങൾ', 'ಪ್ರಮುಖ ಸುರಕ್ಷತಾ ನಿಯಮಗಳು')}</span>
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-amber-900/90">
                  <li>
                    {loc(
                      'தினக்கூலி வேலைக்கு ஒருபோதும் முன்பணம் அல்லது டெபாசிட் கட்ட வேண்டாம்.',
                      'Never pay registration fees, security deposits, or advance payments to anyone claiming to offer daily jobs.',
                      'दैनिक मजदूरी के काम के लिए कभी भी पंजीकरण शुल्क या अग्रिम भुगतान न करें।',
                      'రోజువారీ కూలీ పని కోసం రిజిస్ట్రేషన్ ఫీజు లేదా డిపాజిట్ ఎప్పుడూ చెల్లించవద్దు.',
                      'ദിവസവേതന ജോലിക്ക് ഒരിക്കലും മുൻകൂറായി പണമോ ഡിപ്പോസിറ്റോ നൽകരുത്.',
                      'ದೈನಂದಿನ ಕೂಲಿ ಕೆಲಸಕ್ಕೆ ನೋಂದಣಿ ಶುಲ್ಕ ಅಥವಾ ಮುಂಗಡ ಹಣವನ್ನು ಎಂದಿಗೂ ಪಾವತಿಸಬೇಡಿ.'
                    )}
                  </li>
                  <li>
                    {loc(
                      'வேலை முடிந்தவுடன் நேரடியாக தினசரி கூலியை பெற்றுக்கொள்ளுங்கள்.',
                      'Always collect your agreed daily wage at the job site upon task completion.',
                      'कार्य पूरा होने पर हमेशा कार्यस्थल पर ही सहमत दैनिक मजदूरी प्राप्त करें।',
                      'పని పూర్తయిన తర్వాత పని స్థలంలోనే మీ రోజువారీ వేతనాన్ని నేరుగా పొందండి.',
                      'ജോലി പൂർത്തിയായ ശേഷം ജോലി സ്ഥലത്ത് വച്ച് തന്നെ വേതനം നേരിട്ട് വാങ്ങുക.',
                      'ಕೆಲಸ ಮುಗಿದ ನಂತರ ಸ್ಥಳದಲ್ಲೇ ನಿಮ್ಮ ಒಪ್ಪಿಕೊಂಡ ದೈನಂದಿನ ಕೂಲಿಯನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.'
                    )}
                  </li>
                  <li>
                    {loc(
                      'சந்தேகத்திற்கிடமான நபர்களை உடனடியாக நிர்வாகக் குழுவிடம் தெரிவிக்கவும்.',
                      'Report suspicious employers or workers to the management hotline immediately.',
                      'संदिग्ध नियोक्ताओं या श्रमिकों की तुरंत प्रबंधन को सूचना दें।',
                      'అనుమానాస్పద యజమానులు లేదా కార్మికులను వెంటనే నిర్వహణకు నివేదించండి.',
                      'സംശയാസ്പദമായ വ്യക്തികളെ ഉടൻ മാനേജ്‌മെന്റ് ഹെൽപ്പ്‌ലൈനിൽ അറിയിക്കുക.',
                      'ಅನುಮಾನಾಸ್ಪದ ವ್ಯಕ್ತಿಗಳ ಬಗ್ಗೆ ತಕ್ಷಣ ನಿರ್ವಹಣಾ ತಂಡಕ್ಕೆ ವರದಿ ಮಾಡಿ.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="font-bold text-slate-900">
                  1. {loc('வேலைக்கு எப்படி தொடர்புகொள்வது?', 'How do I contact an employer?', 'नियोक्ता से कैसे संपर्क करें?', 'యజమానిని ఎలా సంప్రదించాలి?', 'തൊഴിലുടമയെ എങ്ങനെ ബന്ധപ്പെടാം?', 'ಉದ್ಯೋಗದಾತರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಹೇಗೆ?')}
                </p>
                <p className="text-slate-600 mt-1 text-[11px]">
                  {loc(
                    'வேலை பட்டியலில் உள்ள "போன் செய்ய (Call)" அல்லது "வாட்ஸ்அப் (WhatsApp)" பொத்தானை அழுத்தினால் நேரடியாக முதலாளியுடன் பேசலாம்.',
                    'Tap the "Call Now" or "WhatsApp" button on any job card to instantly connect with the employer.',
                    'नियोक्ता से तुरंत बात करने के लिए जॉब कार्ड पर "कॉल करें" या "व्हाट्सएप" दबाएं।',
                    'యజమానితో మాట్లాడటానికి జాబ్ కార్డ్‌లోని "కాల్ చేయండి" లేదా "వాట్సాప్" బటన్‌ను నొక్కండి.',
                    'തൊഴിലുടമയുമായി നേരിട്ട് സംസാരിക്കാൻ "വിളിക്കുക" അല്ലെങ്കിൽ "വാട്ട്സ്ആപ്പ്" അമർത്തുക.',
                    'ಉದ್ಯೋಗದಾತರೊಂದಿಗೆ ಮಾತನಾಡಲು ಜಾಬ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ "ಕರೆ ಮಾಡಿ" ಅಥವಾ "ವಾಟ್ಸಾಪ್" ಒತ್ತಿರಿ.'
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="font-bold text-slate-900">
                  2. {loc('வேலை இடத்தை வரைபடத்தில் பார்ப்பது எப்படி?', 'How to navigate to the job site?', 'कार्यस्थल तक कैसे नेविगेट करें?', 'పని స్థలానికి ఎలా నావిగేట్ చేయాలి?', 'ജോലി സ്ഥലത്തേക്ക് എങ്ങനെ പോകാം?', 'ಕೆಲಸದ ಸ್ಥಳಕ್ಕೆ ಹೇಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡುವುದು?')}
                </p>
                <p className="text-slate-600 mt-1 text-[11px]">
                  {loc(
                    'வேலை விவரத்தில் உள்ள "வழித்தடம் (Navigate)" பொத்தானை கிளிக் செய்தால் Google Maps மூலம் உங்கள் இடத்திலிருந்து செல்லும் பாதை தெரியும்.',
                    'Click "Navigate / Directions" on the job card to open turn-by-turn navigation in Google Maps.',
                    'जॉब कार्ड पर "दिशा-निर्देश" पर क्लिक करने पर Google Maps नेविगेशन खुलता है।',
                    'జాబ్ కార్డులోని "రూట్" క్లిక్ చేస్తే Google Maps లో దారి కనిపిస్తుంది.',
                    'ജോലി കാർഡിലെ "റൂട്ട്" ക്ലിക്ക് ചെയ്താൽ Google Maps വഴി ദിശ കാണാം.',
                    'ಜಾಬ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ "ಮಾರ್ಗ" ಕ್ಲಿಕ್ ಮಾಡಿದರೆ Google Maps ನಲ್ಲಿ ದಾರಿ ತಿಳಿಯುತ್ತದೆ.'
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="font-bold text-slate-900">
                  3. {loc('வெளி மாநிலங்கள் / நாடுகளில் வேலை உண்டா?', 'Are there domestic and overseas jobs?', 'क्या अन्य राज्यों / विदेशों में नौकरियां हैं?', 'ఇతర రాష్ట్రాలు / విదేశాలలో ఉద్యోగాలు ఉన్నాయా?', 'മറ്റ് സംസ്ഥാനങ്ങളിൽ / വിദേശത്ത് ജോലികൾ ലഭ്യമാണോ?', 'ಬೇರೆ ರಾಜ್ಯಗಳು / ವಿದೇಶಗಳಲ್ಲಿ ಉದ್ಯೋಗಗಳು ಇವೆಯೇ?')}
                </p>
                <p className="text-slate-600 mt-1 text-[11px]">
                  {loc(
                    'ஆம்! தமிழ்நாடு மட்டுமின்றி பெங்களூரு, ஹைதராபாத், மும்பை, மற்றும் துபாய், சிங்கப்பூர், மலேசியா நாடுகளின் வேலைகளும் உள்ளன.',
                    'Yes! Jobs across all major Indian domestic cities and international countries (UAE, Singapore, Malaysia, Saudi Arabia) are supported.',
                    'हाँ! भारत के प्रमुख शहरों और विदेशों (दुबई, सिंगापुर, मलेशिया) की नौकरियां भी उपलब्ध हैं।',
                    'అవును! భారతదేశంలోని ప్రధాన నగరాలు మరియు విదేశాల (దుబాయ్, సింగపూర్) ఉద్యోగాలు కూడా ఉన్నాయి.',
                    'അതെ! ഇന്ത്യയിലെ പ്രധാന നగరങ്ങളിലെയും വിദേശങ്ങളിലെയും (ദുബായ്, സിംഗപ്പൂർ) ജോലികൾ ലഭ്യമാണ്.',
                    'ಹೌದು! ಪ್ರಮುಖ ನಗರಗಳು ಮತ್ತು ವಿದೇಶಗಳ (ದುಬೈ, ಸಿಂಗಾಪುರ) ಉದ್ಯೋಗಗಳೂ ಲಭ್ಯವಿವೆ.'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daily Work Management Team</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold cursor-pointer"
          >
            {loc('மூடுக', 'Close', 'बंद करें', 'మూసివేయి', 'അടയ്ക്കുക', 'ಮುಚ್ಚಿ')}
          </button>
        </div>
      </div>
    </div>
  );
};
