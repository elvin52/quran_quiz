/**
 * Session Summary Component - Displays comprehensive quiz results and analytics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp, 
  RotateCcw,
  Share2 
} from 'lucide-react';
import { QuizStats, QuizSession } from '../types/quiz';

interface SessionSummaryProps {
  stats: QuizStats;
  session: QuizSession;
  onStartNewQuiz: () => void;
  className?: string;
}

export function SessionSummary({ 
  stats, 
  session, 
  onStartNewQuiz, 
  className 
}: SessionSummaryProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = (milliseconds / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const getPerformanceLevel = (accuracy: number): { label: string; color: string; icon: JSX.Element } => {
    if (accuracy >= 90) {
      return { 
        label: 'Excellent', 
        color: 'text-green-600', 
        icon: <Trophy className="h-5 w-5 text-yellow-500" />
      };
    } else if (accuracy >= 75) {
      return { 
        label: 'Good', 
        color: 'text-blue-600', 
        icon: <Target className="h-5 w-5 text-blue-500" />
      };
    } else if (accuracy >= 60) {
      return { 
        label: 'Fair', 
        color: 'text-orange-600', 
        icon: <TrendingUp className="h-5 w-5 text-orange-500" />
      };
    } else {
      return { 
        label: 'Needs Practice', 
        color: 'text-red-600', 
        icon: <Target className="h-5 w-5 text-red-500" />
      };
    }
  };

  const sessionDuration = session.endTime && session.startTime 
    ? formatTime(session.endTime - session.startTime)
    : 'N/A';

  const performance = getPerformanceLevel(stats.accuracy);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {performance.icon}
            <CardTitle className="text-2xl">
              Quiz Complete!
            </CardTitle>
          </div>
          <p className={`text-lg font-medium ${performance.color}`}>
            {performance.label} Performance
          </p>
        </CardHeader>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-blue-500" />
              <div className="text-2xl font-bold">
                {stats.accuracy.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="h-8 w-8 mx-auto text-green-500" />
              <div className="text-2xl font-bold">
                {stats.correctAnswers}/{stats.totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 mx-auto text-purple-500" />
              <div className="text-2xl font-bold">
                {formatTime(stats.averageResponseTime)}
              </div>
              <p className="text-sm text-muted-foreground">Avg. Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Zap className="h-8 w-8 mx-auto text-yellow-500" />
              <div className="text-2xl font-bold">
                {formatTime(stats.fastestResponse)}
              </div>
              <p className="text-sm text-muted-foreground">Fastest</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Difficulty Analysis */}
          <div className="space-y-4">
            <h4 className="font-medium">By Difficulty Level</h4>
            
            {Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => {
              if (data.total === 0) return null;
              
              const percentage = (data.correct / data.total) * 100;
              return (
                <div key={difficulty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {data.correct}/{data.total} correct
                      </span>
                    </div>
                    <span className="font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* Session Info */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Session Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">{sessionDuration}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="ml-2 font-medium capitalize">
                  {session.settings.difficulty}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Slowest Response:</span>
                <span className="ml-2 font-medium">
                  {formatTime(stats.slowestResponse)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Questions:</span>
                <span className="ml-2 font-medium">{stats.totalQuestions}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            {stats.accuracy >= 90 && (
              <div>
                <h4 className="font-medium text-green-700">Outstanding work! 🌟</h4>
                <p className="text-sm text-muted-foreground">
                  You've mastered these pronoun patterns. Try a higher difficulty!
                </p>
              </div>
            )}
            {stats.accuracy >= 75 && stats.accuracy < 90 && (
              <div>
                <h4 className="font-medium text-blue-700">Great progress! 📈</h4>
                <p className="text-sm text-muted-foreground">
                  You're getting the hang of it. Keep practicing for even better results!
                </p>
              </div>
            )}
            {stats.accuracy >= 60 && stats.accuracy < 75 && (
              <div>
                <h4 className="font-medium text-orange-700">Good effort! 💪</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on the explanations and try again to improve your accuracy.
                </p>
              </div>
            )}
            {stats.accuracy < 60 && (
              <div>
                <h4 className="font-medium text-purple-700">Keep learning! 📚</h4>
                <p className="text-sm text-muted-foreground">
                  Practice makes perfect. Review the patterns and try again!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onStartNewQuiz} size="lg" className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Quiz
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </div>
  );
}
