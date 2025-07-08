
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuranHeaderProps {
  surahName: string;
  surahNameArabic: string;
  onSurahChange: (direction: 'prev' | 'next') => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const QuranHeader = ({ 
  surahName, 
  surahNameArabic, 
  onSurahChange, 
  canGoPrev, 
  canGoNext 
}: QuranHeaderProps) => {
  return (
    <header className="bg-[#1a1a1a] px-4 py-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSurahChange('prev')}
          disabled={!canGoPrev}
          className="text-white hover:bg-gray-700 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center flex-1">
          <h1 className="text-lg font-medium text-white mb-1">
            Surah {surahName}
          </h1>
          <p className="text-2xl font-arabic text-[#FFD700]" dir="rtl">
            سورة {surahNameArabic}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-700"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSurahChange('next')}
            disabled={!canGoNext}
            className="text-white hover:bg-gray-700 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
