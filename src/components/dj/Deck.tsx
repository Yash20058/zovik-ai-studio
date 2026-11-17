import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Disc, 
  Repeat, 
  Zap, 
  Upload, 
  Music2, 
  VolumeX, 
  Volume2,
  ListMusic
} from 'lucide-react';
import { AudioTrack, DeckState } from '../../types';
import { audioEngine } from '../../audio/audioEngine';
import { generateElectronicAudioBuffer } from '../../audio/synthGenerator';

interface DeckProps {
  deckId: 'A' | 'B';
  state: DeckState;
  onUpdateState: (updates: Partial<DeckState>) => void;
  onSelectTrack: (track: AudioTrack) => void;
  sampleTracks: AudioTrack[];
}

export const Deck: React.FC<DeckProps> = ({
  deckId,
  state,
  onUpdateState,
  onSelectTrack,
  sampleTracks,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDraggingPitch, setIsDraggingPitch] = useState(false);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isDeckA = deckId === 'A';
  const accentColor = isDeckA ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600';
  const ringColor = isDeckA ? 'border-cyan-500/40' : 'border-purple-500/40';
  const glowShadow = isDeckA ? 'shadow-cyan-500/20' : 'shadow-purple-500/20';

  // Vinyl rotation animation during playback
  useEffect(() => {
    let animId: number;
    if (state.isPlaying) {
      const updateRotation = () => {
        setRotationAngle((prev) => (prev + (state.playbackRate * 3)) % 360);
        animId = requestAnimationFrame(updateRotation);
      };
      animId = requestAnimationFrame(updateRotation);
    }
    return () => cancelAnimationFrame(animId);
  }, [state.isPlaying, state.playbackRate]);

  // Track time updater
  useEffect(() => {
    let interval: any;
    if (state.isPlaying) {
      interval = setInterval(() => {
        const current = audioEngine.getCurrentTime(deckId);
        onUpdateState({ currentTime: current });
        if (state.duration > 0 && current >= state.duration) {
          if (state.isLooping) {
            audioEngine.seekTrack(deckId, 0, true);
          } else {
            audioEngine.pauseTrack(deckId);
            onUpdateState({ isPlaying: false, currentTime: 0 });
          }
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [state.isPlaying, state.duration, state.isLooping, deckId]);

  const handlePlayPause = async () => {
    try {
      await audioEngine.resume();
      if (state.isPlaying) {
        const offset = audioEngine.pauseTrack(deckId);
        onUpdateState({ isPlaying: false, currentTime: offset });
      } else {
        audioEngine.playTrack(deckId, state.currentTime);
        onUpdateState({ isPlaying: true });
      }
    } catch (err) {
      console.warn('[Deck Play Error]', err);
    }
  };

  const handleCue = () => {
    audioEngine.pauseTrack(deckId);
    audioEngine.seekTrack(deckId, state.cuePoint, false);
    onUpdateState({ isPlaying: false, currentTime: state.cuePoint });
  };

  const handleSetCue = () => {
    const cur = audioEngine.getCurrentTime(deckId);
    onUpdateState({ cuePoint: cur });
  };

  const handlePitchChange = (newRate: number) => {
    audioEngine.setPlaybackRate(deckId, newRate);
    onUpdateState({ playbackRate: newRate });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);

      const customTrack: AudioTrack = {
        id: `uploaded-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'User Upload',
        duration: audioBuffer.duration,
        bpm: 128, // Default estimated BPM
        key: '8A (Am)',
        url: URL.createObjectURL(file),
        audioBuffer,
        color: isDeckA ? '#06b6d4' : '#a855f7',
        isCustom: true,
      };

      audioEngine.loadTrackBuffer(deckId, audioBuffer);
      onSelectTrack(customTrack);
      onUpdateState({
        duration: audioBuffer.duration,
        currentTime: 0,
        isPlaying: false,
      });
      setShowTrackPicker(false);
    } catch (err) {
      console.error('Failed to decode user audio file:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  const currentBpm = state.track ? Math.round(state.track.bpm * state.playbackRate * 10) / 10 : 128.0;

  return (
    <div className={`p-5 rounded-2xl glass-deck border ${ringColor} ${glowShadow} flex flex-col gap-4 relative select-none`}>
      {/* Deck Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${accentColor} flex items-center justify-center font-black text-white text-base shadow-md`}>
            {deckId}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate max-w-[140px] sm:max-w-[180px]">
                {state.track?.name || 'No Track Loaded'}
              </span>
              {state.track && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {state.track.key}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {state.track?.artist || 'Select or drop an audio track'}
            </p>
          </div>
        </div>

        {/* Load Track & Picker Button */}
        <div className="relative">
          <button
            onClick={() => setShowTrackPicker(!showTrackPicker)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <ListMusic className="w-3.5 h-3.5 text-purple-400" />
            <span>Load Track</span>
          </button>

          {/* Track Picker Dropdown Modal */}
          {showTrackPicker && (
            <div className="absolute right-0 top-10 w-72 bg-slate-900 border border-purple-500/30 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider px-1">
                Select Audio Track
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto mb-3">
                {sampleTracks.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => {
                      onSelectTrack(tr);
                      setShowTrackPicker(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-950/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-medium text-white">{tr.name}</div>
                      <div className="text-[10px] text-slate-400">{tr.artist}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-cyan-400 font-mono font-bold">{tr.bpm} BPM</span>
                      <div className="text-[10px] text-slate-400">{tr.key}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload file button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-2 text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Local MP3 / WAV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Deck Body: Vinyl Jog Wheel & Pitch Control */}
      <div className="flex items-center justify-between gap-4 my-2">
        {/* Virtual Turntable Vinyl */}
        <div className="flex-1 flex justify-center items-center py-2">
          <div
            onClick={handlePlayPause}
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl relative flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform`}
            style={{
              boxShadow: state.isPlaying 
                ? (isDeckA ? '0 0 30px rgba(6, 182, 212, 0.3)' : '0 0 30px rgba(168, 85, 247, 0.3)')
                : '0 10px 25px rgba(0,0,0,0.5)'
            }}
          >
            {/* Vinyl Grooves Texture */}
            <div 
              className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <div className="absolute inset-4 rounded-full border border-slate-800/60" />
              <div className="absolute inset-8 rounded-full border border-slate-800/40" />
              <div className="absolute inset-12 rounded-full border border-slate-800/30" />
              {/* Vinyl Marker Line */}
              <div className={`absolute top-0 left-1/2 -ml-0.5 w-1 h-6 rounded-full ${isDeckA ? 'bg-cyan-400' : 'bg-purple-400'}`} />
            </div>

            {/* Turntable Center Label */}
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${accentColor} flex flex-col items-center justify-center shadow-inner relative z-10 p-2 text-center`}>
              <Disc className="w-5 h-5 text-white animate-spin-slow opacity-80" />
              <span className="text-[10px] font-black text-white tracking-tighter truncate w-full">
                {state.track?.name?.split(' ')[0] || `DECK ${deckId}`}
              </span>
              <span className="text-[9px] font-mono font-bold text-white/90">
                {currentBpm} BPM
              </span>
            </div>
          </div>
        </div>

        {/* Pitch / Tempo Slider */}
        <div className="flex flex-col items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 w-16">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PITCH</span>
          <div className="relative h-36 flex items-center justify-center">
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.002"
              value={state.playbackRate}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="h-32 -rotate-90 w-32 accent-purple-500 cursor-pointer"
            />
          </div>
          <button
            onClick={() => handlePitchChange(1.0)}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reset to Original Pitch (0.0%)"
          >
            {((state.playbackRate - 1) * 100).toFixed(1)}%
          </button>
        </div>
      </div>

      {/* Time & Beat Counter Display */}
      <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800/90 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ELAPSED</span>
          <div className="font-mono text-xl font-black text-white tracking-wider">
            {formatTime(state.currentTime)}
          </div>
        </div>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">TEMPO</span>
          <div className={`font-mono text-xl font-black ${isDeckA ? 'text-cyan-400' : 'text-purple-400'}`}>
            {currentBpm.toFixed(1)}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">REMAINING</span>
          <div className="font-mono text-xl font-black text-slate-400 tracking-wider">
            -{formatTime(Math.max(0, state.duration - state.currentTime))}
          </div>
        </div>
      </div>

      {/* Transport Controls: Play/Pause, CUE, SYNC, LOOP */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className={`py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg transition-all ${
            state.isPlaying
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          {state.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{state.isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* CUE */}
        <button
          onClick={handleCue}
          onDoubleClick={handleSetCue}
          className="py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1 text-xs font-bold transition-all"
          title="Click to jump to Cue. Double-click to set Cue."
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CUE</span>
        </button>

        {/* SYNC */}
        <button
          onClick={() => onUpdateState({ isSync: !state.isSync })}
          className={`py-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold border transition-all ${
            state.isSync
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>SYNC</span>
        </button>

        {/* LOOP */}
        <button
          onClick={() => onUpdateState({ isLooping: !state.isLooping })}
          className={`py-3 rounded-xl flex items-center justify-center gap-1 text-xs font-bold border transition-all ${
            state.isLooping
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{state.isLooping ? '4 BARS' : 'LOOP'}</span>
        </button>
      </div>
    </div>
  );
};
