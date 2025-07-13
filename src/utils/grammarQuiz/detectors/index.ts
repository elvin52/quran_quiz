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
  segments: Record<string, MorphologicalDetails>,
  verseInfo?: { surahId?: number; verseId?: number; arabicText?: string }
): Promise<GrammarConstruction[]> {
  console.log('🔍 Detecting ALL supported grammar constructions...');
  
  if (verseInfo && verseInfo.surahId && verseInfo.verseId) {
    console.log(`📖 Processing Surah ${verseInfo.surahId}:${verseInfo.verseId}${verseInfo.arabicText ? ' - ' + verseInfo.arabicText : ''}`);
  }
  
  // Run all detectors in parallel for efficiency
  const [
    idafaConstructions,
    jarMajroorConstructions,
    filFailConstructions, 
    harfNasbIsmuhaConstructions
  ] = await Promise.all([
    detectIdafa(segments, verseInfo),
    detectJarMajroor(segments, verseInfo),
    detectFilFail(segments, verseInfo),
    detectHarfNasbIsmuha(segments, verseInfo)
  ]);
  
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

// Export individual detectors for selective detection
export { detectIdafa } from './idafaDetector';
export { detectJarMajroor } from './jarMajroorDetector';
export { detectFilFail } from './filFailDetector';
export { detectHarfNasbIsmuha } from './harfNasbIsmuhaDetector';
