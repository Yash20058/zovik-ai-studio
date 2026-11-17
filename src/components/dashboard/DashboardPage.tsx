import React from 'react';
import { 
  Disc3, 
  Music, 
  Video, 
  Code2, 
  MessageSquare, 
  Sparkles, 
  Radio, 
  Flame, 
  Play, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sliders
} from 'lucide-react';
import { NavTab, AudioTrack } from '../../types';
import { SAMPLE_TRACKS } from '../../audio/sampleTracks';

interface DashboardProps {
  setActiveTab: (tab: NavTab) => void;
  apiStatus: {
    geminiConfigured: boolean;
    musicConfigured: boolean;
    videoConfigured: boolean;
  };
}

export const DashboardPage: React.FC<DashboardProps> = ({ setActiveTab, apiStatus }) => {
  const quickActions = [
    {
      id: 'dj-studio' as NavTab,
      title: 'AI DJ Music Studio',
      desc: 'Dual virtual decks, BPM detection, 3-band EQ & Camelot mashup engine.',
      icon: Disc3,
      badge: 'PRO WORKSTATION',
      color: 'from-purple-600 to-indigo-600',
      border: 'border-purple-500/30'
    },
    {
      id: 'ai-music' as NavTab,
      title: 'AI Music & Stem Generator',
      desc: 'Procedural electronic synthesis, stem separation & key mapping.',
      icon: Music,
      badge: 'SYNTHESIS CORE',
      color: 'from-cyan-600 to-blue-600',
      border: 'border-cyan-500/30'
    },
    {
      id: 'ai-video' as NavTab,
      title: 'Audio-Reactive Video Studio',
      desc: 'Real-time canvas video renderer synced to your DJ master mix.',
      icon: Video,
      badge: 'CANVAS RECORDER',
      color: 'from-pink-600 to-rose-600',
      border: 'border-pink-500/30'
    },
    {
      id: 'ai-code' as NavTab,
      title: 'AI Coding Assistant & Runner',
      desc: 'Live execution sandbox for Web Audio, WebGL shaders & creative code.',
      icon: Code2,
      badge: 'LIVE RUNNER',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-slate-950 border border-purple-500/20 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            zovik
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Create Music. Generate Videos. <br />
            <span className="text-gradient">Build Anything with AI.</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Welcome back to Zovik Studio. Seamlessly blend multi-track audio, generate club-ready stems, record audio-reactive videos, and write creative code in one unified dark-mode workspace.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('dj-studio')}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all"
            >
              <Disc3 className="w-4 h-4" /> Open DJ Studio
            </button>
            <button
              onClick={() => setActiveTab('ai-video')}
              className="py-2.5 px-5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Video className="w-4 h-4 text-cyan-400" /> Generate Video
            </button>
          </div>
        </div>

        {/* Ambient background glow orb */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Workspaces Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" /> Creative Workspaces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className={`p-5 rounded-2xl bg-slate-950/80 border ${action.border} hover:scale-[1.02] cursor-pointer transition-all shadow-xl group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>Enter Studio</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine Status & System Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audio Engine Spec */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Web Audio Core</div>
            <div className="text-sm font-bold text-white">32-Bit Float • 48kHz</div>
          </div>
        </div>

        {/* AI LLM Integration */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">AI Intelligence</div>
            <div className="text-sm font-bold text-white">
              {apiStatus.geminiConfigured ? 'Gemini 1.5 Flash Active' : 'Zovik Offline Engine'}
            </div>
          </div>
        </div>

        {/* Live Master Mix Status */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Master Deck Routing</div>
            <div className="text-sm font-bold text-white">Equal-Power Crossfader Ready</div>
          </div>
        </div>
      </div>

      {/* Preloaded Tracks Quick List */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" /> Preloaded Master Tracks
          </h3>
          <button
            onClick={() => setActiveTab('audio-library')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            View Library →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_TRACKS.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-white">{t.name}</div>
                <div className="text-[10px] text-slate-400">{t.bpm} BPM • Key: {t.key}</div>
              </div>
              <button
                onClick={() => setActiveTab('dj-studio')}
                className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
                title="Mix in DJ Studio"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
