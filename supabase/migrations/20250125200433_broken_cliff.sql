-- Add withdrawal status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_withdrawn boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;

-- Add comment for clarity
COMMENT ON COLUMN users.is_withdrawn IS 'Indicates if the user has withdrawn from the service';
COMMENT ON COLUMN users.withdrawn_at IS 'Timestamp when the user withdrew from the service';