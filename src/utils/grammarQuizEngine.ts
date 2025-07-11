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
  ConstructionValidation,
  QuizGenerationConfig,
  GrammarQuizSession,
  QuizSettings,
  QuestionResult,
  QuizStatistics,
  ConstructionType
} from '@/types/grammarQuiz';
import { roleBasedSampleQuestions, RoleBasedQuestionGenerator } from '../data/sampleRoleBasedQuestions';
import { surahData } from '@/data/surahData';

/**
 * Supported construction types for the grammar quiz
 * These are the only 4 construction types that should be included in quiz questions
 */
const SUPPORTED_CONSTRUCTION_TYPES: ConstructionType[] = [
  'mudaf-mudaf-ilayh',  // Iḍāfa (إضافة)
  'jar-majroor',        // Jar wa Majrūr
  'fil-fail',           // Fiʿl–Fāʿil
  'harf-nasb-ismuha'    // Harf Nasb + Ismuha
];

/**
 * Configuration for construction types with display names and descriptions
 */
const CONSTRUCTION_CONFIG: Record<ConstructionType, {
  englishName: string;
  arabicName: string;
  description: string;
}> = {
  'mudaf-mudaf-ilayh': {
    englishName: 'Iḍāfa',
    arabicName: 'إضافة',
    description: 'Possessive construction (Mudaf-Mudaf Ilayh)'
  },
  'jar-majroor': {
    englishName: 'Jar wa Majrūr',
    arabicName: 'جار ومجرور',
    description: 'Prepositional phrase (Jar-Majroor)'
  },
  'fil-fail': {
    englishName: 'Fiʿl–Fāʿil',
    arabicName: 'فعل وفاعل',
    description: 'Verb and subject construction (Fiʿl-Fāʿil)'
  },
  'harf-nasb-ismuha': {
    englishName: 'Harf Nasb + Ismuha',
    arabicName: 'حرف نصب واسمها',
    description: 'Accusative particle and its governed word (Harf Naṣb-Ismuha)'
  }
};

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
   * Start a new quiz session
   */
  startSession(settings: QuizSettings): GrammarQuizSession {
    console.log('🎯 Starting Grammar Quiz session');
    
    const session: GrammarQuizSession = {
      sessionId: `grammar-session-${Date.now()}`,
      startTime: new Date(),
      settings,
      questions: [],
      currentQuestionIndex: 0,
      statistics: this.initializeStatistics(),
      metadata: {
        version: '1.0.0',
        totalPauseTimeMs: 0
      }
    };

    this.currentSession = session;
    return session;
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
   * Detect only the 4 supported grammar constructions in a verse
   * COMPLETELY BYPASS detectGrammaticalRelationships to avoid detecting 15+ unwanted relationships
   */
  private async detectConstructionsInVerse(segments: Record<string, MorphologicalDetails>): Promise<GrammarConstruction[]> {
    console.log('🚀 CRITICAL FIX: SELECTIVE DETECTION OF ONLY 4 SUPPORTED TYPES');
    console.log(`💡 VERSE SEGMENTS: ${Object.keys(segments).length}`);
    console.log(`🎯 TARGET: Detect ONLY our 4 supported construction types, bypass all others`);
    
    const constructions: GrammarConstruction[] = [];
    const segmentArray = Object.values(segments);
    
    try {
      // 1. ✅ ONLY Detect Iḍāfa (mudaf-mudaf-ilayh) constructions
      console.log('🔍 1. Detecting Iḍāfa constructions...');
      const idafaResult = this.idafaDetector.detectIdafaConstructions(segments);
      const validIdafaConstructions = idafaResult.constructions.filter(c => c.mudaf && c.mudafIlayh);
      console.log(`✅ Found ${validIdafaConstructions.length} valid Iḍāfa constructions`);
      
      validIdafaConstructions.forEach((idafa, index) => {
        const construction = this.convertIdafaToConstruction(idafa, segmentArray, index);
        construction.type = 'mudaf-mudaf-ilayh';
        constructions.push(construction);
        console.log(`  + Added Iḍāfa: ${construction.id}`);
      });
      
      // 2. ✅ ONLY Detect Jar wa Majrūr using SELECTIVE detection
      console.log('🔍 2. Detecting Jar wa Majrūr constructions...');
      const jarMajroorConstructions = this.detectJarMajroorSelectively(segments);
      console.log(`✅ Found ${jarMajroorConstructions.length} Jar wa Majrūr constructions`);
      
      jarMajroorConstructions.forEach(construction => {
        construction.type = 'jar-majroor';
        constructions.push(construction);
        console.log(`  + Added Jar wa Majrūr: ${construction.id}`);
      });
      
      // 3. ✅ ONLY Detect Fiʿl–Fāʿil using SELECTIVE detection
      console.log('🔍 3. Detecting Fiʿl–Fāʿil constructions...');
      const fi3lFa3ilConstructions = this.detectFi3lFa3ilSelectively(segments);
      console.log(`✅ Found ${fi3lFa3ilConstructions.length} Fiʿl–Fāʿil constructions`);
      
      fi3lFa3ilConstructions.forEach(construction => {
        construction.type = 'fil-fail';
        constructions.push(construction);
        console.log(`  + Added Fiʿl–Fāʿil: ${construction.id}`);
      });
      
      // 4. ✅ ONLY Detect Harf Nasb + Ismuha using SELECTIVE detection
      console.log('🔍 4. Detecting Harf Nasb + Ismuha constructions...');
      const harfNasbConstructions = this.detectHarfNasbIsmuhaSelectively(segments);
      console.log(`✅ Found ${harfNasbConstructions.length} Harf Nasb + Ismuha constructions`);
      
      harfNasbConstructions.forEach(construction => {
        construction.type = 'harf-nasb-ismuha';
        constructions.push(construction);
        console.log(`  + Added Harf Nasb + Ismuha: ${construction.id}`);
      });
      
    } catch (error) {
      console.error('❌ Error in selective detection:', error);
    }
    
    // Final validation: ensure we only have our 4 supported types
    const finalConstructions = constructions.filter(c => 
      SUPPORTED_CONSTRUCTION_TYPES.includes(c.type)
    );
    
    console.log(`🎆 FINAL RESULT: ${finalConstructions.length} constructions of ONLY supported types`);
    finalConstructions.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.type}: ${CONSTRUCTION_CONFIG[c.type].englishName}`);
    });
    
    if (finalConstructions.length !== constructions.length) {
      console.warn(`⚠️ Filtered out ${constructions.length - finalConstructions.length} unsupported constructions`);
    }
    
    return finalConstructions;
  }

  /**
   * Find verses that contain grammatical constructions
   * Only returns verses containing at least one of the 4 supported construction types
   */
  private async findVersesWithConstructions(): Promise<typeof this.quranVerseBank> {
    const versesWithConstructions = [];
    
    console.log('🔍 Filtering verses for supported grammatical constructions...');
    console.log(`Supported types: ${SUPPORTED_CONSTRUCTION_TYPES.map(t => CONSTRUCTION_CONFIG[t].englishName).join(', ')}`);
    
    for (const verse of this.quranVerseBank) {
      try {
        const constructions = await this.detectConstructionsInVerse(verse.segments);
        
        // Filter to only include supported construction types
        const supportedConstructions = constructions.filter(c => 
          SUPPORTED_CONSTRUCTION_TYPES.includes(c.type)
        );
        
        // CRITICAL: Only include verses that have at least one supported construction
        // This prevents verses with unsupported constructions from causing NaN scores
        if (supportedConstructions.length > 0) {
          // Double-check: ensure all constructions are actually supported
          const allSupported = supportedConstructions.every(c => 
            SUPPORTED_CONSTRUCTION_TYPES.includes(c.type)
          );
          
          if (allSupported) {
            versesWithConstructions.push(verse);
            console.log(`✅ Verse ${verse.surahName} ${verse.verseId} - Found ${supportedConstructions.length} constructions: ${supportedConstructions.map(c => CONSTRUCTION_CONFIG[c.type].englishName).join(', ')}`);
          } else {
            console.log(`❌ Verse ${verse.surahName} ${verse.verseId} - Contains unsupported constructions, excluding`);
          }
        } else {
          console.log(`❌ Verse ${verse.surahName} ${verse.verseId} - No supported constructions found, excluding`);
        }
      } catch (error) {
        console.warn(`⚠️ Error checking constructions in ${verse.surahName} ${verse.verseId}:`, error);
      }
    }
    
    console.log(`📊 Filtered to ${versesWithConstructions.length} verses with supported constructions out of ${this.quranVerseBank.length} total verses`);
    return versesWithConstructions;
  }

  /**
   * Create a quiz question from a selected verse
   */
  private async createQuestionFromVerse(
    verse: typeof this.quranVerseBank[0],
    config: Partial<QuizGenerationConfig>
  ): Promise<GrammarQuizQuestion> {
    console.log('🎯 === CRITICAL DEBUG: createQuestionFromVerse ===');
    console.log(`📖 Verse: ${verse.surahName} ${verse.verseId}`);
    console.log(`📝 Segments count: ${Object.keys(verse.segments).length}`);
    
    const segmentArray = Object.values(verse.segments);
    
    // Detect grammar constructions in the verse
    console.log('🔍 About to call detectConstructionsInVerse...');
    const correctAnswers = await this.detectConstructionsInVerse(verse.segments);
    console.log(`🎯 CRITICAL: detectConstructionsInVerse returned ${correctAnswers.length} constructions`);
    
    // Log each construction type for debugging
    correctAnswers.forEach((answer, i) => {
      console.log(`  ${i+1}. Type: ${answer.type}, ID: ${answer.id}`);
    });
    
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
    
    console.log(`✅ FINAL QUESTION: Generated with ${correctAnswers.length} constructions (${difficulty})`);
    console.log(`📊 Question correctAnswers length: ${question.correctAnswers.length}`);
    return question;
  }

  /**
   * Validate user's answer with proportional scoring and detailed feedback
   * Shows exactly which constructions were present and which were correctly identified
   */
  validateAnswer(
    question: GrammarQuizQuestion,
    userSelection: UserSelection
  ): ConstructionValidation {
    console.log('🚀 CRITICAL DEBUGGING: validateAnswer ENTRY POINT');
    console.log(`💡 Question ID: ${question.id}`);
    console.log(`💡 User selection type: ${userSelection.relationshipType}`); 
    console.log(`💡 Total correctAnswers in question: ${question.correctAnswers.length}`);
    
    // Log all constructions in the question to debug the "8 constructions" issue
    console.log(`📊 ALL CONSTRUCTIONS IN QUESTION:`);
    question.correctAnswers.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.type} ${SUPPORTED_CONSTRUCTION_TYPES.includes(c.type) ? '✅' : '❌'}`); 
    });
    
    const { selectedIndices, relationshipType, roleBasedSelection } = userSelection;
    
    // Handle role-based constructions (Fiʿl-Fāʿil, Harf Naṣb-Ismuha)
    if (roleBasedSelection && (relationshipType === 'fil-fail' || relationshipType === 'harf-nasb-ismuha')) {
      console.log('🎯 Using role-based validation for', relationshipType);
      return this.validateRoleBasedAnswer(question, userSelection);
    }
    
    // STRICT FILTERING: Only include our 4 supported construction types
    // This is the core fix to prevent "Found 1/8 constructions" problem
    const allConstructions = question.correctAnswers.filter(c => 
      SUPPORTED_CONSTRUCTION_TYPES.includes(c.type)
    );
    
    console.log(`✅ FILTERED: ${allConstructions.length}/${question.correctAnswers.length} supported constructions`);
    allConstructions.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.type}: ${CONSTRUCTION_CONFIG[c.type].englishName}`); 
    });
    
    // Group constructions by type for detailed feedback
    const constructionsByType = this.groupConstructionsByType(allConstructions);
    
    // Build detailed feedback about each construction type present
    const constructionFeedback: Array<{
      type: ConstructionType;
      name: string;
      present: boolean;
      userIdentified: boolean;
      correct: boolean;
    }> = [];
    
    let totalConstructions = 0;
    let correctlyIdentified = 0;
    
    // Check each supported construction type that's actually present in the verse
    SUPPORTED_CONSTRUCTION_TYPES.forEach(type => {
      const constructionsOfType = constructionsByType[type] || [];
      const isPresent = constructionsOfType.length > 0;
      
      if (isPresent) {
        totalConstructions++;
        
        // Check if user identified this type correctly
        const userIdentified = relationshipType === type;
        let correct = false;
        
        if (userIdentified) {
          // Check if user's selection matches any construction of this type
          correct = constructionsOfType.some(construction => 
            this.arraysEqual(construction.spans.sort(), selectedIndices.sort())
          );
          
          if (correct) {
            correctlyIdentified++;
          }
        }
        
        constructionFeedback.push({
          type,
          name: CONSTRUCTION_CONFIG[type].englishName,
          present: true,
          userIdentified,
          correct
        });
      }
    });
    
    console.log(`📊 FEEDBACK DATA:`);
    console.log(`  Total supported constructions: ${totalConstructions}`);
    console.log(`  Correctly identified: ${correctlyIdentified}`);
    console.log(`  Construction feedback:`, constructionFeedback);
    
    // Calculate score based on proportion of correctly identified constructions
    // Safety check to avoid division by zero
    const score = totalConstructions > 0 ? 
      Math.round((correctlyIdentified / totalConstructions) * 100) : 
      0;
      
    console.log(`💰 FINAL SCORE: ${correctlyIdentified}/${totalConstructions} = ${score}%`);
    
    // Determine correctness status for feedback
    const isCorrect = score === 100;
    const isPartiallyCorrect = score > 0 && score < 100;
    
    // Build feedback message with appropriate status
    const feedbackLines = [`This verse contains ${totalConstructions} supported construction${totalConstructions !== 1 ? 's' : ''}:`];
    
    constructionFeedback.forEach(feedback => {
      if (feedback.present) {
        const status = feedback.correct ? '✅' : (feedback.userIdentified ? '❌' : '➖');
        const message = feedback.correct ? 'Correct' : 
                       feedback.userIdentified ? 'Incorrect' : 'Not identified';
        feedbackLines.push(`${status} ${feedback.name} – ${message}`);
      }
    });
    
    // Add proportional score info with clear status message
    if (totalConstructions > 0) {
      const statusMessage = isCorrect ? 'All correct!' : 
                           isPartiallyCorrect ? 'Partially correct.' : 
                           'No constructions identified correctly.';
      feedbackLines.push(`Score: ${correctlyIdentified}/${totalConstructions} construction${totalConstructions !== 1 ? 's' : ''} identified (${score}%) - ${statusMessage}`);
    } else {
      feedbackLines.push(`No supported constructions found in this verse.`);
    }
    
    const feedbackMessage = feedbackLines.join('\n');
    
    // Find the best construction for detailed explanation
    const targetConstruction = allConstructions.find(c => c.type === relationshipType) || allConstructions[0];
    
    return {
      constructionId: targetConstruction?.id || 'validation-result',
      isCorrect,
      userAnswer: {
        constructionId: 'user-answer',
        selectedIndices,
        selectedType: relationshipType,
        timestamp: Date.now()
      },
      correctAnswer: targetConstruction || {
        id: 'no-construction',
        type: relationshipType,
        spans: [],
        roles: [],
        certainty: 'inferred',
        explanation: 'No matching construction found'
      },
      feedback: {
        message: feedbackMessage,
        explanation: targetConstruction?.explanation || 'Review the constructions in this verse.',
        encouragement: isCorrect ? 'Excellent work! You identified all constructions correctly.' :
                      isPartiallyCorrect ? 'Good progress! You correctly identified some constructions.' :
                      'Keep practicing to improve your construction identification skills.'
      },
      score
    };
  }

  /**
   * Validate role-based constructions (Fiʿl-Fāʿil, Harf Naṣb-Ismuha)
   */
  private validateRoleBasedAnswer(
    question: GrammarQuizQuestion,
    userSelection: UserSelection
  ): ConstructionValidation {
    console.log('🔍 Validating role-based construction answer...');
    
    const { relationshipType, roleBasedSelection } = userSelection;
    
    if (!roleBasedSelection) {
      return this.createValidationError('Missing role-based selection data', relationshipType);
    }
    
    // Find relevant constructions of this type
    const relevantConstructions = question.correctAnswers.filter(
      c => c.type === relationshipType
    );
    
    if (relevantConstructions.length === 0) {
      return this.createValidationError(`No ${relationshipType} constructions found`, relationshipType);
    }
    
    // Check if both primary and secondary roles are selected
    if (roleBasedSelection.step !== 'complete' || 
        roleBasedSelection.primaryIndices.length === 0 || 
        roleBasedSelection.secondaryIndices.length === 0) {
      return this.createValidationError('Incomplete role selection', relationshipType);
    }
    
    // Validate role assignments against correct constructions
    const bestMatch = this.findBestRoleMatch(relevantConstructions, roleBasedSelection);
    
    if (bestMatch.score >= 0.8) {
      return {
        constructionId: bestMatch.construction.id,
        isCorrect: true,
        userAnswer: {
          constructionId: 'role-based-answer',
          selectedIndices: [...roleBasedSelection.primaryIndices, ...roleBasedSelection.secondaryIndices],
          selectedType: relationshipType,
          timestamp: Date.now()
        },
        correctAnswer: bestMatch.construction,
        feedback: {
          message: '🎉 Excellent! Perfect role identification.',
          explanation: bestMatch.construction.explanation,
          encouragement: 'You correctly identified both grammatical roles!'
        },
        score: 100
      };
    } else if (bestMatch.score > 0.3) {
      return {
        constructionId: bestMatch.construction.id,
        isCorrect: false,
        userAnswer: {
          constructionId: 'role-based-answer',
          selectedIndices: [...roleBasedSelection.primaryIndices, ...roleBasedSelection.secondaryIndices],
          selectedType: relationshipType,
          timestamp: Date.now()
        },
        correctAnswer: bestMatch.construction,
        feedback: {
          message: `🔶 Partially correct! ${Math.round(bestMatch.score * 100)}% accuracy.`,
          explanation: bestMatch.construction.explanation,
          encouragement: 'Review the roles and their relationships.'
        },
        score: Math.round(bestMatch.score * 70)
      };
    } else {
      return {
        constructionId: bestMatch.construction.id,
        isCorrect: false,
        userAnswer: {
          constructionId: 'role-based-answer',
          selectedIndices: [...roleBasedSelection.primaryIndices, ...roleBasedSelection.secondaryIndices],
          selectedType: relationshipType,
          timestamp: Date.now()
        },
        correctAnswer: bestMatch.construction,
        feedback: {
          message: '❌ Incorrect role assignment.',
          explanation: bestMatch.construction.explanation,
          encouragement: 'Focus on identifying the verb-subject or particle-noun relationships.'
        },
        score: 0
      };
    }
  }

  /**
   * Find best matching role-based construction
   */
  private findBestRoleMatch(
    constructions: GrammarConstruction[],
    roleSelection: NonNullable<UserSelection['roleBasedSelection']>
  ): { construction: GrammarConstruction; score: number } {
    let bestMatch = { construction: constructions[0], score: 0 };
    
    for (const construction of constructions) {
      const score = this.calculateRoleMatchScore(construction, roleSelection);
      if (score > bestMatch.score) {
        bestMatch = { construction, score };
      }
    }
    
    return bestMatch;
  }

  /**
   * Calculate role matching score
   */
  private calculateRoleMatchScore(
    construction: GrammarConstruction,
    roleSelection: NonNullable<UserSelection['roleBasedSelection']>
  ): number {
    // For role-based constructions, use roleBasedRelationship property
    if (!construction.roleBasedRelationship) {
      // Fallback: use spans array for simple matching
      const allUserIndices = [...roleSelection.primaryIndices, ...roleSelection.secondaryIndices].sort();
      const constructionSpans = construction.spans.sort();
      return this.arraysEqual(allUserIndices, constructionSpans) ? 1.0 : 0.0;
    }
    
    const { primaryIndices, secondaryIndices } = construction.roleBasedRelationship;
    
    // Check if user selections match the correct role spans
    const primaryMatch = this.arraysEqual(
      roleSelection.primaryIndices.sort(),
      primaryIndices.sort()
    );
    const secondaryMatch = this.arraysEqual(
      roleSelection.secondaryIndices.sort(),
      secondaryIndices.sort()
    );
    
    if (primaryMatch && secondaryMatch) return 1.0;
    if (primaryMatch || secondaryMatch) return 0.6;
    
    // Partial overlap scoring
    const primaryOverlap = primaryIndices.length > 0 ? 
      this.intersection(roleSelection.primaryIndices, primaryIndices).length / primaryIndices.length : 0;
    const secondaryOverlap = secondaryIndices.length > 0 ? 
      this.intersection(roleSelection.secondaryIndices, secondaryIndices).length / secondaryIndices.length : 0;
    
    return (primaryOverlap + secondaryOverlap) / 2;
  }

  /**
   * Create validation error response
   */
  private createValidationError(message: string, relationshipType: string): ConstructionValidation {
    return {
      constructionId: 'validation-error',
      isCorrect: false,
      userAnswer: {
        constructionId: 'error-answer',
        selectedIndices: [],
        selectedType: relationshipType as any,
        timestamp: Date.now()
      },
      correctAnswer: {
        id: 'error-construction',
        type: relationshipType as any,
        spans: [],
        roles: [],
        certainty: 'inferred',
        explanation: 'Validation error'
      },
      feedback: {
        message,
        explanation: 'Please complete the role selection process.',
        encouragement: 'Try again with proper role assignments.'
      },
      score: 0
    };
  }

  /**
   * Record answer for current question in session
   */
  recordAnswer(
    questionId: string,
    validation: ConstructionValidation,
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
      userAnswer: validation.userAnswer,
      correctConstructions: question.correctAnswers,
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
      explanation: `"${idafa.mudaf.text}" (mudaf) is in possessive relationship with "${idafa.mudafIlayh.text}" (mudaf ilayh).`
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
      type: 'mudaf-mudaf-ilayh', // Fixed: using valid ConstructionType
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
      type: 'fil-fail',
      spans: [fi3lIndex, fa3ilIndex].filter(i => i !== -1),
      roles: ['fi3l', 'fa3il'],
      certainty: 'definite',
      explanation: `"${relationship.fi3l.text}" (فعل) is performed by "${relationship.fa3il.text}" (فاعل) in nominative case.`
    };
  }

  /**
   * Extract Harf Nasb + Ismuha relationships from enhanced segments
   * Harf Nasb (حرف نصب) are accusative particles like إنّ، أنّ، لكنّ، كأنّ، ليت، لعلّ
   * Ismuha (اسمها) is the noun that follows and is put in accusative case
   */
  private extractHarfNasbIsmuhaRelationships(enhancedSegments: Record<string, MorphologicalDetails>): Array<{
    harfNasbIndex: number;
    ismuhaIndex: number;
    harfNasbSegment: MorphologicalDetails;
    ismuhaSegment: MorphologicalDetails;
  }> {
    const relationships: Array<{
      harfNasbIndex: number;
      ismuhaIndex: number;
      harfNasbSegment: MorphologicalDetails;
      ismuhaSegment: MorphologicalDetails;
    }> = [];
    
    const segments = Object.values(enhancedSegments);
    
    // Common Harf Nasb particles
    const harfNasbParticles = ['إنّ', 'أنّ', 'لكنّ', 'كأنّ', 'ليت', 'لعلّ'];
    
    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      // Check if current segment is a Harf Nasb
      const isHarfNasb = harfNasbParticles.some(particle => 
        current.text.includes(particle) || current.morphology?.includes('particle')
      );
      
      // Check if next segment could be Ismuha (noun in accusative case)
      const couldBeIsmuha = next.morphology?.includes('noun') || 
                           next.grammaticalRole === 'accusative';
      
      if (isHarfNasb && couldBeIsmuha) {
        relationships.push({
          harfNasbIndex: i,
          ismuhaIndex: i + 1,
          harfNasbSegment: current,
          ismuhaSegment: next
        });
      }
    }
    
    return relationships;
  }

  /**
   * Convert Harf Nasb + Ismuha relationship to GrammarConstruction
   */
  private convertHarfNasbIsmuhaToConstruction(
    relationship: {
      harfNasbIndex: number;
      ismuhaIndex: number;
      harfNasbSegment: MorphologicalDetails;
      ismuhaSegment: MorphologicalDetails;
    },
    segments: MorphologicalDetails[],
    constructionIndex: number
  ): GrammarConstruction {
    return {
      id: `harf-nasb-ismuha-${constructionIndex}`,
      type: 'harf-nasb-ismuha' as ConstructionType,
      spans: [relationship.harfNasbIndex, relationship.ismuhaIndex],
      roles: ['harf-nasb', 'ismuha'],
      certainty: 'inferred',
      explanation: `Harf Nasb "${relationship.harfNasbSegment.text}" governs the noun "${relationship.ismuhaSegment.text}" putting it in accusative case`
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
        'fil-fail': 0,
        'harf-nasb-ismuha': 0
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
      partialCorrectAnswers: results.filter(r => r.validation.score > 0 && r.validation.score < 100).length,
      accuracy: results.length > 0 ? results.filter(r => r.validation.isCorrect).length / results.length : 0,
      averageResponseTimeMs: results.length > 0 ? 
        results.reduce((sum, r) => sum + r.responseTimeMs, 0) / results.length : 0,
      constructionTypeAccuracy: {
        'mudaf-mudaf-ilayh': this.calculateTypeAccuracy(results, 'mudaf-mudaf-ilayh'),
        'jar-majroor': this.calculateTypeAccuracy(results, 'jar-majroor'),
        'fil-fail': this.calculateTypeAccuracy(results, 'fil-fail'),
        'harf-nasb-ismuha': this.calculateTypeAccuracy(results, 'harf-nasb-ismuha')
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
    const typeResults = results.filter(r => r.userAnswer.selectedType === type);
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

  /**
   * Group constructions by type for organized feedback
   */
  private groupConstructionsByType(constructions: GrammarConstruction[]): Record<ConstructionType, GrammarConstruction[]> {
    const grouped: Record<ConstructionType, GrammarConstruction[]> = {
      'mudaf-mudaf-ilayh': [],
      'jar-majroor': [],
      'fil-fail': [],
      'harf-nasb-ismuha': []
    };
    
    constructions.forEach(construction => {
      if (grouped[construction.type]) {
        grouped[construction.type].push(construction);
      }
    });
    
    return grouped as Record<ConstructionType, GrammarConstruction[]>;
  }

  /**
   * Format construction type name for user-friendly display
   */
  private getConstructionDisplayName(type: ConstructionType): string {
    return CONSTRUCTION_CONFIG[type]?.englishName || type;
  }

  /**
   * Check if user has correctly identified a specific construction type
   */
  private hasUserIdentifiedConstructionCorrectly(
    constructions: GrammarConstruction[], 
    userSelection: number[], 
    userType: ConstructionType
  ): boolean {
    return constructions.some(construction => 
      construction.type === userType &&
      this.arraysEqual(construction.spans.sort(), userSelection.sort())
    );
  }

  /**
   * SELECTIVE DETECTION: Only detect Jar wa Majrūr relationships, ignore all others
   * Detects both separate preposition + noun pairs AND attached prepositions within single tokens
   */
  private detectJarMajroorSelectively(segments: Record<string, MorphologicalDetails>): GrammarConstruction[] {
    console.log('🎯 SELECTIVE: Detecting ONLY Jar wa Majrūr relationships');
    const constructions: GrammarConstruction[] = [];
    const segmentArray = Object.values(segments).sort((a, b) => {
      const aNum = parseInt(a.id.split('-').join(''));
      const bNum = parseInt(b.id.split('-').join(''));
      return aNum - bNum;
    });

    // Define Arabic prepositions for detection
    const prepositions = [
      // Single-letter prepositions with diacritics
      'بِ', 'لِ', 'كِ', 'تِ', 'وِ',
      // Single-letter prepositions without diacritics
      'ب', 'ل', 'ك', 'ت', 'و',
      // Multi-letter prepositions
      'مِن', 'إِلَى', 'عَن', 'فِي', 'عَلَى',
      'من', 'إلى', 'عن', 'في', 'على',
      'عند', 'لدى', 'حتى', 'أمام', 'خلف', 'فوق', 'تحت'
    ];

    console.log(`  📋 Will check ${segmentArray.length} segments for Jar wa Majrūr constructions`);

    // Method 1: Check for separate preposition + noun pairs
    for (let i = 0; i < segmentArray.length - 1; i++) {
      const currentSegment = segmentArray[i];
      const nextSegment = segmentArray[i + 1];
      
      console.log(`  📝 Checking separate pair ${i}-${i+1}: "${currentSegment.text}" + "${nextSegment.text}"`);
      console.log(`     - current morphology: ${currentSegment.morphology}, grammaticalRole: ${currentSegment.grammaticalRole}`);
      console.log(`     - next morphology: ${nextSegment.morphology}, case: ${nextSegment.case}`);
      
      // Check if current segment is a preposition
      const isPrepositionByMorphology = currentSegment.morphology === 'particle' && currentSegment.grammaticalRole === 'preposition';
      const isPrepositionByText = prepositions.includes(currentSegment.text);
      const isPreposition = isPrepositionByMorphology || isPrepositionByText;
      
      console.log(`     - preposition checks: byMorphology=${isPrepositionByMorphology}, byText=${isPrepositionByText}`);
      
      if (isPreposition) {
        // Check if next segment is a noun or construct that could be majroor
        const isNoun = nextSegment.morphology === 'noun' || nextSegment.morphology?.includes('noun');
        const isArabicNoun = nextSegment.morphology?.includes('اسم');
        const isConstruct = nextSegment.grammaticalRole === 'construct';
        const isGenitive = nextSegment.case === 'genitive';
        
        console.log(`     - noun checks: isNoun=${isNoun}, isArabicNoun=${isArabicNoun}, isConstruct=${isConstruct}, isGenitive=${isGenitive}`);
        
        if (isNoun || isArabicNoun || isConstruct || isGenitive) {
          const construction: GrammarConstruction = {
            id: `jar-majroor-separate-${i}-${Date.now()}`,
            type: 'jar-majroor',
            spans: [i, i + 1],
            roles: ['jar', 'majroor'],
            certainty: 'definite',
            explanation: `"${currentSegment.text}" is the preposition (jar) and "${nextSegment.text}" is the genitive noun (majroor).`
          };
          
          constructions.push(construction);
          console.log(`  ✅✅ FOUND Jar wa Majrūr (separate): "${currentSegment.text}" + "${nextSegment.text}"`);
        }
      }
    }

    // Method 2: Check for attached prepositions within single tokens
    for (let i = 0; i < segmentArray.length; i++) {
      const segment = segmentArray[i];
      const text = segment.text;
      console.log(`  📝 Checking attached in segment ${i}: "${text}"`);
      console.log(`     - morphology: ${segment.morphology}`);
      console.log(`     - type: ${segment.type}`);
      console.log(`     - case: ${segment.case}`);
      
      // Check if token starts with an attached preposition
      for (const prep of prepositions) {
        if (text.startsWith(prep) && text.length > prep.length) {
          const remainingText = text.substring(prep.length);
          console.log(`    ✨ "${text}" starts with "${prep}" -> remaining: "${remainingText}"`);
          
          // Check if the remaining part indicates it's a noun (based on morphology or context)
          const isNoun = segment.morphology === 'noun' || segment.morphology?.includes('noun');
          const isArabicNoun = segment.morphology?.includes('اسم');
          const isConstruct = segment.grammaticalRole === 'construct';
          const isGenitive = segment.case === 'genitive';
          
          console.log(`    📊 Noun checks: isNoun=${isNoun}, isArabicNoun=${isArabicNoun}, isConstruct=${isConstruct}, isGenitive=${isGenitive}`);
          
          if (isNoun || isArabicNoun || isConstruct || isGenitive) {
            const construction: GrammarConstruction = {
              id: `jar-majroor-attached-${i}-${Date.now()}`,
              type: 'jar-majroor',
              spans: [i], // Single token contains both jar and majroor
              roles: ['jar-majroor'], // Combined role for attached preposition
              certainty: 'definite',
              explanation: `"${text}" contains the preposition "${prep}" attached to the noun "${remainingText}", forming a jar wa majrūr construction.`
            };
            
            constructions.push(construction);
            console.log(`  ✅✅ FOUND Jar wa Majrūr (attached): ${prep} + ${remainingText} in "${text}"`);
            break; // Only match the first preposition found
          } else {
            console.log(`    ❌ Not recognized as a noun construction`);
          }
        }
      }
    }
    
    console.log(`  🎯 Total Jar wa Majrūr constructions found: ${constructions.length}`);
    return constructions;
  }

  /**
   * SELECTIVE DETECTION: Only detect Fiʿl–Fāʿil relationships, ignore all others
   */
  private detectFi3lFa3ilSelectively(segments: Record<string, MorphologicalDetails>): GrammarConstruction[] {
    // ... (rest of the code remains the same)
    const constructions: GrammarConstruction[] = [];
    const segmentArray = Object.values(segments).sort((a, b) => {
      const aNum = parseInt(a.id.split('-').join(''));
      const bNum = parseInt(b.id.split('-').join(''));
      return aNum - bNum;
    });
    
    // Look for verb + subject pattern
    for (let i = 0; i < segmentArray.length - 1; i++) {
      const currentSegment = segmentArray[i];
      const nextSegment = segmentArray[i + 1];
      
      // Check if current segment is a verb (fi'l)
      if (currentSegment.morphology?.includes('VERB') || 
          currentSegment.morphology?.includes('فعل')) {
        
        // Check if next segment is a noun that could be the subject (fa'il)
        if (nextSegment.morphology?.includes('NOUN') || 
            nextSegment.morphology?.includes('اسم')) {
          
          const construction: GrammarConstruction = {
            id: `fil-fail-${i}-${Date.now()}`,
            type: 'fil-fail',
            spans: [i, i + 1],
            roles: ['fi3l', 'fa3il'],
            certainty: 'definite',
            explanation: `"${currentSegment.text}" is the verb (fiʿl) and "${nextSegment.text}" is the subject (fāʿil).`
          };
          
          constructions.push(construction);
          console.log(`  ✅ Found Fiʿl–Fāʿil: ${currentSegment.text} + ${nextSegment.text}`);
        }
      }
    }
    
    return constructions;
  }

  /**
   * SELECTIVE DETECTION: Only detect Harf Nasb + Ismuha relationships, ignore all others
   */
  private detectHarfNasbIsmuhaSelectively(segments: Record<string, MorphologicalDetails>): GrammarConstruction[] {
    console.log('🎯 SELECTIVE: Detecting ONLY Harf Nasb + Ismuha relationships');
    const constructions: GrammarConstruction[] = [];
    const segmentArray = Object.values(segments).sort((a, b) => {
      const aNum = parseInt(a.id.split('-').join(''));
      const bNum = parseInt(b.id.split('-').join(''));
      return aNum - bNum;
    });
    
    // Look for accusative particle + following noun pattern
    const harfNasbParticles = ['أن', 'إن', 'كأن', 'لكن', 'ليت', 'لعل'];
    
    for (let i = 0; i < segmentArray.length - 1; i++) {
      const currentSegment = segmentArray[i];
      const nextSegment = segmentArray[i + 1];
      
      // Check if current segment is a harf nasb
      if (harfNasbParticles.includes(currentSegment.text) ||
          currentSegment.morphology?.includes('حرف نصب')) {
        
        // Check if next segment is a noun (ismuha)
        if (nextSegment.morphology?.includes('NOUN') || 
            nextSegment.morphology?.includes('اسم')) {
          
          const construction: GrammarConstruction = {
            id: `harf-nasb-ismuha-${i}-${Date.now()}`,
            type: 'harf-nasb-ismuha',
            spans: [i, i + 1],
            roles: ['harf-nasb', 'ismuha'],
            certainty: 'definite',
            explanation: `"${currentSegment.text}" is the accusative particle (harf nasb) and "${nextSegment.text}" is its governed noun (ismuha).`
          };
          
          constructions.push(construction);
          console.log(`  ✅ Found Harf Nasb + Ismuha: ${currentSegment.text} + ${nextSegment.text}`);
        }
      }
    }
    
    return constructions;
  }
}

// Export singleton instance
export const grammarQuizEngine = new GrammarQuizEngine();
