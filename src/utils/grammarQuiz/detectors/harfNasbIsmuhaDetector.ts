/**
 * Harf Nasb + Ismuha Detector
 * 
 * Detects accusative particle + noun relationships in Arabic text
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";

/**
 * Detects Harf Nasb + Ismuha constructions in a verse
 */
export function detectHarfNasbIsmuha(
  segments: Record<string, MorphologicalDetails>
): Promise<GrammarConstruction[]> {
  console.log('🎯 SELECTIVE: Detecting ONLY Harf Nasb + Ismuha relationships');
  const constructions: GrammarConstruction[] = [];
  const segmentArray = Object.values(segments).sort((a, b) => {
    const aNum = parseInt(a.id.split('-').join(''));
    const bNum = parseInt(b.id.split('-').join(''));
    return aNum - bNum;
  });
  
  // Look for accusative particle + following noun pattern
  const harfNasbParticles = ['أن', 'إن', 'كأن', 'لكن', 'ليت', 'لعل'];
  
  for (let i = 0; i < segmentArray.length - 1; i++) {
    const currentSegment = segmentArray[i];
    const nextSegment = segmentArray[i + 1];
    
    // Check if current segment is a harf nasb
    if (harfNasbParticles.includes(currentSegment.text) ||
        currentSegment.morphology?.includes('حرف نصب')) {
      
      // Check if next segment is a noun (ismuha)
      if (nextSegment.morphology?.includes('NOUN') || 
          nextSegment.morphology?.includes('اسم')) {
        
        const construction: GrammarConstruction = {
          id: `harf-nasb-ismuha-${i}-${Date.now()}`,
          type: 'harf-nasb-ismuha',
          spans: [i, i + 1],
          roles: ['harf-nasb', 'ismuha'],
          certainty: 'definite',
          explanation: `"${currentSegment.text}" is the accusative particle (harf nasb) and "${nextSegment.text}" is its governed noun (ismuha).`,
          roleBasedRelationship: {
            id: `harf-nasb-role-${i}-${Date.now()}`,
            type: 'harf-nasb-ismuha',
            primaryRole: {
              name: 'harf-naṣb',
              description: 'Particle of accusative - governs nouns in accusative',
              arabicName: 'حَرْف نَصْب',
              morphologicalIndicators: ['HARF_NASB', 'PART']
            },
            secondaryRole: {
              name: 'ismuha',
              description: 'Noun governed by an accusative particle',
              arabicName: 'اسمها',
              morphologicalIndicators: ['NOUN', 'ACC']
            },
            primaryIndices: [i],         // Particle indices
            secondaryIndices: [i + 1],   // Noun indices
            certainty: 'definite',
            explanation: `"${currentSegment.text}" (accusative particle) governs "${nextSegment.text}" (noun)`
          }
        };
        
        constructions.push(construction);
        console.log(`  ✅ Found Harf Nasb + Ismuha: ${currentSegment.text} + ${nextSegment.text}`);
      }
    }
  }
  
  console.log(`  🎯 Total Harf Nasb + Ismuha constructions found: ${constructions.length}`);
  return Promise.resolve(constructions);
}
