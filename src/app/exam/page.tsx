import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlacementExam from '@/components/PlacementExam';

export default async function ExamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  const name = (profile as any)?.full_name?.split(' ')[0]
    || user.email?.split('@')[0]
    || 'estudiante';

  return <PlacementExam userId={user.id} userName={name} />;
}
