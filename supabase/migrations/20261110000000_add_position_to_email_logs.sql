-- ==============================================================================
-- Migration: Add position to email_logs
-- Description:
--   1. Adds 'position' column to track the job position being applied for.
--   2. Adds index on 'position' for query performance and filtering.
-- ==============================================================================

ALTER TABLE public.email_logs
ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_email_logs_position ON public.email_logs(position);

