/**
 * Grammar Quiz Answer Validator
 * 
 * Validates user answers to grammar quiz questions with detailed feedback
 */

import { 
  GrammarQuizQuestion,
  UserSelection, 
  ConstructionValidation,
  GrammarConstruction,
  ConstructionType
} from '@/types/grammarQuiz';
import { CONSTRUCTION_CONFIG, SUPPORTED_CONSTRUCTION_TYPES } from './config';

/**
 * Helper functions for array operations
 */
function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every(val => b.includes(val));
}

function intersection(a: number[], b: number[]): number[] {
  return a.filter(val => b.includes(val));
}

function union(a: number[], b: number[]): number[] {
  return [...new Set([...a, ...b])];
}

function difference(a: number[], b: number[]): number[] {
  return a.filter(val => !b.includes(val));
}

/**
 * Groups constructions by their type
 */
function groupConstructionsByType(constructions: GrammarConstruction[]): Record<ConstructionType, GrammarConstruction[]> {
  const result: Partial<Record<ConstructionType, GrammarConstruction[]>> = {};
  SUPPORTED_CONSTRUCTION_TYPES.forEach(type => {
    result[type] = [];
  });
  constructions.forEach(construction => {
    const { type } = construction;
    if (SUPPORTED_CONSTRUCTION_TYPES.includes(type) && result[type]) {
      result[type]!.push(construction);
    }
  });
  return result as Record<ConstructionType, GrammarConstruction[]>;
}

/**
 * Creates a validation error response
 */
function createValidationError(message: string, relationshipType: string): ConstructionValidation {
  return {
    isCorrect: false,
    partialCorrect: false,
    scorePercentage: 0,
    correctConstructions: [],
    userConstructions: [],
    feedback: {
      message,
      level: 'error',
      constructionType: relationshipType,
      tips: ['Try again looking for words that connect grammatically.'],
    }
  };
}

/**
 * Gets user-friendly name for construction type
 */
function getConstructionName(type: ConstructionType): string {
  return CONSTRUCTION_CONFIG[type]?.englishName || type;
}

/**
 * Finds best matching role-based construction
 */
function findBestRoleMatch(
  constructions: GrammarConstruction[],
  roleSelection: NonNullable<UserSelection['roleBasedSelection']>
): { construction: GrammarConstruction; score: number } {
  let bestMatch: GrammarConstruction | null = null;
  let highestScore = -1;
  
  for (const construction of constructions) {
    const score = calculateRoleMatchScore(construction, roleSelection);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = construction;
    }
  }
  
  return {
    construction: bestMatch!,
    score: highestScore
  };
}

/**
 * Calculates the score for a role match
 */
function calculateRoleMatchScore(
  construction: GrammarConstruction,
  roleSelection: NonNullable<UserSelection['roleBasedSelection']>
): number {
  if (!construction.roleBasedRelationship) {
    return 0;
  }
  
  const { primaryIndices, secondaryIndices } = construction.roleBasedRelationship;
  const { primary, secondary } = roleSelection;
  
  // Check for exact matches first
  if (arraysEqual(primary, primaryIndices) && arraysEqual(secondary, secondaryIndices)) {
    return 100;
  }
  
  // Calculate partial match score
  const primaryIntersectionSize = intersection(primary, primaryIndices).length;
  const secondaryIntersectionSize = intersection(secondary, secondaryIndices).length;
  
  const primaryUnionSize = union(primary, primaryIndices).length;
  const secondaryUnionSize = union(secondary, secondaryIndices).length;
  
  // Calculate Jaccard similarity for both primary and secondary selections
  const primarySimilarity = 
    primaryUnionSize > 0 ? primaryIntersectionSize / primaryUnionSize : 0;
  
  const secondarySimilarity = 
    secondaryUnionSize > 0 ? secondaryIntersectionSize / secondaryUnionSize : 0;
  
  // Weight primary role slightly more than secondary role (e.g., verb > subject)
  const score = (primarySimilarity * 60) + (secondarySimilarity * 40);
  
  return score;
}

/**
 * Validates a role-based answer
 */
