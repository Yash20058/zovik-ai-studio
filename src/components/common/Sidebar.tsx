import React from 'react';
import { 
  Disc3, 
  Sparkles, 
  Video, 
  Code2, 
  MessageSquare, 
  Music, 
  Film, 
  FolderKanban, 
  Settings, 
  LayoutDashboard,
  Home,
  Sliders,
  Cpu,
  LogOut,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { NavTab, UserProfile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  apiStatus: {
    geminiConfigured: boolean;
    musicConfigured: boolean;
    videoConfigured: boolean;
  };
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  apiStatus,
  currentUser,
  onLogout 
}) => {
  const { t } = useLanguage();
  const navItems = [

    { id: 'landing' as NavTab, label: 'Home Page', icon: Home, badge: '' },
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: '' },
    { id: 'dj-studio' as NavTab, label: 'DJ Music Studio', icon: Disc3, badge: 'PRO' },
    { id: 'ai-music' as NavTab, label: 'AI Music Generator', icon: Music, badge: 'AI' },
    { id: 'ai-video' as NavTab, label: 'AI Video Generator', icon: Video, badge: 'AI' },
    { id: 'ai-code' as NavTab, label: 'AI Coding Studio', icon: Code2, badge: 'RUN' },
    { id: 'ai-chat' as NavTab, label: 'AI Creative Chat', icon: MessageSquare, badge: '' },
    { id: 'audio-library' as NavTab, label: 'Audio Library', icon: Sliders, badge: '' },
    { id: 'video-library' as NavTab, label: 'Video Library', icon: Film, badge: '' },
    { id: 'projects' as NavTab, label: 'Projects', icon: FolderKanban, badge: '' },
    { id: 'settings' as NavTab, label: 'Settings & API', icon: Settings, badge: '' },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-purple-900/20 flex flex-col h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div 
        onClick={() => setActiveTab('landing')}
        className="p-5 flex items-center gap-3 cursor-pointer border-b border-purple-900/20 group transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
          <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-wider text-white">zovik</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-transparent text-white border-l-2 border-purple-500 shadow-md shadow-purple-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    item.badge === 'PRO'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : item.badge === 'AI'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* API Key Status Footer */}
      <div className="p-4 border-t border-purple-900/20 bg-slate-950/40">
        <div 
          onClick={() => setActiveTab('settings')}
          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Providers
            </span>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                apiStatus.geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Gemini LLM:</span>
              <span className={apiStatus.geminiConfigured ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {apiStatus.geminiConfigured ? 'Active' : 'Offline Engine'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Web Audio FX:</span>
              <span className="text-cyan-400 font-medium">Ready (Native)</span>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        {currentUser && (
          <div className="mt-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-purple-500/40 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span className="truncate">{currentUser.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 font-semibold border border-purple-500/30">
                    18+
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                  {currentUser.location ? (
                    <>
                      <MapPin className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{currentUser.location.split(' ')[0]}</span>
                    </>
                  ) : (
                    <span>{currentUser.email || currentUser.phone || 'DJ Creator'}</span>
                  )}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title={t('auth.logout', 'Log Out')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
