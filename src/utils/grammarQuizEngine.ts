/**
 * Grammar Construction Quiz Engine
 * 
 * Leverages existing IdafaDetector and relationshipDetector to create
 * interactive quiz questions for Arabic grammatical constructions.
 */

import { IdafaDetector, IdafaConstruction } from './idafaDetector';
import { detectGrammaticalRelationships } from './relationshipDetector';
import { MorphologicalDetails, GrammaticalRelationship } from '@/types/morphology';
import {
  GrammarQuizQuestion,
  GrammarConstruction,
  UserSelection,
  AnswerValidation,
  QuizGenerationConfig,
  GrammarQuizSession,
  QuizSettings,
  QuestionResult,
  QuizStatistics
} from '@/types/grammarQuiz';
import { surahData } from '@/data/surahData';

export class GrammarQuizEngine {
  private idafaDetector: IdafaDetector;
  private questionBank: GrammarQuizQuestion[] = [];
  private currentSession: GrammarQuizSession | null = null;
  private quranVerseBank: Array<{
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    arabicText: string;
    translation: string;
    segments: Record<string, MorphologicalDetails>;
  }> = [];

  constructor() {
    this.idafaDetector = new IdafaDetector();
    this.initializeQuranBank();
    console.log('🧠 Grammar Quiz Engine initialized with Quranic verses');
  }

  /**
   * Initialize question bank from Quranic verses
   */
  private initializeQuranBank(): void {
    console.log('🏗️ Building Quranic verse bank for Grammar Quiz...');
    
    surahData.forEach(surah => {
      surah.verses.forEach(verse => {
        // Convert word segments to flat morphological details format
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

        this.quranVerseBank.push({
          surahId: surah.id,
          verseId: verse.id,
          surahName: surah.name,
          surahNameArabic: surah.nameArabic,
          arabicText: verse.arabic,
          translation: verse.translation,
          segments
        });
      });
    });
    
    console.log(`✅ Loaded ${this.quranVerseBank.length} Quranic verses for grammar quiz`);
  }

  /**
   * Infer case from segment morphology
   */
  private inferCase(segment: any): 'nominative' | 'genitive' | 'accusative' {
    // Basic case inference - can be enhanced
    if (segment.morphology === 'noun') {
      if (segment.text.endsWith('ُ')) return 'nominative';
      if (segment.text.endsWith('ِ') || segment.text.endsWith('ٍ')) return 'genitive';
      if (segment.text.endsWith('َ') || segment.text.endsWith('ً')) return 'accusative';
    }
    return 'nominative'; // default fallback
  }

  /**
   * Infer grammatical role from segment
   */
  private inferGrammaticalRole(segment: any): string {
    if (segment.morphology === 'particle' && segment.type === 'prefix') {
      if (['بِ', 'لِ', 'فِي', 'عَلَى', 'إِلَى', 'مِن'].includes(segment.text)) {
        return 'preposition';
      }
      return 'particle';
    }
    if (segment.morphology === 'noun') return 'noun';
    if (segment.morphology === 'verb') return 'verb';
    if (segment.morphology === 'adjective') return 'adjective';
    return 'unknown';
  }

  /**
   * Generate a quiz question from Quranic verses
   */
  async generateQuestion(
    config: Partial<QuizGenerationConfig> = {}
  ): Promise<GrammarQuizQuestion> {
    console.log('📝 Generating grammar quiz question from Quranic verses...');
    
    // Find verses with grammatical constructions
    const candidateVerses = await this.findVersesWithConstructions();
    
    if (candidateVerses.length === 0) {
      throw new Error('No suitable Quranic verses found with grammar constructions');
    }
    
    // Select a random verse
    const selectedVerse = candidateVerses[Math.floor(Math.random() * candidateVerses.length)];
    console.log(`Selected verse: ${selectedVerse.surahName} ${selectedVerse.verseId}`);
    
    return this.createQuestionFromVerse(selectedVerse, config);
  }

