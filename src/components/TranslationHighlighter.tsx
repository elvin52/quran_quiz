
import { enhancedSegments } from '@/data/enhancedSegmentData';
import { cn } from '@/lib/utils';

interface TranslationHighlighterProps {
  translation: string;
  highlightedSegments: string[];
  verseId: number;
}

// Enhanced translation mapping with more precise correlations
const createTranslationMapping = () => {
  const mapping: Record<string, string[]> = {
    // Verse 1 - Bismillah (In the name of Allah, the Entirely Merciful, the Especially Merciful)
    "1-1-1-1": ["in"], // بِ -> in/with/by
    "1-1-1-2": ["name"], // سْمِ -> name
    "1-1-2-1": ["Allah"], // ٱللَّهِ -> Allah
    "1-1-3-2": ["Entirely", "Merciful"], // رَّحْمَٰنِ -> Entirely Merciful
    "1-1-4-2": ["Especially", "Merciful"], // رَّحِيمِ -> Especially Merciful
    
    // Verse 2 - Al-Hamdulillah ([All] praise is [due] to Allah, Lord of the worlds)
    "1-2-1-2": ["praise"], // حَمْدُ -> praise
    "1-2-2-1": ["to"], // لِ -> to
    "1-2-2-2": ["Allah"], // لَّهِ -> Allah
    "1-2-3-1": ["Lord"], // رَبِّ -> Lord
    "1-2-4-2": ["worlds"], // عَٰلَمِينَ -> worlds
    
    // Verse 3 - Ar-Rahman Ar-Raheem (The Entirely Merciful, the Especially Merciful)
    "1-3-1-2": ["Entirely", "Merciful"], // رَّحْمَٰنِ -> Entirely Merciful
    "1-3-2-2": ["Especially", "Merciful"], // رَّحِيمِ -> Especially Merciful
    
    // Verse 4 - Maliki Yawm ad-Deen (Sovereign of the Day of Recompense)
    "1-4-1-1": ["Sovereign"], // مَٰلِكِ -> Sovereign
    "1-4-2-1": ["Day"], // يَوْمِ -> Day
    "1-4-3-2": ["Recompense"], // دِّينِ -> Recompense
    
    // Verse 5 - Iyyaka na'budu (It is You we worship and You we ask for help)
    "1-5-1-1": ["You"], // إِيَّاكَ -> You
    "1-5-2-2": ["worship"], // عْبُدُ -> worship
    "1-5-3-2": ["You"], // إِيَّاكَ -> You
    "1-5-4-2": ["help"], // سْتَعِينُ -> help (ask for help)
    
    // Verse 6 - Ihdinas-sirat (Guide us to the straight path)
    "1-6-1-1": ["Guide"], // ٱهْدِ -> Guide
    "1-6-1-2": ["us"], // نَا -> us
    "1-6-2-2": ["path"], // صِّرَٰطَ -> path
    "1-6-3-2": ["straight"], // مُسْتَقِيمَ -> straight
    
    // Verse 7 - Long verse about the path
    "1-7-1-1": ["path"], // صِرَٰطَ -> path
    "1-7-2-1": ["those"], // ٱلَّذِينَ -> those
    "1-7-3-1": ["bestowed"], // أَنْعَمْ -> bestowed
    "1-7-4-1": ["upon"], // عَلَيْ -> upon
    "1-7-5-1": ["not"], // غَيْرِ -> not
    "1-7-6-2": ["anger"], // مَغْضُوبِ -> anger (those who evoked anger)
    "1-7-9-2": ["astray"] // ضَّآلِّينَ -> astray
  };
  
  return mapping;
};

export const TranslationHighlighter = ({
  translation,
  highlightedSegments,
  verseId
}: TranslationHighlighterProps) => {
  if (highlightedSegments.length === 0) {
    return (
      <div className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
        {translation}
      </div>
    );
  }

  const translationMapping = createTranslationMapping();

  // Get all words that should be highlighted based on active segments
  const wordsToHighlight = new Set<string>();
  highlightedSegments.forEach(segmentId => {
    const correlatedWords = translationMapping[segmentId];
    if (correlatedWords) {
      correlatedWords.forEach(word => wordsToHighlight.add(word.toLowerCase()));
    }
  });

  console.log('Highlighted segments:', highlightedSegments);
  console.log('Words to highlight:', Array.from(wordsToHighlight));

  // Split translation into words and highlight matching ones
  const words = translation.split(/(\s+|[^\w\s]+)/);
  const highlightedTranslation = words.map((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    const shouldHighlight = wordsToHighlight.has(cleanWord);
    
    if (shouldHighlight && cleanWord.length > 0) {
      return (
        <span
          key={index}
          className={cn(
            "relative inline-block transition-all duration-500",
            "bg-[#FFD700]/20 text-[#FFD700] px-1 py-0.5 rounded-sm",
            "border-b-2 border-[#FFD700]/50",
            "shadow-sm",
            "animate-[pulse_3s_ease-in-out_infinite]"
          )}
          style={{
            textShadow: '0 0 6px rgba(255, 215, 0, 0.2)'
          }}
        >
          {word}
        </span>
      );
    }
    
    return <span key={index}>{word}</span>;
  });

  return (
    <div className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
      {highlightedTranslation}
    </div>
  );
};
