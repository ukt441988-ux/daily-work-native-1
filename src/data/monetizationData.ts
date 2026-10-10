import {
  SubscriptionPlan,
  Advertisement,
  RecruitmentRequest,
  PaymentTransaction,
  AppNotification,
  EmployerSubscription,
  OwnerPaymentConfig,
  AdPricingPlan,
} from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    nameEn: 'Free Employer',
    nameTa: 'இலவச திட்டம்',
    price: 0,
    periodEn: 'Lifetime',
    periodTa: 'வாழ்நாள் முழுவதும்',
    maxJobs: 2,
    featuredCredits: 0,
    badgeEn: 'Free',
    badgeTa: 'இலவசம்',
    featuresEn: [
      'Post up to 2 active jobs at a time',
      'Standard job listing visibility',
      'Direct worker phone calls & WhatsApp',
      'Basic listing duration (3 days)',
    ],
    featuresTa: [
      'ஒரே நேரத்தில் 2 வேலைகள் வரை பதியலாம்',
      'வழக்கமான பட்டியல் பார்வை',
      'தொழிலாளர்களுடன் நேரடி அழைப்பு & வாட்ஸ்அப்',
      '3 நாட்கள் செல்லுபடியாகும் வேலை பதிவு',
    ],
  },
  {
    id: 'basic',
    nameEn: 'Basic Business',
    nameTa: 'அடிப்படை திட்டம்',
    price: 299,
    periodEn: 'per month',
    periodTa: 'மாதத்திற்கு',
    maxJobs: 10,
    featuredCredits: 2,
    badgeEn: 'Popular',
    badgeTa: 'அதிக விருப்பம்',
    popular: true,
    featuresEn: [
      'Post up to 10 daily jobs per month',
      '2 Free Featured Job badges included (Worth ₹198)',
      'Highlighted "Verified Employer" listing',
      'Instant SMS/WhatsApp applicant alert',
      'Extended 7-day job listing validity',
    ],
    featuresTa: [
      'மாதத்திற்கு 10 வேலைகள் வரை பதியலாம்',
      '2 சிறப்பு வேலைகள் (Featured) இலவசம் (மதிப்பு ₹198)',
      'முதலாளி சரிபார்க்கப்பட்ட அடையாள அட்டை',
      'உடனடி அறிவிப்பு & அழைப்பு முன்னுரிமை',
      '7 நாட்கள் நீட்டிக்கப்பட்ட வேலை செல்லுபடி',
    ],
  },
  {
    id: 'premium',
    nameEn: 'Premium Contractor',
    nameTa: 'பிரீமியம் திட்டம்',
    price: 699,
    periodEn: 'per month',
    periodTa: 'மாதத்திற்கு',
    maxJobs: 'unlimited',
    featuredCredits: 5,
    badgeEn: 'Best Value',
    badgeTa: 'சிறந்த மதிப்பு',
    featuresEn: [
      'Unlimited daily job postings',
      '5 Free Featured Job badges included (Worth ₹495)',
      'Top search priority in category & location',
      'Dedicated worker sourcing assistance (Find Workers)',
      'Applicant management dashboard & contact export',
      'Zero commission on direct worker hiring',
    ],
    featuresTa: [
      'வரம்பற்ற தினசரி வேலை பதிவுகள்',
      '5 சிறப்பு வேலைகள் (Featured) இலவசம் (மதிப்பு ₹495)',
      'தேடலில் முதல் இடம் முன்னுரிமை',
      'பிரத்யேக ஆட்கள் பெற்றுத்தரும் சேவை உதவி',
      'தொழிலாளர் மேலாண்மை & நேரடி தொடர்பு',
      'இடைத்தரகர் கமிஷன் ஏதும் இல்லை',
    ],
  },
];

export const INITIAL_SUBSCRIPTION: EmployerSubscription = {
  employerPhone: '9840123456',
  employerName: 'Selvam Builders',
  planId: 'basic',
  status: 'active',
  startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  featuredCreditsRemaining: 1,
};

export interface SampleAdMediaPreset {
  id: string;
  titleEn: string;
  titleTa: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
}

