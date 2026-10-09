import { ShopItem } from '../types';
import { matchShopWithQuery } from './universalSearch';

// 1. AI Helper for Store Finder & Distance
export function filterShopsByLocationAndCategory(
  shops: ShopItem[],
  userCity: string,
  userState: string,
  selectedCategory: string,
  searchQuery: string
): ShopItem[] {
  return shops.filter((shop) => {
    // Category match
    if (selectedCategory && selectedCategory !== 'all' && shop.category !== selectedCategory) {
      if (!searchQuery.trim()) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      return matchShopWithQuery(shop, searchQuery);
    }

    return true;
  });
}

// 2. AI Helper for Call & Order Draft Generation
export function generateCallAndOrderDraft(
  shop: ShopItem,
  itemsNeeded: string,
  deliveryAddress: string,
  buyerName: string,
  buyerPhone: string
): { whatsappTextEn: string; whatsappTextTa: string; phoneScriptEn: string; phoneScriptTa: string } {
  const cleanPhone = (shop.phone || '').replace(/[^0-9]/g, '');

  const whatsappTextTa = `*வணக்கம் ${shop.nameTa || shop.name}*,
நான் Daily Work செயலி மூலம் தொடர்பு கொள்கிறேன். எனக்கு கீழ்க்கண்ட கட்டுமானப் பொருட்கள் தேவை:

📦 *தேவைப்படும் பொருட்கள் / பொருட்கள் பட்டியல்:*
${itemsNeeded || '• சிமெண்ட் மற்றும் கட்டுமானப் பொருட்கள்'}

📍 *டெலிவரி முகவரி:*
${deliveryAddress || 'நேரில் வந்து வாங்க / உள்ளூர் முகவரி'}

👤 *வாடிக்கையாளர்:* ${buyerName || 'வாடிக்கையாளர்'}
📞 *தொடர்பு எண்:* ${buyerPhone || cleanPhone}

இதற்கான விலை விபரம் (Quotation) மற்றும் டெலிவரி சாத்தியத்தை தெரிவிக்குமாறு கேட்டுக்கொள்கிறேன்.`;

  const whatsappTextEn = `*Hello ${shop.name}*,
I found your shop on the Daily Work App. I would like to inquire/order the following building materials:

📦 *Required Items:*
${itemsNeeded || '• Building materials / equipment'}

📍 *Delivery Location:*
${deliveryAddress || 'Store Pickup / Local Site'}

👤 *Customer:* ${buyerName || 'Customer'}
📞 *Contact:* ${buyerPhone || cleanPhone}

Kindly share your best quotation and availability of delivery.`;

  const phoneScriptTa = `வணக்கம் அண்ணா, நான் Daily Work ஆப் மூலம் ${shop.nameTa || shop.name}-க்கு கூப்பிடுகிறேன். "${itemsNeeded.split('\n')[0] || 'கட்டுமான பொருட்கள்'}" ஸ்டாக் இருக்கா? விலை என்ன மற்றும் டெலிவரி பண்ண முடியுமா?`;
  const phoneScriptEn = `Hello, I'm calling ${shop.name} from Daily Work app. Do you have "${itemsNeeded.split('\n')[0] || 'building materials'}" in stock, and what is the best rate and delivery time?`;

  return {
    whatsappTextEn,
    whatsappTextTa,
    phoneScriptEn,
    phoneScriptTa,
  };
}

export interface MaterialEstimationItem {
  name: string;
  nameTa: string;
  quantity: string;
  unitCost?: string;
  estimatedCostRange: string;
  tips: string;
  minCost: number;
  maxCost: number;
}

export interface MaterialEstimationResult {
  jobTitle: string;
  category: string;
  unitMeasurement: string;
  parsedSqFt: number;
  recommendedMaterials: MaterialEstimationItem[];
  totalEstimatedBudget: string;
  totalMinCost: number;
  totalMaxCost: number;
  safetyGear: string[];
  calculationFormulaNotes?: string;
}

// Helper to extract area in square feet from dimensions input
export function extractAreaFromInput(inputStr: string, defaultArea = 100): number {
  if (!inputStr || !inputStr.trim()) return defaultArea;
  const str = inputStr.toLowerCase().replace(/,/g, '');

  // Check for multiplication: e.g. "10x10", "10 * 12", "20 அடி x 15 அடி"
  const multiMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:x|\*|பை)\s*(\d+(?:\.\d+)?)/);
  if (multiMatch) {
    const l = parseFloat(multiMatch[1]);
    const w = parseFloat(multiMatch[2]);
    if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
      return Math.round(l * w);
    }
  }

  // Check for direct numbers: e.g. "1000", "500 sqft", "800 சதுர அடி"
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (!isNaN(num) && num > 0) {
      return Math.round(num);
    }
  }

  return defaultArea;
}

