/**
 * Quiz Question Component - Displays individual quiz questions with Arabic text and pronoun options
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizQuestion as QuizQuestionType, ArabicPronoun } from '../types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswerSelect: (pronoun: ArabicPronoun) => void;
  className?: string;
}

export function QuizQuestion({ question, onAnswerSelect, className }: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = async (pronoun: ArabicPronoun) => {
    if (isSubmitting) return;
    
    setSelectedOption(pronoun.id);
    setIsSubmitting(true);
    
    // Small delay to show selection before submitting
    setTimeout(() => {
      onAnswerSelect(pronoun);
      setIsSubmitting(false);
      setSelectedOption(null);
    }, 200);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="text-center space-y-4">
          <CardTitle className="text-lg font-medium">
            {question.questionText}
          </CardTitle>
          
          {/* Arabic Verb Display */}
          <div className="py-6">
            <div 
              className="text-4xl font-bold text-center mb-2 font-arabic"
              dir="rtl"
              lang="ar"
            >
              {question.verb.presentTense}
            </div>
            <div className="text-sm text-muted-foreground">
              {question.verb.transliteration} - {question.verb.meaning}
            </div>
          </div>

          <Badge variant="outline" className="mx-auto">
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Select the correct answer:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((pronoun) => (
              <Button
                key={pronoun.id}
                variant={selectedOption === pronoun.id ? "default" : "outline"}
                size="lg"
                className={`
                  h-auto py-4 px-6 justify-start text-left transition-all duration-200
                  ${selectedOption === pronoun.id ? 'ring-2 ring-primary' : ''}
                  ${isSubmitting && selectedOption === pronoun.id ? 'opacity-70' : ''}
                `}
                onClick={() => handleOptionSelect(pronoun)}
                disabled={isSubmitting}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div 
                      className="text-2xl font-bold font-arabic"
                      dir="rtl"
                      lang="ar"
                    >
                      {pronoun.arabic}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">
                        {pronoun.transliteration}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pronoun.english}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {pronoun.person}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {pronoun.number}
                    </Badge>
                    {pronoun.gender && (
                      <Badge variant="secondary" className="text-xs">
                        {pronoun.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
