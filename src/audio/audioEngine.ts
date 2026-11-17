// Zovik Real Web Audio Engine
import { generateElectronicAudioBuffer } from './synthGenerator';

export interface DeckNodes {
  source: AudioBufferSourceNode | null;
  deckGain: GainNode;
  lowFilter: BiquadFilterNode;
  midFilter: BiquadFilterNode;
  highFilter: BiquadFilterNode;
  djFilter: BiquadFilterNode;
  crossfadeGain: GainNode;
  analyser: AnalyserNode;
  startTime: number;
  pauseOffset: number;
  buffer: AudioBuffer | null;
  playbackRate: number;
}

class DJAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private deckA: DeckNodes | null = null;
  private deckB: DeckNodes | null = null;
  private crossfaderPosition: number = 0; // -1 (Deck A) to +1 (Deck B)
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordStreamDest: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtxClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;

    this.recordStreamDest = this.ctx.createMediaStreamDestination();

    // Route: Master Gain -> Master Analyser -> Destination + Stream
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);
    this.masterAnalyser.connect(this.recordStreamDest);

    this.deckA = this.createDeckChain();
    this.deckB = this.createDeckChain();

    this.setCrossfader(0);
  }

  public async resume() {
    try {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (err) {
      console.warn('[Zovik Audio] ctx.resume warning:', err);
    }
  }

  public getAudioContext(): AudioContext | null {
    if (!this.ctx) this.init();
    return this.ctx;
  }

  private createDeckChain(): DeckNodes {
    if (!this.ctx || !this.masterGain) throw new Error('Audio engine not initialized');

    const deckGain = this.ctx.createGain();
    deckGain.gain.value = 1.0;

    // 3-Band Equalizer Filters
    const lowFilter = this.ctx.createBiquadFilter();
    lowFilter.type = 'lowshelf';
    lowFilter.frequency.value = 250;
    lowFilter.gain.value = 0;

    const midFilter = this.ctx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1.0;
    midFilter.gain.value = 0;

    const highFilter = this.ctx.createBiquadFilter();
    highFilter.type = 'highshelf';
    highFilter.frequency.value = 4000;
    highFilter.gain.value = 0;

    // DJ Dual Filter (lowpass / highpass)
    const djFilter = this.ctx.createBiquadFilter();
    djFilter.type = 'allpass';
    djFilter.frequency.value = 1000;

    const crossfadeGain = this.ctx.createGain();
    crossfadeGain.gain.value = 0.707;

    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;

    // Chain: deckGain -> lowFilter -> midFilter -> highFilter -> djFilter -> analyser -> crossfadeGain -> masterGain
    deckGain.connect(lowFilter);
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(djFilter);
    djFilter.connect(analyser);
    analyser.connect(crossfadeGain);
    crossfadeGain.connect(this.masterGain);

    return {
      source: null,
      deckGain,
      lowFilter,
      midFilter,
      highFilter,
      djFilter,
      crossfadeGain,
      analyser,
      startTime: 0,
      pauseOffset: 0,
      buffer: null,
      playbackRate: 1.0
    };
  }

  public loadTrackBuffer(deckId: 'A' | 'B', buffer: AudioBuffer) {
    this.init();
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck) return;

    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch {
        // ignore
      }
      deck.source = null;
    }

    deck.buffer = buffer;
    deck.pauseOffset = 0;
  }

  public playTrack(deckId: 'A' | 'B', offset?: number) {
    this.init();
    this.resume();
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !this.ctx) return;

    // Safety fallback: ensure buffer exists
    if (!deck.buffer) {
      deck.buffer = generateElectronicAudioBuffer(this.ctx, {
        bpm: deckId === 'A' ? 126 : 128,
        genre: deckId === 'A' ? 'cyberpunk' : 'synthwave',
        durationSeconds: 32,
        key: deckId === 'A' ? 'Fm' : 'Ab'
      });
    }

    if (deck.source) {
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch {
        // ignore
      }
    }

    const duration = deck.buffer.duration || 30;
    const rawOffset = offset !== undefined ? offset : deck.pauseOffset;
    const startAt = Math.max(0, Math.min(duration - 0.05, rawOffset));
    const source = this.ctx.createBufferSource();
    source.buffer = deck.buffer;
    source.loop = true;
    source.playbackRate.value = deck.playbackRate;
    source.connect(deck.deckGain);

    deck.source = source;
    deck.startTime = this.ctx.currentTime - (startAt / deck.playbackRate);

    try {
      source.start(0, startAt);
    } catch (err) {
      console.warn('[Zovik Audio] source.start warning:', err);
    }
  }

  public pauseTrack(deckId: 'A' | 'B'): number {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !this.ctx) return 0;

    let currentPos = 0;
    if (deck.source) {
      currentPos = (this.ctx.currentTime - deck.startTime) * deck.playbackRate;
      if (deck.buffer && currentPos > deck.buffer.duration) {
        currentPos = 0;
      }
      try {
        deck.source.stop();
        deck.source.disconnect();
      } catch {
        // ignore
      }
      deck.source = null;
    }
    deck.pauseOffset = currentPos;
    return currentPos;
  }

  public seekTrack(deckId: 'A' | 'B', timeInSeconds: number, isPlaying: boolean) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !deck.buffer) return;

    const clampedTime = Math.max(0, Math.min(deck.buffer.duration, timeInSeconds));
    deck.pauseOffset = clampedTime;

    if (isPlaying) {
      this.playTrack(deckId, clampedTime);
    }
  }

  public getCurrentTime(deckId: 'A' | 'B'): number {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !this.ctx) return 0;
    if (!deck.source) return deck.pauseOffset;

    const time = (this.ctx.currentTime - deck.startTime) * deck.playbackRate;
    if (deck.buffer && time >= deck.buffer.duration) {
      return deck.buffer.duration;
    }
    return Math.max(0, time);
  }

  public setDeckVolume(deckId: 'A' | 'B', volume: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck) return;
    deck.deckGain.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), this.ctx?.currentTime || 0);
  }

  public setPlaybackRate(deckId: 'A' | 'B', rate: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck) return;
    deck.playbackRate = rate;
    if (deck.source && this.ctx) {
      deck.source.playbackRate.setValueAtTime(rate, this.ctx.currentTime);
    }
  }

  public setEQ(deckId: 'A' | 'B', low: number, mid: number, high: number) {
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !this.ctx) return;
    const now = this.ctx.currentTime;
    deck.lowFilter.gain.setValueAtTime(low, now);
    deck.midFilter.gain.setValueAtTime(mid, now);
    deck.highFilter.gain.setValueAtTime(high, now);
  }

  public setFilter(deckId: 'A' | 'B', filterVal: number) {
    // filterVal is -100 to +100
    // -100 to -1: lowpass sweep (200Hz to 20000Hz)
    // 0: neutral
    // +1 to +100: highpass sweep (20Hz to 4000Hz)
    const deck = deckId === 'A' ? this.deckA : this.deckB;
    if (!deck || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (filterVal < -2) {
      deck.djFilter.type = 'lowpass';
      // Map -100..0 to 200..20000 Hz
      const factor = (filterVal + 100) / 100;
      const freq = 200 * Math.pow(100, factor);
      deck.djFilter.frequency.setValueAtTime(freq, now);
    } else if (filterVal > 2) {
      deck.djFilter.type = 'highpass';
      // Map 0..100 to 20..4000 Hz
      const factor = filterVal / 100;
      const freq = 20 * Math.pow(200, factor);
      deck.djFilter.frequency.setValueAtTime(freq, now);
    } else {
      deck.djFilter.type = 'allpass';
    }
  }

  public setCrossfader(val: number) {
    // val is -1.0 (Deck A full) to +1.0 (Deck B full)
    this.crossfaderPosition = Math.max(-1, Math.min(1, val));
    if (!this.deckA || !this.deckB || !this.ctx) return;

    // Equal-power crossfade curve
    const norm = (this.crossfaderPosition + 1) / 2; // 0 to 1
    const gainA = Math.cos(norm * 0.5 * Math.PI);
    const gainB = Math.cos((1 - norm) * 0.5 * Math.PI);

    const now = this.ctx.currentTime;
    this.deckA.crossfadeGain.gain.setValueAtTime(gainA, now);
    this.deckB.crossfadeGain.gain.setValueAtTime(gainB, now);
  }

  public getDeckAnalyser(deckId: 'A' | 'B'): AnalyserNode | null {
    return deckId === 'A' ? this.deckA?.analyser || null : this.deckB?.analyser || null;
  }

  public getMasterAnalyser(): AnalyserNode | null {
    return this.masterAnalyser;
  }

  // Recording functionality
  public startRecording() {
    this.init();
    if (!this.recordStreamDest) return;
    this.recordedChunks = [];

    const options = { mimeType: 'audio/webm;codecs=opus' };
    try {
      this.mediaRecorder = new MediaRecorder(this.recordStreamDest.stream, options);
    } catch {
      this.mediaRecorder = new MediaRecorder(this.recordStreamDest.stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Audio file decoding helper
  public async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    this.init();
    if (!this.ctx) throw new Error('AudioContext missing');
    return await this.ctx.decodeAudioData(arrayBuffer);
  }
}

export const audioEngine = new DJAudioEngine();