// 3. AI Material Recommendation for Specific Job with Exact Civil Engineering Formulas
export function calculateJobMaterialRequirements(
  jobType: string,
  dimensionsOrArea: string
): MaterialEstimationResult {
  const lower = jobType.toLowerCase();

  // 1. ROOF CONCRETE SLAB (கான்கிரீட் கூரை ஸ்லாப்)
  if (lower.includes('roof') || lower.includes('slab') || lower.includes('கூரை') || lower.includes('கான்கிரீட்')) {
    const area = extractAreaFromInput(dimensionsOrArea, 1000);
    // Standard 5 inch (0.416 ft) slab thickness M20 grade (1:1.5:3)
    // Per 100 sq.ft: ~7.5-8 cement bags, ~80 kg TMT steel, ~35 cft M-sand, ~45 cft 20mm blue metal
    const cementBags = Math.round((area / 100) * 7.8);
    const steelKg = Math.round((area / 100) * 80);
    const msandCft = Math.round((area / 100) * 35);
    const jellyCft = Math.round((area / 100) * 45);
    const chemicalLitres = Math.max(1, Math.round(cementBags * 0.15));
    const bindingWireKg = Math.max(1, Math.round(steelKg * 0.015));

    // Rates: Cement ₹400-440/bag, Steel ₹68-75/kg, M-Sand ₹55-65/cft, Jelly ₹48-58/cft, Chemical ₹250/L, Wire ₹100/kg
    const cementMin = cementBags * 400;
    const cementMax = cementBags * 440;
    const steelMin = steelKg * 68;
    const steelMax = steelKg * 75;
    const sandMin = msandCft * 55;
    const sandMax = msandCft * 65;
    const jellyMin = jellyCft * 48;
    const jellyMax = jellyCft * 58;
    const chemMin = chemicalLitres * 220;
    const chemMax = chemicalLitres * 280;
    const wireMin = bindingWireKg * 90;
    const wireMax = bindingWireKg * 110;

    const totalMin = cementMin + steelMin + sandMin + jellyMin + chemMin + wireMin;
    const totalMax = cementMax + steelMax + sandMax + jellyMax + chemMax + wireMax;

    return {
      jobTitle: 'கான்கிரீட் கூரை ஸ்லாப் வேலை (Roof Slab Concrete)',
      category: 'cement_building',
      unitMeasurement: `${area} சதுர அடி (5 அங்குல தடிமன் / 5" Thick Slab)`,
      parsedSqFt: area,
      recommendedMaterials: [
        {
          name: 'PPC / OPC 53 Grade Cement (UltraTech, Ramco, Dalmia)',
          nameTa: '53 கிரேடு கான்கிரீட் சிமெண்ட் மூட்டைகள்',
          quantity: `${cementBags} மூட்டைகள் (50 kg)`,
          unitCost: '₹400 - ₹440 / மூட்டை',
          estimatedCostRange: `₹${cementMin.toLocaleString('en-IN')} - ₹${cementMax.toLocaleString('en-IN')}`,
          tips: 'M20 கான்கிரீட் கலவைக்கு (1:1.5:3) பிரத்யேக 53 கிரேடு சிமெண்ட் உகந்தது.',
          minCost: cementMin,
          maxCost: cementMax,
        },
        {
          name: 'Fe550D / Fe500 TMT Steel Rebar (8mm, 10mm, 12mm)',
          nameTa: 'Fe550D TMT கம்பி (8mm, 10mm)',
          quantity: `${steelKg} கிலோ (சுமார் ${(steelKg / 1000).toFixed(2)} டன்)`,
          unitCost: '₹68 - ₹75 / கிலோ',
          estimatedCostRange: `₹${steelMin.toLocaleString('en-IN')} - ₹${steelMax.toLocaleString('en-IN')}`,
          tips: 'மெயின் பார் 10mm-ம், டிஸ்ட்ரிபியூஷன் பார் 8mm-ம் 6 அங்குல இடைவெளியில் கட்ட வேண்டும்.',
          minCost: steelMin,
          maxCost: steelMax,
        },
        {
          name: 'Coarse M-Sand for Concrete Casting',
          nameTa: 'கான்கிரீட் எம்-சாண்ட் (M-Sand)',
          quantity: `${msandCft} கன அடி (சுமார் ${(msandCft / 100).toFixed(1)} யூனிட்)`,
          unitCost: '₹55 - ₹65 / cft',
          estimatedCostRange: `₹${sandMin.toLocaleString('en-IN')} - ₹${sandMax.toLocaleString('en-IN')}`,
          tips: 'தூசிகள் இல்லாத இரட்டை கழுவிய (Double washed) எம்-சாண்ட் கான்கிரீட்டிற்கு சிறந்தது.',
          minCost: sandMin,
          maxCost: sandMax,
        },
        {
          name: '20mm Blue Metal Jelly Aggregate (கான்கிரீட் ஜல்லி)',
          nameTa: '20mm நீல மெட்டல் ஜல்லி',
          quantity: `${jellyCft} கன அடி (சுமார் ${(jellyCft / 100).toFixed(1)} யூனிட்)`,
          unitCost: '₹48 - ₹58 / cft',
          estimatedCostRange: `₹${jellyMin.toLocaleString('en-IN')} - ₹${jellyMax.toLocaleString('en-IN')}`,
          tips: '20mm மற்றும் 12mm அளவுகள் கலந்த ஜல்லி அதிர்வு இயந்திரத்தால் (Vibrator) எளிதில் இறங்கும்.',
          minCost: jellyMin,
          maxCost: jellyMax,
        },
        {
          name: 'Integral Waterproofing Compound (Dr. Fixit 101 LW+)',
          nameTa: 'வாட்டர்ப்ரூஃபிங் லிக்விட் (Dr. Fixit 101)',
          quantity: `${chemicalLitres} லிட்டர்`,
          unitCost: '₹220 - ₹280 / L',
          estimatedCostRange: `₹${chemMin.toLocaleString('en-IN')} - ₹${chemMax.toLocaleString('en-IN')}`,
          tips: 'ஒரு மூட்டை சிமெண்டிற்கு 200ml கலந்தால் கான்கிரீட் கூரையில் நீர் கசிவு வராது.',
          minCost: chemMin,
          maxCost: chemMax,
        },
        {
          name: 'Annealed Steel Binding Wire (18 Gauge)',
          nameTa: 'கம்பி கட்டும் பைண்டிங் வயர்',
          quantity: `${bindingWireKg} கிலோ`,
          unitCost: '₹90 - ₹110 / kg',
          estimatedCostRange: `₹${wireMin.toLocaleString('en-IN')} - ₹${wireMax.toLocaleString('en-IN')}`,
          tips: 'கம்பி இடைவெளி மாறாமல் இறுக்கமாக கட்ட வேண்டும்.',
          minCost: wireMin,
          maxCost: wireMax,
        },
      ],
      totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
      totalMinCost: totalMin,
      totalMaxCost: totalMax,
      safetyGear: ['தலைக்கவசம் (Hard Hat)', 'கட்டுமான பூட்ஸ் (Safety Shoes)', 'ரப்பர் கையுறை', 'பாதுகாப்பு கயிறு (Safety Harness)'],
      calculationFormulaNotes: 'M20 Concrete (1:1.5:3) ratio, 5" slab thickness, 80kg steel/100 sqft',
    };
  }

  // 2. FLOOR TILES / GRANITE / MARBLE LAYING (டைல்ஸ் & தரை பதித்தல்)
  if (lower.includes('tile') || lower.includes('டைல்ஸ்') || lower.includes('granite') || lower.includes('கிரானைட்') || lower.includes('floor')) {
    const area = extractAreaFromInput(dimensionsOrArea, 500);
    // 10% wastage added for cutting
    const effectiveArea = Math.round(area * 1.1);
    // 2x2 vitrified tiles = 4 sq.ft per tile, 4 tiles per box = 16 sq.ft per box
    const tileBoxes = Math.ceil(effectiveArea / 16);
    const cementBags = Math.max(2, Math.round((area / 100) * 1.5));
    const sandCft = Math.max(10, Math.round((area / 100) * 12));
    const groutKg = Math.max(1, Math.round((area / 100) * 1.2));
    const spacersPackets = Math.max(1, Math.round(area / 400));

    // Rates: Tiles box ₹750-1050, Cement ₹380-420, Sand ₹55-65/cft, Grout ₹120-180/kg, Spacers ₹100/packet
    const tileMin = tileBoxes * 750;
    const tileMax = tileBoxes * 1050;
    const cementMin = cementBags * 380;
    const cementMax = cementBags * 420;
    const sandMin = sandCft * 55;
    const sandMax = sandCft * 65;
    const groutMin = groutKg * 120;
    const groutMax = groutKg * 180;
    const spacerCost = spacersPackets * 100;

    const totalMin = tileMin + cementMin + sandMin + groutMin + spacerCost;
    const totalMax = tileMax + cementMax + sandMax + groutMax + spacerCost;

    return {
      jobTitle: 'டைல்ஸ் & தரை பதித்தல் வேலை (Floor Tiles Laying)',
      category: 'cement_building',
      unitMeasurement: `${area} சதுர அடி (10% கட்டிங் கழிவு உட்பட: ${effectiveArea} sq.ft)`,
      parsedSqFt: area,
      recommendedMaterials: [
        {
          name: '2x2 ft Vitrified Floor Tiles (Double Charged / GVT)',
          nameTa: '2x2 அடி விட்ரிஃபைட் தரை டைல்ஸ்',
          quantity: `${tileBoxes} பெட்டிகள் (${tileBoxes * 4} டைல்ஸ் / ${tileBoxes * 16} sq.ft)`,
          unitCost: '₹750 - ₹1,050 / பெட்டி (4 டைல்ஸ்)',
          estimatedCostRange: `₹${tileMin.toLocaleString('en-IN')} - ₹${tileMax.toLocaleString('en-IN')}`,
          tips: 'கட்டிங் வேஸ்டேஜ் மற்றும் பிற்கால மாற்றிற்கு 10% கூடுதல் டைல்ஸ் வாங்குவது அவசியம்.',
          minCost: tileMin,
          maxCost: tileMax,
        },
        {
          name: 'OPC / Tile Adhesive Cement (UltraTech Tilefix / Roff)',
          nameTa: 'டைல்ஸ் ஒட்டும் சிமெண்ட் / அட்ஹெசிவ்',
          quantity: `${cementBags} மூட்டைகள் (50 kg)`,
          unitCost: '₹380 - ₹420 / மூட்டை',
          estimatedCostRange: `₹${cementMin.toLocaleString('en-IN')} - ₹${cementMax.toLocaleString('en-IN')}`,
          tips: 'தரை சமதள படுக்கைக்கு சிமெண்ட் பாண்டிங் அல்லது டைல் அட்ஹெசிவ் சிறந்தது.',
          minCost: cementMin,
          maxCost: cementMax,
        },
        {
          name: 'Screened Bedding M-Sand / River Sand',
          nameTa: 'தரை தளத்திற்கு சலித்த எம்-சாண்ட்',
          quantity: `${sandCft} கன அடி (சுமார் ${(sandCft / 100).toFixed(1)} யூனிட்)`,
          unitCost: '₹55 - ₹65 / cft',
          estimatedCostRange: `₹${sandMin.toLocaleString('en-IN')} - ₹${sandMax.toLocaleString('en-IN')}`,
          tips: 'தரை மேடு பள்ளங்களை சமன் செய்ய 1:4 கலவையில் படுக்கை அமைக்கவும்.',
          minCost: sandMin,
          maxCost: sandMax,
        },
        {
          name: 'Epoxy / Polymer Tile Joint Grout (Waterproof)',
          nameTa: 'டைல்ஸ் மூட்டு கிரவுட் பவுடர் (Joint Grout)',
          quantity: `${groutKg} கிலோ`,
          unitCost: '₹120 - ₹180 / kg',
          estimatedCostRange: `₹${groutMin.toLocaleString('en-IN')} - ₹${groutMax.toLocaleString('en-IN')}`,
          tips: 'டைல்ஸ் நிறத்திற்கு ஏற்ற நிறத்தில் வாட்டர்ப்ரூஃப் எபோக்சி கிரவுட் பயன்படுத்தவும்.',
          minCost: groutMin,
          maxCost: groutMax,
        },
        {
          name: 'Tile Spacers (2mm / 3mm) & Leveling Clips',
          nameTa: 'டைல் ஸ்பேசர் & லெவலிங் கிளிப்',
          quantity: `${spacersPackets} பாக்கெட்டுகள்`,
          unitCost: '₹100 / பாக்கெட்',
          estimatedCostRange: `₹${spacerCost} - ₹${spacerCost + 50}`,
          tips: 'டைல்ஸ் இடைவெளி சமமாகவும், விளிம்புகள் தட்டையாகவும் அமைய உதவும்.',
          minCost: spacerCost,
          maxCost: spacerCost + 50,
        },
      ],
      totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
      totalMinCost: totalMin,
      totalMaxCost: totalMax,
      safetyGear: ['முழங்கால் பேட் (Knee Pads)', 'கண்ணாடி (Safety Glasses)', 'கையுறை'],
      calculationFormulaNotes: 'Area + 10% wastage, 16 sq.ft/box, 1.5 cement bags per 100 sqft',
    };
  }

  // 3. PAINTING (வீடு / சுவர் பெயிண்டிங்)
  if (lower.includes('paint') || lower.includes('பெயிண்ட்') || lower.includes('வண்ணம்')) {
    const area = extractAreaFromInput(dimensionsOrArea, 1000);
    // Putty: 1kg covers ~14 sq.ft (2 coats) -> 40kg bag covers ~560 sq.ft
    const puttyBags = Math.max(1, Math.ceil(area / 500));
    // Primer: 1 Litre covers ~125 sq.ft (1 coat)
    const primerLitres = Math.max(1, Math.ceil(area / 125));
    // Emulsion paint: 1 Litre covers ~65 sq.ft (2 coats)
    const paintLitres = Math.max(1, Math.ceil(area / 65));

    // Rates: Putty 40kg ₹850-1050, Primer ₹130-170/L, Paint ₹280-450/L, Tools set ₹600-900
    const puttyMin = puttyBags * 850;
    const puttyMax = puttyBags * 1050;
    const primerMin = primerLitres * 130;
    const primerMax = primerLitres * 170;
    const paintMin = paintLitres * 280;
    const paintMax = paintLitres * 450;
    const toolsMin = 600;
    const toolsMax = 900;

    const totalMin = puttyMin + primerMin + paintMin + toolsMin;
    const totalMax = puttyMax + primerMax + paintMax + toolsMax;

    return {
      jobTitle: 'வீடு / சுவர் பெயிண்டிங் வேலை (Painting Work)',
      category: 'paint',
      unitMeasurement: `${area} சதுர அடி சுவர் பரப்பளவு (Wall & Ceiling Surface Area)`,
      parsedSqFt: area,
      recommendedMaterials: [
        {
          name: 'Wall Putty (Acrylic / White Cement based, Birla / Asian)',
          nameTa: 'வால் புட்டி மூட்டைகள் (40 kg Bags)',
          quantity: `${puttyBags} மூட்டைகள் (${puttyBags * 40} kg)`,
          unitCost: '₹850 - ₹1,050 / மூட்டை (40kg)',
          estimatedCostRange: `₹${puttyMin.toLocaleString('en-IN')} - ₹${puttyMax.toLocaleString('en-IN')}`,
          tips: 'சுவரின் விரிசல்களை அடைத்து 2 கோட் பூசுவதற்கு போதுமானது.',
          minCost: puttyMin,
          maxCost: puttyMax,
        },
        {
          name: 'Interior / Exterior Acrylic Primer (1st Coat)',
          nameTa: 'ப்ரைமர் (Water Based Primer)',
          quantity: `${primerLitres} லிட்டர் (${Math.ceil(primerLitres / 20)} கேன்கள்)`,
          unitCost: '₹130 - ₹170 / லிட்டர்',
          estimatedCostRange: `₹${primerMin.toLocaleString('en-IN')} - ₹${primerMax.toLocaleString('en-IN')}`,
          tips: 'சுவர் ஈரப்பதத்தை உறிஞ்சுவதை தடுத்து இறுதி பெயிண்ட் நிறத்தை தூக்கும்.',
          minCost: primerMin,
          maxCost: primerMax,
        },
        {
          name: 'Premium Emulsion Paint (Apex / Tractor / Royale 2 Coats)',
          nameTa: 'எமல்ஷன் பெயிண்ட் (2 கோட்டிங்)',
          quantity: `${paintLitres} லிட்டர்`,
          unitCost: '₹280 - ₹450 / லிட்டர்',
          estimatedCostRange: `₹${paintMin.toLocaleString('en-IN')} - ₹${paintMax.toLocaleString('en-IN')}`,
          tips: 'இரண்டு கோட்டிங் கொடுத்தால் 4-5 வருடங்களுக்கு பளபளப்பாக இருக்கும்.',
          minCost: paintMin,
          maxCost: paintMax,
        },
        {
          name: 'Painting Rollers, 2" & 4" Brushes, Sandpaper (80, 120 grid)',
          nameTa: 'ரோலர், பிரஷ், எமரி தாள் & டேப் செட்',
          quantity: '1 முழுமையான செட்',
          unitCost: 'செட் விலை',
          estimatedCostRange: `₹${toolsMin} - ₹${toolsMax}`,
          tips: 'மூலைகளுக்கு 3 இன்ச் பிரஷும், சுவருக்கு 9 இன்ச் ரோலரும் பயன்படுத்தவும்.',
          minCost: toolsMin,
          maxCost: toolsMax,
        },
      ],
      totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
      totalMinCost: totalMin,
      totalMaxCost: totalMax,
      safetyGear: ['முகக்கவசம் (Mask)', 'கண்ணாடி (Safety Goggles)', 'கையுறை (Gloves)', 'ஏணி பாதுகாப்பு பெல்ட்'],
      calculationFormulaNotes: 'Putty: 14 sqft/kg (2 coats), Primer: 125 sqft/L, Paint: 65 sqft/L (2 coats)',
    };
  }

  // 4. BRICKWORK & WALL CONSTRUCTION (செங்கல் சுவர் & கட்டுமானம்)
  if (lower.includes('brick') || lower.includes('செங்கல்') || lower.includes('wall') || lower.includes('mason') || lower.includes('கட்டுமானம்')) {
    const area = extractAreaFromInput(dimensionsOrArea, 100);
    // Standard 9 inch wall: ~11 bricks per sq.ft; 4.5" partition wall: ~5.5 bricks per sq.ft.
    // Assuming standard 9" main brickwork:
    const bricksCount = Math.round(area * 11);
    // Cement: ~2.5 bags per 100 sq.ft for 9" wall + 1.2 bags for plastering both sides = ~3.7 bags per 100 sq.ft
    const cementBags = Math.max(1, Math.round((area / 100) * 3.7));
    // M-Sand for masonry: ~22 cft per 100 sq.ft
    const msandCft = Math.max(5, Math.round((area / 100) * 22));
    // Plastering P-Sand: ~12 cft per 100 sq.ft
    const psandCft = Math.max(4, Math.round((area / 100) * 12));
    const chemicalLitres = Math.max(1, Math.round(cementBags * 0.15));

    // Rates: Bricks ₹8.5-10.5, Cement ₹380-420, M-sand ₹55-65/cft, P-sand ₹60-70/cft, Chemical ₹250/L
    const brickMin = Math.round(bricksCount * 8.5);
    const brickMax = Math.round(bricksCount * 10.5);
    const cementMin = cementBags * 380;
    const cementMax = cementBags * 420;
    const msandMin = msandCft * 55;
    const msandMax = msandCft * 65;
    const psandMin = psandCft * 60;
    const psandMax = psandCft * 70;
    const chemMin = chemicalLitres * 220;
    const chemMax = chemicalLitres * 280;

    const totalMin = brickMin + cementMin + msandMin + psandMin + chemMin;
    const totalMax = brickMax + cementMax + msandMax + psandMax + chemMax;

    return {
      jobTitle: 'செங்கல் சுவர் & பூச்சு வேலை (Brickwork & Plastering)',
      category: 'cement_building',
      unitMeasurement: `${area} சதுர அடி சுவர் (9" தடிமன் சுவர் மற்றும் இருபுற பூச்சு)`,
      parsedSqFt: area,
      recommendedMaterials: [
        {
          name: 'First Quality Red Clay Bricks / Fly Ash Bricks',
          nameTa: 'முதல் தர நாட்டு செங்கற்கள் / ஃப்ளை ஆஷ் செங்கல்',
          quantity: `${bricksCount} செங்கற்கள்`,
          unitCost: '₹8.50 - ₹10.50 / செங்கல்',
          estimatedCostRange: `₹${brickMin.toLocaleString('en-IN')} - ₹${brickMax.toLocaleString('en-IN')}`,
          tips: 'கட்டுவதற்கு முன் செங்கற்களை நீரில் குறைந்தது 2 மணிநேரம் ஊற வைக்க வேண்டும்.',
          minCost: brickMin,
          maxCost: brickMax,
        },
        {
          name: 'PPC Cement (UltraTech, Ramco, Chettinad)',
          nameTa: 'சிமெண்ட் மூட்டைகள் (கட்டுமானம் & பூச்சுக்கு)',
          quantity: `${cementBags} மூட்டைகள் (50 kg)`,
          unitCost: '₹380 - ₹420 / மூட்டை',
          estimatedCostRange: `₹${cementMin.toLocaleString('en-IN')} - ₹${cementMax.toLocaleString('en-IN')}`,
          tips: 'சுவர் கட்டுமானத்திற்கு 1:6 கலவையும், பூச்சுக்கு 1:4 கலவையும் கலக்கவும்.',
          minCost: cementMin,
          maxCost: cementMax,
        },
        {
          name: 'Coarse M-Sand for Masonry Mortar (கட்டுமான மணல்)',
          nameTa: 'கட்டுமான எம்-சாண்ட் (M-Sand)',
          quantity: `${msandCft} கன அடி (சுமார் ${(msandCft / 100).toFixed(1)} யூனிட்)`,
          unitCost: '₹55 - ₹65 / cft',
          estimatedCostRange: `₹${msandMin.toLocaleString('en-IN')} - ₹${msandMax.toLocaleString('en-IN')}`,
          tips: 'சேறு இல்லாத சுத்தமான எம்-சாண்ட் கலவையின் பிடிமானத்தை அதிகரிக்கும்.',
          minCost: msandMin,
          maxCost: msandMax,
        },
        {
          name: 'Fine Plastering P-Sand (பூச்சு பி-சாண்ட்)',
          nameTa: 'சலித்த பூச்சு பி-சாண்ட் (P-Sand)',
          quantity: `${psandCft} கன அடி (சுமார் ${(psandCft / 100).toFixed(1)} யூனிட்)`,
          unitCost: '₹60 - ₹70 / cft',
          estimatedCostRange: `₹${psandMin.toLocaleString('en-IN')} - ₹${psandMax.toLocaleString('en-IN')}`,
          tips: 'பூசுவதற்கு முன் நுண்ணிய சல்லடையில் சலித்து பூசினால் விரிசல் வராது.',
          minCost: psandMin,
          maxCost: psandMax,
        },
        {
          name: 'Mortar Waterproofing Liquid & Curing Agent',
          nameTa: 'வாட்டர்ப்ரூஃபிங் கெமிக்கல் (Dr. Fixit 101)',
          quantity: `${chemicalLitres} லிட்டர்`,
          unitCost: '₹220 - ₹280 / L',
          estimatedCostRange: `₹${chemMin.toLocaleString('en-IN')} - ₹${chemMax.toLocaleString('en-IN')}`,
          tips: 'சுவர் உப்பு பூத்தல் மற்றும் விரிசல்களை தடுக்கும்.',
          minCost: chemMin,
          maxCost: chemMax,
        },
      ],
      totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
      totalMinCost: totalMin,
      totalMaxCost: totalMax,
      safetyGear: ['கட்டுமான காலணி (Safety Boots)', 'தலைக்கவசம் (Hard Hat)', 'ரப்பர் கையுறை'],
      calculationFormulaNotes: '9" wall @ 11 bricks/sqft, 3.7 cement bags/100 sqft (masonry + both side plastering)',
    };
  }

  // 5. PLUMBING & PVC PIPING (குழாய் பதித்தல் & மோட்டார் லைன்)
  if (lower.includes('plumb') || lower.includes('பைப்') || lower.includes('pipe') || lower.includes('குழாய்')) {
    const areaOrPoints = extractAreaFromInput(dimensionsOrArea, 1);
    const pointsCount = Math.max(1, areaOrPoints > 50 ? Math.round(areaOrPoints / 100) : areaOrPoints);
    const cpvcPipes = Math.max(3, pointsCount * 3);
    const pvcDrainPipes = Math.max(2, pointsCount * 2);
    const fittingsCount = pointsCount * 10;
    const solventCans = Math.max(1, Math.ceil(pointsCount / 2));
    const ballValves = Math.max(2, pointsCount);

    const cpvcMin = cpvcPipes * 420;
    const cpvcMax = cpvcPipes * 550;
    const drainMin = pvcDrainPipes * 500;
    const drainMax = pvcDrainPipes * 680;
    const fitMin = fittingsCount * 60;
    const fitMax = fittingsCount * 110;
    const solMin = solventCans * 220;
    const solMax = solventCans * 300;
    const valMin = ballValves * 350;
    const valMax = ballValves * 600;

    const totalMin = cpvcMin + drainMin + fitMin + solMin + valMin;
    const totalMax = cpvcMax + drainMax + fitMax + solMax + valMax;

    return {
      jobTitle: 'குழாய் பதித்தல் & மோட்டார் லைன் (Plumbing & PVC Line)',
      category: 'electrical_plumbing',
      unitMeasurement: `${pointsCount} பாத்ரூம் / நீர் இணைப்பு புள்ளிகள் (${cpvcPipes} பைப்புகள்)`,
      parsedSqFt: pointsCount * 100,
      recommendedMaterials: [
        {
          name: 'CPVC & UPVC Water Pipes (1" & 3/4" SDR 11, Ashirvad/Finolex)',
          nameTa: 'CPVC மற்றும் UPVC குடிநீர் பைப்புகள் (1" மற்றும் 3/4")',
          quantity: `${cpvcPipes} பைப்புகள் (10 அடி நீளம்)`,
          unitCost: '₹420 - ₹550 / பைப்',
          estimatedCostRange: `₹${cpvcMin.toLocaleString('en-IN')} - ₹${cpvcMax.toLocaleString('en-IN')}`,
          tips: 'சூடான தண்ணீருக்கு CPVC-யும், குளிர் தண்ணீருக்கு UPVC-யும் சிறந்தது.',
          minCost: cpvcMin,
          maxCost: cpvcMax,
        },
        {
          name: 'PVC Drainage Pipes 4" & 2.5" (கழிவுநீர் பைப்புகள்)',
          nameTa: '4" மற்றும் 2.5" PVC கழிவுநீர் பைப்',
          quantity: `${pvcDrainPipes} பைப்புகள் (10 அடி நீளம்)`,
          unitCost: '₹500 - ₹680 / பைப்',
          estimatedCostRange: `₹${drainMin.toLocaleString('en-IN')} - ₹${drainMax.toLocaleString('en-IN')}`,
          tips: 'சரியான சாய்வு (Slope) அமைத்தால் கழிவுநீர் அடைப்பு ஏற்படாது.',
          minCost: drainMin,
          maxCost: drainMax,
        },
        {
          name: 'Brass MTA, FTA, Elbow, Tee, Coupler, End Cap Fittings',
          nameTa: 'பிராஸ் பிட்டிங்ஸ், எல்போ, டீ மற்றும் கப்ளர்',
          quantity: `${fittingsCount} துண்டுகள்`,
          unitCost: '₹60 - ₹110 / துண்டு',
          estimatedCostRange: `₹${fitMin.toLocaleString('en-IN')} - ₹${fitMax.toLocaleString('en-IN')}`,
          tips: 'குழாய் மாட்டும் இடங்களில் பித்தளை திருகு (Brass Threaded) பயன்படுத்தவும்.',
          minCost: fitMin,
          maxCost: fitMax,
        },
        {
          name: 'CPVC Solvent Cement & Teflon Seal Tape',
          nameTa: 'சால்வென்ட் கம் & டெப்லான் டேப்',
          quantity: `${solventCans} டப்பா கம் + ${pointsCount * 3} டேப் ரோல்கள்`,
          unitCost: 'தொகுப்பு விலை',
          estimatedCostRange: `₹${solMin} - ₹${solMax}`,
          tips: 'பைப் ஒட்டிய பிறகு 1 மணிநேரம் அழுத்தத்திற்கு உட்படுத்தாமல் உலரவிடவும்.',
          minCost: solMin,
          maxCost: solMax,
        },
        {
          name: 'Heavy Duty Brass Ball Valve (1 inch) for Line Control',
          nameTa: 'ஹெவி டியூட்டி பிராஸ் பால் வால்வு (1")',
          quantity: `${ballValves} எண்கள்`,
          unitCost: '₹350 - ₹600 / வால்வு',
          estimatedCostRange: `₹${valMin.toLocaleString('en-IN')} - ₹${valMax.toLocaleString('en-IN')}`,
          tips: 'மெயின் லைன் அவசர நிறுத்தத்திற்கு ஐஎஸ்ஐ தரமான பால் வால்வு பொருத்தவும்.',
          minCost: valMin,
          maxCost: valMax,
        },
      ],
      totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
      totalMinCost: totalMin,
      totalMaxCost: totalMax,
      safetyGear: ['பைப் கட்டர் (Pipe Cutter)', 'கையுறை (Gloves)', 'பாதுகாப்பு கண்ணாடி'],
      calculationFormulaNotes: 'Calculated per plumbing point with CPVC/UPVC standard loops',
    };
  }

  // 6. DEFAULT GENERAL CONSTRUCTION & RENOVATION (பொது மராமத்து & கட்டுமானம்)
  const defaultSqFt = extractAreaFromInput(dimensionsOrArea, 100);
  const cementBags = Math.max(2, Math.round(defaultSqFt / 50));
  const cementMin = cementBags * 380;
  const cementMax = cementBags * 420;
  const fastMin = 350;
  const fastMax = 600;
  const toolMin = 500;
  const toolMax = 800;

  const totalMin = cementMin + fastMin + toolMin;
  const totalMax = cementMax + fastMax + toolMax;

  return {
    jobTitle: jobType || 'பொதுவான மராமத்து & கட்டுமான வேலை (General Renovation)',
    category: 'hardware',
    unitMeasurement: `${defaultSqFt} சதுர அடி / பொது வேலை அளவு`,
    parsedSqFt: defaultSqFt,
    recommendedMaterials: [
      {
        name: 'Cement & Bonding SBR Latex (UltraTech / Dr. Fixit)',
        nameTa: 'சிமெண்ட் & பாண்டிங் கெமிக்கல்',
        quantity: `${cementBags} மூட்டைகள் (50 kg) + 1 லிட்டர் லேடெக்ஸ்`,
        unitCost: '₹380 - ₹420 / மூட்டை',
        estimatedCostRange: `₹${cementMin.toLocaleString('en-IN')} - ₹${cementMax.toLocaleString('en-IN')}`,
        tips: 'பழைய மற்றும் புதிய காரை உறுதியாக ஒட்டுவதற்கு பாண்டிங் ஏஜெண்ட் சேர்க்கவும்.',
        minCost: cementMin,
        maxCost: cementMax,
      },
      {
        name: 'Hardware Fasteners, Screws & Rawl Plugs Kit',
        nameTa: 'ஆணி, ஸ்க்ரூ, ராவல் பிளக் பாக்கெட்',
        quantity: '1 முழுமையான பாக்கெட்',
        unitCost: 'பாக்கெட் விலை',
        estimatedCostRange: `₹${fastMin} - ₹${fastMax}`,
        tips: 'துருப்பிடிக்காத ஜிங்க் கோட்டட் ஸ்டீல் ஆணிகள் வாங்குங்கள்.',
        minCost: fastMin,
        maxCost: fastMax,
      },
      {
        name: 'Power Tools Hire (Drill, Cutter) & Extension Board',
        nameTa: 'டிரில்லிங் மெஷின் & கட்டிங் மெஷின் வாடகை',
        quantity: '1 நாள் வாடகை',
        unitCost: 'நாள் வாடகை',
        estimatedCostRange: `₹${toolMin} - ₹${toolMax}`,
        tips: 'அருகிலுள்ள டூல்ஸ் வாடகை கடைகளில் தினசரி வாடகைக்கு எடுக்கலாம்.',
        minCost: toolMin,
        maxCost: toolMax,
      },
    ],
    totalEstimatedBudget: `₹${totalMin.toLocaleString('en-IN')} - ₹${totalMax.toLocaleString('en-IN')}`,
    totalMinCost: totalMin,
    totalMaxCost: totalMax,
    safetyGear: ['முகக்கவசம் (Dust Mask)', 'கையுறைகள் (Safety Gloves)', 'பாதுகாப்பு கண்ணாடி'],
    calculationFormulaNotes: 'Calculated according to selected dimension and standard repair constants',
  };
}

