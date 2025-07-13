import { MorphologicalDetails } from '@/types/morphology';

/**
 * Ensures that segments are always provided as an array, regardless of input format
 * 
 * @param segments - Segments in either array or record format, or undefined
 * @returns An array of MorphologicalDetails
 */
export function ensureSegmentArray(
  segments: MorphologicalDetails[] | Record<string, MorphologicalDetails> | undefined
): MorphologicalDetails[] {
  if (!segments) {
    return [];
  }
  
  return Array.isArray(segments) ? segments : Object.values(segments);
}

/**
 * Checks if the segments are in array format
 * 
 * @param segments - Segments to check
 * @returns true if segments are in array format, false otherwise
 */
export function isSegmentArray(
  segments: MorphologicalDetails[] | Record<string, MorphologicalDetails> | undefined
): segments is MorphologicalDetails[] {
  return segments ? Array.isArray(segments) : false;
}

/**
 * Gets the length of segments, handling both array and object formats
 * 
 * @param segments - Segments in either array or record format, or undefined
 * @returns Number of segments
 */
export function getSegmentsLength(
  segments: MorphologicalDetails[] | Record<string, MorphologicalDetails> | undefined
): number {
  if (!segments) {
    return 0;
  }
  
  return Array.isArray(segments) ? segments.length : Object.keys(segments).length;
}
