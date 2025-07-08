
import { IdafaConstruction, detectIdafaConstructions } from './idafaDetector';
import { MorphologicalDetails } from '@/types/morphology';

// Test cases based on textbook examples
export const createTestCases = () => {
  console.log('🧪 Creating Idafa test cases from textbook examples...');

  // Test Case 1: رَسُولُ اللّٰهِ (the messenger of Allah)
  const testCase1: Record<string, MorphologicalDetails> = {
    '1-1-1-1': {
      id: '1-1-1-1',
      text: 'رَسُولُ',
      morphology: 'noun',
      type: 'root',
      case: 'nominative',
      grammaticalRole: 'subject'
    },
    '1-1-2-1': {
      id: '1-1-2-1', 
      text: 'اللّٰهِ',
      morphology: 'noun',
      type: 'root',
      case: 'genitive',
      grammaticalRole: 'mudaf_ilayh'
    }
  };

  // Test Case 2: قَوْمُ مُوسَى (the people of Musa)
  const testCase2: Record<string, MorphologicalDetails> = {
    '2-1-1-1': {
      id: '2-1-1-1',
      text: 'قَوْمُ',
      morphology: 'noun',
      type: 'root',
      case: 'nominative'
    },
    '2-1-2-1': {
      id: '2-1-2-1',
      text: 'مُوسَى',
      morphology: 'noun', 
      type: 'root',
      case: 'genitive'
    }
  };

  // Test Case 3: ذِكْرُ رَحْمَةِ رَبِّكَ (the mention of the mercy of your Lord) - Chain
  const testCase3: Record<string, MorphologicalDetails> = {
    '3-1-1-1': {
      id: '3-1-1-1',
      text: 'ذِكْرُ',
      morphology: 'noun',
      type: 'root',
      case: 'nominative'
    },
    '3-1-2-1': {
      id: '3-1-2-1',
      text: 'رَحْمَةِ', 
      morphology: 'noun',
      type: 'root',
      case: 'genitive'
    },
    '3-1-3-1': {
      id: '3-1-3-1',
      text: 'رَبِّكَ',
      morphology: 'noun',
      type: 'root', 
      case: 'genitive'
    }
  };

  // Test Case 4: Surah Al-Fatiha examples
  const alFatihaTest: Record<string, MorphologicalDetails> = {
    '1-1-1-1': {
      id: '1-1-1-1',
      text: 'بِسْمِ',
      morphology: 'noun',
      type: 'root',
      case: 'genitive'
    },
    '1-1-2-1': {
      id: '1-1-2-1',
      text: 'اللّٰهِ',
      morphology: 'noun',
      type: 'root', 
      case: 'genitive'
    },
    '1-4-1-1': {
      id: '1-4-1-1',
      text: 'مَالِكِ',
      morphology: 'noun',
      type: 'root',
      case: 'genitive'
    },
    '1-4-2-1': {
      id: '1-4-2-1',
      text: 'يَوْمِ',
      morphology: 'noun',
      type: 'root',
      case: 'genitive'
    },
    '1-4-3-1': {
      id: '1-4-3-1',
      text: 'الدِّينِ',
      morphology: 'noun',
      type: 'root',
      case: 'genitive'
    }
  };

  return {
    testCase1,
    testCase2, 
    testCase3,
    alFatihaTest
  };
};

export const runIdafaTests = () => {
  console.log('🧪 Running comprehensive Idafa detection tests...');
  
  const testCases = createTestCases();
  const results: Record<string, any> = {};

  // Test 1: Simple Idafa
  console.log('\n--- Test 1: رَسُولُ اللّٰهِ ---');
  const result1 = detectIdafaConstructions(testCases.testCase1);
  results.test1 = result1;
  console.log(`Found ${result1.constructions.length} constructions`);
  result1.constructions.forEach(c => 
    console.log(`  ${c.mudaf.text} + ${c.mudafIlayh.text} (${c.certainty})`)
  );

  // Test 2: Simple Idafa with proper noun
  console.log('\n--- Test 2: قَوْمُ مُوسَى ---');
  const result2 = detectIdafaConstructions(testCases.testCase2);
  results.test2 = result2;
  console.log(`Found ${result2.constructions.length} constructions`);
  result2.constructions.forEach(c => 
    console.log(`  ${c.mudaf.text} + ${c.mudafIlayh.text} (${c.certainty})`)
  );

  // Test 3: Chain Idafa
  console.log('\n--- Test 3: ذِكْرُ رَحْمَةِ رَبِّكَ ---');
  const result3 = detectIdafaConstructions(testCases.testCase3);
  results.test3 = result3;
  console.log(`Found ${result3.constructions.length} constructions`);
  console.log(`Found ${result3.chains.length} chains`);
  result3.constructions.forEach(c => 
    console.log(`  ${c.mudaf.text} + ${c.mudafIlayh.text} (${c.certainty})`)
  );
  result3.chains.forEach((chain, i) => 
    console.log(`  Chain ${i + 1}: ${chain.map(c => c.mudaf.text).join(' -> ')}`)
  );

  // Test 4: Al-Fatiha validation
  console.log('\n--- Test 4: Surah Al-Fatiha validation ---');
  const result4 = detectIdafaConstructions(testCases.alFatihaTest);
  results.test4 = result4;
  console.log(`Found ${result4.constructions.length} constructions`);
  result4.constructions.forEach(c => 
    console.log(`  ${c.mudaf.text} + ${c.mudafIlayh.text} (${c.certainty}) - Rule: ${c.textbookRule}`)
  );

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  const totalConstructions = Object.values(results).reduce((sum, r) => sum + r.constructions.length, 0);
  console.log(`Total constructions detected across all tests: ${totalConstructions}`);
  
  return results;
};
