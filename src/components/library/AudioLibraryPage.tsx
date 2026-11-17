import React, { useState, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Upload, 
  Download, 
  Trash2, 
  Sliders, 
  Disc, 
  Send,
  Plus
} from 'lucide-react';
import { AudioTrack } from '../../types';
import { SAMPLE_TRACKS } from '../../audio/sampleTracks';
import { audioEngine } from '../../audio/audioEngine';
import { useToast } from '../common/Toast';

export const AudioLibraryPage: React.FC<{ onSendToDeck?: (deck: 'A' | 'B', track: AudioTrack) => void }> = ({ onSendToDeck }) => {
  const { addToast } = useToast();
  const [tracks, setTracks] = useState<AudioTrack[]>(SAMPLE_TRACKS);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePlayToggle = (track: AudioTrack) => {
    if (activePlayingId === track.id) {
      audioEngine.pauseTrack('A');
      setActivePlayingId(null);
    } else {
      audioEngine.init();
      audioEngine.resume();
      if (track.audioBuffer) {
        audioEngine.loadTrackBuffer('A', track.audioBuffer);
      }
      audioEngine.playTrack('A');
      setActivePlayingId(track.id);
      addToast('info', 'Previewing Track', track.name);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(buffer);

      const newTrack: AudioTrack = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Uploaded Track',
        duration: Math.round(audioBuffer.duration),
        bpm: 128,
        key: '8A (Am)',
        url: URL.createObjectURL(file),
        audioBuffer,
        color: '#06b6d4',
        isCustom: true,
      };

      setTracks((prev) => [newTrack, ...prev]);
      addToast('success', 'Track Uploaded', `${newTrack.name} added to library.`);
    } catch {
      addToast('error', 'Upload Error', 'Could not decode audio file.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">Audio Library & Track Manager</h2>
          </div>
          <p className="text-sm text-slate-400">
            Organize uploaded songs, synthesized AI stems, and recorded master mixes.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Audio File
          </button>
        </div>
      </div>

      {/* Track List Table */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-3">
        <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-slate-800">
          <div className="col-span-1">Play</div>
          <div className="col-span-4">Track Title & Artist</div>
          <div className="col-span-2 text-center">BPM</div>
          <div className="col-span-2 text-center">Musical Key</div>
          <div className="col-span-1 text-center">Duration</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="space-y-2">
          {tracks.map((track) => {
            const isPlaying = activePlayingId === track.id;
            return (
              <div
                key={track.id}
                className="grid grid-cols-12 items-center px-4 py-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 transition-colors text-xs"
              >
                <div className="col-span-1">
                  <button
                    onClick={() => handlePlayToggle(track)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>

                <div className="col-span-4">
                  <div className="font-bold text-white text-sm truncate">{track.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{track.artist}</div>
                </div>

                <div className="col-span-2 text-center font-mono font-bold text-cyan-400">
                  {track.bpm} BPM
                </div>

                <div className="col-span-2 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                    {track.key}
                  </span>
                </div>

                <div className="col-span-1 text-center font-mono text-slate-400">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => {
                      if (track.audioBuffer) {
                        audioEngine.loadTrackBuffer('A', track.audioBuffer);
                      }
                      addToast('success', 'Loaded to Deck A', track.name);
                    }}
                    className="px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                    title="Load to Deck A"
                  >
                    DECK A
                  </button>
                  <button
                    onClick={() => {
                      if (track.audioBuffer) {
                        audioEngine.loadTrackBuffer('B', track.audioBuffer);
                      }
                      addToast('success', 'Loaded to Deck B', track.name);
                    }}
                    className="px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-[10px] font-bold"
                    title="Load to Deck B"
                  >
                    DECK B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
