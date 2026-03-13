'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ACHIEVEMENTS } from '@/lib/achievements';
import Link from 'next/link';

interface Session {
  id: string; started_at: string; level: string;
  cards_reviewed: number; correct: number; xp_earned: number; duration_seconds: number;
}
interface AchievementRecord { id: string; unlockedAt: string; }
interface Props {
  profile: any;
  sessions: Session[];
  achievements: AchievementRecord[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
}

export default function StatsClient({ profile, sessions, achievements }: Props) {
  const unlockedIds = achievements.map(a => a.id);

  // Últimos 14 días
  const dailyData = useMemo(() => {
    const map: Record<string, { xp: number; cards: number; date: string }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      map[key] = { xp: 0, cards: 0, date: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }) };
    }
    for (const s of sessions) {
      const key = new Date(s.started_at).toDateString();
      if (map[key]) {
        map[key].xp += s.xp_earned;
        map[key].cards += s.cards_reviewed;
      }
    }
    return Object.values(map);
  }, [sessions]);

  const totalXP     = profile?.xp || 0;
  const totalWords  = profile?.total_words_learned || 0;
  const totalSess   = profile?.total_sessions || 0;
  const streak      = profile?.streak_days || 0;
  const bestStreak  = profile?.best_streak || 0;
  const avgAcc      = sessions.length > 0
    ? Math.round(sessions.reduce((a, s) => a + (s.correct / (s.cards_reviewed || 1)), 0) / sessions.length * 100)
    : 0;

  const recentSessions = sessions.slice(0, 10);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
            ← Volver
          </Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Mis estadísticas</h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { v: totalXP.toLocaleString(),  label: 'XP total',         icon: '⚡', color: 'var(--warning)' },
            { v: totalWords,                label: 'Palabras',          icon: '📚', color: 'var(--green)' },
            { v: `${streak} días`,          label: 'Racha actual',      icon: '🔥', color: '#fb923c' },
            { v: `${bestStreak} días`,      label: 'Mejor racha',       icon: '👑', color: 'var(--warning)' },
            { v: totalSess,                 label: 'Sesiones',          icon: '📅', color: 'var(--green-bright)' },
            { v: `${avgAcc}%`,              label: 'Precisión media',   icon: '🎯', color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.v}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP por día */}
        <div className="rounded-2xl p-5 border mb-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>⚡ XP últimos 14 días</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false}
                interval={2} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--text2)' }}
                formatter={(v: number) => [`${v} XP`, 'XP']} />
              <Bar dataKey="xp" fill="var(--green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tarjetas por día */}
        <div className="rounded-2xl p-5 border mb-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>📖 Tarjetas por día</h2>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={dailyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v} tarjetas`, 'Tarjetas']} />
              <Line type="monotone" dataKey="cards" stroke="var(--green-bright)" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: 'var(--green)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sesiones recientes */}
        {recentSessions.length > 0 && (
          <div className="rounded-2xl border mb-5 overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>📋 Sesiones recientes</h2>
            </div>
            {recentSessions.map((s, i) => {
              const acc = Math.round((s.correct / (s.cards_reviewed || 1)) * 100);
              const mins = Math.round(s.duration_seconds / 60);
              return (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-xs font-black mr-2" style={{ color: 'var(--green)' }}>{s.level}</span>
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>{fmtDate(s.started_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--text2)' }}>{s.cards_reviewed} tarjetas</span>
                    <span className="text-xs font-bold" style={{ color: acc >= 80 ? 'var(--green)' : acc >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                      {acc}%
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>+{s.xp_earned} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Logros */}
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>🏅 Logros</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: 'var(--green)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
              {unlockedIds.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(a => {
              const rec = achievements.find(r => r.id === a.id);
              const unlocked = !!rec;
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                  style={{
                    background: unlocked ? 'var(--green-glow)' : 'var(--surface2)',
                    borderColor: unlocked ? 'rgba(16,185,129,0.2)' : 'var(--border)',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                  <span className="text-2xl" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-none" style={{ color: unlocked ? 'var(--text)' : 'var(--text3)' }}>{a.title}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text3)' }}>{a.desc}</p>
                    {unlocked && rec && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--green)' }}>
                        {fmtDate(rec.unlockedAt)}
                      </p>
                    )}
                  </div>
                  {unlocked && <span className="text-green-400 text-sm">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
