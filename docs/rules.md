# Development rules

These rules govern how this project is built. If a rule conflicts with something in
Project_overview.md, design.md, or database_schema.md, stop and ask the owner rather
than guessing which takes precedence.

## Tech stack — must stay within these, all free-tier

- **Frontend/backend**: Next.js (App Router), TypeScript, deployed on Vercel free tier
- **Database**: Supabase Postgres, free tier
- **AI**: Claude API (model: use the current default Claude model unless told otherwise)
- **Email**: Gmail API for both sending and receiving (via OAuth to the owner's Gmail)
- **Calendar**: Google Calendar API
- **Lead data**: Apollo.io and Hunter.io free-tier APIs
- Do not introduce a paid service, a new dependency with a paid tier, or an API that
  requires a credit card without asking the owner first — the entire point of this
  stack is $0 running cost at low volume.

## Project structure

```
/app                — Next.js routes (App Router)
/components          — shared UI components
/lib
  /ai                — Claude API prompt templates and call wrappers
  /email              — Gmail API integration
  /calendar           — Google Calendar integration
  /leads              — Apollo/Hunter integration
  /db                 — Supabase client and query helpers
/docs                — this project's context files (rules.md, design.md, etc.)
/supabase/migrations — SQL migration files matching database_schema.md
```

## Coding conventions

- TypeScript strict mode on. No `any` without a comment explaining why.
- Server-side logic (API calls to Gmail, Claude, Apollo, Hunter) stays in `/lib` and
  API routes — never call these services directly from client components.
- Every external API call (Gmail, Claude, Apollo, Hunter, Google Calendar) must be
  wrapped in a try/catch with a specific error surfaced to the dashboard, not a silent
  failure.
- Environment variables for all API keys — never hardcode a key or secret anywhere in
  the codebase, including in comments or example files. Provide a `.env.example` with
  variable names only, no values.

## AI integration rules

- Every Claude API call that drafts or sends an email, or that classifies a reply, must
  use a versioned prompt template stored in `/lib/ai` — not an inline string in a route
  handler — so prompts can be reviewed and improved independently of app logic.
- The AI must never invent facts about the lead's company that weren't found through
  enrichment — personalization should draw only from real data in the `leads` table.
- The AI must never quote a price. Pricing is set exclusively by the owner in the
  `deals` table; the AI's job is to relay whatever number is there, never to generate,
  suggest, or negotiate a number on its own.
- Every outbound email the AI drafts should be logged to `messages` with
  `ai_generated = true` before sending, so nothing goes out without a record.
- Build a "dry run" mode (env flag) that drafts emails and logs them without actually
  calling the Gmail send endpoint — use this for all early testing so no real emails go
  out during development.

## Compliance rules

- Every cold email must include the sender's real identity and a working way to opt out
  (reply "unsubscribe" is enough for a small-volume solo sender, but it must be
  honored — a lead who unsubscribes must be automatically excluded from future contact).
- Do not scrape LinkedIn or any site's data directly — lead data comes only from the
  Apollo/Hunter APIs, which are compliant, licensed sources.
- Store only business contact information obtained through those APIs — do not store or
  process personal (non-business) data about any lead.

## Data integrity rules

- Every lead stage transition goes through one function that both updates
  `leads.stage` and inserts a `stage_history` row in the same transaction — never update
  `leads.stage` directly from multiple places in the codebase.
- `messages.classified_intent` must be set before an inbound message is considered
  "processed" — the reply-handling flow isn't done until this is written.

## What to always ask the owner about before proceeding

- Any change that would require a paid tier or a credit card on any service
- Any ambiguity in design.md about a screen or component not explicitly described
- Any change to the pipeline stages defined in Project_overview.md
- Whether to send real emails vs. stay in dry-run mode

## What never to do

- Never send a real email outside of dry-run mode until the owner has explicitly
  confirmed the outreach copy and flow
- Never let the AI set or imply a price
- Never commit API keys, `.env` files, or OAuth tokens to the repository
- Never silently drop an error — surface it in the dashboard's activity feed so the
  owner sees when something failed (a bounced email, a failed API call, a booking
  conflict)

## Git conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- One feature/phase per branch, matching the phases in the Antigravity build prompt
- No direct commits to `main` — every change goes through a reviewable diff, even
  solo, so the owner can see what changed at each phase
