-- Create nudges table
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraint to limit content length
  CONSTRAINT nudges_content_length CHECK (char_length(content) <= 150)
);

-- Indexes for efficient querying
CREATE INDEX idx_nudges_user_id_active ON nudges(user_id, is_completed)
  WHERE is_completed = false;
CREATE INDEX idx_nudges_user_id_created ON nudges(user_id, created_at DESC);
-- Index for cron job: find all users with active nudges
CREATE INDEX idx_nudges_active_users ON nudges(is_completed, user_id)
  WHERE is_completed = false;

-- Create trigger to automatically update updated_at for nudges
CREATE TRIGGER update_nudges_updated_at
  BEFORE UPDATE ON nudges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
