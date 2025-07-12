/**
 * Quiz Selection Page Component
 * 
 * Allows users to choose between different quiz types.
 * Follows the existing design patterns and maintains consistency.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  Link2, 
  ArrowRight, 
  Clock, 
  Target,
  BookOpen,
  Home,
  Underline
} from 'lucide-react';

interface QuizOption {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const quizOptions: QuizOption[] = [
  {
    id: 'pronouns',
    title: 'Arabic Pronoun Quiz',
    titleArabic: 'اختبار الضمائر العربية',
    description: 'Practice identifying attached pronouns with present-tense verbs. Test your knowledge of Arabic pronoun conjugations.',
    features: ['Verb Conjugation', 'Attached Pronouns', 'Response Timing', 'Performance Analytics'],
    difficulty: 'Intermediate',
    estimatedTime: '5-10 min',
    path: '/quiz/pronouns',
    icon: <Users className="h-8 w-8" />,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  },
  {
    id: 'grammar',
    title: 'Grammar Construction Quiz',
    titleArabic: 'اختبار التراكيب النحوية',
    description: 'Identify Mudaf–Mudaf Ilayh (إضافة) and Jar–Majroor (جار ومجرور) constructions in authentic Quranic verses with visual word marking.',
    features: ['Quranic Verses', 'Visual Word Marking', 'Construction Recognition', 'Detailed Explanations', 'Islamic Learning Context'],
    difficulty: 'Advanced',
    estimatedTime: '10-20 min',
    path: '/quiz/grammar',
    icon: <Link2 className="h-8 w-8" />,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-700'
  }
];

export function QuizSelectionPage() {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Arabic Grammar Quizzes</h1>
            <p className="text-sm text-gray-400">Choose your learning path</p>
          </div>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <Card className="mb-8 bg-[#1a1a1a] border-gray-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#780f00]/10 rounded-full">
                <Brain className="h-12 w-12 text-[#780f00]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Interactive Arabic Grammar Learning
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Master Arabic grammar through hands-on practice and immediate feedback
            </p>
          </CardHeader>
        </Card>

        {/* Quiz Options */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {quizOptions.map((quiz) => (
            <Card 
              key={quiz.id} 
              className="bg-[#1a1a1a] border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${quiz.bgColor} ${quiz.borderColor} border`}>
                      {quiz.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white mb-1">
                        {quiz.title}
                      </CardTitle>
                      <div className="text-right font-arabic text-base text-gray-300" dir="rtl">
                        {quiz.titleArabic}
                      </div>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  {quiz.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {quiz.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-gray-600 text-gray-300"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quiz Info */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Interactive Practice</span>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={() => navigate(quiz.path)}
                  className="w-full bg-[#780f00] text-white hover:bg-[#780f00]/90 font-medium"
                  size="lg"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Quiz
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-[#1a1a1a] border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-white">
                New to Arabic Grammar?
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Start with the Pronoun Quiz to build foundational skills, then advance to Grammar Construction 
                to master complex sentence structures. Each quiz provides detailed explanations to enhance your learning.
              </p>
              <div className="flex justify-center gap-4 text-sm text-gray-500">
                <span>📚 Detailed Explanations</span>
                <span>⏱️ Progress Tracking</span>
                <span>🎯 Immediate Feedback</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
