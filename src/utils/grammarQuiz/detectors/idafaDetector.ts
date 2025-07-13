/**
 * Idafa (إضافة) Detector
 * 
 * Detects Mudaf-Mudaf Ilayh constructions in Arabic text
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";
import { IdafaDetector, IdafaConstruction } from '../../idafaDetector';

/**
 * Singleton instance of the IdafaDetector
 */
const idafaDetector = new IdafaDetector();

/**
 * Detects Idafa (Mudaf-Mudaf Ilayh) constructions in a verse
 */
export async function detectIdafa(
  segments: Record<string, MorphologicalDetails>
): Promise<GrammarConstruction[]> {
  console.log('🎯 SELECTIVE: Detecting ONLY Idafa (Mudaf-Mudaf Ilayh) constructions');
  const segmentArray = Object.values(segments);
  const idafaConstructions = await idafaDetector.detectIdafa(segmentArray);
  
  // Convert IdafaConstruction objects to standard GrammarConstruction format
  const constructions: GrammarConstruction[] = idafaConstructions.map(
    (idafa, index) => convertIdafaToConstruction(idafa, segmentArray, index)
  );
  
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
