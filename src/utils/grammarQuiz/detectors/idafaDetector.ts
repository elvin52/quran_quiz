/**
 * Idafa (إضافة) Detector
 * 
 * Detects Mudaf-Mudaf Ilayh constructions in Arabic text
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";
import { detectIdafaConstructions as originalDetectIdafa, IdafaConstruction } from '../../idafaDetector';

/**
 * Detects idafa (possession/annexation) constructions in Arabic text
 * 
 * @param segments - Record of morphological segments with IDs
 * @param verseInfo - Optional verse metadata (surah/verse ID, text)
 * @returns Array of Idafa grammatical constructions
 */
export async function detectIdafa(
  segments: Record<string, MorphologicalDetails>,
  verseInfo?: { surahId?: number; verseId?: number; arabicText?: string }
): Promise<GrammarConstruction[]> {
  console.log('🎯 SELECTIVE: Detecting ONLY Idafa (Mudaf-Mudaf Ilayh) constructions');
  
  // Use the original detection function from idafaDetector.ts
  const detectionResult = originalDetectIdafa(segments);
  const idafaConstructions = detectionResult.constructions;
  const segmentArray = Object.values(segments);
  
  // Convert IdafaConstruction objects to standard GrammarConstruction format
  const constructions: GrammarConstruction[] = idafaConstructions.map(
    (idafa, index) => convertIdafaToConstruction(idafa, segmentArray, index)
  );
  
  console.log('🔍 Detecting idafa (possession) constructions...');
  if (verseInfo?.surahId && verseInfo?.verseId) {
    console.log(`📖 Idafa detection in Surah ${verseInfo.surahId}:${verseInfo.verseId}`);
  }
  console.log(`  🎯 Total Idafa constructions found: ${constructions.length}`);
  return constructions;
}

/**
 * Convert IdafaConstruction to GrammarConstruction
 */
function convertIdafaToConstruction(
  idafa: IdafaConstruction,
  segments: MorphologicalDetails[],
  index: number
): GrammarConstruction {
  // Find positions of mudaf and mudaf ilayh in segment array
  const mudafIndex = segments.findIndex(s => s.id === idafa.mudaf.id);
  const mudafIlayhIndex = segments.findIndex(s => s.id === idafa.mudafIlayh.id);
  
  return {
    id: `idafa_${index}_${idafa.id}`,
    type: 'mudaf-mudaf-ilayh',
    spans: [mudafIndex, mudafIlayhIndex].filter(i => i !== -1),
    roles: ['mudaf', 'mudaf-ilayh'],
    certainty: idafa.certainty,
    explanation: `"${idafa.mudaf.text}" (mudaf) is in possessive relationship with "${idafa.mudafIlayh.text}" (mudaf ilayh).`
  };
}