// 4. AI Helper for Store Onboarding - Structured Data Extraction
export function extractShopDetailsFromRawInput(rawText: string): Partial<ShopItem> {
  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Extract phone numbers (10 digits)
  const phoneMatch = text.match(/(?:\+91|91)?(?:\s|-)?([6-9]\d{9})/);
  const phone = phoneMatch ? phoneMatch[1] : '';

  // Name extraction (usually first line or text before comma/phone)
  let name = lines[0] || 'புதிய கடை (New Shop)';
  if (name.length > 50) {
    name = name.slice(0, 48);
  }

  // Guess category
  const lower = text.toLowerCase();
  let category: ShopItem['category'] = 'hardware';
  let categoryLabelEn = 'Hardware & General Tools';
  let categoryLabelTa = 'ஹார்டுவேர் & பொது கருவிகள்';

  if (lower.includes('cement') || lower.includes('சிமெண்ட்') || lower.includes('sand') || lower.includes('brick') || lower.includes('steel') || lower.includes('கம்பி')) {
    category = 'cement_building';
    categoryLabelEn = 'Cement & Building Materials';
    categoryLabelTa = 'சிமெண்ட் & கட்டுமான பொருட்கள்';
  } else if (lower.includes('paint') || lower.includes('பெயிண்ட்') || lower.includes('putty') || lower.includes('color')) {
    category = 'paint';
    categoryLabelEn = 'Paints & Wall Finishes';
    categoryLabelTa = 'பெயிண்ட் & வண்ணப் பூச்சு';
  } else if (lower.includes('electric') || lower.includes('plumb') || lower.includes('பைப்') || lower.includes('மோட்டார்') || lower.includes('வயரிங்')) {
    category = 'electrical_plumbing';
    categoryLabelEn = 'Electrical & Plumbing';
    categoryLabelTa = 'எலக்ட்ரிக்கல் & பிளம்பிங்';
  } else if (lower.includes('rental') || lower.includes('வாடகை') || lower.includes('machine') || lower.includes('mixer') || lower.includes('scaffold')) {
    category = 'tools_rental';
    categoryLabelEn = 'Tools & Machinery Rental';
    categoryLabelTa = 'இயந்திரங்கள் & சார வாடகை';
  } else if (lower.includes('wood') || lower.includes('மர') || lower.includes('plywood') || lower.includes('தச்சு')) {
    category = 'timber_carpentry';
    categoryLabelEn = 'Timber & Carpentry';
    categoryLabelTa = 'மரக்கடை & தச்சு பொருட்கள்';
  }

  // Materials parsing
  const materialsList: string[] = [];
  const words = text.split(/[,;\n•\*\-]/).map((w) => w.trim()).filter((w) => w.length > 2);
  for (const w of words) {
    if (
      !w.match(/[0-9]{6,}/) &&
      !w.toLowerCase().includes('road') &&
      !w.toLowerCase().includes('street') &&
      materialsList.length < 5
    ) {
      materialsList.push(w);
    }
  }

  const deliveryAvailable =
    lower.includes('delivery') ||
    lower.includes('டெலிவரி') ||
    lower.includes('வண்டி') ||
    lower.includes('வேன்') ||
    lower.includes('lorry');

  return {
    name,
    nameTa: name,
    category,
    categoryLabelEn,
    categoryLabelTa,
    phone: phone || '9876543210',
    whatsapp: phone || '9876543210',
    address: lines.slice(1).find((l) => l.length > 5 && !l.match(/^[0-9\s\-\+]+$/)) || 'Main Road, Tamil Nadu',
    city: 'Chennai',
    cityTa: 'சென்னை',
    materialsList: materialsList.length > 0 ? materialsList : ['Cement', 'Sand', 'Steel Rods', 'Bricks'],
    materialsListTa: materialsList.length > 0 ? materialsList : ['சிமெண்ட்', 'மணல்', 'கம்பி', 'செங்கல்'],
    deliveryAvailable,
    rating: 4.8,
    isVerified: true,
  };
}
