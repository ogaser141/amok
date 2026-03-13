export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  xp: number;
  streak: number;
  totalWords: number;
  totalSessions: number;
  currentLevel: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session', icon: '🎯', title: 'Primera sesión',    desc: 'Completaste tu primera sesión de estudio',         condition: s => s.totalSessions >= 1 },
  { id: 'first_10',      icon: '📖', title: '10 palabras',       desc: 'Aprendiste tus primeras 10 palabras',               condition: s => s.totalWords >= 10 },
  { id: 'first_50',      icon: '📚', title: '50 palabras',       desc: 'Ya conoces 50 palabras en inglés',                  condition: s => s.totalWords >= 50 },
  { id: 'first_100',     icon: '💯', title: '100 palabras',      desc: '¡100 palabras — impresionante!',                    condition: s => s.totalWords >= 100 },
  { id: 'words_250',     icon: '🧠', title: '250 palabras',      desc: 'Tu vocabulario crece rápidamente',                  condition: s => s.totalWords >= 250 },
  { id: 'words_500',     icon: '🏆', title: '500 palabras',      desc: 'Vocabulario sólido — nivel conversacional básico',  condition: s => s.totalWords >= 500 },
  { id: 'streak_3',      icon: '🔥', title: '3 días seguidos',   desc: 'Estudiaste 3 días consecutivos',                    condition: s => s.streak >= 3 },
  { id: 'streak_7',      icon: '🌟', title: 'Una semana',        desc: '7 días — el hábito está formándose',                condition: s => s.streak >= 7 },
  { id: 'streak_14',     icon: '⚡', title: 'Dos semanas',       desc: '14 días consecutivos — eres constante',             condition: s => s.streak >= 14 },
  { id: 'streak_30',     icon: '👑', title: 'Un mes completo',   desc: '30 días seguidos — maestro de la constancia',       condition: s => s.streak >= 30 },
  { id: 'level_a2',      icon: '🌿', title: 'Nivel A2',          desc: 'Desbloqueaste el nivel Básico',                     condition: s => ['A2','B1','B2','C1','C2'].includes(s.currentLevel) },
  { id: 'level_b1',      icon: '🌳', title: 'Nivel B1',          desc: 'Llegaste al nivel Intermedio',                      condition: s => ['B1','B2','C1','C2'].includes(s.currentLevel) },
  { id: 'level_b2',      icon: '🌲', title: 'Nivel B2',          desc: 'Intermedio Alto — conversas con fluidez',           condition: s => ['B2','C1','C2'].includes(s.currentLevel) },
  { id: 'level_c1',      icon: '🏔️', title: 'Nivel C1',          desc: 'Nivel avanzado — casi nativo',                      condition: s => ['C1','C2'].includes(s.currentLevel) },
  { id: 'xp_500',        icon: '💫', title: '500 XP',            desc: 'Acumulaste 500 puntos de experiencia',              condition: s => s.xp >= 500 },
  { id: 'xp_2000',       icon: '💎', title: '2,000 XP',          desc: 'Tu esfuerzo se nota — 2,000 XP',                    condition: s => s.xp >= 2000 },
  { id: 'xp_5000',       icon: '🚀', title: '5,000 XP',          desc: 'Leyenda — 5,000 puntos de experiencia',             condition: s => s.xp >= 5000 },
  { id: 'sessions_10',   icon: '📅', title: '10 sesiones',       desc: 'Completaste 10 sesiones de estudio',                condition: s => s.totalSessions >= 10 },
  { id: 'sessions_50',   icon: '🎓', title: '50 sesiones',       desc: '50 sesiones — dedicación total',                    condition: s => s.totalSessions >= 50 },
];

export function getNewAchievements(stats: AchievementStats, unlocked: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(a => !unlocked.includes(a.id) && a.condition(stats));
}
