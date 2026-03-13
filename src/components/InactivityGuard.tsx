'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const INACTIVE_MS  = 30 * 60 * 1000; // 30 minutes
const WARNING_MS   = 28 * 60 * 1000; // warn at 28 min (2 min before)
const EVENTS       = ['mousemove','mousedown','keydown','touchstart','scroll','click'];

export default function InactivityGuard() {
  const router  = useRouter();
  const supabase = createClient();
  const warningTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(120);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current)  clearTimeout(warningTimer.current);
    if (logoutTimer.current)   clearTimeout(logoutTimer.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
  }, []);

  const logout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await supabase.auth.signOut();
    router.push('/auth/login?reason=inactivity');
    router.refresh();
  }, [clearTimers, router, supabase]);

  const resetTimers = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(120);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(120);
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, WARNING_MS);

    logoutTimer.current = setTimeout(logout, INACTIVE_MS);
  }, [clearTimers, logout]);

  useEffect(() => {
    // Only run if user is authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      resetTimers();
      EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    });

    return () => {
      clearTimers();
      EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
    };
  }, [resetTimers, clearTimers, supabase]);

  if (!showWarning) return null;

  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-8 text-center border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
          style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
          <span className="text-3xl">⏱️</span>
        </div>

        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>
          ¿Sigues ahí?
        </h2>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text2)' }}>
          Tu sesión se cerrará por inactividad en:
        </p>

        {/* Countdown */}
        <div className="text-5xl font-black mb-6 tabular-nums"
          style={{ color: countdown <= 30 ? 'var(--danger)' : 'var(--warning)' }}>
          {mins}:{secs}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${(countdown / 120) * 100}%`,
              background: countdown <= 30 ? 'var(--danger)' : 'var(--warning)',
            }} />
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={resetTimers}
            className="w-full py-3.5 text-white font-black rounded-xl transition-all btn-glow"
            style={{ background: 'var(--green-dark)' }}>
            ✅ Seguir estudiando
          </button>
          <button onClick={logout}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all border"
            style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>
  );
}
