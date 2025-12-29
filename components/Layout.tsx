
import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';
import { audioService } from '../services/audioService';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children, theme, onToggleTheme }) => {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const tabs = [
    { id: AppTab.HOME, label: 'Accueil', icon: '🏠' },
    { id: AppTab.AI_CHAT, label: 'Expert', icon: '🤖' },
    { id: AppTab.QUIZ, label: 'Quiz', icon: '❓' },
    { id: AppTab.TOOLS, label: 'Outils', icon: '🛠️' },
    { id: AppTab.GAMES, label: 'Jeux', icon: '🎮' },
    { id: AppTab.ABOUT, label: 'Infos', icon: 'ℹ️' },
  ];

  const isDark = theme === 'dark';

  const handleToggleMusic = () => {
    const newState = !isMusicOn;
    setIsMusicOn(newState);
    audioService.toggleBackgroundMusic(newState);
    if (newState) {
        audioService.setBackgroundVolume(volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audioService.setBackgroundVolume(newVol);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 py-2 md:py-3 transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => setActiveTab(AppTab.HOME)}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-lg md:text-xl shadow-lg shadow-cyan-500/20 cursor-pointer">
              🛡️
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 cursor-pointer">
              CyberAI
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            <nav className="hidden lg:flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-cyan-600 text-white shadow-lg' 
                    : `${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={handleToggleMusic}
                  className={`text-base md:text-lg transition-transform active:scale-90 ${isMusicOn ? 'text-cyan-500' : 'text-slate-400 opacity-50'}`}
                >
                  {isMusicOn ? '🔊' : '🔇'}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-12 md:w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            <button 
              onClick={onToggleTheme}
              className={`p-1.5 md:p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Nav - Fixed at bottom */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-1 py-2 flex justify-around items-center z-[100] transition-colors safe-area-bottom shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center flex-1 py-1 rounded-xl transition-all active:scale-95 ${
              activeTab === tab.id ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-500'
            }`}
          >
            <span className="text-lg md:text-xl">{tab.icon}</span>
            <span className="text-[9px] md:text-[10px] font-bold mt-1 uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
