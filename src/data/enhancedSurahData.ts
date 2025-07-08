
import { MorphologicalDetails } from '@/types/morphology';
import { detectGrammaticalRelationships } from '@/utils/relationshipDetector';

// Comprehensive base segment data for Al-Fatiha with all morphological information
const baseSegments: Record<string, MorphologicalDetails> = {
  // Verse 1: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  '1-1-1-1': {
    id: '1-1-1-1',
    text: 'بِ',
    morphology: 'particle',
    type: 'prefix',
    grammaticalRole: 'preposition',
    meaning: 'with, by, in',
    etymology: 'Basic preposition indicating instrumentality or accompaniment',
    grammarExplanations: []
  },
  
  '1-1-1-2': {
    id: '1-1-1-2',
    text: 'سْمِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'س م و',
    pattern: 'فِعْل',
    meaning: 'name',
    grammaticalRole: 'object of preposition',
    etymology: 'From the root س-م-و relating to elevation and designation',
    grammarExplanations: []
  },
  
  '1-1-2-1': {
    id: '1-1-2-1',
    text: 'ٱللَّهِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    meaning: 'Allah, God',
    grammaticalRole: 'possessive noun in idafa construction',
    etymology: 'The proper name of God in Arabic, from ʾ-l-h root',
    grammarExplanations: []
  },
  
  '1-1-3-1': {
    id: '1-1-3-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article, assimilates to following consonant',
    grammarExplanations: []
  },
  
  '1-1-3-2': {
    id: '1-1-3-2',
    text: 'رَّحْمَٰنِ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ر ح م',
    pattern: 'فَعْلَان',
    meaning: 'Most Merciful, Entirely Merciful',
    grammaticalRole: 'adjective describing Allah',
    etymology: 'Intensive form from root ر-ح-م indicating comprehensive mercy',
    grammarExplanations: []
  },
  
  '1-1-4-1': {
    id: '1-1-4-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-1-4-2': {
    id: '1-1-4-2',
    text: 'رَّحِيمِ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ر ح م',
    pattern: 'فَعِيل',
    meaning: 'Most Compassionate, Especially Merciful',
    grammaticalRole: 'adjective describing Allah',
    etymology: 'Intensive form from root ر-ح-م indicating specific mercy',
    grammarExplanations: []
  },

  // Verse 2: ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
  '1-2-1-1': {
    id: '1-2-1-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-2-1-2': {
    id: '1-2-1-2',
    text: 'حَمْدُ',
    morphology: 'noun',
    type: 'root',
    case: 'nominative',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ح م د',
    pattern: 'فَعْل',
    meaning: 'praise, commendation',
    grammaticalRole: 'subject of sentence',
    etymology: 'From root ح-م-د relating to praising and commending',
    grammarExplanations: []
  },
  
  '1-2-2-1': {
    id: '1-2-2-1',
    text: 'لِ',
    morphology: 'particle',
    type: 'prefix',
    grammaticalRole: 'preposition',
    meaning: 'to, for',
    etymology: 'Preposition indicating direction or purpose',
    grammarExplanations: []
  },
  
  '1-2-2-2': {
    id: '1-2-2-2',
    text: 'لَّهِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    meaning: 'Allah, God',
    grammaticalRole: 'object of preposition',
    etymology: 'The proper name of God in Arabic',
    grammarExplanations: []
  },
  
  '1-2-3-1': {
    id: '1-2-3-1',
    text: 'رَبِّ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ر ب ب',
    pattern: 'فَعْل',
    meaning: 'Lord, Master',
    grammaticalRole: 'appositive in genitive',
    etymology: 'From root ر-ب-ب relating to lordship and mastery',
    grammarExplanations: []
  },
  
  '1-2-4-1': {
    id: '1-2-4-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-2-4-2': {
    id: '1-2-4-2',
    text: 'عَٰلَمِينَ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'plural',
    gender: 'masculine',
    rootLetters: 'ع ل م',
    pattern: 'فَاعِلِين',
    meaning: 'worlds, universes',
    grammaticalRole: 'possessive noun in idafa construction',
    etymology: 'From root ع-ل-م relating to knowledge and signs',
    grammarExplanations: []
  },

  // Verse 3: ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  '1-3-1-1': {
    id: '1-3-1-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-3-1-2': {
    id: '1-3-1-2',
    text: 'رَّحْمَٰنِ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ر ح م',
    pattern: 'فَعْلَان',
    meaning: 'Most Merciful',
    grammaticalRole: 'adjective in apposition',
    etymology: 'Intensive form from root ر-ح-م',
    grammarExplanations: []
  },
  
  '1-3-2-1': {
    id: '1-3-2-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-3-2-2': {
    id: '1-3-2-2',
    text: 'رَّحِيمِ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ر ح م',
    pattern: 'فَعِيل',
    meaning: 'Most Compassionate',
    grammaticalRole: 'adjective in apposition',
    etymology: 'Intensive form from root ر-ح-م',
    grammarExplanations: []
  },

  // Verse 4: مَٰلِكِ يَوْمِ ٱلدِّينِ
  '1-4-1-1': {
    id: '1-4-1-1',
    text: 'مَٰلِكِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'م ل ك',
    pattern: 'فَاعِل',
    meaning: 'Master, Owner',
    grammaticalRole: 'appositive in genitive',
    etymology: 'From root م-ل-ك relating to ownership and sovereignty',
    grammarExplanations: []
  },
  
  '1-4-2-1': {
    id: '1-4-2-1',
    text: 'يَوْمِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ي و م',
    pattern: 'فَعْل',
    meaning: 'day',
    grammaticalRole: 'possessive noun in idafa construction',
    etymology: 'From root ي-و-م relating to time and day',
    grammarExplanations: []
  },
  
  '1-4-3-1': {
    id: '1-4-3-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-4-3-2': {
    id: '1-4-3-2',
    text: 'دِّينِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'د ي ن',
    pattern: 'فِعْل',
    meaning: 'judgment, religion',
    grammaticalRole: 'possessive noun in idafa construction',
    etymology: 'From root د-ي-ن relating to judgment and accountability',
    grammarExplanations: []
  },

  // Verse 5: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
  '1-5-1-1': {
    id: '1-5-1-1',
    text: 'إِيَّاكَ',
    morphology: 'particle',
    type: 'root',
    case: 'accusative',
    person: 'second',
    number: 'singular',
    meaning: 'You (emphatic object)',
    grammaticalRole: 'emphatic object pronoun',
    etymology: 'Emphatic object pronoun for emphasis',
    grammarExplanations: []
  },
  
  '1-5-2-1': {
    id: '1-5-2-1',
    text: 'نَ',
    morphology: 'particle',
    type: 'prefix',
    person: 'first',
    number: 'plural',
    meaning: 'we',
    grammaticalRole: 'subject pronoun prefix',
    etymology: 'First person plural prefix for imperfect verbs',
    grammarExplanations: []
  },
  
  '1-5-2-2': {
    id: '1-5-2-2',
    text: 'عْبُدُ',
    morphology: 'verb',
    type: 'root',
    tense: 'present',
    person: 'first',
    number: 'plural',
    voice: 'active',
    mood: 'indicative',
    rootLetters: 'ع ب د',
    pattern: 'فْعُل',
    meaning: 'worship, serve',
    grammaticalRole: 'main verb',
    etymology: 'From root ع-ب-د relating to worship and service',
    grammarExplanations: []
  },
  
  '1-5-3-1': {
    id: '1-5-3-1',
    text: 'وَ',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'and',
    grammaticalRole: 'coordinating conjunction',
    etymology: 'Basic coordinating conjunction',
    grammarExplanations: []
  },
  
  '1-5-3-2': {
    id: '1-5-3-2',
    text: 'إِيَّاكَ',
    morphology: 'particle',
    type: 'root',
    case: 'accusative',
    person: 'second',
    number: 'singular',
    meaning: 'You (emphatic object)',
    grammaticalRole: 'emphatic object pronoun',
    etymology: 'Emphatic object pronoun for emphasis',
    grammarExplanations: []
  },
  
  '1-5-4-1': {
    id: '1-5-4-1',
    text: 'نَ',
    morphology: 'particle',
    type: 'prefix',
    person: 'first',
    number: 'plural',
    meaning: 'we',
    grammaticalRole: 'subject pronoun prefix',
    etymology: 'First person plural prefix',
    grammarExplanations: []
  },
  
  '1-5-4-2': {
    id: '1-5-4-2',
    text: 'سْتَعِينُ',
    morphology: 'verb',
    type: 'root',
    tense: 'present',
    person: 'first',
    number: 'plural',
    voice: 'active',
    mood: 'indicative',
    rootLetters: 'ع و ن',
    pattern: 'نَسْتَفْعِل',
    meaning: 'seek help',
    grammaticalRole: 'main verb',
    etymology: 'Form X from root ع-و-ن relating to assistance',
    grammarExplanations: []
  },

  // Verse 6: ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
  '1-6-1-1': {
    id: '1-6-1-1',
    text: 'ٱهْدِ',
    morphology: 'verb',
    type: 'root',
    tense: 'imperative',
    person: 'second',
    number: 'singular',
    voice: 'active',
    rootLetters: 'ه د ي',
    pattern: 'أَفْعِل',
    meaning: 'guide',
    grammaticalRole: 'imperative verb',
    etymology: 'From root ه-د-ي relating to guidance',
    grammarExplanations: []
  },
  
  '1-6-1-2': {
    id: '1-6-1-2',
    text: 'نَا',
    morphology: 'particle',
    type: 'suffix',
    person: 'first',
    number: 'plural',
    meaning: 'us',
    grammaticalRole: 'object pronoun suffix',
    etymology: 'First person plural object pronoun',
    grammarExplanations: []
  },
  
  '1-6-2-1': {
    id: '1-6-2-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-6-2-2': {
    id: '1-6-2-2',
    text: 'صِّرَٰطَ',
    morphology: 'noun',
    type: 'root',
    case: 'accusative',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ص ر ط',
    pattern: 'فِعَال',
    meaning: 'path, way',
    grammaticalRole: 'direct object',
    etymology: 'From root ص-ر-ط relating to straightness and path',
    grammarExplanations: []
  },
  
  '1-6-3-1': {
    id: '1-6-3-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-6-3-2': {
    id: '1-6-3-2',
    text: 'مُسْتَقِيمَ',
    morphology: 'adjective',
    type: 'root',
    case: 'accusative',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ق و م',
    pattern: 'مُسْتَفْعِل',
    meaning: 'straight, upright',
    grammaticalRole: 'adjective modifying path',
    etymology: 'Form X active participle from root ق-و-م',
    grammarExplanations: []
  },

  // Verse 7: صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ
  '1-7-1-1': {
    id: '1-7-1-1',
    text: 'صِرَٰطَ',
    morphology: 'noun',
    type: 'root',
    case: 'accusative',
    number: 'singular',
    gender: 'masculine',
    rootLetters: 'ص ر ط',
    pattern: 'فِعَال',
    meaning: 'path',
    grammaticalRole: 'appositive in accusative',
    etymology: 'From root ص-ر-ط',
    grammarExplanations: []
  },
  
  '1-7-2-1': {
    id: '1-7-2-1',
    text: 'ٱلَّذِينَ',
    morphology: 'particle',
    type: 'root',
    case: 'genitive',
    number: 'plural',
    gender: 'masculine',
    meaning: 'those who',
    grammaticalRole: 'relative pronoun',
    etymology: 'Relative pronoun for masculine plural',
    grammarExplanations: []
  },
  
  '1-7-3-1': {
    id: '1-7-3-1',
    text: 'أَنْعَمْتَ',
    morphology: 'verb',
    type: 'root',
    tense: 'past',
    person: 'second',
    number: 'singular',
    voice: 'active',
    rootLetters: 'ن ع م',
    pattern: 'أَفْعَل',
    meaning: 'bestowed favor',
    grammaticalRole: 'relative clause verb',
    etymology: 'Form IV from root ن-ع-م relating to blessing',
    grammarExplanations: []
  },
  
  '1-7-4-1': {
    id: '1-7-4-1',
    text: 'عَلَيْهِمْ',
    morphology: 'particle',
    type: 'root',
    meaning: 'upon them',
    grammaticalRole: 'prepositional phrase',
    etymology: 'Preposition + pronoun suffix',
    grammarExplanations: []
  },
  
  '1-7-5-1': {
    id: '1-7-5-1',
    text: 'غَيْرِ',
    morphology: 'noun',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    meaning: 'other than, not',
    grammaticalRole: 'exception particle',
    etymology: 'Noun used for exception',
    grammarExplanations: []
  },
  
  '1-7-6-1': {
    id: '1-7-6-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-7-6-2': {
    id: '1-7-6-2',
    text: 'مَغْضُوبِ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'singular',
    gender: 'masculine',
    voice: 'passive',
    rootLetters: 'غ ض ب',
    pattern: 'مَفْعُول',
    meaning: 'those who incurred wrath',
    grammaticalRole: 'passive participle',
    etymology: 'Passive participle from root غ-ض-ب',
    grammarExplanations: []
  },
  
  '1-7-7-1': {
    id: '1-7-7-1',
    text: 'عَلَيْهِمْ',
    morphology: 'particle',
    type: 'root',
    meaning: 'upon them',
    grammaticalRole: 'prepositional phrase',
    etymology: 'Preposition + pronoun suffix',
    grammarExplanations: []
  },
  
  '1-7-8-1': {
    id: '1-7-8-1',
    text: 'وَلَا',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'and not',
    grammaticalRole: 'negative coordinating conjunction',
    etymology: 'Conjunction + negation particle',
    grammarExplanations: []
  },
  
  '1-7-9-1': {
    id: '1-7-9-1',
    text: 'ٱل',
    morphology: 'particle',
    type: 'prefix',
    meaning: 'the',
    grammaticalRole: 'definite article',
    etymology: 'Definite article',
    grammarExplanations: []
  },
  
  '1-7-9-2': {
    id: '1-7-9-2',
    text: 'ضَّآلِّينَ',
    morphology: 'adjective',
    type: 'root',
    case: 'genitive',
    number: 'plural',
    gender: 'masculine',
    voice: 'active',
    rootLetters: 'ض ل ل',
    pattern: 'فَاعِلِين',
    meaning: 'those who went astray',
    grammaticalRole: 'active participle',
    etymology: 'Active participle from root ض-ل-ل',
    grammarExplanations: []
  }
};

// Enhanced segments with automatically detected relationships
export const enhancedSegments = detectGrammaticalRelationships(baseSegments);

// Translation correlation data for highlighting
export const translationCorrelations: Record<string, string[]> = {
  // Verse 1 correlations
  '1-1-1-1': ['In', 'name'],
  '1-1-1-2': ['name'],
  '1-1-2-1': ['Allah'],
  '1-1-3-2': ['Most', 'Gracious'],
  '1-1-4-2': ['Most', 'Merciful'],
  
  // Verse 2 correlations
  '1-2-1-2': ['Praise', 'due'],
  '1-2-2-2': ['Allah'],
  '1-2-3-1': ['Lord'],
  '1-2-4-2': ['worlds'],
  
  // Verse 3 correlations
  '1-3-1-2': ['Most', 'Gracious'],
  '1-3-2-2': ['Most', 'Merciful'],
  
  // Verse 4 correlations
  '1-4-1-1': ['Sovereign'],
  '1-4-2-1': ['Day'],
  '1-4-3-2': ['Judgment'],
  
  // Verse 5 correlations
  '1-5-1-1': ['You'],
  '1-5-2-2': ['worship'],
  '1-5-3-2': ['You'],
  '1-5-4-2': ['ask', 'help'],
  
  // Verse 6 correlations
  '1-6-1-1': ['Guide'],
  '1-6-1-2': ['us'],
  '1-6-2-2': ['straight', 'path'],
  '1-6-3-2': ['straight'],
  
  // Verse 7 correlations
  '1-7-1-1': ['path'],
  '1-7-2-1': ['those'],
  '1-7-3-1': ['blessed'],
  '1-7-6-2': ['incurred', 'wrath'],
  '1-7-9-2': ['astray']
};
