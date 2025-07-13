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
 * - Comprehensive debugging and error handling
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';
import { ensureSegmentArray, getSegmentsLength } from '@/utils/segmentUtils';

// Debugging helper - logs with timestamp and component prefix
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`🔍 [${timestamp}][ComponentSelection] ${message}`, data || '');
};

// Error handler - logs errors and shows toast notification
const handleError = (method: string, error: any) => {
  console.error(`❌ [ComponentSelection][${method}] Error:`, error);
  toast({
    title: 'Component Selection Error',
    description: `Error in ${method}: ${error.message || 'Unknown error'}`,
    variant: 'destructive'
  });
  return error; // For re-throwing if needed
};
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
  selectAndAssignRole: (role: ComponentRole) => void; 
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
  segments: MorphologicalDetails[] | Record<string, MorphologicalDetails>
): UseComponentSelectionReturn {
  // Convert segments to array using our utility function
  const segmentsArray: MorphologicalDetails[] = ensureSegmentArray(segments);
  
  // Debug the segment format conversion
  debugLog(`Initialized segmentsArray with ${segmentsArray.length} items from ${Array.isArray(segments) ? 'array' : 'object'} format`);
  
  const [state, setState] = useState<ComponentSelectionState>({
    selectedWordIndices: [],
    assignedComponents: [],
    constructions: [],
    currentRole: null
  });

  // Word Selection Methods
  const toggleWordSelection = useCallback((wordIndex: number) => {
    try {
      debugLog(`toggleWordSelection(${wordIndex}) called`);
      
      const arrayLength = segmentsArray.length;
      debugLog(`Current segmentsArray length: ${arrayLength}`);
      
      if (wordIndex < 0 || wordIndex >= arrayLength) {
        throw new Error(`Word index ${wordIndex} is out of bounds (0-${arrayLength-1})`);
      }
      
      setState(prev => {
        const isSelected = prev.selectedWordIndices.includes(wordIndex);
        const action = isSelected ? 'removing' : 'adding';
        debugLog(`${action} word at index ${wordIndex} ${isSelected ? 'from' : 'to'} selection`, {
          wordData: segmentsArray[wordIndex],
          currentSelection: [...prev.selectedWordIndices]
        });
        
        const newSelected = isSelected
          ? prev.selectedWordIndices.filter(i => i !== wordIndex)
          : [...prev.selectedWordIndices, wordIndex];
        
        debugLog(`selection after toggle:`, newSelected);
        
        return {
          ...prev,
          selectedWordIndices: newSelected
        };
      });
    } catch (error) {
      handleError('toggleWordSelection', error);
    }
  }, [segmentsArray]);

  const clearWordSelection = useCallback(() => {
    try {
      debugLog('clearWordSelection() called');
      setState(prev => ({
        ...prev,
        selectedWordIndices: []
      }));
      debugLog('Word selection cleared');
    } catch (error) {
      handleError('clearWordSelection', error);
    }
  }, []);

  const isWordSelected = useCallback((wordIndex: number) => {
    try {
      return state.selectedWordIndices.includes(wordIndex);
    } catch (error) {
      handleError('isWordSelected', error);
      return false;
    }
  }, [state.selectedWordIndices]);

  // Role Selection & Assignment Methods
  const selectRole = useCallback((role: ComponentRole) => {
    try {
      debugLog(`selectRole(${role}) called`);
      
      // Check if we can automatically assign this role to selected words
      const autoAssign = true; // Feature flag for auto-assign behavior
      
      setState(prev => {
        // Update the current role
        const newState = {
          ...prev,
          currentRole: role
        };
        
        debugLog(`Role selected: ${role}`);
        return newState;
      });
      
    } catch (error) {
      handleError('selectRole', error);
    }
  }, []);

  // Check for role conflicts in existing components
  const getConflictingComponents = useCallback((wordIndices: number[], role: ComponentRole): ComponentSelection[] => {
    try {
      const conflicts = state.assignedComponents.filter(comp => {
        // If this component has a different role but shares any words, it's a conflict
        if (comp.role !== role && wordIndices.some(idx => comp.wordIndex === idx)) {
          return true;
        }
        return false;
      });
      
      if (conflicts.length > 0) {
        debugLog(`Found ${conflicts.length} conflicting component(s) for role ${role}:`, conflicts);
      }
      
      return conflicts;
    } catch (error) {
      handleError('getConflictingComponents', error);
      return [];
    }
  }, [state.assignedComponents]);

  const assignRoleToSelectedWords = useCallback(() => {
    try {
      debugLog('assignRoleToSelectedWords() called');
      
      if (!state.currentRole) {
        throw new Error('No role selected for assignment');
      }
      
      if (state.selectedWordIndices.length === 0) {
        throw new Error('No words selected for role assignment');
      }
      
      // Verify the role can be applied to these words by construction type rules
      const allComponents = [...state.assignedComponents];
      const conflicts = getConflictingComponents(state.selectedWordIndices, state.currentRole);
      
      if (conflicts.length > 0) {
        // Remove conflicting components before adding new ones
        debugLog(`Removing ${conflicts.length} conflicting components before assignment`);
        conflicts.forEach(conflict => {
          const idx = allComponents.findIndex(c => c.componentId === conflict.componentId);
          if (idx !== -1) {
            allComponents.splice(idx, 1);
          }
        });
      }
      
      // Create new components for each selected word
      const newComponents = state.selectedWordIndices.map(wordIndex => {
        // Check if this word already has this exact role assigned
        const existingComponent = state.assignedComponents.find(
          comp => comp.wordIndex === wordIndex && comp.role === state.currentRole
        );
        
        // If it does, reuse that component ID, otherwise generate a new one
        const componentId = existingComponent?.componentId || `comp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        return {
          componentId,
          wordIndex,
          role: state.currentRole as ComponentRole,
          createdAt: Date.now()
        };
      });
      
      // Remove any existing components that have the exact same word+role pairs
      // This prevents duplicates if the user reassigns the same role
      const deduplicatedComponents = [...allComponents];
      newComponents.forEach(newComp => {
        const duplicateIdx = deduplicatedComponents.findIndex(
          comp => comp.wordIndex === newComp.wordIndex && comp.role === newComp.role
        );
        if (duplicateIdx !== -1) {
          deduplicatedComponents.splice(duplicateIdx, 1);
        }
      });
      
      // Combine existing and new components
      const updatedComponents = [...deduplicatedComponents, ...newComponents];
      
      // Try to form constructions with the updated components
      const updatedConstructions = formConstructions(updatedComponents);
      
      debugLog(`Assigned role ${state.currentRole} to ${state.selectedWordIndices.length} words`, {
        selectedWords: [...state.selectedWordIndices],
        newComponents,
        updatedComponents,
        updatedConstructions
      });
      
      // Update state with new components and constructions
      setState(prev => ({
        ...prev,
        assignedComponents: updatedComponents,
        constructions: updatedConstructions,
        // Don't clear selection automatically
        // selectedWordIndices: []
      }));
    } catch (error) {
      handleError('assignRoleToSelectedWords', error);
    }
  }, [state.currentRole, state.selectedWordIndices, state.assignedComponents, getConflictingComponents]);

  // Combined method to select a role and assign it to selected words in one call
  const selectAndAssignRole = useCallback((role: ComponentRole) => {
    try {
      debugLog(`selectAndAssignRole(${role}) called`);
      
      // First select the role
      selectRole(role);
      
      // Then perform the assignment
      // We need to manually update state in between due to useState batching
      setState(prev => {
        const updatedState = {
          ...prev,
          currentRole: role
        };
        
        // Only if we have selected words, proceed with assignment
        if (prev.selectedWordIndices.length > 0) {
          const conflicts = getConflictingComponents(prev.selectedWordIndices, role);
          
          // Remove conflicting components
          let updatedComponents = [...prev.assignedComponents];
          if (conflicts.length > 0) {
            updatedComponents = updatedComponents.filter(comp => 
              !conflicts.some(c => c.componentId === comp.componentId)
            );
          }
          
          // Create new components for each selected word
          const newComponents = prev.selectedWordIndices.map(wordIndex => ({
            componentId: `comp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            wordIndex,
            role,
            createdAt: Date.now()
          }));
          
          // Remove duplicates
          newComponents.forEach(newComp => {
            const duplicateIdx = updatedComponents.findIndex(
              comp => comp.wordIndex === newComp.wordIndex && comp.role === newComp.role
            );
            if (duplicateIdx !== -1) {
              updatedComponents.splice(duplicateIdx, 1);
            }
          });
          
          // Combine components
          const finalComponents = [...updatedComponents, ...newComponents];
          
          // Try to form constructions
          const updatedConstructions = formConstructions(finalComponents);
          
          return {
            ...updatedState,
            assignedComponents: finalComponents,
            constructions: updatedConstructions,
            // Don't clear selection automatically
            // selectedWordIndices: []
          };
        }
        
        return updatedState;
      });
      
    } catch (error) {
      handleError('selectAndAssignRole', error);
    }
  }, [selectRole, getConflictingComponents]);

  // Helper to form constructions from components
  const formConstructions = useCallback((components: ComponentSelection[]): ComponentConstruction[] => {
    try {
      debugLog('formConstructions() called with components:', components);
      
      const constructions: ComponentConstruction[] = [];
      
      // Group components by construction type using the role
      const componentsByType: Record<string, ComponentSelection[]> = {};
      
      components.forEach(comp => {
        const constructionType = getConstructionTypeForRole(comp.role);
        if (!componentsByType[constructionType]) {
          componentsByType[constructionType] = [];
        }
        componentsByType[constructionType].push(comp);
      });
      
      // For each construction type, check if we have all required roles
      Object.entries(componentsByType).forEach(([type, comps]) => {
        const requiredRoles = CONSTRUCTION_COMPONENT_ROLES[type as keyof typeof CONSTRUCTION_COMPONENT_ROLES];
        
        if (!requiredRoles) {
          debugLog(`Unknown construction type: ${type}, skipping`);
          return;
        }
        
        // Get components by role for this construction type
        const componentsByRole: Record<string, ComponentSelection[]> = {};
        requiredRoles.forEach(role => {
          componentsByRole[role] = comps.filter(c => c.role === role);
        });
        
        // Check if we have at least one component for each required role
        const hasAllRoles = requiredRoles.every(role => componentsByRole[role]?.length > 0);
        
        // If we have all roles, we can form a construction
        if (hasAllRoles) {
          // Create a unique ID for this construction
          const id = `construction-${Date.now()}-${Math.random().toString(36).slice(2)}`;
          
          // Flatten all components for this construction
          const allComponents = requiredRoles.flatMap(role => componentsByRole[role]);
          
          constructions.push({
            id,
            type: type as keyof typeof CONSTRUCTION_COMPONENT_ROLES,
            components: allComponents,
            isComplete: true,
            createdAt: Date.now()
          });
          
          debugLog(`Formed complete construction of type ${type}:`, {
            components: allComponents,
            byRole: componentsByRole
          });
        } else {
          // We have some components but not a complete construction
          // Let's track it as incomplete
          const id = `incomplete-${type}-${Date.now()}`;
          
          constructions.push({
            id,
            type: type as keyof typeof CONSTRUCTION_COMPONENT_ROLES,
            components: comps,
            isComplete: false,
            createdAt: Date.now()
          });
          
          const missingRoles = requiredRoles.filter(role => !componentsByRole[role]?.length);
          debugLog(`Formed incomplete construction of type ${type}, missing roles: ${missingRoles.join(', ')}`, {
            components: comps,
            byRole: componentsByRole
          });
        }
      });
      
      return constructions;
    } catch (error) {
      handleError('formConstructions', error);
      return [];
    }
  }, []);

  // Remove a component assignment by word index
  const removeComponentAssignment = useCallback((wordIndex: number) => {
    try {
      debugLog(`removeComponentAssignment(${wordIndex}) called`);
      
      setState(prev => {
        // Find components that include this word
        const affectedComponents = prev.assignedComponents.filter(comp => comp.wordIndex === wordIndex);
        
        if (affectedComponents.length === 0) {
          debugLog(`No components found for word at index ${wordIndex}`);
          return prev;
        }
        
        // Remove the affected components
        const updatedComponents = prev.assignedComponents.filter(comp => comp.wordIndex !== wordIndex);
        
        // Update constructions based on the new component list
        const updatedConstructions = formConstructions(updatedComponents);
        
        debugLog(`Removed ${affectedComponents.length} component(s) for word at index ${wordIndex}`, {
          removedComponents: affectedComponents,
          remainingComponents: updatedComponents,
          updatedConstructions
        });
        
        return {
          ...prev,
          assignedComponents: updatedComponents,
          constructions: updatedConstructions
        };
      });
    } catch (error) {
      handleError('removeComponentAssignment', error);
    }
  }, [formConstructions]);

  // Get role assigned to a word, if any
  const getWordRole = useCallback((wordIndex: number): ComponentRole | null => {
    try {
      const component = state.assignedComponents.find(comp => comp.wordIndex === wordIndex);
      return component?.role || null;
    } catch (error) {
      handleError('getWordRole', error);
      return null;
    }
  }, [state.assignedComponents]);

  // Construction Methods
  const getCompletedConstructions = useCallback(() => {
    try {
      debugLog('getCompletedConstructions() called');
      const completed = state.constructions.filter(c => c.isComplete);
      debugLog(`Found ${completed.length} completed constructions`);
      return completed;
    } catch (error) {
      handleError('getCompletedConstructions', error);
      return [];
    }
  }, [state.constructions]);

  const getIncompleteConstructions = useCallback(() => {
    try {
      debugLog('getIncompleteConstructions() called');
      const incomplete = state.constructions.filter(c => !c.isComplete);
      debugLog(`Found ${incomplete.length} incomplete constructions`);
      return incomplete;
    } catch (error) {
      handleError('getIncompleteConstructions', error);
      return [];
    }
  }, [state.constructions]);

  const canSubmitAnswer = useCallback(() => {
    try {
      const completedConstructions = getCompletedConstructions();
      return completedConstructions.length > 0;
    } catch (error) {
      handleError('canSubmitAnswer', error);
      return false;
    }
  }, [getCompletedConstructions]);

  // Reset method
  const reset = useCallback(() => {
    try {
      debugLog('reset() called');
      setState({
        selectedWordIndices: [],
        assignedComponents: [],
        constructions: [],
        currentRole: null
      });
      debugLog('Component selection state reset');
    } catch (error) {
      handleError('reset', error);
    }
  }, []);

  const getComponentsByRole = useCallback((role: ComponentRole) => {
    try {
      debugLog(`getComponentsByRole(${role}) called`);
      const components = state.assignedComponents.filter(comp => comp.role === role);
      debugLog(`Found ${components.length} components with role ${role}:`, components);
      return components;
    } catch (error) {
      handleError('getComponentsByRole', error);
      return [];
    }
  }, [state.assignedComponents]);

  const getConstructionProgress = useCallback(() => {
    try {
      debugLog('getConstructionProgress() called');
      const progress: Record<string, { completed: number; total: number }> = {};
      
      Object.entries(CONSTRUCTION_COMPONENT_ROLES).forEach(([constructionType, requiredRoles]) => {
        try {
          const constructionsOfType = state.constructions.filter(c => c.type === constructionType);
          const completed = constructionsOfType.filter(c => c.isComplete).length;
          const total = constructionsOfType.length;
          
          progress[constructionType] = { completed, total };
          
          debugLog(`Progress for ${constructionType}: ${completed}/${total} complete`);
        } catch (typeError) {
          debugLog(`Error calculating progress for ${constructionType}:`, typeError);
          progress[constructionType] = { completed: 0, total: 0 };
        }
      });
      
      debugLog('Construction progress summary:', progress);
      return progress;
    } catch (error) {
      handleError('getConstructionProgress', error);
      return {};
    }
  }, [state.constructions]);

  // Helper function to check if a new role is compatible with existing components
  // This ensures we don't mix components from different construction types
  const isRoleCompatibleWithExistingComponents = useCallback((role: ComponentRole, existingComponents: ComponentSelection[]): boolean => {
    try {
      if (existingComponents.length === 0) {
        // No existing components, any role is allowed
        return true;
      }

      // Get the construction type for the new role
      const newRoleConstructionType = getConstructionTypeForRole(role);
      
      // Get existing component roles and their construction types
      const existingRoles = new Set(existingComponents.map(comp => comp.role));
      
      // Check if any existing components are already assigned a role
      for (const existingRole of existingRoles) {
        const existingConstructionType = getConstructionTypeForRole(existingRole);
        
        // If the construction types don't match, this role is incompatible
        if (existingConstructionType !== newRoleConstructionType) {
          debugLog(`Role ${role} (${newRoleConstructionType}) is incompatible with existing ${existingRole} (${existingConstructionType})`);
          return false;
        }
      }
      
      // All checks passed, the role is compatible
      return true;
    } catch (error) {
      handleError('isRoleCompatibleWithExistingComponents', error);
      return false;
    }
  }, []);

  // Memoized values
  const memoizedReturn = useMemo(() => ({
    state,
    toggleWordSelection,
    clearWordSelection,
    isWordSelected,
    selectRole,
    assignRoleToSelectedWords,
    selectAndAssignRole, 
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
    selectAndAssignRole, 
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
