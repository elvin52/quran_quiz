/**
 * Quiz Engine - Core logic for Arabic Pronoun Quiz
 * Handles question generation, session management, and analytics
 */

import { 
  QuizQuestion, 
  QuizSession, 
  QuizResponse, 
  QuizSettings, 
  QuizStats, 
  ArabicPronoun, 
  ArabicVerb 
} from '../types/quiz';
import { ARABIC_VERBS, INDEPENDENT_PRONOUNS, ATTACHED_PRONOUNS, VERB_CONJUGATIONS } from '../data/quizContent';

export class QuizEngine {
  /**
   * Generate a new quiz session with specified settings
   */
  static generateSession(settings: QuizSettings): QuizSession {
    const questions = this.generateQuestions(settings);
    
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      questions,
      responses: [],
      currentQuestionIndex: 0,
      status: 'active',
      settings
    };
  }

  /**
   * Generate quiz questions based on settings
   */
  private static generateQuestions(settings: QuizSettings): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const verbs = this.filterVerbsByDifficulty(settings.difficulty);
    
    for (let i = 0; i < settings.questionCount; i++) {
      // Alternate between question types
      const questionType = i % 2 === 0 ? 'select_pronoun' : 'identify_attached';
      const verb = this.getRandomVerb(verbs);
      const question = this.generateQuestion(verb, questionType, settings.difficulty);
      
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }

  /**
   * Generate a single quiz question
   */
  private static generateQuestion(
    verb: ArabicVerb, 
    type: 'select_pronoun' | 'identify_attached',
    difficulty: QuizSettings['difficulty']
  ): QuizQuestion | null {
    
    if (type === 'select_pronoun') {
      return this.generatePronounSelectionQuestion(verb, difficulty);
    } else {
      return this.generateAttachedPronounQuestion(verb, difficulty);
    }
  }

  /**
   * Generate a pronoun selection question
   */
  private static generatePronounSelectionQuestion(
    verb: ArabicVerb, 
    difficulty: QuizSettings['difficulty']
  ): QuizQuestion {
    // Select a random pronoun that would work with this verb
    const correctPronoun = this.getRandomPronoun(INDEPENDENT_PRONOUNS);
    
    // Generate the conjugated verb form
    const conjugatedVerb = this.conjugateVerb(verb, correctPronoun);
    
    // Generate correct transliteration to match the conjugated verb
    const correctTransliteration = this.generateTransliteration(verb.transliteration, correctPronoun);
    
    // Generate wrong options
    const wrongOptions = this.generateWrongPronounOptions(correctPronoun, 3);
    const allOptions = this.shuffleArray([correctPronoun, ...wrongOptions]);
    
    return {
      id: this.generateQuestionId(),
      type: 'select_pronoun',
      verb: {
        ...verb,
        presentTense: conjugatedVerb,
        transliteration: correctTransliteration
      },
      correctAnswer: correctPronoun,
      options: allOptions,
      difficulty: verb.difficulty as any,
      questionText: `Which pronoun goes with "${conjugatedVerb}" (${verb.meaning})?`,
      explanation: `The verb "${conjugatedVerb}" is conjugated for "${correctPronoun.english}" (${correctPronoun.arabic}).`
    };
  }

  /**
   * Generate an attached pronoun identification question
   */
  private static generateAttachedPronounQuestion(
    verb: ArabicVerb, 
    difficulty: QuizSettings['difficulty']
  ): QuizQuestion {
    // Select a random pronoun
    const correctPronoun = this.getRandomPronoun(ATTACHED_PRONOUNS);
    
    // Generate the conjugated verb form with attached pronoun
    const conjugatedVerb = this.attachPronoun(verb, correctPronoun);
    
    // Generate correct transliteration to match
    const baseTransliteration = this.generateTransliteration(verb.transliteration, {
      id: 'huwa',
      arabic: 'هُوَ',
      transliteration: 'huwa',
      english: 'he',
      type: 'independent',
      person: 'third',
      number: 'singular',
      gender: 'masculine'
    });
    
    const combinedTransliteration = `${baseTransliteration}-${correctPronoun.transliteration}`;
    
    // Generate wrong options
    const wrongOptions = this.generateWrongPronounOptions(correctPronoun, 3, ATTACHED_PRONOUNS);
    const allOptions = this.shuffleArray([correctPronoun, ...wrongOptions]);
    
    return {
      id: this.generateQuestionId(),
      type: 'identify_attached',
      verb: {
        ...verb,
        presentTense: conjugatedVerb,
        transliteration: combinedTransliteration
      },
      correctAnswer: correctPronoun,
      options: allOptions,
      difficulty: verb.difficulty as any,
      questionText: `Which pronoun is attached to "${conjugatedVerb}" (${verb.meaning})?`,
      explanation: `The verb has the attached pronoun "${correctPronoun.arabic}" (${correctPronoun.english}).`
    };
  }

  /**
   * Generate transliteration for a conjugated verb
   */
  private static generateTransliteration(baseTransliteration: string, pronoun: ArabicPronoun): string {
    // Base transliteration is always in 3rd person masculine form (yaf'alu)
    switch(pronoun.id) {
      // First person
      case 'ana':
        return baseTransliteration.replace(/^ya/, 'a'); // yajidu → ajidu
      case 'nahnu':
        return baseTransliteration.replace(/^ya/, 'na'); // yajidu → najidu
        
      // Second person
      case 'anta':
        return baseTransliteration.replace(/^ya/, 'ta'); // yajidu → tajidu
      case 'anti':
        return baseTransliteration.replace(/^ya/, 'ta'); // yajidu → tajidu + suffix
      case 'antuma':
        return baseTransliteration.replace(/^ya/, 'ta') + 'ni'; // tajiduni
      case 'antum':
        return baseTransliteration.replace(/^ya/, 'ta') + 'na'; // tajiduna
      case 'antunna':
        return baseTransliteration.replace(/^ya/, 'ta') + 'na'; // tajidna
        
      // Third person (base form for masculine singular)
      case 'huwa':
        return baseTransliteration; // yajidu (unchanged)
      case 'hiya':
        return baseTransliteration.replace(/^ya/, 'ta'); // yajidu → tajidu
      case 'huma_m':
      case 'huma_f':
        // For dual forms, change ending: yajidu → yajidāni
        return baseTransliteration.slice(0, -1) + 'āni';
      case 'hum':
        return baseTransliteration.slice(0, -1) + 'ūna'; // yajidu → yajidūna
      case 'hunna':
        return baseTransliteration.slice(0, -1) + 'na'; // yajidu → yajidna
        
      default:
        return baseTransliteration;
    }
  }

  /**
   * Conjugate verb for a specific pronoun
   */
  private static conjugateVerb(verb: ArabicVerb, pronoun: ArabicPronoun): string {
    // Simplified conjugation - in a real app, this would be more sophisticated
    const baseForm = verb.presentTense;
    
    switch (pronoun.id) {
      case 'ana':
        return baseForm.replace('يَ', 'أَ'); // I do
      case 'nahnu':
        return baseForm.replace('يَ', 'نَ'); // We do
      case 'anta':
        return baseForm.replace('يَ', 'تَ'); // You (m) do
      case 'anti':
        return baseForm.replace('يَ', 'تَ') + 'ينَ'; // You (f) do
      case 'antuma':
        return baseForm.replace('يَ', 'تَ') + 'انِ'; // You (dual) do
      case 'antum':
        return baseForm.replace('يَ', 'تَ') + 'ونَ'; // You (m.pl) do  
      case 'antunna':
        return baseForm.replace('يَ', 'تَ') + 'نَ'; // You (f.pl) do
      case 'huwa':
        return baseForm; // He does (base form)
      case 'hiya':
        return baseForm.replace('يَ', 'تَ'); // She does
      case 'huma_m':
        // For dual, replace the final damma with a fatha + alif before adding نِ
        return baseForm.slice(0, -1) + 'َانِ'; // They (m.dual) do - e.g., يَنْظُرُ → يَنْظُرَانِ
      case 'huma_f':
        // Same conjugation for feminine dual
        return baseForm.slice(0, -1) + 'َانِ'; // They (f.dual) do - e.g., يَنْظُرُ → يَنْظُرَانِ
      case 'hum':
        return baseForm + 'ونَ'; // They (m) do
      case 'hunna':
        return baseForm + 'نَ'; // They (f) do
      default:
        // Fallback - should not happen if all pronouns are handled
        console.warn(`Unhandled pronoun conjugation for: ${pronoun.id}`);
        return baseForm;
    }
  }

  /**
   * Attach a pronoun to a verb
   */
  private static attachPronoun(verb: ArabicVerb, pronoun: ArabicPronoun): string {
    // For simplicity, we'll just append the pronoun to the verb
    // In a more advanced version, this would handle the correct grammar rules
    // for attaching pronouns to verbs based on case, gender, etc.
    return verb.presentTense + pronoun.arabic;
  }

  /**
   * Process a user's response to a question
   */
  static processResponse(
    session: QuizSession,
    userAnswer: ArabicPronoun,
    responseTime: number
  ): { updatedSession: QuizSession; isCorrect: boolean } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = userAnswer.id === currentQuestion.correctAnswer.id;
    
    const response: QuizResponse = {
      questionId: currentQuestion.id,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      responseTime,
      timestamp: Date.now()
    };
    
    const updatedSession: QuizSession = {
      ...session,
      responses: [...session.responses, response],
      currentQuestionIndex: session.currentQuestionIndex + 1,
      status: session.currentQuestionIndex + 1 >= session.questions.length ? 'completed' : 'active',
      endTime: session.currentQuestionIndex + 1 >= session.questions.length ? Date.now() : undefined
    };
    
    return { updatedSession, isCorrect };
  }

  /**
   * Calculate session statistics
   */
  static calculateStats(session: QuizSession): QuizStats {
    const responses = session.responses;
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const totalQuestions = responses.length;
    
    const responseTimes = responses.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
    
    // Calculate difficulty breakdown
    const difficultyBreakdown = {
      beginner: { correct: 0, total: 0 },
      intermediate: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 }
    };
    
    responses.forEach(response => {
      const question = session.questions.find(q => q.id === response.questionId);
      if (question) {
        difficultyBreakdown[question.difficulty].total++;
        if (response.isCorrect) {
          difficultyBreakdown[question.difficulty].correct++;
        }
      }
    });
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      averageResponseTime,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      fastestResponse: Math.min(...responseTimes) || 0,
      slowestResponse: Math.max(...responseTimes) || 0,
      difficultyBreakdown
    };
  }

  // Helper methods
  private static filterVerbsByDifficulty(difficulty: QuizSettings['difficulty']): ArabicVerb[] {
    if (difficulty === 'mixed') {
      return ARABIC_VERBS;
    }
    return ARABIC_VERBS.filter(verb => verb.difficulty === difficulty);
  }

  private static getRandomVerb(verbs: ArabicVerb[]): ArabicVerb {
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  private static getRandomPronoun(pronouns: ArabicPronoun[]): ArabicPronoun {
    return pronouns[Math.floor(Math.random() * pronouns.length)];
  }

  private static generateWrongPronounOptions(correct: ArabicPronoun, count: number, pronouns: ArabicPronoun[] = INDEPENDENT_PRONOUNS): ArabicPronoun[] {
    const availableOptions = pronouns.filter(p => p.id !== correct.id);
    return availableOptions.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateQuestionId(): string {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Quiz Storage Manager - Handles local storage persistence
 */
export class QuizStorageManager {
  private static readonly SESSIONS_KEY = 'quiz_sessions';
  private static readonly CURRENT_SESSION_KEY = 'current_quiz_session';

  static saveSession(session: QuizSession): void {
    try {
      localStorage.setItem(this.CURRENT_SESSION_KEY, JSON.stringify(session));
      
      // Also save to sessions history
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save quiz session:', error);
    }
  }

  static getCurrentSession(): QuizSession | null {
    try {
      const sessionData = localStorage.getItem(this.CURRENT_SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to load current quiz session:', error);
      return null;
    }
  }

  static getAllSessions(): QuizSession[] {
    try {
      const sessionsData = localStorage.getItem(this.SESSIONS_KEY);
      return sessionsData ? JSON.parse(sessionsData) : [];
    } catch (error) {
      console.error('Failed to load quiz sessions:', error);
      return [];
    }
  }

  static clearCurrentSession(): void {
    try {
      localStorage.removeItem(this.CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear current quiz session:', error);
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions().filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      
      // Clear current session if it matches
      const currentSession = this.getCurrentSession();
      if (currentSession?.id === sessionId) {
        this.clearCurrentSession();
      }
    } catch (error) {
      console.error('Failed to delete quiz session:', error);
    }
  }
}
