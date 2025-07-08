# Grammar Construction Quiz Implementation

## Overview
Interactive quiz game for practicing identification of Arabic grammatical constructions, specifically:
- **Mudaf–Mudaf Ilayh (إضافة)** - Possessive/genitive constructions
- **Jar–Majroor (حرف جر والمجرور)** - Prepositional phrases

## Feature Requirements
- Display Arabic sentences/fragments with clickable/selectable words
- User selects word spans and chooses grammatical relationship type
- Immediate validation against internal parser results
- Feedback with correct answers and grammatical explanations
- Progress tracking with response time analytics
- Session logging and data export

## Existing Infrastructure Leveraged
- **IdafaDetector**: Comprehensive Mudaf–Mudaf Ilayh detection with certainty levels
- **relationshipDetector**: Jar-Majroor detection with preposition parsing
- **Morphological analysis**: Full word-level grammatical information
- **UI components**: Existing typography and Arabic text rendering

## Data Structures

### QuizQuestion
```typescript
interface GrammarQuizQuestion {
  id: string;
  fragment: string;           // Arabic text fragment
  segments: MorphologicalDetails[];  // Parsed word segments
  correctAnswers: GrammarConstruction[];  // All valid constructions
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sourceReference?: string;   // Quranic reference if applicable
}
```

### GrammarConstruction
```typescript
interface GrammarConstruction {
  id: string;
  type: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  spans: number[];            // Word indices in the construction
  roles: string[];            // Role of each word (mudaf, mudaf-ilayh, jar, majroor)
  certainty: 'definite' | 'probable' | 'inferred';
  explanation: string;        // Grammatical rule explanation
}
```

### UserSelection
```typescript
interface UserSelection {
  selectedIndices: number[];  // User-selected word positions
  relationshipType: 'mudaf-mudaf-ilayh' | 'jar-majroor';
  timestamp: Date;
}
```

### QuizSession
```typescript
interface GrammarQuizSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  questions: QuestionResult[];
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    averageResponseTime: number;
    accuracy: number;
  };
}

interface QuestionResult {
  questionId: string;
  fragment: string;
  userSelection: UserSelection;
  correctAnswers: GrammarConstruction[];
  isCorrect: boolean;
  responseTime: number;
  timestamp: Date;
}
```

## UI Components Architecture

### Core Components
1. **GrammarQuizPage** - Main quiz container
2. **FragmentDisplay** - Clickable Arabic text renderer
3. **RelationshipSelector** - Construction type picker
4. **FeedbackPanel** - Answer validation and explanation
5. **ProgressTracker** - Score and timing display
6. **SessionSummary** - Results and analytics

### User Interaction Flow
1. Display Arabic fragment with selectable words
2. User clicks words to select span
3. User chooses relationship type from dropdown
4. Submit button validates selection
5. Immediate feedback with correct/incorrect indication
6. Show explanation and correct answer highlighting
7. Progress to next question

## Implementation Phases

### Phase 1: Core Quiz Engine
- [x] Research existing parsing infrastructure
- [ ] Create data structures and interfaces
- [ ] Implement quiz question generator
- [ ] Build answer validation logic

### Phase 2: UI Components
- [ ] Create clickable Arabic text component
- [ ] Build relationship selection interface
- [ ] Implement feedback and explanation display
- [ ] Add progress tracking UI

### Phase 3: Session Management
- [ ] Implement quiz session persistence
- [ ] Add response time tracking
- [ ] Create session analytics
- [ ] Build export functionality

### Phase 4: Integration & Testing
- [ ] Integrate with main application routing
- [ ] Add navigation and accessibility features
- [ ] Comprehensive testing of all constructions
- [ ] Performance optimization

## Technical Implementation Notes

### Parser Integration
- Use existing `IdafaDetector.detectIdafaConstructions()` for Mudaf–Mudaf Ilayh
- Use existing `detectJarMajrurRelationships()` for prepositional phrases
- Combine parser results to generate quiz questions
- Cache parsed results for performance

### Validation Logic
- Compare user selections against parser-identified constructions
- Account for multiple valid answers per question
- Handle partial credit for close approximations
- Provide detailed explanations for incorrect answers

### Data Persistence
- Store quiz sessions in localStorage
- Export session data as JSON
- Track user progress over time
- Maintain question bank for repeated practice

## Future Extensions
- Additional grammatical relationships (Mawsuf-Sifah, etc.)
- Difficulty progression system
- Custom question sets
- Multiplayer competition mode
- Integration with broader learning curriculum

## Documentation Requirements
Per operational directives, this document will be updated after each implementation phase with:
- Architectural decisions and rationale
- Implementation insights and edge cases
- Testing procedures and results
- Performance considerations
- User feedback integration
