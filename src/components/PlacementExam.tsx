'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  pickQuestion, updateAdaptiveState, initialAdaptiveState,
  calculatePlacementLevel, TOTAL_QUESTIONS,
  type ExamQuestion, type ExamLevel, type AdaptiveState,
} from '@/lib/exam/adaptiveEngine';
import { Volume2, ChevronRight, SkipForward, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { userId: string; userName: string; }
type Screen = 'intro' | 'exam' | 'result';

const TYPE_LABEL: Record<string, string> = {
  vocabulary:    '📖 Vocabulario',
  grammar:       '✍️ Gramática',
  comprehension: '📄 Comprensión',
  listening:     '🔊 Escucha',
};

const LEVEL_INFO: Record<ExamLevel, { emoji: string; name: string; desc: string; color: string }> = {
  A1: { emoji: '🌱', name: 'Principiante',    color: '#34d399', desc: 'Empezarás con lo más esencial — saludos, números, colores y frases del día a día.' },
  A2: { emoji: '🌿', name: 'Básico',          color: '#10b981', desc: 'Tienes una base sólida. Estudiarás trabajo, viajes, salud y conversaciones cotidianas.' },
  B1: { emoji: '🌳', name: 'Intermedio',      color: '#059669', desc: '¡Buen nivel! Trabajarás con negocios, medio ambiente y gramática avanzada.' },
  B2: { emoji: '🌲', name: 'Intermedio Alto', color: '#047857', desc: 'Nivel avanzado. Matices, conectores complejos y comprensión profunda.' },
  C1: { emoji: '🏔️', name: 'Avanzado',        color: '#065f46', desc: '¡Excelente! Dominas el inglés a nivel casi nativo.' },
};

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
      const en = voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('espeak'));
      if (en) u.voice = en;
    }
    window.speechSynthesis.speak(u);
  };
  if (window.speechSynthesis.getVoices().length > 0) setVoice();
  else window.speechSynthesis.onvoiceschanged = setVoice;
}

