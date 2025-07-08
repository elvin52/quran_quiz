import { useEffect, useState } from 'react';
import { enhancedSegments } from '@/data/enhancedSurahData';
import { GrammaticalRelationship } from '@/types/morphology';
import { cn } from '@/lib/utils';

interface RelationshipOverlayProps {
  activeRelationships: string[];
  onRelationshipHover: (relationshipId: string | null) => void;
}

interface ConnectionLine {
  id: string;
  type: string;
  startElement: HTMLElement;
  endElement: HTMLElement;
  color: string;
}

const getRelationshipColor = (type: string) => {
  switch (type) {
    case 'jar-majrur': return '#6EC1E4';
    case 'mudaf-mudaf-ilayh': return '#FFD700';
    case 'mawsuf-sifah': return '#9ACD32';
    case 'verb-object': return '#FF6347';
    default: return '#9CA3AF';
  }
};

export const RelationshipOverlay = ({ 
  activeRelationships, 
  onRelationshipHover 
}: RelationshipOverlayProps) => {
  const [connections, setConnections] = useState<ConnectionLine[]>([]);

  useEffect(() => {
    if (activeRelationships.length === 0) {
      setConnections([]);
      return;
    }

    const newConnections: ConnectionLine[] = [];

    // Find all relationships to display
    Object.values(enhancedSegments).forEach(segment => {
      if (!segment.relationships) return;

      segment.relationships.forEach(relationship => {
        const shouldShow = activeRelationships.includes('all') || 
          activeRelationships.includes(relationship.type) ||
          activeRelationships.includes(relationship.id);

        if (shouldShow) {
          const startElement = document.querySelector(`[data-segment-id="${segment.id}"]`) as HTMLElement;
          const endElement = document.querySelector(`[data-segment-id="${relationship.relatedSegmentId}"]`) as HTMLElement;

          if (startElement && endElement) {
            newConnections.push({
              id: relationship.id,
              type: relationship.type,
              startElement,
              endElement,
              color: getRelationshipColor(relationship.type)
            });
          }
        }
      });
    });

    setConnections(newConnections);
  }, [activeRelationships]);

  const calculatePath = (start: HTMLElement, end: HTMLElement) => {
    const startRect = start.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    const container = document.getElementById('verse-container');
    const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

    const startX = startRect.left + startRect.width / 2 - containerRect.left;
    const startY = startRect.bottom - containerRect.top + 5;
    const endX = endRect.left + endRect.width / 2 - containerRect.left;
    const endY = endRect.bottom - containerRect.top + 5;

    // Create a curved path
    const midY = Math.max(startY, endY) + 20;
    const controlY = midY + Math.abs(endX - startX) * 0.3;

    return `M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`;
  };

  if (connections.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'visible'
      }}
    >
      {connections.map((connection, index) => (
        <g key={connection.id}>
          <path
            d={calculatePath(connection.startElement, connection.endElement)}
            stroke={connection.color}
            strokeWidth="2"
            fill="none"
            strokeDasharray="4,2"
            opacity="0.8"
            className="animate-pulse"
          />
          <circle
            cx={connection.startElement.getBoundingClientRect().left + 
                connection.startElement.getBoundingClientRect().width / 2 - 
                (document.getElementById('verse-container')?.getBoundingClientRect().left || 0)}
            cy={connection.startElement.getBoundingClientRect().bottom + 5 - 
                (document.getElementById('verse-container')?.getBoundingClientRect().top || 0)}
            r="3"
            fill={connection.color}
            opacity="0.9"
          />
          <circle
            cx={connection.endElement.getBoundingClientRect().left + 
                connection.endElement.getBoundingClientRect().width / 2 - 
                (document.getElementById('verse-container')?.getBoundingClientRect().left || 0)}
            cy={connection.endElement.getBoundingClientRect().bottom + 5 - 
                (document.getElementById('verse-container')?.getBoundingClientRect().top || 0)}
            r="3"
            fill={connection.color}
            opacity="0.9"
          />
        </g>
      ))}
    </svg>
  );
};
