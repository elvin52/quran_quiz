/**
 * Custom hook for managing Arabic Pronoun Quiz state and logic
 * Handles session management, question progression, timing, and analytics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  QuizState, 
  QuizSession, 
  QuizSettings, 
  QuizFeedback, 
  ArabicPronoun, 
  QuizStats 
} from '../types/quiz';
import { QuizEngine, QuizStorageManager } from '../utils/quizEngine';

const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  difficulty: 'mixed',
  questionCount: 10,
  timeLimit: undefined,
  showExplanations: true,
  randomizeOptions: true
};

export function useQuizManager() {
  const [quizState, setQuizState] = useState<QuizState>({
    session: null,
    currentQuestion: null,
    feedback: null,
    status: 'not_started',
    questionStartTime: null,
    stats: null
  });

  const questionTimerRef = useRef<number | null>(null);

  /**
   * Start a new quiz session with specified settings
   */
  const startQuiz = useCallback((settings: Partial<QuizSettings> = {}) => {
    const finalSettings = { ...DEFAULT_QUIZ_SETTINGS, ...settings };
    const newSession = QuizEngine.generateSession(finalSettings);
    
    QuizStorageManager.saveSession(newSession);
    
    const firstQuestion = newSession.questions[0];
    const startTime = Date.now();
    
    setQuizState({
      session: newSession,
      currentQuestion: firstQuestion,
      feedback: null,
      status: 'in_progress',
      questionStartTime: startTime,
      stats: null
    });
  }, []);

  /**
   * Resume an existing quiz session
   */
  const resumeQuiz = useCallback(() => {
    const savedSession = QuizStorageManager.getCurrentSession();
    
    if (!savedSession || savedSession.status === 'completed') {
      return false;
    }

    const currentQuestion = savedSession.questions[savedSession.currentQuestionIndex];
    const startTime = Date.now();
    
    setQuizState({
      session: savedSession,
      currentQuestion,
      feedback: null,
      status: 'in_progress',
      questionStartTime: startTime,
      stats: null
    });
    
    return true;
  }, []);

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = useCallback((selectedPronoun: ArabicPronoun) => {
    if (!quizState.session || !quizState.currentQuestion || !quizState.questionStartTime) {
      return;
    }

    const responseTime = Date.now() - quizState.questionStartTime;
    const { updatedSession, isCorrect } = QuizEngine.processResponse(
      quizState.session,
      selectedPronoun,
      responseTime
    );

    // Save updated session
    QuizStorageManager.saveSession(updatedSession);

    // Create feedback
    const feedback: QuizFeedback = {
      isCorrect,
      correctAnswer: quizState.currentQuestion.correctAnswer,
      userAnswer: selectedPronoun,
      explanation: quizState.currentQuestion.explanation || '',
      responseTime
    };

    setQuizState(prev => ({
      ...prev,
      session: updatedSession,
      feedback,
      status: 'showing_feedback'
    }));

    // Auto-advance after showing feedback (optional)
    if (updatedSession.status === 'completed') {
      setTimeout(() => {
        completeQuiz(updatedSession);
      }, 3000); // Show feedback for 3 seconds before completing
    }
  }, [quizState.session, quizState.currentQuestion, quizState.questionStartTime]);

  /**
   * Move to the next question
   */
  const nextQuestion = useCallback(() => {
    if (!quizState.session) {
      return;
    }

    if (quizState.session.status === 'completed') {
      completeQuiz(quizState.session);
      return;
    }

    const nextQuestionIndex = quizState.session.currentQuestionIndex;
    const nextQuestionObj = quizState.session.questions[nextQuestionIndex];
    
    if (nextQuestionObj) {
      const startTime = Date.now();
      
      setQuizState(prev => ({
        ...prev,
        currentQuestion: nextQuestionObj,
        feedback: null,
        status: 'in_progress',
        questionStartTime: startTime
      }));
    } else {
      completeQuiz(quizState.session);
    }
  }, [quizState.session]);

  /**
   * Complete the quiz and show final statistics
   */
  const completeQuiz = useCallback((session: QuizSession) => {
    const stats = QuizEngine.calculateStats(session);
    
    setQuizState(prev => ({
      ...prev,
      status: 'completed',
      stats,
      feedback: null,
      questionStartTime: null
    }));

    // Clear current session from storage
    QuizStorageManager.clearCurrentSession();
  }, []);

  /**
   * Reset the quiz to initial state
   */
  const resetQuiz = useCallback(() => {
    QuizStorageManager.clearCurrentSession();
    
    setQuizState({
      session: null,
      currentQuestion: null,
      feedback: null,
      status: 'not_started',
      questionStartTime: null,
      stats: null
    });
  }, []);

  /**
   * Pause the current quiz session
   */
  const pauseQuiz = useCallback(() => {
    if (quizState.session) {
      const pausedSession = {
        ...quizState.session,
        status: 'paused' as const
      };
      
      QuizStorageManager.saveSession(pausedSession);
      
      setQuizState(prev => ({
        ...prev,
        session: pausedSession,
        status: 'not_started'
      }));
    }
  }, [quizState.session]);

  /**
   * Get quiz progress information
   */
  const getProgress = useCallback(() => {
    if (!quizState.session) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = quizState.session.currentQuestionIndex;
    const total = quizState.session.questions.length;
    const percentage = total > 0 ? (current / total) * 100 : 0;

    return { current, total, percentage };
  }, [quizState.session]);

  /**
   * Get current question number (1-based)
   */
  const getCurrentQuestionNumber = useCallback(() => {
    if (!quizState.session) {
      return 0;
    }
    return quizState.session.currentQuestionIndex + 1;
  }, [quizState.session]);

  /**
   * Check if there's a saved session to resume
   */
  const hasSavedSession = useCallback(() => {
    const savedSession = QuizStorageManager.getCurrentSession();
    return savedSession && savedSession.status !== 'completed';
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
    };
  }, []);

  // Auto-save session when state changes
  useEffect(() => {
    if (quizState.session && quizState.status === 'in_progress') {
      QuizStorageManager.saveSession(quizState.session);
    }
  }, [quizState.session, quizState.status]);

  return {
    // State
    quizState,
    
    // Actions
    startQuiz,
    resumeQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    pauseQuiz,
    completeQuiz,
    
    // Computed values
    getProgress,
    getCurrentQuestionNumber,
    hasSavedSession,
    
    // Utility values
    isLoading: false, // Can be extended for async operations
    error: null // Can be extended for error handling
  };
}
