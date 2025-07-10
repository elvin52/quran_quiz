/**
 * Quran Verse Display Component with Visual Word Marking
 * 
 * Displays Quranic verses in their natural order with visual word marking
 * for identifying grammatical constructions (Idafa, Jar-Majroor).
 * 
 * Features:
 * - Visual word marking with underline/highlight
 * - Gold/turquoise color scheme as per requirements
 * - Selection order badges for multi-word constructions
 * - Naskh-style Quranic font
 * - Natural verse display with proper metadata
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MorphologicalDetails } from '@/types/morphology';
import { selectiveAggregationService } from '../../utils/selectiveAggregationService';
import { useMASAQData } from '../../hooks/useMASAQData';

export interface QuranVerseDisplayProps {
  segments: MorphologicalDetails[];
  selectedIndices: number[];
  correctIndices?: number[];
  incorrectIndices?: number[];
  onWordClick: (index: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  className?: string;
  verseMetadata?: {
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    translation: string;
  };
}

export function QuranVerseDisplay({
  segments,
  selectedIndices,
  correctIndices = [],
  incorrectIndices = [],
  onWordClick,
  showFeedback = false,
  disabled = false,
  className,
  verseMetadata
}: QuranVerseDisplayProps) {
  
  // Load MASAQ data for Token Group aggregation
  const { dataset: masaqDataset, isLoading: masaqLoading, error: masaqError } = useMASAQData();
  
  // Process segments through MASAQ Token Group aggregation or fallback
  const processSegments = useCallback((segments: MorphologicalDetails[]) => {
    // Try MASAQ Token_Group_ID grouping first (using word_no as Token_Group_ID)
    if (masaqDataset && masaqDataset.entries.length > 0 && verseMetadata) {
      console.log('🎯 Attempting MASAQ Token_Group_ID grouping for', segments.length, 'segments');
      
      try {
        // Get MASAQ entries for this specific verse
        const verseEntries = masaqDataset.entries.filter(entry => 
          entry.sura_no === verseMetadata.surahId && 
          entry.verse_no === verseMetadata.verseId
        );
        
        if (verseEntries.length === 0) {
          console.log('⚠️  No MASAQ entries found for this verse, using fallback');
          return useFallbackAggregation(segments);
        }
        
        console.log(`📊 Found ${verseEntries.length} MASAQ entries for verse ${verseMetadata.surahId}:${verseMetadata.verseId}`);
        
        // Group MASAQ entries by word_no (acting as Token_Group_ID)
        const tokenGroups = new Map<number, {
          displayWord: string;
          entries: typeof verseEntries;
          segmentIndices: number[];
        }>();
        
        // First pass: create token groups from MASAQ data
        verseEntries.forEach((entry, entryIndex) => {
          const tokenGroupId = parseInt(entry.id); // Use ID as Token_Group_ID (multiple entries share same ID)
          const displayWord = entry.word;          // Use word as Display_Word
          
          if (!tokenGroups.has(tokenGroupId)) {
            tokenGroups.set(tokenGroupId, {
              displayWord,
              entries: [],
              segmentIndices: []
            });
          }
          
          tokenGroups.get(tokenGroupId)!.entries.push(entry);
          console.log(`🏷️  MASAQ Entry ${entryIndex}: "${entry.segmented_word}" → Token Group ${tokenGroupId} (${displayWord})`);
        });
        
        // Second pass: map segments to token groups using sequential matching
        let usedEntryIndices = new Set<number>(); // Track which MASAQ entries have been used
        
        segments.forEach((segment, segmentIndex) => {
          console.log(`🔍 Matching segment ${segmentIndex}: "${segment.text}"`);
          
          // Find matching MASAQ entry for this segment (prioritize unused entries in sequence)
          let matchingEntry = null;
          let matchingEntryIndex = -1;
          
          // First, try to find unused entries
          for (let entryIndex = 0; entryIndex < verseEntries.length; entryIndex++) {
            if (usedEntryIndices.has(entryIndex)) continue; // Skip already used entries
            
            const entry = verseEntries[entryIndex];
            // Normalize Arabic characters and clean diacritics
            const normalizeArabic = (text: string) => {
              return text
                // Normalize Alef variants: ٱ → ا, آ → ا, أ → ا, إ → ا
                .replace(/[ٱآأإ]/g, 'ا')
                // Normalize Teh Marbuta: ة → ه
                .replace(/ة/g, 'ه')
                // Normalize Yeh variants: ي → ى, ئ → ى
                .replace(/[يئ]/g, 'ى')
                // Remove diacritics (comprehensive list)
                .replace(/[ًٌٍَُِّْٰٕٖٜٟٓٔٗ٘ٙٚٛٝٞۖۗۘۙۚۛۜ۝۞ۣ۪ۭ۟۠ۡۢۤۧۨ۫۬]/g, '')
                .trim();
            };
            
            const segmentOriginal = segment.text.trim();
            const entryOriginal = entry.segmented_word.trim();
            const segmentNormalized = normalizeArabic(segmentOriginal);
            const entryNormalized = normalizeArabic(entryOriginal);
            
            console.log(`   📝 Comparing with MASAQ "${entry.segmented_word}"`);
            console.log(`   🧹 Segment: "${segmentOriginal}" → "${segmentNormalized}"`);
            console.log(`   🧹 Entry: "${entryOriginal}" → "${entryNormalized}"`);
            
            // Try multiple matching strategies
            const exactWithDiacritics = segmentOriginal === entryOriginal;
            const exactNormalized = segmentNormalized === entryNormalized;
            const segmentContainsEntry = segmentOriginal.includes(entryOriginal) || segmentNormalized.includes(entryNormalized);
            const entryContainsSegment = entryOriginal.includes(segmentOriginal) || entryNormalized.includes(segmentNormalized);
            
            const rootSegment = segmentNormalized.replace(/^(ال|و|ف|ب|ل|ك)/, '').replace(/(ة|ت|ك|ه|ها|هم|هن|ين|ان|ون)$/, '');
            const rootEntry = entryNormalized.replace(/^(ال|و|ف|ب|ل|ك)/, '').replace(/(ة|ت|ك|ه|ها|هم|هن|ين|ان|ون)$/, '');
            const rootMatch = rootSegment === rootEntry && rootSegment.length > 0;
            
            console.log(`   ✓ Exact w/ diacritics: ${exactWithDiacritics}`);
            console.log(`   ✓ Exact normalized: ${exactNormalized}`);
            console.log(`   ✓ Containment: ${segmentContainsEntry || entryContainsSegment}`);
            console.log(`   ✓ Root match: ${rootMatch} ("${rootSegment}" vs "${rootEntry}")`);
            
            const isMatch = exactWithDiacritics || exactNormalized || segmentContainsEntry || entryContainsSegment || rootMatch;
            console.log(`   🎯 Final result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
            
            if (isMatch) {
              matchingEntry = entry;
              matchingEntryIndex = entryIndex;
              break; // Stop at first unused match
            }
          }
          
          // If no unused entry found, allow reuse (for cases where one MASAQ entry maps to multiple segments)
          if (!matchingEntry) {
            console.log(`🔄 No unused matches found, trying all entries for segment ${segmentIndex}`);
            for (let entryIndex = 0; entryIndex < verseEntries.length; entryIndex++) {
              const entry = verseEntries[entryIndex];
              
              // Normalize Arabic characters and clean diacritics
              const normalizeArabic = (text: string) => {
                return text
                  // Normalize Alef variants: ٱ → ا, آ → ا, أ → ا, إ → ا
                  .replace(/[ٱآأإ]/g, 'ا')
                  // Normalize Teh Marbuta: ة → ه
                  .replace(/ة/g, 'ه')
                  // Normalize Yeh variants: ي → ى, ئ → ى
                  .replace(/[يئ]/g, 'ى')
                  // Remove diacritics (comprehensive list)
                  .replace(/[ًٌٍَُِّْٰٕٖٜٟٓٔٗ٘ٙٚٛٝٞۖۗۘۙۚۛۜ۝۞ۣ۪ۭ۟۠ۡۢۤۧۨ۫۬]/g, '')
                  .trim();
              };
              
              const segmentOriginal = segment.text.trim();
              const entryOriginal = entry.segmented_word.trim();
              const segmentNormalized = normalizeArabic(segmentOriginal);
              const entryNormalized = normalizeArabic(entryOriginal);
              
              // Try multiple matching strategies
              const exactWithDiacritics = segmentOriginal === entryOriginal;
              const exactNormalized = segmentNormalized === entryNormalized;
              const segmentContainsEntry = segmentOriginal.includes(entryOriginal) || segmentNormalized.includes(entryNormalized);
              const entryContainsSegment = entryOriginal.includes(segmentOriginal) || entryNormalized.includes(segmentNormalized);
              
              const rootSegment = segmentNormalized.replace(/^(ال|و|ف|ب|ل|ك)/, '').replace(/(ة|ت|ك|ه|ها|هم|هن|ين|ان|ون)$/, '');
              const rootEntry = entryNormalized.replace(/^(ال|و|ف|ب|ل|ك)/, '').replace(/(ة|ت|ك|ه|ها|هم|هن|ين|ان|ون)$/, '');
              const rootMatch = rootSegment === rootEntry && rootSegment.length > 0;
              
              const isMatch = exactWithDiacritics || exactNormalized || segmentContainsEntry || entryContainsSegment || rootMatch;
              
              if (isMatch) {
                matchingEntry = entry;
                matchingEntryIndex = entryIndex;
                break;
              }
            }
          }
          
          if (matchingEntry) {
            // Mark this entry as used (for sequential matching)
            usedEntryIndices.add(matchingEntryIndex);
            
            const tokenGroupId = parseInt(matchingEntry.id);
            console.log(`🎯 Found match for segment ${segmentIndex}: "${segment.text}" → MASAQ "${matchingEntry.segmented_word}" (Token Group ${tokenGroupId}, entry index ${matchingEntryIndex})`);
            
            const group = tokenGroups.get(tokenGroupId);
            if (group) {
              group.segmentIndices.push(segmentIndex);
              console.log(`🔗 Segment ${segmentIndex} "${segment.text}" → Token Group ${tokenGroupId} (now has ${group.segmentIndices.length} segments)`);
            } else {
              console.log(`❌ Token Group ${tokenGroupId} not found in tokenGroups map! Available groups: [${Array.from(tokenGroups.keys()).join(', ')}]`);
            }
          } else {
            console.log(`⚠️  No MASAQ match found for segment ${segmentIndex}: "${segment.text}"`);
          }
        });
        
        // Third pass: create display units from token groups
        const processed: MorphologicalDetails[] = [];
        const sortedTokenGroupIds = Array.from(tokenGroups.keys()).sort((a, b) => a - b);
        
        sortedTokenGroupIds.forEach(tokenGroupId => {
          const group = tokenGroups.get(tokenGroupId)!;
          
          if (group.segmentIndices.length > 0) {
            // Get the first segment as base (preserving original properties)
            const baseSegmentIndex = Math.min(...group.segmentIndices);
            const baseSegment = segments[baseSegmentIndex];
            
            // Create combined segment with Display_Word
            const combinedSegment: MorphologicalDetails = {
              ...baseSegment,
              id: `token_group_${tokenGroupId}`,
              text: group.displayWord, // Use MASAQ Display_Word
              originalIndices: group.segmentIndices // Track all original segment indices
            };
            
            processed.push(combinedSegment);
            console.log(`📦 Token Group ${tokenGroupId}: "${group.displayWord}" (${group.segmentIndices.length} segments: [${group.segmentIndices.join(', ')}])`);
          }
        });
        
        if (processed.length > 0) {
          console.log('✅ MASAQ Token_Group_ID grouping successful:', processed.length, 'display units');
          processed.forEach((p, i) => {
            console.log(`📝 [${i}]: "${p.text}" (original indices: [${p.originalIndices?.join(', ')}])`);
          });
          return processed;
        }
        
      } catch (error) {
        console.error('❌ MASAQ Token_Group_ID grouping failed:', error);
      }
    }
    
    // Fallback to selective aggregation
    return useFallbackAggregation(segments);
  }, [masaqDataset, verseMetadata]);
  
  // Helper function for fallback aggregation
  const useFallbackAggregation = useCallback((segments: MorphologicalDetails[]) => {
    console.log('🔄 Fallback: Using selectiveAggregationService for', segments.length, 'segments');
    
    const aggregated = selectiveAggregationService.aggregateSegments(segments);
    
    const processed = aggregated.map((aggSeg, index) => ({
      ...aggSeg.originalSegments[0], // Use first segment as base
      id: aggSeg.id,
      text: aggSeg.text,
      morphology: aggSeg.morphology,
      type: aggSeg.type,
      originalIndices: aggSeg.originalSegments.map((_, idx) => 
        segments.findIndex(s => s.id === aggSeg.originalSegments[idx].id)
      ).filter(idx => idx !== -1)
    }));

    console.log('✅ SelectiveAggregation processed into', processed.length, 'display units');
    processed.forEach((p, i) => {
      console.log(`📝 [${i}]: "${p.text}" (original indices: [${p.originalIndices?.join(', ')}])`);
    });
    
    return processed;
  }, []);

  // Create mapping from processed indices to original segment indices
  const getOriginalIndicesForProcessed = (processedIndex: number): number[] => {
    const processedSegment = processSegments(segments)[processedIndex];
    
    // Use the precisely tracked original indices
    return processedSegment.originalIndices || [processedIndex];
  };

  // Check if a processed segment is selected (any of its original segments are selected)
  const isProcessedSegmentSelected = (processedIndex: number): boolean => {
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    return originalIndices.some(idx => selectedIndices.includes(idx));
  };

  // Check if a processed segment is correct/incorrect
  const isProcessedSegmentCorrect = (processedIndex: number): boolean => {
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    return originalIndices.some(idx => correctIndices.includes(idx));
  };

  const isProcessedSegmentIncorrect = (processedIndex: number): boolean => {
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    return originalIndices.some(idx => incorrectIndices.includes(idx));
  };

  // Get selection order for processed segment
  const getProcessedSelectionOrder = (processedIndex: number): number => {
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    const selectedOriginalIndices = originalIndices.filter(idx => selectedIndices.includes(idx));
    if (selectedOriginalIndices.length === 0) return 0;
    
    // Return the order of the first selected segment in this processed unit
    const firstSelectedIndex = Math.min(...selectedOriginalIndices);
    return selectedIndices.indexOf(firstSelectedIndex) + 1;
  };

  /**
   * Get visual styling for word marking based on state
   */
  const getWordMarkingStyle = (processedIndex: number): React.CSSProperties => {
    const isSelected = isProcessedSegmentSelected(processedIndex);
    const isCorrect = isProcessedSegmentCorrect(processedIndex);
    const isIncorrect = isProcessedSegmentIncorrect(processedIndex);
    const selectionOrder = getProcessedSelectionOrder(processedIndex);

    // Base styles for all words - 3x larger Arabic font
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      padding: '8px 4px',
      margin: '0 4px',
      cursor: disabled || showFeedback ? 'default' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      fontSize: '4.5rem', // 3x larger than original 1.5rem
      lineHeight: '6.6rem' // Proportionally scaled
    };

    // Feedback mode - show correct/incorrect highlighting
    if (showFeedback) {
      if (isCorrect) {
        return {
          ...baseStyle,
          background: 'linear-gradient(transparent 60%, rgba(34, 197, 94, 0.3) 60%)',
          borderBottom: '3px solid #10b981',
          color: '#065f46'
        };
      } else if (isIncorrect) {
        return {
          ...baseStyle,
          background: 'linear-gradient(transparent 60%, rgba(239, 68, 68, 0.3) 60%)',
          borderBottom: '3px solid #ef4444',
          color: '#7f1d1d'
        };
      }
    }
    // Selection mode - show user selections with underline marking
    else if (isSelected) {
      // Alternating gold/turquoise colors for different constructions
      const isGold = selectionOrder % 2 === 1;
      return {
        ...baseStyle,
        background: isGold 
          ? 'linear-gradient(transparent 60%, rgba(255, 215, 0, 0.2) 60%)'
          : 'linear-gradient(transparent 60%, rgba(20, 184, 166, 0.2) 60%)',
        borderBottom: isGold 
          ? '3px solid #FFD700' 
          : '3px solid #14b8a6',
        color: isGold ? '#B45309' : '#0f766e',
        fontWeight: '600'
      };
    }

    // Default state - hover will be handled by CSS class
    return baseStyle;
  };

  /**
   * Get selection order badge for multi-word constructions
   */
  const getSelectionBadge = (processedIndex: number) => {
    const selectionOrder = getProcessedSelectionOrder(processedIndex);
    if (selectionOrder === 0 || showFeedback) return null;

    const isGold = selectionOrder % 2 === 1;
    return (
      <Badge 
        className={cn(
          'absolute -top-2 -right-2 h-5 w-5 p-0 text-xs rounded-full',
          isGold 
            ? 'bg-yellow-500 text-yellow-900 border-yellow-600' 
            : 'bg-teal-500 text-teal-900 border-teal-600'
        )}
      >
        {selectionOrder}
      </Badge>
    );
  };

  /**
   * Handle word click with proper event handling
   * When user clicks an aggregated segment, select all its original segments
   */
  const handleWordClick = (processedIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (disabled || showFeedback) return;
    
    // Get all original indices for this processed segment
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    
    // FIXED: Select ALL original segments that make up this aggregated word
    // For example, "لِللَّهِ" = [prefix "لِ", root "لَّهِ"] should select both indices
    console.log(`🎯 Word click: aggregated segment [${processedIndex}] maps to original indices:`, originalIndices);
    
    originalIndices.forEach(originalIndex => {
      onWordClick(originalIndex);
    });
  };

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg p-6 space-y-4', className)}>
      {/* Verse Metadata */}
      {verseMetadata && (
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-arabic text-base">{verseMetadata.surahNameArabic}</span>
            <span>•</span>
            <span>{verseMetadata.surahName}</span>
            <span>•</span>
            <span>Verse {verseMetadata.verseId}</span>
          </div>
        </div>
      )}

      {/* Arabic Verse with Linguistically-Aware Aggregation */}
      <div className="text-center" dir="rtl">
        <div 
          className="font-arabic leading-loose text-gray-800 dark:text-gray-200"
          style={{ 
            fontFamily: 'Noto Naskh Arabic, Arabic Traditional, serif',
            fontSize: '5.25rem', // 3x larger than original 1.75rem
            lineHeight: '9rem' // Proportionally scaled for better readability
          }}
        >
          {processSegments(segments).map((aggregatedSegment, index) => (
            <React.Fragment key={aggregatedSegment.id}>
              <span
                style={getWordMarkingStyle(index)}
                onClick={(e) => handleWordClick(index, e)}
                className="relative"
                title={showFeedback ? 
                  `${aggregatedSegment.text} (${aggregatedSegment.morphology})` :
                  `${isProcessedSegmentSelected(index) ? 'Deselect' : 'Select'}: ${aggregatedSegment.text}`
                }
              >
                {aggregatedSegment.text}
                {getSelectionBadge(index)}
              </span>
              {/* Add space between words (but not after the last word) */}
              {index < processSegments(segments).length - 1 && ' '}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Translation */}
      {verseMetadata?.translation && (
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm italic border-t border-gray-200 dark:border-gray-700 pt-4">
          {verseMetadata.translation}
        </div>
      )}

      {/* Selection Status */}
      {!showFeedback && !disabled && selectedIndices.length > 0 && (
        <div className="text-center text-sm">
          <div className="flex justify-center items-center gap-2 text-blue-600 dark:text-blue-400">
            <span>{selectedIndices.length} word{selectedIndices.length !== 1 ? 's' : ''} selected</span>
            <div className="flex gap-1">
              {selectedIndices.map((idx, order) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    (order + 1) % 2 === 1 
                      ? 'border-yellow-500 text-yellow-700' 
                      : 'border-teal-500 text-teal-700'
                  )}
                >
                  {segments[idx].text}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Summary */}
      {showFeedback && (correctIndices.length > 0 || incorrectIndices.length > 0) && (
        <div className="text-center text-sm space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          {correctIndices.length > 0 && (
            <div className="text-green-600 dark:text-green-400 flex justify-center items-center gap-2">
              <span>✓ Correct:</span>
              <div className="flex gap-1">
                {correctIndices.map(i => (
                  <Badge key={i} className="bg-green-100 text-green-800 border-green-300">
                    {segments[i].text}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {incorrectIndices.length > 0 && (
            <div className="text-red-600 dark:text-red-400 flex justify-center items-center gap-2">
              <span>✗ Incorrect:</span>
              <div className="flex gap-1">
                {incorrectIndices.map(i => (
                  <Badge key={i} className="bg-red-100 text-red-800 border-red-300">
                    {segments[i].text}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!showFeedback && !disabled && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Click on Arabic words to mark grammatical constructions with visual underlines
        </div>
      )}
    </div>
  );
}
