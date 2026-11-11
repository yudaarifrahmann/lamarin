-- Add sort_order column to documents table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Auto-assign sort_order for existing documents (per user, ordered by created_at ASC)
DO $$
DECLARE
  r RECORD;
  curr_order INTEGER;
  curr_user UUID;
BEGIN
  curr_user := NULL;
  curr_order := 0;
  FOR r IN
    SELECT id, user_id FROM public.documents
    ORDER BY user_id, created_at ASC
  LOOP
    IF curr_user IS NULL OR r.user_id != curr_user THEN
      curr_user := r.user_id;
      curr_order := 1;
    ELSE
      curr_order := curr_order + 1;
    END IF;
    UPDATE public.documents SET sort_order = curr_order WHERE id = r.id;
  END LOOP;
END $$;

-- Index for efficient per-user ordered queries
CREATE INDEX IF NOT EXISTS idx_documents_user_sort_order
  ON public.documents(user_id, sort_order);

-- Reload PostgREST schema cache so the new column is immediately visible to the API
NOTIFY pgrst, 'reload schema';
