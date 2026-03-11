'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import type { UserProfile } from '@/types/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { formatXP } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Props { profile: UserProfile | null; user: SupabaseUser; }

export default function DashboardNav({ profile, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success('Sesión cerrada 👋');
    router.push('/');
    router.refresh();
  }

  const name = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Tú';
  const avatar = profile?.avatar_url;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🟢</span>
          <span className="font-black text-lg tracking-tight hidden sm:block" style={{ color: 'var(--text)' }}>
            Am<span style={{ color: 'var(--green)' }}>OK</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: isActive('/dashboard') ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: isActive('/dashboard') ? 'var(--green-bright)' : 'var(--text2)',
              border: isActive('/dashboard') ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
            }}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:block">Inicio</span>
          </Link>
          <Link href="/learn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: isActive('/learn') ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: isActive('/learn') ? 'var(--green-bright)' : 'var(--text2)',
              border: isActive('/learn') ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
            }}>
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:block">Estudiar</span>
          </Link>
        </div>

        {/* User area */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
              🔥 {profile?.streak_days ?? 0}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ color: 'var(--green-bright)', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              ⚡ {formatXP(profile?.xp ?? 0)} XP
            </span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border"
            style={{ background: 'var(--green-dark)', borderColor: 'var(--border2)' }}>
            {avatar
              ? <Image src={avatar} alt={name} width={32} height={32} className="rounded-full" />
              : <span className="text-xs font-black text-white">{name[0].toUpperCase()}</span>
            }
          </div>
          <button onClick={handleSignOut}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text3)' }}
            title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}