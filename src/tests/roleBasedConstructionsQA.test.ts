/**
 * QA Tests for Role-Based Grammatical Constructions
 * 
 * Validates Fiʿl–Fāʿil and Harf Naṣb–Ismuha functionality with real examples
 */

import { grammarQuizEngine } from '../utils/grammarQuizEngine';
import { UserSelection, GrammarQuizQuestion } from '../types/grammarQuiz';
import { MorphologicalDetails } from '../types/morphology';

describe('Role-Based Constructions QA', () => {
  
  describe('Fiʿl–Fāʿil (Verb-Subject) Validation', () => {
    
    test('Should correctly validate explicit verb-subject relationship', () => {
      // Test case: نَعْبُدُ (we worship) - implied subject "we"
      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-fil-fail-1',
        verseReference: { surahId: 1, verseId: 5 },
        arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation: 'It is You we worship and You we ask for help',
        segments: [
          {
            id: 'seg-1',
            text: 'إِيَّاكَ',
            morphology: 'pronoun',
            type: 'object',
            relationships: []
          },
          {
            id: 'seg-2', 
            text: 'نَعْبُدُ',
            morphology: 'verb',
            type: 'imperfect',
            person: 'first',
            number: 'plural',
            relationships: []
          }
        ],
        correctConstructions: [
          {
            id: 'construction-1',
            type: 'fi3l-fa3il',
            primaryElementIndex: 1, // نَعْبُدُ
            secondaryElementIndex: -1, // implied subject
            explanation: 'First person plural verb with implied subject "we"',
            confidence: 0.95
          }
        ],
        difficultyLevel: 'intermediate',
        constructionTypes: ['fi3l-fa3il']
      };

      const userSelection: UserSelection = {
        relationshipType: 'fi3l-fa3il',
        selectedIndices: [1], // selecting the verb
        roleBasedSelection: {
          primaryRole: 'fi3l',
          secondaryRole: 'fa3il', 
          primaryIndices: [1],
          secondaryIndices: [] // implied subject
        }
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.feedback).toContain('correct');
    });

    test('Should handle imperative verbs with implied subjects', () => {
      // Test case: اهْدِنَا (guide us) - implied subject "You"
      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-fil-fail-2',
        verseReference: { surahId: 1, verseId: 6 },
        arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation: 'Guide us to the straight path',
        segments: [
          {
            id: 'seg-1',
            text: 'اهْدِنَا',
            morphology: 'verb',
            type: 'imperative',
            person: 'second',
            number: 'singular',
            relationships: []
          }
        ],
        correctConstructions: [
          {
            id: 'construction-1',
            type: 'fi3l-fa3il',
            primaryElementIndex: 0, // اهْدِنَا
            secondaryElementIndex: -1, // implied "You"
            explanation: 'Imperative verb with implied second person subject',
            confidence: 0.90
          }
        ],
        difficultyLevel: 'beginner',
        constructionTypes: ['fi3l-fa3il']
      };

      const userSelection: UserSelection = {
        relationshipType: 'fi3l-fa3il',
        selectedIndices: [0],
        roleBasedSelection: {
          primaryRole: 'fi3l',
          secondaryRole: 'fa3il',
          primaryIndices: [0],
          secondaryIndices: [] // implied subject
        }
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toContain('imperative');
    });
  });

  describe('Harf Naṣb–Ismuha (Accusative Particle-Noun) Validation', () => {
    
    test('Should correctly validate إِنَّ + accusative noun', () => {
      // Test case: إِنَّ اللَّهَ (Indeed Allah)
      const mockSegments: MorphologicalDetails[] = [
        {
          id: 'seg-1',
          text: 'إِنَّ',
          morphology: 'particle',
          type: 'accusative',
          relationships: []
        },
        {
          id: 'seg-2',
          text: 'اللَّهَ',
          morphology: 'noun',
          type: 'proper',
          case: 'accusative',
          isDefinite: true,
          relationships: []
        }
      ];

      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-harf-nasb-1',
        verseReference: { surahId: 2, verseId: 1 },
        arabicText: 'إِنَّ اللَّهَ عَلِيمٌ',
        translation: 'Indeed Allah is knowing',
        segments: mockSegments,
        correctConstructions: [
          {
            id: 'construction-1',
            type: 'harf-nasb-ismuha',
            primaryElementIndex: 0, // إِنَّ
            secondaryElementIndex: 1, // اللَّهَ
            explanation: 'Accusative particle إِنَّ affecting the noun اللَّهَ',
            confidence: 0.98
          }
        ],
        difficultyLevel: 'intermediate',
        constructionTypes: ['harf-nasb-ismuha']
      };

      const userSelection: UserSelection = {
        relationshipType: 'harf-nasb-ismuha',
        selectedIndices: [0, 1],
        roleBasedSelection: {
          primaryRole: 'harf-nasb',
          secondaryRole: 'ismuha',
          primaryIndices: [0],
          secondaryIndices: [1]
        }
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBeGreaterThan(85);
      expect(result.feedback).toContain('accusative');
    });

    test('Should reject incorrect particle-noun pairing', () => {
      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-harf-nasb-2',
        verseReference: { surahId: 1, verseId: 1 },
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ',
        translation: 'In the name of Allah, the Merciful',
        segments: [
          {
            id: 'seg-1',
            text: 'بِسْمِ',
            morphology: 'noun',
            type: 'construct',
            case: 'genitive',
            relationships: []
          },
          {
            id: 'seg-2',
            text: 'اللَّهِ',
            morphology: 'noun',
            type: 'proper',
            case: 'genitive',
            isDefinite: true,
            relationships: []
          }
        ],
        correctConstructions: [
          {
            id: 'construction-1',
            type: 'mudaf-mudaf-ilayh',
            primaryElementIndex: 0,
            secondaryElementIndex: 1,
            explanation: 'This is possessive construction, not accusative',
            confidence: 0.95
          }
        ],
        difficultyLevel: 'beginner',
        constructionTypes: ['mudaf-mudaf-ilayh']
      };

      // User incorrectly selects harf-nasb relationship
      const userSelection: UserSelection = {
        relationshipType: 'harf-nasb-ismuha',
        selectedIndices: [0, 1],
        roleBasedSelection: {
          primaryRole: 'harf-nasb',
          secondaryRole: 'ismuha',
          primaryIndices: [0],
          secondaryIndices: [1]
        }
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.feedback).toContain('incorrect');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    
    test('Should handle missing role-based selection gracefully', () => {
      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-edge-1',
        verseReference: { surahId: 1, verseId: 1 },
        arabicText: 'Test verse',
        translation: 'Test translation',
        segments: [],
        correctConstructions: [],
        difficultyLevel: 'beginner',
        constructionTypes: []
      };

      const userSelection: UserSelection = {
        relationshipType: 'fi3l-fa3il',
        selectedIndices: [0]
        // Missing roleBasedSelection
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('role-based selection');
    });

    test('Should validate index bounds correctly', () => {
      const mockQuestion: GrammarQuizQuestion = {
        id: 'test-edge-2',
        verseReference: { surahId: 1, verseId: 1 },
        arabicText: 'Short verse',
        translation: 'Short translation',
        segments: [
          {
            id: 'seg-1',
            text: 'word',
            morphology: 'noun',
            type: 'common',
            relationships: []
          }
        ],
        correctConstructions: [],
        difficultyLevel: 'beginner',
        constructionTypes: []
      };

      const userSelection: UserSelection = {
        relationshipType: 'fi3l-fa3il',
        selectedIndices: [5], // Out of bounds
        roleBasedSelection: {
          primaryRole: 'fi3l',
          secondaryRole: 'fa3il',
          primaryIndices: [5],
          secondaryIndices: []
        }
      };

      const result = grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('invalid');
    });
  });

  describe('Performance and Integration', () => {
    
    test('Should complete validation within reasonable time', async () => {
      const startTime = Date.now();
      
      // Run multiple validations
      for (let i = 0; i < 10; i++) {
        const mockQuestion: GrammarQuizQuestion = {
          id: `perf-test-${i}`,
          verseReference: { surahId: 1, verseId: i + 1 },
          arabicText: 'Performance test verse',
          translation: 'Performance test translation',
          segments: [{
            id: 'seg-1',
            text: 'test',
            morphology: 'verb',
            type: 'perfect',
            relationships: []
          }],
          correctConstructions: [],
          difficultyLevel: 'beginner',
          constructionTypes: ['fi3l-fa3il']
        };

        const userSelection: UserSelection = {
          relationshipType: 'fi3l-fa3il',
          selectedIndices: [0],
          roleBasedSelection: {
            primaryRole: 'fi3l',
            secondaryRole: 'fa3il',
            primaryIndices: [0],
            secondaryIndices: []
          }
        };

        grammarQuizEngine.validateRoleBasedAnswer(mockQuestion, userSelection);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 10 validations in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});

console.log('🧪 Role-Based Constructions QA Tests Ready');
console.log('Run with: npm test roleBasedConstructionsQA');
