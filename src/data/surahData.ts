
export const surahData = [
  {
    id: 1,
    name: "Al-Fatiha",
    nameArabic: "الفاتحة",
    verses: [
      {
        id: 1,
        arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        words: [
          { 
            id: "1-1-1", 
            text: "بِسْمِ", 
            segments: [
              { id: "1-1-1-1", text: "بِ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-1-1-2", text: "سْمِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-1-2", 
            text: "ٱللَّهِ", 
            segments: [
              { id: "1-1-2-1", text: "ٱللَّهِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-1-3", 
            text: "ٱلرَّحْمَٰنِ", 
            segments: [
              { id: "1-1-3-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-1-3-2", text: "رَّحْمَٰنِ", morphology: "adjective" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-1-4", 
            text: "ٱلرَّحِيمِ", 
            segments: [
              { id: "1-1-4-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-1-4-2", text: "رَّحِيمِ", morphology: "adjective" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 2,
        arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
        words: [
          { 
            id: "1-2-1", 
            text: "ٱلْحَمْدُ", 
            segments: [
              { id: "1-2-1-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-2-1-2", text: "حَمْدُ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-2-2", 
            text: "لِلَّهِ", 
            segments: [
              { id: "1-2-2-1", text: "لِ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-2-2-2", text: "للَّهِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-2-3", 
            text: "رَبِّ", 
            segments: [
              { id: "1-2-3-1", text: "رَبِّ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-2-4", 
            text: "ٱلْعَٰلَمِينَ", 
            segments: [
              { id: "1-2-4-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-2-4-2", text: "عَٰلَمِينَ", morphology: "noun" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 3,
        arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation: "The Entirely Merciful, the Especially Merciful,",
        words: [
          { 
            id: "1-3-1", 
            text: "ٱلرَّحْمَٰنِ", 
            segments: [
              { id: "1-3-1-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-3-1-2", text: "رَّحْمَٰنِ", morphology: "adjective" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-3-2", 
            text: "ٱلرَّحِيمِ", 
            segments: [
              { id: "1-3-2-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-3-2-2", text: "رَّحِيمِ", morphology: "adjective" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 4,
        arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        translation: "Sovereign of the Day of Recompense.",
        words: [
          { 
            id: "1-4-1", 
            text: "مَٰلِكِ", 
            segments: [
              { id: "1-4-1-1", text: "مَٰلِكِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-4-2", 
            text: "يَوْمِ", 
            segments: [
              { id: "1-4-2-1", text: "يَوْمِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-4-3", 
            text: "ٱلدِّينِ", 
            segments: [
              { id: "1-4-3-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-4-3-2", text: "دِّينِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 5,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translation: "It is You we worship and You we ask for help.",
        words: [
          { 
            id: "1-5-1", 
            text: "إِيَّاكَ", 
            segments: [
              { id: "1-5-1-1", text: "إِيَّاكَ", morphology: "particle" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-5-2", 
            text: "نَعْبُدُ", 
            segments: [
              { id: "1-5-2-1", text: "نَ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-5-2-2", text: "عْبُدُ", morphology: "verb" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-5-3", 
            text: "وَإِيَّاكَ", 
            segments: [
              { id: "1-5-3-1", text: "وَ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-5-3-2", text: "إِيَّاكَ", morphology: "particle" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-5-4", 
            text: "نَسْتَعِينُ", 
            segments: [
              { id: "1-5-4-1", text: "نَ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-5-4-2", text: "سْتَعِينُ", morphology: "verb" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 6,
        arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        translation: "Guide us to the straight path -",
        words: [
          { 
            id: "1-6-1", 
            text: "ٱهْدِنَا", 
            segments: [
              { id: "1-6-1-1", text: "ٱهْدِ", morphology: "verb" as const, type: "root" as const },
              { id: "1-6-1-2", text: "نَا", morphology: "particle" as const, type: "suffix" as const }
            ]
          },
          { 
            id: "1-6-2", 
            text: "ٱلصِّرَٰطَ", 
            segments: [
              { id: "1-6-2-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-6-2-2", text: "صِّرَٰطَ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-6-3", 
            text: "ٱلْمُسْتَقِيمَ", 
            segments: [
              { id: "1-6-3-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-6-3-2", text: "مُسْتَقِيمَ", morphology: "adjective" as const, type: "root" as const }
            ]
          },
        ]
      },
      {
        id: 7,
        arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        words: [
          { 
            id: "1-7-1", 
            text: "صِرَٰطَ", 
            segments: [
              { id: "1-7-1-1", text: "صِرَٰطَ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-7-2", 
            text: "ٱلَّذِينَ", 
            segments: [
              { id: "1-7-2-1", text: "ٱلَّذِينَ", morphology: "particle" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-7-3", 
            text: "أَنْعَمْتَ", 
            segments: [
              { id: "1-7-3-1", text: "أَنْعَمْ", morphology: "verb" as const, type: "root" as const },
              { id: "1-7-3-2", text: "تَ", morphology: "particle" as const, type: "suffix" as const }
            ]
          },
          { 
            id: "1-7-4", 
            text: "عَلَيْهِمْ", 
            segments: [
              { id: "1-7-4-1", text: "عَلَيْ", morphology: "particle" as const, type: "root" as const },
              { id: "1-7-4-2", text: "هِمْ", morphology: "particle" as const, type: "suffix" as const }
            ]
          },
          { 
            id: "1-7-5", 
            text: "غَيْرِ", 
            segments: [
              { id: "1-7-5-1", text: "غَيْرِ", morphology: "particle" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-7-6", 
            text: "ٱلْمَغْضُوبِ", 
            segments: [
              { id: "1-7-6-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-7-6-2", text: "مَغْضُوبِ", morphology: "noun" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-7-7", 
            text: "عَلَيْهِمْ", 
            segments: [
              { id: "1-7-7-1", text: "عَلَيْ", morphology: "particle" as const, type: "root" as const },
              { id: "1-7-7-2", text: "هِمْ", morphology: "particle" as const, type: "suffix" as const }
            ]
          },
          { 
            id: "1-7-8", 
            text: "وَلَا", 
            segments: [
              { id: "1-7-8-1", text: "وَ", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-7-8-2", text: "لَا", morphology: "particle" as const, type: "root" as const }
            ]
          },
          { 
            id: "1-7-9", 
            text: "ٱلضَّآلِّينَ", 
            segments: [
              { id: "1-7-9-1", text: "ٱل", morphology: "particle" as const, type: "prefix" as const },
              { id: "1-7-9-2", text: "ضَّآلِّينَ", morphology: "noun" as const, type: "root" as const }
            ]
          },
        ]
      }
    ]
  }
];
