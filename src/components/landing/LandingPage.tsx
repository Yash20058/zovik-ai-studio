import React, { useRef, useEffect } from 'react';
import { 
  Disc3, 
  Sparkles, 
  Video, 
  Code2, 
  Music, 
  ArrowRight, 
  Play, 
  Radio, 
  Layers, 
  CheckCircle, 
  Sliders,
  Cpu,
  ChevronRight,
  Zap,
  Flame
} from 'lucide-react';
import { NavTab } from '../../types';

interface LandingProps {
  onGetStarted: () => void;
  setActiveTab: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onGetStarted, setActiveTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated background waveform in hero
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      step += 0.02;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw multi-layered sinewaves with gradient
      const waves = [
        { freq: 0.008, amp: 40, speed: 1.2, color: 'rgba(168, 85, 247, 0.4)' },
        { freq: 0.015, amp: 25, speed: 2.0, color: 'rgba(6, 182, 212, 0.35)' },
        { freq: 0.005, amp: 55, speed: 0.8, color: 'rgba(236, 72, 153, 0.25)' },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x += 3) {
          const y = centerY + Math.sin(x * w.freq + step * w.speed) * w.amp;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen bg-[#080811] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto w-full text-center flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background Sine Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={300}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-purple-400" />
            ZOVIK
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Create Music. Generate Videos. <br />
            <span className="text-gradient">Build Anything with AI.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The next-generation creative platform combining dual-deck DJ mashup tools, procedural AI music synthesis, audio-reactive video rendering, and an interactive coding assistant in one breathtaking workspace.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <span>Start Creating Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('dj-studio')}
              className="py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Disc3 className="w-4 h-4 text-purple-400" />
              <span>Explore DJ Studio</span>
            </button>
          </div>

          {/* Quick Features List */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> 32-Bit Web Audio Engine</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-cyan-400" /> Camelot Harmonic Key Match</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-purple-400" /> Real-time Video Render</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-pink-400" /> In-Browser Code Sandbox</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Next-Gen Architecture</span>
          <h2 className="text-3xl font-black text-white">Engineered For Creative Masters</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to produce, mix, visualize, and build cutting-edge audio and media projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: DJ Studio */}
          <div 
            onClick={() => setActiveTab('dj-studio')}
            className="p-6 rounded-2xl glass-card cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Disc3 className="w-6 h-6 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Dual-Deck DJ Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Two virtual turntables with vinyl scratch physics, 3-band EQs, dual-action DJ filters, Camelot harmonic key matching, and live master mix recording.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-bold">
              <span>Launch Decks</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: AI Video Generator */}
          <div 
            onClick={() => setActiveTab('ai-video')}
            className="p-6 rounded-2xl glass-card cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Audio-Reactive Video Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate real downloadable video files synced directly to your DJ audio. Supports 16:9, 9:16 vertical, and 1:1 aspect ratios with cinematic visualizers.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span>Create Visualizer</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Coding Studio */}
          <div 
            onClick={() => setActiveTab('ai-code')}
            className="p-6 rounded-2xl glass-card cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">
                AI Coding Studio & Sandbox
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Code generation, line-by-line explanations, automated bug fixes, and an in-browser live execution runner for Web Audio API and canvas shaders.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-pink-400 font-bold">
              <span>Open Code Sandbox</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-purple-900/20 py-8 px-6 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">zovik</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('settings')} className="hover:text-slate-300 transition-colors">
              API Settings
            </button>
            <button onClick={() => setActiveTab('dj-studio')} className="hover:text-slate-300 transition-colors">
              DJ Workstation
            </button>
            <button onClick={() => setActiveTab('ai-code')} className="hover:text-slate-300 transition-colors">
              Coding Engine
            </button>
          </div>
          <div>© 2026 Zovik Creative Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