export default function PlacementExam({ userId, userName }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [screen, setScreen] = useState<Screen>('intro');
  const [adaptive, setAdaptive] = useState<AdaptiveState>(initialAdaptiveState());
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<ExamQuestion | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<ExamLevel | null>(null);
  const [saving, setSaving] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const startExam = useCallback(() => {
    const state = initialAdaptiveState();
    const first = pickQuestion(state.currentLevel, new Set());
    if (!first) return;
    setAdaptive(state);
    setUsedIds(new Set([first.id]));
    setQuestion(first);
    setQuestionNum(1);
    setSelected(null);
    setConfirmed(false);
    setTotalAnswered(0);
    setResult(null);
    setScreen('exam');
  }, []);

  function confirmAnswer() {
    if (selected === null || !question) return;
    setConfirmed(true);
    setTotalAnswered(t => t + 1);
  }

  function next() {
    if (!question || selected === null) return;
    const correct = selected === question.correct;
    const newState = updateAdaptiveState(adaptive, question, correct);
    setAdaptive(newState);

    const nextNum = questionNum + 1;
    if (nextNum > TOTAL_QUESTIONS) {
      finishExam(newState);
      return;
    }

    const newUsed = new Set([...usedIds, question.id]);
    const nextQ = pickQuestion(newState.currentLevel, newUsed);
    if (!nextQ) {
      finishExam(newState);
      return;
    }

    setUsedIds(newUsed);
    setQuestion(nextQ);
    setQuestionNum(nextNum);
    setSelected(null);
    setConfirmed(false);
  }

  async function finishExam(finalState: AdaptiveState) {
    const level = calculatePlacementLevel(finalState.levelScores);
    setResult(level);
    setAdaptive(finalState);
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

  // ── INTRO ──
  if (screen === 'intro') return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>¡Hola, {userName}!</h1>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Vamos a encontrar tu nivel de inglés</p>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text2)' }}>
          El examen es <strong style={{ color: 'var(--text)' }}>adaptativo</strong> — se ajusta en tiempo real.
          Son <strong style={{ color: 'var(--text)' }}>25 preguntas</strong> de un banco de{' '}
          <strong style={{ color: 'var(--text)' }}>180+</strong>, nunca el mismo examen dos veces. Tarda unos 5-7 minutos.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: '🧠', label: 'Adaptativo',  desc: 'Sube/baja dificultad en tiempo real' },
            { icon: '🔀', label: 'Aleatorio',    desc: 'Banco de 180+ preguntas rotativas' },
            { icon: '📊', label: '5 niveles',   desc: 'Detecta desde A1 hasta C1' },
            { icon: '⚡', label: '25 preguntas', desc: 'Preciso y rápido a la vez' },
          ].map(t => (
            <div key={t.label} className="p-4 rounded-2xl border text-left"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.label}</div>
              <div className="text-xs leading-tight mt-0.5" style={{ color: 'var(--text3)' }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl border mb-6 text-left"
          style={{ background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
            💡 <strong style={{ color: 'var(--text)' }}>¿Cómo funciona?</strong> Empieza en A2.
            Si aciertas 2 seguidas → sube de nivel. Si fallas 2 → baja. Detecta tu techo real.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={startExam}
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

  // ── RESULT ──
  if (screen === 'result' && result) {
    const info = LEVEL_INFO[result];
    const scores = adaptive.levelScores;
    const totalCorrect = Object.values(scores).reduce((a, s) => a + s.correct, 0);
    const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-3">{info.emoji}</div>
          <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--green)' }}>Tu nivel es</p>
          <h1 className="text-6xl font-black mb-1" style={{ color: info.color }}>{result}</h1>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>{info.name}</h2>
          <div className="p-5 rounded-2xl border mb-5 text-left"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{info.desc}</p>
          </div>
          <div className="p-4 rounded-2xl border mb-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-left" style={{ color: 'var(--text3)' }}>
              Resultados por nivel
            </p>
            {(['A1','A2','B1','B2','C1'] as ExamLevel[]).map(lvl => {
              const s = scores[lvl];
              if (s.total === 0) return null;
              const p = Math.round((s.correct / s.total) * 100);
              return (
                <div key={lvl} className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black w-6" style={{ color: LEVEL_INFO[lvl].color }}>{lvl}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: LEVEL_INFO[lvl].color }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-12 text-right" style={{ color: 'var(--text2)' }}>
                    {s.correct}/{s.total}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { v: `${totalCorrect}/${totalAnswered}`, label: 'Correctas', color: 'var(--green)' },
              { v: `${pct}%`,                          label: 'Precisión',  color: info.color },
              { v: result,                             label: 'Nivel CEFR', color: 'var(--text)' },
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
            : <div className="flex flex-col gap-3">
                <button onClick={() => { router.push('/dashboard'); router.refresh(); }}
                  className="w-full py-4 text-white font-black rounded-2xl transition-all btn-glow text-lg"
                  style={{ background: 'var(--green-dark)' }}>
                  Ir a estudiar {result} →
                </button>
                <button onClick={startExam}
                  className="w-full py-3 rounded-2xl font-semibold text-sm transition-all border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
                  🔄 Repetir examen
                </button>
              </div>
          }
        </div>
      </div>
    );
  }

  // ── EXAM ──
  if (!question) return null;
  const progress = ((questionNum - 1) / TOTAL_QUESTIONS) * 100;
  const isListening = question.type === 'listening';
  const isComprehension = question.type === 'comprehension';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))' }} />
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text3)' }}>
            {questionNum}/{TOTAL_QUESTIONS}
          </span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: 'var(--green)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
            {TYPE_LABEL[question.type]}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: LEVEL_INFO[question.level].color, background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            Nivel {question.level}
          </span>
        </div>
        {isComprehension && question.context && (
          <div className="p-4 rounded-2xl border mb-5 text-sm leading-relaxed"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
            {question.context}
          </div>
        )}
        {isListening && question.audio && (
          <div className="text-center mb-5">
            <button onClick={() => speak(question.audio!)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all btn-glow text-white"
              style={{ background: 'var(--green-dark)' }}>
              <Volume2 className="w-4 h-4" />
              Escuchar frase
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>Puedes escucharla varias veces</p>
          </div>
        )}
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>{question.question}</h2>
        <div className="space-y-3 mb-6">
          {question.options.map((opt, i) => {
            let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
            if (selected === i && !confirmed) { bg = 'var(--green-glow)'; border = 'var(--green)'; color = 'var(--green)'; }
            if (confirmed) {
              if (i === question.correct) { bg = 'rgba(16,185,129,0.1)'; border = 'var(--green)'; color = 'var(--green)'; }
              else if (selected === i) { bg = 'rgba(248,113,113,0.08)'; border = 'var(--danger)'; color = 'var(--danger)'; }
            }
            return (
              <button key={i} onClick={() => !confirmed && setSelected(i)} disabled={confirmed}
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
        {!confirmed
          ? <button onClick={confirmAnswer} disabled={selected === null}
              className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-40 disabled:shadow-none"
              style={{ background: 'var(--green-dark)' }}>
              Confirmar respuesta
            </button>
          : <button onClick={next}
              className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow flex items-center justify-center gap-2"
              style={{ background: 'var(--green-dark)' }}>
              {questionNum >= TOTAL_QUESTIONS ? 'Ver mi resultado →' : 'Siguiente'}
              <ChevronRight className="w-4 h-4" />
            </button>
        }
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
          {confirmed && selected === question.correct ? '✅ ¡Correcto! Subiendo dificultad...' :
           confirmed ? '❌ Incorrecto. La dificultad se ajusta automáticamente.' :
           '🧠 El examen se adapta según tus respuestas'}
        </p>
      </div>
    </div>
  );
}
