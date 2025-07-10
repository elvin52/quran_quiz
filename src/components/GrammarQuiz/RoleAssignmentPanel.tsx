/**
 * Role Assignment Panel Component
 * 
 * Handles multi-step role assignment for role-based grammatical constructions
 * like Fiʿl–Fāʿil and Harf Naṣb–Ismuha. Provides a guided interface for users
 * to select primary and secondary roles for their word selections.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, Users, Target } from 'lucide-react';
import { 
  RoleBasedConstructionType, 
  GrammaticalRole, 
  GRAMMATICAL_ROLES 
} from '@/types/grammarQuiz';

interface RoleAssignmentPanelProps {
  constructionType: RoleBasedConstructionType;
  selectedWords: Array<{ indices: number[]; text: string }>;
  currentStep: 'primary-selection' | 'secondary-selection' | 'complete';
  primaryIndices: number[];
  secondaryIndices: number[];
  onPrimaryRoleAssign: (indices: number[]) => void;
  onSecondaryRoleAssign: (indices: number[]) => void;
  onComplete: () => void;
  disabled?: boolean;
  className?: string;
}

interface RoleOption {
  role: GrammaticalRole;
  isAssigned: boolean;
  assignedIndices: number[];
  isPrimary: boolean;
}

export function RoleAssignmentPanel({
  constructionType,
  selectedWords,
  currentStep,
  primaryIndices,
  secondaryIndices,
  onPrimaryRoleAssign,
  onSecondaryRoleAssign,
  disabled = false,
  className
}: RoleAssignmentPanelProps) {
  
  const roles = GRAMMATICAL_ROLES[constructionType];
  
  const roleOptions: RoleOption[] = [
    {
      role: roles.primary,
      isAssigned: primaryIndices.length > 0,
      assignedIndices: primaryIndices,
      isPrimary: true
    },
    {
      role: roles.secondary,
      isAssigned: secondaryIndices.length > 0,
      assignedIndices: secondaryIndices,
      isPrimary: false
    }
  ];

  const handleWordClick = (wordIndices: number[]) => {
    if (disabled) return;
    
    if (currentStep === 'primary-selection') {
      onPrimaryRoleAssign(wordIndices);
    } else if (currentStep === 'secondary-selection') {
      onSecondaryRoleAssign(wordIndices);
    }
  };

  const getWordSelectionState = (wordIndices: number[]): 'unselected' | 'primary' | 'secondary' | 'available' => {
    const flatIndices = wordIndices.flat();
    
    if (primaryIndices.some(idx => flatIndices.includes(idx))) {
      return 'primary';
    }
    if (secondaryIndices.some(idx => flatIndices.includes(idx))) {
      return 'secondary';
    }
    return currentStep === 'complete' ? 'unselected' : 'available';
  };

  const getStepDescription = (): string => {
    switch (currentStep) {
      case 'primary-selection':
        return `Select the word(s) that serve as ${roles.primary.name} (${roles.primary.description})`;
      case 'secondary-selection':
        return `Now select the word(s) that serve as ${roles.secondary.name} (${roles.secondary.description})`;
      case 'complete':
        return 'Role assignment complete! Review your selection below.';
      default:
        return '';
    }
  };

  const canProceedToNext = (): boolean => {
    if (currentStep === 'primary-selection') {
      return primaryIndices.length > 0;
    }
    if (currentStep === 'secondary-selection') {
      return secondaryIndices.length > 0;
    }
    return true;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Role Assignment</span>
          <Badge variant="outline" className="ml-2">
            {constructionType === 'fil-fail' ? 'Verb-Doer' : 'Accusative Particle'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
            currentStep === 'primary-selection' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              : primaryIndices.length > 0 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {primaryIndices.length > 0 ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            <span>Step 1: {roles.primary.name}</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
            currentStep === 'secondary-selection'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
              : secondaryIndices.length > 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {secondaryIndices.length > 0 ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            <span>Step 2: {roles.secondary.name}</span>
          </div>
        </div>

        {/* Step Description */}
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {getStepDescription()}
          </p>
        </div>

        {/* Word Selection Interface */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Click on the words to assign roles:
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedWords.map((word, index) => {
              const selectionState = getWordSelectionState(word.indices);
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleWordClick(word.indices)}
                  disabled={disabled || currentStep === 'complete'}
                  className={cn(
                    'text-lg font-arabic px-4 py-2 h-auto',
                    'transition-all duration-200 hover:shadow-md',
                    selectionState === 'primary' && [
                      'bg-blue-50 dark:bg-blue-900/20',
                      'border-blue-200 dark:border-blue-700',
                      'text-blue-700 dark:text-blue-300'
                    ],
                    selectionState === 'secondary' && [
                      'bg-green-50 dark:bg-green-900/20',
                      'border-green-200 dark:border-green-700',
                      'text-green-700 dark:text-green-300'
                    ],
                    selectionState === 'available' && [
                      'border-dashed border-2',
                      'hover:bg-gray-50 dark:hover:bg-gray-800'
                    ]
                  )}
                  dir="rtl"
                >
                  {word.text}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Role Assignment Summary */}
        {(primaryIndices.length > 0 || secondaryIndices.length > 0) && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Current assignments:
            </p>
            
            <div className="grid gap-3 md:grid-cols-2">
              {roleOptions.map((roleOption, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border',
                    roleOption.isAssigned
                      ? roleOption.isPrimary
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      roleOption.isAssigned
                        ? roleOption.isPrimary ? 'bg-blue-500' : 'bg-green-500'
                        : 'bg-gray-300'
                    )} />
                    <span className="font-medium text-sm">
                      {roleOption.role.name}
                    </span>
                    <span className="text-xs font-arabic" dir="rtl">
                      {roleOption.role.arabicName}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {roleOption.role.description}
                  </p>
                  
                  {roleOption.isAssigned ? (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned to: </span>
                      {roleOption.assignedIndices.map(idx => {
                        const word = selectedWords.find(w => w.indices.includes(idx));
                        return word ? (
                          <Badge key={idx} variant="outline" className="ml-1 font-arabic" dir="rtl">
                            {word.text}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Not assigned yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {currentStep === 'primary-selection' && canProceedToNext() && (
            <Button 
              onClick={() => onSecondaryRoleAssign([])}
              disabled={disabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Select {roles.secondary.name}
            </Button>
          )}
          
          {currentStep === 'secondary-selection' && canProceedToNext() && (
            <Button 
              onClick={onComplete}
              disabled={disabled}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Assignment
            </Button>
          )}
          
          {currentStep === 'complete' && (
            <div className="text-center py-2">
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                ✓ Role assignment complete!
              </p>
              <p className="text-xs text-muted-foreground">
                Click Submit to validate your grammatical construction
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
