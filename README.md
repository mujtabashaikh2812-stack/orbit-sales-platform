# Orbit 🪐
### Autonomous AI Sales Outreach Engine & Private CRM Ledger

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Claude 3.5 Sonnet](https://img.shields.io/badge/Anthropic-Claude_3.5_Sonnet-D97706?style=flat-square)](https://anthropic.com/)
[![Google APIs](https://img.shields.io/badge/Google-Gmail_%26_Calendar-EA4335?style=flat-square&logo=google)](https://developers.google.com/)

> *"Built like a private trading desk or members' club register — not a generic SaaS template. Calm, precise, and trustworthy."*

---

## 🎯 Overview

**Orbit** is an end-to-end autonomous sales outreach pipeline and CRM ledger engineered specifically for solo consultants, freelancers, and boutique technical agencies.

Solo operators don't need a bloatware sales stack costing thousands per month in Apollo, Instantly, HubSpot, and Calendly subscriptions. Orbit collapses the entire workflow into a single self-hosted application:
1. **Targeting & ICP Configuration**: Define target industry, company size, and value propositions in Settings.
2. **Autonomous Sourcing & Enrichment**: Pull candidate prospects via Apollo.io and verify email deliverability with Hunter.io.
3. **Hyper-Contextual AI Outreach**: Claude 3.5 Sonnet drafts peer-to-peer technical cold emails referencing genuine company challenges (sent via Gmail API with mandatory Dry-Run protection).
4. **Inbound Reply Classification & Discovery**: Classifies replies (`interested`, `not_interested`, `question`, `out_of_office`), conducts email discovery, and automatically extracts structured project requirements.
5. **Calendar Discovery Booking**: Books 30-minute discovery appointments directly onto Google Calendar with auto-generated Google Meet links.
6. **Strict Human-in-the-Loop Pricing**: Per development rules, the AI is strictly prohibited from inventing or negotiating prices. The owner sets the exact fixed quote in the ledger, and Claude formats the proposal relay.
7. **Live CRM Ledger**: Real-time pipeline progression, audit trails, and conversation threads with zero box-shadows and hairline precision.

---

## 🔄 The 8-Stage Sales Pipeline

Every prospect moves through an immutable, trigger-audited 8-stage sequence:

```text
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐
│ SOURCED  │ ─► │ ENRICHED │ ─► │ CONTACTED │ ─► │ REPLIED │
└──────────┘    └──────────┘    └───────────┘    └─────────┘
                                                      │
┌──────────────┐    ┌─────────┐    ┌─────────────────┐│
│ CLOSED (W/L) │ ◄─ │  PRICED │ ◄─ │ MEETING BOOKED  ││
└──────────────┘    └─────────┘    └─────────────────┘│
                                           ▲          │
                                           └──────────┘
                                            QUALIFIED
```

1. **Sourced** — Prospect pulled from Apollo.io matching ICP criteria (industry, titles, headcount).
2. **Enriched** — Hunter.io validates email format, MX records, and deliverability confidence.
3. **Contacted** — Claude drafts custom cold email; dispatched via Gmail API (or logged in Dry Run).
4. **Replied** — Inbound reply detected and classified via Claude 3.5 Sonnet.
5. **Qualified** — Project scope, budget hints, timeline hints, and key requirements synthesized.
6. **Meeting Booked** — Calendar slot scheduled on Google Calendar with Google Meet link.
7. **Priced** — Owner enters fixed deal quote; AI formats proposal email and relays exact number.
8. **Closed (Won / Lost)** — Deal marked won or lost; triggers audit history record.

---

## 🏛️ Design System Architecture

Orbit deliberately avoids standard "AI-generated SaaS" tropes (no cream backgrounds with terracotta accents, no bubbly cards with heavy drop shadows, no gradient washes, no tracked-out all-caps labels).

### Color Palette
- **Base Canvas (`--ink`)**: `#12141A` — Dark ink-toned surface.
- **Surface (`--surface`)**: `#1B1E26` — Card tiers, table rows, navigation containers.
- **Raised Surface (`--surface-raised`)**: `#22252E` — Modals, popovers, active hover rows.
- **Hairlines (`--border`)**: `#2A2E38` — 1px razor-sharp borders (no drop shadows).
- **Primary Text (`--text-primary`)**: `#EDEBE6` — Warm off-white editorial typography.
- **Secondary Text (`--text-secondary`)**: `#9B9A94` — Muted metadata and timestamps.
- **Brass Accent (`--accent`)**: `#B98F4D` — Restrained brass metallic CTA (used on <10% of UI).
- **Muted Moss (`--success`)**: `#6B8F71` — Replied, booked, won statuses.
- **Muted Rust (`--danger`)**: `#B0563A` — Not interested, lost, unsubscribe.

### Typography
- **Headings & Dossier Titles**: `Fraunces` (warm editorial serif, Google Fonts, 24–32px).
- **UI Body & Copy**: `Geist Sans` (clean, modern sans-serif).
- **Metrics, Timestamps & Numbers**: `Geist Mono` (precision numeric alignment).

### Motion
- **Stage Pulse**: When a lead transitions stage, the row flashes a subtle brass highlight (`rgba(185, 143, 77, 0.18)`) that fades over 600ms.

---

## 🛠️ Tech Stack & Integrations

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15.5 (App Router, React 19) | Full-stack server/client architecture |
| **Styling** | Tailwind CSS 3.4 + Custom Tokens | Hairline borders, typography scales, dark ink theme |
| **Database** | Supabase (PostgreSQL 15) | RLS policies, custom enum types, stage audit triggers |
| **AI Engine** | Claude 3.5 Sonnet (`@anthropic-ai/sdk`) | Personalized drafting, intent classification, quote formatting |
| **Email API** | Google Gmail API (`googleapis`) | Cold email dispatch & thread tracking with dry-run engine |
| **Calendar API**| Google Calendar API v3 | Automatic discovery scheduling & Google Meet links |
| **Prospecting** | Apollo.io API + Hunter.io API | ICP candidate queries & deliverability verification |
| **Icons** | Lucide React | Minimalist line icons |

---

## 📁 Repository Structure

```text
orbit/
├── app/
│   ├── (auth)/
│   │   └── login/                  # Single-operator password & magic link auth
│   ├── (dashboard)/
│   │   ├── page.tsx                # Live dashboard metrics & pipeline progression
│   │   ├── leads/
│   │   │   ├── page.tsx            # Leads CRM ledger view & sourcing toolbar
│   │   │   └── [id]/page.tsx       # Detailed lead dossier, requirements & pricing
│   │   ├── conversations/page.tsx  # Inbound & outbound message thread viewer
│   │   ├── meetings/page.tsx       # Google Calendar discovery calls ledger
│   │   └── settings/page.tsx       # ICP definitions, safeguards & service connections
│   ├── api/
│   │   ├── leads/source/           # Apollo.io prospecting route
│   │   ├── leads/enrich/           # Hunter.io email verification route
│   │   ├── outreach/draft/         # Claude outreach drafting route
│   │   ├── outreach/send/          # Gmail dispatcher route (dry-run protected)
│   │   ├── replies/process/        # Inbound reply classifier route
│   │   ├── replies/generate-response/ # Qualifying response synthesis route
│   │   ├── meetings/book/          # Google Calendar scheduling route
│   │   ├── deals/quote/            # AI quote relay proposal route
│   │   └── deals/close/            # Deal closing route
│   ├── globals.css                 # CSS variables, shadow removal & stage pulse
│   └── layout.tsx                  # Root layout with Fraunces & Geist fonts
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx             # Fixed desktop sidebar navigation
│   │   └── header.tsx              # Minimalist dashboard header
│   ├── leads/
│   │   ├── lead-table.tsx          # Hairline ledger table with stage filters
│   │   ├── stage-badge.tsx         # Pill-shaped stage badges with colors
│   │   ├── lead-modal.tsx          # Manual prospect creation/editing modal
│   │   ├── sourcing-toolbar.tsx    # Apollo & Hunter batch execution toolbar
│   │   └── reply-simulator-modal.tsx # 1-click inbound reply test simulator
│   ├── outreach/
│   │   └── outreach-modal.tsx      # Cold email review & dispatch modal
│   ├── meetings/
│   │   └── meeting-booking-modal.tsx # Calendar date/time booking modal
│   └── deals/
│       └── quote-relay-modal.tsx   # Human quote review & proposal dispatch modal
├── lib/
│   ├── ai/
│   │   ├── claude.ts               # Anthropic SDK client & simulation fallbacks
│   │   ├── reply-ai.ts             # Intent classifier & requirement extractor
│   │   └── prompts/                # Versioned prompt templates
│   │       ├── cold-outreach-v1.ts
│   │       ├── reply-classifier-v1.ts
│   │       ├── requirement-extractor-v1.ts
│   │       ├── qualifying-reply-v1.ts
│   │       └── quote-relay-v1.ts
│   ├── calendar/
│   │   ├── google-calendar.ts      # Google Calendar API v3 integration
│   │   └── meeting-service.ts      # Calendar booking orchestration
│   ├── deals/
│   │   └── deal-service.ts         # Human pricing, proposal drafting & closing
│   ├── email/
│   │   ├── gmail.ts                # Gmail API dispatcher with dry-run safety
│   │   ├── outreach-service.ts     # Cold outreach orchestration
│   │   └── reply-service.ts        # Inbound reply orchestration
│   ├── leads/
│   │   ├── apollo.ts               # Apollo.io API client
│   │   ├── hunter.ts               # Hunter.io API client
│   │   └── sourcing-service.ts     # Sourcing & enrichment orchestration
│   ├── db/
│   │   ├── leads.ts                # Data access queries & local state store
│   │   └── supabase-client.ts      # Supabase SSR client
│   └── types.ts                    # Full TypeScript domain models
├── supabase/
│   ├── migrations/
│   │   └── 20260909000001_initial_schema.sql # 8 tables, triggers, RLS & indexes
│   └── seed.sql                    # Initial demo ledger records
└── docs/                           # Single source of truth specifications
    ├── Project_overview.md
    ├── design.md
    ├── database_schema.md
    └── rules.md
```

---

## ⚡ Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (developed on v22.16.0)
- **Package Manager**: npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/mujtabashaikh2812-stack/orbit-sales-platform.git
cd orbit-sales-platform
npm install
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Configure your API keys as desired:
```env
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Gmail API (Google OAuth2)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_USER_EMAIL=operator@orbit.local

# Google Calendar API
GOOGLE_CALENDAR_ID=primary

# Lead Sourcing & Enrichment
APOLLO_API_KEY=your-apollo-key
HUNTER_API_KEY=your-hunter-key

# Outreach Safeguards (Default: true for safety)
DRY_RUN_MODE=true
MAX_EMAILS_PER_DAY=15
```

> **Note on Dry-Run Mode**: When `DRY_RUN_MODE=true` (or when API keys are omitted), Orbit runs in a **high-fidelity simulation mode**. You can test lead sourcing, email drafting, reply classification, meeting booking, and deal quoting completely free without billing or risk of emailing live prospects.

### 4. Database Setup (Optional if using Supabase)
Execute the migration and seed in your Supabase SQL Editor:
1. Run [`supabase/migrations/20260909000001_initial_schema.sql`](supabase/migrations/20260909000001_initial_schema.sql)
2. Run [`supabase/seed.sql`](supabase/seed.sql)

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Outreach Safeguards & Compliance Rules

Orbit was designed from day one with strict operational constraints:
- **Zero Hallucinated Pricing**: The AI will never suggest or negotiate pricing. Quotes must be set by the human operator.
- **Gmail Reputation Protection**: Hard throttle capped at 15 outbound emails per day to keep Google Workspace accounts completely healthy on free tiers.
- **Timezone Windows**: Outbound delivery only triggers between 09:00 and 17:00 prospect local time.
- **Automatic Opt-Out**: When an inbound reply contains opt-out phrases (`"not interested"`, `"stop"`, `"unsubscribe"`), the engine automatically classifies it as `not_interested` and transitions the lead stage to `lost`.

---

## 📜 Development Principles & Git Flow

Orbit was built in 8 strict phases, each developed on an isolated feature branch and verified with strict TypeScript builds:

| Phase | Milestone | Branch |
|---|---|---|
| **Phase 1** | Scaffold, Layout Shell & Auth | `feat/phase-1-scaffold` |
| **Phase 2** | Database Schema & Triggers | `feat/phase-2-database` |
| **Phase 3** | Leads CRM Ledger Table & Dossier | `feat/phase-3-leads-crm` |
| **Phase 4** | Sourcing (Apollo) & Enrichment (Hunter) | `feat/phase-4-sourcing-enrichment` |
| **Phase 5** | AI Cold Outreach & Gmail Dry-Run | `feat/phase-5-ai-outreach` |
| **Phase 6** | Reply Handling & Qualification AI | `feat/phase-6-reply-handling` |
| **Phase 7** | Google Calendar & Human Deal Pricing | `feat/phase-7-meetings-pricing` |
| **Phase 8** | Visual Audit & Live Metrics Polish | `feat/phase-8-polish` |

---

## ⚖️ License

MIT License. Crafted for solo technical operators.

