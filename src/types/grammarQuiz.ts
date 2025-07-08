/**
 * Type definitions for the Grammar Construction Quiz feature
 * 
 * This quiz teaches users to identify Arabic grammatical constructions:
 * - Mudaf–Mudaf Ilayh (إضافة) - Possessive/genitive constructions
 * - Jar–Majroor (حرف جر والمجرور) - Prepositional phrases
 */

import { MorphologicalDetails } from './morphology';

/**
 * Represents a grammatical construction within a text fragment
 */
export interface GrammarConstruction {
  id: string;
  type: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  spans: number[];              // Word indices that form this construction
  roles: string[];              // Grammatical role of each word (mudaf, mudaf-ilayh, jar, majroor)
  certainty: 'definite' | 'probable' | 'inferred';
  explanation: string;          // Detailed grammatical explanation
  textbookRule?: string;        // Reference to grammatical rule
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
 * User's selection for a quiz question
 */
export interface UserSelection {
  selectedIndices: number[];                  // User-selected word positions (0-based)
  relationshipType: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  confidence?: number;                        // Optional user confidence level (1-5)
  timestamp: Date;
  selectionTimeMs: number;                   // Time taken to make selection
}

/**
 * Result of validating a user's answer
 */
export interface AnswerValidation {
  isCorrect: boolean;
  partialCredit: number;                     // 0-1 score for partial correctness
  matchedConstruction?: GrammarConstruction; // Which construction the user matched
  feedback: {
    message: string;                         // Main feedback message
    explanation: string;                     // Detailed grammatical explanation
    corrections?: string[];                  // Specific corrections needed
    encouragement?: string;                  // Positive reinforcement
  };
  highlightCorrect: number[];               // Indices to highlight as correct
  highlightIncorrect: number[];             // Indices to highlight as incorrect
}

/**
 * Individual question result within a quiz session
 */
export interface QuestionResult {
  questionId: string;
  fragment: string;
  userSelection: UserSelection;
  correctAnswers: GrammarConstruction[];
  validation: AnswerValidation;
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
