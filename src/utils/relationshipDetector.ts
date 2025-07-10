
import { MorphologicalDetails, GrammaticalRelationship } from '@/types/morphology';

export const detectGrammaticalRelationships = (segments: Record<string, MorphologicalDetails>): Record<string, MorphologicalDetails> => {
  const enhancedSegments = { ...segments };
  
  // Convert to array for easier processing, sorted by ID for proper sequence
  const segmentArray = Object.values(segments).sort((a, b) => {
    const aNum = parseInt(a.id.split('-').join(''));
    const bNum = parseInt(b.id.split('-').join(''));
    return aNum - bNum;
  });
  
  console.log('=== COMPREHENSIVE GRAMMATICAL RELATIONSHIP DETECTION ===');
  console.log('Analyzing segments:', segmentArray.map(s => `${s.id}:${s.text}(${s.morphology})`));
  
  // 1. Detect Jār–Majrūr relationships (Preposition-Object)
  detectJarMajrurRelationships(segmentArray, enhancedSegments);
  
  // 2. Detect Muḍāf–Muḍāf Ilayh relationships (Possessive Construction)
  detectMudafRelationships(segmentArray, enhancedSegments);
  
  // 3. Detect Mawṣūf–Ṣifah relationships (Noun-Adjective)
  detectMawsufSifahRelationships(segmentArray, enhancedSegments);
  
  // 4. Detect Subject-Predicate relationships (Mubtada-Khabar)
  detectSubjectPredicateRelationships(segmentArray, enhancedSegments);
  
  // 5. Detect Verb-Subject relationships (Fi'l-Fa'il)
  detectVerbSubjectRelationships(segmentArray, enhancedSegments);
  
  // 6. Detect Verb-Object relationships (Fi'l-Maf'ul)
  detectVerbObjectRelationships(segmentArray, enhancedSegments);
  
  // 7. Detect Article-Noun relationships (Al-Ism)
  detectArticleNounRelationships(segmentArray, enhancedSegments);
  
  // 8. Detect Conjunction relationships (Harf 'Atf)
  detectConjunctionRelationships(segmentArray, enhancedSegments);
  
  // 9. Detect Relative Pronoun relationships (Ism Mawsul)
  detectRelativePronounRelationships(segmentArray, enhancedSegments);
  
  // 10. Detect Emphatic relationships (Tawkid)
  detectEmphaticRelationships(segmentArray, enhancedSegments);
  
  console.log('=== RELATIONSHIP DETECTION COMPLETE ===');
  const totalRelationships = Object.values(enhancedSegments).reduce((sum, seg) => sum + (seg.relationships?.length || 0), 0);
  console.log(`Total relationships detected: ${totalRelationships}`);
  
  return enhancedSegments;
};

const detectJarMajrurRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🔗 Detecting Jar-Majrur relationships using classical Arabic grammar...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    // Look for prepositions (jar) - comprehensive Arabic preposition recognition
    if (isArabicPreposition(current)) {
      console.log(`Found preposition (jar): ${current.text} (${current.id})`);
      
      // Find the next noun in genitive case (majrur) within reasonable distance
      for (let j = i + 1; j < Math.min(i + 4, segments.length); j++) {
        const candidate = segments[j];
        
        // Skip definite articles (allowed between jar and majrur)
        if (candidate.morphology === 'particle' && candidate.grammaticalRole === 'definite_article') {
          console.log(`  Skipping definite article: ${candidate.text}`);
          continue;
        }
        
        // Skip other particles that don't break the construction
        if (candidate.morphology === 'particle' && !isStrongParticle(candidate)) {
          continue;
        }
        
        // Check for noun that should be in genitive case (majrur)
        if (candidate.morphology === 'noun') {
          // In classical Arabic, majrur MUST be genitive (unless case marking is unavailable)
          const isValidMajrur = 
            candidate.case === 'genitive' || 
            !candidate.case; // Allow when case marking unavailable
          
          if (isValidMajrur) {
            console.log(`✅ Found Jar-Majrur: ${current.text} (jar) → ${candidate.text} (majrur)`);
            console.log(`   Cases: jar=${current.case || 'N/A'}, majrur=${candidate.case || 'unspecified'}`);
            
            addBidirectionalRelationship(
              enhanced,
              current.id,
              candidate.id,
              'jar-majrur',
              'jar',
              'majrur',
              `Preposition "${current.text}" governing "${candidate.text}" in genitive case`,
              `Noun "${candidate.text}" governed by preposition "${current.text}"`
            );
            
            break; // Found the majrur for this jar
          } else {
            console.log(`   Rejected: ${candidate.text} not in genitive case (${candidate.case})`);
          }
        }
      }
    }
  }
};

const detectMudafRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🏠 Detecting Mudaf-Mudaf Ilayh relationships using classical Arabic grammar...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    // Look for nouns that could be mudaf (can be in any case - the old logic was wrong)
    // In إضافة, the mudaf can be genitive if it's part of a larger construction
    if (current.morphology === 'noun') {
      // Look for following noun as potential mudaf ilayh within reasonable distance
      for (let j = i + 1; j < Math.min(i + 4, segments.length); j++) {
        const candidate = segments[j];
        
        // Skip articles and particles (but allow them between mudaf and mudaf ilayh)
        if (candidate.morphology === 'particle' && candidate.grammaticalRole !== 'definite_article') {
          continue;
        }
        
        // Check for noun that could be mudaf ilayh
        // In classical Arabic, mudaf ilayh should be genitive OR have definite article
        if (candidate.morphology === 'noun') {
          // Check if this looks like a valid إضافة construction
          const isValidIdafa = 
            // Case 1: Mudaf ilayh is in genitive case
            candidate.case === 'genitive' ||
            // Case 2: Mudaf ilayh has definite article (making it definite)
            hasDefiniteArticle(candidate, j, segments) ||
            // Case 3: No case marking available (assume possible)
            !candidate.case;
          
          if (isValidIdafa) {
            // Additional check: avoid if there's a strong preposition between them
            let hasStrongPrepositionBetween = false;
            for (let k = i + 1; k < j; k++) {
              if (isStrongPreposition(segments[k])) {
                hasStrongPrepositionBetween = true;
                break;
              }
            }
            
            if (!hasStrongPrepositionBetween) {
              console.log(`✅ Found Mudaf-Mudaf Ilayh: ${current.text} (${current.id}) + ${candidate.text} (${candidate.id})`);
              console.log(`   Cases: mudaf=${current.case || 'unspecified'}, mudaf-ilayh=${candidate.case || 'unspecified'}`);
              
              addBidirectionalRelationship(
                enhanced,
                current.id,
                candidate.id,
                'mudaf-mudaf-ilayh',
                'mudaf',
                'mudaf-ilayh',
                `"${current.text}" in possessive construction with "${candidate.text}"`,
                `"${candidate.text}" as possessor of "${current.text}"`
              );
              
              break; // Found the mudaf ilayh for this mudaf
            }
          }
        }
      }
    }
  }
};

const detectMawsufSifahRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🎨 Detecting Mawsoof-Sifah (الموصوف والصفة) relationships...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    // Look for nouns (موصوف)
    if (current.morphology === 'noun') {
      // Look for following adjectives (صفة) with comprehensive agreement
      for (let j = i + 1; j < Math.min(i + 4, segments.length); j++) {
        const candidate = segments[j];
        
        // Skip articles and particles
        if (candidate.morphology === 'particle') {
          continue;
        }
        
        if (candidate.morphology === 'adjective' && comprehensiveAgreementMatch(current, candidate)) {
          console.log(`✅ Found Mawsoof-Sifah: ${current.text} (${current.id}) + ${candidate.text} (${candidate.id})`);
          
          addBidirectionalRelationship(
            enhanced,
            current.id,
            candidate.id,
            'mawsoof-sifah',
            'mawsoof',
            'sifah',
            `Noun "${current.text}" described by adjective "${candidate.text}"`,
            `Adjective "${candidate.text}" describing noun "${current.text}"`
          );
        }
      }
    }
  }
};

const detectSubjectPredicateRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('📝 Detecting Subject-Predicate (Mubtada-Khabar) relationships...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    // Look for nominative nouns that could be subjects
    if (current.morphology === 'noun' && current.case === 'nominative') {
      // Look for predicate (could be noun, adjective, or prepositional phrase)
      for (let j = i + 1; j < Math.min(i + 5, segments.length); j++) {
        const candidate = segments[j];
        
        if ((candidate.morphology === 'noun' && candidate.case === 'nominative') ||
            candidate.morphology === 'adjective' ||
            isPreposition(candidate)) {
          
          console.log(`✅ Found Subject-Predicate: ${current.text} (${current.id}) -> ${candidate.text} (${candidate.id})`);
          
          // Using 'verb-object' as fallback since the exact type isn't in the union
          addBidirectionalRelationship(
            enhanced,
            current.id,
            candidate.id,
            'verb-object',
            'verb',
            'object',
            `Subject "${current.text}" with predicate "${candidate.text}"`,
            `Predicate "${candidate.text}" of subject "${current.text}"`
          );
          
          break;
        }
      }
    }
  }
};

const detectVerbSubjectRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('⚡ Detecting Fi3l-Fa3il (الفعل والفاعل) relationships...');
  
  for (let i = 0; i < segments.length; i++) {
    const current = segments[i];
    
    if (current.morphology === 'verb') {
      console.log(`Found verb (فعل): ${current.text} (${current.id})`);
      
      // Look for nominative nouns (فاعل) near the verb
      for (let j = Math.max(0, i - 3); j < Math.min(i + 4, segments.length); j++) {
        if (j === i) continue;
        
        const candidate = segments[j];
        
        // Skip particles and articles
        if (candidate.morphology === 'particle') {
          continue;
        }
        
        // Look for nouns in nominative case (فاعل must be مرفوع)
        if (candidate.morphology === 'noun' && 
            (candidate.case === 'nominative' || !candidate.case)) { // Allow when case unavailable
          
          // Additional validation for Fi3l-Fa3il agreement
          if (verbSubjectAgreementMatch(current, candidate)) {
            console.log(`✅ Found Fi3l-Fa3il: ${current.text} (فعل) <-> ${candidate.text} (فاعل)`);
            
            addBidirectionalRelationship(
              enhanced,
              current.id,
              candidate.id,
              'fi3l-fa3il',
              'fi3l',
              'fa3il',
              `Verb "${current.text}" performed by subject "${candidate.text}"`,
              `Subject "${candidate.text}" performing verb "${current.text}"`
            );
            
            break; // One subject per verb in most cases
          }
        }
      }
    }
  }
};

const detectVerbObjectRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🎯 Detecting Verb-Object (Fi\'l-Maf\'ul) relationships...');
  
  for (let i = 0; i < segments.length; i++) {
    const current = segments[i];
    
    if (current.morphology === 'verb') {
      // Look for accusative nouns (direct objects)
      for (let j = i + 1; j < Math.min(i + 5, segments.length); j++) {
        const candidate = segments[j];
        
        if (candidate.morphology === 'noun' && candidate.case === 'accusative') {
          console.log(`✅ Found Verb-Object: ${current.text} (${current.id}) -> ${candidate.text} (${candidate.id})`);
          
          addBidirectionalRelationship(
            enhanced,
            current.id,
            candidate.id,
            'verb-object',
            'verb',
            'object',
            `Verb "${current.text}" acting on object "${candidate.text}"`,
            `Direct object "${candidate.text}" of verb "${current.text}"`
          );
        }
      }
    }
  }
};

const detectArticleNounRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('📰 Detecting Article-Noun relationships...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    if (current.morphology === 'particle' && current.grammaticalRole === 'definite_article') {
      const next = segments[i + 1];
      
      if (next && (next.morphology === 'noun' || next.morphology === 'adjective')) {
        console.log(`✅ Found Article-Noun: ${current.text} (${current.id}) + ${next.text} (${next.id})`);
        
        // Using 'verb-object' as fallback since the exact type isn't in the union
        addBidirectionalRelationship(
          enhanced,
          current.id,
          next.id,
          'verb-object',
          'verb',
          'object',
          `Definite article "${current.text}" with "${next.text}"`,
          `"${next.text}" made definite by article "${current.text}"`
        );
      }
    }
  }
};

const detectConjunctionRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🔗 Detecting Conjunction relationships...');
  
  for (let i = 1; i < segments.length - 1; i++) {
    const current = segments[i];
    
    if (current.morphology === 'particle' && current.grammaticalRole === 'conjunction') {
      const before = segments[i - 1];
      const after = segments[i + 1];
      
      if (before && after && before.morphology === after.morphology) {
        console.log(`✅ Found Conjunction: ${before.text} (${before.id}) + ${current.text} (${current.id}) + ${after.text} (${after.id})`);
        
        addBidirectionalRelationship(
          enhanced,
          before.id,
          after.id,
          'verb-object',
          'verb',
          'object',
          `"${before.text}" conjoined with "${after.text}" by "${current.text}"`,
          `"${after.text}" conjoined with "${before.text}" by "${current.text}"`
        );
      }
    }
  }
};

const detectRelativePronounRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('🔍 Detecting Relative Pronoun relationships...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    
    if (current.morphology === 'particle' && current.grammaticalRole === 'relative_pronoun') {
      // Find the antecedent (usually the preceding noun)
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const candidate = segments[j];
        
        if (candidate.morphology === 'noun') {
          console.log(`✅ Found Relative Pronoun: ${candidate.text} (${candidate.id}) <- ${current.text} (${current.id})`);
          
          addBidirectionalRelationship(
            enhanced,
            candidate.id,
            current.id,
            'verb-object',
            'verb',
            'object',
            `Noun "${candidate.text}" as antecedent of relative pronoun "${current.text}"`,
            `Relative pronoun "${current.text}" referring to "${candidate.text}"`
          );
          
          break;
        }
      }
    }
  }
};

const detectEmphaticRelationships = (
  segments: MorphologicalDetails[], 
  enhanced: Record<string, MorphologicalDetails>
) => {
  console.log('💪 Detecting Emphatic relationships...');
  
  for (let i = 0; i < segments.length - 1; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    
    // Look for repeated elements or emphatic patterns
    if (current.text === next?.text || 
        (current.morphology === 'particle' && current.text.includes('إِيَّا'))) {
      
      console.log(`✅ Found Emphatic: ${current.text} (${current.id}) emphasized`);
      
      if (next && current.text === next.text) {
        addBidirectionalRelationship(
          enhanced,
          current.id,
          next.id,
          'verb-object',
          'verb',
          'object',
          `"${current.text}" emphasized by repetition`,
          `Repetition emphasizing "${current.text}"`
        );
      }
    }
  }
};

// Helper function to add bidirectional relationships
const addBidirectionalRelationship = (
  enhanced: Record<string, MorphologicalDetails>,
  id1: string,
  id2: string,
  type: 'jar-majrur' | 'mudaf-mudaf-ilayh' | 'mawsoof-sifah' | 'fi3l-fa3il' | 'verb-object',
  role1: 'jar' | 'majrur' | 'mudaf' | 'mudaf-ilayh' | 'mawsoof' | 'sifah' | 'fi3l' | 'fa3il' | 'verb' | 'object',
  role2: 'jar' | 'majrur' | 'mudaf' | 'mudaf-ilayh' | 'mawsoof' | 'sifah' | 'fi3l' | 'fa3il' | 'verb' | 'object',
  description1: string,
  description2: string
) => {
  const relationship1: GrammaticalRelationship = {
    id: `${type}-${id1}-${id2}`,
    type,
    role: role1,
    relatedSegmentId: id2,
    description: description1
  };
  
  const relationship2: GrammaticalRelationship = {
    id: `${type}-${id2}-${id1}`,
    type,
    role: role2,
    relatedSegmentId: id1,
    description: description2
  };
  
  enhanced[id1] = {
    ...enhanced[id1],
    relationships: [...(enhanced[id1].relationships || []), relationship1]
  };
  
  enhanced[id2] = {
    ...enhanced[id2],
    relationships: [...(enhanced[id2].relationships || []), relationship2]
  };
};

const isPreposition = (segment: MorphologicalDetails): boolean => {
  return segment.morphology === 'particle' && segment.grammaticalRole === 'preposition';
};

const hasDefiniteArticle = (segment: MorphologicalDetails, index: number, segments: MorphologicalDetails[]): boolean => {
  // Check if current segment has definite article prefix
  if (segment.text.startsWith('ال') || segment.text.startsWith('ٱل')) {
    return true;
  }
  
  // Check if previous segment is a definite article
  if (index > 0) {
    const prevSegment = segments[index - 1];
    return prevSegment.morphology === 'particle' && prevSegment.grammaticalRole === 'definite_article';
  }
  
  return false;
};

const isStrongPreposition = (segment: MorphologicalDetails): boolean => {
  return segment.morphology === 'particle' && 
         segment.grammaticalRole === 'preposition' &&
         !['ل', 'لِ', 'بِ', 'فِي'].includes(segment.text); // Allow weak prepositions
};

// Enhanced Arabic preposition recognition
const isArabicPreposition = (segment: MorphologicalDetails): boolean => {
  // Primary check: morphology and grammatical role
  if (segment.morphology === 'particle' && segment.grammaticalRole === 'preposition') {
    return true;
  }
  
  // Secondary check: comprehensive list of Arabic prepositions
  const arabicPrepositions = [
    // Single-letter prepositions (حروف الجر الأحادية)
    'بِ', 'لِ', 'كِ', 'تِ', 'وِ',
    'ب', 'ل', 'ك', 'ت', 'و',
    
    // Two-letter prepositions
    'مِن', 'إِلَى', 'عَن', 'فِي', 'عَلَى',
    'من', 'إلى', 'عن', 'في', 'على',
    
    // Three+ letter prepositions
    'أمام', 'خلف', 'فوق', 'تحت', 'بين', 'عند', 'لدى',
    'حول', 'دون', 'سوى', 'غير', 'خلا', 'عدا', 'حاشا',
    'منذ', 'مذ', 'لولا', 'لوما', 'حتى', 'كي'
  ];
  
  return arabicPrepositions.includes(segment.text);
};