  /**
   * Detect grammar constructions in a verse
   */
  private async detectConstructionsInVerse(segments: Record<string, MorphologicalDetails>): Promise<GrammarConstruction[]> {
    const constructions: GrammarConstruction[] = [];
    const segmentArray = Object.values(segments);
    
    try {
      // Detect Mudaf-Mudaf Ilayh constructions using existing detector
      const idafaResult = this.idafaDetector.detectIdafaConstructions(segments);
      console.log(`Found ${idafaResult.constructions.length} Idafa constructions`);
      
      // Add Mudaf-Mudaf Ilayh constructions
      idafaResult.constructions.forEach((idafa, index) => {
        const construction = this.convertIdafaToConstruction(idafa, segmentArray, index);
        constructions.push(construction);
      });
      
      // Detect Jar-Majroor relationships using existing detector
      const enhancedSegments = detectGrammaticalRelationships(segments);
      
      // Extract Jar-Majroor relationships from enhanced segments
      const jarMajroorRelationships = this.extractJarMajroorRelationships(enhancedSegments);
      console.log(`Found ${jarMajroorRelationships.length} Jar-Majroor relationships`);
      
      // Add Jar-Majroor constructions
      jarMajroorRelationships.forEach((relationship, index) => {
        const construction = this.convertJarMajroorToConstruction(relationship, segmentArray, index);
        constructions.push(construction);
      });
      
      // Extract Mawsoof-Sifah relationships (الموصوف والصفة) from enhanced segments
      const mawsoofSifahRelationships = this.extractMawsoofSifahRelationships(enhancedSegments);
      console.log(`Found ${mawsoofSifahRelationships.length} Mawsoof-Sifah relationships`);
      
      // Add Mawsoof-Sifah constructions
      mawsoofSifahRelationships.forEach((relationship, index) => {
        const construction = this.convertMawsoofSifahToConstruction(relationship, segmentArray, index);
        constructions.push(construction);
      });
      
      // Extract Fi3l-Fa3il relationships (الفعل والفاعل) from enhanced segments
      const fi3lFa3ilRelationships = this.extractFi3lFa3ilRelationships(enhancedSegments);
      console.log(`Found ${fi3lFa3ilRelationships.length} Fi3l-Fa3il relationships`);
      
      // Add Fi3l-Fa3il constructions
      fi3lFa3ilRelationships.forEach((relationship, index) => {
        const construction = this.convertFi3lFa3ilToConstruction(relationship, segmentArray, index);
        constructions.push(construction);
      });
      
    } catch (error) {
      console.warn('Error detecting constructions:', error);
    }
    
    return constructions;
  }

  /**
   * Find verses that contain grammatical constructions
   */
  private async findVersesWithConstructions(): Promise<typeof this.quranVerseBank> {
    const versesWithConstructions = [];
    
    for (const verse of this.quranVerseBank) {
      try {
        const constructions = await this.detectConstructionsInVerse(verse.segments);
        if (constructions.length > 0) {
          versesWithConstructions.push(verse);
        }
      } catch (error) {
        console.warn(`Error checking constructions in ${verse.surahName} ${verse.verseId}:`, error);
      }
    }
    
    console.log(`Found ${versesWithConstructions.length} verses with grammar constructions`);
    return versesWithConstructions;
  }

  /**
   * Create a quiz question from a selected verse
   */
  private async createQuestionFromVerse(
    verse: typeof this.quranVerseBank[0],
    config: Partial<QuizGenerationConfig>
  ): Promise<GrammarQuizQuestion> {
    const segmentArray = Object.values(verse.segments);
    
    // Detect grammar constructions in the verse
    const correctAnswers = await this.detectConstructionsInVerse(verse.segments);
    
    if (correctAnswers.length === 0) {
      throw new Error(`No grammar constructions detected in ${verse.surahName} ${verse.verseId}`);
    }
    
    // Determine difficulty based on construction complexity
    const difficulty = this.calculateDifficulty(correctAnswers, segmentArray.length);
    
    const question: GrammarQuizQuestion = {
      id: `quran_quiz_${verse.surahId}_${verse.verseId}_${Date.now()}`,
      fragment: verse.arabicText,
      segments: segmentArray,
      correctAnswers,
      difficulty,
      metadata: {
        createdAt: new Date(),
        constructionTypes: correctAnswers.map(c => c.type),
        wordCount: segmentArray.length,
        estimatedDifficulty: this.estimateDifficultyScore(correctAnswers, segmentArray.length)
      },
      // Store Quranic metadata separately for access in UI
      quranMetadata: {
        surahId: verse.surahId,
        verseId: verse.verseId,
        surahName: verse.surahName,
        surahNameArabic: verse.surahNameArabic,
        translation: verse.translation
      }
    };
    
    console.log(`✅ Generated question with ${correctAnswers.length} constructions (${difficulty})`);
    return question;
  }

