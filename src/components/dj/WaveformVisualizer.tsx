import React, { useRef, useEffect } from 'react';
import { DeckState } from '../../types';
import { audioEngine } from '../../audio/audioEngine';

interface WaveformProps {
  deckAState: DeckState;
  deckBState: DeckState;
  onSeekDeck: (deckId: 'A' | 'B', time: number) => void;
}

export const WaveformVisualizer: React.FC<WaveformProps> = ({
  deckAState,
  deckBState,
  onSeekDeck,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyserA = audioEngine.getDeckAnalyser('A');
    const analyserB = audioEngine.getDeckAnalyser('B');
    const dataA = new Uint8Array(128);
    const dataB = new Uint8Array(128);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      const halfHeight = height / 2;

      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Center Divider line
      ctx.strokeStyle = '#1e1e30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, halfHeight);
      ctx.lineTo(width, halfHeight);
      ctx.stroke();

      // Beatgrid vertical bars (every 1/16th of width)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < width; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // --- Draw Deck A (Top Half) ---
      if (analyserA && deckAState.isPlaying) {
        analyserA.getByteFrequencyData(dataA);
      }
      const bars = 80;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const valA = deckAState.isPlaying && analyserA ? (dataA[i % dataA.length] / 255) : 0.2 + Math.sin(i * 0.4) * 0.15;
        const barHeight = Math.max(4, valA * (halfHeight - 10));
        const x = i * barWidth;

        // Deck A Cyan gradient
        const gradA = ctx.createLinearGradient(0, halfHeight - barHeight, 0, halfHeight);
        gradA.addColorStop(0, '#06b6d4');
        gradA.addColorStop(1, 'rgba(6, 182, 212, 0.2)');

        ctx.fillStyle = gradA;
        ctx.fillRect(x, halfHeight - barHeight, barWidth - 1, barHeight);
      }

      // Deck A Playhead Marker
      if (deckAState.duration > 0) {
        const progressA = deckAState.currentTime / deckAState.duration;
        const playheadX = progressA * width;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, halfHeight);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // --- Draw Deck B (Bottom Half) ---
      if (analyserB && deckBState.isPlaying) {
        analyserB.getByteFrequencyData(dataB);
      }

      for (let i = 0; i < bars; i++) {
        const valB = deckBState.isPlaying && analyserB ? (dataB[i % dataB.length] / 255) : 0.2 + Math.cos(i * 0.4) * 0.15;
        const barHeight = Math.max(4, valB * (halfHeight - 10));
        const x = i * barWidth;

        // Deck B Purple gradient
        const gradB = ctx.createLinearGradient(0, halfHeight, 0, halfHeight + barHeight);
        gradB.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
        gradB.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradB;
        ctx.fillRect(x, halfHeight, barWidth - 1, barHeight);
      }

      // Deck B Playhead Marker
      if (deckBState.duration > 0) {
        const progressB = deckBState.currentTime / deckBState.duration;
        const playheadX = progressB * width;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(playheadX, halfHeight);
        ctx.lineTo(playheadX, height);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [deckAState, deckBState]);

  // Handle clicking on waveform to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ratioX = Math.max(0, Math.min(1, x / rect.width));

    if (y < rect.height / 2) {
      // Seek Deck A
      if (deckAState.duration > 0) {
        onSeekDeck('A', ratioX * deckAState.duration);
      }
    } else {
      // Seek Deck B
      if (deckBState.duration > 0) {
        onSeekDeck('B', ratioX * deckBState.duration);
      }
    }
  };

  return (
    <div className="bg-slate-950/90 border border-purple-900/30 rounded-2xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between pb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-300">DECK A WAVEFORM: {deckAState.track?.name || 'Empty'}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">CLICK TO SCRUB / SEEK</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-300">DECK B WAVEFORM: {deckBState.track?.name || 'Empty'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-md shadow-purple-400/50" />
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800">
        <canvas
          ref={canvasRef}
          width={900}
          height={140}
          onClick={handleCanvasClick}
          className="w-full h-28 sm:h-32 cursor-pointer bg-slate-950 block"
        />
      </div>
    </div>
  );
};
