
import { detectIdafaConstructions, IdafaConstruction } from './idafaDetector';
import { MorphologicalDetails, GrammaticalRelationship } from '@/types/morphology';
import { MASAQEntry } from '@/types/masaq';

/**
 * Integration module to incorporate Idafa detection into the main morphological analysis
 */
export const integrateIdafaDetection = (
  segments: Record<string, MorphologicalDetails>,
  masaqEntries?: MASAQEntry[]
): Record<string, MorphologicalDetails> => {
  console.log('🔗 Integrating Idafa detection with morphological analysis...');
  
  // Run the Idafa detection algorithm
  const idafaResults = detectIdafaConstructions(segments, masaqEntries);
  
  // Create enhanced segments with Idafa relationships
  const enhancedSegments = { ...segments };
  
  // Add Idafa relationships to segments
  idafaResults.constructions.forEach(construction => {
    addIdafaRelationship(enhancedSegments, construction);
  });

  // Mark chain relationships
  idafaResults.chains.forEach((chain, chainIndex) => {
    markChainRelationships(enhancedSegments, chain, chainIndex);
  });

  console.log(`✅ Added ${idafaResults.constructions.length} Idafa relationships`);
  console.log(`✅ Detected ${idafaResults.chains.length} Idafa chains`);
  
  return enhancedSegments;
};

const addIdafaRelationship = (
  segments: Record<string, MorphologicalDetails>,
  construction: IdafaConstruction
) => {
  const mudafRelationship: GrammaticalRelationship = {
    id: `${construction.id}-mudaf`,
    type: 'mudaf-mudaf-ilayh',
    role: 'mudaf',
    relatedSegmentId: construction.mudafIlayh.id,
    description: `Mudaf "${construction.mudaf.text}" in Idafa with "${construction.mudafIlayh.text}" (${construction.certainty})`
  };

  const mudafIlayhRelationship: GrammaticalRelationship = {
    id: `${construction.id}-mudaf-ilayh`,
    type: 'mudaf-mudaf-ilayh', 
    role: 'mudaf-ilayh',
    relatedSegmentId: construction.mudaf.id,
    description: `Mudaf Ilayh "${construction.mudafIlayh.text}" in Idafa with "${construction.mudaf.text}" (${construction.certainty})`
  };

  // Add relationships to segments
  if (segments[construction.mudaf.id]) {
    segments[construction.mudaf.id] = {
      ...segments[construction.mudaf.id],
      relationships: [
        ...(segments[construction.mudaf.id].relationships || []),
        mudafRelationship
      ]
    };
  }

  if (segments[construction.mudafIlayh.id]) {
    segments[construction.mudafIlayh.id] = {
      ...segments[construction.mudafIlayh.id],
      relationships: [
        ...(segments[construction.mudafIlayh.id].relationships || []),
        mudafIlayhRelationship
      ]
    };
  }
};

const markChainRelationships = (
  segments: Record<string, MorphologicalDetails>,
  chain: IdafaConstruction[],
  chainIndex: number
) => {
  chain.forEach((construction, index) => {
    if (segments[construction.mudaf.id]) {
      segments[construction.mudaf.id] = {
        ...segments[construction.mudaf.id],
        grammaticalRole: `${segments[construction.mudaf.id].grammaticalRole || ''} chain-${chainIndex}-level-${index}`.trim()
      };
    }
  });
};

export const validateIdafaResults = (
  constructions: IdafaConstruction[],
  expectedPatterns: string[]
): { passed: number; failed: number; details: string[] } => {
  console.log('🧪 Validating Idafa detection results...');
  
  let passed = 0;
  let failed = 0;
  const details: string[] = [];
  
  expectedPatterns.forEach(pattern => {
    const found = constructions.some(c => 
      `${c.mudaf.text} ${c.mudafIlayh.text}` === pattern
    );
    
    if (found) {
      passed++;
      details.push(`✅ Found expected pattern: ${pattern}`);
    } else {
      failed++;
      details.push(`❌ Missing expected pattern: ${pattern}`);
    }
  });

  console.log(`Validation complete: ${passed} passed, ${failed} failed`);
  return { passed, failed, details };
};
