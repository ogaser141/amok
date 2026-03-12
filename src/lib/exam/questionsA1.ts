import type { ExamQuestion } from './examTypes';

export const A1_QUESTIONS: ExamQuestion[] = [
  // ── VOCABULARIO (10) ───────────────────────────────────────
  {
    id: 'v_a1_01', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Hello"?',
    options: ['Adiós', 'Hola', 'Por favor', 'Gracias'],
    correct: 1,
  },
  {
    id: 'v_a1_02', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "agua" en inglés?',
    options: ['Milk', 'Juice', 'Water', 'Coffee'],
    correct: 2,
  },
  {
    id: 'v_a1_03', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Big"?',
    options: ['Pequeño', 'Rápido', 'Grande', 'Bonito'],
    correct: 2,
  },
  {
    id: 'v_a1_04', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "madre" en inglés?',
    options: ['Sister', 'Mother', 'Father', 'Brother'],
    correct: 1,
  },
  {
    id: 'v_a1_05', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Red"?',
    options: ['Azul', 'Verde', 'Rojo', 'Amarillo'],
    correct: 2,
  },
  {
    id: 'v_a1_06', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "perro" en inglés?',
    options: ['Cat', 'Bird', 'Dog', 'Fish'],
    correct: 2,
  },
  {
    id: 'v_a1_07', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Open"?',
    options: ['Cerrar', 'Abrir', 'Pagar', 'Comprar'],
    correct: 1,
  },
  {
    id: 'v_a1_08', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "casa" en inglés?',
    options: ['School', 'House', 'Park', 'Store'],
    correct: 1,
  },
  {
    id: 'v_a1_09', type: 'vocabulary', level: 'A1',
    question: '¿Qué significa "Happy"?',
    options: ['Triste', 'Enojado', 'Cansado', 'Feliz'],
    correct: 3,
  },
  {
    id: 'v_a1_10', type: 'vocabulary', level: 'A1',
    question: '¿Cómo se dice "uno" en inglés?',
    options: ['Two', 'Three', 'One', 'Four'],
    correct: 2,
  },

  // ── GRAMÁTICA (10) ─────────────────────────────────────────
  {
    id: 'g_a1_01', type: 'grammar', level: 'A1',
    question: 'Completa: "I ___ a student."',
    options: ['are', 'is', 'am', 'be'],
    correct: 2,
  },
  {
    id: 'g_a1_02', type: 'grammar', level: 'A1',
    question: 'Completa: "She ___ a dog."',
    options: ['have', 'has', 'had', 'having'],
    correct: 1,
  },
  {
    id: 'g_a1_03', type: 'grammar', level: 'A1',
    question: 'Completa: "They ___ my friends."',
    options: ['is', 'am', 'are', 'be'],
    correct: 2,
  },
  {
    id: 'g_a1_04', type: 'grammar', level: 'A1',
    question: 'Completa: "This ___ my book."',
    options: ['are', 'is', 'am', 'be'],
    correct: 1,
  },
  {
    id: 'g_a1_05', type: 'grammar', level: 'A1',
    question: '¿Cuál es la forma correcta?',
    options: ['I likes cats', 'I like cats', 'I liking cats', 'I liked cats'],
    correct: 1,
  },
  {
    id: 'g_a1_06', type: 'grammar', level: 'A1',
    question: 'Completa: "He ___ to school every day."',
    options: ['go', 'goes', 'going', 'gone'],
    correct: 1,
  },
  {
    id: 'g_a1_07', type: 'grammar', level: 'A1',
    question: 'Completa: "___ you from Colombia?"',
    options: ['Do', 'Is', 'Are', 'Am'],
    correct: 2,
  },
  {
    id: 'g_a1_08', type: 'grammar', level: 'A1',
    question: 'Completa: "There ___ a cat on the table."',
    options: ['are', 'be', 'is', 'am'],
    correct: 2,
  },
  {
    id: 'g_a1_09', type: 'grammar', level: 'A1',
    question: '¿Cómo preguntas el nombre de alguien?',
    options: ['What is your name?', 'How is your name?', 'Where is your name?', 'Who your name is?'],
    correct: 0,
  },
  {
    id: 'g_a1_10', type: 'grammar', level: 'A1',
    question: 'Completa: "I ___ not hungry."',
    options: ['does', 'do', 'am', 'are'],
    correct: 2,
  },

  // ── COMPRENSIÓN (6) ────────────────────────────────────────
  {
    id: 'c_a1_01', type: 'comprehension', level: 'A1',
    context: 'My name is Tom. I am eight years old. I have a cat. Her name is Luna.',
    question: '¿Cuántos años tiene Tom?',
    options: ['6 años', '7 años', '8 años', '9 años'],
    correct: 2,
  },
  {
    id: 'c_a1_02', type: 'comprehension', level: 'A1',
    context: 'Anna has three apples and two oranges. She likes fruit very much.',
    question: '¿Cuántas manzanas tiene Anna?',
    options: ['Dos', 'Tres', 'Cuatro', 'Cinco'],
    correct: 1,
  },
  {
    id: 'c_a1_03', type: 'comprehension', level: 'A1',
    context: 'The sky is blue. The grass is green. The sun is yellow and hot.',
    question: '¿De qué color es el cielo?',
    options: ['Verde', 'Amarillo', 'Rojo', 'Azul'],
    correct: 3,
  },
  {
    id: 'c_a1_04', type: 'comprehension', level: 'A1',
    context: 'Pedro is a doctor. He works in a hospital. He helps sick people every day.',
    question: '¿Dónde trabaja Pedro?',
    options: ['En una escuela', 'En una tienda', 'En un hospital', 'En casa'],
    correct: 2,
  },
  {
    id: 'c_a1_05', type: 'comprehension', level: 'A1',
    context: 'I wake up at seven in the morning. I eat breakfast and go to school.',
    question: '¿A qué hora se despierta?',
    options: ['A las seis', 'A las siete', 'A las ocho', 'A las nueve'],
    correct: 1,
  },
  {
    id: 'c_a1_06', type: 'comprehension', level: 'A1',
    context: 'Sara loves music. She plays the guitar every Saturday with her brother.',
    question: '¿Cuándo toca Sara la guitarra?',
    options: ['Todos los días', 'Los viernes', 'Los sábados', 'Los domingos'],
    correct: 2,
  },

  // ── ESCUCHA (4) ────────────────────────────────────────────
  {
    id: 'l_a1_01', type: 'listening', level: 'A1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'Good morning',
    options: ['Good night', 'Good afternoon', 'Good morning', 'Goodbye'],
    correct: 2,
  },
  {
    id: 'l_a1_02', type: 'listening', level: 'A1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'My name is Carlos',
    options: ['Her name is Carlos', 'My name is Carlos', 'His name is Carlo', 'Our name is Carlos'],
    correct: 1,
  },
  {
    id: 'l_a1_03', type: 'listening', level: 'A1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'I have two cats',
    options: ['I have one cat', 'She has two cats', 'I have two cats', 'I have two dogs'],
    correct: 2,
  },
  {
    id: 'l_a1_04', type: 'listening', level: 'A1',
    question: 'Escucha y selecciona lo que escuchaste:',
    audio: 'The book is on the table',
    options: ['The book is under the table', 'The pen is on the table', 'The book is on the chair', 'The book is on the table'],
    correct: 3,
  },
];
