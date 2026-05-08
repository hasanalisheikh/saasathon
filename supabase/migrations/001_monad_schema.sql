-- Monad Database Schema
-- Run this in your Supabase SQL editor

-- profiles extends auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  hourly_rate INTEGER DEFAULT 100,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  scope_raw TEXT,
  scope_structured JSONB,
  inbound_email TEXT UNIQUE,
  github_repo_id TEXT,
  github_repo_name TEXT,
  github_installation_id TEXT,
  hourly_rate INTEGER,
  task_categories JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  raw_email_subject TEXT,
  raw_email_body TEXT NOT NULL,
  raw_email_from TEXT,
  source TEXT DEFAULT 'email',

  -- AI Analysis
  classification TEXT,
  confidence INTEGER,
  scope_evidence TEXT[],
  technical_breakdown TEXT,
  effort_min_hours INTEGER,
  effort_max_hours INTEGER,
  cost_min INTEGER,
  cost_max INTEGER,
  timeline_impact_days INTEGER,
  risk_level TEXT,

  -- Response
  draft_reply TEXT,
  final_reply TEXT,
  reply_tone TEXT DEFAULT 'professional',

  -- Status
  status TEXT DEFAULT 'pending_review',

  -- Approval
  approval_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  approval_page_viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_ip TEXT,
  declined_at TIMESTAMPTZ,
  client_understood_cost BOOLEAN DEFAULT FALSE,

  -- GitHub
  github_issue_number INTEGER,
  github_issue_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub Events (from webhooks)
CREATE TABLE github_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id),
  event_type TEXT,
  github_data JSONB,
  plain_english_summary TEXT,
  client_notified BOOLEAN DEFAULT FALSE,
  client_notified_at TIMESTAMPTZ,
  is_unapproved_work BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Widget Comments
CREATE TABLE widget_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_url TEXT,
  element_selector TEXT,
  x_position FLOAT,
  y_position FLOAT,
  comment_text TEXT NOT NULL,
  client_name TEXT,
  converted_to_request_id UUID REFERENCES requests(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_inbound_email ON projects(inbound_email);
CREATE INDEX idx_requests_project_id ON requests(project_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_approval_token ON requests(approval_token);
CREATE INDEX idx_github_events_project_id ON github_events(project_id);
CREATE INDEX idx_widget_comments_project_id ON widget_comments(project_id);
