ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS widget_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT;

UPDATE projects SET widget_token = gen_random_uuid()::TEXT WHERE widget_token IS NULL;
