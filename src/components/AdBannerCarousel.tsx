import React, { useState, useEffect, useRef } from 'react';
import { Advertisement } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_ADS } from '../data/monetizationData';
import {
  Megaphone,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  MapPin,
  Store,
  Sparkles,
  ArrowRight,
  Layers,
  Repeat,
  SlidersHorizontal,
  ExternalLink,
  Image as ImageIcon,
  Film,
  Volume2,
  VolumeX,
  Maximize2,
  X,
} from 'lucide-react';

interface AdBannerCarouselProps {
  ads?: Advertisement[];
  onNavigateToAdvertise?: () => void;
  defaultMode?: 'carousel' | 'ticker' | 'grid';
  showControls?: boolean;
  autoPlayIntervalMs?: number;
  compact?: boolean;
}

export const AdBannerCarousel: React.FC<AdBannerCarouselProps> = ({
  ads = [],
  onNavigateToAdvertise,
  defaultMode = 'ticker',
  showControls = true,
  autoPlayIntervalMs = 4500,
  compact = false,
}) => {
  const { language } = useLanguage();
  
  // Always default to 'ticker' automatically for users of the app
  // If user previously changed preference, remember it
  const [displayMode, setDisplayMode] = useState<'carousel' | 'ticker' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem('daily_work_ad_board_mode_pref');
      if (saved === 'carousel' || saved === 'ticker' || saved === 'grid') {
        return saved;
      }
    } catch {}
    return (defaultMode === 'carousel' || defaultMode === 'grid') ? defaultMode : 'ticker';
  });

  const handleModeChange = (newMode: 'carousel' | 'ticker' | 'grid') => {
    setDisplayMode(newMode);
    try {
      localStorage.setItem('daily_work_ad_board_mode_pref', newMode);
    } catch {}
    if (newMode === 'carousel') {
      setIsPlaying(true);
      setIsPausedByHover(false);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPausedByHover, setIsPausedByHover] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Video playback & Lightbox state
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [lightboxAd, setLightboxAd] = useState<Advertisement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ticker mode interactive states (Play/Pause, Mute map, Size toggle)
  const [isTickerPlaying, setIsTickerPlaying] = useState(true);
  const [tickerMutedMap, setTickerMutedMap] = useState<Record<string, boolean>>({});
  const [tickerSizeView, setTickerSizeView] = useState<'prominent' | 'compact'>('prominent');

  const toggleTickerMute = (adId: string) => {
    setTickerMutedMap((prev) => ({
      ...prev,
      [adId]: prev[adId] !== undefined ? !prev[adId] : false,
    }));
  };

  const rawApproved = (ads || []).filter((a) => a?.status === 'approved');
  const fallbackApproved = INITIAL_ADS.filter((a) => a?.status === 'approved');
  const approvedAds = rawApproved.length > 0 ? rawApproved : fallbackApproved;
  const total = approvedAds.length;
  const currentAd = approvedAds[currentIndex] || approvedAds[0];

  // Current ad is video
  const isCurrentAdVideo = currentAd?.mediaType === 'video' && Boolean(currentAd?.mediaUrl);

  // Auto-play interval for Carousel mode - advances slide-by-slide reliably
  useEffect(() => {
    if (displayMode !== 'carousel' || !isPlaying || isPausedByHover || total <= 1) {
      return;
    }

    // Video ads get 6.5s to view, photo ads get autoPlayIntervalMs (4.5s)
    const slideDuration = isCurrentAdVideo ? Math.max(autoPlayIntervalMs, 6500) : autoPlayIntervalMs;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, isPausedByHover, total, displayMode, autoPlayIntervalMs, isCurrentAdVideo]);

  // Reset video playback when slide changes
  useEffect(() => {
    if (isCurrentAdVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
  }, [currentIndex, isCurrentAdVideo]);

  // Adjust currentIndex if ads length changes
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handleNext = () => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev + 1) % total);
    }
  };

  const handlePrev = () => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    }
  };

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  // Empty state when no approved ads exist
  if (total === 0 || !currentAd) {
    return (
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
            {language === 'ta' ? 'விளம்பர இடம்' : 'AD SPACE'}
          </span>
          <span className="text-[10px] text-indigo-200">
            {language === 'ta' ? 'தினசரி 1000+ பார்வைகள்' : '1000+ Daily Views'}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">
            {language === 'ta'
              ? 'உங்கள் கடை & தொழில் விளம்பரம் இங்கு வரும்!'
              : 'Promote Your Business & Shop Here!'}
          </h4>
          <p className="text-xs text-indigo-200 mt-1">
            {language === 'ta'
              ? 'கட்டுமான பொருட்கள், வாடகை வண்டிகள், விவசாய கருவிகள் மற்றும் உள்ளூர் கடைகளை விளம்பரப்படுத்துங்கள்.'
              : 'Reach local contractors, builders, farm owners and daily wage workers directly.'}
          </p>
        </div>
        {onNavigateToAdvertise && (
          <button
            onClick={onNavigateToAdvertise}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>
              {language === 'ta'
                ? 'விளம்பரம் பதிவு செய்ய (₹499 முதல்)'
                : 'Book Moving Ad Banner (From ₹499)'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </button>
        )}
      </div>
    );
  }

  const cleanPhone = (currentAd?.phone || '').replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(
    `வணக்கம், Daily Work செயலியில் உங்கள் "${currentAd?.businessName || ''}" விளம்பரத்தை பார்த்தேன். விவரம் அறிய விரும்புகிறேன் (Inquiring regarding your advertisement on Daily Work app).`
  );

  return (
    <div className="space-y-2">
      {/* Top Header & Mode Switcher */}
      {showControls && (
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-indigo-600" />
              <span>
                {language === 'ta'
                  ? `ஸ்பான்சர் விளம்பரங்கள் (${total})`
                  : `Sponsored Ads (${total})`}
              </span>
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => handleModeChange('carousel')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                displayMode === 'carousel'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
              title="Auto-moving Carousel (சுழலும் விளம்பரம்)"
            >
              <Repeat className="w-2.5 h-2.5" />
              <span>{language === 'ta' ? 'சுழலும் (ஸ்லைடர்)' : 'Slider'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('ticker')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                displayMode === 'ticker'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
              title="Continuous Moving Ticker (ஓடும் பலகை)"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>{language === 'ta' ? 'ஓடும் பலகை (டிக்கர்)' : 'Ticker'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('grid')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                displayMode === 'grid'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
              title="All Ads Grid (அனைத்தும்)"
            >
              <Layers className="w-2.5 h-2.5" />
              <span>{language === 'ta' ? 'அனைத்தும்' : 'Grid'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: MOVING SLIDER / CAROUSEL */}
      {displayMode === 'carousel' && (
        <div
          onMouseEnter={() => setIsPausedByHover(true)}
          onMouseLeave={() => setIsPausedByHover(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white shadow-md border border-indigo-800/80 transition-all"
        >
          {/* Top Progress bar showing auto-slide */}
          {isPlaying && total > 1 && !isPausedByHover && (
            <div className="w-full bg-white/10 h-1 overflow-hidden">
              <div
                key={`${currentIndex}-${isCurrentAdVideo}`}
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-full w-full animate-ad-progress"
                style={{
                  animationDuration: `${isCurrentAdVideo ? Math.max(autoPlayIntervalMs, 6500) : autoPlayIntervalMs}ms`,
                }}
              />
            </div>
          )}

          {/* AD MEDIA BANNER (PHOTO / VIDEO) */}
          {currentAd?.mediaUrl && (
            <div className="relative w-full bg-black/60 overflow-hidden group border-b border-indigo-900/60">
              {currentAd?.mediaType === 'video' ? (
                <div className="relative w-full max-h-[220px] sm:max-h-[260px] flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    src={currentAd.mediaUrl}
                    playsInline
                    autoPlay
                    muted={isVideoMuted}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => handleNext()}
                    className="w-full max-h-[220px] sm:max-h-[260px] object-contain cursor-pointer"
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) {
                          videoRef.current.play();
                          setIsVideoPlaying(true);
                        } else {
                          videoRef.current.pause();
                          setIsVideoPlaying(false);
                        }
                      }
                    }}
                  />

                  {/* Video Control Bar Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                    <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                      <Film className="w-2.5 h-2.5" />
                      <span>VIDEO AD</span>
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoMuted(!isVideoMuted);
                      }}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                      title={isVideoMuted ? 'Unmute' : 'Mute'}
                    >
                      {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxAd(currentAd);
                      }}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                      title="Full Screen View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="relative w-full max-h-[200px] sm:max-h-[230px] overflow-hidden cursor-pointer"
                  onClick={() => setLightboxAd(currentAd)}
                >
                  <img
                    src={currentAd.mediaUrl}
                    alt={currentAd.businessName}
                    className="w-full max-h-[200px] sm:max-h-[230px] object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-indigo-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase">
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span>PHOTO AD</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxAd(currentAd);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs transition-colors cursor-pointer"
                    title="View Full Photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div key={currentAd.id} className="p-3.5 sm:p-4 space-y-2.5 animate-in fade-in duration-300">
            {/* Header badges & Slide Counter */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                  <span>FEATURED PARTNER / விளம்பரம்</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-200 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{currentAd.location}</span>
                </span>
              </div>

              {/* Slide position and Play/Pause */}
              <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                <span className="text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded text-amber-300">
                  {currentIndex + 1} / {total}
                </span>

                {total > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 rounded-md hover:bg-white/10 text-indigo-200 hover:text-white cursor-pointer transition-colors"
                    title={isPlaying ? 'Pause Auto-slide' : 'Play Auto-slide'}
                  >
                    {isPlaying ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3 text-emerald-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Headline and Description with slide transition */}
            <div className="min-h-[56px] transition-all duration-300">
              <h4 className="font-bold text-sm sm:text-base text-white leading-snug tracking-tight">
                {language === 'ta'
                  ? currentAd.headlineTa
                  : language === 'en'
                  ? currentAd.headlineEn
                  : `${currentAd.headlineTa} (${currentAd.headlineEn})`}
              </h4>
              <p className="text-xs text-indigo-200 mt-1 line-clamp-2 leading-relaxed">
                {language === 'ta' ? currentAd.descriptionTa : currentAd.descriptionEn}
              </p>
            </div>

            {/* Business Details & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-indigo-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-800/80 text-amber-300 flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">
                    {currentAd.businessName}
                  </h5>
                  <p className="text-[10px] text-indigo-300">
                    {currentAd.contactPerson} • {currentAd.phone}
                  </p>
                </div>
              </div>

              {/* Call and WhatsApp CTA buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <a
                  href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Phone className="w-3 h-3 fill-slate-950" />
                  <span>
                    {language === 'ta'
                      ? currentAd.actionTextTa || 'அழைக்க'
                      : currentAd.actionTextEn || 'Call Now'}
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Left / Right Carousel navigation buttons */}
          {total > 1 && (
            <div className="flex items-center justify-between px-3 pb-2.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                aria-label="Previous Ad"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Dots indicator with click to select */}
              <div className="flex items-center gap-1.5">
                {approvedAds.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 bg-amber-400'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to ad ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                aria-label="Next Ad"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CONTINUOUS MOVING TICKER / MARQUEE (COMPACT ORIGINAL HEIGHT + 3/4TH MEDIA DISPLAY) */}
      {displayMode === 'ticker' && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-2xl p-2 sm:p-2.5 border border-indigo-800/80 shadow-md overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-indigo-300 pb-1.5 border-b border-indigo-900/80 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>
                  {language === 'ta'
                    ? 'ஓடும் விளம்பர பலகை'
                    : 'Continuous Sponsor Ticker'}
                </span>
              </span>

              {/* Ticker Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={() => setIsTickerPlaying(!isTickerPlaying)}
                className="px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-indigo-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title={isTickerPlaying ? 'விளம்பர ஓட்டத்தை நிறுத்த (Pause Ticker)' : 'விளம்பரத்தை ஓட வைக்க (Resume Ticker)'}
              >
                {isTickerPlaying ? (
                  <>
                    <Pause className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">{language === 'ta' ? 'நிறுத்த' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                    <span>{language === 'ta' ? 'தொடர' : 'Play'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {language === 'ta' ? '👆 முழு திரையில் காண தொடவும்' : '👆 Tap for full screen'}
              </span>
              {onNavigateToAdvertise && (
                <button
                  type="button"
                  onClick={onNavigateToAdvertise}
                  className="bg-amber-400/90 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-2xs"
                >
                  <span>{language === 'ta' ? '+ விளம்பரம் செய்ய' : '+ Post Ad'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Marquee Track (Repeated for infinite continuous moving loop) */}
          <div className="overflow-hidden no-scrollbar py-0.5">
            <div
              className="animate-marquee-track flex gap-3 items-stretch"
              style={{
                animationPlayState: isTickerPlaying ? undefined : 'paused',
              }}
            >
              {[...approvedAds, ...approvedAds].map((ad, idx) => {
                const adCleanPhone = ad.phone.replace(/[^0-9]/g, '');
                const adWaText = encodeURIComponent(
                  `வணக்கம் ${ad.contactPerson || ad.businessName}, Daily Work செயலியில் உங்கள் "${ad.businessName}" விளம்பரம் பார்த்து தொடர்பு கொள்கிறேன்.`
                );
                const isVideo = ad.mediaType === 'video' && Boolean(ad.mediaUrl);
                const isPhoto = ad.mediaType === 'image' && Boolean(ad.mediaUrl);
                const isMuted = tickerMutedMap[ad.id] ?? true;

                return (
                  <div
                    key={`${ad.id}-${idx}`}
                    className="bg-slate-900/95 hover:bg-slate-850 border border-indigo-700/80 hover:border-amber-400/80 rounded-xl p-2 min-w-[330px] sm:min-w-[390px] max-w-[420px] h-[98px] sm:h-[105px] shrink-0 transition-all shadow-md flex gap-2.5 items-stretch group/card"
                  >
                    {/* MEDIA DISPLAY (Occupies ~65% - 70% முக்கால்வாசி width of the card, full content visible without vertical bloat) */}
                    {ad.mediaUrl && (
                      <div
                        className="relative w-[65%] sm:w-[68%] shrink-0 rounded-lg overflow-hidden bg-black border border-indigo-800/80 shadow-xs cursor-pointer group/media flex items-center justify-center self-stretch"
                        onClick={() => setLightboxAd(ad)}
                        title={
                          isVideo
                            ? 'முழுத் திரையில் வீடியோ பார்க்க (Tap for full screen video)'
                            : 'முழு புகைப்படத்தை பார்க்க (Tap for full photo)'
                        }
                      >
                        {isVideo ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-black">
                            <video
                              src={ad.mediaUrl}
                              autoPlay
                              loop
                              muted={isMuted}
                              playsInline
                              className="w-full h-full object-contain"
                            />

                            {/* Floating Badges & Action Controls */}
                            <div className="absolute top-1 left-1 z-10">
                              <span className="bg-rose-600/95 text-white text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-xs uppercase">
                                <Film className="w-2 h-2" />
                                <span>VIDEO</span>
                              </span>
                            </div>

                            <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTickerMute(ad.id);
                                }}
                                className="p-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] backdrop-blur-2xs transition-colors cursor-pointer"
                                title={isMuted ? 'ஒலியை இயக்க (Unmute)' : 'ஒலியடக்க (Mute)'}
                              >
                                {isMuted ? (
                                  <VolumeX className="w-2.5 h-2.5 text-slate-300" />
                                ) : (
                                  <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxAd(ad);
                                }}
                                className="p-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] backdrop-blur-2xs transition-colors cursor-pointer"
                                title="முழுத்திரை"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Bottom overlay helper */}
                            <div className="absolute bottom-1 inset-x-1 flex items-center justify-between pointer-events-none">
                              <span className="bg-black/75 text-amber-300 text-[8px] font-bold px-1 rounded backdrop-blur-2xs">
                                🔍 {language === 'ta' ? 'பெரிதாக்க தொடவும்' : 'Tap to expand'}
                              </span>
                              <span className="bg-black/75 text-white/80 text-[8px] px-1 rounded backdrop-blur-2xs">
                                {isMuted ? '🔇' : '🔊'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center bg-black/90">
                            <img
                              src={ad.mediaUrl}
                              alt={ad.businessName}
                              className="w-full h-full object-contain group-hover/media:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />

                            {/* Photo Floating Badge & Maximize Icon */}
                            <div className="absolute top-1 left-1 z-10">
                              <span className="bg-indigo-950/90 text-white text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-xs border border-white/20 uppercase">
                                <ImageIcon className="w-2 h-2 text-indigo-300" />
                                <span>PHOTO</span>
                              </span>
                            </div>

                            <div className="absolute top-1 right-1 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxAd(ad);
                                }}
                                className="p-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] backdrop-blur-2xs transition-colors cursor-pointer"
                                title="முழுத்திரை"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="absolute bottom-1 left-1 pointer-events-none">
                              <span className="bg-black/75 text-amber-300 text-[8px] font-bold px-1 rounded backdrop-blur-2xs">
                                🔍 {language === 'ta' ? 'பெரிதாக்க' : 'Tap to expand'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AD INFO & ACTIONS (Occupies remaining ~32% - 35% space) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Store className="w-3 h-3 text-amber-400 shrink-0" />
                          <span
                            className="text-[11px] font-bold text-amber-300 truncate block"
                            title={ad.businessName}
                          >
                            {ad.businessName}
                          </span>
                        </div>

                        <span className="text-[9px] text-indigo-200 bg-indigo-950/90 px-1.5 py-0.2 rounded border border-indigo-800/60 inline-block truncate max-w-full">
                          {ad.location}
                        </span>

                        <p className="text-[10px] text-slate-200 line-clamp-1 mt-0.5 leading-tight">
                          {language === 'ta' ? ad.headlineTa : ad.headlineEn}
                        </p>
                      </div>

                      {/* Contact & CTA Buttons */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-indigo-900/80">
                        <div className="flex items-center gap-1">
                          {ad.mediaUrl && (
                            <button
                              type="button"
                              onClick={() => setLightboxAd(ad)}
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-indigo-200 cursor-pointer transition-colors"
                              title="முழு அளவு பார்க்க"
                            >
                              <Maximize2 className="w-2.5 h-2.5" />
                            </button>
                          )}

                          <a
                            href={`https://wa.me/91${adCleanPhone}?text=${adWaText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-emerald-600/90 hover:bg-emerald-600 text-white shrink-0 shadow-2xs"
                            title="WhatsApp வழியாக தொடர்பு கொள்ள"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <a
                          href={`tel:${ad.phone}`}
                          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] flex items-center gap-1 shrink-0 active:scale-95 transition-colors shadow-2xs"
                        >
                          <Phone className="w-2.5 h-2.5 fill-slate-950" />
                          <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: ALL ADS GRID VIEW */}
      {displayMode === 'grid' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {approvedAds.map((ad, index) => (
              <div
                key={ad.id}
                className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl overflow-hidden border border-indigo-800/70 shadow-xs flex flex-col justify-between"
              >
                {/* Media thumbnail if available */}
                {ad.mediaUrl && (
                  <div
                    className="relative h-28 w-full overflow-hidden bg-black/50 cursor-pointer group"
                    onClick={() => setLightboxAd(ad)}
                  >
                    {ad.mediaType === 'video' ? (
                      <video
                        src={ad.mediaUrl}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={ad.mediaUrl}
                        alt={ad.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <span className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      {ad.mediaType === 'video' ? <Film className="w-2.5 h-2.5 text-rose-400" /> : <ImageIcon className="w-2.5 h-2.5 text-indigo-300" />}
                      <span>{ad.mediaType === 'video' ? 'VIDEO' : 'PHOTO'}</span>
                    </span>
                  </div>
                )}

                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                          AD #{index + 1}
                        </span>
                        <span className="text-[10px] text-indigo-200">{ad.location}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-1 leading-snug">
                        {language === 'ta' ? ad.headlineTa : ad.headlineEn}
                      </h5>
                    </div>
                    <a
                      href={`tel:${ad.phone}`}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0"
                    >
                      <Phone className="w-3 h-3 fill-slate-950" />
                      <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-indigo-200 line-clamp-2">
                    {language === 'ta' ? ad.descriptionTa : ad.descriptionEn}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-indigo-900 text-[10px] text-indigo-300">
                    <span className="font-medium text-white">{ad.businessName}</span>
                    <a
                      href={`https://wa.me/91${(ad.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Small Call-To-Action: Book Advertisement */}
      {onNavigateToAdvertise && (
        <div className="flex items-center justify-between px-2 pt-0.5 text-[11px] text-slate-500">
          <span>
            {language === 'ta'
              ? 'உங்கள் கடையும் இதில் இடம்பெற வேண்டுமா?'
              : 'Want your shop featured in this moving ad banner?'}
          </span>
          <button
            type="button"
            onClick={onNavigateToAdvertise}
            className="text-indigo-700 hover:text-indigo-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{language === 'ta' ? 'விளம்பரம் செய்க (Photo/Video)' : 'Post Ad (Photo/Video)'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR FULL SCREEN PHOTO / VIDEO PREVIEW */}
      {lightboxAd && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setLightboxAd(null)}
        >
          <div
            className="relative bg-slate-900 text-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-800 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Player / Image Display */}
            <div className="p-2 flex items-center justify-center bg-black">
              {lightboxAd.mediaType === 'video' ? (
                <video
                  src={lightboxAd.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[380px] object-contain rounded-lg"
                />
              ) : (
                <img
                  src={lightboxAd.mediaUrl}
                  alt={lightboxAd.businessName}
                  className="w-full max-h-[380px] object-contain rounded-lg"
                />
              )}
            </div>

            {/* Ad text and actions */}
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

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/91${(lightboxAd.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${lightboxAd.phone || ''}`}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{language === 'ta' ? 'அழைக்க' : 'Call'}</span>
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
