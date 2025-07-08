/**
 * Quran Grammar Quiz Page - Underline Mode
 * 
 * Main page component for the Quranic verse-based grammar quiz with visual word marking.
 * Integrates all components and manages the complete quiz flow.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  BookOpen, 
  Target,
  Download,
  Settings,
  Home
} from 'lucide-react';
import { QuranVerseDisplay } from '@/components/quiz/ClickableQuranWord';
import { useQuranGrammarQuizManager } from '@/hooks/useQuranGrammarQuizManager';
import { QuranQuizSettings } from '@/types/quranGrammarQuiz';
import { useNavigate } from 'react-router-dom';

const QuranGrammarQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    currentSession,
    startSession,
    selectWord,
    clearSelection,
    submitAnswer,
    nextQuestion,
    completeSession,
    exportSession,
    resetQuiz
  } = useQuranGrammarQuizManager();

  const [quizStarted, setQuizStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<QuranQuizSettings>({
    questionCount: 5,
    constructionTypes: ['mudaf-mudaf-ilayh', 'jar-majroor'],
    difficultyLevel: 'beginner',
    showTranslation: true,
    showVerseReference: true,
    fontFamily: 'naskh'
  });

  // Auto-advance to next question after showing feedback
  useEffect(() => {
    if (state.showFeedback && currentSession) {
      const isLastQuestion = currentSession.questions.length >= currentSession.settings.questionCount;
      
      if (!isLastQuestion) {
        const timer = setTimeout(() => {
          nextQuestion();
        }, 3000); // Show feedback for 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [state.showFeedback, currentSession, nextQuestion]);

  const handleStartQuiz = async () => {
    console.log('🎯 Starting Quran Grammar Quiz');
    setQuizStarted(true);
    await startSession(settings);
  };

  const handleCompleteQuiz = () => {
    const completedSession = completeSession();
    setQuizStarted(false);
    console.log('🏁 Quiz completed:', completedSession);
  };

  const handleExportResults = () => {
    const data = exportSession();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-grammar-quiz-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    resetQuiz();
    setQuizStarted(false);
  };

  const canSubmit = state.userSelection?.selectedWordIds.length > 0;
  const isQuizComplete = currentSession?.questions.length >= (currentSession?.settings.questionCount || 0);

  // Quiz Settings Panel
  const SettingsPanel = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quiz Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Number of Questions</label>
          <select 
            value={settings.questionCount} 
            onChange={(e) => setSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
            className="w-full p-2 border rounded mt-1"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Construction Types</label>
          <div className="space-y-2 mt-1">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={settings.constructionTypes.includes('mudaf-mudaf-ilayh')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings(prev => ({ 
                      ...prev, 
                      constructionTypes: [...prev.constructionTypes, 'mudaf-mudaf-ilayh'] 
                    }));
                  } else {
                    setSettings(prev => ({ 
                      ...prev, 
                      constructionTypes: prev.constructionTypes.filter(t => t !== 'mudaf-mudaf-ilayh') 
                    }));
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">Mudaf–Mudaf Ilayh (إضافة)</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={settings.constructionTypes.includes('jar-majroor')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings(prev => ({ 
                      ...prev, 
                      constructionTypes: [...prev.constructionTypes, 'jar-majroor'] 
                    }));
                  } else {
                    setSettings(prev => ({ 
                      ...prev, 
                      constructionTypes: prev.constructionTypes.filter(t => t !== 'jar-majroor') 
                    }));
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">Jar–Majroor (جار ومجرور)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={settings.showTranslation}
              onChange={(e) => setSettings(prev => ({ ...prev, showTranslation: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm">Show English Translation</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={settings.showVerseReference}
              onChange={(e) => setSettings(prev => ({ ...prev, showVerseReference: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm">Show Verse Reference</span>
          </label>
        </div>

        <div className="pt-4 space-y-2">
          <Button 
            onClick={handleStartQuiz} 
            className="w-full"
            disabled={settings.constructionTypes.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Quiz
          </Button>
          <Button 
            onClick={() => setShowSettings(false)} 
            variant="outline" 
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Quiz completion screen
  if (quizStarted && isQuizComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto py-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl text-green-600">
                🎉 Quiz Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSession && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {currentSession.statistics.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(currentSession.statistics.accuracy)}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(currentSession.statistics.averageResponseTime / 1000)}s
                    </div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {currentSession.statistics.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button onClick={handleRestart} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Quiz Again
                </Button>
                <Button onClick={handleExportResults} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button onClick={() => navigate('/quiz')} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Quiz Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Settings screen
  if (!quizStarted && showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <SettingsPanel />
        </div>
      </div>
    );
  }

  // Welcome screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Quran Grammar Quiz
            </h1>
            <p className="text-xl text-gray-600 font-arabic">
              قرآن گرامر کوئز - انڈر لائن موڈ
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Learn Arabic grammar by identifying constructions in authentic Quranic verses. 
              Click on words to mark grammatical relationships.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Your Task
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mark Arabic words that form grammatical constructions like Mudaf–Mudaf Ilayh (إضافة) 
                    or Jar–Majroor (جار ومجرور).
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Feedback
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get instant feedback with explanations of the correct grammatical relationships 
                    and their meanings.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-semibold">Visual Guide</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline" className="border-amber-400 text-amber-700">1st Selection</Badge>
                  <Badge variant="outline" className="border-emerald-400 text-emerald-700">2nd Selection</Badge>
                  <Badge variant="outline" className="border-blue-400 text-blue-700">3rd Selection</Badge>
                  <Badge variant="outline" className="border-purple-400 text-purple-700">4th+ Selection</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button 
              onClick={() => setShowSettings(true)} 
              size="lg" 
              className="px-8 py-3 text-lg"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configure & Start Quiz
            </Button>
            <div>
              <Button 
                onClick={() => navigate('/quiz')} 
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Quiz Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quran Grammar Quiz</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {state.currentQuestion?.constructionType === 'mudaf-mudaf-ilayh' ? 'إضافة' : 'جار ومجرور'}
            </Badge>
            <Button onClick={handleRestart} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                {state.progress.current} of {state.progress.total}
              </span>
            </div>
            <Progress value={state.progress.percentage} className="w-full" />
          </CardContent>
        </Card>

        {/* Question */}
        {state.currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {state.currentQuestion.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuranVerseDisplay
                arabicText={state.currentQuestion.arabicText}
                words={state.currentQuestion.words}
                onWordClick={selectWord}
                isDisabled={state.isAnswered || state.isLoading}
                showTranslation={settings.showTranslation}
                translation={state.currentQuestion.translation}
                verseReference={settings.showVerseReference ? {
                  surahName: state.currentQuestion.verse.surahName,
                  surahNameArabic: state.currentQuestion.verse.surahNameArabic,
                  verseId: state.currentQuestion.verse.verseId
                } : undefined}
              />
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            {!state.isAnswered ? (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  disabled={!canSubmit || state.isLoading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
                <Button
                  onClick={submitAnswer}
                  disabled={!canSubmit || state.isLoading}
                  className="px-8"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {/* Feedback will appear here */}
                {state.showFeedback && state.currentQuestion && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      Moving to next question...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading state */}
        {state.isLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="animate-pulse">Loading next question...</div>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {state.error && (
          <Card>
            <CardContent className="pt-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Error: {state.error}</p>
                <Button onClick={handleRestart} variant="outline" className="mt-2">
                  Restart Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuranGrammarQuizPage;
