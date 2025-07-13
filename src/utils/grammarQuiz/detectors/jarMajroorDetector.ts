/**
 * Jar-Majroor (جار ومجرور) Detector
 * 
 * Detects prepositional phrases in Arabic text
 */

import { MorphologicalDetails } from "@/types/morphology";
import { GrammarConstruction } from "@/types/grammarQuiz";

/**
 * Detects Jar-Majroor constructions in a verse
 */
export function detectJarMajroor(
  segments: Record<string, MorphologicalDetails>
): Promise<GrammarConstruction[]> {
  console.log('🎯 SELECTIVE: Detecting ONLY Jar wa Majrūr relationships');
  const constructions: GrammarConstruction[] = [];
  const segmentArray = Object.values(segments).sort((a, b) => {
    const aNum = parseInt(a.id.split('-').join(''));
    const bNum = parseInt(b.id.split('-').join(''));
    return aNum - bNum;
  });

  // Define Arabic prepositions for detection
  const prepositions = [
    // Single-letter prepositions with diacritics
    'بِ', 'لِ', 'كِ', 'تِ', 'وِ',
    // Single-letter prepositions without diacritics
    'ب', 'ل', 'ك', 'ت', 'و',
    // Multi-letter prepositions
    'مِن', 'إِلَى', 'عَن', 'فِي', 'عَلَى',
    'من', 'إلى', 'عن', 'في', 'على',
    'عند', 'لدى', 'حتى', 'أمام', 'خلف', 'فوق', 'تحت'
  ];

  console.log(`  📋 Will check ${segmentArray.length} segments for Jar wa Majrūr constructions`);

  // Method 1: Check for separate preposition + noun pairs
  for (let i = 0; i < segmentArray.length - 1; i++) {
    const currentSegment = segmentArray[i];
    const nextSegment = segmentArray[i + 1];
    
    console.log(`  📝 Checking separate pair ${i}-${i+1}: "${currentSegment.text}" + "${nextSegment.text}"`);
    console.log(`     - current morphology: ${currentSegment.morphology}, grammaticalRole: ${currentSegment.grammaticalRole}`);
    console.log(`     - next morphology: ${nextSegment.morphology}, case: ${nextSegment.case}`);
    
    // Check if current segment is a preposition
    const isPrepositionByMorphology = currentSegment.morphology === 'particle' && currentSegment.grammaticalRole === 'preposition';
    const isPrepositionByText = prepositions.includes(currentSegment.text);
    const isPreposition = isPrepositionByMorphology || isPrepositionByText;
    
    console.log(`     - preposition checks: byMorphology=${isPrepositionByMorphology}, byText=${isPrepositionByText}`);
    
    if (isPreposition) {
      // Check if next segment is a noun or construct that could be majroor
      const isNoun = nextSegment.morphology === 'noun' || nextSegment.morphology?.includes('noun');
      const isArabicNoun = nextSegment.morphology?.includes('اسم');
      const isConstruct = nextSegment.grammaticalRole === 'construct';
      const isGenitive = nextSegment.case === 'genitive';
      
      console.log(`     - noun checks: isNoun=${isNoun}, isArabicNoun=${isArabicNoun}, isConstruct=${isConstruct}, isGenitive=${isGenitive}`);
      
      // Any of these conditions suggest a likely jar-majroor
      if (isNoun || isArabicNoun || isGenitive || isConstruct) {
        constructions.push({
          id: `jar-majroor-separate-${i}-${i+1}`,
          type: 'jar-majroor',
          spans: [i, i + 1],
          roles: ['jar', 'majroor'],
          certainty: 'definite',
          explanation: `"${currentSegment.text}" (preposition) governs "${nextSegment.text}" (object) in genitive case.`
        });
        
        console.log(`  ✅ FOUND Jar wa Majrūr: ${currentSegment.text} + ${nextSegment.text}`);
      }
    }
  }

  // Method 2: Check for attached prepositions within words
  for (let i = 0; i < segmentArray.length; i++) {
    const segment = segmentArray[i];
    const { text } = segment;
    
    // Check for attached prepositions (e.g., بِ + noun, لِ + noun)
    for (const prep of ['بِ', 'لِ', 'كِ', 'ب', 'ل', 'ك']) {
      if (text.startsWith(prep) && text.length > prep.length) {
        const remainingText = text.substring(prep.length);
        console.log(`  🔍 Found potential attached preposition: "${prep}" + "${remainingText}" in "${text}"`);
        
        // Simple heuristic: if remaining text is long enough, treat as a noun
        if (remainingText.length >= 2) {
          constructions.push({
            id: `jar-majroor-attached-${i}`,
            type: 'jar-majroor',
            spans: [i],
            roles: ['jar-majroor-combined'],
            certainty: 'inferred',
            explanation: `"${text}" contains the preposition "${prep}" attached to "${remainingText}" forming a jar-majroor relationship.`
          });
          
          console.log(`  ✅✅ FOUND Jar wa Majrūr (attached): ${prep} + ${remainingText} in "${text}"`);
          break; // Only match the first preposition found
        } else {
          console.log(`    ❌ Not recognized as a noun construction`);
        }
      }
    }
  }
  
  console.log(`  🎯 Total Jar wa Majrūr constructions found: ${constructions.length}`);
  return Promise.resolve(constructions);
}
