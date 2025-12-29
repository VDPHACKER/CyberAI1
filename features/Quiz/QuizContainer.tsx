
import React, { useState, useEffect } from 'react';
import { QuizMode, Question, QuizHistoryEntry, UserPreferences } from '../../types';
import { generateQuizQuestions } from '../../services/geminiService';
import { getStats, getQuizHistory, clearQuizHistory, getPreferences, savePreferences } from '../../services/persistenceService';
import SoloQuiz from './SoloQuiz';
import MultiQuiz from './MultiQuiz';

const CyberLoading = ({ progress }: { progress: number }) => (
    <div className="flex flex-col items-center justify-center py-40 space-y-10 animate-in fade-in bg-slate-950 rounded-[3rem] border-2 border-cyan-500/20 shadow-2xl w-full max-w-2xl mx-auto">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-8 border-cyan-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#06b6d4]"></div>
        <div className="absolute inset-4 border-4 border-blue-500 border-b-transparent rounded-full animate-spin-slow opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center font-black text-cyan-400 mono text-xl">
          {Math.round(progress)}%
        </div>
      </div>
      <div className="text-center w-full px-12">
        <p className="text-cyan-400 font-black uppercase tracking-[0.5em] text-xl animate-pulse italic mb-6">Initialisation Quiz...</p>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
           <div className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex gap-1 justify-center mt-6">
           {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
        </div>
      </div>
    </div>
);

interface QuizContainerProps {
  onBack: () => void;
}

const QuizContainer: React.FC<QuizContainerProps> = ({ onBack }) => {
  const [mode, setMode] = useState<QuizMode>(QuizMode.IDLE);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const [config, setConfig] = useState({ 
    count: prefs.defaultQuizCount, 
    difficulty: prefs.defaultQuizDifficulty 
  });
  
  const [localStats, setLocalStats] = useState(getStats());
  const [history, setHistory] = useState<QuizHistoryEntry[]>(getQuizHistory());

  useEffect(() => {
    savePreferences({ ...prefs, defaultQuizCount: config.count, defaultQuizDifficulty: config.difficulty });
  }, [config, prefs]);

  const startSolo = async (totalRequested: number, difficulty: string) => {
    setIsLoading(true);
    setLoadingProgress(5);
    setQuestions([]);
    
    try {
      // Stratégie de chargement parallèle pour plus de 500 questions potentielles
      // On divise en lots de 15 questions pour optimiser la réponse JSON de Gemini
      const batchSize = 15;
      const totalBatches = Math.ceil(totalRequested / batchSize);
      const batchRequests = [];

      for (let i = 0; i < totalBatches; i++) {
        const countForThisBatch = Math.min(batchSize, totalRequested - (i * batchSize));
        batchRequests.push(
          generateQuizQuestions(countForThisBatch, difficulty).then(q => {
            setLoadingProgress(prev => Math.min(95, prev + (90 / totalBatches)));
            return q;
          })
        );
      }

      // Exécution parallèle des requêtes
      const results = await Promise.all(batchRequests);
      const allQuestions = results.flat();
      
      if (allQuestions.length === 0) throw new Error("Génération échouée");
      
      setQuestions(allQuestions);
      setLoadingProgress(100);
      
      // Petit délai pour l'effet visuel de fin de chargement
      setTimeout(() => {
        setMode(QuizMode.SOLO_PLAY);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error(error);
      alert("Erreur de déploiement. Réseau CyberAI saturé. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  if (isLoading) return <CyberLoading progress={loadingProgress} />;
  if (mode === QuizMode.SOLO_PLAY) return <SoloQuiz questions={questions} onFinish={() => setMode(QuizMode.IDLE)} />;
  if (mode === QuizMode.MULTI_LOBBY || mode === QuizMode.MULTI_PLAY) return <MultiQuiz onExit={() => setMode(QuizMode.IDLE)} />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-cyan-500 transition-colors font-black text-[10px] uppercase tracking-[0.3em] w-fit px-2">
        <span className="text-xl">←</span> Retour au Hub
      </button>

      <div className="text-center space-y-4">
        <h2 className="text-6xl font-black mb-2 text-white italic tracking-tighter uppercase drop-shadow-lg">
          CyberAI Academy Quiz
        </h2>
        <div className="flex items-center justify-center gap-4">
           <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-500"></div>
           <p className="text-cyan-500 font-black uppercase tracking-[0.3em] text-xs">Quiz Interactive sur la Cybersécurité</p>
           <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-500"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-[3.5rem] shadow-2xl hover:border-cyan-500/40 transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 group-hover:opacity-10 transition-all">🎯</div>
          <div>
            <h3 className="text-4xl font-black mb-10 text-white uppercase italic tracking-tighter">Mode Solo</h3>
            <div className="space-y-10 mb-12">
              <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between mb-4 text-xs font-black text-slate-500 tracking-[0.2em] uppercase">
                  <span>Volume du Quiz</span>
                  <span className="text-cyan-400 font-mono text-xl">{config.count} questions</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5" 
                  value={config.count} 
                  onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})} 
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500" 
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-600 font-bold">
                   <span>5</span>
                   <span>50</span>
                   <span>100</span>
                </div>
              </div>
              <div className="flex gap-3">
                {['Facile', 'Moyen', 'Difficile'].map(d => (
                  <button key={d} onClick={() => setConfig({...config, difficulty: d})} className={`flex-1 py-4 rounded-2xl text-xs font-black border-2 transition-all ${config.difficulty === d ? 'bg-cyan-600 border-cyan-400 text-white shadow-xl scale-105' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-cyan-500/30'}`}>{d.toUpperCase()}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => startSolo(config.count, config.difficulty)} className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl font-black text-2xl transition-all shadow-2xl shadow-cyan-600/30 active:scale-95 italic tracking-tighter uppercase">Jouez</button>
        </div>

        <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-[3.5rem] shadow-2xl hover:border-blue-500/40 transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 group-hover:opacity-10 transition-all">⚔️</div>
          <div>
            <h3 className="text-4xl font-black mb-10 text-white uppercase italic tracking-tighter">Mode Multijoueurs</h3>
            <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">Multi-joueurs synchronisé. <br/>Défiez d'autres joueurs en temps réel sur des quiz sur la cybersécurité.</p>
          </div>
          <button onClick={() => setMode(QuizMode.MULTI_LOBBY)} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-2xl transition-all shadow-2xl shadow-blue-600/30 italic tracking-tighter uppercase">Ouvrir</button>
        </div>
      </div>
      
      <div className="bg-slate-950 p-10 rounded-[4rem] border-2 border-slate-800 shadow-inner">
         <h4 className="font-black mb-10 flex justify-between items-center text-white italic text-xl uppercase tracking-tighter">
            <span>Archive des Missions</span>
            <div className="flex items-center gap-2 bg-slate-900 px-6 py-2 rounded-full border border-white/5">
               <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">XP Record :</span>
               <span className="text-cyan-400 font-black mono">{localStats.bestSolo}</span>
            </div>
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {history.slice(0, 3).map((h, i) => (
              <div key={i} className="p-6 bg-slate-900 rounded-[2rem] border-2 border-slate-800 flex flex-col hover:border-cyan-500/20 transition-colors">
                <span className="text-[10px] font-black text-cyan-500 mb-2 tracking-[0.3em]">{h.mode.toUpperCase()}</span>
                <span className="text-xl font-bold text-white mb-4 italic">{h.difficulty || 'Multi'}</span>
                <div className="flex items-end justify-between">
                   <span className="text-4xl font-black text-white">{h.score}</span>
                   <span className="text-xs font-black text-slate-500 pb-1">/ {h.total} XP</span>
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="col-span-3 text-center text-slate-600 py-10 italic text-lg font-medium">Initialisation des logs...</p>}
         </div>
      </div>
    </div>
  );
};

export default QuizContainer;
