/**
 * Grammar Quiz Engine
 * 
 * Main engine class that orchestrates the grammar quiz functionality
 */

import { surahData } from '@/data/surahData';
import { 
  GrammarQuizQuestion,
  GrammarConstruction,
  UserSelection,
  ConstructionValidation,
  QuizGenerationConfig,
  GrammarQuizSession,
  QuizSettings
} from '@/types/grammarQuiz';
import { MorphologicalDetails } from '@/types/morphology';
import { validateAnswer } from './answerValidator';
import { generateQuestion, findVersesWithConstructions, createQuestionFromVerse } from './questionGenerator';
import { startSession, recordAnswer, getSessionStatistics, completeSession } from './quizSession';
import { inferCase, inferGrammaticalRole } from './utils';
import { detectAllConstructions } from './detectors';

/**
 * Main Grammar Quiz Engine class
 * Manages quiz session, questions generation, and answer validation
 */
export class GrammarQuizEngine {
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
              case: inferCase(segment),
              grammaticalRole: inferGrammaticalRole(segment)
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
   * Start a new quiz session
   */
  public startSession(settings: QuizSettings): GrammarQuizSession {
    this.currentSession = startSession(settings);
    return this.currentSession;
  }

  /**
   * Generate a new quiz question
   */
  public async generateQuestion(
    config: Partial<QuizGenerationConfig> = {}
  ): Promise<GrammarQuizQuestion> {
    return generateQuestion(this.quranVerseBank, config);
  }

  /**
   * Detect grammatical constructions in a verse
   */
  public async detectConstructionsInVerse(
    segments: Record<string, MorphologicalDetails>
  ): Promise<GrammarConstruction[]> {
    return detectAllConstructions(segments);
  }

  /**
   * Find verses with grammatical constructions
   */
  public async findVersesWithConstructions(
    config: Partial<QuizGenerationConfig> = {}
  ): Promise<typeof this.quranVerseBank> {
    return findVersesWithConstructions(this.quranVerseBank, config);
  }

  /**
   * Create a question from a verse
   */
  public async createQuestionFromVerse(
    verse: typeof this.quranVerseBank[0],
    config: Partial<QuizGenerationConfig> = {}
  ): Promise<GrammarQuizQuestion> {
    return createQuestionFromVerse(verse, config);
  }

  /**
   * Validate user's answer
   */
  public validateAnswer(
    question: GrammarQuizQuestion,
    userSelection: UserSelection,
    previousSubmissions: UserSelection[] = []
  ): ConstructionValidation {
    return validateAnswer(question, userSelection, previousSubmissions);
  }

  /**
   * Record answer for the current session
   */
  public recordAnswer(
    questionId: string,
    validation: ConstructionValidation,
    responseTimeMs: number
  ): void {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }
    
    this.currentSession = recordAnswer(
      this.currentSession,
      questionId,
      validation,
      responseTimeMs
    );
  }

  /**
   * Get session statistics
   */
  public getSessionStatistics(): QuizStatistics {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }
    
    return getSessionStatistics(this.currentSession);
  }

  /**
   * Complete the current session
   */
  public completeSession(): GrammarQuizSession {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }
    
    const completedSession = completeSession(this.currentSession);
    this.currentSession = null;
    return completedSession;
  }
}

// Export singleton instance
export const grammarQuizEngine = new GrammarQuizEngine();
