import React, { useState, useEffect, useRef } from 'react';
import {
  Screen,
  Job,
  JobSeeker,
  Advertisement,
  RecruitmentRequest,
  PaymentTransaction,
  EmployerSubscription,
  AppNotification,
  OwnerPaymentConfig,
  AppControlConfig,
  AdPricingPlan,
} from './types';
import { INITIAL_JOBS, INITIAL_JOB_SEEKERS } from './data/initialData';
import {
  INITIAL_ADVERTISEMENTS,
  INITIAL_RECRUITMENT_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_OWNER_PAYMENT_CONFIG,
  SUBSCRIPTION_PLANS,
  DEFAULT_AD_PRICING,
} from './data/monetizationData';
import { DEFAULT_APP_CONTROL_CONFIG } from './data/appControlData';
import { saveAdsSafely, loadAdsFromIndexedDB } from './utils/adStorage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { JobListScreen } from './components/JobListScreen';
import { PostJobScreen } from './components/PostJobScreen';
import { RegisterSeekerScreen } from './components/RegisterSeekerScreen';
import { SeekersListScreen } from './components/SeekersListScreen';
import { PricingScreen } from './components/PricingScreen';
import { AdvertiseScreen } from './components/AdvertiseScreen';
import { FindWorkersScreen } from './components/FindWorkersScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { TransactionsScreen } from './components/TransactionsScreen';
import { NotificationModal } from './components/NotificationModal';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { AdBannerCarousel } from './components/AdBannerCarousel';
import { CategoriesScreen } from './components/CategoriesScreen';
import { MediaAdsScreen } from './components/MediaAdsScreen';
import { ShopsScreen } from './components/ShopsScreen';
import { AddShopScreen } from './components/AddShopScreen';
import { MyPostsScreen } from './components/MyPostsScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { JobDetailModal } from './components/JobDetailModal';
import { getSavedUserLocation } from './data/locations';
import { VoiceSearchTarget } from './components/VoiceSearchModal';
import { initCapacitor } from './utils/capacitorInit';

const DEFAULT_FREE_SUBSCRIPTION: EmployerSubscription = {
  planId: 'free',
  employerName: 'Default Employer',
  employerPhone: '9876543210',
  startedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  featuredCreditsRemaining: 0,
  status: 'active',
};

