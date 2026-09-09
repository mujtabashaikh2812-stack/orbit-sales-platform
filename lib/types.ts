// TypeScript types derived directly from database_schema.md and Project_overview.md

export type LeadStage =
  | "sourced"
  | "enriched"
  | "contacted"
  | "replied"
  | "qualified"
  | "meeting_booked"
  | "priced"
  | "won"
  | "lost";

export interface IcpCriteria {
  id: string;
  user_id: string;
  name: string;
  industry?: string | null;
  company_size_min?: number | null;
  company_size_max?: number | null;
  target_roles?: string[] | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
}

export type LeadSource =
  | "apollo"
  | "hunter"
  | "google_maps"
  | "contra"
  | "yellow_pages"
  | "manual"
  | "csv_import";

export type CadenceStatus =
  | "idle"
  | "active"
  | "paused"
  | "completed_booked"
  | "completed_lost";

export interface CadenceLog {
  step: number;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Lead {
  id: string;
  user_id: string;
  icp_criteria_id?: string | null;
  company_name: string;
  contact_name: string;
  contact_title?: string | null;
  email?: string | null;
  email_verified: boolean;
  source: LeadSource;
  company_domain?: string | null;
  company_summary?: string | null;
  phone?: string | null;
  location?: string | null;
  stage: LeadStage;
  stage_updated_at: string;
  created_at: string;
  updated_at: string;
  cadence_status?: CadenceStatus;
  cadence_step?: number;
  cadence_next_run_at?: string | null;
  cadence_logs?: CadenceLog[];
}

export interface Conversation {
  id: string;
  lead_id: string;
  gmail_thread_id?: string | null;
  status: "active" | "awaiting_reply" | "closed";
  last_message_at?: string | null;
  created_at: string;
}

export type ClassifiedIntent =
  | "interested"
  | "not_interested"
  | "question"
  | "out_of_office";

export interface Message {
  id: string;
  conversation_id: string;
  direction: "outbound" | "inbound";
  sender: string;
  subject: string;
  body: string;
  ai_generated: boolean;
  classified_intent?: ClassifiedIntent | null;
  gmail_message_id?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface RequirementItem {
  item: string;
  priority: "must-have" | "nice-to-have" | "question";
}

export interface Requirement {
  id: string;
  lead_id: string;
  project_description?: string | null;
  budget_hint?: string | null;
  timeline_hint?: string | null;
  key_requirements: RequirementItem[];
  extracted_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  lead_id: string;
  google_event_id?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: "proposed" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  lead_id: string;
  quoted_amount: number;
  currency: string;
  quote_sent_at?: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "negotiating";
  final_amount?: number | null;
  closed_at?: string | null;
  created_at: string;
}

export interface StageHistory {
  id: string;
  lead_id: string;
  from_stage?: LeadStage | null;
  to_stage: LeadStage;
  changed_at: string;
  triggered_by: "ai" | "owner" | "system";
}
