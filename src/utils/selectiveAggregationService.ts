import { MorphologicalDetails } from '../types/morphology';

/**
 * Linguistically-Aware Selective Aggregation Service for Quranic Arabic
 * 
 * Implements comprehensive taxonomy for Arabic morphological segmentation:
 * 
 * KEEP TOGETHER (Visual Unity):
 * - Base word + purely morphological affixes (definite article, imperfect prefixes, number suffixes)
 * 
 * KEEP SEPARATE (Independent Syntactic Function):
 * - Any prefix/particle with independent grammatical role
 * - All particles, pronouns, conjunctions with syntactic significance
 */

export interface AggregatedSegment {
  id: string;                        // Primary segment ID for interaction
  text: string;                      // Combined display text
  morphology: string;               // Primary morphological category
  type: string;                     // Primary segment type
  originalSegments: MorphologicalDetails[]; // All constituent segments
  isSelectable: boolean;            // Whether this can be selected in quiz
  grammaticalRole?: string;         // Enhanced grammatical role
}

/**
 * Particles with INDEPENDENT SYNTACTIC FUNCTION - Must remain separate
 */
const SYNTACTICALLY_SIGNIFICANT_PARTICLES = {
  // Harf Jarr (Prepositions) - Always separate
  prepositions: ['بِ', 'فِي', 'عَلَى', 'إِلَى', 'مِن', 'عَن', 'لِ', 'كَ', 'عِندَ', 'لَدَى', 'حَتَّى'],
  
  // Harf Nasb (Accusative particles) - Always separate  
  accusativeParticles: ['أَنَّ', 'إِنَّ', 'كَأَنَّ', 'لَكِنَّ', 'لَيْتَ', 'لَعَلَّ', 'عَسَى'],
  
  // Harf Jazm (Jussive particles) - Always separate
  jussiveParticles: ['لَمْ', 'لَا الناهية', 'لَا', 'لَمَّا'],
  
  // Negation particles - Always separate
  negationParticles: ['لا', 'ما', 'لَم', 'لَنْ', 'لَيْسَ', 'غَيْر'],
  
  // Future/Emphatic prefixes with syntactic role - Always separate
  modalPrefixes: ['سَـ', 'سَوْفَ', 'لَـ'], // لَـ emphatic, سَـ future
  
  // Vocative particles (Harf Nida) - Always separate
  vocativeParticles: ['يَا', 'أَيُّهَا', 'أَيَّتُهَا'],
  
  // Conditional particles - Always separate
  conditionalParticles: ['إِن', 'لَو', 'لَوْلا', 'لَوْما', 'إِذا', 'كُلَّما'],
  
  // Interrogative particles - Always separate
  interrogativeParticles: ['هَل', 'أَ', 'مَا', 'مَن', 'مَتَى', 'أَيْنَ', 'كَيْفَ', 'مَاذا'],
  
  // Coordinating conjunctions with syntactic significance - Separate when grammatically significant
  conjunctions: ['وَ', 'فَ', 'ثُمَّ', 'أَو', 'أَم', 'بَل', 'لَكِن'],
  
  // Emphasis particles - Always separate
  emphasisParticles: ['قَدْ', 'لَقَدْ', 'إِنَّما', 'نَعَم', 'كَلَّا'],
  
  // Exception particles - Always separate
  exceptionParticles: ['إِلَّا', 'غَيْر', 'سِوَى', 'خَلا', 'عَدا'],
  
  // Result/Purpose particles - Always separate
  resultParticles: ['كَي', 'لِكَي', 'حَتَّى', 'فَـ'],
};

/**
 * All types of pronouns - Must remain separate for grammatical identification
 */
const PRONOUNS_SEPARATE = {
  // Independent pronouns - Always separate
  independentPronouns: ['أَنَا', 'نَحْنُ', 'أَنْتَ', 'أَنْتِ', 'أَنْتُمْ', 'أَنْتُنَّ', 'هُوَ', 'هِيَ', 'هُمْ', 'هُنَّ'],
  
  // Attached pronouns (object/possessive) - Always separate
  attachedPronouns: ['هُ', 'هَا', 'هُم', 'هُنَّ', 'كَ', 'كِ', 'كُم', 'كُنَّ', 'نِي', 'نَا', 'ي', 'تُ', 'تَ', 'تِ'],
  
  // Demonstrative pronouns - Always separate
  demonstrativePronouns: ['هَذَا', 'هَذِهِ', 'ذَلِكَ', 'تِلْكَ', 'أُولَئِكَ', 'هَؤُلاء'],
  
  // Relative pronouns - Always separate  
  relativePronouns: ['الَّذِي', 'الَّتِي', 'الَّذِينَ', 'اللَّاتِي', 'اللَّوَاتِي', 'مَن', 'مَا'],
};

