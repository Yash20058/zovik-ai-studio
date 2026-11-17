// Procedural Audio Synthesizer for Zovik Studio
// Synthesizes high-energy beats, basslines, multi-stems, and melodies into real AudioBuffers

export interface SynthPresetOptions {
  bpm: number;
  genre: string;
  durationSeconds?: number;
  key?: string;
  stemBalances?: {
    drums?: number; // 0 to 100
    bass?: number;
    lead?: number;
    pad?: number;
  };
}

export interface MultiStemBuffers {
  master: AudioBuffer;
  stems: {
    drums: AudioBuffer;
    bass: AudioBuffer;
    lead: AudioBuffer;
    pad: AudioBuffer;
  };
}

const KEY_FREQS: Record<string, number> = {
  'C': 130.81, 'Cm': 130.81,
  'C#': 138.59, 'Db': 138.59,
  'D': 146.83, 'Dm': 146.83,
  'Eb': 155.56, 'D#': 155.56,
  'E': 164.81, 'Em': 164.81,
  'F': 174.61, 'Fm': 174.61,
  'F#': 185.00, 'Gb': 185.00,
  'G': 196.00, 'Gm': 196.00,
  'Ab': 207.65, 'G#': 207.65,
  'A': 220.00, 'Am': 220.00,
  'Bb': 233.08, 'A#': 233.08,
  'B': 246.94, 'Bm': 246.94,
};

