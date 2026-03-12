'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getExamQuestions, calculatePlacementLevel, type ExamQuestion } from '@/lib/examQuestions';
import { Volume2, ChevronRight, SkipForward, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { userId: string; userName: string; }

type Screen = 'intro' | 'exam' | 'result';

const TYPE_LABEL: Record<string, string> = {
  vocabulary:    '📖 Vocabulario',
  grammar:       '✍️ Gramática',
  comprehension: '📄 Comprensión',
  listening:     '🔊 Escucha',
};

const LEVEL_INFO_EXAM = {
  A1: { emoji: '🌱', name: 'Principiante',    desc: 'Empezarás con lo más esencial — saludos, números, colores y frases básicas del día a día.', color: '#34d399' },
  A2: { emoji: '🌿', name: 'Básico',          desc: 'Tienes una base sólida. Estudiarás vocabulario de trabajo, viajes, salud y conversaciones cotidianas.', color: '#10b981' },
  B1: { emoji: '🌳', name: 'Intermedio',      desc: '¡Buen nivel! Trabajarás con temas más complejos: negocios, medio ambiente, gramática avanzada.', color: '#059669' },
  B2: { emoji: '🌲', name: 'Intermedio Alto', desc: 'Tienes un nivel avanzado. Te enfocarás en matices, conectores complejos y comprensión profunda.', color: '#047857' },
};

export default function PlacementExam({ userId, userName }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [screen, setScreen] = useState<Screen>('intro');
  const [questions] = useState<ExamQuestion[]>(() => getExamQuestions());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<'A1' | 'A2' | 'B1' | 'B2' | null>(null);

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;
  const answered = Object.keys(answers).length;

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.82; u.pitch = 1;
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ['Samantha', 'Alex', 'Karen', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name));
        if (v) { u.voice = v; break; }
      }
      if (!u.voice) {
        const en = voices.find(v => v.lang.startsWith('en'));
        if (en) u.voice = en;
      }
      window.speechSynthesis.speak(u);
    };
    if (window.speechSynthesis.getVoices().length > 0) setVoice();
    else window.speechSynthesis.onvoiceschanged = setVoice;
  }

  function selectAnswer(idx: number) {
    if (confirmed) return;
    setSelected(idx);
  }

  function confirmAnswer() {
    if (selected === null) return;
    setAnswers(prev => ({ ...prev, [question.id]: selected }));
    setConfirmed(true);
  }

  function next() {
    if (current + 1 >= questions.length) {
      finishExam();
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  async function finishExam() {
    const finalAnswers = confirmed
      ? { ...answers, [question.id]: selected! }
      : answers;

    const level = calculatePlacementLevel(finalAnswers);
    setResult(level);
    setScreen('result');
    setSaving(true);

    await (supabase.from('profiles') as any)
      .update({ current_level: level })
      .eq('id', userId);

    setSaving(false);
    toast.success(`Nivel detectado: ${level} 🎯`);
  }

  async function skipExam() {
    await (supabase.from('profiles') as any)
      .update({ current_level: 'A1' })
      .eq('id', userId);
    router.push('/dashboard');
    router.refresh();
  }

  async function goToDashboard() {
    router.push('/dashboard');
    router.refresh();
  }

  // ── INTRO ──────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>
          ¡Hola, {userName}!
        </h1>
        <p className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Antes de empezar, vamos a encontrar tu nivel de inglés
        </p>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text2)' }}>
          El examen tiene <strong style={{ color: 'var(--text)' }}>30 preguntas</strong> de vocabulario, gramática, comprensión y escucha.
          Tarda unos <strong style={{ color: 'var(--text)' }}>5-8 minutos</strong> y detectará si estás en A1, A2, B1 o B2.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '📖', label: 'Vocabulario',   desc: '8 preguntas' },
            { icon: '✍️', label: 'Gramática',     desc: '11 preguntas' },
            { icon: '📄', label: 'Comprensión',   desc: '4 preguntas' },
            { icon: '🔊', label: 'Escucha',       desc: '4 preguntas' },
          ].map(t => (
            <div key={t.label} className="p-4 rounded-2xl border text-left"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.label}</div>
              <div className="text-xs" style={{ color: 'var(--text3)' }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => setScreen('exam')}
            className="w-full py-4 text-white font-black rounded-2xl transition-all btn-glow text-lg"
            style={{ background: 'var(--green-dark)' }}>
            🚀 Comenzar examen
          </button>
          <button onClick={skipExam}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-all border flex items-center justify-center gap-2"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }}>
            <SkipForward className="w-4 h-4" />
            Saltar — empezar desde A1
          </button>
        </div>
      </div>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────
  if (screen === 'result' && result) {
    const info = LEVEL_INFO_EXAM[result];
    const correct = Object.entries(answers).filter(([id, ans]) => {
      const q = questions.find(q => q.id === id);
      return q && q.correct === ans;
    }).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-3">{info.emoji}</div>
          <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--green)' }}>
            Tu nivel es
          </p>
          <h1 className="text-6xl font-black mb-1" style={{ color: info.color }}>{result}</h1>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>{info.name}</h2>

          <div className="p-5 rounded-2xl border mb-6 text-left"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{info.desc}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { v: `${correct}/${total}`, label: 'Correctas',   color: 'var(--green)' },
              { v: `${pct}%`,             label: 'Precisión',   color: info.color },
              { v: result,                label: 'Nivel CEFR',  color: 'var(--text)' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.v}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {saving
            ? <div className="flex items-center justify-center gap-2 py-4" style={{ color: 'var(--text3)' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Guardando tu nivel...</span>
              </div>
            : <button onClick={goToDashboard}
                className="w-full py-4 text-white font-black rounded-2xl transition-all btn-glow text-lg"
                style={{ background: 'var(--green-dark)' }}>
                Ir a estudiar {result} →
              </button>
          }
        </div>
      </div>
    );
  }

  // ── EXAM ───────────────────────────────────────────────────
  if (!question) return null;
  const isListening = question.type === 'listening';
  const isComprehension = question.type === 'comprehension';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))' }} />
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text3)' }}>
            {current + 1}/{questions.length}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: 'var(--green)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
            {TYPE_LABEL[question.type]}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: 'var(--text3)', background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            Nivel {question.level}
          </span>
        </div>

        {/* Comprehension passage */}
        {isComprehension && question.context && (
          <div className="p-4 rounded-2xl border mb-5 text-sm leading-relaxed"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
            {question.context}
          </div>
        )}

        {/* Listening audio button */}
        {isListening && question.audio && (
          <div className="text-center mb-5">
            <button onClick={() => speak(question.audio!)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all btn-glow text-white"
              style={{ background: 'var(--green-dark)' }}>
              <Volume2 className="w-4 h-4" />
              Escuchar frase
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
              Puedes escucharla varias veces antes de responder
            </p>
          </div>
        )}

        {/* Question */}
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt, i) => {
            let bg = 'var(--surface)';
            let border = 'var(--border)';
            let color = 'var(--text)';
            if (selected === i && !confirmed) {
              bg = 'var(--green-glow)'; border = 'var(--green)'; color = 'var(--green)';
            }
            if (confirmed) {
              if (i === question.correct) {
                bg = 'rgba(16,185,129,0.1)'; border = 'var(--green)'; color = 'var(--green)';
              } else if (selected === i) {
                bg = 'rgba(248,113,113,0.08)'; border = 'var(--danger)'; color = 'var(--danger)';
              }
            }
            return (
              <button key={i} onClick={() => selectAnswer(i)} disabled={confirmed}
                className="w-full text-left p-4 rounded-xl border font-medium text-sm transition-all"
                style={{ background: bg, borderColor: border, color }}>
                <span className="font-black mr-3" style={{ color: confirmed && i === question.correct ? 'var(--green)' : 'var(--text3)' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Action button */}
        {!confirmed
          ? <button onClick={confirmAnswer} disabled={selected === null}
              className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-40 disabled:shadow-none"
              style={{ background: 'var(--green-dark)' }}>
              Confirmar respuesta
            </button>
          : <button onClick={next}
              className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow flex items-center justify-center gap-2"
              style={{ background: 'var(--green-dark)' }}>
              {current + 1 >= questions.length ? 'Ver mi resultado →' : 'Siguiente pregunta'}
              <ChevronRight className="w-4 h-4" />
            </button>
        }

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
          {answered} de {questions.length} respondidas
        </p>
      </div>
    </div>
  );
}
