/**
 * Grammar Construction Quiz Page Component
 * 
 * Main orchestrating component for the Grammar Construction Quiz feature.
 * Follows the same patterns as PronounQuizPage.tsx for consistency.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Trophy, 
  RotateCcw, 
  Send,
  Brain,
  Users,
  Link2,
  Plus,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useGrammarQuizManager } from '@/hooks/useGrammarQuizManager';
import { useComponentSelection } from '@/hooks/useComponentSelection';
import { QuranVerseDisplay } from './QuranVerseDisplay';
import { RelationshipSelector } from './RelationshipSelector';
import { ComponentSelector } from './ComponentSelector';
import { GrammarQuizFeedback } from './GrammarQuizFeedback';
import { QuizSettings } from '../QuizSettings';
import { SessionSummary } from '../SessionSummary';
import { QuizSettings as GrammarQuizSettings } from '@/types/grammarQuiz';

interface GrammarQuizPageProps {
  className?: string;
}

export function GrammarQuizPage({ className }: GrammarQuizPageProps) {
  const {
    quizState,
    currentSession,
    selectedIndices,
    selectedConstructionType,
    submittedConstructions,
    currentValidation,
    canSubmitConstruction,
    canFinalizeQuestion,
    isSessionCompleted,
    startSession,
    toggleWordSelection,
    setWordIndices,
    selectConstructionType,
    submitCurrentConstruction,
    finalizeQuestion,
    nextQuestion,
    resetQuiz,
    getCurrentStatistics,
    getAllSelectedIndices
  } = useGrammarQuizManager();

  // Component selection for granular mode
  const componentSelection = useComponentSelection(
    // Ensure segments are always passed as an array
    quizState.currentQuestion?.segments 
      ? (Array.isArray(quizState.currentQuestion.segments) 
          ? quizState.currentQuestion.segments 
          : Object.values(quizState.currentQuestion.segments))
      : []
  );
  
  // Toggle between construction and component selection modes
  const [selectionMode, setSelectionMode] = useState<'construction' | 'component'>('construction');
  
  // Track submitted construction IDs to avoid duplicates
  const [submittedConstructionIds, setSubmittedConstructionIds] = useState<string[]>([]);
  
  // Auto-submission logic for completed constructions in Component Mode
  useEffect(() => {
    if (selectionMode === 'component' && !quizState.isLoading) {
      const completedConstructions = componentSelection.getCompletedConstructions();
      
      if (completedConstructions.length > 0) {
        console.log('🔄 Auto-submission checking completed constructions:', completedConstructions);
        
        // Filter out already submitted constructions
        const newConstructions = completedConstructions.filter(
          construction => !submittedConstructionIds.includes(construction.id)
        );
        
        if (newConstructions.length > 0) {
          console.log('✨ Found new completed constructions to auto-submit:', newConstructions);
          
          // Auto-submit each new completed construction
          newConstructions.forEach(construction => {
            submitComponentConstruction(construction);
          });
        }
      }
    }
  }, [componentSelection.state.constructions, selectionMode, quizState.isLoading]);
  
  // Helper function to submit a component construction
  const submitComponentConstruction = useCallback((construction) => {
    console.log('🚀 Auto-submitting construction:', construction);
    
    // Only submit supported construction types
    if (construction.type === 'mudaf-mudaf-ilayh' || construction.type === 'jar-majroor') {
      const wordIndices = construction.components.map(comp => comp.wordIndex).sort((a, b) => a - b);
      
      // Add this construction ID to the submitted list
      setSubmittedConstructionIds(prev => [...prev, construction.id]);
      
      // Temporarily set the construction type in the quiz manager
      selectConstructionType(construction.type);
      
      // Clear current selection and set the word indices from the component construction
      selectedIndices.forEach(index => toggleWordSelection(index));
      wordIndices.forEach(index => {
        if (!selectedIndices.includes(index)) {
          toggleWordSelection(index);
        }
      });
      
      // Submit using the traditional method
      submitCurrentConstruction();
      
      console.log('✅ Construction auto-submitted successfully:', {
        type: construction.type,
        wordIndices
      });
    } else {
      console.log('⚠️ Skipping unsupported construction type:', construction.type);
    }
  }, [selectConstructionType, toggleWordSelection, selectedIndices, submitCurrentConstruction]);

  const progress = quizState.progress;
  const questionNumber = currentSession ? currentSession.questions.length + 1 : 0;

  // Handle quiz start with proper settings conversion
  const handleStartQuiz = (pronounSettings: any) => {
    const grammarSettings: GrammarQuizSettings = {
      questionCount: pronounSettings.questionCount || 10,
      difficulty: pronounSettings.difficulty || 'beginner',
      constructionTypes: ['mudaf-mudaf-ilayh', 'jar-majroor'],
      hintsEnabled: pronounSettings.showExplanations || false,
      immediateAnswers: true,
      confidenceTracking: false,
      retryIncorrect: false
    };
    
    startSession(grammarSettings);
  };

  // Render start screen
  if (!currentSession) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2">
                Arabic Grammar Construction Quiz
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Master Arabic grammatical constructions through interactive practice
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Target className="h-8 w-8 mx-auto text-blue-500" />
                  <h3 className="font-semibold">Construction Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Mudaf-Mudaf Ilayh & Jar-Majroor
                  </p>
                </div>
                <div className="space-y-2">
                  <Clock className="h-8 w-8 mx-auto text-green-500" />
                  <h3 className="font-semibold">Interactive Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Click words to identify constructions
                  </p>
                </div>
                <div className="space-y-2">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
                  <h3 className="font-semibold">Detailed Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from detailed explanations
                  </p>
                </div>
              </div>

              <QuizSettings onStartQuiz={handleStartQuiz} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render completed screen
  if (isSessionCompleted && currentSession.statistics) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <SessionSummary 
            stats={currentSession.statistics as any} // Type compatibility with existing component
            session={currentSession as any}
            onStartNewQuiz={resetQuiz}
          />
        </div>
      </div>
    );
  }

  // Render quiz in progress
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-6">
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
                    {currentSession.settings.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    <Brain className="h-3 w-3 mr-1" />
                    Grammar Construction
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
        {quizState.currentQuestion && !quizState.showFeedback && (
          <div className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">
                    Identify the grammatical construction in the Quranic verse below
                  </h3>
                  <p className="text-muted-foreground">
                    1. Click Arabic words to mark them with colored underlines • 2. Choose the construction type • 3. Submit your answer
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quranic Verse with Visual Word Marking */}
            <QuranVerseDisplay
              segments={quizState.currentQuestion.segments}
              selectedIndices={selectionMode === 'construction' ? selectedIndices : componentSelection.state.selectedWordIndices}
              onWordClick={selectionMode === 'construction' ? toggleWordSelection : componentSelection.toggleWordSelection}
              disabled={quizState.isLoading}
              verseMetadata={{
                surahId: quizState.currentQuestion.quranMetadata?.surahId || 0,
                surahName: quizState.currentQuestion.quranMetadata?.surahName || '',
                surahNameArabic: quizState.currentQuestion.quranMetadata?.surahNameArabic || '',
                verseId: quizState.currentQuestion.quranMetadata?.verseId || 0,
                translation: quizState.currentQuestion.quranMetadata?.translation || ''
              }}
              wordRoles={selectionMode === 'component' ? 
                Object.fromEntries(
                  componentSelection.state.assignedComponents.map(comp => [comp.wordIndex, comp.role])
                ) : undefined
              }
              showRoleIndicators={selectionMode === 'component'}
            />

            {/* Selection Mode Toggle */}
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="flex justify-center gap-2">
                  <Button
                    variant={selectionMode === 'construction' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionMode('construction')}
                  >
                    Construction Mode
                  </Button>
                  <Button
                    variant={selectionMode === 'component' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectionMode('component')}
                  >
                    Component Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Component Role Selector - Granular Mode */}
            {selectionMode === 'component' && (
              <ComponentSelector
                selectedRole={componentSelection.state.currentRole}
                onRoleSelect={componentSelection.selectRole}
                selectedWordCount={componentSelection.state.selectedWordIndices.length}
                disabled={quizState.isLoading}
                autoAssign={true}
                onAutoAssign={(role) => {
                  console.log('🎯 AUTO-ASSIGN TRIGGERED:', {
                    role,
                    selectedWordIndices: componentSelection.state.selectedWordIndices,
                    currentRole: componentSelection.state.currentRole,
                    assignedComponents: componentSelection.state.assignedComponents
                  });
                  
                  // Use our new atomic operation that combines role selection and assignment
                  // This fixes the early return bug by ensuring role is available during assignment
                  componentSelection.selectAndAssignRole(role);
                  
                  console.log('✅ After atomic role assignment:', {
                    assignedComponents: componentSelection.state.assignedComponents,
                    constructions: componentSelection.state.constructions
                  });
                  console.log('✅ Fixed auto-assignment with selectAndAssignRole:', {
                    assignedComponents: componentSelection.state.assignedComponents,
                    constructions: componentSelection.state.constructions,
                    selectedWordIndices: componentSelection.state.selectedWordIndices
                  });
                  // Note: assignRoleToSelectedWords() already clears word selection and role
                }}
              />
            )}

            {/* Construction Type Selector - Traditional Mode */}
            {selectionMode === 'construction' && (
              <RelationshipSelector
                selectedType={selectedConstructionType}
                onTypeSelect={selectConstructionType}
                disabled={quizState.isLoading}
              />
            )}

            {/* Component Mode: Ready to Submit Summary */}
            {selectionMode === 'component' && componentSelection.getCompletedConstructions().length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Ready to Submit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {componentSelection.getCompletedConstructions().map((construction, index) => (
                      <div key={construction.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-100">
                            {construction.type === 'mudaf-mudaf-ilayh' ? 'إضافة' : 'جار ومجرور'}
                          </Badge>
                          <span className="text-sm font-mono text-green-800">
                            Words: {construction.components.map(comp => comp.wordIndex).sort((a, b) => a - b).join(', ')}
                          </span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submitted Constructions Summary */}
            {submittedConstructions.length > 0 && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Submitted Constructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submittedConstructions.map((construction, index) => (
                      <div key={construction.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={construction.validation?.isCorrect ? "default" : "destructive"}>
                            {construction.constructionType === 'mudaf-mudaf-ilayh' ? 'إضافة' : 'جار ومجرور'}
                          </Badge>
                          <span className="text-sm font-mono">
                            Words: {construction.indices.join(', ')}
                          </span>
                        </div>
                        {construction.validation?.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Component Mode Actions - Only shown if auto-assign is disabled */}
            {false && selectionMode === 'component' && componentSelection.state.selectedWordIndices.length > 0 && componentSelection.state.currentRole && (
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    componentSelection.assignRoleToSelectedWords();
                    componentSelection.clearWordSelection();
                  }}
                  disabled={quizState.isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign {componentSelection.state.currentRole} Role
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear current selection
                    selectedIndices.forEach(index => toggleWordSelection(index));
                  }}
                  disabled={quizState.isLoading || selectedIndices.length === 0}
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('DEBUG: Add Construction button clicked', {
                      selectionMode,
                      hasWordSelection: selectedIndices.length > 0,
                      selectedConstructionType,
                      completedConstructionsCount: selectionMode === 'component' ? 
                        componentSelection.getCompletedConstructions().length : 0
                    });
                    
                    if (selectionMode === 'construction') {
                      // Traditional mode
                      console.log('DEBUG: Traditional mode - calling submitCurrentConstruction()');
                      submitCurrentConstruction();
                    } else {
                      // Component mode - submit completed constructions one by one
                      const completedConstructions = componentSelection.getCompletedConstructions();
                      console.log('DEBUG: Component mode - found completedConstructions count:', 
                        completedConstructions.length);
                      
                      completedConstructions.forEach(construction => {
                        const wordIndices = construction.components.map(comp => comp.wordIndex).sort((a, b) => a - b);
                        console.log('DEBUG: Processing construction', {
                          type: construction.type,
                          wordIndicesCount: wordIndices.length,
                          wordIndices: [...wordIndices]
                        });
                        
                        // Only submit supported construction types
                        if (construction.type === 'mudaf-mudaf-ilayh' || construction.type === 'jar-majroor') {
                          // Temporarily set the construction type and indices in the quiz manager
                          console.log('DEBUG: Setting construction type:', construction.type);
                          selectConstructionType(construction.type);
                          
                          // Set the word indices directly from the component construction
                          console.log('DEBUG: Current selectedIndices before updating:', 
                            selectedIndices.length > 0 ? [...selectedIndices] : []);
                          
                          console.log('DEBUG: Setting word indices directly to:', wordIndices);
                          // Use the new direct setter function
                          setWordIndices(wordIndices);
                          
                          // Submit using the traditional method after a longer delay to ensure state updates
                          console.log('DEBUG: Setting timeout to submit construction');
                          setTimeout(() => {
                            console.log('DEBUG: In timeout, checking selectedIndices:', 
                              selectedIndices.length > 0 ? [...selectedIndices] : []);
                            console.log('DEBUG: In timeout, calling submitCurrentConstruction');
                            submitCurrentConstruction();
                          }, 150);
                        }
                      });
                      
                      // Reset component selection after submission
                      setTimeout(() => {
                        console.log('DEBUG: Resetting component selection');
                        componentSelection.reset();
                      }, 100);
                    }
                  }}
                  disabled={
                    quizState.isLoading || 
                    (selectionMode === 'construction' && !canSubmitConstruction) ||
                    (selectionMode === 'component' && 
                      // Enable button if there are completed constructions OR if enough components are selected
                      componentSelection.getCompletedConstructions().length === 0 && 
                      // Check if we have enough assigned components to form a construction (at least 2)
                      componentSelection.state.assignedComponents.length < 2)
                  }
                  size="lg"
                  className="min-w-48"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Construction
                </Button>
              </div>

              {/* Complete Question Button */}
              {submittedConstructions.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    onClick={finalizeQuestion}
                    disabled={!canFinalizeQuestion || quizState.isLoading}
                    size="lg"
                    variant="default"
                    className="min-w-48 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Question
                  </Button>
                </div>
              )}
            </div>
            
            {!canSubmitConstruction && submittedConstructions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Mark Arabic words with underlines and choose a construction type to submit
              </p>
            )}
            
            {submittedConstructions.length > 0 && !canFinalizeQuestion && (
              <p className="text-sm text-muted-foreground text-center">
                Continue selecting constructions or click "Complete Question" to get feedback
              </p>
            )}
          </div>
        )}

        {/* Feedback Display */}
        {quizState.showFeedback && currentValidation && (
          <div className="space-y-6">
            {/* Show the verse with feedback highlighting */}
            <QuranVerseDisplay
              segments={quizState.currentQuestion!.segments}
              selectedIndices={selectedIndices}
              correctIndices={[]}
              incorrectIndices={[]}
              onWordClick={() => {}} // Disabled during feedback
              showFeedback={true}
              disabled={true}
              verseMetadata={{
                surahId: quizState.currentQuestion!.quranMetadata?.surahId || 0,
                surahName: quizState.currentQuestion!.quranMetadata?.surahName || '',
                surahNameArabic: quizState.currentQuestion!.quranMetadata?.surahNameArabic || '',
                verseId: quizState.currentQuestion!.quranMetadata?.verseId || 0,
                translation: quizState.currentQuestion!.quranMetadata?.translation || ''
              }}
            />

            {/* Feedback Component */}
            <GrammarQuizFeedback
              validation={currentValidation}
              responseTime={Date.now() - (currentSession.questions[currentSession.questions.length - 1]?.responseTimeMs || 0)}
              onNext={nextQuestion}
              showExplanation={currentSession.settings.immediateAnswers}
              allowRetry={currentSession.settings.retryIncorrect}
            />
          </div>
        )}

        {/* Loading State */}
        {quizState.isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <BookOpen className="h-8 w-8 mx-auto animate-pulse text-muted-foreground" />
                <p className="text-muted-foreground">Loading next question...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {quizState.error && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="space-y-4">
                <p className="text-destructive">{quizState.error}</p>
                <Button variant="outline" onClick={resetQuiz}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
