-- =============================================================================
-- Seed Data: supabase/seed.sql
-- Description: Realistic test records for Orbit development & preview
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_icp_id UUID := gen_random_uuid();
  v_lead_acme UUID := gen_random_uuid();
  v_lead_nova UUID := gen_random_uuid();
  v_lead_kestrel UUID := gen_random_uuid();
  v_conv_acme UUID := gen_random_uuid();
  v_conv_nova UUID := gen_random_uuid();
BEGIN
  -- Grab the first authenticated user, or use a fallback test UUID if seeding directly
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NULL THEN
    v_user_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  -- 1. Seed ICP Criteria
  INSERT INTO icp_criteria (id, user_id, name, industry, company_size_min, company_size_max, target_roles, notes, active)
  VALUES (
    v_icp_id,
    v_user_id,
    'Mid-Market SaaS & Dev Agencies',
    'B2B Software, Cloud Infrastructure',
    10,
    150,
    ARRAY['Founder', 'CEO', 'CTO', 'VP Engineering'],
    'Focus on custom web apps, AI integrations, reducing manual dev ops overhead.',
    true
  ) ON CONFLICT DO NOTHING;

  -- 2. Seed Leads across pipeline stages
  INSERT INTO leads (id, user_id, icp_criteria_id, company_name, contact_name, contact_title, email, email_verified, source, company_domain, company_summary, stage)
  VALUES 
    (
      v_lead_acme,
      v_user_id,
      v_icp_id,
      'Acme Logistics',
      'Sarah Jenkins',
      'Chief Technology Officer',
      'sarah.jenkins@acmelogistics.example.com',
      true,
      'apollo',
      'acmelogistics.example.com',
      'Freight optimization platform scaling cross-border shipments.',
      'replied'
    ),
    (
      v_lead_nova,
      v_user_id,
      v_icp_id,
      'Nova Labs',
      'David Chen',
      'Founder & CEO',
      'david@novalabs.example.com',
      true,
      'hunter',
      'novalabs.example.com',
      'Clinical data aggregation software for medical trials.',
      'meeting_booked'
    ),
    (
      v_lead_kestrel,
      v_user_id,
      v_icp_id,
      'Kestrel Bio',
      'Elena Rostova',
      'Head of Product',
      'elena@kestrelbio.example.com',
      true,
      'manual',
      'kestrelbio.example.com',
      'Bioinformatics research tooling and sequence data analysis.',
      'contacted'
    )
  ON CONFLICT DO NOTHING;

  -- 3. Seed Conversations & Messages
  -- Acme Conversation (Replied)
  INSERT INTO conversations (id, lead_id, gmail_thread_id, status, last_message_at)
  VALUES (v_conv_acme, v_lead_acme, 'thread_acme_101', 'active', now() - interval '2 hours')
  ON CONFLICT DO NOTHING;

  INSERT INTO messages (conversation_id, direction, sender, subject, body, ai_generated, classified_intent, sent_at)
  VALUES 
    (
      v_conv_acme,
      'outbound',
      'operator@orbit.local',
      'Quick question regarding Acme Logistics data pipelines',
      'Hi Sarah, noticed your team is scaling shipment integrations. We build custom API workflows that cut sync latency in half. Open to a brief chat this week?',
      true,
      NULL,
      now() - interval '1 day'
    ),
    (
      v_conv_acme,
      'inbound',
      'sarah.jenkins@acmelogistics.example.com',
      'Re: Quick question regarding Acme Logistics data pipelines',
      'Hi, yes this is timely. We are hitting bottle-necks with our 3PL webhooks. What is your typical timeline for a custom adapter?',
      false,
      'interested',
      now() - interval '2 hours'
    );

  -- 4. Seed Requirements for Acme
  INSERT INTO requirements (lead_id, project_description, budget_hint, timeline_hint, key_requirements)
  VALUES (
    v_lead_acme,
    'Custom webhook adapter service to handle high-frequency 3PL updates without dropped packets.',
    '$10k - $15k project budget mentioned',
    'Needs delivery within 4 weeks',
    '[
      {"item": "Idempotent webhook ingestion buffer", "priority": "must-have"},
      {"item": "Dead-letter queue with auto-retry", "priority": "must-have"},
      {"item": "Grafana metrics dashboard", "priority": "nice-to-have"}
    ]'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- 5. Seed Meeting for Nova Labs
  INSERT INTO meetings (lead_id, google_event_id, scheduled_at, duration_minutes, status, notes)
  VALUES (
    v_lead_nova,
    'gcal_event_nova_202',
    now() + interval '2 days',
    30,
    'confirmed',
    'Introductory discovery call on clinical aggregation pipelines.'
  ) ON CONFLICT DO NOTHING;

  -- 6. Seed Deal for Nova Labs
  INSERT INTO deals (lead_id, quoted_amount, currency, status)
  VALUES (
    v_lead_nova,
    12500,
    'USD',
    'draft'
  ) ON CONFLICT DO NOTHING;

END $$;
