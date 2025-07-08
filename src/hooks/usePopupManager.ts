
import { useState, useCallback } from 'react';
import { PopupState, MorphologicalDetails, PopupPosition, GrammaticalRelationship } from '@/types/morphology';

interface ExtendedPopupState extends PopupState {
  relationships?: GrammaticalRelationship[];
}

export const usePopupManager = () => {
  const [leftPopup, setLeftPopup] = useState<ExtendedPopupState>({
    isOpen: false,
    segment: null,
    position: null,
    activeGrammarTerm: null,
    relationships: undefined,
  });

  const [rightPopup, setRightPopup] = useState<ExtendedPopupState>({
    isOpen: false,
    segment: null,
    position: null,
    activeGrammarTerm: null,
    relationships: undefined,
  });

  const [relationshipPopup, setRelationshipPopup] = useState<ExtendedPopupState>({
    isOpen: false,
    segment: null,
    position: null,
    activeGrammarTerm: null,
    relationships: undefined,
  });

  const calculatePosition = useCallback((element: HTMLElement, preferredSide: 'left' | 'right'): PopupPosition => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate available space on each side
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    
    let side: 'left' | 'right' | 'above' | 'below' = preferredSide;
    let x: number;
    let y: number;
    
    // Position popup well outside the text area
    if (preferredSide === 'left' && spaceLeft > 350) {
      // Position on the left with significant margin
      x = Math.max(20, rect.left - 340);
      side = 'left';
    } else if (preferredSide === 'right' && spaceRight > 350) {
      // Position on the right with significant margin
      x = Math.min(viewportWidth - 340, rect.right + 40);
      side = 'right';
    } else {
      // Not enough horizontal space, position vertically
      if (spaceBottom > 400) {
        // Position below the element
        x = Math.max(20, Math.min(viewportWidth - 340, rect.left));
        y = rect.bottom + 20;
        return { x, y, side: 'below' };
      } else if (spaceTop > 400) {
        // Position above the element
        x = Math.max(20, Math.min(viewportWidth - 340, rect.left));
        y = rect.top - 420;
        return { x, y, side: 'above' };
      } else {
        // Fall back to side positioning with best available space
        if (spaceLeft > spaceRight) {
          x = Math.max(20, rect.left - 340);
          side = 'left';
        } else {
          x = Math.min(viewportWidth - 340, rect.right + 40);
          side = 'right';
        }
      }
    }
    
    // Vertical positioning - keep popup within viewport
    y = Math.max(20, Math.min(viewportHeight - 420, rect.top - 50));
    
    return { x, y, side };
  }, []);

  const openMorphologyPopup = useCallback((segment: MorphologicalDetails, element: HTMLElement) => {
    const position = calculatePosition(element, 'left');
    
    setLeftPopup({
      isOpen: true,
      segment,
      position,
      activeGrammarTerm: null,
      relationships: undefined,
    });
  }, [calculatePosition]);

  const openGrammarPopup = useCallback((grammarTerm: string, element: HTMLElement) => {
    const position = calculatePosition(element, 'right');
    
    setRightPopup({
      isOpen: true,
      segment: null,
      position,
      activeGrammarTerm: grammarTerm,
      relationships: undefined,
    });
  }, [calculatePosition]);

  const openRelationshipPopup = useCallback((relationships: GrammaticalRelationship[], element: HTMLElement) => {
    const position = calculatePosition(element, 'right');
    
    setRelationshipPopup({
      isOpen: true,
      segment: null,
      position,
      activeGrammarTerm: null,
      relationships,
    });
  }, [calculatePosition]);

  const closePopups = useCallback(() => {
    setLeftPopup(prev => ({ ...prev, isOpen: false }));
    setRightPopup(prev => ({ ...prev, isOpen: false }));
    setRelationshipPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeLeftPopup = useCallback(() => {
    setLeftPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeRightPopup = useCallback(() => {
    setRightPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeRelationshipPopup = useCallback(() => {
    setRelationshipPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
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
  };
};
