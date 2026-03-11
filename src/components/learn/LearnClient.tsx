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
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    u.pitch = 1;
  
    const pickBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v =>
        v.lang.startsWith('en') && !v.name.toLowerCase().includes('espeak')
      );
  
      // Prioridad: voces online/premium primero
      const priority = [
        'Samantha', 'Alex', 'Karen', 'Daniel',
        'Google US English', 'Google UK English Female',
        'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Guy',
      ];
  
      for (const name of priority) {
        const v = englishVoices.find(v => v.name.includes(name));
        if (v) { u.voice = v; break; }
      }
  
      // Si no encontró ninguna preferida, usa la primera en inglés disponible
      if (!u.voice && englishVoices.length > 0) {
        u.voice = englishVoices[0];
      }
  
      window.speechSynthesis.speak(u);
    };
  
    if (window.speechSynthesis.getVoices().length > 0) {
      pickBestVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = pickBestVoice;
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
      await (supabase.from('profiles') as any)
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
      await (supabase.from('profiles') as any)
        .update({ streak_days: streak, last_study_date: new Date().toISOString() })
        .eq('id', userId);
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

  // ── Level Select ──────────────────────────────────────────
  if (screen === 'levelSelect') return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors mb-8 block"
          style={{ color: 'var(--green)' }}>
          ← Volver al inicio
        </Link>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text)' }}>
          ¿Qué quieres estudiar?
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text2)' }}>
          Elige un nivel para comenzar tu sesión de hoy
        </p>

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
                className="text-left p-5 rounded-2xl border transition-all"
                style={{
                  background: unlocked ? 'var(--surface)' : 'var(--surface2)',
                  borderColor: unlocked ? 'var(--border2)' : 'var(--border)',
                  opacity: unlocked ? 1 : 0.5,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  boxShadow: unlocked ? 'var(--shadow)' : 'none',
                }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">{level.emoji}</span>
                  <div className="flex items-center gap-2">
                    {!unlocked && <span className="text-sm">🔒</span>}
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

  // ── Complete ──────────────────────────────────────────────
  if (screen === 'complete') {
    const acc = Math.round((sessionCorrect / cards.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="max-w-sm w-full mx-auto px-4 text-center">
          <div className="text-6xl mb-4">{acc >= 80 ? '🏆' : acc >= 60 ? '🎯' : '📚'}</div>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>¡Sesión completada!</h2>
          <p className="mb-8" style={{ color: 'var(--text2)' }}>Excelente trabajo — tu memoria se está fortaleciendo</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
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

  // ── Session ───────────────────────────────────────────────
  if (!card) return null;
  const modeLabel = { flashcard: 'Tarjeta', fillBlank: 'Escribe en inglés', multipleChoice: 'Opción múltiple' }[mode];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setScreen('levelSelect')}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text3)', background: 'var(--surface)' }}>
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden border"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))',
                boxShadow: '0 0 8px var(--green-glow)',
              }} />
          </div>
          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text3)' }}>
            {idx + 1}/{cards.length}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
              {card.category}
            </span>
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

        {/* ── FLASHCARD ─────────────────────────────────── */}
        {mode === 'flashcard' && (
          <div>
            <p className="text-center text-xs mb-4 font-medium" style={{ color: 'var(--text3)' }}>
              {flipped ? '¿Qué tan bien la recordaste?' : 'Toca la tarjeta para ver la traducción'}
            </p>
            <div className="card-flip cursor-pointer select-none mb-6" onClick={() => !flipped && setFlipped(true)}>
              <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`} style={{ minHeight: 220 }}>
                {/* Front */}
                <div className="card-front w-full h-full min-h-[220px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
                  <button onClick={e => { e.stopPropagation(); speak(card.front); }}
                    className="mb-4 p-2.5 rounded-xl transition-colors"
                    style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-3xl font-black mb-3" style={{ color: 'var(--text)' }}>{card.front}</div>
                  <div className="text-xs italic" style={{ color: 'var(--text3)' }}>"{card.example}"</div>
                </div>
                {/* Back */}
                <div className="card-back w-full h-full min-h-[220px] rounded-2xl p-8 flex flex-col items-center justify-center text-center border"
                  style={{ background: 'var(--surface2)', borderColor: 'var(--green)', boxShadow: 'var(--shadow)' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>
                    Traducción al español
                  </div>
                  <div className="text-3xl font-black mb-3" style={{ color: 'var(--green)' }}>{card.back}</div>
                  <div className="text-xs italic" style={{ color: 'var(--text2)' }}>"{card.example_es}"</div>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className="grid grid-cols-4 gap-2">
                {([
                  { d: 'again', label: '😓 Otra vez', color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
                  { d: 'hard',  label: '😅 Difícil',  color: '#fb923c', bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.2)' },
                  { d: 'good',  label: '😊 Bien',     color: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.2)' },
                  { d: 'easy',  label: '🥳 Fácil',    color: 'var(--green)', bg: 'var(--green-glow)', border: 'rgba(16,185,129,0.25)' },
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
                className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow"
                style={{ background: 'var(--green-dark)' }}>
                Ver traducción →
              </button>
            )}
          </div>
        )}

        {/* ── FILL BLANK ────────────────────────────────── */}
        {mode === 'fillBlank' && (
          <div>
            <div className="p-6 rounded-2xl text-center mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>
                ¿Cómo se dice en inglés?
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card.back}</div>
              <div className="text-xs italic mt-2" style={{ color: 'var(--text3)' }}>
                Pista: "{card.example_es}"
              </div>
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
                Respuesta correcta: <span className="font-black" style={{ color: 'var(--green)' }}>{card.front}</span>
              </p>
            )}
            {!checked
              ? <button onClick={checkFill} disabled={!input.trim()}
                  className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-40 disabled:shadow-none"
                  style={{ background: 'var(--green-dark)' }}>
                  Verificar
                </button>
              : <button onClick={() => rate(correct ? 'good' : 'again')} disabled={submitting}
                  className="w-full py-4 font-black rounded-xl transition-all disabled:opacity-50 border"
                  style={correct
                    ? { background: 'var(--green-dark)', color: 'white' }
                    : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
                  Continuar →
                </button>
            }
          </div>
        )}

        {/* ── MULTIPLE CHOICE ───────────────────────────── */}
        {mode === 'multipleChoice' && (
          <div>
            <div className="p-6 rounded-2xl text-center mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
                Selecciona la traducción correcta
              </div>
              <button onClick={() => speak(card.front)}
                className="mb-3 p-2.5 rounded-xl transition-colors mx-auto block"
                style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card.front}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mcOptions.map(opt => {
                const sel = mcSelected === opt;
                const isRight = opt === card.back;
                let borderColor = 'var(--border)';
                let bg = 'var(--surface)';
                let color = 'var(--text)';
                if (checked && isRight)        { borderColor = 'var(--green)'; bg = 'var(--green-glow)'; color = 'var(--green)'; }
                else if (checked && sel)       { borderColor = 'var(--danger)'; bg = 'rgba(248,113,113,0.06)'; color = 'var(--danger)'; }
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
                className="w-full py-4 text-white font-black rounded-xl transition-all btn-glow disabled:opacity-50"
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
