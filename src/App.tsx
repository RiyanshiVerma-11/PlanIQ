import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ProductLandingPage } from './components/ProductLandingPage.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import type { AuthUser } from './types/auth.ts';

// Code-split heavy workspace and login views for high efficiency & minimal initial bundle
const LoginPage = lazy(() =>
  import('./components/LoginPage.tsx').then((m) => ({ default: m.LoginPage }))
);
const AppWorkspace = lazy(() =>
  import('./components/AppWorkspace.tsx').then((m) => ({ default: m.AppWorkspace }))
);

const ViewLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#080b14] text-amber-400">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Loading Studio Engine...</span>
    </div>
  </div>
);

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
    if (!authUser) {
      const demoUser: AuthUser = {
        email: 'director@planiq.studio',
        name: 'Guest Planner',
        avatarInitials: 'GP',
        role: 'Event Strategist',
        authenticatedAt: new Date().toISOString(),
      };
      setAuthUser(demoUser);
    }
    setCurrentView('app');
  };

  const handleLaunchStudioDirectly = () => {
    if (!authUser) {
      const demoUser: AuthUser = {
        email: 'director@planiq.studio',
        name: 'Guest Planner',
        avatarInitials: 'GP',
        role: 'Event Strategist',
        authenticatedAt: new Date().toISOString(),
      };
      setAuthUser(demoUser);
    }
    setCurrentView('app');
  };

  return (
    <ErrorBoundary fallbackTitle="PlanIQ Application Error">
      <div className="min-h-screen bg-[#080b14] text-slate-100 font-sans antialiased">
        {currentView === 'landing' && (
          <ProductLandingPage
            onGoToLogin={() => setCurrentView('login')}
            onQuickStartPreset={handleQuickStartPreset}
            onLaunchStudioDirectly={handleLaunchStudioDirectly}
          />
        )}

        {currentView === 'login' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setCurrentView('landing')}
              defaultEmail="riyanshiverma46@gmail.com"
            />
          </Suspense>
        )}

        {currentView === 'app' && authUser && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AppWorkspace
              user={authUser}
              onLogout={handleLogout}
              initialPresetId={selectedPresetId}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}
