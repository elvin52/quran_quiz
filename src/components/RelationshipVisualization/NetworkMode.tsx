import { useState, useEffect, useRef } from 'react';
import { Network, Circle, ArrowRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { enhancedSegments } from '@/data/enhancedSegmentData';
import { Checkbox } from '@/components/ui/checkbox';

interface NetworkModeProps {
  activeRelationships: string[];
  onRelationshipToggle: (relationshipType: string) => void;
  selectedSegmentId?: string | null;
}

interface NetworkNode {
  id: string;
  text: string;
  type: 'noun' | 'verb' | 'particle' | 'adjective';
  x: number;
  y: number;
  connections: string[];
  relationshipTypes: string[];
}

interface NetworkEdge {
  from: string;
  to: string;
  type: string;
  color: string;
}

const relationshipColors = {
  'jar-majrur': '#6EC1E4',
  'mudaf-mudaf-ilayh': '#FFD700',
  'mawsuf-sifah': '#9ACD32',
  'mubtada-khabar': '#FF6347',
  'fil-fail': '#8A2BE2',
  'fil-maful': '#FF4500',
  'article-noun': '#32CD32',
  'conjunction': '#FF1493',
  'relative-pronoun': '#00CED1',
  'emphatic': '#FFD700'
};

const relationshipTypes = [
  { id: 'jar-majrur', name: 'Preposition-Object', color: '#6EC1E4' },
  { id: 'mudaf-mudaf-ilayh', name: 'Possessive', color: '#FFD700' },
  { id: 'mawsuf-sifah', name: 'Noun-Adjective', color: '#9ACD32' },
  { id: 'mubtada-khabar', name: 'Subject-Predicate', color: '#FF6347' },
  { id: 'fil-fail', name: 'Verb-Subject', color: '#8A2BE2' },
  { id: 'fil-maful', name: 'Verb-Object', color: '#FF4500' },
  { id: 'article-noun', name: 'Article-Noun', color: '#32CD32' },
  { id: 'conjunction', name: 'Conjunction', color: '#FF1493' },
  { id: 'relative-pronoun', name: 'Relative Pronoun', color: '#00CED1' },
  { id: 'emphatic', name: 'Emphatic', color: '#FFD700' }
];

export const NetworkMode = ({
  activeRelationships,
  onRelationshipToggle,
  selectedSegmentId
}: NetworkModeProps) => {
  const [networkData, setNetworkData] = useState<{ nodes: NetworkNode[]; edges: NetworkEdge[] }>({
    nodes: [],
    edges: []
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    generateNetworkData();
  }, [activeRelationships]);

  const generateNetworkData = () => {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    const processedSegments = new Set<string>();

    // Find segments with relationships
    Object.values(enhancedSegments).forEach(segment => {
      if (!segment.relationships?.length) return;

      const segmentActiveRelationships = segment.relationships.filter(rel => 
        activeRelationships.includes('all') ||
        activeRelationships.includes(rel.type) || 
        activeRelationships.includes(rel.id)
      );

      if (segmentActiveRelationships.length > 0 && !processedSegments.has(segment.id)) {
        // Add node for this segment
        nodes.push({
          id: segment.id,
          text: segment.text,
          type: segment.morphology,
          x: 0,
          y: 0,
          connections: segmentActiveRelationships.map(rel => rel.relatedSegmentId),
          relationshipTypes: segmentActiveRelationships.map(rel => rel.type)
        });
        processedSegments.add(segment.id);

        // Add edges and related nodes
        segmentActiveRelationships.forEach(relationship => {
          const relatedSegment = enhancedSegments[relationship.relatedSegmentId];
          if (relatedSegment && !processedSegments.has(relatedSegment.id)) {
            nodes.push({
              id: relatedSegment.id,
              text: relatedSegment.text,
              type: relatedSegment.morphology,
              x: 0,
              y: 0,
              connections: relatedSegment.relationships?.map(rel => rel.relatedSegmentId) || [],
              relationshipTypes: relatedSegment.relationships?.map(rel => rel.type) || []
            });
            processedSegments.add(relatedSegment.id);
          }

          edges.push({
            from: segment.id,
            to: relationship.relatedSegmentId,
            type: relationship.type,
            color: relationshipColors[relationship.type as keyof typeof relationshipColors] || '#9CA3AF'
          });
        });
      }
    });

    // Apply force-directed layout
    applyForceLayout(nodes, edges);
    setNetworkData({ nodes, edges });
  };

  const applyForceLayout = (nodes: NetworkNode[], edges: NetworkEdge[]) => {
    const width = 280;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;

    if (nodes.length === 0) return;

    // Improved circular layout with clustering by type
    const nodesByType = nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, NetworkNode[]>);

    let currentAngle = 0;
    const typeAngleStep = (2 * Math.PI) / Object.keys(nodesByType).length;

    Object.entries(nodesByType).forEach(([type, typeNodes], typeIndex) => {
      const typeAngle = typeIndex * typeAngleStep;
      const typeRadius = Math.min(width, height) * 0.25;
      
      typeNodes.forEach((node, nodeIndex) => {
        const nodeAngle = typeAngle + (nodeIndex / typeNodes.length) * (Math.PI / 3);
        const nodeRadius = typeRadius + (nodeIndex % 2) * 20;
        
        node.x = centerX + nodeRadius * Math.cos(nodeAngle);
        node.y = centerY + nodeRadius * Math.sin(nodeAngle);
      });
    });
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'noun': return '#FFD700';
      case 'verb': return '#6EC1E4';
      case 'particle': return '#9ACD32';
      case 'adjective': return '#FF6347';
      default: return '#9CA3AF';
    }
  };

  const handleNodeClick = (nodeId: string) => {
    const element = document.querySelector(`[data-segment-id="${nodeId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isRelationshipActive = (relationshipType: string) => {
    return activeRelationships.includes('all') || activeRelationships.includes(relationshipType);
  };

  const getActiveEdgeCount = () => {
    return networkData.edges.length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#6EC1E4]">
          <Network className="h-4 w-4" />
          <span className="text-sm font-medium">Grammar Network</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">{getActiveEdgeCount()} connections</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <Filter className="h-3 w-3 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Relationship Filters */}
      {showFilters && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2 max-h-40 overflow-y-auto">
          <div className="text-xs font-medium text-gray-300 mb-2">Filter by relationship type:</div>
          {relationshipTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                checked={isRelationshipActive(type.id)}
                onCheckedChange={() => onRelationshipToggle(type.id)}
                className="border-gray-500"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-xs text-gray-300">{type.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Network Diagram */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <svg
          ref={svgRef}
          width="280"
          height="200"
          className="w-full"
          viewBox="0 0 280 200"
        >
          {/* Edges */}
          {networkData.edges.map((edge, index) => {
            const fromNode = networkData.nodes.find(n => n.id === edge.from);
            const toNode = networkData.nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.color}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  opacity="0.7"
                  className="animate-pulse"
                />
                {/* Arrow marker */}
                <circle
                  cx={toNode.x}
                  cy={toNode.y}
                  r="2"
                  fill={edge.color}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {networkData.nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={hoveredNode === node.id ? "12" : "8"}
                fill={getNodeColor(node.type)}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node.id)}
              />
              {/* Multi-relationship indicator */}
              {node.relationshipTypes.length > 1 && (
                <circle
                  cx={node.x + 8}
                  cy={node.y - 8}
                  r="4"
                  fill="#FF4444"
                  stroke="white"
                  strokeWidth="1"
                  className="pointer-events-none"
                />
              )}
              <text
                x={node.x}
                y={node.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                className="pointer-events-none"
              >
                {node.text.length > 6 ? node.text.substring(0, 6) + '...' : node.text}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-300 mb-2">Word Types:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { type: 'noun', label: 'Nouns', color: '#FFD700' },
            { type: 'verb', label: 'Verbs', color: '#6EC1E4' },
            { type: 'particle', label: 'Particles', color: '#9ACD32' },
            { type: 'adjective', label: 'Adjectives', color: '#FF6347' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full border border-white/50"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2 pt-1 border-t border-gray-600">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-white/50" />
          <span className="text-gray-300">Multi-grammar node</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center">
          Comprehensive grammar network showing all Arabic grammatical relationships including mudaf-mudaf ilayh.
        </p>
      </div>
    </div>
  );
};
