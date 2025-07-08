
import { useState } from 'react';
import { VerseDisplay } from "@/components/VerseDisplay";
import { MorphologyPopup } from "@/components/MorphologyPopup";
import { GrammarPopup } from "@/components/GrammarPopup";
import { RelationshipPopup } from "@/components/RelationshipPopup";
import { RelationshipOverlay } from "@/components/RelationshipOverlay";
import { VisualizationModeManager } from "@/components/RelationshipVisualization/VisualizationModeManager";
import { usePopupManager } from "@/hooks/usePopupManager";
import { useMASAQData } from "@/hooks/useMASAQData";
import { enhancedSegments } from "@/data/enhancedSegmentData";
import { grammarExplanations } from "@/data/grammarExplanations";

interface Segment {
  id: string;
  text: string;
  morphology: 'noun' | 'verb' | 'particle' | 'adjective';
  type: 'prefix' | 'root' | 'suffix';
}

interface Word {
  id: string;
  text: string;
  segments: Segment[];
}

interface Verse {
  id: number;
  arabic: string;
  translation: string;
  words: Word[];
}

interface QuranTextProps {
  verses: Verse[];
  selectedWord: string | null;
  onWordTap: (segmentId: string) => void;
}

// Helper function to parse segment ID and extract location info
const parseSegmentLocation = (segmentId: string) => {
  const parts = segmentId.split('-');
  if (parts.length >= 4) {
    return {
      surah: parseInt(parts[0]),
      verse: parseInt(parts[1]), 
      word: parseInt(parts[2]),
      segment: parseInt(parts[3])
    };
  }
  return { surah: 1, verse: 1, word: 1, segment: 1 }; // fallback
};

export const QuranText = ({ verses, selectedWord, onWordTap }: QuranTextProps) => {
  const [activeRelationships, setActiveRelationships] = useState<string[]>([]);
  const [highlightedTranslationSegments, setHighlightedTranslationSegments] = useState<string[]>([]);
  
  const { enhanceSegment } = useMASAQData();

  const {
    leftPopup,
    rightPopup,
    relationshipPopup,
    openMorphologyPopup,
    openGrammarPopup,
    openRelationshipPopup,
    closePopups,
    closeLeftPopup,
    closeRightPopup,
    closeRelationshipPopup,
  } = usePopupManager();

  const handleWordTap = (segmentId: string) => {
    console.log('handleWordTap called with segmentId:', segmentId);
    console.log('Available enhanced segments:', Object.keys(enhancedSegments).length);
    
    let segment = enhancedSegments[segmentId];
    console.log('Found enhanced segment:', segment);
    
    if (segment) {
      // Enhanced MASAQ integration with proper location parsing
      const location = parseSegmentLocation(segmentId);
      console.log('Parsed location:', location);
      
      const enhancedSegmentData = enhanceSegment(
        segment, 
        location.surah, 
        location.verse, 
        location.word, 
        location.segment
      );
      console.log('Enhanced segment with MASAQ data:', enhancedSegmentData);
      
      // Find the element that was clicked
      const element = document.querySelector(`[data-segment-id="${segmentId}"]`) as HTMLElement;
      console.log('Found element:', element);
      
      if (element) {
        console.log('Opening morphology popup with enhanced data');
        openMorphologyPopup(enhancedSegmentData, element);
      } else {
        console.warn('Could not find element with data-segment-id:', segmentId);
      }
    } else {
      console.warn('No enhanced segment found for id:', segmentId);
    }
    
    onWordTap(segmentId);
  };

  const handleGrammarTermClick = (term: string, element: HTMLElement) => {
    console.log('Grammar term clicked:', term);
    const explanation = grammarExplanations[term];
    if (explanation) {
      openGrammarPopup(term, element);
    }
  };

  const handleRelatedTermClick = (term: string, element: HTMLElement) => {
    const explanation = grammarExplanations[term];
    if (explanation) {
      openGrammarPopup(term, element);
    }
  };

  const handleShowRelationships = (relationships: any[], element: HTMLElement) => {
    console.log('Showing relationships:', relationships);
    openRelationshipPopup(relationships, element);
  };

  const handleRelatedSegmentClick = (segmentId: string) => {
    console.log('Related segment clicked:', segmentId);
    closeRelationshipPopup();
    
    // Highlight the related segment
    const element = document.querySelector(`[data-segment-id="${segmentId}"]`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger the word tap to show its popup
      setTimeout(() => handleWordTap(segmentId), 300);
    }
  };

  const handleRelationshipToggle = (relationshipType: string) => {
    console.log('Relationship toggle:', relationshipType);
    
    if (relationshipType === 'all') {
      setActiveRelationships(['all']);
    } else if (relationshipType === 'clear') {
      setActiveRelationships([]);
    } else {
      setActiveRelationships(prev => {
        const filtered = prev.filter(r => r !== 'all');
        if (filtered.includes(relationshipType)) {
          return filtered.filter(r => r !== relationshipType);
        } else {
          return [...filtered, relationshipType];
        }
      });
    }
  };

  const handleHighlightTranslation = (segmentIds: string[]) => {
    setHighlightedTranslationSegments(segmentIds);
  };

  const handleRelationshipHover = (relationshipId: string | null) => {
    // Future enhancement: handle relationship hover effects
    console.log('Relationship hover:', relationshipId);
  };

  return (
    <div className="space-y-8 relative">
      {/* Relationship Overlay */}
      <RelationshipOverlay
        activeRelationships={activeRelationships}
        onRelationshipHover={handleRelationshipHover}
      />

      {/* Verses */}
      {verses.map((verse) => (
        <VerseDisplay
          key={verse.id}
          verse={verse}
          selectedWord={selectedWord}
          activeRelationships={activeRelationships}
          onWordTap={handleWordTap}
        />
      ))}

      {/* New Visualization Mode Manager */}
      <VisualizationModeManager
        activeRelationships={activeRelationships}
        onRelationshipToggle={handleRelationshipToggle}
        selectedSegmentId={selectedWord}
      />

      {/* Morphology Popup */}
      {leftPopup.segment && leftPopup.position && (
        <MorphologyPopup
          segment={leftPopup.segment}
          position={leftPopup.position}
          isOpen={leftPopup.isOpen}
          onClose={closeLeftPopup}
          onGrammarTermClick={handleGrammarTermClick}
          onShowRelationships={handleShowRelationships}
        />
      )}

      {/* Grammar Explanation Popup */}
      {rightPopup.activeGrammarTerm && rightPopup.position && (
        <GrammarPopup
          explanation={grammarExplanations[rightPopup.activeGrammarTerm]}
          position={rightPopup.position}
          isOpen={rightPopup.isOpen}
          onClose={closeRightPopup}
          onRelatedTermClick={handleRelatedTermClick}
        />
      )}

      {/* Relationship Popup */}
      {relationshipPopup.relationships && relationshipPopup.position && (
        <RelationshipPopup
          relationships={relationshipPopup.relationships}
          position={relationshipPopup.position}
          isOpen={relationshipPopup.isOpen}
          onClose={closeRelationshipPopup}
          onRelatedSegmentClick={handleRelatedSegmentClick}
        />
      )}
    </div>
  );
};
