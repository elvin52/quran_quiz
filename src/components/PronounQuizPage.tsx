/**
 * Main Arabic Pronoun Quiz Page Component
 * Orchestrates the quiz experience with question display, timing, and feedback
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Target, RotateCcw, Play, Pause } from 'lucide-react';
import { useQuizManager } from '../hooks/useQuizManager';
import { QuizQuestion } from './QuizQuestion';
import { QuizFeedback } from './QuizFeedback';
import { QuizSettings } from './QuizSettings';
import { SessionSummary } from './SessionSummary';

interface PronounQuizPageProps {
  className?: string;
}

export function PronounQuizPage({ className }: PronounQuizPageProps) {
  const {
    quizState,
    startQuiz,
    resumeQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    pauseQuiz,
    getProgress,
    getCurrentQuestionNumber,
    hasSavedSession
  } = useQuizManager();

  const progress = getProgress();
  const questionNumber = getCurrentQuestionNumber();

  // Render start screen
  if (quizState.status === 'not_started') {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2">
                Arabic Pronoun Trainer
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Master Arabic pronouns with interactive practice
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Target className="h-8 w-8 mx-auto text-blue-500" />
                  <h3 className="font-semibold">Practice Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Pronoun selection & identification
                  </p>
                </div>
                <div className="space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-green-500" />
                  <h3 className="font-semibold">Timed Practice</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your response speed
                  </p>
                </div>
                <div className="space-y-2">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
                  <h3 className="font-semibold">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your improvement
                  </p>
                </div>
              </div>

              <QuizSettings onStartQuiz={startQuiz} />

              {hasSavedSession() && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    You have an unfinished quiz session
                  </p>
                  <Button 
                    onClick={resumeQuiz} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Previous Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render completed screen
  if (quizState.status === 'completed' && quizState.stats) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <SessionSummary 
            stats={quizState.stats}
            session={quizState.session!}
            onStartNewQuiz={() => resetQuiz()}
          />
        </div>
      </div>
    );
  }

  // Render quiz in progress
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  Question {questionNumber} of {progress.total}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {quizState.session?.settings.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {quizState.currentQuestion?.type === 'select_pronoun' 
                      ? 'Select Pronoun' 
                      : 'Identify Attached'
                    }
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseQuiz}
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetQuiz}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={progress.percentage} className="mt-3" />
          </CardHeader>
        </Card>

        {/* Question Display */}
        {quizState.currentQuestion && quizState.status === 'in_progress' && (
          <QuizQuestion
            question={quizState.currentQuestion}
            onAnswerSelect={submitAnswer}
          />
        )}

        {/* Feedback Display */}
        {quizState.feedback && quizState.status === 'showing_feedback' && (
          <QuizFeedback
            feedback={quizState.feedback}
            onNext={nextQuestion}
            showExplanation={quizState.session?.settings.showExplanations ?? true}
          />
        )}
      </div>
    </div>
  );
}
