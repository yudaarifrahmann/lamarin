-- Add sender_city column to email_settings table
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS sender_city TEXT DEFAULT NULL;

COMMENT ON COLUMN public.email_settings.sender_city
  IS 'Kota/tempat pengirim untuk placeholder {{sender_city}} pada surat lamaran';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

