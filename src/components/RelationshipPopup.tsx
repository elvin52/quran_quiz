
import { GrammaticalRelationship, PopupPosition } from '@/types/morphology';
import { X, ArrowRight, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelationshipPopupProps {
  relationships: GrammaticalRelationship[];
  position: PopupPosition;
  isOpen: boolean;
  onClose: () => void;
  onRelatedSegmentClick: (segmentId: string) => void;
}

const getRelationshipColor = (type: string) => {
  switch (type) {
    case 'jar-majrur': return 'text-[#6EC1E4]';
    case 'mudaf-mudaf-ilayh': return 'text-[#FFD700]';
    case 'mawsuf-sifah': return 'text-[#9ACD32]';
    default: return 'text-gray-300';
  }
};

const getRelationshipIcon = (type: string) => {
  switch (type) {
    case 'jar-majrur': return '🔗';
    case 'mudaf-mudaf-ilayh': return '🏠';
    case 'mawsuf-sifah': return '🎨';
    default: return '📝';
  }
};

const formatRelationshipType = (type: string) => {
  switch (type) {
    case 'jar-majrur': return 'Preposition-Object';
    case 'mudaf-mudaf-ilayh': return 'Possessive Construction';
    case 'mawsuf-sifah': return 'Noun-Adjective';
    default: return type;
  }
};

export const RelationshipPopup = ({
  relationships,
  position,
  isOpen,
  onClose,
  onRelatedSegmentClick
}: RelationshipPopupProps) => {
  if (!isOpen || relationships.length === 0) return null;

  return (
    <div
      className="fixed z-50 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-2xl p-4 w-72 max-h-80 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Link className="h-4 w-4 text-[#9ACD32]" />
          <h3 className="text-sm font-semibold text-white">Grammatical Relations</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Relationships */}
      <div className="space-y-3">
        {relationships.map((relationship) => (
          <div
            key={relationship.id}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getRelationshipIcon(relationship.type)}</span>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full bg-gray-700",
                  getRelationshipColor(relationship.type)
                )}>
                  {formatRelationshipType(relationship.type)}
                </span>
              </div>
              <span className="text-xs text-gray-400 capitalize px-2 py-1 bg-gray-700 rounded">
                {relationship.role}
              </span>
            </div>
            
            <p className="text-sm text-gray-300 mb-2">
              {relationship.description}
            </p>
            
            <button
              onClick={() => onRelatedSegmentClick(relationship.relatedSegmentId)}
              className="flex items-center space-x-1 text-xs text-[#9ACD32] hover:text-[#7BA428] transition-colors"
            >
              <span>View related segment</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