/**
 * Morphological elements that should be attached (NO independent syntactic role)
 */
const ATTACHABLE_MORPHOLOGY = {
  // Definite article - Always attach (purely morphological)
  definiteArticle: ['ال', 'الْ'],
  
  // Morphological prefixes that should attach to stems
  morphologicalPrefixes: {
    // Definite article prefixes
    definiteArticle: ['ال', 'الْ'],
    // Imperfect verb prefixes (person/number/gender marking)
    verbalPrefixes: ['يَ', 'تَ', 'أَ', 'نَ', 'ن'], // Based on MASAQ.csv IMPERF_PREF
    // Prepositional prefixes (when morphological, not syntactic)
    prepositionalPrefixes: ['بِ', 'لِ'], // Based on MASAQ.csv PREP Prefix
  },
  
  // Morphological suffixes that should attach to stems
  morphologicalSuffixes: {
    // Attached pronouns
    pronounSuffixes: ['نا', 'ت', 'هم', 'ها', 'كَ', 'كِ', 'كُم', 'كُنَّ', 'هُنَّ'], // Based on MASAQ.csv OBJ_PRON, SUBJ_PRON, PRON_3MP
    // Case/number suffixes
    caseNumberSuffixes: ['ين', 'ان', 'ون', 'ات', 'ة'], // Based on MASAQ.csv NSUFF_*
  },
  
  // Legacy arrays for backward compatibility
  verbalPrefixes: ['يَ', 'تَ', 'أَ', 'نَ', 'ن'],
};

/**
 * Attached pronouns that should be separated for grammatical analysis
 * These have independent syntactic function and should be selectable separately
 */
const ATTACHED_PRONOUNS_TO_SEPARATE = {
  // Object pronouns that attach to verbs/nouns
  objectPronouns: ['كَ', 'هُ', 'هَا', 'نَا', 'كُم', 'كُنَّ', 'هُم', 'هُنَّ'],
  
  // Possessive pronouns that attach to nouns
  possessivePronouns: ['ي', 'كَ', 'هُ', 'هَا', 'نَا', 'كُم', 'كُنَّ', 'هُم', 'هُنَّ'],
  
  // Special cases requiring separation
  specialCases: [
    { base: 'إِيَّا', pronouns: ['كَ', 'هُ', 'هَا', 'نَا', 'كُم', 'كُنَّ', 'هُم', 'هُنَّ'] }
  ]
};

export class SelectiveAggregationService {
  
  /**
   * Apply linguistically-aware selective aggregation based on comprehensive taxonomy
   */
  aggregateSegments(segments: MorphologicalDetails[]): AggregatedSegment[] {
    const aggregated: AggregatedSegment[] = [];
    let i = 0;
    
    while (i < segments.length) {
      const currentSegment = segments[i];
      
      // RULE 1: Independent syntactic function → Keep separate
      if (this.hasSyntacticFunction(currentSegment)) {
        aggregated.push(this.createStandaloneSegment(currentSegment));
        i++;
        continue;
      }
      
      // RULE 2: Purely morphological → Attach to next word
      const nextSegment = segments[i + 1];
      if (nextSegment && this.shouldAttachToNext(currentSegment, nextSegment)) {
        const attachedSegments = this.collectAttachedSegments(segments, i);
        aggregated.push(this.createAggregatedSegment(attachedSegments));
        i += attachedSegments.length;
        continue;
      }
      
      // RULE 3: Default → Standalone segment
      aggregated.push(this.createStandaloneSegment(currentSegment));
      i++;
    }
    
    return aggregated;
  }
  
