/**
 * Grammar Construction Quiz Types
 * 
 * Type definitions for the Grammar Construction Quiz feature.
 * Focuses on identifying Arabic grammatical constructions like Mudaf-Mudaf Ilayh and Jar-Majroor.
 * Follows existing patterns from quranQuiz.ts for consistency.
 */

import { MorphologicalDetails } from './morphology';

// Core Construction Types
export type ConstructionType = 'mudaf-mudaf-ilayh' | 'jar-majroor';

/**
 * Represents a grammatical construction in Arabic text
 */
export interface GrammarConstruction {
  id: string;
  type: ConstructionType;
  spans: number[];              // Word indices that form this construction
  roles: string[];              // Grammatical role of each word
  certainty: 'definite' | 'probable' | 'inferred';
  explanation: string;
}

/**
 * A single quiz question containing an Arabic fragment with embedded constructions
 */
export interface GrammarQuizQuestion {
  id: string;
  fragment: string;                           // Arabic text fragment to analyze
  segments: MorphologicalDetails[];           // Parsed morphological segments
  correctAnswers: GrammarConstruction[];      // All valid grammatical constructions
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sourceReference?: string;                   // Optional Quranic verse reference
  hints?: string[];                          // Optional hints for learning
  metadata: {
    createdAt: Date;
    constructionTypes: string[];              // Types of constructions present
    wordCount: number;
    estimatedDifficulty: number;              // 1-10 scale
  };
  // Quranic metadata for questions sourced from Quran
  quranMetadata?: {
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    translation: string;
  };
}

/**
 * User's selection for construction identification
 */
export interface UserSelection {
  selectedIndices: number[];                  // User-selected word positions (0-based)
  relationshipType: ConstructionType;
  confidence?: number;                        // Optional user confidence level (1-5)
  timestamp: Date;
  selectionTimeMs: number;                   // Time taken to make selection
}

/**
 * User's answer for a grammatical construction in a quiz question
 */
export interface ConstructionAnswer {
  constructionId: string;
  selectedIndices: number[];     // User-selected word indices
  selectedType: ConstructionType;
  timestamp: number;
}

/**
 * Validation feedback for user answers
 */
export interface ValidationFeedback {
  message: string;                         // Main feedback message
  explanation: string;                     // Detailed grammatical explanation
  corrections?: string[];                  // Specific corrections needed
  encouragement?: string;                  // Positive reinforcement
}

/**
 * Result of validating a user's answer
 */
export interface ConstructionValidation {
  constructionId: string;
  isCorrect: boolean;
  userAnswer: ConstructionAnswer;
  correctAnswer: GrammarConstruction;
  feedback: ValidationFeedback;
  score: number;                // 0-100 based on accuracy
}

/**
 * Individual question result within a quiz session
 */
export interface QuestionResult {
  questionId: string;
  fragment: string;
  userAnswer: ConstructionAnswer;
  correctConstructions: GrammarConstruction[];
  validation: ConstructionValidation;
  responseTimeMs: number;                   // Total time spent on question
  attemptsCount: number;                    // Number of attempts (for retry feature)
  timestamp: Date;
  metadata: {
    hintsUsed: number;
    difficultyLevel: string;
    wasSkipped: boolean;
  };
}

/**
 * Complete quiz session with all questions and results
 */
export interface GrammarQuizSession {
  sessionId: string;
  userId?: string;                          // Optional user identification
  startTime: Date;
  endTime?: Date;
  questions: QuestionResult[];
  currentQuestionIndex: number;
  statistics: QuizStatistics;
  settings: QuizSettings;
  metadata: {
    version: string;                        // Quiz engine version
    totalPauseTimeMs: number;              // Time spent paused
    deviceInfo?: string;                   // Optional device/browser info
  };
}

/**
 * Statistical analysis of quiz performance
 */
export interface QuizStatistics {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  partialCorrectAnswers: number;
  accuracy: number;                         // 0-1 percentage
  averageResponseTimeMs: number;
  averageConfidence?: number;               // If confidence tracking enabled
  constructionTypeAccuracy: {
    'mudaf-mudaf-ilayh': number;
    'jar-majroor': number;
  };
  difficultyPerformance: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  improvementTrend: number;                 // Performance trend over session
}

/**
 * Quiz configuration and user preferences
 */
export interface QuizSettings {
  questionCount: number;                    // Number of questions per session
  difficulty: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
  constructionTypes: ('mudaf-mudaf-ilayh' | 'jar-majroor')[];
  timeLimit?: number;                       // Optional time limit in seconds
  hintsEnabled: boolean;
  immediateAnswers: boolean;                // Show answers immediately vs at end
  confidenceTracking: boolean;             // Ask user for confidence ratings
  retryIncorrect: boolean;                  // Allow retry of incorrect answers
}

/**
 * Configuration for quiz question generation
 */
export interface QuizGenerationConfig {
  sourceCorpus: 'quran' | 'custom' | 'mixed';
  constructionDensity: 'low' | 'medium' | 'high';  // How many constructions per fragment
  maxFragmentLength: number;                        // Maximum words per fragment
  excludeComplexChains: boolean;                    // Exclude complex Idafa chains
  balanceConstructionTypes: boolean;                // Ensure even distribution
  preferDefiniteConstructions: boolean;             // Prefer high-certainty constructions
}

/**
 * Export format for quiz session data
 */
export interface QuizSessionExport {
  exportTimestamp: Date;
  exportVersion: string;
  session: GrammarQuizSession;
  analytics: {
    learningInsights: string[];             // Generated learning recommendations
    strengthAreas: string[];                // Areas of good performance
    improvementAreas: string[];             // Areas needing work
    recommendedPractice: string[];          // Specific practice recommendations
  };
}

/**
 * Progress tracking across multiple quiz sessions
 */
export interface UserQuizProgress {
  userId: string;
  totalSessions: number;
  totalQuestions: number;
  overallAccuracy: number;
  skillLevels: {
    'mudaf-mudaf-ilayh': number;           // 0-100 skill level
    'jar-majroor': number;
  };
  streaks: {
    current: number;                        // Current correct answer streak
    longest: number;                        // Longest streak achieved
  };
  achievements: string[];                   // Unlocked achievements
  lastSessionDate: Date;
  learningVelocity: number;                // Rate of improvement
}

/**
 * Real-time quiz state for UI components
 */
export interface QuizState {
  currentQuestion?: GrammarQuizQuestion;
  userSelection: UserSelection | null;
  isAnswered: boolean;
  showFeedback: boolean;
  isLoading: boolean;
  error?: string;
  timeRemaining?: number;                   // Seconds remaining if time limit enabled
  progress: {
    current: number;                        // Current question number (1-based)
    total: number;                          // Total questions in session
    percentage: number;                     // 0-100 completion percentage
  };
}
