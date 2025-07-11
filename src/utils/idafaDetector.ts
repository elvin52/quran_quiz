
import { MorphologicalDetails } from '@/types/morphology';
import { MASAQEntry } from '@/types/masaq';

export interface IdafaConstruction {
  id: string;
  mudaf: {
    id: string;
    text: string;
    position: number;
  };
  mudafIlayh: {
    id: string;
    text: string;
    position: number;
    type: 'noun' | 'pronoun' | 'attached_pronoun';
  };
  chain: boolean;
  chainLevel?: number;
  certainty: 'definite' | 'probable' | 'inferred';
  textbookRule: string;
  context: {
    precedingWord?: string;
    followingWord?: string;
  };
}

export interface IdafaDetectionResult {
  constructions: IdafaConstruction[];
  chains: IdafaConstruction[][];
  statistics: {
    total: number;
    definite: number;
    probable: number;
    inferred: number;
    withChains: number;
    withPronouns: number;
  };
  validationNotes: string[];
}

// New interfaces for corpus-wide processing
export interface CorpusSegment {
  surah: number;
  verse: number;
  word: number;
  segment: number;
  text: string;
  morphology: MorphologicalDetails;
}

export interface CorpusIdafaResult {
  totalSegments: number;
  totalConstructions: number;
  surahResults: {
    [surahNumber: number]: {
      constructions: IdafaConstruction[];
      statistics: IdafaDetectionResult['statistics'];
    };
  };
  globalStatistics: IdafaDetectionResult['statistics'];
  processingTime: number;
  validationNotes: string[];
}

export class IdafaDetector {
  private segments: MorphologicalDetails[] = [];
  private masaqData: Record<string, MASAQEntry> = {};
  private constructions: IdafaConstruction[] = [];
  private validationNotes: string[] = [];

  constructor() {
    console.log('🕌 Initializing Idafa Detector with Deep Grammar Logic');
  }

  /**
   * Main detection method implementing the comprehensive algorithm
   */
  detectIdafaConstructions(
    segments: Record<string, MorphologicalDetails>,
    masaqEntries?: MASAQEntry[]
  ): IdafaDetectionResult {
    console.log('=== IDAFA DETECTION ALGORITHM START ===');
    console.log('📖 Implementing Deep Grammar Reference (pages 28-32)');
    
    this.initializeData(segments, masaqEntries);
    this.performDetection();
    const chains = this.detectChains();
    const statistics = this.calculateStatistics();

    console.log('=== IDAFA DETECTION COMPLETE ===');
    console.log(`Total constructions found: ${this.constructions.length}`);
    
    return {
      constructions: this.constructions,
      chains,
      statistics,
      validationNotes: this.validationNotes
    };
  }

  /**
   * Process entire corpus (full Quran) for Idafa constructions
   * Enhanced batch processing per Dream_Textbook requirements
   */
  processEntireCorpus(
    corpusSegments: CorpusSegment[],
    masaqEntries?: MASAQEntry[]
  ): CorpusIdafaResult {
    console.log('🕌 === CORPUS-WIDE IDAFA DETECTION START ===');
    console.log(`📊 Processing ${corpusSegments.length} segments across entire corpus`);
    
    const startTime = Date.now();
    const surahResults: { [surahNumber: number]: any } = {};
    let totalConstructions = 0;
    const globalValidationNotes: string[] = [];
    
    // Group segments by Surah for organized processing
    const segmentsBySurah = this.groupSegmentsBySurah(corpusSegments);
    
    Object.keys(segmentsBySurah).forEach(surahKey => {
      const surahNumber = parseInt(surahKey);
      const surahSegments = segmentsBySurah[surahNumber];
      
      console.log(`\n📖 Processing Surah ${surahNumber} (${surahSegments.length} segments)`);
      
      // Convert corpus segments to MorphologicalDetails format
      const segmentMap = this.convertCorpusSegmentsToMap(surahSegments);
      
      // Process this Surah's segments
      const surahResult = this.detectIdafaConstructions(segmentMap, masaqEntries);
      
      surahResults[surahNumber] = {
        constructions: surahResult.constructions,
        statistics: surahResult.statistics
      };
      
      totalConstructions += surahResult.constructions.length;
      globalValidationNotes.push(...surahResult.validationNotes);
      
      console.log(`✅ Surah ${surahNumber}: ${surahResult.constructions.length} constructions found`);
    });
    
    // Calculate global statistics
    const globalStatistics = this.calculateGlobalStatistics(surahResults);
    const processingTime = Date.now() - startTime;
    
    console.log('🕌 === CORPUS-WIDE IDAFA DETECTION COMPLETE ===');
    console.log(`📊 Total: ${totalConstructions} constructions across ${Object.keys(surahResults).length} Surahs`);
    console.log(`⏱️  Processing time: ${processingTime}ms`);
    
    return {
      totalSegments: corpusSegments.length,
      totalConstructions,
      surahResults,
      globalStatistics,
      processingTime,
      validationNotes: globalValidationNotes
    };
  }

