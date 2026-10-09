// Storage utility for user profile and active session phone number
export interface UserProfile {
  name: string;
  phone: string;
  role: 'seeker' | 'employer' | 'all';
  location?: string;
  category?: string;
  registeredAt?: string;
}

const CURRENT_USER_KEY = 'daily_work_active_user_profile_v1';
const SAVED_PHONES_KEY = 'daily_work_my_posted_phones_v1';

export const getActiveUserProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.phone === 'string') return parsed;
    }
  } catch (e) {
    // ignore
  }
  return {
    name: '',
    phone: '',
    role: 'all',
    location: '',
  };
};

export const saveActiveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    if (profile.phone) {
      addTrackedPhone(profile.phone);
    }
  } catch (e) {
    // ignore
  }
};

export const getTrackedPhones = (): string[] => {
  try {
    const saved = localStorage.getItem(SAVED_PHONES_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return arr.filter((p) => typeof p === 'string' && p.trim().length > 0);
    }
  } catch (e) {
    // ignore
  }
  return [];
};

export const addTrackedPhone = (phone: string): void => {
  if (!phone) return;
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 5) return;

  try {
    const current = getTrackedPhones();
    if (!current.includes(clean)) {
      const updated = [clean, ...current].slice(0, 10);
      localStorage.setItem(SAVED_PHONES_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    // ignore
  }
};
