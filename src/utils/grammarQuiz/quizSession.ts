/**
 * Grammar Quiz Session Manager
 * 
 * Handles quiz sessions, tracking progress, answers, and statistics
 */

import {
  GrammarQuizSession,
  QuizSettings,
  QuestionResult,
  QuizStatistics,
  ConstructionValidation
} from '@/types/grammarQuiz';

/**
 * Starts a new quiz session with the given settings
 */
export function startSession(settings: QuizSettings): GrammarQuizSession {
  console.log('🎮 Starting new grammar quiz session with settings:', settings);
  
  return {
    id: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    endTime: null,
    settings,
    questions: [],
    results: [],
    currentQuestionIndex: 0,
    status: 'active',
  };
}

/**
 * Records an answer for the current question in the session
 */
export function recordAnswer(
  session: GrammarQuizSession,
  questionId: string,
  validation: ConstructionValidation,
  responseTimeMs: number
): GrammarQuizSession {
  console.log(`📝 Recording answer for question ${questionId}`);
  
  if (!session || session.status !== 'active') {
    console.error('Cannot record answer: No active session');
    throw new Error('No active quiz session');
  }
  
  // Create question result
  const result: QuestionResult = {
    questionId,
    responseTimeMs,
    isCorrect: validation.isCorrect,
    partialCorrect: validation.partialCorrect,
    scorePercentage: validation.scorePercentage,
    timestamp: new Date().toISOString(),
  };
  
  // Update session with result
  const updatedResults = [...session.results, result];
  const updatedSession = {
    ...session,
    results: updatedResults,
    currentQuestionIndex: session.currentQuestionIndex + 1,
  };
  
  console.log(`✅ Recorded answer. Session now has ${updatedResults.length} results`);
  return updatedSession;
}

/**
 * Gets current session statistics
 */
export function getSessionStatistics(session: GrammarQuizSession): QuizStatistics {
  console.log('📊 Calculating quiz session statistics');
  
  const stats: QuizStatistics = {
    totalQuestions: session.results.length,
    correctAnswers: session.results.filter(r => r.isCorrect).length,
    partialAnswers: session.results.filter(r => !r.isCorrect && r.partialCorrect).length,
    averageScore: 0,
    averageResponseTime: 0,
    progressByType: {},
    difficultyScores: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    }
  };
  
  // Calculate averages if there are results
  if (stats.totalQuestions > 0) {
    stats.averageScore = 
      session.results.reduce((sum, r) => sum + r.scorePercentage, 0) / stats.totalQuestions;
    
    stats.averageResponseTime = 
      session.results.reduce((sum, r) => sum + r.responseTimeMs, 0) / stats.totalQuestions;
  }
  
  return stats;
}

/**
 * Completes current session
 */
export function completeSession(session: GrammarQuizSession): GrammarQuizSession {
  console.log('🏁 Completing grammar quiz session');
  
  if (!session) {
    console.error('Cannot complete session: No session provided');
    throw new Error('No quiz session to complete');
  }
  
  // Mark session as completed with end time
  const completedSession = {
    ...session,
    endTime: new Date().toISOString(),
    status: 'completed' as const
  };
  
  console.log('✅ Session completed');
  return completedSession;
}
