/**
 * Grammar Quiz Question Generator
 * 
 * Creates quiz questions from Quranic verses with grammatical constructions
 */

import { MorphologicalDetails } from "@/types/morphology";
import { 
  GrammarQuizQuestion,
  GrammarConstruction,
  QuizGenerationConfig
} from '@/types/grammarQuiz';
import { detectAllConstructions } from './detectors';
import { calculateDifficulty, estimateDifficultyScore } from './utils';
import { SUPPORTED_CONSTRUCTION_TYPES } from './config';

/**
 * Creates a quiz question from a selected verse
 */
export async function createQuestionFromVerse(
  verse: {
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    arabicText: string;
    translation: string;
    segments: Record<string, MorphologicalDetails>;
  },
  config: Partial<QuizGenerationConfig> = {}
): Promise<GrammarQuizQuestion> {
  console.log(`🎯 Creating question from Surah ${verse.surahId}:${verse.verseId}`);
  
  // Detect grammatical constructions in the verse
  const constructions = await detectAllConstructions(verse.segments);
  
  // Filter constructions to only include the supported types
  const filteredConstructions = constructions.filter(
    construction => SUPPORTED_CONSTRUCTION_TYPES.includes(construction.type)
  );
  
  // Determine target construction type from config or pick first available type
  let targetConstructionType = config.constructionType;
  
  // If no specific type requested, or that type not found, pick from available
  if (!targetConstructionType || !filteredConstructions.some(c => c.type === targetConstructionType)) {
    const availableTypes = [...new Set(filteredConstructions.map(c => c.type))];
    if (availableTypes.length > 0) {
      // Pick a random type from available
      targetConstructionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }
  }
  
  // Count words (approximation based on spaces)
  const wordCount = verse.arabicText.split(' ').length;
  
  // Calculate difficulty
  const hasInferredConstructions = filteredConstructions.some(c => c.certainty === 'inferred');
  const difficulty = calculateDifficulty(filteredConstructions.length, wordCount, hasInferredConstructions);
  const difficultyScore = estimateDifficultyScore(filteredConstructions, wordCount);
  
  // Create and return question
  return {
    id: `question-${verse.surahId}-${verse.verseId}-${Date.now()}`,
    verseId: `${verse.surahId}:${verse.verseId}`,
    text: verse.arabicText,
    translation: verse.translation,
    surahName: verse.surahName,
    surahNameArabic: verse.surahNameArabic,
    difficulty,
    difficultyScore,
    segments: verse.segments,
    constructionType: targetConstructionType,
    constructions: filteredConstructions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Finds verses that contain grammatical constructions
 * Only returns verses containing at least one of the 4 supported construction types
 */
export async function findVersesWithConstructions(
  quranVerseBank: Array<{
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    arabicText: string;
    translation: string;
    segments: Record<string, MorphologicalDetails>;
  }>,
  config: Partial<QuizGenerationConfig> = {}
): Promise<typeof quranVerseBank> {
  console.log('🔍 Finding verses with grammatical constructions...');
  const versesWithConstructions = [];
  
  // Limit search to a reasonable number of verses for performance
  const searchLimit = config.maxSearchVerses || 100;
  const randomSample = [...quranVerseBank]
    .sort(() => 0.5 - Math.random())  // Shuffle to get a random sample
    .slice(0, searchLimit);
  
  console.log(`📊 Searching through ${randomSample.length} random verses for constructions...`);
  
  // Filter for verses with specified construction type or any supported type
  for (const verse of randomSample) {
    // Detect all constructions in this verse
    const constructions = await detectAllConstructions(verse.segments);
    
    // Filter to just supported types
    const supportedConstructions = constructions.filter(
      c => SUPPORTED_CONSTRUCTION_TYPES.includes(c.type)
    );
    
    // Skip verses with no supported constructions
    if (supportedConstructions.length === 0) {
      continue;
    }
    
    // If a specific construction type is requested, check if it's present
    if (config.constructionType) {
      if (supportedConstructions.some(c => c.type === config.constructionType)) {
        versesWithConstructions.push(verse);
      }
    } else {
      // No specific type requested, include verse if it has any supported construction
      versesWithConstructions.push(verse);
    }
    
    // Stop if we've found enough verses
    if (versesWithConstructions.length >= (config.maxResults || 10)) {
      break;
    }
  }
  
  console.log(`✅ Found ${versesWithConstructions.length} verses with appropriate constructions`);
  return versesWithConstructions;
}

/**
 * Generates a new quiz question from Quranic verses
 */
export async function generateQuestion(
  quranVerseBank: Array<{
    surahId: number;
    verseId: number;
    surahName: string;
    surahNameArabic: string;
    arabicText: string;
    translation: string;
    segments: Record<string, MorphologicalDetails>;
  }>,
  config: Partial<QuizGenerationConfig> = {}
): Promise<GrammarQuizQuestion> {
  console.log('🧠 Generating new grammar quiz question...');
  
  // Find verses with the desired grammatical constructions
  const candidateVerses = await findVersesWithConstructions(quranVerseBank, config);
  
  if (candidateVerses.length === 0) {
    throw new Error('Could not find any verses with the requested construction type');
  }
  
  // Select a random verse from candidates
  const selectedVerse = candidateVerses[Math.floor(Math.random() * candidateVerses.length)];
  console.log(`📝 Selected verse: Surah ${selectedVerse.surahId}:${selectedVerse.verseId}`);
  
  // Generate question from this verse
  return createQuestionFromVerse(selectedVerse, config);
}
