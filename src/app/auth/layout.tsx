import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="p-4 flex items-center justify-between">
        <Link href="/"
          className="text-sm font-semibold transition-colors"
          style={{ color: 'var(--text2)' }}>
          ← Volver
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
            <span className="text-3xl">🟢</span>
            <span className="font-black text-2xl tracking-tight" style={{ color: 'var(--text)' }}>
              Am<span style={{ color: 'var(--green)' }}>OK</span>
            </span>
          </Link>
          <div className="rounded-2xl p-7 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
