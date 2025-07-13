/**
 * Grammar Quiz Configuration
 * 
 * Defines configuration and constants for the grammar quiz system
 */

import { ConstructionType } from "@/types/grammarQuiz";

/**
 * Supported construction types for the grammar quiz
 * These are the only 4 construction types that should be included in quiz questions
 */
export const SUPPORTED_CONSTRUCTION_TYPES: ConstructionType[] = [
  'mudaf-mudaf-ilayh',  // Iḍāfa (إضافة)
  'jar-majroor',        // Jar wa Majrūr
  'fil-fail',           // Fiʿl–Fāʿil
  'harf-nasb-ismuha'    // Harf Nasb + Ismuha
];

/**
 * Configuration for construction types with display names and descriptions
 */
export const CONSTRUCTION_CONFIG: Record<ConstructionType, {
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
