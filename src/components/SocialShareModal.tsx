import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Job } from '../types';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Send,
  Facebook,
  Twitter,
  MessageCircle,
  Smartphone,
} from 'lucide-react';

interface SocialShareModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ job, isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const appUrl = window.location.href;
  const shareText = `👷‍♂️ *தினக்கூலி வேலை வாய்ப்பு / Daily Work Alert* 👷‍♂️\n\n📌 *முதலாளி / Employer:* ${job.employerName}\n📍 *இடம் / Location:* ${job.location}\n💰 *தினக்கூலி / Daily Wage:* ₹${job.dailyWage} / நாள்\n👥 *தேவைப்படும் ஆட்கள் / Workers Needed:* ${job.workersNeeded}\n📞 *தொடர்புக்கு / Contact:* ${job.contactNumber}\n${job.notes ? `📝 விவரம்: ${job.notes}\n` : ''}\nநேரடி வேலைக்கு Daily Work செயலியை பயன்படுத்தவும்: ${appUrl}`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(appUrl);

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.employerName} - ₹${job.dailyWage} Daily Work`,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const shareChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://wa.me/?text=${encodedText}`,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      bgColor: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      bgColor: 'bg-slate-900 hover:bg-black text-white',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: Smartphone,
      bgColor: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
      url: `sms:?body=${encodedText}`,
    },
  ];

  return (
    <div
      id="social-share-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ta' ? 'வேலையை சமூக ஊடகத்தில் பகிருங்கள்' : 'Share Job to Social Media'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {job.employerName} • ₹{job.dailyWage} / {language === 'ta' ? 'நாள்' : 'day'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {shareChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-xs active:scale-95 text-center ${channel.bgColor}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">{channel.name}</span>
              </a>
            );
          })}

          {/* Native / Copy Button */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-xs active:scale-95 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
          >
            <Share2 className="w-5 h-5 mb-1 text-slate-700" />
            <span className="text-[11px] font-bold">
              {language === 'ta' ? 'அனைத்திலும்' : 'More'}
            </span>
          </button>
        </div>

        {/* Copy Text Preview Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 flex items-center justify-between gap-2">
          <div className="truncate text-[11px] text-slate-500 font-mono">
            {job.employerName} • ₹{job.dailyWage} • {job.location}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'நகலெடுக்கப்பட்டது!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'நகலெடு' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
