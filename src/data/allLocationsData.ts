export interface StateItem {
  id: string;
  nameEn: string;
  nameTa: string;
  nameHi?: string;
  nameTe?: string;
  nameMl?: string;
  nameKn?: string;
  districts: DistrictItem[];
}

export interface DistrictItem {
  id: string;
  nameEn: string;
  nameTa: string;
  nameHi?: string;
  nameTe?: string;
  nameMl?: string;
  nameKn?: string;
  cities?: string[];
}

export interface CountryLocationHierarchy {
  code: string;
  nameEn: string;
  nameTa: string;
  flag: string;
  dialCode: string;
  states: StateItem[];
}

// Complete database of Indian States & Districts
export const ALL_INDIAN_STATES: StateItem[] = [
  {
    id: 'TN',
    nameEn: 'Tamil Nadu',
    nameTa: 'தமிழ்நாடு',
    nameHi: 'तमिलनाडु',
    nameTe: 'తమిళనాడు',
    nameMl: 'തമിഴ്നാട്',
    nameKn: 'ತಮಿಳುನಾಡು',
    districts: [
      { id: 'chennai', nameEn: 'Chennai (Capital)', nameTa: 'சென்னை (தலைநகரம்)', nameHi: 'चेन्नई', cities: ['Tambaram', 'Guindy', 'T. Nagar', 'Anna Nagar', 'Velachery', 'Ambattur', 'Avadi', 'Porur', 'Koyambedu', 'Royapettah'] },
      { id: 'coimbatore', nameEn: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', nameHi: 'कोयंबटूर', cities: ['Singanallur', 'Gandhipuram', 'Peelamedu', 'RS Puram', 'Saravanampatti', 'Pollachi', 'Mettupalayam'] },
      { id: 'madurai', nameEn: 'Madurai', nameTa: 'மதுரை', nameHi: 'मदुरै', cities: ['Mattuthavani', 'Goripalayam', 'Anna Nagar', 'Thirunagar', 'Vadipatti', 'Melur', 'Usilampatti', 'Thirumangalam'] },
      { id: 'trichy', nameEn: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி (திருச்சி)', nameHi: 'तिरुचिरापल्ली', cities: ['Thillai Nagar', 'Srirangam', 'Central Bus Stand', 'K.K. Nagar', 'Tiruverumbur', 'Manapparai'] },
      { id: 'salem', nameEn: 'Salem', nameTa: 'சேலம்', nameHi: 'सलेम', cities: ['Hasthampatti', 'Suramangalam', 'Ammapet', 'Attur', 'Mettur', 'Omalur', 'Sankari'] },
      { id: 'tiruppur', nameEn: 'Tiruppur', nameTa: 'திருப்பூர்', nameHi: 'तिरुपूर', cities: ['Avinashi', 'Palladam', 'Udumalaipettai', 'Dharapuram', 'Kangeyam'] },
      { id: 'erode', nameEn: 'Erode', nameTa: 'ஈரோடு', nameHi: 'इरोड', cities: ['Bhavani', 'Perundurai', 'Gobichettipalayam', 'Sathyamangalam', 'Anthiyur'] },
      { id: 'tirunelveli', nameEn: 'Tirunelveli', nameTa: 'திருநெல்வேலி', nameHi: 'तिरुनेलवेली', cities: ['Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Cheranmahadevi', 'Valliyur'] },
      { id: 'vellore', nameEn: 'Vellore', nameTa: 'வேலூர்', nameHi: 'वेल्लोर', cities: ['Katpadi', 'Sathuvachari', 'Gudiyatham', 'Anaicut', 'Pernambut'] },
      { id: 'thanjavur', nameEn: 'Thanjavur', nameTa: 'தஞ்சாவூர்', nameHi: 'तंजாவூர்', cities: ['Kumbakonam', 'Pattukkottai', 'Papanasam', 'Thiruvaiyaru', 'Orathanadu'] },
      { id: 'dindigul', nameEn: 'Dindigul', nameTa: 'திண்டுக்கல்', nameHi: 'डिंडीगुल', cities: ['Palani', 'Kodaikanal', 'Natham', 'Oddanchatram', 'Nilakottai'] },
      { id: 'kanchipuram', nameEn: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', nameHi: 'कांचीपुरम', cities: ['Sriperumbudur', 'Walajabad', 'Uthiramerur', 'Kundrathur'] },
      { id: 'chengalpattu', nameEn: 'Chengalpattu', nameTa: 'செங்கல்பட்டு', nameHi: 'चेंगलपट्टू', cities: ['Tambaram South', 'Maraimalai Nagar', 'Mahabalipuram', 'Madurantakam', 'Kelambakkam'] },
      { id: 'thiruvallur', nameEn: 'Thiruvallur', nameTa: 'திருவள்ளூர்', nameHi: 'तिरुवल्लूर', cities: ['Ponneri', 'Gummidipoondi', 'Tiruttani', 'Poonamallee', 'Uthukottai'] },
      { id: 'cuddalore', nameEn: 'Cuddalore', nameTa: 'கடலூர்', nameHi: 'कडलूर', cities: ['Panruti', 'Chidambaram', 'Virudhachalam', 'Neyveli', 'Tittakudi'] },
      { id: 'thoothukudi', nameEn: 'Thoothukudi (Tuticorin)', nameTa: 'தூத்துக்குடி', nameHi: 'तूतीकोरिन', cities: ['Kovilpatti', 'Tiruchendur', 'Sathankulam', 'Vilathikulam', 'Ettayapuram'] },
      { id: 'kanyakumari', nameEn: 'Kanyakumari (Nagercoil)', nameTa: 'கன்னியாகுமரி (நாகர்கோவில்)', nameHi: 'कन्याकुमारी', cities: ['Nagercoil', 'Marthandam', 'Padmanabhapuram', 'Colachel', 'Thuckalay'] },
      { id: 'krishnagiri', nameEn: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி', nameHi: 'कृष्णगिरि', cities: ['Hosur', 'Pochampalli', 'Bargur', 'Uthangarai', 'Denkanikottai'] },
      { id: 'dharmapuri', nameEn: 'Dharmapuri', nameTa: 'தருமபுரி', nameHi: 'धर्मपुरी', cities: ['Harur', 'Palacode', 'Pennagaram', 'Karimangalam', 'Pappireddipatti'] },
      { id: 'namakkal', nameEn: 'Namakkal', nameTa: 'நாமக்கல்', nameHi: 'नमक्कल', cities: ['Tiruchengode', 'Rasipuram', 'Paramathi Velur', 'Kolli Hills', 'Sendamangalam'] },
      { id: 'karur', nameEn: 'Karur', nameTa: 'கரூர்', nameHi: 'करूर', cities: ['Kulithalai', 'Aravakurichi', 'Manmangalam', 'Pugalur'] },
      { id: 'nilgiris', nameEn: 'Nilgiris (Ooty)', nameTa: 'நீலகிரி (ஊட்டி)', nameHi: 'नीलगिरि', cities: ['Udhagamandalam (Ooty)', 'Coonoor', 'Kotagiri', 'Gudalur', 'Pandalur'] },
      { id: 'perambalur', nameEn: 'Perambalur', nameTa: 'பெரம்பலூர்', nameHi: 'पेरम्बलूर', cities: ['Kunnam', 'Veppanthattai', 'Alathur'] },
      { id: 'ariyalur', nameEn: 'Ariyalur', nameTa: 'அரியலூர்', nameHi: 'अरियालूर', cities: ['Jayankondam', 'Udayarpalayam', 'Sendurai', 'Andimadam'] },
      { id: 'pudukkottai', nameEn: 'Pudukkottai', nameTa: 'புதுக்கோட்டை', nameHi: 'पुदुक्कोट्टई', cities: ['Aranthangi', 'Alangudi', 'Illuppur', 'Thirumayam', 'Viralimalai'] },
      { id: 'ramanathapuram', nameEn: 'Ramanathapuram', nameTa: 'இராமநாதபுரம்', nameHi: 'रामनाथपुरम', cities: ['Rameswaram', 'Paramakudi', 'Mudukulathur', 'Kilakarai', 'Tiruvadanai'] },
      { id: 'sivaganga', nameEn: 'Sivaganga', nameTa: 'சிவகங்கை', nameHi: 'शिवगंगा', cities: ['Karaikudi', 'Devakottai', 'Manamadurai', 'Tiruppattur', 'Kalaiyarkoil'] },
      { id: 'tenkasi', nameEn: 'Tenkasi', nameTa: 'தென்காசி', nameHi: 'तेनकासी', cities: ['Courtallam', 'Sankarankovil', 'Kadayanallur', 'Alangulam', 'Shenkottai'] },
      { id: 'theni', nameEn: 'Theni', nameTa: 'தேனி', nameHi: 'थेनी', cities: ['Periyakulam', 'Bodinayakanur', 'Cumbum', 'Uthamapalayam', 'Andipatti'] },
      { id: 'tirupattur_tn', nameEn: 'Tirupattur', nameTa: 'திருப்பத்தூர்', nameHi: 'तिरुपात्तूर', cities: ['Vaniyambadi', 'Ambur', 'Natrampalli', 'Jolarpet'] },
      { id: 'tiruvarur', nameEn: 'Tiruvarur', nameTa: 'திருவாரூர்', nameHi: 'तिरुवारूर', cities: ['Mannargudi', 'Thiruthuraipoondi', 'Nannilam', 'Kudavasal', 'Valangaiman'] },
      { id: 'tiruvannamalai', nameEn: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை', nameHi: 'तिरुवन्नामलाई', cities: ['Arani', 'Polur', 'Chengam', 'Cheyyar', 'Vandavasi'] },
      { id: 'ranipet', nameEn: 'Ranipet', nameTa: 'ராணிப்பேட்டை', nameHi: 'रानीपेट', cities: ['Walajah', 'Arcot', 'Arakkonam', 'Nemili', 'Sholinghur'] },
      { id: 'kallakurichi', nameEn: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி', nameHi: 'कल्लाकुरिची', cities: ['Sankarapuram', 'Chinnasalem', 'Ulundurpet', 'Tirukkoyilur'] },
      { id: 'villupuram', nameEn: 'Villupuram', nameTa: 'விழுப்புரம்', nameHi: 'विल्लुपुरम', cities: ['Tindivanam', 'Gingee', 'Vanur', 'Marakkanam', 'Vikravandi'] },
      { id: 'nagapattinam', nameEn: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்', nameHi: 'नागापट्टिनम', cities: ['Velankanni', 'Vedaranyam', 'Kilvelur', 'Thirukkuvalai'] },
      { id: 'mayiladuthurai', nameEn: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை', nameHi: 'मयिलादुथुरै', cities: ['Sirkazhi', 'Tharangambadi', 'Kuthalam'] },
      { id: 'virudhunagar', nameEn: 'Virudhunagar', nameTa: 'விருதுநகர்', nameHi: 'विरुद्धनगर', cities: ['Sivakasi', 'Rajapalayam', 'Aruppukkottai', 'Sattur', 'Srivilliputhur'] },
    ],
  },
  {
    id: 'KL',
    nameEn: 'Kerala',
    nameTa: 'கேரளா',
    nameHi: 'केरल',
    nameTe: 'కేరళ',
    nameMl: 'കേരളം',
    nameKn: 'ಕೇರಳ',
    districts: [
      { id: 'thiruvananthapuram', nameEn: 'Thiruvananthapuram (Capital)', nameTa: 'திருவனந்தபுரம்', nameHi: 'तिरुवनंतपुरम', cities: ['Kochi', 'Attingal', 'Nedumangad', 'Neyyattinkara', 'Varkala'] },
      { id: 'ernakulam', nameEn: 'Ernakulam (Kochi)', nameTa: 'எர்ணாகுளம் (கொச்சி)', nameHi: 'एर्नाकुलम (कोच्चि)', cities: ['Kochi City', 'Aluva', 'Angamaly', 'Perumbavoor', 'Muvattupuzha', 'Tripunithura'] },
      { id: 'kozhikode', nameEn: 'Kozhikode (Calicut)', nameTa: 'கோழிக்கோடு', nameHi: 'कोझिकोड', cities: ['Vadakara', 'Koyilandy', 'Thamarassery', 'Feroke'] },
      { id: 'thrissur', nameEn: 'Thrissur', nameTa: 'திருச்சூர்', nameHi: 'त्रिशूर', cities: ['Chalakudy', 'Guruvayur', 'Kunnamkulam', 'Kodungallur', 'Irinjalakuda'] },
      { id: 'palakkad', nameEn: 'Palakkad', nameTa: 'பாலக்காடு', nameHi: 'पालक्काड़', cities: ['Chittur', 'Ottapalam', 'Mannarkkad', 'Alathur', 'Pattambi'] },
      { id: 'malappuram', nameEn: 'Malappuram', nameTa: 'மலப்புரம்', nameHi: 'मलप्पुरम', cities: ['Manjeri', 'Perinthalmanna', 'Tirur', 'Ponnani', 'Kottakkal'] },
      { id: 'kollam', nameEn: 'Kollam (Quilon)', nameTa: 'கொல்லம்', nameHi: 'कोल्लम', cities: ['Karunagappally', 'Punalur', 'Kottarakkara', 'Paravur'] },
      { id: 'kannur', nameEn: 'Kannur', nameTa: 'கண்ணூர்', nameHi: 'कन्नूर', cities: ['Thalassery', 'Payyanur', 'Taliparamba', 'Mattannur'] },
      { id: 'alappuzha', nameEn: 'Alappuzha (Alleppey)', nameTa: 'ஆலப்புழா', nameHi: 'अलप्पुझा', cities: ['Cherthala', 'Kayamkulam', 'Mavelikkara', 'Chengannur'] },
      { id: 'kottayam', nameEn: 'Kottayam', nameTa: 'கோட்டயம்', nameHi: 'कोट्टायम', cities: ['Changanassery', 'Pala', 'Vaikom', 'Kanjirappally'] },
      { id: 'idukki', nameEn: 'Idukki', nameTa: 'இடுக்கி', nameHi: 'इडुक्की', cities: ['Munnar', 'Thodupuzha', 'Kattappana', 'Nedumkandam'] },
      { id: 'pathanamthitta', nameEn: 'Pathanamthitta', nameTa: 'பத்தனம்திட்டா', nameHi: 'पथनमथिट्टा', cities: ['Adoor', 'Thiruvalla', 'Ranni', 'Konni'] },
      { id: 'kasaragod', nameEn: 'Kasaragod', nameTa: 'காசர்கோடு', nameHi: 'कासरगोड', cities: ['Kanhangad', 'Nileshwar', 'Manjeshwar'] },
      { id: 'wayanad', nameEn: 'Wayanad', nameTa: 'வயநாடு', nameHi: 'वायनाड', cities: ['Kalpetta', 'Sulthan Bathery', 'Mananthavady'] },
    ],
  },
  {
    id: 'KA',
    nameEn: 'Karnataka',
    nameTa: 'கர்நாடகா',
    nameHi: 'कर्नाटक',
    nameTe: 'కర్ణాటక',
    nameMl: 'കർണാടക',
    nameKn: 'ಕರ್ನಾಟಕ',
    districts: [
      { id: 'bengaluru_urban', nameEn: 'Bengaluru Urban (Capital)', nameTa: 'பெங்களூரு (தலைநகரம்)', nameHi: 'बेंगलुरु', cities: ['Whitefield', 'Electronic City', 'Koramangala', 'Indiranagar', 'Hebbal', 'Jayanagar', 'Yelahanka', 'Marathahalli', 'Peenya'] },
      { id: 'bengaluru_rural', nameEn: 'Bengaluru Rural', nameTa: 'பெங்களூரு ஊரகம்', nameHi: 'बेंगलुरु ग्रामीण', cities: ['Devanahalli', 'Nelamangala', 'Doddaballapura', 'Hosakote'] },
      { id: 'mysuru', nameEn: 'Mysuru (Mysore)', nameTa: 'மைசூரு', nameHi: 'मैसूर', cities: ['Hunsur', 'Nanjangud', 'T. Narasipura', 'KR Nagar'] },
      { id: 'dharwad', nameEn: 'Hubballi-Dharwad', nameTa: 'ஹூப்ளி-தார்வாட்', nameHi: 'हुबली-धारवाड़', cities: ['Hubli', 'Dharwad', 'Navalgund', 'Kundgol'] },
      { id: 'dakshina_kannada', nameEn: 'Dakshina Kannada (Mangaluru)', nameTa: 'தட்சிண கன்னடா (மங்களூரு)', nameHi: 'दक्षिण कन्नड़', cities: ['Mangaluru City', 'Bantwal', 'Puttur', 'Belthangady', 'Sullia'] },
      { id: 'belagavi', nameEn: 'Belagavi (Belgaum)', nameTa: 'பெலகாவி (பெல்காம்)', nameHi: 'बेलगावी', cities: ['Gokak', 'Chikkodi', 'Bailhongal', 'Athani'] },
      { id: 'kalaburagi', nameEn: 'Kalaburagi (Gulbarga)', nameTa: 'கலபுர்கி (குல்பர்கா)', nameHi: 'कलबुर्गी', cities: ['Sedam', 'Chincholi', 'Afzalpur', 'Jewargi'] },
      { id: 'ballari', nameEn: 'Ballari (Bellary)', nameTa: 'பல்லாரி', nameHi: 'बल्लारी', cities: ['Siruguppa', 'Sandur', 'Kampli'] },
      { id: 'tumakuru', nameEn: 'Tumakuru (Tumkur)', nameTa: 'துமகூரு', nameHi: 'तुमकुरु', cities: ['Tiptur', 'Kunigal', 'Sira', 'Madhugiri', 'Gubbi'] },
      { id: 'shivamogga', nameEn: 'Shivamogga (Shimoga)', nameTa: 'சிவமொக்கா', nameHi: 'शिवमोग्गा', cities: ['Bhadravathi', 'Sagar', 'Shikaripura', 'Thirthahalli'] },
      { id: 'davanagere', nameEn: 'Davanagere', nameTa: 'தாவணகெரே', nameHi: 'दावणगेरे', cities: ['Harihar', 'Channagiri', 'Honnali', 'Jagalur'] },
      { id: 'udupi', nameEn: 'Udupi', nameTa: 'உடுப்பி', nameHi: 'उडुपी', cities: ['Manipal', 'Kundapura', 'Karkala', 'Brahmavara'] },
      { id: 'hassan', nameEn: 'Hassan', nameTa: 'ஹாசன்', nameHi: 'हासन', cities: ['Arsikere', 'Channarayapatna', 'Sakleshpur', 'Holenarasipura'] },
      { id: 'mandya', nameEn: 'Mandya', nameTa: 'மண்டியா', nameHi: 'मंड्या', cities: ['Maddur', 'Malavalli', 'Srirangapatna', 'Pandavapura', 'Nagamangala'] },
    ],
  },
  {
    id: 'AP',
    nameEn: 'Andhra Pradesh',
    nameTa: 'ஆந்திர பிரதேசம்',
    nameHi: 'आंध्र प्रदेश',
    nameTe: 'ఆంధ్రప్రదేశ్',
    nameMl: 'ആന്ധ്രാപ്രദേശ്',
    nameKn: 'ಆಂಧ್ರಪ್ರದೇಶ',
    districts: [
      { id: 'visakhapatnam', nameEn: 'Visakhapatnam (Vizag)', nameTa: 'விசாகப்பட்டினம்', nameHi: 'विशाखापट्टनम', cities: ['Gajuwaka', 'Madhurawada', 'Pendurthi', 'Anakapalle', 'Bheemunipatnam'] },
      { id: 'ntr_vijayawada', nameEn: 'NTR (Vijayawada)', nameTa: 'விஜயவாடா', nameHi: 'विजयवाड़ा', cities: ['Vijayawada City', 'Gannavaram', 'Mylavaram', 'Tiruvuru', 'Nandigama'] },
      { id: 'guntur', nameEn: 'Guntur', nameTa: 'குண்டூர்', nameHi: 'गुंटूर', cities: ['Guntur City', 'Mangalagiri', 'Tenali', 'Tadikonda', 'Ponnur'] },
      { id: 'tirupati', nameEn: 'Tirupati', nameTa: 'திருப்பதி', nameHi: 'तिरुपति', cities: ['Tirupati Urban', 'Srikalahasti', 'Chandragiri', 'Sullurpeta', 'Venkatagiri'] },
      { id: 'kurnool', nameEn: 'Kurnool', nameTa: 'கர்நூல்', nameHi: 'कुरनूल', cities: ['Kurnool City', 'Adoni', 'Yemmiganur', 'Kodumur', 'Pattikonda'] },
      { id: 'nellore', nameEn: 'SPSR Nellore', nameTa: 'நெல்லூர்', nameHi: 'नेल्लोर', cities: ['Nellore City', 'Kavali', 'Gudur', 'Atmakur', 'Kovur'] },
      { id: 'kakinada', nameEn: 'Kakinada', nameTa: 'காக்கிநாடா', nameHi: 'काकीनाडा', cities: ['Kakinada Port', 'Samalkota', 'Peddapuram', 'Pithapuram'] },
      { id: 'kadapa', nameEn: 'YSR Kadapa', nameTa: 'கடப்பா', nameHi: 'कडपा', cities: ['Kadapa City', 'Proddatur', 'Pulivendula', 'Jammalamadugu'] },
      { id: 'anantapur', nameEn: 'Anantapur', nameTa: 'அனந்தபூர்', nameHi: 'अनंतपुर', cities: ['Guntakal', 'Tadipatri', 'Dharmavaram', 'Rayadurg'] },
      { id: 'chittoor', nameEn: 'Chittoor', nameTa: 'சித்தூர்', nameHi: 'चित्तूर', cities: ['Chittoor City', 'Nagari', 'Palamaner', 'Kuppam', 'Punganur'] },
    ],
  },
  {
    id: 'TG',
    nameEn: 'Telangana',
    nameTa: 'தெலுங்கானா',
    nameHi: 'तेलंगाना',
    nameTe: 'తెలంగాణ',
    nameMl: 'തെലങ്കാന',
    nameKn: 'ತೆಲಂಗಾಣ',
    districts: [
      { id: 'hyderabad', nameEn: 'Hyderabad (Capital)', nameTa: 'ஹைதராபாத்', nameHi: 'हैदराबाद', cities: ['Secunderabad', 'Madhapur (HITEC City)', 'Gachibowli', 'Kukatpally', 'Ameerpet', 'Charminar', 'Dilsukhnagar', 'LB Nagar'] },
      { id: 'medchal_malkajgiri', nameEn: 'Medchal-Malkajgiri', nameTa: 'மேட்சல்-மல்காஜ்கிரி', nameHi: 'मेडचल', cities: ['Malkajgiri', 'Uppal', 'Kukatpally North', 'Alwal', 'Medchal Town'] },
      { id: 'rangareddy', nameEn: 'Ranga Reddy', nameTa: 'ரங்காரெட்டி', nameHi: 'रंगारेड्डी', cities: ['Rajendranagar', 'Serilingampally', 'Shamshabad (Airport)', 'Ibrahimpatnam', 'Maheshwaram'] },
      { id: 'warangal', nameEn: 'Warangal', nameTa: 'வாரங்கல்', nameHi: 'वारंगल', cities: ['Hanamkonda', 'Kazipet', 'Warangal Fort', 'Narsampet', 'Wardhannapet'] },
      { id: 'karimnagar', nameEn: 'Karimnagar', nameTa: 'கரீம்நகர்', nameHi: 'करीमनगर', cities: ['Huzurabad', 'Choppadandi', 'Manakondur', 'Jammikunta'] },
      { id: 'nizamabad', nameEn: 'Nizamabad', nameTa: 'நிசாமாபாத்', nameHi: 'निज़ामाबाद', cities: ['Bodhan', 'Armoor', 'Banswada', 'Dichpally'] },
      { id: 'khammam', nameEn: 'Khammam', nameTa: 'கம்மம்', nameHi: 'खम्मम', cities: ['Madhira', 'Sathupalli', 'Wyra', 'Palair'] },
    ],
  },
  {
    id: 'MH',
    nameEn: 'Maharashtra',
    nameTa: 'மகாராஷ்டிரா',
    nameHi: 'महाराष्ट्र',
    nameTe: 'మహారాష్ట్ర',
    nameMl: 'മഹാരാഷ്ട്ര',
    nameKn: 'ಮಹಾರಾಷ್ಟ್ರ',
    districts: [
      { id: 'mumbai_city', nameEn: 'Mumbai City (Capital)', nameTa: 'மும்பை நகரம்', nameHi: 'मुंबई शहर', cities: ['South Mumbai', 'Dadar', 'Colaba', 'Worli', 'Parel', 'Byculla'] },
      { id: 'mumbai_suburban', nameEn: 'Mumbai Suburban', nameTa: 'மும்பை புறநகர்', nameHi: 'मुंबई उपनगर', cities: ['Andheri', 'Bandra', 'Borivali', 'Goregaon', 'Malad', 'Kurla', 'Ghatkopar', 'Mulund'] },
      { id: 'pune', nameEn: 'Pune', nameTa: 'புனே', nameHi: 'पुणे', cities: ['Hinjawadi IT Park', 'Shivajinagar', 'Kothrud', 'Hadapsar', 'Pimpri-Chinchwad', 'Viman Nagar', 'Wakad'] },
      { id: 'nagpur', nameEn: 'Nagpur', nameTa: 'நாக்பூர்', nameHi: 'नागपुर', cities: ['Dharampeth', 'Sitabuldi', 'MIHAN', 'Kamptee', 'Hingna'] },
      { id: 'thane', nameEn: 'Thane', nameTa: 'தானே', nameHi: 'ठाणे', cities: ['Kalyan', 'Dombivli', 'Mira-Bhayandar', 'Ulhasnagar', 'Bhiwandi'] },
      { id: 'nashik', nameEn: 'Nashik', nameTa: 'நாசிக்', nameHi: 'नासिक', cities: ['Panchavati', 'Satpur', 'Ambad', 'Deolali', 'Malegaon'] },
      { id: 'aurangabad', nameEn: 'Chhatrapati Sambhajinagar', nameTa: 'ஔரங்காபாத்', nameHi: 'छत्रपति संभाजीनगर', cities: ['CIDCO', 'Waluj', 'Shendra MIDC', 'Paithan'] },
    ],
  },
  {
    id: 'DL',
    nameEn: 'Delhi NCR',
    nameTa: 'தில்லி / என்.சி.ஆர்',
    nameHi: 'दिल्ली एनसीआर',
    nameTe: 'ఢిల్లీ ఎన్సీఆర్',
    nameMl: 'ഡൽഹി എൻസിആർ',
    nameKn: 'ದೆಹಲಿ ಎನ್‌ಸಿಆರ್',
    districts: [
      { id: 'new_delhi', nameEn: 'New Delhi (National Capital)', nameTa: 'புது தில்லி', nameHi: 'नई दिल्ली', cities: ['Connaught Place', 'Chanakyapuri', 'India Gate', 'Karol Bagh'] },
      { id: 'south_delhi', nameEn: 'South Delhi', nameTa: 'தெற்கு தில்லி', nameHi: 'दक्षिण दिल्ली', cities: ['Hauz Khas', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Vasant Kunj'] },
      { id: 'noida_gbnagar', nameEn: 'Noida / Greater Noida (UP-NCR)', nameTa: 'நொய்டா / கிரேட்டர் நொய்டா', nameHi: 'नोएडा', cities: ['Noida Sector 18', 'Noida Sector 62', 'Greater Noida West', 'Pari Chowk'] },
      { id: 'gurugram_hry', nameEn: 'Gurugram (Haryana-NCR)', nameTa: 'குருகிராம் (குர்கான்)', nameHi: 'गुरुग्राम', cities: ['Cyber City', 'Golf Course Road', 'Sohna Road', 'Udyog Vihar', 'Manesar'] },
      { id: 'ghaziabad_up', nameEn: 'Ghaziabad (UP-NCR)', nameTa: 'காசியாபாத்', nameHi: 'गाजियाबाद', cities: ['Indirapuram', 'Vaishali', 'Raj Nagar', 'Crossings Republik'] },
      { id: 'faridabad_hry', nameEn: 'Faridabad (Haryana-NCR)', nameTa: 'பரிதாபாத்', nameHi: 'फरीदाबाद', cities: ['NIT Faridabad', 'Ballabgarh', 'Greater Faridabad', 'Sector 15'] },
    ],
  },
  {
    id: 'GJ',
    nameEn: 'Gujarat',
    nameTa: 'குஜராத்',
    nameHi: 'गुजरात',
    districts: [
      { id: 'ahmedabad', nameEn: 'Ahmedabad', nameTa: 'அகமதாபாத்', nameHi: 'अहमदाबाद', cities: ['SG Highway', 'Navrangpura', 'Maninagar', 'Bopal', 'Vastrapur', 'Sanand'] },
      { id: 'surat', nameEn: 'Surat', nameTa: 'சூரத்', nameHi: 'सूरत', cities: ['Varachha', 'Athwa', 'Adajan', 'Katargam', 'Rander', 'Sachin GIDC'] },
      { id: 'vadodara', nameEn: 'Vadodara (Baroda)', nameTa: 'வடோதரா', nameHi: 'वडोदरा', cities: ['Alkapuri', 'Manjalpur', 'Sayajigunj', 'Makarpura GIDC'] },
      { id: 'rajkot', nameEn: 'Rajkot', nameTa: 'ராஜ்கோட்', nameHi: 'राजकोट', cities: ['Kalawad Road', '150 Feet Ring Road', 'Aji GIDC', 'Metoda'] },
    ],
  },
  {
    id: 'UP',
    nameEn: 'Uttar Pradesh',
    nameTa: 'உத்தர பிரதேசம்',
    nameHi: 'उत्तर प्रदेश',
    districts: [
      { id: 'lucknow', nameEn: 'Lucknow (Capital)', nameTa: 'லக்னோ', nameHi: 'लखनऊ', cities: ['Hazratganj', 'Gomti Nagar', 'Alambagh', 'Indira Nagar', 'Charbagh'] },
      { id: 'kanpur', nameEn: 'Kanpur', nameTa: 'கான்பூர்', nameHi: 'कानपुर', cities: ['Civil Lines', 'Kidwai Nagar', 'Kalyanpur', 'Panki Industrial Area'] },
      { id: 'varanasi', nameEn: 'Varanasi (Kashi)', nameTa: 'வாரணாசி', nameHi: 'वाराणसी', cities: ['Godowlia', 'Assi Ghat', 'Lanka', 'Shivpur', 'Sarnath'] },
      { id: 'agra', nameEn: 'Agra', nameTa: 'ஆக்ரா', nameHi: 'आगरा', cities: ['Tajganj', 'Sanjay Place', 'Dayalbagh', 'Kamla Nagar'] },
      { id: 'prayagraj', nameEn: 'Prayagraj (Allahabad)', nameTa: 'பிரயாக்ராஜ்', nameHi: 'प्रयागराज', cities: ['Civil Lines', 'Naini', 'Katra', 'Georgetown'] },
    ],
  },
  {
    id: 'WB',
    nameEn: 'West Bengal',
    nameTa: 'மேற்கு வங்காளம்',
    nameHi: 'पश्चिम बंगाल',
    districts: [
      { id: 'kolkata', nameEn: 'Kolkata (Capital)', nameTa: 'கொல்கத்தா', nameHi: 'कोलकाता', cities: ['Salt Lake (Sector V)', 'New Town', 'Park Street', 'Howrah', 'Gariahat', 'Dum Dum', 'Behala'] },
      { id: 'darjeeling', nameEn: 'Darjeeling / Siliguri', nameTa: 'டார்ஜிலிங் / சிலிகுரி', nameHi: 'दार्जिलिंग', cities: ['Siliguri', 'Kurseong', 'Mirik', 'Kalimpong'] },
      { id: 'asansol', nameEn: 'Paschim Bardhaman (Asansol/Durgapur)', nameTa: 'அசன்சோல் / துர்காபூர்', nameHi: 'आसनसोल', cities: ['Durgapur', 'Asansol City', 'Raniganj'] },
    ],
  },
  {
    id: 'RJ',
    nameEn: 'Rajasthan',
    nameTa: 'ராஜஸ்தான்',
    nameHi: 'राजस्थान',
    districts: [
      { id: 'jaipur', nameEn: 'Jaipur (Pink City - Capital)', nameTa: 'ஜெய்ப்பூர்', nameHi: 'जयपुर', cities: ['Malviya Nagar', 'Mansarovar', 'Vaishali Nagar', 'Sitapura Industrial Area', 'C-Scheme'] },
      { id: 'jodhpur', nameEn: 'Jodhpur', nameTa: 'ஜோத்பூர்', nameHi: 'जोधपुर', cities: ['Ratanada', 'Shastri Nagar', 'Basni Industrial Area'] },
      { id: 'kota', nameEn: 'Kota', nameTa: 'கோட்டா', nameHi: 'कोटा', cities: ['Vigyan Nagar', 'Talwandi', 'Indraprastha Industrial Area'] },
      { id: 'udaipur', nameEn: 'Udaipur', nameTa: 'உதய்பூர்', nameHi: 'उदयपुर', cities: ['Sukher', 'Hiran Magri', 'Fateh Sagar', 'MIA'] },
    ],
  },
  {
    id: 'MP',
    nameEn: 'Madhya Pradesh',
    nameTa: 'மத்திய பிரதேசம்',
    nameHi: 'मध्य प्रदेश',
    districts: [
      { id: 'indore', nameEn: 'Indore', nameTa: 'இந்தூர்', nameHi: 'इंदौर', cities: ['Vijay Nagar', 'Palasia', 'Pithampur Industrial Area', 'Bhawarkua'] },
      { id: 'bhopal', nameEn: 'Bhopal (Capital)', nameTa: 'போபால்', nameHi: 'भोपाल', cities: ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Govindpura Industrial Area'] },
    ],
  },
  {
    id: 'BR',
    nameEn: 'Bihar',
    nameTa: 'பீகார்',
    nameHi: 'बिहार',
    districts: [
      { id: 'patna', nameEn: 'Patna (Capital)', nameTa: 'பாட்னா', nameHi: 'पटना', cities: ['Kankarbagh', 'Boring Road', 'Bailey Road', 'Patliputra', 'Danapur'] },
      { id: 'gaya', nameEn: 'Gaya', nameTa: 'கயா', nameHi: 'गया', cities: ['Bodh Gaya', 'Civil Lines', 'Manpur'] },
    ],
  },
  {
    id: 'PB',
    nameEn: 'Punjab',
    nameTa: 'பஞ்சாப்',
    nameHi: 'पंजाब',
    districts: [
      { id: 'ludhiana', nameEn: 'Ludhiana', nameTa: 'லூதியானா', nameHi: 'लुधियाना', cities: ['Ferozepur Road', 'Model Town', 'Focal Point Industrial Area'] },
      { id: 'amritsar', nameEn: 'Amritsar', nameTa: 'அமிர்தசரஸ்', nameHi: 'अमृतसर', cities: ['Golden Temple Area', 'Ranjit Avenue', 'Mall Road'] },
      { id: 'mohali', nameEn: 'SAS Nagar (Mohali)', nameTa: 'மொஹாலி', nameHi: 'मोहाली', cities: ['Phase 7', 'Phase 3B2', 'Sector 82 Industrial Area'] },
    ],
  },
  {
    id: 'HR',
    nameEn: 'Haryana',
    nameTa: 'ஹரியானா',
    nameHi: 'हरियाणा',
    districts: [
      { id: 'gurugram', nameEn: 'Gurugram (Gurgaon)', nameTa: 'குருகிராம்', nameHi: 'गुरुग्राम', cities: ['Cyber Hub', 'Sohna', 'Manesar', 'Sector 29'] },
      { id: 'faridabad', nameEn: 'Faridabad', nameTa: 'பரிதாபாத்', nameHi: 'फरीदाबाद', cities: ['NIT', 'Sector 15', 'Ballabgarh'] },
      { id: 'panipat', nameEn: 'Panipat', nameTa: 'பானிபட்', nameHi: 'पानीपत', cities: ['Model Town', 'Industrial Area', 'Samalkha'] },
    ],
  },
  {
    id: 'OD',
    nameEn: 'Odisha',
    nameTa: 'ஒடிசா',
    nameHi: 'ओडिशा',
    districts: [
      { id: 'bhubaneswar', nameEn: 'Bhubaneswar (Capital)', nameTa: 'புவனேஸ்வர்', nameHi: 'भुवनेश्वर', cities: ['Khandagiri', 'Patia (Infocity)', 'Nayapalli', 'Saheed Nagar'] },
      { id: 'cuttack', nameEn: 'Cuttack', nameTa: 'கட்டாக்', nameHi: 'कटक', cities: ['Choudwar', 'Badambadi', 'Madhupatna'] },
    ],
  },
  {
    id: 'AS',
    nameEn: 'Assam',
    nameTa: 'அசாம்',
    nameHi: 'असम',
    districts: [
      { id: 'kamrup_guwahati', nameEn: 'Guwahati (Kamrup)', nameTa: 'குவஹாத்தி', nameHi: 'गुवाहाटी', cities: ['Paltan Bazaar', 'Dispur Capital Complex', 'Six Mile', 'Ganeshguri'] },
    ],
  },
  {
    id: 'GA',
    nameEn: 'Goa',
    nameTa: 'கோவா',
    nameHi: 'गोवा',
    districts: [
      { id: 'north_goa', nameEn: 'North Goa (Panaji / Mapusa)', nameTa: 'வடக்கு கோவா (பனாஜி)', nameHi: 'उत्तर गोवा', cities: ['Panaji City', 'Mapusa', 'Calangute', 'Candolim', 'Bicholim'] },
      { id: 'south_goa', nameEn: 'South Goa (Margao / Vasco)', nameTa: 'தெற்கு கோவா (மார்கோவா)', nameHi: 'दक्षिण गोवा', cities: ['Margao', 'Vasco da Gama', 'Ponda', 'Curchorem'] },
    ],
  },
  {
    id: 'PY',
    nameEn: 'Puducherry (Union Territory)',
    nameTa: 'புதுச்சேரி (யூனியன் பிரதேசம்)',
    nameHi: 'पुदुचेरी',
    districts: [
      { id: 'puducherry_city', nameEn: 'Puducherry Town & Suburbs', nameTa: 'புதுச்சேரி நகரம்', nameHi: 'पुदुचेरी शहर', cities: ['White Town', 'Lawspet', 'Muthialpet', 'Villianur', 'Ariyankuppam', 'Kalapet'] },
      { id: 'karaikal', nameEn: 'Karaikal', nameTa: 'காரைக்கால்', nameHi: 'कराईकल', cities: ['Karaikal Town', 'Kottucherry', 'Neravy', 'Thirunallar'] },
      { id: 'mahe', nameEn: 'Mahe', nameTa: 'மாஹே', nameHi: 'माहे', cities: ['Mahe Town'] },
      { id: 'yanam', nameEn: 'Yanam', nameTa: 'ஏனாம்', nameHi: 'यानम', cities: ['Yanam Town'] },
    ],
  },
  {
    id: 'CH',
    nameEn: 'Chandigarh (UT)',
    nameTa: 'சண்டிகர் (யூனியன் பிரதேசம்)',
    nameHi: 'चंडीगढ़',
    districts: [
      { id: 'chandigarh_city', nameEn: 'Chandigarh City', nameTa: 'சண்டிகர் நகரம்', nameHi: 'चंडीगढ़ शहर', cities: ['Sector 17', 'Sector 35', 'Sector 22', 'Industrial Area Phase 1 & 2'] },
    ],
  },
];

// International Countries Locations & Regions
export const INTERNATIONAL_LOCATIONS_DATA: Record<string, StateItem[]> = {
  AE: [
    {
      id: 'dubai_emirate',
      nameEn: 'Dubai Emirate',
      nameTa: 'துபாய் அமீரகம்',
      districts: [
        { id: 'dubai_city', nameEn: 'Dubai City', nameTa: 'துபாய் நகரம்', cities: ['Deira', 'Bur Dubai', 'Al Quoz Industrial', 'Al Barsha', 'Karama', 'Jebel Ali', 'Sonapur (Muhaisnah)', 'Business Bay'] },
      ],
    },
    {
      id: 'abudhabi_emirate',
      nameEn: 'Abu Dhabi Emirate',
      nameTa: 'அபுதாபி அமீரகம்',
      districts: [
        { id: 'abudhabi_city', nameEn: 'Abu Dhabi City & Musaffah', nameTa: 'அபுதாபி நகரம் & முசாஃபா', cities: ['Musaffah Industrial', 'Hamdan Street', 'Electra', 'Al Ain', 'Khalidiya'] },
      ],
    },
    {
      id: 'sharjah_emirate',
      nameEn: 'Sharjah Emirate',
      nameTa: 'சார்ஜா அமீரகம்',
      districts: [
        { id: 'sharjah_city', nameEn: 'Sharjah City', nameTa: 'சார்ஜா நகரம்', cities: ['Rolla', 'Industrial Area 1-18', 'Al Nahda', 'Al Majaz', 'Muwaileh'] },
      ],
    },
  ],
  SG: [
    {
      id: 'singapore_state',
      nameEn: 'Singapore Republic',
      nameTa: 'சிங்கப்பூர்',
      districts: [
        { id: 'singapore_central', nameEn: 'Central & Little India', nameTa: 'லிட்டில் இந்தியா & மத்திய பகுதி', cities: ['Little India', 'Serangoon Road', 'Bugis', 'Chinatown', 'Kallang'] },
        { id: 'singapore_west', nameEn: 'Jurong & Tuas (Industrial)', nameTa: 'ஜூரோங் & துவாஸ் தொழிற்பேட்டை', cities: ['Jurong East', 'Jurong West', 'Tuas South', 'Boon Lay'] },
        { id: 'singapore_north', nameEn: 'Woodlands & Yishun', nameTa: 'உட்லண்ட்ஸ் & யீஷூன்', cities: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai'] },
        { id: 'singapore_east', nameEn: 'Tampines & Bedok', nameTa: 'தெம்பனீஸ் & பிடோக்', cities: ['Tampines', 'Bedok', 'Changi', 'Pasir Ris'] },
      ],
    },
  ],
  MY: [
    {
      id: 'kl_selangor',
      nameEn: 'Kuala Lumpur & Selangor',
      nameTa: 'கோலாலம்பூர் & சிலாங்கூர்',
      districts: [
        { id: 'kl_city', nameEn: 'Kuala Lumpur (Capital)', nameTa: 'கோலாலம்பூர் நகரம்', cities: ['Brickfields (Little India)', 'Bukit Bintang', 'Cheras', 'Sentul', 'Kepong'] },
        { id: 'selangor', nameEn: 'Selangor State', nameTa: 'சிலாங்கூர் மாநிலம்', cities: ['Petaling Jaya', 'Klang (Little India)', 'Shah Alam', 'Subang Jaya'] },
      ],
    },
    {
      id: 'johor',
      nameEn: 'Johor State',
      nameTa: 'ஜொகூர் மாநிலம்',
      districts: [
        { id: 'johor_bahru', nameEn: 'Johor Bahru', nameTa: 'ஜொகூர் பாரு', cities: ['JB Central', 'Skudai', 'Pasir Gudang Industrial', 'Iskandar Puteri'] },
      ],
    },
  ],
  SA: [
    {
      id: 'riyadh_prov',
      nameEn: 'Riyadh Province',
      nameTa: 'ரியாத் மாகாணம்',
      districts: [
        { id: 'riyadh_city', nameEn: 'Riyadh City (Capital)', nameTa: 'ரியாத் நகரம்', cities: ['Batha', 'Olaya', 'Industrial City 1 & 2', 'Malaz', 'Shifa'] },
      ],
    },
    {
      id: 'makkah_prov',
      nameEn: 'Makkah Province (Jeddah)',
      nameTa: 'மக்கா & ஜெத்தா மாகாணம்',
      districts: [
        { id: 'jeddah_city', nameEn: 'Jeddah & Makkah', nameTa: 'ஜெத்தா & மக்கா', cities: ['Balad (Jeddah)', 'Industrial City Jeddah', 'Makkah Holy City'] },
      ],
    },
  ],
  QA: [
    {
      id: 'doha_municipality',
      nameEn: 'Doha State',
      nameTa: 'தோஹா',
      districts: [
        { id: 'doha_city', nameEn: 'Doha & Industrial Area', nameTa: 'தோஹா நகரம் & தொழிற்பேட்டை', cities: ['Industrial Area', 'Mansoura', 'Najma', 'Al Wakrah', 'Al Rayyan'] },
      ],
    },
  ],
  KW: [
    {
      id: 'kuwait_country',
      nameEn: 'Kuwait Governorates',
      nameTa: 'குவைத் மாகாணங்கள்',
      districts: [
        { id: 'kuwait_city_dist', nameEn: 'Kuwait City & Shuwaikh', nameTa: 'குவைத் சிட்டி & சுவைக்', cities: ['Kuwait City', 'Shuwaikh Industrial', 'Farwaniya', 'Hawally', 'Mahboula', 'Fahaheel'] },
      ],
    },
  ],
  LK: [
    {
      id: 'western_prov_lk',
      nameEn: 'Western Province (Colombo)',
      nameTa: 'மேல் மாகாணம் (கொழும்பு)',
      districts: [
        { id: 'colombo_dist', nameEn: 'Colombo (Capital)', nameTa: 'கொழும்பு', cities: ['Kotahena', 'Pettah', 'Wellawatte', 'Bambalapitiya', 'Dehiwala'] },
      ],
    },
    {
      id: 'northern_prov_lk',
      nameEn: 'Northern Province (Jaffna)',
      nameTa: 'வட மாகாணம் (யாழ்ப்பாணம்)',
      districts: [
        { id: 'jaffna_dist', nameEn: 'Jaffna', nameTa: 'யாழ்ப்பாணம்', cities: ['Jaffna Town', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Velanai'] },
      ],
    },
  ],
};

/**
 * Returns available states for any country code
 */
export function getStatesForCountry(countryCode: string): StateItem[] {
  if (countryCode === 'IN') {
    return ALL_INDIAN_STATES;
  }
  return INTERNATIONAL_LOCATIONS_DATA[countryCode] || [
    {
      id: 'general_region',
      nameEn: 'All States / Regions',
      nameTa: 'அனைத்து மாநிலங்கள் / பிராந்தியங்கள்',
      districts: [
        { id: 'general_district', nameEn: 'Central / Capital Region', nameTa: 'மத்திய / தலைநகர பகுதி', cities: ['Main City Center'] },
      ],
    },
  ];
}

/**
 * Returns districts for a given country and state
 */
export function getDistrictsForState(countryCode: string, stateId: string): DistrictItem[] {
  const states = getStatesForCountry(countryCode);
  const foundState = states.find((s) => s.id === stateId || s.nameEn.toLowerCase() === stateId.toLowerCase());
  return foundState ? foundState.districts : [];
}

/**
 * Returns cities for a given country, state, and district
 */
export function getCitiesForDistrict(countryCode: string, stateId: string, districtId: string): string[] {
  const districts = getDistrictsForState(countryCode, stateId);
  const foundDistrict = districts.find((d) => d.id === districtId || d.nameEn.toLowerCase() === districtId.toLowerCase());
  return foundDistrict && foundDistrict.cities ? foundDistrict.cities : [];
}
