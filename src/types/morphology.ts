
export interface MorphologicalDetails {
  id: string;
  text: string;
  morphology: 'noun' | 'verb' | 'particle' | 'adjective';
  type: 'prefix' | 'root' | 'suffix';
  
  // Enhanced morphological properties
  grammaticalRole?: string;
  case?: 'nominative' | 'accusative' | 'genitive';
  number?: 'singular' | 'dual' | 'plural';
  gender?: 'masculine' | 'feminine';
  isDefinite?: boolean;                    // Required for الموصوف والصفة agreement
  person?: 'first' | 'second' | 'third';
  tense?: 'past' | 'present' | 'future' | 'imperative';
  voice?: 'active' | 'passive';
  mood?: 'indicative' | 'subjunctive' | 'jussive';
  
  // Root information
  rootLetters?: string;
  pattern?: string;
  
  // Semantic information
  meaning?: string;
  etymology?: string;
  
  // Related grammar explanations
  grammarExplanations?: GrammarExplanation[];
  
  // Grammatical relationships
  relationships?: GrammaticalRelationship[];
  
  // Index tracking for aggregated segments (used in Token Group aggregation)
  originalIndices?: number[];
}

export interface GrammaticalRelationship {
  id: string;
  type: 'jar-majrur' | 'mudaf-mudaf-ilayh' | 'mawsuf-sifah' | 'mawsoof-sifah' | 'fi3l-fa3il' | 'verb-object';
  role: 'jar' | 'majrur' | 'mudaf' | 'mudaf-ilayh' | 'mawsuf' | 'sifah' | 'mawsoof' | 'fi3l' | 'fa3il' | 'verb' | 'object';
  relatedSegmentId: string;
  description: string;
}

export interface GrammarExplanation {
  id: string;
  term: string;
  definition: string;
  examples: string[];
  relatedTerms: string[];
  category: 'syntax' | 'morphology' | 'semantics';
}

export interface PopupPosition {
  x: number;
  y: number;
  side: 'left' | 'right' | 'above' | 'below';
}

export interface PopupState {
  isOpen: boolean;
  segment: MorphologicalDetails | null;
  position: PopupPosition | null;
  activeGrammarTerm: string | null;
}
