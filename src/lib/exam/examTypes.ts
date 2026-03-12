export type QuestionType = 'vocabulary' | 'grammar' | 'comprehension' | 'listening';
export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  level: ExamLevel;
  question: string;
  options: string[];
  correct: number;
  audio?: string;
  context?: string;
}

export interface AdaptiveState {
  currentLevel: ExamLevel;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  levelScores: Record<ExamLevel, { correct: number; total: number }>;
}
