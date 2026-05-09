// ─── Auth ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  email: string
  hourly_rate: number
  company_name: string | null
  created_at: string
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface TaskCategory {
  name: string
  min_hours: number
  max_hours: number
}

export interface ScopeStructured {
  deliverables: string[]
  exclusions: string[]
  revision_limit: string | null
  timeline: string | null
  pricing_model: string | null
}

export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  user_id: string
  name: string
  client_name: string
  client_email: string | null
  scope_raw: string | null
  scope_structured: ScopeStructured | null
  inbound_email: string | null
  github_repo_id: string | null
  github_repo_name: string | null
  github_installation_id: string | null
  hourly_rate: number | null
  task_categories: TaskCategory[]
  status: ProjectStatus
  created_at: string
  updated_at: string
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentType = 'contract' | 'proposal' | 'rate_card' | 'brief' | 'other'

export type ExtractionStatus = 'pending' | 'completed' | 'failed'

export interface ProjectDocument {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  tags: string[]
  document_type: DocumentType
  file_name: string
  file_size: number
  mime_type: string
  storage_bucket: string
  storage_path: string
  extraction_status: ExtractionStatus
  extraction_error: string | null
  extracted_text: string | null
  created_at: string
  updated_at: string
}

export interface ProjectDocumentContext {
  title: string
  document_type: DocumentType | string
  tags: string[]
  extracted_text: string | null
}

// ─── Requests ────────────────────────────────────────────────────────────────

export type Classification =
  | 'in_scope'
  | 'out_of_scope'
  | 'ambiguous'
  | 'clarification_needed'
  | null

export type RiskLevel = 'low' | 'medium' | 'high' | null

export type RequestStatus =
  | 'pending_review'
  | 'sent_to_client'
  | 'approved'
  | 'declined'
  | 'deferred'
  | 'accepted_in_scope'

export type ImplementationStatus = 'not_started' | 'in_progress' | 'completed'
export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed'

export type RequestSource = 'email' | 'manual' | 'slack'

export type ReplyTone = 'friendly' | 'professional' | 'firm'

export type SuggestedAction =
  | 'accept'
  | 'quote_separately'
  | 'clarify'
  | 'decline'

export interface AITask {
  name: string
  description: string
  min_hours: number
  max_hours: number
}

export interface AIAnalysis {
  classification: Classification
  confidence: number
  scope_evidence: string[]
  technical_breakdown: string
  tasks: AITask[]
  effort_min_hours: number
  effort_max_hours: number
  risk_level: RiskLevel
  timeline_impact_days: number
  reasoning: string
  draft_reply: string
  suggested_action: SuggestedAction
}

export interface Request {
  id: string
  project_id: string
  raw_email_subject: string | null
  raw_email_body: string
  raw_email_from: string | null
  source: RequestSource
  analysis_status: AnalysisStatus
  analysis_error: string | null
  analysis_started_at: string | null
  analysis_completed_at: string | null
  // AI Analysis
  classification: Classification
  confidence: number | null
  scope_evidence: string[]
  technical_breakdown: string | null
  effort_min_hours: number | null
  effort_max_hours: number | null
  cost_min: number | null
  cost_max: number | null
  timeline_impact_days: number | null
  risk_level: RiskLevel
  suggested_action: SuggestedAction | null
  tasks: AITask[]
  reasoning: string | null
  // Response
  draft_reply: string | null
  final_reply: string | null
  reply_tone: ReplyTone
  // Status
  status: RequestStatus
  implementation_status: ImplementationStatus
  // Approval
  approval_token: string
  approval_page_viewed_at: string | null
  approved_at: string | null
  approved_ip: string | null
  declined_at: string | null
  client_understood_cost: boolean
  // GitHub
  github_issue_number: number | null
  github_issue_url: string | null
  // Slack
  slack_thread_ts: string | null
  slack_channel_id: string | null
  created_at: string
  updated_at: string
}

export interface RequestWithProject extends Request {
  project: Pick<Project, 'id' | 'name' | 'client_name' | 'client_email' | 'hourly_rate'>
}

export type RequestTaskStatus = 'pending' | 'in_progress' | 'completed'

export interface RequestTask {
  id: string
  request_id: string
  project_id: string
  position: number
  name: string
  description: string | null
  min_hours: number | null
  max_hours: number | null
  status: RequestTaskStatus
  github_marker: string
  completed_at: string | null
  client_notified_at: string | null
  created_at: string
  updated_at: string
}

// ─── GitHub Events ────────────────────────────────────────────────────────────

export type GitHubEventType =
  | 'pr_merged'
  | 'issue_closed'
  | 'issue_updated'
  | 'push'
  | 'deployment'

export interface GitHubEvent {
  id: string
  project_id: string
  request_id: string | null
  event_type: GitHubEventType
  github_data: Record<string, unknown>
  plain_english_summary: string | null
  client_notified: boolean
  client_notified_at: string | null
  is_unapproved_work: boolean
  created_at: string
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AnalyseRequestPayload {
  request_id: string
}

export interface SendToClientPayload {
  request_id: string
  final_reply: string
  tone: ReplyTone
}

export interface ApproveRequestPayload {
  token: string
  client_understood: boolean
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  requests_this_month: number
  out_of_scope_caught: number
  unbilled_work_protected: number
  approval_rate: number
}
