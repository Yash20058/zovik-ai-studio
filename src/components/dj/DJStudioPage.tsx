import React, { useState, useEffect } from 'react';
import { Deck } from './Deck';
import { MixerSection } from './MixerSection';
import { WaveformVisualizer } from './WaveformVisualizer';
import { MashupAssistant } from './MashupAssistant';
import { AudioTrack, DeckState } from '../../types';
import { SAMPLE_TRACKS } from '../../audio/sampleTracks';
import { audioEngine } from '../../audio/audioEngine';
import { generateElectronicAudioBuffer } from '../../audio/synthGenerator';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

export const DJStudioPage: React.FC = () => {
  const { addToast } = useToast();
  const [tracks, setTracks] = useState<AudioTrack[]>(SAMPLE_TRACKS);
  const [crossfader, setCrossfader] = useState<number>(0);

  const [deckAState, setDeckAState] = useState<DeckState>({
    id: 'A',
    track: SAMPLE_TRACKS[0],
    isPlaying: false,
    currentTime: 0,
    duration: SAMPLE_TRACKS[0].duration,
    volume: 1.0,
    playbackRate: 1.0,
    lowEq: 0,
    midEq: 0,
    highEq: 0,
    filter: 0,
    cuePoint: 0,
    isLooping: true,
    loopLength: 4,
    isMuted: false,
    isSync: false,
  });

  const [deckBState, setDeckBState] = useState<DeckState>({
    id: 'B',
    track: SAMPLE_TRACKS[1],
    isPlaying: false,
    currentTime: 0,
    duration: SAMPLE_TRACKS[1].duration,
    volume: 1.0,
    playbackRate: 1.0,
    lowEq: 0,
    midEq: 0,
    highEq: 0,
    filter: 0,
    cuePoint: 0,
    isLooping: true,
    loopLength: 4,
    isMuted: false,
    isSync: false,
  });

  // Synthesize initial audio buffers for Deck A and Deck B
  useEffect(() => {
    audioEngine.init();
    const ctx = audioEngine.getAudioContext();
    if (ctx) {
      // Buffer for Deck A (Cyberpunk Voltage - 126 BPM)
      const bufA = generateElectronicAudioBuffer(ctx, {
        bpm: 126,
        genre: 'cyberpunk',
        durationSeconds: 32,
        key: 'Fm'
      });
      audioEngine.loadTrackBuffer('A', bufA);

      // Buffer for Deck B (Neon Horizon - 128 BPM)
      const bufB = generateElectronicAudioBuffer(ctx, {
        bpm: 128,
        genre: 'synthwave',
        durationSeconds: 30,
        key: 'Ab'
      });
      audioEngine.loadTrackBuffer('B', bufB);
    }
  }, []);

  const handleSelectTrackA = (track: AudioTrack) => {
    setDeckAState((prev) => ({
      ...prev,
      track,
      duration: track.duration,
      currentTime: 0,
      isPlaying: false,
    }));
    const ctx = audioEngine.getAudioContext();
    if (ctx && !track.audioBuffer) {
      const buf = generateElectronicAudioBuffer(ctx, {
        bpm: track.bpm,
        genre: 'synthwave',
        durationSeconds: track.duration,
        key: track.key
      });
      audioEngine.loadTrackBuffer('A', buf);
    }
    addToast('info', 'Loaded to Deck A', `${track.name} (${track.bpm} BPM)`);
  };

  const handleSelectTrackB = (track: AudioTrack) => {
    setDeckBState((prev) => ({
      ...prev,
      track,
      duration: track.duration,
      currentTime: 0,
      isPlaying: false,
    }));
    const ctx = audioEngine.getAudioContext();
    if (ctx && !track.audioBuffer) {
      const buf = generateElectronicAudioBuffer(ctx, {
        bpm: track.bpm,
        genre: 'synthwave',
        durationSeconds: track.duration,
        key: track.key
      });
      audioEngine.loadTrackBuffer('B', buf);
    }
    addToast('info', 'Loaded to Deck B', `${track.name} (${track.bpm} BPM)`);
  };

  // Auto Sync BPMs
  const handleSyncBpm = () => {
    if (!deckAState.track || !deckBState.track) return;
    const targetBpm = deckAState.track.bpm * deckAState.playbackRate;
    const targetRate = targetBpm / deckBState.track.bpm;
    audioEngine.setPlaybackRate('B', targetRate);
    setDeckBState((prev) => ({ ...prev, playbackRate: targetRate, isSync: true }));
    addToast('success', 'Beatgrids Synchronized', `Deck B pitch locked to ${targetBpm.toFixed(1)} BPM`);
  };

  // AI Automated Transition Engine
  const handleTriggerAiTransition = (type: string) => {
    if (type === 'bass-swap') {
      // Instantly swap Low EQ
      const newLowA = deckAState.lowEq === -15 ? 0 : -15;
      const newLowB = deckBState.lowEq === 0 ? -15 : 0;
      audioEngine.setEQ('A', newLowA, deckAState.midEq, deckAState.highEq);
      audioEngine.setEQ('B', newLowB, deckBState.midEq, deckBState.highEq);
      setDeckAState((prev) => ({ ...prev, lowEq: newLowA }));
      setDeckBState((prev) => ({ ...prev, lowEq: newLowB }));
      addToast('success', 'AI Bass Swap Applied', `Deck A Bass: ${newLowA}dB | Deck B Bass: ${newLowB}dB`);
    } else if (type === 'filter-sweep') {
      // Dynamic filter sweep over 2 seconds
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const sweepVal = Math.min(80, step * 4);
        audioEngine.setFilter('A', sweepVal);
        setDeckAState((prev) => ({ ...prev, filter: sweepVal }));
        if (step >= 20) {
          clearInterval(interval);
          setTimeout(() => {
            audioEngine.setFilter('A', 0);
            setDeckAState((prev) => ({ ...prev, filter: 0 }));
          }, 1000);
        }
      }, 50);
      addToast('info', 'AI Filter Sweep', 'High-pass resonance build executed');
    } else if (type === 'smooth-blend') {
      // Animate crossfader smoothly from current to opposite
      const target = crossfader <= 0 ? 1 : -1;
      const start = crossfader;
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        const currentPos = start + (target - start) * progress;
        audioEngine.setCrossfader(currentPos);
        setCrossfader(currentPos);
        if (progress >= 1) {
          clearInterval(interval);
          audioEngine.setCrossfader(target);
          setCrossfader(target);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
          addToast('success', 'Smooth Blend Completed', `Crossfade transitioned to ${target === 1 ? 'Deck B' : 'Deck A'}`);
        }
      }, 50);
    }
  };

  const handleSeek = (deckId: 'A' | 'B', time: number) => {
    if (deckId === 'A') {
      audioEngine.seekTrack('A', time, deckAState.isPlaying);
      setDeckAState((prev) => ({ ...prev, currentTime: time }));
    } else {
      audioEngine.seekTrack('B', time, deckBState.isPlaying);
      setDeckBState((prev) => ({ ...prev, currentTime: time }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Dual Waveform Visualizer */}
      <WaveformVisualizer
        deckAState={deckAState}
        deckBState={deckBState}
        onSeekDeck={handleSeek}
      />

      {/* Main Dual-Deck & Mixer Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Deck A */}
        <div className="lg:col-span-4">
          <Deck
            deckId="A"
            state={deckAState}
            onUpdateState={(up) => setDeckAState((prev) => ({ ...prev, ...up }))}
            onSelectTrack={handleSelectTrackA}
            sampleTracks={tracks}
          />
        </div>

        {/* Center DJ Mixer */}
        <div className="lg:col-span-4">
          <MixerSection
            deckAState={deckAState}
            deckBState={deckBState}
            onUpdateDeckA={(up) => setDeckAState((prev) => ({ ...prev, ...up }))}
            onUpdateDeckB={(up) => setDeckBState((prev) => ({ ...prev, ...up }))}
            crossfader={crossfader}
            onChangeCrossfader={setCrossfader}
            onTriggerAiTransition={handleTriggerAiTransition}
          />
        </div>

        {/* Deck B */}
        <div className="lg:col-span-4">
          <Deck
            deckId="B"
            state={deckBState}
            onUpdateState={(up) => setDeckBState((prev) => ({ ...prev, ...up }))}
            onSelectTrack={handleSelectTrackB}
            sampleTracks={tracks}
          />
        </div>
      </div>

      {/* AI Mashup & Harmonic Assistant Panel */}
      <MashupAssistant
        deckAState={deckAState}
        deckBState={deckBState}
        onSyncBpm={handleSyncBpm}
        onApplyTransition={handleTriggerAiTransition}
      />
    </div>
  );
};
