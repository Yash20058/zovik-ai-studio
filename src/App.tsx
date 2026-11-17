import React, { useState, useEffect } from 'react';
import { NavTab, UserProfile } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastProvider, useToast } from './components/common/Toast';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthPage } from './components/auth/AuthPage';
import { OnboardingPage } from './components/auth/OnboardingPage';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { DJStudioPage } from './components/dj/DJStudioPage';
import { AIMusicPage } from './components/music/AIMusicPage';
import { AIVideoPage } from './components/video/AIVideoPage';
import { AICodingPage } from './components/code/AICodingPage';
import { AIChatPage } from './components/chat/AIChatPage';
import { AudioLibraryPage } from './components/library/AudioLibraryPage';
import { VideoLibraryPage } from './components/library/VideoLibraryPage';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { apiService, SystemStatus } from './services/apiService';

const AUTH_STORAGE_KEY = 'zovik_auth_user';

function AppContent() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'online',
    version: '2.0.0',
    platform: 'zovik',
    apiKeys: {
      geminiConfigured: false,
      musicConfigured: false,
      videoConfigured: false,
    },
    metrics: { total: 0, chat: 0, music: 0, video: 0, code: 0 },
  });

  const loadStatus = async () => {
    try {
      const s = await apiService.getStatus();
      setSystemStatus(s);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    addToast('success', `Welcome, ${user.name}!`, 'Identity verified. Accessing creative suite.');
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    addToast('success', 'Studio Configured!', 'Your regional and genre preferences are active.');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    addToast('info', 'Logged Out', 'You have been safely signed out of Zovik Studio.');
  };

  // 1. If not logged in -> Show Auth Page (Login / Sign Up / Google / Phone OTP / 18+ Verification / Guidelines)
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. If logged in but hasn't completed onboarding -> Show Onboarding Page (Location & Favorite Song Genres)
  if (!currentUser.hasCompletedOnboarding) {
    return <OnboardingPage user={currentUser} onComplete={handleOnboardingComplete} />;
  }

  // 3. Authenticated & Onboarded -> Render Full Zovik Creative Suite
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080811] text-slate-100 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={systemStatus.apiKeys}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          geminiConfigured={systemStatus.apiKeys.geminiConfigured}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Tab View */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-12">
          {activeTab === 'landing' && (
            <LandingPage
              onGetStarted={() => setActiveTab('dashboard')}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              apiStatus={systemStatus.apiKeys}
            />
          )}

          {activeTab === 'dj-studio' && <DJStudioPage />}

          {activeTab === 'ai-music' && (
            <AIMusicPage
              onSendToDeck={(deck, track) => {
                setActiveTab('dj-studio');
              }}
            />
          )}

          {activeTab === 'ai-video' && <AIVideoPage />}

          {activeTab === 'ai-code' && <AICodingPage />}

          {activeTab === 'ai-chat' && <AIChatPage />}

          {activeTab === 'audio-library' && <AudioLibraryPage />}

          {activeTab === 'video-library' && (
            <VideoLibraryPage onNavigateToCreate={() => setActiveTab('ai-video')} />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage onLoadProject={() => setActiveTab('dj-studio')} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              apiStatus={systemStatus.apiKeys}
              onRefreshStatus={loadStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
}