  /**
   * Validate user's answer against correct constructions
   */
  validateAnswer(
    question: GrammarQuizQuestion,
    userSelection: UserSelection
  ): AnswerValidation {
    console.log('🔍 Validating user answer...');
    
    const { selectedIndices, relationshipType } = userSelection;
    
    // Find matching constructions of the selected type
    const relevantConstructions = question.correctAnswers.filter(
      c => c.type === relationshipType
    );
    
    if (relevantConstructions.length === 0) {
      return {
        isCorrect: false,
        partialCredit: 0,
        feedback: {
          message: `No ${this.formatConstructionType(relationshipType)} constructions found in this fragment.`,
          explanation: 'Try selecting a different relationship type or different words.',
          corrections: [`Look for ${relationshipType === 'mudaf-mudaf-ilayh' ? 'possessive' : 'prepositional'} constructions`]
        },
        highlightCorrect: [],
        highlightIncorrect: selectedIndices
      };
    }
    
    // Check for exact matches
    const exactMatch = relevantConstructions.find(construction => 
      this.arraysEqual(construction.spans.sort(), selectedIndices.sort())
    );
    
    if (exactMatch) {
      return {
        isCorrect: true,
        partialCredit: 1.0,
        matchedConstruction: exactMatch,
        feedback: {
          message: '🎉 Excellent! Perfect identification.',
          explanation: exactMatch.explanation,
          encouragement: 'You correctly identified the grammatical construction!'
        },
        highlightCorrect: selectedIndices,
        highlightIncorrect: []
      };
    }
    
    // Check for partial matches
    const partialMatch = this.findBestPartialMatch(relevantConstructions, selectedIndices);
    
    if (partialMatch.score > 0.3) {
      return {
        isCorrect: false,
        partialCredit: partialMatch.score,
        matchedConstruction: partialMatch.construction,
        feedback: {
          message: `🔶 Partially correct! You identified ${Math.round(partialMatch.score * 100)}% of the construction.`,
          explanation: partialMatch.construction.explanation,
          corrections: this.generateCorrections(partialMatch.construction, selectedIndices)
        },
        highlightCorrect: this.intersection(partialMatch.construction.spans, selectedIndices),
        highlightIncorrect: this.difference(selectedIndices, partialMatch.construction.spans)
      };
    }
    
    // Incorrect answer - provide helpful feedback
    const bestConstruction = relevantConstructions[0];
    return {
      isCorrect: false,
      partialCredit: 0,
      feedback: {
        message: '❌ Incorrect selection.',
        explanation: `The correct ${this.formatConstructionType(relationshipType)} construction is: ${bestConstruction.explanation}`,
        corrections: [`Select words at positions: ${bestConstruction.spans.map(i => question.segments[i].text).join(' + ')}`]
      },
      highlightCorrect: bestConstruction.spans,
      highlightIncorrect: this.difference(selectedIndices, bestConstruction.spans)
    };
  }

  /**
   * Start a new quiz session
   */
  startSession(settings: QuizSettings): GrammarQuizSession {
    console.log('🎯 Starting new grammar quiz session');
    
    const session: GrammarQuizSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      questions: [],
      currentQuestionIndex: 0,
      statistics: this.initializeStatistics(),
      settings,
      metadata: {
        version: '1.0.0',
        totalPauseTimeMs: 0
      }
    };
    