  private groupSegmentsBySurah(segments: CorpusSegment[]): { [surah: number]: CorpusSegment[] } {
    return segments.reduce((acc, segment) => {
      if (!acc[segment.surah]) {
        acc[segment.surah] = [];
      }
      acc[segment.surah].push(segment);
      return acc;
    }, {} as { [surah: number]: CorpusSegment[] });
  }

  private convertCorpusSegmentsToMap(segments: CorpusSegment[]): Record<string, MorphologicalDetails> {
    const segmentMap: Record<string, MorphologicalDetails> = {};
    
    segments.forEach(segment => {
      const id = `${segment.surah}-${segment.verse}-${segment.word}-${segment.segment}`;
      segmentMap[id] = {
        ...segment.morphology,
        id
      };
    });
    
    return segmentMap;
  }

  private calculateGlobalStatistics(surahResults: { [surah: number]: any }): IdafaDetectionResult['statistics'] {
    let total = 0;
    let definite = 0;
    let probable = 0;
    let inferred = 0;
    let withChains = 0;
    let withPronouns = 0;
    
    Object.values(surahResults).forEach((result: any) => {
      const stats = result.statistics;
      total += stats.total;
      definite += stats.definite;
      probable += stats.probable;
      inferred += stats.inferred;
      withChains += stats.withChains;
      withPronouns += stats.withPronouns;
    });
    
    return {
      total,
      definite,
      probable,
      inferred,
      withChains,
      withPronouns
    };
  }

  private initializeData(
    segments: Record<string, MorphologicalDetails>,
    masaqEntries?: MASAQEntry[]
  ) {
    // CRITICAL FIX: Reset state for each new detection to prevent accumulation
    this.constructions = [];
    this.validationNotes = [];
    this.masaqData = {};
    
    // Convert segments to sorted array
    this.segments = Object.values(segments).sort((a, b) => {
      const aNum = parseInt(a.id.split('-').join(''));
      const bNum = parseInt(b.id.split('-').join(''));
      return aNum - bNum;
    });

    // Index MASAQ data for quick lookup
    if (masaqEntries) {
      masaqEntries.forEach(entry => {
        const key = `${entry.surah}-${entry.verse}-${entry.word}-${entry.segment}`;
        this.masaqData[key] = entry;
      });
    }

    console.log(`Processing ${this.segments.length} segments`);
  }

