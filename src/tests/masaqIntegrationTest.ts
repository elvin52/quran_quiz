/**
 * MASAQ Integration Pipeline Comprehensive Test
 * 
 * Tests the complete data flow from MASAQ.csv through aggregation to quiz display
 * to identify and validate critical integration issues.
 */

import { masaqParser } from '@/utils/masaqParser';
import { selectiveAggregationService } from '@/utils/selectiveAggregationService';
import { MorphologicalDetails } from '@/types/morphology';
import { EnhancedMorphologicalDetails } from '@/types/masaq';

/**
 * Test Suite: MASAQ Integration Pipeline Validation
 */
export class MASAQIntegrationTest {

  /**
   * Priority 1: Test Hardcoded Rules vs MASAQ Data Alignment
   */
  async testAggregationRulesAlignment() {
    console.log('=== PRIORITY 1: Testing Aggregation Rules vs MASAQ Data Alignment ===');

    // Load MASAQ dataset
    const csvContent = await this.loadMASAQCSV();
    if (!csvContent) {
      console.error('❌ Failed to load MASAQ.csv');
      return;
    }

    const dataset = await masaqParser.loadDataset(csvContent);
    console.log('✅ MASAQ Dataset loaded:', dataset.metadata);

    // Analyze MASAQ morphological categories
    const morphCategories = this.analyzeMASAQMorphology(dataset);
    console.log('📊 MASAQ Morphological Categories:', morphCategories);

    // Compare with hardcoded aggregation rules
    this.compareAggregationRules(morphCategories);
  }

  /**
   * Priority 2: Test Enhancement Process Type Safety
   */
  async testEnhancementTypeSafety() {
    console.log('\n=== PRIORITY 2: Testing Enhancement Process Type Safety ===');

    // Create test segments with various properties
    const testSegments = this.createTestSegments();
    
    for (const segment of testSegments) {
      try {
        const enhanced = masaqParser.enhanceSegmentWithMASAQ(segment, 1, 1, 1, 1);
        console.log(`✅ Enhanced segment ${segment.text}:`, enhanced);
      } catch (error) {
        console.error(`❌ Enhancement failed for ${segment.text}:`, error);
      }
    }
  }

  /**
   * Priority 3: Test Grammatical Relationship Preservation
   */
  async testRelationshipPreservation() {
    console.log('\n=== PRIORITY 3: Testing Grammatical Relationship Preservation ===');

    // Load Surah Al-Fatiha segments
    const fatihaSegments = this.getFatihaTestSegments();
    
    // Enhance with MASAQ data
    const enhancedSegments = fatihaSegments.map((segment, index) => 
      masaqParser.enhanceSegmentWithMASAQ(segment, 1, 1, Math.floor(index/2) + 1, index % 2)
    );

    console.log('📈 Enhanced segments count:', enhancedSegments.length);

    // Apply aggregation
    const aggregatedSegments = selectiveAggregationService.aggregateSegments(enhancedSegments);
    
    console.log('📉 Aggregated segments count:', aggregatedSegments.length);

    // Check for relationship preservation
    this.validateRelationshipPreservation(enhancedSegments, aggregatedSegments);
  }

  /**
   * Priority 4: Test Index Mapping Integrity
   */
  async testIndexMappingIntegrity() {
    console.log('\n=== PRIORITY 4: Testing Index Mapping Integrity ===');

    const testSegments = this.getFatihaTestSegments();
    
    // Track index transformations through pipeline
    console.log('🔢 Original segments:', testSegments.map((s, i) => `${i}: ${s.text}`));

    const enhanced = testSegments.map((segment, index) => 
      masaqParser.enhanceSegmentWithMASAQ(segment, 1, 1, Math.floor(index/2) + 1, index % 2)
    );

    const aggregated = selectiveAggregationService.aggregateSegments(enhanced);
    
    console.log('🔢 Aggregated segments:', aggregated.map((s, i) => `${i}: ${s.text} (original: ${(s as any).originalIndices || 'none'})`));

    // Validate index mapping integrity
    this.validateIndexMappingIntegrity(testSegments, aggregated);
  }

  /**
   * Analyze MASAQ morphological categories from dataset
   */
  private analyzeMASAQMorphology(dataset: any) {
    const categories = {
      morphTags: new Set<string>(),
      morphTypes: new Set<string>(),
      syntacticRoles: new Set<string>(),
      possessiveConstructs: new Set<string>(),
      caseMoods: new Set<string>()
    };

    dataset.entries.forEach((entry: any) => {
      if (entry.morph_tag) categories.morphTags.add(entry.morph_tag);
      if (entry.morph_type) categories.morphTypes.add(entry.morph_type);
      if (entry.syntactic_role) categories.syntacticRoles.add(entry.syntactic_role);
      if (entry.possessive_construct) categories.possessiveConstructs.add(entry.possessive_construct);
      if (entry.case_mood) categories.caseMoods.add(entry.case_mood);
    });

    return {
      morphTags: Array.from(categories.morphTags),
      morphTypes: Array.from(categories.morphTypes),
      syntacticRoles: Array.from(categories.syntacticRoles),
      possessiveConstructs: Array.from(categories.possessiveConstructs),
      caseMoods: Array.from(categories.caseMoods)
    };
  }

