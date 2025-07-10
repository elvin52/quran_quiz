# الفعل والفاعل Detection Rules

## 🎯 **Overview**
Detection logic for **الفعل والفاعل** (Verb + Subject) constructions in Arabic grammar.

## 📚 **Linguistic Definition**
**الفعل والفاعل** is a verbal construction where a subject (فاعل) performs the action expressed by a verb (فعل). The subject typically appears after the verb and is in the nominative case.

### Examples:
- `قال الرجل` (the man said)
- `جاء محمد` (Muhammad came)
- `تكلمت المرأة` (the woman spoke)

---

## 🔍 **Detection Algorithm**

### Core Logic
For each verb in the verse:

1. **Verb Identification:**
   - Segment: `morphology === 'verb'`
   - Any tense: past, present, imperative

2. **Subject Search:**
   - Look forward 1-5 positions from verb
   - Find: `morphology === 'noun'` AND `case === 'nominative'`
   - Stop at first valid nominative noun

3. **Agreement Validation:**
   - Person agreement (if determinable)
   - Number agreement (if determinable)
   - Gender agreement (if determinable)

4. **Special Cases:**
   - **Attached Pronouns:** Subject may be attached to verb
   - **Implied Subjects:** Pronoun subjects may be implicit

---

## 🏗️ **Implementation Details**

### Required Properties
```typescript
interface MorphologicalDetails {
  morphology: 'verb' | 'noun';
  case?: 'nominative' | 'accusative' | 'genitive';
  person?: 'first' | 'second' | 'third';
  number?: 'singular' | 'dual' | 'plural';
  gender?: 'masculine' | 'feminine';
  tense?: 'past' | 'present' | 'future' | 'imperative';
}
```

### Subject Detection Logic
```typescript
function findSubject(verb: MorphologicalDetails, segments: MorphologicalDetails[], startIndex: number): MorphologicalDetails | null {
  const searchLimit = Math.min(startIndex + 5, segments.length);
  
  for (let i = startIndex + 1; i < searchLimit; i++) {
    const candidate = segments[i];
    
    if (candidate.morphology === 'noun' && candidate.case === 'nominative') {
      // Validate agreement if possible
      if (isValidSubject(verb, candidate)) {
        return candidate;
      }
    }
  }
  
  return null;
}
```

---

## 📊 **Certainty Levels**

### Definite
- Clear verb with nominative noun immediately following
- Person/number/gender agreement confirmed
- No intervening elements

### Probable  
- Verb with nominative noun within 2-3 positions
- Partial agreement or agreement uncertain
- Minor intervening particles acceptable

### Inferred
- Verb with nominative noun within 4-5 positions  
- Agreement factors unclear or conflicting
- Multiple intervening elements
- Alternative interpretations possible

---

## 🎯 **Expected Detection Patterns**

### High-Frequency Patterns
1. **Verb + Proper Noun:** `جاء محمد`
2. **Verb + Common Noun:** `قال الرجل`
3. **Verb + Pronoun:** `قالوا` (attached pronoun)
4. **Present Tense:** `يقول الرجل`

### Complex Cases
1. **Verb-Subject-Object:** `أكل الرجل التفاح`
2. **Compound Subjects:** Multiple subject coordination
3. **Passive Voice:** Different subject relationship
4. **Modal Verbs:** Auxiliary verb constructions

---

## 🔧 **Integration Points**

### Word-Level Detection
- Operates on aggregated words after morphological analysis
- Handles attached pronouns as integrated with verb
- Maps word-level relationships to segment indices

### Grammar Quiz Integration
- Identifies verb-subject spans for user selection
- Provides grammatical explanations and rules
- Tracks الفعل والفاعل accuracy statistics

---

## 🧪 **Test Cases**

### Basic Verb-Subject
```
Input: "قال الرجل"
Expected: fi3l-fa3il construction (verb: قال, subject: الرجل)
```

### Present Tense
```
Input: "يقول محمد"
Expected: fi3l-fa3il construction (verb: يقول, subject: محمد)
```

### Attached Pronoun
```
Input: "قالوا"
Expected: fi3l-fa3il construction (verb + attached pronoun subject)
```

### Failed Detection
```
Input: "في البيت"
Expected: No construction (no verb present)
```

---

## 🚫 **Non-Subjects (Exclusions)**

### Object Nouns
- Accusative case nouns following verbs
- Should not be identified as subjects

### Adverbial Phrases
- Prepositional phrases modifying verbs
- Temporal or locative expressions

### Vocative Constructions
- `يا` + noun constructions
- Not grammatical subjects

---

## 📖 **Classical Grammar References**

### Ibn Ajurrūmī (الآجرومية)
- Basic الفعل والفاعل identification
- Nominative case requirement for فاعل

### Sībawayhi (الكتاب)
- Advanced verb-subject agreement patterns
- Complex syntactic configurations

### Modern Pedagogical Grammar
- Simplified identification rules
- Contemporary Arabic teaching methods

---

## 🔍 **Advanced Considerations**

### Word Order Variations
- Subject-Verb-Object (SVO) order
- Verb-Subject-Object (VSO) order (standard Arabic)
- Topicalization and focus constructions

### Agreement Features
- Person marking on verbs
- Number marking (singular/dual/plural)
- Gender marking (masculine/feminine)

### Semantic Constraints
- Animate vs. inanimate subjects
- Logical subject-verb compatibility
- Contextual plausibility
