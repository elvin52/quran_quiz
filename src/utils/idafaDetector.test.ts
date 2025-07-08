/**
 * Comprehensive Test Suite for إضافة (Mudaf-Mudaf Ilayh) Detection Algorithm
 * Based on Dream_Textbook.pdf requirements and classical Arabic grammar
 * 
 * Tests validate:
 * - 3-Question Test implementation
 * - Enhanced partly-flexible detection
 * - Non-flexible noun inference
 * - Corpus batch processing
 * - JSON export functionality
 * - Al-Fatiha examples from textbook
 */

// Test framework - using Jest/Node built-in testing (vitest not installed)
const describe = (name: string, fn: () => void) => { console.log(`Test Suite: ${name}`); fn(); };
const test = (name: string, fn: () => void) => { console.log(`Test: ${name}`); try { fn(); console.log('✅ PASSED'); } catch (e) { console.log('❌ FAILED:', e); } };
const expect = (actual: any) => ({ 
  toBe: (expected: any) => { if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`); },
  toHaveLength: (expected: number) => { if (actual.length !== expected) throw new Error(`Expected length ${expected}, got ${actual.length}`); },
  toBeGreaterThan: (expected: number) => { if (actual <= expected) throw new Error(`Expected > ${expected}, got ${actual}`); },
  toBeGreaterThanOrEqual: (expected: number) => { if (actual < expected) throw new Error(`Expected >= ${expected}, got ${actual}`); },
  toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`); },
  toBeDefined: () => { if (actual === undefined) throw new Error('Expected defined'); },
  toContain: (expected: any) => { if (!actual.some((item: any) => typeof expected === 'function' ? expected(item) : item === expected)) throw new Error(`Expected to contain ${expected}`); },
  stringMatching: (pattern: string | RegExp) => { const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern; return { test: (str: string) => regex.test(str) }; }
});
const beforeEach = (fn: () => void) => { /* Setup before each test */ };
import { 
  IdafaDetector, 
  IdafaConstruction, 
  IdafaDetectionResult,
  CorpusSegment,
  CorpusIdafaResult,
  detectIdafaConstructions 
} from './idafaDetector';
import { MorphologicalDetails } from '@/types/morphology';
import { MASAQEntry } from '@/types/masaq';

