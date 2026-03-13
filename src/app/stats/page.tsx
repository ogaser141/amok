import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StatsClient from '@/components/stats/StatsClient';

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: sessions }, { data: achievements }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    (supabase.from('study_sessions') as any).select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(60),
    (supabase.from('achievements') as any).select('achievement_id, unlocked_at').eq('user_id', user.id),
  ]);

  return (
    <StatsClient
      profile={profile as any}
      sessions={sessions || []}
      achievements={(achievements || []).map((a: any) => ({ id: a.achievement_id, unlockedAt: a.unlocked_at }))}
    />
  );
}
