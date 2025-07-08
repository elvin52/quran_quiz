/**
 * Content banks for Arabic Pronoun Quiz
 * Contains comprehensive lists of Arabic pronouns and verbs for quiz generation
 */

import { ArabicPronoun, ArabicVerb } from '../types/quiz';

// Independent Arabic Pronouns
export const INDEPENDENT_PRONOUNS: ArabicPronoun[] = [
  {
    id: 'ana',
    arabic: 'أَنَا',
    transliteration: 'anā',
    english: 'I',
    type: 'independent',
    person: 'first',
    number: 'singular'
  },
  {
    id: 'nahnu',
    arabic: 'نَحْنُ',
    transliteration: 'naḥnu',
    english: 'we',
    type: 'independent',
    person: 'first',
    number: 'plural'
  },
  {
    id: 'anta',
    arabic: 'أَنْتَ',
    transliteration: 'anta',
    english: 'you (masculine singular)',
    type: 'independent',
    person: 'second',
    number: 'singular',
    gender: 'masculine'
  },
  {
    id: 'anti',
    arabic: 'أَنْتِ',
    transliteration: 'anti',
    english: 'you (feminine singular)',
    type: 'independent',
    person: 'second',
    number: 'singular',
    gender: 'feminine'
  },
  {
    id: 'antuma',
    arabic: 'أَنْتُمَا',
    transliteration: 'antumā',
    english: 'you (dual)',
    type: 'independent',
    person: 'second',
    number: 'dual'
  },
  {
    id: 'antum',
    arabic: 'أَنْتُمْ',
    transliteration: 'antum',
    english: 'you (masculine plural)',
    type: 'independent',
    person: 'second',
    number: 'plural',
    gender: 'masculine'
  },
  {
    id: 'antunna',
    arabic: 'أَنْتُنَّ',
    transliteration: 'antunna',
    english: 'you (feminine plural)',
    type: 'independent',
    person: 'second',
    number: 'plural',
    gender: 'feminine'
  },
  {
    id: 'huwa',
    arabic: 'هُوَ',
    transliteration: 'huwa',
    english: 'he',
    type: 'independent',
    person: 'third',
    number: 'singular',
    gender: 'masculine'
  },
  {
    id: 'hiya',
    arabic: 'هِيَ',
    transliteration: 'hiya',
    english: 'she',
    type: 'independent',
    person: 'third',
    number: 'singular',
    gender: 'feminine'
  },
  {
    id: 'huma_m',
    arabic: 'هُمَا',
    transliteration: 'humā',
    english: 'they (masculine dual)',
    type: 'independent',
    person: 'third',
    number: 'dual',
    gender: 'masculine'
  },
  {
    id: 'huma_f',
    arabic: 'هُمَا',
    transliteration: 'humā',
    english: 'they (feminine dual)',
    type: 'independent',
    person: 'third',
    number: 'dual',
    gender: 'feminine'
  },
  {
    id: 'hum',
    arabic: 'هُمْ',
    transliteration: 'hum',
    english: 'they (masculine plural)',
    type: 'independent',
    person: 'third',
    number: 'plural',
    gender: 'masculine'
  },
  {
    id: 'hunna',
    arabic: 'هُنَّ',
    transliteration: 'hunna',
    english: 'they (feminine plural)',
    type: 'independent',
    person: 'third',
    number: 'plural',
    gender: 'feminine'
  }
];

