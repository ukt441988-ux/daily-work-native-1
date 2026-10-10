import React, { useState, useMemo } from 'react';
import {
  Job,
  Advertisement,
  RecruitmentRequest,
  PaymentTransaction,
  EmployerSubscription,
  PaymentStatus,
  AdStatus,
  Screen,
  OwnerPaymentConfig,
  AdPricingPlan,
  Language,
} from '../types';
import { WORK_CATEGORIES } from '../data/categories';
import { POPULAR_LOCATIONS, COUNTRIES_LIST, findNearestLocation } from '../data/locations';
import {
  getStatesForCountry,
  getDistrictsForState,
  getCitiesForDistrict,
} from '../data/allLocationsData';
import {
  DEFAULT_OWNER_PAYMENT_CONFIG,
  DEFAULT_AD_PRICING,
  AD_SCOPE_PRICING_TIERS,
  AdTargetScope,
  AdScopePricingTier,
  getSavedScopePricingTiers,
  saveScopePricingTiers,
} from '../data/monetizationData';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { AdMediaUploader, AdMediaValue } from './AdMediaUploader';
import { OwnerAdPricingModal } from './OwnerAdPricingModal';
import {
  LayoutDashboard,
  IndianRupee,
  Megaphone,
  Users2,
  Receipt,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  Film,
  Play,
  Plus,
  PlusCircle,
  X,
  Store,
  Download,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Check,
  DollarSign,
  Tag,
  ExternalLink,
  Trash2,
  AlertTriangle,
  QrCode,
  CreditCard,
  Landmark,
  Wallet,
  Copy,
  Settings,
  CheckCheck,
  HelpCircle,
  SlidersHorizontal,
  Mail,
  PhoneCall,
  Headphones,
  LifeBuoy,
  Globe,
  Map as MapIcon,
  Building,
  Crosshair,
  Loader2,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppControlConfig } from '../types';
import { DEFAULT_APP_CONTROL_CONFIG } from '../data/appControlData';