    this.currentSession = session;
    return session;
  }

  /**
   * Record answer for current question in session
   */
  recordAnswer(
    questionId: string,
    userSelection: UserSelection,
    validation: AnswerValidation,
    responseTimeMs: number
  ): void {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }
    
    const question = this.questionBank.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }
    
    const result: QuestionResult = {
      questionId,
      fragment: question.fragment,
      userSelection,
      correctAnswers: question.correctAnswers,
      validation,
      responseTimeMs,
      attemptsCount: 1,
      timestamp: new Date(),
      metadata: {
        hintsUsed: 0,
        difficultyLevel: question.difficulty,
        wasSkipped: false
      }
    };
    
    this.currentSession.questions.push(result);
    this.updateSessionStatistics();
    
    console.log(`📊 Recorded answer: ${validation.isCorrect ? 'correct' : 'incorrect'} (${responseTimeMs}ms)`);
  }

  /**
   * Get current session statistics
   */
  getSessionStatistics(): QuizStatistics {
    if (!this.currentSession) {
      return this.initializeStatistics();
    }
    
    return this.currentSession.statistics;
  }

  /**
   * Complete current session
   */
  completeSession(): GrammarQuizSession {
    if (!this.currentSession) {
      throw new Error('No active session to complete');
    }
    
    this.currentSession.endTime = new Date();
    this.updateSessionStatistics();
    
    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    
    console.log('✅ Quiz session completed');
    return completedSession;
  }

  // Private helper methods

  private extractJarMajroorRelationships(
    enhancedSegments: Record<string, MorphologicalDetails>
  ): Array<{ jar: MorphologicalDetails; majroor: MorphologicalDetails }> {
    const relationships: Array<{ jar: MorphologicalDetails; majroor: MorphologicalDetails }> = [];
    
    Object.values(enhancedSegments).forEach(segment => {
      if (segment.relationships) {
        segment.relationships.forEach(rel => {
          if (rel.type === 'jar-majrur' && rel.role === 'jar') {
            const majroorSegment = enhancedSegments[rel.relatedSegmentId];
            if (majroorSegment) {
              relationships.push({ jar: segment, majroor: majroorSegment });
            }
          }
        });
      }
    });
    
    return relationships;
  }

  private convertIdafaToConstruction(
    idafa: IdafaConstruction,
    segments: MorphologicalDetails[],
    index: number
  ): GrammarConstruction {
    // Find positions of mudaf and mudaf ilayh in segment array
    const mudafIndex = segments.findIndex(s => s.id === idafa.mudaf.id);
    const mudafIlayhIndex = segments.findIndex(s => s.id === idafa.mudafIlayh.id);
    
    return {
      id: `idafa_${index}_${idafa.id}`,
      type: 'mudaf-mudaf-ilayh',
      spans: [mudafIndex, mudafIlayhIndex].filter(i => i !== -1),
      roles: ['mudaf', 'mudaf-ilayh'],
      certainty: idafa.certainty,
      explanation: `"${idafa.mudaf.text}" (mudaf) is in possessive relationship with "${idafa.mudafIlayh.text}" (mudaf ilayh). ${idafa.textbookRule}`,
      textbookRule: idafa.textbookRule
    };
  }

  private convertJarMajroorToConstruction(
    relationship: { jar: MorphologicalDetails; majroor: MorphologicalDetails },
    segments: MorphologicalDetails[],
    index: number
  ): GrammarConstruction {
    const jarIndex = segments.findIndex(s => s.id === relationship.jar.id);
    const majroorIndex = segments.findIndex(s => s.id === relationship.majroor.id);
    
    return {
      id: `jar_majroor_${index}`,
      type: 'jar-majroor',
      spans: [jarIndex, majroorIndex].filter(i => i !== -1),
      roles: ['jar', 'majroor'],
      certainty: 'definite',
      explanation: `"${relationship.jar.text}" (preposition) governs "${relationship.majroor.text}" (object) in genitive case.`
    };
  }

  private extractMawsoofSifahRelationships(
    enhancedSegments: Record<string, MorphologicalDetails>
  ): Array<{ mawsoof: MorphologicalDetails; sifah: MorphologicalDetails }> {
    const relationships: Array<{ mawsoof: MorphologicalDetails; sifah: MorphologicalDetails }> = [];
    
    Object.values(enhancedSegments).forEach(segment => {
      if (segment.relationships) {
        segment.relationships.forEach(rel => {
          if (rel.type === 'mawsoof-sifah' && rel.role === 'mawsoof') {
            const sifahSegment = enhancedSegments[rel.relatedSegmentId];
            if (sifahSegment) {
              relationships.push({ mawsoof: segment, sifah: sifahSegment });
            }
          }
        });
      }
    });
    
    return relationships;
  }

  private convertMawsoofSifahToConstruction(
    relationship: { mawsoof: MorphologicalDetails; sifah: MorphologicalDetails },
    segments: MorphologicalDetails[],
    index: number
  ): GrammarConstruction {
    const mawsoofIndex = segments.findIndex(s => s.id === relationship.mawsoof.id);
    const sifahIndex = segments.findIndex(s => s.id === relationship.sifah.id);
    
    return {
      id: `mawsoof_sifah_${index}`,
      type: 'mawsoof-sifah',
      spans: [mawsoofIndex, sifahIndex].filter(i => i !== -1),
      roles: ['mawsoof', 'sifah'],
      certainty: 'definite',
      explanation: `"${relationship.mawsoof.text}" (موصوف) is described by "${relationship.sifah.text}" (صفة) with full grammatical agreement.`
    };
  }

  private extractFi3lFa3ilRelationships(
    enhancedSegments: Record<string, MorphologicalDetails>
  ): Array<{ fi3l: MorphologicalDetails; fa3il: MorphologicalDetails }> {
    const relationships: Array<{ fi3l: MorphologicalDetails; fa3il: MorphologicalDetails }> = [];
    
    Object.values(enhancedSegments).forEach(segment => {
      if (segment.relationships) {
        segment.relationships.forEach(rel => {
          if (rel.type === 'fi3l-fa3il' && rel.role === 'fi3l') {
            const fa3ilSegment = enhancedSegments[rel.relatedSegmentId];
            if (fa3ilSegment) {
              relationships.push({ fi3l: segment, fa3il: fa3ilSegment });
            }
          }
        });
      }
    });
    
    return relationships;
  }

  private convertFi3lFa3ilToConstruction(
    relationship: { fi3l: MorphologicalDetails; fa3il: MorphologicalDetails },
    segments: MorphologicalDetails[],
    index: number
  ): GrammarConstruction {
    const fi3lIndex = segments.findIndex(s => s.id === relationship.fi3l.id);
    const fa3ilIndex = segments.findIndex(s => s.id === relationship.fa3il.id);
    
    return {
      id: `fi3l_fa3il_${index}`,
      type: 'fi3l-fa3il',
      spans: [fi3lIndex, fa3ilIndex].filter(i => i !== -1),
      roles: ['fi3l', 'fa3il'],
      certainty: 'definite',
      explanation: `"${relationship.fi3l.text}" (فعل) is performed by "${relationship.fa3il.text}" (فاعل) in nominative case.`
    };
  }

  private calculateDifficulty(
    constructions: GrammarConstruction[],
    wordCount: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    const complexityScore = constructions.length + (wordCount / 5);
    const hasInferred = constructions.some(c => c.certainty === 'inferred');
    
    if (complexityScore <= 2 && !hasInferred) return 'beginner';
    if (complexityScore <= 4) return 'intermediate';
    return 'advanced';
  }

  private estimateDifficultyScore(constructions: GrammarConstruction[], wordCount: number): number {
    let score = wordCount * 0.5;
    score += constructions.length * 2;
    score += constructions.filter(c => c.certainty === 'inferred').length * 1.5;
    score += constructions.filter(c => c.certainty === 'probable').length * 1;
    return Math.min(10, Math.max(1, score));
  }

  private findBestPartialMatch(
    constructions: GrammarConstruction[],
    selectedIndices: number[]
  ): { construction: GrammarConstruction; score: number } {
    let bestMatch = { construction: constructions[0], score: 0 };
    
    constructions.forEach(construction => {
      const intersection = this.intersection(construction.spans, selectedIndices);
      const union = this.union(construction.spans, selectedIndices);
      const score = intersection.length / union.length;
      
      if (score > bestMatch.score) {
        bestMatch = { construction, score };
      }
    });
    
    return bestMatch;
  }

  private generateCorrections(
    correctConstruction: GrammarConstruction,
    userSelection: number[]
  ): string[] {
    const corrections: string[] = [];
    const missing = this.difference(correctConstruction.spans, userSelection);
    const extra = this.difference(userSelection, correctConstruction.spans);
    
    if (missing.length > 0) {
      corrections.push(`You missed: positions ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      corrections.push(`Remove: positions ${extra.join(', ')}`);
    }
    
    return corrections;
  }

  private formatConstructionType(type: string): string {
    switch (type) {
      case 'mudaf-mudaf-ilayh': return 'possessive (Mudaf-Mudaf Ilayh)';
      case 'jar-majroor': return 'prepositional (Jar-Majroor)';
      default: return type;
    }
  }

  private initializeStatistics(): QuizStatistics {
    return {
      totalQuestions: 0,
      answeredQuestions: 0,
      correctAnswers: 0,
      partialCorrectAnswers: 0,
      accuracy: 0,
      averageResponseTimeMs: 0,
      constructionTypeAccuracy: {
        'mudaf-mudaf-ilayh': 0,
        'jar-majroor': 0,
        'mawsoof-sifah': 0,
        'fi3l-fa3il': 0
      },
      difficultyPerformance: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      improvementTrend: 0
    };
  }

  private updateSessionStatistics(): void {
    if (!this.currentSession) return;
    
    const results = this.currentSession.questions;
    const stats: QuizStatistics = {
      totalQuestions: results.length,
      answeredQuestions: results.length,
      correctAnswers: results.filter(r => r.validation.isCorrect).length,
      partialCorrectAnswers: results.filter(r => r.validation.partialCredit > 0 && !r.validation.isCorrect).length,
      accuracy: results.length > 0 ? results.filter(r => r.validation.isCorrect).length / results.length : 0,
      averageResponseTimeMs: results.length > 0 ? 
        results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length : 0,
      constructionTypeAccuracy: {
        'mudaf-mudaf-ilayh': this.calculateTypeAccuracy(results, 'mudaf-mudaf-ilayh'),
        'jar-majroor': this.calculateTypeAccuracy(results, 'jar-majroor'),
        'mawsoof-sifah': this.calculateTypeAccuracy(results, 'mawsoof-sifah'),
        'fi3l-fa3il': this.calculateTypeAccuracy(results, 'fi3l-fa3il')
      },
      difficultyPerformance: {
        beginner: this.calculateDifficultyAccuracy(results, 'beginner'),
        intermediate: this.calculateDifficultyAccuracy(results, 'intermediate'),
        advanced: this.calculateDifficultyAccuracy(results, 'advanced')
      },
      improvementTrend: this.calculateImprovementTrend(results)
    };
    
    this.currentSession.statistics = stats;
  }

  private calculateTypeAccuracy(results: QuestionResult[], type: string): number {
    const typeResults = results.filter(r => r.userSelection.relationshipType === type);
    if (typeResults.length === 0) return 0;
    return typeResults.filter(r => r.validation.isCorrect).length / typeResults.length;
  }

  private calculateDifficultyAccuracy(results: QuestionResult[], difficulty: string): number {
    const difficultyResults = results.filter(r => r.metadata.difficultyLevel === difficulty);
    if (difficultyResults.length === 0) return 0;
    return difficultyResults.filter(r => r.validation.isCorrect).length / difficultyResults.length;
  }

  private calculateImprovementTrend(results: QuestionResult[]): number {
    if (results.length < 3) return 0;
    
    const recentAccuracy = results.slice(-3).filter(r => r.validation.isCorrect).length / 3;
    const overallAccuracy = results.filter(r => r.validation.isCorrect).length / results.length;
    
    return recentAccuracy - overallAccuracy;
  }

  // Utility methods for array operations
  private arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every(val => b.includes(val));
  }

  private intersection(a: number[], b: number[]): number[] {
    return a.filter(val => b.includes(val));
  }

  private union(a: number[], b: number[]): number[] {
    return [...new Set([...a, ...b])];
  }

  private difference(a: number[], b: number[]): number[] {
    return a.filter(val => !b.includes(val));
  }
}

// Export singleton instance
export const grammarQuizEngine = new GrammarQuizEngine();
