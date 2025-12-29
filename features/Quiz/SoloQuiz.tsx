
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question } from '../../types';
import { saveQuizResult } from '../../services/persistenceService';
import { audioService } from '../../services/audioService';

interface SoloQuizProps {
  questions: Question[];
  onFinish: () => void;
}

const SoloQuiz: React.FC<SoloQuizProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const getTimeLimit = (diff: string) => {
    if (diff === 'Facile') return 60;
    if (diff === 'Difficile') return 15;
    return 30;
  };

  const currentDifficulty = questions[0]?.difficulty || 'Moyen';
  const initialTimeLimit = getTimeLimit(currentDifficulty);
  
  const [timeLeft, setTimeLeft] = useState(initialTimeLimit);
  const timerRef = useRef<any>(null);
  const autoNextRef = useRef<any>(null);

  const currentOptions = useMemo(() => {
    if (questions.length === 0 || !questions[currentIndex]) return [];
    const q = questions[currentIndex];
    return q.options.map((opt, originalIdx) => ({ text: opt, originalIdx }))
      .sort(() => Math.random() - 0.5);
  }, [questions, currentIndex]);

  useEffect(() => {
    if (showResult || isAnswered || questions.length === 0 || !questions[currentIndex]) return;

    setTimeLeft(initialTimeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isAnswered, showResult, questions, initialTimeLimit]);

  const handleAutoTimeout = () => {
    setIsAnswered(true);
    setSelectedOption(-1); 
    audioService.playError();
    autoNextRef.current = setTimeout(nextQuestion, 2000);
  };

  const handleAnswer = (originalIdx: number) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);

    setSelectedOption(originalIdx);
    setIsAnswered(true);

    if (originalIdx === questions[currentIndex].correctAnswer) {
      setScore((s) => s + 1);
      audioService.playSuccess();
    } else {
      audioService.playError();
    }

    autoNextRef.current = setTimeout(nextQuestion, 2500);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    saveQuizResult({
      date: new Date().toISOString(),
      score: score,
      total: questions.length,
      mode: 'Solo',
      difficulty: currentDifficulty
    });
    setShowResult(true);
  };

  if (questions.length === 0 || !questions[currentIndex]) return null;

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-slate-950 border-2 border-cyan-500/50 rounded-[3rem] p-12 text-center animate-in zoom-in-95 duration-500 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        <div className="text-7xl mb-6">{percentage >= 80 ? '👑' : percentage >= 50 ? '🛡️' : '🔋'}</div>
        <h2 className="text-4xl font-black mb-2 text-white uppercase tracking-tighter">Mission Terminée</h2>
        <div className="text-7xl font-black text-cyan-400 my-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          {score} / {questions.length}
        </div>
        <p className="text-slate-400 mb-10 text-xl font-medium leading-relaxed">
          {percentage >= 80 ? "Excellente défense ! Votre réseau est impénétrable." : 
           percentage >= 50 ? "Bon travail, agent. Les bases sont acquises." : 
           "Alerte intrusion : renforcez vos connaissances immédiatement !"}
        </p>
        <button onClick={onFinish} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-xl text-white transition-all shadow-xl shadow-cyan-600/30 transform active:scale-95">RETOURNER AU QG</button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
             <span className="text-xs font-black text-cyan-500 uppercase tracking-[0.4em] mono">Analyse en cours...</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Vecteur #{currentIndex + 1}</h3>
        </div>
        
        <div className={`flex flex-col items-center px-8 py-4 rounded-3xl border-2 transition-all ${
          timeLeft <= 5 ? 'border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-cyan-500/30 text-cyan-400 bg-slate-900 shadow-xl'
        }`}>
          <div className="text-4xl font-black font-mono leading-none">{timeLeft}s</div>
          <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mt-1">Chrono</div>
        </div>
      </div>

      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
        <div 
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-cyan-500'}`} 
          style={{ width: `${(timeLeft / initialTimeLimit) * 100}%` }} 
        />
      </div>

      <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* Décoration Grid Cyber */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <p className="text-2xl md:text-3xl mb-12 leading-snug font-bold text-white relative z-10 border-l-8 border-cyan-500 pl-8">
          {q.text}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          {currentOptions.map((opt, idx) => {
            const isSelected = selectedOption === opt.originalIdx;
            const isCorrect = opt.originalIdx === q.correctAnswer;
            
            let style = "bg-slate-950 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900";
            if (isAnswered) {
              if (isCorrect) style = "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.03]";
              else if (isSelected) style = "bg-red-500/20 border-red-500 text-red-400";
              else style = "opacity-30 scale-95 border-transparent";
            }

            return (
              <button key={idx} disabled={isAnswered} onClick={() => handleAnswer(opt.originalIdx)}
                className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center gap-6 group ${style}`}>
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors shrink-0 ${
                  isAnswered && isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg font-bold leading-tight">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-12 animate-in slide-in-from-bottom-6 duration-500">
            <div className="bg-slate-950/80 p-8 rounded-3xl border-2 border-cyan-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-sm">🤖</div>
                 <h4 className="font-black uppercase text-xs tracking-[0.3em] text-cyan-400">CyberAI_Rapport.log</h4>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed italic">
                "{q.explanation}"
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
         <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">System Protected by CyberAI v2.5</span>
      </div>
    </div>
  );
};

export default SoloQuiz;