  /**
   * Check if segment has independent syntactic function (comprehensive taxonomy)
   */
  private hasSyntacticFunction(segment: MorphologicalDetails): boolean {
    const text = segment.text.trim();
    
    // Check all categories of syntactically significant particles
    const allSyntacticParticles = [
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.prepositions,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.accusativeParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.jussiveParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.negationParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.modalPrefixes,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.vocativeParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.conditionalParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.interrogativeParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.conjunctions,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.emphasisParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.exceptionParticles,
      ...SYNTACTICALLY_SIGNIFICANT_PARTICLES.resultParticles
    ];
    
    // All pronouns (independent, attached, demonstrative, relative)
    const allPronouns = [
      ...PRONOUNS_SEPARATE.independentPronouns,
      ...PRONOUNS_SEPARATE.attachedPronouns,
      ...PRONOUNS_SEPARATE.demonstrativePronouns,
      ...PRONOUNS_SEPARATE.relativePronouns
    ];
    
    // Text-based checking for syntactic particles (adapted for actual interface)
    
    // Conjunctions - Always syntactically significant
    if (segment.type === 'prefix' && ['وَ', 'فَ', 'ثُمَّ'].includes(text)) {
      return true;
    }
    
    // Negation particles - Always syntactically significant
    if (SYNTACTICALLY_SIGNIFICANT_PARTICLES.negationParticles.includes(text)) {
      return true;
    }
    
    // Prepositions when they have syntactic function (not morphological attachment)
    if (segment.morphology === 'particle' && 
        SYNTACTICALLY_SIGNIFICANT_PARTICLES.prepositions.includes(text)) {
      return true;
    }
    
    // Pronouns - check by text since type system is limited
    if (allPronouns.includes(text)) {
      return true;
    }
    
    // Generic particle check
    if (allSyntacticParticles.includes(text)) {
      return true;
    }
    
    // Particles classified as 'particle' morphology
    if (segment.morphology === 'particle') {
      // EXCEPTION: Morphological verbal prefixes should attach, not remain separate
      if (segment.type === 'prefix' && ATTACHABLE_MORPHOLOGY.morphologicalPrefixes.verbalPrefixes.includes(text)) {
        return false; // These are morphological, should attach to verb
      }
      return true;
    }
    
    // Attached pronouns that should attach to their stems (morphological suffixes)
    if (segment.type === 'suffix' && 
        (segment.grammaticalRole?.includes('pronoun') || 
         ATTACHABLE_MORPHOLOGY.morphologicalSuffixes.pronounSuffixes.includes(text))) {
      return false; // These should attach to their stems
    }
    
    // Case/number suffixes should also attach
    if (segment.type === 'suffix' && 
        ATTACHABLE_MORPHOLOGY.morphologicalSuffixes.caseNumberSuffixes.includes(text)) {
      return false; // These should attach to stems
    }
    
    // Future/Modal prefixes with syntactic function
    if (segment.type === 'prefix' && ['سَـ', 'لَـ'].includes(text)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if current segment should attach to next (prefix → stem)
   */
  private shouldAttachToNext(current: MorphologicalDetails, next: MorphologicalDetails): boolean {
    const currentText = current.text.trim();
    
    // Definite article attachment (purely morphological)
    if (ATTACHABLE_MORPHOLOGY.morphologicalPrefixes.definiteArticle.includes(currentText) && 
        next.morphology === 'noun') {
      return true;
    }
    
    // Prepositional prefix attachment (when morphological, not syntactic)
    if (ATTACHABLE_MORPHOLOGY.morphologicalPrefixes.prepositionalPrefixes.includes(currentText) &&
        current.type === 'prefix' &&
        !this.hasSyntacticFunction(current)) {
      return true;
    }
    
    // Verbal prefix attachment (imperfect prefixes)
    if (ATTACHABLE_MORPHOLOGY.morphologicalPrefixes.verbalPrefixes.includes(currentText) &&
        next.morphology === 'verb' &&
        current.type === 'prefix' &&
        !this.hasSyntacticFunction(current)) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if next segment should attach to current (stem ← suffix)
   */
  private shouldAttachFromNext(current: MorphologicalDetails, next: MorphologicalDetails): boolean {
    const nextText = next.text.trim();
    
    // Attached pronoun suffixes
    if (ATTACHABLE_MORPHOLOGY.morphologicalSuffixes.pronounSuffixes.includes(nextText) &&
        next.type === 'suffix' &&
        !this.hasSyntacticFunction(next)) {
      return true;
    }
    
    // Case/number suffixes
    if (ATTACHABLE_MORPHOLOGY.morphologicalSuffixes.caseNumberSuffixes.includes(nextText) &&
        next.type === 'suffix') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Collect all segments that should be attached together (morphological unity)
   */
  private collectAttachedSegments(segments: MorphologicalDetails[], startIndex: number): MorphologicalDetails[] {
    const attached = [segments[startIndex]];
    let i = startIndex + 1;
    
    while (i < segments.length) {
      const current = segments[i - 1];
      const next = segments[i];
      
      // Continue attaching if morphologically connected (prefix → stem)
      if (this.shouldAttachToNext(current, next)) {
        attached.push(next);
        i++;
      }
      // Also attach morphological suffixes (stem ← suffix)
      else if (this.shouldAttachFromNext(current, next)) {
        attached.push(next);
        i++;
      } else {
        break;
      }
    }
    
    return attached;
  }
  
  /**
   * Create standalone segment (syntactically significant)
   */
  private createStandaloneSegment(segment: MorphologicalDetails): AggregatedSegment {
    return {
      id: segment.id,
      text: segment.text,
      morphology: segment.morphology,
      type: segment.type,
      originalSegments: [segment],
      isSelectable: true,
      grammaticalRole: segment.grammaticalRole
    };
  }
  
  /**
   * Create aggregated segment from morphologically unified segments
   */
  private createAggregatedSegment(segments: MorphologicalDetails[]): AggregatedSegment {
    const primarySegment = segments.find(s => s.type === 'root') || segments[0];
    const combinedText = segments.map(s => s.text).join('');
    
    return {
      id: primarySegment.id,
      text: combinedText,
      morphology: primarySegment.morphology,
      type: primarySegment.type,
      originalSegments: segments,
      isSelectable: true,
      grammaticalRole: primarySegment.grammaticalRole
    };
  }
  
  /**
   * Check if a segment should be split due to attached pronouns
   */
  private shouldSeparateAttachedPronoun(segment: MorphologicalDetails): { shouldSeparate: boolean, parts?: { base: string, pronoun: string } } {
    const text = segment.text.trim();
    
    // Check special cases like إِيَّاكَ → إِيَّا + كَ
    for (const specialCase of ATTACHED_PRONOUNS_TO_SEPARATE.specialCases) {
      for (const pronoun of specialCase.pronouns) {
        if (text === specialCase.base + pronoun) {
          return {
            shouldSeparate: true,
            parts: { base: specialCase.base, pronoun: pronoun }
          };
        }
      }
    }
    
    // Check for other attached pronouns at end of words
    for (const pronoun of [...ATTACHED_PRONOUNS_TO_SEPARATE.objectPronouns, ...ATTACHED_PRONOUNS_TO_SEPARATE.possessivePronouns]) {
      if (text.endsWith(pronoun) && text.length > pronoun.length) {
        const base = text.substring(0, text.length - pronoun.length);
        return {
          shouldSeparate: true,
          parts: { base: base, pronoun: pronoun }
        };
      }
    }
    
    return { shouldSeparate: false };
  }
  
  /**
   * Create separated segments from attached pronoun
   */
  private createSeparatedPronouns(segment: MorphologicalDetails, parts: { base: string, pronoun: string }, originalIndex: number): AggregatedSegment[] {
    const baseSegment: AggregatedSegment = {
      id: segment.id + '_base',
      text: parts.base,
      morphology: segment.morphology,
      type: segment.type,
      originalSegments: [segment],
      isSelectable: true,
      grammaticalRole: segment.grammaticalRole
    };
    
    const pronounSegment: AggregatedSegment = {
      id: segment.id + '_pronoun',
      text: parts.pronoun,
      morphology: 'particle', // Pronouns are typically classified as particles
      type: 'suffix',
      originalSegments: [segment],
      isSelectable: true,
      grammaticalRole: 'pronoun'
    };
    
    return [baseSegment, pronounSegment];
  }
  
  /**
   * Aggregate segments with selective morphological attachment
   */
  public aggregateSegments(segments: MorphologicalDetails[]): AggregatedSegment[] {
    const result: AggregatedSegment[] = [];
    let i = 0;
    
    while (i < segments.length) {
      const current = segments[i];
      
      // FIRST: Check if this segment contains attached pronouns that need separation
      const attachedPronounCheck = this.shouldSeparateAttachedPronoun(current);
      if (attachedPronounCheck.shouldSeparate && attachedPronounCheck.parts) {
        const separatedSegments = this.createSeparatedPronouns(current, attachedPronounCheck.parts, i);
        result.push(...separatedSegments);
        i++;
        continue;
      }
      
      // SECOND: Check if this segment should attach to next segments
      const attachmentChain = this.collectAttachedSegments(segments, i);
      
      if (attachmentChain.length > 1) {
        // Create aggregated segment
        const aggregated = this.createAggregatedSegment(attachmentChain);
        result.push(aggregated);
        i += attachmentChain.length;
      } else {
        // Create standalone segment
        const standalone = this.createStandaloneSegment(current);
        result.push(standalone);
        i++;
      }
    }
    
    return result;
  }
  
  /**
   * Debug utility: Get aggregation explanation for a segment
   */
  getAggregationExplanation(segment: MorphologicalDetails): string {
    const text = segment.text.trim();
    
    if (this.hasSyntacticFunction(segment)) {
      return `Separate (syntactic function): ${text} - ${segment.morphology} (${segment.type})`;
    } else if (ATTACHABLE_MORPHOLOGY.definiteArticle.includes(text)) {
      return `Attach (definite article): ${text}`;
    } else if (ATTACHABLE_MORPHOLOGY.morphologicalPrefixes.verbalPrefixes.includes(text)) {
      return `Attach (morphological prefix): ${text}`;
    } else {
      return `Standalone (default): ${text} - ${segment.morphology} (${segment.type})`;
    }
  }
}

// Export singleton instance
export const selectiveAggregationService = new SelectiveAggregationService();
