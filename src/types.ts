export type Language = 'bilingual' | 'ta' | 'en' | 'hi' | 'te' | 'ml' | 'kn';

export type JobStatus = 'active' | 'urgent' | 'completed' | 'paused';

export interface WorkCategory {
  id: string;
  nameEn: string;
  nameTa: string;
  nameHi?: string;
  nameTe?: string;
  nameMl?: string;
  nameKn?: string;
  iconName: string;
  suggestedWage: number;
}

export interface Job {
  id: string;
  employerName: string;
  category: string;
  customCategoryName?: string;
  categoryCustomName?: string;
  location: string;
  dailyWage: number;
  wageType?: 'daily' | 'hourly' | 'half_day' | 'contract';
  isWageNegotiable?: boolean;
  customWageNote?: string;
  benefits?: string[];
  workersNeeded: number;
  jobDate: string; // YYYY-MM-DD or readable
  contactNumber: string;
  notes?: string;
  createdAt: string;
  urgent?: boolean;
  isFeatured?: boolean;
  featuredUntil?: string;
  featuredDays?: number;
  employerTier?: 'free' | 'basic' | 'premium';
  status?: JobStatus;
  countryCode?: string;
  state?: string;
  district?: string;
  city?: string;
  postedLanguage?: Language;
  translations?: Record<string, {
    employerName?: string;
    notes?: string;
    location?: string;
    district?: string;
    city?: string;
    state?: string;
  }>;
  isVerifiedEmployer?: boolean;
  isEncryptedSafety?: boolean;
  // Location & Navigation Options
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  mapsUrl?: string;
  geoAccuracy?: number;
}

export interface JobSeeker {
  id: string;
  name: string;
  mobileNumber: string;
  category: string;
  customCategoryName?: string;
  categoryCustomName?: string;
  location: string;
  expectedDailyWage: number;
  experienceYears?: number;
  skills?: string[];
  registeredAt: string;
  status?: 'available' | 'busy' | 'verified' | 'completed';
  availableDate?: string;
  isFreeToday?: boolean;
  statusNote?: string;
  countryCode?: string;
  state?: string;
  district?: string;
  city?: string;
  postedLanguage?: Language;
  translations?: Record<string, {
    name?: string;
    location?: string;
    district?: string;
    city?: string;
    state?: string;
    customCategoryName?: string;
    notes?: string;
  }>;
  notes?: string;
  isVerified?: boolean;
  // Location & Navigation Options
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  mapsUrl?: string;
  geoAccuracy?: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  senderName: string;
  senderPhone: string;
  category: 'general' | 'payment' | 'job_issue' | 'safety_report' | 'recruitment' | 'management_inquiry';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  adminNotes?: string;
}

export interface UserSecuritySettings {
  numberMasking: boolean;
  fraudAlerts: boolean;
  encryptStoredData: boolean;
  gpsPrivacyHigh: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
}

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';

export type PaymentPurpose =
  | 'featured_job'
  | 'subscription'
  | 'advertisement'
  | 'recruitment_service';

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  payerName: string;
  payerPhone: string;
  purpose: PaymentPurpose;
  targetItemId?: string;
  itemTitleEn: string;
  itemTitleTa: string;
  amount: number;
  paymentMethod: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'upi_bhim' | 'card' | 'netbanking' | 'cash';
  status: PaymentStatus;
  timestamp: string;
  refundReason?: string;
  refundTimestamp?: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'premium';
  nameEn: string;
  nameTa: string;
  price: number;
  periodEn: string;
  periodTa: string;
  featuresEn: string[];
  featuresTa: string[];
  maxJobs: number | 'unlimited';
  featuredCredits: number;
  badgeEn: string;
  badgeTa: string;
  popular?: boolean;
}

export interface EmployerSubscription {
  employerPhone: string;
  employerName: string;
  planId: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired';
  startedAt: string;
  expiresAt: string;
  featuredCreditsRemaining: number;
}

export type AdStatus = 'pending' | 'approved' | 'rejected';
export type VideoDurationTier = '15s' | '30s' | '60s' | '120s';

