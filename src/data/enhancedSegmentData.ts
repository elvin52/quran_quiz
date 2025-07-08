
import { MorphologicalDetails } from '@/types/morphology';
import { detectGrammaticalRelationships } from '@/utils/relationshipDetector';

// Enhanced segment data with proper morphological properties
const baseSegmentData: Record<string, MorphologicalDetails> = {
  // Verse 1: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  "1-1-1-1": {
    id: "1-1-1-1",
    text: "بِ",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "preposition",
    meaning: "with, by, in"
  },
  "1-1-1-2": {
    id: "1-1-1-2",
    text: "سْمِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "name"
  },
  "1-1-2-1": {
    id: "1-1-2-1",
    text: "ٱللَّهِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Allah"
  },
  "1-1-3-1": {
    id: "1-1-3-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-1-3-2": {
    id: "1-1-3-2",
    text: "رَّحْمَٰنِ",
    morphology: "adjective",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Most Gracious"
  },
  "1-1-4-1": {
    id: "1-1-4-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-1-4-2": {
    id: "1-1-4-2",
    text: "رَّحِيمِ",
    morphology: "adjective",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Most Merciful"
  },

  // Verse 2: ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
  "1-2-1-1": {
    id: "1-2-1-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-2-1-2": {
    id: "1-2-1-2",
    text: "حَمْدُ",
    morphology: "noun",
    type: "root",
    case: "nominative",
    number: "singular",
    gender: "masculine",
    meaning: "praise"
  },
  "1-2-2-1": {
    id: "1-2-2-1",
    text: "لِ",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "preposition",
    meaning: "to, for"
  },
  "1-2-2-2": {
    id: "1-2-2-2",
    text: "للَّهِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Allah"
  },
  "1-2-3-1": {
    id: "1-2-3-1",
    text: "رَبِّ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Lord"
  },
  "1-2-4-1": {
    id: "1-2-4-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-2-4-2": {
    id: "1-2-4-2",
    text: "عَٰلَمِينَ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "plural",
    gender: "masculine",
    meaning: "worlds"
  },

  // Verse 3: ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  "1-3-1-1": {
    id: "1-3-1-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-3-1-2": {
    id: "1-3-1-2",
    text: "رَّحْمَٰنِ",
    morphology: "adjective",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Most Gracious"
  },
  "1-3-2-1": {
    id: "1-3-2-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-3-2-2": {
    id: "1-3-2-2",
    text: "رَّحِيمِ",
    morphology: "adjective",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Most Merciful"
  },

  // Verse 4: مَٰلِكِ يَوْمِ ٱلدِّينِ
  "1-4-1-1": {
    id: "1-4-1-1",
    text: "مَٰلِكِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Master, Owner"
  },
  "1-4-2-1": {
    id: "1-4-2-1",
    text: "يَوْمِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Day"
  },
  "1-4-3-1": {
    id: "1-4-3-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-4-3-2": {
    id: "1-4-3-2",
    text: "دِّينِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "singular",
    gender: "masculine",
    meaning: "Judgment, Religion"
  },

  // Continue with remaining verses...
  "1-5-1-1": {
    id: "1-5-1-1",
    text: "إِيَّاكَ",
    morphology: "particle",
    type: "root",
    case: "accusative",
    person: "second",
    meaning: "You (object pronoun)"
  },
  "1-5-2-1": {
    id: "1-5-2-1",
    text: "نَ",
    morphology: "particle",
    type: "prefix",
    person: "first",
    number: "plural",
    meaning: "we (verb prefix)"
  },
  "1-5-2-2": {
    id: "1-5-2-2",
    text: "عْبُدُ",
    morphology: "verb",
    type: "root",
    tense: "present",
    voice: "active",
    meaning: "worship"
  },
  "1-5-3-1": {
    id: "1-5-3-1",
    text: "وَ",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "conjunction",
    meaning: "and"
  },
  "1-5-3-2": {
    id: "1-5-3-2",
    text: "إِيَّاكَ",
    morphology: "particle",
    type: "root",
    case: "accusative",
    person: "second",
    meaning: "You (object pronoun)"
  },
  "1-5-4-1": {
    id: "1-5-4-1",
    text: "نَ",
    morphology: "particle",
    type: "prefix",
    person: "first",
    number: "plural",
    meaning: "we (verb prefix)"
  },
  "1-5-4-2": {
    id: "1-5-4-2",
    text: "سْتَعِينُ",
    morphology: "verb",
    type: "root",
    tense: "present",
    voice: "active",
    meaning: "seek help"
  },

  // Continue with remaining segments...
  "1-6-1-1": {
    id: "1-6-1-1",
    text: "ٱهْدِ",
    morphology: "verb",
    type: "root",
    tense: "imperative",
    voice: "active",
    meaning: "guide"
  },
  "1-6-1-2": {
    id: "1-6-1-2",
    text: "نَا",
    morphology: "particle",
    type: "suffix",
    person: "first",
    number: "plural",
    meaning: "us"
  },
  "1-6-2-1": {
    id: "1-6-2-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-6-2-2": {
    id: "1-6-2-2",
    text: "صِّرَٰطَ",
    morphology: "noun",
    type: "root",
    case: "accusative",
    number: "singular",
    gender: "masculine",
    meaning: "path"
  },
  "1-6-3-1": {
    id: "1-6-3-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-6-3-2": {
    id: "1-6-3-2",
    text: "مُسْتَقِيمَ",
    morphology: "adjective",
    type: "root",
    case: "accusative",
    number: "singular",
    gender: "masculine",
    meaning: "straight"
  },

  // Verse 7 segments (abbreviated for length)
  "1-7-1-1": {
    id: "1-7-1-1",
    text: "صِرَٰطَ",
    morphology: "noun",
    type: "root",
    case: "accusative",
    number: "singular",
    gender: "masculine",
    meaning: "path"
  },
  "1-7-2-1": {
    id: "1-7-2-1",
    text: "ٱلَّذِينَ",
    morphology: "particle",
    type: "root",
    grammaticalRole: "relative_pronoun",
    case: "genitive",
    number: "plural",
    gender: "masculine",
    meaning: "those who"
  },
  "1-7-3-1": {
    id: "1-7-3-1",
    text: "أَنْعَمْ",
    morphology: "verb",
    type: "root",
    tense: "past",
    voice: "active",
    meaning: "bestowed favor"
  },
  "1-7-3-2": {
    id: "1-7-3-2",
    text: "تَ",
    morphology: "particle",
    type: "suffix",
    person: "second",
    number: "singular",
    meaning: "You"
  },
  "1-7-4-1": {
    id: "1-7-4-1",
    text: "عَلَيْ",
    morphology: "particle",
    type: "root",
    grammaticalRole: "preposition",
    meaning: "upon"
  },
  "1-7-4-2": {
    id: "1-7-4-2",
    text: "هِمْ",
    morphology: "particle",
    type: "suffix",
    person: "third",
    number: "plural",
    gender: "masculine",
    meaning: "them"
  },
  "1-7-5-1": {
    id: "1-7-5-1",
    text: "غَيْرِ",
    morphology: "particle",
    type: "root",
    case: "genitive",
    meaning: "not"
  },
  "1-7-6-1": {
    id: "1-7-6-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-7-6-2": {
    id: "1-7-6-2",
    text: "مَغْضُوبِ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "plural",
    gender: "masculine",
    meaning: "those who incurred wrath"
  },
  "1-7-7-1": {
    id: "1-7-7-1",
    text: "عَلَيْ",
    morphology: "particle",
    type: "root",
    grammaticalRole: "preposition",
    meaning: "upon"
  },
  "1-7-7-2": {
    id: "1-7-7-2",
    text: "هِمْ",
    morphology: "particle",
    type: "suffix",
    person: "third",
    number: "plural",
    gender: "masculine",
    meaning: "them"
  },
  "1-7-8-1": {
    id: "1-7-8-1",
    text: "وَ",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "conjunction",
    meaning: "and"
  },
  "1-7-8-2": {
    id: "1-7-8-2",
    text: "لَا",
    morphology: "particle",
    type: "root",
    grammaticalRole: "negation",
    meaning: "not"
  },
  "1-7-9-1": {
    id: "1-7-9-1",
    text: "ٱل",
    morphology: "particle",
    type: "prefix",
    grammaticalRole: "definite_article",
    meaning: "the"
  },
  "1-7-9-2": {
    id: "1-7-9-2",
    text: "ضَّآلِّينَ",
    morphology: "noun",
    type: "root",
    case: "genitive",
    number: "plural",
    gender: "masculine",
    meaning: "those who are astray"
  }
};

// Generate enhanced segments with relationships
console.log('=== GENERATING ENHANCED SEGMENTS ===');
export const enhancedSegments = detectGrammaticalRelationships(baseSegmentData);
console.log('Enhanced segments generated:', Object.keys(enhancedSegments).length);

// Debug log some relationships
Object.values(enhancedSegments).forEach(segment => {
  if (segment.relationships && segment.relationships.length > 0) {
    console.log(`Segment ${segment.id} has ${segment.relationships.length} relationships:`, 
      segment.relationships.map(r => `${r.type}(${r.role})`));
  }
});
