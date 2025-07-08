/**
 * Clickable Quran Word Component
 * 
 * Interactive Arabic word component for the Quran Grammar Quiz - Underline Mode.
 * Handles visual selection with underline/highlight effects and selection order.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { WordSelection } from '@/types/quranGrammarQuiz';

interface ClickableQuranWordProps {
  word: WordSelection;
  onWordClick: (wordId: string) => void;
  isDisabled?: boolean;
  showSelectionOrder?: boolean;
  className?: string;
}

export const ClickableQuranWord: React.FC<ClickableQuranWordProps> = ({
  word,
  onWordClick,
  isDisabled = false,
  showSelectionOrder = true,
  className
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onWordClick(word.wordId);
    }
  };

  const getSelectionStyles = () => {
    if (!word.isSelected) return '';
    
    // Different colors for different selection orders to help users track their selections
    const colorClasses = [
      'border-b-4 border-amber-400 bg-amber-50', // Gold/yellow for first selection
      'border-b-4 border-emerald-400 bg-emerald-50', // Green for second selection
      'border-b-4 border-blue-400 bg-blue-50', // Blue for third selection
      'border-b-4 border-purple-400 bg-purple-50', // Purple for fourth selection
      'border-b-4 border-rose-400 bg-rose-50', // Rose for fifth selection
    ];
    
    return colorClasses[word.selectionOrder % colorClasses.length] || 'border-b-4 border-gray-400 bg-gray-50';
  };

  const getHoverStyles = () => {
    if (isDisabled || word.isSelected) return '';
    return 'hover:bg-gray-100 hover:border-b-2 hover:border-gray-300';
  };

  return (
    <span
      onClick={handleClick}
      className={cn(
        // Base styles
        'inline-block px-1 py-1 mx-1 my-0.5',
        'cursor-pointer select-none transition-all duration-200',
        'rounded-sm relative',
        
        // Font styles for Arabic text
        'font-arabic text-2xl leading-relaxed',
        'font-medium tracking-wide',
        
        // Selection styles
        getSelectionStyles(),
        
        // Hover styles
        getHoverStyles(),
        
        // Disabled styles
        isDisabled && 'cursor-default opacity-50',
        
        // Custom className
        className
      )}
      dir="rtl"
      lang="ar"
      title={`Word: ${word.text}${word.isSelected ? ` (Selection #${word.selectionOrder + 1})` : ''}`}
    >
      {word.text}
      
      {/* Selection order indicator */}
      {word.isSelected && showSelectionOrder && (
        <span
          className={cn(
            'absolute -top-2 -right-1',
            'w-5 h-5 rounded-full',
            'flex items-center justify-center',
            'text-xs font-bold text-white',
            'bg-gray-800 border-2 border-white',
            'shadow-sm'
          )}
        >
          {word.selectionOrder + 1}
        </span>
      )}
    </span>
  );
};

/**
 * Quran Verse Display Component
 * 
 * Displays a complete verse with clickable words for grammar marking.
 */

interface QuranVerseDisplayProps {
  arabicText: string;
  words: WordSelection[];
  onWordClick: (wordId: string) => void;
  isDisabled?: boolean;
  showSelectionOrder?: boolean;
  showTranslation?: boolean;
  translation?: string;
  verseReference?: {
    surahName: string;
    surahNameArabic: string;
    verseId: number;
  };
  className?: string;
}

export const QuranVerseDisplay: React.FC<QuranVerseDisplayProps> = ({
  arabicText,
  words,
  onWordClick,
  isDisabled = false,
  showSelectionOrder = true,
  showTranslation = false,
  translation,
  verseReference,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Verse Reference */}
      {verseReference && (
        <div className="text-center text-sm text-gray-600 mb-4">
          <span className="font-arabic text-base">{verseReference.surahNameArabic}</span>
          <span className="mx-2">•</span>
          <span>{verseReference.surahName}</span>
          <span className="mx-2">•</span>
          <span>Verse {verseReference.verseId}</span>
        </div>
      )}

      {/* Arabic Text with Clickable Words */}
      <div 
        className={cn(
          'text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100',
          'border border-slate-200 rounded-lg shadow-sm',
          'min-h-[120px] flex items-center justify-center'
        )}
        dir="rtl"
        lang="ar"
      >
        <div className="leading-relaxed">
          {words.map((word) => (
            <ClickableQuranWord
              key={word.wordId}
              word={word}
              onWordClick={onWordClick}
              isDisabled={isDisabled}
              showSelectionOrder={showSelectionOrder}
            />
          ))}
        </div>
      </div>

      {/* Translation */}
      {showTranslation && translation && (
        <div 
          className={cn(
            'text-center p-4 bg-blue-50 border border-blue-200 rounded-lg',
            'text-gray-700 italic leading-relaxed'
          )}
        >
          {translation}
        </div>
      )}

      {/* Selection Guide */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Click on Arabic words to mark them. Numbers show selection order.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-amber-400 rounded"></div>
            <span>1st</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-emerald-400 rounded"></div>
            <span>2nd</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-blue-400 rounded"></div>
            <span>3rd</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-purple-400 rounded"></div>
            <span>4th+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
