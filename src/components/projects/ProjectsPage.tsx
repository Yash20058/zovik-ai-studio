import React, { useState } from 'react';
import { FolderKanban, Plus, Clock, Disc3, Trash2, ArrowRight, Save, Check } from 'lucide-react';
import { useToast } from '../common/Toast';

interface SavedProject {
  id: string;
  name: string;
  deckATrack: string;
  deckBTrack: string;
  bpm: number;
  lastEdited: string;
}

export const ProjectsPage: React.FC<{ onLoadProject?: (proj: SavedProject) => void }> = ({ onLoadProject }) => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState<SavedProject[]>([
    {
      id: 'proj-1',
      name: 'Midnight Cyberpunk Mix Set 01',
      deckATrack: 'Cyberpunk Voltage (126 BPM)',
      deckBTrack: 'Neon Horizon (128 BPM)',
      bpm: 128,
      lastEdited: 'Today, 11:15 AM'
    },
    {
      id: 'proj-2',
      name: 'DnB Liquid Velocity Mashup',
      deckATrack: 'Liquid Velocity (174 BPM)',
      deckBTrack: 'Deep Midnight Groove (124 BPM)',
      bpm: 174,
      lastEdited: '2 days ago'
    }
  ]);

  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj: SavedProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      deckATrack: 'Cyberpunk Voltage (126 BPM)',
      deckBTrack: 'Neon Horizon (128 BPM)',
      bpm: 128,
      lastEdited: 'Just now'
    };
    setProjects([newProj, ...projects]);
    setNewProjectName('');
    addToast('success', 'Project Saved', `${newProj.name} created.`);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Project Removed');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">Project Workspaces & Sessions</h2>
          </div>
          <p className="text-sm text-slate-400">
            Save, restore, and collaborate on your DJ mixer and creative coding projects.
          </p>
        </div>

        {/* Quick Save Project */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New Project Title..."
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleCreateProject}
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Save className="w-4 h-4" /> Save Session
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 shadow-xl flex flex-col justify-between group hover:border-purple-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Disc3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                  {proj.bpm} BPM
                </span>
              </div>

              <h3 className="font-bold text-white text-sm mb-2 group-hover:text-purple-300 transition-colors">
                {proj.name}
              </h3>

              <div className="space-y-1 text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                <div className="truncate"><span className="text-cyan-400 font-semibold">Deck A:</span> {proj.deckATrack}</div>
                <div className="truncate"><span className="text-purple-400 font-semibold">Deck B:</span> {proj.deckBTrack}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {proj.lastEdited}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (onLoadProject) onLoadProject(proj);
                    addToast('success', 'Project Restored', `${proj.name} loaded into DJ Studio`);
                  }}
                  className="py-1 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 transition-all"
                >
                  Load <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
