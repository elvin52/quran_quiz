import { GrammarQuizQuestion, GrammarConstruction } from '../types/grammarQuiz';
import { MorphologicalDetails } from '../types/morphology';

/**
 * Sample questions for role-based grammatical constructions
 * Fiʿl–Fāʿil and Harf Naṣb–Ismuha relationships from Quranic verses
 */

/**
 * Sample Fiʿl–Fāʿil (Verb-Subject) Questions
 * From Surah Al-Fatiha and common short surahs
 */
export const filFailQuestions: GrammarQuizQuestion[] = [
  {
    id: 'fil-fail-001',
    fragment: 'نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    segments: [
      {
        id: 'seg-001',
        text: 'نَعْبُدُ',
        morphology: 'verb',
        type: 'root',
        rootLetters: 'عبد',
        person: 'first',
        number: 'plural',
        mood: 'indicative',
        relationships: [
          { id: 'rel-001', type: 'fi3l-fa3il', role: 'fi3l', relatedSegmentId: 'seg-implied-we', description: 'Verb with implied subject' }
        ]
      },
      {
        id: 'seg-002',
        text: 'وَ',
        morphology: 'particle',
        type: 'root',
        rootLetters: 'و',
        relationships: []
      },
      {
        id: 'seg-003',
        text: 'إِيَّاكَ',
        morphology: 'particle',
        type: 'root',
        rootLetters: 'إيا',
        person: 'second',
        number: 'singular',
        case: 'accusative',
        relationships: []
      },
      {
        id: 'seg-004',
        text: 'نَسْتَعِينُ',
        morphology: 'verb',
        type: 'root',
        rootLetters: 'عون',
        person: 'first',
        number: 'plural',
        mood: 'indicative',
        relationships: [
          { id: 'rel-002', type: 'fi3l-fa3il', role: 'fi3l', relatedSegmentId: 'seg-implied-we-2', description: 'Verb with implied subject' }
        ]
      }
    ],
    correctAnswers: [
      {
        id: 'fil-fail-nabudu',
        type: 'fil-fail',
        spans: [0],  // نَعْبُدُ
        roles: ['fiʿl', 'fāʿil-implied'],
        certainty: 'definite',
        explanation: '"نَعْبُدُ" (we worship) is a verb with an implied subject "نحن" (we). The verb shows first-person plural agreement.',
        roleBasedRelationship: {
          primaryRole: { name: 'fiʿl', description: 'Verb - the action', arabicName: 'فعل', morphologicalIndicators: ['IV'] },
          secondaryRole: { name: 'fāʿil', description: 'Implied subject - we', arabicName: 'فاعل مستتر', morphologicalIndicators: ['PRON_IMPLIED'] },
          primaryIndices: [0],
          secondaryIndices: [], // Implied subject
          certainty: 'definite',
          explanation: 'First-person plural verb with implied subject pronoun'
        }
      },
      {
        id: 'fil-fail-nastaeen',
        type: 'fil-fail',
        spans: [3],  // نَسْتَعِينُ
        roles: ['fiʿl', 'fāʿil-implied'],
        certainty: 'definite',
        explanation: '"نَسْتَعِينُ" (we seek help) is a verb with an implied subject "نحن" (we). The verb shows first-person plural agreement.',
        roleBasedRelationship: {
          primaryRole: { name: 'fiʿl', description: 'Verb - the action', arabicName: 'فعل', morphologicalIndicators: ['IV'] },
          secondaryRole: { name: 'fāʿil', description: 'Implied subject - we', arabicName: 'فاعل مستتر', morphologicalIndicators: ['PRON_IMPLIED'] },
          primaryIndices: [3],
          secondaryIndices: [], // Implied subject
          certainty: 'definite',
          explanation: 'First-person plural verb with implied subject pronoun'
        }
      }
    ],
    difficulty: 'intermediate',
    sourceReference: 'Surah Al-Fatiha (1:5)',
    hints: [
      'Look for verbs and their subjects (doers of the action)',
      'Arabic verbs can have implied subjects shown by verb endings',
      'First-person plural verbs (نـ) have implied "we" as subject'
    ],
    metadata: {
      createdAt: new Date('2024-01-01'),
      constructionTypes: ['fil-fail'],
      wordCount: 4,
      estimatedDifficulty: 6
    },
    quranMetadata: {
      surahId: 1,
      verseId: 5,
      surahName: 'Al-Fatiha',
      surahNameArabic: 'الفاتحة',
      translation: 'You [alone] we worship, and You [alone] we ask for help.'
    }
  },

  {
    id: 'fil-fail-002',
    fragment: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    segments: [
      {
        id: 'seg-101',
        text: 'قُلْ',

        morphology: 'verb',

        rootLetters: 'قول',
        person: 'second',
        number: 'singular',
        tense: 'imperative',
        relationships: [
          { id: 'rel-003', type: 'fi3l-fa3il', role: 'fi3l', relatedSegmentId: 'seg-implied-you', description: 'Imperative verb with implied subject' }
        ]
      },
      {
        id: 'seg-102',
        text: 'هُوَ',

        morphology: 'particle',
        type: 'root',
        rootLetters: 'هو',
        person: 'third',
        number: 'singular',
        gender: 'masculine',
        relationships: []
      },
      {
        id: 'seg-103',
        text: 'اللَّهُ',

        morphology: 'noun',

        rootLetters: 'اله',
        case: 'nominative',
        isDefinite: true,
        relationships: []
      },
      {
        id: 'seg-104',
        text: 'أَحَدٌ',

        morphology: 'noun',

        rootLetters: 'احد',
        case: 'nominative',
        isDefinite: false,
        relationships: []
      }
    ],
    correctAnswers: [
      {
        id: 'fil-fail-qul',
        type: 'fil-fail',
        spans: [0],  // قُلْ
        roles: ['fiʿl', 'fāʿil-implied'],
        certainty: 'definite',
        explanation: '"قُلْ" (say) is an imperative verb with an implied subject "أنت" (you). The command is directed to the second person.',
        roleBasedRelationship: {
          id: 'rel-003',
          type: 'fil-fail',
          primaryRole: { name: 'fiʿl', description: 'Verb - the command', arabicName: 'فعل أمر', morphologicalIndicators: ['CV'] },
          secondaryRole: { name: 'fāʿil', description: 'Implied subject - you', arabicName: 'فاعل مستتر', morphologicalIndicators: ['PRON_IMPLIED'] },
          primaryIndices: [0],
          secondaryIndices: [], // Implied subject
          certainty: 'definite',
          explanation: 'Imperative verb with implied second-person subject'
        }
      }
    ],
    difficulty: 'beginner',
    sourceReference: 'Surah Al-Ikhlas (112:1)',
    hints: [
      'Imperative verbs (commands) have implied subjects',
      '"قُلْ" means "say" - who is being told to say?',
      'The subject is "you" (أنت) but it\'s not written'
    ],
    metadata: {
      createdAt: new Date('2024-01-01'),
      constructionTypes: ['fil-fail'],
      wordCount: 4,
      estimatedDifficulty: 4
    },
    quranMetadata: {
      surahId: 112,
      verseId: 1,
      surahName: 'Al-Ikhlas',
      surahNameArabic: 'الإخلاص',
      translation: 'Say: He is Allah, the One.'
    }
  }
];

