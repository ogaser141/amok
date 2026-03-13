import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold transition-colors" style={{ color: 'var(--text2)' }}>
          ← Volver
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="md" href="/" showTagline />
          </div>
          <div className="rounded-2xl p-7 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
