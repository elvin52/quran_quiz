/**
 * Token Group-Based Aggregation Service
 * 
 * This service replaces heuristic-based aggregation with data-driven grouping
 * using Token_Group_ID from MASAQ dataset. This ensures Mushaf-style display
 * while preserving individual segment analysis capabilities.
 * 
 * Key Benefits:
 * - Eliminates word boundary ambiguity
 * - Uses authoritative linguistic data from MASAQ
 * - Maintains morphological analysis precision
 * - Supports both display and selection needs
 */

import { MorphologicalDetails } from '../types/morphology';
import { MASAQEntry } from '../types/masaq';

export interface TokenGroup {
  id: string;                    // Token Group ID (from MASAQ.ID)
  displayWord: string;           // Full word for display (from MASAQ.Word)
  segments: MorphologicalDetails[];  // All segments in this group
  originalIndices: number[];     // Original segment indices for selection mapping
}

export interface TokenGroupAggregationResult {
  groups: TokenGroup[];
  indexMapping: Map<number, number[]>; // aggregated index -> original indices
}

/**
 * Service for grouping morphological segments by Token_Group_ID
 * Uses MASAQ data to create proper word boundaries for display and analysis
 */
export class TokenGroupAggregationService {
  
  /**
   * Groups enhanced segments by their Token_Group_ID from MASAQ data
   * @param segments Enhanced morphological segments
   * @param masaqEntries MASAQ entries for the entire dataset
   * @param surah Current surah number
   * @param verse Current verse number
   * @returns Grouped segments with display words and index mapping
   */
  public groupSegmentsByTokenId(
    segments: MorphologicalDetails[], 
    masaqEntries: MASAQEntry[],
    surah: number,
    verse: number
  ): TokenGroupAggregationResult {
    
    console.log('🔗 Starting Token Group aggregation...');
    console.log(`📊 Input: ${segments.length} segments for Surah ${surah}, Verse ${verse}`);
    console.log(`📚 MASAQ dataset: ${masaqEntries.length} total entries`);
    
    // Create lookup map for MASAQ entries by location (surah, verse, word_no)
    const masaqLookup = new Map<string, MASAQEntry[]>();
    
    masaqEntries
      .filter(entry => entry.sura_no === surah && entry.verse_no === verse)
      .forEach(entry => {
        const locationKey = `${entry.sura_no}-${entry.verse_no}-${entry.word_no}`;
        
        if (!masaqLookup.has(locationKey)) {
          masaqLookup.set(locationKey, []);
        }
        masaqLookup.get(locationKey)!.push(entry);
      });
    
    console.log(`🎯 Found ${masaqLookup.size} words in MASAQ for Surah ${surah}, Verse ${verse}`);
    
    // DEBUG: Show all found words and their segments
    console.log('🔍 MASAQ Lookup Debug:');
    for (const [locationKey, entries] of masaqLookup.entries()) {
      console.log(`  Word ${locationKey}: ${entries.length} segments`);
      entries.forEach((entry, idx) => {
        console.log(`    [${idx}] ${entry.segmented_word} (${entry.morph_tag}/${entry.morph_type})`);
      });
    }
    
    // Group segments by Token_Group_ID (MASAQ.id)
    const tokenGroups = new Map<string, {
      displayWord: string;
      segments: { segment: MorphologicalDetails; originalIndex: number }[];
    }>();
    
    // Track current word position for matching
    let currentWordIndex = 1; // MASAQ word_no starts from 1
    let segmentsInCurrentWord = 0;
    
    segments.forEach((segment, segmentIndex) => {
      const locationKey = `${surah}-${verse}-${currentWordIndex}`;
      const masaqEntriesForWord = masaqLookup.get(locationKey) || [];
      
      // Find the MASAQ entry for this specific segment within the word
      const masaqEntry = masaqEntriesForWord[segmentsInCurrentWord];
      
      if (masaqEntry) {
        // Use MASAQ ID + position to create unique token groups (prevents non-contiguous grouping)
        const tokenId = `${masaqEntry.id}_${currentWordIndex}_${segmentsInCurrentWord}`;
        const displayWord = masaqEntry.word;
        
        if (!tokenGroups.has(tokenId)) {
          tokenGroups.set(tokenId, {
            displayWord,
            segments: []
          });
        }
        
        tokenGroups.get(tokenId)!.segments.push({
          segment,
          originalIndex: segmentIndex
        });
        
        console.log(`🏷️  Segment "${segment.text}" → Token Group ${tokenId} (${displayWord}) [Word ${currentWordIndex}, Segment ${segmentsInCurrentWord + 1}]`);
        
        segmentsInCurrentWord++;
        
        // Check if we've processed all segments for this word
        if (segmentsInCurrentWord >= masaqEntriesForWord.length) {
          currentWordIndex++;
          segmentsInCurrentWord = 0;
        }
      } else {
        // Fallback: create individual group for segments without MASAQ data
        const fallbackId = `fallback_${segmentIndex}`;
        tokenGroups.set(fallbackId, {
          displayWord: segment.text,
          segments: [{ segment, originalIndex: segmentIndex }]
        });
        
        console.log(`⚠️  Fallback group for segment "${segment.text}" (no MASAQ data at Word ${currentWordIndex}, Segment ${segmentsInCurrentWord + 1})`);
        
        // Move to next word for fallback segments
        currentWordIndex++;
        segmentsInCurrentWord = 0;
      }
    });
    
    // Convert to TokenGroup array and create index mapping
    const groups: TokenGroup[] = [];
    const indexMapping = new Map<number, number[]>();
    
    Array.from(tokenGroups.entries())
      .sort(([a], [b]) => {
        // Sort by first segment's original index to maintain order
        const aFirstIndex = tokenGroups.get(a)!.segments[0].originalIndex;
        const bFirstIndex = tokenGroups.get(b)!.segments[0].originalIndex;
        return aFirstIndex - bFirstIndex;
      })
      .forEach(([tokenId, groupData], groupIndex) => {
        
        const originalIndices = groupData.segments.map(s => s.originalIndex);
        
        const group: TokenGroup = {
          id: tokenId,
          displayWord: groupData.displayWord,
          segments: groupData.segments.map(s => s.segment),
          originalIndices
        };
        
        groups.push(group);
        indexMapping.set(groupIndex, originalIndices);
        
        console.log(`📦 Created Token Group ${groupIndex}: "${group.displayWord}" (${originalIndices.length} segments)`);
      });
    
    console.log(`✅ Token Group aggregation complete: ${groups.length} groups created`);
    
    return {
      groups,
      indexMapping
    };
  }
  
  /**
   * Maps aggregated group index back to original segment indices
   * Used for quiz selection and interaction logic
   */
  public getOriginalIndicesForGroup(
    groupIndex: number, 
    result: TokenGroupAggregationResult
  ): number[] {
    return result.indexMapping.get(groupIndex) || [];
  }
  
  /**
   * Finds which group contains a specific original segment index
   * Used for reverse mapping during user interactions
   */
  public findGroupForOriginalIndex(
    originalIndex: number,
    result: TokenGroupAggregationResult
  ): number | null {
    for (const [groupIndex, originalIndices] of result.indexMapping.entries()) {
      if (originalIndices.includes(originalIndex)) {
        return groupIndex;
      }
    }
    return null;
  }
}

// Export singleton instance
export const tokenGroupAggregationService = new TokenGroupAggregationService();
