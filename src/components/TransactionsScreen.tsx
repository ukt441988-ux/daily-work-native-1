import React, { useState } from 'react';
import { PaymentTransaction, Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Download,
  Share2,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
  Calendar,
  X,
} from 'lucide-react';

interface TransactionsScreenProps {
  transactions?: PaymentTransaction[];
  onNavigate?: (screen: Screen) => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ transactions = [] }) => {
  const { language, loc } = useLanguage();
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  const safeTransactions = transactions || [];

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-slate-800 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Receipt className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {loc(
                'கட்டண வரலாறு & ரசீதுகள்',
                'Payment & Transaction History',
                'भुगतान और लेनदेन इतिहास',
                'చెల్లింపు మరియు లావాదేవీల చరిత్ర',
                'പേയ്‌മെന്റ് & ഇടപാട് ചരിത്രം',
                'ಪಾವತಿ ಮತ್ತು ವಹಿವಾಟು ಇತಿಹಾಸ'
              )}
            </h2>
            <p className="text-xs text-slate-300">
              {loc(
                'சிறப்பு வேலைகள், சந்தா மற்றும் விளம்பர ரசீதுகள்',
                'Receipts for featured jobs, subscriptions & advertisements',
                'फीचर्ड जॉब्स, सब्सक्रिप्शन और विज्ञापनों की रसीदें',
                'ఫీచర్ చేసిన ఉద్యోగాలు, సభ్యత్వాలు మరియు ప్రకటనల రసీదులు',
                'ഫീച്ചർ ചെയ്ത ജോലികൾ, വരിസംഖ്യകൾ, പരസ്യങ്ങൾ എന്നിവയുടെ രസീതുകൾ',
                'ವೈಶಿಷ್ಟ್ಯಪೂರ್ಣ ಉದ್ಯೋಗಗಳು, ಚಂದಾದಾರಿಕೆಗಳು ಮತ್ತು ಜಾಹೀರಾತುಗಳ ರಸೀದಿಗಳು'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {safeTransactions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-xs border border-slate-200">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>
              {loc(
                'பரிவர்த்தனைகள் எதுவும் இல்லை.',
                'No transactions found yet.',
                'अभी कोई लेनदेन नहीं मिला।',
                'ఇంకా ఎలాంటి లావాదేవీలు కనుగొనబడలేదు.',
                'ഇതുവരെ ഇടപാടുകളൊന്നും കണ്ടെത്തിയില്ല.',
                'ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
              )}
            </p>
          </div>
        ) : (
          safeTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">{tx.receiptNumber}</span>
                  <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                    {language === 'ta' ? tx.itemTitleTa : tx.itemTitleEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()} • {(tx.paymentMethod || '').replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900">₹{tx.amount}</span>
                  <span
                    className={`block text-[10px] font-bold uppercase mt-0.5 ${
                      tx.status === 'successful'
                        ? 'text-emerald-700'
                        : tx.status === 'refunded'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>

              {tx.refundReason && (
                <div className="bg-rose-50 p-2 rounded-lg text-[11px] text-rose-800">
                  <span className="font-bold">Refund:</span> {tx.refundReason}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-sm">
                  {loc('ரசீது', 'Tax Invoice / Receipt', 'कर चालान / रसीद', 'ఇన్‌వాయిస్ / రసీదు', 'രസീത്', 'ರಶೀದಿ')}
                </h4>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {loc('செலுத்தப்பட்ட தொகை', 'Total Amount Paid', 'कुल भुगतान राशि', 'చెల్లించిన మొత్తం', 'അടച്ച ആകെ തുക', 'ಪಾವತಿಸಿದ ಒಟ್ಟು ಮೊತ್ತ')}
              </span>
              <p className="text-2xl font-black text-emerald-700">₹{selectedTx.amount}</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {selectedTx.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{loc('ரசீது எண்', 'Receipt Number', 'रसीद संख्या', 'రసీదు సంఖ్య', 'രസീത് നമ്പർ', 'ರಶೀದಿ ಸಂಖ್ಯೆ')}:</span>
                <span className="font-mono font-bold text-slate-800">{selectedTx.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{loc('சேவை', 'Item / Service', 'वस्तु / सेवा', 'సేవ', 'സേവനം', 'ಸೇವೆ')}:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {language === 'ta' ? selectedTx.itemTitleTa : selectedTx.itemTitleEn}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{loc('செலுத்தியவர்', 'Payer', 'भुगतानकर्ता', 'చెల్లింపుదారు', 'പണം നൽകിയ ആൾ', 'ಪಾವತಿದಾರ')}:</span>
                <span className="text-slate-800">{selectedTx.payerName} ({selectedTx.payerPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{loc('பரிவர்த்தனை முறை', 'Payment Mode', 'भुगतान विधि', 'చెల్లింపు విధానం', 'പേയ്‌മെന്റ് രീതി', 'ಪಾವತಿ ವಿಧಾನ')}:</span>
                <span className="uppercase text-slate-800">{(selectedTx.paymentMethod || '').replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{loc('தேதி & நேரம்', 'Date & Time', 'तारीख व समय', 'తేదీ & సమయం', 'തീയതിയും സമയവും', 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ')}:</span>
                <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 bg-emerald-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{loc('பதிவிறக்கு', 'Download Receipt', 'डाउनलोड', 'డౌన్‌లోడ్', 'ഡൗൺലോഡ്', 'ಡೌನ್‌ಲೋಡ್')}</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                {loc('மூடுக', 'Close', 'बंद करें', 'మూసివేయి', 'അടയ്ക്കുക', 'ಮುಚ್ಚಿ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
