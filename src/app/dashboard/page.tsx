import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LEVEL_INFO } from '@/lib/content';
import { getGreeting, getMotivation } from '@/lib/utils';
import type { Level } from '@/types/database';
import { BookOpen } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
  const { data: sessions } = await supabase.from('study_sessions').select('*')
    .eq('user_id', user!.id).order('created_at', { ascending: false }).limit(4);
  const { data: reviews } = await supabase.from('card_reviews').select('*')
    .eq('user_id', user!.id).lte('next_review_at', new Date().toISOString());

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
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-100 tracking-tight">
          {getGreeting()}, {name}! 👋
        </h1>
        <p className="text-emerald-500 mt-1 text-sm">{getMotivation(profile?.streak_days || 0)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: profile?.streak_days || 0, label: '🔥 Racha',   color: 'text-amber-300' },
          { value: xp,                         label: '⚡ XP Total', color: 'text-emerald-300' },
          { value: currentLevel,               label: '📊 Nivel',   color: li.color },
        ].map((s, i) => (
          <div key={i} className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-emerald-600 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Due cards CTA */}
      {dueCount > 0 && (
        <Link href="/learn"
          className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400/50 transition-all group">
          <div>
            <div className="font-bold text-emerald-300 text-sm">
              ⏰ {dueCount} tarjeta{dueCount !== 1 ? 's' : ''} pendiente{dueCount !== 1 ? 's' : ''} de repasar
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">El momento perfecto para reforzar tu memoria</div>
          </div>
          <span className="text-emerald-400 font-bold text-sm group-hover:translate-x-1 transition-transform">Repasar →</span>
        </Link>
      )}

      {/* Level progress */}
      <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{li.emoji}</span>
              <span className={`text-lg font-black ${li.color}`}>{currentLevel}</span>
              <span className="font-bold text-emerald-200">{li.name}</span>
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">{li.description}</div>
          </div>
          {nextLv && (
            <div className="text-right">
              <div className="text-xs text-emerald-600">Siguiente</div>
              <div className="font-black text-emerald-300 text-sm">{nextLv.emoji} {nextLv.id}</div>
            </div>
          )}
        </div>
        <div className="h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)',
              boxShadow: '0 0 8px rgba(52,211,153,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-emerald-700 mt-1.5">
          <span>{xp} XP</span>
          {nextLv && <span>{nextLv.minXP} XP</span>}
        </div>
      </div>

      {/* Levels grid */}
      <div>
        <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-[.15em] mb-3">Todos los niveles</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(LEVEL_INFO).map(level => {
            const unlocked = xp >= level.minXP;
            const current = level.id === currentLevel;
            return (
              <Link key={level.id}
                href={unlocked ? `/learn?level=${level.id}` : '#'}
                className={`p-4 rounded-2xl border transition-all ${
                  current  ? `${level.bg} ${level.border} border-opacity-80` :
                  unlocked ? 'bg-emerald-950/50 border-emerald-800/50 hover:border-emerald-600/50' :
                             'bg-emerald-950/30 border-emerald-900/40 opacity-40 cursor-not-allowed'
                }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xl">{level.emoji}</span>
                  {current  && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">Actual</span>}
                  {!unlocked && <span className="text-xs">🔒</span>}
                </div>
                <div className={`text-xl font-black ${level.color}`}>{level.id}</div>
                <div className="text-xs font-semibold text-emerald-300 mt-0.5">{level.name}</div>
                <div className="text-[11px] text-emerald-700 mt-1">
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
          <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-[.15em] mb-3">Sesiones recientes</h2>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id}
                className="flex items-center justify-between p-3.5 bg-emerald-950/50 border border-emerald-900/60 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-200">Nivel {s.level} — {s.cards_reviewed} tarjetas</div>
                    <div className="text-xs text-emerald-600">{s.correct}/{s.cards_reviewed} correctas · {s.duration_seconds}s</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">+{s.xp_earned} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main CTA */}
      <Link href="/learn"
        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base transition-all btn-glow">
        <BookOpen className="w-5 h-5" />
        Comenzar a estudiar ahora
      </Link>
    </div>
  );
}
