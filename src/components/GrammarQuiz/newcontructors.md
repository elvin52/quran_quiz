✅ **الموصوف والصفة**

---
The data flows through 4 main stages:

CSV Parsing: 
MASAQ.csv
 → 
MASAQDataset
 via masaqParser.loadDataset()
Segment Enhancement: 
MorphologicalDetails
 → 
EnhancedMorphologicalDetails
 via masaqParser.enhanceSegmentWithMASAQ()
Aggregation: EnhancedMorphologicalDetails[] → AggregatedSegment[] via selectiveAggregationService.aggregateSegments()
Display: AggregatedSegment[] → Visual quiz interface via 
QuranVerseDisplay

## 🟢 1️⃣ الموصوف والصفة (Qualified Noun – Adjective)

### ✅ What is it?

**An adjective describing a preceding noun** agreeing in case, definiteness, number, and gender.
**Example:**

* الصراط المستقيم
* (the straight path)

---

### ✅ Detection Logic

For every adjacent pair of tokens:

✅ **Check:**

1. First token: noun
2. Second token: adjective
3. They agree in:

   * Case (nominative/accusative/genitive)
   * Number (singular/dual/plural)
   * Gender (masculine/feminine)
   * Definiteness

✅ **If true:**
Create a relationship of type:

* **الموصوف والصفة**
* With roles:

  * **موصوف** (qualified noun)
  * **صفة** (adjective)

---

### ✅ Pseudocode Example

```typescript
function detectMawsoofSifah(segments: MorphologicalDetails[]): GrammaticalRelationship[] {
  const relationships: GrammaticalRelationship[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const noun = segments[i];
    const adjective = segments[i + 1];

    if (noun.morphology === 'noun' && adjective.morphology === 'adjective') {
      const agreeCase = noun.case === adjective.case;
      const agreeNumber = noun.number === adjective.number;
      const agreeGender = noun.gender === adjective.gender;
      const agreeDefinite = noun.isDefinite === adjective.isDefinite;

      if (agreeCase && agreeNumber && agreeGender && agreeDefinite) {
        relationships.push({
          id: `mawsoof-sifah-${noun.id}-${adjective.id}`,
          type: 'mawsoof-sifah',
          role: 'mawsoof',
          relatedSegmentId: adjective.id,
          description: `الموصوف والصفة: "${noun.text}" + "${adjective.text}"`
        });
        relationships.push({
          id: `mawsoof-sifah-${adjective.id}-${noun.id}`,
          type: 'mawsoof-sifah',
          role: 'sifah',
          relatedSegmentId: noun.id,
          description: `الموصوف والصفة: "${noun.text}" + "${adjective.text}"`
        });
      }
    }
  }

  return relationships;
}
```

---

### ✅ Data Structure Example

```typescript
export interface GrammaticalRelationship {
  id: string;
  type: 'mawsoof-sifah';
  role: 'mawsoof' | 'sifah';
  relatedSegmentId: string;
  description: string;
}
```

---

## 🟢 2️⃣ الفعل والفاعل (Verb + Subject)

✅ This stays the same.

### ✅ Example:

```typescript
function detectFi3lFa3il(segments: MorphologicalDetails[]): GrammaticalRelationship[] {
  const relationships: GrammaticalRelationship[] = [];

  segments.forEach((verb, index) => {
    if (verb.morphology === 'verb') {
      for (let j = index + 1; j < Math.min(index + 5, segments.length); j++) {
        const candidate = segments[j];
        if (candidate.morphology === 'noun' && candidate.case === 'nominative') {
          relationships.push({
            id: `fi3l-fa3il-${verb.id}-${candidate.id}`,
            type: 'fi3l-fa3il',
            role: 'fi3l',
            relatedSegmentId: candidate.id,
            description: `الفعل والفاعل: "${verb.text}" + "${candidate.text}"`
          });
          relationships.push({
            id: `fi3l-fa3il-${candidate.id}-${verb.id}`,
            type: 'fi3l-fa3il',
            role: 'fa3il',
            relatedSegmentId: verb.id,
            description: `الفعل والفاعل: "${verb.text}" + "${candidate.text}"`
          });
          break;
        }
      }
    }
  });

  return relationships;
}
```

---

## 🟢 3️⃣ Integration Example

In your detection pipeline:

```typescript
detectionCounts['mawsoof-sifah'] = (
  detectionCounts['mawsoof-sifah'] || 0
) + detectMawsoofSifah(verseSegments).length;

detectionCounts['fi3l-fa3il'] = (
  detectionCounts['fi3l-fa3il'] || 0
) + detectFi3lFa3il(verseSegments).length;
```

---

✅ **Recap**
**Now you have:**

* Clean detection logic.
* The Arabic naming you prefer:

  * **الموصوف والصفة**
  * **الفعل والفاعل**
* Clear pseudocode.
* Consistent data modeling.