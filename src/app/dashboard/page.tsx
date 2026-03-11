import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LEVEL_INFO } from '@/lib/content';
import { getGreeting, getMotivation } from '@/lib/utils';
import type { Level } from '@/types/database';
import { BookOpen } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
  const profile = profileData as any;
  const { data: sessionsData } = await supabase.from('study_sessions').select('*')
    .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(4);
  const sessions = sessionsData as any[];
  const { data: reviewsData } = await supabase.from('card_reviews').select('*')
    .eq('user_id', user!.id).lte('next_review_at', new Date().toISOString());
  const reviews = reviewsData as any[];

  const name = profile?.full_name?.split(' ')[0] || 'Estudiante';
  const currentLevel = (profile?.current_level as Level) || 'A1';
  const li = LEVEL_INFO[currentLevel];
  const xp = profile?.xp || 0;
  const dueCount = reviews?.length || 0;

  const levels = Object.values(LEVEL_INFO);
  const curIdx = levels.findIndex(l => l.id === currentLevel);
  const nextLv = levels[curIdx + 1];
  const pct = nextLv ? Math.min(100, Math.round(((xp - li.minXP) / (nextLv.minXP - li.minXP)) * 100)) : 100;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          {getGreeting()}, {name}! 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--green)' }}>
          {getMotivation(profile?.streak_days || 0)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-2xl font-black" style={{ color: '#fbbf24' }}>{profile?.streak_days || 0}</div>
          <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text2)' }}>🔥 Racha</div>
        </div>
        <div className="rounded-2xl p-4 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-2xl font-black" style={{ color: 'var(--green-bright)' }}>{xp}</div>
          <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text2)' }}>⚡ XP Total</div>
        </div>
        <div className="rounded-2xl p-4 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-2xl font-black" style={{ color: 'var(--green-bright)' }}>{currentLevel}</div>
          <div className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text2)' }}>📊 Nivel</div>
        </div>
      </div>

      {/* Due cards */}
      {dueCount > 0 && (
        <Link href="/learn"
          className="flex items-center justify-between p-4 rounded-2xl border transition-all group"
          style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--green-bright)' }}>
              ⏰ {dueCount} tarjeta{dueCount !== 1 ? 's' : ''} pendiente{dueCount !== 1 ? 's' : ''} de repasar
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
              El momento perfecto para reforzar tu memoria
            </div>
          </div>
          <span className="font-bold text-sm group-hover:translate-x-1 transition-transform" style={{ color: 'var(--green)' }}>
            Repasar →
          </span>
        </Link>
      )}

      {/* Level progress */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{li.emoji}</span>
              <span className="text-lg font-black" style={{ color: 'var(--green-bright)' }}>{currentLevel}</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{li.name}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{li.description}</div>
          </div>
          {nextLv && (
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text3)' }}>Siguiente</div>
              <div className="font-black text-sm" style={{ color: 'var(--text)' }}>{nextLv.emoji} {nextLv.id}</div>
            </div>
          )}
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)',
              boxShadow: '0 0 8px rgba(52,211,153,0.4)',
            }} />
        </div>
        <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--text3)' }}>
          <span>{xp} XP</span>
          {nextLv && <span>{nextLv.minXP} XP</span>}
        </div>
      </div>

      {/* Levels grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[.15em] mb-3" style={{ color: 'var(--text3)' }}>
          Todos los niveles
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(LEVEL_INFO).map(level => {
            const unlocked = xp >= level.minXP;
            const current = level.id === currentLevel;
            return (
              <Link key={level.id}
                href={unlocked ? `/learn?level=${level.id}` : '#'}
                className="p-4 rounded-2xl border transition-all"
                style={{
                  background: current ? 'rgba(16,185,129,0.07)' : 'var(--surface)',
                  borderColor: current ? 'rgba(16,185,129,0.3)' : 'var(--border)',
                  opacity: unlocked ? 1 : 0.4,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                }}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xl">{level.emoji}</span>
                  {current && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                      style={{ color: 'var(--green)', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}>
                      Actual
                    </span>
                  )}
                  {!unlocked && <span className="text-xs">🔒</span>}
                </div>
                <div className="text-xl font-black" style={{ color: 'var(--green-bright)' }}>{level.id}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{level.name}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text3)' }}>
                  {unlocked ? `${level.totalCards} tarjetas ✓` : `${level.minXP} XP necesarios`}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent sessions */}
      {sessions && sessions.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[.15em] mb-3" style={{ color: 'var(--text3)' }}>
            Sesiones recientes
          </h2>
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <div key={s.id}
                className="flex items-center justify-between p-3.5 rounded-xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.15)' }}>
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--green)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      Nivel {s.level} — {s.cards_reviewed} tarjetas
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text2)' }}>
                      {s.correct}/{s.cards_reviewed} correctas · {s.duration_seconds}s
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>+{s.xp_earned} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Link href="/learn"
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-white font-black text-base transition-all btn-glow"
        style={{ background: 'var(--green-dark)' }}>
        <BookOpen className="w-5 h-5" />
        Comenzar a estudiar ahora
      </Link>
    </div>
  );
}