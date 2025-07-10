# الموصوف والصفة Detection Rules

## 🎯 **Overview**
Detection logic for **الموصوف والصفة** (Qualified Noun–Adjective) constructions in Arabic grammar.

## 📚 **Linguistic Definition**
**الموصوف والصفة** is an attributive construction where an adjective (صفة) describes and modifies a preceding noun (موصوف). The adjective must agree with the noun in four grammatical features.

### Examples:
- `الصراط المستقيم` (the straight path)
- `رجل طيب` (a good man)
- `امرأة كريمة` (a generous woman)

---

## 🔍 **Detection Algorithm**

### Core Logic
For every adjacent pair of morphological segments:

1. **Part-of-Speech Check:**
   - First segment: `morphology === 'noun'`
   - Second segment: `morphology === 'adjective'`

2. **Four-Factor Agreement:**
   - **Case Agreement:** `noun.case === adjective.case`
   - **Number Agreement:** `noun.number === adjective.number` 
   - **Gender Agreement:** `noun.gender === adjective.gender`
   - **Definiteness Agreement:** `noun.isDefinite === adjective.isDefinite`

3. **Construction Creation:**
   - If all criteria are met, create bilateral grammatical relationship
   - Assign roles: `mawsoof` (noun) and `sifah` (adjective)

---

## 🏗️ **Implementation Details**

### Required Properties
```typescript
interface MorphologicalDetails {
  morphology: 'noun' | 'adjective';
  case?: 'nominative' | 'accusative' | 'genitive';
  number?: 'singular' | 'dual' | 'plural';
  gender?: 'masculine' | 'feminine';
  isDefinite?: boolean;          // Critical for الموصوف والصفة
}
```

### Agreement Validation
```typescript
function validateAgreement(noun: MorphologicalDetails, adjective: MorphologicalDetails): boolean {
  return (
    noun.case === adjective.case &&
    noun.number === adjective.number &&
    noun.gender === adjective.gender &&
    noun.isDefinite === adjective.isDefinite
  );
}
```

---

## 📊 **Certainty Levels**

### Definite
- All four agreement factors match
- Clear morphological markers present
- Adjacent positioning

### Probable  
- Three agreement factors match
- One factor uncertain or missing
- Close positioning (within 2 segments)

### Inferred
- Two agreement factors match
- Multiple factors uncertain
- Distant positioning or intervening elements

---

## 🎯 **Expected Detection Patterns**

### High-Frequency Patterns
1. **Definite + Definite:** `الرجل الطيب`
2. **Indefinite + Indefinite:** `رجل طيب`
3. **Dual Forms:** `رجلان طيبان`
4. **Feminine Forms:** `امرأة طيبة`

### Edge Cases
1. **Broken Plurals:** Agreement challenging
2. **Elative Adjectives:** Special morphological patterns
3. **Multiple Adjectives:** Chain detection
4. **Interrupting Particles:** Proximity handling

---

## 🔧 **Integration Points**

### Word-Level Detection
- Operates on aggregated words, not morphological segments
- Maps results back to segment indices for UI compatibility
- Integrates with existing `wordLevelConstructionDetector.ts`

### Grammar Quiz Integration
- Provides construction spans for user selection
- Generates explanatory feedback
- Tracks accuracy statistics for الموصوف والصفة type

---

## 🧪 **Test Cases**

### Basic Agreement
```
Input: "الرجل الطيب" 
Expected: مawsoof-sifah construction (definite masculine singular nominative)
```

### Gender Agreement
```
Input: "المرأة الطيبة"
Expected: mawsoof-sifah construction (definite feminine singular)
```

### Number Agreement  
```
Input: "الرجال الطيبون"
Expected: mawsoof-sifah construction (definite masculine plural)
```

### Failed Agreement
```
Input: "الرجل الطيبة" 
Expected: No construction (gender mismatch)
```

---

## 📖 **Classical Grammar References**

### Ibn Ajurrūmī (الآجرومية)
- Basic principles of الموصوف والصفة agreement
- Four-factor concordance rules

### Alfiyyat Ibn Mālik (ألفية ابن مالك)
- Advanced agreement patterns
- Exception handling rules

### Modern Grammar
- Contemporary Arabic grammar textbooks
- Pedagogical simplification approaches
