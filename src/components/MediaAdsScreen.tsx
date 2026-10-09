import React, { useState } from 'react';
import { Advertisement, Screen } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getSavedUserLocation } from '../data/locations';
import {
  Film,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  MapPin,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  PlusCircle,
  ArrowLeft,
  Filter,
  Sparkles,
  Store,
} from 'lucide-react';

interface MediaAdsScreenProps {
  ads?: Advertisement[];
  onNavigate: (screen: Screen) => void;
  onNavigateToAdvertise: () => void;
}

export const MediaAdsScreen: React.FC<MediaAdsScreenProps> = ({
  ads = [],
  onNavigate,
  onNavigateToAdvertise,
}) => {
  const { loc, language } = useLanguage();
  const userLoc = getSavedUserLocation();

  const [activeMediaType, setActiveMediaType] = useState<'all' | 'video' | 'photo'>('all');
  const [filterCityOnly, setFilterCityOnly] = useState<boolean>(false);
  const [lightboxAd, setLightboxAd] = useState<Advertisement | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({});

  const approvedAds = (ads || []).filter((a) => a?.status === 'approved');

  const filteredAds = approvedAds.filter((ad) => {
    if (activeMediaType === 'video' && ad.mediaType !== 'video') return false;
    if (activeMediaType === 'photo' && ad.mediaType === 'video') return false;

    if (filterCityOnly && userLoc?.city) {
      const uCity = (userLoc.city || '').toLowerCase();
      const locMatch =
        (ad.location || '').toLowerCase().includes(uCity) ||
        (ad.city || '').toLowerCase().includes(uCity);
      if (!locMatch) return false;
    }
    return true;
  });

  const toggleMute = (adId: string) => {
    setMutedStates((prev) => ({
      ...prev,
      [adId]: prev[adId] === undefined ? false : !prev[adId],
    }));
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white p-4 rounded-3xl shadow-md border border-indigo-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-black tracking-tight">
                  {loc('மீடியா & வீடியோ விளம்பரங்கள்', 'Media & Video Ads', 'मीडिया और वीडियो विज्ञापन', 'మీడియా & వీడియో ప్రకటనలు', 'മീഡിയ & വീഡിയോ പരസ്യങ്ങൾ', 'ಮಾಧ್ಯಮ & ವೀಡಿಯೊ ಜಾಹೀರಾತುಗಳು')}
                </h2>
              </div>
              <p className="text-xs text-indigo-200">
                {loc(
                  'உள்ளூர் கடைகள், கருவிகள் & கட்டுமான பொருட்களின் வீடியோ/புகைப்பட விளம்பர பலகை',
                  'Video & photo showcase of local building materials, shops, and equipment rentals',
                  'स्थानीय दुकानों और निर्माण सामग्री के वीडियो और फोटो विज्ञापन',
                  'స్థానిక దుకాణాలు మరియు నిర్మాణ సామగ్రి వీడియో/ఫోటో ప్రకటనలు',
                  'പ്രാദേശിക ഷോപ്പുകളുടെ വീഡിയോ/ഫോട്ടോ പരസ്യങ്ങൾ',
                  'ಸ್ಥಳೀಯ ಅಂಗಡಿಗಳು ಮತ್ತು ಕಟ್ಟಡ ಸಾಮಗ್ರಿಗಳ ವೀಡಿಯೊ/ಫೋಟೋ ಜಾಹೀರಾತುಗಳು'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAdvertise}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {loc('விளம்பரம் செய்ய', 'Post Ad', 'विज्ञापन दें', 'ప్రకటన ఇవ్వండి', 'പരസ്യം ചെയ്യുക', 'ಜಾಹೀರಾತು ನೀಡಿ')}
            </span>
          </button>
        </div>

        {/* Location Info & Filter Bar */}
        <div className="mt-3 pt-2.5 border-t border-indigo-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-200">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">
              {userLoc.city || 'Tamil Nadu'}, {userLoc.state || 'India'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterCityOnly(!filterCityOnly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                filterCityOnly
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-indigo-200 hover:bg-white/20'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>
                {filterCityOnly
                  ? loc('எனது ஊர் விளம்பரங்கள் மட்டும்', 'My City Only', 'केवल मेरा शहर', 'నా నగరం మాత్రమే', 'എന്റെ നഗരം മാത്രം', 'ನನ್ನ ನಗರ ಮಾತ್ರ')
                  : loc('அனைத்து ஊர்களும்', 'All Locations', 'सभी स्थान', 'అన్ని ప్రదేశాలు', 'എല്ലാ സ്ഥലങ്ങളും', 'ಎಲ್ಲಾ ಸ್ಥಳಗಳು')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Type Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1 text-xs font-bold text-slate-700">
        <button
          onClick={() => setActiveMediaType('all')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            activeMediaType === 'all'
              ? 'bg-white text-indigo-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          {loc('அனைத்து மீடியா', 'All Media', 'सभी मीडिया', 'అన్ని మీడియా', 'എല്ലാ മീഡിയ', 'ಎಲ್ಲಾ ಮಾಧ್ಯಮ')} ({approvedAds.length})
        </button>
        <button
          onClick={() => setActiveMediaType('video')}
          className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeMediaType === 'video'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-rose-600" />
          <span>{loc('வீடியோ விளம்பரங்கள்', 'Video Ads', 'वीडियो विज्ञापन', 'వీడియో ప్రకటనలు', 'വീഡിയോ പരസ്യങ്ങൾ', 'ವೀಡಿಯೊ ಜಾಹೀರಾತುಗಳು')}</span>
        </button>
        <button
          onClick={() => setActiveMediaType('photo')}
          className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeMediaType === 'photo'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-indigo-700" />
          <span>{loc('புகைப்படங்கள்', 'Photo Ads', 'फोटो विज्ञापन', 'ఫోటో ప్రకటనలు', 'ഫോട്ടോ പരസ്യങ്ങൾ', 'ಫೋಟೋ ಜಾಹೀರಾತುಗಳು')}</span>
        </button>
      </div>

      {/* Ads Feed */}
      {filteredAds.length === 0 ? (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Film className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">
            {loc('விளம்பரங்கள் இல்லை', 'No advertisements found for this selection', 'कोई विज्ञापन नहीं मिला', 'ప్రకటనలు ఏవీ లేవు', 'പരസ്യങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല', 'ಯಾವುದೇ ಜಾಹೀರಾತುಗಳು ಕಂಡುಬಂದಿಲ್ಲ')}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {loc(
              'உங்கள் கடை, இயந்திர வாடகை அல்லது கட்டுமான பொருட்கள் விளம்பரத்தை இங்கே முதலில் பதிவிடுங்கள்!',
              'Be the first to feature your shop, machinery rentals or building materials here!',
              'अपनी दुकान या व्यापार का पहला विज्ञापन यहां पोस्ट करें!',
              'మీ వ్యాపార ప్రకటనను ఇక్కడ పోస్ట్ చేయండి!',
              'നിങ്ങളുടെ പരസ്യം ഇവിടെ പോസ്റ്റ് ചെയ്യുക!',
              'ನಿಮ್ಮ ಜಾಹೀರಾತನ್ನು ಇಲ್ಲಿ ಪೋಸ್ಟ್ ಮಾಡಿ!'
            )}
          </p>
          <button
            onClick={onNavigateToAdvertise}
            className="px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-bold hover:bg-indigo-800 transition-colors"
          >
            {loc('புதிய விளம்பரம் பதிவு செய்ய', 'Post an Advertisement', 'नया विज्ञापन पोस्ट करें', 'కొత్త ప్రకటన పోస్ట్ చేయండి', 'പുതിയ പരസ്യം നൽകുക', 'ಹೊಸ ಜಾಹೀರಾತು ಪೋಸ್ಟ್ ಮಾಡಿ')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredAds.map((ad) => {
            const isVideo = ad.mediaType === 'video' && Boolean(ad.mediaUrl);
            const isMuted = mutedStates[ad.id] !== false; // default true
            const cleanPhone = (ad.phone || '').replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
            const waText = encodeURIComponent(
              `வணக்கம், Daily Work செயலியில் உங்கள் "${ad.businessName}" விளம்பரத்தை பார்த்தேன். விவரம் அறிய விரும்புகிறேன்.`
            );

            return (
              <div
                key={ad.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Media Container */}
                {ad.mediaUrl ? (
                  <div className="relative w-full bg-slate-950 overflow-hidden aspect-video flex items-center justify-center">
                    {isVideo ? (
                      <video
                        src={ad.mediaUrl}
                        playsInline
                        autoPlay
                        loop
                        muted={isMuted}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setLightboxAd(ad)}
                      />
                    ) : (
                      <img
                        src={ad.mediaUrl}
                        alt={ad.businessName}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-102 transition-transform duration-300"
                        onClick={() => setLightboxAd(ad)}
                      />
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider text-white ${
                          isVideo ? 'bg-rose-600' : 'bg-indigo-600'
                        }`}
                      >
                        {isVideo ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                        <span>{isVideo ? 'VIDEO' : 'PHOTO'}</span>
                      </span>
                    </div>

                    {/* Media Actions */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                      {isVideo && (
                        <button
                          type="button"
                          onClick={() => toggleMute(ad.id)}
                          className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setLightboxAd(ad)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                        title="Expand"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Store className="w-4 h-4" />
                      {ad.businessName}
                    </span>
                    <span className="text-[10px] text-indigo-200">{ad.location}</span>
                  </div>
                )}

                {/* Details Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                        <Store className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{ad.businessName}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-indigo-600" />
                        {ad.location}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 leading-snug">
                      {language === 'ta' ? ad.headlineTa : ad.headlineEn}
                    </h4>

                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'ta' ? ad.descriptionTa : ad.descriptionEn}
                    </p>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      {ad.contactPerson}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors cursor-pointer"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Phone className="w-3 h-3 fill-white" />
                        <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxAd && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          onClick={() => setLightboxAd(null)}
        >
          <div
            className="relative bg-slate-900 text-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-800 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="truncate pr-2">
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase mr-2">
                  {lightboxAd.mediaType === 'video' ? 'VIDEO AD' : 'PHOTO AD'}
                </span>
                <span className="text-xs font-bold text-white truncate">{lightboxAd.businessName}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxAd(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 flex items-center justify-center bg-black">
              {lightboxAd.mediaType === 'video' ? (
                <video
                  src={lightboxAd.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[400px] object-contain rounded-xl"
                />
              ) : (
                <img
                  src={lightboxAd.mediaUrl}
                  alt={lightboxAd.businessName}
                  className="w-full max-h-[400px] object-contain rounded-xl"
                />
              )}
            </div>

            <div className="p-3 pt-0 space-y-2">
              <h4 className="font-bold text-sm text-white">
                {language === 'ta' ? lightboxAd.headlineTa : lightboxAd.headlineEn}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ta' ? lightboxAd.descriptionTa : lightboxAd.descriptionEn}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-indigo-300 font-medium">
                  {lightboxAd.location} • {lightboxAd.contactPerson}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${lightboxAd.phone || ''}`}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{language === 'ta' ? 'நேரடி அழைப்பு' : 'Direct Call'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
