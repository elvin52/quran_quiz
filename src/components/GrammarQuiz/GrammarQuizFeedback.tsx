/**
 * Grammar Quiz Feedback Component
 * 
 * Displays validation results, explanations, and learning feedback.
 * Maintains consistency with existing QuizFeedback component patterns.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { AnswerValidation } from '@/types/grammarQuiz';

interface GrammarQuizFeedbackProps {
  validation: AnswerValidation;
  responseTime: number;
  onNext: () => void;
  onRetry?: () => void;
  showExplanation?: boolean;
  allowRetry?: boolean;
  className?: string;
}

export function GrammarQuizFeedback({
  validation,
  responseTime,
  onNext,
  onRetry,
  showExplanation = true,
  allowRetry = false,
  className
}: GrammarQuizFeedbackProps) {

  const formatResponseTime = (timeMs: number): string => {
    if (timeMs < 1000) return `${timeMs}ms`;
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    if (score >= 0.5) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
  };

  const renderFeedbackIcon = () => {
    if (validation.isCorrect) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (validation.partialCredit > 0) {
      return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    } else {
      return <XCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getPerformanceBadge = () => {
    if (responseTime < 5000 && validation.isCorrect) {
      return <Badge className="bg-green-600">Quick & Correct!</Badge>;
    } else if (responseTime < 10000 && validation.isCorrect) {
      return <Badge className="bg-blue-600">Well Done!</Badge>;
    } else if (validation.partialCredit > 0.7) {
      return <Badge className="bg-yellow-600">Nearly There!</Badge>;
    }
    return null;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            {renderFeedbackIcon()}
            <span className={getScoreColor(validation.partialCredit)}>
              {validation.feedback.message}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {getPerformanceBadge()}
            <Badge variant="outline">
              {formatResponseTime(responseTime)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className={cn('p-4 rounded-lg border', getScoreBgColor(validation.partialCredit))}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Score</span>
            <span className={cn('text-xl font-bold', getScoreColor(validation.partialCredit))}>
              {Math.round(validation.partialCredit * 100)}%
            </span>
          </div>
          {validation.partialCredit > 0 && validation.partialCredit < 1 && (
            <p className="text-sm text-muted-foreground mt-2">
              Partial credit awarded for identifying part of the construction
            </p>
          )}
        </div>

        {/* Main Explanation */}
        {showExplanation && validation.feedback.explanation && (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">Grammatical Explanation:</p>
              <p className="leading-relaxed">{validation.feedback.explanation}</p>
              
              {validation.matchedConstruction?.textbookRule && (
                <p className="text-sm text-muted-foreground italic">
                  Rule: {validation.matchedConstruction.textbookRule}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Corrections */}
        {validation.feedback.corrections && validation.feedback.corrections.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Corrections needed:</h4>
            <ul className="space-y-1">
              {validation.feedback.corrections.map((correction, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  {correction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Encouragement */}
        {validation.feedback.encouragement && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 {validation.feedback.encouragement}
            </p>
          </div>
        )}

        {/* Construction Details */}
        {validation.matchedConstruction && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Construction Details:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">
                  {validation.matchedConstruction.type === 'mudaf-mudaf-ilayh' 
                    ? 'Possessive (إضافة)' 
                    : 'Prepositional (جار ومجرور)'
                  }
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certainty:</span>
                <Badge 
                  variant={validation.matchedConstruction.certainty === 'definite' ? 'default' : 'secondary'}
                >
                  {validation.matchedConstruction.certainty}
                </Badge>
              </div>
              {validation.matchedConstruction.roles.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Roles:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {validation.matchedConstruction.roles.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onNext} className="flex-1">
            <ArrowRight className="h-4 w-4 mr-2" />
            Next Question
          </Button>
          
          {allowRetry && !validation.isCorrect && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
