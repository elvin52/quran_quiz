/**
 * Relationship Selector Component
 * 
 * Allows users to select the type of grammatical relationship between selected words.
 * Focuses on Mudaf-Mudaf Ilayh and Jar-Majroor constructions.
 * Maintains consistency with existing quiz UI patterns and design system.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link2, Crown } from 'lucide-react';

type ConstructionType = 'mudaf-mudaf-ilayh' | 'jar-majroor';

interface RelationshipSelectorProps {
  selectedType: ConstructionType | null;
  onTypeSelect: (type: ConstructionType) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

interface ConstructionOption {
  type: ConstructionType;
  arabicName: string;
  englishName: string;
  description: string;
  examples: string[];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const constructionOptions: ConstructionOption[] = [
  {
    type: 'mudaf-mudaf-ilayh',
    arabicName: 'مُضاف ومُضاف إليه',
    englishName: 'Possessive Construction',
    description: 'Two nouns in a possessive relationship. The first noun (مُضاف) loses its definite article, and the second noun (مُضاف إليه) is in genitive case.',
    examples: ['بِسْمِ اللَّهِ', 'رَبِّ الْعَالَمِينَ', 'مَالِكِ يَوْمِ الدِّينِ', 'كِتَابُ الطَّالِبِ'],
    icon: <Crown className="h-5 w-5" />,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
  },
  {
    type: 'jar-majroor',
    arabicName: 'جار ومجرور',
    englishName: 'Prepositional Phrase',
    description: 'A preposition (جار) followed by a noun in genitive case (مجرور).',
    examples: ['عَلَى صِرَاطٍ', 'فِي الْعَالَمِينَ', 'مِنَ الرَّحْمَنِ', 'بِسْمِ اللَّهِ'],
    icon: <Link2 className="h-5 w-5" />,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
  }
];

export function RelationshipSelector({
  selectedType,
  onTypeSelect,
  disabled = false,
  showDescriptions = true,
  className
}: RelationshipSelectorProps) {

  const handleSelection = (type: ConstructionType) => {
    if (disabled) return;
    onTypeSelect(type);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Select Relationship Type</span>
          {selectedType && (
            <Badge variant="secondary" className="ml-2">
              {constructionOptions.find(opt => opt.type === selectedType)?.englishName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-1">
          {constructionOptions.map((option) => {
            const isSelected = selectedType === option.type;
            
            return (
              <Button
                key={option.type}
                variant="outline"
                onClick={() => handleSelection(option.type)}
                disabled={disabled}
                className={cn(
                  'h-auto p-4 text-left justify-start flex-col items-start space-y-2',
                  'transition-all duration-200 hover:shadow-md',
                  isSelected && [
                    option.bgColor,
                    'border-2 shadow-sm',
                    option.color
                  ]
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn(
                    'p-2 rounded-md',
                    isSelected ? 'bg-white/50 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800'
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">
                      {option.englishName}
                    </div>
                    <div className="text-right font-arabic text-lg mt-1" dir="rtl">
                      {option.arabicName}
                    </div>
                  </div>
                </div>

                {showDescriptions && (
                  <div className="space-y-2 w-full">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Examples:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.examples.map((example, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs font-arabic"
                            dir="rtl"
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {!selectedType && !disabled && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Select words in the text above to form a construction, then choose the relationship type
            </p>
          </div>
        )}

        {selectedType && !disabled && (
          <div className="text-center py-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Selected: {constructionOptions.find(opt => opt.type === selectedType)?.englishName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click Submit to validate your answer
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