function validateRoleBasedAnswer(
  question: GrammarQuizQuestion,
  userSelection: UserSelection
): ConstructionValidation {
  if (!userSelection.roleBasedSelection) {
    return createValidationError(
      'Please provide role selections for this construction.',
      question.constructionType || 'unknown'
    );
  }
  
  // Group constructions by type for easier validation
  const constructionsByType = groupConstructionsByType(question.constructions);
  
  // Get the correct constructions of the target type
  const targetType = question.constructionType as ConstructionType;
  const correctConstructions = constructionsByType[targetType] || [];
  
  if (correctConstructions.length === 0) {
    return createValidationError(
      `No ${getConstructionName(targetType)} constructions found in this verse.`,
      targetType
    );
  }
  
  // For role-based validation, find the best matching construction
  const bestMatch = findBestRoleMatch(correctConstructions, userSelection.roleBasedSelection);
  const { construction, score } = bestMatch;
  
  // Prepare result based on match score
  const isExactMatch = score >= 95;
  const isCloseMatch = score >= 70 && score < 95;
  const isPartialMatch = score >= 40 && score < 70;
  const scorePercentage = Math.round(score) / 100;
  
  // Generate feedback based on match quality
  let message = '';
  let level: 'success' | 'info' | 'warning' | 'error' = 'error';
  let tips: string[] = [];
  
  if (isExactMatch) {
    message = `Perfect! You correctly identified the ${getConstructionName(targetType)} construction.`;
    level = 'success';
    tips = [
      'You have a good understanding of this grammar pattern.',
      'Keep practicing to reinforce your knowledge.'
    ];
  } else if (isCloseMatch) {
    message = `Almost perfect! Your identification of the ${getConstructionName(targetType)} is nearly correct.`;
    level = 'info';
    tips = [
      'You identified most of the correct words.',
      'Make sure to include all words that are part of the relationship.'
    ];
  } else if (isPartialMatch) {
    message = `You're on the right track with this ${getConstructionName(targetType)} construction.`;
    level = 'warning';
    tips = [
      'You identified some of the correct words.',
      'Pay closer attention to the specific roles of words in this relationship.'
    ];
  } else {
    message = `Your identification of the ${getConstructionName(targetType)} needs improvement.`;
    level = 'error';
    tips = [
      'Study the pattern of this construction type more carefully.',
      'Look for the specific grammatical markers that indicate this relationship.'
    ];
  }
  
  return {
    isCorrect: isExactMatch,
    partialCorrect: isCloseMatch || isPartialMatch,
    scorePercentage,
    correctConstructions: [construction],
    userConstructions: [{
      ...construction,
      roleBasedRelationship: {
        primaryIndices: userSelection.roleBasedSelection.primary,
        secondaryIndices: userSelection.roleBasedSelection.secondary
      }
    }],
    feedback: {
      message,
      level,
      constructionType: targetType,
      tips
    }
  };
}

/**
 * Validates user's answer for a grammar quiz question
 */
