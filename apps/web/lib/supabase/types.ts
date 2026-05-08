export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: "free" | "pro" | "org"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: "free" | "pro" | "org"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: "free" | "pro" | "org"
          updated_at?: string
        }
      }
      usage_events: {
        Row: {
          id: string
          user_id: string
          event_type: "brief_generation" | "submission_check"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: "brief_generation" | "submission_check"
          created_at?: string
        }
        Update: never
      }
      contribution_scores: {
        Row: {
          id: string
          project_id: string
          user_id: string
          tasks_completed: number
          contracts_done: number
          contracts_missed: number
          chat_messages: number
          pin_of_shame: boolean
          badge: "rubric_rescuer" | "focus_beast" | "clutch_contributor" | "deadline_saver" | null
          ai_narrative: string | null
          computed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          tasks_completed?: number
          contracts_done?: number
          contracts_missed?: number
          chat_messages?: number
          pin_of_shame?: boolean
          badge?: "rubric_rescuer" | "focus_beast" | "clutch_contributor" | "deadline_saver" | null
          ai_narrative?: string | null
          computed_at?: string
        }
        Update: {
          tasks_completed?: number
          contracts_done?: number
          contracts_missed?: number
          chat_messages?: number
          pin_of_shame?: boolean
          badge?: "rubric_rescuer" | "focus_beast" | "clutch_contributor" | "deadline_saver" | null
          ai_narrative?: string | null
          computed_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          title: string
          brief: string | null
          mode: "solo" | "team"
          due_date: string | null
          target_grade: string | null
          status: "active" | "submitted" | "archived"
          risk_score: number
          risk_narrative: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          brief?: string | null
          mode?: "solo" | "team"
          due_date?: string | null
          target_grade?: string | null
          status?: "active" | "submitted" | "archived"
          risk_score?: number
          risk_narrative?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          brief?: string | null
          mode?: "solo" | "team"
          due_date?: string | null
          target_grade?: string | null
          status?: "active" | "submitted" | "archived"
          risk_score?: number
          risk_narrative?: string | null
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: "owner" | "member"
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: "owner" | "member"
          joined_at?: string
        }
        Update: {
          role?: "owner" | "member"
        }
      }
      rubric_criteria: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          weight: number
          status: "covered" | "partial" | "uncovered"
          ai_extracted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          weight?: number
          status?: "covered" | "partial" | "uncovered"
          ai_extracted?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          weight?: number
          status?: "covered" | "partial" | "uncovered"
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          rubric_criterion_id: string | null
          title: string
          description: string | null
          owner_id: string | null
          deadline: string | null
          effort_hours: number | null
          priority: "low" | "medium" | "high" | "critical"
          status: "todo" | "in_progress" | "done"
          dependencies: string[]
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          rubric_criterion_id?: string | null
          title: string
          description?: string | null
          owner_id?: string | null
          deadline?: string | null
          effort_hours?: number | null
          priority?: "low" | "medium" | "high" | "critical"
          status?: "todo" | "in_progress" | "done"
          dependencies?: string[]
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          rubric_criterion_id?: string | null
          title?: string
          description?: string | null
          owner_id?: string | null
          deadline?: string | null
          effort_hours?: number | null
          priority?: "low" | "medium" | "high" | "critical"
          status?: "todo" | "in_progress" | "done"
          dependencies?: string[]
          updated_at?: string
        }
      }
      focus_contracts: {
        Row: {
          id: string
          task_id: string
          project_id: string
          owner_id: string
          deadline: string
          session_hours: number | null
          proof_text: string | null
          proof_url: string | null
          ai_verdict: "satisfied" | "partial" | "unsatisfied" | null
          ai_verdict_reason: string | null
          status: "active" | "completed" | "missed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          project_id: string
          owner_id: string
          deadline: string
          session_hours?: number | null
          proof_text?: string | null
          proof_url?: string | null
          ai_verdict?: "satisfied" | "partial" | "unsatisfied" | null
          ai_verdict_reason?: string | null
          status?: "active" | "completed" | "missed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          deadline?: string
          session_hours?: number | null
          proof_text?: string | null
          proof_url?: string | null
          ai_verdict?: "satisfied" | "partial" | "unsatisfied" | null
          ai_verdict_reason?: string | null
          status?: "active" | "completed" | "missed"
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          project_id: string
          task_id: string | null
          user_id: string
          content: string
          ai_flagged: boolean
          ai_flag_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          task_id?: string | null
          user_id: string
          content: string
          ai_flagged?: boolean
          ai_flag_reason?: string | null
          created_at?: string
        }
        Update: {
          ai_flagged?: boolean
          ai_flag_reason?: string | null
        }
      }
      risk_audits: {
        Row: {
          id: string
          project_id: string
          score: number
          narrative: string
          trigger_event: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          score: number
          narrative: string
          trigger_event: string
          created_at?: string
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
