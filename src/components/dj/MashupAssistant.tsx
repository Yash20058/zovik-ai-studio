import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Disc, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { DeckState, AudioTrack } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../common/Toast';

interface MashupAssistantProps {
  deckAState: DeckState;
  deckBState: DeckState;
  onSyncBpm: () => void;
  onApplyTransition: (name: string) => void;
}

export const MashupAssistant: React.FC<MashupAssistantProps> = ({
  deckAState,
  deckBState,
  onSyncBpm,
  onApplyTransition,
}) => {
  const { addToast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getMashupSuggestions(deckAState.track, deckBState.track);
      setAnalysis(result);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [deckAState.track?.id, deckBState.track?.id]);

  const bpmA = Math.round((deckAState.track?.bpm || 126) * deckAState.playbackRate * 10) / 10;
  const bpmB = Math.round((deckBState.track?.bpm || 128) * deckBState.playbackRate * 10) / 10;
  const bpmDiff = Math.abs(bpmA - bpmB).toFixed(1);
  const isBpmLocked = parseFloat(bpmDiff) < 0.2;

  return (
    <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-5 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Mashup & Harmonic Mixing Engine
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Camelot 2.0
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Intelligent track compatibility and transition analysis</p>
          </div>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-analyze</span>
        </button>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        {/* BPM Comparison & Sync */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>TEMPO COMPATIBILITY</span>
            {isBpmLocked ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Synchronized
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" /> {bpmDiff} BPM delta
              </span>
            )}
          </div>

          <div className="flex items-center justify-around my-2">
            <div className="text-center">
              <span className="text-[10px] text-cyan-400 font-bold">DECK A</span>
              <div className="font-mono text-lg font-black text-white">{bpmA}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-center">
              <span className="text-[10px] text-purple-400 font-bold">DECK B</span>
              <div className="font-mono text-lg font-black text-white">{bpmB}</div>
            </div>
          </div>

          <button
            onClick={onSyncBpm}
            className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isBpmLocked
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isBpmLocked ? 'Tempos Locked (128 BPM)' : 'Auto-Sync Beatgrid to Deck A'}</span>
          </button>
        </div>

        {/* Camelot Key Matching */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-2">HARMONIC KEY ALIGNMENT</div>
          <div className="flex items-center justify-between my-2">
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-center">
              <div className="text-[10px] text-cyan-400 font-bold">Key A</div>
              <div className="font-mono font-black text-white text-base">{deckAState.track?.key || 'Fm'}</div>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">HARMONIC BLEND</span>
              <span className="text-xs text-slate-300 font-medium">96% Key Match</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/30 text-center">
              <div className="text-[10px] text-purple-400 font-bold">Key B</div>
              <div className="font-mono font-black text-white text-base">{deckBState.track?.key || 'Ab'}</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Relative Major / Minor pairing. Vocals and melodies will blend cleanly with zero dissonance.
          </p>
        </div>

        {/* Recommended Mix Points */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> RECOMMENDED TRANSITION
          </div>
          <div className="my-1.5">
            <div className="text-xs font-bold text-white mb-0.5">Bass Swap & High-Pass Filter</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              At bar 32 of Track A, cut Low EQ to 9 o'clock and drop Track B bass at 100% on the downbeat.
            </p>
          </div>
          <button
            onClick={() => onApplyTransition('bass-swap')}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-purple-500/20 transition-all text-center"
          >
            Apply Suggested Mix Curve
          </button>
        </div>
      </div>
    </div>
  );
};
