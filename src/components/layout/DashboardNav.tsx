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
import { ThemeToggle } from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

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
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="sm" href="/dashboard" />
        <div className="flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Inicio',   Icon: LayoutDashboard },
            { href: '/learn',     label: 'Estudiar', Icon: BookOpen },
          ].map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive(href) ? 'var(--green-glow)' : 'transparent',
                color: isActive(href) ? 'var(--green-bright)' : 'var(--text2)',
                border: `1px solid ${isActive(href) ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
              }}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ color: 'var(--warning)', background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)' }}>
              🔥 {profile?.streak_days ?? 0}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{ color: 'var(--green-bright)', background: 'var(--green-glow)', borderColor: 'rgba(16,185,129,0.2)' }}>
              ⚡ {formatXP(profile?.xp ?? 0)} XP
            </span>
          </div>
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border"
            style={{ background: 'var(--green-dark)', borderColor: 'var(--border2)' }}>
            {avatar
              ? <Image src={avatar} alt={name} width={32} height={32} className="rounded-full" />
              : <span className="text-xs font-black text-white">{name[0].toUpperCase()}</span>
            }
          </div>
          <button onClick={handleSignOut}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text3)' }} title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
