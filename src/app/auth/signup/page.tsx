'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Débil', 'Buena', 'Fuerte'][strength];
  const strengthColor = ['', '#f87171', '#fbbf24', '#10b981'][strength];

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message.includes('already registered') ? 'Este correo ya está registrado' : error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  if (done) return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
        style={{ background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.3)' }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>¡Revisa tu correo!</h2>
      <p className="text-sm mb-1" style={{ color: 'var(--text2)' }}>Enviamos un enlace de confirmación a:</p>
      <p className="font-bold mb-6 text-sm" style={{ color: 'var(--green)' }}>{email}</p>
      <p className="text-xs" style={{ color: 'var(--text3)' }}>
        ¿No llegó? Revisa spam o{' '}
        <button onClick={() => setDone(false)} className="underline" style={{ color: 'var(--green)' }}>
          intenta de nuevo
        </button>.
      </p>
    </div>
  );

  const oauthBtn = "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 border";

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-black text-center mb-1" style={{ color: 'var(--text)' }}>
        Crear cuenta gratis
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--text2)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="font-bold" style={{ color: 'var(--green)' }}>
          Iniciar sesión
        </Link>
      </p>

      <div className="space-y-3 mb-5">
        <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading}
          className={oauthBtn}
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Registrarse con Google
        </button>

        <button onClick={() => handleOAuth('github')} disabled={!!oauthLoading}
          className={oauthBtn}
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          )}
          Registrarse con GitHub
        </button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3" style={{ background: 'var(--surface)', color: 'var(--text3)' }}>
            o usa tu correo
          </span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>Tu nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            required placeholder="¿Cómo te llamas?" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="tu@correo.com" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>Contraseña</label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} required
              placeholder="Mínimo 6 caracteres" className="input-field pr-11" />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text3)' }}>
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex gap-1 items-center">
              {[1,2,3].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: i <= strength ? strengthColor : 'var(--border)' }} />
              ))}
              <span className="text-xs ml-2" style={{ color: 'var(--text3)' }}>{strengthLabel}</span>
            </div>
          )}
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl transition-all btn-glow disabled:opacity-50 disabled:shadow-none mt-2"
          style={{ background: 'var(--green-dark)' }}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Crear cuenta gratis 🚀
        </button>
        <p className="text-center text-xs pt-1" style={{ color: 'var(--text3)' }}>
          Al registrarte aceptas los términos de uso.
        </p>
      </form>
    </div>
  );
}
