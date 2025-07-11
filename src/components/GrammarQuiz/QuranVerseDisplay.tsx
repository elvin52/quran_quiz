/**
 * Quran Verse Display Component with Visual Word Marking
 * 
 * Displays Quranic verses in their natural order with visual word marking
 * for identifying grammatical constructions and individual component roles.
 * 
 * Features:
 * - Visual word marking with underline/highlight
 * - Component role color-coding for granular selection
 * - Selection order badges for multi-word constructions
 * - Naskh-style Quranic font
 * - Natural verse display with proper metadata
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MorphologicalDetails } from '@/types/morphology';
import { ComponentRole } from '@/types/grammarQuiz';
import { selectiveAggregationService } from '../../utils/selectiveAggregationService';

// Component role color mapping
const ROLE_COLORS = {
  'mudaf': { bg: 'rgba(251, 191, 36, 0.2)', border: '#f59e0b', text: '#92400e' },
  'mudaf-ilayh': { bg: 'rgba(249, 115, 22, 0.2)', border: '#ea580c', text: '#9a3412' },
  'jar': { bg: 'rgba(20, 184, 166, 0.2)', border: '#14b8a6', text: '#0f766e' },
  'majroor': { bg: 'rgba(6, 182, 212, 0.2)', border: '#0891b2', text: '#155e75' },
  'fil': { bg: 'rgba(147, 51, 234, 0.2)', border: '#9333ea', text: '#6b21a8' },
  'fail': { bg: 'rgba(79, 70, 229, 0.2)', border: '#4f46e5', text: '#3730a3' },
  'harf-nasb': { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#065f46' },
  'ismuha': { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#14532d' }
};

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
  // Granular component selection props
  wordRoles?: Record<number, ComponentRole>;  // wordIndex -> assigned role
  showRoleIndicators?: boolean;               // Show role badges/colors
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
  verseMetadata,
  wordRoles = {},
  showRoleIndicators = false
}: QuranVerseDisplayProps) {
  
  // Process segments through aggregation if needed
  const processSegments = useCallback((segments: MorphologicalDetails[]) => {
    // For now, use fallback aggregation to maintain stability
    const aggregated = selectiveAggregationService.aggregateSegments(segments);
    
    return aggregated.map((aggSeg, index) => ({
      ...aggSeg.originalSegments[0], // Use first segment as base
      id: aggSeg.id,
      text: aggSeg.text,
      morphology: aggSeg.morphology,
      type: aggSeg.type,
      originalIndices: aggSeg.originalSegments.map((_, idx) => 
        segments.findIndex(s => s.id === aggSeg.originalSegments[idx].id)
      ).filter(idx => idx !== -1)
    }));
  }, []);

  // Get original indices for processed segment
  const getOriginalIndicesForProcessed = (processedIndex: number): number[] => {
    const processedSegment = processSegments(segments)[processedIndex];
    return (processedSegment as any).originalIndices || [processedIndex];
  };

  // Check if a processed segment is selected
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
    
    const firstSelectedIndex = Math.min(...selectedOriginalIndices);
    return selectedIndices.indexOf(firstSelectedIndex) + 1;
  };

  // Get visual styling for word marking based on state
  const getWordMarkingStyle = (processedIndex: number): React.CSSProperties => {
    const isSelected = isProcessedSegmentSelected(processedIndex);
    const isCorrect = isProcessedSegmentCorrect(processedIndex);
    const isIncorrect = isProcessedSegmentIncorrect(processedIndex);
    const selectionOrder = getProcessedSelectionOrder(processedIndex);
    
    // Get assigned role for component styling
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    const assignedRole = originalIndices.find(idx => wordRoles[idx]) ? wordRoles[originalIndices.find(idx => wordRoles[idx])!] : null;

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
    
    // Component role mode - show role-specific colors
    if (showRoleIndicators && assignedRole && ROLE_COLORS[assignedRole]) {
      const roleColors = ROLE_COLORS[assignedRole];
      return {
        ...baseStyle,
        background: `linear-gradient(transparent 60%, ${roleColors.bg} 60%)`,
        borderBottom: `3px solid ${roleColors.border}`,
        color: roleColors.text,
        fontWeight: '600'
      };
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

    // Default state
    return baseStyle;
  };

  // Get selection order badge for multi-word constructions
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

  // Handle word click with proper event handling
  const handleWordClick = (processedIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (disabled || showFeedback) return;
    
    // Get all original indices for this processed segment
    const originalIndices = getOriginalIndicesForProcessed(processedIndex);
    
    // Select ALL original segments that make up this aggregated word
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

      {/* Arabic Verse */}
      <div className="text-center" dir="rtl">
        <div 
          className="font-arabic leading-loose text-gray-800 dark:text-gray-200"
          style={{ 
            fontFamily: 'Noto Naskh Arabic, Arabic Traditional, serif',
            fontSize: '5.25rem',
            lineHeight: '9rem'
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
    </div>
  );
}
