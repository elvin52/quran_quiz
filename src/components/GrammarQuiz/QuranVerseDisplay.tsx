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

import React from 'react';
import { cn } from '@/lib/utils';
import { MorphologicalDetails } from '@/types/morphology';
import { Badge } from '@/components/ui/badge';

interface QuranVerseDisplayProps {
  segments: MorphologicalDetails[];
  selectedIndices: number[];
  correctIndices?: number[];
  incorrectIndices?: number[];
  onWordClick: (index: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  className?: string;
  // Quranic metadata
  verseMetadata?: {
    surahName: string;
    surahNameArabic: string;
    verseId: number;
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
  
  /**
   * Get visual styling for word marking based on state
   */
  const getWordMarkingStyle = (index: number): React.CSSProperties => {
    const isSelected = selectedIndices.includes(index);
    const isCorrect = correctIndices.includes(index);
    const isIncorrect = incorrectIndices.includes(index);
    const selectionOrder = selectedIndices.indexOf(index) + 1;

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
  const getSelectionBadge = (index: number) => {
    const selectionOrder = selectedIndices.indexOf(index) + 1;
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
   */
  const handleWordClick = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (disabled || showFeedback) return;
    onWordClick(index);
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

      {/* Arabic Verse with Visual Word Marking */}
      <div className="text-center" dir="rtl">
        <div 
          className="font-arabic leading-loose text-gray-800 dark:text-gray-200"
          style={{ 
            fontFamily: 'Noto Naskh Arabic, Arabic Traditional, serif',
            fontSize: '5.25rem', // 3x larger than original 1.75rem
            lineHeight: '9rem' // Proportionally scaled for better readability
          }}
        >
          {segments.map((segment, index) => (
            <span
              key={segment.id}
              style={getWordMarkingStyle(index)}
              onClick={(e) => handleWordClick(index, e)}
              className="relative"
              title={showFeedback ? 
                `${segment.text} (${segment.morphology})` :
                `${selectedIndices.includes(index) ? 'Deselect' : 'Select'}: ${segment.text}`
              }
            >
              {segment.text}
              {getSelectionBadge(index)}
            </span>
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
