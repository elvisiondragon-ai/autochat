-- Add columns for Instagram token refresh
ALTER TABLE autochat_clients 
ADD COLUMN IF NOT EXISTS ig_token_expires_at bigint,
ADD COLUMN IF NOT EXISTS ig_token_refreshed_at timestamptz;

-- Update existing tokens with user-provided expiry
UPDATE autochat_clients 
SET ig_token_expires_at = 1777936703
WHERE meta_access_token IS NOT NULL;