  private performDetection() {
    console.log('🔍 Starting comprehensive Idafa detection...');
    
    for (let i = 0; i < this.segments.length - 1; i++) {
      const currentSegment = this.segments[i];
      
      // Skip non-noun tokens for Mudaf candidates
      if (!this.isNounCandidate(currentSegment)) {
        continue;
      }

      console.log(`\n--- Analyzing potential Mudaf: "${currentSegment.text}" (${currentSegment.id}) ---`);
      
      // Apply the 3-question test from textbook
      const lightnessResult = this.isLight(currentSegment);
      const definiteArticleResult = this.lacksDefiniteArticle(currentSegment);
      
      console.log(`Question 1 - Is "${currentSegment.text}" light? ${lightnessResult.isLight} (${lightnessResult.reason})`);
      console.log(`Question 2 - Does "${currentSegment.text}" lack ال? ${definiteArticleResult.lacks} (${definiteArticleResult.reason})`);

      if (!lightnessResult.isLight || !definiteArticleResult.lacks) {
        console.log(`❌ Failed 3-question test - not a valid Mudaf`);
        continue;
      }

      // Look for Mudaf Ilayh candidates
      this.findMudafIlayh(currentSegment, i);
    }

    // Detect constructions with attached pronouns
    this.detectAttachedPronounConstructions();
  }

  private findMudafIlayh(mudafSegment: MorphologicalDetails, mudafIndex: number) {
    // Check immediate next token first (most common case)
    for (let j = mudafIndex + 1; j < Math.min(mudafIndex + 4, this.segments.length); j++) {
      const candidateSegment = this.segments[j];
      
      // Skip articles and particles that don't break the construction
      if (this.shouldSkipToken(candidateSegment)) {
        continue;
      }

      console.log(`  Checking candidate Mudaf Ilayh: "${candidateSegment.text}" (${candidateSegment.id})`);

      const genitiveResult = this.isInGenitiveStatus(candidateSegment, mudafSegment);
      console.log(`  Question 3 - Is "${candidateSegment.text}" genitive? ${genitiveResult.isGenitive} (${genitiveResult.reason})`);

      if (genitiveResult.isGenitive) {
        const construction = this.createIdafaConstruction(
          mudafSegment, 
          candidateSegment, 
          mudafIndex, 
          j, 
          genitiveResult.certainty,
          genitiveResult.rule
        );
        
        this.constructions.push(construction);
        console.log(`✅ IDAFA DETECTED: ${construction.mudaf.text} + ${construction.mudafIlayh.text} (${construction.certainty})`);
        
        break; // Found the Mudaf Ilayh for this Mudaf
      }

      // If we hit a clear boundary (verb, definite noun, etc.), stop looking
      if (this.isConstructionBoundary(candidateSegment)) {
        console.log(`  🛑 Hit construction boundary at "${candidateSegment.text}"`);
        break;
      }
    }
  }

  /**
   * Question 1: Is the word light (no tanween if flexible)?
   */
  private isLight(segment: MorphologicalDetails): { isLight: boolean; reason: string } {
    const masaqEntry = this.getMasaqEntry(segment);
    
    // Check for explicit tanween markers
    if (segment.text.includes('ً') || segment.text.includes('ٌ') || segment.text.includes('ٍ')) {
      return { isLight: false, reason: 'Has tanween marking' };
    }

    // Check MASAQ data for state information
    if (masaqEntry?.state) {
      if (masaqEntry.state.toLowerCase().includes('construct')) {
        return { isLight: true, reason: 'MASAQ: construct state' };
      }
      if (masaqEntry.state.toLowerCase().includes('absolute')) {
        return { isLight: false, reason: 'MASAQ: absolute state' };
      }
    }

    // Check for typical light word patterns
    if (this.isTypicalLightPattern(segment.text)) {
      return { isLight: true, reason: 'Matches typical light word pattern' };
    }

    // Default assumption for nouns in potential Idafa context
    return { isLight: true, reason: 'Assumed light in Idafa context' };
  }

  /**
   * Question 2: Does the word lack ال (definite article)?
   */
  private lacksDefiniteArticle(segment: MorphologicalDetails): { lacks: boolean; reason: string } {
    // Direct check for ال prefix
    if (segment.text.startsWith('ال') || segment.text.startsWith('الل')) {
      return { lacks: false, reason: 'Has ال prefix' };
    }

    // Check grammatical role
    if (segment.grammaticalRole === 'definite_article') {
      return { lacks: false, reason: 'Marked as definite article' };
    }

    // Check MASAQ data
    const masaqEntry = this.getMasaqEntry(segment);
    if (masaqEntry?.definite?.toLowerCase().includes('def')) {
      return { lacks: false, reason: 'MASAQ: marked as definite' };
    }

    return { lacks: true, reason: 'No definite article detected' };
  }

