# Multi-Component Selection Bug Fix

## Issue Summary

**Bug ID**: GG-2023-07-11-001  
**Component**: Grammar Quiz - Component Selection  
**Severity**: Critical  
**Status**: Fixed  
**Fixed Date**: July 11, 2025

## Problem Description

The grammar quiz had a critical bug where multiple components of the same construction type (e.g., jar-majroor) could not be selected simultaneously and correctly grouped under the same construction ID. This prevented the "Add Construction" button from being enabled, as the system couldn't detect complete constructions.

Users were unable to:
- Select multiple components (e.g., jar + majroor) and have them recognized as part of the same construction
- Complete grammar exercises requiring multi-component constructions
- Submit answers for constructions requiring multiple components

## Root Cause Analysis

The issue was in the `useComponentSelection` hook's filtering logic. When selecting a new word and assigning a role, the code was filtering out **ALL** components with the same word indices, regardless of their role:

```typescript
// Original problematic code
const filteredComponents = prev.assignedComponents.filter(
  comp => !prev.selectedWordIndices.includes(comp.wordIndex)
);
```

This caused the following sequence of events:
1. When selecting word 0 and assigning "jar", it was saved correctly
2. When selecting word 1 and assigning "majroor", the filter removed ALL components for the selected word indices, including the "jar" component from step 1
3. As a result, the "jar" role was lost, and only the "majroor" role remained in the construction
4. Since both roles are required for a complete jar-majroor construction, the "Add Construction" button remained disabled

## Fix Implementation

The fix changes the filtering logic to only remove components that have BOTH the same word index AND the same role:

```typescript
// Fixed code
const filteredComponents = prev.assignedComponents.filter(
  comp => !prev.selectedWordIndices.includes(comp.wordIndex) || comp.role !== role
);
```

This ensures:
- If you select a word that already has a different role, it preserves that role
- If you select a word and try to assign the same role it already has, it replaces it
- Different words with different roles are preserved, allowing one word as "jar" and another as "majroor"

## Technical Details

1. The fix was implemented in the `selectAndAssignRole` function in `useComponentSelection.ts`
2. The same fix was applied to both instances of the filtering logic (in the main function and in the auto-assign logic)
3. The construction ID reuse logic was already working correctly, but the filtering issue prevented it from functioning properly

## Testing and Validation

The fix was tested with the following scenario:
1. Select the first word (بِ) and assign it the "jar" role
2. Select the second word (سْمِ) and assign it the "majroor" role
3. Verify that both components are correctly grouped under the same construction ID
4. Verify that the "Add Construction" button is enabled when all required roles are present

Debug logs confirmed:
```
🔍 [19:08:04][ComponentSelection] Reusing existing constructionId: jar-majroor-1752260882434
🔍 [19:08:04][ComponentSelection] Present roles in group: Array(2) // After fix
```

## Impact

This fix resolves a critical usability issue in the grammar quiz, allowing users to:
- Correctly identify and select all components of a grammatical construction
- See the "Add Construction" button enabled when all required components are selected
- Submit complete grammatical constructions for evaluation

The fix maintains the existing behavior for single-component selections while enabling proper multi-component selection and grouping.

## Related Issues

This fix is related to the following previously resolved issues:
- Grammar detection algorithms were confirmed to be working correctly (see memory tag: `jar_majroor, grammar_detection`)
- Proportional scoring system implementation (see memory tag: `proportional_scoring, detailed_feedback`)
- NaN% scoring bug fix (see memory tag: `bug_fix, scoring, interface_mismatch`)

## Lessons Learned

1. When implementing filtering logic for component selection, be careful to only filter out components that should truly be replaced
2. State management in React requires careful consideration of how filtering affects related components
3. Debug logging was essential in identifying the exact point of failure in the component lifecycle

## Future Considerations

1. Add unit tests specifically for multi-component selection scenarios
2. Consider implementing a more robust state management solution for complex component relationships
3. Add validation to ensure components of the same construction type are always grouped correctly