export function generateMultiStemAudioBuffers(
  audioCtx: AudioContext,
  options: SynthPresetOptions
): MultiStemBuffers {
  const { bpm = 128, genre = 'synthwave', durationSeconds = 30 } = options;
  const sampleRate = audioCtx.sampleRate;
  const totalSamples = Math.floor(sampleRate * durationSeconds);

  // 4 Stem Buffers
  const drumsBuf = audioCtx.createBuffer(2, totalSamples, sampleRate);
  const bassBuf = audioCtx.createBuffer(2, totalSamples, sampleRate);
  const leadBuf = audioCtx.createBuffer(2, totalSamples, sampleRate);
  const padBuf = audioCtx.createBuffer(2, totalSamples, sampleRate);
  const masterBuf = audioCtx.createBuffer(2, totalSamples, sampleRate);

  const dL = drumsBuf.getChannelData(0), dR = drumsBuf.getChannelData(1);
  const bL = bassBuf.getChannelData(0), bR = bassBuf.getChannelData(1);
  const lL = leadBuf.getChannelData(0), lR = leadBuf.getChannelData(1);
  const pL = padBuf.getChannelData(0), pR = padBuf.getChannelData(1);

  const secondsPerBeat = 60 / bpm;
  const samplesPerBeat = Math.floor(sampleRate * secondsPerBeat);
  const totalBeats = Math.floor(durationSeconds / secondsPerBeat);

  // Key frequencies
  const cleanKey = (options.key || 'Fm').trim();
  const rootFreq = KEY_FREQS[cleanKey] || 174.61;
  const isMinor = cleanKey.includes('m');
  const scale = isMinor
    ? [1, 1.189, 1.335, 1.498, 1.782, 2.0] // Natural minor
    : [1, 1.122, 1.260, 1.335, 1.498, 1.682, 2.0]; // Major

  const normGenre = genre.toLowerCase();

  // === 1. DRUMS SYNTHESIS ===
  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = beat * samplesPerBeat;

    if (normGenre.includes('lofi') || normGenre.includes('chill')) {
      // Lo-Fi: Boom-bap pattern
      const isKick = beat % 4 === 0 || (beat % 4 === 2 && Math.random() > 0.4);
      if (isKick) {
        const kLen = Math.floor(sampleRate * 0.28);
        for (let i = 0; i < kLen; i++) {
          const t = i / sampleRate;
          const p = i / kLen;
          const freq = 110 * Math.exp(-p * 10) + 40;
          const env = Math.exp(-p * 7);
          const v = Math.sin(2 * Math.PI * freq * t) * env * 0.65;
          const idx = beatStart + i;
          if (idx < totalSamples) { dL[idx] += v; dR[idx] += v; }
        }
      }
      // Rimshot / Snare on 2 and 4
      if (beat % 2 === 1) {
        const sLen = Math.floor(sampleRate * 0.18);
        for (let i = 0; i < sLen; i++) {
          const p = i / sLen;
          const noise = (Math.random() * 2 - 1) * Math.exp(-p * 18);
          const tone = Math.sin(2 * Math.PI * 220 * (i / sampleRate)) * Math.exp(-p * 20);
          const v = (noise * 0.4 + tone * 0.5) * 0.45;
          const idx = beatStart + i;
          if (idx < totalSamples) { dL[idx] += v * 0.9; dR[idx] += v * 0.9; }
        }
      }
    } else {
      // 4-on-the-floor electronic / techno / synthwave / house
      const kickLen = Math.min(samplesPerBeat, Math.floor(sampleRate * (normGenre.includes('techno') ? 0.38 : 0.32)));
      for (let i = 0; i < kickLen; i++) {
        const t = i / sampleRate;
        const p = i / kickLen;
        const startFreq = normGenre.includes('techno') ? 170 : 140;
        const subFreq = normGenre.includes('techno') ? 38 : 45;
        const freq = startFreq * Math.exp(-p * 9) + subFreq;
        const env = Math.exp(-p * 7);
        let v = Math.sin(2 * Math.PI * freq * t) * env * 0.75;
        if (normGenre.includes('techno')) v = Math.tanh(v * 1.3); // Saturation
        const idx = beatStart + i;
        if (idx < totalSamples) { dL[idx] += v; dR[idx] += v; }
      }

      // Snare / Clap on 2 and 4
      if (beat % 2 === 1) {
        const snareLen = Math.floor(sampleRate * 0.22);
        for (let i = 0; i < snareLen; i++) {
          const p = i / snareLen;
          const noise = (Math.random() * 2 - 1) * Math.exp(-p * 14);
          const body = Math.sin(2 * Math.PI * 190 * (i / sampleRate)) * Math.exp(-p * 18);
          const v = (noise * 0.55 + body * 0.35) * 0.65;
          const idx = beatStart + i;
          if (idx < totalSamples) { dL[idx] += v * 0.85; dR[idx] += v * 0.85; }
        }
      }

      // Offbeat Hi-Hat
      const hatStart = beatStart + Math.floor(samplesPerBeat * 0.5);
      const hatLen = Math.floor(sampleRate * 0.08);
      for (let i = 0; i < hatLen; i++) {
        const p = i / hatLen;
        const noise = (Math.random() * 2 - 1) * Math.exp(-p * 24);
        const v = noise * 0.26;
        const idx = hatStart + i;
        if (idx < totalSamples) { dL[idx] += v * 0.7; dR[idx] += v * 1.0; }
      }
    }
  }

  // === 2. BASSLINE SYNTHESIS ===
  const subFreq = rootFreq / 2;
  const sixteenth = Math.floor(samplesPerBeat / 4);
  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = beat * samplesPerBeat;

    for (let step = 0; step < 4; step++) {
      const stepStart = beatStart + step * sixteenth;
      const noteIdx = (beat * 4 + step) % scale.length;
      const currentBassFreq = subFreq * (step % 2 === 0 ? 1 : scale[noteIdx] * 0.5);

      for (let i = 0; i < sixteenth; i++) {
        const t = i / sampleRate;
        const p = i / sixteenth;
        const env = Math.exp(-p * (normGenre.includes('techno') ? 3.5 : 5.5));

        let bassVal = 0;
        if (normGenre.includes('techno')) {
          // Acid resonant saw
          const saw = (2 * ((t * currentBassFreq) % 1) - 1);
          const sub = Math.sin(2 * Math.PI * (currentBassFreq / 2) * t) * 0.6;
          bassVal = (saw * 0.5 + sub) * env * 0.35;
        } else if (normGenre.includes('lofi')) {
          // Smooth warm sine sub
          bassVal = Math.sin(2 * Math.PI * currentBassFreq * t) * env * 0.4;
        } else {
          // Synthwave punchy saw
          const saw = (2 * ((t * currentBassFreq) % 1) - 1);
          bassVal = saw * env * 0.3;
        }

        const idx = stepStart + i;
        if (idx < totalSamples) { bL[idx] += bassVal; bR[idx] += bassVal; }
      }
    }
  }

  // === 3. LEAD MELODY SYNTHESIS ===
  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = beat * samplesPerBeat;
    for (let step = 0; step < 4; step++) {
      if (step % 2 === 1 && Math.random() > 0.6) continue; // Rhythmic pauses

      const stepStart = beatStart + step * sixteenth;
      const noteIdx = (beat * 3 + step * 2) % scale.length;
      const leadFreq = rootFreq * scale[noteIdx] * 2; // Octave up

      for (let i = 0; i < sixteenth; i++) {
        const t = i / sampleRate;
        const p = i / sixteenth;
        const env = Math.exp(-p * (normGenre.includes('lofi') ? 4 : 6));

        let leadVal = 0;
        if (normGenre.includes('lofi')) {
          // Electric piano / Rhodes bell
          const f1 = Math.sin(2 * Math.PI * leadFreq * t);
          const f2 = Math.sin(2 * Math.PI * leadFreq * 2.0 * t) * 0.3;
          leadVal = (f1 + f2) * env * 0.22;
        } else {
          // Bright synth pluck with stereo pan
          const f1 = Math.sin(2 * Math.PI * leadFreq * t);
          const f2 = Math.sin(2 * Math.PI * (leadFreq * 1.005) * t); // Chorus detune
          leadVal = (f1 + f2) * env * 0.18;
        }

        const idx = stepStart + i;
        if (idx < totalSamples) {
          const pan = Math.sin(beat * 0.5 + step);
          lL[idx] += leadVal * (0.6 + pan * 0.3);
          lR[idx] += leadVal * (0.6 - pan * 0.3);
        }
      }
    }
  }

  // === 4. AMBIENT PAD / CHORD SYNTHESIS ===
  const chordLength = samplesPerBeat * 4; // 1 chord every bar
  const totalBars = Math.floor(durationSeconds / (secondsPerBeat * 4));
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * chordLength;
    const chordRoot = rootFreq * (scale[bar % scale.length] || 1);
    const chordThird = chordRoot * (isMinor ? 1.189 : 1.26);
    const chordFifth = chordRoot * 1.498;

    for (let i = 0; i < chordLength; i++) {
      const t = i / sampleRate;
      const progress = i / chordLength;
      // Lush slow attack and release
      const padEnv = Math.sin(progress * Math.PI) * 0.16;

      const n1 = Math.sin(2 * Math.PI * chordRoot * t);
      const n2 = Math.sin(2 * Math.PI * chordThird * t);
      const n3 = Math.sin(2 * Math.PI * chordFifth * t);
      const padVal = (n1 + n2 + n3) * padEnv;

      const idx = barStart + i;
      if (idx < totalSamples) {
        pL[idx] += padVal * 0.8;
        pR[idx] += padVal * 0.8;
      }
    }
  }

  // === 5. MIX MASTER WITH STEM BALANCES ===
  const dVol = (options.stemBalances?.drums ?? 100) / 100;
  const bVol = (options.stemBalances?.bass ?? 90) / 100;
  const lVol = (options.stemBalances?.lead ?? 85) / 100;
  const pVol = (options.stemBalances?.pad ?? 70) / 100;

  const mL = masterBuf.getChannelData(0), mR = masterBuf.getChannelData(1);
  for (let i = 0; i < totalSamples; i++) {
    // Apply soft limiting per stem
    dL[i] = Math.tanh(dL[i] * 1.05); dR[i] = Math.tanh(dR[i] * 1.05);
    bL[i] = Math.tanh(bL[i] * 1.05); bR[i] = Math.tanh(bR[i] * 1.05);
    lL[i] = Math.tanh(lL[i] * 1.05); lR[i] = Math.tanh(lR[i] * 1.05);
    pL[i] = Math.tanh(pL[i] * 1.05); pR[i] = Math.tanh(pR[i] * 1.05);

    const sumL = dL[i] * dVol + bL[i] * bVol + lL[i] * lVol + pL[i] * pVol;
    const sumR = dR[i] * dVol + bR[i] * bVol + lR[i] * lVol + pR[i] * pVol;

    mL[i] = Math.tanh(sumL * 1.1);
    mR[i] = Math.tanh(sumR * 1.1);
  }

  return {
    master: masterBuf,
    stems: {
      drums: drumsBuf,
      bass: bassBuf,
      lead: leadBuf,
      pad: padBuf,
    }
  };
}

export function generateElectronicAudioBuffer(
  audioCtx: AudioContext,
  options: SynthPresetOptions
): AudioBuffer {
  return generateMultiStemAudioBuffers(audioCtx, options).master;
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const length = buffer.length * blockAlign;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}
