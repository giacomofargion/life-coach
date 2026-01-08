-- Add duration_minutes column to sessions table
ALTER TABLE sessions
ADD COLUMN duration_minutes INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN sessions.duration_minutes IS 'Duration of the session in minutes. NULL for sessions created before this migration.';
