import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DailyGoal from '@/components/dashboard/DailyGoal';
import { AchievementsGrid } from '@/components/dashboard/AchievementsGrid';
import { FLASHCARDS, LEVEL_INFO } from '@/lib/content';
import { BarChart2 } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: reviews }, { data: achievements }, { data: todaySessions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    (supabase.from('card_reviews') as any).select('*').eq('user_id', user.id),
    (supabase.from('achievements') as any).select('achievement_id').eq('user_id', user.id),
    (supabase.from('study_sessions') as any).select('cards_reviewed').eq('user_id', user.id)
      .gte('started_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
  ]);

  const p = profile as any;
  const name = p?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Tú';
  const xp = p?.xp || 0;
  const streak = p?.streak_days || 0;
  const level = p?.current_level || 'A1';
  const dailyGoal = p?.daily_goal || 10;
  const todayCards = (todaySessions || []).reduce((sum: number, s: any) => sum + s.cards_reviewed, 0);
  const unlockedIds = (achievements || []).map((a: any) => a.achievement_id);

  const levelList = Object.values(LEVEL_INFO);
  const currentLevelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO];
  const nextLevelInfo = levelList[levelList.findIndex(l => l.id === level) + 1];

  const pendingReviews = (reviews || []).filter((r: any) => new Date(r.next_review_at) <= new Date());

  const LEVEL_XP: Record<string, number> = { A1: 0, A2: 200, B1: 600, B2: 1400, C1: 2600 };
  const currentMin = LEVEL_XP[level] || 0;
  const nextMin    = nextLevelInfo ? LEVEL_XP[nextLevelInfo.id] || xp : xp;
  const levelPct   = nextLevelInfo ? Math.min(100, Math.round(((xp - currentMin) / (nextMin - currentMin)) * 100)) : 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Saludo */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>¡Hola, {name}! 👋</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
              {streak > 0 ? `🔥 ${streak} días de racha — ¡sigue así!` : '¡Comienza tu racha hoy!'}
            </p>
          </div>
          <Link href="/stats"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:block">Stats</span>
          </Link>
        </div>

        {/* Meta diaria */}
        <div className="mb-4">
          <DailyGoal userId={user.id} dailyGoal={dailyGoal} todayCards={todayCards} />
        </div>

        {/* Nivel actual */}
        <div className="rounded-2xl p-5 border mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevelInfo?.emoji}</span>
              <div>
                <p className="font-black" style={{ color: 'var(--text)' }}>Nivel {level} — {currentLevelInfo?.name}</p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>{xp.toLocaleString()} XP</p>
              </div>
            </div>
            {pendingReviews.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                style={{ color: 'var(--warning)', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
                {pendingReviews.length} pendientes
              </span>
            )}
          </div>
          {nextLevelInfo && (
            <>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--surface2)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${levelPct}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                {nextMin - xp > 0 ? `${(nextMin - xp).toLocaleString()} XP para ${nextLevelInfo.id}` : `¡Listo para ${nextLevelInfo.id}!`}
              </p>
            </>
          )}
        </div>

        {/* Niveles */}
        <div className="rounded-2xl border mb-4 overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>📚 Niveles de estudio</h2>
          </div>
          {levelList.map(lvl => {
            const unlocked = xp >= lvl.minXP;
            const pending = (reviews || []).filter((r: any) =>
              FLASHCARDS.find((c: any) => c.id === r.card_id && c.level === lvl.id) &&
              new Date(r.next_review_at) <= new Date()
            ).length;
            const isCurrentLevel = lvl.id === level;
            return (
              <div key={lvl.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-all"
                style={{
                  borderColor: 'var(--border)',
                  background: isCurrentLevel ? 'var(--green-glow)' : 'transparent',
                  opacity: unlocked ? 1 : 0.5,
                }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lvl.emoji}</span>
                  <div>
                    <p className="font-black text-sm flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                      {lvl.id} — {lvl.name}
                      {isCurrentLevel && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--green-dark)', color: 'white' }}>actual</span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>
                      {unlocked ? `${lvl.totalCards} tarjetas` : `Requiere ${lvl.minXP} XP`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pending > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: 'var(--warning)', background: 'rgba(251,191,36,0.1)' }}>
                      {pending}
                    </span>
                  )}
                  {!unlocked && <span className="text-sm">🔒</span>}
                  {unlocked && (
                    <Link href="/learn"
                      className="text-xs font-black px-3 py-1.5 rounded-lg text-white transition-all"
                      style={{ background: 'var(--green-dark)' }}>
                      Estudiar
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Logros */}
        <AchievementsGrid unlocked={unlockedIds} />
      </div>
    </div>
  );
}
