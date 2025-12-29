
import React, { useState, useEffect, useRef } from 'react';
import { addAuditLog, getAuditLogs, clearAuditLogs } from '../../services/persistenceService';
import { analyzeSecurityLog } from '../../services/geminiService';
import { AuditLogEntry } from '../../types';

type ToolTab = 'analyzer' | 'links' | 'email' | 'password' | 'audit';

interface SecurityToolsProps {
  onBack: () => void;
}

const SecurityTools: React.FC<SecurityToolsProps> = ({ onBack }) => {
  const [activeTool, setActiveTool] = useState<ToolTab>('analyzer');

  const tools = [
    { id: 'analyzer', label: ' Analyze IA', icon: '🔍' },
    { id: 'links', label: 'Testeur de Liens Douteux', icon: '🔗' },
    { id: 'email', label: 'Test Email de Phishing', icon: '📧' },
    { id: 'password', label: 'Testeur de Mot de Passe', icon: '🔑' },
    { id: 'audit', label: 'Logs', icon: '📋' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-cyan-500 transition-colors font-black text-[10px] uppercase tracking-[0.3em] w-fit px-2">
        <span className="text-xl">←</span> Retour
      </button>

      <div className="flex overflow-x-auto pb-4 gap-2 md:gap-3 scrollbar-hide -mx-4 px-4 snap-x">
        {tools.map(tool => (
          <button 
            key={tool.id}
            onClick={() => setActiveTool(tool.id as ToolTab)}
            className={`flex-none px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all border-2 whitespace-nowrap flex items-center gap-2 snap-start ${
              activeTool === tool.id 
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-base md:text-xl">{tool.icon}</span> <span className="text-xs md:text-sm">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTool === 'analyzer' && <ExpertAIAnalyzer />}
        {activeTool === 'links' && <LinkAnalyzer />}
        {activeTool === 'email' && <EmailAnalyzer />}
        {activeTool === 'password' && <PasswordTester />}
        {activeTool === 'audit' && <AuditLogViewer />}
      </div>
    </div>
  );
};

const ExpertAIAnalyzer = () => {
  const [data, setData] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!data.trim() && !image) return;
    setIsAnalyzing(true);
    setReport(null);
    try {
      const imagePayload = image ? {
        data: image.split(',')[1],
        mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg'
      } : undefined;
      
      const result = await analyzeSecurityLog(data, imagePayload);
      setReport(result || "Aucune analyse générée.");
      addAuditLog("Analyse de logs par IA effectuée", "Sécurité", "info");
    } catch (err) {
      setReport("Erreur lors de l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-cyan-500">
      <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Audit Logs IA</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 text-sm md:text-base">Analyse de logs ou captures d'écran suspectes.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <textarea 
          className="w-full h-48 md:h-64 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl p-4 font-mono text-xs md:text-sm outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-300"
          placeholder="Logs ici..."
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="h-48 md:h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-500/5 transition-all overflow-hidden"
        >
          {image ? (
            <img src={image} alt="Upload" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-4">
              <span className="text-4xl md:text-5xl mb-2 md:mb-4 block">🖼️</span>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Importer capture</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>

      <button 
        disabled={isAnalyzing || (!data.trim() && !image)}
        onClick={runAnalysis}
        className="w-full py-4 md:py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {isAnalyzing ? "ANALYSE..." : "LANCER L'ANALYSE"}
      </button>

      {report && (
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 rounded-xl md:rounded-2xl border border-cyan-500/20 animate-in slide-in-from-bottom-2">
           <h4 className="text-cyan-600 dark:text-cyan-400 font-black mb-3 md:mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px] md:text-xs">🛡️ Rapport</h4>
           <div className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{report}</div>
        </div>
      )}
    </div>
  );
};

const RiskDisplay = ({ result }: { result: any }) => (
  <div className="animate-in fade-in pt-6 md:pt-8">
    <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-4 md:border-8 flex items-center justify-center text-sm md:text-lg font-black shrink-0 ${
        result.risk > 50 ? 'border-red-500 text-red-500' : 
        result.risk > 0 ? 'border-orange-500 text-orange-500' : 
        'border-emerald-500 text-emerald-500'
      }`}>
        {result.risk}%
      </div>
      <h4 className="text-base md:text-xl font-bold dark:text-white">Risque</h4>
    </div>
    <div className="space-y-2 md:space-y-3">
      {result.findings.map((f: string, i: number) => (
        <div key={i} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-lg md:rounded-xl border border-red-500/10">
          <span className="text-red-500">🚩</span> 
          <span className="text-xs md:text-sm font-bold dark:text-slate-200">{f}</span>
        </div>
      ))}
    </div>
  </div>
);

const LinkAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);

  const analyze = () => {
    const findings = [];
    let risk = 0;
    const cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.startsWith('http://')) { findings.push("Protocole HTTP non sécurisé"); risk += 40; }
    if (cleanUrl.includes('bit.ly')) { findings.push("Redirection masquée"); risk += 20; }
    if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(cleanUrl)) { findings.push("IP brute détectée"); risk += 50; }
    setResult({ risk: Math.min(risk, 100), findings });
    addAuditLog(`Analyse URL`, 'Sécurité', risk > 40 ? 'warning' : 'info');
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-blue-500">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Testeur de Lien suspect</h3>
      <div className="flex flex-col gap-3 mb-6">
        <input 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-slate-800 dark:text-white font-mono text-sm"
        />
        <button onClick={analyze} className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-50 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg">VÉRIFIER</button>
      </div>
      {result && <RiskDisplay result={result} />}
    </div>
  );
};

const EmailAnalyzer = () => {
  const [emailBody, setEmailBody] = useState('');
  const [result, setResult] = useState<any>(null);

  const analyzeEmail = () => {
    const findings = [];
    let risk = 0;
    const body = emailBody.toLowerCase();
    if (body.includes('urgent')) { findings.push("Sentiment d'urgence"); risk += 30; }
    if (body.includes('bloqué')) { findings.push("Menace sur compte"); risk += 40; }
    if (body.includes('gagnant')) { findings.push("Appât gain"); risk += 30; }
    setResult({ risk: Math.min(risk, 100), findings });
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-emerald-500">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Analyseur Email r</h3>
      <textarea 
        className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 outline-none text-slate-800 dark:text-slate-300 text-xs md:text-sm"
        placeholder="Contenu email..."
        value={emailBody}
        onChange={(e) => setEmailBody(e.target.value)}
      />
      <button onClick={analyzeEmail} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg uppercase tracking-widest">DÉTECTER</button>
      {result && <RiskDisplay result={result} />}
    </div>
  );
};

const PasswordTester = () => {
  const [password, setPassword] = useState('');
  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const score = checkStrength(password);
  const labels = ['Nul', 'Risqué', 'Faible', 'Moyen', 'Fort', 'Top'];
  const colors = ['bg-slate-400', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-cyan-400'];
  
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-yellow-500">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Testeur de Mot de Passe</h3>
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Tester..." 
        className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-lg md:text-xl font-mono text-slate-800 dark:text-white" 
      />
      <div className="mt-6 md:mt-8 space-y-2 md:space-y-3">
        <div className="flex justify-between text-[10px] md:text-xs font-black uppercase text-slate-500">
          <span>{labels[score]}</span>
          <span>{score * 20}%</span>
        </div>
        <div className="h-3 md:h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex gap-1 overflow-hidden p-0.5 md:p-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i < score ? colors[score] : 'bg-transparent'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  useEffect(() => { setLogs(getAuditLogs()); }, []);
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl border-t-4 border-t-slate-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Audit Logs</h3>
        <button onClick={() => { if(confirm('Vider?')) { clearAuditLogs(); setLogs([]); } }} className="text-[10px] text-red-500 font-bold hover:bg-red-500/10 px-3 py-1 rounded-lg">CLEAR</button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {logs.map(log => (
          <div key={log.id} className="flex items-center gap-3 p-3 dark:bg-slate-950 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg">
             <div className={`w-1 h-6 rounded-full ${log.level === 'alert' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
             <div className="flex-1 min-w-0">
                <span className="text-[8px] font-black uppercase text-slate-500">{log.category}</span>
                <p className="text-[11px] md:text-xs font-bold dark:text-slate-200 text-slate-800 truncate">{log.event}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityTools;
