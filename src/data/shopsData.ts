import { ShopItem } from '../types';

export const INITIAL_SHOPS: ShopItem[] = [
  {
    id: 'shop-1',
    name: 'Sri Amman Hardware & Building Materials',
    nameTa: 'ஸ்ரீ அம்மன் ஹார்டுவேர் & கட்டுமான பொருட்கள்',
    category: 'cement_building',
    categoryLabelEn: 'Cement & Building Materials',
    categoryLabelTa: 'சிமெண்ட் & கட்டுமான பொருட்கள்',
    address: 'No. 42, Trunk Road, Poonamallee, Chennai',
    city: 'Chennai',
    cityTa: 'சென்னை',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9841234567',
    whatsapp: '9841234567',
    materialsList: ['UltraTech Cement', 'TMT Steel Rods (8mm-16mm)', 'M-Sand & P-Sand', 'Red Clay Bricks', 'Binding Wire'],
    materialsListTa: ['அல்ட்ராடெக் சிமெண்ட்', 'TMT கம்பி (8mm-16mm)', 'எம்-மணல் & பி-மணல்', 'செங்கற்கள்', 'கட்டுக்கம்பி'],
    deliveryAvailable: true,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'shop-2',
    name: 'Kovai Power Tools & Scaffolding Rentals',
    nameTa: 'கோவை பவர் டூல்ஸ் & சாரப்பலகை வாடகை',
    category: 'tools_rental',
    categoryLabelEn: 'Tools & Machinery Rental',
    categoryLabelTa: 'இயந்திரங்கள் & டூல்ஸ் வாடகை',
    address: '88, Mettupalayam Road, RS Puram, Coimbatore',
    city: 'Coimbatore',
    cityTa: 'கோயம்புத்தூர்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9842199881',
    whatsapp: '9842199881',
    materialsList: ['Concrete Mixer', 'Demolition Hammer (16kg)', 'Scaffolding Pipes', 'Welding Machine', 'Angle Grinder'],
    materialsListTa: ['கான்கிரீட் மிக்சர்', 'சுவர் உடைக்கும் சுத்தியல் (16kg)', 'சாரப்பலகை இரும்பு பைப்', 'வெல்டிங் மெஷின்', 'ஆங்கிள் கிரைண்டர்'],
    deliveryAvailable: true,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'shop-3',
    name: 'Madurai Classic Electricals & Plumbing Mart',
    nameTa: 'மதுரை கிளாசிக் எலக்ட்ரிக்கல்ஸ் & பிளம்பிங்',
    category: 'electrical_plumbing',
    categoryLabelEn: 'Electrical & Plumbing',
    categoryLabelTa: 'எலக்ட்ரிக்கல் & பிளம்பிங்',
    address: '15, West Masi Street, Madurai',
    city: 'Madurai',
    cityTa: 'மதுரை',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9443219876',
    whatsapp: '9443219876',
    materialsList: ['Finolex PVC Pipes (1"-4")', 'Brass Ball Valves', 'Submersible Cables', 'Anchor Switches', 'Teflon Tape & Solvent Cement'],
    materialsListTa: ['ஃபினோலெக்ஸ் PVC பைப்', 'பித்தளை வால்வுகள்', 'சப்மர்சிபிள் வயர்கள்', 'ஆங்கர் சுவிட்சுகள்', 'டெப்லான் டேப் & சால்வென்ட்'],
    deliveryAvailable: true,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'shop-4',
    name: 'Vasantham Color Paints & Waterproofing',
    nameTa: 'வசந்தம் கலர் பெயிண்ட்ஸ் & வாட்டர்ப்ரூஃபிங்',
    category: 'paint',
    categoryLabelEn: 'Paints & Wall Putty',
    categoryLabelTa: 'பெயிண்ட் & வால் புட்டி',
    address: '102, Salai Road, Thillai Nagar, Trichy',
    city: 'Tiruchirappalli (Trichy)',
    cityTa: 'திருச்சிராப்பள்ளி',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9840556677',
    whatsapp: '9840556677',
    materialsList: ['Asian Paints Royale / Apex', 'Birla White Wall Putty', 'Dr. Fixit Waterproofing Chemical', 'Roller Brushes & Sandpaper', 'Primer 20L'],
    materialsListTa: ['ஏசியன் பெயிண்ட்ஸ் ராயல்/ஏபெக்ஸ்', 'பிர்லா ஒயிட் புட்டி', 'டாக்டர் ஃபிக்சிட் வாட்டர்ப்ரூஃபிங்', 'ரோலர் பிரஷ் & எமரி பேப்பர்', 'ப்ரைமர் 20L'],
    deliveryAvailable: true,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'shop-5',
    name: 'Royal Timber & Carpentry Fittings',
    nameTa: 'ராயல் டிம்பர் & மரவேலை ஃபிட்டிங்ஸ்',
    category: 'timber_carpentry',
    categoryLabelEn: 'Timber & Carpentry',
    categoryLabelTa: 'மரப்பலகை & தச்சு உபகரணங்கள்',
    address: '67, Meyyanur Main Road, Salem',
    city: 'Salem',
    cityTa: 'சேலம்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9842100234',
    whatsapp: '9842100234',
    materialsList: ['Commercial Teak Wood', 'Marine Plywood (18mm)', 'Fevicol SH Adhesive', 'Door Hinges & Tower Bolts', 'Circular Saw Blades'],
    materialsListTa: ['தேக்கு மரப்பலகை', 'மெரைன் ப்ளைவுட் (18mm)', 'ஃபெவிகால் SH பசை', 'கதவு கீல் & தாழ்ப்பாள்', 'ரம்பம் பிளேடுகள்'],
    deliveryAvailable: true,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
  {
    id: 'shop-6',
    name: 'Cauvery Agro Equipment & Spares',
    nameTa: 'காவேரி விவசாய உழவு உதிரிபாகங்கள்',
    category: 'hardware',
    categoryLabelEn: 'Agro Tools & Hardware',
    categoryLabelTa: 'விவசாய கருவிகள் & ஹார்டுவேர்',
    address: '22, Palani Road, Dindigul',
    city: 'Dindigul',
    cityTa: 'திண்டுக்கல்',
    stateEn: 'Tamil Nadu',
    stateTa: 'தமிழ்நாடு',
    countryCode: 'IN',
    phone: '9843991122',
    whatsapp: '9843991122',
    materialsList: ['Drip Irrigation Pipes', 'Water Pump 5HP Spares', 'Rotavator Blades', 'Weeder Machine Parts', 'Sprayer Tanks'],
    materialsListTa: ['சொட்டு நீர் பாசன பைப்', 'தண்ணீர் மோட்டார் உதிரிபாகங்கள்', 'ரோட்டவேட்டர் பிளேடு', 'களை எடுக்கும் இயந்திரம் பாகங்கள்', 'மருந்து தெளிப்பான்'],
    deliveryAvailable: true,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    isVerified: true,
  },
];

export const SHOPS_STORAGE_KEY = 'daily_work_shops_v1';

export function getSavedShops(): ShopItem[] {
  try {
    const saved = localStorage.getItem(SHOPS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading shops from storage:', e);
  }
  return INITIAL_SHOPS;
}

export function saveShopItem(newShop: ShopItem): ShopItem[] {
  const current = getSavedShops();
  const updated = [newShop, ...current];
  try {
    localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving shop to storage:', e);
  }
  return updated;
}