  /**
   * Question 3: Is the second word in genitive status?
   */
  private isInGenitiveStatus(
    segment: MorphologicalDetails, 
    mudafSegment: MorphologicalDetails
  ): { isGenitive: boolean; certainty: 'definite' | 'probable' | 'inferred'; reason: string; rule: string } {
    
    // CRITICAL FIX: True Iḍāfa requires mudāf ilay-h to be genitive WITHOUT definite article
    // Words with definite article (ال) are adjectives (sifa), not mudāf ilay-h
    if (segment.text.startsWith('ال') || segment.text.startsWith('الْ') || segment.text.startsWith('الَّ')) {
      return { 
        isGenitive: false, 
        certainty: 'definite', 
        reason: 'Has definite article (ال) - this is Sifa (adjective), not Iḍāfa',
        rule: 'Definite article exclusion rule'
      };
    }

    // Direct case marking
    if (segment.case === 'genitive') {
      return { 
        isGenitive: true, 
        certainty: 'definite', 
        reason: 'Explicitly marked genitive',
        rule: 'Direct case marking'
      };
    }

    // Check for genitive markers in text (but only if no definite article)
    if (segment.text.includes('ِ') && !segment.text.includes('ً') && !segment.text.includes('ٌ')) {
      return { 
        isGenitive: true, 
        certainty: 'definite', 
        reason: 'Has kasra (genitive marker) without definite article',
        rule: 'Genitive vowel marking'
      };
    }

    // MASAQ data check
    const masaqEntry = this.getMasaqEntry(segment);
    if (masaqEntry?.case?.toLowerCase().includes('gen')) {
      return { 
        isGenitive: true, 
        certainty: 'definite', 
        reason: 'MASAQ: genitive case',
        rule: 'MASAQ case data'
      };
    }

    // Special handling for partly-flexible and non-flexible nouns
    const flexibilityCheck = this.checkFlexibilityGenitive(segment, mudafSegment);
    if (flexibilityCheck.isGenitive) {
      return flexibilityCheck;
    }

    // Pronoun check
    if (segment.morphology === 'particle' && this.isPronoun(segment)) {
      return { 
        isGenitive: true, 
        certainty: 'definite', 
        reason: 'Pronoun in genitive context',
        rule: 'Pronoun genitive assumption'
      };
    }

    // Context-based inference
    if (this.isLikelyGenitiveByContext(segment, mudafSegment)) {
      return { 
        isGenitive: true, 
        certainty: 'inferred', 
        reason: 'Contextual genitive inference',
        rule: 'Contextual pattern matching'
      };
    }

    return { 
      isGenitive: false, 
      certainty: 'definite', 
      reason: 'No genitive indicators found',
      rule: 'No applicable rule'
    };
  }

  private checkFlexibilityGenitive(
    segment: MorphologicalDetails, 
    mudafSegment: MorphologicalDetails
  ): { isGenitive: boolean; certainty: 'definite' | 'probable' | 'inferred'; reason: string; rule: string } {
    
    const masaqEntry = this.getMasaqEntry(segment);
    
    // Partly-flexible: look for فتحة indicating Jar
    if (this.isPartlyFlexible(segment)) {
      if (segment.text.includes('َ')) {
        return {
          isGenitive: true,
          certainty: 'probable',
          reason: 'Partly-flexible with fatha (indicating Jar)',
          rule: 'Partly-flexible genitive pattern'
        };
      }
    }

    // Non-flexible: infer from context
    if (this.isNonFlexible(segment)) {
      // Following a confirmed light, non-ال noun suggests Idafa
      return {
        isGenitive: true,
        certainty: 'inferred',
        reason: 'Non-flexible noun following light noun (contextual Jar)',
        rule: 'Non-flexible contextual inference'
      };
    }

    return {
      isGenitive: false,
      certainty: 'definite',
      reason: 'Flexibility check inconclusive',
      rule: 'No flexibility rule applied'
    };
  }

