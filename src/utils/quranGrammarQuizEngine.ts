/**
 * Quran Grammar Quiz Engine
 * 
 * Core engine for generating and validating Quranic grammar quiz questions.
 * Integrates with existing grammar detection algorithms and Quranic data.
 */

import {
  QuranGrammarQuizQuestion,
  QuranGrammarConstruction,
  QuranUserSelection,
  QuranAnswerValidation,
  QuranGrammarQuizSession,
  QuranQuizSettings,
  QuranQuestionResult,
  VerseReference,
  WordSelection,
  QuranQuizGenerationConfig
} from '@/types/quranGrammarQuiz';
import { surahData } from '@/data/surahData';
import { MorphologicalDetails } from '@/types/morphology';
import { detectGrammaticalRelationships } from '@/utils/relationshipDetector';
import { IdafaDetector } from '@/utils/idafaDetector';

interface VerseData {
  surahId: number;
  verseId: number;
  surahName: string;
  surahNameArabic: string;
  arabicText: string;
  translation: string;
  segments: Record<string, MorphologicalDetails>;
}

export class QuranGrammarQuizEngine {
  private idafaDetector: IdafaDetector;
  private currentSession: QuranGrammarQuizSession | null = null;
  private questionBank: VerseData[] = [];

  constructor() {
    this.idafaDetector = new IdafaDetector();
    this.initializeQuestionBank();
  }

  /**
   * Initialize question bank from surahData
   */
  private initializeQuestionBank(): void {
    console.log('🏗️ Building Quran Grammar Quiz question bank...');
    
    this.questionBank = [];
    
    surahData.forEach(surah => {
      surah.verses.forEach(verse => {
        // Convert word segments to morphological details format
        const segments: Record<string, MorphologicalDetails> = {};
        
        verse.words.forEach(word => {
          word.segments.forEach(segment => {
            segments[segment.id] = {
              id: segment.id,
              text: segment.text,
              morphology: segment.morphology,
              type: segment.type,
              case: this.inferCase(segment),
              grammaticalRole: this.inferGrammaticalRole(segment)
            };
          });
        });

        const verseData: VerseData = {
          surahId: surah.id,
          verseId: verse.id,
          surahName: surah.name,
          surahNameArabic: surah.nameArabic,
          arabicText: verse.arabic,
          translation: verse.translation,
          segments
        };

        this.questionBank.push(verseData);
      });
    });

    console.log(`📚 Question bank initialized with ${this.questionBank.length} verses`);
  }

  /**
   * Infer grammatical case from segment data
   */
  private inferCase(segment: any): string | undefined {
    // Basic case inference - can be enhanced with more sophisticated logic
    if (segment.morphology === 'noun') {
      if (segment.text.endsWith('ُ')) return 'nominative';
      if (segment.text.endsWith('ِ') || segment.text.endsWith('ِينَ')) return 'genitive';
      if (segment.text.endsWith('َ')) return 'accusative';
    }
    return undefined;
  }

  /**
   * Infer grammatical role from segment data
   */
  private inferGrammaticalRole(segment: any): string | undefined {
    // Enhanced role inference based on existing patterns
    if (segment.morphology === 'particle' && segment.text.match(/^(لِ|بِ|فِي|عَلَى|إِلَى)$/)) {
      return 'preposition';
    }
    return undefined;
  }

