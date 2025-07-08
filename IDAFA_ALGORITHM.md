
# إضافة (Idafa) Detection Algorithm Implementation

## Overview

This document describes the implementation of a comprehensive algorithm for detecting and extracting إضافة (Mudaf-Mudaf Ilayh) constructions in Arabic text, based on traditional Arabic grammar rules and modern computational linguistics approaches.

## Algorithm Foundation

The algorithm is based on the **3-Question Test** from classical Arabic grammar:

1. **Is the first word light?** (Does it lack tanween if it's flexible?)
2. **Does the first word lack ال (definite article)?**
3. **Is the second word in genitive status?**

If all three questions are answered "yes", then we have a valid إضافة construction.

## Core Components

### 1. IdafaConstruction Interface

```typescript
interface IdafaConstruction {
  id: string;
  mudaf: {
    id: string;
    text: string;
    position: number;
  };
  mudafIlayh: {
    id: string;
    text: string;
    position: number;
    type: 'noun' | 'pronoun' | 'attached_pronoun';
  };
  chain: boolean;
  chainLevel?: number;
  certainty: 'definite' | 'probable' | 'inferred';
  textbookRule: string;
  context: {
    precedingWord?: string;
    followingWord?: string;
  };
}
```

### 2. Detection Process Flow

```
Input: Morphological Segments + MASAQ Data (optional)
    ↓
1. Initialize Data Structures
    ↓
2. Iterate Through Segments
    ↓
3. For Each Potential Mudaf:
   - Apply 3-Question Test
   - Check Lightness
   - Verify Lack of ال
   - Find Mudaf Ilayh Candidates
    ↓
4. Validate Genitive Status
   - Direct case marking
   - Vowel markers (kasra)
   - MASAQ data verification
   - Flexibility-based inference
    ↓
5. Create Construction Objects
    ↓
6. Detect Chains and Attached Pronouns
    ↓
7. Generate Statistics and Validation
    ↓
Output: IdafaDetectionResult
```

## Implementation Details

### Question 1: Lightness Detection

```typescript
private isLight(segment: MorphologicalDetails): { isLight: boolean; reason: string } {
  // Check for explicit tanween markers
  if (segment.text.includes('ً') || segment.text.includes('ٌ') || segment.text.includes('ٍ')) {
    return { isLight: false, reason: 'Has tanween marking' };
  }

  // Check MASAQ data for construct state
  const masaqEntry = this.getMasaqEntry(segment);
  if (masaqEntry?.state?.toLowerCase().includes('construct')) {
    return { isLight: true, reason: 'MASAQ: construct state' };
  }

  // Default assumption for potential Idafa context
  return { isLight: true, reason: 'Assumed light in Idafa context' };
}
```

### Question 2: Definite Article Check

```typescript
private lacksDefiniteArticle(segment: MorphologicalDetails): { lacks: boolean; reason: string } {
  // Direct check for ال prefix
  if (segment.text.startsWith('ال') || segment.text.startsWith('الل')) {
    return { lacks: false, reason: 'Has ال prefix' };
  }

  // Check MASAQ data for definiteness
  const masaqEntry = this.getMasaqEntry(segment);
  if (masaqEntry?.definite?.toLowerCase().includes('def')) {
    return { lacks: false, reason: 'MASAQ: marked as definite' };
  }

  return { lacks: true, reason: 'No definite article detected' };
}
```

### Question 3: Genitive Status Verification

```typescript
private isInGenitiveStatus(segment: MorphologicalDetails, mudafSegment: MorphologicalDetails) {
  // 1. Direct case marking
  if (segment.case === 'genitive') {
    return { isGenitive: true, certainty: 'definite', reason: 'Explicitly marked genitive' };
  }

  // 2. Vowel marker check (kasra)
  if (segment.text.includes('ِ') && !segment.text.includes('ً') && !segment.text.includes('ٌ')) {
    return { isGenitive: true, certainty: 'definite', reason: 'Has kasra (genitive marker)' };
  }

  // 3. MASAQ data verification
  const masaqEntry = this.getMasaqEntry(segment);
  if (masaqEntry?.case?.toLowerCase().includes('gen')) {
    return { isGenitive: true, certainty: 'definite', reason: 'MASAQ: genitive case' };
  }

  // 4. Flexibility-based rules
  return this.checkFlexibilityGenitive(segment, mudafSegment);
}
```

## Special Cases Handling

### 1. Partly-Flexible Nouns

For partly-flexible nouns, the algorithm looks for فتحة (fatha) indicating genitive case:

```typescript
private isPartlyFlexible(segment: MorphologicalDetails): boolean {
  // Check for partly-flexible patterns in MASAQ data
  const masaqEntry = this.getMasaqEntry(segment);
  return masaqEntry?.pattern?.includes('partly') || false;
}
```

### 2. Non-Flexible Nouns

Non-flexible nouns are inferred to be genitive based on context:

```typescript
private isNonFlexible(segment: MorphologicalDetails): boolean {
  const masaqEntry = this.getMasaqEntry(segment);
  return masaqEntry?.pattern?.includes('non-flexible') || false;
}
```

### 3. Attached Pronouns

The algorithm automatically detects attached pronoun constructions:

```typescript
private detectAttachedPronounConstructions() {
  const pronounSuffixes = ['ه', 'ها', 'هم', 'هن', 'ك', 'كم', 'كن', 'ي', 'نا'];
  
  this.segments.forEach((segment, index) => {
    if (!this.isNounCandidate(segment)) return;

    const hasAttachedPronoun = pronounSuffixes.some(suffix => 
      segment.text.endsWith(suffix) && segment.text.length > suffix.length + 1
    );

    if (hasAttachedPronoun) {
      // Create attached pronoun construction
      this.constructions.push(this.createAttachedPronounConstruction(segment, index));
    }
  });
}
```

## Chain Detection

The algorithm detects إضافة chains where multiple constructions are linked:

```typescript
private detectChains(): IdafaConstruction[][] {
  const chains: IdafaConstruction[][] = [];
  const processed = new Set<string>();

  this.constructions.forEach(construction => {
    if (processed.has(construction.id)) return;

    const chain = this.buildChain(construction, processed);
    if (chain.length > 1) {
      chains.push(chain);
    }
  });

  return chains;
}

private buildChain(startConstruction: IdafaConstruction, processed: Set<string>): IdafaConstruction[] {
  const chain = [startConstruction];
  processed.add(startConstruction.id);

  // Look for constructions where this Mudaf Ilayh becomes a Mudaf
  const nextConstruction = this.constructions.find(c => 
    c.mudaf.id === startConstruction.mudafIlayh.id && 
    !processed.has(c.id)
  );

  if (nextConstruction) {
    chain.push(...this.buildChain(nextConstruction, processed));
  }

  return chain;
}
```

## Integration with Morphological Analysis

The algorithm integrates seamlessly with the existing morphological analysis system:

```typescript
export const integrateIdafaDetection = (
  segments: Record<string, MorphologicalDetails>,
  masaqEntries?: MASAQEntry[]
): Record<string, MorphologicalDetails> => {
  // Run the Idafa detection algorithm
  const idafaResults = detectIdafaConstructions(segments, masaqEntries);
  
  // Create enhanced segments with Idafa relationships
  const enhancedSegments = { ...segments };
  
  // Add Idafa relationships to segments
  idafaResults.constructions.forEach(construction => {
    addIdafaRelationship(enhancedSegments, construction);
  });

  return enhancedSegments;
};
```

## Output Format

The algorithm returns a comprehensive result object:

```typescript
interface IdafaDetectionResult {
  constructions: IdafaConstruction[];
  chains: IdafaConstruction[][];
  statistics: {
    total: number;
    definite: number;
    probable: number;
    inferred: number;
    withChains: number;
    withPronouns: number;
  };
  validationNotes: string[];
}
```

## Usage Example

```typescript
import { detectIdafaConstructions } from './utils/idafaDetector';
import { integrateIdafaDetection } from './utils/idafaIntegration';

// Basic detection
const result = detectIdafaConstructions(morphologicalSegments, masaqData);

// Integration with morphological analysis
const enhancedSegments = integrateIdafaDetection(morphologicalSegments, masaqData);

// Access results
console.log(`Found ${result.constructions.length} إضافة constructions`);
console.log(`Detected ${result.chains.length} chains`);
result.constructions.forEach(construction => {
  console.log(`${construction.mudaf.text} + ${construction.mudafIlayh.text} (${construction.certainty})`);
});
```

## Validation and Testing

The algorithm includes comprehensive validation:

```typescript
export const validateIdafaResults = (
  constructions: IdafaConstruction[],
  expectedPatterns: string[]
): { passed: number; failed: number; details: string[] } => {
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

  return { passed, failed, details };
};
```

## Performance Considerations

- **Time Complexity**: O(n²) in worst case for chain detection, O(n) for basic detection
- **Space Complexity**: O(n) for storing constructions and relationships
- **Optimization**: Early termination when construction boundaries are detected
- **Caching**: MASAQ data is indexed for O(1) lookup

## Future Enhancements

1. **Machine Learning Integration**: Use ML models to improve certainty scoring
2. **Context Analysis**: Enhanced semantic analysis for ambiguous cases
3. **Cross-Reference Validation**: Validate against multiple Arabic grammar sources
4. **Performance Optimization**: Implement parallel processing for large texts

## Grammar Rules Reference

Based on traditional Arabic grammar texts:
- **Mudaf**: Must be light (no tanween) and lack ال
- **Mudaf Ilayh**: Must be in genitive case (مجرور)
- **Chains**: Multiple إضافة constructions linked together
- **Attached Pronouns**: Always create إضافة with their host noun

## Conclusion

This algorithm provides a robust, linguistically-grounded approach to إضافة detection in Arabic text, combining traditional grammar rules with modern computational methods. It handles edge cases, provides certainty levels, and integrates seamlessly with existing morphological analysis systems.
