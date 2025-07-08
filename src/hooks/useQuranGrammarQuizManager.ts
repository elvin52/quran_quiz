/**
 * Quran Grammar Quiz Manager Hook
 * 
 * Manages state and logic for the Quran Grammar Quiz - Underline Mode.
 * Handles question generation, user selections, validation, and session tracking.
 */

import { useState, useCallback, useRef } from 'react';
import {
  QuranGrammarQuizQuestion,
  QuranUserSelection,
  QuranAnswerValidation,
  QuranGrammarQuizSession,
  QuranQuizSettings,
  QuranQuizState,
  WordSelection
} from '@/types/quranGrammarQuiz';
import { quranGrammarQuizEngine } from '@/utils/quranGrammarQuizEngine';

interface UseQuranGrammarQuizManagerReturn {
  // State
  state: QuranQuizState;
  currentSession: QuranGrammarQuizSession | null;
  
  // Actions
  startSession: (settings: QuranQuizSettings) => Promise<void>;
  loadNextQuestion: () => Promise<void>;
  selectWord: (wordId: string) => void;
  clearSelection: () => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  completeSession: () => QuranGrammarQuizSession | null;
  
  // Utilities
  exportSession: () => string;
  resetQuiz: () => void;
}

export const useQuranGrammarQuizManager = (): UseQuranGrammarQuizManagerReturn => {
  // Core state
  const [state, setState] = useState<QuranQuizState>({
    isLoading: false,
    isAnswered: false,
    showFeedback: false,
    userSelection: null,
    progress: { current: 0, total: 0, percentage: 0 }
  });

  const [currentSession, setCurrentSession] = useState<QuranGrammarQuizSession | null>(null);
  
  // Refs for tracking
  const questionStartTime = useRef<number>(0);
  const selectionStartTime = useRef<number>(0);

  /**
   * Start a new quiz session
   */
  const startSession = useCallback(async (settings: QuranQuizSettings) => {
    console.log('🎯 Starting Quran Grammar Quiz session');
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const session = quranGrammarQuizEngine.startSession(settings);
      setCurrentSession(session);
      
      // Update progress
      setState(prev => ({
        ...prev,
        progress: {
          current: 0,
          total: settings.questionCount,
          percentage: 0
        }
      }));
      
      // Load first question - pass session directly to avoid closure issue
      await loadNextQuestion(session);
      
    } catch (error) {
      console.error('Error starting session:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start session'
      }));
    }
  }, []);

  /**
   * Load next question
   */
  const loadNextQuestion = useCallback(async (session?: QuranGrammarQuizSession) => {
    const activeSession = session || currentSession;
    if (!activeSession) {
      console.warn('No active session available');
      return;
    }

    console.log('📝 Loading next question...');
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const question = await quranGrammarQuizEngine.generateQuestion({
        preferredConstructionTypes: activeSession.settings.constructionTypes,
        minConstructionsPerVerse: 1,
        maxConstructionsPerVerse: 3,
        requireBothTypes: false
      });

      // Reset selection state
      const initialUserSelection: QuranUserSelection = {
        selectedWordIds: [],
        constructionType: question.constructionType,
        selectionTimeMs: 0,
        timestamp: new Date()
      };

      // Update progress
      const newCurrent = activeSession.questions.length + 1;
      const newPercentage = (newCurrent / activeSession.settings.questionCount) * 100;

      setState(prev => ({
        ...prev,
        currentQuestion: question,
        userSelection: initialUserSelection,
        isLoading: false,
        isAnswered: false,
        showFeedback: false,
        progress: {
          current: newCurrent,
          total: activeSession.settings.questionCount,
          percentage: Math.round(newPercentage)
        }
      }));

      // Start timing
      questionStartTime.current = Date.now();
      selectionStartTime.current = Date.now();

      console.log(`✅ Loaded question: ${question.prompt}`);
      
    } catch (error) {
      console.error('Error loading question:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load question'
      }));
    }
  }, [currentSession]);

  /**
   * Handle word selection/deselection
   */
  const selectWord = useCallback((wordId: string) => {
    if (state.isAnswered || state.isLoading) return;

    setState(prev => {
      if (!prev.currentQuestion || !prev.userSelection) return prev;

      const currentSelection = prev.userSelection.selectedWordIds;
      const isAlreadySelected = currentSelection.includes(wordId);
      
      let newSelectedIds: string[];
      if (isAlreadySelected) {
        // Deselect word
        newSelectedIds = currentSelection.filter(id => id !== wordId);
      } else {
        // Select word
        newSelectedIds = [...currentSelection, wordId];
      }

      // Update word selection states
      const updatedWords = prev.currentQuestion.words.map(word => {
        const isSelected = newSelectedIds.includes(word.wordId);
        const selectionOrder = isSelected ? newSelectedIds.indexOf(word.wordId) : -1;
        
        return {
          ...word,
          isSelected,
          selectionOrder
        };
      });

      // Update user selection
      const updatedUserSelection: QuranUserSelection = {
        ...prev.userSelection,
        selectedWordIds: newSelectedIds,
        selectionTimeMs: Date.now() - selectionStartTime.current
      };

      console.log(`🔘 Word ${isAlreadySelected ? 'deselected' : 'selected'}: ${wordId}`);

      return {
        ...prev,
        currentQuestion: {
          ...prev.currentQuestion,
          words: updatedWords
        },
        userSelection: updatedUserSelection
      };
    });
  }, [state.isAnswered, state.isLoading]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    if (state.isAnswered || state.isLoading) return;

    setState(prev => {
      if (!prev.currentQuestion || !prev.userSelection) return prev;

      const clearedWords = prev.currentQuestion.words.map(word => ({
        ...word,
        isSelected: false,
        selectionOrder: -1
      }));

      const clearedUserSelection: QuranUserSelection = {
        ...prev.userSelection,
        selectedWordIds: [],
        selectionTimeMs: Date.now() - selectionStartTime.current
      };

      console.log('🧹 Cleared all selections');

      return {
        ...prev,
        currentQuestion: {
          ...prev.currentQuestion,
          words: clearedWords
        },
        userSelection: clearedUserSelection
      };
    });
    
    // Reset selection timing
    selectionStartTime.current = Date.now();
  }, [state.isAnswered, state.isLoading]);

  /**
   * Submit answer for validation
   */
  const submitAnswer = useCallback(() => {
    if (!state.currentQuestion || !state.userSelection || state.isAnswered) return;

    console.log('📤 Submitting answer...');
    
    const responseTime = Date.now() - questionStartTime.current;
    
    // Validate answer
    const validation = quranGrammarQuizEngine.validateAnswer(
      state.currentQuestion,
      state.userSelection
    );

    // Record answer in session
    quranGrammarQuizEngine.recordAnswer(
      state.currentQuestion.id,
      state.userSelection,
      validation,
      responseTime
    );

    setState(prev => ({
      ...prev,
      isAnswered: true,
      showFeedback: true
    }));

    console.log(`📊 Answer submitted: ${validation.isCorrect ? 'correct' : 'incorrect'}`);
  }, [state.currentQuestion, state.userSelection, state.isAnswered]);

  /**
   * Move to next question
   */
  const nextQuestion = useCallback(async () => {
    if (!currentSession) return;

    // Check if we've reached the question limit
    if (currentSession.questions.length >= currentSession.settings.questionCount) {
      console.log('🏁 Quiz completed - no more questions');
      return;
    }

    await loadNextQuestion();
  }, [currentSession, loadNextQuestion]);

  /**
   * Complete the current session
   */
  const completeSession = useCallback(() => {
    console.log('🏁 Completing Quran Grammar Quiz session');
    
    const completedSession = quranGrammarQuizEngine.completeSession();
    
    setState({
      isLoading: false,
      isAnswered: false,
      showFeedback: false,
      userSelection: null,
      progress: { current: 0, total: 0, percentage: 0 }
    });
    
    setCurrentSession(null);
    
    return completedSession;
  }, []);

  /**
   * Export session data as JSON
   */
  const exportSession = useCallback(() => {
    if (!currentSession) return '{}';
    
    const exportData = {
      ...currentSession,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [currentSession]);

  /**
   * Reset quiz to initial state
   */
  const resetQuiz = useCallback(() => {
    console.log('🔄 Resetting Quran Grammar Quiz');
    
    setState({
      isLoading: false,
      isAnswered: false,
      showFeedback: false,
      userSelection: null,
      progress: { current: 0, total: 0, percentage: 0 }
    });
    
    setCurrentSession(null);
    questionStartTime.current = 0;
    selectionStartTime.current = 0;
  }, []);

  return {
    // State
    state,
    currentSession,
    
    // Actions
    startSession,
    loadNextQuestion,
    selectWord,
    clearSelection,
    submitAnswer,
    nextQuestion,
    completeSession,
    
    // Utilities
    exportSession,
    resetQuiz
  };
};
