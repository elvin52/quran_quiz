/**
 * Grammar Construction Quiz Types
 * 
 * Type definitions for the Grammar Construction Quiz feature.
 * Focuses on identifying Arabic grammatical constructions like Mudaf-Mudaf Ilayh and Jar-Majroor.
 * Follows existing patterns from quranQuiz.ts for consistency.
 */

import { MorphologicalDetails } from './morphology';

// Core Construction Types
export type ConstructionType = 'mudaf-mudaf-ilayh' | 'jar-majroor' | 'fil-fail' | 'harf-nasb-ismuha';

// Construction taxonomy
export type SimpleConstructionType = 'mudaf-mudaf-ilayh' | 'jar-majroor';
export type RoleBasedConstructionType = 'fil-fail' | 'harf-nasb-ismuha';

// =====================
// GRANULAR COMPONENT SELECTION TYPES
// =====================

// Component roles for granular selection
export type ComponentRole = 
  | 'mudaf'           // First part of Iḍāfa
  | 'mudaf-ilayh'     // Second part of Iḍāfa  
  | 'jar'             // Preposition in Jar wa Majrūr
  | 'majroor'         // Noun after preposition
  | 'fil'             // Verb in Fiʿl–Fāʿil
  | 'fail'            // Doer/subject in Fiʿl–Fāʿil
  | 'harf-nasb'       // Harf Nasb particle
  | 'ismuha';         // Noun after Harf Nasb

// Component selection for individual words
export interface ComponentSelection {
  wordIndex: number;        // Index of selected word in verse
  wordId: string;          // Unique word identifier
  role: ComponentRole;     // Assigned grammatical role
  constructionId?: string; // Links components of same construction
}

// Construction formed by component pairs/groups
export interface ComponentConstruction {
  id: string;
  type: ConstructionType;
  components: ComponentSelection[];  // All components in this construction
  isComplete: boolean;              // Whether all required components are selected
}

// User answer with granular component selection
export interface ComponentAnswer {
  questionId: string;
  selectedComponents: ComponentSelection[];     // Individual word-role assignments
  constructions: ComponentConstruction[];       // Formed constructions
  timestamp: number;
}

// =====================
// COMPONENT ROLE CONFIGURATION
// =====================

// Required component roles for each construction type
export const CONSTRUCTION_COMPONENT_ROLES: Record<ConstructionType, ComponentRole[]> = {
  'mudaf-mudaf-ilayh': ['mudaf', 'mudaf-ilayh'],
  'jar-majroor': ['jar', 'majroor'],
  'fil-fail': ['fil', 'fail'],
  'harf-nasb-ismuha': ['harf-nasb', 'ismuha']
};

// Simple display names for component roles
export const COMPONENT_ROLE_NAMES: Record<ComponentRole, string> = {
  'mudaf': 'Mudaf',
  'mudaf-ilayh': 'Mudaf Ilayh', 
  'jar': 'Jar',
  'majroor': 'Majroor',
  'fil': 'Fiʿl',
  'fail': 'Fāʿil',
  'harf-nasb': 'Harf Nasb',
  'ismuha': 'Ismuha'
};

// Helper to get construction type from component role
export function getConstructionTypeForRole(role: ComponentRole): ConstructionType {
  for (const [constructionType, roles] of Object.entries(CONSTRUCTION_COMPONENT_ROLES)) {
    if (roles.includes(role)) {
      return constructionType as ConstructionType;
    }
  }
  throw new Error(`No construction type found for role: ${role}`);
}

/**
 * Steps in the role assignment process for role-based constructions
 */
export type RoleAssignmentStep = 
  | 'selection'           // Initial word selection phase
  | 'primary-selection'   // Selecting words for primary role (verb, naṣb particle)
  | 'secondary-selection' // Selecting words for secondary role (doer, governed verb)
  | 'complete';           // Role assignment complete

/**
 * Grammatical roles for role-based constructions
 */
export interface GrammaticalRole {
  name: string;                    // e.g., 'fiʿl', 'fāʿil', 'harf-naṣb', 'ismuha'
  description: string;             // Human-readable description
  arabicName?: string;             // Arabic name for the role
  morphologicalIndicators: string[]; // Morphological tags that suggest this role
}

/**
 * Role-based relationship between words in Arabic grammar
 */
