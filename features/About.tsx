
import React, { useState, useEffect } from 'react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&bgcolor=020617&color=0ea5e9`;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-500 hover:text-cyan-500 transition-colors font-black text-[10px] uppercase tracking-[0.3em] w-fit px-2"
      >
        <span className="text-xl">←</span> Retour au Hub
      </button>

      <section className="text-center">
        <h2 className="text-6xl font-black mb-6 italic tracking-tighter uppercase text-white drop-shadow-lg">
          CyberAI Academy
        </h2>
        <p className="text-slate-500 text-xl leading-relaxed max-w-2xl mx-auto font-medium">
          Démocratiser la cybersécurité par l'IA. Un projet VDPHACKER.
        </p>
      </section>

      {/* Section QR Code & Installation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border-2 border-cyan-500/20 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center">
          <h3 className="text-xl font-black text-cyan-400 uppercase italic mb-6 tracking-widest">Scanner {"&"} Partager</h3>
          <div className="p-4 bg-white rounded-3xl mb-6 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
            <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Une fois votre site déployé, scannez ce code pour l'installer sur mobile !
          </p>
        </div>

        <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase italic mb-6 tracking-widest">Guide d'activation IA</h3>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center font-black text-xs text-white shrink-0 mt-1">1</span>
              <p>
                Obtenez une clé gratuite sur <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-cyan-400 underline font-bold">Google AI Studio</a>.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center font-black text-xs text-white shrink-0 mt-1">2</span>
              <p>
                Allez dans les paramètres de votre service de déploiement (Netlify ou Vercel).
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center font-black text-xs text-white shrink-0 mt-1">3</span>
              <p>Créez une variable d'environnement <code className="text-white">API_KEY</code> et collez votre clé.</p>
            </div>
            <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-cyan-500/20 text-[10px] text-cyan-400 italic">
              ASTUCE : Cliquez sur "Create API key in new project" sur le site de Google pour générer votre clé instantanément.
            </div>
          </div>
        </div>
      </div>

      {/* Cartes d'information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border-2 border-slate-800 shadow-xl">
          <div className="text-5xl mb-6">👨‍💻</div>
          <h3 className="text-3xl font-black mb-6 text-cyan-500 italic uppercase tracking-tighter">Le Développeur</h3>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            Conçu par <strong className="text-white">VDPHACKER</strong>, étudiant passionné d'IA et de Cyber-défense.
          </p>
          <p className="text-slate-500 text-sm italic">
            "Ma vision est de transformer la peur des cyber-menaces en une compétence proactive pour tous."
          </p>
        </div>
        <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border-2 border-slate-800 shadow-xl">
          <div className="text-5xl mb-6">🛰️</div>
          <h3 className="text-3xl font-black mb-6 text-blue-500 italic uppercase tracking-tighter">La Mission</h3>
          <p className="text-slate-400 text-lg leading-relaxed">
            Fournir un environnement sûr et pédagogique pour tester les vecteurs d'attaque courants et renforcer sa posture de sécurité numérique.
          </p>
        </div>
      </div>

      {/* Contact */}
      <section className="bg-slate-950 p-12 rounded-[4rem] border-2 border-cyan-500/20 text-center relative overflow-hidden shadow-inner">
        <h3 className="text-3xl font-black mb-6 text-white italic uppercase tracking-tighter">Contact Direct</h3>
        <p className="text-slate-500 mb-10 text-lg font-medium">Collaboration, suggestions ou rapports d'audit ?</p>
        <a 
          href="mailto:freelence1200@gmail.com" 
          className="inline-flex items-center gap-4 px-12 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black transition-all shadow-xl active:scale-95 italic text-xl"
        >
          <span>freelence1200@gmail.com</span>
          <span className="text-2xl">↗</span>
        </a>
      </section>
      
      <div className="text-center opacity-20 pb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">CyberAI Neural Interface v2.6.0 - Activation Helper</p>
      </div>
    </div>
  );
};

export default About;
