/**
 * Component Selection Hook
 * 
 * Manages granular component selection state for grammar quiz.
 * Handles individual word-role assignments and construction formation.
 * 
 * Features:
 * - Component selection and assignment
 * - Construction completion tracking
 * - Role validation and conflict detection
 * - State persistence during quiz session
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  ComponentRole, 
  ComponentSelection, 
  ComponentConstruction,
  CONSTRUCTION_COMPONENT_ROLES,
  getConstructionTypeForRole 
} from '@/types/grammarQuiz';
import { MorphologicalDetails } from '@/types/morphology';

export interface ComponentSelectionState {
  selectedWordIndices: number[];        // Currently selected words (for role assignment)
  assignedComponents: ComponentSelection[]; // Words with assigned roles
  constructions: ComponentConstruction[];   // Formed constructions
  currentRole: ComponentRole | null;       // Currently selected role
}

export interface UseComponentSelectionReturn {
  // State
  state: ComponentSelectionState;
  
  // Word Selection
  toggleWordSelection: (wordIndex: number) => void;
  clearWordSelection: () => void;
  isWordSelected: (wordIndex: number) => boolean;
  
  // Role Assignment
  selectRole: (role: ComponentRole) => void;
  assignRoleToSelectedWords: () => void;
  removeComponentAssignment: (wordIndex: number) => void;
  getWordRole: (wordIndex: number) => ComponentRole | null;
  
  // Construction Management
  getCompletedConstructions: () => ComponentConstruction[];
  getIncompleteConstructions: () => ComponentConstruction[];
  canSubmitAnswer: () => boolean;
  
  // Utilities
  reset: () => void;
  getComponentsByRole: (role: ComponentRole) => ComponentSelection[];
  getConstructionProgress: () => Record<string, { completed: number; total: number }>;
}

export function useComponentSelection(
  segments: MorphologicalDetails[]
): UseComponentSelectionReturn {
  
  const [state, setState] = useState<ComponentSelectionState>({
    selectedWordIndices: [],
    assignedComponents: [],
    constructions: [],
    currentRole: null
  });

  // Word Selection Methods
  const toggleWordSelection = useCallback((wordIndex: number) => {
    setState(prev => {
      const isSelected = prev.selectedWordIndices.includes(wordIndex);
      const newSelected = isSelected
        ? prev.selectedWordIndices.filter(i => i !== wordIndex)
        : [...prev.selectedWordIndices, wordIndex];
      
      return {
        ...prev,
        selectedWordIndices: newSelected
      };
    });
  }, []);

  const clearWordSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedWordIndices: []
    }));
  }, []);

  const isWordSelected = useCallback((wordIndex: number) => {
    return state.selectedWordIndices.includes(wordIndex);
  }, [state.selectedWordIndices]);

  // Role Assignment Methods
  const selectRole = useCallback((role: ComponentRole) => {
    setState(prev => ({
      ...prev,
      currentRole: prev.currentRole === role ? null : role
    }));
  }, []);

  const assignRoleToSelectedWords = useCallback(() => {
    if (!state.currentRole || state.selectedWordIndices.length === 0) return;

    setState(prev => {
      const constructionType = getConstructionTypeForRole(prev.currentRole!);
      
      // Remove any existing assignments for these words
      const filteredComponents = prev.assignedComponents.filter(
        comp => !prev.selectedWordIndices.includes(comp.wordIndex)
      );

      // Create new component assignments
      const newComponents: ComponentSelection[] = prev.selectedWordIndices.map(wordIndex => ({
        wordIndex,
        wordId: segments[wordIndex]?.id || `word-${wordIndex}`,
        role: prev.currentRole!,
        constructionId: `${constructionType}-${Date.now()}` // Temporary ID
      }));

      const allComponents = [...filteredComponents, ...newComponents];

      // Rebuild constructions based on updated components
      const constructions = buildConstructions(allComponents);

      return {
        ...prev,
        assignedComponents: allComponents,
        constructions,
        selectedWordIndices: [], // Clear selection after assignment
        currentRole: null        // Clear role selection
      };
    });
  }, [state.currentRole, state.selectedWordIndices, segments]);

  const removeComponentAssignment = useCallback((wordIndex: number) => {
    setState(prev => {
      const filteredComponents = prev.assignedComponents.filter(
        comp => comp.wordIndex !== wordIndex
      );
      
      const constructions = buildConstructions(filteredComponents);
      
      return {
        ...prev,
        assignedComponents: filteredComponents,
        constructions
      };
    });
  }, []);

  const getWordRole = useCallback((wordIndex: number): ComponentRole | null => {
    const component = state.assignedComponents.find(comp => comp.wordIndex === wordIndex);
    return component?.role || null;
  }, [state.assignedComponents]);

  // Construction Management
  const buildConstructions = useCallback((components: ComponentSelection[]): ComponentConstruction[] => {
    const constructionGroups = new Map<string, ComponentSelection[]>();
    
    // Group components by construction type
    components.forEach(component => {
      const constructionType = getConstructionTypeForRole(component.role);
      const key = constructionType;
      
      if (!constructionGroups.has(key)) {
        constructionGroups.set(key, []);
      }
      constructionGroups.get(key)!.push(component);
    });

    // Create constructions from groups
    const constructions: ComponentConstruction[] = [];
    
    constructionGroups.forEach((components, constructionType) => {
      const requiredRoles = CONSTRUCTION_COMPONENT_ROLES[constructionType as keyof typeof CONSTRUCTION_COMPONENT_ROLES];
      const roleCount = new Map<ComponentRole, number>();
      
      // Count components by role
      components.forEach(comp => {
        roleCount.set(comp.role, (roleCount.get(comp.role) || 0) + 1);
      });
      
      // Create multiple constructions if we have multiple complete sets
      const maxSets = Math.min(...requiredRoles.map(role => roleCount.get(role) || 0));
      
      for (let setIndex = 0; setIndex < Math.max(1, maxSets); setIndex++) {
        const constructionComponents: ComponentSelection[] = [];
        const roleComponentsUsed = new Map<ComponentRole, number>();
        
        // Collect one component of each required role
        requiredRoles.forEach(role => {
          const roleComponents = components.filter(comp => comp.role === role);
          const usedCount = roleComponentsUsed.get(role) || 0;
          
          if (roleComponents[usedCount]) {
            constructionComponents.push(roleComponents[usedCount]);
            roleComponentsUsed.set(role, usedCount + 1);
          }
        });
        
        const isComplete = constructionComponents.length === requiredRoles.length;
        
        if (constructionComponents.length > 0) { // Only add if we have at least one component
          constructions.push({
            id: `${constructionType}-${setIndex}`,
            type: constructionType as any,
            components: constructionComponents,
            isComplete
          });
        }
      }
    });

    return constructions;
  }, []);

  const getCompletedConstructions = useCallback(() => {
    return state.constructions.filter(construction => construction.isComplete);
  }, [state.constructions]);

  const getIncompleteConstructions = useCallback(() => {
    return state.constructions.filter(construction => !construction.isComplete);
  }, [state.constructions]);

  const canSubmitAnswer = useCallback(() => {
    return getCompletedConstructions().length > 0;
  }, [getCompletedConstructions]);

  // Utility Methods
  const reset = useCallback(() => {
    setState({
      selectedWordIndices: [],
      assignedComponents: [],
      constructions: [],
      currentRole: null
    });
  }, []);

  const getComponentsByRole = useCallback((role: ComponentRole) => {
    return state.assignedComponents.filter(comp => comp.role === role);
  }, [state.assignedComponents]);

  const getConstructionProgress = useCallback(() => {
    const progress: Record<string, { completed: number; total: number }> = {};
    
    Object.entries(CONSTRUCTION_COMPONENT_ROLES).forEach(([constructionType, requiredRoles]) => {
      const constructionsOfType = state.constructions.filter(c => c.type === constructionType);
      const completed = constructionsOfType.filter(c => c.isComplete).length;
      const total = constructionsOfType.length;
      
      progress[constructionType] = { completed, total };
    });
    
    return progress;
  }, [state.constructions]);

  // Memoized values
  const memoizedReturn = useMemo(() => ({
    state,
    toggleWordSelection,
    clearWordSelection,
    isWordSelected,
    selectRole,
    assignRoleToSelectedWords,
    removeComponentAssignment,
    getWordRole,
    getCompletedConstructions,
    getIncompleteConstructions,
    canSubmitAnswer,
    reset,
    getComponentsByRole,
    getConstructionProgress
  }), [
    state,
    toggleWordSelection,
    clearWordSelection,
    isWordSelected,
    selectRole,
    assignRoleToSelectedWords,
    removeComponentAssignment,
    getWordRole,
    getCompletedConstructions,
    getIncompleteConstructions,
    canSubmitAnswer,
    reset,
    getComponentsByRole,
    getConstructionProgress
  ]);

  return memoizedReturn;
}
