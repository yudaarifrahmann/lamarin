-- ==============================================================================
-- Migration: Enhance handle_new_user for Google OAuth & Email Registrations
-- Description:
--   1. Extracts full_name from 'full_name', 'name', or email prefix.
--   2. Prevents duplicate profile creation.
--   3. Updates full_name on conflict if existing name was blank.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'Pengguna'
  );

  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, v_full_name)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name
    WHERE public.profiles.full_name IS NULL OR public.profiles.full_name = '';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