/**
 * Sample Harf Naṣb–Ismuha (Accusative Particle-Verb) Questions
 * Focus on particles that govern verbs in accusative case
 */
export const harfNasbQuestions: GrammarQuizQuestion[] = [
  {
    id: 'harf-nasb-001',
    fragment: 'لَن نُّؤْمِنَ لَكَ',
    segments: [
      {
        id: 'seg-201',
        text: 'لَن',

        morphology: 'particle',

        root: 'لن',
        features: { type: 'negation-future' },
        relationships: [
          { id: 'rel-004', type: 'verb-object', role: 'verb', relatedSegmentId: 'seg-202', description: 'Particle governing verb' }
        ]
      },
      {
        id: 'seg-202',
        text: 'نُّؤْمِنَ',

        morphology: 'verb',

        root: 'امن',
        features: { person: 'first', number: 'plural', mood: 'subjunctive', case: 'accusative' },
        relationships: [
          { id: 'rel-005', type: 'verb-object', role: 'object', relatedSegmentId: 'seg-201', description: 'Verb governed by particle' }
        ]
      },
      {
        id: 'seg-203',
        text: 'لَكَ',

        morphology: 'particle',

        root: 'ل+ك',
        features: { case: 'genitive' },
        relationships: []
      }
    ],
    correctAnswers: [
      {
        id: 'harf-nasb-lan',
        type: 'harf-nasb-ismuha',
        spans: [0, 1],  // لَن نُّؤْمِنَ
        roles: ['harf-naṣb', 'ismuha'],
        certainty: 'definite',
        explanation: '"لَن" is a particle of negation that governs "نُّؤْمِنَ" in the accusative case, creating a Harf Naṣb-Ismuha construction.',
        roleBasedRelationship: {
          id: 'rel-004',
          type: 'harf-nasb-ismuha',
          primaryRole: { name: 'harf-naṣb', description: 'Particle of accusative', arabicName: 'حرف نصب', morphologicalIndicators: ['HARF_NASB'] },
          secondaryRole: { name: 'ismuha', description: 'Governed verb in accusative', arabicName: 'اسمها', morphologicalIndicators: ['IMPERF', 'SUBJUNCTIVE'] },
          primaryIndices: [0],
          secondaryIndices: [1],
          certainty: 'definite',
          explanation: 'لَن governs the imperfect verb in accusative/subjunctive mood'
        }
      }
    ],
    difficulty: 'intermediate',
    sourceReference: 'Quran 2:55 (concept)',
    hints: [
      'لَن is a particle that negates future actions',
      'It puts the following verb in accusative/subjunctive mood',
      'Look for the relationship between the particle and the verb'
    ],
    metadata: {
      createdAt: new Date('2024-01-01'),
      constructionTypes: ['harf-nasb-ismuha'],
      wordCount: 3,
      estimatedDifficulty: 7
    }
  },

  {
    id: 'harf-nasb-002',
    fragment: 'أَن تَعْبُدُوا اللَّهَ',
    segments: [
      {
        id: 'seg-301',
        text: 'أَن',

        morphology: 'particle',

        root: 'أن',
        features: { type: 'infinitive-particle' },
        relationships: [
          { id: 'rel-006', type: 'verb-object', role: 'verb', relatedSegmentId: 'seg-302', description: 'Particle governing verb' }
        ]
      },
      {
        id: 'seg-302',
        text: 'تَعْبُدُوا',

        morphology: 'verb',

        root: 'عبد',
        features: { person: 'second', number: 'plural', mood: 'subjunctive', case: 'accusative' },
        relationships: [
          { id: 'rel-007', type: 'verb-object', role: 'object', relatedSegmentId: 'seg-301', description: 'Verb governed by particle' }
        ]
      },
      {
        id: 'seg-303',
        text: 'اللَّهَ',

        morphology: 'noun',

        root: 'اله',
        features: { case: 'accusative', definiteness: 'definite' },
        relationships: []
      }
    ],
    correctAnswers: [
      {
        id: 'harf-nasb-an',
        type: 'harf-nasb-ismuha',
        spans: [0, 1],  // أَن تَعْبُدُوا
        roles: ['harf-naṣb', 'ismuha'],
        certainty: 'definite',
        explanation: '"أَن" is an infinitive particle that governs "تَعْبُدُوا" in the accusative case, forming a verbal noun construction.',
        roleBasedRelationship: {
          id: 'rel-006',
          type: 'harf-nasb-ismuha',
          primaryRole: { name: 'harf-naṣb', description: 'Infinitive particle', arabicName: 'حرف مصدري ناصب', morphologicalIndicators: ['HARF_NASB'] },
          secondaryRole: { name: 'ismuha', description: 'Governed verb in accusative', arabicName: 'اسمها', morphologicalIndicators: ['IMPERF', 'SUBJUNCTIVE'] },
          primaryIndices: [0],
          secondaryIndices: [1],
          certainty: 'definite',
          explanation: 'أَن creates a verbal noun by governing the imperfect verb in accusative'
        }
      }
    ],
    difficulty: 'advanced',
    sourceReference: 'Common Quranic pattern',
    hints: [
      'أَن turns verbs into verbal nouns (infinitives)',
      'It governs the verb in accusative/subjunctive mood',
      'The construction means "to worship" (infinitive form)'
    ],
    metadata: {
      createdAt: new Date('2024-01-01'),
      constructionTypes: ['harf-nasb-ismuha'],
      wordCount: 3,
      estimatedDifficulty: 8
    }
  }
];

