import { MASAQEntry, MASAQDataset, EnhancedMorphologicalDetails } from '@/types/masaq';
import { MorphologicalDetails } from '@/types/morphology';

export class MASAQParser {
  private static instance: MASAQParser;
  private dataset: MASAQDataset | null = null;

  static getInstance(): MASAQParser {
    if (!MASAQParser.instance) {
      MASAQParser.instance = new MASAQParser();
    }
    return MASAQParser.instance;
  }

  async loadDataset(csvContent: string): Promise<MASAQDataset> {
    console.log('Loading MASAQ dataset...');
    
    const entries = this.parseCSV(csvContent);
    const metadata = this.generateMetadata(entries);
    
    this.dataset = {
      entries,
      metadata
    };

    console.log(`Loaded ${entries.length} entries from MASAQ dataset`);
    return this.dataset;
  }

  private parseCSV(csvContent: string): MASAQEntry[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('CSV Headers:', headers);
    
    const entries: MASAQEntry[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(`Line ${i + 1}: Expected ${headers.length} columns, got ${values.length}`);
        continue;
      }
      
      const entry = this.createMASAQEntry(headers, values, i + 1);
      entries.push(entry);
    }
    
    return entries;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  private createMASAQEntry(headers: string[], values: string[], lineNumber: number): MASAQEntry {
    const features: Record<string, string> = {};
    
    const entry: MASAQEntry = {
      id: `masaq-${lineNumber}`,
      surah: parseInt(values[headers.indexOf('SURAH')] || '1'),
      verse: parseInt(values[headers.indexOf('VERSE')] || '1'),
      word: parseInt(values[headers.indexOf('WORD')] || '1'),
      segment: parseInt(values[headers.indexOf('SEGMENT')] || '1'),
      form: values[headers.indexOf('FORM')] || '',
      pos: values[headers.indexOf('POS')] || '',
      lemma: values[headers.indexOf('LEMMA')] || '',
      root: values[headers.indexOf('ROOT')] || '',
      pattern: values[headers.indexOf('PATTERN')] || '',
      features
    };

    // Parse optional morphological features
    const optionalFields = [
      'ASPECT', 'CASE', 'DEFINITE', 'GENDER', 'MOOD', 
      'NUMBER', 'PERSON', 'STATE', 'TENSE', 'VOICE'
    ];

    optionalFields.forEach(field => {
      const index = headers.indexOf(field);
      if (index !== -1 && values[index]) {
        const key = field.toLowerCase() as keyof MASAQEntry;
        (entry as any)[key] = values[index];
      }
    });

    // Parse syntactic information
    const syntaxFields = ['SYNTACTIC_ROLE', 'DEPENDENCY_HEAD', 'DEPENDENCY_RELATION'];
    syntaxFields.forEach(field => {
      const index = headers.indexOf(field);
      if (index !== -1 && values[index]) {
        const key = this.camelCase(field) as keyof MASAQEntry;
        (entry as any)[key] = values[index];
      }
    });

    // Parse semantic information
    const semanticFields = ['NAMED_ENTITY', 'CONCEPT'];
    semanticFields.forEach(field => {
      const index = headers.indexOf(field);
      if (index !== -1 && values[index]) {
        const key = this.camelCase(field) as keyof MASAQEntry;
        (entry as any)[key] = values[index];
      }
    });

    // Store any additional features
    headers.forEach((header, index) => {
      if (!this.isKnownField(header) && values[index]) {
        features[header] = values[index];
      }
    });

    return entry;
  }

  private camelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private isKnownField(field: string): boolean {
    const knownFields = [
      'SURAH', 'VERSE', 'WORD', 'SEGMENT', 'FORM', 'POS', 'LEMMA', 'ROOT', 'PATTERN',
      'ASPECT', 'CASE', 'DEFINITE', 'GENDER', 'MOOD', 'NUMBER', 'PERSON', 'STATE', 
      'TENSE', 'VOICE', 'SYNTACTIC_ROLE', 'DEPENDENCY_HEAD', 'DEPENDENCY_RELATION',
      'NAMED_ENTITY', 'CONCEPT'
    ];
    return knownFields.includes(field);
  }

