/**
 * Grammar Construction Quiz Manager Hook
 * 
 * Manages state and logic for the Grammar Construction Quiz feature.
 * Focuses on identifying Arabic grammatical constructions like Mudaf-Mudaf Ilayh and Jar-Majroor.
 * Follows existing patterns from useQuizManager.ts for consistency.
 */

import { useState, useCallback, useRef } from 'react';
import {
  GrammarQuizQuestion,
  GrammarQuizSession,
  QuizSettings,
  UserSelection,
  ConstructionValidation,
  QuizState,
  QuestionResult,
  GrammarConstruction,
  ConstructionType,
  RoleBasedConstructionType,
  RoleAssignmentStep
} from '@/types/grammarQuiz';
import { grammarQuizEngine } from '@/utils/grammarQuizEngine';
import { MorphologicalDetails } from '@/types/morphology';

/**
 * State for construction identification
 */
interface GrammarQuizManagerState {
  quizState: QuizState;
  currentSession: GrammarQuizSession | null;
  questionStartTime: number;
  // Construction-based selection approach
  selectedIndices: number[]; // Currently selected word indices
  selectedConstructionType: ConstructionType | null; // Selected construction type
  submittedConstructions: SubmittedConstruction[]; // All submitted constructions for current question
  currentValidation: ConstructionValidation | null; // Current answer validation
  // Role-based construction state
  roleAssignmentStep: RoleAssignmentStep;
  primaryRoleIndices: number[]; // Indices for primary role (e.g., verb, naṣb particle)
  secondaryRoleIndices: number[]; // Indices for secondary role (e.g., doer, governed verb)
}

/**
 * Interface for tracking submitted constructions in a question
 */
interface SubmittedConstruction {
  id: string;
  indices: number[];
  constructionType: ConstructionType;
  validation?: ConstructionValidation;
}