/**
 * Combined sample questions for role-based constructions
 */
export const roleBasedSampleQuestions: GrammarQuizQuestion[] = [
  ...filFailQuestions,
  ...harfNasbQuestions
];

/**
 * Question generation helper for new role-based constructions
 */
export class RoleBasedQuestionGenerator {
  /**
   * Generate a random question from available samples
   */
  static getRandomQuestion(): GrammarQuizQuestion {
    const questions = roleBasedSampleQuestions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  /**
   * Get questions by difficulty level
   */
  static getQuestionsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): GrammarQuizQuestion[] {
    return roleBasedSampleQuestions.filter(q => q.difficulty === difficulty);
  }

  /**
   * Get questions by construction type
   */
  static getQuestionsByType(type: 'fil-fail' | 'harf-nasb-ismuha'): GrammarQuizQuestion[] {
    return roleBasedSampleQuestions.filter(q => 
      q.correctAnswers.some(answer => answer.type === type)
    );
  }

  /**
   * Validate question structure for role-based constructions
   */
  static validateRoleBasedQuestion(question: GrammarQuizQuestion): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required role-based properties
    question.correctAnswers.forEach((answer, index) => {
      if (['fil-fail', 'harf-nasb-ismuha'].includes(answer.type)) {
        if (!answer.roleBasedRelationship) {
          errors.push(`Answer ${index}: Missing roleBasedRelationship for ${answer.type}`);
        } else {
          const rel = answer.roleBasedRelationship;
          if (!rel.primaryRole || !rel.secondaryRole) {
            errors.push(`Answer ${index}: Missing primary or secondary role definition`);
          }
          if (!rel.primaryIndices || !rel.secondaryIndices) {
            errors.push(`Answer ${index}: Missing primary or secondary indices`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
