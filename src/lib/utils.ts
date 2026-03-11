import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return String(xp);
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return '¡Buenos días';
  if (h < 18) return '¡Buenas tardes';
  return '¡Buenas noches';
}

export function getMotivation(streak: number): string {
  if (streak === 0) return 'Comienza tu racha hoy 🌱';
  if (streak < 3)   return `${streak} día${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''} — ¡buen inicio! 🔥`;
  if (streak < 7)   return `¡${streak} días de racha! Sigue así 💪`;
  if (streak < 30)  return `¡Increíble! ${streak} días sin parar 🚀`;
  return `¡Leyenda! ${streak} días de dedicación 🏆`;
}
