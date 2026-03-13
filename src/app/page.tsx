import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  const features = [
    { icon: '🧠', title: 'Repetición Espaciada (SRS)', desc: 'El algoritmo SM-2 de Anki — aprende cada palabra en el momento exacto antes de olvidarla.' },
    { icon: '📊', title: 'Niveles CEFR A1 → C2',       desc: 'Contenido estructurado que avanza contigo. Cada nivel se desbloquea cuando estás listo.' },
    { icon: '✍️', title: 'Tres tipos de ejercicios',    desc: 'Flashcards, completar espacios y opción múltiple para reforzar desde distintos ángulos.' },
    { icon: '🔥', title: 'Racha diaria + XP',           desc: 'Construye el hábito con metas, rachas y puntos que te mantienen motivado cada día.' },
    { icon: '🔊', title: 'Pronunciación nativa',        desc: 'Escucha cada palabra en inglés con síntesis de voz para entrenar tu oído.' },
    { icon: '📱', title: 'Instálala en tu celular',     desc: 'Funciona como app en móvil, tablet y escritorio. Tu progreso en la nube, siempre contigo.' },
  ];

  const levels = [
    { id:'A1', name:'Principiante', emoji:'🌱' },
    { id:'A2', name:'Básico',       emoji:'🌿' },
    { id:'B1', name:'Intermedio',   emoji:'🌳' },
    { id:'B2', name:'Inter. Alto',  emoji:'🌲' },
    { id:'C1', name:'Avanzado',     emoji:'🏔️' },
    { id:'C2', name:'Maestría',     emoji:'👑' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text2)' }}>
              Iniciar sesión
            </Link>
            <Link href="/auth/signup"
              className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all btn-glow"
              style={{ background: 'var(--green-dark)' }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 pt-28 pb-24">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-7 border"
            style={{ background: 'var(--green-glow)', color: 'var(--green)', borderColor: 'rgba(16,185,129,0.2)' }}>
            ✨ 100% Gratis · Sin publicidad · Sin límites
          </div>

          {/* Logo grande en hero */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" href="/" showTagline />
          </div>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text2)' }}>
            Usamos el mismo algoritmo de repetición espaciada que Anki —{' '}
            <strong style={{ color: 'var(--text)' }}>el método más efectivo que existe</strong> —
            junto a los niveles internacionales CEFR para llevarte de cero al inglés fluido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 text-white font-black px-10 py-4 rounded-2xl text-lg transition-all btn-glow"
              style={{ background: 'var(--green-dark)' }}>
              🚀 Empezar ahora — gratis
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-2xl text-lg transition-all border"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
              Ya tengo cuenta →
            </Link>
          </div>
        </div>

        {/* Levels */}
        <div className="mb-20">
          <p className="text-center text-xs font-bold uppercase tracking-[.2em] mb-5" style={{ color: 'var(--text3)' }}>
            Niveles CEFR internacionales
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {levels.map((l, i) => (
              <div key={l.id} className="rounded-2xl p-4 text-center border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-2xl mb-1">{l.emoji}</div>
                <div className="text-base font-black" style={{ color: 'var(--green)' }}>{l.id}</div>
                <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--text3)' }}>{l.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10" style={{ color: 'var(--text)' }}>
            Todo lo que necesitas para aprender de verdad
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-1.5" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 rounded-3xl border"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border2)' }}>
          <div className="flex justify-center mb-4">
            <Logo size="md" showTagline />
          </div>
          <h2 className="text-3xl font-black mb-3 mt-4" style={{ color: 'var(--text)' }}>¿Listo para empezar?</h2>
          <p className="mb-8" style={{ color: 'var(--text2)' }}>Crea tu cuenta en 30 segundos. Sin tarjeta de crédito.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 text-white font-black px-10 py-4 rounded-2xl text-lg transition-all btn-glow"
            style={{ background: 'var(--green-dark)' }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
