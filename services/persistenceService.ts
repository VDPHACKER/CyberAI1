
import { QuizHistoryEntry, UserPreferences, AuditLogEntry } from '../types';

const KEYS = {
  HISTORY: 'cybershield_history',
  PREFS: 'cybershield_prefs',
  LOGS: 'cybershield_audit_logs'
};

export const saveQuizResult = (entry: QuizHistoryEntry) => {
  const history = getQuizHistory();
  history.unshift(entry);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  
  addAuditLog(`Quiz ${entry.mode} terminé avec un score de ${entry.score}/${entry.total}`, 'Quiz', 'info');
};

export const getQuizHistory = (): QuizHistoryEntry[] => {
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const addAuditLog = (event: string, category: AuditLogEntry['category'], level: AuditLogEntry['level']) => {
  const logs = getAuditLogs();
  const newLog: AuditLogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    event,
    category,
    level
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 100))); // Garde les 100 derniers
};

export const getAuditLogs = (): AuditLogEntry[] => {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

export const clearAuditLogs = () => {
  localStorage.removeItem(KEYS.LOGS);
};

export const clearQuizHistory = () => {
  localStorage.removeItem(KEYS.HISTORY);
};

export const savePreferences = (prefs: UserPreferences) => {
  localStorage.setItem(KEYS.PREFS, JSON.stringify(prefs));
};

export const getPreferences = (): UserPreferences => {
  const data = localStorage.getItem(KEYS.PREFS);
  const defaultPrefs: UserPreferences = { 
    theme: 'dark', 
    userName: 'Gardien',
    userAvatar: undefined,
    defaultQuizCount: 10,
    defaultQuizDifficulty: 'Moyen'
  };
  
  if (!data) return defaultPrefs;
  
  const parsed = JSON.parse(data);
  return { ...defaultPrefs, ...parsed };
};

export const getStats = () => {
  const history = getQuizHistory();
  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0 
    ? Math.round((history.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / totalQuizzes) * 100)
    : 0;
  
  return {
    totalQuizzes,
    avgScore,
    bestSolo: history.filter(h => h.mode === 'Solo').reduce((max, h) => Math.max(max, h.score), 0)
  };
};