export const SAMPLE_AD_MEDIA_PRESETS: SampleAdMediaPreset[] = [
  {
    id: 'preset-cement',
    titleEn: 'Cement & Building Materials Store',
    titleTa: 'சிமெண்ட் & கட்டுமான பொருட்கள் கடை',
    category: 'masonry',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-tractor',
    titleEn: 'Agro Tractor & Harvester Field',
    titleTa: 'விவசாய டிராக்டர் மற்றும் வயல் உழவு',
    category: 'agriculture',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-safety',
    titleEn: 'Worker Safety Helmets & Boots',
    titleTa: 'பாதுகாப்பு காலணி மற்றும் ஹெல்மெட்',
    category: 'all',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-scaffold-video',
    titleEn: 'Construction & Scaffolding Promo (Video)',
    titleTa: 'கட்டுமான தளம் & சாரப்பலகை (வீடியோ)',
    category: 'masonry',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-construction-workers-at-a-building-site-41227-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-transport',
    titleEn: 'Worker Transport Van & Auto Service',
    titleTa: 'தொழிலாளர் போக்குவரத்து வேன் & ஆட்டோ',
    category: 'driving',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'preset-tools-video',
    titleEn: 'Power Tools & Welding Work (Video)',
    titleTa: 'பவர் டூல்ஸ் & வெல்டிங் பணி (வீடியோ)',
    category: 'ironwork',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-welder-at-work-in-a-workshop-43224-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    businessName: 'Sri Amman Hardware & Building Materials',
    contactPerson: 'K. Rajendran',
    phone: '9841234567',
    headlineEn: 'Best Quality Cement, TMT Steel & Tools at Wholesale Price',
    headlineTa: 'தரமான சிமெண்ட், கம்பி மற்றும் கட்டுமான பொருட்கள் மொத்த விலையில்',
    descriptionEn: 'Free site delivery within 15 km in Chennai & suburbs. Special discounts for contractors.',
    descriptionTa: '15 கி.மீ வரை இலவச டெலிவரி. ஒப்பந்ததாரர்களுக்கு சிறப்பு தள்ளுபடி உண்டு.',
    targetCategory: 'masonry',
    location: 'Chennai (சென்னை)',
    actionTextEn: 'Call Shop',
    actionTextTa: 'கடையை அழைக்க',
    bannerType: 'feed',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    mediaFileName: 'amman_hardware_cement.jpg',
    days: 7,
    cost: 499,
    status: 'approved',
    paymentStatus: 'successful',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ad-2',
    businessName: 'Cauvery Agro Tractors & Tiller Rental',
    contactPerson: 'M. Senthil',
    phone: '9443219876',
    headlineEn: 'Tractor & Harvester Rental for Daily Farm Work',
    headlineTa: 'விவசாய டிராக்டர் மற்றும் உழவு இயந்திரங்கள் தினசரி வாடகைக்கு',
    descriptionEn: 'Experienced tractor drivers available per hour or acre. Diesel included.',
    descriptionTa: 'அனுபவமுள்ள ஓட்டுநர்களுடன் மணிநேர / ஏக்கர் வாடகைக்கு கிடைக்கும்.',
    targetCategory: 'agriculture',
    location: 'Madurai (மதுரை)',
    actionTextEn: 'Book Tractor',
    actionTextTa: 'டிராக்டர் புக் செய்ய',
    bannerType: 'feed',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    mediaFileName: 'cauvery_agro_tractor.jpg',
    days: 14,
    cost: 899,
    status: 'approved',
    paymentStatus: 'successful',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ad-3',
    businessName: 'Royal safety gear & work boots store',
    contactPerson: 'R. Vignesh',
    phone: '9840556677',
    headlineEn: 'Work Helmets, Safety Shoes & Gloves for Daily Workers',
    headlineTa: 'பாதுகாப்பு காலணிகள், ஹெல்மெட் மற்றும் உடைகள் குறைந்த விலையில்',
    descriptionEn: 'Wholesale & retail supplies for building laborers and factory workers.',
    descriptionTa: 'கட்டுமான மற்றும் தொழிற்சாலை தொழிலாளர்களுக்கான தரமான பாதுகாப்பு உபகரணங்கள்.',
    targetCategory: 'all',
    location: 'Coimbatore (கோவை)',
    actionTextEn: 'Enquire',
    actionTextTa: 'விசாரிக்குக',
    bannerType: 'home',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    mediaFileName: 'safety_gear.jpg',
    days: 7,
    cost: 499,
    status: 'pending',
    paymentStatus: 'successful',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ad-4',
    businessName: 'Kovai Heavy Machinery & Scaffolding Rentals',
    contactPerson: 'S. Shanmugam',
    phone: '9842199881',
    headlineEn: 'Concrete Mixers, Scaffolding Pipes & Vibrators for Hire',
    headlineTa: 'கான்கிரீட் மிக்சர், சாரப்பலகை & அதிர்வு இயந்திரங்கள் வாடகைக்கு',
    descriptionEn: 'Daily and weekly rentals with fast delivery to construction sites across Tamil Nadu.',
    descriptionTa: 'கட்டுமான தளங்களுக்கு உடனுக்குடன் மிக்சர் இயந்திரங்கள் தினசரி வாடகைக்கு கிடைக்கும்.',
    targetCategory: 'masonry',
    location: 'Coimbatore (கோவை)',
    actionTextEn: 'Rent Equipment',
    actionTextTa: 'இயந்திரம் வாடகைக்கு',
    bannerType: 'feed',
    mediaType: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-construction-workers-at-a-building-site-41227-large.mp4',
    mediaFileName: 'kovai_machinery_site_promo.mp4',
    days: 14,
    cost: 899,
    status: 'approved',
    paymentStatus: 'successful',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ad-5',
    businessName: 'Sri Murugan Daily Laborer Van & Auto Transport',
    contactPerson: 'K. Murugesan',
    phone: '9443811223',
    headlineEn: 'Tempo & Van Service to Transport Workers to Work Sites',
    headlineTa: 'தொழிலாளர்களை பணிதளத்திற்கு அழைத்துச் செல்ல வேன் மற்றும் டெம்போ',
    descriptionEn: 'Morning pickup and evening drop for farming and building worker teams.',
    descriptionTa: 'விவசாய மற்றும் கட்டிட தொழிலாளர்களை காலையில் அழைத்துச் சென்று மாலையில் திரும்ப அழைத்து வரலாம்.',
    targetCategory: 'driving',
    location: 'Salem (சேலம்)',
    actionTextEn: 'Book Van',
    actionTextTa: 'வேன் புக் செய்ய',
    bannerType: 'home',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    mediaFileName: 'worker_transport_tempo.jpg',
    days: 7,
    cost: 499,
    status: 'approved',
    paymentStatus: 'successful',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_ADVERTISEMENTS = INITIAL_ADS;

export const INITIAL_RECRUITMENT_REQUESTS: RecruitmentRequest[] = [
  {
    id: 'req-1',
    employerName: 'Sri Venkateswara Infrastructures',
    contactNumber: '9840223344',
    category: 'masonry',
    location: 'Chennai (தாம்பரம், சென்னை)',
    workersNeeded: 8,
    dailyWage: 950,
    requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specificRequirements: 'Concrete shuttering and plastering workers needed for commercial site.',
    serviceFee: 199,
    paymentStatus: 'successful',
    status: 'in-progress',
    assignedWorkersNotes: '5 workers verified and assigned from Tambaram worker pool. Coordinating remaining 3.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-2',
    employerName: 'Thangam Coconut Mandi',
    contactNumber: '9443556677',
    category: 'loading',
    location: 'Pollachi (பொள்ளாச்சி)',
    workersNeeded: 5,
    dailyWage: 850,
    requiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specificRequirements: 'Loading 2 lorry loads of coconuts, urgent work.',
    serviceFee: 199,
    paymentStatus: 'successful',
    status: 'assigned',
    assignedWorkersNotes: 'Full batch of 5 loaders confirmed with supervisor Karuppasamy.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-101',
    receiptNumber: 'DW-2026-0891',
    payerName: 'Selvam Builders',
    payerPhone: '9840123456',
    purpose: 'subscription',
    itemTitleEn: 'Basic Business Plan (1 Month)',
    itemTitleTa: 'அடிப்படை திட்டம் (1 மாதம்)',
    amount: 299,
    paymentMethod: 'upi_gpay',
    status: 'successful',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-102',
    receiptNumber: 'DW-2026-0914',
    payerName: 'Selvam Builders',
    payerPhone: '9840123456',
    purpose: 'featured_job',
    targetItemId: 'job-1',
    itemTitleEn: 'Featured Job Badge (3 Days)',
    itemTitleTa: 'சிறப்பு வேலை பதிவேற்றம் (3 நாட்கள்)',
    amount: 99,
    paymentMethod: 'upi_phonepe',
    status: 'successful',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-103',
    receiptNumber: 'DW-2026-0922',
    payerName: 'Sri Amman Hardware',
    payerPhone: '9841234567',
    purpose: 'advertisement',
    targetItemId: 'ad-1',
    itemTitleEn: 'Hardware Ad Placement (7 Days)',
    itemTitleTa: 'வணிக விளம்பர கட்டணம் (7 நாட்கள்)',
    amount: 499,
    paymentMethod: 'card',
    status: 'successful',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-104',
    receiptNumber: 'DW-2026-0935',
    payerName: 'Cauvery Agro Farms',
    payerPhone: '9443219876',
    purpose: 'advertisement',
    targetItemId: 'ad-2',
    itemTitleEn: 'Tractor Rental Ad (14 Days)',
    itemTitleTa: 'டிராக்டர் வாடகை விளம்பரம் (14 நாட்கள்)',
    amount: 899,
    paymentMethod: 'netbanking',
    status: 'successful',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-105',
    receiptNumber: 'DW-2026-0941',
    payerName: 'Sri Venkateswara Infrastructures',
    payerPhone: '9840223344',
    purpose: 'recruitment_service',
    targetItemId: 'req-1',
    itemTitleEn: 'Find Workers Facilitation Fee (8 Masons)',
    itemTitleTa: 'ஆட்கள் பெற்றுத்தரும் சேவை கட்டணம் (8 கொத்தனார்)',
    amount: 199,
    paymentMethod: 'upi_paytm',
    status: 'successful',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    titleEn: 'Job Promoted to Featured!',
    titleTa: 'உங்கள் வேலை சிறப்பு இடத்திற்கு மாற்றப்பட்டது!',
    messageEn: 'Your job listing "Selvam Builders" is now pinned at the top for 3 days.',
    messageTa: 'உங்கள் செல்வம் பில்டர்ஸ் வேலை இப்போது 3 நாட்களுக்கு பட்டியலில் மேலே காட்டப்படும்.',
    type: 'payment',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionScreen: 'jobs',
  },
  {
    id: 'notif-2',
    titleEn: 'New Advertisement Pending Approval',
    titleTa: 'புதிய விளம்பரம் நிர்வாக ஒப்புதலுக்கு வந்துள்ளது',
    messageEn: 'Royal safety gear has submitted a local ad for review.',
    messageTa: 'ராயல் பாதுகாப்பு சாதன கடை புதிய விளம்பரத்தை சமர்ப்பித்துள்ளது.',
    type: 'ad_status',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionScreen: 'admin',
  },
  {
    id: 'notif-3',
    titleEn: 'Recruitment Request Assigned',
    titleTa: 'ஆட்கள் சேவை கோரிக்கை ஏற்கப்பட்டது',
    messageEn: '5 daily loaders assigned for Thangam Coconut Mandi.',
    messageTa: 'தங்கம் தேங்காய் மண்டிக்கு 5 சுமை தூக்கும் தொழிலாளர்கள் ஒதுக்கப்பட்டுள்ளனர்.',
    type: 'recruitment',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionScreen: 'find-workers',
  },
];

export const DEFAULT_AD_PRICING: AdPricingPlan[] = [
  { id: 'ad-plan-7', days: 7, price: 499, labelEn: '7 Days Standard Banner', labelTa: '7 நாட்கள் பட்டியல் விளம்பரம்' },
  { id: 'ad-plan-14', days: 14, price: 899, labelEn: '14 Days Premium Banner (Save 10%)', labelTa: '14 நாட்கள் பிரீமியம் விளம்பரம்', isPopular: true },
  { id: 'ad-plan-30', days: 30, price: 1599, labelEn: '30 Days Monthly Partner (Save 20%)', labelTa: '30 நாட்கள் முழு மாத விளம்பரம்' },
];

export type AdTargetScope = 'country' | 'state' | 'district' | 'city';

export interface AdScopePricingTier {
  scope: AdTargetScope;
  nameEn: string;
  nameTa: string;
  nameHi?: string;
  nameTe?: string;
  nameMl?: string;
  nameKn?: string;
  descriptionEn: string;
  descriptionTa: string;
  badgeEn: string;
  badgeTa: string;
  iconName: string;
  plans: {
    id: string;
    days: number;
    price: number; // Photo ad price (Standard)
    textPrice: number; // Text-only ad price (Budget)
    videoPrice: number; // Video ad price (Premium Engagement)
    labelEn: string;
    labelTa: string;
    isPopular?: boolean;
  }[];
}

export const AD_SCOPE_PRICING_TIERS: Record<AdTargetScope, AdScopePricingTier> = {
  country: {
    scope: 'country',
    nameEn: 'All India / Entire Country',
    nameTa: 'நாடு முழுவதும் (அனைத்து மாநிலங்கள்)',
    descriptionEn: 'Reach workers, employers, contractors, and businesses across the entire country with maximum reach.',
    descriptionTa: 'நாடு முழுவதும் உள்ள அனைத்து மாநிலங்களிலும் வேலை தேடுபவர்கள், முதலாளிகள் மற்றும் ஒப்பந்ததாரர்களுக்கு முன்னுரிமையுடன் காட்டப்படும்.',
    badgeEn: 'Maximum Reach',
    badgeTa: 'அதிகபட்ச பார்வை',
    iconName: 'Globe',
    plans: [
      { id: 'ad-country-7', days: 7, price: 999, textPrice: 599, videoPrice: 1499, labelEn: '7 Days National Feed', labelTa: '7 நாட்கள் தேசிய விளம்பரம்' },
      { id: 'ad-country-14', days: 14, price: 1799, textPrice: 1099, videoPrice: 2699, labelEn: '14 Days All-India Spotlight', labelTa: '14 நாட்கள் தேசிய முன்னுரிமை', isPopular: true },
      { id: 'ad-country-30', days: 30, price: 2999, textPrice: 1799, videoPrice: 4499, labelEn: '30 Days Pan-India Mega Banner', labelTa: '30 நாட்கள் தேசிய மெகா விளம்பரம்' },
    ],
  },
  state: {
    scope: 'state',
    nameEn: 'Entire State (State-Wide)',
    nameTa: 'மாநிலம் முழுவதும் (அனைத்து மாவட்டங்கள்)',
    descriptionEn: 'Your ad will be displayed to all users across the selected state (e.g., all 38 districts of Tamil Nadu).',
    descriptionTa: 'நீங்கள் தேர்ந்தெடுத்த மாநிலம் முழுவதும் உள்ள அனைத்து மாவட்டங்கள் மற்றும் ஊர்களில் உள்ள அனைவருக்கும் தோன்றும்.',
    badgeEn: 'State Priority',
    badgeTa: 'மாநில முன்னுரிமை',
    iconName: 'Map',
    plans: [
      { id: 'ad-state-7', days: 7, price: 699, textPrice: 399, videoPrice: 999, labelEn: '7 Days State-Wide Banner', labelTa: '7 நாட்கள் மாநில விளம்பரம்' },
      { id: 'ad-state-14', days: 14, price: 1299, textPrice: 749, videoPrice: 1899, labelEn: '14 Days State Spotlight', labelTa: '14 நாட்கள் மாநில முன்னுரிமை', isPopular: true },
      { id: 'ad-state-30', days: 30, price: 2199, textPrice: 1299, videoPrice: 3199, labelEn: '30 Days Full State Partner', labelTa: '30 நாட்கள் முழு மாநில திட்டம்' },
    ],
  },
  district: {
    scope: 'district',
    nameEn: 'Entire District',
    nameTa: 'மாவட்டம் முழுவதும் (அனைத்து வட்டங்கள்)',
    descriptionEn: 'Targeted visibility covering your entire district, ideal for suppliers, machinery rentals, and services.',
    descriptionTa: 'உங்கள் மாவட்டம் முழுவதும் உள்ள அனைத்து ஊர்களிலும் தொழிலாளர்கள் மற்றும் வாடிக்கையாளர்களுக்குத் தோன்றும்.',
    badgeEn: 'Most Popular',
    badgeTa: 'அதிக விருப்பம்',
    iconName: 'Building',
    plans: [
      { id: 'ad-district-7', days: 7, price: 499, textPrice: 299, videoPrice: 749, labelEn: '7 Days District Banner', labelTa: '7 நாட்கள் மாவட்ட விளம்பரம்' },
      { id: 'ad-district-14', days: 14, price: 899, textPrice: 549, videoPrice: 1349, labelEn: '14 Days District Highlight', labelTa: '14 நாட்கள் மாவட்ட திட்டம்', isPopular: true },
      { id: 'ad-district-30', days: 30, price: 1599, textPrice: 949, videoPrice: 2399, labelEn: '30 Days District Partner', labelTa: '30 நாட்கள் மாவட்ட கூட்டு' },
    ],
  },
  city: {
    scope: 'city',
    nameEn: 'City / Local Town',
    nameTa: 'நகரம் / உள்ளூர் பகுதி மட்டும்',
    descriptionEn: 'Hyper-local promotion tailored for local retail stores, shops, and immediate neighborhood services.',
    descriptionTa: 'உங்கள் நகரம் அல்லது குறிப்பிட்ட உள்ளூர் பகுதியில் உள்ளவர்களுக்கு மட்டும் குறைந்த பட்ஜெட் விலையில் தோன்றும்.',
    badgeEn: 'Budget Friendly',
    badgeTa: 'குறைந்த கட்டணம்',
    iconName: 'MapPin',
    plans: [
      { id: 'ad-city-7', days: 7, price: 249, textPrice: 149, videoPrice: 399, labelEn: '7 Days Local City Ad', labelTa: '7 நாட்கள் உள்ளூர் விளம்பரம்' },
      { id: 'ad-city-14', days: 14, price: 449, textPrice: 269, videoPrice: 699, labelEn: '14 Days City Feature', labelTa: '14 நாட்கள் உள்ளூர் முன்னுரிமை', isPopular: true },
      { id: 'ad-city-30', days: 30, price: 799, textPrice: 479, videoPrice: 1199, labelEn: '30 Days Local Store Banner', labelTa: '30 நாட்கள் உள்ளூர் விளம்பரம்' },
    ],
  },
};

export type VideoDurationTier = '15s' | '30s' | '60s' | '120s';

export interface VideoDurationConfig {
  id: VideoDurationTier;
  maxSeconds: number;
  labelEn: string;
  labelTa: string;
  shortLabelTa: string;
  multiplier: number;
  descriptionEn: string;
  descriptionTa: string;
  badge: string;
}

export const VIDEO_DURATION_CONFIGS: VideoDurationConfig[] = [
  {
    id: '15s',
    maxSeconds: 15,
    labelEn: '15 Sec (Reel / Teaser)',
    labelTa: '15 நொடிகள் (ரீல் / டீசர்)',
    shortLabelTa: '15 நொடி',
    multiplier: 1.0,
    descriptionEn: 'Quick attention grabber for local offers & announcements',
    descriptionTa: 'விரைவான சலுகைகள் & உடனடி விளம்பரங்களுக்கு சிறந்தது',
    badge: 'Popular',
  },
  {
    id: '30s',
    maxSeconds: 30,
    labelEn: '30 Sec (Standard Spot)',
    labelTa: '30 நொடிகள் (வழக்கமான விளம்பரம்)',
    shortLabelTa: '30 நொடி',
    multiplier: 1.25,
    descriptionEn: 'Ideal for shops, stores, transport & equipment rentals',
    descriptionTa: 'கடைகள், வாகனங்கள் & உபகரண வாடகைக்கு உகந்தது',
    badge: 'Standard',
  },
  {
    id: '60s',
    maxSeconds: 60,
    labelEn: '60 Sec / 1 Min (Full Showcase)',
    labelTa: '60 நொடிகள் / 1 நிமிடம் (முழு விவரம்)',
    shortLabelTa: '1 நிமிடம்',
    multiplier: 1.5,
    descriptionEn: 'Walkthrough of store products, services & reviews',
    descriptionTa: 'பொருட்கள் & சேவைகளின் முழுமையான காட்சி விளக்கம்',
    badge: 'Pro',
  },
  {
    id: '120s',
    maxSeconds: 120,
    labelEn: '120 Sec / 2 Min (Detailed Feature)',
    labelTa: '120 நொடிகள் / 2 நிமிடம் (விரிவான வீடியோ)',
    shortLabelTa: '2 நிமிடம்',
    multiplier: 1.85,
    descriptionEn: 'In-depth machinery demo, construction tour & company profile',
    descriptionTa: 'கட்டுமானம், இயந்திர செயல்முறை & நிறுவன முழு அறிமுகம்',
    badge: 'Feature',
  },
];

export function getVideoDurationConfig(tier?: VideoDurationTier): VideoDurationConfig {
  return VIDEO_DURATION_CONFIGS.find((c) => c.id === tier) || VIDEO_DURATION_CONFIGS[0];
}

export function suggestVideoTierFromSeconds(seconds: number): VideoDurationTier {
  if (seconds <= 15) return '15s';
  if (seconds <= 30) return '30s';
  if (seconds <= 60) return '60s';
  return '120s';
}

export function formatDurationSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Calculates the final price for an ad plan based on media format:
 * - 'none' (Text-only): Budget pricing (textPrice)
 * - 'image' (Photo ad): Standard image banner price (price)
 * - 'video' (Video ad): Dynamic pricing based on video duration tier (15s, 30s, 60s, 120s)
 */
export function getPlanPriceForMedia(
  plan: { price: number; textPrice?: number; videoPrice?: number },
  mediaType: 'none' | 'image' | 'video' | undefined,
  videoDurationTier?: VideoDurationTier
): number {
  if (mediaType === 'none' || !mediaType) {
    return typeof plan.textPrice === 'number' ? plan.textPrice : Math.round(plan.price * 0.6);
  }
  if (mediaType === 'video') {
    const baseVideoPrice = typeof plan.videoPrice === 'number' ? plan.videoPrice : Math.round(plan.price * 1.5);
    const durationConfig = getVideoDurationConfig(videoDurationTier);
    return Math.round(baseVideoPrice * durationConfig.multiplier);
  }
  return plan.price;
}

/**
 * Gets the minimum starting price for a scope tier dynamically based on media format.
 */
export function getScopeStartingPrice(
  tier: AdScopePricingTier,
  mediaType: 'none' | 'image' | 'video' | undefined
): number {
  if (!tier || !tier.plans || tier.plans.length === 0) return 149;
  const prices = tier.plans.map((p) => getPlanPriceForMedia(p, mediaType));
  return Math.min(...prices);
}

/**
 * Label and badge helper for media format pricing
 */
export function getMediaPricingBadge(
  mediaType: 'none' | 'image' | 'video' | undefined,
  lang: string = 'ta'
): { label: string; tag: string; discountNote?: string } {
  if (mediaType === 'none' || !mediaType) {
    return {
      label: lang === 'ta' ? 'எழுத்து விளம்பரம் (பட்ஜெட்)' : 'Text-Only Ad (Budget)',
      tag: lang === 'ta' ? '40% வரை சேமிப்பு' : 'Save up to 40%',
      discountNote: lang === 'ta' ? 'எழுத்து விளம்பரத்திற்கான சிறப்பு குறைந்த கட்டணம்' : 'Special budget rate for text ads',
    };
  }
  if (mediaType === 'video') {
    return {
      label: lang === 'ta' ? 'வீடியோ விளம்பரம் (அதிக ஈர்ப்பு)' : 'Video Ad (High Impact)',
      tag: lang === 'ta' ? 'அதிக வாடிக்கையாளர் ஈர்ப்பு' : 'Highest Engagement',
      discountNote: lang === 'ta' ? 'முழு வீடியோ விளம்பர பிரீமியம் கட்டணம்' : 'Interactive video display rate',
    };
  }
  return {
    label: lang === 'ta' ? 'புகைப்பட விளம்பரம் (வழக்கமான)' : 'Photo Ad (Standard)',
    tag: lang === 'ta' ? 'மிகவும் பிரபலம்' : 'Standard Rate',
    discountNote: lang === 'ta' ? 'தரமான புகைப்பட விளம்பரக் கட்டணம்' : 'Standard photo banner rate',
  };
}

export const PRICING_CONFIG = {
  featuredJobFee: 99, // ₹99 for 3 days
  featuredJobDays: 3,
  recruitmentServiceFee: 199, // ₹199 per request
  adPricing: DEFAULT_AD_PRICING,
};

export const SCOPE_PRICING_STORAGE_KEY = 'daily_work_ad_scope_pricing_v1';

export function getSavedScopePricingTiers(): Record<AdTargetScope, AdScopePricingTier> {
  if (typeof window === 'undefined') return AD_SCOPE_PRICING_TIERS;
  try {
    const raw = localStorage.getItem(SCOPE_PRICING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.country && parsed.state && parsed.district && parsed.city) {
        // Guarantee textPrice and videoPrice exist on all plans
        const scopes: AdTargetScope[] = ['country', 'state', 'district', 'city'];
        scopes.forEach((scope) => {
          if (parsed[scope]?.plans) {
            parsed[scope].plans = parsed[scope].plans.map((p: any) => ({
              ...p,
              textPrice: typeof p.textPrice === 'number' ? p.textPrice : Math.round(p.price * 0.6),
              videoPrice: typeof p.videoPrice === 'number' ? p.videoPrice : Math.round(p.price * 1.5),
            }));
          }
        });
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading scope pricing:', e);
  }
  return AD_SCOPE_PRICING_TIERS;
}

export function saveScopePricingTiers(tiers: Record<AdTargetScope, AdScopePricingTier>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCOPE_PRICING_STORAGE_KEY, JSON.stringify(tiers));
    window.dispatchEvent(new CustomEvent('dailywork_scope_pricing_updated', { detail: tiers }));
  } catch (e) {
    console.error('Error saving scope pricing:', e);
  }
}

export function resetScopePricingTiers(): Record<AdTargetScope, AdScopePricingTier> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SCOPE_PRICING_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('dailywork_scope_pricing_updated', { detail: AD_SCOPE_PRICING_TIERS }));
    } catch (e) {
      console.error('Error resetting scope pricing:', e);
    }
  }
  return AD_SCOPE_PRICING_TIERS;
}

export const DEFAULT_OWNER_PAYMENT_CONFIG: OwnerPaymentConfig = {
  ownerName: 'Thanigai (Lucky App Owner)',
  ownerPhone: '9840123456',
  ownerUpiId: 'connectthanigai@okhdfcbank',
  gpayNumber: '9840123456',
  phonepeNumber: '9840123456',
  bankName: 'HDFC Bank',
  accountHolderName: 'Thanigai M',
  accountNumber: '50100482910482',
  ifscCode: 'HDFC0001234',
  branch: 'Chennai Main Branch',
  cashCollectionEnabled: true,
  upiPaymentEnabled: true,
  bankTransferEnabled: true,
  instructionsTa: 'உரிமையாளரின் QR கோடை ஸ்கேன் செய்து அல்லது வங்கி கணக்கிற்கு பணம் செலுத்தி UTR எண்ணை உள்ளிடவும். விளம்பரம் உடனடியாக நேரலையாகும்.',
  instructionsEn: 'Scan Owner UPI QR code or transfer directly to Owner Bank Account, then provide the UTR / Ref ID.',
  adminPin: '8888',
  customQrCodeUrl: '',
};
