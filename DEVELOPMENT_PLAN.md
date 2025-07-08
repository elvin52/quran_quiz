
# Quran Grammar Learning App – Development Plan

This plan outlines the development of a cross-platform mobile Quran app with word-by-word Quran text and rich morphological analysis grounded in classical Arabic grammar (as in the uploaded "Dream Textbook"). The app will integrate accurate Quran text (Arabic) and at least one English translation, highlight grammar (with color codes), and provide interactive explanations of each word's morphology (POS, إعراب (status), root, tense, gender, number, light/heavy form, flexibility, etc.). Basic features include search, bookmarks, and verse navigation. The design will emphasize educational clarity, progressive learning, and a visually engaging interface distinct from corpus.quran.com.

## Key Features

### Word-by-Word Verse Display
Show each Quran verse in Arabic (Uthmani script) with parallel English translation (e.g. Sahih International or another open-license translation). Words are individually tappable.

### Morphological Details
For a tapped word, display its morphology: part of speech (اسم/فعل/حرف), إعراب (case/status: رفع/نصب/جر or sentence-role), root letters, verb form (ماضٍ/مضارع/أمر and verb form I–XII), person-gender-number, and noun attributes (gender, number, definiteness). Indicate "light (مرفوع خفيف)" vs "heavy (مرفوع ثقيل)" form and flexibility class (fully-flexible معرب, non-flexible مبني, or partially-flexible). These follow the Dream Textbook principles.

### Interactive Grammar Explanations
Grammar terms (e.g. nominative, "مرفوع") are clickable/hintable, opening concise definitions or Dream-Textbook–style explanations. Users can drill into concepts (e.g. tapping "نصب" shows a pop-up or sidebar definition). This preserves context without leaving the verse.

### Color-Coded Grammar
Use consistent color-coding by grammatical category. For example:
- Verbs (أفعال) in one color
- Nouns (أسماء) in another
- Particles (حروف) in a third

Optionally highlight case endings or sentence roles. Root-based color schemes (like GoodTree's Root'd app) show main grammar modes and functions. The app should allow toggling color schemes or focusing on one rule at a time (e.g. show only verbs in color, or all grammar simultaneously).

### Vocabulary & Lexicon References
Link each word to a dictionary entry (from an open Quranic lexicon or resource like Lisan al-Quran). At minimum, show a brief meaning or usage note for rare words. This helps users connect form to meaning.

### Search & Navigation
Full-text search (Arabic and English), including filtering by root or part of speech. Verse navigation by surah/ayah number, plus "next/previous" controls. Possibly "jump to Surah" dropdown.

### Bookmarks & Notes
Users can bookmark verses/words for later review, and add short notes. Bookmarks sync locally (offline) with tags. As seen in other Quran apps, bookmarking is expected.

### User Settings
Adjust font size, toggle vowel marks, switch color themes (including high-contrast modes). Toggle display of translations or romanization.

### Performance & Offline Use
All core data (Quran text, morphology, translations) should be bundled or locally stored so the app works offline. (Search and heavy processing will be local.)

## Information Architecture for Morphology Explanations

### Word Entry Model
For each word token, store attributes:
- **text** (Arabic, fully vowelized)
- **root** (three/four root letters)
- **POS** (اسم, فعل, حرف)
- **Case/Status** (رفع/نصب/جر for nominals, plus sentence-role tag like "Mubtada'/Khabar/Harfi Idafa", etc)
- **Light/Heavy** (خفيـف or ثقـيل or N/A)
- **Flexibility** (معرب, ممنوع من الصرف, مبني – if applicable)
- **Number** (singular/dual/plural)
- **Gender** (masculine/feminine)
- **Definiteness** (def/indef)
- **Type** (for nouns: fraction, etc).
- **Verb specifics** (if POS=فعل: tense (ماضي/مضارع/أمر), verb form (I-XII باب), number/gender of subject, form (sound/broken plural)).
- **Particle specifics** (e.g. حروف نصب/عطف/etc) if POS=حرف.
- **English gloss/translation** snippet, notes (e.g. common usage).
- **Reference links** to relevant grammar rules (e.g. "Status: رفع → see إعراب" chapter).

