/**
 * Fiʿl–Fāʿil (فعل وفاعل) Detector
 * 
 * Detects verb-subject relationships in Arabic text
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";

/**
 * Detects Fiʿl–Fāʿil constructions in a verse
 */
export function detectFilFail(
  segments: Record<string, MorphologicalDetails>
): Promise<GrammarConstruction[]> {
  console.log('🎯 SELECTIVE: Detecting ONLY Fiʿl–Fāʿil relationships');
  const constructions: GrammarConstruction[] = [];
  const segmentArray = Object.values(segments).sort((a, b) => {
    const aNum = parseInt(a.id.split('-').join(''));
    const bNum = parseInt(b.id.split('-').join(''));
    return aNum - bNum;
  });
  
  // Look for verb + subject pattern
  for (let i = 0; i < segmentArray.length - 1; i++) {
    const currentSegment = segmentArray[i];
    const nextSegment = segmentArray[i + 1];
    
    // Check if current segment is a verb (fi'l)
    if (currentSegment.morphology?.includes('VERB') || 
        currentSegment.morphology?.includes('فعل')) {
      
      // Check if next segment is a noun that could be the subject (fa'il)
      if (nextSegment.morphology?.includes('NOUN') || 
          nextSegment.morphology?.includes('اسم')) {
        
        const construction: GrammarConstruction = {
          id: `fil-fail-${i}-${Date.now()}`,
          type: 'fil-fail',
          spans: [i, i + 1],
          roles: ['fi3l', 'fa3il'],
          certainty: 'definite',
          explanation: `"${currentSegment.text}" is the verb (fiʿl) and "${nextSegment.text}" is the subject (fāʿil).`,
          roleBasedRelationship: {
            id: `fil-fail-role-${i}-${Date.now()}`,
            type: 'fil-fail',
            primaryRole: {
              name: 'fiʿl',
              description: 'Verb - the action or state',
              arabicName: 'فِعْل',
              morphologicalIndicators: ['IV', 'PV', 'VERB']
            },
            secondaryRole: {
              name: 'fāʿil',
              description: 'Doer - the one who performs the action',
              arabicName: 'فَاعِل',
              morphologicalIndicators: ['NOUN', 'PRON', 'NOM']
            },
            primaryIndices: [i],         // Verb indices
            secondaryIndices: [i + 1],   // Subject indices
            certainty: 'definite',
            explanation: `"${currentSegment.text}" (verb) is performed by "${nextSegment.text}" (subject)`
          }
        };
        
        constructions.push(construction);
        console.log(`  ✅ Found Fiʿl–Fāʿil: ${currentSegment.text} + ${nextSegment.text}`);
      }
    }
  }
  
  console.log(`  🎯 Total Fiʿl–Fāʿil constructions found: ${constructions.length}`);
  return Promise.resolve(constructions);
}
