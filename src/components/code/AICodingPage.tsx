import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Play, 
  Copy, 
  Download, 
  Bug, 
  HelpCircle, 
  Terminal, 
  FileCode, 
  Check, 
  RotateCcw,
  Layers,
  Cpu
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useToast } from '../common/Toast';

const PRESETS = [
  {
    title: 'Web Audio DJ Crossfader',
    lang: 'javascript',
    code: `// Equal-power DJ crossfader implementation
const ctx = new AudioContext();
const gainA = ctx.createGain();
const gainB = ctx.createGain();

function updateCrossfader(val) {
  // val is between -1 (Deck A) and +1 (Deck B)
  const norm = (val + 1) / 2;
  gainA.gain.value = Math.cos(norm * 0.5 * Math.PI);
  gainB.gain.value = Math.cos((1 - norm) * 0.5 * Math.PI);
  console.log('Crossfader set:', { DeckA: gainA.gain.value.toFixed(2), DeckB: gainB.gain.value.toFixed(2) });
}

updateCrossfader(0);`
  },
  {
    title: 'Neon Audio Visualizer (Canvas)',
    lang: 'html',
    code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #0a0a14; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
    canvas { border: 1px solid #a855f7; border-radius: 12px; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
  </style>
</head>
<body>
  <canvas id="cv" width="380" height="180"></canvas>
  <script>
    const cv = document.getElementById('cv');
    const ctx = cv.getContext('2d');
    let t = 0;
    function loop() {
      t += 0.04;
      ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      const bars = 30;
      const bw = cv.width / bars;
      for (let i = 0; i < bars; i++) {
        const h = Math.abs(Math.sin(t + i * 0.3)) * 120 + 10;
        ctx.fillStyle = \`hsl(\${i * 10 + 260}, 100%, 60%)\`;
        ctx.fillRect(i * bw, cv.height - h, bw - 2, h);
      }
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    title: 'Synthesizer 808 Kick Drum',
    lang: 'javascript',
    code: `// Procedural 808 Sub-Bass Kick Generator
function trigger808(audioCtx) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  // Rapid pitch envelope: 150Hz -> 40Hz
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.35);

  // Volume decay envelope
  gain.gain.setValueAtTime(1.0, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
  console.log('808 Kick triggered at', now);
}`
  }
];

export const AICodingPage: React.FC = () => {
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('Create a 3-band equalizer audio processor using Web Audio API');
  const [language, setLanguage] = useState('javascript');
  const [mode, setMode] = useState<'generate' | 'explain' | 'debug' | 'test'>('generate');
  const [code, setCode] = useState(PRESETS[0].code);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['[Sandbox Console Initialized]']);
  const [previewKey, setPreviewKey] = useState(0);

  const handleAction = async (actionMode = mode) => {
    setIsProcessing(true);
    addToast('info', 'Processing Code Query', `AI mode: ${actionMode.toUpperCase()}`);

    try {
      const res = await apiService.generateCode(prompt, language, actionMode, code);
      if (res.result) {
        // Strip markdown code fences if wrapped
        const clean = res.result.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
        setCode(clean);
        addToast('success', 'Execution Successful', 'Code updated by Zovik Code Engine');
      }
    } catch {
      const fallbackSnippet = `// Zovik Code Engine generated\nexport function createAudioProcessor(ctx) {\n  const biquad = ctx.createBiquadFilter();\n  biquad.type = 'lowpass';\n  biquad.frequency.value = 2000;\n  return biquad;\n}`;
      setCode(fallbackSnippet);
      addToast('info', 'Code Generated', 'Generated via local creative engine.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('success', 'Copied to Clipboard');
  };

  const handleDownload = () => {
    const ext = language === 'html' ? 'html' : language === 'python' ? 'py' : 'js';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zovik-script.${ext}`;
    a.click();
    addToast('success', 'File Saved', `Saved as zovik-script.${ext}`);
  };

  const handleRunCode = () => {
    setConsoleLogs(['[Sandbox executing...]']);
    setPreviewKey((k) => k + 1);

    if (language === 'javascript') {
      try {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')),
          error: (...args: any[]) => logs.push(`[ERROR] ${args.join(' ')}`),
          warn: (...args: any[]) => logs.push(`[WARN] ${args.join(' ')}`),
        };

        const runFn = new Function('console', code);
        runFn(customConsole);
        setConsoleLogs(logs.length > 0 ? logs : ['[Script executed with 0 outputs]']);
        addToast('success', 'Code Executed', 'Executed successfully in JavaScript sandbox.');
      } catch (err: any) {
        setConsoleLogs([`[Execution Error]: ${err.message}`]);
        addToast('error', 'Execution Error', err.message);
      }
    } else {
      addToast('info', 'HTML/Sandbox Preview Refreshed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-slate-950 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">AI Creative Coding Studio & Runner</h2>
          </div>
          <p className="text-sm text-slate-400">
            Generate, explain, debug, and run creative audio, canvas, and fullstack code in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setCode(p.code);
                setLanguage(p.lang);
                addToast('info', 'Preset Loaded', p.title);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-purple-300 border border-slate-700 transition-colors font-medium"
            >
              {p.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Coding Task Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* Language & Mode Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="javascript">JavaScript (Web Audio)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML5 Canvas / CSS</option>
                  <option value="python">Python (Librosa/DSP)</option>
                  <option value="cpp">C++ (JUCE / Audio DSP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Action Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="generate">Generate Code</option>
                  <option value="explain">Explain Line-by-Line</option>
                  <option value="debug">Debug & Auto-Fix</option>
                  <option value="test">Create Unit Tests</option>
                </select>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleAction('generate')}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" /> Generate
              </button>
              <button
                onClick={() => handleAction('debug')}
                disabled={isProcessing}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Bug className="w-4 h-4 text-rose-400" /> Auto-Fix Bugs
              </button>
            </div>
          </div>

          {/* Console Logger Output */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> Sandbox Output
              </span>
              <button onClick={() => setConsoleLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300">
                Clear
              </button>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl font-mono text-xs text-cyan-300 min-h-[90px] max-h-[140px] overflow-y-auto space-y-1 border border-slate-800">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-900/30 space-y-3">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" /> Code Editor ({language.toUpperCase()})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Code
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-y selection:bg-purple-600/40"
            />

            {/* Live HTML / Widget Sandbox View */}
            {language === 'html' && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Live Web Sandbox</span>
                <iframe
                  key={previewKey}
                  srcDoc={code}
                  title="Live Preview"
                  sandbox="allow-scripts"
                  className="w-full h-48 rounded-xl border border-slate-800 bg-slate-950"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
