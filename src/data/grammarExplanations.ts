
import { GrammarExplanation } from '@/types/morphology';

export const grammarExplanations: Record<string, GrammarExplanation> = {
  'nominative': {
    id: 'nominative',
    term: 'Nominative Case (Raf\')',
    definition: 'The nominative case is used for subjects of sentences and predicates. It is marked by a damma (ُ) or its equivalent.',
    examples: ['الرَّجُلُ كَرِيمٌ', 'جَاءَ المُعَلِّمُ'],
    relatedTerms: ['accusative', 'genitive', 'subject'],
    category: 'syntax'
  },
  
  'accusative': {
    id: 'accusative',
    term: 'Accusative Case (Nasb)',
    definition: 'The accusative case is used for direct objects, adverbs, and in certain grammatical constructions. It is marked by a fatha (َ) or its equivalent.',
    examples: ['قَرَأْتُ كِتَابًا', 'سَافَرَ صَبَاحًا'],
    relatedTerms: ['nominative', 'genitive', 'direct object'],
    category: 'syntax'
  },
  
  'genitive': {
    id: 'genitive',
    term: 'Genitive Case (Jar)',
    definition: 'The genitive case is used after prepositions and in possessive constructions (idafa). It is marked by a kasra (ِ) or its equivalent.',
    examples: ['فِي البَيْتِ', 'كِتَابُ الطَّالِبِ'],
    relatedTerms: ['nominative', 'accusative', 'preposition', 'idafa'],
    category: 'syntax'
  },
  
  'singular': {
    id: 'singular',
    term: 'Singular (Mufrad)',
    definition: 'The singular form refers to one person, thing, or concept. It is the basic form of nouns and adjectives.',
    examples: ['رَجُلٌ', 'بَيْتٌ', 'كَبِيرٌ'],
    relatedTerms: ['dual', 'plural'],
    category: 'morphology'
  },
  
  'dual': {
    id: 'dual',
    term: 'Dual (Muthanna)',
    definition: 'The dual form refers to exactly two of something. It is formed by adding specific endings to the singular form.',
    examples: ['رَجُلاَنِ', 'بَيْتَانِ', 'كَبِيرَانِ'],
    relatedTerms: ['singular', 'plural'],
    category: 'morphology'
  },
  
  'plural': {
    id: 'plural',
    term: 'Plural (Jam\')',
    definition: 'The plural form refers to three or more of something. Arabic has sound plurals and broken plurals.',
    examples: ['رِجَالٌ', 'بُيُوتٌ', 'مُسْلِمُونَ'],
    relatedTerms: ['singular', 'dual', 'sound plural', 'broken plural'],
    category: 'morphology'
  },
  
  'masculine': {
    id: 'masculine',
    term: 'Masculine (Mudhakkar)',
    definition: 'Masculine gender in Arabic applies to nouns, adjectives, and pronouns. Most nouns are inherently masculine or feminine.',
    examples: ['رَجُلٌ كَبِيرٌ', 'مُعَلِّمٌ نَشِيطٌ'],
    relatedTerms: ['feminine', 'gender agreement'],
    category: 'morphology'
  },
  
  'feminine': {
    id: 'feminine',
    term: 'Feminine (Mu\'annath)',
    definition: 'Feminine gender in Arabic applies to nouns, adjectives, and pronouns. Often marked by ta\' marbuta (ة) or alif (ى).',
    examples: ['امْرَأَةٌ كَبِيرَةٌ', 'مُعَلِّمَةٌ نَشِيطَةٌ'],
    relatedTerms: ['masculine', 'gender agreement', 'ta marbuta'],
    category: 'morphology'
  },
  
  'past': {
    id: 'past',
    term: 'Past Tense (Fi\'l Madi)',
    definition: 'The past tense indicates completed actions. It is the base form of Arabic verbs.',
    examples: ['كَتَبَ', 'قَرَأَ', 'ذَهَبَ'],
    relatedTerms: ['present', 'imperative', 'perfect aspect'],
    category: 'morphology'
  },
  
  'present': {
    id: 'present',
    term: 'Present Tense (Fi\'l Mudari\')',
    definition: 'The present tense indicates ongoing or future actions. It is formed by adding prefixes to the verb root.',
    examples: ['يَكْتُبُ', 'يَقْرَأُ', 'يَذْهَبُ'],
    relatedTerms: ['past', 'imperative', 'imperfect aspect'],
    category: 'morphology'
  },
  
  'imperative': {
    id: 'imperative',
    term: 'Imperative (Fi\'l Amr)',
    definition: 'The imperative mood is used for commands and requests. It is derived from the present tense.',
    examples: ['اكْتُبْ', 'اقْرَأْ', 'اذْهَبْ'],
    relatedTerms: ['past', 'present', 'command'],
    category: 'morphology'
  },
  
  'active': {
    id: 'active',
    term: 'Active Voice (Ma\'lum)',
    definition: 'In active voice, the subject performs the action expressed by the verb.',
    examples: ['كَتَبَ الطَّالِبُ الدَّرْسَ', 'قَرَأَ الوَلَدُ الكِتَابَ'],
    relatedTerms: ['passive', 'agent', 'subject'],
    category: 'syntax'
  },
  
  'passive': {
    id: 'passive',
    term: 'Passive Voice (Majhul)',
    definition: 'In passive voice, the subject receives the action. The agent is usually omitted.',
    examples: ['كُتِبَ الدَّرْسُ', 'قُرِئَ الكِتَابُ'],
    relatedTerms: ['active', 'agent', 'object'],
    category: 'syntax'
  }
};
