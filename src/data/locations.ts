export interface LocationItem {
  id: string;
  nameEn: string;
  nameTa: string;
  stateEn?: string;
  stateTa?: string;
  countryCode?: string;
  lat: number;
  lng: number;
}

export interface CountryItem {
  code: string;
  nameEn: string;
  nameTa: string;
  flag: string;
  dialCode: string;
  isDomestic?: boolean;
}

export interface CountryStateItem {
  stateEn: string;
  stateTa: string;
  cities: LocationItem[];
}

export interface CountryData {
  country: CountryItem;
  states: CountryStateItem[];
}

export const COUNTRIES_LIST: CountryItem[] = [
  { code: 'IN', nameEn: 'India', nameTa: 'இந்தியா', flag: '🇮🇳', dialCode: '+91', isDomestic: true },
  { code: 'AE', nameEn: 'United Arab Emirates (UAE)', nameTa: 'ஐக்கிய அரபு அமீரகம் (துபாய்)', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SG', nameEn: 'Singapore', nameTa: 'சிங்கப்பூர்', flag: '🇸🇬', dialCode: '+65' },
  { code: 'MY', nameEn: 'Malaysia', nameTa: 'மலேசியா', flag: '🇲🇾', dialCode: '+60' },
  { code: 'SA', nameEn: 'Saudi Arabia', nameTa: 'சவூதி அரேபியா', flag: '🇸🇦', dialCode: '+966' },
  { code: 'QA', nameEn: 'Qatar', nameTa: 'கத்தார்', flag: '🇶🇦', dialCode: '+974' },
  { code: 'KW', nameEn: 'Kuwait', nameTa: 'குவைத்', flag: '🇰🇼', dialCode: '+965' },
  { code: 'OM', nameEn: 'Oman', nameTa: 'ஓமன்', flag: '🇴🇲', dialCode: '+968' },
  { code: 'BH', nameEn: 'Bahrain', nameTa: 'பஹ்ரைன்', flag: '🇧🇭', dialCode: '+973' },
  { code: 'LK', nameEn: 'Sri Lanka', nameTa: 'இலங்கை', flag: '🇱🇰', dialCode: '+94' },
  { code: 'UK', nameEn: 'United Kingdom', nameTa: 'இங்கிலாந்து', flag: '🇬🇧', dialCode: '+44' },
  { code: 'US', nameEn: 'United States', nameTa: 'அமெரிக்கா', flag: '🇺🇸', dialCode: '+1' },
];

export const POPULAR_LOCATIONS: LocationItem[] = [
  // Tamil Nadu Districts & Major Centers (Chennai = Capital)
  { id: 'chennai', nameEn: 'Chennai (Capital)', nameTa: 'சென்னை (தலைநகரம்)', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 13.0827, lng: 80.2707 },
  { id: 'coimbatore', nameEn: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 11.0168, lng: 76.9558 },
  { id: 'madurai', nameEn: 'Madurai', nameTa: 'மதுரை', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 9.9252, lng: 78.1198 },
  { id: 'trichy', nameEn: 'Tiruchirappalli (Trichy)', nameTa: 'திருச்சிராப்பள்ளி', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 10.7905, lng: 78.7047 },
  { id: 'salem', nameEn: 'Salem', nameTa: 'சேலம்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 11.6643, lng: 78.1460 },
  { id: 'tirunelveli', nameEn: 'Tirunelveli', nameTa: 'திருநெல்வேலி', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 8.7139, lng: 77.7567 },
  { id: 'tiruppur', nameEn: 'Tiruppur', nameTa: 'திருப்பூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 11.1085, lng: 77.3411 },
  { id: 'erode', nameEn: 'Erode', nameTa: 'ஈரோடு', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 11.3410, lng: 77.7172 },
  { id: 'vellore', nameEn: 'Vellore', nameTa: 'வேலூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 12.9165, lng: 79.1325 },
  { id: 'thanjavur', nameEn: 'Thanjavur', nameTa: 'தஞ்சாவூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 10.7870, lng: 79.1378 },
  { id: 'dindigul', nameEn: 'Dindigul', nameTa: 'திண்டுக்கல்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 10.3673, lng: 77.9803 },
  { id: 'kanchipuram', nameEn: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 12.8342, lng: 79.7036 },
  { id: 'thiruvallur', nameEn: 'Thiruvallur', nameTa: 'திருவள்ளூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 13.1432, lng: 79.9079 },
  { id: 'cuddalore', nameEn: 'Cuddalore', nameTa: 'கடலூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 11.7480, lng: 79.7714 },
  { id: 'thoothukudi', nameEn: 'Thoothukudi (Tuticorin)', nameTa: 'தூத்துக்குடி', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 8.7642, lng: 78.1348 },
  { id: 'nagercoil', nameEn: 'Nagercoil (Kanyakumari)', nameTa: 'நாகர்கோவில்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 8.1833, lng: 77.4119 },
  { id: 'hosur', nameEn: 'Hosur (Krishnagiri)', nameTa: 'ஓசூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 12.7409, lng: 77.8253 },
  { id: 'karur', nameEn: 'Karur', nameTa: 'கரூர்', stateEn: 'Tamil Nadu', stateTa: 'தமிழ்நாடு', countryCode: 'IN', lat: 10.9601, lng: 78.0766 },

  // Karnataka
  { id: 'bengaluru', nameEn: 'Bengaluru (Capital)', nameTa: 'பெங்களூரு (தலைநகரம்)', stateEn: 'Karnataka', stateTa: 'கர்நாடகா', countryCode: 'IN', lat: 12.9716, lng: 77.5946 },
  { id: 'mysuru', nameEn: 'Mysuru (Mysore)', nameTa: 'மைசூரு', stateEn: 'Karnataka', stateTa: 'கர்நாடகா', countryCode: 'IN', lat: 12.2958, lng: 76.6394 },

  // Kerala
  { id: 'thiruvananthapuram', nameEn: 'Thiruvananthapuram (Capital)', nameTa: 'திருவனந்தபுரம் (தலைநகரம்)', stateEn: 'Kerala', stateTa: 'கேரளா', countryCode: 'IN', lat: 8.5241, lng: 76.9366 },
  { id: 'kochi', nameEn: 'Kochi (Cochin)', nameTa: 'கொச்சி', stateEn: 'Kerala', stateTa: 'கேரளா', countryCode: 'IN', lat: 9.9312, lng: 76.2673 },

  // Andhra Pradesh & Telangana
  { id: 'hyderabad', nameEn: 'Hyderabad (Capital)', nameTa: 'ஹைதராபாத் (தலைநகரம்)', stateEn: 'Telangana', stateTa: 'தெலுங்கானா', countryCode: 'IN', lat: 17.3850, lng: 78.4867 },
  { id: 'visakhapatnam', nameEn: 'Visakhapatnam (Vizag)', nameTa: 'விசாகப்பட்டினம்', stateEn: 'Andhra Pradesh', stateTa: 'ஆந்திரா', countryCode: 'IN', lat: 17.6868, lng: 83.2185 },

  // Maharashtra
  { id: 'mumbai', nameEn: 'Mumbai (Capital)', nameTa: 'மும்பை (தலைநகரம்)', stateEn: 'Maharashtra', stateTa: 'மகாராஷ்டிரா', countryCode: 'IN', lat: 19.0760, lng: 72.8777 },
  { id: 'pune', nameEn: 'Pune', nameTa: 'புனே', stateEn: 'Maharashtra', stateTa: 'மகாராஷ்டிரா', countryCode: 'IN', lat: 18.5204, lng: 73.8567 },

  // Delhi NCR
  { id: 'delhi', nameEn: 'New Delhi (National Capital)', nameTa: 'புது தில்லி (தலைநகரம்)', stateEn: 'Delhi NCR', stateTa: 'தில்லி', countryCode: 'IN', lat: 28.6139, lng: 77.2090 },

  // West Bengal & Gujarat
  { id: 'kolkata', nameEn: 'Kolkata (Capital)', nameTa: 'கொல்கத்தா (தலைநகரம்)', stateEn: 'West Bengal', stateTa: 'மேற்கு வங்காளம்', countryCode: 'IN', lat: 22.5726, lng: 88.3639 },
  { id: 'ahmedabad', nameEn: 'Ahmedabad', nameTa: 'அகமதாபாத்', stateEn: 'Gujarat', stateTa: 'குஜராத்', countryCode: 'IN', lat: 23.0225, lng: 72.5714 },

  // UAE
  { id: 'dubai', nameEn: 'Dubai City', nameTa: 'துபாய்', stateEn: 'Dubai', stateTa: 'துபாய் அமீரகம்', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  { id: 'abudhabi', nameEn: 'Abu Dhabi (Capital)', nameTa: 'அபுதாபி (தலைநகரம்)', stateEn: 'Abu Dhabi', stateTa: 'அபுதாபி அமீரகம்', countryCode: 'AE', lat: 24.4539, lng: 54.3773 },
  { id: 'sharjah', nameEn: 'Sharjah', nameTa: 'சார்ஜா', stateEn: 'Sharjah', stateTa: 'சார்ஜா அமீரகம்', countryCode: 'AE', lat: 25.3463, lng: 55.4209 },

  // Singapore
  { id: 'singapore_central', nameEn: 'Singapore (Central/Capital)', nameTa: 'சிங்கப்பூர் (மத்திய நகரம்)', stateEn: 'Singapore', stateTa: 'சிங்கப்பூர்', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },

  // Malaysia
  { id: 'kualalumpur', nameEn: 'Kuala Lumpur (Capital)', nameTa: 'கோலாலம்பூர் (தலைநகரம்)', stateEn: 'Wilayah Persekutuan', stateTa: 'கூட்டாட்சிப் பகுதி', countryCode: 'MY', lat: 3.1390, lng: 101.6869 },
  { id: 'johor', nameEn: 'Johor Bahru', nameTa: 'ஜொகூர் பாரு', stateEn: 'Johor', stateTa: 'ஜொகூர்', countryCode: 'MY', lat: 1.4927, lng: 103.7414 },

  // Saudi Arabia
  { id: 'riyadh', nameEn: 'Riyadh (Capital)', nameTa: 'ரியாத் (தலைநகரம்)', stateEn: 'Riyadh Province', stateTa: 'ரியாத் மாகாணம்', countryCode: 'SA', lat: 24.7136, lng: 46.6753 },
  { id: 'jeddah', nameEn: 'Jeddah', nameTa: 'ஜெத்தா', stateEn: 'Makkah Province', stateTa: 'மக்கா மாகாணம்', countryCode: 'SA', lat: 21.4858, lng: 39.1925 },

  // Qatar
  { id: 'doha', nameEn: 'Doha (Capital)', nameTa: 'தோஹா (தலைநகரம்)', stateEn: 'Doha', stateTa: 'தோஹா', countryCode: 'QA', lat: 25.2854, lng: 51.5310 },

  // Kuwait
  { id: 'kuwaitcity', nameEn: 'Kuwait City (Capital)', nameTa: 'குவைத் சிட்டி (தலைநகரம்)', stateEn: 'Al Asimah', stateTa: 'அல் ஆசிமா', countryCode: 'KW', lat: 29.3759, lng: 47.9774 },

  // Sri Lanka
  { id: 'colombo', nameEn: 'Colombo (Capital)', nameTa: 'கொழும்பு (தலைநகரம்)', stateEn: 'Western Province', stateTa: 'மேல் மாகாணம்', countryCode: 'LK', lat: 6.9271, lng: 79.8612 },
  { id: 'jaffna', nameEn: 'Jaffna', nameTa: 'யாழ்ப்பாணம்', stateEn: 'Northern Province', stateTa: 'வட மாகாணம்', countryCode: 'LK', lat: 9.6615, lng: 80.0255 },
];

export interface UserLocation {
  countryCode: string;
  countryNameEn: string;
  countryNameTa: string;
  stateEn: string;
  stateTa: string;
  cityId: string;
  cityNameEn: string;
  cityNameTa: string;
  city?: string;
  state?: string;
}

export const DEFAULT_USER_LOCATION: UserLocation = {
  countryCode: 'IN',
  countryNameEn: 'India',
  countryNameTa: 'இந்தியா',
  stateEn: 'Tamil Nadu',
  stateTa: 'தமிழ்நாடு',
  cityId: 'chennai',
  cityNameEn: 'Chennai (Capital)',
  cityNameTa: 'சென்னை (தலைநகரம்)',
  city: 'Chennai',
  state: 'Tamil Nadu',
};

export const USER_LOCATION_STORAGE_KEY = 'daily_work_user_location_v2';

export function getSavedUserLocation(): UserLocation {
  try {
    const saved = localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.countryCode && parsed.cityId) {
        return {
          ...parsed,
          city: parsed.city || parsed.cityNameEn,
          state: parsed.state || parsed.stateEn,
        };
      }
    }
  } catch (e) {
    console.error('Error reading user location:', e);
  }
  return DEFAULT_USER_LOCATION;
}

export function saveUserLocation(loc: UserLocation): void {
  try {
    localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch (e) {
    console.error('Error saving user location:', e);
  }
}

/**
 * Calculates straight line distance in km between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest Tamil Nadu city/district from given GPS coordinates
 */
export function findNearestLocation(lat: number, lng: number): { location: LocationItem; distanceKm: number } {
  let nearest = POPULAR_LOCATIONS[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < POPULAR_LOCATIONS.length; i++) {
    const dist = calculateDistanceKm(lat, lng, POPULAR_LOCATIONS[i].lat, POPULAR_LOCATIONS[i].lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = POPULAR_LOCATIONS[i];
    }
  }

  return { location: nearest, distanceKm: minDistance };
}

/**
 * Builds a direct Google Maps Navigation / Directions URL
 */
export function buildGoogleMapsNavUrl(locationText: string, lat?: number, lng?: number): string {
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const cleanLoc = encodeURIComponent(`${locationText}, Tamil Nadu`);
  return `https://www.google.com/maps/dir/?api=1&destination=${cleanLoc}`;
}

/**
 * Builds a Google Maps Pin / Search URL
 */
export function buildGoogleMapsSearchUrl(locationText: string, lat?: number, lng?: number): string {
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const cleanLoc = encodeURIComponent(`${locationText}, Tamil Nadu`);
  return `https://www.google.com/maps/search/?api=1&query=${cleanLoc}`;
}
