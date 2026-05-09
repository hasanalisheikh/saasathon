-- Clear legacy PAT/OAuth GitHub connections so projects must reconnect via
-- real GitHub App installation IDs.

UPDATE projects
SET
  github_installation_id = NULL,
  github_repo_id = NULL,
  github_repo_name = NULL,
  updated_at = NOW()
WHERE github_installation_id IS NOT NULL
  AND github_installation_id !~ '^[0-9]+$';

UPDATE profiles
SET
  github_access_token = NULL,
  github_username = NULL
WHERE github_access_token IS NOT NULL
   OR github_username IS NOT NULL;
