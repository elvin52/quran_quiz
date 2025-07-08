
import { cn } from "@/lib/utils";
import { enhancedSegments } from "@/data/enhancedSegmentData";
import { TranslationHighlighter } from "./TranslationHighlighter";
import { useMASAQData } from "@/hooks/useMASAQData";

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

interface VerseDisplayProps {
  verse: Verse;
  selectedWord: string | null;
  activeRelationships: string[];
  onWordTap: (segmentId: string) => void;
}

const getEnhancedSegmentColor = (morphology: string, type: string, hasMASOQData: boolean = false) => {
  const baseColor = getSegmentColor(morphology, type);
  
  // Add enhanced styling for segments with MASAQ data
  if (hasMASOQData) {
    return `${baseColor} shadow-sm ring-1 ring-current ring-opacity-20`;
  }
  
  return baseColor;
};

const getSegmentColor = (morphology: string, type: string) => {
  // Enhanced color system with better contrast
  if (type === 'prefix') {
    return 'text-[#FFA500] font-medium'; // Orange for prefixes
  } else if (type === 'suffix') {
    return 'text-[#FF69B4] font-medium'; // Pink for suffixes
  } else { // root
    switch (morphology) {
      case 'noun':
        return 'text-[#FFD700] font-semibold'; // Gold for noun roots
      case 'verb':
        return 'text-[#6EC1E4] font-semibold'; // Blue for verb roots
      case 'particle':
        return 'text-[#9ACD32] font-semibold'; // Green for particle roots
      case 'adjective':
        return 'text-[#FF6347] font-semibold'; // Tomato red for adjective roots
      default:
        return 'text-[#f9f9f9] font-normal';
    }
  }
};

const isSegmentInActiveRelationship = (segmentId: string, activeRelationships: string[]) => {
  if (activeRelationships.length === 0) return false;
  if (activeRelationships.includes('all')) return true;

  const segment = enhancedSegments[segmentId];
  if (!segment?.relationships) return false;

  return segment.relationships.some(rel => 
    activeRelationships.includes(rel.type) || activeRelationships.includes(rel.id)
  );
};

// Helper function to extract word and segment indices from segment ID
const parseSegmentId = (segmentId: string) => {
  const parts = segmentId.split('-');
  if (parts.length >= 4) {
    return {
      surah: parseInt(parts[0]),
      verse: parseInt(parts[1]),
      word: parseInt(parts[2]),
      segment: parseInt(parts[3])
    };
  }
  return null;
};

