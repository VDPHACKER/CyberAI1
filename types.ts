
export interface Question {
  id: string;
  category: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  startTime: number;
  userAnswers: { index: number; timeTaken: number }[];
  isFinished: boolean;
}

export interface PlayerScore {
  name: string;
  score: number;
  totalTime: number;
  isMe: boolean;
}

export interface QuizHistoryEntry {
  date: string;
  score: number;
  total: number;
  mode: 'Solo' | 'Multi';
  difficulty?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: string;
  category: 'Sécurité' | 'Quiz' | 'Système' | 'Outil';
  level: 'info' | 'warning' | 'alert';
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  userName: string;
  userAvatar?: string;
  defaultQuizCount: number;
  defaultQuizDifficulty: string;
}

export enum AppTab {
  HOME = 'home',
  AI_CHAT = 'ai_chat',
  QUIZ = 'quiz',
  TOOLS = 'tools',
  GAMES = 'games',
  ABOUT = 'about'
}

export enum QuizMode {
  IDLE = 'idle',
  SOLO_CONFIG = 'solo_config',
  SOLO_PLAY = 'solo_play',
  MULTI_LOBBY = 'multi_lobby',
  MULTI_PLAY = 'multi_play',
  RESULT = 'result'
}
