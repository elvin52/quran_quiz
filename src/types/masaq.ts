
import { MorphologicalDetails } from './morphology';

// Enhanced types for MASAQ dataset integration
export interface MASAQEntry {
  id: string;
  surah: number;
  verse: number;
  word: number;
  segment: number;
  form: string;
  
  // Basic morphological information
  pos: string; // Part of speech
  lemma: string;
  root: string;
  pattern: string;
  
  // Detailed morphological features
  aspect?: string;
  case?: string;
  definite?: string;
  gender?: string;
  mood?: string;
  number?: string;
  person?: string;
  state?: string;
  tense?: string;
  voice?: string;
  
  // Syntactic information
  syntacticRole?: string;
  dependencyHead?: number;
  dependencyRelation?: string;
  
  // Semantic information
  namedEntity?: string;
  concept?: string;
  
  // Additional features
  features: Record<string, string>;
}

export interface EnhancedMorphologicalDetails extends MorphologicalDetails {
  // MASAQ-specific enhancements
  masaqData?: MASAQEntry;
  
  // Enhanced morphological properties
  aspect?: 'perfective' | 'imperfective' | 'imperative';
  definite?: 'definite' | 'indefinite';
  state?: 'construct' | 'absolute';
  
  // Syntactic enhancements
  syntacticRole?: string;
  dependencyHead?: string;
  dependencyRelation?: string;
  
  // Semantic enhancements
  namedEntity?: string;
  concept?: string;
  semanticField?: string;
  
  // Enhanced pattern information
  morphologicalPattern?: string;
  derivationalMorphology?: string[];
  
  // Confidence scores for AI-generated analysis
  confidenceScores?: {
    morphology: number;
    syntax: number;
    semantics: number;
  };
}

export interface MASAQDataset {
  entries: MASAQEntry[];
  metadata: {
    version: string;
    totalEntries: number;
    coverage: {
      surahs: number[];
      totalWords: number;
      totalSegments: number;
    };
  };
}

// Color coding system for enhanced morphological features
export interface EnhancedColorScheme {
  pos: Record<string, string>;
  case: Record<string, string>;
  tense: Record<string, string>;
  voice: Record<string, string>;
  syntacticRole: Record<string, string>;
}
