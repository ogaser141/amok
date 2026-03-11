'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message.includes('Invalid') ? 'Correo o contraseña incorrectos' : error.message);
      setLoading(false);
    } else {
      toast.success('¡Bienvenido de vuelta! 👋');
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { toast.error('Error al conectar'); setOauthLoading(null); }
  }

  const oauthBtn = "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 border";

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-black text-center mb-1" style={{ color: 'var(--text)' }}>
        Iniciar sesión
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--text2)' }}>
        ¿No tienes cuenta?{' '}
        <Link href="/auth/signup" className="font-bold" style={{ color: 'var(--green)' }}>
          Regístrate gratis
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
          Continuar con Google
        </button>

        <button onClick={() => handleOAuth('github')} disabled={!!oauthLoading}
          className={oauthBtn}
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          )}
          Continuar con GitHub
        </button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-xs" style={{ background: 'var(--surface)', color: 'var(--text3)' }}>
            o usa tu correo
          </span>
        </div>
      </div>

      <form onSubmit={handleEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
            Correo electrónico
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="tu@correo.com" className="input-field" />
        </div>
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold" style={{ color: 'var(--text2)' }}>Contraseña</label>
            <Link href="/auth/forgot-password" className="text-xs" style={{ color: 'var(--text3)' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" className="input-field pr-11" />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text3)' }}>
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading || !email || !password}
          className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl transition-all btn-glow disabled:opacity-50 disabled:shadow-none mt-2"
          style={{ background: 'var(--green-dark)' }}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
