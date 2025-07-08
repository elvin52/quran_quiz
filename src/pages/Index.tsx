
import { useState, useEffect } from "react";
import { QuranHeader } from "@/components/QuranHeader";
import { QuranText } from "@/components/QuranText";
import { BottomNavigation } from "@/components/BottomNavigation";
import { surahData } from "@/data/surahData";
import { useMASAQData } from "@/hooks/useMASAQData";

const Index = () => {
  const [currentSurah, setCurrentSurah] = useState(1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { dataset, isLoading, error, enhanceSegment, getEntryByLocation, getCoverageStats } = useMASAQData();

  const handleWordTap = (wordId: string) => {
    setSelectedWord(selectedWord === wordId ? null : wordId);
  };

  const handleSurahChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSurah > 1) {
      setCurrentSurah(currentSurah - 1);
    } else if (direction === 'next' && currentSurah < 114) {
      setCurrentSurah(currentSurah + 1);
    }
  };

  // Test MASAQ implementation
  useEffect(() => {
    if (dataset) {
      console.log('=== MASAQ DATASET TESTING ===');
      console.log('Dataset loaded successfully:', dataset.metadata);
      
      // Show first 5 entries as sample
      console.log('Sample MASAQ entries (first 5):');
      dataset.entries.slice(0, 5).forEach((entry, index) => {
        console.log(`Entry ${index + 1}:`, {
          location: `${entry.surah}:${entry.verse}:${entry.word}:${entry.segment}`,
          form: entry.form,
          pos: entry.pos,
          lemma: entry.lemma,
          root: entry.root,
          features: {
            case: entry.case,
            gender: entry.gender,
            number: entry.number,
            tense: entry.tense,
            voice: entry.voice
          }
        });
      });

      // Test coverage stats
      const stats = getCoverageStats();
      console.log('Coverage Statistics:', stats);

      // Test specific entry lookup
      const testEntry = getEntryByLocation(1, 1, 1, 1);
      console.log('Test entry lookup (1:1:1:1):', testEntry);

      // Test segment enhancement
      const sampleSegment = {
        id: 'test-segment',
        text: 'بِسْمِ',
        morphology: 'noun' as const,
        type: 'root' as const,
        case: 'genitive' as const
      };

      const enhanced = enhanceSegment(sampleSegment, 1, 1, 1, 1);
      console.log('Enhanced segment example:', {
        original: sampleSegment,
        enhanced: {
          ...enhanced,
          masaqData: enhanced.masaqData ? 'Present' : 'Not found'
        }
      });

      console.log('=== END MASAQ TESTING ===');
    } else if (error) {
      console.error('MASAQ dataset error:', error);
    } else if (isLoading) {
      console.log('MASAQ dataset loading...');
    } else {
      console.log('MASAQ dataset not yet initialized');
    }
  }, [dataset, error, isLoading, enhanceSegment, getEntryByLocation, getCoverageStats]);

  const currentSurahData = surahData.find(s => s.id === currentSurah);

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col">
      <QuranHeader 
        surahName={currentSurahData?.name || "Al-Fatiha"}
        surahNameArabic={currentSurahData?.nameArabic || "الفاتحة"}
        onSurahChange={handleSurahChange}
        canGoPrev={currentSurah > 1}
        canGoNext={currentSurah < 114}
      />
      
      {/* MASAQ Status Display */}
      <div className="px-4 py-2 bg-gray-800 text-sm">
        {isLoading && (
          <div className="text-yellow-400">Loading MASAQ dataset...</div>
        )}
        {error && (
          <div className="text-red-400">MASAQ Error: {error}</div>
        )}
        {dataset && (
          <div className="text-green-400">
            MASAQ Dataset: {dataset.metadata.totalEntries} entries loaded 
            (Check console for detailed results)
          </div>
        )}
      </div>
      
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <QuranText 
          verses={currentSurahData?.verses || []}
          selectedWord={selectedWord}
          onWordTap={handleWordTap}
        />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
