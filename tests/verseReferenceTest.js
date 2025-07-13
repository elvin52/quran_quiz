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
    arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    surahName: 'Al-Fatiha',
    surahNameArabic: 'الفاتحة',
    translation: 'All praise is due to Allah, Lord of the worlds'
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
    
    // Test creating a question with the fixed structure
    console.log('\n🧪 Testing question generation with quranMetadata structure:');
    
    // Simulate question creation as in questionGenerator.ts
    const question = {
      id: `question-${verseInfo.surahId}-${verseInfo.verseId}-${Date.now()}`,
      verseId: `${verseInfo.surahId}:${verseInfo.verseId}`,
      text: verseInfo.arabicText,
      translation: verseInfo.translation,
      surahName: verseInfo.surahName,
      surahNameArabic: verseInfo.surahNameArabic,
      difficulty: 'medium',
      difficultyScore: 0.5,
      segments: sampleSegments,
      constructionType: 'idafa',
      constructions: constructions,
      createdAt: new Date().toISOString(),
      // NEW STRUCTURE: Add quranMetadata for UI compatibility
      quranMetadata: {
        surahId: verseInfo.surahId,
        verseId: verseInfo.verseId,
        surahName: verseInfo.surahName,
        surahNameArabic: verseInfo.surahNameArabic,
        translation: verseInfo.translation
      }
    };
    
    // Simulate UI access of quranMetadata
    console.log('📄 Question Structure Check:');
    console.log(`- Direct properties: surahId=${question.surahId}, verseId=${question.verseId}`);
    console.log(`- QuranMetadata access: surahId=${question.quranMetadata?.surahId}, verseId=${question.quranMetadata?.verseId}`);
    console.log(`- Surah name: ${question.quranMetadata?.surahName} (${question.quranMetadata?.surahNameArabic})`);
    
    // Verify UI display logic works as expected
    const uiVerseMetadata = {
      surahId: question.quranMetadata?.surahId || 0,
      surahName: question.quranMetadata?.surahName || '',
      surahNameArabic: question.quranMetadata?.surahNameArabic || '',
      verseId: question.quranMetadata?.verseId || 0,
      translation: question.quranMetadata?.translation || ''
    };
    
    console.log('🖥️ UI Display Verification:');
    console.log(`- Will display: Surah ${uiVerseMetadata.surahId}:${uiVerseMetadata.verseId}`);
    console.log(`- Will display: ${uiVerseMetadata.surahName} (${uiVerseMetadata.surahNameArabic})`);
    console.log(`- Will display translation: ${uiVerseMetadata.translation.substring(0, 30)}...`);
    
    // TEST ARABIC TEXT DISPLAY WITH BOTH SEGMENT FORMATS
    console.log('\n🇦🇷 Testing Arabic Text Display:');
    
    // Function to simulate the processSegments logic from QuranVerseDisplay component
    function processSegments(segments) {
      console.log(`  Input segment type: ${Array.isArray(segments) ? 'Array' : 'Object/Record'}`);
      
      // Convert segments to array if they are in Record format
      const segmentsArray = Array.isArray(segments) 
        ? segments 
        : Object.values(segments);
      
      console.log(`  Number of segments: ${segmentsArray.length}`);
      console.log('  Segments text:');
      segmentsArray.forEach((seg, i) => {
        console.log(`    ${i+1}. ${seg.text} (ID: ${seg.id})`);
      });
      
      return segmentsArray;
    }
    
    // Test with object/record format (original)
    console.log('\n📝 Testing with Record/Object format segments:');
    const recordSegments = processSegments(sampleSegments);
    
    // Test with array format (UI expected)
    console.log('\n📝 Testing with Array format segments:');
    const arraySegments = processSegments(Object.values(sampleSegments));
    
    // Simulate the QuranVerseDisplay render
    console.log('\n📋 Simulating QuranVerseDisplay render:');
    console.log('  ⟶ Verse title: ' + verseInfo.surahNameArabic + ' • ' + verseInfo.surahName + ' • Verse ' + verseInfo.verseId);
    console.log('  ⟶ Arabic text: ' + arraySegments.map(seg => seg.text).join(' '));
    console.log('  ⟶ Translation: ' + verseInfo.translation);
    
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runTest();
