import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, streak_days, current_level')
          .eq('id', user.id)
          .single();

        // Nuevo usuario si no tiene perfil o tiene xp=0 y nunca estudió
        const isNewUser = !profile || (
          (profile as any)?.xp === 0 &&
          (profile as any)?.streak_days === 0
        );

        if (isNewUser) return NextResponse.redirect(`${origin}/exam`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}