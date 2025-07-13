/**
 * Grammar Construction Quiz Engine
 * 
 * This file is a compatibility layer that re-exports the functionality
 * from the refactored modular structure in ./grammarQuiz/
 * 
 * For direct access to the new modular API, import from:
 * import { grammarQuizEngine } from '@/utils/grammarQuiz';
 */

// Re-export the main engine and its singleton instance
import { 
  grammarQuizEngine,
  SUPPORTED_CONSTRUCTION_TYPES,
  CONSTRUCTION_CONFIG
} from './grammarQuiz';

// Import detector functions to expose directly
import {
  detectIdafa,
  detectJarMajroor,
  detectFilFail,
  detectHarfNasbIsmuha
} from './grammarQuiz/detectors';

// Re-export all types for backward compatibility
import {
  GrammarQuizQuestion,
  GrammarConstruction,
  UserSelection,
  ConstructionValidation,
  QuizGenerationConfig,
  GrammarQuizSession,
  QuizSettings,
  QuestionResult,
  QuizStatistics,
  ConstructionType
} from '@/types/grammarQuiz';

// Export original class for backward compatibility
export { GrammarQuizEngine } from './grammarQuiz/engine';

// Re-export the singleton instance as default
export default grammarQuizEngine;

// For backward compatibility, also export the singleton as a named export
export { grammarQuizEngine };

// For backward compatibility with the original ST object structure
// This ensures that legacy code accessing ST.detectIdafa will work
export const ST = {
  detectIdafa,
  detectJarMajroor,
  detectFilFail,
  detectHarfNasbIsmuha
};
