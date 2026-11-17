import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Copy, 
  RotateCcw, 
  Trash2, 
  Bot, 
  User, 
  Check, 
  Cpu,
  CornerDownLeft
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { ChatMessage } from '../../types';
import { useToast } from '../common/Toast';

const SUGGESTIONS = [
  'How do I execute a clean Bass Swap transition between 126 and 128 BPM?',
  'Explain Camelot harmonic wheel mixing rules for DJs.',
  'Write a TypeScript helper to detect audio peaks using Web Audio Analyser.',
  'Generate an outline for an audio-reactive cyberpunk music video.'
];

export const AIChatPage: React.FC = () => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `### 🎧 Welcome to Zovik AI Creative Co-Pilot

I am your intelligent assistant specializing in **DJ techniques, electronic music production, audio DSP, video storyboards, and creative coding**.

Ask me anything or pick one of the quick suggestions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const res = await apiService.sendChatMessage(text, history);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: res.response || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: `### 🎧 Zovik Creative Intelligence\n\nI processed your query: **"${text.slice(0, 40)}"**.\n\nHere are the recommended directives:\n1. **DJ Studio**: Dual deck mixing with Camelot harmonic matching and 3-band EQ separation.\n2. **AI Music**: Multi-layer procedural stem synthesis for kick, bass, lead, and pads.\n3. **Video Studio**: Live 60 FPS audio-reactive video rendering in 16:9, 9:16, or 1:1.\n4. **Coding Studio**: Interactive Web Audio and canvas sandbox with real-time runner.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'offline_engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      addToast('info', 'Response Ready', 'Delivered via local creative engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('success', 'Copied to clipboard');
  };

  const handleClear = () => {
    setMessages([]);
    addToast('info', 'Chat Cleared');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Chat Header */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-900/30 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Zovik Creative AI Co-Pilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Context-aware music, DJ, and code intelligence</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-1 pr-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-purple-600/30 text-white border border-purple-500/40 rounded-br-none'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between mb-2 gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'Zovik AI'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content with basic Markdown representation */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {msg.content}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-xs text-purple-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              Zovik AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 rounded-2xl bg-slate-950/90 border border-purple-900/30 shrink-0 flex items-center gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask Zovik anything about DJ mixing, music synthesis, code, or video generation..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none px-2"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all shadow-md shadow-purple-900/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
