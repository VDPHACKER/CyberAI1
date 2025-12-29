
import React, { useMemo } from 'react';
import { AppTab } from '../types';
import { getStats } from '../services/persistenceService';

interface HomeProps {
  onStart: (tab: AppTab) => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  const stats = getStats();

  const securityAdvice = useMemo(() => {
    const advices = [
      "Vérifiez toujours l'adresse email de l'expéditeur, pas seulement son nom.",
      "Un mot de passe de 12 caractères avec symboles prend des siècles à être cracké.",
      "Méfiez-vous des réseaux Wi-Fi publics sans VPN.",
      "Activez l'authentification multi-facteurs partout où c'est possible.",
      "Les mises à jour système corrigent souvent des failles de sécurité critiques."
    ];
    return advices[Math.floor(Math.random() * advices.length)];
  }, []);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Dashboard Contextuel Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900/50 border-2 border-slate-800 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:opacity-20 transition-all">📊</div>
            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Votre Progression</h4>
            <div className="flex items-end gap-2">
               <span className="text-4xl font-black text-white italic">{stats.avgScore}%</span>
               <span className="text-xs text-slate-500 mb-1">Score Global</span>
            </div>
         </div>
         
         <div className="md:col-span-2 bg-cyan-600/10 border-2 border-cyan-500/20 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group flex items-center">
            <div className="absolute top-0 right-0 p-6 text-4xl opacity-10 group-hover:opacity-20 transition-all">💡</div>
            <div>
               <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Conseil Contextuel</h4>
               <p className="text-white text-lg font-medium italic">"{securityAdvice}"</p>
            </div>
         </div>
      </div>

      <section className="text-center py-10">
        <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-none">
          Protégez votre <span className="text-cyan-400 underline decoration-blue-300/50 underline-offset-8">Identité</span> Digitale
        </h2>
        <p className="text-slate-500 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
          Entraînez-vous avec CyberAI pour mieux vous Protégez et Protégez les autres en apprenant à détecter les intrusions et a testez vos réflexes face aux menaces réelles.
        </p>
        <div className="mt-14 flex flex-wrap justify-center gap-6">
          <button 
            onClick={() => onStart(AppTab.AI_CHAT)}
            className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 rounded-[2rem] font-black text-xl text-white transition-all transform hover:scale-105 shadow-2xl shadow-cyan-600/30 italic uppercase tracking-tighter"
          >
            Chat IA Cyber
          </button>
          <button 
            onClick={() => onStart(AppTab.QUIZ)}
            className="px-10 py-5 bg-slate-900 hover:bg-slate-800 rounded-[2rem] font-black text-xl text-white border-2 border-slate-800 transition-all transform hover:scale-105 italic uppercase tracking-tighter"
          >
            Academy & Quiz
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <FeatureCard 
          icon="🛡️" 
          title="Security Labs" 
          description="Outils d'analyse de phishing, mots de passe et logs suspectes."
          onClick={() => onStart(AppTab.TOOLS)}
        />
        <FeatureCard 
          icon="🎮" 
          title="War Games" 
          description="Mini-jeux interactifs de défense DDoS, SQLi et Brute Force."
          onClick={() => onStart(AppTab.GAMES)}
        />
        <FeatureCard 
          icon="🥇" 
          title="Leaderboards" 
          description="Défiez le monde dans l'arène multi-joueurs synchronisée."
          onClick={() => onStart(AppTab.QUIZ)}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, onClick }: { icon: string, title: string, description: string, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-slate-900 border-2 border-slate-800 p-10 rounded-[3.5rem] hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl hover:-translate-y-2 duration-300"
  >
    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform inline-block drop-shadow-lg">{icon}</div>
    <h3 className="text-2xl font-black mb-3 text-white italic uppercase tracking-tighter">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-medium">{description}</p>
  </div>
);

export default Home;
