# Role-Based Grammatical Constructions

## Overview

The Grammar Quiz now supports advanced Arabic grammatical constructions that involve role-based relationships between words. These constructions go beyond simple positional grammar (like Mudaf–Mudaf Ilayh) to analyze the functional roles that words play in sentences.

## Supported Constructions

### 1. Fiʿl–Fāʿil (فِعْل - فَاعِل)
**Verb-Subject Relationship**

The Fiʿl–Fāʿil construction identifies the relationship between:
- **Fiʿl (فِعْل)**: The verb/action
- **Fāʿil (فَاعِل)**: The doer/subject of the action

#### Examples:
- **نَعْبُدُ** (we worship) + **إِيَّاكَ** (You) 
  - *نَعْبُدُ* = Fiʿl (verb)
  - *implied "we"* = Fāʿil (subject)
  - *إِيَّاكَ* = direct object

- **أَنْعَمْتَ** (You bestowed) + **عَلَيْهِمْ** (upon them)
  - *أَنْعَمْتَ* = Fiʿl (verb) 
  - *أنت* (implied "You") = Fāʿil (subject)

#### Recognition Patterns:
- **Explicit Subject**: When the subject is clearly stated
- **Implicit Subject**: When the subject is implied by verb conjugation
- **Pronoun Attachment**: When subject pronouns are attached to verbs

### 2. Harf Naṣb–Ismuha (حَرْف نَصْب - اسْمُهَا)
**Accusative Particle and Its Noun**

This construction identifies relationships involving particles that cause nouns to be in the accusative case:

- **Harf Naṣb (حَرْف نَصْب)**: Accusative-causing particle
- **Ismuha (اسْمُهَا)**: The noun affected by the particle

#### Common Accusative Particles:
- **إِنَّ** - "Indeed/Verily" 
- **أَنَّ** - "That"
- **كَأَنَّ** - "As if"
- **لَيْتَ** - "Would that"
- **لَعَلَّ** - "Perhaps"

#### Examples:
- **إِنَّ اللَّهَ** (Indeed Allah)
  - *إِنَّ* = Harf Naṣb (accusative particle)
  - *اللَّهَ* = Ismuha (noun in accusative case)

#### Recognition Patterns:
- Particle immediately followed by accusative noun
- Noun shows accusative case markers (fatḥah/tanwīn fatḥ)
- Semantic emphasis or assertion function

## Quiz Interaction

### How to Select Role-Based Constructions:

1. **Read the verse carefully** to understand the grammatical relationships
2. **Identify the construction type** (Fiʿl–Fāʿil or Harf Naṣb–Ismuha)
3. **Select the primary element** (verb or particle)
4. **Select the related element** (subject or affected noun)
5. **Choose the relationship type** from the dropdown

### Validation Logic:

The quiz validates your selection based on:
- **Morphological analysis** of selected words
- **Positional relationships** between elements
- **Grammatical role compatibility**
- **Semantic coherence** of the relationship

### Scoring:

- **100 points**: Perfect identification of both elements and relationship
- **Partial credit**: Correct identification of one element or relationship type
- **Feedback**: Detailed explanations for incorrect selections

## Advanced Features

### Role Detection Algorithm:

The system uses sophisticated linguistic analysis to:
1. Parse morphological details of each word
2. Identify verb conjugations and their implied subjects
3. Detect accusative-causing particles and their effects
4. Match semantic roles with syntactic positions

### Learning Support:

- **Real-time feedback** on selection accuracy
- **Detailed explanations** of grammatical relationships
- **Progress tracking** for each construction type
- **Difficulty progression** from simple to complex examples

## Technical Implementation

### Data Structure:
```typescript
interface RoleBasedRelationship {
  id: string;
  type: 'fi3l-fa3il' | 'harf-nasb-ismuha';
  primaryRole: GrammaticalRole;
  secondaryRole: GrammaticalRole;
  primaryIndices: number[];
  secondaryIndices: number[];
  certainty: 'definite' | 'probable' | 'possible';
  explanation: string;
}
```

### Validation Process:
1. **Extract morphological details** from selected segments
2. **Identify grammatical roles** (verb, subject, particle, object)
3. **Match against known patterns** for each construction type
4. **Calculate confidence score** based on linguistic evidence
5. **Provide detailed feedback** with corrections and explanations

## Educational Benefits

### For Students:
- **Interactive learning** of advanced Arabic grammar
- **Immediate feedback** on grammatical analysis
- **Progressive difficulty** building expertise gradually
- **Real Quranic examples** providing authentic context

### For Teachers:
- **Objective assessment** of grammatical understanding
- **Detailed analytics** on student performance patterns
- **Curriculum support** for advanced Arabic grammar topics
- **Authentic materials** from classical Arabic texts

## Next Steps

This role-based construction system provides a foundation for:
- **Additional constructions** (Mubtada–Khabar, Ḥāl, Tamyīz)
- **Complex sentence analysis** with multiple relationships
- **Advanced morphological parsing** with enhanced accuracy
- **Personalized learning paths** based on performance analytics

---

*This documentation covers the newly implemented role-based grammatical constructions in the Quranic Grammar Glow quiz system. For technical details, see the source code in `src/utils/grammarQuizEngine.ts` and related files.*
