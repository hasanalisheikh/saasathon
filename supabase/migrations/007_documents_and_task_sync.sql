-- Document context and durable implementation task tracking

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  FALSE,
  10485760,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/markdown'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  document_type TEXT NOT NULL DEFAULT 'contract'
    CHECK (document_type IN ('contract', 'proposal', 'rate_card', 'brief', 'other')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'documents',
  storage_path TEXT NOT NULL UNIQUE,
  extraction_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (extraction_status IN ('pending', 'completed', 'failed')),
  extraction_error TEXT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS implementation_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (implementation_status IN ('not_started', 'in_progress', 'completed'));

CREATE TABLE IF NOT EXISTS request_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  description TEXT,
  min_hours INTEGER,
  max_hours INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed')),
  github_marker TEXT NOT NULL UNIQUE DEFAULT ('monad-task:' || gen_random_uuid()::TEXT),
  completed_at TIMESTAMPTZ,
  client_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (request_id, position)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their documents" ON documents;
CREATE POLICY "Users own their documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      project_id IS NULL
      OR project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users access tasks for their projects" ON request_tasks;
CREATE POLICY "Users access tasks for their projects"
  ON request_tasks FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users read own document objects" ON storage.objects;
CREATE POLICY "Users read own document objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users insert own document objects" ON storage.objects;
CREATE POLICY "Users insert own document objects"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users update own document objects" ON storage.objects;
CREATE POLICY "Users update own document objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users delete own document objects" ON storage.objects;
CREATE POLICY "Users delete own document objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS request_tasks_updated_at ON request_tasks;
CREATE TRIGGER request_tasks_updated_at BEFORE UPDATE ON request_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_extraction_status ON documents(extraction_status);
CREATE INDEX IF NOT EXISTS idx_request_tasks_request_id ON request_tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_request_tasks_project_id ON request_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_request_tasks_status ON request_tasks(status);
CREATE INDEX IF NOT EXISTS idx_request_tasks_github_marker ON request_tasks(github_marker);