export function useGrammarQuizManager() {
  const [state, setState] = useState<GrammarQuizManagerState>({
    quizState: {
      userSelection: null,
      isAnswered: false,
      showFeedback: false,
      isLoading: false,
      progress: { current: 0, total: 0, percentage: 0 }
    },
    currentSession: null,
    questionStartTime: 0,
    selectedIndices: [],
    selectedConstructionType: null,
    submittedConstructions: [],
    currentValidation: null,
    roleAssignmentStep: 'selection',
    primaryRoleIndices: [],
    secondaryRoleIndices: []
  });

  // Use a ref to track current validation to avoid stale closures
  const currentValidation = useRef<ConstructionValidation | null>(null);

  // Session Management
  const startSession = useCallback((settings: QuizSettings) => {
    console.log('🎯 Starting Grammar Construction Quiz session');
    
    const session = grammarQuizEngine.startSession(settings);
    
    setState(prev => ({
      ...prev,
      currentSession: session,
      quizState: {
        ...prev.quizState,
        isLoading: true,
        error: undefined,
        progress: { current: 0, total: settings.questionCount, percentage: 0 }
      },
      selectedIndices: [],
      selectedConstructionType: null
    }));

    // Load first question with the new session to avoid closure issue
    loadNextQuestion(session);
  }, []);

  const loadNextQuestion = useCallback(async (sessionParam?: GrammarQuizSession) => {
    // Use provided session parameter or fall back to state.currentSession
    const session = sessionParam || state.currentSession;
    if (!session) return;

    setState(prev => ({ ...prev, quizState: { ...prev.quizState, isLoading: true } }));

    try {
      // For demo, we'll use sample segments - in production this would come from a question bank
      const sampleSegments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'كتاب',
          morphology: 'noun',
          case: 'nominative',
          grammaticalRole: 'mudaf',
          type: 'root'
        },
        '1-1-1-2': {
          id: '1-1-1-2',
          text: 'الطالب',
          morphology: 'noun',
          case: 'genitive',
          grammaticalRole: 'mudaf_ilayh',
          type: 'root'
        }
      };

      const question = await grammarQuizEngine.generateQuestion(sampleSegments);
      
      setState(prev => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          currentQuestion: question,
          isLoading: false,
          isAnswered: false,
          showFeedback: false,
          userSelection: null
        },
        questionStartTime: Date.now(),
        currentSelections: [],
        activeSelectionId: null,
        selectedIndices: [],
        selectedConstructionType: null,
        submittedConstructions: []
      }));

    } catch (error) {
      console.error('Error loading question:', error);
      setState(prev => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          isLoading: false,
          error: 'Failed to load question. Please try again.'
        }
      }));
    }
  }, [state.currentSession]);

  // Word Selection
  const toggleWordSelection = useCallback((index: number) => {
    if (state.quizState.isAnswered || state.quizState.showFeedback) return;

    setState(prev => {
      const newIndices = prev.selectedIndices.includes(index)
        ? prev.selectedIndices.filter(i => i !== index)
        : [...prev.selectedIndices, index];

      return {
        ...prev,
        selectedIndices: newIndices
      };
    });
  }, [state.quizState.isAnswered, state.quizState.showFeedback]);

  // Construction Type Selection
  const selectConstructionType = useCallback((type: 'mudaf-mudaf-ilayh' | 'jar-majroor') => {
    if (state.quizState.isAnswered || state.quizState.showFeedback) return;

    setState(prev => ({
      ...prev,
      selectedConstructionType: type
    }));
  }, [state.quizState.isAnswered, state.quizState.showFeedback]);

  // Submit current construction and continue selecting
  const submitCurrentConstruction = useCallback(() => {
    if (!state.currentSession || 
        !state.quizState.currentQuestion || 
        state.selectedIndices.length === 0 || 
        !state.selectedConstructionType) {
      return;
    }

    const constructionId = `construction-${Date.now()}`;
    const responseTime = Date.now() - state.questionStartTime;
    
    const userSelection: UserSelection = {
      selectedIndices: state.selectedIndices,
      relationshipType: state.selectedConstructionType,
      timestamp: new Date(),
      selectionTimeMs: responseTime
    };

    const validation = grammarQuizEngine.validateAnswer(
      state.quizState.currentQuestion,
      userSelection
    );

    const newConstruction: SubmittedConstruction = {
      id: constructionId,
      indices: state.selectedIndices,
      constructionType: state.selectedConstructionType,
      validation
    };

    setState(prev => ({
      ...prev,
      submittedConstructions: [...prev.submittedConstructions, newConstruction],
      selectedIndices: [],
      selectedConstructionType: null,
      activeSelectionId: null
    }));

    console.log(`📊 Construction submitted: ${validation.isCorrect ? 'correct' : 'incorrect'} (${state.selectedConstructionType})`);
  }, [
    state.currentSession,
    state.quizState.currentQuestion,
    state.selectedIndices,
    state.selectedConstructionType,
    state.questionStartTime
  ]);

  // Finalize all constructions for the question and move to feedback
  const finalizeQuestion = useCallback(() => {
    if (!state.currentSession || !state.quizState.currentQuestion) return;

    // Create comprehensive validation for all submitted constructions
    const allCorrect = state.submittedConstructions.every(c => c.validation?.isCorrect);
    const totalConstructions = state.quizState.currentQuestion.correctAnswers.length;
    const foundConstructions = state.submittedConstructions.length;

    // Record overall question result - simplified for demo, would be more detailed in production
    const overallValidation: ConstructionValidation = {
      constructionId: 'overall-question-validation',
      isCorrect: allCorrect && foundConstructions >= totalConstructions,
      userAnswer: {
        constructionId: 'overall-question-validation',
        selectedIndices: state.submittedConstructions.flatMap(c => c.indices),
        selectedType: state.submittedConstructions[0]?.constructionType || 'mudaf-mudaf-ilayh',
        timestamp: Date.now()
      },
      correctAnswer: state.quizState.currentQuestion.correctAnswers[0] || {
        id: 'demo-construction',
        type: 'mudaf-mudaf-ilayh',
        spans: [],
        roles: [],
        certainty: 'definite',
        explanation: 'Demo construction for validation'
      },
      feedback: {
        message: allCorrect && foundConstructions >= totalConstructions
          ? 'Excellent! You found all grammatical constructions correctly.'
          : `Found ${foundConstructions}/${totalConstructions} constructions. ${allCorrect ? 'All correct!' : 'Some incorrect.'}`,
        explanation: `This verse contains ${totalConstructions} grammatical construction(s).`,
        encouragement: allCorrect ? 'Great grammatical analysis!' : 'Keep practicing!'
      },
      score: allCorrect && foundConstructions >= totalConstructions ? 100 : Math.round((foundConstructions / totalConstructions) * 70)
    };

    currentValidation.current = overallValidation;

    setState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        isAnswered: true,
        showFeedback: true
      }
    }));
  }, [state.currentSession, state.quizState.currentQuestion, state.submittedConstructions]);

  // Next Question
  const nextQuestion = useCallback(() => {
    if (!state.currentSession) return;

    const currentQuestionNum = state.currentSession.questions.length;
    const totalQuestions = state.currentSession.settings.questionCount;

    if (currentQuestionNum >= totalQuestions) {
      // Complete session
      const completedSession = grammarQuizEngine.completeSession();
      setState(prev => ({
        ...prev,
        currentSession: completedSession,
        quizState: {
          ...prev.quizState,
          showFeedback: false,
          progress: { current: totalQuestions, total: totalQuestions, percentage: 100 }
        }
      }));
      return;
    }

    // Update progress and load next question
    setState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        showFeedback: false,
        progress: {
          current: currentQuestionNum + 1,
          total: totalQuestions,
          percentage: ((currentQuestionNum + 1) / totalQuestions) * 100
        }
      },
      currentSelections: [],
      activeSelectionId: null,
      selectedIndices: [],
      selectedConstructionType: null,
      submittedConstructions: []
    }));

    loadNextQuestion();
  }, [state.currentSession, loadNextQuestion]);

  // Reset Quiz
  const resetQuiz = useCallback(() => {
    setState({
      quizState: {
        userSelection: null,
        isAnswered: false,
        showFeedback: false,
        isLoading: false,
        progress: { current: 0, total: 0, percentage: 0 }
      },
      currentSession: null,
      questionStartTime: 0,
      selectedIndices: [],
      selectedConstructionType: null,
      submittedConstructions: [],
      currentValidation: null,
      roleAssignmentStep: 'selection',
      primaryRoleIndices: [],
      secondaryRoleIndices: []
    });
    currentValidation.current = null;
  }, []);

  // Get current statistics
  const getCurrentStatistics = useCallback(() => {
    return grammarQuizEngine.getSessionStatistics();
  }, []);

  // Check if current construction can be submitted
  const canSubmitConstruction = state.selectedIndices.length > 0 && 
                               state.selectedConstructionType !== null && 
                               !state.quizState.showFeedback;

  // Check if question can be finalized
  const canFinalizeQuestion = state.submittedConstructions.length > 0 && 
                             !state.quizState.showFeedback;

  // Check if session is completed
  const isSessionCompleted = state.currentSession?.endTime !== undefined;

  return {
    // State
    quizState: state.quizState,
    currentSession: state.currentSession,
    selectedIndices: state.selectedIndices,
    selectedConstructionType: state.selectedConstructionType,
    submittedConstructions: state.submittedConstructions,
    currentValidation: currentValidation.current,
    canSubmitConstruction,
    canFinalizeQuestion,
    isSessionCompleted,

    // Actions
    startSession,
    toggleWordSelection,
    selectConstructionType,
    submitCurrentConstruction,
    finalizeQuestion,
    nextQuestion,
    resetQuiz,
    getCurrentStatistics,

    // Helpers
    getCurrentQuestionNumber: () => state.currentSession ? state.currentSession.questions.length + 1 : 0,
    getProgress: () => state.quizState.progress,
    getAllSelectedIndices: () => [
      ...state.selectedIndices,
      ...state.submittedConstructions.flatMap(c => c.indices)
    ]
  };
}
