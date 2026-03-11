import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  const features = [
    { icon: '🧠', title: 'Repetición Espaciada (SRS)', desc: 'El algoritmo SM-2 de Anki — aprende cada palabra en el momento exacto antes de olvidarla.' },
    { icon: '📊', title: 'Niveles CEFR A1 → C2', desc: 'Contenido estructurado que avanza contigo. Cada nivel se desbloquea cuando estás listo.' },
    { icon: '✍️', title: 'Tres tipos de ejercicios', desc: 'Flashcards, completar espacios y opción múltiple para reforzar desde distintos ángulos.' },
    { icon: '🔥', title: 'Racha diaria + XP', desc: 'Construye el hábito con metas, rachas y puntos que te mantienen motivado cada día.' },
    { icon: '🔊', title: 'Pronunciación nativa', desc: 'Escucha cada palabra en inglés con síntesis de voz para entrenar tu oído.' },
    { icon: '📱', title: 'Instálala en tu celular', desc: 'Funciona como app en móvil, tablet y escritorio. Tu progreso en la nube, siempre contigo.' },
  ];

  const levels = [
    { id: 'A1', name: 'Principiante', emoji: '🌱' },
    { id: 'A2', name: 'Básico',       emoji: '🌿' },
    { id: 'B1', name: 'Intermedio',   emoji: '🌳' },
    { id: 'B2', name: 'Inter. Alto',  emoji: '🌲' },
    { id: 'C1', name: 'Avanzado',     emoji: '🏔️' },
    { id: 'C2', name: 'Maestría',     emoji: '👑' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-emerald-900/60">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🟢</span>
            <span className="font-black text-xl tracking-tight text-emerald-100">
              Am<span className="text-emerald-400">OK</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5">
              Iniciar sesión
            </Link>
            <Link href="/auth/signup"
              className="text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors btn-glow">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 pt-28 pb-24">
        {/* ── Hero ──────────────────────────────────────── */}
        <div className="text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full mb-7">
            ✨ 100% Gratis · Sin publicidad · Sin límites
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] mb-6">
            <span className="gradient-text">AmOK</span>
            <br />
            <span className="text-emerald-100 text-3xl sm:text-4xl font-bold">
              Aprende inglés de verdad
            </span>
          </h1>

          <p className="text-lg text-emerald-300/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Usamos el mismo algoritmo de repetición espaciada que Anki —{' '}
            <strong className="text-emerald-200">el método más efectivo que existe</strong> —
            junto a los niveles internacionales CEFR para llevarte de cero al inglés fluido.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-4 rounded-2xl text-lg transition-all btn-glow">
              🚀 Empezar ahora — gratis
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-emerald-700 hover:border-emerald-500 text-emerald-300 font-bold px-10 py-4 rounded-2xl text-lg transition-all">
              Ya tengo cuenta →
            </Link>
          </div>
        </div>

        {/* ── Levels bar ─────────────────────────────────── */}
        <div className="mb-20">
          <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-[.2em] mb-5">
            Niveles CEFR internacionales
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {levels.map((l, i) => (
              <div key={l.id}
                className="border border-emerald-800/60 bg-emerald-950/50 rounded-2xl p-4 text-center hover:border-emerald-600/60 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 70}ms` }}>
                <div className="text-2xl mb-1">{l.emoji}</div>
                <div className="text-base font-black text-emerald-300">{l.id}</div>
                <div className="text-[11px] text-emerald-600 mt-0.5 leading-tight">{l.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ──────────────────────────────────── */}
        <div className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-center text-emerald-100 mb-10">
            Todo lo que necesitas para aprender de verdad
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i}
                className="p-6 rounded-2xl border border-emerald-900/70 bg-emerald-950/40 hover:border-emerald-700/60 hover:bg-emerald-950/60 transition-all animate-fade-in group"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-emerald-200 mb-1.5">{f.title}</h3>
                <p className="text-sm text-emerald-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ─────────────────────────────── */}
        <div className="mb-20 p-8 sm:p-12 rounded-3xl border border-emerald-800/50 bg-emerald-950/30">
          <h2 className="text-2xl font-black text-center text-emerald-200 mb-8">¿Cómo funciona AmOK?</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { n:'1', title:'Ves la tarjeta', desc:'Una palabra o frase en inglés aparece en pantalla. Escúchala, léela, piensa en su significado.' },
              { n:'2', title:'Calificas tu memoria', desc:'Voltea la tarjeta y dices si fue fácil, difícil o no la recordaste.' },
              { n:'3', title:'El algoritmo programa', desc:'AmOK calcula cuándo debes volver a ver esa tarjeta para recordarla para siempre.' },
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg mb-3">{s.n}</div>
                <h3 className="font-bold text-emerald-200 mb-1">{s.title}</h3>
                <p className="text-sm text-emerald-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Final CTA ─────────────────────────────────── */}
        <div className="text-center p-12 rounded-3xl border-2 border-emerald-700/50 bg-emerald-950/50"
          style={{ boxShadow: '0 0 60px rgba(16,185,129,0.08)' }}>
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-3xl font-black text-emerald-100 mb-3">¿Listo para empezar?</h2>
          <p className="text-emerald-400 mb-8">Crea tu cuenta en 30 segundos. Sin tarjeta de crédito. Sin trampa.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-4 rounded-2xl text-lg transition-all btn-glow">
            Crear cuenta gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
