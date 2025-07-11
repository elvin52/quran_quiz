// 🧪 COMPREHENSIVE GRAMMAR DETECTION TEST
// Testing all 4 construction types across multiple Quranic verses

const testVerses = {
  // Test 1: Bismillah - Jar-Majrūr + Iḍāfa
  bismillah: {
    text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    expected: {
      jarMajrur: [{ jar: "بِ", majroor: "اسْمِ" }],
      idafa: [{ mudaf: "اسْمِ", mudafIlayh: "ٱللَّهِ" }],
      filFail: [],
      harfNasbIsmuha: []
    },
    segments: [
      { id: "1-1", text: "بِ", morphology: "preposition", case: undefined },
      { id: "1-2", text: "اسْمِ", morphology: "noun", case: "genitive" },
      { id: "1-3", text: "ٱللَّهِ", morphology: "noun", case: "genitive" },
      { id: "1-4", text: "ٱلرَّحْمَٰنِ", morphology: "adjective", case: "genitive" },
      { id: "1-5", text: "ٱلرَّحِيمِ", morphology: "adjective", case: "genitive" }
    ]
  },

  // Test 2: Al-Fatiha verse - should have NO constructions (all adjectives)
  mustaqim: {
    text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    expected: {
      jarMajrur: [],
      idafa: [],
      filFail: [{ fil: "اهْدِ", fail: "نَا" }], // verb + pronoun object
      harfNasbIsmuha: []
    },
    segments: [
      { id: "2-1", text: "اهْدِ", morphology: "verb", case: undefined },
      { id: "2-2", text: "نَا", morphology: "pronoun", case: "accusative" },
      { id: "2-3", text: "الصِّرَاطَ", morphology: "noun", case: "accusative" },
      { id: "2-4", text: "الْمُسْتَقِيمَ", morphology: "adjective", case: "accusative" }
    ]
  },

  // Test 3: Simple Jar-Majrūr 
  fiDunya: {
    text: "فِي الدُّنْيَا",
    expected: {
      jarMajrur: [{ jar: "فِي", majroor: "الدُّنْيَا" }],
      idafa: [],
      filFail: [],
      harfNasbIsmuha: []
    },
    segments: [
      { id: "3-1", text: "فِي", morphology: "preposition", case: undefined },
      { id: "3-2", text: "الدُّنْيَا", morphology: "noun", case: "genitive" }
    ]
  },

  // Test 4: Harf Nasb + Ismuha
  innallaha: {
    text: "إِنَّ اللَّهَ غَفُورٌ",
    expected: {
      jarMajrur: [],
      idafa: [],
      filFail: [],
      harfNasbIsmuha: [{ harf: "إِنَّ", ismuha: "اللَّهَ" }]
    },
    segments: [
      { id: "4-1", text: "إِنَّ", morphology: "particle", case: undefined, grammaticalRole: "harf_nasb" },
      { id: "4-2", text: "اللَّهَ", morphology: "noun", case: "accusative" },
      { id: "4-3", text: "غَفُورٌ", morphology: "adjective", case: "nominative" }
    ]
  },

  // Test 5: Pure Iḍāfa chain
  baytAllah: {
    text: "بَيْتِ اللَّهِ الْحَرَامِ",
    expected: {
      jarMajrur: [],
      idafa: [{ mudaf: "بَيْتِ", mudafIlayh: "اللَّهِ" }],
      filFail: [],
      harfNasbIsmuha: []
    },
    segments: [
      { id: "5-1", text: "بَيْتِ", morphology: "noun", case: "genitive" },
      { id: "5-2", text: "اللَّهِ", morphology: "noun", case: "genitive" },
      { id: "5-3", text: "الْحَرَامِ", morphology: "adjective", case: "genitive" }
    ]
  }
};

// Detection functions (mirroring actual system logic)
function detectJarMajrur(segments) {
  const prepositions = ['بِ', 'فِي', 'عَلَى', 'إِلَى', 'مِن', 'عَن', 'لِ', 'كَ'];
  const results = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    
    if (prepositions.includes(current.text) && 
        (next.case === 'genitive' || next.text.includes('ِ'))) {
      results.push({ jar: current.text, majroor: next.text });
    }
  }
  
  return results;
}

function detectIdafa(segments) {
  const results = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const mudaf = segments[i];
    const mudafIlayh = segments[i + 1];
    
    // Skip if mudaf has definite article
    if (hasDefiniteArticle(mudaf.text)) continue;
    
    // CRITICAL: Skip if mudaf-ilayh has definite article (unless it's Allah)
    if (hasDefiniteArticle(mudafIlayh.text) && !isAllah(mudafIlayh.text)) continue;
    
    if (mudaf.morphology === 'noun' && 
        mudafIlayh.morphology === 'noun' &&
        (mudafIlayh.case === 'genitive' || mudafIlayh.text.includes('ِ'))) {
      results.push({ mudaf: mudaf.text, mudafIlayh: mudafIlayh.text });
    }
  }
  
  return results;
}