// Helper to identify particles that break jar-majrur constructions
const isStrongParticle = (segment: MorphologicalDetails): boolean => {
  const strongParticles = ['قد', 'لا', 'ما', 'إن', 'أن', 'كان'];
  return strongParticles.includes(segment.text);
};

const agreementMatch = (noun: MorphologicalDetails, adjective: MorphologicalDetails): boolean => {
  // Check for case, number, and gender agreement
  const caseMatch = !noun.case || !adjective.case || noun.case === adjective.case;
  const numberMatch = !noun.number || !adjective.number || noun.number === adjective.number;
  const genderMatch = !noun.gender || !adjective.gender || noun.gender === adjective.gender;
  
  return caseMatch && numberMatch && genderMatch;
};

// Comprehensive agreement matching for الموصوف والصفة (Mawsoof-Sifah)
const comprehensiveAgreementMatch = (noun: MorphologicalDetails, adjective: MorphologicalDetails): boolean => {
  console.log(`Checking agreement: ${noun.text} (${noun.morphology}) <-> ${adjective.text} (${adjective.morphology})`);
  
  // 1. Case Agreement (إعراب) - Must match when available
  const caseMatch = !noun.case || !adjective.case || noun.case === adjective.case;
  if (!caseMatch) {
    console.log(`  ❌ Case mismatch: ${noun.case} vs ${adjective.case}`);
    return false;
  }
  
  // 2. Number Agreement (عدد) - Must match when available
  const numberMatch = !noun.number || !adjective.number || noun.number === adjective.number;
  if (!numberMatch) {
    console.log(`  ❌ Number mismatch: ${noun.number} vs ${adjective.number}`);
    return false;
  }
  
  // 3. Gender Agreement (جنس) - Must match when available
  const genderMatch = !noun.gender || !adjective.gender || noun.gender === adjective.gender;
  if (!genderMatch) {
    console.log(`  ❌ Gender mismatch: ${noun.gender} vs ${adjective.gender}`);
    return false;
  }
  
  // 4. Definiteness Agreement (تعريف/تنكير) - Critical for الموصوف والصفة
  const nounDefinite = (noun as any).isDefinite || noun.text.startsWith('ال') || noun.text.startsWith('ٱل');
  const adjDefinite = (adjective as any).isDefinite || adjective.text.startsWith('ال') || adjective.text.startsWith('ٱل');
  
  const definitenessMatch = nounDefinite === adjDefinite;
  if (!definitenessMatch) {
    console.log(`  ❌ Definiteness mismatch: noun=${nounDefinite}, adjective=${adjDefinite}`);
    return false;
  }
  
  console.log(`  ✅ Full agreement: case=${noun.case}, number=${noun.number}, gender=${noun.gender}, definite=${nounDefinite}`);
  return true;
};

// Verb-Subject agreement matching for الفعل والفاعل (Fi3l-Fa3il)
const verbSubjectAgreementMatch = (verb: MorphologicalDetails, subject: MorphologicalDetails): boolean => {
  console.log(`Checking verb-subject agreement: ${verb.text} (${verb.morphology}) <-> ${subject.text} (${subject.morphology})`);
  
  // 1. Person Agreement (الشخص) - Must match when available
  if (verb.person && subject.person && verb.person !== subject.person) {
    console.log(`  ❌ Person mismatch: ${verb.person} vs ${subject.person}`);
    return false;
  }
  
  // 2. Number Agreement (العدد) - Must match when available
  if (verb.number && subject.number && verb.number !== subject.number) {
    console.log(`  ❌ Number mismatch: ${verb.number} vs ${subject.number}`);
    return false;
  }
  
  // 3. Gender Agreement (الجنس) - Must match when available
  if (verb.gender && subject.gender && verb.gender !== subject.gender) {
    console.log(`  ❌ Gender mismatch: ${verb.gender} vs ${subject.gender}`);
    return false;
  }
  
  // 4. Subject must be in nominative case (الفاعل مرفوع)
  if (subject.case && subject.case !== 'nominative') {
    console.log(`  ❌ Subject not nominative: ${subject.case}`);
    return false;
  }
  
  console.log(`  ✅ Verb-subject agreement: person=${verb.person}, number=${verb.number}, gender=${verb.gender}`);
  return true;
};
