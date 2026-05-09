-- Add GitHub App support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_installation_id TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_id TEXT;

-- Note: The existing github_installation_id in projects was technically being used
-- to store OAuth tokens. We will keep it but transition to the profile-level installation ID.
