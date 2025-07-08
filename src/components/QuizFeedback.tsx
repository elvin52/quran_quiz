/**
 * Quiz Feedback Component - Shows immediate feedback after each question
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { QuizFeedback as QuizFeedbackType } from '../types/quiz';

interface QuizFeedbackProps {
  feedback: QuizFeedbackType;
  onNext: () => void;
  showExplanation?: boolean;
  className?: string;
}

export function QuizFeedback({ 
  feedback, 
  onNext, 
  showExplanation = true, 
  className 
}: QuizFeedbackProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = (milliseconds / 1000).toFixed(1);
    return `${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            {feedback.isCorrect ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-500" />
                <CardTitle className="text-xl text-green-700">
                  Correct!
                </CardTitle>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-xl text-red-700">
                  Incorrect
                </CardTitle>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Response time: {formatTime(feedback.responseTime)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Answer Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User's Answer */}
          <div className={`
            p-4 rounded-lg border-2 
            ${feedback.isCorrect 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
            }
          `}>
            <div className="text-sm font-medium mb-2 text-center">
              Your Answer
            </div>
            <div className="text-center space-y-2">
              <div 
                className="text-2xl font-bold font-arabic"
                dir="rtl"
                lang="ar"
              >
                {feedback.userAnswer.arabic}
              </div>
              <div className="text-sm">
                {feedback.userAnswer.transliteration}
              </div>
              <div className="text-xs text-muted-foreground">
                {feedback.userAnswer.english}
              </div>
            </div>
          </div>

          {/* Correct Answer */}
          <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
            <div className="text-sm font-medium mb-2 text-center">
              Correct Answer
            </div>
            <div className="text-center space-y-2">
              <div 
                className="text-2xl font-bold font-arabic"
                dir="rtl"
                lang="ar"
              >
                {feedback.correctAnswer.arabic}
              </div>
              <div className="text-sm">
                {feedback.correctAnswer.transliteration}
              </div>
              <div className="text-xs text-muted-foreground">
                {feedback.correctAnswer.english}
              </div>
            </div>
          </div>
        </div>

        {/* Grammar Information */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline">
            {feedback.correctAnswer.person} person
          </Badge>
          <Badge variant="outline">
            {feedback.correctAnswer.number}
          </Badge>
          {feedback.correctAnswer.gender && (
            <Badge variant="outline">
              {feedback.correctAnswer.gender}
            </Badge>
          )}
          <Badge variant="outline">
            {feedback.correctAnswer.type}
          </Badge>
        </div>

        {/* Explanation */}
        {showExplanation && feedback.explanation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              Explanation
            </h4>
            <p className="text-sm text-blue-800">
              {feedback.explanation}
            </p>
          </div>
        )}

        {/* Performance Feedback */}
        <div className="text-center">
          {feedback.responseTime < 3000 && (
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              Quick Response! ⚡
            </Badge>
          )}
          {feedback.responseTime > 10000 && (
            <Badge variant="secondary" className="text-blue-700 bg-blue-100">
              Take your time - accuracy matters! 🎯
            </Badge>
          )}
        </div>

        {/* Next Button */}
        <div className="text-center pt-4">
          <Button onClick={onNext} size="lg" className="w-full md:w-auto">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
