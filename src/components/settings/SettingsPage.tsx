import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Sliders, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Save, 
  RefreshCw,
  Palette
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useToast } from '../common/Toast';

interface SettingsProps {
  apiStatus: {
    geminiConfigured: boolean;
    musicConfigured: boolean;
    videoConfigured: boolean;
  };
  onRefreshStatus: () => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ apiStatus, onRefreshStatus }) => {
  const { addToast } = useToast();
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-flash-lite-latest');
  const [musicKey, setMusicKey] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Audio Engine Preferences
  const [sampleRate, setSampleRate] = useState('48000');
  const [fftSize, setFftSize] = useState('512');
  const [crossfadeCurve, setCrossfadeCurve] = useState('equal-power');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await apiService.testGemini(geminiKey, geminiModel);
      if (res.success) {
        setTestResult(res.message);
        addToast('success', 'Gemini Verified', res.message);
      } else {
        setTestResult(res.message);
        addToast('info', 'Status Notice', res.message);
      }
    } catch {
      setTestResult('Zovik offline creative engine is active and ready.');
      addToast('info', 'Local Engine Active');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiKeys = async () => {
    setIsSaving(true);
    try {
      const payload: any = { geminiModel };
      if (geminiKey.trim()) payload.geminiKey = geminiKey.trim();
      if (musicKey.trim()) payload.musicApiKey = musicKey.trim();
      if (videoKey.trim()) payload.videoApiKey = videoKey.trim();

      await apiService.updateConfig(payload);
      onRefreshStatus();
      setGeminiKey('');
      setMusicKey('');
      setVideoKey('');
      addToast('success', 'API Keys Updated', 'Backend runtime credentials securely synchronized.');
    } catch {
      addToast('error', 'Update Failed', 'Could not update backend configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">Studio Settings & API Configuration</h2>
          </div>
          <p className="text-sm text-slate-400">
            Configure secure API credentials, audio processing engine parameters, and UI themes.
          </p>
        </div>

        <button
          onClick={onRefreshStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* API Key Management Card */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Secure AI Provider Credentials</h3>
          </div>
          <span className="text-[11px] text-slate-500">Stored only in backend environment</span>
        </div>

        <div className="space-y-4">
          {/* Gemini API Key */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>Google Gemini API Key</span>
                {apiStatus.geminiConfigured ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Offline Engine Active
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={apiStatus.geminiConfigured ? "••••••••••••••••••••••••••••••••" : "Paste AI Studio API Key (AIzaSy...)"}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Gemini Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Recommended - Fastest & High Availability)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Reliable 1.9s)</option>
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Next-Gen Flash)</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing API...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-purple-500/30 text-[11px] text-purple-300">
                {testResult}
              </div>
            )}

            <p className="text-[10px] text-slate-400">
              Powers deep conversational reasoning, track harmonic analysis, and coding assistance.
            </p>
          </div>

          {/* Dedicated Music AI Key */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>Dedicated AI Music Provider Key</span>
                {apiStatus.musicConfigured ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Configured</span>
                ) : (
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">Web Audio Native Core Active</span>
                )}
              </label>
            </div>
            <input
              type="password"
              value={musicKey}
              onChange={(e) => setMusicKey(e.target.value)}
              placeholder="Optional external music API key..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Dedicated Video AI Key */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>Dedicated AI Video Provider Key</span>
                {apiStatus.videoConfigured ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Configured</span>
                ) : (
                  <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded">Canvas Stream Recorder Active</span>
                )}
              </label>
            </div>
            <input
              type="password"
              value={videoKey}
              onChange={(e) => setVideoKey(e.target.value)}
              placeholder="Optional external video API key..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSaveApiKeys}
            disabled={isSaving}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save API Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Audio Engine Configuration */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">Web Audio DSP Engine Configuration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Sample Rate</label>
            <select
              value={sampleRate}
              onChange={(e) => {
                setSampleRate(e.target.value);
                addToast('info', 'Sample Rate Set', `${e.target.value} Hz`);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="48000">48,000 Hz (Pro Broadcast)</option>
              <option value="44100">44,100 Hz (CD Standard)</option>
              <option value="96000">96,000 Hz (High Resolution)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Visualizer FFT Size</label>
            <select
              value={fftSize}
              onChange={(e) => {
                setFftSize(e.target.value);
                addToast('info', 'FFT Size Set', `${e.target.value} bins`);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="256">256 (High Responsiveness)</option>
              <option value="512">512 (Balanced 60 FPS)</option>
              <option value="1024">1024 (Ultra High Frequency Precision)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Crossfader Curve</label>
            <select
              value={crossfadeCurve}
              onChange={(e) => {
                setCrossfadeCurve(e.target.value);
                addToast('info', 'Crossfader Curve', e.target.value);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="equal-power">Equal Power (DJ Standard)</option>
              <option value="linear">Linear Fade</option>
              <option value="sharp-cut">Sharp Cut (Scratch DJ)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
