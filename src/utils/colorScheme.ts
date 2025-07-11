import { EnhancedColorScheme } from '@/types/masaq';

// Enhanced color scheme for morphological features
export const enhancedColorScheme: EnhancedColorScheme = {
  pos: {
    // Nouns
    'N': '#FFD700',        // Gold for nouns
    'NOUN': '#FFD700',
    'PN': '#FFA500',       // Orange for proper nouns
    'PRON': '#FF8C00',     // Dark orange for pronouns
    
    // Verbs
    'V': '#6EC1E4',        // Blue for verbs
    'VERB': '#6EC1E4',
    'IV': '#4169E1',       // Royal blue for imperfect verbs
    'PV': '#1E90FF',       // Dodger blue for perfect verbs
    'CV': '#00BFFF',       // Deep sky blue for command verbs
    
    // Particles
    'P': '#9ACD32',        // Yellow-green for particles
    'PART': '#9ACD32',
    'PREP': '#90EE90',     // Light green for prepositions
    'CONJ': '#98FB98',     // Pale green for conjunctions
    'INTJ': '#ADFF2F',     // Green-yellow for interjections
    
    // Adjectives
    'ADJ': '#FF6347',      // Tomato red for adjectives
    'A': '#FF6347',
    
    // Others
    'DET': '#DDA0DD',      // Plum for determiners
    'NUM': '#F0E68C',      // Khaki for numbers
    'ADV': '#FFB6C1',      // Light pink for adverbs
    'default': '#ffffff'   // Light gray for unknown
  },
  
  case: {
    'nominative': '#00FF7F',    // Spring green
    'accusative': '#FF4500',    // Orange red
    'genitive': '#8A2BE2',      // Blue violet
    'default': '#ffffff'
  },
  
  tense: {
    'past': '#CD853F',          // Peru
    'present': '#20B2AA',       // Light sea green
    'future': '#9370DB',        // Medium purple
    'imperative': '#DC143C',    // Crimson
    'default': '#ffffff'
  },
  
  voice: {
    'active': '#228B22',        // Forest green
    'passive': '#B22222',       // Fire brick
    'default': '#ffffff'
  },
  
  syntacticRole: {
    'subject': '#FF1493',       // Deep pink
    'object': '#00CED1',        // Dark turquoise
    'predicate': '#FF8C00',     // Dark orange
    'modifier': '#9932CC',      // Dark orchid
    'complement': '#FF6347',    // Tomato
    'adjunct': '#32CD32',       // Lime green
    'default': '#ffffff'
  }
};

export const getSegmentColor = (
  morphology: string, 
  type: string, 
  enhancedFeatures?: {
    pos?: string;
    case?: string;
    tense?: string;
    voice?: string;
    syntacticRole?: string;
  }
): string => {
  // Priority order: syntactic role > POS > traditional morphology > type
  
  if (enhancedFeatures?.syntacticRole) {
    return enhancedColorScheme.syntacticRole[enhancedFeatures.syntacticRole] || 
           enhancedColorScheme.syntacticRole.default;
  }
  
  if (enhancedFeatures?.pos) {
    return enhancedColorScheme.pos[enhancedFeatures.pos] || 
           enhancedColorScheme.pos.default;
  }
  
  // Fall back to original color scheme
  if (type === 'prefix') {
    return '#FFA500'; // Orange for prefixes
  } else if (type === 'suffix') {
    return '#FF69B4'; // Pink for suffixes
  } else { // root
    switch (morphology) {
      case 'noun':
        return '#FFD700'; // Gold for noun roots
      case 'verb':
        return '#6EC1E4'; // Blue for verb roots
      case 'particle':
        return '#9ACD32'; // Green for particle roots
      case 'adjective':
        return '#FF6347'; // Tomato red for adjective roots
      default:
        return '#ffffff'; // White as default text color
    }
  }
};

export const getFeatureColor = (feature: string, value: string): string => {
  switch (feature) {
    case 'case':
      return enhancedColorScheme.case[value] || enhancedColorScheme.case.default;
    case 'tense':
      return enhancedColorScheme.tense[value] || enhancedColorScheme.tense.default;
    case 'voice':
      return enhancedColorScheme.voice[value] || enhancedColorScheme.voice.default;
    case 'pos':
      return enhancedColorScheme.pos[value] || enhancedColorScheme.pos.default;
    case 'syntacticRole':
      return enhancedColorScheme.syntacticRole[value] || enhancedColorScheme.syntacticRole.default;
    default:
      return '#f9f9f9';
  }
};