export interface Advertisement {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  headlineEn: string;
  headlineTa: string;
  descriptionEn: string;
  descriptionTa: string;
  targetCategory: string; // 'all' or specific
  location: string;
  actionTextEn: string;
  actionTextTa: string;
  bannerType: 'feed' | 'home';
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;
  mediaFileName?: string;
  mediaFileSizeMb?: number;
  videoDurationSeconds?: number;
  videoDurationTier?: VideoDurationTier;
  days: number;
  cost: number;
  status: AdStatus;
  paymentStatus: PaymentStatus;
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  targetScope?: 'country' | 'state' | 'district' | 'city';
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  postingLanguage?: Language;
}

export type RecruitmentStatus = 'new' | 'in-progress' | 'assigned' | 'completed' | 'cancelled';

export interface RecruitmentRequest {
  id: string;
  employerName: string;
  contactNumber: string;
  category: string;
  location: string;
  workersNeeded: number;
  dailyWage: number;
  requiredDate: string;
  specificRequirements?: string;
  serviceFee: number;
  paymentStatus: PaymentStatus;
  status: RecruitmentStatus;
  assignedWorkersNotes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  titleEn: string;
  titleTa: string;
  messageEn: string;
  messageTa: string;
  type: 'payment' | 'subscription' | 'featured_expiry' | 'ad_status' | 'recruitment' | 'job' | 'system';
  timestamp: string;
  read: boolean;
  actionScreen?: Screen;
}

export type Screen =
  | 'home'
  | 'jobs'
  | 'post-job'
  | 'register-seeker'
  | 'seekers-list'
  | 'pricing'
  | 'advertise'
  | 'find-workers'
  | 'admin'
  | 'transactions'
  | 'categories'
  | 'media-ads'
  | 'shops'
  | 'add-shop'
  | 'my-posts'
  | 'profile'
  | 'favorites';

export interface UserLocationState {
  countryCode: string;
  countryNameEn: string;
  countryNameTa: string;
  stateEn: string;
  stateTa: string;
  cityId: string;
  cityNameEn: string;
  cityNameTa: string;
}

export interface ShopItem {
  id: string;
  name: string;
  nameTa?: string;
  category: 'hardware' | 'cement_building' | 'electrical_plumbing' | 'paint' | 'tools_rental' | 'timber_carpentry' | 'general';
  categoryLabelEn: string;
  categoryLabelTa: string;
  address: string;
  city: string;
  cityTa?: string;
  district?: string;
  districtTa?: string;
  stateEn?: string;
  stateTa?: string;
  countryCode?: string;
  phone: string;
  whatsapp?: string;
  materialsList: string[];
  materialsListTa: string[];
  deliveryAvailable: boolean;
  rating?: number;
  imageUrl?: string;
  isVerified?: boolean;
  latitude?: number;
  longitude?: number;
  postingLanguage?: Language;
}

export interface AdPricingPlan {
  id: string;
  days: number;
  price: number;
  textPrice?: number;
  videoPrice?: number;
  labelEn: string;
  labelTa: string;
  isPopular?: boolean;
}

export interface OwnerPaymentConfig {
  ownerName: string;
  ownerPhone: string;
  ownerUpiId: string;
  gpayNumber: string;
  phonepeNumber: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  cashCollectionEnabled: boolean;
  upiPaymentEnabled: boolean;
  bankTransferEnabled: boolean;
  instructionsTa: string;
  instructionsEn: string;
  customQrCodeUrl?: string; // Optional custom uploaded QR code image URL / base64
  adminPin?: string; // Optional custom Owner/Admin PIN (default: '8888')
}

export type AppUpdateMode = 'none' | 'optional' | 'mandatory' | 'maintenance';

export interface AppControlConfig {
  appVersion: string; // e.g., "1.2.0"
  latestVersion: string; // e.g., "1.2.5"
  updateMode: AppUpdateMode;
  updateTitleEn: string;
  updateTitleTa: string;
  updateMessageEn: string;
  updateMessageTa: string;
  updateUrl: string;
  releaseNotesEn: string[];
  releaseNotesTa: string[];
  allowJobPosting: boolean;
  allowSeekerRegistration: boolean;
  announcementBannerEnabled: boolean;
  announcementBannerType: 'info' | 'warning' | 'alert' | 'success';
  announcementBannerTextTa: string;
  announcementBannerTextEn: string;
  announcementActionUrl?: string;
  ownerSupportPhone: string;
  supportPhone: string;
  supportWhatsApp: string;
  supportEmail: string;
  supportWorkingHoursEn?: string;
  supportWorkingHoursTa?: string;
  lastUpdated: string;
}