// Attached Pronoun Forms
export const ATTACHED_PRONOUNS: ArabicPronoun[] = [
  {
    id: 'attached_i',
    arabic: 'ي',
    transliteration: 'ī',
    english: 'me/my',
    type: 'attached',
    person: 'first',
    number: 'singular'
  },
  {
    id: 'attached_na',
    arabic: 'نَا',
    transliteration: 'nā',
    english: 'us/our',
    type: 'attached',
    person: 'first',
    number: 'plural'
  },
  {
    id: 'attached_ka',
    arabic: 'كَ',
    transliteration: 'ka',
    english: 'you/your (masculine)',
    type: 'attached',
    person: 'second',
    number: 'singular',
    gender: 'masculine'
  },
  {
    id: 'attached_ki',
    arabic: 'كِ',
    transliteration: 'ki',
    english: 'you/your (feminine)',
    type: 'attached',
    person: 'second',
    number: 'singular',
    gender: 'feminine'
  },
  {
    id: 'attached_kuma',
    arabic: 'كُمَا',
    transliteration: 'kumā',
    english: 'you/your (dual)',
    type: 'attached',
    person: 'second',
    number: 'dual'
  },
  {
    id: 'attached_kum',
    arabic: 'كُمْ',
    transliteration: 'kum',
    english: 'you/your (masculine plural)',
    type: 'attached',
    person: 'second',
    number: 'plural',
    gender: 'masculine'
  },
  {
    id: 'attached_kunna',
    arabic: 'كُنَّ',
    transliteration: 'kunna',
    english: 'you/your (feminine plural)',
    type: 'attached',
    person: 'second',
    number: 'plural',
    gender: 'feminine'
  },
  {
    id: 'attached_hu',
    arabic: 'هُ',
    transliteration: 'hu',
    english: 'him/his',
    type: 'attached',
    person: 'third',
    number: 'singular',
    gender: 'masculine'
  },
  {
    id: 'attached_ha',
    arabic: 'هَا',
    transliteration: 'hā',
    english: 'her/hers',
    type: 'attached',
    person: 'third',
    number: 'singular',
    gender: 'feminine'
  },
  {
    id: 'attached_huma',
    arabic: 'هُمَا',
    transliteration: 'humā',
    english: 'them/their (dual)',
    type: 'attached',
    person: 'third',
    number: 'dual'
  },
  {
    id: 'attached_hum',
    arabic: 'هُمْ',
    transliteration: 'hum',
    english: 'them/their (masculine plural)',
    type: 'attached',
    person: 'third',
    number: 'plural',
    gender: 'masculine'
  },
  {
    id: 'attached_hunna',
    arabic: 'هُنَّ',
    transliteration: 'hunna',
    english: 'them/their (feminine plural)',
    type: 'attached',
    person: 'third',
    number: 'plural',
    gender: 'feminine'
  }
];

