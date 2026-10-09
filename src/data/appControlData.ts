import { AppControlConfig } from '../types';

export const CURRENT_INSTALLED_APP_VERSION = '1.2.0';

export const DEFAULT_APP_CONTROL_CONFIG: AppControlConfig = {
  appVersion: CURRENT_INSTALLED_APP_VERSION,
  latestVersion: '1.2.5',
  updateMode: 'optional',
  updateTitleTa: 'புதிய செயலி பதிப்பு கிடைக்கிறது (v1.2.5)!',
  updateTitleEn: 'New Daily Work App Update Available (v1.2.5)!',
  updateMessageTa:
    'புதிய வழித்தட வழிகாட்டி (GPS Navigation), வேகமான வேலை பதிவுகள் மற்றும் கூடுதல் சிறப்பம்சங்கள் சேர்க்கப்பட்டுள்ளன. இப்போதே அப்டேட் செய்யவும்.',
  updateMessageEn:
    'Enhanced GPS navigation for work sites, direct Google Maps turn-by-turn directions, and improved performance. Update now for the best experience.',
  updateUrl: 'https://ais-dev-bvmowwi5m5fyzhbs4cbaxe-143746037834.asia-southeast1.run.app',
  releaseNotesTa: [
    'வேலை பதிவு செய்யும் போது தற்போதைய GPS இருப்பிடத்தை தானாக எடுக்கும் வசதி.',
    'தொழிலாளர்களுக்கு வேலை இடத்திற்கு நேரடி கூகுள் மேப்ஸ் வழித்தடம் (Navigation).',
    'உரிமையாளருக்கான செயலி அப்டேட் மற்றும் அறிவிப்பு கட்டுப்பாட்டு பலகை.',
  ],
  releaseNotesEn: [
    'One-tap GPS current location detection for job postings and worker registration.',
    'Direct Google Maps navigation & turn-by-turn routing for job seekers to reach work sites.',
    'Owner control center for app version management, update broadcasts, and maintenance.',
  ],
  allowJobPosting: true,
  allowSeekerRegistration: true,
  announcementBannerEnabled: false,
  announcementBannerType: 'info',
  announcementBannerTextTa: '📢 புதிய அப்டேட்: இப்போது வேலை இடத்திற்கு கூகுள் மேப்ஸ் வழித்தடம் பார்க்கலாம்!',
  announcementBannerTextEn: '📢 New: Workers can now get direct Google Maps turn-by-turn directions to job sites!',
  announcementActionUrl: '',
  ownerSupportPhone: '9840123456',
  supportPhone: '9840123456',
  supportWhatsApp: '9840123456',
  supportEmail: 'management@dailywork.app',
  supportWorkingHoursEn: 'Daily 7:00 AM – 9:00 PM IST',
  supportWorkingHoursTa: 'தினமும் காலை 7:00 முதல் இரவு 9:00 வரை',
  lastUpdated: new Date().toISOString(),
};
