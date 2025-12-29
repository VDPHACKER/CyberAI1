
import React, { useState, useEffect } from 'react';
import { AppTab, UserPreferences } from './types';
import Layout from './components/Layout';
import Home from './features/Home';
import AIChat from './features/AIChat';
import QuizContainer from './features/Quiz/QuizContainer';
import SecurityTools from './features/Tools/SecurityTools';
import GamesHub from './features/Games/GamesHub';
import About from './features/About';
import { getPreferences, savePreferences } from './services/persistenceService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());

  useEffect(() => {
    // Apply theme to document root
    if (prefs.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    }
    savePreferences(prefs);
  }, [prefs]);

  const toggleTheme = () => {
    setPrefs(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const goHome = () => setActiveTab(AppTab.HOME);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME: return <Home onStart={setActiveTab} />;
      case AppTab.AI_CHAT: return <AIChat onBack={goHome} />;
      case AppTab.QUIZ: return <QuizContainer onBack={goHome} />;
      case AppTab.TOOLS: return <SecurityTools onBack={goHome} />;
      case AppTab.GAMES: return <GamesHub onBack={goHome} />;
      case AppTab.ABOUT: return <About onBack={goHome} />;
      default: return <Home onStart={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} theme={prefs.theme} onToggleTheme={toggleTheme}>
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