  private generateMetadata(entries: MASAQEntry[]): MASAQDataset['metadata'] {
    const surahs = [...new Set(entries.map(e => e.surah))].sort((a, b) => a - b);
    const totalWords = new Set(entries.map(e => `${e.surah}-${e.verse}-${e.word}`)).size;
    
    return {
      version: '1.0',
      totalEntries: entries.length,
      coverage: {
        surahs,
        totalWords,
        totalSegments: entries.length
      }
    };
  }

  // Enhanced method with better error handling and logging
  enhanceSegmentWithMASAQ(
    segment: MorphologicalDetails, 
    surah: number, 
    verse: number, 
    wordIndex: number, 
    segmentIndex: number
  ): EnhancedMorphologicalDetails {
    if (!this.dataset) {
      console.warn('MASAQ dataset not loaded');
      return segment as EnhancedMorphologicalDetails;
    }

    // Enhanced lookup with logging
    console.log(`Looking for MASAQ entry: ${surah}:${verse}:${wordIndex}:${segmentIndex}`);
    
    const masaqEntry = this.dataset.entries.find(entry => 
      entry.surah === surah && 
      entry.verse === verse && 
      entry.word === wordIndex && 
      entry.segment === segmentIndex
    );

    if (!masaqEntry) {
      console.log(`No MASAQ entry found for ${surah}:${verse}:${wordIndex}:${segmentIndex}`);
      return segment as EnhancedMorphologicalDetails;
    }

    console.log('Found MASAQ entry:', masaqEntry);

    // Enhanced mapping with better fallbacks
    const enhanced: EnhancedMorphologicalDetails = {
      ...segment,
      masaqData: masaqEntry,
      
      // Enhanced morphological properties with MASAQ data priority
      aspect: this.mapAspect(masaqEntry.aspect),
      definite: this.mapDefinite(masaqEntry.definite),
      state: this.mapState(masaqEntry.state),
      syntacticRole: masaqEntry.syntacticRole,
      dependencyHead: masaqEntry.dependencyHead?.toString(),
      dependencyRelation: masaqEntry.dependencyRelation,
      namedEntity: masaqEntry.namedEntity,
      concept: masaqEntry.concept,
      morphologicalPattern: masaqEntry.pattern || segment.pattern,
      
      // Enhanced semantic field mapping
      semanticField: this.deriveSemanticField(masaqEntry),
      
      // Override segment properties with MASAQ data when available and valid
      case: this.mapCase(masaqEntry.case) || segment.case,
      gender: this.mapGender(masaqEntry.gender) || segment.gender,
      number: this.mapNumber(masaqEntry.number) || segment.number,
      person: this.mapPerson(masaqEntry.person) || segment.person,
      tense: this.mapTense(masaqEntry.tense) || segment.tense,
      voice: this.mapVoice(masaqEntry.voice) || segment.voice,
      mood: this.mapMood(masaqEntry.mood) || segment.mood,
      
      // Enhanced confidence scores based on data availability
      confidenceScores: {
        morphology: this.calculateMorphologyConfidence(masaqEntry),
        syntax: masaqEntry.syntacticRole ? 0.9 : 0.5,
        semantics: masaqEntry.concept || masaqEntry.namedEntity ? 0.85 : 0.3
      }
    };

    console.log('Enhanced segment result:', enhanced);
    return enhanced;
  }

  // New helper method to derive semantic field
  private deriveSemanticField(entry: MASAQEntry): string | undefined {
    if (entry.namedEntity) {
      if (entry.namedEntity.toLowerCase().includes('person')) return 'Personal Names';
      if (entry.namedEntity.toLowerCase().includes('place')) return 'Geographical';
      return 'Named Entities';
    }
    
    if (entry.concept) {
      // Basic concept categorization
      const concept = entry.concept.toLowerCase();
      if (concept.includes('divine') || concept.includes('god')) return 'Divine Attributes';
      if (concept.includes('time') || concept.includes('day')) return 'Temporal';
      if (concept.includes('place') || concept.includes('location')) return 'Spatial';
      return 'Conceptual';
    }
    
    return undefined;
  }

