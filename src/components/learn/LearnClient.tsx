'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FLASHCARDS, LEVEL_INFO, getCardsByLevel } from '@/lib/content';
import { calculateSRS, getXPForDifficulty } from '@/lib/srs';
import type { Difficulty, Flashcard, Level, UserProfile } from '@/types/database';
import { getNewAchievements, type AchievementStats } from '@/lib/achievements';
import toast from 'react-hot-toast';
import { X, Volume2, Trophy } from 'lucide-react';
import Link from 'next/link';

interface Props {
  userId: string;
  profile: UserProfile | null;
  existingReviews: Array<{
    card_id: string; ease_factor: number; interval_days: number;
    repetitions: number; next_review_at: string;
  }>;
  initialLevel: Level;
  unlockedAchievements: string[];
}

type Screen = 'levelSelect' | 'session' | 'errorReview' | 'complete';
type ExMode = 'flashcard' | 'fillBlank' | 'multipleChoice' | 'freeWrite';

export default function LearnClient({ userId, profile, existingReviews, initialLevel, unlockedAchievements }: Props) {
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
  const [errorCards, setErrorCards] = useState<Flashcard[]>([]);
  const [errorIdx, setErrorIdx] = useState(0);
  const [errorFlipped, setErrorFlipped] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Array<{icon:string;title:string;desc:string}>>([]);

  const card = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;

  function getMode(i: number): ExMode {
    const modes: ExMode[] = ['flashcard', 'flashcard', 'multipleChoice', 'freeWrite', 'fillBlank'];
    return modes[i % 5];
  }

  function startSession(level: Level) {
    const sorted = getCardsByLevel(level).sort((a, b) => {
      const ra = existingReviews.find(r => r.card_id === a.id);
      const rb = existingReviews.find(r => r.card_id === b.id);
      if (!ra && !rb) return 0; if (!ra) return -1; if (!rb) return 1;
      return new Date(ra.next_review_at).getTime() - new Date(rb.next_review_at).getTime();
    });
    setCards(sorted); setIdx(0); setFlipped(false); setInput(''); setChecked(false);
    setSessionXP(0); setSessionCorrect(0); setErrorCards([]); setScreen('session');
    setMode(getMode(0));
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
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ['Samantha','Alex','Karen','Google US English','Microsoft Aria','Microsoft Jenny'];
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

  async function checkAndUnlockAchievements(newXP: number, newWords: number, newSessions: number) {
    const stats: AchievementStats = {
      xp: (profile?.xp || 0) + newXP,
      streak: profile?.streak_days || 0,
      totalWords: (profile?.total_words_learned || 0) + newWords,
      totalSessions: (profile?.total_sessions || 0) + newSessions,
      currentLevel: profile?.current_level || 'A1',
    };
    const fresh = getNewAchievements(stats, unlockedAchievements);
    if (fresh.length > 0) {
      setNewAchievements(fresh);
      for (const a of fresh) {
        await (supabase.from('achievements') as any).insert({ user_id: userId, achievement_id: a.id });
        toast(`${a.icon} ${a.title}`, { icon: '🏅', duration: 4000 });
      }
    }
  }

  async function rate(difficulty: Difficulty) {
    if (!card || submitting) return;
    setSubmitting(true);
    const isCorrect = difficulty !== 'again';
    if (!isCorrect) {
      setErrorCards(prev => prev.find(c => c.id === card.id) ? prev : [...prev, card]);
    }

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
    const newCorrect = sessionCorrect + (isCorrect ? 1 : 0);
    setSessionXP(newXP); setSessionCorrect(newCorrect);

    if (idx + 1 >= cards.length) {
      await finishSession(newXP, newCorrect);
    } else {
      const next = idx + 1;
      setIdx(next); setFlipped(false); setInput(''); setChecked(false); setMode(getMode(next));
    }
    setSubmitting(false);
  }

  async function finishSession(finalXP: number, finalCorrect: number) {
    const dur = Math.round((Date.now() - sessionStart) / 1000);
    const newWords = finalCorrect;

    await (supabase.from('study_sessions') as any).insert({
      user_id: userId, level: selectedLevel, exercise_type: 'mixed',
      cards_reviewed: cards.length, correct: finalCorrect,
      xp_earned: finalXP, duration_seconds: dur,
    });

    const today = new Date().toDateString();
    const last = profile?.last_study_date ? new Date(profile.last_study_date).toDateString() : null;
    const yest = new Date(Date.now() - 86400000).toDateString();
    const streak = last === today ? profile?.streak_days || 0 : last === yest ? (profile?.streak_days || 0) + 1 : 1;
    const newTotalWords = (profile?.total_words_learned || 0) + newWords;
    const newTotalSessions = (profile?.total_sessions || 0) + 1;
    const bestStreak = Math.max(profile?.best_streak || 0, streak);

    await (supabase.from('profiles') as any).update({
      xp: (profile?.xp || 0) + finalXP,
      streak_days: streak,
      best_streak: bestStreak,
      last_study_date: new Date().toISOString(),
      total_words_learned: newTotalWords,
      total_sessions: newTotalSessions,
    }).eq('id', userId);

    await checkAndUnlockAchievements(finalXP, newWords, 1);

    if (errorCards.length > 0) {
      setErrorIdx(0); setErrorFlipped(false); setScreen('errorReview');
    } else {
      setScreen('complete');
    }
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
    setCorrect(opt === card?.back);
    if (opt === card?.back) toast.success('¡Correcto! 🎉');
  }

  // ── LEVEL SELECT ───────────────────────────────────────────
  if (screen === 'levelSelect') return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-8 block"
          style={{ color: 'var(--green)' }}>
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>¿Qué quieres estudiar?</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>Elige un nivel para comenzar tu sesión de hoy</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(LEVEL_INFO).map(level => {
            const unlocked = (profile?.xp || 0) >= level.minXP;
            const pending = existingReviews.filter(r =>
              FLASHCARDS.find(c => c.id === r.card_id && c.level === level.id) &&
              new Date(r.next_review_at) <= new Date()
            ).length;
            return (
              <button key={level.id} onClick={() => unlocked && startSession(level.id)}
                disabled={!unlocked}
                className="text-left p-5 rounded-2xl border transition-all"
                style={{
                  background: 'var(--surface)', borderColor: 'var(--border)',
                  opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'not-allowed',
                  boxShadow: unlocked ? 'var(--shadow)' : 'none',
                }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex items-center gap-2">
                    {!unlocked && <span>🔒</span>}
                    {unlocked && pending > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: 'var(--warning)', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
                        {pending} pendientes
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl font-black" style={{ color: 'var(--green)' }}>{level.id}</div>
                <div className="font-bold mt-0.5" style={{ color: 'var(--text)' }}>{level.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{level.description}</div>
                <div className="text-xs mt-2 font-medium" style={{ color: 'var(--text3)' }}>
                  {level.totalCards} tarjetas · {!unlocked ? `${level.minXP} XP necesarios` : 'Disponible ✓'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── ERROR REVIEW ───────────────────────────────────────────
  if (screen === 'errorReview') {
    const ec = errorCards[errorIdx];
    if (!ec) return null;
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border"
            style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-black text-sm" style={{ color: 'var(--danger)' }}>Revisión de errores</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                {errorIdx + 1} de {errorCards.length} — repasa las que fallaste
              </p>
            </div>
          </div>

          <div className="card-flip cursor-pointer select-none mb-6"
            onClick={() => !errorFlipped && setErrorFlipped(true)}>
            <div className={`card-flip-inner ${errorFlipped ? 'flipped' : ''}`} style={{ minHeight: 200 }}>
              <div className="card-front w-full min-h-[200px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <button onClick={e => { e.stopPropagation(); speak(ec.front); }}
                  className="mb-3 p-2 rounded-xl" style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>{ec.front}</div>
                <div className="text-xs italic" style={{ color: 'var(--text3)' }}>"{ec.example}"</div>
              </div>
              <div className="card-back w-full min-h-[200px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                style={{ background: 'var(--surface2)', borderColor: 'rgba(248,113,113,0.3)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Traducción</div>
                <div className="text-3xl font-black mb-2" style={{ color: 'var(--danger)' }}>{ec.back}</div>
                <div className="text-xs italic" style={{ color: 'var(--text2)' }}>"{ec.example_es}"</div>
              </div>
            </div>
          </div>

          {!errorFlipped
            ? <button onClick={() => setErrorFlipped(true)}
                className="w-full py-4 text-white font-black rounded-xl btn-glow"
                style={{ background: 'var(--green-dark)' }}>
                Ver traducción →
              </button>
            : <div className="flex gap-3">
                <button onClick={() => {
                  if (errorIdx + 1 >= errorCards.length) setScreen('complete');
                  else { setErrorIdx(i => i + 1); setErrorFlipped(false); }
                }}
                  className="flex-1 py-4 font-black rounded-xl btn-glow text-white"
                  style={{ background: 'var(--green-dark)' }}>
                  {errorIdx + 1 >= errorCards.length ? 'Ver resumen →' : 'Siguiente →'}
                </button>
              </div>
          }
        </div>
      </div>
    );
  }

  // ── COMPLETE ───────────────────────────────────────────────
  if (screen === 'complete') {
    const acc = Math.round((sessionCorrect / cards.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="max-w-sm w-full mx-auto px-4 text-center">
          <div className="text-6xl mb-4">{acc >= 80 ? '🏆' : acc >= 60 ? '🎯' : '📚'}</div>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>¡Sesión completada!</h2>
          <p className="mb-6" style={{ color: 'var(--text2)' }}>Excelente trabajo — tu memoria se está fortaleciendo</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { v: `+${sessionXP}`, label: 'XP ganados',  color: 'var(--warning)' },
              { v: `${acc}%`,        label: 'Precisión',   color: 'var(--green)' },
              { v: `${cards.length}`,label: 'Tarjetas',    color: 'var(--green-bright)' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.v}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {errorCards.length > 0 && (
            <div className="p-4 rounded-2xl border mb-5 text-left"
              style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--danger)' }}>
                ❌ Fallaste {errorCards.length} tarjeta{errorCards.length > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {errorCards.map(c => (
                  <span key={c.id} className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: 'var(--text2)', background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    {c.front}
                  </span>
                ))}
              </div>
            </div>
          )}

          {newAchievements.length > 0 && (
            <div className="p-4 rounded-2xl border mb-5"
              style={{ background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <p className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--green)' }}>
                <Trophy className="w-4 h-4" /> ¡Nuevos logros desbloqueados!
              </p>
              {newAchievements.map(a => (
                <p key={a.id} className="text-xs" style={{ color: 'var(--text2)' }}>
                  {a.icon} <strong style={{ color: 'var(--text)' }}>{a.title}</strong> — {a.desc}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={() => startSession(selectedLevel)}
              className="w-full py-3.5 text-white font-black rounded-xl transition-all btn-glow"
              style={{ background: 'var(--green-dark)' }}>
              🔄 Estudiar de nuevo
            </button>
            <Link href="/dashboard"
              className="w-full py-3.5 font-semibold rounded-xl transition-all text-center border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}
              onClick={() => router.refresh()}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── SESSION ────────────────────────────────────────────────
  if (!card) return null;
  const modeLabel = {
    flashcard: 'Tarjeta', fillBlank: 'Escribe en inglés',
    multipleChoice: 'Opción múltiple', freeWrite: 'Escritura libre',
  }[mode];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setScreen('levelSelect')}
            className="p-2 rounded-xl" style={{ color: 'var(--text3)', background: 'var(--surface)' }}>
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden border"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))' }} />
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text3)' }}>
            {idx + 1}/{cards.length}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>{card.category}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: 'var(--text2)', background: 'var(--surface2)', borderColor: 'var(--border)' }}>
              {modeLabel}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{ color: 'var(--warning)', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
            +{sessionXP} XP
          </span>
        </div>

        {/* ── FLASHCARD ── */}
        {mode === 'flashcard' && (
          <div>
            <p className="text-center text-xs mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              {flipped ? '¿Qué tan bien la recordaste?' : 'Toca la tarjeta para ver la traducción'}
            </p>
            <div className="card-flip cursor-pointer select-none mb-6" onClick={() => !flipped && setFlipped(true)}>
              <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ minHeight: 220 }}>
                <div className="card-front w-full min-h-[220px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
                  <button onClick={e => { e.stopPropagation(); speak(card.front); }}
                    className="mb-4 p-2.5 rounded-xl" style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-3xl font-black mb-3" style={{ color: 'var(--text)' }}>{card.front}</div>
                  <div className="text-xs italic" style={{ color: 'var(--text3)' }}>"{card.example}"</div>
                </div>
                <div className="card-back w-full min-h-[220px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--green)', boxShadow: 'var(--shadow)' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Traducción</div>
                  <div className="text-3xl font-black mb-3" style={{ color: 'var(--green)' }}>{card.back}</div>
                  <div className="text-xs italic" style={{ color: 'var(--text2)' }}>"{card.example_es}"</div>
                </div>
              </div>
            </div>
            {flipped ? (
              <div className="grid grid-cols-4 gap-2">
                {([
                  { d: 'again', label: '😓 Otra vez', color: '#f87171',         bg: 'rgba(248,113,113,0.06)',  border: 'rgba(248,113,113,0.2)' },
                  { d: 'hard',  label: '😅 Difícil',  color: '#fb923c',         bg: 'rgba(251,146,60,0.06)',   border: 'rgba(251,146,60,0.2)' },
                  { d: 'good',  label: '😊 Bien',     color: '#60a5fa',         bg: 'rgba(96,165,250,0.06)',   border: 'rgba(96,165,250,0.2)' },
                  { d: 'easy',  label: '🥳 Fácil',    color: 'var(--green)',    bg: 'var(--green-glow)',       border: 'rgba(16,185,129,0.25)' },
                ] as const).map(({ d, label, color, bg, border }) => (
                  <button key={d} onClick={() => rate(d as Difficulty)} disabled={submitting}
                    className="py-3.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 border"
                    style={{ color, background: bg, borderColor: border }}>
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setFlipped(true)}
                className="w-full py-4 text-white font-black rounded-xl btn-glow"
                style={{ background: 'var(--green-dark)' }}>
                Ver traducción →
              </button>
            )}
          </div>
        )}

        {/* ── FILL BLANK ── */}
        {mode === 'fillBlank' && (
          <div>
            <div className="p-6 rounded-2xl text-center mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>¿Cómo se dice en inglés?</div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card.back}</div>
              <div className="text-xs italic mt-2" style={{ color: 'var(--text3)' }}>"{card.example_es}"</div>
            </div>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !checked && checkFill()}
              disabled={checked} placeholder="Escribe en inglés..." autoFocus
              className="input-field text-center text-lg font-black mb-4"
              style={checked ? {
                borderColor: correct ? 'var(--green)' : 'var(--danger)',
                background: correct ? 'var(--green-glow)' : 'rgba(248,113,113,0.06)',
                color: correct ? 'var(--green)' : 'var(--danger)',
              } : {}} />
            {checked && !correct && (
              <p className="text-center text-sm mb-4" style={{ color: 'var(--text2)' }}>
                Correcto: <span className="font-black" style={{ color: 'var(--green)' }}>{card.front}</span>
              </p>
            )}
            {!checked
              ? <button onClick={checkFill} disabled={!input.trim()}
                  className="w-full py-4 text-white font-black rounded-xl btn-glow disabled:opacity-40 disabled:shadow-none"
                  style={{ background: 'var(--green-dark)' }}>Verificar</button>
              : <button onClick={() => rate(correct ? 'good' : 'again')} disabled={submitting}
                  className="w-full py-4 font-black rounded-xl disabled:opacity-50 border"
                  style={correct
                    ? { background: 'var(--green-dark)', color: 'white' }
                    : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
                  Continuar →
                </button>
            }
          </div>
        )}

        {/* ── FREE WRITE ── */}
        {mode === 'freeWrite' && (
          <div>
            <div className="p-6 rounded-2xl text-center mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>
                Escribe la palabra completa en inglés
              </div>
              <div className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>{card.back}</div>
              <div className="text-xs italic" style={{ color: 'var(--text3)' }}>"{card.example_es}"</div>
            </div>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !checked && checkFill()}
              disabled={checked} placeholder="Escribe en inglés sin pistas..." autoFocus
              className="input-field text-center text-xl font-black mb-4"
              style={checked ? {
                borderColor: correct ? 'var(--green)' : 'var(--danger)',
                background: correct ? 'var(--green-glow)' : 'rgba(248,113,113,0.06)',
                color: correct ? 'var(--green)' : 'var(--danger)',
              } : {}} />
            {checked && (
              <p className="text-center text-sm mb-4" style={{ color: 'var(--text2)' }}>
                {correct
                  ? '✅ ¡Perfecto!'
                  : <>Respuesta: <span className="font-black" style={{ color: 'var(--green)' }}>{card.front}</span></>
                }
              </p>
            )}
            {!checked
              ? <button onClick={checkFill} disabled={!input.trim()}
                  className="w-full py-4 text-white font-black rounded-xl btn-glow disabled:opacity-40 disabled:shadow-none"
                  style={{ background: 'var(--green-dark)' }}>Verificar</button>
              : <button onClick={() => rate(correct ? 'easy' : 'again')} disabled={submitting}
                  className="w-full py-4 font-black rounded-xl btn-glow text-white disabled:opacity-50"
                  style={{ background: 'var(--green-dark)' }}>
                  Continuar →
                </button>
            }
          </div>
        )}

        {/* ── MULTIPLE CHOICE ── */}
        {mode === 'multipleChoice' && (
          <div>
            <div className="p-6 rounded-2xl text-center mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
                Selecciona la traducción correcta
              </div>
              <button onClick={() => speak(card.front)}
                className="mb-3 p-2.5 rounded-xl mx-auto block" style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card.front}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mcOptions.map(opt => {
                const sel = mcSelected === opt;
                const isRight = opt === card.back;
                let borderColor = 'var(--border)', bg = 'var(--surface)', color = 'var(--text)';
                if (checked && isRight)  { borderColor = 'var(--green)'; bg = 'var(--green-glow)'; color = 'var(--green)'; }
                else if (checked && sel) { borderColor = 'var(--danger)'; bg = 'rgba(248,113,113,0.06)'; color = 'var(--danger)'; }
                return (
                  <button key={opt} onClick={() => selectMC(opt)} disabled={!!mcSelected}
                    className="p-4 rounded-xl font-semibold text-sm transition-all border"
                    style={{ background: bg, borderColor, color }}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {checked && (
              <button onClick={() => rate(correct ? 'good' : 'again')} disabled={submitting}
                className="w-full py-4 text-white font-black rounded-xl btn-glow disabled:opacity-50"
                style={{ background: 'var(--green-dark)' }}>
                Continuar →
              </button>
            )}
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text3)' }}>
          💡 La repetición espaciada programa cada tarjeta en el momento ideal
        </p>
      </div>
    </div>
  );
}
