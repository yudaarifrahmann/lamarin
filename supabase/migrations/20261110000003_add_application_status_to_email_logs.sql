-- Add application_status column to email_logs
ALTER TABLE public.email_logs
  ADD COLUMN IF NOT EXISTS application_status TEXT NOT NULL DEFAULT 'pending';

-- Add check constraint to ensure only valid application statuses ('pending', 'accepted', 'rejected')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_logs_application_status_check'
  ) THEN
    ALTER TABLE public.email_logs
      ADD CONSTRAINT email_logs_application_status_check
      CHECK (application_status IN ('pending', 'accepted', 'rejected'));
  END IF;
END $$;

-- Update any existing rows to have 'pending' as default status
UPDATE public.email_logs
SET application_status = 'pending'
WHERE application_status IS NULL;

-- Index for efficient filtering by user and application outcome status
CREATE INDEX IF NOT EXISTS idx_email_logs_user_app_status
  ON public.email_logs(user_id, application_status);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

