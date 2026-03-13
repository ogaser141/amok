import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import InactivityGuard from '@/components/InactivityGuard';
import type { UserProfile } from '@/types/database';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profileData } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  // Auto-create profile if missing
  if (!profileData) {
    await (supabase.from('profiles') as any).insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
      avatar_url: user.user_metadata?.avatar_url || null,
      xp: 0, streak_days: 0, current_level: 'A1',
    } as never);
  }

  const profile = profileData as UserProfile | null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardNav profile={profile} user={user} />
      <InactivityGuard />
      <main>{children}</main>
    </div>
  );
}
