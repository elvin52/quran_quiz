
import { MorphologicalDetails } from './morphology';

// Enhanced types for MASAQ dataset integration
/**
 * Interface for entries from MASAQ.csv file, mapping directly to CSV columns
 * This interface follows the exact column structure of the MASAQ.csv file
 */
export interface MASAQEntry {
  // Basic identifiers
  id: string;                        // ID column 
  sura_no: number;                   // Sura_No column
  verse_no: number;                  // Verse_No column
  column5?: string;                  // Column5 (unknown purpose)
  word_no: number;                   // Word_No column
  
  // Word form information
  word: string;                      // Word column (full form with diacritics)
  without_diacritics: string;        // Without_Diacritics column
  segmented_word: string;            // Segmented_Word column
  
  // Morphological classification
  morph_tag: string;                 // Morph_tag column (e.g., DET, PREP, NOUN_ABSTRACT)
  morph_type: string;                // Morph_type column (Prefix, Stem, Suffix)
  punctuation_mark?: string;         // Punctuation_Mark column
  
  // Grammatical information
  invariable_declinable?: string;    // Invariable_Declinable column
  syntactic_role?: string;           // Syntactic_Role column
  possessive_construct?: string;     // Possessive_Construct column (مضاف/غير مضاف)
  case_mood?: string;                // Case_Mood column
  case_mood_marker?: string;         // Case_Mood_Marker column
  
  // Phrasal information
  phrase?: string;                   // Phrase column
  phrasal_function?: string;         // Phrasal_Function column
  notes?: string;                    // Notes column
}

/**
 * Interface for morphological details enhanced with MASAQ data
 * Maps between our application's MorphologicalDetails and MASAQ data
 */
export interface EnhancedMorphologicalDetails extends MorphologicalDetails {
  // Additional properties enhanced with MASAQ data
  confidence: number;                // Confidence score for morphological analysis
  masaqReference?: string;           // Reference back to source MASAQ entry
  semanticField?: string;            // Derived semantic field
  tag?: string;                      // Tag from morph_tag to support legacy references
  
  // MASAQ-specific properties mapped to our system
  morph_tag?: string;                // Original Morph_tag from MASAQ
  morph_type?: string;               // Original Morph_type from MASAQ
  syntactic_role?: string;           // Original Syntactic_Role from MASAQ
  possessive_construct?: string;     // Original Possessive_Construct from MASAQ (for idafa detection)
  
  // Idafa-related properties
  isMudaf?: boolean;                 // Is this segment a mudaf (first part of idafa)
  isMudafIlayh?: boolean;            // Is this segment a mudaf ilayh (second part of idafa)
  
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
  
  // Enhanced pattern information
  morphologicalPattern?: string;
  derivationalMorphology?: string[];
  
  // Confidence scores for AI-generated analysis
  confidenceScores?: {
    morphology: number;
    syntax: number;
    semantics: number;
  };
  
  // Aggregation-related properties
  originalIndices?: number[];        // Original indices for aggregated segments
  isAggregated?: boolean;            // Whether this segment is an aggregation of multiple segments
  
  // MASAQ-specific additional data
  additionalFeatures?: {
    morph_tag: string;
    morph_type: string;
    case_mood: string;
    case_mood_marker: string;
    confidence: string;
  };
  
  // Additional lexical information
  lemma?: string;                     // Lemma (dictionary form) of the word
  root?: string;                      // Root letters (for Arabic trilateral/quadrilateral roots)
}

/**
 * Interface representing the entire MASAQ dataset including entries and metadata
 */
export interface MASAQDataset {
  entries: MASAQEntry[];
  metadata: {
    totalEntries: number;
    surahs: number[];
    verses: Map<number, number[]>;
    // Statistics about morphological types
    morphTypes: {
      prefixes: string[];
      stems: string[];
      suffixes: string[];
    };
    // Statistics about morphological tags
    morphTags: {
      [key: string]: number; // Tag name -> count
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
