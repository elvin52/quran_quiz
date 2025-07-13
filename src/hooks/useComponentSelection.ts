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
  // Convert segments to array if they are in object format
  const segmentsArray: MorphologicalDetails[] = Array.isArray(segments)
    ? segments
    : Object.values(segments);
  
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
      
      if (wordIndex < 0 || wordIndex >= segments.length) {
        throw new Error(`Word index ${wordIndex} is out of bounds (0-${segments.length-1})`);
      }
      
      setState(prev => {
        const isSelected = prev.selectedWordIndices.includes(wordIndex);
        const action = isSelected ? 'removing' : 'adding';
        debugLog(`${action} word at index ${wordIndex} ${isSelected ? 'from' : 'to'} selection`, {
          wordData: segments[wordIndex],
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
  }, [segments.length]);

  const clearWordSelection = useCallback(() => {
    try {
      debugLog('clearWordSelection() called', { currentSelection: [...state.selectedWordIndices] });
      setState(prev => {
        debugLog('clearing word selection', { before: prev.selectedWordIndices });
        return {
          ...prev,
          selectedWordIndices: []
        };
      });
      debugLog('word selection cleared');
    } catch (error) {
      handleError('clearWordSelection', error);
    }
  }, [state.selectedWordIndices]);

  const isWordSelected = useCallback((wordIndex: number) => {
    try {
      if (wordIndex < 0 || wordIndex >= segments.length) {
        throw new Error(`Word index ${wordIndex} is out of bounds (0-${segments.length-1})`);
      }
      const isSelected = state.selectedWordIndices.includes(wordIndex);
      debugLog(`isWordSelected(${wordIndex}) => ${isSelected}`, { wordData: segments[wordIndex] });
      return isSelected;
    } catch (error) {
      handleError('isWordSelected', error);
      return false;
    }
  }, [state.selectedWordIndices, segments]);

  // Role Assignment Methods
  const selectRole = useCallback((role: ComponentRole) => {
    try {
      debugLog(`selectRole(${role}) called`, { 
        currentRole: state.currentRole,
        selectedWords: state.selectedWordIndices,
        role: role 
      });
      
      setState(prev => {
        const newRole = prev.currentRole === role ? null : role;
        debugLog(`role selection ${newRole === null ? 'cleared' : 'changed to ' + newRole}`, {
          before: prev.currentRole,
          after: newRole
        });
        
        return {
          ...prev,
          currentRole: newRole
        };
      });
    } catch (error) {
      handleError('selectRole', error);
    }
  }, [state.currentRole, state.selectedWordIndices]);

  // Construction Management
  const buildConstructions = useCallback((components: ComponentSelection[]): ComponentConstruction[] => {
    try {
      debugLog('buildConstructions called with components:', components);
      
      // Step 1: Group by construction ID
      const componentGroups: Record<string, ComponentSelection[]> = {};
      
      components.forEach(component => {
        const { constructionId } = component;
        debugLog(`Processing component with constructionId: ${constructionId}`, component);
        
        // Create a new component group if needed
        if (!componentGroups[constructionId]) {
          debugLog(`Creating new component group for constructionId: ${constructionId}`);
          componentGroups[constructionId] = [];
        }
        
        // Add component to its group
        debugLog(`Added component to group ${constructionId}`, component);
        componentGroups[constructionId].push(component);
      });
      
      debugLog(`Grouped ${components.length} components into ${Object.keys(componentGroups).length} construction groups`);
      
      // Step 2: Convert each group to a Construction object
      const constructions: ComponentConstruction[] = [];
      
      for (const [constructionId, groupComponents] of Object.entries(componentGroups)) {
        debugLog(`Processing component group ${constructionId} with ${groupComponents.length} components`);
        
        // Use the first component's role to determine construction type
        // This is safe since all components in a group belong to the same construction type
        const firstComponent = groupComponents[0];
        const constructionType = getConstructionTypeForRole(firstComponent.role);
        
        debugLog(`Determined construction type: ${constructionType} from role ${firstComponent.role}`);
        
        // Get present roles in this group
        const presentRoles = Array.from(new Set(groupComponents.map(c => c.role)));
        debugLog(`Present roles in group:`, presentRoles);
        
        // Get required roles for this construction type
        const requiredRoles = CONSTRUCTION_COMPONENT_ROLES[constructionType];
        debugLog(`Required roles for ${constructionType}:`, requiredRoles);
        
        // IMPROVED: Construction is complete if ALL required roles are present
        // CRITICAL: We need to check that every required role exists at least once
        const isComplete = requiredRoles.every(role => presentRoles.includes(role));
        
        // Compute word indices based on components (handle both mudaf-mudaf-ilayh and other types)
        const wordIndices = groupComponents.map(c => c.wordIndex).sort((a, b) => a - b);
        
        debugLog(`Construction ${constructionId} completeness: ${isComplete}`);
        
        const construction: ComponentConstruction = {
          id: constructionId,
          type: constructionType,
          components: groupComponents,
          wordIndices,
          isComplete
        };
        
        debugLog(`Added construction to results:`, construction);
        constructions.push(construction);
      }
      
      debugLog(`Built ${constructions.length} constructions:`, constructions);
      
      // Special debug for completed constructions
      const completed = constructions.filter(c => c.isComplete);
      debugLog(`Found ${completed.length} complete constructions:`, completed);
      
      return constructions;
    } catch (error) {
      handleError('buildConstructions', error);
      return [];
    }
  }, []);

  // Atomic operation that combines role selection and assignment in one operation
  // This fixes the early return bug in auto-assign mode by ensuring the role is available
  // during the assignment process without relying on state updates between function calls
  const selectAndAssignRole = useCallback((role: ComponentRole) => {
    try {
      debugLog(`selectAndAssignRole(${role}) called - ATOMIC OPERATION`, state);
      
      // Only proceed if we have selected indices
      if (state.selectedWordIndices.length === 0) {
        debugLog('Cannot assign role: no words selected');
        toast({
          title: 'Word Selection Required',
          description: 'Please select one or more words before assigning a role',
          variant: 'default'
        });
        return;
      }
      
      // Validate that selected indices are in bounds
      const invalidIndices = state.selectedWordIndices.filter(idx => idx < 0 || idx >= segments.length);
      if (invalidIndices.length > 0) {
        throw new Error(`Invalid word indices selected: ${invalidIndices.join(', ')}`);
      }
      
      setState(prev => {
        try {
          // Filter out components with the same word indices AND role (overwrite)
          debugLog('Filtering out existing components with same indices and role');
          const filteredComponents = prev.assignedComponents.filter(
            comp => !prev.selectedWordIndices.includes(comp.wordIndex) || comp.role !== role
          );
          debugLog('Filtered existing components:', filteredComponents);

          const constructionType = getConstructionTypeForRole(role);
          debugLog(`Determined construction type: ${constructionType} from role ${role}`);

          // IMPROVED LOGIC: Find ALL components of this construction type
          const existingComponents = prev.assignedComponents.filter(comp => 
            getConstructionTypeForRole(comp.role) === constructionType
          );
          const constructionId = existingComponents.length > 0 
            ? existingComponents[0].constructionId 
            : `${constructionType}-${Date.now()}`;
            
          debugLog(`${existingComponents.length > 0 ? 'Reusing existing' : 'Generated new'} constructionId: ${constructionId}`);
          
          const newComponents: ComponentSelection[] = prev.selectedWordIndices.map(wordIndex => {
            const wordData = segments[wordIndex];
            debugLog(`Creating component for word index ${wordIndex}:`, wordData);
            
            return {
              wordIndex,
              wordId: wordData?.id || `word-${wordIndex}`,
              role: role,
              constructionId // Use the same ID for all components in this construction type
            };
          });
          debugLog(`Created ${newComponents.length} new components:`, newComponents);

          const allComponents = [...filteredComponents, ...newComponents];
          debugLog(`Total components after merge: ${allComponents.length}`);

          // Rebuild constructions based on updated components
          debugLog('Rebuilding constructions with updated components');
          const constructions = buildConstructions(allComponents);
          debugLog(`Built ${constructions.length} constructions:`, constructions);
          
          // Count completions by type
          const completedByType: Record<string, number> = {};
          constructions.forEach(c => {
            if (c.isComplete) {
              completedByType[c.type] = (completedByType[c.type] || 0) + 1;
            }
          });
          
          const completedCount = constructions.filter(c => c.isComplete).length;
          debugLog(`Found ${completedCount} complete constructions:`, completedByType);

          // Atomic operation: both update the role AND assign the components
          return {
            ...prev,
            currentRole: role, // Set the current role as part of the atomic operation
            // DON'T clear selection - keep words selected so user can continue building construction
            // This fixes the selection flow: word stays selected after role assignment
            // selectedWordIndices: [], // Clear selection after assignment
            assignedComponents: allComponents, // Update assigned components
            constructions: constructions // Update constructions
          };
        } catch (assignError) {
          handleError('selectAndAssignRole.setState', assignError);
          // Return unchanged state on error
          return prev;
        }
      });
    } catch (error) {
      handleError('selectAndAssignRole', error);
    }
  }, [state.selectedWordIndices, segments, buildConstructions]);

  const assignRoleToSelectedWords = useCallback(() => {
    try {
      debugLog('assignRoleToSelectedWords called', {
        role: state.currentRole,
        selectedIndices: [...state.selectedWordIndices]
      });
      
      if (!state.currentRole) {
        debugLog('Cannot assign role: no role selected');
        toast({
          title: 'Role Selection Required',
          description: 'Please select a grammatical role before assignment',
          variant: 'default'
        });
        return;
      }
      
      if (state.selectedWordIndices.length === 0) {
        debugLog('Cannot assign role: no words selected');
        toast({
          title: 'Word Selection Required',
          description: 'Please select one or more words before assigning a role',
          variant: 'default'
        });
        return;
      }

      // Validate that selected indices are in bounds
      const invalidIndices = state.selectedWordIndices.filter(idx => idx < 0 || idx >= segments.length);
      if (invalidIndices.length > 0) {
        throw new Error(`Invalid word indices selected: ${invalidIndices.join(', ')}`);
      }
      
      setState(prev => {
        try {
          // Filter out components with the same word indices AND role (overwrite)
          debugLog('Filtering out existing components with same indices and role');
          const filteredComponents = prev.assignedComponents.filter(
            comp => !prev.selectedWordIndices.includes(comp.wordIndex) || comp.role !== prev.currentRole
          );
          debugLog('Filtered existing components:', filteredComponents);

          const constructionType = getConstructionTypeForRole(prev.currentRole!);
          debugLog(`Determined construction type: ${constructionType} from role ${prev.currentRole}`);

          // IMPROVED LOGIC: Find ALL components of this construction type
          const existingComponents = prev.assignedComponents.filter(comp => 
            getConstructionTypeForRole(comp.role) === constructionType
          );
          const constructionId = existingComponents.length > 0 
            ? existingComponents[0].constructionId 
            : `${constructionType}-${Date.now()}`;
            
          debugLog(`${existingComponents.length > 0 ? 'Reusing existing' : 'Generated new'} constructionId: ${constructionId}`);
          
          const newComponents: ComponentSelection[] = prev.selectedWordIndices.map(wordIndex => {
            const wordData = segments[wordIndex];
            debugLog(`Creating component for word index ${wordIndex}:`, wordData);
            
            return {
              wordIndex,
              wordId: wordData?.id || `word-${wordIndex}`,
              role: prev.currentRole!,
              constructionId // Use the same ID for all components created in this batch
            };
          });
          debugLog(`Created ${newComponents.length} new components:`, newComponents);

          const allComponents = [...filteredComponents, ...newComponents];
          debugLog(`Total components after merge: ${allComponents.length}`);

          // Rebuild constructions based on updated components
          debugLog('Rebuilding constructions with updated components');
          const constructions = buildConstructions(allComponents);
          debugLog(`Built ${constructions.length} constructions:`, constructions);
          
          // Count completions by type
          const completedByType: Record<string, number> = {};
          constructions.forEach(c => {
            if (c.isComplete) {
              completedByType[c.type] = (completedByType[c.type] || 0) + 1;
            }
          });
          debugLog('Completed constructions by type:', completedByType);

          const newState = {
            ...prev,
            assignedComponents: allComponents,
            constructions,
            // DON'T clear selection - keep words selected so user can continue building construction
            // This fixes the selection flow: word stays selected after role assignment
            // selectedWordIndices: [], // Clear selection after assignment
            // currentRole: null        // Clear role selection
          };
          
          debugLog('Updated state with new assignments and constructions');
          return newState;
        } catch (stateError) {
          // If there's an error in the state update function, log it but don't break the app
          debugLog('Error in assignRoleToSelectedWords state update:', stateError);
          return prev; // Return unchanged state on error
        }
      });
      
      // Provide user feedback about role assignment
      toast({
        title: 'Role Assigned',
        description: `Assigned ${state.currentRole} role to ${state.selectedWordIndices.length} word(s)`,
        variant: 'default'
      });
    } catch (error) {
      handleError('assignRoleToSelectedWords', error);
    }
  }, [state.currentRole, state.selectedWordIndices, segments, buildConstructions]);

  const removeComponentAssignment = useCallback((wordIndex: number) => {
    try {
      debugLog(`removeComponentAssignment(${wordIndex}) called`);
      
      // Validate word index
      if (wordIndex < 0 || wordIndex >= segments.length) {
        throw new Error(`Word index ${wordIndex} is out of bounds (0-${segments.length-1})`);
      }
      
      // Check if this word has a component assigned
      const existingComponent = state.assignedComponents.find(comp => comp.wordIndex === wordIndex);
      if (!existingComponent) {
        debugLog(`No component assignment found for word index ${wordIndex}`);
        return; // Nothing to remove
      }
      
      debugLog(`Removing component assignment:`, existingComponent);
      
      setState(prev => {
        try {
          // Find the construction this component belongs to
          const constructionId = existingComponent.constructionId;
          const affectedConstruction = prev.constructions.find(c => c.id === constructionId);
          debugLog(`Component belongs to construction:`, affectedConstruction);
          
          // Remove the component
          const filteredComponents = prev.assignedComponents.filter(
            comp => comp.wordIndex !== wordIndex
          );
          debugLog(`Filtered out component, ${filteredComponents.length} remaining`);
          
          // Rebuild constructions
          const constructions = buildConstructions(filteredComponents);
          debugLog(`Rebuilt ${constructions.length} constructions after removal`);
          
          return {
            ...prev,
            assignedComponents: filteredComponents,
            constructions
          };
        } catch (stateError) {
          debugLog('Error in removeComponentAssignment state update:', stateError);
          return prev; // Return unchanged state on error
        }
      });
      
      toast({
        title: 'Role Removed',
        description: `Removed role assignment from word`,
        variant: 'default'
      });
    } catch (error) {
      handleError('removeComponentAssignment', error);
    }
  }, [segments.length, state.assignedComponents, buildConstructions]);

  const getWordRole = useCallback((wordIndex: number): ComponentRole | null => {
    try {
      debugLog(`getWordRole(${wordIndex}) called`);
      
      if (wordIndex < 0 || wordIndex >= segments.length) {
        debugLog(`Word index ${wordIndex} is out of bounds (0-${segments.length-1})`);
        return null;
      }
      
      const component = state.assignedComponents.find(comp => comp.wordIndex === wordIndex);
      const role = component?.role || null;
      
      debugLog(`Role for word at index ${wordIndex}: ${role || 'none'}`, {
        wordData: segments[wordIndex],
        componentData: component
      });
      
      return role;
    } catch (error) {
      handleError('getWordRole', error);
      return null;
    }
  }, [state.assignedComponents, segments]);

  const getCompletedConstructions = useCallback(() => {
    try {
      debugLog('getCompletedConstructions() called');
      const completed = state.constructions.filter(construction => construction.isComplete);
      debugLog(`Found ${completed.length} completed constructions:`, completed);
      return completed;
    } catch (error) {
      handleError('getCompletedConstructions', error);
      return [];
    }
  }, [state.constructions]);

  const getIncompleteConstructions = useCallback(() => {
    try {
      debugLog('getIncompleteConstructions() called');
      const incomplete = state.constructions.filter(construction => !construction.isComplete);
      debugLog(`Found ${incomplete.length} incomplete constructions:`, incomplete);
      return incomplete;
    } catch (error) {
      handleError('getIncompleteConstructions', error);
      return [];
    }
  }, [state.constructions]);

  const canSubmitAnswer = useCallback(() => {
    try {
      debugLog('canSubmitAnswer() called');
      const completedCount = getCompletedConstructions().length;
      const canSubmit = completedCount > 0;
      debugLog(`Can submit answer: ${canSubmit} (${completedCount} completed constructions)`);
      return canSubmit;
    } catch (error) {
      handleError('canSubmitAnswer', error);
      return false;
    }
  }, [getCompletedConstructions]);

  // Utility Methods
  const reset = useCallback(() => {
    try {
      debugLog('reset() called - clearing all state');
      setState({
        selectedWordIndices: [],
        assignedComponents: [],
        constructions: [],
        currentRole: null
      });
      debugLog('Component selection state has been reset');
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
