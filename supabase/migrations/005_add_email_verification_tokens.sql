-- Create email_verification_tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient token lookup
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
-- Index for cleanup of expired tokens
CREATE INDEX idx_email_verification_tokens_expires ON email_verification_tokens(expires_at);
-- Index for user lookup
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