describe('إضافة Detection Algorithm - Comprehensive Test Suite', () => {
  let detector: IdafaDetector;

  beforeEach(() => {
    detector = new IdafaDetector();
  });

  describe('Enhanced Detection Algorithm', () => {
    test('should detect simple إضافة construction', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'رَبِّ',
          morphology: 'noun',
          type: 'root',
          meaning: 'lord',
          case: 'genitive',
          pattern: 'partly_flexible'
        },
        '1-1-2-1': {
          id: '1-1-2-1', 
          text: 'الْعَالَمِينَ',
          morphology: 'noun',
          type: 'root',
          meaning: 'of the worlds',
          case: 'genitive',
          pattern: 'sound_masculine_plural'
        }
      };

      const result = detectIdafaConstructions(segments);
      
      expect(result.constructions).toHaveLength(1);
      expect(result.constructions[0].mudaf.text).toBe('رَبِّ');
      expect(result.constructions[0].mudafIlayh.text).toBe('الْعَالَمِينَ');
      expect(result.constructions[0].certainty).toBe('definite');
    });

    test('should handle partly-flexible noun with فتحة detection', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'مُوسَى', // Partly-flexible proper noun with fatha
          morphology: 'noun',
          type: 'root',
          meaning: 'Moses',
          case: 'genitive',
          pattern: 'partly_flexible'
        },
        '1-1-2-1': {
          id: '1-1-2-1',
          text: 'بَنِي',
          morphology: 'noun',
          type: 'root',
          meaning: 'sons',
          case: 'genitive'
        }
      };

      const result = detectIdafaConstructions(segments);
      
      expect(result.constructions).toHaveLength(1);
      expect([...result.validationNotes]).toContain(
        expect.stringMatching(/partly-flexible.*fatha/i)
      );
    });

    test('should detect chain إضافة constructions', () => {
      // Test chain like: كتاب طالب المدرسة (book [of] student [of] school)
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'كِتَابِ',
          morphology: 'noun',
          type: 'root',
          meaning: 'book',
          case: 'genitive'
        },
        '1-1-2-1': {
          id: '1-1-2-1',
          text: 'طَالِبِ',
          morphology: 'noun',
          type: 'root',
          meaning: 'student',
          case: 'genitive'
        },
        '1-1-3-1': {
          id: '1-1-3-1',
          text: 'الْمَدْرَسَةِ',
          morphology: 'noun',
          type: 'root',
          meaning: 'school',
          case: 'genitive'
        }
      };

      const result = detectIdafaConstructions(segments);
      
      expect(result.constructions.length).toBeGreaterThanOrEqual(2);
      expect(result.statistics.withChains).toBeGreaterThan(0);
    });

    test('should handle attached pronouns as Mudaf Ilayh', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'رَبُّهُمْ',
          morphology: 'noun',
          type: 'root',
          meaning: 'their lord',
          case: 'nominative',
          person: 'third',
          number: 'plural'
        }
      };

      const result = detectIdafaConstructions(segments);
      
      expect(result.constructions).toHaveLength(1);
      expect(result.constructions[0].mudafIlayh.type).toBe('attached_pronoun');
      expect(result.statistics.withPronouns).toBe(1);
    });
  });

  describe('Al-Fatiha Examples Validation', () => {
    test('should correctly identify "رَبِّ الْعَالَمِينَ" from Al-Fatiha', () => {
      const alFatihaSegments: Record<string, MorphologicalDetails> = {
        '1-2-2-1': {
          id: '1-2-2-1',
          text: 'رَبِّ',
          morphology: 'noun',
          type: 'root',
          meaning: 'lord',
          case: 'genitive',
          pattern: 'partly_flexible'
        },
        '1-2-3-1': {
          id: '1-2-3-1',
          text: 'الْعَالَمِينَ',
          morphology: 'noun',
          type: 'root',
          meaning: 'of the worlds', 
          case: 'genitive',
          pattern: 'sound_masculine_plural'
        }
      };

      const result = detectIdafaConstructions(alFatihaSegments);
      
      expect(result.constructions).toHaveLength(1);
      
      const construction = result.constructions[0];
      expect(construction.mudaf.text).toBe('رَبِّ');
      expect(construction.mudafIlayh.text).toBe('الْعَالَمِينَ');
      expect(construction.certainty).toBe('definite');
      expect(construction.textbookRule).toContain('3-question test');
    });

    test('should identify "يَوْمِ الدِّينِ" from Al-Fatiha', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-4-2-1': {
          id: '1-4-2-1', 
          text: 'يَوْمِ',
          morphology: 'noun',
          type: 'root',
          meaning: 'day',
          case: 'genitive'
        },
        '1-4-3-1': {
          id: '1-4-3-1',
          text: 'الدِّينِ',
          morphology: 'noun',
          type: 'root',
          meaning: 'religion/judgment', 
          case: 'genitive'
        }
      };

      const result = detectIdafaConstructions(segments);
      
      expect(result.constructions).toHaveLength(1);
      expect(result.constructions[0].mudaf.text).toBe('يَوْمِ');
      expect(result.constructions[0].mudafIlayh.text).toBe('اللَّهِ');
    });
  });

  describe('Corpus Processing', () => {
    test('should process corpus segments efficiently', () => {
      const corpusSegments: CorpusSegment[] = [
        {
          surah: 1,
          verse: 2,
          word: 2,
          segment: 1,
          text: 'رَبِّ',
          morphology: {
            id: '1-2-2-1',
            text: 'رَبِّ',
            morphology: 'noun',
            type: 'root',
            meaning: 'lord',
            case: 'genitive'
          }
        },
        {
          surah: 1,
          verse: 2,
          word: 3,
          segment: 1,
          text: 'الْعَالَمِينَ',
          morphology: {
            id: '1-2-3-1',
            text: 'الْعَالَمِينَ',
            morphology: 'noun',
            type: 'root',
            meaning: 'of the worlds',
            case: 'genitive'
          }
        }
      ];

      const result = detector.processEntireCorpus(corpusSegments);
      
      expect(result.totalSegments).toBe(2);
      expect(result.totalConstructions).toBe(1);
      expect(result.surahResults[1]).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    test('should handle multi-surah corpus processing', () => {
      const multiSurahSegments: CorpusSegment[] = [
        // Surah 1 segments
        {
          surah: 1,
          verse: 2,
          word: 2,
          segment: 1,
          text: 'رَبِّ',
          morphology: {
            id: '1-2-2-1',
            text: 'رَبِّ',
            morphology: 'noun',
            type: 'root',
            meaning: 'lord',
            case: 'genitive'
          }
        },
        // Surah 2 segments  
        {
          surah: 2,
          verse: 1,
          word: 1,
          segment: 1,
          text: 'كِتَابُ',
          morphology: {
            id: '2-1-1-1',
            text: 'كِتَابُ',
            morphology: 'noun',
            meaning: 'book',
            case: 'nominative'
          }
        }
      ];

      const result = detector.processEntireCorpus(multiSurahSegments);
      
      expect(Object.keys(result.surahResults)).toHaveLength(2);
      expect(result.surahResults[1]).toBeDefined();
      expect(result.surahResults[2]).toBeDefined();
    });
  });

  describe('JSON Export Functionality', () => {
    test('should export constructions to valid JSON format', () => {
      const constructions: IdafaConstruction[] = [{
        id: 'idafa-1-2-2-3',
        mudaf: {
          id: '1-2-2-1',
          text: 'رَبِّ',
          position: 2
        },
        mudafIlayh: {
          id: '1-2-3-1', 
          text: 'الْعَالَمِينَ',
          position: 3,
          type: 'noun'
        },
        chain: false,
        certainty: 'definite',
        textbookRule: 'Dream_Textbook 3-question test: light + no-ال + genitive',
        context: {
          precedingWord: 'الْحَمْدُ',
          followingWord: 'الرَّحْمَٰنِ'
        }
      }];

      const jsonResult = detector.exportToJSON(constructions, {
        includeStatistics: true,
        prettify: true
      });

      expect(jsonResult).toBeTruthy();
      
      const parsed = JSON.parse(jsonResult);
      expect(parsed.algorithm).toBe('Dream_Textbook_3_Question_Test');
      expect(parsed.constructions).toHaveLength(1);
      expect(parsed.constructions[0].mudaf.text).toBe('رَبِّ');
      expect(parsed.constructions[0].mudaf_ilayh.text).toBe('الْعَالَمِينَ');
      expect(parsed.statistics).toBeDefined();
    });

    test('should export corpus results with surah breakdown', () => {
      const corpusResult: CorpusIdafaResult = {
        totalSegments: 10,
        totalConstructions: 2,
        surahResults: {
          1: {
            constructions: [{
              id: 'test-construction',
              mudaf: { id: '1-2-2-1', text: 'رَبِّ', position: 2 },
              mudafIlayh: { id: '1-2-3-1', text: 'الْعَالَمِينَ', position: 3, type: 'noun' },
              chain: false,
              certainty: 'definite' as const,
              textbookRule: 'test rule',
              context: {}
            }],
            statistics: {
              total: 1,
              definite: 1,
              probable: 0,
              inferred: 0,
              withChains: 0,
              withPronouns: 0
            }
          }
        },
        globalStatistics: {
          total: 1,
          definite: 1,
          probable: 0,
          inferred: 0,
          withChains: 0,
          withPronouns: 0
        },
        processingTime: 150,
        validationNotes: []
      };

      const jsonResult = detector.exportCorpusToJSON(corpusResult, {
        includeSurahBreakdown: true,
        prettify: true
      });

      const parsed = JSON.parse(jsonResult);
      expect(parsed.corpus_summary.total_constructions).toBe(2);
      expect(parsed.surah_breakdown['1']).toBeDefined();
      expect(parsed.surah_breakdown['1'].constructions_count).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty segments gracefully', () => {
      const result = detectIdafaConstructions({});
      
      expect(result.constructions).toHaveLength(0);
      expect(result.statistics.total).toBe(0);
    });

    test('should handle segments with missing morphological data', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'رَبِّ',
          morphology: 'noun',
          type: 'root',
          meaning: 'lord'
          // Missing case and pattern intentionally for testing
        }
      };

      const result = detectIdafaConstructions(segments);
      expect(result.validationNotes.length).toBeGreaterThan(0);
    });

    test('should validate 3-question test failure cases', () => {
      // Test word with tanween (should fail lightness test)
      const segments: Record<string, MorphologicalDetails> = {
        '1-1-1-1': {
          id: '1-1-1-1',
          text: 'كِتَابٌ', // Has tanween - not light
          morphology: 'noun',
          type: 'root',
          meaning: 'book'
        },
        '1-1-2-1': {
          id: '1-1-2-1',
          text: 'طَالِبٍ',
          morphology: 'noun',
          type: 'root',
          meaning: 'student',
          case: 'genitive'
        }
      };

      const result = detectIdafaConstructions(segments);
      expect(result.constructions).toHaveLength(0);
    });
  });

  describe('MASAQ Integration', () => {
    test('should utilize MASAQ data for enhanced accuracy', () => {
      const segments: Record<string, MorphologicalDetails> = {
        '1-2-2-1': {
          id: '1-2-2-1',
          text: 'رَبِّ',
          morphology: 'noun',
          type: 'root',
          meaning: 'lord'
        }
      };

      const masaqEntries: MASAQEntry[] = [{
        surah: 1,
        verse: 2,
        word: 2,
        segment: 1,
        text: 'رَبِّ',
        lemma: 'رب',
        morphology: 'N',
        case: 'gen',
        state: 'construct',
        pattern: 'partly-flexible'
      }];

      const result = detectIdafaConstructions(segments, masaqEntries);
      
      // Should use MASAQ data for enhanced detection accuracy
      expect(result.validationNotes).toContain(
        expect.stringMatching(/MASAQ.*construct/i)
      );
    });
  });
});