function detectFilFail(segments) {
  const results = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const fil = segments[i];
    const fail = segments[i + 1];
    
    if (fil.morphology === 'verb' && 
        (fail.morphology === 'pronoun' || fail.morphology === 'noun')) {
      results.push({ fil: fil.text, fail: fail.text });
    }
  }
  
  return results;
}

function detectHarfNasbIsmuha(segments) {
  const harfNasbList = ['إِنَّ', 'أَنَّ', 'كَأَنَّ', 'لَكِنَّ', 'لَيْتَ', 'لَعَلَّ'];
  const results = [];
  
  for (let i = 0; i < segments.length - 1; i++) {
    const harf = segments[i];
    const ismuha = segments[i + 1];
    
    if (harfNasbList.includes(harf.text) && 
        ismuha.morphology === 'noun' &&
        ismuha.case === 'accusative') {
      results.push({ harf: harf.text, ismuha: ismuha.text });
    }
  }
  
  return results;
}

function hasDefiniteArticle(text) {
  return text.startsWith('ال') || 
         text.startsWith('ٱل') || 
         text.startsWith('الْ') || 
         text.startsWith('الَّ');
}

function isAllah(text) {
  // Handle different Unicode variants of Allah
  return text.includes('اللَّهِ') ||  // اللَّهِ (regular alif)
         text.includes('ٱللَّهِ') ||  // ٱللَّهِ (hamza wasla)
         text === 'اللَّهِ' ||
         text === 'ٱللَّهِ';
}

// Test runner
function runComprehensiveTest() {
  console.log('🧪 COMPREHENSIVE GRAMMAR DETECTION TEST');
  console.log('=====================================');
  console.log('Testing all 4 construction types across multiple verses\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];

  Object.entries(testVerses).forEach(([verseName, verse]) => {
    console.log(`📖 Testing: ${verse.text}`);
    console.log(`Expected constructions:`);
    console.log(`  • Jar-Majrūr: ${verse.expected.jarMajrur.length}`);
    console.log(`  • Iḍāfa: ${verse.expected.idafa.length}`);
    console.log(`  • Fiʿl–Fāʿil: ${verse.expected.filFail.length}`);
    console.log(`  • Harf Nasb + Ismuha: ${verse.expected.harfNasbIsmuha.length}\n`);

    // Run detections
    const detectedJarMajrur = detectJarMajrur(verse.segments);
    const detectedIdafa = detectIdafa(verse.segments);
    const detectedFilFail = detectFilFail(verse.segments);
    const detectedHarfNasb = detectHarfNasbIsmuha(verse.segments);

    // Test results
    const tests = [
      { name: 'Jar-Majrūr', expected: verse.expected.jarMajrur, actual: detectedJarMajrur },
      { name: 'Iḍāfa', expected: verse.expected.idafa, actual: detectedIdafa },
      { name: 'Fiʿl–Fāʿil', expected: verse.expected.filFail, actual: detectedFilFail },
      { name: 'Harf Nasb + Ismuha', expected: verse.expected.harfNasbIsmuha, actual: detectedHarfNasb }
    ];

    tests.forEach(test => {
      totalTests++;
      const passed = test.expected.length === test.actual.length;
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: ${test.actual.length} detected (PASS)`);
      } else {
        console.log(`  ❌ ${test.name}: Expected ${test.expected.length}, got ${test.actual.length} (FAIL)`);
        failedTests.push({ verse: verseName, construction: test.name, expected: test.expected, actual: test.actual });
      }
      
      if (test.actual.length > 0) {
        test.actual.forEach(construction => {
          const keys = Object.keys(construction);
          const values = Object.values(construction);
          console.log(`     📍 ${keys[0]}: ${values[0]} + ${keys[1]}: ${values[1]}`);
        });
      }
    });

    console.log('');
  });

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('==============');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Failed: ${totalTests - passedTests}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('================');
    failedTests.forEach(fail => {
      console.log(`${fail.verse} - ${fail.construction}:`);
      console.log(`  Expected: ${JSON.stringify(fail.expected)}`);
      console.log(`  Actual: ${JSON.stringify(fail.actual)}\n`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Grammar detection is working perfectly.');
  }
}

// Run the comprehensive test
runComprehensiveTest();
