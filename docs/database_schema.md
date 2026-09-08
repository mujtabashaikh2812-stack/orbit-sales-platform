# Database schema

Target: Supabase (Postgres). All tables use `uuid` primary keys (`gen_random_uuid()`),
`created_at`/`updated_at` timestamptz columns, and row-level security scoped to the
single owner's `user_id` (even for a solo app, keep this in place for when it grows).

## `icp_criteria`
Stores the owner's targeting settings — what a "good lead" looks like.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | e.g. "Q1 target: mid-market SaaS" |
| industry | text | |
| company_size_min | int | |
| company_size_max | int | |
| target_roles | text[] | e.g. ['Founder', 'Head of Marketing'] |
| notes | text | free text the AI can use for personalization guidance |
| active | boolean | default true |
| created_at | timestamptz | |

## `leads`
The core entity — one row per company/contact.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| icp_criteria_id | uuid | FK → icp_criteria, nullable |
| company_name | text | |
| contact_name | text | |
| contact_title | text | |
| email | text | nullable until enrichment succeeds |
| email_verified | boolean | default false |
| source | text | 'apollo', 'hunter', 'manual' |
| company_domain | text | |
| company_summary | text | short blurb used for email personalization |
| stage | text | enum-like: 'sourced', 'enriched', 'contacted', 'replied', 'qualified', 'meeting_booked', 'priced', 'won', 'lost' |
| stage_updated_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## `conversations`
One per lead — groups all messages in the outreach thread.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads, unique |
| gmail_thread_id | text | Gmail API thread reference |
| status | text | 'active', 'awaiting_reply', 'closed' |
| last_message_at | timestamptz | |
| created_at | timestamptz | |

## `messages`
Every individual email in a conversation, sent or received.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| conversation_id | uuid | FK → conversations |
| direction | text | 'outbound', 'inbound' |
| sender | text | email address |
| subject | text | |
| body | text | |
| ai_generated | boolean | true if drafted by Claude |
| classified_intent | text | nullable — 'interested', 'not_interested', 'question', 'out_of_office' (inbound only) |
| gmail_message_id | text | |
| sent_at | timestamptz | |
| created_at | timestamptz | |

## `requirements`
Structured data the AI extracts from the conversation about what the lead needs.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads, unique |
| project_description | text | AI's summary of what the lead wants |
| budget_hint | text | anything the lead volunteered about budget, nullable |
| timeline_hint | text | nullable |
| key_requirements | jsonb | structured list, e.g. [{"item": "...", "priority": "must-have"}] |
| extracted_at | timestamptz | |
| updated_at | timestamptz | |

## `meetings`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads |
| google_event_id | text | |
| scheduled_at | timestamptz | |
| duration_minutes | int | default 30 |
| status | text | 'proposed', 'confirmed', 'completed', 'cancelled', 'no_show' |
| notes | text | owner's post-meeting notes, nullable |
| created_at | timestamptz | |

## `deals`
The pricing/quote step — the human-in-the-loop part.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads, unique |
| quoted_amount | numeric | set by the owner in the dashboard |
| currency | text | default 'USD' |
| quote_sent_at | timestamptz | nullable — set when AI sends it |
| status | text | 'draft', 'sent', 'accepted', 'declined', 'negotiating' |
| final_amount | numeric | nullable, filled in once closed |
| closed_at | timestamptz | nullable |
| created_at | timestamptz | |

## `stage_history`
Audit trail — every stage transition, for the dashboard's activity feed and reporting.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads |
| from_stage | text | nullable (first entry has no "from") |
| to_stage | text | |
| changed_at | timestamptz | |
| triggered_by | text | 'ai', 'owner', 'system' |

## Relationships summary

```
icp_criteria 1───* leads 1───1 conversations 1───* messages
                leads 1───1 requirements
                leads 1───* meetings
                leads 1───1 deals
                leads 1───* stage_history
```

## Notes for implementation

- Enforce `stage` as a Postgres enum type, not a free-text column, to prevent invalid
  states from being written by either the app or the AI.
- Every stage change must write a `stage_history` row in the same transaction —
  the dashboard's activity feed and metrics are derived entirely from this table.
- `messages.classified_intent` is written by the AI reply-classification step — never
  leave it null on an inbound message once processed, so the dashboard can filter by it.