  private detectAttachedPronounConstructions() {
    console.log('\n🔗 Detecting Idafa constructions with attached pronouns...');
    
    this.segments.forEach((segment, index) => {
      if (!this.isNounCandidate(segment)) return;

      // Check for attached pronoun suffixes
      const pronounSuffixes = ['ه', 'ها', 'هم', 'هن', 'ك', 'كم', 'كن', 'ي', 'نا'];
      const hasAttachedPronoun = pronounSuffixes.some(suffix => 
        segment.text.endsWith(suffix) && segment.text.length > suffix.length + 1
      );

      if (hasAttachedPronoun) {
        const construction: IdafaConstruction = {
          id: `idafa-pronoun-${segment.id}`,
          mudaf: {
            id: segment.id,
            text: segment.text,
            position: index
          },
          mudafIlayh: {
            id: `${segment.id}-pronoun`,
            text: 'attached_pronoun',
            position: index,
            type: 'attached_pronoun'
          },
          chain: false,
          certainty: 'definite',
          textbookRule: 'Attached pronoun rule: Pronouns attached to nouns always create إضافة',
          context: {
            precedingWord: index > 0 ? this.segments[index - 1].text : undefined,
            followingWord: index < this.segments.length - 1 ? this.segments[index + 1].text : undefined
          }
        };

        this.constructions.push(construction);
        console.log(`✅ PRONOUN IDAFA: ${construction.mudaf.text} + attached pronoun`);
      }
    });
  }

  private detectChains(): IdafaConstruction[][] {
    console.log('\n🔗 Detecting Idafa chains...');
    
    const chains: IdafaConstruction[][] = [];
    const processed = new Set<string>();

    this.constructions.forEach(construction => {
      if (processed.has(construction.id)) return;

      const chain = this.buildChain(construction, processed);
      if (chain.length > 1) {
        chains.push(chain);
        console.log(`🔗 Chain detected: ${chain.map(c => c.mudaf.text).join(' -> ')}`);
      }
    });

    return chains;
  }

  private buildChain(startConstruction: IdafaConstruction, processed: Set<string>): IdafaConstruction[] {
    const chain = [startConstruction];
    processed.add(startConstruction.id);

    // Look for constructions where this Mudaf Ilayh becomes a Mudaf
    const nextConstruction = this.constructions.find(c => 
      c.mudaf.id === startConstruction.mudafIlayh.id && 
      !processed.has(c.id)
    );

    if (nextConstruction) {
      chain.push(...this.buildChain(nextConstruction, processed));
    }

    return chain;
  }

  // Helper methods
  private createIdafaConstruction(
    mudaf: MorphologicalDetails,
    mudafIlayh: MorphologicalDetails,
    mudafIndex: number,
    mudafIlayhIndex: number,
    certainty: 'definite' | 'probable' | 'inferred',
    rule: string
  ): IdafaConstruction {
    return {
      id: `idafa-${mudaf.id}-${mudafIlayh.id}`,
      mudaf: {
        id: mudaf.id,
        text: mudaf.text,
        position: mudafIndex
      },
      mudafIlayh: {
        id: mudafIlayh.id,
        text: mudafIlayh.text,
        position: mudafIlayhIndex,
        type: mudafIlayh.morphology === 'particle' && this.isPronoun(mudafIlayh) ? 'pronoun' : 'noun'
      },
      chain: false,
      certainty,
      textbookRule: rule,
      context: {
        precedingWord: mudafIndex > 0 ? this.segments[mudafIndex - 1].text : undefined,
        followingWord: mudafIlayhIndex < this.segments.length - 1 ? this.segments[mudafIlayhIndex + 1].text : undefined
      }
    };
  }

