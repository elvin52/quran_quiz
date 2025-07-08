
import { useState, useEffect } from 'react';
import { Lightbulb, Focus, Eye, EyeOff, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { enhancedSegments } from '@/data/enhancedSegmentData';
import { Checkbox } from '@/components/ui/checkbox';

interface SpotlightModeProps {
  activeRelationships: string[];
  onRelationshipToggle: (relationshipType: string) => void;
  selectedSegmentId?: string | null;
}

const relationshipTypes = [
  {
    id: 'jar-majrur',
    name: 'Preposition-Object',
    color: '#6EC1E4',
    icon: '🔗',
    description: 'Preposition governing a noun in genitive case'
  },
  {
    id: 'mudaf-mudaf-ilayh',
    name: 'Possessive Construction',
    color: '#FFD700',
    icon: '🏠',
    description: 'Noun followed by another noun in genitive case'
  },
  {
    id: 'mawsuf-sifah',
    name: 'Noun-Adjective',
    color: '#9ACD32',
    icon: '🎨',
    description: 'Noun described by an agreeing adjective'
  },
  {
    id: 'mubtada-khabar',
    name: 'Subject-Predicate',
    color: '#FF6347',
    icon: '📝',
    description: 'Nominal sentence with subject and predicate'
  },
  {
    id: 'fil-fail',
    name: 'Verb-Subject',
    color: '#8A2BE2',
    icon: '⚡',
    description: 'Verb with its acting subject'
  },
  {
    id: 'fil-maful',
    name: 'Verb-Object',
    color: '#FF4500',
    icon: '🎯',
    description: 'Verb acting on direct object'
  },
  {
    id: 'article-noun',
    name: 'Article-Noun',
    color: '#32CD32',
    icon: '📰',
    description: 'Definite article with noun/adjective'
  },
  {
    id: 'conjunction',
    name: 'Conjunction',
    color: '#FF1493',
    icon: '🔗',
    description: 'Words connected by conjunctions'
  },
  {
    id: 'relative-pronoun',
    name: 'Relative Pronoun',
    color: '#00CED1',
    icon: '🔍',
    description: 'Relative pronoun with its antecedent'
  },
  {
    id: 'emphatic',
    name: 'Emphatic',
    color: '#FFD700',
    icon: '💪',
    description: 'Emphatic constructions and repetitions'
  }
];

export const SpotlightMode = ({
  activeRelationships,
  onRelationshipToggle,
  selectedSegmentId
}: SpotlightModeProps) => {
  const [focusedRelationships, setFocusedRelationships] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Update focused relationships based on active ones
    const filtered = activeRelationships.filter(rel => rel !== 'all');
    setFocusedRelationships(filtered);
    
    if (filtered.length > 0) {
      applySpotlightEffects(filtered);
    } else {
      clearSpotlightEffects();
    }
  }, [activeRelationships]);

  const handleRelationshipToggle = (relationshipType: string) => {
    onRelationshipToggle(relationshipType);
  };

  const isRelationshipActive = (relationshipType: string) => {
    return activeRelationships.includes('all') || activeRelationships.includes(relationshipType);
  };

  const applySpotlightEffects = (activeRelTypes: string[]) => {
    // Find all segments with any of these relationship types
    const relatedSegmentIds = new Set<string>();
    
    Object.values(enhancedSegments).forEach(segment => {
      segment.relationships?.forEach(rel => {
        if (activeRelTypes.includes(rel.type)) {
          relatedSegmentIds.add(segment.id);
          relatedSegmentIds.add(rel.relatedSegmentId);
        }
      });
    });

    // Apply dimming to all segments first
    const allSegments = document.querySelectorAll('[data-segment-id]');
    allSegments.forEach(element => {
      (element as HTMLElement).style.opacity = '0.3';
      (element as HTMLElement).style.filter = 'blur(1px)';
    });

    // Highlight related segments with focus rings
    relatedSegmentIds.forEach(segmentId => {
      const element = document.querySelector(`[data-segment-id="${segmentId}"]`) as HTMLElement;
      if (element) {
        element.style.opacity = '1';
        element.style.filter = 'none';
        
        // Use different colors for different relationship types
        const segment = enhancedSegments[segmentId];
        if (segment?.relationships) {
          const segmentActiveRelTypes = segment.relationships
            .filter(rel => activeRelTypes.includes(rel.type))
            .map(rel => rel.type);
          
          if (segmentActiveRelTypes.length > 0) {
            const relationshipTypeObj = relationshipTypes.find(rt => rt.id === segmentActiveRelTypes[0]);
            const colorValue = relationshipTypeObj?.color || '#9ACD32';
            element.style.boxShadow = `0 0 20px ${colorValue}40`;
            element.style.borderRadius = '6px';
          }
        }
      }
    });
  };

  const clearSpotlightEffects = () => {
    const allSegments = document.querySelectorAll('[data-segment-id]');
    allSegments.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.opacity = '';
      htmlElement.style.filter = '';
      htmlElement.style.boxShadow = '';
      htmlElement.style.animation = '';
    });
  };

  useEffect(() => {
    return () => clearSpotlightEffects();
  }, []);

  const getRelationshipCount = (relationshipType: string) => {
    let count = 0;
    Object.values(enhancedSegments).forEach(segment => {
      if (segment.relationships?.some(rel => rel.type === relationshipType)) {
        count++;
      }
    });
    return count;
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group relationships by category
  const basicRelationships = relationshipTypes.slice(0, 4);
  const advancedRelationships = relationshipTypes.slice(4);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#FFD700]">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">Grammar Spotlight</span>
        </div>
        <div className="text-xs text-gray-400">
          {focusedRelationships.length} active
        </div>
      </div>

      {/* Current Focus Display */}
      {focusedRelationships.length > 0 && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-[#FFD700]/30">
          <div className="flex items-center space-x-2 mb-2">
            <Focus className="h-4 w-4 text-[#FFD700]" />
            <span className="text-sm text-white">Active Grammar:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {focusedRelationships.map(relType => {
              const type = relationshipTypes.find(t => t.id === relType);
              return (
                <div
                  key={relType}
                  className="px-2 py-1 rounded-full text-xs border"
                  style={{
                    backgroundColor: `${type?.color}20`,
                    borderColor: type?.color,
                    color: type?.color
                  }}
                >
                  {type?.icon} {type?.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Basic Relationships */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300 mb-2">Core Grammar Rules</div>
        {basicRelationships.map((type) => {
          const isActive = isRelationshipActive(type.id);
          const count = getRelationshipCount(type.id);
          
          return (
            <div
              key={type.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300 border",
                isActive
                  ? "bg-gray-700 border-current shadow-md"
                  : "bg-gray-800 hover:bg-gray-700 border-gray-600"
              )}
              style={{
                borderColor: isActive ? type.color : undefined,
                boxShadow: isActive ? `0 0 15px ${type.color}20` : undefined
              }}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={() => handleRelationshipToggle(type.id)}
                  className="border-gray-500"
                />
                <span className="text-lg">{type.icon}</span>
                <div className="text-left">
                  <div 
                    className="text-sm font-medium"
                    style={{ color: isActive ? type.color : '#E5E7EB' }}
                  >
                    {type.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {count} instances • {type.description}
                  </div>
                </div>
              </div>
              
              {isActive && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: type.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Advanced Relationships */}
      <div className="space-y-2">
        <button
          onClick={() => toggleCategory('advanced')}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-300 mb-2 hover:text-white transition-colors"
        >
          <span>Advanced Grammar Rules</span>
          <span className={cn(
            "transform transition-transform duration-200",
            expandedCategories.has('advanced') ? 'rotate-90' : ''
          )}>
            ▶
          </span>
        </button>
        
        {expandedCategories.has('advanced') && advancedRelationships.map((type) => {
          const isActive = isRelationshipActive(type.id);
          const count = getRelationshipCount(type.id);
          
          return (
            <div
              key={type.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-300 border ml-4",
                isActive
                  ? "bg-gray-700 border-current shadow-md"
                  : "bg-gray-800 hover:bg-gray-700 border-gray-600"
              )}
              style={{
                borderColor: isActive ? type.color : undefined,
                boxShadow: isActive ? `0 0 15px ${type.color}20` : undefined
              }}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={() => handleRelationshipToggle(type.id)}
                  className="border-gray-500"
                />
                <span className="text-lg">{type.icon}</span>
                <div className="text-left">
                  <div 
                    className="text-sm font-medium"
                    style={{ color: isActive ? type.color : '#E5E7EB' }}
                  >
                    {type.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {count} instances • {type.description}
                  </div>
                </div>
              </div>
              
              {isActive && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: type.color }}
                />
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
          <span className="text-xs text-[#9ACD32]">All Grammar</span>
        </button>
        <button
          onClick={() => onRelationshipToggle('clear')}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors"
        >
          <EyeOff className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400">Clear</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center">
          Comprehensive Arabic grammar visualization including mudaf-mudaf ilayh, jar-majrur, and all major grammatical relationships.
        </p>
      </div>
    </div>
  );
};
