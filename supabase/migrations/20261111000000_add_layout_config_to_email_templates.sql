-- Add layout_config JSONB column to email_templates
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS layout_config JSONB;

-- Add index on user_id and layout_config for queries
CREATE INDEX IF NOT EXISTS idx_email_templates_layout_config
  ON public.email_templates(user_id) WHERE layout_config IS NOT NULL;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

