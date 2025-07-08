
import { useState, useEffect } from 'react';
import { masaqParser } from '@/utils/masaqParser';
import { MASAQDataset, EnhancedMorphologicalDetails } from '@/types/masaq';
import { MorphologicalDetails } from '@/types/morphology';

export const useMASAQData = () => {
  const [dataset, setDataset] = useState<MASAQDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDataset = async (csvContent: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedDataset = await masaqParser.loadDataset(csvContent);
      setDataset(loadedDataset);
      console.log('MASAQ dataset loaded successfully:', loadedDataset.metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load MASAQ dataset';
      setError(errorMessage);
      console.error('Error loading MASAQ dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceSegment = (
    segment: MorphologicalDetails,
    surah: number,
    verse: number,
    wordIndex: number,
    segmentIndex: number
  ): EnhancedMorphologicalDetails => {
    return masaqParser.enhanceSegmentWithMASAQ(segment, surah, verse, wordIndex, segmentIndex);
  };

  const getEntryByLocation = (surah: number, verse: number, word: number, segment: number) => {
    return masaqParser.getEntryByLocation(surah, verse, word, segment);
  };

  const getCoverageStats = () => {
    if (!dataset) return null;
    
    return {
      totalEntries: dataset.metadata.totalEntries,
      coveredSurahs: dataset.metadata.coverage.surahs.length,
      totalWords: dataset.metadata.coverage.totalWords,
      totalSegments: dataset.metadata.coverage.totalSegments
    };
  };

  // Auto-load dataset from public folder on mount
  useEffect(() => {
    const loadPublicDataset = async () => {
      try {
        const response = await fetch('/MASAQ.csv');
        if (response.ok) {
          const csvContent = await response.text();
          await loadDataset(csvContent);
        } else {
          console.warn('MASAQ.csv not found in public folder');
        }
      } catch (err) {
        console.warn('Could not auto-load MASAQ dataset:', err);
      }
    };

    loadPublicDataset();
  }, []);

  return {
    dataset,
    isLoading,
    error,
    loadDataset,
    enhanceSegment,
    getEntryByLocation,
    getCoverageStats
  };
};
