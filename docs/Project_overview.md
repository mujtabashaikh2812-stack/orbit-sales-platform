# Project overview

## What this is
A web app that runs an end-to-end AI sales outreach pipeline for a solo freelancer or
small consultancy: it finds leads, contacts them, has an AI-driven conversation to
explain the service and gather requirements, books a meeting, and lets the owner set
the price — all tracked live in a built-in CRM dashboard.

The owner is not doing outreach manually. They configure who to target and what price
to quote, and the system runs the rest, surfacing everything on a dashboard so the
owner always knows the state of every lead.

## Who it's for
A single operator (freelancer, consultant, small agency owner) with no sales team and
no budget for premium sales tooling. They can code or have a developer, so the product
can be a real custom app rather than a no-code automation.

## Core value proposition
Replace a manual cold-outreach process (search leads, write emails one by one, track
replies in a spreadsheet, manually schedule calls) with one dashboard where the owner
sets direction (target criteria, pricing) and reviews outcomes, while the AI does the
repetitive work of sourcing, writing, replying, and scheduling.

## Key features (MVP)

1. **Lead sourcing** — pull candidate leads from a data API (Apollo/Hunter free tier)
   based on owner-defined ICP criteria (industry, company size, role, etc.)
2. **Enrichment** — verify and attach a working email address to each lead
3. **AI cold outreach** — draft and send a personalized first email per lead, referencing
   real details about their company
4. **Reply handling & qualification** — classify inbound replies (interested / not
   interested / question / out of office), respond conversationally, and extract project
   requirements from the conversation
5. **Meeting booking** — once a lead is qualified, propose times and book directly on the
   owner's calendar
6. **Human-set pricing** — the owner enters a price/quote in the dashboard once
   requirements are captured; the AI relays it in the next email or meeting confirmation
7. **CRM dashboard** — every lead's current stage, full email thread, extracted
   requirements, and next action, updated live

## Pipeline stages (used across the app — must match database_schema.md)

```
Sourced → Enriched → Contacted → Replied → Qualified → Meeting booked → Priced → Closed (won/lost)
```

## User flow (step by step)

1. Owner defines an ICP (target criteria) in Settings.
2. System sources leads matching that ICP and enriches them with a verified email.
3. AI drafts and sends a personalized first email to each new lead.
4. Owner watches the dashboard as replies come in; AI auto-classifies and responds,
   asking discovery questions to understand the lead's needs.
5. Once the AI has captured enough requirements, it proposes meeting times.
6. Meeting gets booked on the owner's calendar; both parties get a confirmation.
7. Owner reviews the captured requirements in the dashboard and enters a price.
8. AI sends the quote to the lead (via email or ahead of the meeting).
9. Owner manually marks the deal won/lost after the meeting/negotiation concludes.

## Tech stack (all free-tier — see rules.md for the full list and constraints)

- Frontend/backend: Next.js on Vercel (free/Hobby tier)
- Database: Supabase (Postgres, free tier)
- AI: Claude API (usage-based, low-cost — not free, but cheap at this volume)
- Email send/receive: Gmail API (free)
- Calendar: Google Calendar API (free)
- Lead data: Apollo.io free tier + Hunter.io free tier

## Out of scope for MVP

- Multi-user / team accounts (single-owner only for v1)
- LinkedIn outreach or scraping (compliance risk — email only for v1)
- Payment processing / invoicing (owner handles this outside the app for now)
- SMS or phone outreach
- A/B testing of email copy

## Success metrics

- Leads sourced per week
- Reply rate on first cold email
- % of replies that reach "qualified"
- Meetings booked per week
- Time from first contact to meeting booked