### UI Presentation
When a word is tapped, display a panel (sheet or side pane) with sections:

#### Basic Info
Arabic word, root, translation, lemma.

#### Morphology
List fields, e.g.:
- "Part of Speech: Noun (اسم)"
- "Case: Nominative (مرفوع – رفع)"
- "Number: Singular"
- "Gender: Masc"
- "Light/Heavy: Heavy (ثقيل)"
- "Flexibility: Fully-flexible (معرب)"

For verbs:
- "Tense: Past (ماضٍ)"
- "Form: I (فعل)"
- "Person/Number: 3rd person sing. masc."

#### Grammar Terms
Each term ("مرفوع", "معرب", etc.) is a tappable info icon showing the Dream Textbook–style definition. E.g. tapping "مرفوع" shows: "Linguistically, رفع means the nominative status, indicated by a ضمة on singular. This word is nominative because...."

#### Examples/Drills (Advanced)
Optionally, show example Arabic sentences illustrating that form, or a quick grammar drill, to reinforce learning (like Dream's drills). This could be a future enhancement.

### Glossary/Grammar Hub
In addition to per-word info, include a separate "Grammar" or "Glossary" section in the app, listing key concepts from the Dream Textbook (e.g. light/heavy forms, flexibility, parts of speech). Each concept page can have more in-depth explanation and examples, referenced when needed.

## UX/UI Design Principles

### Color-Coding for Intuition
Assign consistent colors for categories (e.g. blue for verbs, gold for nouns, green for particles). This lets users see patterns. For example, spotting all green words (particles) in a verse at a glance. Root'd in Quran highlights "grammar rules [with] color coding organized by grammar modes and word function", an approach our app can emulate. Provide a legend or toggle to explain the scheme.

### Tap-Driven Exploration
The reading interface is passive until the user taps a word. This avoids overwhelming beginners with labels. Tapping should be fluid, showing info without modal pop-ups that obscure context. Possibly a sliding panel or bottom sheet that partially covers the verse, so users still see surrounding text.

### Micro-Learning Interactions
Each interaction (tap → see one or two facts) is a small learning moment. Over time, repeated exposure to patterns (e.g. every time the user taps a plural noun, they see "مرفوع (رفع)" and note the -ون suffix) builds intuition organically. We avoid presenting full grammar lectures upfront.

### Use of Familiar Layouts
Many Quran apps (e.g. Quran.com's app) use swiping pages or surah lists. We should adopt standard usability for familiarity. For example, swiping horizontally to change surah, vertical lists for surah index, etc. However, the word analysis view is unique and should feel like an educational overlay rather than a static page.

### Visual Distinctiveness
To differ from corpus.quran.com's academic style, employ a clean, modern mobile UI (flat design, readable fonts). Use illustrative icons (e.g. a quill for "نصب") or simple diagrams. Animations (e.g. color-highlighting a tapped word) can draw attention to grammar roles. Avoid clutter: show only necessary data with "Learn more" links.

### Theme & Accessibility
Support dark/light themes and text scaling for readability. Use high-contrast text. Color-blind users can toggle color patterns (e.g. texture patterns instead of colors).

### Reinforcement through Repetition
Optionally implement "words of the day" or daily verse highlighting to encourage repeated use. Though quizzes are out of scope now, small gamified hints (e.g. "Today's grammar challenge: find all مرفوع words") could be a future idea.

## Data and Backend Architecture

### Text & Translations
- Use a verified Quran text and reliable English translation. Tanzil provides a carefully checked Uthmani Quran text under CC BY 3.0. We should bundle the Tanzil Uthmani XML/UTF-8 text (from Tanzil's downloads) or use their APIs for retrieval.
- For English, choose an open-license translation. Options include Pickthall or Yusuf Ali (likely public domain) or Mustafa Khattab's "Clear Quran" (CC BY-NC perhaps), or collect from Tanzil's list (they have multiple). (Ensure compliance: Tanzil translations are for non-commercial use or CC-BY-NC-ND.) We must give credit to any translation source (as Tanzil requires linking back).
- Consider including multiple translations if license permits, to enrich study.

### Morphological Database
- Leverage the Quranic Arabic Corpus dataset. It provides gold-standard part-of-speech tags, root, and morphological features for every word of the Quran (iʿrāb, case, etc.) under a GNU license. The corpus is available for download and provides a JSON or XML of each word's analysis. We can embed this data (respecting the corpus's license and citation request) in the app.
- Use JQuranTree or similar libraries for Arabic text processing. JQuranTree (Java) uses Tanzil text and supports tokenization, transliteration, and some analysis. It can map words to tokens and align with corpus data. (It already integrates the Tanzil Uthmani text and can be used to navigate chapters/verses.)
- Store data in a local database (e.g. SQLite) or in structured JSON assets. The schema should relate Surah→Ayah→Word index. Each word record includes all morphological fields listed above. Index on root and word-form for search.

### Vocabulary
Integrate a Quranic lexicon like Lisan al-Quran (if accessible as an API or data) or build a small glossary. As a fallback, use a basic English-Arabic dictionary for common words.

### Server/API (if any)
- The app can be fully offline with bundled data; no backend needed for core features. However, plan an optional thin API layer: e.g. for updates, checking new content or remote logging (privacy concerns aside, likely minimal).
- Could use Tarteel's QUL (Quranic Universal Library) as a backend resource source. QUL offers a centralized repository of Quran text, translations, and possibly annotations (though it doesn't explicitly list morphology, it may provide easy downloading of text data). "QUL is a library of Quranic content… open-source and community-driven". We could fetch curated data from QUL instead of manual bundling.

### Architecture Summary
- **Data Layer**: Local DB/JSON with Quran text and morphology (from Tanzil + Corpus).
- **Logic Layer**: Model classes (Ayah, Word) use JQuranTree (or custom parser) to map UI taps to data.
- **UI Layer**: Verse viewer, Word detail panels.

## Libraries, APIs, and Resources

### Core Resources
- **Quran Text**: Tanzil project (verified Uthmani text, CC BY 3.0). Use their XML/JSON.
- **Morphology Data**: Quranic Arabic Corpus (GPL license). Possibly use their Java API (JQuranTree) or direct data dumps.
- **English Translation**: Use an open translation. Tanzil lists many; e.g. Pickthall or Arberry (public domain).
- **Lexicons**: Lisan al-Quran (if open), or Hamza Academy's resources (Lisan al-Arab english index), or Tarteel's dictionaries.

### Technical Stack
- **Mobile Framework**: React Native (as Abbas Haider's app uses) or Flutter/Dart (for rich UI). Both support iOS/Android.
- **UI Components**: Material/Metal design libraries, Arabic-supporting text widgets. For rendering Arabic with diacritics, ensure font support.
- **Color Tools**: Use libraries like Palette or custom CSS for consistent color theming.
- **Search/Index**: SQLite FTS (full-text search) on Arabic and translations.

### Open-source Examples
- **QuranicMorphology app** (React Native) uses corpus.quran.com data (source code: github.com/Abbas1997/QuranicMorphology). We can review their data parsing.
- **Quran.tools** by Andy Bannister (https://github.com/andygbannister/qurantools) for search and analysis tools.
- **apito/quran-api**: There are Quran REST APIs (e.g. api.quran.com) but they might not expose morphology. We rely on local data.

### Fonts
Uthmanic fonts like Scheherazade or Madani for readability.

## UX Ideas for Intuitive Grammar Exploration

### Layered Highlighting
As the user taps different toggles (e.g. "Highlight all nouns"), the verse text re-colors accordingly. This lets users see grammar in context.

### Inflection Mode
Long-press a word to "morph" it: e.g. show a menu of possible cases for that noun (like Dream's charts). Selecting a case redraws the word's ending in the light/heavy form. This interactive exercise reinforces learning.

### Tooltips & Mini-Lessons
On first use, brief tutorials can show e.g. "Tap a word to see its root, tense, etc.". Also, on encountering a new grammar term (e.g. first time "معرب"), prompt user "This means 'fully declinable' – tap for details."

### Search by Grammar
Allow searching by root or part-of-speech. E.g., "show all plural nouns in Al-Baqarah" – the search results list each verse with highlights.

### Progress Tracking
If desired later, track which new vocabulary or grammar rules the user has viewed to suggest revisiting forgotten concepts.

## Implementation Steps

### 1. Prototype & Design
- Sketch UI flows: Surah list → Verse view → Word detail panel.
- Design color schemes for POS (can adapt Root'd palette).
- Develop wireframes showing how word info is presented and how panels open.

### 2. Data Preparation
- Download Tanzil Uthmani Quran text and chosen translation(s).
- Download Quranic Arabic Corpus database (full morphology annotations). Parse into a convenient format (JSON or SQLite).
- If needed, preprocess JQuranTree to align tokens (tokenization can be tricky; Corpus should include segmentation). Verify token indices match Tanzil text.

### 3. Backend/Data Layer
- Implement local database schema (Surah, Ayah, Word).
- Load Quran text and morphology into the database.
- Create APIs in code to query: get verse text + words, get word info (all morphological fields).
- Implement search indexing (e.g. SQLite FTS on Arabic without diacritics, and English translation).

### 4. Core App (Cross-Platform Framework)
- Set up project (React Native or Flutter). Include necessary packages (e.g. SQLite plugin).
- Implement Verse Reader screen: display Arabic text (with color spans) and English below. Ensure right-to-left rendering for Arabic.
- Enable verse navigation (tap to move verses, open Surah list).
- Add Search UI and logic to query text/root.
- Add Bookmark logic (local storage of verse IDs or word IDs). UI: bookmark icon.

### 5. Word Interaction
- Capture taps on each word. Show Word Detail panel: fill in data from DB.
- Format fields per the information architecture: label + value, inflection highlight.
- Link grammar terms to glossary pop-ups or pages.
- Add color highlighting of the tapped word's grammar role (e.g. underline or bold).

### 6. Design Polish
- Apply color palette. Provide settings to toggle highlighting (e.g. switch "Grammar mode").
- Optimize typography for readability.
- Add UI animations (slide panel, highlight transitions).

### 7. Content and Education
- Populate glossary/grammar pages with summaries from the Dream Textbook (in English). E.g. short descriptions of إعراب, light/heavy.
- Create a "Help" section describing color codes and how to use interactive features.

### 8. Testing & Feedback
- Conduct user testing with learners: Are explanations clear? Is interface intuitive?
- Iterate UI based on feedback.

### 9. Launch & Maintenance
- Release on iOS App Store and Google Play. Note: need to comply with GPL (disclose source of corpus data) and display license/citations as required.
- Monitor for bugs and plan for updates (e.g. adding more translation languages, audio features, etc.).

## Legal and Attribution Requirements

Throughout development, we should cite sources and acknowledge datasets:
- "Quran text from Tanzil (CC BY)"
- "Morphological data from Quranic Arabic Corpus (GPL)"

Using existing open resources (Quranic Corpus, Tanzil, QUL) will greatly accelerate the backend work.

## Notes for Current Implementation

The current prototype already implements:
- ✅ Basic verse display with Arabic text and English translation
- ✅ Word segmentation with morphological analysis
- ✅ Color-coding for different parts of speech (nouns, verbs, particles, adjectives)
- ✅ Interactive word tapping to highlight segments
- ✅ Responsive design with dark theme

Next steps should focus on:
- [ ] Implementing the word detail panel/drawer
- [ ] Adding comprehensive morphological information display
- [ ] Implementing search functionality
- [ ] Adding bookmarks and navigation features
- [ ] Expanding the dataset beyond Al-Fatiha
