/**
 * Grammar Quiz Utilities
 * 
 * Common helper functions used by multiple components
 */

import { MorphologicalDetails } from "@/types/morphology";

/**
 * Array comparison and manipulation utilities
 */
export function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every(val => b.includes(val));
}

export function intersection(a: number[], b: number[]): number[] {
  return a.filter(val => b.includes(val));
}

export function union(a: number[], b: number[]): number[] {
  return [...new Set([...a, ...b])];
}

export function difference(a: number[], b: number[]): number[] {
  return a.filter(val => !b.includes(val));
}

/**
 * Infer case from segment morphology
 */
export function inferCase(segment: any): 'nominative' | 'genitive' | 'accusative' {
  // Basic case inference - can be enhanced
  if (segment.morphology === 'noun') {
    if (segment.text.endsWith('ُ')) return 'nominative';
    if (segment.text.endsWith('ِ') || segment.text.endsWith('ٍ')) return 'genitive';
    if (segment.text.endsWith('َ') || segment.text.endsWith('ً')) return 'accusative';
  }
  return 'nominative'; // default fallback
}

/**
 * Infer grammatical role from segment
 */
export function inferGrammaticalRole(segment: any): string {
  if (segment.morphology === 'particle' && segment.type === 'prefix') {
    if (['بِ', 'لِ', 'فِي', 'عَلَى', 'إِلَى', 'مِن'].includes(segment.text)) {
      return 'preposition';
    }
    return 'particle';
  }
  if (segment.morphology === 'noun') return 'noun';
  if (segment.morphology === 'verb') return 'verb';
  if (segment.morphology === 'adjective') return 'adjective';
  return 'unknown';
}

/**
 * Calculate difficulty based on constructions and word count
 */
export function calculateDifficulty(
  constructionsLength: number,
  wordCount: number,
  hasInferred: boolean
): 'beginner' | 'intermediate' | 'advanced' {
  const complexityScore = constructionsLength + (wordCount / 5);
  
  if (complexityScore <= 2 && !hasInferred) return 'beginner';
  if (complexityScore <= 4) return 'intermediate';
  return 'advanced';
}

/**
 * Estimate difficulty score for a question
 */
export function estimateDifficultyScore(constructions: any[], wordCount: number): number {
  let score = wordCount * 0.5;
  score += constructions.length * 2;
  score += constructions.filter(c => c.certainty === 'inferred').length * 1.5;
  score += constructions.filter(c => c.certainty === 'probable').length * 1;
  return Math.min(10, Math.max(1, score));
}

/**
 * Format construction type for user-friendly display
 */
export function formatConstructionType(type: string): string {
  switch (type) {
    case 'mudaf-mudaf-ilayh': return 'possessive (Mudaf-Mudaf Ilayh)';
    case 'jar-majroor': return 'prepositional (Jar-Majroor)';
    default: return type;
  }
}
