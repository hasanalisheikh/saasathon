-- Monad RLS Policies
-- Run after 001_monad_schema.sql

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: users own their profile
CREATE POLICY "Users own their profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- Projects: users own their projects
CREATE POLICY "Users own their projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- Requests: users access requests for their projects only
CREATE POLICY "Users access requests for their projects"
  ON requests FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- GitHub events: same
CREATE POLICY "Users access github_events for their projects"
  ON github_events FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Widget comments: same
CREATE POLICY "Users access widget_comments for their projects"
  ON widget_comments FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- NOTE: The /api/approve/[token] route uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
-- so clients can approve without being logged in.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