  /**
   * Start a new quiz session
   */
  startSession(settings: QuranQuizSettings): QuranGrammarQuizSession {
    console.log('🎯 Starting Quran Grammar Quiz session');
    
    const session: QuranGrammarQuizSession = {
      id: `quran-session-${Date.now()}`,
      startTime: new Date(),
      settings,
      questions: [],
      statistics: {
        totalQuestions: 0,
        correctAnswers: 0,
        partiallyCorrectAnswers: 0,
        incorrectAnswers: 0,
        averageResponseTime: 0,
        accuracy: 0,
        constructionTypeAccuracy: {
          'mudaf-mudaf-ilayh': 0,
          'jar-majroor': 0
        }
      }
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Generate a quiz question from available verses
   */
  async generateQuestion(config: Partial<QuranQuizGenerationConfig> = {}): Promise<QuranGrammarQuizQuestion> {
    console.log('📝 Generating Quran grammar quiz question...');
    
    // Find verses with suitable grammar constructions
    const candidateVerses = this.findSuitableVerses(config);
    
    if (candidateVerses.length === 0) {
      throw new Error('No suitable verses found for quiz question generation');
    }

    // Select a random verse
    const selectedVerse = candidateVerses[Math.floor(Math.random() * candidateVerses.length)];
    
    // Detect grammar constructions in the verse
    const constructions = await this.detectConstructions(selectedVerse);
    
    if (constructions.length === 0) {
      throw new Error('No grammar constructions detected in selected verse');
    }

    // Select construction type for this question
    const constructionTypes = config.preferredConstructionTypes || ['mudaf-mudaf-ilayh', 'jar-majroor'];
    const availableTypes = [...new Set(constructions.map(c => c.type))];
    const validTypes = constructionTypes.filter(t => availableTypes.includes(t));
    
    if (validTypes.length === 0) {
      throw new Error('No valid construction types found in verse');
    }

    const targetType = validTypes[Math.floor(Math.random() * validTypes.length)];
    const targetConstructions = constructions.filter(c => c.type === targetType);

    // Convert verse words to WordSelection format
    const words = this.convertToWordSelections(selectedVerse);

    const question: QuranGrammarQuizQuestion = {
      id: `quran-question-${selectedVerse.surahId}-${selectedVerse.verseId}-${Date.now()}`,
      verse: {
        surahId: selectedVerse.surahId,
        verseId: selectedVerse.verseId,
        surahName: selectedVerse.surahName,
        surahNameArabic: selectedVerse.surahNameArabic
      },
      arabicText: selectedVerse.arabicText,
      translation: selectedVerse.translation,
      words,
      constructionType: targetType,
      correctAnswers: targetConstructions,
      prompt: this.generatePrompt(targetType)
    };

    console.log(`✅ Generated question for ${selectedVerse.surahName} ${selectedVerse.verseId}: ${targetType}`);
    return question;
  }

  /**
   * Convert verse data to WordSelection format
   */
  private convertToWordSelections(verse: VerseData): WordSelection[] {
    const words: WordSelection[] = [];
    
    // Extract words from segments
    const wordMap = new Map<string, string[]>();
    
    Object.values(verse.segments).forEach(segment => {
      const wordId = segment.id.split('-').slice(0, 3).join('-'); // Extract word ID
      if (!wordMap.has(wordId)) {
        wordMap.set(wordId, []);
      }
      wordMap.get(wordId)!.push(segment.text);
    });

    let order = 0;
    wordMap.forEach((segments, wordId) => {
      words.push({
        wordId,
        text: segments.join(''),
        isSelected: false,
        selectionOrder: order++
      });
    });

    return words.sort((a, b) => {
      // Sort by word ID to maintain correct order
      const aNum = parseInt(a.wordId.split('-')[2]);
      const bNum = parseInt(b.wordId.split('-')[2]);
      return aNum - bNum;
    });
  }

  /**
   * Generate appropriate prompt for construction type
   */
  private generatePrompt(type: 'mudaf-mudaf-ilayh' | 'jar-majroor'): string {
    const prompts = {
      'mudaf-mudaf-ilayh': 'Mark a Mudaf–Mudaf Ilayh construction (إضافة)',
      'jar-majroor': 'Mark a Jar–Majroor construction (جار ومجرور)'
    };
    return prompts[type];
  }

  /**
   * Find verses suitable for quiz questions
   */
  private findSuitableVerses(config: Partial<QuranQuizGenerationConfig>): VerseData[] {
    // For now, return a subset of verses that are likely to have constructions
    // This can be enhanced with pre-analysis
    return this.questionBank.filter(verse => {
      // Filter by surah range if specified
      if (config.preferredConstructionTypes) {
        // Add logic to pre-filter verses with required construction types
      }
      
      // Basic filtering - verses with multiple words are more likely to have constructions
      return Object.keys(verse.segments).length >= 4;
    });
  }

  /**
   * Detect grammar constructions in a verse
   */
  private async detectConstructions(verse: VerseData): Promise<QuranGrammarConstruction[]> {
    const constructions: QuranGrammarConstruction[] = [];
    
    try {
      // Detect Mudaf-Mudaf Ilayh constructions
      const idafaResult = this.idafaDetector.detectIdafaConstructions(verse.segments);
      
      idafaResult.constructions.forEach((idafa, index) => {
        const mudafText = verse.segments[idafa.mudafId]?.text || '';
        const mudafIlayhText = verse.segments[idafa.mudafIlayhId]?.text || '';
        
        constructions.push({
          type: 'mudaf-mudaf-ilayh',
          wordIds: [idafa.mudafId, idafa.mudafIlayhId],
          arabicText: `${mudafText} ${mudafIlayhText}`,
          grammaticalExplanation: `"${mudafText}" is the mudaf (possessed) and "${mudafIlayhText}" is the mudaf ilayh (possessor) in this possessive construction.`,
          confidence: idafa.confidence
        });
      });

      // Detect Jar-Majroor relationships
      const enhancedSegments = detectGrammaticalRelationships(verse.segments);
      
      Object.values(enhancedSegments).forEach(segment => {
        if (segment.relationships) {
          segment.relationships.forEach(rel => {
            if (rel.type === 'jar-majrur' && rel.role === 'jar') {
              const majroorSegment = enhancedSegments[rel.relatedSegmentId];
              if (majroorSegment) {
                constructions.push({
                  type: 'jar-majroor',
                  wordIds: [segment.id, rel.relatedSegmentId],
                  arabicText: `${segment.text} ${majroorSegment.text}`,
                  grammaticalExplanation: `"${segment.text}" is the preposition (jar) and "${majroorSegment.text}" is the object (majroor) of the preposition.`,
                  confidence: 0.9
                });
              }
            }
          });
        }
      });

    } catch (error) {
      console.error('Error detecting constructions:', error);
    }

    return constructions;
  }

  /**
   * Validate user's marked selection
   */
  validateAnswer(
    question: QuranGrammarQuizQuestion,
    userSelection: QuranUserSelection
  ): QuranAnswerValidation {
    console.log('📊 Validating Quran grammar quiz answer...');
    
    const correctConstructions = question.correctAnswers;
    let bestMatch = { score: 0, construction: null as QuranGrammarConstruction | null };
    
    // Find best matching construction
    correctConstructions.forEach(correct => {
      const score = this.calculateMatchScore(correct.wordIds, userSelection.selectedWordIds);
      if (score > bestMatch.score) {
        bestMatch = { score, construction: correct };
      }
    });

    const isCorrect = bestMatch.score >= 0.8;
    const isPartiallyCorrect = bestMatch.score >= 0.4 && bestMatch.score < 0.8;
    
    const validation: QuranAnswerValidation = {
      isCorrect,
      isPartiallyCorrect,
      score: Math.round(bestMatch.score * 100),
      correctConstructions,
      userConstructions: [], // Could be populated with user's attempted construction
      feedback: {
        message: isCorrect 
          ? 'Excellent! You correctly identified the construction.' 
          : isPartiallyCorrect 
            ? 'Partially correct. You identified some parts of the construction.'
            : 'Not quite right. Let me show you the correct construction.',
        explanation: bestMatch.construction?.grammaticalExplanation || 'No explanation available.',
        correctHighlight: isCorrect ? userSelection.selectedWordIds : (bestMatch.construction?.wordIds || []),
        incorrectHighlight: isCorrect ? [] : userSelection.selectedWordIds.filter(id => 
          !bestMatch.construction?.wordIds.includes(id)
        )
      }
    };

    console.log(`📊 Answer validation: ${isCorrect ? 'correct' : 'incorrect'} (score: ${validation.score})`);
    return validation;
  }

  /**
   * Calculate match score between correct and user selections
   */
  private calculateMatchScore(correctIds: string[], userIds: string[]): number {
    if (correctIds.length === 0 || userIds.length === 0) return 0;
    
    const correctSet = new Set(correctIds);
    const userSet = new Set(userIds);
    const intersection = new Set([...correctSet].filter(id => userSet.has(id)));
    const union = new Set([...correctSet, ...userSet]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Record answer for session tracking
   */
  recordAnswer(
    questionId: string,
    userSelection: QuranUserSelection,
    validation: QuranAnswerValidation,
    responseTime: number
  ): void {
    if (!this.currentSession) return;

    const result: QuranQuestionResult = {
      questionId,
      verse: this.getCurrentQuestionVerse(questionId),
      userSelection,
      validation,
      responseTimeMs: responseTime,
      timestamp: new Date()
    };

    this.currentSession.questions.push(result);
    this.updateSessionStatistics();
    
    console.log(`📝 Recorded answer for question ${questionId}: ${validation.isCorrect ? 'correct' : 'incorrect'}`);
  }

  /**
   * Get verse reference for current question
   */
  private getCurrentQuestionVerse(questionId: string): VerseReference {
    // Extract verse info from question ID format: quran-question-{surah}-{verse}-{timestamp}
    const parts = questionId.split('-');
    const surahId = parseInt(parts[2]);
    const verseId = parseInt(parts[3]);
    
    const surah = surahData.find(s => s.id === surahId);
    
    return {
      surahId,
      verseId,
      surahName: surah?.name || 'Unknown',
      surahNameArabic: surah?.nameArabic || 'غير معروف'
    };
  }

  /**
   * Update session statistics
   */
  private updateSessionStatistics(): void {
    if (!this.currentSession) return;

    const { questions } = this.currentSession;
    const stats = this.currentSession.statistics;
    
    stats.totalQuestions = questions.length;
    stats.correctAnswers = questions.filter(q => q.validation.isCorrect).length;
    stats.partiallyCorrectAnswers = questions.filter(q => q.validation.isPartiallyCorrect && !q.validation.isCorrect).length;
    stats.incorrectAnswers = questions.filter(q => !q.validation.isCorrect && !q.validation.isPartiallyCorrect).length;
    
    stats.averageResponseTime = questions.reduce((sum, q) => sum + q.responseTimeMs, 0) / questions.length;
    stats.accuracy = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
    
    // Update construction type accuracy
    const mudafQuestions = questions.filter(q => q.questionId.includes('mudaf-mudaf-ilayh'));
    const jarQuestions = questions.filter(q => q.questionId.includes('jar-majroor'));
    
    stats.constructionTypeAccuracy['mudaf-mudaf-ilayh'] = mudafQuestions.length > 0 
      ? (mudafQuestions.filter(q => q.validation.isCorrect).length / mudafQuestions.length) * 100 
      : 0;
    
    stats.constructionTypeAccuracy['jar-majroor'] = jarQuestions.length > 0 
      ? (jarQuestions.filter(q => q.validation.isCorrect).length / jarQuestions.length) * 100 
      : 0;
  }

  /**
   * Complete the current session
   */
  completeSession(): QuranGrammarQuizSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    this.updateSessionStatistics();
    
    console.log('🏁 Quran Grammar Quiz session completed');
    console.log(`📊 Final stats: ${this.currentSession.statistics.correctAnswers}/${this.currentSession.statistics.totalQuestions} correct (${this.currentSession.statistics.accuracy.toFixed(1)}%)`);
    
    const completedSession = this.currentSession;
    this.currentSession = null;
    
    return completedSession;
  }

  /**
   * Get current session statistics
   */
  getSessionStatistics() {
    return this.currentSession?.statistics || null;
  }
}

// Export singleton instance
export const quranGrammarQuizEngine = new QuranGrammarQuizEngine();
