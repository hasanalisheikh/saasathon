ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS analysis_status TEXT NOT NULL DEFAULT 'queued'
    CHECK (analysis_status IN ('queued', 'running', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS analysis_error TEXT,
  ADD COLUMN IF NOT EXISTS analysis_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reasoning TEXT;

UPDATE requests
SET
  analysis_status = CASE
    WHEN classification IS NOT NULL
      OR draft_reply IS NOT NULL
      OR technical_breakdown IS NOT NULL
    THEN 'completed'
    ELSE 'queued'
  END,
  analysis_completed_at = CASE
    WHEN classification IS NOT NULL
      OR draft_reply IS NOT NULL
      OR technical_breakdown IS NOT NULL
    THEN COALESCE(analysis_completed_at, updated_at)
    ELSE analysis_completed_at
  END
WHERE
  analysis_status IS DISTINCT FROM CASE
    WHEN classification IS NOT NULL
      OR draft_reply IS NOT NULL
      OR technical_breakdown IS NOT NULL
    THEN 'completed'
    ELSE 'queued'
  END;

CREATE INDEX IF NOT EXISTS idx_requests_analysis_status ON requests(analysis_status);
