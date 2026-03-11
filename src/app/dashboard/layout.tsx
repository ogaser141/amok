import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) {
    const { data: np } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Estudiante',
      avatar_url: user.user_metadata?.avatar_url || null,
      current_level: 'A1',
      xp: 0,
      streak_days: 0,
      daily_goal_minutes: 10,
    }).select().single();
    profile = np;
  }

  return (
    <div className="min-h-screen">
      <DashboardNav profile={profile} user={user} />
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 relative z-10">
        {children}
      </main>
    </div>
  );
}
