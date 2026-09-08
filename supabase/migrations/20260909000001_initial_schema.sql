-- =============================================================================
-- Migration: 20260909000001_initial_schema.sql
-- Description: Implement database_schema.md for Orbit AI Sales Outreach & CRM
-- Author: Orbit Architecture
-- =============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums
-- Enforce pipeline stages strictly matching database_schema.md & Project_overview.md
CREATE TYPE lead_stage AS ENUM (
  'sourced',
  'enriched',
  'contacted',
  'replied',
  'qualified',
  'meeting_booked',
  'priced',
  'won',
  'lost'
);

-- =============================================================================
-- 3. Table Definitions
-- =============================================================================

-- Table: icp_criteria (Targeting configuration)
CREATE TABLE IF NOT EXISTS icp_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  company_size_min INT,
  company_size_max INT,
  target_roles TEXT[],
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: leads (Core prospect entity)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icp_criteria_id UUID REFERENCES icp_criteria(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_title TEXT,
  email TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('apollo', 'hunter', 'manual')),
  company_domain TEXT,
  company_summary TEXT,
  stage lead_stage NOT NULL DEFAULT 'sourced',
  stage_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: conversations (Email thread container per lead)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  gmail_thread_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'awaiting_reply', 'closed')) DEFAULT 'active',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: messages (Individual outreach & inbound emails)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  classified_intent TEXT CHECK (classified_intent IN ('interested', 'not_interested', 'question', 'out_of_office')),
  gmail_message_id TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: requirements (AI-extracted project specs from conversation)
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  project_description TEXT,
  budget_hint TEXT,
  timeline_hint TEXT,
  key_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: meetings (Google Calendar synced bookings)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  google_event_id TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'proposed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: deals (Human-in-the-loop quotes and closures)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  quoted_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  quote_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'negotiating')) DEFAULT 'draft',
  final_amount NUMERIC,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: stage_history (Immutable audit trail of all transitions)
CREATE TABLE IF NOT EXISTS stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage lead_stage,
  to_stage lead_stage NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('ai', 'owner', 'system')) DEFAULT 'owner'
);

-- =============================================================================
-- 4. Triggers & Functions
-- =============================================================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_requirements_updated_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW
  EXECUTE FUNCTION fn_set_updated_at();

-- Automated Stage Transition Audit Trigger
-- Enforces data integrity: every change in leads.stage automatically records a stage_history entry
CREATE OR REPLACE FUNCTION fn_record_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO stage_history (lead_id, from_stage, to_stage, changed_at, triggered_by)
    VALUES (NEW.id, NULL, NEW.stage, now(), 'system');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.stage IS DISTINCT FROM NEW.stage) THEN
      NEW.stage_updated_at = now();
      INSERT INTO stage_history (lead_id, from_stage, to_stage, changed_at, triggered_by)
      VALUES (NEW.id, OLD.stage, NEW.stage, now(), 'owner');
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_stage_transition
  AFTER INSERT OR UPDATE OF stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION fn_record_stage_transition();

-- =============================================================================
-- 5. Indexes for Performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_user_stage ON leads (user_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON leads (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations (lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_requirements_lead ON requirements (lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead ON meetings (lead_id, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals (lead_id);
CREATE INDEX IF NOT EXISTS idx_stage_history_lead ON stage_history (lead_id, changed_at DESC);

-- =============================================================================
-- 6. Row-Level Security (RLS) Policies
-- =============================================================================

ALTER TABLE icp_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;

-- ICP Criteria: Scoped to owner
CREATE POLICY "Users can view and manage their own ICP criteria"
  ON icp_criteria FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leads: Scoped to owner
CREATE POLICY "Users can view and manage their own leads"
  ON leads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Conversations: Scoped to owner via lead ownership
CREATE POLICY "Users can view and manage conversations for their leads"
  ON conversations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = conversations.lead_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = conversations.lead_id
        AND leads.user_id = auth.uid()
    )
  );

-- Messages: Scoped to owner via conversation -> lead ownership
CREATE POLICY "Users can view and manage messages for their leads"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN leads ON leads.id = conversations.lead_id
      WHERE conversations.id = messages.conversation_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN leads ON leads.id = conversations.lead_id
      WHERE conversations.id = messages.conversation_id
        AND leads.user_id = auth.uid()
    )
  );

-- Requirements: Scoped to owner via lead ownership
CREATE POLICY "Users can view and manage requirements for their leads"
  ON requirements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = requirements.lead_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = requirements.lead_id
        AND leads.user_id = auth.uid()
    )
  );

-- Meetings: Scoped to owner via lead ownership
CREATE POLICY "Users can view and manage meetings for their leads"
  ON meetings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = meetings.lead_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = meetings.lead_id
        AND leads.user_id = auth.uid()
    )
  );

-- Deals: Scoped to owner via lead ownership
CREATE POLICY "Users can view and manage deals for their leads"
  ON deals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = deals.lead_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = deals.lead_id
        AND leads.user_id = auth.uid()
    )
  );

-- Stage History: Scoped to owner via lead ownership
CREATE POLICY "Users can view stage history for their leads"
  ON stage_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = stage_history.lead_id
        AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = stage_history.lead_id
        AND leads.user_id = auth.uid()
    )
  );