// Function to render segments with proper harakat handling
const renderCohesiveSegments = (segments: any[], options: {
  activeRelationships: string[];
  selectedWord: string | null;
  handleSegmentClick: (e: React.MouseEvent, segmentId: string) => void;
  getEntryByLocation: any;
}) => {
  const { activeRelationships, selectedWord, handleSegmentClick, getEntryByLocation } = options;
  
  return segments.map((segment, segmentIndex) => {
    const isInActiveRelationship = isSegmentInActiveRelationship(segment.id, activeRelationships);
    const enhancedSegment = enhancedSegments[segment.id];
    const hasRelationships = enhancedSegment?.relationships?.length > 0;
    
    // Enhanced MASAQ data lookup using proper indices
    const segmentLocation = parseSegmentId(segment.id);
    const masaqEntry = segmentLocation ? 
      getEntryByLocation(
        segmentLocation.surah, 
        segmentLocation.verse, 
        segmentLocation.word, 
        segmentLocation.segment
      ) : null;
    
    const hasMASOQData = !!masaqEntry;
    
    // Check if this is a prefix that should be attached to the next segment
    const nextSegment = segments[segmentIndex + 1];
    const shouldAttachToNext = 
      segment.type === 'prefix' && 
      nextSegment && 
      nextSegment.type === 'root' &&
      // Common Arabic prefix patterns that should be attached
      (['نَ', 'يَ', 'تَ', 'أَ', 'وَ', 'فَ', 'بِ', 'لِ', 'كِ'].includes(segment.text) ||
       segment.text.length <= 2);
    
    // Check if this is a root that should be attached to previous prefix
    const prevSegment = segments[segmentIndex - 1];
    const shouldAttachToPrev = 
      segment.type === 'root' && 
      prevSegment && 
      prevSegment.type === 'prefix' &&
      (['نَ', 'يَ', 'تَ', 'أَ', 'وَ', 'فَ', 'بِ', 'لِ', 'كِ'].includes(prevSegment.text) ||
       prevSegment.text.length <= 2);
    
    // Skip rendering if this root should be attached to previous prefix
    if (shouldAttachToPrev) {
      return null;
    }
    
    // Debug log for enhanced segments
    if (enhancedSegment && enhancedSegment !== segment) {
      console.log(`Enhanced segment ${segment.id}:`, {
        original: segment.morphology,
        enhanced: enhancedSegment.morphology,
        case: enhancedSegment.case,
        relationships: enhancedSegment.relationships?.length || 0
      });
    }
    
    // Determine the display text
    const displayText = shouldAttachToNext ? 
      segment.text + nextSegment.text : 
      segment.text;
    
    // Determine which segment ID to use for interaction
    const interactionSegmentId = shouldAttachToNext ? nextSegment.id : segment.id;
    
    return (
      <button
        key={segment.id}
        data-segment-id={interactionSegmentId}
        onClick={(e) => handleSegmentClick(e, interactionSegmentId)}
        className={cn(
          "transition-all duration-200 hover:scale-105 hover:bg-white/10 rounded-sm cursor-pointer inline-block relative",
          // Remove margins and padding that cause gaps for attached segments
          shouldAttachToNext || shouldAttachToPrev ? "px-0.5 py-1 m-0" : "px-1 py-1 m-0.5",
          getEnhancedSegmentColor(segment.morphology, segment.type, hasMASOQData),
          selectedWord === segment.id && "bg-white/20 shadow-lg scale-105 ring-2 ring-white/30",
          isInActiveRelationship && "border-2 border-current rounded-md animate-pulse",
          hasRelationships && "border-b-2 border-dotted border-current border-opacity-50"
        )}
        title={
          hasMASOQData 
            ? `Enhanced with MASAQ data (${masaqEntry.pos}${masaqEntry.lemma ? `, lemma: ${masaqEntry.lemma}` : ''})${hasRelationships ? ' - Has grammatical relationships' : ''}`
            : hasRelationships 
              ? `Has grammatical relationships - click to explore. Case: ${enhancedSegment?.case || 'unknown'}` 
              : `${segment.morphology} ${segment.type} - click for details. Case: ${enhancedSegment?.case || 'unknown'}`
        }
      >
        {displayText}
        {isInActiveRelationship && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full opacity-80 animate-ping" />
        )}
        {hasMASOQData && (
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#9ACD32] rounded-full opacity-80 shadow-sm" />
        )}
        {hasRelationships && !isInActiveRelationship && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60" />
        )}
      </button>
    );
  }).filter(Boolean); // Remove null entries
};

export const VerseDisplay = ({ 
  verse, 
  selectedWord, 
  activeRelationships, 
  onWordTap 
}: VerseDisplayProps) => {
  const { getEntryByLocation } = useMASAQData();

  const handleSegmentClick = (event: React.MouseEvent, segmentId: string) => {
    console.log('Segment clicked:', segmentId);
    event.preventDefault();
    event.stopPropagation();
    
    onWordTap(segmentId);
  };

  // Get segments that should be highlighted in translation
  const highlightedSegments = activeRelationships.length > 0 
    ? Object.keys(enhancedSegments).filter(segmentId => 
        isSegmentInActiveRelationship(segmentId, activeRelationships)
      )
    : [];

  console.log(`Verse ${verse.id} - Active relationships:`, activeRelationships);
  console.log(`Verse ${verse.id} - Highlighted segments:`, highlightedSegments);

  return (
    <div className="text-center relative">
      {/* Arabic text with enhanced morphological segment highlighting */}
      <div className="mb-4 leading-loose" dir="rtl" id="verse-container">
        <div className="text-3xl font-arabic space-x-2 space-x-reverse">
          {verse.words.map((word, wordIndex) => (
            <span key={word.id} className="inline-block">
              <span className="inline-block">
                {renderCohesiveSegments(word.segments, {
                  activeRelationships,
                  selectedWord,
                  handleSegmentClick,
                  getEntryByLocation
                })}
              </span>
              {wordIndex < verse.words.length - 1 && " "}
            </span>
          ))}
          
          {/* Enhanced verse number styling */}
          <span className="inline-flex items-center justify-center w-10 h-10 mx-3 bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black rounded-full text-sm font-bold shadow-lg ring-2 ring-[#FFD700]/30">
            {verse.id}
          </span>
        </div>
      </div>

      {/* Enhanced English translation with highlighting */}
      <TranslationHighlighter
        translation={verse.translation}
        highlightedSegments={highlightedSegments}
        verseId={verse.id}
      />
    </div>
  );
};
