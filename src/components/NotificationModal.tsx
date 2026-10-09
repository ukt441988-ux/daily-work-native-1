import React from 'react';
import { AppNotification, Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Users2,
  Megaphone,
  Clock,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: AppNotification[];
  onMarkAllRead?: () => void;
  onMarkAllAsRead?: () => void;
  onNavigate: (screen: Screen) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const { language, loc } = useLanguage();

  if (!isOpen) return null;

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;
  const handleMarkAll = onMarkAllRead || onMarkAllAsRead || (() => {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-14 sm:pt-16 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-top duration-200">
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm">
              {loc('அறிவிப்புகள்', 'Notifications', 'सूचनाएं', 'నోటిఫికేషన్లు', 'അറിയിപ്പുകൾ', 'ಅಧಿಸೂಚನೆಗಳು')}
            </h4>
            {unreadCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {unreadCount} {loc('புதியது', 'new', 'नई', 'కొత్త', 'പുതിയത്', 'ಹೊಸ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
              >
                {loc('அனைத்தும் படித்ததாக குறிக்க', 'Mark all read', 'सभी पढ़ा हुआ चिह्नित करें', 'అన్నీ చదివినట్లు గుర్తించండి', 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക', 'ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-2 text-xs">
          {safeNotifications.length === 0 ? (
            <p className="text-center text-slate-400 py-6">
              {loc('அறிவிப்புகள் எதுவும் இல்லை.', 'No notifications yet.', 'अभी कोई सूचना नहीं है।', 'ఇంకా నోటిఫికేషన్లు లేవు.', 'ഇതുവരെ അറിയിപ്പുകളൊന്നുമില്ല.', 'ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.')}
            </p>
          ) : (
            safeNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.actionScreen) {
                    onNavigate(notif.actionScreen);
                    onClose();
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'payment' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {notif.type === 'subscription' && <Sparkles className="w-4 h-4 text-amber-600" />}
                    {notif.type === 'featured_expiry' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    {notif.type === 'ad_status' && <Megaphone className="w-4 h-4 text-indigo-600" />}
                    {notif.type === 'recruitment' && <Users2 className="w-4 h-4 text-teal-600" />}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-xs leading-snug">
                      {language === 'ta' ? notif.titleTa : notif.titleEn}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {language === 'ta' ? notif.messageTa : notif.messageEn}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