// Common Present-Tense Arabic Verbs
export const ARABIC_VERBS: ArabicVerb[] = [
  {
    id: 'kataba',
    root: 'ك-ت-ب',
    presentTense: 'يَكْتُبُ',
    transliteration: 'yaktubu',
    meaning: 'to write',
    difficulty: 'beginner'
  },
  {
    id: 'qaraa',
    root: 'ق-ر-أ',
    presentTense: 'يَقْرَأُ',
    transliteration: 'yaqra\'u',
    meaning: 'to read',
    difficulty: 'beginner'
  },
  {
    id: 'fahima',
    root: 'ف-ه-م',
    presentTense: 'يَفْهَمُ',
    transliteration: 'yafhamu',
    meaning: 'to understand',
    difficulty: 'beginner'
  },
  {
    id: 'akala',
    root: 'أ-ك-ل',
    presentTense: 'يَأْكُلُ',
    transliteration: 'ya\'kulu',
    meaning: 'to eat',
    difficulty: 'beginner'
  },
  {
    id: 'shariba',
    root: 'ش-ر-ب',
    presentTense: 'يَشْرَبُ',
    transliteration: 'yashrabu',
    meaning: 'to drink',
    difficulty: 'beginner'
  },
  {
    id: 'dhahaba',
    root: 'ذ-ه-ب',
    presentTense: 'يَذْهَبُ',
    transliteration: 'yadhhabu',
    meaning: 'to go',
    difficulty: 'beginner'
  },
  {
    id: 'ja\'a',
    root: 'ج-ي-أ',
    presentTense: 'يَجِيءُ',
    transliteration: 'yajī\'u',
    meaning: 'to come',
    difficulty: 'intermediate'
  },
  {
    id: 'qala',
    root: 'ق-و-ل',
    presentTense: 'يَقُولُ',
    transliteration: 'yaqūlu',
    meaning: 'to say',
    difficulty: 'beginner'
  },
  {
    id: 'sami\'a',
    root: 'س-م-ع',
    presentTense: 'يَسْمَعُ',
    transliteration: 'yasma\'u',
    meaning: 'to hear',
    difficulty: 'beginner'
  },
  {
    id: 'nazara',
    root: 'ن-ظ-ر',
    presentTense: 'يَنْظُرُ',
    transliteration: 'yanẓuru',
    meaning: 'to look',
    difficulty: 'beginner'
  },
  {
    id: 'arada',
    root: 'أ-ر-د',
    presentTense: 'يُرِيدُ',
    transliteration: 'yurīdu',
    meaning: 'to want',
    difficulty: 'intermediate'
  },
  {
    id: 'fa\'ala',
    root: 'ف-ع-ل',
    presentTense: 'يَفْعَلُ',
    transliteration: 'yaf\'alu',
    meaning: 'to do',
    difficulty: 'beginner'
  },
  {
    id: 'wajada',
    root: 'و-ج-د',
    presentTense: 'يَجِدُ',
    transliteration: 'yajidu',
    meaning: 'to find',
    difficulty: 'intermediate'
  },
  {
    id: 'khalaja',
    root: 'خ-ر-ج',
    presentTense: 'يَخْرُجُ',
    transliteration: 'yakhruju',
    meaning: 'to exit',
    difficulty: 'beginner'
  },
  {
    id: 'dakhala',
    root: 'د-خ-ل',
    presentTense: 'يَدْخُلُ',
    transliteration: 'yadkhulu',
    meaning: 'to enter',
    difficulty: 'beginner'
  },
  {
    id: 'salama',
    root: 'س-ل-م',
    presentTense: 'يَسْلَمُ',
    transliteration: 'yaslamu',
    meaning: 'to be safe',
    difficulty: 'intermediate'
  },
  {
    id: 'hakama',
    root: 'ح-ك-م',
    presentTense: 'يَحْكُمُ',
    transliteration: 'yaḥkumu',
    meaning: 'to judge/rule',
    difficulty: 'advanced'
  },
  {
    id: 'amara',
    root: 'أ-م-ر',
    presentTense: 'يَأْمُرُ',
    transliteration: 'ya\'muru',
    meaning: 'to command',
    difficulty: 'intermediate'
  },
  {
    id: 'naha',
    root: 'ن-ه-ي',
    presentTense: 'يَنْهَى',
    transliteration: 'yanhā',
    meaning: 'to forbid',
    difficulty: 'advanced'
  },
  {
    id: 'sabara',
    root: 'ص-ب-ر',
    presentTense: 'يَصْبِرُ',
    transliteration: 'yaṣbiru',
    meaning: 'to be patient',
    difficulty: 'intermediate'
  }
];

// Verb conjugation patterns for different pronouns
export const VERB_CONJUGATIONS = {
  // Present tense conjugation patterns
  present: {
    'أَنَا': (root: string) => `أَ${root.substring(1)}`, // I do
    'نَحْنُ': (root: string) => `نَ${root.substring(1)}`, // We do  
    'أَنْتَ': (root: string) => `تَ${root.substring(1)}`, // You (m.s.) do
    'أَنْتِ': (root: string) => `تَ${root.substring(1)}ِينَ`, // You (f.s.) do
    'أَنْتُمْ': (root: string) => `تَ${root.substring(1)}ُونَ`, // You (m.pl.) do
    'أَنْتُنَّ': (root: string) => `تَ${root.substring(1)}ْنَ`, // You (f.pl.) do
    'هُوَ': (root: string) => root, // He does (base form)
    'هِيَ': (root: string) => `تَ${root.substring(1)}`, // She does
    'هُمْ': (root: string) => `يَ${root.substring(1)}ُونَ`, // They (m.) do
    'هُنَّ': (root: string) => `يَ${root.substring(1)}ْنَ` // They (f.) do
  }
};

export const ALL_PRONOUNS = [...INDEPENDENT_PRONOUNS, ...ATTACHED_PRONOUNS];
