import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';

// Pages
const HomePage  = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const Workspace = lazy(() => import('./pages/Workspace').then(m => ({ default: m.Workspace })));
const GuidePage = lazy(() => import('./pages/GuidePage').then(m => ({ default: m.GuidePage })));

// Services
import { orchestratorEngine } from './services/orchestratorEngine';
import { aiService } from './services/aiService';
import { databaseService } from './services/databaseService';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: '#EFF2F9' }}>
    <div className="w-12 h-12 border-4 border-[#5E9BEB] border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  // Views: 'home' | 'workspace' | 'guide'
  const [currentView, setCurrentView] = useState('home');
  const [masterContext, setMasterContext] = useState(null);

  // Load saved brand context on mount
  useEffect(() => {
    console.log('🗄️  DB Status:', databaseService.getStatus());
    const saved = localStorage.getItem('socialFactory_masterContext');
    if (saved) {
      try {
        const ctx = JSON.parse(saved);
        setMasterContext(ctx);
        orchestratorEngine.setMasterContext(ctx);
        aiService.initialize(ctx);
      } catch (err) {
        console.error('Failed to load Master Context:', err);
      }
    }
  }, []);

  // Update context (from Workspace brand popup)
  const handleContextUpdate = (ctx) => {
    setMasterContext(ctx);
    orchestratorEngine.setMasterContext(ctx);
    aiService.initialize(ctx);
  };

  // ── Routing ──────────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onStart={() => setCurrentView('workspace')}
          />
        );

      case 'workspace':
        return (
          <Workspace
            masterContext={masterContext}
            onContextUpdate={handleContextUpdate}
            onOpenGuide={() => setCurrentView('guide')}
          />
        );

      case 'guide':
        return (
          <GuidePage
            onBack={() => setCurrentView('workspace')}
            onStartChat={() => setCurrentView('workspace')}
          />
        );

      default:
        return <HomePage onStart={() => setCurrentView('workspace')} />;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden" style={{ background: '#EFF2F9' }}>
      <Suspense fallback={<LoadingSpinner />}>
        {renderView()}
      </Suspense>
    </div>
  );
};

export default App;
