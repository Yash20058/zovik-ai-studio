# zovik

> **Create Music. Generate Videos. Build Anything with AI.**

Zovik is a futuristic, dark-mode creative platform that fuses professional dual-deck DJ mixing, procedural AI electronic music synthesis, audio-reactive video rendering, and an intelligent interactive coding assistant into one unified workstation.

---

## 🌟 Key Features

### 1. 🎧 Dual-Deck AI DJ Studio & Mashup Engine
- **Dual Virtual Turntables (Deck A & Deck B)**: Realistic vinyl jog wheel rotation, vinyl scratch physics, pitch/tempo sliders (±15%), CUE point triggers, and 4/8/16-bar looping.
- **Real Web Audio API DSP Engine**: 3-band equalizer knobs (Low/Bass 250Hz, Mid 1000Hz, High/Treble 4000Hz) with real `BiquadFilterNode` filters, dual-action DJ lowpass/highpass sweep filter, and equal-power master crossfader.
- **Camelot Harmonic Key Matching**: Automatic key compatibility analysis (e.g. 8A to 8B, 8A to 9A) to ensure zero dissonance.
- **AI Automated Transition Macros**: One-click instant Bass Swap, High-Pass Filter Sweep, and 8-Bar Smooth Blend crossfade.
- **Master Mix Recording**: Live 32-bit float audio capture via `MediaRecorder` with immediate WAV/WebM export.
- **Interactive Scrolling Waveform**: Dual-track visualizer with beatgrid lines and click-to-seek scrubbing.

### 2. 🎵 AI Procedural Music & Stem Generator
- Multi-layer procedural synthesizer powered by Tone.js & Web Audio API.
- Synthesize 4-on-the-floor kicks, 808 sub-bass, 16th-note arpeggiated synth leads, and ambient choir pads directly in the browser with zero latency.
- Stem channel faders (Kick, Bass, Synth Lead, Atmosphere).
- One-click "Send to Deck A" or "Send to Deck B" for immediate live mixing.
- Export clean 16-bit PCM WAV audio files.

### 3. 🎬 Audio-Reactive AI Video Studio
- Real-time 60 FPS canvas video renderer synced to your DJ master mix audio transients.
- Aspect ratio selection: **16:9** (Landscape/YouTube), **9:16** (Vertical/Reels/TikTok/Shorts), **1:1** (Square/Instagram).
- Visual themes: Cyberpunk Neon Metropolis, Cosmic Nebula Warp, DJ Hologram Equalizer, and 80s Synthwave Grid.
- In-browser canvas video recording via `canvas.captureStream()` and `MediaRecorder` for downloadable WebM/MP4 videos.

### 4. 💻 AI Creative Coding Studio & Sandbox
- Code generation, line-by-line explanation, automated bug fixing, and unit test generation.
- Supports JavaScript (Web Audio API), TypeScript, HTML5 Canvas, Python, and C++ (JUCE audio DSP).
- In-browser live execution sandbox with simulated console logging for instant testing.
- Pre-loaded interactive presets: DJ Crossfader curve, Canvas Neon Visualizer, and 808 Kick Generator.

### 5. 💬 AI Creative Chat Co-Pilot
- Conversational creative assistant powered by Google Gemini API with smart offline fallback.
- Context-aware responses on music theory, Camelot mixing, audio engineering, and creative scripts.
- Markdown rendering with syntax-highlighted code blocks, copy buttons, and prompt suggestions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Tone.js, Canvas Confetti.
- **Audio Engine**: Web Audio API (BiquadFilterNode, AnalyserNode, AudioBufferSourceNode, GainNode, MediaRecorder).
- **Backend API**: Node.js, Express.js, Multer, dotenv, cors, Google Gemini API integration.
- **Video Engine**: HTML5 Canvas 2D / WebGL audio frequency mapping with MediaStream canvas capture.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js v18+ (tested with Node.js v24)
- npm v9+

### 2. Start the Backend Server
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`
*The server will start on `http://localhost:5000`.*

### 3. Start the Frontend Client
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`
*Open your browser at `http://localhost:5173`.*

---

## 🔑 API Key Configuration (Optional)

Zovik works **100% out of the box** using its built-in Web Audio synthesis core, canvas video renderer, and offline intelligence engine!

To connect external cloud LLM reasoning:
1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Navigate to **Settings & API** inside the Zovik app and enter your key, or add it to `server/.env`:
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
\`\`\`

---

## 📁 Project Architecture

\`\`\`
zovik-ai-studio/
├── client/                      # Vite + React 19 Frontend
│   ├── src/
│   │   ├── audio/               # Web Audio & Tone.js DSP Engine
│   │   │   ├── audioEngine.ts   # Dual deck chain, 3-band EQs, Crossfader, MediaRecorder
│   │   │   ├── synthGenerator.ts# Procedural drum, bass, and synth buffer synthesis
│   │   │   └── sampleTracks.ts  # Pre-configured master EDM / Synthwave tracks
│   │   ├── components/
│   │   │   ├── common/          # Header, Sidebar, Toast notifications
│   │   │   ├── landing/         # Futuristic Hero, Waveform Canvas, Feature Cards
│   │   │   ├── dashboard/       # System metrics, quick actions, audio telemetry
│   │   │   ├── dj/              # Deck A & B, Mixer, Waveform, Mashup Assistant
│   │   │   ├── music/           # AI Music Generator & Stem Mixer
│   │   │   ├── video/           # AI Video Generator & Canvas Recorder
│   │   │   ├── code/            # AI Coding Studio with Live Runner & Console
│   │   │   ├── chat/            # AI Co-Pilot chat interface
│   │   │   ├── library/         # Audio & Video Libraries
│   │   │   ├── projects/        # Workspace session manager
│   │   │   └── settings/        # API keys & Web Audio engine tuning
│   │   ├── services/            # API integration layer
│   │   └── types/               # TypeScript definitions
├── server/                      # Express.js Backend API
│   ├── src/
│   │   └── index.js             # Routes for chat, code, audio upload, mashups, projects
│   ├── uploads/                 # Uploaded audio stems & media
│   ├── .env.example             # Environment template
│   └── package.json
├── package.json                 # Unified workspace scripts
└── README.md
\`\`\`
