
import { GrammarExplanation, PopupPosition } from '@/types/morphology';
import { X } from 'lucide-react';

interface GrammarPopupProps {
  explanation: GrammarExplanation | null;
  position: PopupPosition;
  isOpen: boolean;
  onClose: () => void;
  onRelatedTermClick: (term: string, element: HTMLElement) => void;
}

export const GrammarPopup = ({ 
  explanation, 
  position, 
  isOpen, 
  onClose, 
  onRelatedTermClick 
}: GrammarPopupProps) => {
  if (!isOpen || !explanation) return null;

  const handleRelatedTermClick = (term: string, event: React.MouseEvent<HTMLButtonElement>) => {
    onRelatedTermClick(term, event.currentTarget);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'syntax': return 'text-[#6EC1E4]';
      case 'morphology': return 'text-[#FFD700]';
      case 'semantics': return 'text-[#9ACD32]';
      default: return 'text-gray-300';
    }
  };

  return (
    <div
      className="fixed z-40 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">{explanation.term}</h3>
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-700 ${getCategoryColor(explanation.category)}`}>
            {explanation.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Definition */}
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          {explanation.definition}
        </p>
      </div>

      {/* Examples */}
      {explanation.examples.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Examples:</h4>
          <ul className="space-y-1">
            {explanation.examples.map((example, index) => (
              <li key={index} className="text-sm text-gray-400 flex items-start">
                <span className="text-[#FFD700] mr-2">•</span>
                <span className="font-arabic">{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Terms */}
      {explanation.relatedTerms.length > 0 && (
        <div className="pt-3 border-t border-gray-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Related Terms:</h4>
          <div className="flex flex-wrap gap-2">
            {explanation.relatedTerms.map((term, index) => (
              <button
                key={index}
                onClick={(e) => handleRelatedTermClick(term, e)}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-[#9ACD32] rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
