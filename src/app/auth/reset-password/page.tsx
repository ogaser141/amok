'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error('Error al actualizar. Solicita un nuevo enlace.'); setLoading(false); }
    else { setDone(true); setTimeout(() => router.push('/dashboard'), 2000); }
  }

  if (done) return (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border"
        style={{ background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.3)' }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--green)' }} />
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>¡Contraseña actualizada!</h2>
      <p className="text-sm" style={{ color: 'var(--text2)' }}>Redirigiendo al dashboard...</p>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <h1 className="text-xl font-black text-center mb-1" style={{ color: 'var(--text)' }}>
        Nueva contraseña
      </h1>
      <p className="text-center text-sm mb-6" style={{ color: 'var(--text2)' }}>
        Elige una contraseña segura para tu cuenta
      </p>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
            Nueva contraseña
          </label>
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
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text2)' }}>
            Confirmar contraseña
          </label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            required placeholder="Repite la contraseña" className="input-field" />
        </div>
        <button type="submit" disabled={loading || !password || !confirm}
          className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-xl transition-all btn-glow disabled:opacity-50 disabled:shadow-none mt-2"
          style={{ background: 'var(--green-dark)' }}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
}
