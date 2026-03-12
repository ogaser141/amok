export type QuestionType = 'vocabulary' | 'grammar' | 'comprehension' | 'listening';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  question: string;
  options: string[];
  correct: number; // index of correct option
  audio?: string;  // text to speak (for listening type)
  context?: string; // reading passage for comprehension
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // ── A1 VOCABULARY (4) ──────────────────────────────────────
  {
    id: 'v_a1_1', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Hello"?',
    options: ['Adiós', 'Hola', 'Por favor', 'Gracias'],
    correct: 1,
  },
  {
    id: 'v_a1_2', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "agua" en inglés?',
    options: ['Milk', 'Juice', 'Water', 'Coffee'],
    correct: 2,
  },
  {
    id: 'v_a1_3', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Big"?',
    options: ['Pequeño', 'Rápido', 'Grande', 'Bonito'],
    correct: 2,
  },
  {
    id: 'v_a1_4', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "madre" en inglés?',
    options: ['Sister', 'Mother', 'Father', 'Brother'],
    correct: 1,
  },

  // ── A1 GRAMMAR (2) ─────────────────────────────────────────
  {
    id: 'g_a1_1', type: 'grammar', level: 'A1',
    question: 'Completa: "I ___ a student."',
    options: ['are', 'is', 'am', 'be'],
    correct: 2,
  },
  {
    id: 'g_a1_2', type: 'grammar', level: 'A1',
    question: 'Completa: "She ___ a dog."',
    options: ['have', 'has', 'had', 'having'],
    correct: 1,
  },

  // ── A1 LISTENING (1) ───────────────────────────────────────
  {
    id: 'l_a1_1', type: 'listening', level: 'A1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'Good morning',
    options: ['Good night', 'Good afternoon', 'Good morning', 'Goodbye'],
    correct: 2,
  },

  // ── A2 VOCABULARY (3) ──────────────────────────────────────
  {
    id: 'v_a2_1', type: 'vocabulary', level: 'A2',
    question: '¿Qué significa "Expensive"?',
    options: ['Barato', 'Caro', 'Bonito', 'Nuevo'],
    correct: 1,
  },
  {
    id: 'v_a2_2', type: 'vocabulary', level: 'A2',
    question: '¿Cómo se dice "reunión" en inglés?',
    options: ['Party', 'Meeting', 'Class', 'Show'],
    correct: 1,
  },
  {
    id: 'v_a2_3', type: 'vocabulary', level: 'A2',
    question: '¿Qué significa "Tired"?',
    options: ['Feliz', 'Enojado', 'Cansado', 'Ocupado'],
    correct: 2,
  },

  // ── A2 GRAMMAR (3) ─────────────────────────────────────────
  {
    id: 'g_a2_1', type: 'grammar', level: 'A2',
    question: 'Completa: "What ___ you doing right now?"',
    options: ['do', 'did', 'are', 'were'],
    correct: 2,
  },
  {
    id: 'g_a2_2', type: 'grammar', level: 'A2',
    question: 'Completa: "I ___ to the supermarket yesterday."',
    options: ['go', 'goes', 'went', 'gone'],
    correct: 2,
  },
  {
    id: 'g_a2_3', type: 'grammar', level: 'A2',
    question: 'Completa: "There ___ many people at the party."',
    options: ['is', 'was', 'were', 'are'],
    correct: 2,
  },

  // ── A2 COMPREHENSION (1) ───────────────────────────────────
  {
    id: 'c_a2_1', type: 'comprehension', level: 'A2',
    context: 'Maria works in a hospital. She starts at 8am and finishes at 4pm. She likes her job but it is very busy.',
    question: '¿A qué hora termina María su trabajo?',
    options: ['A las 8am', 'A las 12pm', 'A las 4pm', 'A las 6pm'],
    correct: 2,
  },

  // ── A2 LISTENING (1) ───────────────────────────────────────
  {
    id: 'l_a2_1', type: 'listening', level: 'A2',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'I am going to the airport tomorrow',
    options: [
      'I went to the airport yesterday',
      'I am going to the airport tomorrow',
      'She is going to the station today',
      'We went to the airport last week',
    ],
    correct: 1,
  },

  // ── B1 VOCABULARY (3) ──────────────────────────────────────
  {
    id: 'v_b1_1', type: 'vocabulary', level: 'B1',
    question: '¿Qué significa "Deadline"?',
    options: ['Inicio', 'Fecha límite', 'Descanso', 'Reunión'],
    correct: 1,
  },
  {
    id: 'v_b1_2', type: 'vocabulary', level: 'B1',
    question: '¿Qué significa "To achieve"?',
    options: ['Fracasar', 'Intentar', 'Lograr', 'Comenzar'],
    correct: 2,
  },
  {
    id: 'v_b1_3', type: 'vocabulary', level: 'B1',
    question: '¿Cómo se dice "investigación" en inglés?',
    options: ['Discovery', 'Research', 'Study', 'Analysis'],
    correct: 1,
  },

  // ── B1 GRAMMAR (3) ─────────────────────────────────────────
  {
    id: 'g_b1_1', type: 'grammar', level: 'B1',
    question: 'Completa: "If I ___ more time, I would travel more."',
    options: ['have', 'had', 'will have', 'having'],
    correct: 1,
  },
  {
    id: 'g_b1_2', type: 'grammar', level: 'B1',
    question: 'Completa: "She has been working here ___ five years."',
    options: ['since', 'for', 'ago', 'during'],
    correct: 1,
  },
  {
    id: 'g_b1_3', type: 'grammar', level: 'B1',
    question: 'Completa: "The report ___ by the manager last week."',
    options: ['wrote', 'was written', 'has written', 'writes'],
    correct: 1,
  },

  // ── B1 COMPREHENSION (1) ───────────────────────────────────
  {
    id: 'c_b1_1', type: 'comprehension', level: 'B1',
    context: 'Climate change is one of the biggest challenges of our time. Scientists agree that human activities, especially burning fossil fuels, are the main cause. Governments around the world are working on solutions, but progress is slow.',
    question: '¿Cuál es la causa principal del cambio climático según el texto?',
    options: [
      'Los gobiernos del mundo',
      'Las actividades humanas, especialmente quemar combustibles fósiles',
      'El progreso lento de las soluciones',
      'Los científicos del mundo',
    ],
    correct: 1,
  },

  // ── B1 LISTENING (1) ───────────────────────────────────────
  {
    id: 'l_b1_1', type: 'listening', level: 'B1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'The deadline for the project has been moved to next Friday',
    options: [
      'The deadline for the project is this Monday',
      'The project was completed last Friday',
      'The deadline for the project has been moved to next Friday',
      'The meeting has been cancelled until further notice',
    ],
    correct: 2,
  },

  // ── B2 VOCABULARY (3) ──────────────────────────────────────
  {
    id: 'v_b2_1', type: 'vocabulary', level: 'B2',
    question: '¿Qué significa "Nevertheless"?',
    options: ['Por lo tanto', 'Sin embargo', 'Además', 'Por ejemplo'],
    correct: 1,
  },
  {
    id: 'v_b2_2', type: 'vocabulary', level: 'B2',
    question: '¿Qué significa "Ambiguous"?',
    options: ['Claro', 'Ambiguo', 'Preciso', 'Detallado'],
    correct: 1,
  },
  {
    id: 'v_b2_3', type: 'vocabulary', level: 'B2',
    question: '¿Cómo se dice "sesgo" en inglés?',
    options: ['Trend', 'Bias', 'Fact', 'Opinion'],
    correct: 1,
  },

  // ── B2 GRAMMAR (3) ─────────────────────────────────────────
  {
    id: 'g_b2_1', type: 'grammar', level: 'B2',
    question: 'Completa: "Had she known about the problem, she ___ it sooner."',
    options: ['would fix', 'would have fixed', 'will fix', 'had fixed'],
    correct: 1,
  },
  {
    id: 'g_b2_2', type: 'grammar', level: 'B2',
    question: 'Completa: "Not only ___ late, but he also forgot the documents."',
    options: ['he arrived', 'did he arrive', 'he did arrive', 'arrived he'],
    correct: 1,
  },
  {
    id: 'g_b2_3', type: 'grammar', level: 'B2',
    question: 'Completa: "The new policy ___ to all employees regardless of their position."',
    options: ['applying', 'applied', 'applies', 'apply'],
    correct: 2,
  },

  // ── B2 COMPREHENSION (1) ───────────────────────────────────
  {
    id: 'c_b2_1', type: 'comprehension', level: 'B2',
    context: 'The concept of emotional intelligence, popularized by psychologist Daniel Goleman, refers to the ability to recognize, understand, and manage our own emotions while also being aware of and influencing the emotions of others. Research suggests that emotional intelligence may be a better predictor of professional success than traditional IQ.',
    question: 'Según el texto, ¿qué podría predecir mejor el éxito profesional?',
    options: [
      'El coeficiente intelectual tradicional (IQ)',
      'La inteligencia emocional',
      'Las habilidades técnicas',
      'La experiencia laboral',
    ],
    correct: 1,
  },

  // ── B2 LISTENING (1) ───────────────────────────────────────
  {
    id: 'l_b2_1', type: 'listening', level: 'B2',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'Despite the economic uncertainty, the company managed to increase its revenue by fifteen percent',
    options: [
      'The company failed to meet its revenue targets this quarter',
      'Due to economic growth, profits rose by fifty percent',
      'Despite the economic uncertainty, the company managed to increase its revenue by fifteen percent',
      'The economic situation forced the company to reduce its workforce significantly',
    ],
    correct: 2,
  },
];

// Shuffle and pick 30 questions with good distribution
export function getExamQuestions(): ExamQuestion[] {
  return [...EXAM_QUESTIONS].sort(() => Math.random() - 0.5);
}

// Calculate level based on score per level
export function calculatePlacementLevel(answers: Record<string, number>): 'A1' | 'A2' | 'B1' | 'B2' {
  const levelScores: Record<string, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
  };

  EXAM_QUESTIONS.forEach(q => {
    levelScores[q.level].total++;
    if (answers[q.id] === q.correct) {
      levelScores[q.level].correct++;
    }
  });

  const pct = (level: string) =>
    levelScores[level].total > 0
      ? levelScores[level].correct / levelScores[level].total
      : 0;

  if (pct('B2') >= 0.65) return 'B2';
  if (pct('B1') >= 0.65) return 'B1';
  if (pct('A2') >= 0.65) return 'A2';
  return 'A1';
}
