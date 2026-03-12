import { A1_QUESTIONS } from './questionsA1';
import { A2_QUESTIONS } from './questionsA2';
import { B1_QUESTIONS } from './questionsB1';
import { B2_QUESTIONS } from './questionsB2';
import { C1_QUESTIONS } from './questionsC1';
import type { ExamQuestion, ExamLevel, AdaptiveState, QuestionType } from './examTypes';

export type { ExamQuestion, ExamLevel, AdaptiveState, QuestionType };

const BANK: Record<ExamLevel, ExamQuestion[]> = {
  A1: A1_QUESTIONS,
  A2: A2_QUESTIONS,
  B1: B1_QUESTIONS,
  B2: B2_QUESTIONS,
  C1: C1_QUESTIONS,
};

const LEVEL_ORDER: ExamLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Pick a random question of a given level and type, excluding already used IDs
export function pickQuestion(
  level: ExamLevel,
  usedIds: Set<string>,
  preferType?: QuestionType,
): ExamQuestion | null {
  const pool = BANK[level].filter(q => !usedIds.has(q.id));
  if (pool.length === 0) return null;

  // Try preferred type first
  if (preferType) {
    const typed = pool.filter(q => q.type === preferType);
    if (typed.length > 0) return shuffle(typed)[0];
  }

  return shuffle(pool)[0];
}

// Determine which level to pull from next based on adaptive state
export function getNextLevel(state: AdaptiveState): ExamLevel {
  const idx = LEVEL_ORDER.indexOf(state.currentLevel);

  if (state.consecutiveCorrect >= 2 && idx < LEVEL_ORDER.length - 1) {
    return LEVEL_ORDER[idx + 1];
  }
  if (state.consecutiveWrong >= 2 && idx > 0) {
    return LEVEL_ORDER[idx - 1];
  }
  return state.currentLevel;
}

// Update adaptive state after each answer
export function updateAdaptiveState(
  state: AdaptiveState,
  question: ExamQuestion,
  correct: boolean,
): AdaptiveState {
  const scores = { ...state.levelScores };
  scores[question.level] = {
    correct: scores[question.level].correct + (correct ? 1 : 0),
    total: scores[question.level].total + 1,
  };

  const newConsecCorrect = correct ? state.consecutiveCorrect + 1 : 0;
  const newConsecWrong   = !correct ? state.consecutiveWrong + 1 : 0;

  const nextLevel = getNextLevel({
    ...state,
    consecutiveCorrect: newConsecCorrect,
    consecutiveWrong: newConsecWrong,
  });

  return {
    currentLevel: nextLevel,
    consecutiveCorrect: newConsecCorrect,
    consecutiveWrong: newConsecWrong,
    levelScores: scores,
  };
}

export function initialAdaptiveState(): AdaptiveState {
  return {
    currentLevel: 'A2', // Start at medium difficulty
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    levelScores: {
      A1: { correct: 0, total: 0 },
      A2: { correct: 0, total: 0 },
      B1: { correct: 0, total: 0 },
      B2: { correct: 0, total: 0 },
      C1: { correct: 0, total: 0 },
    },
  };
}

// Calculate final placement level from scores
export function calculatePlacementLevel(
  scores: Record<ExamLevel, { correct: number; total: number }>
): ExamLevel {
  const pct = (lvl: ExamLevel) =>
    scores[lvl].total > 0 ? scores[lvl].correct / scores[lvl].total : 0;

  // Weight: higher levels count more. Must score 60%+ to be placed there.
  if (scores['C1'].total >= 3 && pct('C1') >= 0.65 && pct('B2') >= 0.60) return 'C1';
  if (scores['B2'].total >= 4 && pct('B2') >= 0.65 && pct('B1') >= 0.55) return 'B2';
  if (scores['B1'].total >= 4 && pct('B1') >= 0.65 && pct('A2') >= 0.55) return 'B1';
  if (scores['A2'].total >= 3 && pct('A2') >= 0.60) return 'A2';
  return 'A1';
}

export const TOTAL_QUESTIONS = 25; // Adaptive: 25 is enough with this algorithm
