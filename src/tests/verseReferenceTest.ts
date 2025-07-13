/**
 * Verse Reference Display Test
 * 
 * This file tests whether verse references are properly passed through
 * the detection pipeline and displayed in logs.
 */

import { detectAllConstructions } from '../utils/grammarQuiz/detectors';
import { MorphologicalDetails } from '@/types/morphology';

/**
 * Sample verse data for testing
 */
const sampleVerse = {
  surahId: 1,
  verseId: 2,
  arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  translation: 'All praise is due to Allah, Lord of the worlds',
  // Sample segments with morphological details
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
 * Sample verse #2 for testing
 */
const sampleVerse2 = {
  surahId: 2,
  verseId: 255,
  arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
  translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence',
  // Sample segments with morphological details
  segments: {
    '2-255-1': {
      id: '2-255-1',
      text: 'اللَّهُ',
      morphology: 'noun',
      case: 'nominative',
      type: 'root'
    },
    '2-255-2': {
      id: '2-255-2',
      text: 'لَا',
      morphology: 'particle',
      type: 'root'
    },
    '2-255-3': {
      id: '2-255-3',
      text: 'إِلَٰهَ',
      morphology: 'noun',
      case: 'accusative',
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
  
  console.log('\n📝 TEST 1: Detecting constructions in Al-Fatiha 1:2');
  console.log('--------------------------------------');
  
  // Test with first sample verse
  const verseInfo1 = {
    surahId: sampleVerse.surahId,
    verseId: sampleVerse.verseId,
    arabicText: sampleVerse.arabicText
  };
  
  console.log(`Testing with verse: Surah ${verseInfo1.surahId}:${verseInfo1.verseId} - ${verseInfo1.arabicText}`);
  const constructions1 = await detectAllConstructions(sampleVerse.segments, verseInfo1);
  
  console.log(`Found ${constructions1.length} grammatical constructions`);
  constructions1.forEach((construction, i) => {
    console.log(`  ${i+1}. ${construction.type}: ${construction.wordIndices.join(', ')}`);
  });
  
  console.log('\n📝 TEST 2: Detecting constructions in Ayat al-Kursi 2:255');
  console.log('--------------------------------------');
  
  // Test with second sample verse
  const verseInfo2 = {
    surahId: sampleVerse2.surahId,
    verseId: sampleVerse2.verseId,
    arabicText: sampleVerse2.arabicText
  };
  
  console.log(`Testing with verse: Surah ${verseInfo2.surahId}:${verseInfo2.verseId} - ${verseInfo2.arabicText}`);
  const constructions2 = await detectAllConstructions(sampleVerse2.segments, verseInfo2);
  
  console.log(`Found ${constructions2.length} grammatical constructions`);
  constructions2.forEach((construction, i) => {
    console.log(`  ${i+1}. ${construction.type}: ${construction.wordIndices.join(', ')}`);
  });
  
  console.log('\n✅ Test completed');
}

// Run the test
runTest().catch(error => {
  console.error('❌ Test failed:', error);
});
