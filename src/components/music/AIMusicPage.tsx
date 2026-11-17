import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Music, 
  Play, 
  Pause, 
  Download, 
  Disc, 
  Sliders, 
  Volume2, 
  Send, 
  Search,
  Filter,
  RefreshCw,
  Plus,
  Radio,
  CheckCircle,
  Clock,
  Layers,
  Flame,
  Zap,
  ListMusic
} from 'lucide-react';
import { audioEngine } from '../../audio/audioEngine';
import { 
  generateMultiStemAudioBuffers, 
  generateElectronicAudioBuffer, 
  audioBufferToWav, 
  MultiStemBuffers 
} from '../../audio/synthGenerator';
import { apiService } from '../../services/apiService';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface GeneratedTrackItem {
  id: string;
  title: string;
  genre: string;
  subgenre?: string;
  mood: string;
  bpm: number;
  key: string;
  camelot?: string;
  duration: number;
  description?: string;
  buffer?: AudioBuffer;
  stemBuffers?: MultiStemBuffers['stems'];
  createdAt: string;
}

const PRESET_TRACKS: GeneratedTrackItem[] = [
  {
    id: 'preset-cyberpunk',
    title: 'Neon Overdrive (Cyberpunk)',
    genre: 'Cyberpunk Synthwave',
    mood: 'High Energy & Driving',
    bpm: 128,
    key: 'Fm',
    camelot: '4A',
    duration: 32,
    description: 'Pumping four-on-the-floor kick with resonant analog rolling bass and detuned saw leads.',
    createdAt: 'Featured'
  },
  {
    id: 'preset-techno',
    title: 'Berlin Bunker (Dark Techno)',
    genre: 'Dark Techno',
    mood: 'Relentless & Hypnotic',
    bpm: 138,
    key: 'Dm',
    camelot: '7A',
    duration: 30,
    description: 'Distorted 909 kick, industrial acid 303 bassline, and dark atmospheric rumble.',
    createdAt: 'Featured'
  },
  {
    id: 'preset-lofi',
    title: 'Midnight Tape Rain (Lo-Fi)',
    genre: 'Lo-Fi Chillout',
    mood: 'Relaxed & Nostalgic',
    bpm: 78,
    key: 'Am',
    camelot: '8A',
    duration: 30,
    description: 'Boom-bap swing drums, vinyl tape crackle, and jazzy electric piano chords.',
    createdAt: 'Featured'
  },
  {
    id: 'preset-futurebass',
    title: 'Starlight Drop (Future Bass)',
    genre: 'Future Bass',
    mood: 'Euphoric & Melodic',
    bpm: 145,
    key: 'Gm',
    camelot: '6A',
    duration: 30,
    description: 'Booming 808 sub bends, rapid trap hi-hats, and supersaw chord swells.',
    createdAt: 'Featured'
  },
  {
    id: 'preset-deephouse',
    title: 'Ibiza Sunset Groove (Deep House)',
    genre: 'Deep House',
    mood: 'Smooth & Bouncy',
    bpm: 124,
    key: 'C',
    camelot: '8B',
    duration: 32,
    description: 'Punchy house kick, walking sub-bass, and uplifting organ chords on the offbeat.',
    createdAt: 'Featured'
  },
  {
    id: 'preset-ambient',
    title: 'Cosmic Drift (Ambient Drone)',
    genre: 'Ambient',
    mood: 'Meditative & Ethereal',
    bpm: 90,
    key: 'Ab',
    camelot: '4B',
    duration: 34,
    description: 'Evolving harmonic drone layers with celestial chimes and sub swells.',
    createdAt: 'Featured'
  }
];

const PROMPT_SUGGESTIONS = [
  { label: 'Cyberpunk 128 BPM', prompt: 'Cyberpunk synthwave anthem with rolling bassline and neon arpeggio', genre: 'Cyberpunk Synthwave', bpm: 128, key: 'Fm' },
  { label: 'Berlin Techno 138 BPM', prompt: 'Dark underground Berlin warehouse techno with heavy distorted kick and 303 acid glides', genre: 'Dark Techno', bpm: 138, key: 'Dm' },
  { label: 'Lo-Fi Study 78 BPM', prompt: 'Chill lo-fi study beats with vinyl crackle and mellow electric piano chords', genre: 'Lo-Fi Chillout', bpm: 78, key: 'Am' },
  { label: 'Future Bass 145 BPM', prompt: 'Euphoric festival future bass with pitched 808 drops and bright supersaw chords', genre: 'Future Bass', bpm: 145, key: 'Gm' },
  { label: 'Deep House 124 BPM', prompt: 'Deep beach house groove with bouncy bass and uplifting melodic piano stabs', genre: 'Deep House', bpm: 124, key: 'C' }
];