export interface RoleBasedRelationship {
  id: string;
  type: RoleBasedConstructionType;
  primaryRole: GrammaticalRole;     // The governing element (Fiʿl, Harf Naṣb)
  secondaryRole: GrammaticalRole;   // The governed element (Fāʿil, Ismuha)
  primaryIndices: number[];         // Indices of words serving primary role
  secondaryIndices: number[];       // Indices of words serving secondary role
  certainty: 'definite' | 'probable' | 'inferred';
  explanation: string;
}

/**
 * Predefined grammatical roles for role-based constructions
 */
export const GRAMMATICAL_ROLES: Record<RoleBasedConstructionType, { primary: GrammaticalRole; secondary: GrammaticalRole }> = {
  'fil-fail': {
    primary: {
      name: 'fiʿl',
      description: 'Verb - the action or state',
      arabicName: 'فِعْل',
      morphologicalIndicators: ['IV', 'PV', 'VERB']
    },
    secondary: {
      name: 'fāʿil',
      description: 'Doer - the one who performs the action',
      arabicName: 'فَاعِل',
      morphologicalIndicators: ['NOUN', 'PRON', 'NOM']
    }
  },
  'harf-nasb-ismuha': {
    primary: {
      name: 'harf-naṣb',
      description: 'Particle of accusative - governs verbs in accusative',
      arabicName: 'حَرْف نَصْب',
      morphologicalIndicators: ['HARF_NASB', 'PART']
    },
    secondary: {
      name: 'ismuha',
      description: 'Governed verb - the verb governed by the particle',
      arabicName: 'اسْمُهَا',
      morphologicalIndicators: ['IMPERF', 'IV']
    }
  }
};

/**
 * Represents a grammatical construction in Arabic text
 * Supports both simple constructions (Mudaf-Mudaf Ilayh, Jar-Majroor) and role-based constructions (Fiʿl-Fāʿil, Harf Naṣb-Ismuha)
 */
export interface GrammarConstruction {
  id: string;
  type: ConstructionType;
  spans: number[];              // Word indices that form this construction
  roles: string[];              // Grammatical role of each word (for simple constructions)
  certainty: 'definite' | 'probable' | 'inferred';
  explanation: string;
  
  // For role-based constructions
  roleBasedRelationship?: RoleBasedRelationship;
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
 * Supports both simple constructions and multi-step role-based constructions
 */
export interface UserSelection {
  selectedIndices: number[];                  // User-selected word positions (0-based)
  relationshipType: ConstructionType;
  confidence?: number;                        // Optional user confidence level (1-5)
  timestamp: Date;
  selectionTimeMs: number;                   // Time taken to make selection
  
  // For role-based constructions - multi-step selection
  roleBasedSelection?: {
    step: 'primary-selection' | 'secondary-selection' | 'complete';
    primaryIndices: number[];                 // Indices for primary role (Fiʿl, Harf Naṣb)
    secondaryIndices: number[];               // Indices for secondary role (Fāʿil, Ismuha)
    primaryRole?: string;                     // Selected primary role name
    secondaryRole?: string;                   // Selected secondary role name
    stepTimestamps: Date[];                   // Timestamp for each selection step
  };
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
    'fil-fail': number;
    'harf-nasb-ismuha': number;
  };
  difficultyPerformance: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  improvementTrend: number;                 // Performance trend over session
  
  // Role-based construction statistics
  roleBasedPerformance?: {
    averageStepsToComplete: number;         // Average steps needed for role-based constructions
    roleIdentificationAccuracy: number;     // Accuracy of role identification (primary/secondary)
    mostConfusedRoles: string[];           // Roles users struggle with most
    stepCompletionTimes: {
      primarySelection: number;             // Average time for primary role selection
      secondarySelection: number;           // Average time for secondary role selection
    };
  };
}

/**
 * Quiz configuration and user preferences
 */
export interface QuizSettings {
  questionCount: number;                    // Number of questions per session
  difficulty: 'mixed' | 'beginner' | 'intermediate' | 'advanced';
  constructionTypes: ConstructionType[];   // All supported construction types
  timeLimit?: number;                       // Optional time limit in seconds
  hintsEnabled: boolean;
  immediateAnswers: boolean;                // Show answers immediately vs at end
  confidenceTracking: boolean;             // Ask user for confidence ratings
  retryIncorrect: boolean;                  // Allow retry of incorrect answers
  
  // Role-based construction settings
  roleBasedSettings?: {
    enableMultiStepSelection: boolean;      // Enable step-by-step role selection
    showRoleHints: boolean;                 // Show morphological hints for roles
    allowRoleCorrection: boolean;           // Allow users to correct role assignments
  };
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
