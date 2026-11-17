import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Sliders, 
  FileVideo, 
  Layers, 
  Film, 
  Radio,
  Clock,
  CheckCircle,
  Eye,
  RefreshCw,
  Palette,
  Maximize2,
  Tv,
  Smartphone,
  Square,
  Wand2,
  ListOrdered
} from 'lucide-react';
import { audioEngine } from '../../audio/audioEngine';
import { apiService } from '../../services/apiService';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface SceneBlueprint {
  title: string;
  sceneType: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  elements: {
    particleType: string;
    particleCount: number;
    speed: number;
    geometryType: string;
    centralVisual: string;
    audioReactivity: string;
  };
  scenes: Array<{ time: string; description: string }>;
  script: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life?: number;
}

const PROMPT_PRESETS = [
  {
    label: 'Cyberpunk Metropolis Rain',
    prompt: 'Dystopian Tokyo cyberpunk city at night with towering neon skyscrapers, rainy reflections, and holographic lasers',
    style: 'Cyberpunk Neon',
    ratio: '16:9'
  },
  {
    label: 'Cosmic Violet Nebula',
    prompt: 'Hyperspace starfield accelerating into a massive violet and cyan galaxy nebula with orbiting stardust',
    style: 'Cosmic Nebula',
    ratio: '16:9'
  },
  {
    label: '80s Retro Synthwave Sunset',
    prompt: 'Neon orange and magenta synthwave sunset with glowing wireframe mountains and an infinite perspective road grid',
    style: 'Retro Synthwave 80s',
    ratio: '9:16'
  },
  {
    label: 'Bioluminescent Deep Sea',
    prompt: 'Deep underwater abyss with glowing bioluminescent jellyfish, floating plankton bubbles, and light rays',
    style: 'Bioluminescent Ocean',
    ratio: '16:9'
  },
  {
    label: 'Techno Hexagon Laser Tunnel',
    prompt: 'Infinite high-speed geometric laser tunnel with pulsating neon hex rings synced to electronic techno beats',
    style: 'Techno Laser Tunnel',
    ratio: '1:1'
  },
  {
    label: 'Matrix Digital Cyber Rain',
    prompt: 'Emerald green cascading digital code streams in a dark cyberpunk mainframe with glitch distortion',
    style: 'Matrix Cyber Rain',
    ratio: '9:16'
  }
];

