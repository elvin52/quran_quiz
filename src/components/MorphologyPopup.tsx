
import { MorphologicalDetails, PopupPosition } from '@/types/morphology';
import { EnhancedMorphologicalDetails } from '@/types/masaq';
import { X, Link, Database, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MorphologyPopupProps {
  segment: MorphologicalDetails;
  position: PopupPosition;
  isOpen: boolean;
  onClose: () => void;
  onGrammarTermClick: (term: string, element: HTMLElement) => void;
  onShowRelationships?: (relationships: any[], element: HTMLElement) => void;
}

const getSegmentTypeColor = (morphology: string, type: string) => {
  if (type === 'prefix') return 'text-[#FFA500]';
  if (type === 'suffix') return 'text-[#FF69B4]';
  
  switch (morphology) {
    case 'noun': return 'text-[#FFD700]';
    case 'verb': return 'text-[#6EC1E4]';
    case 'particle': return 'text-[#9ACD32]';
    case 'adjective': return 'text-[#FF6347]';
    default: return 'text-[#f9f9f9]';
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 0.9) return 'text-green-400';
  if (score >= 0.7) return 'text-yellow-400';
  return 'text-red-400';
};

export const MorphologyPopup = ({ 
  segment, 
  position, 
  isOpen, 
  onClose, 
  onGrammarTermClick,
  onShowRelationships
}: MorphologyPopupProps) => {
  if (!isOpen) return null;

  const enhancedSegment = segment as EnhancedMorphologicalDetails;
  const hasMASOQData = !!enhancedSegment.masaqData;

  const handleGrammarClick = (term: string, event: React.MouseEvent<HTMLButtonElement>) => {
    onGrammarTermClick(term, event.currentTarget);
  };

  const handleRelationshipsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (segment.relationships && segment.relationships.length > 0 && onShowRelationships) {
      onShowRelationships(segment.relationships, event.currentTarget);
    }
  };

  return (
    <div
      className="fixed z-40 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-2xl p-4 w-80 max-h-[500px] overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header with MASAQ indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span 
            className={cn(
              "text-xl font-arabic",
              getSegmentTypeColor(segment.morphology, segment.type)
            )}
          >
            {segment.text}
          </span>
          <span className="text-sm text-gray-400 capitalize">
            {segment.type} {segment.morphology}
          </span>
          {hasMASOQData && (
            <Database className="h-4 w-4 text-[#9ACD32]" aria-label="Enhanced with MASAQ data" />
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* MASAQ Data Section */}
      {hasMASOQData && enhancedSegment.masaqData && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-[#9ACD32]/30">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-[#9ACD32]" />
            <span className="text-sm font-semibold text-[#9ACD32]">MASAQ Enhanced Data</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {enhancedSegment.masaqData.lemma && (
              <div>
                <span className="text-gray-400">Lemma:</span>
                <span className="ml-1 text-white font-arabic">{enhancedSegment.masaqData.lemma}</span>
              </div>
            )}
            {enhancedSegment.masaqData.root && (
              <div>
                <span className="text-gray-400">Root:</span>
                <span className="ml-1 text-[#FFD700] font-arabic">{enhancedSegment.masaqData.root}</span>
              </div>
            )}
            {enhancedSegment.masaqData.pos && (
              <div>
                <span className="text-gray-400">POS:</span>
                <span className="ml-1 text-[#6EC1E4]">{enhancedSegment.masaqData.pos}</span>
              </div>
            )}
            {enhancedSegment.morphologicalPattern && (
              <div>
                <span className="text-gray-400">Pattern:</span>
                <span className="ml-1 text-[#FF6347] font-arabic">{enhancedSegment.morphologicalPattern}</span>
              </div>
            )}
          </div>

          {/* Confidence Scores */}
          {enhancedSegment.confidenceScores && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-400">Analysis Confidence:</span>
              </div>
              <div className="flex space-x-3 text-xs">
                <span className={getConfidenceColor(enhancedSegment.confidenceScores.morphology)}>
                  Morph: {Math.round(enhancedSegment.confidenceScores.morphology * 100)}%
                </span>
                <span className={getConfidenceColor(enhancedSegment.confidenceScores.syntax)}>
                  Syntax: {Math.round(enhancedSegment.confidenceScores.syntax * 100)}%
                </span>
                <span className={getConfidenceColor(enhancedSegment.confidenceScores.semantics)}>
                  Semantic: {Math.round(enhancedSegment.confidenceScores.semantics * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-2 mb-4">
        {segment.meaning && (
          <div>
            <span className="text-gray-400 text-sm">Meaning:</span>
            <p className="text-white">{segment.meaning}</p>
          </div>
        )}
        
        {(segment.rootLetters || enhancedSegment.masaqData?.root) && (
          <div>
            <span className="text-gray-400 text-sm">Root:</span>
            <span className="text-[#FFD700] font-arabic text-lg ml-2">
              {segment.rootLetters || enhancedSegment.masaqData?.root}
            </span>
          </div>
        )}
        
        {(segment.pattern || enhancedSegment.morphologicalPattern) && (
          <div>
            <span className="text-gray-400 text-sm">Pattern:</span>
            <span className="text-[#6EC1E4] font-arabic ml-2">
              {segment.pattern || enhancedSegment.morphologicalPattern}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Grammatical Properties */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300 border-b border-gray-600 pb-1">
          Grammatical Properties
        </h4>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {segment.case && (
            <div>
              <span className="text-gray-400">Case:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.case!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.case}
              </button>
            </div>
          )}
          
          {segment.number && (
            <div>
              <span className="text-gray-400">Number:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.number!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.number}
              </button>
            </div>
          )}
          
          {segment.gender && (
            <div>
              <span className="text-gray-400">Gender:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.gender!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.gender}
              </button>
            </div>
          )}
          
          {segment.person && (
            <div>
              <span className="text-gray-400">Person:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.person!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.person}
              </button>
            </div>
          )}
          
          {segment.tense && (
            <div>
              <span className="text-gray-400">Tense:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.tense!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.tense}
              </button>
            </div>
          )}
          
          {segment.voice && (
            <div>
              <span className="text-gray-400">Voice:</span>
              <button
                onClick={(e) => handleGrammarClick(segment.voice!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {segment.voice}
              </button>
            </div>
          )}

          {/* Enhanced MASAQ properties */}
          {enhancedSegment.aspect && (
            <div>
              <span className="text-gray-400">Aspect:</span>
              <button
                onClick={(e) => handleGrammarClick(enhancedSegment.aspect!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {enhancedSegment.aspect}
              </button>
            </div>
          )}

          {enhancedSegment.definite && (
            <div>
              <span className="text-gray-400">Definite:</span>
              <button
                onClick={(e) => handleGrammarClick(enhancedSegment.definite!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {enhancedSegment.definite}
              </button>
            </div>
          )}

          {enhancedSegment.state && (
            <div>
              <span className="text-gray-400">State:</span>
              <button
                onClick={(e) => handleGrammarClick(enhancedSegment.state!, e)}
                className="ml-1 text-[#9ACD32] hover:underline capitalize"
              >
                {enhancedSegment.state}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Grammar Role and Syntactic Information */}
      {(segment.grammaticalRole || enhancedSegment.syntacticRole) && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <span className="text-gray-400 text-sm">Grammatical Role:</span>
          <button
            onClick={(e) => handleGrammarClick(segment.grammaticalRole || enhancedSegment.syntacticRole!, e)}
            className="ml-1 text-[#FF6347] hover:underline"
          >
            {segment.grammaticalRole || enhancedSegment.syntacticRole}
          </button>
        </div>
      )}

      {/* Semantic Information */}
      {(enhancedSegment.namedEntity || enhancedSegment.concept || enhancedSegment.semanticField) && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Semantic Information</h4>
          <div className="space-y-1 text-sm">
            {enhancedSegment.namedEntity && (
              <div>
                <span className="text-gray-400">Named Entity:</span>
                <span className="ml-1 text-[#FF69B4]">{enhancedSegment.namedEntity}</span>
              </div>
            )}
            {enhancedSegment.concept && (
              <div>
                <span className="text-gray-400">Concept:</span>
                <span className="ml-1 text-[#6EC1E4]">{enhancedSegment.concept}</span>
              </div>
            )}
            {enhancedSegment.semanticField && (
              <div>
                <span className="text-gray-400">Semantic Field:</span>
                <span className="ml-1 text-[#9ACD32]">{enhancedSegment.semanticField}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relationships Section */}
      {segment.relationships && segment.relationships.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <button
            onClick={handleRelationshipsClick}
            className="flex items-center space-x-2 w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Link className="h-4 w-4 text-[#9ACD32]" />
            <span className="text-sm text-[#9ACD32]">
              View Grammatical Relations ({segment.relationships.length})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
