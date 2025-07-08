/**
 * Quiz Settings Component - Allows users to configure quiz preferences
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Play } from 'lucide-react';
import { QuizSettings as QuizSettingsType } from '../types/quiz';

interface QuizSettingsProps {
  onStartQuiz: (settings: Partial<QuizSettingsType>) => void;
  className?: string;
}

export function QuizSettings({ onStartQuiz, className }: QuizSettingsProps) {
  const [settings, setSettings] = useState<Partial<QuizSettingsType>>({
    difficulty: 'mixed',
    questionCount: 10,
    showExplanations: true,
    randomizeOptions: true
  });

  const handleStartQuiz = () => {
    onStartQuiz(settings);
  };

  return (
    <Card className={className}>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select 
              value={settings.difficulty} 
              onValueChange={(value) => setSettings({...settings, difficulty: value as any})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label htmlFor="questionCount">
              Number of Questions: {settings.questionCount}
            </Label>
            <Slider
              value={[settings.questionCount || 10]}
              onValueChange={(value) => setSettings({...settings, questionCount: value[0]})}
              max={20}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="explanations">Show Explanations</Label>
              <p className="text-sm text-muted-foreground">
                Display detailed explanations after each answer
              </p>
            </div>
            <Switch
              id="explanations"
              checked={settings.showExplanations}
              onCheckedChange={(checked) => setSettings({...settings, showExplanations: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="randomize">Randomize Options</Label>
              <p className="text-sm text-muted-foreground">
                Shuffle answer choices for each question
              </p>
            </div>
            <Switch
              id="randomize"
              checked={settings.randomizeOptions}
              onCheckedChange={(checked) => setSettings({...settings, randomizeOptions: checked})}
            />
          </div>
        </div>

        {/* Difficulty Description */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Difficulty Guide</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div><strong>Beginner:</strong> Common verbs with basic pronouns</div>
            <div><strong>Intermediate:</strong> More complex verbs and dual forms</div>
            <div><strong>Advanced:</strong> Advanced verbs with all pronoun types</div>
            <div><strong>Mixed:</strong> Combination of all difficulty levels</div>
          </div>
        </div>

        {/* Start Button */}
        <Button 
          onClick={handleStartQuiz} 
          size="lg" 
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