  /**
   * Compare hardcoded aggregation rules with actual MASAQ categories
   */
  private compareAggregationRules(masaqCategories: any) {
    console.log('\n🔍 Comparing Hardcoded Rules vs MASAQ Categories:');

    // This would need access to the hardcoded constants from selectiveAggregationService
    // For now, log what we found in MASAQ data
    console.log('MASAQ Morph Tags:', masaqCategories.morphTags);
    console.log('MASAQ Morph Types:', masaqCategories.morphTypes);
    console.log('MASAQ Syntactic Roles:', masaqCategories.syntacticRoles);

    // Check for potential mismatches
    const potentialIssues = [];
    
    if (masaqCategories.morphTags.includes('DET') && masaqCategories.morphTags.includes('PREP')) {
      potentialIssues.push('✅ MASAQ has DET and PREP tags matching aggregation rules');
    }

    if (masaqCategories.morphTags.includes('IMPERF_PREF')) {
      potentialIssues.push('✅ MASAQ has IMPERF_PREF matching verbal prefix rules');
    }

    console.log('Analysis Results:', potentialIssues);
  }

  /**
   * Create test segments with various morphological properties
   */
  private createTestSegments(): MorphologicalDetails[] {
    return [
      {
        id: 'test-1',
        text: 'ال',
        morphology: 'particle',
        type: 'prefix',
        grammaticalRole: 'definite_article'
      },
      {
        id: 'test-2',
        text: 'الله',
        morphology: 'noun',
        type: 'root',
        grammaticalRole: 'proper_noun'
      },
      {
        id: 'test-3',
        text: 'نَ',
        morphology: 'particle',
        type: 'prefix',
        grammaticalRole: 'imperfect_prefix'
      }
    ];
  }

  /**
   * Get test segments from Surah Al-Fatiha
   */
  private getFatihaTestSegments(): MorphologicalDetails[] {
    return [
      { id: '1', text: 'بِ', morphology: 'particle', type: 'prefix' },
      { id: '2', text: 'سم', morphology: 'noun', type: 'root' },
      { id: '3', text: 'ال', morphology: 'particle', type: 'prefix' },
      { id: '4', text: 'له', morphology: 'noun', type: 'root' },
      { id: '5', text: 'ال', morphology: 'particle', type: 'prefix' },
      { id: '6', text: 'رحمن', morphology: 'noun', type: 'root' }
    ];
  }

  /**
   * Validate that grammatical relationships are preserved through aggregation
   */
  private validateRelationshipPreservation(enhanced: EnhancedMorphologicalDetails[], aggregated: any[]) {
    console.log('🔗 Checking relationship preservation...');

    // Count relationships before and after aggregation
    const enhancedRelationships = enhanced.filter(s => s.isMudaf || s.isMudafIlayh).length;
    const aggregatedRelationships = aggregated.filter(s => 
      s.originalSegments?.some((os: any) => os.isMudaf || os.isMudafIlayh)
    ).length;

    console.log(`Enhanced segments with relationships: ${enhancedRelationships}`);
    console.log(`Aggregated segments preserving relationships: ${aggregatedRelationships}`);

    if (enhancedRelationships > 0 && aggregatedRelationships === 0) {
      console.error('❌ CRITICAL: Relationships lost during aggregation!');
    } else {
      console.log('✅ Relationships appear to be preserved');
    }
  }

  /**
   * Validate index mapping integrity through transformations
   */
  private validateIndexMappingIntegrity(original: MorphologicalDetails[], aggregated: any[]) {
    console.log('🎯 Checking index mapping integrity...');

    let mappingErrors = 0;

    aggregated.forEach((aggSeg, aggIndex) => {
      if (aggSeg.originalIndices) {
        aggSeg.originalIndices.forEach((origIndex: number) => {
          if (origIndex >= original.length) {
            console.error(`❌ Invalid original index ${origIndex} (max: ${original.length - 1})`);
            mappingErrors++;
          }
        });
      }
    });

    if (mappingErrors === 0) {
      console.log('✅ Index mapping integrity validated');
    } else {
      console.error(`❌ Found ${mappingErrors} index mapping errors`);
    }
  }

  /**
   * Load MASAQ.csv content
   */
  private async loadMASAQCSV(): Promise<string | null> {
    try {
      const response = await fetch('/MASAQ.csv');
      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch (error) {
      console.error('Failed to load MASAQ.csv:', error);
      return null;
    }
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🚀 Starting MASAQ Integration Pipeline Tests\n');
    
    await this.testAggregationRulesAlignment();
    await this.testEnhancementTypeSafety();
    await this.testRelationshipPreservation();
    await this.testIndexMappingIntegrity();
    
    console.log('\n✅ MASAQ Integration Tests Complete');
  }
}

// Export singleton instance
export const masaqIntegrationTest = new MASAQIntegrationTest();
