import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { apiService } from '../../services/apiService';
import { UserProfile } from '../../types';
import {
  MapPin,
  Music,
  Sliders,
  CheckCircle2,
  Sparkles,
  Disc3,
  Video,
  ArrowRight,
  Headphones,
  Flame,
  Radio,
  Globe2
} from 'lucide-react';

interface OnboardingPageProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const REGIONS = [
  'Global / Worldwide',
  'United States (North America)',
  'United Kingdom (Europe)',
  'India (South Asia)',
  'Japan (East Asia)',
  'Germany (Europe)',
  'France (Europe)',
  'Brazil (South America)',
  'United Arab Emirates (Middle East)',
  'Canada (North America)',
  'Australia (Oceania)',
  'South Korea (East Asia)',
  'Spain (Europe)',
  'Mexico (Latin America)',
  'Netherlands (Europe)',
  'Singapore (Southeast Asia)'
];

interface GenreOption {
  id: string;
  name: string;
  bpm: string;
  description: string;
  icon: string;
  color: string;
}

const MUSIC_GENRES: GenreOption[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk & Synthwave',
    bpm: '128 - 140 BPM',
    description: 'Neon arpeggios, analog retro synths & driving kick drums',
    icon: '⚡',
    color: 'from-purple-600/30 to-pink-600/30 border-purple-500/40'
  },
  {
    id: 'techno',
    name: 'Peak-Time Techno',
    bpm: '132 - 145 BPM',
    description: 'Hypnotic rumble kicks, industrial acid leads & dark club energy',
    icon: '🎛️',
    color: 'from-indigo-600/30 to-cyan-600/30 border-indigo-500/40'
  },
  {
    id: 'lofi',
    name: 'Chill Lo-Fi Hip Hop',
    bpm: '75 - 90 BPM',
    description: 'Vinyl crackle, dusty Rhodes chords & laid-back groove',
    icon: '☕',
    color: 'from-amber-600/30 to-orange-600/30 border-amber-500/40'
  },
  {
    id: 'deephouse',
    name: 'Deep & Melodic House',
    bpm: '122 - 126 BPM',
    description: 'Warm basslines, lush chords, and infectious syncopated groove',
    icon: '🌊',
    color: 'from-blue-600/30 to-teal-600/30 border-blue-500/40'
  },
  {
    id: 'futurebass',
    name: 'Future Bass & Trap',
    bpm: '140 - 160 BPM',
    description: 'Glitch chords, pitched vocal chops, and earth-shaking 808s',
    icon: '🚀',
    color: 'from-violet-600/30 to-fuchsia-600/30 border-violet-500/40'
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop & Boom Bap',
    bpm: '85 - 95 BPM',
    description: 'Punchy snares, sample flips, and heavy rhythmic bounce',
    icon: '🎤',
    color: 'from-red-600/30 to-rose-600/30 border-red-500/40'
  },
  {
    id: 'ambient',
    name: 'Cinematic Ambient',
    bpm: 'Freeform / Float',
    description: 'Ethereal pads, modular textures & expansive sound design',
    icon: '🌌',
    color: 'from-emerald-600/30 to-teal-600/30 border-emerald-500/40'
  },
  {
    id: 'dnb',
    name: 'Drum & Bass / Jungle',
    bpm: '170 - 175 BPM',
    description: 'Amen breaks, fast-paced rhythms & reese bass modulations',
    icon: '🔊',
    color: 'from-cyan-600/30 to-blue-600/30 border-cyan-500/40'
  }
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const { t } = useLanguage();

  const [location, setLocation] = useState(user.location || REGIONS[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    user.preferredGenres && user.preferredGenres.length > 0
      ? user.preferredGenres
      : ['cyberpunk', 'techno']
  );
  const [customInspiration, setCustomInspiration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'pro'>(
    (user.experienceLevel as any) || 'intermediate'
  );
  const [studioGoal, setStudioGoal] = useState<'dj' | 'music' | 'video' | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  const handleLaunchStudio = async () => {
    if (selectedGenres.length === 0) {
      setErrorMsg(t('onboard.selectAtLeastOne', 'Please select at least 1 favorite music style to customize your audio engines.'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fullGenres = [...selectedGenres];
      if (customInspiration.trim()) {
        fullGenres.push(`custom:${customInspiration.trim()}`);
      }

      const res = await apiService.updateProfile({
        userId: user.id,
        location,
        preferredGenres: fullGenres,
        experienceLevel,
        studioGoal
      });

      if (res && res.success && res.user) {
        onComplete(res.user);
      } else {
        // Fallback update
        const updatedUser: UserProfile = {
          ...user,
          location,
          preferredGenres: fullGenres,
          experienceLevel,
          studioGoal,
          hasCompletedOnboarding: true
        };
        onComplete(updatedUser);
      }
    } catch {
      // Local fallback
      const updatedUser: UserProfile = {
        ...user,
        location,
        preferredGenres: selectedGenres,
        experienceLevel,
        studioGoal,
        hasCompletedOnboarding: true
      };
      onComplete(updatedUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-white flex flex-col relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="w-full border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black tracking-wider text-white shadow-lg shadow-purple-600/40">
            Z
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-white uppercase flex items-center gap-2">
              ZOVIK <span className="text-[10px] text-purple-400 font-semibold px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30">STUDIO ONBOARDING</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8 z-10">
        {/* Welcome Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Welcome, {user.name || 'Creator'}! Let's fine-tune your creative studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {t('onboard.title', 'Customize Your Music & Video Engine')}
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            {t('onboard.subtitle', 'Select your region and the tracks/genres you love. Zovik AI will calibrate the dual DJ decks, stem synthesis, and video prompts to your artistic taste.')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <div className="space-y-8">
          {/* STEP 1: LOCATION */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {t('onboard.locationLabel', 'Your Region / Location')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Used to synchronize local BPM trends, club styles, and language accents.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {REGIONS.map((reg) => {
                const isSelected = location === reg;
                return (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setLocation(reg)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-600/25 border-purple-500 text-white shadow-md shadow-purple-600/20 font-medium'
                        : 'bg-black/30 border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{reg}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: FAVORITE MUSIC TRACKS & GENRES */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center font-bold text-sm border border-pink-500/30">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {t('onboard.genresLabel', 'Tracks & Music Styles You Love')}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {t('onboard.genresHelp', 'Select one or more genres. We pre-tune your AI DJ mashup tempo and stem generators.')}
                  </p>
                </div>
              </div>
              <span className="text-xs text-purple-400 font-medium px-2 py-1 rounded-md bg-purple-950/50 border border-purple-500/30">
                {selectedGenres.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSIC_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <div
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 relative overflow-hidden group ${
                      isSelected
                        ? `bg-gradient-to-br ${genre.color} shadow-lg shadow-purple-950/50`
                        : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                      {genre.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {genre.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {genre.bpm}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-snug">
                        {genre.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Artist / Track Inspiration */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Specific Song or Artist Inspirations (Optional):
              </label>
              <input
                type="text"
                value={customInspiration}
                onChange={(e) => setCustomInspiration(e.target.value)}
                placeholder="e.g. Daft Punk, Skrillex, Hans Zimmer, Martin Garrix, Fred Again"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* STEP 3: EXPERIENCE LEVEL & GOAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Experience Level */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {t('onboard.levelLabel', 'DJ & Mixing Experience')}
                  </h3>
                  <p className="text-xs text-gray-400">Controls assistant automation depth.</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'beginner', title: t('onboard.levelBeginner', 'Beginner (Starting DJ / Music Explorer)'), desc: 'AI auto-aligns BPM, matches musical keys, and manages transitions.' },
                  { id: 'intermediate', title: t('onboard.levelIntermediate', 'Intermediate (Club DJ / Beatmaker)'), desc: 'Balanced 3-band EQ controls, cue points, and stem split recommendations.' },
                  { id: 'pro', title: t('onboard.levelPro', 'Professional (Master DJ / Sound Engineer)'), desc: 'Full manual deck override, low/high pass sweeps, and raw buffer export.' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id as any)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      experienceLevel === lvl.id
                        ? 'bg-purple-600/25 border-purple-500 text-white font-medium'
                        : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-white">{lvl.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Creative Goal */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {t('onboard.goalLabel', 'Primary Studio Goal')}
                  </h3>
                  <p className="text-xs text-gray-400">Sets your default dashboard layout.</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'dj', title: 'DJ Live Mashups & Mixing', icon: Disc3, desc: 'Dual decks, crossfader, stem sync, cue points' },
                  { id: 'music', title: 'AI Music & Stem Generation', icon: Headphones, desc: 'Synthesize custom tracks, 4-stem mixing' },
                  { id: 'video', title: 'AI Music Video Creator', icon: Video, desc: 'Cinematic visuals synced to audio BPM' },
                  { id: 'all', title: 'Full Zovik Creative Suite', icon: Sparkles, desc: 'Seamless access across all music, video, and code tools' },
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setStudioGoal(g.id as any)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs text-left transition-all ${
                        studioGoal === g.id
                          ? 'bg-purple-600/25 border-purple-500 text-white font-medium'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white">{g.title}</div>
                        <div className="text-[11px] text-gray-400">{g.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Launch Button CTA */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleLaunchStudio}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Calibrating Studio...' : t('onboard.saveAndEnter', 'Launch Zovik Studio')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-gray-500 text-center">
              You can adjust your regional settings and music preferences anytime in Studio Settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