function MainApp() {
  const { language } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState<string>('');
  const [seekerSearchQuery, setSeekerSearchQuery] = useState<string>('');
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [favoriteJobDetail, setFavoriteJobDetail] = useState<Job | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'github' | 'export' | 'language' | 'security' | 'location' | 'notifications'>('language');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenGitHub = () => {
    setSettingsInitialTab('github');
    setIsSettingsOpen(true);
  };

  const handleOpenSettings = () => {
    setSettingsInitialTab('language');
    setIsSettingsOpen(true);
  };
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const handleResetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (e) {
      console.error('Error resetting onboarding:', e);
    }
    setIsOnboardingOpen(true);
  };

  const [screenHistory, setScreenHistory] = useState<Screen[]>(['home']);

  // Ref tracking current UI state for native Android hardware back button handling
  const appStateRef = useRef({
    favoriteJobDetail,
    isNotificationsOpen,
    isSettingsOpen,
    isHelpOpen,
    isOnboardingOpen,
    currentScreen,
    screenHistory: ['home'] as Screen[],
  });

  useEffect(() => {
    appStateRef.current = {
      favoriteJobDetail,
      isNotificationsOpen,
      isSettingsOpen,
      isHelpOpen,
      isOnboardingOpen,
      currentScreen,
      screenHistory,
    };
  }, [
    favoriteJobDetail,
    isNotificationsOpen,
    isSettingsOpen,
    isHelpOpen,
    isOnboardingOpen,
    currentScreen,
    screenHistory,
  ]);

  useEffect(() => {
    initCapacitor({
      hasOpenModal: () => {
        const s = appStateRef.current;
        return !!(
          s.favoriteJobDetail ||
          s.isNotificationsOpen ||
          s.isSettingsOpen ||
          s.isHelpOpen ||
          s.isOnboardingOpen
        );
      },
      closeTopModal: () => {
        const s = appStateRef.current;
        if (s.favoriteJobDetail) {
          setFavoriteJobDetail(null);
          return true;
        }
        if (s.isNotificationsOpen) {
          setIsNotificationsOpen(false);
          return true;
        }
        if (s.isSettingsOpen) {
          setIsSettingsOpen(false);
          return true;
        }
        if (s.isHelpOpen) {
          setIsHelpOpen(false);
          return true;
        }
        if (s.isOnboardingOpen) {
          setIsOnboardingOpen(false);
          return true;
        }
        return false;
      },
      canGoBack: () => {
        const s = appStateRef.current;
        return s.screenHistory.length > 1 || s.currentScreen !== 'home';
      },
      goBack: () => {
        setScreenHistory((prev) => {
          if (prev.length > 1) {
            const nextHist = prev.slice(0, -1);
            setCurrentScreen(nextHist[nextHist.length - 1]);
            return nextHist;
          } else {
            setCurrentScreen('home');
            return ['home'];
          }
        });
      },
    });
  }, []);

  // 1. Jobs State
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_jobs_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading jobs:', e);
    }
    return INITIAL_JOBS;
  });

  // 2. Seekers State
  const [seekers, setSeekers] = useState<JobSeeker[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_seekers_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading seekers:', e);
    }
    return INITIAL_JOB_SEEKERS;
  });

  // 3. Advertisements State
  const [ads, setAds] = useState<Advertisement[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_ads_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading ads:', e);
    }
    return INITIAL_ADVERTISEMENTS;
  });

  // 4. Recruitment Requests State
  const [recruitmentRequests, setRecruitmentRequests] = useState<RecruitmentRequest[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_recruitment_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading recruitment:', e);
    }
    return INITIAL_RECRUITMENT_REQUESTS;
  });

  // 5. Payment Transactions State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_tx_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading tx:', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // 6. Employer Subscription State
  const [subscription, setSubscription] = useState<EmployerSubscription>(() => {
    try {
      const saved = localStorage.getItem('daily_work_subscription_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.planId) {
          return { ...DEFAULT_FREE_SUBSCRIPTION, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading subscription:', e);
    }
    return DEFAULT_FREE_SUBSCRIPTION;
  });

  // 7. App Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_notifications_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // 8. Owner Payment Configuration State
  const [ownerPaymentConfig, setOwnerPaymentConfig] = useState<OwnerPaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('daily_work_owner_payment_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_OWNER_PAYMENT_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading owner payment config:', e);
    }
    return DEFAULT_OWNER_PAYMENT_CONFIG;
  });

  // 9. App Control Configuration State (Support Desk Hotline & Remote Config)
  const [appControlConfig, setAppControlConfig] = useState<AppControlConfig>(() => {
    try {
      const saved = localStorage.getItem('daily_work_app_control_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_APP_CONTROL_CONFIG, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading app control config:', e);
    }
    return DEFAULT_APP_CONTROL_CONFIG;
  });

  // 10. Advertisement Pricing Plans State (Admin Configurable)
  const [adPricingPlans, setAdPricingPlans] = useState<AdPricingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('daily_work_ad_pricing_v1');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading ad pricing plans:', e);
    }
    return DEFAULT_AD_PRICING;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('daily_work_jobs_v1', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('daily_work_seekers_v1', JSON.stringify(seekers));
  }, [seekers]);

  // Hydrate full ads from IndexedDB (supports high-res videos & photos across sessions)
  useEffect(() => {
    let isMounted = true;
    loadAdsFromIndexedDB().then((indexedAds) => {
      if (isMounted && indexedAds && indexedAds.length > 0) {
        setAds(indexedAds);
      }
    }).catch((e) => console.warn('Could not load ads from IndexedDB:', e));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    saveAdsSafely(ads).catch((err) => console.warn('Error saving ads safely:', err));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem('daily_work_recruitment_v1', JSON.stringify(recruitmentRequests));
  }, [recruitmentRequests]);

  useEffect(() => {
    localStorage.setItem('daily_work_tx_v1', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('daily_work_subscription_v1', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('daily_work_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('daily_work_owner_payment_v1', JSON.stringify(ownerPaymentConfig));
  }, [ownerPaymentConfig]);

  useEffect(() => {
    localStorage.setItem('daily_work_app_control_v1', JSON.stringify(appControlConfig));
  }, [appControlConfig]);

  useEffect(() => {
    localStorage.setItem('daily_work_ad_pricing_v1', JSON.stringify(adPricingPlans));
  }, [adPricingPlans]);

  // Handler to update Ad Pricing Plans (Admin Configuration)
  const handleUpdateAdPricingPlans = (plans: AdPricingPlan[]) => {
    setAdPricingPlans(plans);
    pushNotification({
      titleEn: 'Ad Pricing Configured',
      titleTa: 'விளம்பரக் கட்டணங்கள் மாற்றப்பட்டன',
      messageEn: `Admin updated advertisement pricing plans (${plans.length} active packages).`,
      messageTa: `நிர்வாகம் விளம்பரக் கட்டண திட்டங்களை வெற்றிகரமாக மாற்றியுள்ளது (${plans.length} திட்டங்கள் செயலில் உள்ளன).`,
      type: 'system',
    });
  };

  // Handler to update App Control Config
  const handleUpdateAppControlConfig = (config: AppControlConfig) => {
    setAppControlConfig(config);
    pushNotification({
      titleEn: 'Help & Support Contacts Updated',
      titleTa: 'உதவி தொடர்பு எண்கள் மாற்றப்பட்டன',
      messageEn: `Hotline updated: Phone ${config.supportPhone}, WhatsApp +91 ${config.supportWhatsApp}, Email ${config.supportEmail}`,
      messageTa: `தொடர்பு எண்கள் மாற்றப்பட்டன: போன் ${config.supportPhone}, வாட்ஸ்அப் +91 ${config.supportWhatsApp}, மின்னஞ்சல் ${config.supportEmail}`,
      type: 'system',
    });
  };

  // Helper to push a notification
  const pushNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handler to add a new job
  const handleAddJob = (
    newJobData: Omit<Job, 'id' | 'createdAt'>,
    tx?: PaymentTransaction
  ) => {
    const newJob: Job = {
      ...newJobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    if (tx) {
      setTransactions((prev) => [tx, ...prev]);
    } else if (newJobData.isFeatured && (subscription?.featuredCreditsRemaining || 0) > 0) {
      // Deduct one featured credit from subscription
      setSubscription((prev) => ({
        ...(prev || DEFAULT_FREE_SUBSCRIPTION),
        featuredCreditsRemaining: Math.max(0, (prev?.featuredCreditsRemaining || 0) - 1),
      }));
    }

    pushNotification({
      titleEn: 'Job Posted Successfully',
      titleTa: 'வேலை வெற்றிகரமாக பதியப்பட்டது',
      messageEn: newJobData.isFeatured
        ? `Your featured job for "${newJobData.employerName}" is now active and pinned at top.`
        : `Your job listing for "${newJobData.employerName}" is now live for workers.`,
      messageTa: newJobData.isFeatured
        ? `"${newJobData.employerName}" சிறப்பு வேலை இப்போது பட்டியலில் முதலிடத்தில் உள்ளது.`
        : `"${newJobData.employerName}" வேலை விவரம் தொழிலாளர்களுக்கு தென்படும்.`,
      type: 'job',
    });
  };

  // Handler to boost an existing job to Featured
  const handleBoostJob = (jobId: string, days: number = 3) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              isFeatured: true,
              featuredUntil: expiry.toISOString(),
            }
          : j
      )
    );

    // Record mock payment transaction for boost
    const tx: PaymentTransaction = {
      id: `tx-boost-${Date.now()}`,
      receiptNumber: `DW-BST-${Date.now().toString().slice(-6)}`,
      amount: 99,
      purpose: 'featured_job',
      targetItemId: jobId,
      itemTitleEn: `Boost Job (${targetJob.employerName})`,
      itemTitleTa: `சிறப்பு வேலை மேம்பாடு (${targetJob.employerName})`,
      payerName: targetJob.employerName,
      payerPhone: targetJob.contactNumber,
      paymentMethod: 'upi_phonepe',
      status: 'successful',
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);

    pushNotification({
      titleEn: 'Job Boosted to Featured!',
      titleTa: 'வேலை சிறப்பு வேலை பட்டியலில் சேர்க்கப்பட்டது!',
      messageEn: `"${targetJob.employerName}" job has been boosted with 3-day top placement.`,
      messageTa: `"${targetJob.employerName}" வேலை 3 நாட்களுக்கு பட்டியலில் முதலிடத்தில் தோன்றும்.`,
      type: 'payment',
    });
  };

  // Handler to add advertisement
  const handleAddAd = (newAdData: Omit<Advertisement, 'id' | 'submittedAt'> | Advertisement, tx?: PaymentTransaction) => {
    const newAd: Advertisement = {
      ...newAdData,
      id: (newAdData as Advertisement).id || `ad-${Date.now()}`,
      status: (newAdData as Advertisement).status || 'pending',
      submittedAt: (newAdData as Advertisement).submittedAt || new Date().toISOString(),
    };
    setAds((prev) => [newAd, ...prev]);
    if (tx) {
      setTransactions((prev) => [tx, ...prev]);
    }

    pushNotification({
      titleEn: 'Ad Submission Received',
      titleTa: 'விளம்பரம் சமர்ப்பிக்கப்பட்டது',
      messageEn: `Ad for "${newAd.businessName}" is under admin review. It will go live after approval.`,
      messageTa: `"${newAd.businessName}" விளம்பரம் நிர்வாக ஒப்புதலுக்கு அனுப்பப்பட்டுள்ளது. அனுமதி கிடைத்த பின் பயன்பாட்டில் தோன்றும்.`,
      type: 'ad_status',
    });
  };

  // Handler to add recruitment request
  const handleAddRecruitmentRequest = (
    newReqData: Omit<RecruitmentRequest, 'id' | 'createdAt'>,
    tx: PaymentTransaction
  ) => {
    const newReq: RecruitmentRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecruitmentRequests((prev) => [newReq, ...prev]);
    setTransactions((prev) => [tx, ...prev]);

    pushNotification({
      titleEn: 'Recruitment Request Placed',
      titleTa: 'ஆட்கள் தேவை கோரிக்கை பெறப்பட்டது',
      messageEn: `Request for ${newReq.workersNeeded} workers at ${newReq.location} has been assigned to local manager.`,
      messageTa: `${newReq.workersNeeded} தொழிலாளர்கள் ஏற்பாடு செய்ய மேலாளர் தொடர்பு கொள்வார்.`,
      type: 'recruitment',
    });
  };

  // Handler to upgrade subscription
  const handleUpgradeSubscription = (
    newSubOrPlanId: EmployerSubscription | 'free' | 'basic' | 'premium',
    tx: PaymentTransaction
  ) => {
    let updatedSub: EmployerSubscription;
    if (typeof newSubOrPlanId === 'string') {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === newSubOrPlanId);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      updatedSub = {
        planId: newSubOrPlanId,
        status: 'active',
        featuredCreditsRemaining: plan?.featuredCredits || 0,
        expiresAt: expiry.toISOString(),
        startedAt: new Date().toISOString(),
        employerName: tx?.payerName || subscription?.employerName || '',
        employerPhone: tx?.payerPhone || subscription?.employerPhone || '',
      };
    } else {
      updatedSub = newSubOrPlanId;
    }

    setSubscription(updatedSub);
    if (tx) {
      setTransactions((prev) => [tx, ...prev]);
    }

    pushNotification({
      titleEn: 'Subscription Upgraded!',
      titleTa: 'சந்தா திட்டம் புதுப்பிக்கப்பட்டது!',
      messageEn: `You are now on the ${(updatedSub.planId || 'free').toUpperCase()} plan with ${updatedSub.featuredCreditsRemaining || 0} featured credits.`,
      messageTa: `நீங்கள் ${(updatedSub.planId || 'free').toUpperCase()} திட்டத்திற்கு மேம்படுத்தப்பட்டுள்ளீர்கள்.`,
      type: 'subscription',
    });
  };

  // Admin: Add Ad for Customer
  const handleAdminAddAd = (newAd: Advertisement, tx?: PaymentTransaction) => {
    setAds((prev) => [newAd, ...prev]);
    if (tx) {
      setTransactions((prev) => [tx, ...prev]);
    }
    pushNotification({
      titleEn: 'Customer Ad Published by Owner!',
      titleTa: 'வாடிக்கையாளர் விளம்பரம் வெளியிடப்பட்டது!',
      messageEn: `Advertisement for "${newAd.businessName}" is now active in the feed!`,
      messageTa: `"${newAd.businessName}" விளம்பரம் பயன்பாட்டில் வெற்றிகரமாக வெளியிடப்பட்டது!`,
      type: 'ad_status',
    });
  };

  // Helper to compute ad expiration timestamp
  const getAdExpiryTime = (ad: Advertisement): number => {
    if (ad.expiresAt) {
      const t = new Date(ad.expiresAt).getTime();
      if (!isNaN(t)) return t;
    }
    const baseTime = ad.approvedAt ? new Date(ad.approvedAt).getTime() : new Date(ad.submittedAt).getTime();
    const days = ad.days || 7;
    return baseTime + days * 24 * 60 * 60 * 1000;
  };

  // Check and notify advertisers when ad broadcast duration ends, prompting renewal
  useEffect(() => {
    try {
      const notifiedMap: Record<string, boolean> = JSON.parse(
        localStorage.getItem('daily_work_notified_ad_expiries_v2') || '{}'
      );
      let mapUpdated = false;

      ads.forEach((ad) => {
        if (!ad.id || ad.status === 'rejected') return;
        const expiryTime = getAdExpiryTime(ad);
        const isExpired = Date.now() >= expiryTime;
        const isExpiringWithin24h = !isExpired && (expiryTime - Date.now() <= 24 * 60 * 60 * 1000);

        // Notify on expiration
        if (isExpired && !notifiedMap[`expired_${ad.id}`]) {
          notifiedMap[`expired_${ad.id}`] = true;
          mapUpdated = true;

          // Push in-app alert notification
          pushNotification({
            titleEn: `⚠️ Ad Expired: "${ad.businessName}"`,
            titleTa: `⚠️ விளம்பர ஒளிபரப்பு காலம் முடிந்தது: "${ad.businessName}"`,
            messageEn: `The ${ad.days || 7}-day broadcast for "${ad.businessName}" has ended. Tap here to renew your advertisement immediately!`,
            messageTa: `"${ad.businessName}" விளம்பரத்தின் ஒளிபரப்பு காலம் (${ad.days || 7} நாட்கள்) நிறைவடைந்தது. தொடர்ந்து வாடிக்கையாளர்களை பெற உடனே புதுப்பிக்கவும்!`,
            type: 'featured_expiry',
            actionScreen: 'advertise',
          });

          // Direct advertiser notification log
          try {
            const directKey = 'direct_advertiser_notifications_v1';
            const existing = JSON.parse(localStorage.getItem(directKey) || '[]');
            const cleanPhone = (ad.phone || '').replace(/[^0-9]/g, '');
            const directNotif = {
              id: `expiry-reminder-${ad.id}-${Date.now()}`,
              adId: ad.id,
              phone: cleanPhone,
              businessName: ad.businessName,
              status: 'expired',
              isExpired: true,
              needsRenewal: true,
              timestamp: new Date().toISOString(),
              messageTa: `வணக்கம்! உங்கள் "${ad.businessName}" விளம்பரத்தின் ${ad.days || 7} நாட்கள் ஒளிபரப்பு முடிவடைந்தது. மீண்டும் புதுப்பிக்க இங்கே கிளிக் செய்யவும்.`,
              messageEn: `Your ad "${ad.businessName}" (${ad.days || 7} days) broadcast has ended. Tap to renew.`,
            };
            existing.unshift(directNotif);
            localStorage.setItem(directKey, JSON.stringify(existing.slice(0, 50)));
          } catch {}

          // Browser notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Daily Work: விளம்பரம் முடிவடைந்தது`, {
                body: `"${ad.businessName}" விளம்பரம் முடிவடைந்தது. மீண்டும் புதுப்பிக்க செயலியை திறக்கவும்.`,
              });
            } catch {}
          }
        } else if (isExpiringWithin24h && !notifiedMap[`expiring_soon_${ad.id}`]) {
          notifiedMap[`expiring_soon_${ad.id}`] = true;
          mapUpdated = true;

          pushNotification({
            titleEn: `⏳ Ad Ending Soon: "${ad.businessName}"`,
            titleTa: `⏳ விளம்பரம் விரைவில் முடிகிறது: "${ad.businessName}"`,
            messageEn: `Your ad "${ad.businessName}" will expire within 24 hours. Renew now to avoid interruption in promotion.`,
            messageTa: `"${ad.businessName}" விளம்பரம் அடுத்த 24 மணி நேரத்திற்குள் நிறைவடைகிறது. தடையின்றி இயங்க இன்றே புதுப்பிக்கவும்.`,
            type: 'featured_expiry',
            actionScreen: 'advertise',
          });
        }
      });

      if (mapUpdated) {
        localStorage.setItem('daily_work_notified_ad_expiries_v2', JSON.stringify(notifiedMap));
      }
    } catch (e) {
      console.error('Error checking ad expiries:', e);
    }
  }, [ads]);

  // Renew an existing advertisement
  const handleRenewAd = (adId: string, days: number, tx?: PaymentTransaction) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    setAds((prev) =>
      prev.map((a) => {
        if (a.id === adId) {
          return {
            ...a,
            status: 'approved',
            days,
            approvedAt: now.toISOString(),
            expiresAt: expiry.toISOString(),
          };
        }
        return a;
      })
    );

    if (tx) {
      setTransactions((prev) => [tx, ...prev]);
    }

    // Reset expiry notification flag so it will notify again when the new period ends
    try {
      const notifiedMap = JSON.parse(localStorage.getItem('daily_work_notified_ad_expiries_v2') || '{}');
      delete notifiedMap[`expired_${adId}`];
      delete notifiedMap[`expiring_soon_${adId}`];
      localStorage.setItem('daily_work_notified_ad_expiries_v2', JSON.stringify(notifiedMap));
    } catch {}

    const targetAd = ads.find((a) => a.id === adId);
    pushNotification({
      titleEn: '🎉 Advertisement Successfully Renewed!',
      titleTa: '🎉 விளம்பரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
      messageEn: `Ad for "${targetAd?.businessName || 'Business'}" is renewed for ${days} days and is live!`,
      messageTa: `"${targetAd?.businessName || 'வணிகம்'}" விளம்பரம் மேலும் ${days} நாட்களுக்கு வெற்றிகரமாக புதுப்பிக்கப்பட்டு நேரலையானது!`,
      type: 'ad_status',
      actionScreen: 'advertise',
    });
  };

  // Admin: Issue Refund
  const handleIssueRefund = (txId: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'refunded', refundReason: reason } : t))
    );
    pushNotification({
      titleEn: 'Refund Processed',
      titleTa: 'கட்டணம் திரும்ப வழங்கப்பட்டது',
      messageEn: `Refund issued: ${reason}`,
      messageTa: `கட்டணம் திரும்ப வழங்கப்பட்டது: ${reason}`,
      type: 'payment',
    });
  };

  // Admin: Update Ad Status
  const handleUpdateAdStatus = (adId: string, status: 'approved' | 'rejected') => {
    setAds((prev) =>
      prev.map((a) =>
        a.id === adId
          ? {
              ...a,
              status,
              approvedAt: status === 'approved' ? (a.approvedAt || new Date().toISOString()) : a.approvedAt,
            }
          : a
      )
    );

    const targetAd = ads.find((a) => a.id === adId);
    if (targetAd) {
      // 1. In-app Push Notification
      pushNotification({
        titleEn: status === 'approved' ? '🎉 Advertisement Approved & Live!' : 'Advertisement Update',
        titleTa: status === 'approved' ? '🎉 விளம்பரம் அங்கீகரிக்கப்பட்டு நேரலையானது!' : 'விளம்பரம் நிராகரிக்கப்பட்டது',
        messageEn: status === 'approved'
          ? `Ad for "${targetAd.businessName}" is approved by Admin and is now live across the app!`
          : `Ad for "${targetAd.businessName}" could not be approved at this time.`,
        messageTa: status === 'approved'
          ? `"${targetAd.businessName}" விளம்பரம் நிர்வாகத்தால் அங்கீகரிக்கப்பட்டு செயலியில் நேரலையாக ஒளிபரப்பாகிறது!`
          : `"${targetAd.businessName}" விளம்பரம் நிர்வாகத்தால் அனுமதிக்கப்படவில்லை.`,
        type: 'ad_status',
      });

      // 2. Direct advertiser notification persistence
      const cleanPhone = targetAd.phone.replace(/[^0-9]/g, '');
      const directNotif = {
        id: `ad-notif-${Date.now()}`,
        adId: targetAd.id,
        phone: cleanPhone,
        businessName: targetAd.businessName,
        status,
        timestamp: new Date().toISOString(),
        messageTa: status === 'approved'
          ? `வணக்கம்! உங்கள் "${targetAd.businessName}" விளம்பரம் நிர்வாகத்தால் அங்கீகரிக்கப்பட்டு செயலியில் நேரலையாக ஒளிபரப்பாகிறது.`
          : `உங்கள் "${targetAd.businessName}" விளம்பரம் அனுமதிக்கப்படவில்லை.`,
        messageEn: status === 'approved'
          ? `Your ad "${targetAd.businessName}" is approved by admin and is now LIVE.`
          : `Your ad "${targetAd.businessName}" could not be approved.`,
      };

      try {
        const existing = JSON.parse(localStorage.getItem('direct_advertiser_notifications_v1') || '[]');
        existing.unshift(directNotif);
        localStorage.setItem('direct_advertiser_notifications_v1', JSON.stringify(existing.slice(0, 50)));
      } catch (e) {
        console.warn('Could not persist advertiser notification', e);
      }

      // 3. Browser Desktop Notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(status === 'approved' ? 'Daily Work: Ad Approved & Live!' : 'Daily Work: Ad Update', {
            body: status === 'approved'
              ? `Ad "${targetAd.businessName}" is approved by owner & now active.`
              : `Ad "${targetAd.businessName}" was reviewed.`,
          });
        } catch (e) {
          // Ignore notification errors in iframe
        }
      }
    }
  };

  // Admin: Update Recruitment Request Status
  const handleUpdateRecruitmentStatus = (
    requestId: string,
    status: RecruitmentRequest['status'],
    assignedNotes?: string
  ) => {
    setRecruitmentRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              assignedWorkersNotes: assignedNotes ?? r.assignedWorkersNotes,
            }
          : r
      )
    );

    const targetReq = recruitmentRequests.find((r) => r.id === requestId);
    if (targetReq) {
      pushNotification({
        titleEn: `Recruitment Request: ${status.toUpperCase()}`,
        titleTa: `ஆட்கள் சேவை: ${status === 'completed' ? 'நிறைவடைந்தது' : 'செயலில் உள்ளது'}`,
        messageEn: `Your request for ${targetReq.workersNeeded} workers is now marked as ${status}.`,
        messageTa: `${targetReq.workersNeeded} ஆட்கள் கோரிக்கை நிலை: ${status}.`,
        type: 'recruitment',
      });
    }
  };

  // Delete single job post
  const handleDeleteJob = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    pushNotification({
      titleEn: 'Job Post Removed',
      titleTa: 'வேலை பதிவு நீக்கப்பட்டது',
      messageEn: `The listing "${targetJob?.employerName || 'Job'}" was deleted successfully.`,
      messageTa: `"${targetJob?.employerName || 'வேலை'}" பதிவு வெற்றிகரமாக நீக்கப்பட்டது.`,
      type: 'system',
    });
  };

  // Batch clear old jobs
  const handleClearOldJobs = (olderThanDays: number = 3) => {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    setJobs((prev) =>
      prev.filter((j) => {
        const jobDate = new Date(j.jobDate || j.createdAt).getTime();
        if (isNaN(jobDate)) return true;
        return jobDate >= cutoffTime;
      })
    );
    pushNotification({
      titleEn: 'Old Jobs Cleaned',
      titleTa: 'பழைய வேலைகள் நீக்கப்பட்டன',
      messageEn: `Job listings older than ${olderThanDays} days have been cleaned up.`,
      messageTa: `${olderThanDays} நாட்களுக்கு முந்தைய பழைய வேலைகள் நீக்கப்பட்டன.`,
      type: 'system',
    });
  };

  // Delete advertisement
  const handleDeleteAd = (adId: string) => {
    const targetAd = ads.find((a) => a.id === adId);
    setAds((prev) => prev.filter((a) => a.id !== adId));
    pushNotification({
      titleEn: 'Advertisement Removed',
      titleTa: 'விளம்பரம் நீக்கப்பட்டது',
      messageEn: `Ad for "${targetAd?.businessName || 'Business'}" removed.`,
      messageTa: `"${targetAd?.businessName || 'வணிகம்'}" விளம்பரம் நீக்கப்பட்டது.`,
      type: 'ad_status',
    });
  };

  // Batch clear expired ads
  const handleClearExpiredAds = () => {
    const now = Date.now();
    setAds((prev) =>
      prev.filter((ad) => {
        if (ad.status === 'rejected') return false;
        if (ad.approvedAt) {
          const expiry = new Date(ad.approvedAt).getTime() + (ad.days || 7) * 24 * 60 * 60 * 1000;
          if (expiry < now) return false;
        }
        return true;
      })
    );
    pushNotification({
      titleEn: 'Expired Advertisements Cleaned',
      titleTa: 'காலாவதியான விளம்பரங்கள் நீக்கப்பட்டன',
      messageEn: 'Expired and rejected ads have been cleaned up.',
      messageTa: 'காலாவதியான மற்றும் நிராகரிக்கப்பட்ட விளம்பரங்கள் நீக்கப்பட்டன.',
      type: 'system',
    });
  };

  // Delete recruitment request
  const handleDeleteRecruitmentRequest = (reqId: string) => {
    setRecruitmentRequests((prev) => prev.filter((r) => r.id !== reqId));
    pushNotification({
      titleEn: 'Recruitment Request Removed',
      titleTa: 'ஆட்கள் தேவை கோரிக்கை நீக்கப்பட்டது',
      messageEn: 'The recruitment request has been removed.',
      messageTa: 'ஆட்கள் தேவை கோரிக்கை நீக்கப்பட்டது.',
      type: 'system',
    });
  };

  // Batch clean completed recruitment requests
  const handleClearCompletedRecruitmentRequests = () => {
    setRecruitmentRequests((prev) =>
      prev.filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
    );
    pushNotification({
      titleEn: 'Completed Requests Cleaned',
      titleTa: 'முடிவடைந்த கோரிக்கைகள் நீக்கப்பட்டன',
      messageEn: 'Completed recruitment requests have been cleared.',
      messageTa: 'முடிவடைந்த ஆட்கள் கோரிக்கைகள் நீக்கப்பட்டன.',
      type: 'system',
    });
  };

  // Update Owner Payment Configuration
  const handleUpdateOwnerPaymentConfig = (config: OwnerPaymentConfig) => {
    setOwnerPaymentConfig(config);
    pushNotification({
      titleEn: 'Owner Payment Details Saved',
      titleTa: 'உரிமையாளர் கட்டண விவரங்கள் சேமிக்கப்பட்டன',
      messageEn: 'Customer advertisement payments will now display the updated owner payment options.',
      messageTa: 'விளம்பர வாடிக்கையாளர்கள் புதிய உரிமையாளர் கட்டண முறைகளைப் பயன்படுத்துவர்.',
      type: 'payment',
    });
  };

  // Register Seeker
  const handleRegisterSeeker = (newSeekerData: Omit<JobSeeker, 'id' | 'registeredAt'>) => {
    const newSeeker: JobSeeker = {
      ...newSeekerData,
      id: `seeker-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };
    setSeekers((prev) => [newSeeker, ...prev]);

    pushNotification({
      titleEn: 'Worker Profile Registered',
      titleTa: 'தொழிலாளர் சுயவிவரம் பதிவு செய்யப்பட்டது',
      messageEn: `${newSeeker.name} is now visible to local employers looking for workers.`,
      messageTa: `${newSeeker.name} சுயவிவரம் உள்ளூர் முதலாளிகளுக்கு தென்படும்.`,
      type: 'system',
    });
  };

  // Update Seeker Profile
  const handleUpdateSeeker = (updatedSeeker: JobSeeker) => {
    setSeekers((prev) => prev.map((s) => (s.id === updatedSeeker.id ? updatedSeeker : s)));
    pushNotification({
      titleEn: 'Worker Profile Updated',
      titleTa: 'தொழிலாளர் பதிவு புதுப்பிக்கப்பட்டது',
      messageEn: `Profile for ${updatedSeeker.name} updated successfully.`,
      messageTa: `${updatedSeeker.name} விவரங்கள் சேமிக்கப்பட்டன.`,
      type: 'system',
    });
  };

  // Delete Seeker Profile
  const handleDeleteSeeker = (seekerId: string) => {
    const targetSeeker = seekers.find((s) => s.id === seekerId);
    setSeekers((prev) => prev.filter((s) => s.id !== seekerId));
    pushNotification({
      titleEn: 'Worker Profile Removed',
      titleTa: 'தொழிலாளர் பதிவு நீக்கப்பட்டது',
      messageEn: `Profile for ${targetSeeker?.name || 'Worker'} removed.`,
      messageTa: `${targetSeeker?.name || 'தொழிலாளர்'} பதிவு நீக்கப்பட்டது.`,
      type: 'system',
    });
  };

  // Update Job Listing
  const handleUpdateJob = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    pushNotification({
      titleEn: 'Job Post Updated',
      titleTa: 'வேலை பதிவு புதுப்பிக்கப்பட்டது',
      messageEn: `Job listing "${updatedJob.employerName}" updated successfully.`,
      messageTa: `"${updatedJob.employerName}" வேலை பதிவு புதுப்பிக்கப்பட்டது.`,
      type: 'system',
    });
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNavigate = (screen: Screen) => {
    if (screen !== currentScreen) {
      setScreenHistory((prev) => [...prev, screen]);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoiceSearch = (query: string, target?: VoiceSearchTarget) => {
    if (target === 'workers') {
      setSeekerSearchQuery(query);
      handleNavigate('seekers-list');
    } else if (target === 'shops') {
      setShopSearchQuery(query);
      handleNavigate('shops');
    } else {
      setSelectedCategory('all');
      setJobSearchQuery(query);
      handleNavigate('jobs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const userLoc = getSavedUserLocation();
  // Filter/prioritize active non-expired ads by the user's location (country/state/city)
  const locationAwareAds = React.useMemo(() => {
    const approvedAndActive = ads.filter((a) => {
      if (a.status !== 'approved') return false;
      const expiry = getAdExpiryTime(a);
      return Date.now() < expiry;
    });

    if (!userLoc?.city && !userLoc?.state) return approvedAndActive;

    const localAds = approvedAndActive.filter((a) => {
      const locStr = `${a.location || ''} ${a.city || ''} ${a.state || ''}`.toLowerCase();
      const userCity = (userLoc.city || '').toLowerCase();
      const userState = (userLoc.state || '').toLowerCase();
      return (userCity && locStr.includes(userCity)) || (userState && locStr.includes(userState));
    });

    if (localAds.length > 0) {
      const otherAds = approvedAndActive.filter((a) => !localAds.includes(a));
      return [...localAds, ...otherAds];
    }
    return approvedAndActive;
  }, [ads, userLoc?.city, userLoc?.state]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between overflow-x-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col relative shadow-xl border-x border-slate-200 overflow-x-hidden">
        {/* Sticky Mobile Header with Language Selector, Settings, Help & Notification Bell & Admin Switch */}
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenSettings={handleOpenSettings}
          onOpenGitHub={handleOpenGitHub}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Clean Top Running Sponsor Advertisement Marquee (Displayed across all screens except home & admin) */}
        {currentScreen !== 'admin' && currentScreen !== 'home' && (
          <div id="top-running-ad-banner" className="px-3 sm:px-3.5 pt-2 pb-1 bg-slate-100/90 border-b border-slate-200/80">
            <AdBannerCarousel
              ads={locationAwareAds}
              defaultMode="ticker"
              showControls={true}
              compact={true}
              onNavigateToAdvertise={() => handleNavigate('advertise')}
            />
          </div>
        )}

        {/* Main Screen Body */}
        <main className="flex-1 p-3.5 sm:p-4">
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={handleNavigate}
              jobs={jobs}
              seekers={seekers}
              onSelectCategory={handleSelectCategory}
              ads={locationAwareAds}
              onVoiceSearch={handleVoiceSearch}
              onOpenHelp={() => setIsHelpOpen(true)}
              onOpenSettings={handleOpenSettings}
              onOpenGitHub={handleOpenGitHub}
            />
          )}

          {currentScreen === 'jobs' && (
            <JobListScreen
              jobs={jobs}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onNavigateToPost={() => handleNavigate('post-job')}
              onBoostJob={handleBoostJob}
              onDeleteJob={handleDeleteJob}
              ads={locationAwareAds.length > 0 ? locationAwareAds : ads}
              onNavigateToAdvertise={() => handleNavigate('advertise')}
              initialSearchQuery={jobSearchQuery}
              onSearchQueryChange={setJobSearchQuery}
              seekers={seekers}
              onNavigate={handleNavigate}
              onSelectSeekerQuery={setSeekerSearchQuery}
            />
          )}

          {currentScreen === 'post-job' && (
            <PostJobScreen
              onAddJob={handleAddJob}
              onNavigateToJobs={() => handleNavigate('jobs')}
              subscription={subscription}
            />
          )}

          {currentScreen === 'register-seeker' && (
            <RegisterSeekerScreen
              onRegisterSeeker={handleRegisterSeeker}
              onNavigateToJobs={() => handleNavigate('jobs')}
            />
          )}

          {currentScreen === 'seekers-list' && (
            <SeekersListScreen
              seekers={seekers}
              initialSearchQuery={seekerSearchQuery}
              onSearchQueryChange={setSeekerSearchQuery}
              onNavigateToRegister={() => handleNavigate('register-seeker')}
              jobs={jobs}
              onNavigate={handleNavigate}
              onSelectJobQuery={setJobSearchQuery}
            />
          )}

          {currentScreen === 'pricing' && (
            <PricingScreen
              subscription={subscription}
              currentSubscription={subscription}
              onUpdateSubscription={handleUpgradeSubscription}
              onUpgrade={handleUpgradeSubscription}
              onNavigateToPostJob={() => handleNavigate('post-job')}
              onNavigate={handleNavigate}
              ownerPaymentConfig={ownerPaymentConfig}
            />
          )}

          {currentScreen === 'advertise' && (
            <AdvertiseScreen
              ads={ads}
              onAddAdvertisement={handleAddAd}
              onRenewAd={handleRenewAd}
              onDeleteAd={handleDeleteAd}
              ownerPaymentConfig={ownerPaymentConfig}
              adPricingPlans={adPricingPlans}
              onNavigateToHome={() => handleNavigate('home')}
            />
          )}

          {currentScreen === 'find-workers' && (
            <FindWorkersScreen
              requests={recruitmentRequests || []}
              onAddRequest={handleAddRecruitmentRequest}
              onSubmitRequest={handleAddRecruitmentRequest}
              onNavigateToHome={() => handleNavigate('home')}
              onNavigate={handleNavigate}
              ownerPaymentConfig={ownerPaymentConfig}
            />
          )}

          {currentScreen === 'admin' && (
            <AdminDashboard
              ads={ads || []}
              recruitmentRequests={recruitmentRequests || []}
              transactions={transactions || []}
              jobs={jobs || []}
              onApproveAd={(adId) => handleUpdateAdStatus(adId, 'approved')}
              onRejectAd={(adId, reason) => handleUpdateAdStatus(adId, 'rejected')}
              onUpdateAdStatus={handleUpdateAdStatus}
              onUpdateRecruitmentStatus={handleUpdateRecruitmentStatus}
              onIssueRefund={handleIssueRefund}
              onToggleJobFeatured={handleBoostJob}
              onAddAdForCustomer={handleAdminAddAd}
              onNavigate={handleNavigate}
              onDeleteJob={handleDeleteJob}
              onClearOldJobs={handleClearOldJobs}
              onDeleteAd={handleDeleteAd}
              onClearExpiredAds={handleClearExpiredAds}
              onDeleteRecruitmentRequest={handleDeleteRecruitmentRequest}
              onClearCompletedRecruitmentRequests={handleClearCompletedRecruitmentRequests}
              ownerPaymentConfig={ownerPaymentConfig}
              onUpdateOwnerPaymentConfig={handleUpdateOwnerPaymentConfig}
              adPricingPlans={adPricingPlans}
              onUpdateAdPricingPlans={handleUpdateAdPricingPlans}
              appControlConfig={appControlConfig}
              onUpdateAppControlConfig={handleUpdateAppControlConfig}
              onResetOnboarding={handleResetOnboarding}
            />
          )}

          {currentScreen === 'transactions' && (
            <TransactionsScreen
              transactions={transactions || []}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'categories' && (
            <CategoriesScreen
              onNavigate={handleNavigate}
              onSelectCategory={handleSelectCategory}
              jobs={jobs}
            />
          )}

          {currentScreen === 'media-ads' && (
            <MediaAdsScreen
              ads={locationAwareAds}
              onNavigate={handleNavigate}
              onNavigateToAdvertise={() => handleNavigate('advertise')}
            />
          )}

          {currentScreen === 'shops' && (
            <ShopsScreen
              onNavigate={handleNavigate}
              initialTab="browse"
              initialSearchQuery={shopSearchQuery}
              onSearchQueryChange={setShopSearchQuery}
            />
          )}

          {currentScreen === 'add-shop' && (
            <AddShopScreen
              onNavigate={handleNavigate}
            />
          )}

          {(currentScreen === 'my-posts' || currentScreen === 'profile') && (
            <MyPostsScreen
              jobs={jobs || []}
              seekers={seekers || []}
              onUpdateJob={handleUpdateJob}
              onDeleteJob={handleDeleteJob}
              onUpdateSeeker={handleUpdateSeeker}
              onDeleteSeeker={handleDeleteSeeker}
              onRegisterSeeker={handleRegisterSeeker}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'favorites' && (
            <FavoritesScreen
              jobs={jobs || []}
              seekers={seekers || []}
              onNavigate={handleNavigate}
              onSelectJob={(job) => setFavoriteJobDetail(job)}
            />
          )}

          {favoriteJobDetail && (
            <JobDetailModal
              job={favoriteJobDetail}
              onClose={() => setFavoriteJobDetail(null)}
              onDeleteJob={handleDeleteJob}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          jobsCount={(jobs || []).length}
        />

        {/* System Notifications Modal */}
        <NotificationModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications || []}
          onMarkAllRead={handleMarkNotificationsRead}
          onMarkAllAsRead={handleMarkNotificationsRead}
          onNavigate={handleNavigate}
        />

        {/* Settings & Security Encryption Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          initialTab={settingsInitialTab}
          onClose={() => setIsSettingsOpen(false)}
          onOpenHelp={() => {
            setIsSettingsOpen(false);
            setIsHelpOpen(true);
          }}
          onResetOnboarding={handleResetOnboarding}
        />

        {/* Help & Support / Contact Management Team Modal */}
        <HelpSupportModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          onTicketCreated={(ticket) => {
            pushNotification({
              titleEn: 'Support Ticket Submitted',
              titleTa: 'உதவி கோரிக்கை சமர்ப்பிக்கப்பட்டது',
              messageEn: `Ticket #${ticket.ticketNumber} received. Management team will contact you shortly.`,
              messageTa: `கோரிக்கை எண் #${ticket.ticketNumber} பதிவு செய்யப்பட்டது. நிர்வாக குழு உங்களை விரைவில் தொடர்பு கொள்ளும்.`,
              type: 'system',
            });
          }}
          supportPhone={appControlConfig.supportPhone || '9840123456'}
          supportWhatsApp={appControlConfig.supportWhatsApp || appControlConfig.supportPhone || '9840123456'}
          supportEmail={appControlConfig.supportEmail || 'management@dailywork.app'}
          supportHours={
            language === 'ta'
              ? appControlConfig.supportWorkingHoursTa
              : appControlConfig.supportWorkingHoursEn
          }
          onOpenAdminControl={() => handleNavigate('admin')}
        />

        {/* First-Time User Onboarding & Walkthrough Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onResetOnboarding={handleResetOnboarding}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
