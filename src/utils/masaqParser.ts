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

  /**
 * Creates a MASAQEntry object from a row of CSV data using the actual CSV column names
 * @param headers - Column headers from the CSV file
 * @param values - Values from a single CSV row
 * @param lineNumber - Line number in the CSV file for error tracking
 * @returns MASAQEntry object mapped from CSV data
 */
private createMASAQEntry(headers: string[], values: string[], lineNumber: number): MASAQEntry {
  // Create the base entry with required fields
  const entry: MASAQEntry = {
    // Basic identifiers - map directly from CSV columns
    id: values[headers.indexOf('ID')] || `masaq-${lineNumber}`,
    sura_no: parseInt(values[headers.indexOf('Sura_No')] || '1'),
    verse_no: parseInt(values[headers.indexOf('Verse_No')] || '1'),
    word_no: parseInt(values[headers.indexOf('Word_No')] || '1'),
    
    // Word form information
    word: values[headers.indexOf('Word')] || '',
    without_diacritics: values[headers.indexOf('Without_Diacritics')] || '',
    segmented_word: values[headers.indexOf('Segmented_Word')] || '',
    
    // Morphological classification
    morph_tag: values[headers.indexOf('Morph_tag')] || '',
    morph_type: values[headers.indexOf('Morph_type')] || ''
  };

  // Map optional fields if they exist in the CSV
  const optionalFields: {[key: string]: keyof MASAQEntry} = {
    'Column5': 'column5',
    'Punctuation_Mark': 'punctuation_mark',
    'Invariable_Declinable': 'invariable_declinable',
    'Syntactic_Role': 'syntactic_role',
    'Possessive_Construct': 'possessive_construct',
    'Case_Mood': 'case_mood',
    'Case_Mood_Marker': 'case_mood_marker',
    'Phrase': 'phrase',
    'Phrasal_Function': 'phrasal_function',
    'Notes': 'notes'
  };

  // Add optional fields if they exist in the CSV
  Object.entries(optionalFields).forEach(([csvField, entryField]) => {
    const index = headers.indexOf(csvField);
    if (index !== -1 && values[index]) {
      (entry as any)[entryField] = values[index];
    }
  });

  // Log a sample entry for debugging
  if (lineNumber === 1) {
    console.log('Sample MASAQ Entry:', entry);
    console.log('MASAQ headers:', headers);
  }

  return entry;
}

  private camelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
 * Checks if a field is one of the known MASAQ CSV column names
 * @param field - Field name to check
 * @returns boolean indicating if this is a known field
 */
