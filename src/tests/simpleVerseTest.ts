/**
 * Simple Verse Reference Display Test
 * 
 * This file tests whether verse references are properly passed through
 * the detection pipeline and displayed in logs.
 */

// Import directly with relative paths to avoid module resolution issues
import { detectAllConstructions } from '../utils/grammarQuiz/detectors';
import { MorphologicalDetails } from '../types/morphology';

/**
 * Sample verse data for testing
 */
const sampleVerse = {
  surahId: 1,
  verseId: 2,
  arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  // Sample segments with simplified morphological details
  segments: {
    '1-2-1': {
      id: '1-2-1',
      text: 'الْحَمْدُ',
      morphology: 'noun',
      case: 'nominative',
      type: 'root'
    },
    '1-2-2': {
      id: '1-2-2',
      text: 'لِلَّهِ',
      morphology: 'preposition',
      case: 'genitive',
      type: 'root'
    },
    '1-2-3': {
      id: '1-2-3',
      text: 'رَبِّ',
      morphology: 'noun',
      case: 'genitive',
      grammaticalRole: 'mudaf',
      type: 'root'
    },
    '1-2-4': {
      id: '1-2-4',
      text: 'الْعَالَمِينَ',
      morphology: 'noun',
      case: 'genitive',
      grammaticalRole: 'mudaf_ilayh',
      type: 'root'
    }
  } as Record<string, MorphologicalDetails>
};

/**
 * Run the test
 */
async function runTest() {
  console.log('🧪 TESTING VERSE REFERENCE DISPLAY 🧪');
  console.log('======================================');
  
  // Test with sample verse
  const verseInfo = {
    surahId: sampleVerse.surahId,
    verseId: sampleVerse.verseId,
    arabicText: sampleVerse.arabicText
  };
  
  console.log(`Testing with verse: Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText}`);
  
  try {
    const constructions = await detectAllConstructions(sampleVerse.segments, verseInfo);
    console.log(`Found ${constructions.length} grammatical constructions`);
    
    constructions.forEach((construction, i) => {
      console.log(`  ${i+1}. ${construction.type}: ${construction.wordIndices.join(', ')}`);
    });
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runTest();
