import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AgentChat = lazy(() => import('./pages/AgentChat').then(m => ({ default: m.AgentChat })));
const TaskMonitor = lazy(() => import('./pages/TaskMonitor').then(m => ({ default: m.TaskMonitor })));
const BrandManager = lazy(() => import('./pages/BrandManager').then(m => ({ default: m.BrandManager })));
const GuidePage = lazy(() => import('./pages/GuidePage').then(m => ({ default: m.GuidePage })));

// Legacy components (kept for backward compatibility)
import Hero from './components/Hero';
import AgentsGrid from './components/AgentsGrid';
import Onboarding from './components/Onboarding';

// Import services
import { orchestratorEngine } from './services/orchestratorEngine';
import { aiService } from './services/aiService';
import { databaseService } from './services/databaseService';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  // Views: home, dashboard, chat, tasks, brands, onboarding, legacy-hero, legacy-agents

  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [masterContext, setMasterContext] = useState(null);
  const [systemReady, setSystemReady] = useState(false);
  const [chatSessions, setChatSessions] = useState({}); // { agentId: Array of messages }

  // Load Master Context from localStorage on mount
  useEffect(() => {
    console.log('🗄️  Database Service Status:', databaseService.getStatus());

    const savedContext = localStorage.getItem('socialFactory_masterContext');
    if (savedContext) {
      try {
        const context = JSON.parse(savedContext);
        setMasterContext(context);
        orchestratorEngine.setMasterContext(context);
        aiService.initialize(context);
        setSystemReady(true);
      } catch (error) {
        console.error('Failed to load Master Context:', error);
      }
    }
  }, []);

  // Navigation Handlers
  const handleSelectCluster = (clusterId) => {
    setSelectedCluster(clusterId);
    setCurrentView('dashboard');
  };

  const handleSelectAgent = (agentId) => {
    setSelectedAgent(agentId);
    setCurrentView('chat');
  };

  const handleSelectBrand = (brandId) => {
    setSelectedBrand(brandId);
  };

  const handleStartOnboarding = () => {
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = (context) => {
    localStorage.setItem('socialFactory_masterContext', JSON.stringify(context));
    setMasterContext(context);
    orchestratorEngine.setMasterContext(context);
    aiService.initialize(context);
    setSystemReady(true);
    alert(`✅ Onboarding Complete!\n\nBrand: ${context.brandNameTh}\nSystem is ready to help you!`);
    setCurrentView('home');
  };

  const handleOnboardingCancel = () => {
    setCurrentView('home');
  };

  const handleOnboardingSkip = (defaultContext) => {
    localStorage.setItem('socialFactory_masterContext', JSON.stringify(defaultContext));
    setMasterContext(defaultContext);
    orchestratorEngine.setMasterContext(defaultContext);
    aiService.initialize(defaultContext);
    setSystemReady(true);
    alert(`ℹ️ System Ready!\n\nYou're using default brand settings.\nYou can setup your brand details later by clicking "Setup Brand" in the header.`);
    setCurrentView('home');
  };

  const handleBack = () => {
    if (currentView === 'chat') {
      setCurrentView('dashboard');
      // Keep selectedAgent/Cluster so we can return to the same state
    } else if (currentView === 'dashboard') {
      setSelectedCluster(null);
      setCurrentView('home');
    } else {
      setSelectedCluster(null);
      setSelectedAgent(null);
      setCurrentView('home');
    }
  };

  const updateChatMessages = (agentId, messages) => {
    setChatSessions(prev => ({
      ...prev,
      [agentId]: messages
    }));
  };

  // Render different views
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            onSelectCluster={handleSelectCluster}
            onStartOnboarding={handleStartOnboarding}
            isLoggedIn={systemReady && masterContext && !masterContext.isDefault}
            onOpenGuide={() => setCurrentView('guide')}
          />
        );

      case 'guide':
        return (
          <GuidePage
            onBack={() => setCurrentView('home')}
            onStartChat={() => setCurrentView('home')}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            clusterId={selectedCluster}
            onBack={handleBack}
            onSelectAgent={handleSelectAgent}
            masterContext={masterContext}
          />
        );

      case 'chat':
        return (
          <AgentChat
            agentId={selectedAgent}
            onBack={handleBack}
            masterContext={masterContext}
            initialMessages={chatSessions[selectedAgent]}
            onMessagesUpdate={(msgs) => updateChatMessages(selectedAgent, msgs)}
          />
        );

      case 'tasks':
        return (
          <TaskMonitor onBack={handleBack} />
        );

      case 'brands':
        return (
          <BrandManager
            masterContext={masterContext}
            onBack={handleBack}
            onSelectBrand={handleSelectBrand}
          />
        );

      case 'onboarding':
        return (
          <Onboarding
            onComplete={handleOnboardingComplete}
            onCancel={handleOnboardingCancel}
            onSkip={handleOnboardingSkip}
          />
        );

      // Legacy views (kept for backward compatibility)
      case 'legacy-hero':
        return (
          <Hero
            onSelectCluster={handleSelectCluster}
            onStartOnboarding={handleStartOnboarding}
          />
        );

      case 'legacy-agents':
        return (
          <AgentsGrid
            clusterId={selectedCluster}
            onBack={handleBack}
            onSelectAgent={handleSelectAgent}
            masterContext={masterContext}
          />
        );

      default:
        return (
          <HomePage
            onSelectCluster={handleSelectCluster}
            onStartOnboarding={handleStartOnboarding}
            isLoggedIn={systemReady && masterContext}
          />
        );
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <div className="w-12 h-12 border-4 border-[#5E9BEB] border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#EFF2F9] flex flex-col overflow-hidden">
      {/* Main Content — no global header, each page handles its own nav */}
      <main className="w-full flex-1 overflow-auto relative">
        <Suspense fallback={<LoadingSpinner />}>
          {renderView()}
        </Suspense>
      </main>
    </div>
  );
};

export default App;