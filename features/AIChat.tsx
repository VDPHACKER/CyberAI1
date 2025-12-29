
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { chatWithCyberExpertStream } from '../services/geminiService';
import { getStats, getPreferences } from '../services/persistenceService';
import { UserPreferences } from '../types';

interface Message {
  role: 'user' | 'assistant';
  parts: { text: string; inlineData?: any }[];
}

interface AIChatProps {
  onBack: () => void;
}

const MessageItem = memo(({ message, isAssistant, avatar, onSpeak }: { message: Message, isAssistant: boolean, avatar?: string, onSpeak: (text: string) => void }) => {
  return (
    <div className={`flex gap-3 md:gap-5 ${isAssistant ? 'flex-row' : 'flex-row-reverse'} items-start animate-in slide-in-from-bottom-2 duration-300 w-full mb-8`}>
      <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-3xl shadow-2xl ${
        isAssistant ? 'bg-slate-900 border border-sky-500/30 text-sky-400' : 'bg-sky-600 text-white'
      }`}>
        {isAssistant ? '🤖' : (avatar ? <img src={avatar} className="w-full h-full object-cover rounded-xl" /> : '👤')}
      </div>

      <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} w-full max-w-[95%]`}>
        <div className={`w-full px-6 py-5 md:px-10 md:py-8 rounded-[2.5rem] transition-all relative text-base md:text-xl leading-relaxed border shadow-2xl ${
          isAssistant 
            ? 'bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-tl-none border-white/10' 
            : 'bg-sky-950/50 text-white rounded-tr-none border-sky-500/20'
        }`}>
          {message.parts[0].inlineData && (
            <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 bg-black/40 max-w-md">
              <img src={`data:${message.parts[0].inlineData.mimeType};base64,${message.parts[0].inlineData.data}`} className="w-full h-auto" />
            </div>
          )}
          <div className="whitespace-pre-wrap break-words font-medium">
            {message.parts[0].text}
          </div>
          
          {isAssistant && (
            <button 
              onClick={() => onSpeak(message.parts[0].text)}
              className="absolute -bottom-5 right-10 w-10 h-10 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-sm hover:bg-sky-600 transition-colors shadow-xl"
              title="Écouter la réponse"
            >
              🔊
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const AIChat: React.FC<AIChatProps> = ({ onBack }) => {
  const [prefs] = useState<UserPreferences>(getPreferences());
  const stats = getStats();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasApiKey] = useState(!!process.env.API_KEY && process.env.API_KEY !== "");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom(streamingMessage ? 'auto' : 'smooth');
  }, [messages, streamingMessage, scrollToBottom]);

  // STT : Reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  // TTS : Synthèse vocale
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideMsg?: string) => {
    const finalMsg = overrideMsg || input.trim();
    if ((!finalMsg && !capturedImage) || isLoading) return;

    const currentImage = capturedImage;
    setInput('');
    setCapturedImage(null);
    setIsAttachMenuOpen(false);
    setIsLoading(true);
    
    const newUserPart: any = { text: finalMsg || "Analyse de cette capture d'écran." };
    if (currentImage) {
      newUserPart.inlineData = {
        data: currentImage.split(',')[1],
        mimeType: currentImage.split(';')[0].split(':')[1] || 'image/jpeg'
      };
    }

    const newUserMessage: Message = { role: 'user', parts: [newUserPart] };
    setMessages(prev => [...prev, newUserMessage]);
    setStreamingMessage("");

    try {
      const history = [...messages, newUserMessage].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: m.parts.map(p => ({ text: p.text }))
      }));

      const imagePayload = currentImage ? {
        data: currentImage.split(',')[1],
        mimeType: currentImage.split(';')[0].split(':')[1] || 'image/jpeg'
      } : undefined;

      const userCtx = `Utilisateur ${prefs.userName}, Score Quiz: ${stats.avgScore}%`;

      let fullReply = "";
      await chatWithCyberExpertStream(newUserPart.text, history, (chunk) => {
        fullReply += chunk;
        setStreamingMessage(fullReply);
      }, imagePayload, userCtx);

      setMessages(prev => [...prev, { role: 'assistant', parts: [{ text: fullReply }] }]);
      setStreamingMessage(null);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', parts: [{ text: "Système interrompu. Vérifiez votre configuration réseau et votre clé API." }] }]);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
        setIsAttachMenuOpen(false);
    } catch (err) { alert("Accès caméra requis pour le scan."); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsAttachMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col animate-in fade-in duration-700 bg-slate-950 overflow-hidden lg:relative lg:h-[85vh] lg:rounded-[3rem] lg:border lg:border-white/10">
      
      {!hasApiKey && (
        <div className="absolute inset-0 z-[200] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto">
            <div className="text-6xl md:text-8xl mb-6 animate-bounce">🔑</div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-4 tracking-tighter">Interface Verrouillée</h2>
            <p className="text-slate-400 max-w-lg mb-8 text-sm md:text-lg leading-relaxed">
              Pour activer l'intelligence CyberAI, vous devez configurer votre clé d'accès gratuite.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-10">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-black text-white">1</span>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Générer</p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] bg-white text-black px-4 py-2 rounded-full font-black hover:bg-sky-400 transition-colors"
                >
                  CLIQUEZ ICI ↗
                </a>
              </div>
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-black text-white">2</span>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Copier</p>
                <p className="text-[10px] text-slate-500 italic">Copiez la clé qui commence par "AIza..."</p>
              </div>
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-black text-white">3</span>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Injecter</p>
                <p className="text-[10px] text-slate-500 italic">Ajoutez-la comme variable d'env. "API_KEY" sur Vercel/Netlify</p>
              </div>
            </div>

            <button onClick={onBack} className="text-slate-500 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-colors">
              ← Retour au Hub sans IA
            </button>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex justify-between items-center px-6 md:px-10 py-6 border-b border-white/5 bg-slate-900/40 shrink-0">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em]">
            <span>←</span> <span>TERMINER L'AUDIT</span>
        </button>
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-xs font-black text-sky-500 mono tracking-widest uppercase">Liaison CyberAI Active</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Flux de données sécurisé</span>
            </div>
            <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse shadow-[0_0_12px_#0ea5e9]"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto relative pb-32 scroll-smooth bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.5)_0%,transparent_100%)]">
        <div className="w-full max-w-[1600px] mx-auto py-10 px-6 md:px-12">
          {messages.length === 0 && !streamingMessage && (
            <div className="min-h-[50vh] flex flex-col items-center justify-center animate-in fade-in duration-1000">
               <div className="text-center space-y-6">
                  <div className="text-8xl opacity-30 animate-bounce">🤖</div>
                  <h3 className="text-2xl font-black text-slate-500 uppercase tracking-[0.6em] italic">Prêt pour l'Analyse</h3>
                  <p className="text-slate-600 text-lg max-w-lg mx-auto font-medium">Posez vos questions techniques, analysez des fichiers ou demandez un audit de sécurité complet.</p>
               </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <MessageItem key={idx} message={m} isAssistant={m.role === 'assistant'} avatar={prefs.userAvatar} onSpeak={speakText} />
          ))}

          {streamingMessage !== null && (
            <div className="flex gap-3 md:gap-5 flex-row items-start w-full mb-8">
              <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-slate-900 border border-sky-500/30 text-sky-400 text-3xl">🤖</div>
              <div className="flex flex-col items-start w-full max-w-[95%]">
                <div className="w-full px-6 py-5 md:px-10 md:py-8 rounded-[2.5rem] rounded-tl-none bg-slate-900/90 backdrop-blur-2xl text-slate-100 border border-white/10 shadow-2xl">
                  <div className="whitespace-pre-wrap text-base md:text-xl font-medium leading-relaxed">
                    {streamingMessage}
                    <span className="inline-block w-2 h-6 bg-sky-500 animate-pulse ml-2 rounded-full align-middle"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Command Bar */}
      <div className="w-full bg-slate-950/95 backdrop-blur-3xl border-t border-white/10 p-6 md:p-10 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
            
            {capturedImage && (
                <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-[1.5rem] border border-sky-500/30 w-fit animate-in zoom-in-50">
                   <img src={capturedImage} className="w-16 h-16 object-cover rounded-xl" />
                   <span className="text-xs font-black text-slate-400 uppercase pr-2">Capture prête pour analyse</span>
                   <button onClick={() => setCapturedImage(null)} className="w-8 h-8 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center font-bold">✕</button>
                </div>
            )}

            <div className="flex gap-4 items-center">
                <div className="flex-1 glass-panel p-2 rounded-[2.5rem] bg-slate-900/80 border-white/5 flex gap-3 items-center shadow-2xl relative">
                    <button 
                        onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)} 
                        className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl transition-all ${isAttachMenuOpen ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        {isAttachMenuOpen ? '✕' : '📎'}
                    </button>
                    
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Commande ou question cyber..."
                      className="flex-1 bg-transparent px-4 py-4 outline-none text-white text-lg md:text-xl font-medium placeholder:text-slate-600"
                      disabled={isLoading}
                    />

                    <button 
                        onClick={toggleListening}
                        className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl transition-all ${isListening ? 'bg-red-600 animate-pulse text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        title="Dictée vocale"
                    >
                        🎙️
                    </button>
                    
                    <button 
                      onClick={() => handleSend()}
                      disabled={isLoading || (!input.trim() && !capturedImage)} 
                      className="px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-[1.5rem] font-black text-sm md:text-base uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-sky-600/20 disabled:opacity-30"
                    >
                      {isLoading ? '...' : 'TRANSMETTRE'}
                    </button>

                    {isAttachMenuOpen && (
                        <div className="absolute -top-24 left-0 flex gap-4 animate-in slide-in-from-bottom-6">
                            <button onClick={startCamera} className="px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-black text-xs uppercase flex items-center gap-3 hover:bg-sky-600 transition-colors shadow-2xl">
                                📸 SCAN CAMÉRA
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-black text-xs uppercase flex items-center gap-3 hover:bg-sky-600 transition-colors shadow-2xl">
                                📁 IMPORT FICHIER
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Full Screen Camera */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[250] bg-black flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-16 flex gap-16 items-center">
                <button onClick={() => { 
                    if(videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                    setIsCameraOpen(false); 
                }} className="w-20 h-20 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center text-3xl border border-white/20 shadow-2xl hover:bg-red-600 transition-colors">✕</button>
                <button onClick={() => {
                    if (videoRef.current && canvasRef.current) {
                        const context = canvasRef.current.getContext('2d');
                        if (context) {
                            canvasRef.current.width = videoRef.current.videoWidth;
                            canvasRef.current.height = videoRef.current.videoHeight;
                            context.drawImage(videoRef.current, 0, 0);
                            setCapturedImage(canvasRef.current.toDataURL('image/jpeg', 0.8));
                            if(videoRef.current.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                            setIsCameraOpen(false);
                        }
                    }
                }} className="w-32 h-32 bg-white rounded-full border-[10px] border-sky-500 shadow-[0_0_50px_rgba(14,165,233,0.6)] active:scale-90 transition-all"></button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default AIChat;
