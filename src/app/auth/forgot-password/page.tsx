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
    <div className="text-center animate-pop py-4">
      <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
      </div>
      <h2 className="text-lg font-black text-emerald-100 mb-2">¡Correo enviado!</h2>
      <p className="text-sm text-emerald-500 mb-5">Revisa tu bandeja de entrada para restablecer tu contraseña.</p>
      <Link href="/auth/login" className="text-emerald-400 text-sm font-semibold">← Volver al inicio de sesión</Link>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <h1 className="text-xl font-black text-emerald-100 text-center mb-1">Restablecer contraseña</h1>
      <p className="text-center text-sm text-emerald-500 mb-6">Te enviaremos un enlace a tu correo.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="tu@correo.com" className="input-field" />
        </div>
        <button type="submit" disabled={loading || !email}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all btn-glow disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Enviar enlace
        </button>
        <p className="text-center">
          <Link href="/auth/login" className="text-sm text-emerald-500 hover:text-emerald-400">← Volver</Link>
        </p>
      </form>
    </div>
  );
}
