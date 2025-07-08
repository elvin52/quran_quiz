
import { useState } from 'react';
import { Layers, ChevronDown, ChevronRight, Eye, EyeOff, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { enhancedSegments } from '@/data/enhancedSurahData';
import { Checkbox } from '@/components/ui/checkbox';

interface LayeredModeProps {
  activeRelationships: string[];
  onRelationshipToggle: (relationshipType: string) => void;
  selectedSegmentId?: string | null;
}

interface RelationshipLayer {
  id: string;
  name: string;
  color: string;
  icon: string;
  depth: number;
  relationships: Array<{
    from: string;
    to: string;
    description: string;
  }>;
  isExpanded: boolean;
}

const relationshipHierarchy = [
  {
    id: 'syntax',
    name: 'Syntactic Relations',
    depth: 0,
    children: ['jar-majrur', 'verb-object']
  },
  {
    id: 'morphological',
    name: 'Morphological Relations', 
    depth: 0,
    children: ['mudaf-mudaf-ilayh', 'mawsuf-sifah']
  }
];

export const LayeredMode = ({
  activeRelationships,
  onRelationshipToggle,
  selectedSegmentId
}: LayeredModeProps) => {
  const [layers, setLayers] = useState<RelationshipLayer[]>([
    {
      id: 'jar-majrur',
      name: 'Preposition-Object',
      color: '#6EC1E4',
      icon: '🔗',
      depth: 1,
      relationships: [],
      isExpanded: false
    },
    {
      id: 'verb-object',
      name: 'Verb-Object',
      color: '#FF6347',
      icon: '⚡',
      depth: 1,
      relationships: [],
      isExpanded: false
    },
    {
      id: 'mudaf-mudaf-ilayh',
      name: 'Possessive Construction',
      color: '#FFD700',
      icon: '🏠',
      depth: 1,
      relationships: [],
      isExpanded: false
    },
    {
      id: 'mawsuf-sifah',
      name: 'Noun-Adjective',
      color: '#9ACD32',
      icon: '🎨',
      depth: 1,
      relationships: [],
      isExpanded: false
    }
  ]);

  const [hierarchyExpanded, setHierarchyExpanded] = useState<Record<string, boolean>>({
    syntax: true,
    morphological: true
  });

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, isExpanded: !layer.isExpanded }
        : layer
    ));
  };

  const toggleHierarchy = (hierarchyId: string) => {
    setHierarchyExpanded(prev => ({
      ...prev,
      [hierarchyId]: !prev[hierarchyId]
    }));
  };

  const toggleCategoryLayers = (categoryId: string, enable: boolean) => {
    const category = relationshipHierarchy.find(c => c.id === categoryId);
    if (category) {
      category.children.forEach(layerId => {
        if (enable && !isLayerActive(layerId)) {
          onRelationshipToggle(layerId);
        } else if (!enable && isLayerActive(layerId)) {
          onRelationshipToggle(layerId);
        }
      });
    }
  };

  const getRelationshipsForType = (type: string) => {
    const relationships: Array<{ from: string; to: string; description: string }> = [];
    
    Object.values(enhancedSegments).forEach(segment => {
      segment.relationships?.forEach(rel => {
        if (rel.type === type) {
          const relatedSegment = enhancedSegments[rel.relatedSegmentId];
          if (relatedSegment) {
            relationships.push({
              from: segment.text,
              to: relatedSegment.text,
              description: rel.description
            });
          }
        }
      });
    });

    return relationships;
  };

  const isLayerActive = (layerId: string) => {
    return activeRelationships.includes('all') || activeRelationships.includes(layerId);
  };

  const getCategoryActiveCount = (categoryId: string) => {
    const category = relationshipHierarchy.find(c => c.id === categoryId);
    if (!category) return 0;
    return category.children.filter(layerId => isLayerActive(layerId)).length;
  };

  const getTotalActiveConnections = () => {
    return layers.reduce((total, layer) => {
      if (isLayerActive(layer.id)) {
        return total + getRelationshipsForType(layer.id).length;
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#9ACD32]">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Multi-Layer Analysis</span>
        </div>
        <div className="text-xs text-gray-400">
          {getTotalActiveConnections()} connections
        </div>
      </div>

      {/* Active Layers Summary */}
      {activeRelationships.length > 0 && !activeRelationships.includes('all') && (
        <div className="p-2 bg-[#9ACD32]/10 rounded-lg border border-[#9ACD32]/30">
          <div className="text-xs text-[#9ACD32] font-medium mb-1">Active Layers:</div>
          <div className="flex flex-wrap gap-1">
            {activeRelationships.map(relType => {
              const layer = layers.find(l => l.id === relType);
              return layer ? (
                <div
                  key={relType}
                  className="px-2 py-1 rounded-full text-xs border"
                  style={{
                    backgroundColor: `${layer.color}15`,
                    borderColor: layer.color,
                    color: layer.color
                  }}
                >
                  {layer.icon} {layer.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Hierarchical Structure */}
      <div className="space-y-3">
        {relationshipHierarchy.map((category) => {
          const isExpanded = hierarchyExpanded[category.id];
          const categoryLayers = layers.filter(layer => 
            category.children.includes(layer.id)
          );
          const activeCount = getCategoryActiveCount(category.id);
          const totalCount = categoryLayers.length;

          return (
            <div key={category.id} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                <button
                  onClick={() => toggleHierarchy(category.id)}
                  className="flex items-center space-x-2 hover:bg-gray-700 rounded px-2 py-1 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-white">{category.name}</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-400">
                    {activeCount}/{totalCount}
                  </div>
                  <button
                    onClick={() => toggleCategoryLayers(category.id, activeCount < totalCount)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                    title={activeCount < totalCount ? "Enable all" : "Disable all"}
                  >
                    {activeCount < totalCount ? (
                      <Plus className="h-3 w-3 text-[#9ACD32]" />
                    ) : (
                      <Minus className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Category Layers */}
              {isExpanded && (
                <div className="ml-4 space-y-2">
                  {categoryLayers.map((layer) => {
                    const isActive = isLayerActive(layer.id);
                    const relationships = getRelationshipsForType(layer.id);

                    return (
                      <div key={layer.id} className="space-y-2">
                        {/* Layer Header */}
                        <div
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                            isActive
                              ? "bg-gray-700 border-current shadow-md"
                              : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                          )}
                          style={{
                            borderColor: isActive ? layer.color : undefined,
                            boxShadow: isActive ? `0 0 10px ${layer.color}20` : undefined
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isActive}
                              onCheckedChange={() => onRelationshipToggle(layer.id)}
                              className="border-gray-500"
                            />
                            <button
                              onClick={() => toggleLayer(layer.id)}
                              className="flex items-center space-x-2"
                            >
                              {layer.isExpanded ? (
                                <ChevronDown className="h-3 w-3 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-gray-400" />
                              )}
                            </button>
                            <span className="text-sm">{layer.icon}</span>
                            <div>
                              <div 
                                className="text-sm font-medium" 
                                style={{ color: isActive ? layer.color : '#E5E7EB' }}
                              >
                                {layer.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {relationships.length} connections
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isActive && (
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: layer.color }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Layer Details */}
                        {layer.isExpanded && isActive && (
                          <div className="ml-6 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                            <div className="space-y-2">
                              {relationships.slice(0, 3).map((rel, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                  <span className="text-gray-300">{rel.from}</span>
                                  <div 
                                    className="w-4 h-0.5 rounded"
                                    style={{ backgroundColor: layer.color }}
                                  />
                                  <span className="text-gray-300">{rel.to}</span>
                                </div>
                              ))}
                              {relationships.length > 3 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{relationships.length - 3} more connections
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 pt-2 border-t border-gray-600">
        <button
          onClick={() => onRelationshipToggle('all')}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-[#9ACD32]/20 hover:bg-[#9ACD32]/30 rounded-lg border border-[#9ACD32]/50 transition-colors"
        >
          <Plus className="h-3 w-3 text-[#9ACD32]" />
          <span className="text-xs text-[#9ACD32]">All Layers</span>
        </button>
        <button
          onClick={() => onRelationshipToggle('clear')}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors"
        >
          <EyeOff className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400">Clear All</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center">
          Multi-layer analysis with hierarchical controls. Select multiple layers to see overlapping relationships and patterns.
        </p>
      </div>
    </div>
  );
};
