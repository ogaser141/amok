'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Props {
  userId: string;
  dailyGoal: number;
  todayCards: number;
}

const GOAL_OPTIONS = [5, 10, 20, 30];

export default function DailyGoal({ userId, dailyGoal, todayCards }: Props) {
  const supabase = createClient();
  const [goal, setGoal] = useState(dailyGoal);
  const [cards, setCards] = useState(todayCards);
  const [editing, setEditing] = useState(false);

  const pct = Math.min(100, Math.round((cards / goal) * 100));
  const done = cards >= goal;

  async function changeGoal(newGoal: number) {
    setGoal(newGoal);
    setEditing(false);
    await (supabase.from('profiles') as any)
      .update({ daily_goal: newGoal })
      .eq('id', userId);
    toast.success(`Meta actualizada: ${newGoal} tarjetas`);
  }

  return (
    <div className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{done ? '🎉' : '🎯'}</span>
          <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
            Meta de hoy
          </span>
        </div>
        <button onClick={() => setEditing(e => !e)}
          className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
          style={{ color: 'var(--text3)', background: 'var(--surface2)' }}>
          {editing ? 'Cerrar' : 'Cambiar'}
        </button>
      </div>

      {editing ? (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {GOAL_OPTIONS.map(g => (
            <button key={g} onClick={() => changeGoal(g)}
              className="py-2 rounded-xl text-sm font-black transition-all border"
              style={{
                background: goal === g ? 'var(--green-glow)' : 'var(--surface2)',
                borderColor: goal === g ? 'var(--green)' : 'var(--border)',
                color: goal === g ? 'var(--green)' : 'var(--text2)',
              }}>
              {g}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-black tabular-nums"
              style={{ color: done ? 'var(--green)' : 'var(--text)' }}>
              {cards}<span className="text-sm font-semibold" style={{ color: 'var(--text3)' }}>/{goal}</span>
            </span>
            {done && (
              <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border"
                style={{ color: 'var(--green)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <CheckCircle2 className="w-3 h-3" />
                ¡Meta cumplida!
              </div>
            )}
          </div>

          <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: done
                  ? 'linear-gradient(90deg, var(--green-dark), var(--green-bright))'
                  : 'linear-gradient(90deg, var(--green-dark), var(--green))',
                boxShadow: done ? '0 0 8px var(--green-glow)' : 'none',
              }} />
          </div>

          {!done && (
            <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
              {goal - cards} tarjetas más para completar tu meta
            </p>
          )}
        </>
      )}

      <Link href="/learn"
        className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-black text-white transition-all btn-glow"
        style={{ background: done ? 'var(--green-dark)' : 'var(--green-dark)', opacity: done ? 0.8 : 1 }}>
        {done ? '✅ Seguir estudiando' : '📖 Estudiar ahora'}
      </Link>
    </div>
  );
}