  // Enhanced confidence calculation
  private calculateMorphologyConfidence(entry: MASAQEntry): number {
    let confidence = 0.8; // Base confidence for MASAQ data
    
    // Increase confidence based on available features
    if (entry.root) confidence += 0.05;
    if (entry.pattern) confidence += 0.05;
    if (entry.lemma) confidence += 0.05;
    if (entry.pos) confidence += 0.05;
    
    return Math.min(confidence, 0.98); // Cap at 98%
  }

  // Mapping methods to convert MASAQ values to our enum types
  private mapAspect(aspect?: string): 'perfective' | 'imperfective' | 'imperative' | undefined {
    if (!aspect) return undefined;
    const lower = aspect.toLowerCase();
    if (lower.includes('perf')) return 'perfective';
    if (lower.includes('imperf')) return 'imperfective';
    if (lower.includes('imper')) return 'imperative';
    return undefined;
  }

  private mapDefinite(definite?: string): 'definite' | 'indefinite' | undefined {
    if (!definite) return undefined;
    const lower = definite.toLowerCase();
    if (lower.includes('def')) return 'definite';
    if (lower.includes('indef')) return 'indefinite';
    return undefined;
  }

  private mapState(state?: string): 'construct' | 'absolute' | undefined {
    if (!state) return undefined;
    const lower = state.toLowerCase();
    if (lower.includes('const')) return 'construct';
    if (lower.includes('abs')) return 'absolute';
    return undefined;
  }

  private mapCase(caseValue?: string): 'nominative' | 'accusative' | 'genitive' | undefined {
    if (!caseValue) return undefined;
    const lower = caseValue.toLowerCase();
    if (lower.includes('nom')) return 'nominative';
    if (lower.includes('acc')) return 'accusative';
    if (lower.includes('gen')) return 'genitive';
    return undefined;
  }

  private mapGender(gender?: string): 'masculine' | 'feminine' | undefined {
    if (!gender) return undefined;
    const lower = gender.toLowerCase();
    if (lower.includes('masc')) return 'masculine';
    if (lower.includes('fem')) return 'feminine';
    return undefined;
  }

  private mapNumber(number?: string): 'singular' | 'dual' | 'plural' | undefined {
    if (!number) return undefined;
    const lower = number.toLowerCase();
    if (lower.includes('sing')) return 'singular';
    if (lower.includes('dual')) return 'dual';
    if (lower.includes('plur')) return 'plural';
    return undefined;
  }

  private mapPerson(person?: string): 'first' | 'second' | 'third' | undefined {
    if (!person) return undefined;
    const lower = person.toLowerCase();
    if (lower.includes('1') || lower.includes('first')) return 'first';
    if (lower.includes('2') || lower.includes('second')) return 'second';
    if (lower.includes('3') || lower.includes('third')) return 'third';
    return undefined;
  }

  private mapTense(tense?: string): 'past' | 'present' | 'future' | 'imperative' | undefined {
    if (!tense) return undefined;
    const lower = tense.toLowerCase();
    if (lower.includes('past')) return 'past';
    if (lower.includes('pres')) return 'present';
    if (lower.includes('fut')) return 'future';
    if (lower.includes('imper')) return 'imperative';
    return undefined;
  }

  private mapVoice(voice?: string): 'active' | 'passive' | undefined {
    if (!voice) return undefined;
    const lower = voice.toLowerCase();
    if (lower.includes('act')) return 'active';
    if (lower.includes('pass')) return 'passive';
    return undefined;
  }

  private mapMood(mood?: string): 'indicative' | 'subjunctive' | 'jussive' | undefined {
    if (!mood) return undefined;
    const lower = mood.toLowerCase();
    if (lower.includes('ind')) return 'indicative';
    if (lower.includes('subj')) return 'subjunctive';
    if (lower.includes('juss')) return 'jussive';
    return undefined;
  }

  getDataset(): MASAQDataset | null {
    return this.dataset;
  }

  getEntryByLocation(surah: number, verse: number, word: number, segment: number): MASAQEntry | undefined {
    if (!this.dataset) return undefined;
    
    return this.dataset.entries.find(entry => 
      entry.surah === surah && 
      entry.verse === verse && 
      entry.word === word && 
      entry.segment === segment
    );
  }
}

// Singleton instance
export const masaqParser = MASAQParser.getInstance();
