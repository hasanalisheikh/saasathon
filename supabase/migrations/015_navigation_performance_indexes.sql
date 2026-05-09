-- Targeted indexes for existing navigation queries.
-- These are schema-only and do not change application data or workflows.

CREATE INDEX IF NOT EXISTS idx_projects_user_created_at
  ON projects(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_user_updated_at
  ON projects(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_project_created_at
  ON requests(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_project_updated_at
  ON requests(project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_project_status_created_at
  ON requests(project_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_requests_project_classification_status
  ON requests(project_id, classification, status);

CREATE INDEX IF NOT EXISTS idx_documents_user_created_at
  ON documents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_project_user_created_at
  ON documents(project_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_github_events_project_created_at
  ON github_events(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_tasks_request_position
  ON request_tasks(request_id, position);
