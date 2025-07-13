# Idafa Construction Detection Fix

## Problem Description

The IdafaDetector currently has a bug where it incorrectly identifies multiple overlapping mudaf-mudaf-ilayh constructions. In particular, it's detecting a false construction with spans [2, 4] when there should only be a construction with spans [1, 2].

The issue occurs because the detector does not track which segments have already been used in valid constructions. This allows a single word to be both:
1. A mudaf-ilayh in one construction
2. A mudaf in another construction

This results in duplicate or overlapping constructions being detected, leading to incorrect scoring in the quiz.

## Solution

Implement a tracking mechanism to prevent segments from being part of multiple overlapping constructions:

1. Add a `usedSegments` Set to track which segments are already part of a construction
2. Skip segments that are already used when looking for potential mudaf candidates
3. Mark both mudaf and mudaf-ilayh segments as used when a valid construction is found

## Implementation Changes

### 1. Changes to `performDetection` method

**Before:**
```typescript
private performDetection() {
  console.log('🔍 Starting comprehensive Idafa detection...');
  
  for (let i = 0; i < this.segments.length - 1; i++) {
    const currentSegment = this.segments[i];
    
    // Skip non-noun tokens for Mudaf candidates
    if (!this.isNounCandidate(currentSegment)) {
      continue;
    }

    console.log(`\n--- Analyzing potential Mudaf: "${currentSegment.text}" (${currentSegment.id}) ---`);
    
    // Apply the 3-question test from textbook
    const lightnessResult = this.isLight(currentSegment);
    const definiteArticleResult = this.lacksDefiniteArticle(currentSegment);
    
    // ... rest of the method

    // Look for Mudaf Ilayh candidates
    this.findMudafIlayh(currentSegment, i);
  }

  // Detect constructions with attached pronouns
  this.detectAttachedPronounConstructions();
}
```

**After:**
```typescript
private performDetection() {
  console.log('🔍 Starting comprehensive Idafa detection...');
  
  // Track which segments are already part of a construction to prevent overlaps
  const usedSegments = new Set<number>();
  
  for (let i = 0; i < this.segments.length - 1; i++) {
    const currentSegment = this.segments[i];
    
    // Skip segments already part of a construction
    if (usedSegments.has(i)) {
      console.log(`⏭️ Skipping segment "${currentSegment.text}" at position ${i} - already used in another construction`);
      continue;
    }
    
    // Skip non-noun tokens for Mudaf candidates
    if (!this.isNounCandidate(currentSegment)) {
      continue;
    }

    console.log(`\n--- Analyzing potential Mudaf: "${currentSegment.text}" (${currentSegment.id}) ---`);
    
    // Apply the 3-question test from textbook
    const lightnessResult = this.isLight(currentSegment);
    const definiteArticleResult = this.lacksDefiniteArticle(currentSegment);
    
    // ... rest of the method

    // Look for Mudaf Ilayh candidates
    this.findMudafIlayh(currentSegment, i, usedSegments);
  }

  // Detect constructions with attached pronouns
  this.detectAttachedPronounConstructions();
}
```

### 2. Changes to `findMudafIlayh` method

**Before:**
```typescript
private findMudafIlayh(mudafSegment: MorphologicalDetails, mudafIndex: number) {
  // Check immediate next token first (most common case)
  for (let j = mudafIndex + 1; j < Math.min(mudafIndex + 4, this.segments.length); j++) {
    const candidateSegment = this.segments[j];
    
    // Skip articles and particles that don't break the construction
    if (this.shouldSkipToken(candidateSegment)) {
      continue;
    }

    console.log(`  Checking candidate Mudaf Ilayh: "${candidateSegment.text}" (${candidateSegment.id})`);

    const genitiveResult = this.isInGenitiveStatus(candidateSegment, mudafSegment);
    console.log(`  Question 3 - Is "${candidateSegment.text}" genitive? ${genitiveResult.isGenitive} (${genitiveResult.reason})`);

    if (genitiveResult.isGenitive) {
      const construction = this.createIdafaConstruction(
        mudafSegment, 
        candidateSegment, 
        mudafIndex, 
        j, 
        genitiveResult.certainty,
        genitiveResult.rule
      );
      
      this.constructions.push(construction);
      console.log(`✅ IDAFA DETECTED: ${construction.mudaf.text} + ${construction.mudafIlayh.text} (${construction.certainty})`);
      
      break; // Found the Mudaf Ilayh for this Mudaf
    }

    // If we hit a clear boundary (verb, definite noun, etc.), stop looking
    if (this.isConstructionBoundary(candidateSegment)) {
      console.log(`  🛑 Hit construction boundary at "${candidateSegment.text}"`);
      break;
    }
  }
}
```

**After:**
```typescript
private findMudafIlayh(mudafSegment: MorphologicalDetails, mudafIndex: number, usedSegments?: Set<number>) {
  // Check immediate next token first (most common case)
  for (let j = mudafIndex + 1; j < Math.min(mudafIndex + 4, this.segments.length); j++) {
    const candidateSegment = this.segments[j];
    
    // Skip articles and particles that don't break the construction
    if (this.shouldSkipToken(candidateSegment)) {
      continue;
    }

    console.log(`  Checking candidate Mudaf Ilayh: "${candidateSegment.text}" (${candidateSegment.id})`);

    const genitiveResult = this.isInGenitiveStatus(candidateSegment, mudafSegment);
    console.log(`  Question 3 - Is "${candidateSegment.text}" genitive? ${genitiveResult.isGenitive} (${genitiveResult.reason})`);

    if (genitiveResult.isGenitive) {
      const construction = this.createIdafaConstruction(
        mudafSegment, 
        candidateSegment, 
        mudafIndex, 
        j, 
        genitiveResult.certainty,
        genitiveResult.rule
      );
      
      this.constructions.push(construction);
      console.log(`✅ IDAFA DETECTED: ${construction.mudaf.text} + ${construction.mudafIlayh.text} (${construction.certainty})`);
      
      // Mark both mudaf and mudaf-ilayh as used to prevent overlapping constructions
      if (usedSegments) {
        usedSegments.add(mudafIndex);
        usedSegments.add(j);
        console.log(`🔒 Marking segments at positions ${mudafIndex} and ${j} as used`);
      }
      
      break; // Found the Mudaf Ilayh for this Mudaf
    }

    // If we hit a clear boundary (verb, definite noun, etc.), stop looking
    if (this.isConstructionBoundary(candidateSegment)) {
      console.log(`  🛑 Hit construction boundary at "${candidateSegment.text}"`);
      break;
    }
  }
}
```

## Expected Outcome

After this fix, the IdafaDetector should only identify one mudaf-mudaf-ilayh construction with spans [1, 2] and correctly omit the invalid construction with spans [2, 4]. This will result in accurate scoring in the quiz, with the total showing 2 constructions (one mudaf-mudaf-ilayh and one jar-majroor) instead of 3.
