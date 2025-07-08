/**
 * Clickable Arabic Fragment Component
 * 
 * Renders Arabic text with individual clickable words for grammar construction selection.
 * Follows existing UI patterns from PronounQuizPage and maintains design consistency.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { MorphologicalDetails } from '@/types/morphology';

interface ClickableFragmentProps {
  segments: MorphologicalDetails[];
  selectedIndices: number[];
  correctIndices?: number[];
  incorrectIndices?: number[];
  onWordClick: (index: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ClickableFragment({
  segments,
  selectedIndices,
  correctIndices = [],
  incorrectIndices = [],
  onWordClick,
  showFeedback = false,
  disabled = false,
  className
}: ClickableFragmentProps) {
  
  const getWordClassName = (index: number): string => {
    const baseClasses = [
      'inline-block px-3 py-2 m-1 rounded-md cursor-pointer transition-all duration-200',
      'border-2 text-lg leading-relaxed',
      'hover:shadow-md select-none',
      'font-arabic' // Ensure proper Arabic font rendering
    ];

    if (disabled) {
      baseClasses.push('cursor-not-allowed opacity-60');
    }

    // Feedback mode - show correct/incorrect highlighting
    if (showFeedback) {
      if (correctIndices.includes(index)) {
        baseClasses.push(
          'bg-green-100 border-green-400 text-green-800',
          'dark:bg-green-900/30 dark:border-green-600 dark:text-green-200'
        );
      } else if (incorrectIndices.includes(index)) {
        baseClasses.push(
          'bg-red-100 border-red-400 text-red-800',
          'dark:bg-red-900/30 dark:border-red-600 dark:text-red-200'
        );
      } else {
        baseClasses.push(
          'bg-gray-50 border-gray-200 text-gray-700',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
        );
      }
    }
    // Selection mode - show user selections
    else {
      if (selectedIndices.includes(index)) {
        baseClasses.push(
          'bg-blue-100 border-blue-400 text-blue-800 shadow-md',
          'dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200'
        );
      } else {
        baseClasses.push(
          'bg-white border-gray-200 text-gray-800',
          'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200',
          'hover:bg-blue-50 hover:border-blue-300',
          'dark:hover:bg-gray-600 dark:hover:border-gray-500'
        );
      }
    }

    return cn(...baseClasses);
  };

  const handleWordClick = (index: number) => {
    if (disabled || showFeedback) return;
    onWordClick(index);
  };

  return (
    <div className={cn('text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg', className)}>
      <div className="flex flex-wrap justify-center items-center gap-1 leading-relaxed">
        {segments.map((segment, index) => (
          <button
            key={segment.id}
            onClick={() => handleWordClick(index)}
            className={getWordClassName(index)}
            disabled={disabled}
            type="button"
            title={showFeedback ? 
              `${segment.text} (${segment.morphology}, ${segment.case || 'unspecified case'})` :
              `Click to ${selectedIndices.includes(index) ? 'deselect' : 'select'}: ${segment.text}`
            }
          >
            <span className="text-2xl font-medium" dir="rtl">
              {segment.text}
            </span>
            {showFeedback && (
              <div className="text-xs mt-1 opacity-75">
                {segment.morphology}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selection Instructions */}
      {!showFeedback && !disabled && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Click words to select them for grammatical analysis</p>
          {selectedIndices.length > 0 && (
            <p className="mt-1 text-blue-600 dark:text-blue-400">
              {selectedIndices.length} word{selectedIndices.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* Feedback Summary */}
      {showFeedback && (correctIndices.length > 0 || incorrectIndices.length > 0) && (
        <div className="mt-4 text-sm space-y-1">
          {correctIndices.length > 0 && (
            <p className="text-green-600 dark:text-green-400">
              ✓ Correct: {correctIndices.map(i => segments[i].text).join(' + ')}
            </p>
          )}
          {incorrectIndices.length > 0 && (
            <p className="text-red-600 dark:text-red-400">
              ✗ Incorrect: {incorrectIndices.map(i => segments[i].text).join(' + ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