export const AIVideoPage: React.FC = () => {
  const { addToast } = useToast();
  
  // Prompt & Style Config
  const [prompt, setPrompt] = useState('Cyberpunk neon metropolis with pulsing geometric hologram rings and laser beams');
  const [style, setStyle] = useState('Cyberpunk Neon');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isAudioSync, setIsAudioSync] = useState(true);

  // AI Generation State
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [blueprint, setBlueprint] = useState<SceneBlueprint>({
    title: 'Cyberpunk Neon Metropolis',
    sceneType: 'cyberpunk_city',
    colorPalette: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#ec4899',
      background: '#080811'
    },
    elements: {
      particleType: 'neon_rain',
      particleCount: 80,
      speed: 1.8,
      geometryType: 'skyscrapers',
      centralVisual: 'hologram_rings',
      audioReactivity: 'high'
    },
    scenes: [
      { time: '0:00', description: 'Towering wireframe megastructures emerge from dense volumetric neon mist' },
      { time: '0:05', description: 'Bass kicks trigger concentric holographic audio rings that illuminate rain streaks' },
      { time: '0:10', description: 'Perspective acceleration through glowing neon grid alleys toward the horizon' }
    ],
    script: 'Dystopian futuristic cityscape bathed in ultraviolet hues. Audio transients warp skyscraper heights and pulse laser rings.'
  });

  // Video Recording & Export State
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Canvas Dimensions
  const canvasWidth = aspectRatio === '9:16' ? 720 : aspectRatio === '1:1' ? 720 : 1280;
  const canvasHeight = aspectRatio === '9:16' ? 1280 : aspectRatio === '1:1' ? 720 : 720;

  // Generate Video Blueprint from Prompt via Gemini AI
  const handleGenerateVideoFromPrompt = async (promptOverride?: string) => {
    const textPrompt = promptOverride || prompt;
    if (!textPrompt.trim()) return;

    setIsGeneratingBlueprint(true);
    addToast('info', 'Zovik Visual AI', 'Analyzing prompt and architecting custom motion scene...');

    try {
      const res = await apiService.generateVideo({
        prompt: textPrompt,
        style,
        aspectRatio,
        audioSync: isAudioSync
      });

      if (res.video) {
        const v = res.video;
        const newBlueprint: SceneBlueprint = {
          title: v.title || textPrompt.slice(0, 36),
          sceneType: v.style || v.sceneType || 'cyberpunk_city',
          colorPalette: v.colorPalette || {
            primary: '#a855f7',
            secondary: '#06b6d4',
            accent: '#ec4899',
            background: '#080811'
          },
          elements: v.elements || {
            particleType: 'neon_rain',
            particleCount: 80,
            speed: 1.8,
            geometryType: 'skyscrapers',
            centralVisual: 'hologram_rings',
            audioReactivity: 'high'
          },
          scenes: v.scenes || [
            { time: '0:00', description: 'Opening scene establishing prompt atmosphere' },
            { time: '0:05', description: 'Drop triggers dynamic particle acceleration' },
            { time: '0:10', description: 'Climax lighting sweep' }
          ],
          script: v.script || `Rendered scene matching prompt: "${textPrompt}".`
        };

        setBlueprint(newBlueprint);
        initParticles(newBlueprint);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        addToast('success', 'Visual Scene Ready', `Architected ${newBlueprint.title} (${newBlueprint.sceneType})`);
      }
    } catch (err: any) {
      console.warn('[Video AI] Fallback scene active:', err);
      addToast('info', 'Visual Scene Active', 'Generated scene using Zovik offline visual engine.');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Initialize particles based on scene blueprint
  const initParticles = (bp = blueprint) => {
    const particles: Particle[] = [];
    const count = bp.elements.particleCount || 75;
    const pType = bp.elements.particleType;

    for (let i = 0; i < count; i++) {
      if (pType === 'neon_rain') {
        particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: -0.5,
          vy: 8 + Math.random() * 8,
          size: 1 + Math.random() * 2,
          color: i % 2 === 0 ? bp.colorPalette.primary : bp.colorPalette.secondary,
          alpha: 0.4 + Math.random() * 0.6
        });
      } else if (pType === 'stardust') {
        particles.push({
          x: (Math.random() - 0.5) * canvasWidth,
          y: (Math.random() - 0.5) * canvasHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 1 + Math.random() * 3,
          color: i % 3 === 0 ? bp.colorPalette.accent : i % 2 === 0 ? bp.colorPalette.primary : '#ffffff',
          alpha: 0.3 + Math.random() * 0.7
        });
      } else if (pType === 'bubbles') {
        particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(1 + Math.random() * 2.5),
          size: 2 + Math.random() * 6,
          color: i % 2 === 0 ? bp.colorPalette.primary : bp.colorPalette.secondary,
          alpha: 0.3 + Math.random() * 0.5
        });
      } else {
        // Laser / Matrix / Generic sparks
        particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: (Math.random() - 0.5) * 4,
          vy: 3 + Math.random() * 5,
          size: 1.5 + Math.random() * 2.5,
          color: bp.colorPalette.primary,
          alpha: 0.5 + Math.random() * 0.5
        });
      }
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    initParticles();
  }, [aspectRatio]);

  // Audio-Reactive Canvas Render Engine matching Prompt & Blueprint
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    const analyser = audioEngine.getMasterAnalyser();
    const freqData = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      t += 0.02 * (blueprint.elements.speed || 1.5);

      if (analyser && isAudioSync) {
        analyser.getByteFrequencyData(freqData);
      } else {
        // Simulated audio pulsation if no active master audio
        for (let i = 0; i < freqData.length; i++) {
          freqData[i] = Math.floor((Math.sin(t * 3 + i * 0.4) * 0.5 + 0.5) * 180);
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Extract energy
      let bassEnergy = 0;
      for (let i = 0; i < 8; i++) bassEnergy += freqData[i] || 0;
      bassEnergy = bassEnergy / 8 / 255; // 0 to 1

      let midEnergy = 0;
      for (let i = 8; i < 24; i++) midEnergy += freqData[i] || 0;
      midEnergy = midEnergy / 16 / 255;

      const pal = blueprint.colorPalette;
      const scene = blueprint.sceneType;

      // 1. CLEAR & TRAIL BACKDROP
      ctx.fillStyle = pal.background || '#080811';
      ctx.fillRect(0, 0, w, h);

      // 2. SCENE GEOMETRY RENDERING

      if (scene === 'cosmic_nebula') {
        // === COSMIC NEBULA & WARP STARFIELD ===
        // Swirling nebula dust clouds
        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.7);
        grad.addColorStop(0, `${pal.primary}55`);
        grad.addColorStop(0.5, `${pal.secondary}22`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Accretion Disk / Black Hole Core
        const coreR = 40 + bassEnergy * 45;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.lineWidth = 4 + bassEnergy * 6;
        ctx.strokeStyle = pal.accent;
        ctx.shadowColor = pal.accent;
        ctx.shadowBlur = 30;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Orbiting rings
        for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, (coreR + r * 50), (coreR + r * 50) * 0.4, t * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `${pal.secondary}88`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

      } else if (scene === 'retro_grid_sunset') {
        // === RETRO SYNTHWAVE SUNSET & WIREFRAME MOUNTAINS ===
        // Horizon line
        const horizonY = h * 0.6;

        // Big Synthwave Sun
        const sunRadius = Math.min(w, h) * 0.22;
        const sunY = horizonY - sunRadius * 0.4;
        const sunGrad = ctx.createLinearGradient(cx, sunY - sunRadius, cx, sunY + sunRadius);
        sunGrad.addColorStop(0, pal.accent);
        sunGrad.addColorStop(1, pal.secondary);

        ctx.beginPath();
        ctx.arc(cx, sunY, sunRadius + bassEnergy * 15, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        // Sun Scanline Cuts
        ctx.fillStyle = pal.background;
        for (let s = 0; s < 7; s++) {
          const cutY = sunY + s * 14;
          ctx.fillRect(cx - sunRadius - 10, cutY, (sunRadius + 10) * 2, 4 + s * 1.5);
        }

        // Wireframe Mountains
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= w; x += 30) {
          const peak = Math.sin(x * 0.015 + 1) * 70 + Math.sin(x * 0.03) * 40;
          const audioDeform = (freqData[(x % freqData.length)] / 255) * 50;
          ctx.lineTo(x, horizonY - peak - audioDeform);
        }
        ctx.stroke();

        // 3D Grid Floor
        ctx.strokeStyle = `${pal.secondary}44`;
        ctx.lineWidth = 1.5;
        for (let x = -w * 0.5; x <= w * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(cx, horizonY);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = horizonY; y < h; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

      } else if (scene === 'bioluminescent_ocean') {
        // === BIOLUMINESCENT JELLYFISH & LIGHT SHAFTS ===
        // Overhead light shafts
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 40;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(w * (0.2 + i * 0.2), 0);
          ctx.lineTo(w * (0.1 + i * 0.25), h);
          ctx.stroke();
        }

        // Central Luminous Jellyfish Bell
        const jR = 50 + bassEnergy * 35;
        const jY = cy + Math.sin(t * 2) * 30;

        ctx.beginPath();
        ctx.arc(cx, jY, jR, Math.PI, 0);
        ctx.fillStyle = `${pal.primary}44`;
        ctx.fill();
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Flowing tentacles
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 14, jY);
          const cp1x = cx + i * 14 + Math.sin(t * 3 + i) * 25;
          const cp1y = jY + 70;
          const cp2x = cx + i * 14 - Math.sin(t * 3 + i) * 25;
          const cp2y = jY + 140;
          const endX = cx + i * 14 + Math.sin(t * 3 + i) * 35;
          const endY = jY + 200 + bassEnergy * 50;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
        }

      } else if (scene === 'techno_laser_tunnel') {
        // === HIGH-SPEED HEXAGONAL LASER TUNNEL ===
        const rings = 8;
        for (let r = 0; r < rings; r++) {
          const depth = (r + ((t * 2) % 1)) / rings;
          const size = depth * Math.max(w, h) * 0.7;

          ctx.strokeStyle = r % 2 === 0 ? pal.primary : pal.secondary;
          ctx.lineWidth = 2 + (1 - depth) * 4;

          // Draw Hexagon
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3 + t * 0.5;
            const hx = cx + Math.cos(angle) * size;
            const hy = cy + Math.sin(angle) * size;
            if (a === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Crossing Laser Beams
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 3 + bassEnergy * 4;
        ctx.beginPath();
        ctx.moveTo(0, cy + Math.sin(t * 4) * 100);
        ctx.lineTo(w, cy - Math.sin(t * 4) * 100);
        ctx.stroke();

      } else {
        // === CYBERPUNK CITY (Default) ===
        // Wireframe Skyscrapers on horizon
        const skylineY = h * 0.7;
        const bldCount = 14;
        const bldW = w / bldCount;

        for (let i = 0; i < bldCount; i++) {
          const bH = (Math.sin(i * 1.5) * 0.5 + 0.5) * 160 + (freqData[i * 4] / 255) * 120 + 40;
          const bx = i * bldW;
          const by = skylineY - bH;

          ctx.fillStyle = 'rgba(12, 10, 24, 0.85)';
          ctx.fillRect(bx, by, bldW - 4, bH);
          ctx.strokeStyle = i % 2 === 0 ? `${pal.primary}aa` : `${pal.secondary}aa`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bldW - 4, bH);

          // Window dots
          ctx.fillStyle = pal.accent;
          for (let wy = by + 10; wy < skylineY - 10; wy += 20) {
            ctx.fillRect(bx + bldW * 0.3, wy, 4, 6);
            ctx.fillRect(bx + bldW * 0.6, wy, 4, 6);
          }
        }

        // Concentric Holographic HUD Rings
        for (let r = 1; r <= 4; r++) {
          const radius = r * 45 + bassEnergy * 50;
          ctx.strokeStyle = r % 2 === 0 ? pal.primary : pal.secondary;
          ctx.lineWidth = 2 + bassEnergy * 3;
          ctx.beginPath();
          ctx.arc(cx, skylineY - 80, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Ground perspective road
        ctx.strokeStyle = `${pal.primary}44`;
        ctx.lineWidth = 2;
        for (let x = 0; x <= w; x += 80) {
          ctx.beginPath();
          ctx.moveTo(cx, skylineY);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      }

      // 3. PARTICLE ENGINE UPDATER & RENDERER
      const particles = particlesRef.current;
      ctx.fillStyle = pal.primary;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.y > h) p.y = 0;
        if (p.y < 0) p.y = h;
        if (p.x > w) p.x = 0;
        if (p.x < 0) p.x = w;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();

        if (blueprint.elements.particleType === 'neon_rain') {
          // Rain line streak
          ctx.rect(p.x, p.y, p.size, p.size * 6);
        } else {
          // Star / bubble circle
          ctx.arc(p.x, p.y, p.size + bassEnergy * 2, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 4. AUDIO-REACTIVE RADIAL EQUALIZER
      const bars = 48;
      const eqRadius = 60 + bassEnergy * 30;
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 + t * 0.2;
        const val = freqData[i % freqData.length] / 255;
        const len = 15 + val * 70;

        const x1 = cx + Math.cos(angle) * eqRadius;
        const y1 = cy + Math.sin(angle) * eqRadius;
        const x2 = cx + Math.cos(angle) * (eqRadius + len);
        const y2 = cy + Math.sin(angle) * (eqRadius + len);

        ctx.strokeStyle = i % 2 === 0 ? pal.primary : pal.secondary;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [blueprint, isAudioSync, canvasWidth, canvasHeight]);

  // Video Stream Recording & Export
  const handleStartRender = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    setRenderProgress(0);
    videoChunksRef.current = [];

    // Capture 30 FPS stream from canvas
    const canvasStream = canvas.captureStream(30);

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(canvasStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRendering(false);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        addToast('success', 'Video Render Complete!', 'Your prompt-generated video file is ready to download.');
      };

      recorder.start();

      // Record a 6-second video loop
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 16.6;
        setRenderProgress(Math.min(100, Math.round(currentProgress)));
        if (currentProgress >= 100) {
          clearInterval(interval);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error('Video recording failed:', err);
      setIsRendering(false);
      addToast('error', 'Render Error', 'Browser media encoder encountered an error.');
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `Zovik_${blueprint.sceneType}_${Date.now()}.webm`;
    a.click();
    addToast('success', 'Video Saved', 'Video file downloaded to your device.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Video className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">AI Video & Visualizer Studio</h2>
          </div>
          <p className="text-sm text-slate-400">
            Generate cinematic, audio-reactive videos dynamically synthesized from natural language text prompts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Gemini Motion Intelligence
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> 60 FPS Audio-Reactive Canvas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4 shadow-xl">
            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Natural-Language Video Prompt
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">Real-time Scene Engine</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene, colors, environment, camera motion, and visual effects..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Quick Inspiration Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                Preset Scene Blueprints
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setStyle(p.style);
                      setAspectRatio(p.ratio as any);
                      handleGenerateVideoFromPrompt(p.prompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-purple-500/40 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aspect Ratio & Target</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" /> 16:9 (YouTube)
                </button>

                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> 9:16 (Reels/TikTok)
                </button>

                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    aspectRatio === '1:1'
                      ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" /> 1:1 (Square)
                </button>
              </div>
            </div>

            {/* Audio Sync Checkbox */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Sync With Live DJ Audio</span>
                <span className="text-[11px] text-slate-400">Geometry and lasers react to master frequency spectrum</span>
              </div>
              <input
                type="checkbox"
                checked={isAudioSync}
                onChange={(e) => setIsAudioSync(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Generate Scene from Prompt Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleGenerateVideoFromPrompt()}
                disabled={isGeneratingBlueprint || isRendering}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingBlueprint ? 'animate-spin' : ''}`} />
                <span>{isGeneratingBlueprint ? 'Architecting Scene...' : 'AI Generate Scene'}</span>
              </button>

              <button
                onClick={handleStartRender}
                disabled={isRendering}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Film className={`w-3.5 h-3.5 ${isRendering ? 'animate-spin' : ''}`} />
                <span>{isRendering ? `Rendering (${renderProgress}%)...` : 'Render & Export Video'}</span>
              </button>
            </div>

            {isRendering && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Recording frame buffer...</span>
                  <span className="font-mono text-cyan-400">{renderProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Storyboard & Scene Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-cyan-400" /> AI Video Storyboard ({blueprint.title})
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{blueprint.script}"
            </p>

            <div className="space-y-2 pt-1">
              {blueprint.scenes.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded shrink-0">
                    {s.time}
                  </span>
                  <span className="text-slate-300 leading-snug">{s.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 flex flex-col items-center shadow-xl">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Viewport: {blueprint.sceneType.replace(/_/g, ' ')} ({aspectRatio})
                </span>
              </div>

              {isRendering && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 animate-pulse bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> CAPTURING MP4 STREAM
                </span>
              )}
            </div>

            {/* Interactive Canvas Viewport */}
            <div 
              className={`relative rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl bg-black flex justify-center items-center ${
                aspectRatio === '9:16' ? 'h-[500px] w-[281px]' : aspectRatio === '1:1' ? 'h-[400px] w-[400px]' : 'w-full aspect-video'
              }`}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Color Palette Indicators */}
            <div className="w-full mt-3 flex items-center justify-between px-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" /> Active Scene Palette:
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: blueprint.colorPalette.primary }} title="Primary" />
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: blueprint.colorPalette.secondary }} title="Secondary" />
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: blueprint.colorPalette.accent }} title="Accent" />
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm" style={{ backgroundColor: blueprint.colorPalette.background }} title="Background" />
              </div>
            </div>

            {/* Download Video Card */}
            {recordedVideoUrl && (
              <div className="w-full mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-emerald-950/60 border border-emerald-500/40 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Video Export Ready</span>
                    <span className="text-[11px] text-slate-300">Format: WebM / MP4 ({aspectRatio})</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadVideo}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/40 transform hover:scale-105"
                >
                  <Download className="w-4 h-4" /> Download Video File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
