import React, { useState } from 'react';
import { 
  Sliders, 
  Volume2, 
  Sparkles, 
  Headphones, 
  Activity,
  ArrowLeftRight,
  Flame,
  Zap
} from 'lucide-react';
import { DeckState } from '../../types';
import { audioEngine } from '../../audio/audioEngine';

interface MixerProps {
  deckAState: DeckState;
  deckBState: DeckState;
  onUpdateDeckA: (updates: Partial<DeckState>) => void;
  onUpdateDeckB: (updates: Partial<DeckState>) => void;
  crossfader: number; // -1 to +1
  onChangeCrossfader: (val: number) => void;
  onTriggerAiTransition: (type: string) => void;
}

export const MixerSection: React.FC<MixerProps> = ({
  deckAState,
  deckBState,
  onUpdateDeckA,
  onUpdateDeckB,
  crossfader,
  onChangeCrossfader,
  onTriggerAiTransition,
}) => {
  // Knobs for EQ
  const handleEqChange = (deckId: 'A' | 'B', band: 'low' | 'mid' | 'high', val: number) => {
    if (deckId === 'A') {
      const low = band === 'low' ? val : deckAState.lowEq;
      const mid = band === 'mid' ? val : deckAState.midEq;
      const high = band === 'high' ? val : deckAState.highEq;
      audioEngine.setEQ('A', low, mid, high);
      onUpdateDeckA({ lowEq: low, midEq: mid, highEq: high });
    } else {
      const low = band === 'low' ? val : deckBState.lowEq;
      const mid = band === 'mid' ? val : deckBState.midEq;
      const high = band === 'high' ? val : deckBState.highEq;
      audioEngine.setEQ('B', low, mid, high);
      onUpdateDeckB({ lowEq: low, midEq: mid, highEq: high });
    }
  };

  const handleFilterChange = (deckId: 'A' | 'B', val: number) => {
    audioEngine.setFilter(deckId, val);
    if (deckId === 'A') onUpdateDeckA({ filter: val });
    else onUpdateDeckB({ filter: val });
  };

  const handleVolumeFader = (deckId: 'A' | 'B', val: number) => {
    audioEngine.setDeckVolume(deckId, val);
    if (deckId === 'A') onUpdateDeckA({ volume: val });
    else onUpdateDeckB({ volume: val });
  };

  return (
    <div className="bg-slate-950/80 border border-purple-900/30 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative select-none">
      {/* Top Mixer Label */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black tracking-widest text-white uppercase">ZOVIK MIX ENGINE</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
            3-BAND EQ
          </span>
        </div>
      </div>

      {/* Main Dual Channel Strips */}
      <div className="grid grid-cols-2 gap-4 py-3">
        {/* Channel A Strip */}
        <div className="flex flex-col items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-cyan-500/20">
          <div className="text-xs font-black text-cyan-400">CH A</div>

          {/* High EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">HIGH</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckAState.highEq}
              onChange={(e) => handleEqChange('A', 'high', Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckAState.highEq > 0 ? `+${deckAState.highEq}` : deckAState.highEq} dB</span>
          </div>

          {/* Mid EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">MID</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckAState.midEq}
              onChange={(e) => handleEqChange('A', 'mid', Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckAState.midEq > 0 ? `+${deckAState.midEq}` : deckAState.midEq} dB</span>
          </div>

          {/* Low / Bass EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">LOW / BASS</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckAState.lowEq}
              onChange={(e) => handleEqChange('A', 'low', Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckAState.lowEq > 0 ? `+${deckAState.lowEq}` : deckAState.lowEq} dB</span>
          </div>

          {/* Filter Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-amber-400 uppercase">FILTER</span>
            <input
              type="range"
              min="-100"
              max="100"
              step="2"
              value={deckAState.filter}
              onChange={(e) => handleFilterChange('A', Number(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">
              {deckAState.filter < -2 ? 'LPF' : deckAState.filter > 2 ? 'HPF' : 'OFF'}
            </span>
          </div>

          {/* Vertical Volume Fader */}
          <div className="flex flex-col items-center mt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">LEVEL A</span>
            <div className="h-28 flex items-center justify-center my-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={deckAState.volume}
                onChange={(e) => handleVolumeFader('A', Number(e.target.value))}
                className="h-24 -rotate-90 w-24 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Channel B Strip */}
        <div className="flex flex-col items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-purple-500/20">
          <div className="text-xs font-black text-purple-400">CH B</div>

          {/* High EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">HIGH</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckBState.highEq}
              onChange={(e) => handleEqChange('B', 'high', Number(e.target.value))}
              className="w-16 accent-purple-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckBState.highEq > 0 ? `+${deckBState.highEq}` : deckBState.highEq} dB</span>
          </div>

          {/* Mid EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">MID</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckBState.midEq}
              onChange={(e) => handleEqChange('B', 'mid', Number(e.target.value))}
              className="w-16 accent-purple-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckBState.midEq > 0 ? `+${deckBState.midEq}` : deckBState.midEq} dB</span>
          </div>

          {/* Low / Bass EQ Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">LOW / BASS</span>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={deckBState.lowEq}
              onChange={(e) => handleEqChange('B', 'low', Number(e.target.value))}
              className="w-16 accent-purple-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">{deckBState.lowEq > 0 ? `+${deckBState.lowEq}` : deckBState.lowEq} dB</span>
          </div>

          {/* Filter Knob */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-amber-400 uppercase">FILTER</span>
            <input
              type="range"
              min="-100"
              max="100"
              step="2"
              value={deckBState.filter}
              onChange={(e) => handleFilterChange('B', Number(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <span className="text-[9px] font-mono text-slate-400">
              {deckBState.filter < -2 ? 'LPF' : deckBState.filter > 2 ? 'HPF' : 'OFF'}
            </span>
          </div>

          {/* Vertical Volume Fader */}
          <div className="flex flex-col items-center mt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase">LEVEL B</span>
            <div className="h-28 flex items-center justify-center my-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={deckBState.volume}
                onChange={(e) => handleVolumeFader('B', Number(e.target.value))}
                className="h-24 -rotate-90 w-24 accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Transition Quick Actions */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> AI Transition Macros
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <button
            onClick={() => onTriggerAiTransition('bass-swap')}
            className="px-2 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
            title="Instant Low-EQ Bass Swap between decks"
          >
            <Flame className="w-3 h-3 text-purple-400" /> Bass Swap
          </button>
          <button
            onClick={() => onTriggerAiTransition('filter-sweep')}
            className="px-2 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
            title="Automated High-pass Filter sweep crossfade"
          >
            <Zap className="w-3 h-3 text-cyan-400" /> Filter Sweep
          </button>
          <button
            onClick={() => onTriggerAiTransition('smooth-blend')}
            className="px-2 py-1.5 rounded-lg bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
            title="Smooth 8-bar equal power crossfade"
          >
            <ArrowLeftRight className="w-3 h-3 text-pink-400" /> Auto Blend
          </button>
        </div>
      </div>

      {/* Crossfader Section */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-cyan-400">DECK A</span>
          <span className="text-slate-400 uppercase text-[9px] tracking-wider">CROSSFADER</span>
          <span className="text-purple-400">DECK B</span>
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={crossfader}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            audioEngine.setCrossfader(val);
            onChangeCrossfader(val);
          }}
          className="w-full h-3 accent-purple-500 cursor-pointer bg-slate-950 rounded-lg shadow-inner"
        />

        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <button onClick={() => { audioEngine.setCrossfader(-1); onChangeCrossfader(-1); }} className="hover:text-cyan-400">[ FULL A ]</button>
          <button onClick={() => { audioEngine.setCrossfader(0); onChangeCrossfader(0); }} className="hover:text-purple-400">[ CENTER 50/50 ]</button>
          <button onClick={() => { audioEngine.setCrossfader(1); onChangeCrossfader(1); }} className="hover:text-purple-400">[ FULL B ]</button>
        </div>
      </div>
    </div>
  );
};