  private calculateStatistics() {
    const total = this.constructions.length;
    const definite = this.constructions.filter(c => c.certainty === 'definite').length;
    const probable = this.constructions.filter(c => c.certainty === 'probable').length;
    const inferred = this.constructions.filter(c => c.certainty === 'inferred').length;
    const withChains = this.constructions.filter(c => c.chain).length;
    const withPronouns = this.constructions.filter(c => c.mudafIlayh.type === 'attached_pronoun' || c.mudafIlayh.type === 'pronoun').length;

    return {
      total,
      definite,
      probable,
      inferred,
      withChains,
      withPronouns
    };
  }

  // Utility methods
  private isNounCandidate(segment: MorphologicalDetails): boolean {
    return segment.morphology === 'noun' || 
           (segment.morphology === 'particle' && this.isPronoun(segment));
  }

  private isPronoun(segment: MorphologicalDetails): boolean {
    const pronouns = ['هو', 'هي', 'هم', 'هن', 'أنت', 'أنتم', 'أنتن', 'أنا', 'نحن'];
    return pronouns.includes(segment.text) || segment.grammaticalRole === 'pronoun';
  }

  private shouldSkipToken(segment: MorphologicalDetails): boolean {
    return segment.morphology === 'particle' && 
           segment.grammaticalRole !== 'pronoun' &&
           !this.isConstructionBoundary(segment);
  }

  private isConstructionBoundary(segment: MorphologicalDetails): boolean {
    return segment.morphology === 'verb' || 
           (segment.morphology === 'particle' && segment.grammaticalRole === 'definite_article') ||
           (segment.morphology === 'noun' && segment.text.startsWith('ال'));
  }

  private isTypicalLightPattern(text: string): boolean {
    // Common light word patterns in Arabic
    return !text.includes('ٌ') && !text.includes('ً') && !text.includes('ٍ');
  }

  private isPartlyFlexible(segment: MorphologicalDetails): boolean {
    const masaqEntry = this.getMasaqEntry(segment);
    // This would need to be enhanced with linguistic rules for partly-flexible nouns
    return masaqEntry?.pattern?.includes('partly') || false;
  }

  private isNonFlexible(segment: MorphologicalDetails): boolean {
    const masaqEntry = this.getMasaqEntry(segment);
    // This would need to be enhanced with linguistic rules for non-flexible nouns
    return masaqEntry?.pattern?.includes('non-flexible') || false;
  }

  private isLikelyGenitiveByContext(segment: MorphologicalDetails, mudaf: MorphologicalDetails): boolean {
    // Simple heuristic: if it follows a confirmed light noun without ال
    return segment.morphology === 'noun' && !segment.text.startsWith('ال');
  }

  /**
   * Enhanced partly-flexible noun genitive detection per Dream_Textbook
   * Looks for فتحة (fatha) indicating genitive case in partly-flexible nouns
   */
  private detectPartlyFlexibleGenitive(segment: MorphologicalDetails): {
    isGenitive: boolean;
    certainty: 'definite' | 'probable' | 'inferred';
    reason: string;
  } {
    console.log(`    🔍 Enhanced partly-flexible analysis for: "${segment.text}"`);
    
    // Check for فتحة (fatha) marking genitive in partly-flexible nouns
    if (segment.text.includes('َ') && !segment.text.includes('ً')) {
      // Has fatha but not tanween - likely genitive partly-flexible
      return {
        isGenitive: true,
        certainty: 'probable',
        reason: 'Partly-flexible with فتحة (fatha) indicating genitive'
      };
    }

    // Check MASAQ data for partly-flexible classification
    const masaqEntry = this.getMasaqEntry(segment);
    if (masaqEntry?.pattern?.includes('partly-flexible')) {
      if (masaqEntry.case?.toLowerCase().includes('gen')) {
        return {
          isGenitive: true,
          certainty: 'definite',
          reason: 'MASAQ: partly-flexible noun in genitive case'
        };
      }
      
      // Infer genitive from context if MASAQ shows partly-flexible
      return {
        isGenitive: true,
        certainty: 'inferred',
        reason: 'MASAQ: partly-flexible noun, genitive inferred from context'
      };
    }

    // Check for typical partly-flexible patterns (proper nouns, plurals)
    if (this.isLikelyPartlyFlexiblePattern(segment.text)) {
      return {
        isGenitive: true,
        certainty: 'inferred',
        reason: 'Matches partly-flexible pattern, genitive inferred'
      };
    }

    return {
      isGenitive: false,
      certainty: 'inferred',
      reason: 'No partly-flexible genitive indicators found'
    };
  }

