import React, { useEffect, useRef, useState } from 'react';
import { 
  Volume2, 
  Radio, 
  Download, 
  Key, 
  Sparkles,
  Layers,
  Circle,
  LogOut,
  MapPin,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { audioEngine } from '../../audio/audioEngine';
import { useToast } from './Toast';
import { NavTab, UserProfile } from '../../types';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  geminiConfigured: boolean;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  geminiConfigured,
  currentUser,
  onLogout 
}) => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [masterVolume, setMasterVolume] = useState<number>(85);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  // Update master volume
  const handleVolumeChange = (val: number) => {
    setMasterVolume(val);
    const ctx = audioEngine.getAudioContext();
    if (ctx) {
      // audioEngine master volume adjustment
      audioEngine.setDeckVolume('A', (val / 100));
      audioEngine.setDeckVolume('B', (val / 100));
    }
  };

  // Recording handler
  const toggleRecording = async () => {
    if (!isRecording) {
      audioEngine.startRecording();
      setIsRecording(true);
      setRecordDuration(0);
      addToast('info', 'Recording Started', 'Recording live master DJ session');
    } else {
      const blob = await audioEngine.stopRecording();
      setIsRecording(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Zovik-DJ-Mix-${new Date().toISOString().slice(0, 19)}.webm`;
        a.click();
        addToast('success', 'Mix Downloaded!', 'Master audio file saved to your device.');
      } else {
        addToast('error', 'Recording Error', 'No audio data was captured');
      }
    }
  };

  // Timer for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Master Audio Waveform Visualizer
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getMasterAnalyser();
    const dataArray = new Uint8Array(64);

    const draw = () => {
      animId = requestAnimationFrame(draw);
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / 24;

      for (let i = 0; i < 24; i++) {
        const val = analyser ? dataArray[i * 2] / 255 : Math.sin(Date.now() / 300 + i) * 0.15 + 0.15;
        const barHeight = Math.max(3, val * canvas.height);
        const x = i * (barWidth + 1);

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      }
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const tabTitles: Record<NavTab, string> = {
    'landing': 'Overview',
    'dashboard': 'Studio Dashboard',
    'dj-studio': 'Dual-Deck AI DJ Studio & Mashup Engine',
    'ai-music': 'AI Procedural Music & Stem Generator',
    'ai-video': 'AI Audio-Reactive Video Generator',
    'ai-code': 'AI Creative Coding Studio & Sandbox',
    'ai-chat': 'AI Creative Assistant',
    'audio-library': 'Audio Library & Stems',
    'video-library': 'Video Library & Renders',
    'projects': 'Mix Projects & Workspaces',
    'settings': 'Studio Configuration & API Keys',
  };

  return (
    <header className="h-16 bg-slate-950/70 backdrop-blur-md border-b border-purple-900/20 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Tab Name */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-wide">
          {tabTitles[activeTab]}
        </h1>
        {activeTab === 'dj-studio' && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" /> 32-Bit Float Engine
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Master Mini Visualizer */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Master</span>
          <canvas ref={canvasRef} width={80} height={20} className="w-20 h-5" />
        </div>

        {/* Master Volume */}
        <div className="hidden sm:flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-20 accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            title={`Master Volume: ${masterVolume}%`}
          />
        </div>

        {/* Record Mix Button */}
        <button
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isRecording
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <Circle className={`w-3 h-3 ${isRecording ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
          <span>{isRecording ? `REC ${formatSec(recordDuration)}` : 'Record Mix'}</span>
        </button>

        {/* Settings / API Key Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            geminiConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{geminiConfigured ? 'API Connected' : 'Setup API'}</span>
        </button>

        {/* Global Multi-Language Selector */}
        <LanguageSelector compact />

        {/* User Profile & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="flex items-center gap-2">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full border border-purple-500/40 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[100px]">{currentUser.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/40">18+</span>
                </div>
                {currentUser.location && (
                  <div className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate max-w-[120px]">
                    <MapPin className="w-2.5 h-2.5 text-purple-400" />
                    <span>{currentUser.location.split(' ')[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title={t('auth.logout', 'Log Out')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
