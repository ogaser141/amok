'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });
    if (error) { toast.error('Error al enviar el correo'); setLoading(false); }
    else setDone(true);
  }

  if (done) return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border"
        style={{ background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.3)' }}>
        <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="text-lg font-black mb-2" style={{ color: 'var(--text)' }}>¡Correo enviado!</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--text2)' }}>
        Revisa tu bandeja de entrada para restablecer tu contraseña.
      </p>
      <Link href="/auth/login" className="text-sm font-semibold" style={{ color: 'var(--green)' }}>
        ← Volver al inicio de sesión
      </Link>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <h1 className="text-xl font-black text-center mb-1" style={{ color: 'var(--text)' }}>
        Restablecer contraseña
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--text2)' }}>
        Te enviaremos un enlace a tu correo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
            Correo electrónico
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="tu@correo.com" className="input-field" />
        </div>
        <button type="submit" disabled={loading || !email}
          className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl transition-all btn-glow disabled:opacity-50 disabled:shadow-none"
          style={{ background: 'var(--green-dark)' }}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Enviar enlace
        </button>
        <p className="text-center">
          <Link href="/auth/login" className="text-sm" style={{ color: 'var(--text3)' }}>← Volver</Link>
        </p>
      </form>
    </div>
  );
}
