import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LearnClient from '@/components/learn/LearnClient';
import type { Level } from '@/types/database';

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: reviews }, { data: achievements }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    (supabase.from('card_reviews') as any).select('*').eq('user_id', user.id),
    (supabase.from('achievements') as any).select('achievement_id').eq('user_id', user.id),
  ]);

  const unlockedAchievements = (achievements || []).map((a: any) => a.achievement_id);

  return (
    <LearnClient
      userId={user.id}
      profile={profile as any}
      existingReviews={reviews || []}
      initialLevel={(profile as any)?.current_level as Level || 'A1'}
      unlockedAchievements={unlockedAchievements}
    />
  );
}