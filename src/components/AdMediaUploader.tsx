import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  SAMPLE_AD_MEDIA_PRESETS,
  SampleAdMediaPreset,
  getMediaPricingBadge,
  VIDEO_DURATION_CONFIGS,
  VideoDurationTier,
  suggestVideoTierFromSeconds,
  formatDurationSeconds,
} from '../data/monetizationData';
import { compressImageFile } from '../utils/adStorage';
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Film,
  FileCheck,
  Link,
  Camera,
  FileText,
  BadgePercent,
  Check,
  Loader2,
  Clock,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';

export interface AdMediaValue {
  mediaType: 'image' | 'video' | 'none';
  mediaUrl: string;
  mediaFileName?: string;
  fileSize?: string;
  fileSizeBytes?: number;
  videoDurationSeconds?: number;
  videoDurationTier?: VideoDurationTier;
}

interface AdMediaUploaderProps {
  value?: AdMediaValue;
  mediaValue?: AdMediaValue;
  onChange: (value: AdMediaValue) => void;
  compact?: boolean;
  defaultCategory?: string;
}

export const AdMediaUploader: React.FC<AdMediaUploaderProps> = ({
  value: propValue,
  mediaValue,
  onChange,
  compact = false,
}) => {
  const value: AdMediaValue = propValue || mediaValue || { mediaType: 'none', mediaUrl: '' };
  const { language, loc } = useLanguage();

  // Separate refs for Photo Gallery and Video Gallery so mobile devices open the gallery properly
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dropInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customUrlType, setCustomUrlType] = useState<'image' | 'video'>('image');

  const [isProcessing, setIsProcessing] = useState(false);

  const pricingInfo = getMediaPricingBadge(value.mediaType, language);

  // Helper to format file sizes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle uploaded file (via drop or file picker)
  const processFile = async (file: File, forceType?: 'image' | 'video') => {
    setErrorMessage(null);

    const isImage = forceType === 'image' || file.type.startsWith('image/');
    const isVideo = forceType === 'video' || file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrorMessage(
        loc(
          'தயவுசெய்து சரியான புகைப்படம் (JPG, PNG) அல்லது வீடியோ (MP4, WebM) பதிவேற்றவும்.',
          'Please upload a valid image (JPG, PNG, WebP) or video (MP4, WebM).',
          'कृपया एक वैध फोटो (JPG, PNG) या वीडियो (MP4, WebM) अपलोड करें।',
          'దయచేసి చెల్లుబాటు అయ్యే ఫోటో (JPG, PNG) లేదా వీడియో (MP4, WebM) అప్‌లోడ్ చేయండి.',
          'ദയവായി സാധുവായ ഒരു ചിത്രമോ (JPG, PNG) വീഡിയോയോ (MP4, WebM) അപ്‌ലോഡ് ചെയ്യുക.',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಫೋಟೋ (JPG, PNG) ಅಥವಾ ವೀಡಿಯೊ (MP4, WebM) ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
        )
      );
      return;
    }

    // Size limits: Images up to 25MB, Videos up to 60MB
    const maxSizeBytes = isVideo ? 60 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        isVideo
          ? loc(
              'வீடியோ அளவு 60MB-க்குள் இருக்க வேண்டும்.',
              'Video file size must be under 60MB.',
              'वीडियो फ़ाइल 60MB से कम होनी चाहिए।',
              'వీడియో ఫైల్ పరిమాణం 60MB లోపు ఉండాలి.',
              'വീഡിയോ ഫയൽ 60MB-ൽ താഴെയായിരിക്കണം.',
              'ವೀಡಿಯೊ ಫೈಲ್ ಗಾತ್ರವು 60MB ಒಳಗೆ ಇರಬೇಕು.'
            )
          : loc(
              'புகைப்பட அளவு 25MB-க்குள் இருக்க வேண்டும்.',
              'Image file size must be under 25MB.',
              'फ़ोटो फ़ाइल 25MB से कम होनी चाहिए।',
              'ఫోటో పరిమాణం 25MB లోపు ఉండాలి.',
              'ചിത്രത്തിന്റെ വലുപ്പം 25MB-ൽ താഴെയായിരിക്കണം.',
              'ಫೋಟೋ ಗಾತ್ರವು 25MB ಒಳಗೆ ಇರಬೇಕು.'
            )
      );
      return;
    }

    setIsProcessing(true);

    try {
      if (isImage) {
        // High quality compressed image for fast loading & crystal clear display
        const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.88);
        onChange({
          mediaType: 'image',
          mediaUrl: compressedDataUrl,
          mediaFileName: file.name,
          fileSize: formatBytes(file.size),
        });
      } else {
        // Video file processing with safe reader & duration detection
        let durationSec = 15;
        let tier: VideoDurationTier = '15s';

        try {
          const tempVideo = document.createElement('video');
          tempVideo.preload = 'metadata';
          const blobUrl = URL.createObjectURL(file);
          tempVideo.src = blobUrl;

          const metaPromise = new Promise<{ duration: number }>((resolve) => {
            tempVideo.onloadedmetadata = () => {
              const dur = Math.round(tempVideo.duration) || 15;
              resolve({ duration: dur });
            };
            tempVideo.onerror = () => resolve({ duration: 15 });
            setTimeout(() => resolve({ duration: 15 }), 2500);
          });

          const meta = await metaPromise;
          durationSec = meta.duration;
          tier = suggestVideoTierFromSeconds(durationSec);
          URL.revokeObjectURL(blobUrl);
        } catch (e) {
          console.warn('Could not extract video metadata:', e);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange({
            mediaType: 'video',
            mediaUrl: result,
            mediaFileName: file.name,
            fileSize: formatBytes(file.size),
            fileSizeBytes: file.size,
            videoDurationSeconds: durationSec,
            videoDurationTier: tier,
          });
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setIsProcessing(false);
          setErrorMessage(
            loc(
              'வீடியோ கோப்பைப் படிக்க முடியவில்லை.',
              'Failed to read video file.',
              'वीडियो फ़ाइल पढ़ने में विफल।',
              'వీడియో ఫైల్ చదవడం విఫలమైంది.',
              'വീഡിയോ ഫയൽ വായിക്കാൻ കഴിഞ്ഞില്ല.',
              'ವೀಡಿಯೊ ಫೈಲ್ ಓದಲು ವಿಫಲವಾಗಿದೆ.'
            )
          );
        };
        reader.readAsDataURL(file);
        return; // Early return as reader is async
      }
    } catch (err) {
      console.error('File process error:', err);
      setErrorMessage(
        loc(
          'கோப்பைப் பதிவேற்றுவதில் பிழை ஏற்பட்டது.',
          'Error processing uploaded file.',
          'फ़ाइल संसाधित करने में त्रुटि हुई।',
          'ఫైల్‌ను ప్రాసెస్ చేయడంలో లోపం సంభవించింది.',
          'ഫയൽ പ്രോസസ്സ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു.',
          'ಫೈಲ್ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.'
        )
      );
    } finally {
      if (isImage) {
        setIsProcessing(false);
      }
    }
  };

  // Drag and drop listeners
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], 'image');
    }
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], 'video');
    }
  };

  const handleDropInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectTextOnly = () => {
    onChange({
      mediaType: 'none',
      mediaUrl: '',
      mediaFileName: undefined,
      fileSize: undefined,
    });
    setErrorMessage(null);
  };

  const handleRemoveMedia = () => {
    handleSelectTextOnly();
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (dropInputRef.current) dropInputRef.current.value = '';
  };

  const handleSelectPreset = (preset: SampleAdMediaPreset) => {
    onChange({
      mediaType: preset.mediaType,
      mediaUrl: preset.mediaUrl,
      mediaFileName: preset.titleEn,
      fileSize: preset.mediaType === 'video' ? 'Demo Video' : 'HQ Photo',
    });
    setErrorMessage(null);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const isVid =
      customUrlType === 'video' ||
      customUrl.endsWith('.mp4') ||
      customUrl.endsWith('.webm') ||
      customUrl.includes('assets.mixkit.co');

    onChange({
      mediaType: isVid ? 'video' : 'image',
      mediaUrl: customUrl.trim(),
      mediaFileName: customUrl.split('/').pop()?.split('?')[0] || 'online_media',
      fileSize: 'Web Hosted',
    });
    setCustomUrl('');
    setErrorMessage(null);
  };

  const hasMedia = value.mediaType !== 'none' && Boolean(value.mediaUrl);

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs specifically configured for Photo Gallery and Video Gallery */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*,image/jpeg,image/png,image/webp,image/jpg"
        onChange={handlePhotoInputChange}
        className="hidden"
        id="ad-photo-gallery-input"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*,video/mp4,video/webm,video/quicktime,video/3gpp,video/mkv"
        onChange={handleVideoInputChange}
        className="hidden"
        id="ad-video-gallery-input"
      />
      <input
        ref={dropInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleDropInputChange}
        className="hidden"
        id="ad-general-drop-input"
      />

      {/* AD FORMAT SELECTION: TEXT vs PHOTO vs VIDEO */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span>
              {language === 'ta'
                ? 'விளம்பர வடிவம் & ஊடகம் தேர்வு (Ad Format & Media):'
                : 'Select Ad Format & Media:'}
            </span>
          </span>
          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            {pricingInfo.tag}
          </span>
        </label>

        {/* 3 Interactive Cards for Media Type */}
        <div className="grid grid-cols-3 gap-2">
          {/* Option 1: Text-Only Ad (Budget) */}
          <button
            type="button"
            id="ad-format-btn-text"
            onClick={handleSelectTextOnly}
            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
              value.mediaType === 'none'
                ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold ring-2 ring-emerald-500/40 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {value.mediaType === 'none' && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <FileText className={`w-4 h-4 ${value.mediaType === 'none' ? 'text-emerald-700' : 'text-slate-500'}`} />
              <span className="text-xs font-extrabold">
                {language === 'ta' ? 'எழுத்து மட்டும்' : 'Text Only'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-bold text-emerald-700 block">
                {language === 'ta' ? 'குறைந்த கட்டணம்' : 'Budget Price'}
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                {language === 'ta' ? 'ஊடகம் இன்றி சேமிப்பு' : 'Budget text ad'}
              </span>
            </div>
          </button>

          {/* Option 2: Photo Ad */}
          <button
            type="button"
            id="ad-format-btn-photo"
            onClick={() => {
              if (value.mediaType !== 'image') {
                photoInputRef.current?.click();
              }
            }}
            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
              value.mediaType === 'image' && hasMedia
                ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold ring-2 ring-indigo-500/40 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {value.mediaType === 'image' && hasMedia && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <ImageIcon className={`w-4 h-4 ${value.mediaType === 'image' && hasMedia ? 'text-indigo-700' : 'text-slate-500'}`} />
              <span className="text-xs font-extrabold">
                {language === 'ta' ? 'புகைப்படம்' : 'Photo Ad'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-bold text-indigo-700 block">
                {language === 'ta' ? 'வழக்கமான விலை' : 'Standard Rate'}
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                {language === 'ta' ? 'பேனர் படம் சேர்க்கவும்' : 'Image banner'}
              </span>
            </div>
          </button>

          {/* Option 3: Video Ad */}
          <button
            type="button"
            id="ad-format-btn-video"
            onClick={() => {
              if (value.mediaType !== 'video') {
                videoInputRef.current?.click();
              }
            }}
            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
              value.mediaType === 'video' && hasMedia
                ? 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-500/50 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {value.mediaType === 'video' && hasMedia && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <Film className={`w-4 h-4 ${value.mediaType === 'video' && hasMedia ? 'text-amber-700' : 'text-slate-500'}`} />
              <span className="text-xs font-extrabold">
                {language === 'ta' ? 'வீடியோ' : 'Video Ad'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-bold text-amber-800 block">
                {language === 'ta' ? 'அதிக ஈர்ப்பு' : 'High Reach'}
              </span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                {language === 'ta' ? 'முழு வீடியோ விளம்பரம்' : 'Interactive video'}
              </span>
            </div>
          </button>
        </div>

        {/* Dynamic Pricing Alert Message */}
        <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
          value.mediaType === 'video'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : value.mediaType === 'image'
            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-1.5">
            <BadgePercent className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-[11px]">
              {pricingInfo.label}: {pricingInfo.discountNote}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border shrink-0">
            {language === 'ta' ? 'கீழே கட்டணம் மாறுகிறது' : 'Pricing auto-updates below'}
          </span>
        </div>
      </div>

      {/* PROCESSING STATE INDICATOR */}
      {isProcessing && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-center gap-2 font-bold animate-pulse">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
          <span>
            {loc(
              'ஊடகம் சரிபார்க்கப்பட்டு சேமிக்கப்படுகிறது, சற்று காத்திருக்கவும்...',
              'Optimizing and attaching media, please wait a moment...',
              'मीडिया अनुकूलित और संलग्न किया जा रहा है, कृपया प्रतीक्षा करें...',
              'మీడియా ఆప్టిమైజ్ చేయబడి జతచేయబడుతోంది, దయచేసి వేచి ఉండండి...',
              'മീഡിയ ഒപ്റ്റിമൈസ് ചെയ്ത് ഘടിപ്പിക്കുന്നു, ദയവായി കാത്തിരിക്കുക...',
              'ಮಾಧ್ಯಮವನ್ನು ಆಪ್ಟಿಮೈಸ್ ಮಾಡಲಾಗುತ್ತಿದೆ ಮತ್ತು ಲಗತ್ತಿಸಲಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...'
            )}
          </span>
        </div>
      )}

      {/* ERROR MESSAGE IF ANY */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MEDIA PREVIEW IF ATTACHED */}
      {hasMedia ? (
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          {/* Top Preview Bar */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1">
                {value.mediaType === 'video' ? (
                  <>
                    <Film className="w-2.5 h-2.5" />
                    <span>VIDEO AD</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-2.5 h-2.5" />
                    <span>PHOTO AD</span>
                  </>
                )}
              </span>
              <span className="text-[11px] font-medium text-slate-300 truncate max-w-[180px]">
                {value.mediaFileName || (value.mediaType === 'video' ? 'Uploaded Video' : 'Uploaded Photo')}
              </span>
              {value.fileSize && (
                <span className="text-[10px] text-slate-400">({value.fileSize})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {value.mediaType === 'video' ? (
                <button
                  type="button"
                  id="btn-change-video"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Change Video via Video Gallery"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{language === 'ta' ? 'வீடியோ மாற்ற' : 'Change Video'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-change-photo"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Change Photo via Photo Gallery"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{language === 'ta' ? 'புகைப்படம் மாற்ற' : 'Change Photo'}</span>
                </button>
              )}
              <button
                type="button"
                id="btn-remove-media"
                onClick={handleRemoveMedia}
                className="px-2 py-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Remove Media"
              >
                <X className="w-2.5 h-2.5" />
                <span>{language === 'ta' ? 'நீக்குக' : 'Remove'}</span>
              </button>
            </div>
          </div>

          {/* Actual Visual Display */}
          <div className="p-2 flex items-center justify-center bg-black/40">
            {value.mediaType === 'video' ? (
              <div className="w-full max-h-[260px] rounded-xl overflow-hidden flex items-center justify-center bg-black">
                <video
                  src={value.mediaUrl}
                  controls
                  playsInline
                  className="w-full max-h-[260px] object-contain rounded-xl"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="w-full max-h-[240px] rounded-xl overflow-hidden flex items-center justify-center bg-black/20">
                <img
                  src={value.mediaUrl}
                  alt="Advertisement preview"
                  className="w-full max-h-[240px] object-cover rounded-xl"
                  onError={() => {
                    setErrorMessage(
                      loc(
                        'புகைப்படத்தை காட்ட முடியவில்லை.',
                        'Could not load image.',
                        'छवि लोड नहीं हो सकी।',
                        'చిత్రాన్ని లోడ్ చేయడం సాధ్యం కాలేదు.',
                        'ചിത്രം ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.',
                        'ಚಿತ್ರವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.'
                      )
                    );
                  }}
                />
              </div>
            )}
          </div>

          {/* UPLOAD SIZE GAUGE & METRICS BAR */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2.5">
            {/* File Size Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium">
                    {language === 'ta' ? 'பதிவேற்ற அளவு:' : 'Upload Size:'}
                  </span>
                  <span className="font-bold text-white">
                    {value.fileSize || 'Standard'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {value.mediaType === 'video' ? (
                    <span>{language === 'ta' ? 'அதிகபட்சம் 60 MB' : 'Max Limit: 60 MB'}</span>
                  ) : (
                    <span>{language === 'ta' ? 'அதிகபட்சம் 25 MB' : 'Max Limit: 25 MB'}</span>
                  )}
                </div>
              </div>

              {/* Visual Meter Bar */}
              {value.fileSizeBytes ? (
                (() => {
                  const maxLimit = value.mediaType === 'video' ? 60 * 1024 * 1024 : 25 * 1024 * 1024;
                  const pct = Math.min(100, Math.round((value.fileSizeBytes / maxLimit) * 100));
                  const isHigh = pct > 75;
                  const isModerate = pct > 45;
                  return (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-amber-400' : isModerate ? 'bg-indigo-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                        <span className="text-emerald-400">✓ {language === 'ta' ? 'அளவு சரியானது' : 'Size optimal'}</span>
                        <span>{pct}% {language === 'ta' ? 'பயன்படுத்தப்பட்டது' : 'used'}</span>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>

            {/* VIDEO DURATION SELECTOR & PRICE TIERS (If Video Ad) */}
            {value.mediaType === 'video' && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {language === 'ta' ? 'வீடியோ கால அளவு & விலை நிர்ணயம்:' : 'Video Duration & Pricing Tier:'}
                    </span>
                  </div>
                  {typeof value.videoDurationSeconds === 'number' && value.videoDurationSeconds > 0 && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black border border-amber-500/30">
                      ⏱️ {formatDurationSeconds(value.videoDurationSeconds)} {language === 'ta' ? 'வீடியோ' : 'detected'}
                    </span>
                  )}
                </div>

                {/* Duration Tier Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {VIDEO_DURATION_CONFIGS.map((cfg) => {
                    const isSelected = (value.videoDurationTier || '15s') === cfg.id;
                    return (
                      <button
                        key={cfg.id}
                        type="button"
                        onClick={() => {
                          onChange({
                            ...value,
                            videoDurationTier: cfg.id,
                          });
                        }}
                        className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black ring-2 ring-amber-300/40 shadow-sm'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black">{cfg.id.toUpperCase()}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {cfg.multiplier}x
                          </span>
                        </div>
                        <p className={`text-[9px] mt-0.5 leading-tight ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {language === 'ta' ? cfg.shortLabelTa : cfg.labelEn.split(' ')[0]}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {language === 'ta'
                    ? '💡 நீங்கள் தேர்ந்தெடுக்கும் நொடிகள் / நிமிடங்களுக்கு ஏற்ப விளம்பரக் கட்டணம் மாறும்.'
                    : '💡 Pricing adjusts dynamically based on chosen video duration tier.'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* UPLOAD & SELECTION INTERFACE */
        <div className="space-y-2">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3 text-indigo-600" />
              <span>{loc('கேலரி / கோப்புகள்', 'Gallery / Upload', 'गैलरी / अपलोड', 'గ్యాలరీ / అప్‌లోడ్', 'ഗ്യാലറി / അപ്‌ലോഡ്', 'ಗ್ಯಾಲರಿ / ಅಪ್‌ಲೋಡ್')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{loc('தயாரான படங்கள் & வீடியோ', 'Sample Media', 'नमूना मीडिया', 'నమూనా మీడియా', 'സാമ്പിൾ മീഡിയ', 'ಮಾದರಿ ಮಾಧ್ಯಮ')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Link className="w-3 h-3 text-slate-600" />
              <span>{loc('இணைய முகவரி (URL)', 'Media URL', 'मीडिया URL', 'మీడియా URL', 'മീഡിയ URL', 'ಮಾಧ್ಯಮ URL')}</span>
            </button>
          </div>

          {/* TAB 1: DEDICATED GALLERY PICKERS (PHOTO & VIDEO SEPARATE) */}
          {activeTab === 'upload' && (
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all select-none ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/90 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/80 hover:bg-indigo-50/20'
              }`}
            >
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'ta'
                      ? 'உங்கள் மொபைல் அல்லது கணினியிலிருந்து சேர்க்கவும்:'
                      : 'Choose your media file to attach:'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ta'
                      ? 'வீடியோ அல்லது புகைப்படத்திற்கு பிரத்யேக கேலரியைத் தேர்ந்தெடுக்கவும்:'
                      : 'Open Photo Gallery or Video Gallery directly:'}
                  </p>
                </div>

                {/* 2 DISTINCT PROMINENT BUTTONS: PHOTO GALLERY & VIDEO GALLERY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                  {/* Photo Gallery Button */}
                  <button
                    type="button"
                    id="btn-open-photo-gallery"
                    onClick={() => photoInputRef.current?.click()}
                    className="p-3 bg-white hover:bg-indigo-50/60 border-2 border-indigo-200 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-2.5 text-left cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block group-hover:text-indigo-700">
                        {language === 'ta' ? 'புகைப்பட கேலரி' : 'Photo Gallery'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {language === 'ta' ? 'JPG, PNG (15MB வரை)' : 'JPG, PNG (max 15MB)'}
                      </span>
                    </div>
                  </button>

                  {/* Video Gallery Button */}
                  <button
                    type="button"
                    id="btn-open-video-gallery"
                    onClick={() => videoInputRef.current?.click()}
                    className="p-3 bg-white hover:bg-amber-50/60 border-2 border-amber-300 hover:border-amber-500 rounded-xl flex items-center justify-center gap-2.5 text-left cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block group-hover:text-amber-800">
                        {language === 'ta' ? 'வீடியோ கேலரி' : 'Video Gallery'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {language === 'ta' ? 'MP4, WebM (60MB வரை)' : 'MP4, WebM (max 60MB)'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Text Only Alternative Notice */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    id="btn-choose-text-ad-under-upload"
                    onClick={handleSelectTextOnly}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ta'
                        ? 'ஊடகம் வேண்டாம், குறைந்த கட்டணத்தில் எழுத்து விளம்பரம் போதும்'
                        : 'No media needed, continue with budget text-only ad'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAMPLE PRESETS GALLERY */}
          {activeTab === 'presets' && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-[11px] text-slate-600 font-medium">
                {loc(
                  'கீழே உள்ள தயாரான புகைப்படங்கள் மற்றும் வீடியோக்களில் ஒன்றைத் தேர்ந்தெடுக்கலாம்:',
                  'Select one of our high-quality sample photos or demo videos:',
                  'तैयार फ़ोटो और वीडियो में से एक चुनें:',
                  'మా నమూనా ఫోటోలు లేదా వీడియోలలో ఒకదాన్ని ఎంచుకోండి:',
                  'ഞങ്ങളുടെ സാമ്പിൾ ഫോട്ടോകളിൽ നിന്നോ വീഡിയോകളിൽ നിന്നോ ഒരെണ്ണം തിരഞ്ഞെടുക്കുക:',
                  'ಸಿದ್ಧ ಫೋಟೋಗಳು ಅಥವಾ ವೀಡಿಯೊಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ:'
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SAMPLE_AD_MEDIA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-600 text-left bg-white transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <div className="relative h-20 bg-slate-900 overflow-hidden">
                      {preset.mediaType === 'video' ? (
                        <>
                          <img
                            src={preset.thumbnailUrl || preset.mediaUrl}
                            alt={preset.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm">
                              <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                            </span>
                          </div>
                          <span className="absolute top-1 right-1 bg-amber-400 text-slate-950 text-[8px] font-black px-1 rounded">
                            VIDEO
                          </span>
                        </>
                      ) : (
                        <>
                          <img
                            src={preset.mediaUrl}
                            alt={preset.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-bold px-1 rounded">
                            PHOTO
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] font-bold text-slate-800 line-clamp-1 leading-snug">
                        {loc(
                          preset.titleTa,
                          preset.titleEn,
                          preset.titleEn,
                          preset.titleEn,
                          preset.titleEn,
                          preset.titleEn
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENTER MEDIA URL */}
          {activeTab === 'url' && (
            <form
              onSubmit={handleApplyCustomUrl}
              className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="urlMediaType"
                    checked={customUrlType === 'image'}
                    onChange={() => setCustomUrlType('image')}
                    className="text-indigo-600"
                  />
                  <span>{loc('புகைப்படம்', 'Photo / Image', 'फ़ोटो', 'ఫోటో', 'ഫോട്ടോ', 'ಫೋಟೋ')}</span>
                </label>

                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="urlMediaType"
                    checked={customUrlType === 'video'}
                    onChange={() => setCustomUrlType('video')}
                    className="text-indigo-600"
                  />
                  <span>{loc('வீடியோ (MP4)', 'Video (MP4/WebM)', 'वीडियो (MP4)', 'వీడియో (MP4)', 'വീഡിയോ (MP4)', 'ವೀಡಿಯೊ (MP4)')}</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={
                    customUrlType === 'video'
                      ? 'https://example.com/video.mp4'
                      : 'https://example.com/shop-photo.jpg'
                  }
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  {loc('இணைக்க', 'Attach', 'जोड़ें', 'జతచేయి', 'ചേർക്കുക', 'ಲಗತ್ತಿಸಿ')}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {loc(
                  'நேரடி இணைய பட URL அல்லது MP4 வீடியோ முகவரியை ஒட்டவும்.',
                  'Paste a direct link to an image file (.jpg, .png) or MP4 video.',
                  'एक छवि फ़ाइल (.jpg, .png) या MP4 वीडियो का सीधा लिंक चिपकाएँ।',
                  'చిత్ర ఫైల్ (.jpg, .png) లేదా MP4 వీడియోకి ప్రత్యక్ష లింక్‌ను అతికించండి.',
                  'ഒരു ഇമേജ് ഫയലിലേക്കോ (.jpg, .png) MP4 വീഡിയോയിലേക്കോ ഉള്ള നേരിട്ടുള്ള ലിങ്ക് ഒட்டിക്കുക.',
                  'ಚಿತ್ರ ಫೈಲ್ (.jpg, .png) ಅಥವಾ MP4 ವೀಡಿಯೊಗೆ ನೇರ ಲಿಂಕ್ ಅನ್ನು ಅಂಟಿಸಿ.'
                )}
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