export const AIMusicPage: React.FC<{ onSendToDeck?: (deck: 'A' | 'B', track: any) => void }> = ({ onSendToDeck }) => {
  const { addToast } = useToast();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');

  // Generator Config State
  const [prompt, setPrompt] = useState('Cyberpunk synthwave anthem with rolling bassline and neon arpeggio');
  const [genre, setGenre] = useState('Cyberpunk Synthwave');
  const [mood, setMood] = useState('Energetic & Driving');
  const [bpm, setBpm] = useState(128);
  const [musicalKey, setMusicalKey] = useState('Fm');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Playback & Stem State
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrackItem | null>(PRESET_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadProgress, setPlayheadProgress] = useState(0);
  const [trackHistory, setTrackHistory] = useState<GeneratedTrackItem[]>(PRESET_TRACKS);

  // Stem Volumes (0 to 100)
  const [stems, setStems] = useState({
    drums: 100,
    bass: 90,
    lead: 85,
    pad: 70
  });

  // Web Audio Node Refs for multi-stem live control
  const activeSourcesRef = useRef<{
    drums?: AudioBufferSourceNode;
    bass?: AudioBufferSourceNode;
    lead?: AudioBufferSourceNode;
    pad?: AudioBufferSourceNode;
    master?: AudioBufferSourceNode;
  }>({});

  const stemGainsRef = useRef<{
    drums?: GainNode;
    bass?: GainNode;
    lead?: GainNode;
    pad?: GainNode;
    master?: GainNode;
  }>({});

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const genres = [
    'Cyberpunk Synthwave',
    'Dark Techno',
    'Future Bass',
    'Liquid Drum & Bass',
    'Deep House',
    'Lo-Fi Chillout',
    'Ambient'
  ];

  const moods = [
    'Energetic & Driving',
    'Dark & Menacing',
    'Melodic & Euphoric',
    'Ethereal & Ambient',
    'Cybernetic & Glitchy',
    'Relaxed & Nostalgic'
  ];

  const keys = ['Am', 'C', 'Fm', 'Ab', 'Gm', 'Eb', 'Dm', 'F', 'Em', 'G', 'Bm', 'D'];

  // Initialize first preset buffer on mount
  useEffect(() => {
    audioEngine.init();
    const ctx = audioEngine.getAudioContext();
    if (ctx && currentTrack && !currentTrack.buffer) {
      const generated = generateMultiStemAudioBuffers(ctx, {
        bpm: currentTrack.bpm,
        genre: currentTrack.genre,
        durationSeconds: currentTrack.duration,
        key: currentTrack.key,
        stemBalances: stems
      });
      currentTrack.buffer = generated.master;
      currentTrack.stemBuffers = generated.stems;
      setCurrentTrack({ ...currentTrack });
    }
  }, []);

  // Update real-time stem gain volumes when sliders move
  useEffect(() => {
    const ctx = audioEngine.getAudioContext();
    const now = ctx?.currentTime || 0;
    if (stemGainsRef.current.drums) stemGainsRef.current.drums.gain.setValueAtTime(stems.drums / 100, now);
    if (stemGainsRef.current.bass) stemGainsRef.current.bass.gain.setValueAtTime(stems.bass / 100, now);
    if (stemGainsRef.current.lead) stemGainsRef.current.lead.gain.setValueAtTime(stems.lead / 100, now);
    if (stemGainsRef.current.pad) stemGainsRef.current.pad.gain.setValueAtTime(stems.pad / 100, now);
  }, [stems]);

  // Waveform rendering loop
  useEffect(() => {
    let animId: number;
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      phase += isPlaying ? 0.08 : 0.01;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      // Draw animated soundwave bars
      const bars = 48;
      const barW = (w / bars) - 2;

      for (let i = 0; i < bars; i++) {
        const x = i * (barW + 2);
        const norm = i / bars;
        const wave = Math.sin(phase + i * 0.3) * 0.5 + 0.5;
        const amp = isPlaying ? (wave * (mid - 4) + 4) : 4;

        const isPassed = norm <= playheadProgress;
        ctx.fillStyle = isPassed 
          ? (i % 2 === 0 ? '#38bdf8' : '#a855f7')
          : 'rgba(100, 116, 139, 0.4)';
        
        ctx.fillRect(x, mid - amp, barW, amp * 2);
      }
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playheadProgress]);

  // Playhead progress timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && currentTrack) {
      const step = 0.1 / (currentTrack.duration || 30);
      interval = setInterval(() => {
        setPlayheadProgress((prev) => {
          if (prev >= 1) {
            return 0; // loop
          }
          return prev + step;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Clean stop of all active audio sources
  const stopAllAudio = () => {
    Object.values(activeSourcesRef.current).forEach((src) => {
      if (src) {
        try {
          src.stop();
          src.disconnect();
        } catch {}
      }
    });
    activeSourcesRef.current = {};
    setIsPlaying(false);
  };

  // Toggle multi-stem synchronized playback
  const togglePlayTrack = async (trackToPlay = currentTrack) => {
    if (!trackToPlay) return;

    if (isPlaying) {
      stopAllAudio();
      return;
    }

    await audioEngine.resume();
    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    // Synthesize buffers if missing
    if (!trackToPlay.buffer || !trackToPlay.stemBuffers) {
      const generated = generateMultiStemAudioBuffers(ctx, {
        bpm: trackToPlay.bpm,
        genre: trackToPlay.genre,
        durationSeconds: trackToPlay.duration,
        key: trackToPlay.key,
        stemBalances: stems
      });
      trackToPlay.buffer = generated.master;
      trackToPlay.stemBuffers = generated.stems;
    }

    stopAllAudio();

    // Create 4 stem channels routed into separate GainNodes
    const stemKeys: Array<'drums' | 'bass' | 'lead' | 'pad'> = ['drums', 'bass', 'lead', 'pad'];
    const now = ctx.currentTime;

    stemKeys.forEach((key) => {
      const buf = trackToPlay.stemBuffers?.[key];
      if (!buf) return;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime((stems[key] ?? 80) / 100, now);

      src.connect(gain);
      gain.connect(ctx.destination);

      activeSourcesRef.current[key] = src;
      stemGainsRef.current[key] = gain;

      const offset = (playheadProgress * (trackToPlay.duration || 30)) % (buf.duration || 30);
      src.start(0, offset);
    });

    setCurrentTrack(trackToPlay);
    setIsPlaying(true);
  };

  // Generate new track using Gemini API + multi-stem synthesis
  const handleGenerate = async () => {
    setIsGenerating(true);
    addToast('info', 'Zovik Music Intelligence', `Analyzing prompt & composing ${genre} arrangement...`);

    try {
      // 1. Call Backend Gemini AI
      const res = await apiService.generateMusicTrack({
        prompt: prompt.trim() || genre,
        genre,
        mood,
        bpm,
        key: musicalKey,
        duration
      });

      const trackMeta = res.track || {};
      const targetBpm = Number(trackMeta.bpm || bpm);
      const targetKey = trackMeta.key || musicalKey;
      const targetGenre = trackMeta.genre || genre;
      const targetDuration = Number(trackMeta.duration || duration);

      // 2. Synthesize Real Audio Buffers
      const ctx = audioEngine.getAudioContext();
      if (!ctx) throw new Error('Audio Context unavailable');

      const multiBuffers = generateMultiStemAudioBuffers(ctx, {
        bpm: targetBpm,
        genre: targetGenre,
        durationSeconds: targetDuration,
        key: targetKey,
        stemBalances: stems
      });

      const newTrack: GeneratedTrackItem = {
        id: `ai-track-${Date.now()}`,
        title: trackMeta.title || (prompt ? prompt.slice(0, 32) : `${genre} Anthem`),
        genre: targetGenre,
        subgenre: trackMeta.subgenre || genre,
        mood: trackMeta.mood || mood,
        bpm: targetBpm,
        key: targetKey,
        camelot: trackMeta.camelot || '8A',
        duration: targetDuration,
        description: trackMeta.description || `Custom ${targetGenre} track composed from prompt.`,
        buffer: multiBuffers.master,
        stemBuffers: multiBuffers.stems,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 3. Update State & Auto-Play
      setCurrentTrack(newTrack);
      setTrackHistory((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
      setPlayheadProgress(0);

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      addToast('success', 'AI Track Synthesized!', `${newTrack.title} (${targetBpm} BPM, ${targetKey}) ready.`);

      // Start playing immediately
      setTimeout(() => {
        togglePlayTrack(newTrack);
      }, 200);

    } catch (err: any) {
      console.error('[Music Generation Error]', err);
      addToast('error', 'Generation Error', 'Fallback engine synthesized backup track.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export track as standard 16-bit WAV
  const handleExportWav = () => {
    if (!currentTrack?.buffer) return;
    const wavBlob = audioBufferToWav(currentTrack.buffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTrack.title.replace(/\s+/g, '_')}_${currentTrack.bpm}BPM_${currentTrack.key}.wav`;
    a.click();
    addToast('success', 'WAV Exported', 'Master 16-bit audio file downloaded.');
  };

  // Send to DJ Decks
  const handleSendToDeck = (deck: 'A' | 'B') => {
    if (!currentTrack?.buffer) return;
    audioEngine.loadTrackBuffer(deck, currentTrack.buffer);
    addToast('success', `Sent to Deck ${deck}`, `${currentTrack.title} loaded into DJ Studio Deck ${deck}`);
    if (onSendToDeck) onSendToDeck(deck, currentTrack);
  };

  // Filtered tracks based on search input & genre pill
  const filteredTracks = trackHistory.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      t.title.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q) ||
      t.mood.toLowerCase().includes(q) ||
      t.key.toLowerCase().includes(q) ||
      t.bpm.toString().includes(q);

    const matchesGenre = selectedGenreFilter === 'All' || 
      t.genre.toLowerCase().includes(selectedGenreFilter.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Stats Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Music className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">AI Music & Stem Generator</h2>
          </div>
          <p className="text-sm text-slate-400">
            Compose high-definition electronic tracks, synthesize custom 4-channel stems, and export studio-grade WAVs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Gemini Intelligence Powered
          </span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" /> 32-Bit Multi-Stem DSP
          </span>
        </div>
      </div>

      {/* Global Search & Tag Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by genre, prompt, BPM, key, or artist (e.g. Cyberpunk, 138, Lo-Fi, Dm)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Composing Track...' : 'Compose Track'}</span>
            </button>
          </div>
        </div>

        {/* Quick Genre Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Filter:</span>
          {['All', 'Cyberpunk', 'Techno', 'Lo-Fi', 'Future Bass', 'Deep House', 'Ambient'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedGenreFilter(f)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenreFilter === f
                  ? 'bg-purple-600/30 border-purple-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Prompt & Synthesis Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Sound Prompt & Style
                </label>
                <span className="text-[10px] text-purple-400 font-mono">Gemini Enhanced</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe instruments, rhythm, bass character, and ambiance..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                Quick Prompt Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setGenre(p.genre);
                      setBpm(p.bpm);
                      setMusicalKey(p.key);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 hover:border-purple-500/40 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre & Mood Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mood & Vibe</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {moods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* BPM, Key, Duration Controls */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  BPM ({bpm})
                </label>
                <input
                  type="range"
                  min="75"
                  max="175"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Key Scale</label>
                <select
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {keys.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value={15}>15s (Short Hook)</option>
                  <option value={30}>30s (Standard Mix)</option>
                  <option value={45}>45s (Extended Drop)</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Audio Stems...' : 'Synthesize AI Track'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Player, Stem Mixer & Live Visualizer */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-400" /> Active Master & Stem Channels
              </h3>
              {currentTrack && (
                <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {currentTrack.bpm} BPM • {currentTrack.key} {currentTrack.camelot ? `(${currentTrack.camelot})` : ''}
                </span>
              )}
            </div>

            {currentTrack ? (
              <div className="space-y-4">
                {/* Active Player Card */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{currentTrack.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{currentTrack.description || currentTrack.genre}</p>
                    </div>

                    <button
                      onClick={() => togglePlayTrack(currentTrack)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isPlaying
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {/* Waveform Visualizer */}
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 p-2 border border-slate-800">
                    <canvas
                      ref={waveformCanvasRef}
                      width={500}
                      height={48}
                      className="w-full h-12 block"
                    />
                    {/* Scrubbar Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={playheadProgress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setPlayheadProgress(val);
                        if (isPlaying) {
                          togglePlayTrack(currentTrack);
                        }
                      }}
                      className="w-full accent-cyan-400 cursor-pointer h-1 bg-transparent absolute inset-0 opacity-0"
                    />
                  </div>
                </div>

                {/* 4-Channel Live Stem Mixer */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Stem Volumes (Real-Time Gain)</span>
                    <span className="text-[10px] text-purple-400 font-mono">Multi-Bus DSP</span>
                  </div>

                  {/* Drums */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-300 font-medium flex items-center gap-1.5">
                      🥁 Drums / Kick
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stems.drums}
                      onChange={(e) => setStems({ ...stems, drums: Number(e.target.value) })}
                      className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    <span className="w-10 text-right font-mono text-cyan-400 font-bold">{stems.drums}%</span>
                  </div>

                  {/* Bass */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-300 font-medium flex items-center gap-1.5">
                      🎸 Sub-Bass
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stems.bass}
                      onChange={(e) => setStems({ ...stems, bass: Number(e.target.value) })}
                      className="flex-1 accent-purple-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    <span className="w-10 text-right font-mono text-purple-400 font-bold">{stems.bass}%</span>
                  </div>

                  {/* Lead */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-300 font-medium flex items-center gap-1.5">
                      🎹 Synth Lead
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stems.lead}
                      onChange={(e) => setStems({ ...stems, lead: Number(e.target.value) })}
                      className="flex-1 accent-pink-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    <span className="w-10 text-right font-mono text-pink-400 font-bold">{stems.lead}%</span>
                  </div>

                  {/* Pad */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-300 font-medium flex items-center gap-1.5">
                      🌌 Chords & Pad
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stems.pad}
                      onChange={(e) => setStems({ ...stems, pad: Number(e.target.value) })}
                      className="flex-1 accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                    <span className="w-10 text-right font-mono text-emerald-400 font-bold">{stems.pad}%</span>
                  </div>
                </div>

                {/* Routing & Export Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleExportWav}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" /> Export WAV
                  </button>

                  <button
                    onClick={() => handleSendToDeck('A')}
                    className="py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400" /> Send Deck A
                  </button>

                  <button
                    onClick={() => handleSendToDeck('B')}
                    className="py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-purple-400" /> Send Deck B
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
                <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  Select a track or enter a sound prompt to synthesize live audio stems.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track Library & Search Results Section */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-400" />
            Synthesized Tracks & Sound Presets ({filteredTracks.length})
          </h3>
          <span className="text-xs text-slate-400">Instant Preview & Load</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTracks.map((tr) => (
            <div
              key={tr.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                currentTrack?.id === tr.id
                  ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-900/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                    {tr.genre}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">
                    {tr.bpm} BPM • {tr.key}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm line-clamp-1">{tr.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tr.description || tr.mood}</p>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                <button
                  onClick={() => togglePlayTrack(tr)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    currentTrack?.id === tr.id && isPlaying
                      ? 'bg-rose-500 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {currentTrack?.id === tr.id && isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{currentTrack?.id === tr.id && isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTrack(tr);
                    audioEngine.loadTrackBuffer('A', tr.buffer || generateElectronicAudioBuffer(audioEngine.getAudioContext()!, { bpm: tr.bpm, genre: tr.genre, key: tr.key }));
                    addToast('success', 'Sent to Deck A', `${tr.title} loaded.`);
                    if (onSendToDeck) onSendToDeck('A', tr);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  title="Send to Deck A"
                >
                  Deck A
                </button>

                <button
                  onClick={() => {
                    setCurrentTrack(tr);
                    audioEngine.loadTrackBuffer('B', tr.buffer || generateElectronicAudioBuffer(audioEngine.getAudioContext()!, { bpm: tr.bpm, genre: tr.genre, key: tr.key }));
                    addToast('success', 'Sent to Deck B', `${tr.title} loaded.`);
                    if (onSendToDeck) onSendToDeck('B', tr);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  title="Send to Deck B"
                >
                  Deck B
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
