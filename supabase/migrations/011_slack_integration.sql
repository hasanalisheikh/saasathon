-- Slack OAuth credentials stored per developer account
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slack_access_token text,
  ADD COLUMN IF NOT EXISTS slack_team_id       text,
  ADD COLUMN IF NOT EXISTS slack_team_name     text,
  ADD COLUMN IF NOT EXISTS slack_bot_user_id   text;

-- Per-project Slack channel assignment
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS slack_channel_id   text,
  ADD COLUMN IF NOT EXISTS slack_channel_name text;