export function validateAnswer(
  question: GrammarQuizQuestion,
  userSelection: UserSelection,
  previousSubmissions: UserSelection[] = []
): ConstructionValidation {
  console.log('📊 Validating answer for question:', question.id);
  console.log('  👤 User selection:', userSelection);
  console.log('  📝 Previous submissions count:', previousSubmissions.length);
  
  // Special handling for role-based constructions (fil-fail and harf-nasb-ismuha)
  const roleBasedTypes = ['fil-fail', 'harf-nasb-ismuha'];
  if (question.constructionType && roleBasedTypes.includes(question.constructionType)) {
    return validateRoleBasedAnswer(question, userSelection);
  }
  
  // Standard handling for regular constructions
  if (!userSelection.spans || userSelection.spans.length === 0) {
    return createValidationError(
      'Please select at least one word.',
      question.constructionType || 'unknown'
    );
  }
  
  // Group constructions by type for easier validation
  const constructionsByType = groupConstructionsByType(question.constructions);
  
  // Get the correct constructions of the target type
  const targetType = question.constructionType as ConstructionType;
  const correctConstructions = constructionsByType[targetType] || [];
  
  if (correctConstructions.length === 0) {
    return createValidationError(
      `No ${getConstructionName(targetType)} constructions found in this verse.`,
      targetType
    );
  }
  
  // Create a set of user-selected spans for the current submission
  const currentSpans = userSelection.spans || [];
  
  // Combine with previous submissions if available
  let allUserSubmittedSpans = [...currentSpans];
  for (const prevSubmission of previousSubmissions) {
    if (prevSubmission.spans && prevSubmission.spans.length > 0) {
      allUserSubmittedSpans = union(allUserSubmittedSpans, prevSubmission.spans);
    }
  }
  
  console.log('  🔀 Combined user spans:', allUserSubmittedSpans);
  
  // Create construction-like objects from user selections to make them comparable
  const userConstructions = correctConstructions.map(correctConst => {
    // Deep copy the construction but replace spans with user selection
    return {
      ...correctConst,
      spans: allUserSubmittedSpans
    };
  });
  
  // Determine which constructions the user got correct
  const matchedConstructions: GrammarConstruction[] = [];
  const missedConstructions: GrammarConstruction[] = [];
  
  for (const correctConstruction of correctConstructions) {
    const correctSpans = correctConstruction.spans;
    
    // Check if user selected ALL spans for this construction
    const allSpansSelected = correctSpans.every(span => allUserSubmittedSpans.includes(span));
    
    // Check if user selected ANY spans for this construction
    const anySpansSelected = correctSpans.some(span => allUserSubmittedSpans.includes(span));
    
    if (allSpansSelected) {
      matchedConstructions.push(correctConstruction);
    } else if (anySpansSelected) {
      // User got partial match for this construction
      missedConstructions.push(correctConstruction);
    } else {
      // User completely missed this construction
      missedConstructions.push(correctConstruction);
    }
  }
  
  console.log(`  ✅ Matched constructions: ${matchedConstructions.length}`);
  console.log(`  ❌ Missed constructions: ${missedConstructions.length}`);
  
  // Calculate how many extra (incorrect) spans the user selected
  const correctSpans = correctConstructions.flatMap(c => c.spans);
  const uniqueCorrectSpans = [...new Set(correctSpans)];
  const extraSpans = difference(allUserSubmittedSpans, uniqueCorrectSpans);
  
  // Calculate score based on matches and extras
  const totalConstructions = correctConstructions.length;
  let scorePercentage = totalConstructions > 0 
    ? Math.min(1, Math.max(0, matchedConstructions.length / totalConstructions - (extraSpans.length * 0.1)))
    : 0;
  
  // Ensure score is always in [0,1] range
  scorePercentage = Math.max(0, Math.min(1, scorePercentage));
  
  // Determine correctness and feedback
  const isCorrect = matchedConstructions.length === totalConstructions && extraSpans.length === 0;
  const isPartial = matchedConstructions.length > 0 || (missedConstructions.length > 0 && anyPartialMatch());
  
  // Helper function to check if user got any partial matches
  function anyPartialMatch(): boolean {
    for (const missedConst of missedConstructions) {
      const missedSpans = missedConst.spans;
      const intersection = missedSpans.filter(span => allUserSubmittedSpans.includes(span));
      if (intersection.length > 0) {
        return true;
      }
    }
    return false;
  }
  
  // Generate feedback message
  let message = '';
  let level: 'success' | 'info' | 'warning' | 'error' = 'error';
  let tips: string[] = [];
  
  if (isCorrect) {
    message = `Perfect! You correctly identified all ${getConstructionName(targetType)} constructions.`;
    level = 'success';
    tips = [
      'Excellent job identifying the grammatical pattern.',
      'Continue practicing with more examples to reinforce your learning.'
    ];
  } else if (scorePercentage >= 0.7) {
    message = `Very good! You identified most of the ${getConstructionName(targetType)} constructions.`;
    level = 'info';
    tips = [
      'You have a good understanding of this construction.',
      'Pay closer attention to including all relevant words in each construction.'
    ];
  } else if (scorePercentage >= 0.4) {
    message = `You're on the right track! You found some ${getConstructionName(targetType)} constructions.`;
    level = 'warning';
    tips = [
      'Remember that a complete construction includes all related words.',
      `For ${getConstructionName(targetType)}, make sure you identify all parts of the relationship.`
    ];
  } else if (scorePercentage > 0) {
    message = `Keep practicing. You found a few parts of the ${getConstructionName(targetType)} constructions.`;
    level = 'error';
    tips = [
      `Study the structure of ${getConstructionName(targetType)} more carefully.`,
      'Try to identify how words relate to each other grammatically.'
    ];
  } else {
    message = `Let's try again. Look for ${getConstructionName(targetType)} patterns in this verse.`;
    level = 'error';
    tips = [
      `A ${getConstructionName(targetType)} construction consists of specific related words.`,
      'Review the grammatical rules and try again.'
    ];
  }
  
  return {
    isCorrect,
    partialCorrect: isPartial,
    scorePercentage,
    correctConstructions,
    userConstructions,
    feedback: {
      message,
      level,
      constructionType: targetType,
      tips
    }
  };
}
