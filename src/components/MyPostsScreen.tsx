import React, { useState, useMemo, useEffect } from 'react';
import { Job, JobSeeker, Screen } from '../types';
import { WORK_CATEGORIES, getCategoryMagicTheme } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';
import { CategoryIcon } from './CategoryIcon';
import {
  getActiveUserProfile,
  saveActiveUserProfile,
  getTrackedPhones,
  addTrackedPhone,
} from '../utils/userStorage';
import {
  User,
  Briefcase,
  Users,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  PlusCircle,
  Sparkles,
  Search,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Sun,
  ShieldCheck,
  ChevronRight,
  Radio,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface MyPostsScreenProps {
  jobs: Job[];
  seekers: JobSeeker[];
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateSeeker: (seeker: JobSeeker) => void;
  onDeleteSeeker: (seekerId: string) => void;
  onRegisterSeeker: (seeker: Omit<JobSeeker, 'id' | 'registeredAt'>) => void;
  onNavigate: (screen: Screen) => void;
}

export const MyPostsScreen: React.FC<MyPostsScreenProps> = ({
  jobs,
  seekers,
  onUpdateJob,
  onDeleteJob,
  onUpdateSeeker,
  onDeleteSeeker,
  onRegisterSeeker,
  onNavigate,
}) => {
  const { loc, getCategoryName } = useLanguage();
  const activeProfile = getActiveUserProfile();

  // User contact identifier to filter posts
  const [phoneNumber, setPhoneNumber] = useState(activeProfile.phone || '');
  const [userName, setUserName] = useState(activeProfile.name || '');
  const [isEditingProfile, setIsEditingProfile] = useState(!activeProfile.phone);

  // Tab: all / my-seeker-posts / my-jobs
  const [activeTab, setActiveTab] = useState<'all' | 'seeker' | 'jobs'>('all');

  // Quick Daily Free/Seeking Post modal/form state
  const [showQuickPostForm, setShowQuickPostForm] = useState(false);
  const [quickPostCategory, setQuickPostCategory] = useState(WORK_CATEGORIES[0].id);
  const [quickPostCustomCat, setQuickPostCustomCat] = useState('');
  const [quickPostLocation, setQuickPostLocation] = useState(activeProfile.location || 'சென்னை');
  const [quickPostDate, setQuickPostDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [quickPostWage, setQuickPostWage] = useState(850);
  const [quickPostNote, setQuickPostNote] = useState('');

  // Editing modal state
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingSeeker, setEditingSeeker] = useState<JobSeeker | null>(null);

  // Success flash message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const cleanCurrentPhone = phoneNumber.replace(/[^0-9]/g, '');
  const trackedPhones = getTrackedPhones();

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Filter posts belonging to current user
  const userSeekers = useMemo(() => {
    if (!cleanCurrentPhone) return [];
    return seekers.filter((s) => {
      const sPhone = (s.mobileNumber || '').replace(/[^0-9]/g, '');
      return sPhone.includes(cleanCurrentPhone) || cleanCurrentPhone.includes(sPhone);
    });
  }, [seekers, cleanCurrentPhone]);

  const userJobs = useMemo(() => {
    if (!cleanCurrentPhone) return [];
    return jobs.filter((j) => {
      const jPhone = (j.contactNumber || '').replace(/[^0-9]/g, '');
      return jPhone.includes(cleanCurrentPhone) || cleanCurrentPhone.includes(jPhone);
    });
  }, [jobs, cleanCurrentPhone]);

  const handleSavePhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cleanCurrentPhone.length < 5) {
      showToast(
        loc(
          'தயவுசெய்து சரியான மொபைல் எண்ணை உள்ளிடவும்.',
          'Please enter a valid phone number.',
          'कृपया मान्य फ़ोन नंबर दर्ज करें।',
          'దయచేసి సరైన ఫోన్ నంబర్‌ను నమోదు చేయండి.',
          'ദയവായി സാധുവായ ഫോൺ നമ്പർ നൽകുക.',
          'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
        )
      );
      return;
    }

    saveActiveUserProfile({
      name: userName.trim(),
      phone: cleanCurrentPhone,
      role: activeProfile.role || 'all',
      location: activeProfile.location || '',
    });
    addTrackedPhone(cleanCurrentPhone);
    setIsEditingProfile(false);
    showToast(
      loc(
        'சுயவிவரம் மற்றும் தொலைபேசி எண் இணைக்கப்பட்டது!',
        'Phone number linked! Your posts are listed below.',
        'फ़ोन नंबर लिंक हो गया!',
        'ఫోన్ నంబర్ లింక్ చేయబడింది!',
        'ഫോൺ നമ്പർ ലിങ്ക് ചെയ്തു!',
        'ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಲಿಂಕ್ ಮಾಡಲಾಗಿದೆ!'
      )
    );
  };

  // Quick 1-Click: "Today I am free / I need a job" (இன்று எனக்கு வேலை வேண்டும்)
  const handleToggleFreeToday = (seeker: JobSeeker) => {
    const isCurrentlyFree = seeker.isFreeToday || seeker.status === 'available';
    const updatedSeeker: JobSeeker = {
      ...seeker,
      isFreeToday: !isCurrentlyFree,
      status: !isCurrentlyFree ? 'available' : 'busy',
      statusNote: !isCurrentlyFree
        ? loc('இன்று எனக்கு வேலை வேண்டும் (Today I am free / I need job)', 'Today I am free / I need a job')
        : loc('தற்போது வேலை கிடைத்துவிட்டது / பணியில் உள்ளேன்', 'Currently engaged'),
      availableDate: new Date().toISOString().split('T')[0],
    };

    onUpdateSeeker(updatedSeeker);
    showToast(
      !isCurrentlyFree
        ? loc(
            '✅ "இன்று எனக்கு வேலை வேண்டும்" என்று நிலை மாற்றப்பட்டது! முதலாளிகள் தொடர்பு கொள்வர்.',
            '✅ Status updated to: "Today I am free / I need a job"! Employers will see you.',
            '✅ स्थिति अपडेट की गई: "आज मैं खाली हूँ / मुझे काम चाहिए"!',
            '✅ స్థితి అప్‌డేట్ చేయబడింది: "ఈరోజు నేను ఖాళీగా ఉన్నాను"!',
            '✅ നില അപ്‌ഡേറ്റ് ചെയ്തു: "ഇന്ന് എനിക്ക് ജോലി വേണം"!',
            '✅ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: "ಇಂದು ನನಗೆ ಕೆಲಸ ಬೇಕು"!'
          )
        : loc(
            'நிலை மாற்றப்பட்டது.',
            'Status updated to busy.',
            'स्थिति अपडेट की गई।',
            'స్థితి నవీకరించబడింది.',
            'നില അപ്‌ഡേറ്റ് ചെയ്തു.',
            'ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.'
          )
    );
  };

  // Reply option: "வேலை கிடைத்தது" (Job Done / Got Job / Filled)
  const handleMarkJobGotten = (seeker: JobSeeker) => {
    const updatedSeeker: JobSeeker = {
      ...seeker,
      status: 'completed',
      isFreeToday: false,
      statusNote: loc('🎉 வேலை கிடைத்தது! நன்றி.', '🎉 Job Found / Completed! Thanks.'),
    };
    onUpdateSeeker(updatedSeeker);
    showToast(
      loc(
        '🎉 வாழ்த்துகள்! "வேலை கிடைத்தது" என்று பதிவு நிலை மாற்றப்பட்டது.',
        '🎉 Congratulations! Post marked as "Job Found / Completed".',
        '🎉 बधाई! "काम मिल गया" के रूप में चिह्नित किया गया।',
        '🎉 అభినందనలు! "పని దొరికింది" గా గుర్తించబడింది.',
        '🎉 അഭിനന്ദനങ്ങൾ! "ജോലി ലഭിച്ചു" എന്ന് രേഖപ്പെടുത്തി.',
        '🎉 ಅಭಿನಂದನೆಗಳು! "ಕೆಲಸ ಸಿಕ್ಕಿದೆ" ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.'
      )
    );
  };

  // Re-open seeker post
  const handleReactivateSeeker = (seeker: JobSeeker) => {
    const updatedSeeker: JobSeeker = {
      ...seeker,
      status: 'available',
      isFreeToday: true,
      statusNote: loc('இன்று வேலை வேண்டும்', 'Looking for daily work'),
      availableDate: new Date().toISOString().split('T')[0],
    };
    onUpdateSeeker(updatedSeeker);
    showToast(
      loc(
        'பதிவு மீண்டும் வேலை தேடும் நிலைக்கு மாற்றப்பட்டது.',
        'Worker post reactivated as Available.',
        'पोस्ट फिर से सक्रिय हो गई।',
        'పోస్ట్ మళ్లీ ప్రారంభించబడింది.',
        'പോസ്റ്റ് വീണ്ടും സജീവമാക്കി.',
        'ಪೋಸ್ಟ್ ಮತ್ತೆ ಸಕ್ರಿಯವಾಗಿದೆ.'
      )
    );
  };

  // Employer Job: Mark Filled / Completed
  const handleMarkJobCompleted = (job: Job) => {
    const updatedJob: Job = {
      ...job,
      status: 'completed',
    };
    onUpdateJob(updatedJob);
    showToast(
      loc(
        '🎉 "வேலைக்கு ஆட்கள் கிடைத்துவிட்டார்கள் / வேலை முடிந்தது" என பதிவு செய்யப்பட்டது.',
        '🎉 Job marked as Filled / Completed! No more calls will disturb you.',
        '🎉 काम पूरा हो गया / श्रमिक मिल गए!',
        '🎉 పని పూర్తయింది / కార్మికులు దొరికారు!',
        '🎉 ജോലി പൂർത്തിയായി / ആളുകളെ ലഭിച്ചു!',
        '🎉 ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ / ಕೆಲಸಗಾರರು ಸಿಕ್ಕಿದ್ದಾರೆ!'
      )
    );
  };

  // Employer Job: Re-open
  const handleReactivateJob = (job: Job) => {
    const updatedJob: Job = {
      ...job,
      status: 'active',
    };
    onUpdateJob(updatedJob);
    showToast(
      loc(
        'வேலை பதிவு மீண்டும் நேரலையாக மாற்றப்பட்டது.',
        'Job post reactivated as Active.',
        'नौकरी फिर से सक्रिय की गई।',
        'ఉద్యోగం మళ్లీ సక్రియం చేయబడింది.',
        'ജോലി വീണ്ടും സജീവമാക്കി.',
        'ಕೆಲಸ ಮತ್ತೆ ಸಕ್ರಿಯವಾಗಿದೆ.'
      )
    );
  };

  // Quick Daily Job Request submission
  const handleCreateQuickSeekerPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanCurrentPhone || cleanCurrentPhone.length < 10) {
      showToast(
        loc(
          'தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
          'Please enter a valid 10-digit mobile number.',
          'कृपया 10 अंकों का फ़ोन नंबर दर्ज करें।'
        )
      );
      return;
    }

    const postName = userName.trim() || loc('தொழிலாளி', 'Daily Worker');

    onRegisterSeeker({
      name: postName,
      mobileNumber: cleanCurrentPhone,
      category: quickPostCategory,
      customCategoryName: quickPostCategory === 'other' ? quickPostCustomCat.trim() : undefined,
      location: quickPostLocation.trim() || 'தமிழ்நாடு',
      expectedDailyWage: Number(quickPostWage) || 850,
      status: 'available',
      isFreeToday: true,
      availableDate: quickPostDate,
      statusNote: quickPostNote.trim() || loc('இன்று எனக்கு வேலை வேண்டும் (Free for daily work)', 'Available for work today'),
    });

    // Save profile state
    saveActiveUserProfile({
      name: postName,
      phone: cleanCurrentPhone,
      role: 'seeker',
      location: quickPostLocation,
      category: quickPostCategory,
    });

    setShowQuickPostForm(false);
    showToast(
      loc(
        '🎉 இன்று வேலை வேண்டும் என்ற புதிய பதிவு வெற்றிகரமாக பதியப்பட்டது!',
        '🎉 "Need Job Today" post successfully created and visible to employers!',
        '🎉 नया काम अनुरोध सफलतापूर्वक पोस्ट किया गया!',
        '🎉 కొత్త పని అభ్యర్థన విజయవంతంగా పోస్ట్ చేయబడింది!',
        '🎉 പുതിയ ജോലി പോസ്റ്റ് വിജയകരമായി ചേർത്തു!',
        '🎉 ಹೊಸ ಕೆಲಸದ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ!'
      )
    );
  };

  // Save edits to Job
  const handleSaveJobEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    onUpdateJob(editingJob);
    setEditingJob(null);
    showToast(
      loc(
        'வேலை விவரங்கள் வெற்றிகரமாக மாற்றி அமைக்கப்பட்டன (Updated)!',
        'Job post updated successfully!',
        'नौकरी का विवरण सफलतापूर्वक अपडेट किया गया!',
        'ఉద్యోగ వివరాలు నవీకరించబడ్డాయి!',
        'ജോലി വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു!',
        'ಉದ್ಯೋಗ ವಿವರಗಳು ನವೀಕರಿಸಲ್ಪಟ್ಟಿವೆ!'
      )
    );
  };

  // Save edits to Seeker
  const handleSaveSeekerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeeker) return;
    onUpdateSeeker(editingSeeker);
    setEditingSeeker(null);
    showToast(
      loc(
        'தொழிலாளர் பதிவு விவரங்கள் மாற்றி அமைக்கப்பட்டன (Updated)!',
        'Worker profile updated successfully!',
        'श्रमिक प्रोफ़ाइल अपडेट की गई!',
        'కార్మికుల ప్రొఫైల్ నవీకరించబడింది!',
        'പ്രൊഫൈൽ അപ്‌ഡേറ്റ് ചെയ്തു!',
        'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ!'
      )
    );
  };

  const totalPostsCount = userSeekers.length + userJobs.length;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner: My Posts & Profile Dashboard */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md border-2 border-amber-300">
                <User className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  {loc('என் பதிவுகள் பக்கம்', 'My Posts & Profile', 'मेरी पोस्ट्स', 'నా పోస్ట్‌లు', 'എന്റെ പോസ്റ്റുകൾ', 'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು')}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {userName || (cleanCurrentPhone ? `+91 ${cleanCurrentPhone}` : loc('சுயவிவரம்', 'My Dashboard'))}
                </h3>
              </div>
            </div>

            <button
              type="button"
              id="btn-edit-user-profile"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition-all border border-white/10"
              title={loc('எடிட் எண்', 'Change Phone')}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isEditingProfile ? loc('மூடு', 'Close') : loc('மாற்று', 'Edit')}</span>
            </button>
          </div>

          {/* Current Phone Indicator / Quick Switch */}
          {cleanCurrentPhone ? (
            <div className="mt-3 pt-3 border-t border-emerald-700/40 flex items-center justify-between text-xs text-emerald-200">
              <div className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {loc('இணைக்கப்பட்ட எண்:', 'Linked Phone:')}{' '}
                  <strong className="text-white font-black">{cleanCurrentPhone}</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                {totalPostsCount} {loc('பதிவுகள்', 'Posts', 'पोस्ट्स', 'పోస్ట్‌లు', 'പോസ്റ്റുകൾ', 'ಪೋಸ್ಟ್‌ಗಳು')}
              </span>
            </div>
          ) : null}

          {/* Phone Link Form if no phone set or editing */}
          {(!cleanCurrentPhone || isEditingProfile) && (
            <form onSubmit={handleSavePhone} className="mt-3 pt-3 border-t border-emerald-700/50 space-y-2.5">
              <p className="text-xs text-emerald-100 font-medium">
                {loc(
                  'நீங்கள் பதிவு செய்த வேலைகள் அல்லது தொழிலாளர் விவரங்களை பார்க்க உங்கள் மொபைல் எண்ணை உள்ளிடவும்:',
                  'Enter your 10-digit mobile number to view and manage all your posts:',
                  'अपनी पोस्ट्स देखने और प्रबंधित करने के लिए अपना फ़ोन नंबर दर्ज करें:'
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    id="my-posts-input-name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={loc('உங்கள் பெயர் (விருப்பம்)', 'Your Name (Optional)')}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-emerald-500/40 rounded-xl text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    id="my-posts-input-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={loc('10 இலக்க மொபைல் எண்', '10-Digit Mobile Number')}
                    className="flex-1 px-3 py-2 bg-slate-900/60 border border-emerald-500/40 rounded-xl text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                  <button
                    id="my-posts-btn-save-phone"
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                  >
                    {loc('இணைக்க', 'Link', 'जोड़ें', 'లింక్', 'ലിങ്ക്', 'ಲಿಂಕ್')}
                  </button>
                </div>
              </div>

              {/* Saved phone chips for instant 1-tap switch */}
              {trackedPhones.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">
                    {loc('சமீபத்திய எண்கள்:', 'Recent:')}
                  </span>
                  {trackedPhones.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPhoneNumber(p);
                        saveActiveUserProfile({ ...activeProfile, phone: p });
                        setIsEditingProfile(false);
                      }}
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono text-emerald-200 border border-emerald-500/30 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Action Banner: Instant "Today I am free / Need Job" Button */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-4 text-slate-950 shadow-md border-2 border-amber-300">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center font-black shadow-sm shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-950 leading-tight">
                {loc('இன்று வேலை வேண்டுமா? (Today I Am Free / I Need Job)', 'Free Today? Need Daily Work?', 'आज काम चाहिए?')}
              </h4>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {loc('தேதி, பகுதி குறிப்பிட்டு 1-கிளிக்கில் பதிவு போடுங்கள்', 'Post your availability for today or tomorrow in 1-click', '1-क्लिक में पोस्ट करें')}
              </p>
            </div>
          </div>

          <button
            id="btn-open-quick-post-form"
            type="button"
            onClick={() => setShowQuickPostForm(!showQuickPostForm)}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {showQuickPostForm
                ? loc('படிவத்தை மூடு', 'Close Form')
                : loc('இன்றைய வேலை பதிவு போடு', '+ Post Daily Work', '+ काम पोस्ट करें')}
            </span>
          </button>
        </div>

        {/* Quick Post Form Expansion */}
        {showQuickPostForm && (
          <form
            onSubmit={handleCreateQuickSeekerPost}
            className="mt-3.5 pt-3 border-t border-amber-600/30 bg-white rounded-2xl p-3.5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {loc('இன்றைய அல்லது நாளைய வேலை பதிவு', 'Post Availability for Work')}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {loc('நேரடி தொடர்பு', 'Direct Calls')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                  {loc('வேலை வகை', 'Category', 'श्रेणी')}
                </label>
                <select
                  value={quickPostCategory}
                  onChange={(e) => setQuickPostCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                >
                  {WORK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                  <option value="other">{loc('மற்ற வேலைகள் (Other)', 'Other Work')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                  {loc('வேலை வேண்டிய தேதி', 'Available Date', 'तारीख')}
                </label>
                <input
                  type="date"
                  value={quickPostDate}
                  onChange={(e) => setQuickPostDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {quickPostCategory === 'other' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  {loc('வேலையின் பெயர் / திறன்', 'Custom Skill / Category Name')}
                </label>
                <input
                  type="text"
                  value={quickPostCustomCat}
                  onChange={(e) => setQuickPostCustomCat(e.target.value)}
                  placeholder={loc('உதா: கார் டிரைவர், தோட்ட வேலை...', 'e.g. Driver, Gardner...')}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                  {loc('நீங்கள் இருக்கும் பகுதி', 'Your Area / Locality', 'स्थान')}
                </label>
                <input
                  type="text"
                  value={quickPostLocation}
                  onChange={(e) => setQuickPostLocation(e.target.value)}
                  placeholder={loc('உதா: தாம்பரம், சென்னை', 'e.g. Tambaram, Chennai')}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                  {loc('எதிர்பார்க்கும் தினக்கூலி (₹)', 'Daily Wage (₹)', 'दैनिक मजदूरी')}
                </label>
                <input
                  type="number"
                  value={quickPostWage}
                  onChange={(e) => setQuickPostWage(Number(e.target.value))}
                  min={100}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                {loc('கூடுதல் குறிப்பு (விருப்பம்)', 'Extra Note (Optional)', 'अतिरिक्त नोट')}
              </label>
              <input
                type="text"
                value={quickPostNote}
                onChange={(e) => setQuickPostNote(e.target.value)}
                placeholder={loc('Today I am free I need job / இன்று உடனடியாக வேலை வேண்டும்', 'Today I am free I need job')}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickPostForm(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {loc('ரத்து', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{loc('பதிவை வெளியிடு', 'Publish Availability')}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl">
          <button
            id="my-posts-tab-all"
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {loc('அனைத்தும்', 'All')} ({totalPostsCount})
          </button>
          <button
            id="my-posts-tab-seeker"
            type="button"
            onClick={() => setActiveTab('seeker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'seeker'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {loc('தொழிலாளர் பதிவுகள்', 'Worker Posts')} ({userSeekers.length})
          </button>
          <button
            id="my-posts-tab-jobs"
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'jobs'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            {loc('வேலை விளம்பரங்கள்', 'Job Posts')} ({userJobs.length})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="my-posts-btn-post-job"
            type="button"
            onClick={() => onNavigate('post-job')}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1 shadow-xs active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loc('புதிய வேலை', '+ New Job')}</span>
          </button>
        </div>
      </div>

      {/* No Phone Alert */}
      {!cleanCurrentPhone && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-black text-sm text-slate-900">
            {loc('மொபைல் எண் இணைக்கப்படவில்லை', 'No Phone Number Linked', 'फ़ोन नंबर लिंक नहीं है')}
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            {loc(
              'நீங்கள் பதிவு செய்த விவரங்களை நிர்வகிக்க மேலே உங்கள் மொபைல் எண்ணை உள்ளிடவும்.',
              'Please enter your phone number above to see and manage the posts made from your device.',
              'अपनी पोस्ट देखने के लिए ऊपर अपना फ़ोन नंबर दर्ज करें।'
            )}
          </p>
        </div>
      )}

      {/* Empty State when phone is set but 0 posts */}
      {cleanCurrentPhone && totalPostsCount === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto font-black">
            <Briefcase className="w-7 h-7 text-emerald-700" />
          </div>
          <h4 className="font-black text-base text-slate-900">
            {loc(
              `"${cleanCurrentPhone}" எண்ணில் இதுவரை பதிவுகள் இல்லை`,
              `No posts found for "${cleanCurrentPhone}" yet`
            )}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {loc(
              'நீங்கள் இன்று வேலை தேடுகிறீர்களா அல்லது ஆட்கள் தேவையா? புதிய பதிவை உடனே உருவாக்குங்கள்!',
              'Looking for work today or hiring workers? Create a new listing right now!',
              'क्या आप आज काम ढूंढ रहे हैं या कर्मचारी चाहिए?'
            )}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickPostForm(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm"
            >
              {loc('இன்று வேலை வேண்டும் என பதிவு செய்ய', 'I Need Job Today')}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('post-job')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm"
            >
              {loc('வேலை விளம்பரம் போட', 'Post a Job')}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: USER SEEKER POSTS (தொழிலாளர் பதிவுகள் & Today Free Status) */}
      {(activeTab === 'all' || activeTab === 'seeker') && userSeekers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>
                {loc('எனது வேலை தேடல் பதிவுகள்', 'My Worker Registrations')} ({userSeekers.length})
              </span>
            </h4>
            <span className="text-[11px] text-slate-500 font-bold">
              {loc('எடிட் / நிலை மாற்றம்', 'Edit / Status Update')}
            </span>
          </div>

          <div className="space-y-3">
            {userSeekers.map((seeker) => {
              const cat = WORK_CATEGORIES.find((c) => c.id === seeker.category);
              const magic = getCategoryMagicTheme(seeker.category);
              const catName = cat ? getCategoryName(cat) : seeker.customCategoryName || seeker.category;
              const isAvailable = seeker.isFreeToday || seeker.status === 'available';
              const isCompleted = seeker.status === 'completed';

              return (
                <div
                  key={seeker.id}
                  id={`my-seeker-card-${seeker.id}`}
                  className={`bg-white rounded-2xl p-4 border transition-all space-y-3 shadow-xs ${
                    isCompleted
                      ? 'border-slate-300 bg-slate-50/70 opacity-90'
                      : isAvailable
                      ? 'border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center shrink-0`}>
                        <CategoryIcon name={cat ? cat.iconName : 'User'} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                            {catName}
                          </span>

                          {/* Live Status Badge */}
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-600" />
                              {loc('வேலை முடிந்தது / கிடைத்தது', 'Job Done / Completed')}
                            </span>
                          ) : isAvailable ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300 animate-pulse">
                              <Sun className="w-3 h-3 text-emerald-600" />
                              {loc('இன்று நான் தயார் (FREE TODAY)', 'FREE TODAY / NEED JOB')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                              {loc('வேலையில் உள்ளேன் (Busy)', 'Busy')}
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-slate-900 text-sm mt-1">{seeker.name}</h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-700">₹{seeker.expectedDailyWage}</span>
                      <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">
                        {loc('தினக்கூலி', '/ day')}
                      </p>
                    </div>
                  </div>

                  {/* Date, Location, and Note */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold">{seeker.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-semibold">
                        {seeker.availableDate || seeker.registeredAt?.split('T')[0] || loc('இன்று', 'Today')}
                      </span>
                    </div>
                  </div>

                  {/* Status Note or Reply Note */}
                  {seeker.statusNote && (
                    <div className="px-3 py-1.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{seeker.statusNote}</span>
                    </div>
                  )}

                  {/* 1-Click Interactive Status & Reply Buttons */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    {/* Toggle: "Today I am free / I need job" */}
                    <button
                      id={`seeker-toggle-free-${seeker.id}`}
                      type="button"
                      onClick={() => handleToggleFreeToday(seeker)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        isAvailable
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {isAvailable
                          ? loc('வேலையில் உள்ளேன் என மாற்ற', 'Mark as Busy')
                          : loc('இன்று எனக்கு வேலை வேண்டும்', 'Today I Am Free / Need Job')}
                      </span>
                    </button>

                    {/* Reply option: "வேலை கிடைத்தது" (Job Done / Got Job) */}
                    {!isCompleted ? (
                      <button
                        id={`seeker-mark-done-${seeker.id}`}
                        type="button"
                        onClick={() => handleMarkJobGotten(seeker)}
                        className="py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        title={loc('வேலை கிடைத்தது என்று ரிப்ளை செய்ய', 'Reply: Job Found / Done')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{loc('வேலை கிடைத்தது', 'Job Done')}</span>
                      </button>
                    ) : (
                      <button
                        id={`seeker-reactivate-${seeker.id}`}
                        type="button"
                        onClick={() => handleReactivateSeeker(seeker)}
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{loc('மீண்டும் திறக்க', 'Re-open')}</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      id={`seeker-btn-edit-${seeker.id}`}
                      type="button"
                      onClick={() => setEditingSeeker(seeker)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title={loc('மாற்றி அமைக்க (Edit)', 'Edit Post')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      id={`seeker-btn-del-${seeker.id}`}
                      type="button"
                      onClick={() => {
                        if (window.confirm(loc('இந்தப் பதிவை நிச்சயமாக நீக்க வேண்டுமா?', 'Are you sure you want to delete this post?'))) {
                          onDeleteSeeker(seeker.id);
                          showToast(loc('பதிவு நீக்கப்பட்டது.', 'Post deleted.'));
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                      title={loc('நீக்க (Delete)', 'Delete Post')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: USER EMPLOYER JOBS (வேலை கொடுப்பவர் பதிவுகள்) */}
      {(activeTab === 'all' || activeTab === 'jobs') && userJobs.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>
                {loc('நான் வெளியிட்ட வேலை விளம்பரங்கள்', 'My Posted Jobs')} ({userJobs.length})
              </span>
            </h4>
            <span className="text-[11px] text-slate-500 font-bold">
              {loc('ஆட்கள் கிடைத்தால் முடிக்கவும்', 'Mark filled when done')}
            </span>
          </div>

          <div className="space-y-3">
            {userJobs.map((job) => {
              const cat = WORK_CATEGORIES.find((c) => c.id === job.category);
              const magic = getCategoryMagicTheme(job.category);
              const catName = cat ? getCategoryName(cat) : job.customCategoryName || job.category;
              const isCompleted = job.status === 'completed';

              return (
                <div
                  key={job.id}
                  id={`my-job-card-${job.id}`}
                  className={`bg-white rounded-2xl p-4 border transition-all space-y-3 shadow-xs ${
                    isCompleted
                      ? 'border-slate-300 bg-slate-50/70 opacity-90'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-11 h-11 rounded-2xl ${magic.iconBg} flex items-center justify-center shrink-0`}>
                        <CategoryIcon name={cat ? cat.iconName : 'Briefcase'} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${magic.badge}`}>
                            {catName}
                          </span>
                          {job.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                              ★ Featured
                            </span>
                          )}
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
                              {loc('வேலை முடிந்தது / ஆட்கள் சேர்ந்தனர்', 'Filled / Completed')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                              {loc('நேரலையில் உள்ளது (Active)', 'Active Listing')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mt-1">{job.employerName}</h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-700">₹{job.dailyWage}</span>
                      <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">
                        {job.workersNeeded} {loc('ஆட்கள்', 'Workers')}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-semibold">{job.jobDate || loc('இன்று', 'Today')}</span>
                    </div>
                  </div>

                  {job.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                      {job.notes}
                    </p>
                  )}

                  {/* Action row: Mark Completed / Filled, Edit, Delete */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    {!isCompleted ? (
                      <button
                        id={`job-mark-filled-${job.id}`}
                        type="button"
                        onClick={() => handleMarkJobCompleted(job)}
                        className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>{loc('வேலை முடிந்தது / ஆட்கள் சேர்ந்தனர்', 'Mark as Filled / Completed')}</span>
                      </button>
                    ) : (
                      <button
                        id={`job-reactivate-${job.id}`}
                        type="button"
                        onClick={() => handleReactivateJob(job)}
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{loc('மீண்டும் செயலுக்கு கொண்டுவர', 'Reactivate Job Listing')}</span>
                      </button>
                    )}

                    {/* Edit Job */}
                    <button
                      id={`job-btn-edit-${job.id}`}
                      type="button"
                      onClick={() => setEditingJob(job)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title={loc('மாற்றி அமைக்க (Edit)', 'Edit Job')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Job */}
                    <button
                      id={`job-btn-del-${job.id}`}
                      type="button"
                      onClick={() => {
                        if (window.confirm(loc('இந்த வேலை விளம்பரத்தை நிச்சயமாக நீக்க வேண்டுமா?', 'Are you sure you want to delete this job listing?'))) {
                          onDeleteJob(job.id);
                          showToast(loc('வேலை விளம்பரம் நீக்கப்பட்டது.', 'Job post deleted.'));
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                      title={loc('நீக்க (Delete)', 'Delete Job')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT MODAL: Job */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                {loc('வேலை விளம்பரத்தை மாற்றி அமைக்க', 'Edit Job Listing')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('முதலாளி / நிறுவன பெயர்', 'Employer / Business Name')}
                </label>
                <input
                  type="text"
                  value={editingJob.employerName}
                  onChange={(e) => setEditingJob({ ...editingJob, employerName: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('தினக்கூலி (₹)', 'Daily Wage (₹)')}
                  </label>
                  <input
                    type="number"
                    value={editingJob.dailyWage}
                    onChange={(e) => setEditingJob({ ...editingJob, dailyWage: Number(e.target.value) })}
                    required
                    min={100}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('ஆட்கள் தேவை', 'Workers Needed')}
                  </label>
                  <input
                    type="number"
                    value={editingJob.workersNeeded}
                    onChange={(e) => setEditingJob({ ...editingJob, workersNeeded: Number(e.target.value) })}
                    required
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('வேலை நடக்கும் இடம் / பகுதி', 'Location / Area')}
                </label>
                <input
                  type="text"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('வேலை தேதி', 'Job Date')}
                </label>
                <input
                  type="date"
                  value={editingJob.jobDate}
                  onChange={(e) => setEditingJob({ ...editingJob, jobDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('தொடர்பு எண்', 'Contact Phone')}
                </label>
                <input
                  type="tel"
                  value={editingJob.contactNumber}
                  onChange={(e) => setEditingJob({ ...editingJob, contactNumber: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('குறிப்பு / விவரங்கள்', 'Notes / Requirements')}
                </label>
                <textarea
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {loc('ரத்து', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  {loc('சேமிக்க', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: Seeker */}
      {editingSeeker && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                {loc('சுயவிவரத்தை மாற்றி அமைக்க', 'Edit Worker Profile')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSeeker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeekerEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('தொழிலாளி பெயர்', 'Worker Name')}
                </label>
                <input
                  type="text"
                  value={editingSeeker.name}
                  onChange={(e) => setEditingSeeker({ ...editingSeeker, name: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('வேலை வகை', 'Work Category')}
                </label>
                <select
                  value={editingSeeker.category}
                  onChange={(e) => setEditingSeeker({ ...editingSeeker, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                >
                  {WORK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryName(cat)}
                    </option>
                  ))}
                  <option value="other">{loc('மற்ற வேலைகள் (Other)', 'Other')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('தினக்கூலி (₹)', 'Daily Wage (₹)')}
                  </label>
                  <input
                    type="number"
                    value={editingSeeker.expectedDailyWage}
                    onChange={(e) =>
                      setEditingSeeker({
                        ...editingSeeker,
                        expectedDailyWage: Number(e.target.value),
                      })
                    }
                    required
                    min={100}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loc('அனுபவம் (வருடம்)', 'Experience (Yrs)')}
                  </label>
                  <input
                    type="number"
                    value={editingSeeker.experienceYears || 0}
                    onChange={(e) =>
                      setEditingSeeker({
                        ...editingSeeker,
                        experienceYears: Number(e.target.value),
                      })
                    }
                    min={0}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('பகுதி / முகவரி', 'Location / Area')}
                </label>
                <input
                  type="text"
                  value={editingSeeker.location}
                  onChange={(e) => setEditingSeeker({ ...editingSeeker, location: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('தொடர்பு எண்', 'Contact Mobile')}
                </label>
                <input
                  type="tel"
                  value={editingSeeker.mobileNumber}
                  onChange={(e) => setEditingSeeker({ ...editingSeeker, mobileNumber: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loc('நிலை குறிப்பு / விளக்கம்', 'Status Note')}
                </label>
                <input
                  type="text"
                  value={editingSeeker.statusNote || ''}
                  onChange={(e) => setEditingSeeker({ ...editingSeeker, statusNote: e.target.value })}
                  placeholder={loc('Today I am free I need job / இன்று வேலை தயார்', 'Today I am free I need job')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSeeker(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {loc('ரத்து', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  {loc('சேமிக்க', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
