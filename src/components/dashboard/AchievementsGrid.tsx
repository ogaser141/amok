'use client';
import { ACHIEVEMENTS } from '@/lib/achievements';

interface GridProps {
  unlocked: string[];
}

export function AchievementsGrid({ unlocked }: GridProps) {
  const total = ACHIEVEMENTS.length;
  const count = unlocked.length;

  return (
    <div className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏅</span>
          <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>Logros</span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
          style={{ color: 'var(--green)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
          {count}/{total}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--surface2)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(count / total) * 100}%`, background: 'linear-gradient(90deg, var(--green-dark), var(--green-bright))' }} />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id}
              title={isUnlocked ? `${a.title}: ${a.desc}` : `Bloqueado: ${a.title}`}
              className="aspect-square rounded-xl flex items-center justify-center text-xl border transition-all cursor-default"
              style={{
                background: isUnlocked ? 'var(--green-glow)' : 'var(--surface2)',
                borderColor: isUnlocked ? 'rgba(16,185,129,0.25)' : 'var(--border)',
                opacity: isUnlocked ? 1 : 0.35,
                filter: isUnlocked ? 'none' : 'grayscale(1)',
              }}>
              {a.icon}
            </div>
          );
        })}
      </div>

      {count === 0 && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text3)' }}>
          Completa sesiones para desbloquear logros
        </p>
      )}
    </div>
  );
}