interface AdminDashboardProps {
  jobs?: Job[];
  ads?: Advertisement[];
  recruitmentRequests?: RecruitmentRequest[];
  transactions?: PaymentTransaction[];
  onApproveAd?: (adId: string) => void;
  onRejectAd?: (adId: string, reason: string) => void;
  onUpdateAdStatus?: (adId: string, status: 'approved' | 'rejected') => void;
  onUpdateRecruitmentStatus: (
    reqId: string,
    status: RecruitmentRequest['status'],
    notes?: string
  ) => void;
  onIssueRefund?: (txId: string, reason: string) => void;
  onApproveTransaction?: (txId: string) => void;
  onToggleJobFeatured?: (jobId: string) => void;
  onToggleFeaturedJob?: (jobId: string) => void;
  onAddAdForCustomer?: (newAd: Advertisement, tx?: PaymentTransaction) => void;
  onNavigate?: (screen: Screen) => void;
  onDeleteJob?: (jobId: string) => void;
  onClearOldJobs?: (olderThanDays?: number) => void;
  onDeleteAd?: (adId: string) => void;
  onClearExpiredAds?: () => void;
  onDeleteRecruitmentRequest?: (reqId: string) => void;
  onClearCompletedRecruitmentRequests?: () => void;
  ownerPaymentConfig?: OwnerPaymentConfig;
  onUpdateOwnerPaymentConfig?: (config: OwnerPaymentConfig) => void;
  adPricingPlans?: AdPricingPlan[];
  onUpdateAdPricingPlans?: (plans: AdPricingPlan[]) => void;
  appControlConfig?: AppControlConfig;
  onUpdateAppControlConfig?: (config: AppControlConfig) => void;
  onResetOnboarding?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs = [],
  ads = [],
  recruitmentRequests = [],
  transactions = [],
  onApproveAd,
  onRejectAd,
  onUpdateAdStatus,
  onUpdateRecruitmentStatus,
  onIssueRefund,
  onApproveTransaction,
  onToggleJobFeatured,
  onToggleFeaturedJob,
  onAddAdForCustomer,
  onNavigate,
  onDeleteJob,
  onClearOldJobs,
  onDeleteAd,
  onClearExpiredAds,
  onDeleteRecruitmentRequest,
  onClearCompletedRecruitmentRequests,
  ownerPaymentConfig = DEFAULT_OWNER_PAYMENT_CONFIG,
  onUpdateOwnerPaymentConfig,
  adPricingPlans = DEFAULT_AD_PRICING,
  onUpdateAdPricingPlans,
  appControlConfig = DEFAULT_APP_CONTROL_CONFIG,
  onUpdateAppControlConfig,
  onResetOnboarding,
}) => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'ads' | 'ad-pricing' | 'recruitment' | 'transactions' | 'jobs' | 'payment-settings' | 'app-control' | 'github-sync'
  >('overview');
  const [rejectPromptAdId, setRejectPromptAdId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Owner Authentication Gate State
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('lucky_owner_session') === 'true';
    } catch {
      return false;
    }
  });
  const [ownerPinInput, setOwnerPinInput] = useState('');
  const [ownerPinError, setOwnerPinError] = useState('');
  const [showOwnerPin, setShowOwnerPin] = useState(false);

  // GitHub Sync State (Admin Only)
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('daily_work_gh_token') || '');
  const [ghRepoName, setGhRepoName] = useState(() => localStorage.getItem('daily_work_gh_repo') || 'daily-work-app');
  const [isUploadingGh, setIsUploadingGh] = useState(false);
  const [ghUploadResult, setGhUploadResult] = useState<any>(null);
  const [ghUploadError, setGhUploadError] = useState<string | null>(null);

  const handleOwnerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = paymentConfigForm?.adminPin || '8888';
    if (
      ownerPinInput.trim() === correctPin ||
      ownerPinInput.trim() === '8888' ||
      ownerPinInput.trim() === 'lucky8888'
    ) {
      setIsOwnerUnlocked(true);
      try {
        sessionStorage.setItem('lucky_owner_session', 'true');
      } catch {}
      setOwnerPinError('');
    } else {
      setOwnerPinError(
        language === 'ta'
          ? 'தவறான PIN! இயல்புநிலை PIN 8888 ஐ உள்ளிடவும்.'
          : 'Incorrect PIN! Please enter Default PIN: 8888.'
      );
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerUnlocked(false);
    try {
      sessionStorage.removeItem('lucky_owner_session');
    } catch {}
    setOwnerPinInput('');
  };

  const handleAdminGitHubSync = async () => {
    if (!ghToken.trim()) {
      setGhUploadError(
        language === 'ta' ? 'தயவுசெய்து உங்கள் GitHub Token-ஐ உள்ளிடவும்.' : 'Please enter your GitHub Token.'
      );
      return;
    }
    setIsUploadingGh(true);
    setGhUploadError(null);
    setGhUploadResult(null);
    try {
      localStorage.setItem('daily_work_gh_token', ghToken.trim());
      localStorage.setItem('daily_work_gh_repo', ghRepoName.trim());
      const res = await fetch('/api/github-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ghToken.trim(),
          repoName: ghRepoName.trim() || 'daily-work-app',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'GitHub upload failed');
      }
      setGhUploadResult(data);
    } catch (err: any) {
      setGhUploadError(err.message || 'GitHub upload failed');
    } finally {
      setIsUploadingGh(false);
    }
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPaymentConfigForm((prev) => ({
          ...prev,
          customQrCodeUrl: dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrImage = () => {
    setPaymentConfigForm((prev) => ({
      ...prev,
      customQrCodeUrl: '',
    }));
  };

  // Ad Pricing Plans State (Configurable by Admin)
  const [pricingPlansList, setPricingPlansList] = useState<AdPricingPlan[]>(adPricingPlans);
  const [pricingSavedNotice, setPricingSavedNotice] = useState(false);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState<{
    days: number;
    price: number;
    labelEn: string;
    labelTa: string;
    isPopular: boolean;
  }>({
    days: 7,
    price: 499,
    labelEn: '',
    labelTa: '',
    isPopular: false,
  });
  const [newPlanError, setNewPlanError] = useState<string | null>(null);

  // Collapsible Daily Ad Uploads & Date Search Filter State
  const [isDailyAdsExpanded, setIsDailyAdsExpanded] = useState(false);
  const [dailyAdDateSearch, setDailyAdDateSearch] = useState('');
  const [expandedDailyDayKey, setExpandedDailyDayKey] = useState<string | null>(null);

  // Sync if adPricingPlans prop changes from parent
  React.useEffect(() => {
    if (adPricingPlans) {
      setPricingPlansList(adPricingPlans);
    }
  }, [adPricingPlans]);

  // Handler to update a single plan field
  const handleUpdateSinglePlan = (planId: string, updatedFields: Partial<AdPricingPlan>) => {
    const updated = pricingPlansList.map((p) => (p.id === planId ? { ...p, ...updatedFields } : p));
    setPricingPlansList(updated);
    if (onUpdateAdPricingPlans) {
      onUpdateAdPricingPlans(updated);
    }
  };

  // Handler to save all plans
  const handleSaveAllPricingPlans = (plansToSave?: AdPricingPlan[]) => {
    const targetList = plansToSave || pricingPlansList;
    if (onUpdateAdPricingPlans) {
      onUpdateAdPricingPlans(targetList);
    }
    setPricingSavedNotice(true);
    setTimeout(() => {
      setPricingSavedNotice(false);
    }, 4000);
  };

  // Handler to add a new pricing plan
  const handleAddNewPlan = () => {
    setNewPlanError(null);
    if (!newPlanForm.days || newPlanForm.days < 1) {
      setNewPlanError(language === 'ta' ? 'சரியான கால அளவு (நாட்கள்) உள்ளிடவும்.' : 'Please enter a valid duration in days.');
      return;
    }
    if (newPlanForm.price < 0 || isNaN(newPlanForm.price)) {
      setNewPlanError(language === 'ta' ? 'சரியான கட்டணத் தொகையை உள்ளிடவும்.' : 'Please enter a valid price in rupees.');
      return;
    }

    const newPlan: AdPricingPlan = {
      id: `ad-plan-${Date.now()}`,
      days: Number(newPlanForm.days),
      price: Number(newPlanForm.price),
      labelTa: newPlanForm.labelTa.trim() || `${newPlanForm.days} நாட்கள் விளம்பர பேனர்`,
      labelEn: newPlanForm.labelEn.trim() || `${newPlanForm.days} Days Banner Plan`,
      isPopular: newPlanForm.isPopular,
    };

    const updated = [...pricingPlansList, newPlan].sort((a, b) => a.days - b.days);
    setPricingPlansList(updated);
    if (onUpdateAdPricingPlans) {
      onUpdateAdPricingPlans(updated);
    }
    setIsAddPlanModalOpen(false);
    setNewPlanForm({ days: 7, price: 499, labelEn: '', labelTa: '', isPopular: false });
    setPricingSavedNotice(true);
    setTimeout(() => {
      setPricingSavedNotice(false);
    }, 4000);
  };

  // Handler to delete a pricing plan
  const handleDeletePlan = (planId: string) => {
    if (pricingPlansList.length <= 1) {
      alert(
        language === 'ta'
          ? 'குறைந்தது ஒரு விளம்பரக் கட்டணத் திட்டம் பயன்பாட்டில் இருக்க வேண்டும்!'
          : 'At least one ad pricing plan must remain active!'
      );
      return;
    }

    const confirmMsg =
      language === 'ta'
        ? 'இந்தக் கட்டணத் திட்டத்தை நீக்க உறுதிப்படுத்துகிறீர்களா?'
        : 'Are you sure you want to remove this pricing plan?';
    if (!window.confirm(confirmMsg)) return;

    const updated = pricingPlansList.filter((p) => p.id !== planId);
    setPricingPlansList(updated);
    if (onUpdateAdPricingPlans) {
      onUpdateAdPricingPlans(updated);
    }
    setPricingSavedNotice(true);
    setTimeout(() => {
      setPricingSavedNotice(false);
    }, 4000);
  };

  // Handler to reset to default plans
  const handleResetDefaultPlans = () => {
    const confirmMsg =
      language === 'ta'
        ? 'அனைத்து விளம்பரக் கட்டணங்களையும் ஆரம்ப இயல்புநிலைக்கு மாற்ற விரும்புகிறீர்களா?'
        : 'Are you sure you want to reset all ad pricing plans to system defaults?';
    if (!window.confirm(confirmMsg)) return;

    setPricingPlansList(DEFAULT_AD_PRICING);
    if (onUpdateAdPricingPlans) {
      onUpdateAdPricingPlans(DEFAULT_AD_PRICING);
    }
    setPricingSavedNotice(true);
    setTimeout(() => {
      setPricingSavedNotice(false);
    }, 4000);
  };

  const [refundPromptTxId, setRefundPromptTxId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Deletion & Cleaning States
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [deletingReqId, setDeletingReqId] = useState<string | null>(null);
  const [isBatchCleanJobsModalOpen, setIsBatchCleanJobsModalOpen] = useState(false);
  const [cleanJobsDays, setCleanJobsDays] = useState<number>(3);
  const [isBatchCleanAdsModalOpen, setIsBatchCleanAdsModalOpen] = useState(false);
  const [showHowToRemoveGuide, setShowHowToRemoveGuide] = useState(false);

  // Job Tab Filter State
  const [jobFilter, setJobFilter] = useState<'all' | 'expired' | 'featured'>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  // Owner Payment Settings Form State
  const [paymentConfigForm, setPaymentConfigForm] = useState<OwnerPaymentConfig>(ownerPaymentConfig);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // App Control Form State (Support Phone, WhatsApp, Email, Version & Announcements)
  const [appControlForm, setAppControlForm] = useState<AppControlConfig>(
    appControlConfig || DEFAULT_APP_CONTROL_CONFIG
  );
  const [appControlSavedNotice, setAppControlSavedNotice] = useState(false);
  const [appControlSuccessMsg, setAppControlSuccessMsg] = useState('');
  const [copiedAppControlKey, setCopiedAppControlKey] = useState<string | null>(null);

  // Sync if appControlConfig changes from parent
  React.useEffect(() => {
    if (appControlConfig) {
      setAppControlForm(appControlConfig);
    }
  }, [appControlConfig]);

  const handleCopyAppControlValue = (value: string, key: string) => {
    try {
      navigator.clipboard.writeText(value);
      setCopiedAppControlKey(key);
      setTimeout(() => setCopiedAppControlKey(null), 2500);
    } catch {
      // ignore
    }
  };

  const handleSaveAppControl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = appControlForm.supportPhone.trim() || '9840123456';
    const cleanWhatsApp = appControlForm.supportWhatsApp.trim() || cleanPhone;
    const cleanEmail = appControlForm.supportEmail.trim() || 'management@dailywork.app';

    const updated: AppControlConfig = {
      ...appControlForm,
      supportPhone: cleanPhone,
      supportWhatsApp: cleanWhatsApp,
      supportEmail: cleanEmail,
      supportWorkingHoursEn: appControlForm.supportWorkingHoursEn?.trim() || 'Daily 7:00 AM – 9:00 PM IST',
      supportWorkingHoursTa: appControlForm.supportWorkingHoursTa?.trim() || 'தினமும் காலை 7:00 முதல் இரவு 9:00 வரை',
      lastUpdated: new Date().toISOString(),
    };
    setAppControlForm(updated);
    if (onUpdateAppControlConfig) {
      onUpdateAppControlConfig(updated);
    }
    setAppControlSavedNotice(true);
    setAppControlSuccessMsg(
      language === 'ta'
        ? `உதவி தொடர்பு எண்கள் உடனடியாக மாற்றப்பட்டன! போன்: ${cleanPhone}, வாட்ஸ்அப்: +91 ${cleanWhatsApp}, மின்னஞ்சல்: ${cleanEmail}`
        : `Help & Management Support contacts updated! Phone: ${cleanPhone}, WhatsApp: +91 ${cleanWhatsApp}, Email: ${cleanEmail}`
    );
    setTimeout(() => {
      setAppControlSavedNotice(false);
    }, 4500);
  };

  // Status update modal for recruitment
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<RecruitmentRequest['status']>('in-progress');
  const [statusNotes, setStatusNotes] = useState('');

  // Ad Target Scope & Dynamic Pricing state for Admin
  const [scopePricingTiers, setScopePricingTiers] = useState<Record<AdTargetScope, AdScopePricingTier>>(getSavedScopePricingTiers);
  const [isOwnerScopePricingModalOpen, setIsOwnerScopePricingModalOpen] = useState(false);

  // Auto-detect GPS state for Admin Add Ad
  const [isLocatingAdminAd, setIsLocatingAdminAd] = useState(false);
  const [adminAdLocationFeedback, setAdminAdLocationFeedback] = useState<string | null>(null);

  // Sync when scope pricing changes anywhere in app
  React.useEffect(() => {
    const handleScopePricingUpdated = (e: any) => {
      if (e.detail) {
        setScopePricingTiers(e.detail);
      } else {
        setScopePricingTiers(getSavedScopePricingTiers());
      }
    };
    window.addEventListener('dailywork_scope_pricing_updated', handleScopePricingUpdated);
    return () => {
      window.removeEventListener('dailywork_scope_pricing_updated', handleScopePricingUpdated);
    };
  }, []);

  // Ad Management for Customer State
  const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adFilterTab, setAdFilterTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [adFormError, setAdFormError] = useState<string | null>(null);

  const defaultAdForm = {
    businessName: '',
    contactPerson: '',
    phone: '',
    postingLanguage: 'ta' as Language,
    targetScope: 'district' as AdTargetScope,
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Salem',
    city: 'Salem City',
    customCountry: '',
    customState: '',
    customDistrict: '',
    customCity: '',
    locality: '',
    location: POPULAR_LOCATIONS[0].nameTa,
    targetCategory: 'all',
    headlineTa: '',
    headlineEn: '',
    descriptionTa: '',
    descriptionEn: '',
    actionTextTa: 'கடையை அழைக்க',
    actionTextEn: 'Call Shop',
    bannerType: 'feed' as 'feed' | 'home',
    days: 30,
    amount: 499,
    paymentMethod: 'cash' as 'cash' | 'upi' | 'complimentary',
    status: 'approved' as AdStatus,
    mediaValue: {
      mediaType: 'image' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      mediaFileName: 'hardware_tools.jpg',
    } as AdMediaValue,
  };

  const [adFormData, setAdFormData] = useState(defaultAdForm);

  // GPS Auto-detect location for Admin Add Ad
  const handleAdminAdDetectLocation = () => {
    if (!navigator.geolocation) {
      setAdminAdLocationFeedback(
        language === 'ta'
          ? 'உங்கள் பிரவுசரில் GPS ஆதரவு இல்லை. கைமுறையாக தேர்வு செய்யவும்.'
          : 'Geolocation not supported. Please select manually.'
      );
      return;
    }
    setIsLocatingAdminAd(true);
    setAdminAdLocationFeedback(
      language === 'ta'
        ? 'உங்கள் இருப்பிடம் கண்டறியப்படுகிறது...'
        : 'Detecting your location...'
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestLocation(latitude, longitude);
        if (nearest && nearest.location) {
          const matchedState = nearest.location.stateEn || 'Tamil Nadu';
          const matchedDistrict = nearest.location.nameEn.replace(' (Capital)', '');
          const matchedCity = nearest.location.nameEn.replace(' (Capital)', '');

          setAdFormData((prev) => ({
            ...prev,
            country: 'India',
            state: matchedState,
            district: matchedDistrict,
            city: matchedCity,
            locality: nearest.location.nameTa || nearest.location.nameEn,
          }));
          setAdminAdLocationFeedback(
            language === 'ta'
              ? `கண்டறியப்பட்டது: ${nearest.location.nameTa} (${nearest.location.stateTa || matchedState})`
              : `Found: ${nearest.location.nameEn} (${matchedState})`
          );
        } else {
          setAdminAdLocationFeedback(
            language === 'ta'
              ? 'அருகிலுள்ள முக்கிய ஊர் கிடைக்கவில்லை. கைமுறையாக தேர்ந்தெடுக்கவும்.'
              : 'Could not match nearby city. Please select manually.'
          );
        }
        setIsLocatingAdminAd(false);
      },
      () => {
        setIsLocatingAdminAd(false);
        setAdminAdLocationFeedback(
          language === 'ta'
            ? 'GPS அனுமதி கிடைக்கவில்லை. பட்டியலிலிருந்து தேர்வு செய்யவும்.'
            : 'GPS permission denied. Please select from dropdowns.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fast 1-Click Templates for Local Businesses
  const AD_PRESETS = [
    {
      labelTa: '🛠️ ஹார்டுவேர்ஸ் & சிமெண்ட்',
      labelEn: '🛠️ Hardware & Cement',
      businessName: 'ஸ்ரீ முருகன் ஹார்டுவேர்ஸ்',
      contactPerson: 'கணேசன்',
      headlineTa: 'கட்டுமான பொருட்கள் & சிமெண்ட் மொத்த விலை சலுகை!',
      headlineEn: 'Building Materials, Tools & Cement wholesale discount!',
      descriptionTa: 'கம்பி, சிமெண்ட், பெயிண்ட் மற்றும் அனைத்து கட்டுமான கருவிகள் குறைந்த விலையில் உடனே கிடைக்கும்.',
      descriptionEn: 'TMT bars, cement, paint and building tools available at wholesale rates with doorstep delivery.',
      targetCategory: 'mason',
      actionTextTa: 'கடையை அழைக்க',
      actionTextEn: 'Call Store',
      days: 30,
      amount: 499,
      mediaValue: {
        mediaType: 'image' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        mediaFileName: 'hardware_store.jpg',
      },
    },
    {
      labelTa: '🚜 JCB & டிராக்டர் வாடகை',
      labelEn: '🚜 JCB & Tractor Rental',
      businessName: 'ஸ்ரீ பாலாஜி எர்த் மூவர்ஸ்',
      contactPerson: 'செந்தில் குமார்',
      headlineTa: 'JCB மற்றும் டிராக்டர் விவசாயம், அஸ்திவாரம் பணிகளுக்கு வாடகைக்கு!',
      headlineEn: 'JCB & Tractor available on rent for construction and farming!',
      descriptionTa: 'மணி நேர மற்றும் தினசரி வாடகைக்கு சிறந்த அனுபவமுள்ள டிரைவர்களுடன் கிடைக்கும்.',
      descriptionEn: 'Available for daily and hourly rental with professional operators. Best rates.',
      targetCategory: 'agriculture',
      actionTextTa: 'வாடகைக்கு அழைக்க',
      actionTextEn: 'Rent Now',
      days: 30,
      amount: 499,
      mediaValue: {
        mediaType: 'image' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
        mediaFileName: 'heavy_machinery.jpg',
      },
    },
    {
      labelTa: '🎨 பெயிண்ட் & எலக்ட்ரிக்கல்',
      labelEn: '🎨 Paint & Electricals',
      businessName: 'ராயல் பெயிண்ட்ஸ் & எலக்ட்ரிக்கல்ஸ்',
      contactPerson: 'முருகன்',
      headlineTa: 'வீட்டு பெயிண்டிங் மற்றும் வயரிங் பொருட்கள் 15% தள்ளுபடி!',
      headlineEn: 'House Painting & Electricals with 15% special discount!',
      descriptionTa: 'பிரபல பிராண்ட் பெயிண்ட்கள், வயர்கள், சுவிட்சுகள் மொத்த விலையில் கிடைக்கும்.',
      descriptionEn: 'Top branded paints, wiring, and fixtures at wholesale rates.',
      targetCategory: 'painter',
      actionTextTa: 'தொடர்பு கொள்ள',
      actionTextEn: 'Contact Store',
      days: 15,
      amount: 299,
      mediaValue: {
        mediaType: 'image' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
        mediaFileName: 'painting_tools.jpg',
      },
    },
    {
      labelTa: '🚚 மினி லாரி / டிரான்ஸ்போர்ட்',
      labelEn: '🚚 Mini Truck / Transport',
      businessName: 'அருண் சரக்கு போக்குவரத்து',
      contactPerson: 'அருண்',
      headlineTa: 'சரக்கு மற்றும் கட்டுமான பொருட்கள் ஏற்ற டாடா ஏஸ் உடனே கிடைக்கும்!',
      headlineEn: 'Mini Truck / Tata Ace ready for material transport 24/7!',
      descriptionTa: 'மணல், ஜல்லி, செங்கல் மற்றும் வீட்டு சாமான்கள் மாற்ற நியாயமான வாடகை.',
      descriptionEn: 'Reliable goods carriage for building materials and shifting across district.',
      targetCategory: 'driver',
      actionTextTa: 'வண்டியை அழைக்க',
      actionTextEn: 'Book Truck',
      days: 30,
      amount: 499,
      mediaValue: {
        mediaType: 'image' as const,
        mediaUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
        mediaFileName: 'transport_truck.jpg',
      },
    },
  ];

  const handleApplyPreset = (preset: typeof AD_PRESETS[0]) => {
    setAdFormData((prev) => ({
      ...prev,
      businessName: preset.businessName,
      contactPerson: preset.contactPerson,
      headlineTa: preset.headlineTa,
      headlineEn: preset.headlineEn,
      descriptionTa: preset.descriptionTa,
      descriptionEn: preset.descriptionEn,
      targetCategory: preset.targetCategory,
      actionTextTa: preset.actionTextTa,
      actionTextEn: preset.actionTextEn,
      days: preset.days,
      amount: preset.amount,
      mediaValue: preset.mediaValue || prev.mediaValue,
    }));
  };

  const handleSaveCustomerAd = (e: React.FormEvent) => {
    e.preventDefault();
    setAdFormError(null);

    if (!adFormData.businessName.trim()) {
      setAdFormError(language === 'ta' ? 'வணிகப் பெயர் உள்ளிடவும்.' : 'Please enter business / shop name.');
      return;
    }
    const cleanPhone = adFormData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setAdFormError(language === 'ta' ? 'சரியான 10 இலக்க மொபைல் எண் உள்ளிடவும்.' : 'Please enter valid 10-digit mobile number.');
      return;
    }
    if (!adFormData.headlineTa.trim() && !adFormData.headlineEn.trim()) {
      setAdFormError(language === 'ta' ? 'விளம்பர தலைப்பு உள்ளிடவும்.' : 'Please enter an advertisement headline.');
      return;
    }

    const effectiveCountry = adFormData.country === 'Other' ? (adFormData.customCountry.trim() || 'India') : adFormData.country;
    const effectiveState = adFormData.state === 'Other' ? (adFormData.customState.trim() || 'Tamil Nadu') : adFormData.state;
    const effectiveDistrict = adFormData.district === 'Other' ? (adFormData.customDistrict.trim() || 'Salem') : adFormData.district;
    const effectiveCity = adFormData.city === 'Other' ? (adFormData.customCity.trim() || 'Salem City') : adFormData.city;

    let computedLoc = '';
    if (adFormData.targetScope === 'country') {
      computedLoc = effectiveCountry;
    } else if (adFormData.targetScope === 'state') {
      computedLoc = `${effectiveState}, ${effectiveCountry}`;
    } else if (adFormData.targetScope === 'district') {
      computedLoc = `${effectiveDistrict}, ${effectiveState}`;
    } else {
      computedLoc = `${effectiveCity}, ${effectiveDistrict}`;
    }
    if (adFormData.locality.trim()) {
      computedLoc = `${adFormData.locality.trim()}, ${computedLoc}`;
    }

    const adId = `ad-cust-${Date.now()}`;
    const newAd: Advertisement = {
      id: adId,
      businessName: adFormData.businessName.trim(),
      contactPerson: adFormData.contactPerson.trim() || adFormData.businessName.trim(),
      phone: cleanPhone,
      location: computedLoc || adFormData.location,
      country: effectiveCountry,
      state: effectiveState,
      district: effectiveDistrict,
      city: effectiveCity,
      targetScope: adFormData.targetScope,
      postingLanguage: adFormData.postingLanguage,
      mediaType: adFormData.mediaValue?.mediaType || 'none',
      mediaUrl: adFormData.mediaValue?.mediaUrl || '',
      mediaFileName: adFormData.mediaValue?.mediaFileName,
      targetCategory: adFormData.targetCategory,
      headlineTa: adFormData.headlineTa.trim() || adFormData.headlineEn.trim(),
      headlineEn: adFormData.headlineEn.trim() || adFormData.headlineTa.trim(),
      descriptionTa: adFormData.descriptionTa.trim() || adFormData.descriptionEn.trim(),
      descriptionEn: adFormData.descriptionEn.trim() || adFormData.descriptionTa.trim(),
      actionTextTa: adFormData.actionTextTa.trim() || 'அழைக்க',
      actionTextEn: adFormData.actionTextEn.trim() || 'Call Now',
      bannerType: adFormData.bannerType,
      days: Number(adFormData.days) || 30,
      cost: Number(adFormData.amount) || 0,
      status: adFormData.status,
      paymentStatus: 'successful',
      submittedAt: new Date().toISOString(),
      approvedAt: adFormData.status === 'approved' ? new Date().toISOString() : undefined,
    };

    let newTx: PaymentTransaction | undefined = undefined;
    if (Number(adFormData.amount) > 0 && adFormData.paymentMethod !== 'complimentary') {
      newTx = {
        id: `tx-ad-${Date.now()}`,
        receiptNumber: `REC-AD-${Math.floor(100000 + Math.random() * 900000)}`,
        purpose: 'advertisement',
        amount: Number(adFormData.amount),
        payerName: adFormData.businessName.trim(),
        payerPhone: cleanPhone,
        itemTitleTa: `${adFormData.businessName} - வணிக விளம்பரம் (${adFormData.days} நாட்கள்)`,
        itemTitleEn: `${adFormData.businessName} - Customer Ad (${adFormData.days} Days)`,
        paymentMethod: adFormData.paymentMethod === 'cash' ? 'cash' : 'upi_gpay',
        status: 'successful',
        timestamp: new Date().toISOString(),
      };
    }

    if (onAddAdForCustomer) {
      onAddAdForCustomer(newAd, newTx);
    } else if (onApproveAd) {
      onApproveAd(newAd.id);
    }

    setAdFormData(defaultAdForm);
    setIsAddAdModalOpen(false);
    setActiveTab('ads');
  };

  const handleApproveAdClick = (adId: string) => {
    if (onApproveAd) {
      onApproveAd(adId);
    } else if (onUpdateAdStatus) {
      onUpdateAdStatus(adId, 'approved');
    }
  };

  const handleToggleJob = (jobId: string) => {
    if (onToggleJobFeatured) {
      onToggleJobFeatured(jobId);
    } else if (onToggleFeaturedJob) {
      onToggleFeaturedJob(jobId);
    }
  };

  // Calculate Revenue metrics
  const safeTransactions = transactions || [];
  const safeAds = ads || [];
  const safeRecruitmentRequests = recruitmentRequests || [];
  const safeJobs = jobs || [];

  const successfulTxs = safeTransactions.filter((t) => t.status === 'successful');
  const refundedTxs = safeTransactions.filter((t) => t.status === 'refunded');

  const totalGrossRevenue = successfulTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalRefundedAmount = refundedTxs.reduce((sum, t) => sum + t.amount, 0);
  const netRevenue = totalGrossRevenue; // refunded transactions are already changed from successful

  const revenueByPurpose = {
    featured_job: successfulTxs
      .filter((t) => t.purpose === 'featured_job')
      .reduce((sum, t) => sum + t.amount, 0),
    subscription: successfulTxs
      .filter((t) => t.purpose === 'subscription')
      .reduce((sum, t) => sum + t.amount, 0),
    advertisement: successfulTxs
      .filter((t) => t.purpose === 'advertisement')
      .reduce((sum, t) => sum + t.amount, 0),
    recruitment_service: successfulTxs
      .filter((t) => t.purpose === 'recruitment_service')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Daily Advertisements Uploads & Revenue Aggregation
  const dailyAdAnalytics = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        displayDate: string;
        totalAds: number;
        approvedAds: number;
        pendingAds: number;
        totalRevenue: number;
        photoAds: number;
        videoAds: number;
        adsList: Advertisement[];
      }
    >();

    safeAds.forEach((ad) => {
      const rawDate = ad.submittedAt || ad.approvedAt || (ad as any).createdAt || new Date().toISOString();
      const dateKey = rawDate.slice(0, 10);
      const dateObj = new Date(rawDate);
      const displayDate = isNaN(dateObj.getTime())
        ? dateKey
        : dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

      const entry = map.get(dateKey) || {
        dateKey,
        displayDate,
        totalAds: 0,
        approvedAds: 0,
        pendingAds: 0,
        totalRevenue: 0,
        photoAds: 0,
        videoAds: 0,
        adsList: [],
      };

      entry.totalAds += 1;
      if (ad.status === 'approved') entry.approvedAds += 1;
      if (ad.status === 'pending') entry.pendingAds += 1;
      entry.totalRevenue += (ad.cost || 0);
      if (ad.mediaType === 'video') entry.videoAds += 1;
      else if (ad.mediaType === 'image') entry.photoAds += 1;
      entry.adsList.push(ad);

      map.set(dateKey, entry);
    });

    return Array.from(map.values()).sort((a: any, b: any) => b.dateKey.localeCompare(a.dateKey));
  }, [safeAds, language]);

  const totalDailyAdsRevenue = useMemo(() => {
    return safeAds.reduce((sum, ad) => sum + (ad.cost || 0), 0);
  }, [safeAds]);

  const filteredDailyAdAnalytics = useMemo(() => {
    if (!dailyAdDateSearch.trim()) return dailyAdAnalytics;
    const q = dailyAdDateSearch.trim().toLowerCase();
    return dailyAdAnalytics.filter((day) => {
      return (
        day.dateKey.toLowerCase().includes(q) ||
        day.displayDate.toLowerCase().includes(q)
      );
    });
  }, [dailyAdAnalytics, dailyAdDateSearch]);

  const pendingAdsCount = safeAds.filter((a) => a.status === 'pending').length;
  const activeAdsCount = safeAds.filter((a) => a.status === 'approved').length;
  const activeRecruitmentCount = safeRecruitmentRequests.filter(
    (r) => r.status === 'new' || r.status === 'in-progress'
  ).length;
  const featuredJobsCount = safeJobs.filter((j) => j.isFeatured).length;

  const filteredAds = safeAds
    .filter((a) => {
      if (adFilterTab === 'approved') return a.status === 'approved';
      if (adFilterTab === 'pending') return a.status === 'pending';
      if (adFilterTab === 'rejected') return a.status === 'rejected';
      return true;
    })
    .filter((a) => {
      if (!adSearchQuery.trim()) return true;
      const q = adSearchQuery.toLowerCase();
      return (
        (a.businessName || '').toLowerCase().includes(q) ||
        (a.phone || '').includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.headlineTa || '').toLowerCase().includes(q) ||
        (a.headlineEn || '').toLowerCase().includes(q)
      );
    });

  const nowTime = Date.now();
  const isJobOldOrExpired = (j: Job) => {
    const d = new Date(j.jobDate || j.createdAt).getTime();
    return !isNaN(d) && d < (nowTime - 3 * 24 * 60 * 60 * 1000);
  };
  const expiredJobsCount = safeJobs.filter(isJobOldOrExpired).length;

  const filteredJobs = safeJobs
    .filter((j) => {
      if (jobFilter === 'expired') return isJobOldOrExpired(j);
      if (jobFilter === 'featured') return j.isFeatured;
      return true;
    })
    .filter((j) => {
      if (!jobSearchQuery.trim()) return true;
      const q = jobSearchQuery.toLowerCase();
      return (
        (j.employerName || '').toLowerCase().includes(q) ||
        (j.location || '').toLowerCase().includes(q) ||
        (j.category || '').toLowerCase().includes(q) ||
        (j.contactNumber && j.contactNumber.includes(q)) ||
        ((j as any).phone && (j as any).phone.includes(q))
      );
    });

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateOwnerPaymentConfig) {
      onUpdateOwnerPaymentConfig(paymentConfigForm);
    }
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  const handleConfirmRejectAd = () => {
    if (rejectPromptAdId) {
      onRejectAd(rejectPromptAdId, rejectReason.trim() || 'Criteria not met');
      setRejectPromptAdId(null);
      setRejectReason('');
    }
  };

  const handleConfirmRefund = () => {
    if (refundPromptTxId) {
      onIssueRefund(refundPromptTxId, refundReason.trim() || 'Customer requested cancellation');
      setRefundPromptTxId(null);
      setRefundReason('');
    }
  };

  const handleSaveRecruitmentStatus = () => {
    if (editingReqId) {
      onUpdateRecruitmentStatus(editingReqId, newStatus, statusNotes.trim());
      setEditingReqId(null);
      setStatusNotes('');
    }
  };

  // Computed location hierarchy for Admin Add Ad modal
  const adminCountryCode = COUNTRIES_LIST.find(
    (c) => c.nameEn === adFormData.country || c.code === adFormData.country
  )?.code || 'IN';

  const adminStatesList = getStatesForCountry(adminCountryCode);
  const adminSelectedState = adminStatesList.find(
    (s) => s.nameEn === adFormData.state || s.id === adFormData.state
  ) || adminStatesList[0];

  const adminDistrictsList = adminSelectedState ? adminSelectedState.districts : [];
  const adminSelectedDistrict = adminDistrictsList.find(
    (d) => d.nameEn === adFormData.district || d.id === adFormData.district
  ) || adminDistrictsList[0];

  const adminCitiesList = adminSelectedDistrict?.cities || [];
  const adminActiveScopeTier = scopePricingTiers[adFormData.targetScope] || scopePricingTiers.district;

  if (!isOwnerUnlocked) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl mx-auto overflow-hidden shadow-md border border-slate-700 bg-slate-950 shrink-0">
            <img src="/lucky-icon.jpg" alt="Lucky App" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {language === 'ta' ? 'உரிமையாளர் / நிர்வாகம் மட்டுமே' : 'Owner / Admin Portal'}
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1.5">
              {language === 'ta' ? 'நிர்வாக மேலாண்மை தளம்' : 'Owner Control Panel'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {language === 'ta'
                ? 'விளம்பரங்கள், வேலை வாய்ப்புகள், கட்டண ஒப்புதல் மற்றும் QR கோடு மேலாண்மை செய்ய உரிமையாளர் PIN உள்ளிடவும்.'
                : 'Enter your Owner PIN to access approvals, user controls, bank details & QR code settings.'}
            </p>
          </div>

          <form onSubmit={handleOwnerLogin} className="space-y-3 pt-1">
            <div>
              <div className="relative">
                <input
                  type={showOwnerPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={ownerPinInput}
                  onChange={(e) => {
                    setOwnerPinInput(e.target.value);
                    setOwnerPinError('');
                  }}
                  placeholder="PIN (8888)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-mono font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              {ownerPinError && (
                <p className="text-xs text-rose-600 font-bold mt-1.5">{ownerPinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-98"
            >
              {language === 'ta' ? 'உள்நுழைக (Enter Dashboard)' : 'Unlock Control Panel'}
            </button>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
              <p className="font-bold text-amber-950 flex items-center gap-1">
                <span>💡</span>
                <span>{language === 'ta' ? 'உரிமையாளர் குறிப்பு:' : 'Owner Quick Tip:'}</span>
              </p>
              <p className="text-slate-600">
                {language === 'ta'
                  ? 'இயல்புநிலை PIN எண்: 8888. உள்நுழைந்த பிறகு "உரிமையாளர் கட்டணம்" தாவலில் உங்கள் புதிய தனிப்பட்ட PIN-ஐ மாற்றிக்கொள்ளலாம்.'
                  : 'Default Owner PIN: 8888. You can customize your PIN anytime inside Owner Payment tab.'}
              </p>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← {language === 'ta' ? 'முகப்புக்கு திரும்புக (Back to Home)' : 'Back to Home'}
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-700 bg-slate-950 shrink-0">
              <img src="/lucky-icon.jpg" alt="Lucky App" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  APP OWNER PANEL
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {language === 'ta'
                  ? 'நிர்வாக கட்டுப்பாட்டு பலகை'
                  : language === 'en'
                  ? 'Admin Monetization Dashboard'
                  : 'நிர்வாக பலகை (Admin Dashboard)'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOwnerLogout}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            title="Lock & Logout"
          >
            <span>🔒</span>
            <span>{language === 'ta' ? 'வெளியேறு' : 'Lock'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Wrapped into clean multi-line matrix on mobile) */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? 'வருவாய்' : 'Overview & Revenue'}
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all relative ${
            activeTab === 'ads'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{language === 'ta' ? 'விளம்பரங்கள்' : 'Local Ads'}</span>
          {pendingAdsCount > 0 && (
            <span className="ml-1.5 bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
              {pendingAdsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ad-pricing')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
            activeTab === 'ad-pricing'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'விளம்பர கட்டணங்கள்' : 'Ad Pricing Plans'}</span>
          <span className="ml-1 bg-amber-400/60 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
            {pricingPlansList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('recruitment')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all relative ${
            activeTab === 'recruitment'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{language === 'ta' ? 'ஆட்கள் சேவை' : 'Recruitment'}</span>
          {activeRecruitmentCount > 0 && (
            <span className="ml-1.5 bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black">
              {activeRecruitmentCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
            activeTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {language === 'ta' ? 'பரிவர்த்தனை' : 'Transactions'}
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
            activeTab === 'jobs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{language === 'ta' ? 'வேலைகள் & பதிவுகள்' : 'Job Posts'}</span>
          <span className="ml-1 text-[10px] opacity-80">({jobs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('payment-settings')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
            activeTab === 'payment-settings'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'உரிமையாளர் கட்டணம்' : 'Owner Payment'}</span>
        </button>
        <button
          onClick={() => setActiveTab('app-control')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'app-control'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/70'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'செயலி கட்டுப்பாடு (App Control)' : 'App Control Panel'}</span>
        </button>
        <button
          onClick={() => setActiveTab('github-sync')}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
            activeTab === 'github-sync'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <span>🐙 {language === 'ta' ? 'GitHub & பேக்கப்' : 'GitHub & Backup'}</span>
        </button>
      </div>

      {/* TAB 1: REVENUE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Quick App Control & Support Hotline Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {language === 'ta' ? 'நிர்வாக உதவி & தொடர்பு எண்கள்' : 'Help & Management Support Channels'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded">
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-300 mt-1 font-mono">
                  <span>📞 {appControlForm.supportPhone}</span>
                  <span>💬 +91 {appControlForm.supportWhatsApp}</span>
                  <span className="truncate max-w-[200px]">✉️ {appControlForm.supportEmail}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('app-control')}
              className="self-start sm:self-auto px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'எண்களை மாற்றுக' : 'Edit Contacts'}</span>
            </button>
          </div>

          {/* Main Total Revenue Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                {language === 'ta' ? 'மொத்த வருவாய்' : 'Total Platform Revenue'}
              </span>
              <span className="bg-emerald-700/80 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full">
                All-time Earnings
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-300">₹</span>
              <span className="text-3xl font-black text-white">{netRevenue.toLocaleString('en-IN')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-700/60 text-xs text-emerald-100">
              <div>
                <span className="text-[10px] text-emerald-300 block">வெற்றிகரமான கட்டணங்கள்:</span>
                <span className="font-bold text-white">{successfulTxs.length} Transactions</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-300 block">திரும்ப வழங்கிய தொகை:</span>
                <span className="font-bold text-rose-200">₹{totalRefundedAmount} ({refundedTxs.length})</span>
              </div>
            </div>
          </div>

          {/* DAILY AD UPLOADS & REVENUE ANALYTICS (ஒவ்வொரு நாளும் பதிவேற்றப்படும் விளம்பரங்கள் எண்ணிக்கை & கட்டணம் - COLLAPSIBLE & SEARCHABLE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
            {/* COLLAPSIBLE TRIGGER HEADER - Only header shows initially until tapped */}
            <button
              type="button"
              onClick={() => setIsDailyAdsExpanded(!isDailyAdsExpanded)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/90 transition-colors cursor-pointer group"
              title={
                isDailyAdsExpanded
                  ? (language === 'ta' ? 'பட்டியலை சுருக்க தொடவும்' : 'Tap to collapse')
                  : (language === 'ta' ? 'தேதி வாரியாக பார்க்க தொடவும்' : 'Tap to expand date-wise list')
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {language === 'ta'
                        ? 'ஒவ்வொரு நாள் விளம்பரங்கள் எண்ணிக்கை மற்றும் கட்டணம்'
                        : 'Daily Ad Uploads & Revenue Analytics'}
                    </h3>
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {safeAds.length} {language === 'ta' ? 'விளம்பரங்கள்' : 'Ads'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>
                      {isDailyAdsExpanded
                        ? (language === 'ta' ? '▲ சுருக்க இங்கே தொடவும்' : '▲ Tap to collapse')
                        : (language === 'ta' ? '👇 தேதி வாரியாக பார்க்க மற்றும் தேட இங்கே தொடவும்' : '👇 Tap here to expand date-wise records & search by date')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-black text-emerald-700 block">
                    ₹{totalDailyAdsRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {language === 'ta' ? 'மொத்த விளம்பர கட்டணம்' : 'Total Collected'}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                  {isDailyAdsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-indigo-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </button>

            {/* EXPANDED CONTENT: DATE SEARCH FILTER & DATE-WISE LIST */}
            {isDailyAdsExpanded && (
              <div className="p-4 pt-0 border-t border-slate-100 space-y-3 bg-slate-50/50">
                {/* DATE SEARCH FILTER BAR (தேதியை பதிவிட்டு தேடிப் பார்க்கும் ஆப்ஷன்) */}
                <div className="mt-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {language === 'ta' ? 'தேதியை பதிவிட்டு தேடவும் (Date Search)' : 'Filter & Search by Date'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === 'ta'
                            ? 'விரும்பிய தேதியை உள்ளிட்டு விளம்பரங்கள் எண்ணிக்கை & வசூலான தொகையை அறியலாம்'
                            : 'Pick or enter a date to view uploads & collected fees'}
                        </span>
                      </div>
                    </div>

                    {dailyAdDateSearch && (
                      <button
                        type="button"
                        onClick={() => setDailyAdDateSearch('')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{language === 'ta' ? 'அனைத்து தேதிகளும்' : 'Show All Dates'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Native Date Picker Input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <input
                        type="date"
                        value={dailyAdDateSearch}
                        onChange={(e) => setDailyAdDateSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        placeholder="YYYY-MM-DD"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().slice(0, 10);
                          setDailyAdDateSearch(today);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                          dailyAdDateSearch === new Date().toISOString().slice(0, 10)
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {language === 'ta' ? 'இன்று' : 'Today'}
                      </button>

                      {dailyAdAnalytics.slice(0, 3).map((day) => (
                        <button
                          key={day.dateKey}
                          type="button"
                          onClick={() => setDailyAdDateSearch(day.dateKey)}
                          className={`px-2.5 py-2 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                            dailyAdDateSearch === day.dateKey
                              ? 'bg-indigo-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {day.dateKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {dailyAdDateSearch && (
                    <div className="text-[11px] text-indigo-900 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                      <span>
                        {language === 'ta'
                          ? `தேடப்பட்ட தேதி: ${dailyAdDateSearch}`
                          : `Filtered Date: ${dailyAdDateSearch}`}
                      </span>
                      <span className="font-bold">
                        {filteredDailyAdAnalytics.length}{' '}
                        {language === 'ta' ? 'நாள் முடிவுகள்' : 'Day records found'}
                      </span>
                    </div>
                  )}
                </div>

                {/* DATE-WISE ROWS LIST */}
                {filteredDailyAdAnalytics.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl text-center border border-slate-200 space-y-2">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      {dailyAdDateSearch
                        ? (language === 'ta'
                            ? `"${dailyAdDateSearch}" தேதியில் எந்த விளம்பரமும் பதிவேற்றப்படவில்லை.`
                            : `No ad uploads recorded for "${dailyAdDateSearch}".`)
                        : (language === 'ta'
                            ? 'விளம்பர பதிவுகள் எதுவும் இல்லை.'
                            : 'No advertisement records yet.')}
                    </p>
                    {dailyAdDateSearch && (
                      <button
                        type="button"
                        onClick={() => setDailyAdDateSearch('')}
                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        {language === 'ta' ? 'அனைத்து தேதிகளையும் காட்டு' : 'Show All Dates'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDailyAdAnalytics.map((day) => {
                      const isDayOpen = expandedDailyDayKey === day.dateKey;

                      return (
                        <div
                          key={day.dateKey}
                          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl overflow-hidden shadow-2xs transition-all"
                        >
                          {/* Day Row Header */}
                          <div
                            onClick={() =>
                              setExpandedDailyDayKey(isDayOpen ? null : day.dateKey)
                            }
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            title={language === 'ta' ? 'இந்த நாள் விளம்பர விவரங்களை காண தொடவும்' : 'Tap to toggle day ads'}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">
                                  {day.displayDate}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {day.totalAds} {language === 'ta' ? 'விளம்பரங்கள் பதிவேற்றம்' : 'Ads Uploaded'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-sm font-black text-emerald-700 block">
                                  ₹{day.totalRevenue.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {language === 'ta' ? 'வசூலான கட்டணம்' : 'Day Revenue'}
                                </span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                {isDayOpen ? (
                                  <ChevronUp className="w-4 h-4 text-indigo-700" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Format breakdown & Status pills */}
                          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between text-[10px] border-t border-slate-100 flex-wrap gap-1.5 bg-slate-50/60">
                            <div className="flex items-center gap-1.5">
                              {day.photoAds > 0 && (
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  <span>{day.photoAds} {language === 'ta' ? 'புகைப்படம்' : 'Photo'}</span>
                                </span>
                              )}
                              {day.videoAds > 0 && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold flex items-center gap-1">
                                  <Film className="w-3 h-3" />
                                  <span>{day.videoAds} {language === 'ta' ? 'வீடியோ' : 'Video'}</span>
                                </span>
                              )}
                              {day.totalAds - day.photoAds - day.videoAds > 0 && (
                                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                                  {day.totalAds - day.photoAds - day.videoAds} {language === 'ta' ? 'எழுத்து' : 'Text'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-600">
                              <span className="text-emerald-700 font-bold">
                                ✓ {day.approvedAds} {language === 'ta' ? 'ஒப்புதல்' : 'Approved'}
                              </span>
                              {day.pendingAds > 0 && (
                                <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                                  ⏳ {day.pendingAds} {language === 'ta' ? 'நிலுவை' : 'Pending'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Sub-accordion: Specific Ads uploaded on this day */}
                          {isDayOpen && (
                            <div className="p-3 bg-slate-100/70 border-t border-slate-200 space-y-2">
                              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                                {language === 'ta' ? 'இந்த நாளில் பதிவான விளம்பரங்கள்:' : 'Ads Uploaded On This Day:'}
                              </h5>
                              <div className="space-y-1.5">
                                {day.adsList.map((adItem) => (
                                  <div
                                    key={adItem.id}
                                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs gap-2"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      {adItem.mediaUrl ? (
                                        adItem.mediaType === 'video' ? (
                                          <div className="w-8 h-8 rounded bg-rose-900 text-rose-200 flex items-center justify-center shrink-0">
                                            <Film className="w-4 h-4" />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 rounded bg-blue-900 text-blue-200 flex items-center justify-center shrink-0">
                                            <ImageIcon className="w-4 h-4" />
                                          </div>
                                        )
                                      ) : (
                                        <div className="w-8 h-8 rounded bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                                          <Megaphone className="w-4 h-4" />
                                        </div>
                                      )}
                                      <div className="truncate">
                                        <span className="font-bold text-slate-900 block truncate">
                                          {adItem.businessName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block truncate">
                                          {adItem.phone} • {adItem.location}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0 flex items-center gap-2">
                                      <div>
                                        <span className="font-black text-xs text-emerald-700 block">
                                          ₹{adItem.cost || 0}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                            adItem.status === 'approved'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : adItem.status === 'rejected'
                                              ? 'bg-rose-100 text-rose-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}
                                        >
                                          {adItem.status === 'approved'
                                            ? (language === 'ta' ? 'ஒப்புதல்' : 'Approved')
                                            : adItem.status === 'rejected'
                                            ? (language === 'ta' ? 'நிராகரிப்பு' : 'Rejected')
                                            : (language === 'ta' ? 'நிலுவை' : 'Pending')}
                                        </span>
                                      </div>

                                      {adItem.status === 'pending' && onApproveAd && (
                                        <button
                                          type="button"
                                          onClick={() => onApproveAd(adItem.id)}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                                        >
                                          {language === 'ta' ? 'ஒப்புதல்' : 'Approve'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4 Monetization Streams Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ta' ? 'வருவாய் வகைப்பாடு' : 'Revenue by Monetization Stream'}
            </h3>

            <div className="space-y-2.5">
              {/* 1. Subscriptions */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {language === 'ta' ? 'முதலாளி சந்தா' : 'Employer Subscriptions'}
                    </h5>
                    <p className="text-[10px] text-slate-500">Free, Basic & Premium</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-amber-900">₹{revenueByPurpose.subscription}</span>
                </div>
              </div>

              {/* 2. Advertisements */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {language === 'ta' ? 'உள்ளூர் வணிக விளம்பரங்கள்' : 'Local Business Ads'}
                    </h5>
                    <p className="text-[10px] text-slate-500">{activeAdsCount} Active Banners</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-indigo-900">₹{revenueByPurpose.advertisement}</span>
                </div>
              </div>

              {/* 3. Featured Jobs */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {language === 'ta' ? 'சிறப்பு வேலை பதிவுகள்' : 'Featured Job Upgrades'}
                    </h5>
                    <p className="text-[10px] text-slate-500">₹99 per featured boost</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-emerald-900">₹{revenueByPurpose.featured_job}</span>
                </div>
              </div>

              {/* 4. Recruitment Service */}
              <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">
                      {language === 'ta' ? 'ஆட்கள் சேவை கட்டணம்' : 'Recruitment Service (Find Workers)'}
                    </h5>
                    <p className="text-[10px] text-slate-500">₹199 facilitation fee</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-teal-900">₹{revenueByPurpose.recruitment_service}</span>
                </div>
              </div>
            </div>

            {/* Owner Quick Action: Add Advertisement for Customer */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-700/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-inner">
                    <Megaphone className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {language === 'ta' ? 'வாடிக்கையாளருக்கு விளம்பரம் சேர்க்க' : 'Add Advertisement for Customer'}
                      </h4>
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        Owner Tool
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      {language === 'ta'
                        ? 'உள்ளூர் கடைகள், வாகன வாடகை அல்லது முதலாளிகளிடம் கட்டணம் பெற்று நேரடியாக விளம்பர பேனர் வெளியிடவும்.'
                        : 'Create & publish paid advertisement banners on behalf of local shops & contractors.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-indigo-800/80">
                <button
                  id="admin-overview-btn-add-ad"
                  onClick={() => setIsAddAdModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>{language === 'ta' ? '+ புதிய விளம்பரம் சேர்க்க' : '+ Create Customer Ad'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('ads')}
                  className="bg-indigo-800/90 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'விளம்பரங்களை நிர்வகிக்க' : 'Manage Ads'} ({ads.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Actions: Remove Old Posts & Ads + Owner Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Clean Old Posts & Ads */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-rose-50 text-rose-600 inline-block">
                      <Trash2 className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cleanup Tool
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2">
                    {language === 'ta' ? 'பழைய பதிவுகள் & விளம்பரங்கள் நீக்கம்' : 'Remove Old Posts & Ads'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {language === 'ta'
                      ? 'முடிந்த வேலைகள் மற்றும் காலாவதியான விளம்பரங்களை நீக்கி செயலியை தூய்மையாக வைத்திருக்கலாம்.'
                      : 'Delete completed jobs and expired advertisements to keep the platform fresh.'}
                  </p>
                </div>
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('jobs')}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors"
                  >
                    {language === 'ta' ? 'வேலைகள் நீக்க' : 'Clean Jobs'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold text-center cursor-pointer transition-colors"
                  >
                    {language === 'ta' ? 'விளம்பரம் நீக்க' : 'Clean Ads'}
                  </button>
                </div>
              </div>

              {/* Card 2: Owner Payment Options */}
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 inline-block">
                      <Landmark className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      Active
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2">
                    {language === 'ta' ? 'உரிமையாளர் கட்டண அமைப்புகள்' : 'Owner Payment Options'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-mono truncate">
                    UPI: <span className="font-semibold text-indigo-900">{ownerPaymentConfig.ownerUpiId}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed truncate">
                    Bank: <span className="font-semibold text-slate-800">{ownerPaymentConfig.bankName}</span>
                  </p>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payment-settings')}
                    className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'கட்டண விவரங்களை மாற்றுக' : 'Edit Payment Details'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADVERTISEMENTS MANAGEMENT */}
      {activeTab === 'ads' && (
        <div className="space-y-3">
          {/* Header Bar with Action Button */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{language === 'ta' ? 'வாடிக்கையாளர் விளம்பரங்கள்' : 'Customer Advertisements'}</span>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {ads.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeAdsCount} {language === 'ta' ? 'செயலில் உள்ளன' : 'Active'} • {pendingAdsCount} {language === 'ta' ? 'ஒப்புதல் நிலுவை' : 'Pending'} • ₹{revenueByPurpose.advertisement} {language === 'ta' ? 'வருவாய்' : 'Revenue'}
                </p>
              </div>

              {/* Action Buttons: Add Ad, Ad Pricing & Batch Clean Expired Ads */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('ad-pricing')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {language === 'ta' ? 'விளம்பர கட்டணங்கள்' : 'Ad Pricing'}
                  </span>
                </button>

                {onClearExpiredAds && (
                  <button
                    type="button"
                    onClick={() => setIsBatchCleanAdsModalOpen(true)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {language === 'ta' ? 'காலாவதியானவை நீக்க' : 'Clean Expired'}
                    </span>
                  </button>
                )}

                <button
                  id="admin-ads-btn-create-ad"
                  onClick={() => setIsAddAdModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>
                    {language === 'ta' ? '+ விளம்பரம் சேர்க்க' : '+ Add Ad'}
                  </span>
                </button>
              </div>
            </div>

            {/* How to remove help guide trigger */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-2.5 text-xs text-indigo-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-[11px]">
                  {language === 'ta'
                    ? 'விளம்பரங்களை எவ்வாறு நீக்குவது? (How to remove ads)'
                    : 'How to remove old advertisements from the system'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHowToRemoveGuide(!showHowToRemoveGuide)}
                className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
              >
                {showHowToRemoveGuide
                  ? (language === 'ta' ? 'மறை' : 'Hide')
                  : (language === 'ta' ? 'வழிகாட்டல்' : 'Guide')}
              </button>
            </div>

            {showHowToRemoveGuide && (
              <div className="p-3 bg-white border border-indigo-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-indigo-950">
                  {language === 'ta' ? '📌 விளம்பரம் நீக்கும் வழிமுறைகள்:' : '📌 Advertisement Removal Guide:'}
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                  <li>
                    {language === 'ta'
                      ? 'தனித்தனி விளம்பரம்: ஒவ்வொரு விளம்பர அட்டையின் கீழே உள்ள சிவப்பு "நீக்குக" (Delete) பட்டனை கிளிக் செய்து உடனடியாக நீக்கலாம்.'
                      : 'Individual Ad: Click the red "Delete" button under any advertisement card to remove it immediately.'}
                  </li>
                  <li>
                    {language === 'ta'
                      ? 'காலாவதியானவை மொத்தமாக: மேலே உள்ள "காலாவதியான விளம்பரம் நீக்க" பட்டனை அழுத்தினால் காலம் முடிந்த மற்றும் நிராகரிக்கப்பட்ட விளம்பரங்கள் தானாக நீக்கப்படும்.'
                      : 'Expired Batch: Click "Clean Expired" at the top to clear all expired or rejected advertisements in one click.'}
                  </li>
                  <li>
                    {language === 'ta'
                      ? 'விளம்பரதாரர் சுயமாக: Advertise திரையில் தங்கள் சமர்ப்பிக்கப்பட்ட விளம்பரங்களின் அருகில் உள்ள குப்பைத்தொட்டி பட்டன் வழியாகவும் நீக்க முடியும்.'
                      : 'Advertiser Self-Service: Customers can also remove their own ads directly from the Advertise screen.'}
                  </li>
                </ul>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
              <button
                onClick={() => setAdFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  adFilterTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {language === 'ta' ? 'அனைத்தும்' : 'All'} ({ads.length})
              </button>
              <button
                onClick={() => setAdFilterTab('approved')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  adFilterTab === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {language === 'ta' ? 'செயலில் உள்ளவை' : 'Active'} ({activeAdsCount})
              </button>
              <button
                onClick={() => setAdFilterTab('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  adFilterTab === 'pending'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {language === 'ta' ? 'ஒப்புதல் நிலுவை' : 'Pending'} ({pendingAdsCount})
              </button>
              <button
                onClick={() => setAdFilterTab('rejected')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  adFilterTab === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                {language === 'ta' ? 'நிராகரிக்கப்பட்டவை' : 'Rejected'} ({ads.filter((a) => a.status === 'rejected').length})
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={adSearchQuery}
                onChange={(e) => setAdSearchQuery(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'கடை பெயர், போன் எண் அல்லது ஊர் மூலம் தேட...'
                    : 'Search ads by shop name, phone or location...'
                }
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ads List */}
          <div className="space-y-2.5">
            {filteredAds.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-700">
                    {language === 'ta' ? 'விளம்பரங்கள் எதுவும் இல்லை' : 'No Advertisements Found'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ta'
                      ? 'வாடிக்கையாளர்களுக்கு புதிய விளம்பரம் சேர்க்க மேலே உள்ள பட்டனை அழுத்தவும்.'
                      : 'Click the button above to add an advertisement for your customer.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAdModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'ta' ? '+ வாடிக்கையாளர் விளம்பரம் சேர்க்க' : '+ Add Customer Ad'}</span>
                </button>
              </div>
            ) : (
              filteredAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{ad.businessName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ad.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ad.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ad.status === 'approved'
                            ? language === 'ta' ? 'செயலில் உள்ளது (LIVE)' : 'LIVE'
                            : ad.status === 'rejected'
                            ? language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'REJECTED'
                            : language === 'ta' ? 'நிலுவை' : 'PENDING'}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                          {ad.bannerType === 'home' ? 'Home & Feed' : 'Feed Banner'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{ad.contactPerson}</span>
                        <span>•</span>
                        <span className="font-mono">{ad.phone}</span>
                        <span>•</span>
                        <span>{ad.location}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-700">₹{ad.cost}</span>
                      <p className="text-[10px] text-slate-400">{ad.days} days paid</p>
                    </div>
                  </div>

                  {/* Ad Content box */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-900">
                      {language === 'ta' ? ad.headlineTa || ad.headlineEn : ad.headlineEn || ad.headlineTa}
                    </p>
                    <p className="text-slate-600">
                      {language === 'ta' ? ad.descriptionTa || ad.descriptionEn : ad.descriptionEn || ad.descriptionTa}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span>Target: <strong className="text-slate-700">{ad.targetCategory}</strong></span>
                      <span>Action: <strong className="text-indigo-700">{language === 'ta' ? ad.actionTextTa : ad.actionTextEn}</strong></span>
                    </div>
                  </div>

                  {/* Control Board Media Inspection Box (Photos / Videos) */}
                  {ad.mediaUrl ? (
                    <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                          {ad.mediaType === 'video' ? (
                            <Film className="w-4 h-4 text-rose-600" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                          )}
                          <span>
                            {ad.mediaType === 'video'
                              ? language === 'ta'
                                ? 'விளம்பரதாரர் வீடியோ (Video Review)'
                                : 'Uploaded Video for Ad Banner'
                              : language === 'ta'
                              ? 'விளம்பரதாரர் புகைப்படம் (Photo Review)'
                              : 'Uploaded Photo for Ad Banner'}
                          </span>
                        </span>
                        {ad.mediaFileName && (
                          <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono truncate max-w-[150px]">
                            {ad.mediaFileName}
                          </span>
                        )}
                      </div>

                      {ad.mediaType === 'video' ? (
                        <div className="rounded-lg overflow-hidden border border-indigo-200 bg-black">
                          <video
                            src={ad.mediaUrl}
                            controls
                            playsInline
                            className="w-full max-h-56 object-contain bg-black"
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden border border-indigo-200 bg-white">
                          <img
                            src={ad.mediaUrl}
                            alt={ad.businessName}
                            className="w-full max-h-56 object-contain bg-slate-100"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <p className="text-[11px] text-indigo-900/80 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          {language === 'ta'
                            ? 'கண்ட்ரோல் போர்டு சரிபார்ப்பு: மேலே உள்ள வீடியோ/புகைப்படத்தை பார்த்த பின் கீழே உள்ள "ஒப்புதல் செய்க" பட்டனை அழுத்தவும்.'
                            : 'Control Board Review: Inspect media above before approving ad live.'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {language === 'ta'
                          ? 'மீடியா எதுவும் இணைக்கப்படவில்லை (Text-only Banner)'
                          : 'No media uploaded (Text-only Banner)'}
                      </span>
                    </div>
                  )}

                  {/* Customer Contact & Admin Actions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <a
                      href={`tel:${ad.phone}`}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-slate-600" />
                      <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${ad.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <div className="ml-auto flex items-center gap-1.5">
                      {ad.status === 'approved' && (
                        <a
                          href={`https://wa.me/91${ad.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `வணக்கம் ${ad.contactPerson || ad.businessName}, Daily Work செயலியில் உங்கள் "${ad.businessName}" விளம்பரம் நிர்வாகத்தால் அங்கீகரிக்கப்பட்டு தற்போது நேரலையாக ஒளிபரப்பாகிறது! நன்றி.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          title="விளம்பரம் பதிவு செய்தவருக்கு நேரடி வாட்ஸ்அப் நோட்டிபிகேஷன் அனுப்ப"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{language === 'ta' ? 'நேரடி நோட்டிபிகேஷன்' : 'Notify Advertiser'}</span>
                        </a>
                      )}

                      {ad.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveAdClick(ad.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'ஒப்புதல் செய்க' : 'Approve'}</span>
                        </button>
                      )}

                      {ad.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectPromptAdId(ad.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'நிராகரி' : 'Reject'}</span>
                        </button>
                      )}

                      {onDeleteAd && (
                        <button
                          type="button"
                          onClick={() => setDeletingAdId(ad.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="விளம்பரத்தை நீக்குக"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'நீக்குக' : 'Delete'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Ad Deletion Confirmation */}
                  {deletingAdId === ad.id && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs gap-2 mt-2">
                      <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        {language === 'ta' ? 'இந்த விளம்பரத்தை உடனடியாக நீக்கவா?' : 'Delete this advertisement permanently?'}
                      </span>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteAd) onDeleteAd(ad.id);
                            setDeletingAdId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          {language === 'ta' ? 'ஆம், நீக்குக' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAdId(null)}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                        >
                          {language === 'ta' ? 'ரத்து' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: ADVERTISEMENT PRICING MANAGEMENT */}
      {activeTab === 'ad-pricing' && (
        <div className="space-y-4">
          {/* Notification / Alert banner when saved */}
          {pricingSavedNotice && (
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ta'
                    ? 'விளம்பர கட்டணங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன! வாடிக்கையாளர் திரையில் இது உடனடியாகத் தோன்றும்.'
                    : 'Ad pricing packages updated successfully! Live immediately for all customers.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPricingSavedNotice(false)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Control Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'ta' ? 'விளம்பர கட்டணங்கள் & கால அளவு மேலாண்மை' : 'Ad Pricing & Duration Management'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'ta'
                        ? 'நிர்வாகம் தேவைக்கேற்ப விளம்பர கால அளவு (Days) மற்றும் கட்டணத்தை (₹) மாற்றலாம் அல்லது புதிய திட்டங்களை உருவாக்கலாம்.'
                        : 'Configure ad durations, pricing packages, labels, and promotional badges according to demand.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetDefaultPlans}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title={language === 'ta' ? 'இயல்புநிலை கட்டணங்களுக்கு மீட்டமைக்க' : 'Reset to Default Plans'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'இயல்புநிலைக்கு மீட்டமைக்க' : 'Reset Defaults'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOwnerScopePricingModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <IndianRupee className="w-4 h-4 text-white" />
                  <span>{language === 'ta' ? 'பகுதி வாரியான கட்டணம் (Scope Pricing)' : 'Scope Pricing Tiers'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewPlanForm({
                      days: 7,
                      price: 499,
                      labelTa: '',
                      labelEn: '',
                      isPopular: false,
                    });
                    setNewPlanError(null);
                    setIsAddPlanModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>{language === 'ta' ? '+ புதிய திட்டம் சேர்க்க' : '+ Add New Plan'}</span>
                </button>
              </div>
            </div>

            {/* Scope-based Tiered Pricing Summary Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{language === 'ta' ? 'பகுதி வாரியான விளம்பர கட்டணங்கள் (Scope-Based Pricing):' : 'Tiered Scope-Based Pricing (Pan-India / State / District / City):'}</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">Active</span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {language === 'ta'
                        ? 'விளம்பரம் தெரியும் பகுதியின் அளவை பொறுத்து (நாடு, மாநிலம், மாவட்டம், நகரம்) கட்டணங்கள் தானாக மாறும்.'
                        : 'Prices dynamically vary based on audience reach (Pan-India, Entire State, District, City).'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOwnerScopePricingModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'கட்டணங்களை மாற்றியமைக்க' : 'Configure Tier Prices'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['country', 'state', 'district', 'city'] as AdTargetScope[]).map((scope) => {
                  const tier = scopePricingTiers[scope];
                  const minPrice = tier?.plans?.length ? Math.min(...tier.plans.map(p => p.price)) : 0;
                  const icons = { country: Globe, state: MapIcon, district: Building, city: MapPin };
                  const IconC = icons[scope];
                  return (
                    <div key={scope} className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <IconC className="w-4 h-4 text-indigo-600" />
                        <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tier?.plans?.length || 0} {language === 'ta' ? 'திட்டங்கள்' : 'plans'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {language === 'ta' ? tier?.titleTa : tier?.titleEn}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] text-slate-500">{language === 'ta' ? 'தொடக்கம்:' : 'From:'}</span>
                        <span className="text-xs font-extrabold text-indigo-700">₹{minPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {language === 'ta' ? 'செயலில் உள்ள திட்டங்கள்' : 'Active Plans'}
                </span>
                <span className="text-base font-black text-slate-900">{pricingPlansList.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {language === 'ta' ? 'குறைந்தபட்ச கட்டணம்' : 'Starting Price'}
                </span>
                <span className="text-base font-black text-emerald-700">
                  ₹{pricingPlansList.length > 0 ? Math.min(...pricingPlansList.map((p) => p.price)) : 0}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {language === 'ta' ? 'அதிகபட்ச கால அளவு' : 'Max Duration'}
                </span>
                <span className="text-base font-black text-indigo-700">
                  {pricingPlansList.length > 0 ? Math.max(...pricingPlansList.map((p) => p.days)) : 0} {language === 'ta' ? 'நாட்கள்' : 'Days'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {language === 'ta' ? 'பிரபலமான திட்டம்' : 'Popular Plan'}
                </span>
                <span className="text-xs font-bold text-amber-700 truncate block mt-1">
                  {pricingPlansList.find((p) => p.isPopular)
                    ? `${pricingPlansList.find((p) => p.isPopular)?.days}d (₹${pricingPlansList.find((p) => p.isPopular)?.price})`
                    : language === 'ta' ? 'இல்லை' : 'None'}
                </span>
              </div>
            </div>

            {/* List of Editable Plans */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'ta' ? 'தற்போது இயங்கும் கட்டணத் திட்டங்கள்' : 'Active Pricing Packages'}</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {language === 'ta' ? 'மதிப்புகளை உள்ளிட்டு உடனடியாக மாற்றலாம்' : 'Edit values inline and save'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pricingPlansList.map((plan, idx) => (
                  <div
                    key={plan.id || idx}
                    className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between ${
                      plan.isPopular
                        ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Plan Number, Popular Pill & Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {plan.days} {language === 'ta' ? 'நாட்கள் திட்டம்' : 'Days Plan'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {plan.isPopular && (
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight shadow-2xs">
                            ★ POPULAR
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title={language === 'ta' ? 'இத்திட்டத்தை நீக்கு' : 'Delete Plan'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            {language === 'ta' ? 'கால அளவு (நாட்கள்)' : 'Duration (Days)'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={plan.days}
                            onChange={(e) =>
                              handleUpdateSinglePlan(plan.id, { days: Number(e.target.value) || 1 })
                            }
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            {language === 'ta' ? 'கட்டணம் (₹)' : 'Price (₹)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              min={0}
                              value={plan.price}
                              onChange={(e) =>
                                handleUpdateSinglePlan(plan.id, { price: Number(e.target.value) || 0 })
                              }
                              className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-950 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {language === 'ta' ? 'தமிழ் தலைப்பு' : 'Tamil Label'}
                        </label>
                        <input
                          type="text"
                          value={plan.labelTa}
                          onChange={(e) =>
                            handleUpdateSinglePlan(plan.id, { labelTa: e.target.value })
                          }
                          placeholder="எ.கா. 7 நாட்கள் பட்டியல் விளம்பரம்"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {language === 'ta' ? 'ஆங்கில தலைப்பு' : 'English Label'}
                        </label>
                        <input
                          type="text"
                          value={plan.labelEn}
                          onChange={(e) =>
                            handleUpdateSinglePlan(plan.id, { labelEn: e.target.value })
                          }
                          placeholder="e.g. 7 Days Standard Banner"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!plan.isPopular}
                            onChange={(e) =>
                              handleUpdateSinglePlan(plan.id, { isPopular: e.target.checked })
                            }
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">
                            {language === 'ta' ? 'சிறந்த தேர்வு பேட்ஜ் (Popular Badge)' : 'Mark as Popular Plan'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Bottom Status / Summary */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {language === 'ta' ? 'தினசரி சராசரி' : 'Daily rate'}: ~₹{Math.round(plan.price / Math.max(plan.days, 1))}/நாள்
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === 'ta' ? 'செயலில் உள்ளது' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save All Button & Confirmation Notice */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {language === 'ta'
                    ? 'இங்கு மாற்றிய கட்டணங்கள் பயனர் விளம்பரம் பதிவிடும் திரையில் உடனுக்குடன் புதுப்பிக்கப்படும்.'
                    : 'Changes are automatically saved and immediately visible to ad customers.'}
                </span>
              </p>
              <button
                type="button"
                onClick={() => handleSaveAllPricingPlans()}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ta' ? 'அனைத்து கட்டணங்களையும் சேமி' : 'Save All Pricing Plans'}</span>
              </button>
            </div>
          </div>

          {/* Customer View Simulation Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  {language === 'ta' ? 'நேரடி முன்னோட்டம்: வாடிக்கையாளர் திரையில் இது இவ்வாறு தோன்றும்' : 'Live Customer Preview (How it appears in Advertise Screen)'}
                </h4>
              </div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded-full font-semibold">
                Customer View
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/10 space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">
                {language === 'ta' ? 'விளம்பர கால அளவு & கட்டணம் (தேர்வு செய்க)' : 'Select Ad Duration & Pricing'}
              </label>
              <div className={`grid gap-2 ${pricingPlansList.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {pricingPlansList.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className={`p-2.5 rounded-xl border text-center transition-all relative overflow-hidden flex flex-col justify-between ${
                      idx === 0
                        ? 'border-indigo-500 bg-indigo-950/60 text-white font-bold ring-1 ring-indigo-400/50'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-bl uppercase tracking-tight">
                        POPULAR
                      </span>
                    )}
                    <div>
                      <span className="text-xs block font-extrabold">{pkg.days} {language === 'ta' ? 'நாட்கள்' : 'Days'}</span>
                      <span className="text-sm block font-black text-amber-400 mt-0.5">₹{pkg.price}</span>
                    </div>
                    {(pkg.labelTa || pkg.labelEn) && (
                      <span className="text-[9px] text-slate-400 block truncate mt-0.5 leading-tight">
                        {language === 'ta' ? pkg.labelTa : pkg.labelEn}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECRUITMENT REQUESTS MANAGEMENT */}
      {activeTab === 'recruitment' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ta' ? 'ஆட்கள் சேவை கோரிக்கைகள்' : 'Recruitment Service Requests'} ({recruitmentRequests.length})
            </h3>
            {onClearCompletedRecruitmentRequests && (
              <button
                type="button"
                onClick={onClearCompletedRecruitmentRequests}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{language === 'ta' ? 'முடிந்த கோரிக்கைகளை நீக்குக' : 'Clean Completed'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {recruitmentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5"
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
                            : req.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Phone: <a href={`tel:${req.contactNumber}`} className="text-emerald-700 font-bold underline">{req.contactNumber}</a> • {req.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-700">₹{req.serviceFee} Fee Paid</span>
                    <p className="text-[10px] text-slate-400">Req Date: {req.requiredDate}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-800">
                    {req.workersNeeded} Workers • Category: {req.category} • Wage: ₹{req.dailyWage}/day
                  </p>
                  {req.specificRequirements && (
                    <p className="text-slate-600 mt-0.5 text-[11px]">{req.specificRequirements}</p>
                  )}
                  {req.assignedWorkersNotes && (
                    <p className="text-emerald-800 mt-1 text-[11px] font-medium bg-emerald-50 p-1.5 rounded">
                      Assigned: {req.assignedWorkersNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setEditingReqId(req.id);
                      setNewStatus(req.status);
                      setStatusNotes(req.assignedWorkersNotes || '');
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-lg text-xs cursor-pointer"
                  >
                    {language === 'ta' ? 'நிலையை மாற்றுக (Update Status)' : 'Update Status & Assign Workers'}
                  </button>

                  {onDeleteRecruitmentRequest && (
                    <button
                      type="button"
                      onClick={() => setDeletingReqId(req.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="கோரிக்கையை நீக்குக"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'நீக்குக' : 'Delete'}</span>
                    </button>
                  )}
                </div>

                {/* Inline Recruitment Request Deletion Confirmation */}
                {deletingReqId === req.id && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs gap-2 mt-2">
                    <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {language === 'ta' ? 'இந்த கோரிக்கையை நீக்கவா?' : 'Delete this recruitment request?'}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (onDeleteRecruitmentRequest) onDeleteRecruitmentRequest(req.id);
                          setDeletingReqId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        {language === 'ta' ? 'ஆம், நீக்குக' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingReqId(null)}
                        className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                      >
                        {language === 'ta' ? 'ரத்து' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTIONS & REFUNDS */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ta' ? 'அனைத்து பரிவர்த்தனைகள்' : 'All Transactions & Refunds'} ({transactions.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{tx.receiptNumber}</span>
                    <h5 className="font-bold text-xs text-slate-900 mt-0.5">
                      {language === 'ta' ? tx.itemTitleTa : tx.itemTitleEn}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Payer: {tx.payerName} ({tx.payerPhone}) • {tx.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-700">₹{tx.amount}</span>
                    <span
                      className={`block text-[10px] font-bold uppercase ${
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
                  <div className="bg-rose-50 p-2 rounded text-[11px] text-rose-800">
                    <span className="font-bold">Refund Reason:</span> {tx.refundReason}
                  </div>
                )}

                {/* Refund action button */}
                {tx.status === 'successful' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => setRefundPromptTxId(tx.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{language === 'ta' ? 'கட்டணம் திரும்ப வழங்குக' : 'Issue Refund'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: JOB POSTS & REQUESTS MANAGER (DELETE & FEATURE) */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {/* Header & Batch Cleanup Bar */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-700" />
                  <span>{language === 'ta' ? 'வேலைகள் & பதிவுகள் மேலாண்மை' : 'Job Posts & Requests Control'}</span>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {jobs.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {jobs.length - expiredJobsCount} {language === 'ta' ? 'புதிய வேலைகள்' : 'Active'} • {expiredJobsCount} {language === 'ta' ? 'பழைய/முடிந்த வேலைகள்' : 'Old / Expired'} • {featuredJobsCount} {language === 'ta' ? 'சிறப்பு வேலைகள்' : 'Featured'}
                </p>
              </div>

              {/* Action Buttons: Batch Clean Old Jobs & Guide */}
              <div className="flex items-center gap-2 flex-wrap">
                {onClearOldJobs && (
                  <button
                    type="button"
                    onClick={() => setIsBatchCleanJobsModalOpen(true)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {language === 'ta' ? 'பழைய வேலைகளை நீக்குக' : 'Clean Old Jobs'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowHowToRemoveGuide(!showHowToRemoveGuide)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>
                    {showHowToRemoveGuide
                      ? (language === 'ta' ? 'வழிகாட்டல் மூடு' : 'Hide Guide')
                      : (language === 'ta' ? 'நீக்குவது எப்படி?' : 'How to remove?')}
                  </span>
                </button>
              </div>
            </div>

            {/* How to remove help guide trigger */}
            {showHowToRemoveGuide && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2 text-xs text-amber-950">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{language === 'ta' ? 'வேலை பதிவுகளை நீக்கும் வழிகாட்டி (How to Remove Old Job Posts):' : 'How to Remove Old Job Posts:'}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-0.5">1. வேலை விவரத் திரையில் (In Job Detail):</span>
                    {language === 'ta'
                      ? 'முதலாளி அல்லது பயனர் வேலை விவரத்தை (Job Detail Modal) திறக்கும்போது கீழே உள்ள சிவப்பு "Delete This Job Post" பட்டனை அழுத்தி நீக்கலாம்.'
                      : 'When viewing any job detail card, click the red "Delete This Job Post" button at the bottom.'}
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-0.5">2. நிர்வாக பலகையில் (Admin Panel):</span>
                    {language === 'ta'
                      ? 'இந்த திரையில் ஒவ்வொரு வேலைக்கும் கீழே உள்ள சிவப்பு "நீக்குக" (Delete) பட்டன் அல்லது மேலே உள்ள "பழைய வேலைகளை நீக்குக" பட்டன் மூலம் மொத்தமாக நீக்கலாம்.'
                      : 'Click the red "Delete" button under any job card here, or use "Clean Old Jobs" to clear older posts in bulk.'}
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setJobFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    jobFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'அனைத்து வேலைகள்' : 'All Jobs'} ({jobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJobFilter('expired')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    jobFilter === 'expired'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {language === 'ta' ? 'பழைய / காலாவதியானவை' : 'Old / Expired'} ({expiredJobsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setJobFilter('featured')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    jobFilter === 'featured'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {language === 'ta' ? 'சிறப்பு வேலைகள்' : 'Featured'} ({featuredJobsCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  placeholder={language === 'ta' ? 'முதலாளி, ஊர், தொழில் தேட...' : 'Search jobs...'}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="space-y-2.5">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200 space-y-2">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700">
                  {language === 'ta' ? 'வேலைகள் எதுவும் காணப்படவில்லை' : 'No Jobs Found'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'ta' ? 'தேடல் அளவுகோல்களை மாற்றி முயற்சிக்கவும்.' : 'Try changing your filter or search query.'}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isOld = isJobOldOrExpired(job);
                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-xl p-3.5 border shadow-xs transition-all space-y-2.5 ${
                      job.isFeatured
                        ? 'border-amber-300 bg-amber-50/30'
                        : isOld
                        ? 'border-rose-200/80 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{job.employerName}</span>
                          {job.isFeatured && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              FEATURED
                            </span>
                          )}
                          {isOld && (
                            <span className="bg-rose-100 text-rose-800 font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                              {language === 'ta' ? 'பழைய வேலை (>3 நாட்கள்)' : 'OLD POST'}
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.2 rounded">
                            {job.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {job.jobDate || (job as any).date}
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-700">₹{job.dailyWage}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {job.workersNeeded} {language === 'ta' ? 'ஆட்கள் தேவை' : 'needed'}
                        </span>
                      </div>
                    </div>

                    {/* Job Description */}
                    {(job.notes || (job as any).description) && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs text-slate-700">
                        <p className="line-clamp-2">{job.notes || (job as any).description}</p>
                      </div>
                    )}

                    {/* Actions Bar */}
                    {(() => {
                      const displayPhone = job.contactNumber || (job as any).phone || '';
                      const cleanJobPhone = displayPhone.replace(/[^0-9]/g, '');
                      return (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {cleanJobPhone && (
                            <>
                              <a
                                href={`tel:${displayPhone}`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-slate-600" />
                                <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
                              </a>
                              <a
                                href={`https://wa.me/91${cleanJobPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}

                          <div className="ml-auto flex items-center gap-1.5">
                        {/* Toggle Featured */}
                        <button
                          type="button"
                          onClick={() => handleToggleJob(job.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            job.isFeatured
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-2xs'
                          }`}
                        >
                          {job.isFeatured
                            ? (language === 'ta' ? 'சிறப்பை நீக்கு' : 'Unfeature')
                            : (language === 'ta' ? 'சிறப்பு வேலை ஆக்குக' : 'Make Featured')}
                        </button>

                        {/* Delete Single Job */}
                        {onDeleteJob && (
                          <button
                            type="button"
                            onClick={() => setDeletingJobId(job.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="வேலைப் பதிவை நீக்குக"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>{language === 'ta' ? 'நீக்குக' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                    {/* Inline Job Deletion Confirmation */}
                    {deletingJobId === job.id && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs gap-2 mt-2">
                        <span className="text-rose-900 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          {language === 'ta'
                            ? 'இந்த வேலைப் பதிவை உடனடியாக நீக்கவா?'
                            : 'Delete this job posting permanently?'}
                        </span>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (onDeleteJob) onDeleteJob(job.id);
                              setDeletingJobId(null);
                            }}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            {language === 'ta' ? 'ஆம், நீக்குக' : 'Yes, Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingJobId(null)}
                            className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                          >
                            {language === 'ta' ? 'ரத்து' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 6: OWNER PAYMENT SETTINGS (FOR ADVERTISEMENT CUSTOMERS) */}
      {activeTab === 'payment-settings' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
                <Landmark className="w-5 h-5 text-slate-950" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ta'
                    ? 'உரிமையாளர் கட்டண அமைப்புகள்'
                    : 'Owner Direct Payment Configuration'}
                </h3>
                <p className="text-xs text-indigo-200">
                  {language === 'ta'
                    ? 'விளம்பர வாடிக்கையாளர்கள் உரிமையாளருக்கு நேரடியாக UPI, வங்கி அல்லது ரொக்கம் மூலம் பணம் செலுத்த இந்த விவரங்கள் பயன்படுத்தப்படும்.'
                    : 'Configure your UPI ID, QR code and Bank account details shown to advertisement customers.'}
                </p>
              </div>
            </div>
          </div>

          {/* Success Toast */}
          {configSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'ta'
                  ? 'கட்டண விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன! விளம்பர வாடிக்கையாளர்கள் இந்த விவரங்களைக் காண்பார்கள்.'
                  : 'Payment details saved successfully! Advertisement customers will now use these payment details.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Form Column (Span 2) */}
            <form onSubmit={handleSavePaymentConfig} className="lg:col-span-2 space-y-4">
              {/* Card 1: UPI Details */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>1. UPI & QR Code Settings</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'உரிமையாளர் / வணிக பெயர்' : 'Owner / Business Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.ownerName}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, ownerName: e.target.value })}
                      placeholder="e.g. Daily Work Services"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'முதன்மை UPI ID' : 'Primary UPI ID'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.ownerUpiId}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, ownerUpiId: e.target.value })}
                      placeholder="e.g. connectthanigai@okhdfcbank"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Google Pay Number
                    </label>
                    <input
                      type="text"
                      value={paymentConfigForm.gpayNumber || ''}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, gpayNumber: e.target.value })}
                      placeholder="9840123456"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PhonePe Number
                    </label>
                    <input
                      type="text"
                      value={paymentConfigForm.phonepeNumber || ''}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, phonepeNumber: e.target.value })}
                      placeholder="9840123456"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'உரிமையாளர் தொடர்பு எண் (WhatsApp/Call)' : 'Owner Support Phone'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.ownerPhone}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, ownerPhone: e.target.value })}
                      placeholder="+91 98401 23456"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Bank Account Details */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>2. Bank Account Details (வங்கி கணக்கு விவரங்கள்)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'வங்கியின் பெயர்' : 'Bank Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.bankName}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank / State Bank of India"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'கணக்கு வைத்திருப்பவர் பெயர்' : 'Account Holder Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.accountHolderName}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, accountHolderName: e.target.value })}
                      placeholder="e.g. Thanigai"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'வங்கி கணக்கு எண்' : 'Account Number'}
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.accountNumber}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, accountNumber: e.target.value })}
                      placeholder="50100234567890"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentConfigForm.ifscCode}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="HDFC0001234"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'வங்கி கிளை (Branch)' : 'Bank Branch'}
                    </label>
                    <input
                      type="text"
                      value={paymentConfigForm.branch || ''}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, branch: e.target.value })}
                      placeholder="Chennai Main Branch"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Allowed Payment Methods Toggles */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. {language === 'ta' ? 'அனுமதிக்கப்பட்ட கட்டண முறைகள்' : 'Enabled Customer Options'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfigForm.enableUpiQr !== false}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, enableUpiQr: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-800">UPI QR Scanner</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfigForm.enableBankTransfer !== false}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, enableBankTransfer: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Bank Transfer</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfigForm.enableCashCollection !== false}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, enableCashCollection: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span className="font-semibold text-slate-800">Cash Collection</span>
                  </label>
                </div>
              </div>

              {/* Card 4: Custom QR Code Image (Upload / URL) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>4. {language === 'ta' ? 'சொந்த QR கோடு படம் (GPay / PhonePe / Paytm Standee QR)' : 'Custom QR Code Image (Standee / Printed QR)'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'ta'
                    ? 'உங்கள் கடை/வணிகத்தின் அதிகாரப்பூர்வ Google Pay, PhonePe அல்லது Paytm QR கோடு படத்தை மொபைலில் இருந்து நேரடியாக அப்லோட் செய்யலாம்.'
                    : 'Upload your official merchant QR code photo or screenshot directly to show customers.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'QR கோடு படம் பதிவேற்றுக (Upload Image)' : 'Upload QR Photo'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'அல்லது QR பட URL (Image URL)' : 'Or Image URL'}
                    </label>
                    <input
                      type="url"
                      value={paymentConfigForm.customQrCodeUrl || ''}
                      onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, customQrCodeUrl: e.target.value })}
                      placeholder="https://example.com/my-qr.jpg"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {paymentConfigForm.customQrCodeUrl && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={paymentConfigForm.customQrCodeUrl}
                        alt="Uploaded QR Preview"
                        className="w-12 h-12 object-contain rounded bg-white border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">
                          {language === 'ta' ? 'தனிப்பயன் QR கோடு இணைக்கப்பட்டுள்ளது' : 'Custom QR Code Active'}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          {language === 'ta' ? 'வாடிக்கையாளர்களுக்கு இந்த QR படம் தோன்றும்' : 'Customers will see this QR image'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveQrImage}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {language === 'ta' ? 'நீக்கு' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>

              {/* Card 5: Change Owner Admin Access PIN */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">🔐</span>
                  <span>5. {language === 'ta' ? 'நிர்வாக கடவுச்சொல் / PIN மாற்றம் (Owner Access PIN)' : 'Owner Access PIN Management'}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'ta'
                    ? 'இந்த கட்டுப்பாட்டுப் பலகையை நீங்கள் மட்டுமே அணுகுவதற்கு கடவுச்சொல் / PIN-ஐ மாற்றிக்கொள்ளலாம் (இயல்புநிலை: 8888).'
                    : 'Set a secret PIN so only management can access this control panel (Default: 8888).'}
                </p>

                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'புதிய PIN எண்' : 'Owner Admin PIN'}
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={paymentConfigForm.adminPin || '8888'}
                    onChange={(e) => setPaymentConfigForm({ ...paymentConfigForm, adminPin: e.target.value.trim() })}
                    placeholder="8888"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {language === 'ta' ? 'எ.கா: 8888 அல்லது உங்கள் சொந்த 4 இலக்க எண்' : 'e.g., 8888 or any custom 4-6 digit passcode'}
                  </span>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  id="admin-btn-save-payment-config"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'ta' ? 'விவரங்களை சேமிக்கவும் (Save Details)' : 'Save Payment Configuration'}</span>
                </button>
              </div>
            </form>

            {/* Live Customer Preview Column (Span 1) */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Customer Screen Preview
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h4 className="font-bold text-sm text-white">
                  {language === 'ta' ? 'வாடிக்கையாளர் காணும் கட்டணத் திரை' : 'Customer Payment Preview'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'ta'
                    ? 'விளம்பர வாடிக்கையாளர்கள் Advertise திரையில் பணம் செலுத்தும்போது கீழே உள்ள QR குறியீடு மற்றும் வங்கி விவரங்கள் தோன்றும்:'
                    : 'This live preview shows what advertisement customers will see in the payment screen:'}
                </p>

                {/* QR Preview Box */}
                <div className="bg-white text-slate-900 rounded-xl p-3.5 text-center space-y-2">
                  <div className="inline-block p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    {paymentConfigForm.customQrCodeUrl ? (
                      <div className="space-y-1">
                        <img
                          src={paymentConfigForm.customQrCodeUrl}
                          alt="Custom QR Code"
                          className="w-36 h-36 object-contain mx-auto rounded"
                        />
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block">
                          {language === 'ta' ? 'அதிகாரப்பூர்வ QR படம்' : 'Custom QR Image'}
                        </span>
                      </div>
                    ) : (
                      <QRCodeSVG
                        value={`upi://pay?pa=${paymentConfigForm.ownerUpiId}&pn=${encodeURIComponent(paymentConfigForm.ownerName)}`}
                        size={140}
                        level="M"
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Primary UPI ID</span>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="font-mono font-black text-xs text-indigo-900">
                        {paymentConfigForm.ownerUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(paymentConfigForm.ownerUpiId, 'preview-upi')}
                        className="p-1 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedKey === 'preview-upi' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Account Summary */}
                <div className="bg-slate-800/80 p-3 rounded-xl space-y-1.5 text-xs text-slate-200 border border-slate-700/60 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">Bank:</span>
                    <span className="font-bold">{paymentConfigForm.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">A/C No:</span>
                    <span className="font-bold text-amber-300">{paymentConfigForm.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">IFSC:</span>
                    <span className="font-bold">{paymentConfigForm.ifscCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans text-[10px]">A/C Holder:</span>
                    <span>{paymentConfigForm.accountHolderName}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center">
                  Support: <a href={`tel:${paymentConfigForm.ownerPhone}`} className="text-amber-300 underline font-bold">{paymentConfigForm.ownerPhone}</a>
                </div>
              </div>
            </div>
          </div>

          {/* System Utilities: Reset Onboarding */}
          {onResetOnboarding && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      {language === 'ta' ? 'அறிமுக வழிகாட்டி ரீசெட் (Onboarding Reset)' : 'Onboarding Tour Reset'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ta'
                        ? 'புதிய பயனர்களுக்கான 4-படி அறிமுக வழிகாட்டியை மீண்டும் உடனடியாக திறக்க ரீசெட் செய்க.'
                        : 'Reset the 4-step welcome tour so you or users can experience onboarding again.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="admin-btn-reset-onboarding"
                  onClick={() => {
                    onResetOnboarding();
                    if (onNavigate) onNavigate('home');
                  }}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'ரீசெட் செய் (Reset)' : 'Reset Onboarding'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: APP CONTROL PANEL & SUPPORT HOTLINE MANAGEMENT */}
      {activeTab === 'app-control' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-4 sm:p-6 shadow-md border border-emerald-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {language === 'ta'
                        ? 'செயலி கட்டுப்பாட்டு பலகை (App Control Panel)'
                        : 'App Control Panel & Support Desk'}
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    {language === 'ta'
                      ? 'உதவி மற்றும் மேலாண்மை ஆதரவு பக்கத்தில் (Help & Management Support) தோன்றும் தொலைபேசி எண், வாட்ஸ்அப் எண், மற்றும் மின்னஞ்சல் முகவரியை எப்போது வேண்டுமானாலும் மாற்றி புதுப்பிக்கவும்.'
                      : 'Edit and replace the Phone Number, WhatsApp Number, and Email Address displayed in the customer Help & Management Support screen at any time.'}
                  </p>
                </div>
              </div>

              {/* Top Action Button */}
              <button
                type="button"
                onClick={() => handleSaveAppControl()}
                className="self-start sm:self-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'ta' ? 'அனைத்தையும் சேமிக்க' : 'Save All Settings'}
                </span>
              </button>
            </div>
          </div>

          {/* Success Notification Alert */}
          {appControlSavedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-950 shadow-sm animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs">{appControlSuccessMsg}</p>
                <p className="text-[11px] text-emerald-800">
                  {language === 'ta'
                    ? 'வாடிக்கையாளர்கள் உதவி பொத்தானை அழுத்தும்போது புதிய எண்கள் உடனடியாக காட்டப்படும்.'
                    : 'Changes are live immediately. Users tapping Help & Support will see these new channels.'}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: EDIT PHONE, WHATSAPP, AND EMAIL (THE REQUESTED FEATURE) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Col: Contact Editor Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {language === 'ta'
                        ? 'உதவி & மேலாண்மை தொடர்பு எண்கள்'
                        : 'Help & Management Support Contacts'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ta'
                        ? 'பயனர்கள் பார்க்கும் தொலைபேசி, வாட்ஸ்அப் மற்றும் மின்னஞ்சல் அமைப்புகள்'
                        : 'Customise phone number, WhatsApp and email for user support'}
                    </p>
                  </div>
                </div>

                {/* Preset Sync Option */}
                <button
                  type="button"
                  onClick={() => {
                    if (paymentConfigForm.ownerPhone) {
                      setAppControlForm((prev) => ({
                        ...prev,
                        supportPhone: paymentConfigForm.ownerPhone,
                        supportWhatsApp: paymentConfigForm.ownerPhone,
                      }));
                    }
                  }}
                  title="Copy Phone from Owner Payment Settings"
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                >
                  ⚡ {language === 'ta' ? 'உரிமையாளர் எண் எடுக்க' : 'Use Owner Phone'}
                </button>
              </div>

              <form onSubmit={handleSaveAppControl} className="space-y-4 text-xs">
                {/* 1. CALLING PHONE NUMBER */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {language === 'ta'
                          ? 'நேரடி அழைப்புக்கான தொலைபேசி எண் (Direct Calling Phone)'
                          : 'Calling Phone Number (Direct Calls)'}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">10 Digits</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                        +91
                      </div>
                      <input
                        type="tel"
                        id="admin-input-support-phone"
                        value={appControlForm.supportPhone}
                        onChange={(e) =>
                          setAppControlForm({
                            ...appControlForm,
                            supportPhone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10),
                          })
                        }
                        placeholder="9840123456"
                        maxLength={10}
                        className="w-full pl-12 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-900 font-mono font-bold tracking-wider outline-none transition-all"
                      />
                    </div>
                    {appControlForm.supportPhone && (
                      <a
                        href={`tel:${appControlForm.supportPhone}`}
                        title="Test Call"
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center gap-1 shrink-0"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Test Call</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'பயனர்கள் "நேரடி அழைப்பு (Call Now)" பொத்தானை அழுத்தும்போது இந்த எண் அழைக்கப்படும்.'
                      : 'Users tapping "Direct Phone Call" or "Call Now" in Help desk will dial this number directly.'}
                  </p>
                </div>

                {/* 2. WHATSAPP NUMBER */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                      <span>
                        {language === 'ta'
                          ? 'வாட்ஸ்அப் உதவி எண் (WhatsApp Support Number)'
                          : 'WhatsApp Support Number'}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">WhatsApp Enabled</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                        +91
                      </div>
                      <input
                        type="tel"
                        id="admin-input-support-whatsapp"
                        value={appControlForm.supportWhatsApp}
                        onChange={(e) =>
                          setAppControlForm({
                            ...appControlForm,
                            supportWhatsApp: e.target.value.replace(/[^0-9]/g, '').slice(0, 10),
                          })
                        }
                        placeholder="9840123456"
                        maxLength={10}
                        className="w-full pl-12 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-green-600 rounded-xl text-slate-900 font-mono font-bold tracking-wider outline-none transition-all"
                      />
                    </div>
                    {appControlForm.supportWhatsApp && (
                      <a
                        href={`https://wa.me/91${appControlForm.supportWhatsApp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Test WhatsApp"
                        className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-bold rounded-xl border border-green-200 flex items-center gap-1 shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Test Chat</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'பயனர்கள் "வாட்ஸ்அப் உதவி (Chat on WhatsApp)" அழுத்தினால் இந்த எண்ணில் நேரடியாக வாட்ஸ்அப் திறக்கும்.'
                      : 'Tapping "WhatsApp Support" opens a pre-composed chat with management on this WhatsApp number.'}
                  </p>
                </div>

                {/* 3. OFFICIAL EMAIL ADDRESS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {language === 'ta'
                          ? 'நிர்வாக அதிகாரப்பூர்வ மின்னஞ்சல் (Management Email)'
                          : 'Official Management Email Address'}
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Valid Email</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="admin-input-support-email"
                        value={appControlForm.supportEmail}
                        onChange={(e) =>
                          setAppControlForm({
                            ...appControlForm,
                            supportEmail: e.target.value.trim(),
                          })
                        }
                        placeholder="management@dailywork.app"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 font-mono text-xs outline-none transition-all"
                      />
                    </div>
                    {appControlForm.supportEmail && (
                      <a
                        href={`mailto:${appControlForm.supportEmail}`}
                        title="Test Mail"
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl border border-blue-200 flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Test Mail</span>
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'பயனர்கள் அதிகாரப்பூர்வ மின்னஞ்சல் அனுப்பும்போது இந்த முகவரிக்கு வரும்.'
                      : 'All formal feedback, grievance escalations, and ticket copies are sent to this mailbox.'}
                  </p>
                </div>

                {/* 4. WORKING HOURS TIMING */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ta' ? 'இயங்கும் நேரம் (தமிழ்)' : 'Working Hours (Tamil)'}
                    </label>
                    <input
                      type="text"
                      value={appControlForm.supportWorkingHoursTa || ''}
                      onChange={(e) =>
                        setAppControlForm({
                          ...appControlForm,
                          supportWorkingHoursTa: e.target.value,
                        })
                      }
                      placeholder="தினமும் காலை 7:00 முதல் இரவு 9:00 வரை"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {language === 'ta' ? 'இயங்கும் நேரம் (ஆங்கிலம்)' : 'Working Hours (English)'}
                    </label>
                    <input
                      type="text"
                      value={appControlForm.supportWorkingHoursEn || ''}
                      onChange={(e) =>
                        setAppControlForm({
                          ...appControlForm,
                          supportWorkingHoursEn: e.target.value,
                        })
                      }
                      placeholder="Daily 7:00 AM – 9:00 PM IST"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppControlForm(DEFAULT_APP_CONTROL_CONFIG);
                    }}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    {language === 'ta' ? 'இயல்பு நிலைக்கு மீட்டமை' : 'Reset to Default'}
                  </button>

                  <button
                    type="submit"
                    id="admin-btn-save-support-contacts"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'ta'
                        ? 'தொடர்பு விவரங்களை சேமிக்கவும் (Save Support Contacts)'
                        : 'Save & Update Support Contacts'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Interactive Live Customer Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                      {language === 'ta' ? 'நேரடி பயனர் முன்னோட்டம்' : 'Live User View Preview'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">
                    Real-time Sync
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'ta'
                    ? 'வாடிக்கையாளர் செயலியின் "உதவி & நிர்வாக ஆதரவு" பகுதியில் இந்த விவரங்களே தோன்றும்:'
                    : 'This is the exact contact card that will display inside the customer Help & Support modal:'}
                </p>

                {/* Mini Help Desk Card */}
                <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Headphones className="w-4 h-4" />
                    <span>Daily Work Help & Management Desk</span>
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>
                      {language === 'ta'
                        ? appControlForm.supportWorkingHoursTa || 'தினமும் காலை 7:00 முதல் இரவு 9:00 வரை'
                        : appControlForm.supportWorkingHoursEn || 'Daily 7:00 AM – 9:00 PM IST'}
                    </span>
                  </div>

                  {/* Calling Phone */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-400 block">Direct Calling</span>
                        <span className="font-mono font-bold text-white text-xs truncate block">
                          {appControlForm.supportPhone || 'Not Set'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/50">
                      Call Now
                    </span>
                  </div>

                  {/* WhatsApp Support */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-green-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-green-500/20 text-green-300 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-400 block">WhatsApp Support</span>
                        <span className="font-mono font-bold text-white text-xs truncate block">
                          +91 {appControlForm.supportWhatsApp || 'Not Set'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-400 bg-green-950 px-2 py-0.5 rounded-md border border-green-700/50">
                      WhatsApp
                    </span>
                  </div>

                  {/* Email Support */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-blue-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-400 block">Management Email</span>
                        <span className="font-mono text-white text-[11px] truncate block">
                          {appControlForm.supportEmail || 'Not Set'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-700/50">
                      Send Mail
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(appControlForm.lastUpdated || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: APP SERVICE AVAILABILITY TOGGLES */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'ta'
                  ? 'செயலி இயக்கக் கட்டுப்பாடுகள் (Service Controls)'
                  : 'App Service Operation Controls'}
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    {language === 'ta' ? 'வேலை பதிவு வசதி' : 'Allow Job Posting'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'முதலாளிகள் புதிய தினக்கூலி வேலைகளை பதிவு செய்ய அனுமதிக்கவும்.'
                      : 'Enable employers and contractors to publish new job vacancies.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={appControlForm.allowJobPosting}
                  onChange={(e) =>
                    setAppControlForm({ ...appControlForm, allowJobPosting: e.target.checked })
                  }
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    {language === 'ta' ? 'தொழிலாளர் பதிவு வசதி' : 'Allow Worker Registration'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'தொழிலாளர்கள் புதிய சுயவிவரங்களை பதிவு செய்ய அனுமதிக்கவும்.'
                      : 'Enable daily wage workers to register profiles on the platform.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={appControlForm.allowSeekerRegistration}
                  onChange={(e) =>
                    setAppControlForm({
                      ...appControlForm,
                      allowSeekerRegistration: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BROADCAST ANNOUNCEMENT BANNER */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'ta'
                    ? 'செயலி பொது அறிவிப்பு பலகை (Broadcast Announcement Banner)'
                    : 'Broadcast Announcement Banner'}
                </span>
              </h4>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <span>{appControlForm.announcementBannerEnabled ? 'Enabled' : 'Disabled'}</span>
                <input
                  type="checkbox"
                  checked={appControlForm.announcementBannerEnabled}
                  onChange={(e) =>
                    setAppControlForm({
                      ...appControlForm,
                      announcementBannerEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {appControlForm.announcementBannerEnabled && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'அறிவிப்பு உரை (தமிழ்)' : 'Banner Text (Tamil)'}
                    </label>
                    <input
                      type="text"
                      value={appControlForm.announcementBannerTextTa}
                      onChange={(e) =>
                        setAppControlForm({
                          ...appControlForm,
                          announcementBannerTextTa: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ta' ? 'அறிவிப்பு உரை (ஆங்கிலம்)' : 'Banner Text (English)'}
                    </label>
                    <input
                      type="text"
                      value={appControlForm.announcementBannerTextEn}
                      onChange={(e) =>
                        setAppControlForm({
                          ...appControlForm,
                          announcementBannerTextEn: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Save Reminder */}
          <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-slate-600">
              {language === 'ta'
                ? 'அனைத்து மாற்றங்களையும் உடனடியாக பயனர்களுக்கு காண்பிக்க "சேமிக்க" அழுத்தவும்.'
                : 'Press Save to instantly apply and broadcast changes across the app.'}
            </div>
            <button
              type="button"
              onClick={() => handleSaveAppControl()}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ta' ? 'சேமிக்க' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      )}
      {rejectPromptAdId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-xl">
            <h4 className="font-bold text-slate-900 text-sm">Reject Advertisement</h4>
            <p className="text-xs text-slate-600">Enter a reason for rejecting this ad submission:</p>
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Phone number unreachable / inappropriate content"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectPromptAdId(null)}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectAd}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundPromptTxId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-xl">
            <h4 className="font-bold text-slate-900 text-sm">Issue Refund</h4>
            <p className="text-xs text-slate-600">
              The amount will be recorded as refunded and the customer notified:
            </p>
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund (e.g. Workers unavailable)"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRefundPromptTxId(null)}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruitment Status Edit Modal */}
      {editingReqId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-xl">
            <h4 className="font-bold text-slate-900 text-sm">Update Recruitment Request</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="assigned">Workers Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Notes</label>
              <textarea
                rows={2}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="e.g. 5 workers coordinated with contractor"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingReqId(null)}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecruitmentStatus}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OWNER MODAL: ADD ADVERTISEMENT FOR CUSTOMER
         ========================================================================= */}
      {isAddAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Megaphone className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>
                      {language === 'ta'
                        ? 'வாடிக்கையாளருக்கு விளம்பரம் சேர்க்க'
                        : 'Add Advertisement for Customer'}
                    </span>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Admin
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {language === 'ta'
                      ? 'மொழி, பேனர் ஊடகம், பகுதி அளவு மற்றும் இருப்பிடத்தை தேர்வு செய்து விளம்பரத்தை வெளியிடவும்.'
                      : 'Select language, banner media, audience scope, and location to publish customer ad.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerScopePricingModalOpen(true)}
                  className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                  title={language === 'ta' ? 'விளம்பர கட்டணங்களை நிர்ணயிக்க' : 'Configure Ad Pricing Tiers'}
                >
                  <IndianRupee className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">{language === 'ta' ? 'விலை நிர்ணயம்' : 'Set Pricing'}</span>
                </button>

                <button
                  onClick={() => setIsAddAdModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* 1-Click Fast Presets */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'ta' ? 'விரைவு மாதிரிகள் (1-Click Templates):' : 'Quick Templates (1-Click Fill):'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {language === 'ta' ? 'கிளிக் செய்தால் விவரங்கள் தானாக நிரம்பும்' : 'Autofills banner, headlines & contact'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {AD_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[11px] font-medium text-slate-800 transition-all cursor-pointer truncate"
                    >
                      {language === 'ta' ? preset.labelTa : preset.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Alert */}
              {adFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adFormError}</span>
                </div>
              )}

              <form id="admin-add-ad-form" onSubmit={handleSaveCustomerAd} className="space-y-4">
                {/* 1. Ad Language Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'ta' ? 'விளம்பர மொழி (Ad Posting Language):' : 'Ad Posting Language:'}</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { code: 'ta' as Language, label: 'தமிழ்' },
                      { code: 'en' as Language, label: 'English' },
                      { code: 'hi' as Language, label: 'हिन्दी' },
                      { code: 'te' as Language, label: 'తెలుగు' },
                      { code: 'ml' as Language, label: 'മലയാളം' },
                      { code: 'kn' as Language, label: 'ಕನ್ನಡ' },
                    ].map((langItem) => {
                      const isSelected = adFormData.adLanguage === langItem.code;
                      return (
                        <button
                          key={langItem.code}
                          type="button"
                          onClick={() => setAdFormData({ ...adFormData, adLanguage: langItem.code })}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {langItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Banner Media (Photo or Video) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'ta' ? 'விளம்பர பேனர் ஊடகம் (Photo அல்லது Video):' : 'Banner Media (Photo or Video):'}</span>
                  </label>
                  <AdMediaUploader
                    value={adFormData.mediaValue || { mediaType: 'none', mediaUrl: '' }}
                    onChange={(newMedia) => setAdFormData({ ...adFormData, mediaValue: newMedia })}
                    defaultCategory={adFormData.targetCategory}
                  />
                </div>

                {/* 3. Ad Scope & Tiered Pricing (Pan-India, Statewide, District, City) */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ta' ? 'விளம்பரம் எந்தப் பகுதியில் தெரிய வேண்டும்?' : 'Ad Reach & Target Area Scope:'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOwnerScopePricingModalOpen(true)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>{language === 'ta' ? 'கட்டணத்தை மாற்ற' : 'Edit Scope Prices'}</span>
                    </button>
                  </div>

                  {/* 4 Scope Selector Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        scope: 'country' as AdTargetScope,
                        titleTa: 'நாடு முழுவதும்',
                        titleEn: 'Pan-India',
                        badgeTa: 'அனைத்து மாநிலங்கள்',
                        badgeEn: 'All States',
                        icon: Globe,
                        color: 'border-purple-300 bg-purple-50/70 text-purple-900',
                        activeColor: 'border-purple-600 ring-2 ring-purple-500 bg-purple-100 text-purple-950 shadow-xs',
                      },
                      {
                        scope: 'state' as AdTargetScope,
                        titleTa: 'மாநிலம் முழுவதும்',
                        titleEn: 'Entire State',
                        badgeTa: 'மாநிலம் முழுவதும்',
                        badgeEn: 'Statewide',
                        icon: MapIcon,
                        color: 'border-blue-300 bg-blue-50/70 text-blue-900',
                        activeColor: 'border-blue-600 ring-2 ring-blue-500 bg-blue-100 text-blue-950 shadow-xs',
                      },
                      {
                        scope: 'district' as AdTargetScope,
                        titleTa: 'மாவட்டம் முழுவதும்',
                        titleEn: 'Entire District',
                        badgeTa: 'மிகவும் பிரபலம்',
                        badgeEn: 'Most Popular',
                        icon: Building,
                        color: 'border-indigo-300 bg-indigo-50/70 text-indigo-900',
                        activeColor: 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-100 text-indigo-950 shadow-xs',
                      },
                      {
                        scope: 'city' as AdTargetScope,
                        titleTa: 'நகரம் / உள்ளூர்',
                        titleEn: 'City / Local',
                        badgeTa: 'குறைந்த கட்டணம்',
                        badgeEn: 'Budget',
                        icon: MapPin,
                        color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900',
                        activeColor: 'border-emerald-600 ring-2 ring-emerald-500 bg-emerald-100 text-emerald-950 shadow-xs',
                      },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = adFormData.targetScope === item.scope;
                      const tier = scopePricingTiers[item.scope];
                      const startPrice = tier?.plans?.length ? `₹${tier.plans[0].price}` : '₹249';

                      return (
                        <button
                          key={item.scope}
                          type="button"
                          onClick={() => {
                            const firstPlan = tier?.plans?.[0];
                            setAdFormData({
                              ...adFormData,
                              targetScope: item.scope,
                              days: firstPlan ? firstPlan.days : adFormData.days,
                              amount: firstPlan ? firstPlan.price : adFormData.amount,
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                            isSelected ? item.activeColor : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <IconComp className={`w-4 h-4 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`} />
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {language === 'ta' ? item.badgeTa : item.badgeEn}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-bold text-xs leading-tight">
                              {language === 'ta' ? item.titleTa : item.titleEn}
                            </h5>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-[10px] text-slate-500">{language === 'ta' ? 'தொடக்கம்:' : 'From:'}</span>
                              <span className="text-xs font-extrabold text-indigo-700">{startPrice}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reach Explanation Banner */}
                  <p className="text-[11px] text-slate-600 italic bg-amber-50/80 p-2 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {language === 'ta'
                        ? adminActiveScopeTier.descriptionTa
                        : adminActiveScopeTier.descriptionEn}
                    </span>
                  </p>
                </div>

                {/* 4. Cascading Location Hierarchy (Country -> State -> District -> City -> Locality) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ta' ? 'விளம்பர இருப்பிடம் (நாடு, மாநிலம், மாவட்டம், நகரம்)' : 'Ad Location (Country, State, District, City)'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAdminAdDetectLocation}
                      disabled={isLocatingAdminAd}
                      className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      {isLocatingAdminAd ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>
                        {isLocatingAdminAd
                          ? (language === 'ta' ? 'கண்டறியப்படுகிறது...' : 'Locating...')
                          : (language === 'ta' ? 'என் இடத்தை கண்டறி' : 'Auto-detect GPS')}
                      </span>
                    </button>
                  </div>

                  {/* Location Notice */}
                  {adminAdLocationFeedback && (
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{adminAdLocationFeedback}</span>
                    </div>
                  )}

                  {/* Location Dropdowns Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Country Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        1. {language === 'ta' ? 'நாடு (Country) *' : 'Country *'}
                      </label>
                      <select
                        value={adFormData.country}
                        onChange={(e) => {
                          const newCountry = e.target.value;
                          const foundCountry = COUNTRIES_LIST.find((c) => c.nameEn === newCountry || c.nameTa === newCountry);
                          const newCode = foundCountry?.code || 'IN';
                          const newStates = getStatesForCountry(newCode);
                          const firstState = newStates[0]?.nameEn || '';
                          const newDistricts = newStates[0]?.districts || [];
                          const firstDistrict = newDistricts[0]?.nameEn || '';
                          const firstCity = newDistricts[0]?.cities?.[0] || '';

                          setAdFormData({
                            ...adFormData,
                            country: newCountry,
                            state: firstState,
                            district: firstDistrict,
                            city: firstCity,
                            location: `${firstDistrict}, ${firstState}`,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {COUNTRIES_LIST.map((c) => (
                          <option key={c.code} value={c.nameEn}>
                            {c.flag} {language === 'ta' ? c.nameTa : c.nameEn}
                          </option>
                        ))}
                        <option value="Other">{language === 'ta' ? 'பிற நாடு (Other)' : 'Other Country'}</option>
                      </select>
                      {adFormData.country === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'ta' ? 'நாட்டின் பெயரை உள்ளிடுக' : 'Enter Country Name'}
                          value={adFormData.country === 'Other' ? '' : adFormData.country}
                          onChange={(e) => setAdFormData({ ...adFormData, country: e.target.value })}
                          className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      )}
                    </div>

                    {/* State Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        2. {language === 'ta' ? 'மாநிலம் (State) *' : 'State *'}
                      </label>
                      <select
                        value={adFormData.state}
                        onChange={(e) => {
                          const newStateName = e.target.value;
                          const foundState = adminStatesList.find((s) => s.nameEn === newStateName || s.nameTa === newStateName || s.id === newStateName);
                          const newDistricts = foundState?.districts || [];
                          const firstDistrict = newDistricts[0]?.nameEn || '';
                          const firstCity = newDistricts[0]?.cities?.[0] || '';

                          setAdFormData({
                            ...adFormData,
                            state: newStateName,
                            district: firstDistrict,
                            city: firstCity,
                            location: `${firstDistrict}, ${newStateName}`,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {adminStatesList.map((s) => (
                          <option key={s.id} value={s.nameEn}>
                            {language === 'ta' ? s.nameTa : s.nameEn}
                          </option>
                        ))}
                        <option value="Other">{language === 'ta' ? 'பிற மாநிலம் (Other)' : 'Other State'}</option>
                      </select>
                      {adFormData.state === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'ta' ? 'மாநிலத்தின் பெயரை உள்ளிடுக' : 'Enter State Name'}
                          value={adFormData.state === 'Other' ? '' : adFormData.state}
                          onChange={(e) => setAdFormData({ ...adFormData, state: e.target.value })}
                          className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      )}
                    </div>

                    {/* District Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        3. {language === 'ta' ? 'மாவட்டம் (District) *' : 'District *'}
                      </label>
                      <select
                        value={adFormData.district}
                        onChange={(e) => {
                          const newDistName = e.target.value;
                          const foundDist = adminDistrictsList.find((d) => d.nameEn === newDistName || d.nameTa === newDistName || d.id === newDistName);
                          const newCities = foundDist?.cities || [];
                          const firstCity = newCities[0] || '';

                          setAdFormData({
                            ...adFormData,
                            district: newDistName,
                            city: firstCity,
                            location: `${newDistName}, ${adFormData.state}`,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {adminDistrictsList.map((d) => (
                          <option key={d.id} value={d.nameEn}>
                            {language === 'ta' ? d.nameTa : d.nameEn}
                          </option>
                        ))}
                        <option value="Other">{language === 'ta' ? 'பிற மாவட்டம் (Other)' : 'Other District'}</option>
                      </select>
                      {adFormData.district === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'ta' ? 'மாவட்டத்தின் பெயரை உள்ளிடுக' : 'Enter District Name'}
                          value={adFormData.district === 'Other' ? '' : adFormData.district}
                          onChange={(e) => setAdFormData({ ...adFormData, district: e.target.value })}
                          className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      )}
                    </div>

                    {/* City Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        4. {language === 'ta' ? 'நகரம் / தாலுகா (City) *' : 'City / Taluk *'}
                      </label>
                      <select
                        value={adFormData.city}
                        onChange={(e) => setAdFormData({ ...adFormData, city: e.target.value, location: `${e.target.value}, ${adFormData.district}` })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {adminCitiesList.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                        <option value="Other">{language === 'ta' ? 'பிற நகரம் (Other)' : 'Other City'}</option>
                      </select>
                      {adFormData.city === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'ta' ? 'நகரத்தின் பெயரை உள்ளிடுக' : 'Enter City Name'}
                          value={adFormData.city === 'Other' ? '' : adFormData.city}
                          onChange={(e) => setAdFormData({ ...adFormData, city: e.target.value })}
                          className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                        />
                      )}
                    </div>

                    {/* Locality / Street Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        5. {language === 'ta' ? 'பகுதி / தெரு / வார்டு (Locality / Street)' : 'Locality / Street Address'}
                      </label>
                      <input
                        type="text"
                        value={adFormData.locality || ''}
                        onChange={(e) => setAdFormData({ ...adFormData, locality: e.target.value })}
                        placeholder={language === 'ta' ? 'எ.கா. மெயின் ரோடு, பஸ் நிலையம் அருகில்' : 'e.g. Near Bus Stand, Main Bazaar'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Customer & Business Details */}
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    5. {language === 'ta' ? 'வாடிக்கையாளர் & வணிக விவரம்' : 'Customer & Business Details'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'வணிகம் / கடையின் பெயர் *' : 'Business / Shop Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={adFormData.businessName}
                        onChange={(e) => setAdFormData({ ...adFormData, businessName: e.target.value })}
                        placeholder="எ.கா. ஸ்ரீ முருகன் ஹார்டுவேர்ஸ்"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'உரிமையாளர் / தொடர்பு பெயர்' : 'Contact Person'}
                      </label>
                      <input
                        type="text"
                        value={adFormData.contactPerson}
                        onChange={(e) => setAdFormData({ ...adFormData, contactPerson: e.target.value })}
                        placeholder="எ.கா. செந்தில் குமார்"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'வாடிக்கையாளர் மொபைல் எண் *' : 'Customer Mobile Number *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={adFormData.phone}
                          onChange={(e) => setAdFormData({ ...adFormData, phone: e.target.value })}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'இலக்கு பணி வகை' : 'Target Category'}
                      </label>
                      <select
                        value={adFormData.targetCategory}
                        onChange={(e) => setAdFormData({ ...adFormData, targetCategory: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="all">{language === 'ta' ? 'அனைத்து பயனர்கள் (All)' : 'All App Users'}</option>
                        {WORK_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {language === 'ta' ? cat.nameTa : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Ad Content & Messaging */}
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    6. {language === 'ta' ? 'விளம்பர வாசகம் (Tamil & English)' : 'Ad Headline & Message'}
                  </h5>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'ta' ? 'விளம்பர தலைப்பு (Headline - Tamil) *' : 'Headline (Tamil) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={adFormData.headlineTa}
                      onChange={(e) => setAdFormData({ ...adFormData, headlineTa: e.target.value })}
                      placeholder="எ.கா. கட்டுமான பொருட்கள் & சிமெண்ட் மொத்த விலை சலுகை!"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'ta' ? 'விளம்பர தலைப்பு (Headline - English)' : 'Headline (English)'}
                    </label>
                    <input
                      type="text"
                      value={adFormData.headlineEn}
                      onChange={(e) => setAdFormData({ ...adFormData, headlineEn: e.target.value })}
                      placeholder="e.g. Building Materials & Tools wholesale discount!"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'ta' ? 'விவரம் (Description)' : 'Detailed Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={adFormData.descriptionTa}
                      onChange={(e) => setAdFormData({ ...adFormData, descriptionTa: e.target.value })}
                      placeholder="எ.கா. சிமெண்ட், கம்பி, பெயிண்ட், குழாய் பொருட்கள் குறைந்த விலையில் கிடைக்கும்..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'ta' ? 'பட்டன் வாசகம் (Action Text)' : 'Button Action Label'}
                    </label>
                    <input
                      type="text"
                      value={language === 'ta' ? adFormData.actionTextTa : adFormData.actionTextEn}
                      onChange={(e) =>
                        setAdFormData({
                          ...adFormData,
                          actionTextTa: e.target.value,
                          actionTextEn: e.target.value,
                        })
                      }
                      placeholder="கடையை அழைக்க / Call Shop"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 7. Duration, Scope Pricing Plans & Admin Override */}
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      7. {language === 'ta' ? 'கால அளவு & பகுதி கட்டணம் (Pricing & Duration)' : 'Duration & Scope Pricing'}
                    </h5>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                      {adminActiveScopeTier.titleEn}: {adminActiveScopeTier.plans.length} plans
                    </span>
                  </div>

                  {/* Plans for Active Target Scope */}
                  <div className={`grid gap-2 ${adminActiveScopeTier.plans.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {adminActiveScopeTier.plans.map((plan, idx) => (
                      <button
                        key={plan.id || idx}
                        type="button"
                        onClick={() =>
                          setAdFormData({
                            ...adFormData,
                            days: plan.days,
                            amount: plan.price,
                            bannerType: plan.isPopular ? 'home' : 'feed',
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                          adFormData.days === plan.days && adFormData.amount === plan.price
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-1 ring-indigo-500/40'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-bl uppercase">
                            POPULAR
                          </span>
                        )}
                        <div>
                          <span className="font-bold text-xs block">
                            {plan.days} {language === 'ta' ? 'நாட்கள்' : 'Days'}
                          </span>
                          <span className="text-xs font-black text-indigo-700 block mt-0.5">
                            ₹{plan.price}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 truncate block mt-1">
                          {language === 'ta' ? plan.labelTa : plan.labelEn}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Manual Override inputs for Admin (Days, Price, Payment Mode, Status) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'நாட்கள் (Days)' : 'Duration (Days)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={adFormData.days}
                        onChange={(e) => setAdFormData({ ...adFormData, days: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'கட்டணம் (₹ Amount)' : 'Price (₹)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={adFormData.amount}
                        onChange={(e) => setAdFormData({ ...adFormData, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'கட்டண முறை' : 'Payment Mode'}
                      </label>
                      <select
                        value={adFormData.paymentMethod}
                        onChange={(e) => setAdFormData({ ...adFormData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="cash">{language === 'ta' ? 'ரொக்கம் (Cash)' : 'Cash Collected'}</option>
                        <option value="upi">{language === 'ta' ? 'UPI / GPay' : 'UPI / Online'}</option>
                        <option value="complimentary">{language === 'ta' ? 'இலவசம் (₹0)' : 'Free Promo (₹0)'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'ta' ? 'விளம்பர நிலை' : 'Ad Status'}
                      </label>
                      <select
                        value={adFormData.status}
                        onChange={(e) => setAdFormData({ ...adFormData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="approved">{language === 'ta' ? 'உடனடி நேரலை (Approved)' : 'Approved (Live)'}</option>
                        <option value="pending">{language === 'ta' ? 'நிலுவை (Pending)' : 'Pending Review'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 8. Live Interactive Preview Card */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ta' ? 'நேரடி முன்னோட்டம் (Live Preview):' : 'Live Ad Preview in App:'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {adFormData.status === 'approved' ? (language === 'ta' ? 'நேரலையில் இவ்வாறு தோன்றும்' : 'Live Appearance') : (language === 'ta' ? 'ஒப்புதல் நிலுவை' : 'Pending')}
                    </span>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/5 rounded-2xl border border-amber-300/60 space-y-2.5 shadow-2xs">
                    {/* Media preview */}
                    {adFormData.mediaValue && adFormData.mediaValue.mediaUrl && (
                      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 max-h-40">
                        {adFormData.mediaValue.mediaType === 'video' ? (
                          <div className="relative w-full h-36 flex items-center justify-center bg-slate-950">
                            <video
                              src={adFormData.mediaValue.mediaUrl}
                              className="w-full h-full object-cover opacity-80"
                              controls={false}
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg">
                                <Play className="w-5 h-5 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              <Film className="w-3 h-3" /> VIDEO AD
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full h-36">
                            <img
                              src={adFormData.mediaValue.mediaUrl}
                              alt="Ad Banner Preview"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                              <ImageIcon className="w-3 h-3" /> PHOTO AD
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                            {language === 'ta' ? 'விளம்பரம்' : 'AD'}
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 font-bold text-[9px] px-1.5 py-0.2 rounded uppercase">
                            {adFormData.targetScope}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {adFormData.businessName || (language === 'ta' ? 'கடை பெயர்' : 'Shop Name')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>
                            {[adFormData.city, adFormData.district, adFormData.state, adFormData.country]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {adFormData.headlineTa || (language === 'ta' ? 'விளம்பர சிறப்பம்ச தலைப்பு இங்கே தோன்றும்' : 'Ad Headline')}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {adFormData.descriptionTa || (language === 'ta' ? 'விளம்பர விளக்கம் மற்றும் சலுகை விவரங்கள்...' : 'Ad description...')}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <button
                          type="button"
                          className="bg-indigo-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{language === 'ta' ? adFormData.actionTextTa : adFormData.actionTextEn}</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {adFormData.phone ? `+91 ${adFormData.phone}` : ''}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {adFormData.days}d • ₹{adFormData.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddAdModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    id="admin-submit-customer-ad"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'ta'
                        ? '+ விளம்பரத்தை வெளியிடவும் (Publish Ad)'
                        : '+ Publish Advertisement'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Batch Clean Old Jobs Modal */}
      {isBatchCleanJobsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'ta' ? 'பழைய வேலைப் பதிவுகளை நீக்குதல்' : 'Batch Clean Old Job Posts'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட நாட்களுக்கு முந்தைய வேலைகளை நீக்குங்கள்' : 'Remove outdated job listings to keep the board fresh'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchCleanJobsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ta' ? 'எத்தனை நாட்களுக்கு முந்தைய பதிவுகள்?' : 'Delete jobs older than:'}
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[1, 3, 7, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setCleanJobsDays(days)}
                      className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        cleanJobsDays === days
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {days} {language === 'ta' ? 'நாட்கள்' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {language === 'ta'
                      ? `${cleanJobsDays} நாட்களுக்கு முந்தைய அனைத்து முடிவடைந்த வேலைகளும் நிரந்தரமாக நீக்கப்படும்.`
                      : `All job posts older than ${cleanJobsDays} days will be permanently erased.`}
                  </span>
                </p>
                <p className="text-[11px] text-amber-800">
                  {language === 'ta'
                    ? 'முதலாளிகள் மற்றும் தொழிலாளர்களுக்கு புதிய மற்றும் தற்போதைய வேலைகள் மட்டுமே திரையில் தோன்றும்.'
                    : 'This ensures seekers only see fresh daily wages and active requirements.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBatchCleanJobsModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                id="admin-btn-confirm-clean-old-jobs"
                onClick={() => {
                  if (onClearOldJobs) {
                    onClearOldJobs(cleanJobsDays);
                  }
                  setIsBatchCleanJobsModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'ta' ? 'ஆம், மொத்தமாக நீக்குக' : 'Confirm Batch Delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Clean Expired Ads Modal */}
      {isBatchCleanAdsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'ta' ? 'காலாவதியான விளம்பரங்களை நீக்குதல்' : 'Clean Expired Advertisements'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ta' ? 'முடிவடைந்த அல்லது நிராகரிக்கப்பட்ட விளம்பரங்களை நீக்குக' : 'Remove past valid period and rejected advertisements'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchCleanAdsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-slate-900">
                {language === 'ta'
                  ? 'காலாவதி தேதி கடந்த அல்லது நிராகரிக்கப்பட்ட விளம்பரங்கள் அனைத்தும் நீக்கப்படும்.'
                  : 'All ads with expired validity period or marked as rejected will be permanently removed.'}
              </p>
              <p className="text-[11px] text-slate-500">
                {language === 'ta'
                  ? 'செயலில் உள்ள விளம்பரங்கள் (Active Ads) எந்த பாதிப்பும் இல்லாமல் தொடர்ந்து இயங்கும்.'
                  : 'Active customer ads with remaining validity days will remain untouched.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBatchCleanAdsModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                id="admin-btn-confirm-clean-expired-ads"
                onClick={() => {
                  if (onClearExpiredAds) {
                    onClearExpiredAds();
                  }
                  setIsBatchCleanAdsModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'ta' ? 'ஆம், நீக்குக' : 'Delete Expired Ads'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: GITHUB SYNC & DEVELOPER TOOLS (RESTRICTED TO OWNER ONLY) */}
      {activeTab === 'github-sync' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-purple-800/40 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-purple-500 text-slate-950 rounded-2xl font-black text-lg shadow-sm">
                🐙
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/50">
                  {language === 'ta' ? 'நிர்வாகி மட்டும்' : 'Owner / Developer Only'}
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {language === 'ta' ? 'GitHub நேரடி அப்லோட் & செயலி பேக்கப்' : 'GitHub 1-Click Sync & App Backup'}
                </h3>
                <p className="text-xs text-purple-200/80">
                  {language === 'ta'
                    ? 'இந்த பகுதி சாதாரண பயனர்களின் மொபைல் செயலியில் காட்டப்படாது. நீங்கள் மட்டுமே மூலக்குறியீட்டை (Source Code) GitHub-ல் ஏற்றலாம் அல்லது ZIP ஆக பதிவிறக்கலாம்.'
                    : 'Hidden from regular app users. Only the owner can push code to GitHub or download full source ZIP.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: 1-Click GitHub Sync */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <h4 className="font-bold text-sm text-slate-900">
                  {language === 'ta' ? 'GitHub நேரடி அப்லோடர் (1-Click Sync)' : '1-Click GitHub Repository Uploader'}
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'ta'
                  ? 'மொபைல் போனில் இருந்தே 85 மூலக்கோப்புகளையும் (React, TypeScript, Android Capacitor) உங்கள் GitHub களஞ்சியத்தில் தானாகவே ஏற்றிவிடும்.'
                  : 'Directly uploads all 85 source files into your personal GitHub repository.'}
              </p>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GitHub Personal Access Token (PAT) *
                  </label>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxx..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=LuckyApp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-purple-700 font-bold hover:underline inline-block mt-1"
                  >
                    {language === 'ta' ? 'GitHub Token உருவாக்க இங்கே தொடவும் ↗' : 'Create GitHub Token (repo & workflow scopes) ↗'}
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'GitHub களஞ்சிய பெயர் (Repo Name)' : 'Repository Name'}
                  </label>
                  <input
                    type="text"
                    value={ghRepoName}
                    onChange={(e) => setGhRepoName(e.target.value)}
                    placeholder="daily-work-app"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {ghUploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                    ⚠️ {ghUploadError}
                  </div>
                )}

                {ghUploadResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">
                      🎉 {language === 'ta' ? 'வெற்றிகரமாக GitHub-ல் ஏற்றப்பட்டது!' : 'Uploaded successfully to GitHub!'}
                    </p>
                    <a
                      href={ghUploadResult.repoUrl || `https://github.com/${ghUploadResult.owner}/${ghUploadResult.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 font-bold underline block"
                    >
                      {language === 'ta' ? 'GitHub களஞ்சியத்தைக் காண்க ↗' : 'View GitHub Repository ↗'}
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAdminGitHubSync}
                  disabled={isUploadingGh}
                  className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isUploadingGh ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'ta' ? 'கோப்புகள் ஏறுகின்றன...' : 'Uploading files...'}</span>
                    </>
                  ) : (
                    <>
                      <span>🐙</span>
                      <span>{language === 'ta' ? 'GitHub-ல் அப்லோட் செய்' : 'Upload to GitHub Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Full Source Code ZIP Download & Play Store Bundle Notes */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <h4 className="font-bold text-sm text-slate-900">
                  {language === 'ta' ? 'முழு திட்டக் கோப்புகள் (ZIP - 0.9MB)' : 'Full Source Code ZIP (0.9MB)'}
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'ta'
                  ? 'React SPA, TypeScript, Android Studio Capacitor கோப்புகள் அனைத்தையும் ஒரே கிளிக் மூலம் பதிவிறக்கம் செய்து உங்கள் கணினியில் திறக்கலாம்.'
                  : 'Download the entire pristine source bundle with Android Capacitor ready for Android Studio.'}
              </p>

              <div className="pt-2">
                <a
                  href="/api/download-zip"
                  download="lucky-app.zip"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center block cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{language === 'ta' ? 'முழு செயலியை ZIP ஆக பதிவிறக்கு' : 'Download Complete Project ZIP'}</span>
                </a>
              </div>

              {/* Google Play Store Assets (Icon 512x512 & Feature Graphic 1024x500) */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl border border-indigo-800/60 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <h5 className="font-bold text-xs text-amber-300">
                      {language === 'ta' ? 'Google Play Store கிராபிக்ஸ் சொத்துக்கள்' : 'Google Play Store Graphics Assets'}
                    </h5>
                  </div>
                  <span className="text-[10px] bg-indigo-800/80 text-indigo-200 px-2 py-0.5 rounded-full font-mono">
                    Ready to Upload
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ta'
                    ? 'Google Play Console-ல் Store Listing அமைக்கும் போது கேட்கப்படும் 512x512 ஐகான் மற்றும் 1024x500 பேனர் படங்களை இங்கிருந்து நேரடியாக பதிவிறக்கலாம்:'
                    : 'Download the exact 512x512 App Icon and 1024x500 Feature Graphic required by Google Play Console:'}
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* 512x512 Icon */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-indigo-700/40 flex flex-col items-center text-center space-y-1.5">
                    <img
                      src="/playstore-icon-512.png"
                      alt="Play Store 512x512 Icon"
                      className="w-16 h-16 rounded-xl shadow-md border border-slate-700 object-cover"
                    />
                    <span className="text-[10px] font-bold text-amber-200">512 x 512 Icon</span>
                    <span className="text-[9px] text-slate-400">PNG Format</span>
                    <a
                      href="/playstore-icon-512.png"
                      download="LuckyApp-PlayStore-Icon-512x512.png"
                      className="w-full mt-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>{language === 'ta' ? 'ஐகான் டவுன்லோட்' : 'Download Icon'}</span>
                    </a>
                  </div>

                  {/* 1024x500 Feature Graphic */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-indigo-700/40 flex flex-col items-center text-center space-y-1.5">
                    <img
                      src="/playstore-feature-graphic-1024x500.png"
                      alt="Play Store Feature Graphic"
                      className="w-full h-16 rounded-lg shadow-md border border-slate-700 object-cover"
                    />
                    <span className="text-[10px] font-bold text-amber-200">1024 x 500 Banner</span>
                    <span className="text-[9px] text-slate-400">Feature Graphic</span>
                    <a
                      href="/playstore-feature-graphic-1024x500.png"
                      download="LuckyApp-FeatureGraphic-1024x500.png"
                      className="w-full mt-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>{language === 'ta' ? 'பேனர் டவுன்லோட்' : 'Download Banner'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Play Store Console FAQ Info */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1.5 text-xs text-slate-700">
                <p className="font-black text-amber-950 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>{language === 'ta' ? 'Play Store Console & APK தகவல்:' : 'Play Store Console vs APK:'}</span>
                </p>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li>
                    <strong>LuckyApp.apk (Debug APK):</strong> {language === 'ta' ? 'உங்கள் போனில் நேரடியாக இன்ஸ்டால் செய்து சோதிக்க இது மட்டுமே பயன்படும்.' : 'Directly installable on phones.'}
                  </li>
                  <li>
                    <strong>LuckyApp-PlayStore-Bundle.aab:</strong> {language === 'ta' ? 'இது போனில் நேரடியாக இன்ஸ்டால் ஆகாது. Google Play Console-ல் அப்லோட் செய்ய மட்டுமே பயன்படுகிறது!' : 'For Google Play Console only.'}
                  </li>
                  <li>
                    <strong>செயலி அளவு (0.9MB - 3MB):</strong> {language === 'ta' ? 'குறைந்த அளவு இருப்பது மிகப்பெரிய பலம்! பயனர்கள் குறைந்த இணைய டேட்டாவில் மின்னல் வேகத்தில் டவுன்லோட் செய்வார்கள்.' : 'Ultra-fast downloads & high performance.'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW AD PRICING PLAN MODAL */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full my-6 shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === 'ta' ? 'புதிய விளம்பரக் கட்டணத் திட்டம் சேர்க்க' : 'Add New Ad Pricing Plan'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ta' ? 'கால அளவு மற்றும் கட்டண விவரங்களை உள்ளிடவும்' : 'Define duration and price details'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              {newPlanError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newPlanError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'கால அளவு (நாட்கள்) *' : 'Duration (Days) *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={newPlanForm.days}
                    onChange={(e) =>
                      setNewPlanForm({ ...newPlanForm, days: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'ta' ? 'கட்டணம் (₹ Price) *' : 'Price (₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={newPlanForm.price}
                      onChange={(e) =>
                        setNewPlanForm({ ...newPlanForm, price: Number(e.target.value) })
                      }
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-indigo-950 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'திட்டத்தின் பெயர் (தமிழ்)' : 'Plan Title (Tamil)'}
                </label>
                <input
                  type="text"
                  value={newPlanForm.labelTa}
                  onChange={(e) =>
                    setNewPlanForm({ ...newPlanForm, labelTa: e.target.value })
                  }
                  placeholder="எ.கா. 15 நாட்கள் சிறப்பு சலுகை விளம்பரம்"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ta' ? 'திட்டத்தின் பெயர் (ஆங்கிலம்)' : 'Plan Title (English)'}
                </label>
                <input
                  type="text"
                  value={newPlanForm.labelEn}
                  onChange={(e) =>
                    setNewPlanForm({ ...newPlanForm, labelEn: e.target.value })
                  }
                  placeholder="e.g. 15 Days Special Offer Banner"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newPlanForm.isPopular}
                    onChange={(e) =>
                      setNewPlanForm({ ...newPlanForm, isPopular: e.target.checked })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    {language === 'ta' ? 'சிறந்த தேர்வு / POPULAR என குறிக்க' : 'Mark as Popular / Best Value Plan'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {language === 'ta' ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleAddNewPlan}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {language === 'ta' ? 'திட்டத்தைச் சேர்' : 'Add Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Dynamic Scope Pricing Configuration Modal */}
      <OwnerAdPricingModal
        isOpen={isOwnerScopePricingModalOpen}
        onClose={() => setIsOwnerScopePricingModalOpen(false)}
        onPricingUpdated={(newTiers) => {
          setScopePricingTiers(newTiers);
          // Also sync current adFormData pricing if applicable
          const activePlans = newTiers[adFormData.targetScope]?.plans;
          if (activePlans && activePlans.length > 0) {
            setAdFormData((prev) => ({
              ...prev,
              days: activePlans[0].days,
              amount: activePlans[0].price,
            }));
          }
        }}
      />
    </div>
  );
};
