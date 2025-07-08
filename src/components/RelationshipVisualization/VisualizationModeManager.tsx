
import { useState } from 'react';
import { Eye, Network, Layers, Lightbulb, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpotlightMode } from './SpotlightMode';
import { NetworkMode } from './NetworkMode';
import { LayeredMode } from './LayeredMode';

type VisualizationMode = 'spotlight' | 'network' | 'layered';

interface VisualizationModeManagerProps {
  activeRelationships: string[];
  onRelationshipToggle: (relationshipType: string) => void;
  selectedSegmentId?: string | null;
}

const modes = [
  {
    id: 'spotlight' as const,
    name: 'Spotlight',
    icon: Lightbulb,
    description: 'Focus on individual relationships',
    color: '#FFD700'
  },
  {
    id: 'network' as const,
    name: 'Network',
    icon: Network,
    description: 'Interactive relationship diagram',
    color: '#6EC1E4'
  },
  {
    id: 'layered' as const,
    name: 'Layered',
    icon: Layers,
    description: 'Depth-based visualization',
    color: '#9ACD32'
  }
];

export const VisualizationModeManager = ({
  activeRelationships,
  onRelationshipToggle,
  selectedSegmentId
}: VisualizationModeManagerProps) => {
  const [currentMode, setCurrentMode] = useState<VisualizationMode>('spotlight');
  const [isExpanded, setIsExpanded] = useState(false);

  const getActiveCount = () => {
    if (activeRelationships.includes('all')) return 'All';
    return activeRelationships.length;
  };

  const handleClearAll = () => {
    onRelationshipToggle('clear');
  };

  const renderModeContent = () => {
    const commonProps = {
      activeRelationships,
      onRelationshipToggle,
      selectedSegmentId
    };

    switch (currentMode) {
      case 'spotlight':
        return <SpotlightMode {...commonProps} />;
      case 'network':
        return <NetworkMode {...commonProps} />;
      case 'layered':
        return <LayeredMode {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-20 left-4 bg-[#1a1a1a] border border-gray-600 rounded-lg shadow-2xl z-40 max-w-sm">
      {/* Mode Selector Header */}
      <div className="p-3 border-b border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-[#9ACD32]" />
            <span className="text-sm font-semibold text-white">Visualization Mode</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Active relationships counter */}
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded-full">
              <span className="text-xs text-[#9ACD32]">{getActiveCount()}</span>
              <span className="text-xs text-gray-400">active</span>
            </div>
            {/* Clear all button */}
            {activeRelationships.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                title="Clear all relationships"
              >
                <RotateCcw className="h-3 w-3 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Layers className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex space-x-1">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setCurrentMode(mode.id)}
                className={cn(
                  "flex-1 flex items-center justify-center p-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gray-700 border border-gray-500"
                    : "bg-gray-800 hover:bg-gray-700"
                )}
                title={mode.description}
              >
                <Icon 
                  className="h-4 w-4" 
                  style={{ color: isActive ? mode.color : '#9CA3AF' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Content */}
      {isExpanded && (
        <div className="p-3">
          {renderModeContent()}
        </div>
      )}
    </div>
  );
};
