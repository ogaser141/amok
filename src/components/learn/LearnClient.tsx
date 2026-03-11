'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FLASHCARDS, LEVEL_INFO, getCardsByLevel } from '@/lib/content';
import { calculateSRS, getXPForDifficulty } from '@/lib/srs';
import type { Difficulty, Flashcard, Level, UserProfile } from '@/types/database';
import toast from 'react-hot-toast';
import { X, Volume2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  userId: string;
  profile: UserProfile | null;
  existingReviews: Array<{
    card_id: string; ease_factor: number; interval_days: number;
    repetitions: number; next_review_at: string;
  }>;
  initialLevel: Level;
}

type Screen = 'levelSelect' | 'session' | 'complete';
type ExMode = 'flashcard' | 'fillBlank' | 'multipleChoice';

export default function LearnClient({ userId, profile, existingReviews, initialLevel }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [screen, setScreen] = useState<Screen>('levelSelect');
  const [selectedLevel, setSelectedLevel] = useState<Level>(initialLevel);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<ExMode>('flashcard');
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const card = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;
  const li = LEVEL_INFO[selectedLevel];

  function getMode(i: number): ExMode {
    return (['flashcard', 'flashcard', 'multipleChoice', 'flashcard', 'fillBlank'] as ExMode[])[i % 5];
  }

  function startSession(level: Level) {
    const sorted = getCardsByLevel(level).sort((a, b) => {
      const ra = existingReviews.find(r => r.card_id === a.id);
      const rb = existingReviews.find(r => r.card_id === b.id);
      if (!ra && !rb) return 0; if (!ra) return -1; if (!rb) return 1;
      return new Date(ra.next_review_at).getTime() - new Date(rb.next_review_at).getTime();
    });
    setCards(sorted); setIdx(0); setFlipped(false); setInput(''); setChecked(false);
    setSessionXP(0); setSessionCorrect(0); setScreen('session'); setMode(getMode(0));
  }

  useEffect(() => {
    if (card && mode === 'multipleChoice') {
      const others = FLASHCARDS.filter(c => c.id !== card.id && c.level === card.level)
        .sort(() => Math.random() - 0.5).slice(0, 3);
      setMcOptions([...others.map(c => c.back), card.back].sort(() => Math.random() - 0.5));
      setMcSelected(null);
    }
  }, [card, mode]);

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  }

  async function rate(difficulty: Difficulty) {
    if (!card || submitting) return;
    setSubmitting(true);

    const ex = existingReviews.find(r => r.card_id === card.id);
    const srs = calculateSRS(difficulty, ex?.ease_factor, ex?.interval_days, ex?.repetitions);
    const xp = getXPForDifficulty(difficulty);

    await (supabase.from('card_reviews') as any).upsert({
      user_id: userId, card_id: card.id, level: card.level,
      ease_factor: srs.easeFactor, interval_days: srs.intervalDays,
      repetitions: srs.repetitions, next_review_at: srs.nextReviewAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,card_id' });

    const newXP = sessionXP + xp;
    const newCorrect = sessionCorrect + (difficulty !== 'again' ? 1 : 0);
    setSessionXP(newXP); setSessionCorrect(newCorrect);

    if (xp > 0) {
      await supabase.from('profiles')
        .update({ xp: (profile?.xp || 0) + xp, last_study_date: new Date().toISOString() })
        .eq('id', userId);
    }

    if (idx + 1 >= cards.length) {
      const dur = Math.round((Date.now() - sessionStart) / 1000);
      await (supabase.from('study_sessions') as any).insert({
        user_id: userId, level: selectedLevel, exercise_type: 'mixed',
        cards_reviewed: cards.length, correct: newCorrect, xp_earned: newXP, duration_seconds: dur,
      });
      const today = new Date().toDateString();
      const last = profile?.last_study_date ? new Date(profile.last_study_date).toDateString() : null;
      const yest = new Date(Date.now() - 86400000).toDateString();
      const streak = last === today ? profile?.streak_days || 0 : last === yest ? (profile?.streak_days || 0) + 1 : 1;
      await supabase.from('profiles').update({ streak_days: streak, last_study_date: new Date().toISOString() }).eq('id', userId);
      setScreen('complete');
    } else {
      const next = idx + 1;
      setIdx(next); setFlipped(false); setInput(''); setChecked(false); setMode(getMode(next));
    }
    setSubmitting(false);
  }

  function checkFill() {
    if (!card || !input.trim()) return;
    const ok = input.trim().toLowerCase() === card.front.toLowerCase();
    setCorrect(ok); setChecked(true);
    if (ok) toast.success('¡Correcto! 🎉');
  }

  function selectMC(opt: string) {
    if (mcSelected) return;
    setMcSelected(opt); setChecked(true);
    const ok = opt === card?.back;
    setCorrect(ok);
    if (ok) toast.success('¡Correcto! 🎉');
  }

  // ── Level Select ─────────────────────────────────────────────────
  if (screen === 'levelSelect') return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-slide-up">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-500 hover:text-emerald-300 transition-colors mb-8">
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-black text-emerald-100 mb-1">¿Qué quieres estudiar?</h1>
        <p className="text-emerald-600 text-sm mb-8">Elige un nivel para comenzar tu sesión de hoy</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(LEVEL_INFO).map(level => {
            const unlocked = (profile?.xp || 0) >= level.minXP;
            const pending = existingReviews.filter(r =>
              FLASHCARDS.find(c => c.id === r.card_id && c.level === level.id) &&
              new Date(r.next_review_at) <= new Date()
            ).length;
            return (
              <button key={level.id}
                onClick={() => unlocked && startSession(level.id)}
                disabled={!unlocked}
                className={`text-left p-5 rounded-2xl border transition-all ${
                  unlocked
                    ? `${level.bg} ${level.border} hover:scale-[1.02] cursor-pointer`
                    : 'bg-emerald-950/30 border-emerald-900/40 opacity-40 cursor-not-allowed'
                }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex items-center gap-2">
                    {!unlocked && <span className="text-sm">🔒</span>}
                    {unlocked && pending > 0 && (
                      <span className="text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        {pending} pendientes
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-2xl font-black ${level.color}`}>{level.id}</div>
                <div className="font-bold text-emerald-200 mt-0.5">{level.name}</div>
                <div className="text-xs text-emerald-600 mt-1">{level.description}</div>
                <div className="text-xs text-emerald-700 mt-2 font-medium">
                  {level.totalCards} tarjetas · {!unlocked ? `${level.minXP} XP necesarios` : 'Disponible ✓'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Complete ─────────────────────────────────────────────────────
  if (screen === 'complete') {
    const acc = Math.round((sessionCorrect / cards.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-sm w-full mx-auto px-4 text-center animate-pop">
          <div className="text-6xl mb-4">{acc >= 80 ? '🏆' : acc >= 60 ? '🎯' : '📚'}</div>
          <h2 className="text-2xl font-black text-emerald-100 mb-2">¡Sesión completada!</h2>
          <p className="text-emerald-500 mb-8">Excelente trabajo — tu memoria se está fortaleciendo</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { v:`+${sessionXP}`, label:'XP ganados', color:'text-amber-300' },
              { v:`${acc}%`,        label:'Precisión',  color:'text-emerald-300' },
              { v:`${cards.length}`,label:'Tarjetas',   color:'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4">
                <div className={`text-xl font-black ${s.color}`}>{s.v}</div>
                <div className="text-[11px] text-emerald-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => startSession(selectedLevel)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all btn-glow">
              🔄 Estudiar de nuevo
            </button>
            <Link href="/dashboard"
              className="w-full py-3.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold rounded-xl transition-all text-center hover:border-emerald-600/60"
              onClick={() => router.refresh()}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Session ───────────────────────────────────────────────────────
  if (!card) return null;

  const modeLabel = { flashcard:'Tarjeta', fillBlank:'Escribe en inglés', multipleChoice:'Opción múltiple' }[mode];

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setScreen('levelSelect')}
            className="p-2 text-emerald-700 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #059669, #34d399)',
                boxShadow: '0 0 8px rgba(52,211,153,0.4)',
              }} />
          </div>
          <span className="text-xs font-bold text-emerald-600 tabular-nums">{idx + 1}/{cards.length}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{card.category}</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded-full">{modeLabel}</span>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">+{sessionXP} XP</span>
        </div>

        {/* ── FLASHCARD ───────────────────────────────────── */}
        {mode === 'flashcard' && (
          <div className="animate-fade-in">
            <p className="text-center text-xs text-emerald-600 mb-4 font-medium">
              {flipped ? '¿Qué tan bien la recordaste?' : 'Toca la tarjeta para ver la traducción'}
            </p>
            <div className="card-flip cursor-pointer select-none mb-6" onClick={() => !flipped && setFlipped(true)}>
              <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ minHeight: 220 }}>
                {/* Front */}
                <div className="card-front w-full h-full min-h-[220px] bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                  style={{ boxShadow: '0 0 30px rgba(16,185,129,0.05)' }}>
                  <button onClick={e => { e.stopPropagation(); speak(card.front); }}
                    className="mb-4 p-2.5 text-emerald-700 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-3xl font-black text-emerald-100 mb-3">{card.front}</div>
                  <div className="text-xs text-emerald-600 italic">"{card.example}"</div>
                </div>
                {/* Back */}
                <div className="card-back w-full h-full min-h-[220px] bg-emerald-900/20 border border-emerald-500/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center"
                  style={{ boxShadow: '0 0 30px rgba(52,211,153,0.08)' }}>
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Traducción al español</div>
                  <div className="text-3xl font-black text-emerald-300 mb-3">{card.back}</div>
                  <div className="text-xs text-emerald-600 italic">"{card.example_es}"</div>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className="grid grid-cols-4 gap-2">
                {(['again','hard','good','easy'] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => rate(d)} disabled={submitting}
                    className={`py-3.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 ${
                      d === 'again' ? 'bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900/40' :
                      d === 'hard'  ? 'bg-orange-950/60 border border-orange-800/60 text-orange-400 hover:bg-orange-900/40' :
                      d === 'good'  ? 'bg-blue-950/60 border border-blue-800/60 text-blue-400 hover:bg-blue-900/40' :
                                      'bg-emerald-900/40 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-800/40'
                    }`}>
                    {d === 'again' ? '😓 Otra vez' : d === 'hard' ? '😅 Difícil' : d === 'good' ? '😊 Bien' : '🥳 Fácil'}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setFlipped(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all btn-glow">
                Ver traducción →
              </button>
            )}
          </div>
        )}

        {/* ── FILL BLANK ──────────────────────────────────── */}
        {mode === 'fillBlank' && (
          <div className="animate-fade-in">
            <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-center mb-6">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">¿Cómo se dice en inglés?</div>
              <div className="text-2xl font-black text-emerald-100">{card.back}</div>
              <div className="text-xs text-emerald-600 italic mt-2">Pista: "{card.example_es}"</div>
            </div>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !checked && checkFill()}
              disabled={checked} placeholder="Escribe en inglés..." autoFocus
              className={`w-full px-5 py-4 text-center text-lg font-black rounded-2xl border outline-none transition mb-4 ${
                checked
                  ? correct
                    ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300'
                    : 'border-red-700/60 bg-red-950/30 text-red-300'
                  : 'input-field text-center text-lg font-black'
              }`} />
            {checked && !correct && (
              <p className="text-center text-sm text-emerald-600 mb-4">
                Respuesta correcta: <span className="font-black text-emerald-300">{card.front}</span>
              </p>
            )}
            {!checked
              ? <button onClick={checkFill} disabled={!input.trim()}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-40 disabled:shadow-none">
                  Verificar
                </button>
              : <button onClick={() => rate(correct ? 'good' : 'again')} disabled={submitting}
                  className={`w-full py-4 font-black rounded-xl transition-all disabled:opacity-50 ${
                    correct ? 'bg-emerald-600 hover:bg-emerald-500 text-white btn-glow' : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:border-emerald-600/60'
                  }`}>
                  {correct ? '¡Continuar! →' : 'Continuar →'}
                </button>
            }
          </div>
        )}

        {/* ── MULTIPLE CHOICE ─────────────────────────────── */}
        {mode === 'multipleChoice' && (
          <div className="animate-fade-in">
            <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-center mb-6">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Selecciona la traducción correcta</div>
              <button onClick={() => speak(card.front)}
                className="mb-3 p-2.5 text-emerald-700 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors mx-auto block">
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="text-2xl font-black text-emerald-100">{card.front}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mcOptions.map(opt => {
                const sel = mcSelected === opt;
                const isRight = opt === card.back;
                return (
                  <button key={opt} onClick={() => selectMC(opt)} disabled={!!mcSelected}
                    className={`p-4 rounded-xl border font-semibold text-sm transition-all ${
                      checked && isRight  ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300' :
                      checked && sel && !isRight ? 'border-red-700/60 bg-red-950/30 text-red-300' :
                      sel ? 'border-emerald-500/60 bg-emerald-900/20 text-emerald-300' :
                      'border-emerald-900/60 bg-emerald-950/50 text-emerald-300 hover:border-emerald-700/60 hover:bg-emerald-900/30'
                    }`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {checked && (
              <button onClick={() => rate(correct ? 'good' : 'again')} disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-50">
                Continuar →
              </button>
            )}
          </div>
        )}

        <p className="text-center text-xs text-emerald-800 mt-6">
          💡 La repetición espaciada programa cada tarjeta en el momento ideal para recordarla
        </p>
      </div>
    </div>
  );
}
