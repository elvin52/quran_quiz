/**
 * Verse Reference Display Test
 * 
 * This file tests whether verse references are properly passed through
 * the detection pipeline and displayed in logs.
 */

// Mock data - simulating the segments structure
const sampleSegments = {
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
};

// Mock functions - simulating the detector functions
function detectIdafa(segments, verseInfo) {
  console.log('🔍 Detecting idafa constructions...');
  if (verseInfo?.surahId && verseInfo?.verseId) {
    console.log(`📖 Idafa detection in Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText || ''}`);
  }
  
  // Simulate finding an idafa construction
  return [
    {
      type: 'idafa',
      wordIndices: [2, 3],
      roles: {
        mudaf: 2,
        mudaf_ilayh: 3
      }
    }
  ];
}

function detectJarMajroor(segments, verseInfo) {
  console.log('🔍 Detecting jar-majroor constructions...');
  if (verseInfo?.surahId && verseInfo?.verseId) {
    console.log(`📖 Jar-Majroor detection in Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText || ''}`);
  }
  
  // Simulate finding a jar-majroor construction
  return [
    {
      type: 'jar-majroor',
      wordIndices: [1, 2],
      roles: {
        jar: 1,
        majroor: 2
      }
    }
  ];
}

function detectFilFail(segments, verseInfo) {
  console.log('🔍 Detecting fil-fail constructions...');
  if (verseInfo?.surahId && verseInfo?.verseId) {
    console.log(`📖 Fil-Fail detection in Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText || ''}`);
  }
  
  // No fil-fail constructions in this example
  return [];
}

function detectHarfNasbIsmuha(segments, verseInfo) {
  console.log('🔍 Detecting harf nasb + ismuha constructions...');
  if (verseInfo?.surahId && verseInfo?.verseId) {
    console.log(`📖 Harf Nasb + Ismuha detection in Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText || ''}`);
  }
  
  // No harf nasb constructions in this example
  return [];
}

// Main detection function that calls all detectors
async function detectAllConstructions(segments, verseInfo) {
  console.log('🔍 Detecting ALL supported grammar constructions...');
  
  if (verseInfo && verseInfo.surahId && verseInfo.verseId) {
    console.log(`📖 Processing Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText || ''}`);
  }
  
  // Run all detectors (in a real app these would be parallel with Promise.all)
  const idafaConstructions = detectIdafa(segments, verseInfo);
  const jarMajroorConstructions = detectJarMajroor(segments, verseInfo);
  const filFailConstructions = detectFilFail(segments, verseInfo);
  const harfNasbIsmuhaConstructions = detectHarfNasbIsmuha(segments, verseInfo);
  
  // Combine all construction types
  const allConstructions = [
    ...idafaConstructions,
    ...jarMajroorConstructions,
    ...filFailConstructions,
    ...harfNasbIsmuhaConstructions
  ];
  
  console.log(`✅ Total constructions detected: ${allConstructions.length}${verseInfo ? ' in Surah ' + verseInfo.surahId + ':' + verseInfo.verseId : ''}`);
  return allConstructions;
}

/**
 * Run the test
 */
async function runTest() {
  console.log('🧪 TESTING VERSE REFERENCE DISPLAY 🧪');
  console.log('======================================');
  
  // Test verse information
  const verseInfo = {
    surahId: 1,
    verseId: 2,
    arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'
  };
  
  console.log(`Testing with verse: Surah ${verseInfo.surahId}:${verseInfo.verseId} - ${verseInfo.arabicText}`);
  
  try {
    // This should now show verse references in all detector logs
    const constructions = await detectAllConstructions(sampleSegments, verseInfo);
    
    console.log('\n📊 Results Summary:');
    console.log(`Found ${constructions.length} grammatical constructions`);
    
    constructions.forEach((construction, i) => {
      console.log(`  ${i+1}. ${construction.type}: Words at indices ${construction.wordIndices.join(', ')}`);
    });
    
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runTest();
