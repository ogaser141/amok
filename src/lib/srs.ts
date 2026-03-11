import type { Difficulty } from '@/types/database';

export interface SRSResult {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
}

const QUALITY: Record<Difficulty, number> = { again: 0, hard: 2, good: 4, easy: 5 };

export function calculateSRS(
  difficulty: Difficulty,
  currentEF = 2.5,
  currentInterval = 1,
  currentReps = 0,
): SRSResult {
  const q = QUALITY[difficulty];
  let newEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = currentReps + 1;
    newInterval = currentReps === 0 ? 1 : currentReps === 1 ? 6 : Math.round(currentInterval * newEF);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return { easeFactor: Math.round(newEF * 100) / 100, intervalDays: newInterval, repetitions: newReps, nextReviewAt };
}

export function getXPForDifficulty(d: Difficulty): number {
  return { again: 0, hard: 5, good: 10, easy: 15 }[d];
}
