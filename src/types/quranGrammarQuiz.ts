/**
 * Quran Grammar Quiz – Underline Mode Types
 * 
 * Type definitions for the Quranic verse-based grammar quiz with visual word marking.
 * This extends the existing grammar quiz functionality with Quranic content.
 */

// Verse reference for tracking
export interface VerseReference {
  surahId: number;
  verseId: number;
  surahName: string;
  surahNameArabic: string;
}

// Word selection state for visual marking
export interface WordSelection {
  wordId: string;          // Format: "surah-verse-word"
  segmentId?: string;      // Format: "surah-verse-word-segment" (optional for segment-level selection)
  text: string;
  isSelected: boolean;
  selectionOrder: number;  // Order in which words were selected
}

// Quran-specific quiz question
export interface QuranGrammarQuizQuestion {
  id: string;
  verse: VerseReference;
  arabicText: string;
  translation: string;
  words: WordSelection[];
  constructionType: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  correctAnswers: QuranGrammarConstruction[];
  prompt: string;          // e.g., "Mark a Jar-Majroor construction"
}

// Grammar construction found in the verse
export interface QuranGrammarConstruction {
  type: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  wordIds: string[];       // Array of word IDs that form the construction
  segmentIds?: string[];   // Optional segment-level IDs
  arabicText: string;      // The actual Arabic text of the construction
  grammaticalExplanation: string;
  confidence: number;      // Detection confidence (0-1)
}

// User's marked selection
export interface QuranUserSelection {
  selectedWordIds: string[];
  selectedSegmentIds?: string[];
  constructionType: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  selectionTimeMs: number;
  timestamp: Date;
}

// Validation result for marked words
export interface QuranAnswerValidation {
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;           // 0-100
  correctConstructions: QuranGrammarConstruction[];
  userConstructions: QuranGrammarConstruction[];
  feedback: {
    message: string;
    explanation: string;
    correctHighlight: string[];  // Word IDs to highlight as correct
    incorrectHighlight: string[]; // Word IDs to highlight as incorrect
  };
}

// =====================
// GRANULAR COMPONENT VALIDATION
// =====================

// Import ComponentRole and related types
import type { ComponentRole, ComponentSelection, ComponentConstruction } from './grammarQuiz';

// Component-level validation result
export interface ComponentValidationResult {
  component: ComponentSelection;
  isCorrect: boolean;
  expectedRole?: ComponentRole;  // What role this word should have (if any)
  feedback: string;              // Specific feedback for this component
}

// Construction-level validation for component-based answers
export interface ConstructionValidationResult {
  type: string;  // ConstructionType
  isComplete: boolean;           // Are all required components present?
  isCorrect: boolean;           // Are all components correctly assigned?
  componentResults: ComponentValidationResult[];
  feedback: string;
}

// Enhanced validation for component-based quiz
export interface ComponentAnswerValidation {
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;                                    // 0-100
  componentScore: number;                           // Component-level accuracy
  constructionScore: number;                        // Construction completion accuracy
  componentResults: ComponentValidationResult[];    // Individual component feedback
  constructionResults: ConstructionValidationResult[]; // Construction-level feedback
  feedback: {
    message: string;
    explanation: string;
    detailedBreakdown: string[];                    // Component-by-component analysis
    correctHighlight: string[];                     // Word IDs to highlight as correct
    incorrectHighlight: string[];                   // Word IDs to highlight as incorrect
    roleHighlight: Record<string, ComponentRole>;   // Word ID to role mapping for display
  };
}

// Session tracking for analytics
export interface QuranGrammarQuizSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  settings: QuranQuizSettings;
  questions: QuranQuestionResult[];
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    partiallyCorrectAnswers: number;
    incorrectAnswers: number;
    averageResponseTime: number;
    accuracy: number;
    constructionTypeAccuracy: {
      'mudaf-mudaf-ilayh': number;
      'jar-majroor': number;
    };
  };
}

// Quiz settings specific to Quran mode
export interface QuranQuizSettings {
  questionCount: number;
  constructionTypes: ('mudaf-mudaf-ilayh' | 'jar-majroor')[];
  surahRange?: {
    fromSurah: number;
    toSurah: number;
  };
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  showTranslation: boolean;
  showVerseReference: boolean;
  fontFamily: 'naskh' | 'uthmanic' | 'default';
}

// Result for individual question
export interface QuranQuestionResult {
  questionId: string;
  verse: VerseReference;
  userSelection: QuranUserSelection;
  validation: QuranAnswerValidation;
  responseTimeMs: number;
  timestamp: Date;
}

// Quiz state management
export interface QuranQuizState {
  currentQuestion?: QuranGrammarQuizQuestion;
  userSelection: QuranUserSelection | null;
  isAnswered: boolean;
  showFeedback: boolean;
  isLoading: boolean;
  error?: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

// Configuration for question generation
export interface QuranQuizGenerationConfig {
  preferredConstructionTypes: ('mudaf-mudaf-ilayh' | 'jar-majroor')[];
  minConstructionsPerVerse: number;
  maxConstructionsPerVerse: number;
  requireBothTypes: boolean;
}
