/**
 * Type definitions for the Arabic Pronoun Quiz feature
 * Provides interfaces for quiz questions, sessions, responses, and analytics
 */

export interface ArabicPronoun {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  type: 'independent' | 'attached';
  person: 'first' | 'second' | 'third';
  number: 'singular' | 'dual' | 'plural';
  gender?: 'masculine' | 'feminine';
}

export interface ArabicVerb {
  id: string;
  root: string;
  presentTense: string;
  transliteration: string;
  meaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizQuestion {
  id: string;
  type: 'select_pronoun' | 'identify_attached';
  verb: ArabicVerb;
  correctAnswer: ArabicPronoun;
  options: ArabicPronoun[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionText: string;
  explanation?: string;
}

export interface QuizResponse {
  questionId: string;
  userAnswer: ArabicPronoun;
  correctAnswer: ArabicPronoun;
  isCorrect: boolean;
  responseTime: number; // milliseconds
  timestamp: number;
}

export interface QuizSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  questions: QuizQuestion[];
  responses: QuizResponse[];
  currentQuestionIndex: number;
  status: 'active' | 'completed' | 'paused';
  settings: QuizSettings;
}

export interface QuizSettings {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  questionCount: number;
  timeLimit?: number; // seconds per question
  showExplanations: boolean;
  randomizeOptions: boolean;
}

export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  accuracy: number; // percentage
  fastestResponse: number;
  slowestResponse: number;
  difficultyBreakdown: {
    beginner: { correct: number; total: number };
    intermediate: { correct: number; total: number };
    advanced: { correct: number; total: number };
  };
}

export interface QuizFeedback {
  isCorrect: boolean;
  correctAnswer: ArabicPronoun;
  userAnswer: ArabicPronoun;
  explanation: string;
  responseTime: number;
}

export type QuizStatus = 'not_started' | 'in_progress' | 'showing_feedback' | 'completed';

export interface QuizState {
  session: QuizSession | null;
  currentQuestion: QuizQuestion | null;
  feedback: QuizFeedback | null;
  status: QuizStatus;
  questionStartTime: number | null;
  stats: QuizStats | null;
}
