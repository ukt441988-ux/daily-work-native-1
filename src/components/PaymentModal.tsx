import React, { useState } from 'react';
import { PaymentPurpose, PaymentTransaction, OwnerPaymentConfig } from '../types';
import { DEFAULT_OWNER_PAYMENT_CONFIG } from '../data/monetizationData';
import { useLanguage } from '../context/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  Receipt,
  ArrowRight,
  RefreshCw,
  Sparkles,
  QrCode,
  Copy,
  Check,
  PhoneCall,
  MessageCircle,
  Banknote,
  Info,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleTa: string;
  amount: number;
  purpose: PaymentPurpose;
  targetItemId?: string;
  payerName: string;
  payerPhone: string;
  ownerPaymentConfig?: OwnerPaymentConfig;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  titleEn,
  titleTa,
  amount,
  purpose,
  targetItemId,
  payerName,
  payerPhone,
  ownerPaymentConfig = DEFAULT_OWNER_PAYMENT_CONFIG,
  onPaymentSuccess,
}) => {
  const { language } = useLanguage();

  // Mode Selection: owner_upi_qr | owner_bank | cash | card
  const [selectedChannel, setSelectedChannel] = useState<'owner_upi_qr' | 'owner_bank' | 'cash' | 'card'>(
    'owner_upi_qr'
  );

  const [upiSubApp, setUpiSubApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');
  const [customerUtr, setCustomerUtr] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card & NetBanking state
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('SBI');

  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [simulatedFailure, setSimulatedFailure] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Build standard UPI URI for QR code and mobile app deep-linking
  const cleanOwnerUpi = ownerPaymentConfig.ownerUpiId || 'connectthanigai@okhdfcbank';
  const encodedName = encodeURIComponent(ownerPaymentConfig.ownerName || 'Daily Work Admin');
  const note = encodeURIComponent(`DailyWork-${purpose}-${payerPhone || 'Ad'}`);
  const upiUri = `upi://pay?pa=${cleanOwnerUpi}&pn=${encodedName}&am=${amount}&cu=INR&tn=${note}`;

  const handleOpenUpiApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'generic' | 'atm') => {
    if (app === 'atm') {
      setSelectedChannel('card');
      return;
    }
    setUpiSubApp(app === 'generic' ? 'gpay' : app);

    let targetUri = upiUri;
    if (app === 'gpay') {
      targetUri = `tez://upi/pay?pa=${cleanOwnerUpi}&pn=${encodedName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'phonepe') {
      targetUri = `phonepe://pay?pa=${cleanOwnerUpi}&pn=${encodedName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'paytm') {
      targetUri = `paytmmp://pay?pa=${cleanOwnerUpi}&pn=${encodedName}&am=${amount}&cu=INR&tn=${note}`;
    }

    try {
      window.location.href = targetUri;
    } catch (e) {
      window.location.href = upiUri;
    }
  };

  const handlePay = () => {
    setPaymentState('processing');

    // Determine stored payment method type
    let methodKey: PaymentTransaction['paymentMethod'] = 'upi_gpay';
    if (selectedChannel === 'owner_upi_qr') {
      if (upiSubApp === 'phonepe') methodKey = 'upi_phonepe';
      else if (upiSubApp === 'paytm') methodKey = 'upi_paytm';
      else methodKey = 'upi_gpay';
    } else if (selectedChannel === 'owner_bank') {
      methodKey = 'netbanking';
    } else if (selectedChannel === 'cash') {
      methodKey = 'cash';
    } else {
      methodKey = 'card';
    }

    // Simulate verification delay (1.2s)
    setTimeout(() => {
      if (simulatedFailure) {
        setPaymentState('failed');
        return;
      }

      const receiptNo = customerUtr.trim()
        ? `UTR-${customerUtr.trim().slice(-8).toUpperCase()}`
        : `DW-REC-${Math.floor(100000 + Math.random() * 900000)}`;

      const tx: PaymentTransaction = {
        id: `tx-${Date.now()}`,
        receiptNumber: receiptNo,
        payerName: payerName || 'Employer',
        payerPhone: payerPhone || '9840123456',
        purpose,
        targetItemId,
        itemTitleEn: titleEn,
        itemTitleTa: titleTa,
        amount,
        paymentMethod: methodKey,
        status: 'successful',
        timestamp: new Date().toISOString(),
      };

      setCompletedTx(tx);
      setPaymentState('success');
      onPaymentSuccess(tx);
    }, 1200);
  };

  const handleReset = () => {
    setPaymentState('idle');
    setSimulatedFailure(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Lock className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {language === 'ta'
                  ? 'உரிமையாளர் கட்டண முறை'
                  : language === 'en'
                  ? 'Owner Payment Options'
                  : 'உரிமையாளர் கட்டணம் / Payment'}
              </h3>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Verified Direct UPI & Bank Transfer</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-slate-800">
          {paymentState === 'processing' && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">
                {language === 'ta' ? 'கட்டணம் சரிபார்க்கப்படுகிறது...' : 'Verifying Payment...'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {language === 'ta'
                  ? 'தயவுசெய்து காத்திருக்கவும். பரிவர்த்தனை பதிவு செய்யப்படுகிறது.'
                  : 'Please wait while we record your payment and activate your order.'}
              </p>
            </div>
          )}

          {paymentState === 'failed' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-rose-800 text-base">
                {language === 'ta' ? 'கட்டணம் தோல்வியடைந்தது' : 'Payment Verification Failed'}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {language === 'ta'
                  ? 'பரிவர்த்தனை பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது உரிமையாளரை அழைக்கவும்.'
                  : 'Could not complete transaction. Please retry or contact the app owner directly.'}
              </p>
              <div className="pt-2 flex gap-2 justify-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'ta' ? 'மீண்டும் முயற்சிக்க' : 'Try Again'}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {language === 'ta' ? 'மூடுக' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {paymentState === 'success' && completedTx && (
            <div className="py-4 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {language === 'ta' ? 'கட்டணம் வெற்றிகரமாக பெறப்பட்டது' : 'Payment Recorded Successfully'}
                </span>
                <h4 className="font-extrabold text-slate-900 text-2xl mt-1">
                  ₹{completedTx.amount}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {language === 'en' ? completedTx.itemTitleEn : completedTx.itemTitleTa}
                </p>
              </div>

              {/* Digital Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-200 font-mono text-[11px]">
                  <span>Receipt / UTR No:</span>
                  <span className="font-bold text-slate-900">{completedTx.receiptNumber}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Payer:</span>
                  <span className="font-semibold text-slate-900">{completedTx.payerName} ({completedTx.payerPhone})</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Payment Mode:</span>
                  <span className="font-semibold uppercase">{(completedTx.paymentMethod || '').replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Date:</span>
                  <span>{new Date(completedTx.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
                  <span>Status:</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    PAID & SUBMITTED TO OWNER
                  </span>
                </div>
              </div>

              {/* WhatsApp Receipt Share */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/91${(ownerPaymentConfig?.ownerPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `வணக்கம் உரிமையாளர் அவர்களே, நான் ₹${completedTx.amount} செலுத்தியுள்ளேன். ரசீது எண்: ${completedTx.receiptNumber}. விளம்பரம்: ${completedTx.itemTitleTa}. சரிபார்க்கவும்.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === 'ta' ? 'உரிமையாளருக்கு வாட்ஸ்அப்பில் ரசீது அனுப்புக' : 'Send Receipt to Owner via WhatsApp'}</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  {language === 'ta' ? 'முடிந்தது - பக்கத்தை மூடுக' : 'Done & Close'}
                </button>
              </div>
            </div>
          )}

          {paymentState === 'idle' && (
            <>
              {/* Order Summary Strip */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                    {language === 'ta' ? 'விளம்பர கட்டணம்' : 'Ad Billing'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1">
                    {language === 'en' ? titleEn : titleTa}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {payerName} • <span className="font-mono">{payerPhone}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-emerald-700">₹{amount}</p>
                  <p className="text-[9px] text-slate-400">All Taxes Included</p>
                </div>
              </div>

              {/* Owner Payment Channels Navigation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ta' ? 'உரிமையாளருக்கு பணம் செலுத்தும் வழி:' : 'Select Owner Payment Option:'}
                </label>

                <div className="grid grid-cols-4 gap-1.5">
                  {/* Channel 1: Owner UPI QR */}
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('owner_upi_qr')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChannel === 'owner_upi_qr'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span className="text-[11px] block leading-tight">UPI QR</span>
                    <span className="text-[9px] text-slate-500 block">GPay/PhonePe</span>
                  </button>

                  {/* Channel 2: Owner Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('owner_bank')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChannel === 'owner_bank'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-700" />
                    <span className="text-[11px] block leading-tight">வங்கி</span>
                    <span className="text-[9px] text-slate-500 block">IMPS/NEFT</span>
                  </button>

                  {/* Channel 3: Cash to Owner */}
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('cash')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChannel === 'cash'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                    <span className="text-[11px] block leading-tight">ரொக்கம்</span>
                    <span className="text-[9px] text-slate-500 block">Direct Cash</span>
                  </button>

                  {/* Channel 4: Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('card')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChannel === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-blue-700" />
                    <span className="text-[11px] block leading-tight">கார்டு</span>
                    <span className="text-[9px] text-slate-500 block">Debit/Credit</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: OWNER UPI & DYNAMIC QR CODE */}
              {selectedChannel === 'owner_upi_qr' && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        உரிமையாளர் நேரடி UPI QR
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {ownerPaymentConfig.ownerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${ownerPaymentConfig.ownerPhone}`}
                        className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] text-slate-700 font-semibold flex items-center gap-1"
                        title="உரிமையாளரை அழைக்க"
                      >
                        <PhoneCall className="w-3 h-3 text-emerald-700" />
                        <span>அழைக்க</span>
                      </a>
                      <a
                        href={`https://wa.me/91${(ownerPaymentConfig?.ownerPhone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs inline-block">
                      <QRCodeSVG
                        value={upiUri}
                        size={150}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold mt-2">
                      {language === 'ta'
                        ? `GPay / PhonePe / Paytm மூலம் ₹${amount} ஸ்கேன் செய்து செலுத்தவும்`
                        : `Scan with Google Pay, PhonePe or Paytm to pay ₹${amount}`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Direct Credit to Owner Bank Account
                    </p>
                  </div>

                  {/* Copyable Owner UPI ID */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 block">உரிமையாளர் UPI ID / VPA:</span>
                      <span className="font-mono text-xs font-bold text-slate-900 select-all truncate block">
                        {cleanOwnerUpi}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cleanOwnerUpi, 'upi')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                        copiedField === 'upi'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {copiedField === 'upi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'upi' ? 'நகலெடுக்கப்பட்டது!' : 'நகலெடு (Copy)'}</span>
                    </button>
                  </div>

                  {/* Mobile Deep-link App Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-700 font-bold">
                        {language === 'ta' ? 'நேரடியாக செயலியில் திறந்து செலுத்த:' : 'Open directly in Payment App:'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {language === 'ta' ? 'உடனடி இணைப்பு' : 'Instant Deep Link'}
                      </span>
                    </div>

                    {/* Universal Single Tap Open Any UPI App */}
                    <button
                      type="button"
                      id="btn-open-any-upi"
                      onClick={() => handleOpenUpiApp('generic')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-200" />
                      <span>{language === 'ta' ? 'போனில் உள்ள ஏதேனும் ஒரு UPI ஆப் மூலம் திறக்க' : 'Open in Installed UPI App (GPay / PhonePe / Paytm)'}</span>
                    </button>

                    {/* 4 Dedicated App Buttons: GPay, PhonePe, Paytm, ATM Card */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      {/* Google Pay */}
                      <button
                        type="button"
                        id="btn-open-gpay"
                        onClick={() => handleOpenUpiApp('gpay')}
                        className="p-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl text-center cursor-pointer transition-all shadow-2xs group"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-1 group-hover:bg-emerald-100">
                          <span className="text-[11px] font-black text-emerald-700">G</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 block">Google Pay</span>
                        <span className="text-[9px] text-slate-500 block">{language === 'ta' ? 'திறக்க' : 'Open'}</span>
                      </button>

                      {/* PhonePe */}
                      <button
                        type="button"
                        id="btn-open-phonepe"
                        onClick={() => handleOpenUpiApp('phonepe')}
                        className="p-2 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 rounded-xl text-center cursor-pointer transition-all shadow-2xs group"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-1 group-hover:bg-purple-200">
                          <span className="text-[11px] font-black text-purple-700">पे</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 block">PhonePe</span>
                        <span className="text-[9px] text-slate-500 block">{language === 'ta' ? 'திறக்க' : 'Open'}</span>
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        id="btn-open-paytm"
                        onClick={() => handleOpenUpiApp('paytm')}
                        className="p-2 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 rounded-xl text-center cursor-pointer transition-all shadow-2xs group"
                      >
                        <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-1 group-hover:bg-sky-200">
                          <span className="text-[10px] font-black text-sky-700">₹</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 block">Paytm</span>
                        <span className="text-[9px] text-slate-500 block">{language === 'ta' ? 'திறக்க' : 'Open'}</span>
                      </button>

                      {/* ATM Card Button */}
                      <button
                        type="button"
                        id="btn-open-atm-card"
                        onClick={() => handleOpenUpiApp('atm')}
                        className="p-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl text-center cursor-pointer transition-all shadow-2xs group"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1 group-hover:bg-blue-200">
                          <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 block">{language === 'ta' ? 'ATM கார்டு' : 'ATM Card'}</span>
                        <span className="text-[9px] text-blue-600 block">{language === 'ta' ? 'கார்டு செலுத்த' : 'Pay by Card'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500 text-center italic pt-0.5">
                      {language === 'ta'
                        ? '👆 மேலுள்ள பட்டனை கிளிக் செய்து பணத்தை செலுத்திய பிறகு கீழே "கட்டணத்தை உறுதிசெய்க" பட்டனை அழுத்தவும்.'
                        : '👆 After sending the payment in your app, click "Confirm & Verify Payment" below.'}
                    </p>
                  </div>

                  {/* Optional UTR entry */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      பணம் செலுத்திய UTR / Ref No (விருப்பப்பட்டால்):
                    </label>
                    <input
                      type="text"
                      value={customerUtr}
                      onChange={(e) => setCustomerUtr(e.target.value)}
                      placeholder="எ.கா: 428901928471 (12 இலக்க எண்)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* METHOD 2: OWNER BANK TRANSFER (IMPS / NEFT) */}
              {selectedChannel === 'owner_bank' && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                      உரிமையாளர் வங்கி விவரங்கள் (Direct Bank Transfer)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">₹{amount}</span>
                  </div>

                  {/* Bank Details Table */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">வங்கி பெயர் (Bank):</span>
                      <span className="font-bold text-slate-900">{ownerPaymentConfig.bankName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">கணக்கு வைத்திருப்பவர்:</span>
                      <span className="font-bold text-slate-900">{ownerPaymentConfig.accountHolderName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 text-[10px] block">கணக்கு எண் (Account No):</span>
                        <span className="font-mono font-bold text-slate-900 text-xs select-all">
                          {ownerPaymentConfig.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ownerPaymentConfig.accountNumber, 'acc')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 text-[10px] block">IFSC Code:</span>
                        <span className="font-mono font-bold text-slate-900 text-xs select-all">
                          {ownerPaymentConfig.ifscCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ownerPaymentConfig.ifscCode, 'ifsc')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'ifsc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 text-[11px]">கிளை (Branch):</span>
                      <span className="font-medium text-slate-700">{ownerPaymentConfig.branch}</span>
                    </div>
                  </div>

                  {/* UTR entry for Bank Transfer */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      வங்கி பரிவர்த்தனை UTR / IMPS Ref எண்:
                    </label>
                    <input
                      type="text"
                      value={customerUtr}
                      onChange={(e) => setCustomerUtr(e.target.value)}
                      placeholder="எ.கா: 2026091000928372"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* METHOD 3: CASH TO OWNER */}
              {selectedChannel === 'cash' && (
                <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {language === 'ta' ? 'ரொக்கக் கட்டணம் (Cash Collection)' : 'Pay Cash to Owner / Agent'}
                      </h4>
                      <p className="text-[11px] text-amber-900">
                        நேரடி ரொக்கமாக உங்கள் கடையிலோ அல்லது அலுவலகத்திலோ செலுத்தலாம்.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-slate-700 space-y-2">
                    <p className="text-[11px]">
                      உரிமையாளர் அல்லது பிரதிநிதி உங்கள் கடைக்கு வந்து ₹{amount} ரொக்கமாக பெற்றுக்கொண்டு ரசீது வழங்குவார்.
                    </p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-600">தொடர்பு எண்:</span>
                      <a
                        href={`tel:${ownerPaymentConfig.ownerPhone}`}
                        className="font-bold text-emerald-700 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{ownerPaymentConfig.ownerPhone}</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center">
                    கட்டணம் உறுதிப்படுத்தப்பட்டதும் விளம்பரம் உடனடியாக நேரலையில் தோன்றும்.
                  </p>
                </div>
              )}

              {/* METHOD 4: CARD / NETBANKING */}
              {selectedChannel === 'card' && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Testing sandbox toggle */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-600">
                <span>Testing gateway sandbox:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedFailure}
                    onChange={(e) => setSimulatedFailure(e.target.checked)}
                    className="rounded accent-rose-600"
                  />
                  <span>Simulate Failed</span>
                </label>
              </div>

              {/* Confirm Pay Button */}
              <button
                id="btn-confirm-payment"
                type="button"
                onClick={handlePay}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {selectedChannel === 'cash'
                    ? (language === 'ta' ? `₹${amount} ரொக்கக் கோரிக்கை பதிவு செய்க` : `Confirm Cash Request ₹${amount}`)
                    : (language === 'ta' ? `₹${amount} கட்டணத்தை உறுதிசெய்க` : `Confirm & Verify Payment ₹${amount}`)}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                100% பாதுகாப்பானது • அங்கீகரிக்கப்பட்ட உரிமையாளர் வங்கிக் கணக்கு
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
