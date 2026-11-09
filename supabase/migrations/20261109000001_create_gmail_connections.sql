-- ==============================================================================
-- Migration: Create gmail_connections Table
-- Description:
--   Stores encrypted OAuth 2.0 refresh tokens for user's connected Gmail accounts.
--   Enforces Row Level Security (RLS) so each authenticated user can only
--   access and manage their own connection.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gmail_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_email TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_gmail_connections_user_id UNIQUE (user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gmail_connections ENABLE ROW LEVEL SECURITY;

-- 1. SELECT policy: Users can only view their own connection record
CREATE POLICY "Users can view own gmail connection"
  ON public.gmail_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. INSERT policy: Users can only insert connection for their own user_id
CREATE POLICY "Users can insert own gmail connection"
  ON public.gmail_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policy: Users can only update their own connection record
CREATE POLICY "Users can update own gmail connection"
  ON public.gmail_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE policy: Users can only delete (disconnect) their own connection record
CREATE POLICY "Users can delete own gmail connection"
  ON public.gmail_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger: Automatically update updated_at timestamp on record changes
CREATE TRIGGER set_gmail_connections_updated_at
  BEFORE UPDATE ON public.gmail_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_gmail_connections_user_id ON public.gmail_connections(user_id);

