/**
 * Component Role Selector - Granular Grammar Component Selection
 * 
 * Allows users to select individual grammatical roles for words instead
 * of selecting entire construction types. Each word can be assigned one
 * of 8 component roles: mudaf, mudaf-ilayh, jar, majroor, fil, fail, 
 * harf-nasb, ismuha.
 * 
 * Features:
 * - Simple button-based role selection
 * - Color-coded role indicators 
 * - Clear role completion tracking
 * - Minimal text as per user preference
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComponentRole, 
  COMPONENT_ROLE_NAMES,
  CONSTRUCTION_COMPONENT_ROLES,
  ConstructionType 
} from '@/types/grammarQuiz';
import { cn } from '@/lib/utils';

interface ComponentSelectorProps {
  selectedRole: ComponentRole | null;
  onRoleSelect: (role: ComponentRole) => void;
  selectedWordCount: number;
  className?: string;
  disabled?: boolean;
}

// Role color mapping for visual consistency
const ROLE_COLORS: Record<ComponentRole, { bg: string; border: string; text: string; button: string }> = {
  'mudaf': { 
    bg: 'bg-amber-50', 
    border: 'border-amber-300', 
    text: 'text-amber-800',
    button: 'hover:bg-amber-100 border-amber-300 data-[state=active]:bg-amber-200'
  },
  'mudaf-ilayh': { 
    bg: 'bg-orange-50', 
    border: 'border-orange-300', 
    text: 'text-orange-800',
    button: 'hover:bg-orange-100 border-orange-300 data-[state=active]:bg-orange-200'
  },
  'jar': { 
    bg: 'bg-teal-50', 
    border: 'border-teal-300', 
    text: 'text-teal-800',
    button: 'hover:bg-teal-100 border-teal-300 data-[state=active]:bg-teal-200'
  },
  'majroor': { 
    bg: 'bg-cyan-50', 
    border: 'border-cyan-300', 
    text: 'text-cyan-800',
    button: 'hover:bg-cyan-100 border-cyan-300 data-[state=active]:bg-cyan-200'
  },
  'fil': { 
    bg: 'bg-purple-50', 
    border: 'border-purple-300', 
    text: 'text-purple-800',
    button: 'hover:bg-purple-100 border-purple-300 data-[state=active]:bg-purple-200'
  },
  'fail': { 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-300', 
    text: 'text-indigo-800',
    button: 'hover:bg-indigo-100 border-indigo-300 data-[state=active]:bg-indigo-200'
  },
  'harf-nasb': { 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-300', 
    text: 'text-emerald-800',
    button: 'hover:bg-emerald-100 border-emerald-300 data-[state=active]:bg-emerald-200'
  },
  'ismuha': { 
    bg: 'bg-green-50', 
    border: 'border-green-300', 
    text: 'text-green-800',
    button: 'hover:bg-green-100 border-green-300 data-[state=active]:bg-green-200'
  }
};

// Group roles by construction type for organized display
const ROLE_GROUPS: { 
  construction: ConstructionType; 
  title: string; 
  roles: ComponentRole[] 
}[] = [
  {
    construction: 'mudaf-mudaf-ilayh',
    title: 'Iḍāfa',
    roles: ['mudaf', 'mudaf-ilayh']
  },
  {
    construction: 'jar-majroor', 
    title: 'Jar wa Majrūr',
    roles: ['jar', 'majroor']
  },
  {
    construction: 'fil-fail',
    title: 'Fiʿl–Fāʿil', 
    roles: ['fil', 'fail']
  },
  {
    construction: 'harf-nasb-ismuha',
    title: 'Harf Nasb + Ismuha',
    roles: ['harf-nasb', 'ismuha']
  }
];

export function ComponentSelector({
  selectedRole,
  onRoleSelect,
  selectedWordCount,
  className,
  disabled = false
}: ComponentSelectorProps) {

  const handleRoleClick = (role: ComponentRole) => {
    if (disabled) return;
    onRoleSelect(role);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center">
          Select Component Role
        </CardTitle>
        {selectedWordCount > 0 && (
          <div className="text-center">
            <Badge variant="outline" className="text-sm">
              {selectedWordCount} word{selectedWordCount !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Role Selection by Construction Groups */}
        {ROLE_GROUPS.map((group) => (
          <div key={group.construction} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground text-center">
              {group.title}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {group.roles.map((role) => {
                const colors = ROLE_COLORS[role];
                const isSelected = selectedRole === role;
                
                return (
                  <Button
                    key={role}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRoleClick(role)}
                    disabled={disabled || selectedWordCount === 0}
                    className={cn(
                      'text-sm font-medium transition-all duration-200',
                      colors.button,
                      isSelected && `${colors.bg} ${colors.border} ${colors.text}`,
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    data-state={isSelected ? 'active' : 'inactive'}
                  >
                    {COMPONENT_ROLE_NAMES[role]}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Selection Status */}
        {selectedWordCount === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Select words in the verse first
          </div>
        )}
        
        {selectedWordCount > 0 && !selectedRole && (
          <div className="text-center text-sm text-amber-600">
            Choose a role for the selected word{selectedWordCount !== 1 ? 's' : ''}
          </div>
        )}
        
        {selectedRole && selectedWordCount > 0 && (
          <div className="text-center">
            <Badge 
              className={cn(
                'text-sm',
                ROLE_COLORS[selectedRole].bg,
                ROLE_COLORS[selectedRole].border,
                ROLE_COLORS[selectedRole].text
              )}
            >
              {selectedWordCount} word{selectedWordCount !== 1 ? 's' : ''} → {COMPONENT_ROLE_NAMES[selectedRole]}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
