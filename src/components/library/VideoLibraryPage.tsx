import React from 'react';
import { Film, Video, Download, Play, Trash2, Sparkles, Clock, Eye } from 'lucide-react';
import { useToast } from '../common/Toast';

export const VideoLibraryPage: React.FC<{ onNavigateToCreate?: () => void }> = ({ onNavigateToCreate }) => {
  const { addToast } = useToast();

  const mockVideos = [
    {
      id: 'vid-1',
      title: 'Neon Cyberpunk Metropolis Visualizer',
      aspectRatio: '16:9',
      duration: '0:30',
      style: 'Cyberpunk Neon',
      resolution: '1920x1080',
      createdAt: 'Today, 10:24 AM'
    },
    {
      id: 'vid-2',
      title: 'Hyperdrive Warp Pulse (Reels/TikTok)',
      aspectRatio: '9:16',
      duration: '0:15',
      style: 'Cosmic Nebula',
      resolution: '1080x1920',
      createdAt: 'Yesterday'
    },
    {
      id: 'vid-3',
      title: 'Holographic DJ Prism Reactive Loop',
      aspectRatio: '1:1',
      duration: '0:20',
      style: 'DJ Hologram Grid',
      resolution: '1080x1080',
      createdAt: '2 days ago'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Film className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">Video Library & Rendered Clips</h2>
          </div>
          <p className="text-sm text-slate-400">
            Preview, manage, and download your audio-reactive video exports.
          </p>
        </div>

        {onNavigateToCreate && (
          <button
            onClick={onNavigateToCreate}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all"
          >
            <Video className="w-4 h-4" /> Create New Video
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVideos.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 shadow-xl flex flex-col justify-between group hover:border-purple-500/40 transition-all"
          >
            <div>
              {/* Fake Video Preview Box */}
              <div className="relative aspect-video rounded-xl bg-gradient-to-tr from-purple-950/80 via-slate-900 to-cyan-950/80 border border-slate-800 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
                <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                  {v.duration}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-purple-600/60 text-[10px] font-bold text-white">
                  {v.aspectRatio}
                </div>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                {v.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span>{v.style}</span>
                <span>•</span>
                <span>{v.resolution}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">{v.createdAt}</span>
              <button
                onClick={() => addToast('info', 'Video Download', 'Preparing high-bitrate video stream...')}
                className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
