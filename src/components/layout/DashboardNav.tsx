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

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🟢</span>
          <span className="font-black text-lg tracking-tight hidden sm:block" style={{ color: 'var(--text)' }}>
          Am<span style={{ color: 'var(--green)' }}>OK</span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-1">
          {[
            { href:'/dashboard', label:'Inicio',    icon:<LayoutDashboard className="w-4 h-4"/> },
            { href:'/learn',     label:'Estudiar',  icon:<BookOpen className="w-4 h-4"/> },
          ].map(n => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                  : 'text-emerald-600 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}>
              {n.icon}
              <span className="hidden sm:block">{n.label}</span>
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              🔥 {profile?.streak_days ?? 0}
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              ⚡ {formatXP(profile?.xp ?? 0)} XP
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center overflow-hidden border border-emerald-600/50">
            {avatar
              ? <Image src={avatar} alt={name} width={32} height={32} className="rounded-full" />
              : <span className="text-xs font-black text-emerald-100">{name[0].toUpperCase()}</span>
            }
          </div>
          <button onClick={handleSignOut}
            className="p-2 text-emerald-700 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