  /**
   * Enhanced non-flexible noun genitive detection per Dream_Textbook
   * Uses context to infer genitive status when vowel markers unavailable
   */
  private detectNonFlexibleGenitive(segment: MorphologicalDetails, mudaf: MorphologicalDetails): {
    isGenitive: boolean;
    certainty: 'definite' | 'probable' | 'inferred';
    reason: string;
  } {
    console.log(`    🔍 Enhanced non-flexible analysis for: "${segment.text}"`);
    
    // Check MASAQ data first
    const masaqEntry = this.getMasaqEntry(segment);
    if (masaqEntry?.pattern?.includes('non-flexible')) {
      if (masaqEntry.case?.toLowerCase().includes('gen')) {
        return {
          isGenitive: true,
          certainty: 'definite',
          reason: 'MASAQ: non-flexible noun in genitive case'
        };
      }
    }

    // Context-based inference per Dream_Textbook logic
    if (this.isNonFlexible(segment)) {
      // Non-flexible noun following confirmed light, non-ال noun
      const mudafIsLight = this.isLight(mudaf).isLight;
      const mudafLacksAl = this.lacksDefiniteArticle(mudaf).lacks;
      
      if (mudafIsLight && mudafLacksAl) {
        return {
          isGenitive: true,
          certainty: 'probable',
          reason: 'Non-flexible noun following valid Mudaf - genitive inferred from context'
        };
      }
    }

    // Check for typical non-flexible patterns
    if (this.isLikelyNonFlexiblePattern(segment.text)) {
      return {
        isGenitive: true,
        certainty: 'inferred',
        reason: 'Matches non-flexible pattern, genitive inferred from Idafa context'
      };
    }

    return {
      isGenitive: false,
      certainty: 'inferred',
      reason: 'No non-flexible genitive indicators found'
    };
  }

  private isLikelyPartlyFlexiblePattern(text: string): boolean {
    // Common partly-flexible patterns: proper nouns, sound feminine plurals
    const partlyFlexiblePatterns = [
      /^.+ات$/, // Sound feminine plural ending
      /^[A-Z]/, // Capitalized (proper nouns in transliteration)
      /^(مُوسَى|عِيسَى|يَحْيَى)/, // Known partly-flexible proper nouns
    ];
    
    return partlyFlexiblePatterns.some(pattern => pattern.test(text));
  }

