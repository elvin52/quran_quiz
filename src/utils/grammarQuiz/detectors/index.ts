/**
 * Grammar Construction Detectors
 * 
 * Main entry point for grammatical construction detection
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";
import { detectIdafa } from './idafaDetector';
import { detectJarMajroor } from './jarMajroorDetector';
import { detectFilFail } from './filFailDetector';
import { detectHarfNasbIsmuha } from './harfNasbIsmuhaDetector';

/**
 * Detects all supported grammatical constructions in a verse
 * Only includes the 4 supported construction types
 */
export async function detectAllConstructions(
  segments: Record<string, MorphologicalDetails>
): Promise<GrammarConstruction[]> {
  console.log('🔍 Detecting ALL supported grammar constructions...');
  
  // Run all detectors in parallel for efficiency
  const [
    idafaConstructions,
    jarMajroorConstructions,
    filFailConstructions, 
    harfNasbIsmuhaConstructions
  ] = await Promise.all([
    detectIdafa(segments),
    detectJarMajroor(segments),
    detectFilFail(segments),
    detectHarfNasbIsmuha(segments)
  ]);
  
  // Combine all construction types
  const allConstructions = [
    ...idafaConstructions,
    ...jarMajroorConstructions,
    ...filFailConstructions,
    ...harfNasbIsmuhaConstructions
  ];
  
  console.log(`✅ Total constructions detected: ${allConstructions.length}`);
  return allConstructions;
}

// Export individual detectors for selective detection
export { detectIdafa } from './idafaDetector';
export { detectJarMajroor } from './jarMajroorDetector';
export { detectFilFail } from './filFailDetector';
export { detectHarfNasbIsmuha } from './harfNasbIsmuhaDetector';
