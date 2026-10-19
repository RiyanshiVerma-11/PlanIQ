import React, { useState, useEffect } from 'react';
import { ProductLandingPage } from './components/ProductLandingPage.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { AppWorkspace } from './components/AppWorkspace.tsx';
import type { AuthUser } from './types/auth.ts';

type AppView = 'landing' | 'login' | 'app';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Check URL query parameters or localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as AppView | null;
    const autostart = params.get('autostart');

    // Retrieve saved user session if exists
    try {
      const savedUserStr = localStorage.getItem('planiq_session_user');
      if (savedUserStr) {
        const savedUser: AuthUser = JSON.parse(savedUserStr);
        setAuthUser(savedUser);
        if (viewParam === 'app' || autostart === '1') {
          setCurrentView('app');
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    if (viewParam === 'login') {
      setCurrentView('login');
    } else if (viewParam === 'app') {
      // If autostart or view=app without user, create deterministic demo user
      if (!authUser) {
        const demoUser: AuthUser = {
          email: 'riyanshiverma46@gmail.com',
          name: 'Riyanshi Verma',
          avatarInitials: 'RV',
          role: 'Master Event Director',
          authenticatedAt: new Date().toISOString(),
        };
        setAuthUser(demoUser);
      }
      setCurrentView('app');
    } else {
      setCurrentView('landing');
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    try {
      localStorage.setItem('planiq_session_user', JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
    setCurrentView('app');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('planiq_session_user');
    } catch {
      // Ignore storage errors
    }
    setAuthUser(null);
    setCurrentView('landing');
  };

  const handleQuickStartPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    // If already authenticated, go directly to app with preset
    if (authUser) {
      setCurrentView('app');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased">
      {currentView === 'landing' && (
        <ProductLandingPage
          onGoToLogin={() => setCurrentView('login')}
          onQuickStartPreset={handleQuickStartPreset}
        />
      )}

      {currentView === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setCurrentView('landing')}
          defaultEmail="riyanshiverma46@gmail.com"
        />
      )}

      {currentView === 'app' && authUser && (
        <AppWorkspace
          user={authUser}
          onLogout={handleLogout}
          initialPresetId={selectedPresetId}
        />
      )}
    </div>
  );
}
