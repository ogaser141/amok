import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LearnClient from '@/components/learn/LearnClient';
import type { Level } from '@/types/database';

interface Props { searchParams: Promise<{ level?: string }>; }

export default async function LearnPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const params = await searchParams;
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = profileData as any;
  const { data: reviewsData } = await supabase.from('card_reviews').select('*').eq('user_id', user.id);
  const reviews = reviewsData as any[];

  const level = (params.level as Level) || profile?.current_level || 'A1';

  return (
    <LearnClient
      userId={user.id}
      profile={profile}
      existingReviews={reviews || []}
      initialLevel={level as Level}
    />
  );
}