private isKnownField(field: string): boolean {
    // Updated list of known fields based on actual CSV columns
    const knownFields = [
      'ID', 'Sura_No', 'Verse_No', 'Column5', 'Word_No',
      'Word', 'Without_Diacritics', 'Segmented_Word',
      'Morph_tag', 'Morph_type', 'Punctuation_Mark',
      'Invariable_Declinable', 'Syntactic_Role',
      'Possessive_Construct', 'Case_Mood',
      'Case_Mood_Marker', 'Phrase', 'Phrasal_Function', 'Notes'
    ];
    
    return knownFields.includes(field);
  }

  /**
   * Generate metadata for the MASAQ dataset
   * @param entries - The parsed MASAQEntry objects
   * @returns Metadata object conforming to MASAQDataset['metadata']
   */
  private generateMetadata(entries: MASAQEntry[]): MASAQDataset['metadata'] {
    // Extract unique surahs and sort them
    const surahs = [...new Set(entries.map(e => e.sura_no))].sort((a, b) => a - b);
    
    // Create map of verses by surah
    const verses = new Map<number, number[]>();
    surahs.forEach(surah => {
      const surahVerses = [...new Set(entries
        .filter(e => e.sura_no === surah)
        .map(e => e.verse_no)
      )].sort((a, b) => a - b);
      verses.set(surah, surahVerses);
    });
    
    // Extract morphological type statistics
    const morphTypes = {
      prefixes: [...new Set(entries
        .filter(e => e.morph_type === 'Prefix')
        .map(e => e.morph_tag)
      )],
      stems: [...new Set(entries
        .filter(e => e.morph_type === 'Stem')
        .map(e => e.morph_tag)
      )],
      suffixes: [...new Set(entries
        .filter(e => e.morph_type === 'Suffix')
        .map(e => e.morph_tag)
      )]
    };
    
    // Count occurrences of each morph_tag
    const morphTags: { [key: string]: number } = {};
    entries.forEach(entry => {
      if (!morphTags[entry.morph_tag]) {
        morphTags[entry.morph_tag] = 1;
      } else {
        morphTags[entry.morph_tag]++;
      }
    });
    
    return {
      totalEntries: entries.length,
      surahs,
      verses,
      morphTypes,
      morphTags
    };
  }

  /**
   * Enhances a morphological segment with MASAQ data
   * @param segment - Base MorphologicalDetails to enhance
   * @param surah - Surah number
   * @param verse - Verse number
   * @param wordIndex - Word index in verse
   * @param segmentIndex - Segment index in word
   * @returns EnhancedMorphologicalDetails with MASAQ data
   */
  enhanceSegmentWithMASAQ(
    segment: MorphologicalDetails, 
    surah: number, 
    verse: number, 
    wordIndex: number, 
    segmentIndex: number
  ): EnhancedMorphologicalDetails {
    if (!this.dataset) {
      console.warn('MASAQ dataset not loaded');
      return {
        ...segment,
        confidence: 0.5  // Low confidence when MASAQ data not available
      };
    }

    // Enhanced lookup with logging
    console.log(`Looking for MASAQ entry: ${surah}:${verse}:${wordIndex}:${segmentIndex}`);
    
    const masaqEntry = this.dataset.entries.find(entry => 
      entry.sura_no === surah && 
      entry.verse_no === verse && 
      entry.word_no === wordIndex && 
      entry.segmented_word === segment.text
    );

    if (!masaqEntry) {
      console.log(`No MASAQ entry found for ${surah}:${verse}:${wordIndex}:${segmentIndex}`);
      return {
        ...segment,
        confidence: 0.5  // Low confidence when no matching MASAQ entry
      };
    }

    console.log('Found MASAQ entry:', masaqEntry);

    // Enhanced mapping with MASAQ data
    const enhanced: EnhancedMorphologicalDetails = {
      ...segment,
      confidence: 0.9,  // High confidence for MASAQ data
      masaqReference: masaqEntry.id,
      
      // Store original MASAQ fields for reference
      morph_tag: masaqEntry.morph_tag,
      morph_type: masaqEntry.morph_type,
      syntactic_role: masaqEntry.syntactic_role,
      possessive_construct: masaqEntry.possessive_construct,
      
      // Enhanced morphological properties derived from MASAQ data
      aspect: this.mapAspect(masaqEntry.morph_tag),
      definite: masaqEntry.morph_tag === 'DET' ? 'definite' : 'indefinite',
      isDefinite: masaqEntry.morph_tag === 'DET',  // Set based on morph_tag
      state: masaqEntry.possessive_construct === 'مضاف' ? 'construct' : 'absolute',
      syntacticRole: masaqEntry.syntactic_role,
      
      // Map semantic field
      semanticField: this.deriveSemanticField(masaqEntry),
      
      // Override segment properties with MASAQ data when available
      case: this.mapCase(masaqEntry.case_mood) || segment.case,
      gender: this.mapGender(masaqEntry.morph_tag) || segment.gender,
      number: this.mapNumber(masaqEntry.morph_tag) || segment.number,
      person: this.mapPerson(masaqEntry.morph_tag) || segment.person,
      tense: this.mapTense(masaqEntry.morph_tag) || segment.tense,
      voice: this.mapVoice(masaqEntry.morph_tag) || segment.voice,
      mood: this.mapMood(masaqEntry.case_mood) || segment.mood,
      
      // Set idafa-related properties based on possessive_construct
      isMudaf: masaqEntry.possessive_construct === 'مضاف',
      isMudafIlayh: masaqEntry.possessive_construct === 'مضاف إليه',
      
      // Add morphological feature data
      additionalFeatures: {
        morph_tag: masaqEntry.morph_tag,
        morph_type: masaqEntry.morph_type,
        case_mood: masaqEntry.case_mood || '',
        case_mood_marker: masaqEntry.case_mood_marker || '',
        confidence: this.calculateMorphologyConfidence(masaqEntry).toString()
      }
    };

    console.log('Enhanced segment result:', enhanced);
    return enhanced;
  }

  /**
   * Derive semantic field from MASAQ data
   * @param entry - MASAQ entry to derive semantic field from
   * @returns Semantic field classification or undefined
   */
  private deriveSemanticField(entry: MASAQEntry): string | undefined {
    // Derive from morph_tag
    if (entry.morph_tag) {
      if (entry.morph_tag === 'NOUN_PROP') return 'Named Entities';
      if (entry.morph_tag.includes('NOUN')) return 'Nominal';
      if (entry.morph_tag.includes('V')) return 'Verbal';
      if (entry.morph_tag === 'PREP') return 'Prepositional';
    }
    
    // Derive from phrase if available
    if (entry.phrase) {
      if (entry.phrase.includes('اسمية')) return 'Nominal Phrase';
      if (entry.phrase.includes('فعلية')) return 'Verbal Phrase';
    }
    
    return undefined;
  }

  /**
   * Calculate confidence score for morphological analysis
   * @param entry - MASAQ entry to calculate confidence for
   * @returns Confidence score between 0-1
   */
  private calculateMorphologyConfidence(entry: MASAQEntry): number {
    let confidence = 0.8; // Base confidence for MASAQ data
    
    // Increase confidence based on available features
    if (entry.morph_tag) confidence += 0.05;
    if (entry.morph_type) confidence += 0.05;
    if (entry.case_mood) confidence += 0.05;
    if (entry.syntactic_role) confidence += 0.05;
    
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

  private mapMorphologyType(morphType?: string): 'noun' | 'verb' | 'particle' | 'adjective' {
    if (!morphType) return 'noun'; // Default fallback
    const lower = morphType.toLowerCase();
    if (lower.includes('noun') || lower.includes('ism')) return 'noun';
    if (lower.includes('verb') || lower.includes('fi3l')) return 'verb';
    if (lower.includes('particle') || lower.includes('harf')) return 'particle';
    if (lower.includes('adj') || lower.includes('sifah')) return 'adjective';
    return 'noun'; // Default fallback
  }

  private mapSegmentType(morphTag?: string): 'prefix' | 'root' | 'suffix' {
    if (!morphTag) return 'root'; // Default fallback
    const tag = morphTag.toUpperCase();
    
    // Prefixes: determiners, prepositions, conjunctions, imperfect prefixes
    if (tag.includes('DET') || tag.includes('PREP') || tag.includes('CONJ') || 
        tag.includes('IMPERF') || tag.includes('PREF')) return 'prefix';
    
    // Suffixes: pronouns, case markers, gender/number suffixes
    if (tag.includes('PRON') || tag.includes('SUFF') || tag.includes('OBJ') || 
        tag.includes('SUBJ') || tag.includes('GEN') || tag.includes('ACC')) return 'suffix';
    
    // Default to root for stems and unclassified morphemes
    return 'root';
  }

  getDataset(): MASAQDataset | null {
    return this.dataset;
  }

  /**
   * Get MASAQ entry by location coordinates
   */
  getEntryByLocation(surah: number, verse: number, word: number, segment?: number): MASAQEntry | undefined {
    if (!this.dataset) return undefined;
    
    return this.dataset.entries.find(entry => 
      entry.sura_no === surah && 
      entry.verse_no === verse && 
      entry.word_no === word && 
      (segment === undefined || segment === 0) // MASAQ doesn't have segment numbers directly
    );
  }

  /**
   * Get entry by ID
   * @param id - MASAQ entry ID
   * @returns MASAQEntry if found, undefined otherwise
   */
  getEntryById(id: string): MASAQEntry | undefined {
    if (!this.dataset) return undefined;
    
    // Find entry by ID
    return this.dataset.entries.find(entry => entry.id === id);
  }

  /**
   * Static method to map MASAQEntry to EnhancedMorphologicalDetails
   * @param entry - MASAQ entry to convert
   * @returns Converted EnhancedMorphologicalDetails
   */
  public static mapToMorphologicalDetails(entry: MASAQEntry): EnhancedMorphologicalDetails {
    // Create a new instance to access instance methods
    const parser = new MASAQParser();
    
    // Extract morphological features from entry
    const details: EnhancedMorphologicalDetails = {
      id: `segment-${entry.id}`,
      text: entry.segmented_word,
      morphology: parser.mapMorphologyType(entry.morph_type),
      type: parser.mapSegmentType(entry.morph_tag),
      tag: entry.morph_tag,
      lemma: entry.without_diacritics || '',
      root: '', // Not available in MASAQ.csv
      pattern: entry.morph_tag, // Use morph_tag as a pattern
      relationships: [], // Initialize empty relationships
      confidence: 0.9, // Default high confidence for MASAQ
      masaqReference: entry.id,
      
      // Store MASAQ-specific fields in additionalFeatures
      additionalFeatures: {
        morph_tag: entry.morph_tag,
        morph_type: entry.morph_type,
        case_mood: entry.case_mood || '',
        case_mood_marker: entry.case_mood_marker || '',
        confidence: '0.9' // Default high confidence for MASAQ
      },
      
      // Keep some fields directly accessible for backward compatibility
      syntactic_role: entry.syntactic_role,
      possessive_construct: entry.possessive_construct
    };
    
    // Map morphological features
    details.aspect = parser.mapAspect(entry.morph_tag);
    details.case = parser.mapCase(entry.case_mood);
    details.definite = entry.morph_tag === 'DET' ? 'definite' : 'indefinite';
    details.gender = parser.mapGender(entry.morph_tag);
    details.mood = parser.mapMood(entry.case_mood);
    details.number = parser.mapNumber(entry.morph_tag);
    details.person = parser.mapPerson(entry.morph_tag);
    details.state = entry.possessive_construct === 'مضاف' ? 'construct' : 'absolute';
    details.tense = parser.mapTense(entry.morph_tag);
    details.voice = parser.mapVoice(entry.morph_tag);
    
    // Map syntactic information
    if (entry.syntactic_role) details.syntacticRole = entry.syntactic_role;
    
    // Set idafa-related properties based on possessive_construct
    if (entry.possessive_construct === 'مضاف') {
      details.isMudaf = true;
    } else if (entry.possessive_construct === 'مضاف إليه') {
      details.isMudafIlayh = true;
    }
    
    return details;
  }
}

// Singleton instance
export const masaqParser = MASAQParser.getInstance();