  private isLikelyNonFlexiblePattern(text: string): boolean {
    // Common non-flexible patterns: broken plurals, certain structures
    const nonFlexiblePatterns = [
      /^أَ.+/, // Many أفعال patterns
      /^مَ.+ِع$/, // مفاعل patterns
      /^فَ.+ِل$/, // فعائل patterns
    ];
    
    return nonFlexiblePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Export Idafa constructions to JSON format per Dream_Textbook specifications
   */
  exportToJSON(constructions: IdafaConstruction[], options?: {
    includeStatistics?: boolean;
    includeChains?: boolean;
    prettify?: boolean;
  }): string {
    console.log('📄 Exporting Idafa constructions to JSON format...');
    
    const exportData: any = {
      timestamp: new Date().toISOString(),
      algorithm: 'Dream_Textbook_3_Question_Test',
      version: '1.0.0',
      constructions: constructions.map(construction => ({
        id: construction.id,
        mudaf: {
          id: construction.mudaf.id,
          text: construction.mudaf.text,
          position: construction.mudaf.position
        },
        mudaf_ilayh: {
          id: construction.mudafIlayh.id,
          text: construction.mudafIlayh.text,
          position: construction.mudafIlayh.position,
          type: construction.mudafIlayh.type
        },
        is_chain: construction.chain,
        chain_level: construction.chainLevel || 0,
        certainty: construction.certainty,
        textbook_rule: construction.textbookRule,
        context: construction.context
      }))
    };

    if (options?.includeStatistics) {
      const stats = this.calculateConstructionStatistics(constructions);
      exportData.statistics = stats;
    }

    if (options?.includeChains) {
      const chains = this.detectChains();
      exportData.chains = chains.map(chain => 
        chain.map(construction => construction.id)
      );
    }

    const jsonString = options?.prettify 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    console.log(`✅ Exported ${constructions.length} constructions to JSON`);
    return jsonString;
  }

  /**
   * Export corpus-wide results to JSON format
   */
  exportCorpusToJSON(corpusResult: CorpusIdafaResult, options?: {
    includeSurahBreakdown?: boolean;
    prettify?: boolean;
  }): string {
    console.log('📄 Exporting corpus-wide Idafa results to JSON format...');
    
    const exportData: any = {
      timestamp: new Date().toISOString(),
      algorithm: 'Dream_Textbook_3_Question_Test_Corpus',
      version: '1.0.0',
      corpus_summary: {
        total_segments: corpusResult.totalSegments,
        total_constructions: corpusResult.totalConstructions,
        processing_time_ms: corpusResult.processingTime,
        surahs_processed: Object.keys(corpusResult.surahResults).length
      },
      global_statistics: corpusResult.globalStatistics,
      validation_notes: corpusResult.validationNotes
    };

    if (options?.includeSurahBreakdown) {
      exportData.surah_breakdown = {};
      Object.entries(corpusResult.surahResults).forEach(([surahNum, result]) => {
        exportData.surah_breakdown[surahNum] = {
          constructions_count: result.constructions.length,
          statistics: result.statistics,
          constructions: result.constructions.map((construction: IdafaConstruction) => ({
            id: construction.id,
            mudaf: construction.mudaf.text,
            mudaf_ilayh: construction.mudafIlayh.text,
            certainty: construction.certainty,
            rule: construction.textbookRule
          }))
        };
      });
    }

    const jsonString = options?.prettify 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    console.log(`✅ Exported corpus results (${corpusResult.totalConstructions} constructions) to JSON`);
    return jsonString;
  }

  private calculateConstructionStatistics(constructions: IdafaConstruction[]): IdafaDetectionResult['statistics'] {
    return {
      total: constructions.length,
      definite: constructions.filter(c => c.certainty === 'definite').length,
      probable: constructions.filter(c => c.certainty === 'probable').length,
      inferred: constructions.filter(c => c.certainty === 'inferred').length,
      withChains: constructions.filter(c => c.chain).length,
      withPronouns: constructions.filter(c => c.mudafIlayh.type !== 'noun').length
    };
  }

  private getMasaqEntry(segment: MorphologicalDetails): MASAQEntry | undefined {
    // This would need segment location information to map to MASAQ data
    const segmentParts = segment.id.split('-');
    if (segmentParts.length >= 4) {
      const key = segmentParts.slice(0, 4).join('-');
      return this.masaqData[key];
    }
    return undefined;
  }
}

// Export the main detection function
export const detectIdafaConstructions = (
  segments: Record<string, MorphologicalDetails>,
  masaqEntries?: MASAQEntry[]
): IdafaDetectionResult => {
  const detector = new IdafaDetector();
  return detector.detectIdafaConstructions(segments, masaqEntries);
};
