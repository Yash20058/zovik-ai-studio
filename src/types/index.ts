// Zovik AI Creative Suite - Type Definitions

export type NavTab = 
  | 'landing'
  | 'dashboard'
  | 'dj-studio'
  | 'ai-music'
  | 'ai-video'
  | 'ai-code'
  | 'ai-chat'
  | 'audio-library'
  | 'video-library'
  | 'projects'
  | 'settings';

export interface AudioTrack {
  id: string;
  name: string;
  artist: string;
  duration: number; // in seconds
  bpm: number;
  key: string; // e.g. "Am", "8A"
  url: string;
  audioBuffer?: AudioBuffer;
  color: string;
  isCustom?: boolean;
}

export interface DeckState {
  id: 'A' | 'B';
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  playbackRate: number; // 0.8 to 1.2 (pitch adjustment)
  lowEq: number; // -15 to +15 dB
  midEq: number; // -15 to +15 dB
  highEq: number; // -15 to +15 dB
  filter: number; // -100 (lowpass) to 0 (neutral) to +100 (highpass)
  cuePoint: number;
  isLooping: boolean;
  loopLength: number; // 1, 2, 4, 8, 16 beats
  isMuted: boolean;
  isSync: boolean;
}

export interface MashupAnalysis {
  deckA: { title: string; bpm: number; key: string; camelot: string };
  deckB: { title: string; bpm: number; key: string; camelot: string };
  bpmDifference: string;
  harmonicCompatibility: string;
  tempoAdjustmentNeeded: string;
  transitionSuggestions: Array<{
    name: string;
    description: string;
    suitability: string;
    recommendedCuePoint: string;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  codeBlocks?: Array<{ language: string; code: string }>;
  source?: 'gemini' | 'offline_engine';
}

export interface GeneratedVideo {
  id: string;
  title: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  duration: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  prompt: string;
  scenes?: Array<{ time: string; description: string }>;
  script?: string;
  audioTrackName?: string;
}

export interface CodeProject {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
  updatedAt: string;
}

export interface ProjectSession {
  id: string;
  title: string;
  updatedAt: string;
  deckATrackId?: string;
  deckBTrackId?: string;
  crossfader: number;
  bpm: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  isAgeVerified: boolean;
  guidelinesAccepted: boolean;
  provider: 'email' | 'google' | 'phone';
  location?: string;
  preferredGenres: string[];
  experienceLevel?: string;
  studioGoal?: string;
  hasCompletedOnboarding: boolean;
  avatarUrl?: string;
  createdAt: string;
}

