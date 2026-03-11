-- =====================================================
-- AmOK — Configuración de la base de datos Supabase
-- ¿Dónde correr esto?
-- supabase.com → tu proyecto → SQL Editor → New query
-- Pega todo, haz clic en "Run" ✅
-- =====================================================

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name           TEXT,
  avatar_url          TEXT,
  current_level       TEXT    NOT NULL DEFAULT 'A1',
  xp                  INTEGER NOT NULL DEFAULT 0,
  streak_days         INTEGER NOT NULL DEFAULT 0,
  last_study_date     TIMESTAMPTZ,
  daily_goal_minutes  INTEGER NOT NULL DEFAULT 10,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE REVISIONES SRS (historial de tarjetas)
CREATE TABLE IF NOT EXISTS public.card_reviews (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id           TEXT    NOT NULL,
  level             TEXT    NOT NULL,
  ease_factor       DECIMAL NOT NULL DEFAULT 2.5,
  interval_days     INTEGER NOT NULL DEFAULT 1,
  repetitions       INTEGER NOT NULL DEFAULT 0,
  next_review_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- 3. TABLA DE SESIONES DE ESTUDIO
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level            TEXT    NOT NULL,
  exercise_type    TEXT    NOT NULL,
  cards_reviewed   INTEGER NOT NULL DEFAULT 0,
  correct          INTEGER NOT NULL DEFAULT 0,
  xp_earned        INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SEGURIDAD RLS — cada usuario solo ve sus propios datos
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfil propio" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "revisiones propias" ON public.card_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "sesiones propias" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 5. TRIGGER: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. TRIGGER: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ¡Listo! La base de datos de AmOK está configurada ✅
