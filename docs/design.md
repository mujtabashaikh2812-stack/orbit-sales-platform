# Design system

## Direction

The product should feel like a private trading desk or members' club register, not a
SaaS dashboard template. The owner is running something serious — client outreach that
represents their livelihood — and the interface should feel calm, precise, and
trustworthy, the way a well-made ledger or a private bank's client portal feels.

**Explicitly avoid** these AI-generated-design tells:
- Cream/off-white background (#F4F1EA-ish) with a terracotta accent
- Identical rounded cards with the same soft grey drop shadow on everything
- Gradient washes used as decoration
- Tracked-out ALL-CAPS eyebrow labels above every heading
- Numbered markers (01 / 02 / 03) unless the content is genuinely a sequence
- A monospace font used for every small label just because it "looks technical"
- An arrow (→) appended to every link or button

## Color

Dark, ink-toned base with a single warm metallic accent used sparingly — like brass
fittings on dark wood, not a bright SaaS blue.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#12141A` | Page background |
| `--surface` | `#1B1E26` | Cards, panels, table rows |
| `--surface-raised` | `#22252E` | Modals, dropdowns, hover state |
| `--border` | `#2A2E38` | Hairline dividers (1px, never shadows) |
| `--text-primary` | `#EDEBE6` | Warm off-white, primary text |
| `--text-secondary` | `#9B9A94` | Muted labels, metadata |
| `--accent` | `#B98F4D` | Brass — CTAs, active states, links. Use on <10% of UI elements. |
| `--success` | `#6B8F71` | Muted moss green — replied, booked, won |
| `--danger` | `#B0563A` | Muted rust — not interested, lost, error |
| `--warning` | `#C9A15A` | Awaiting reply, pending action |

Do not introduce a light mode for v1. This is a single-owner tool used for focused work,
not a public-facing marketing site — commit fully to the dark, editorial palette.

## Typography

- **Display/headings**: Fraunces (serif, Google Fonts) — used for page titles and the
  lead name in detail views. It should feel like it's set in a ledger, not a hero
  banner: no huge oversized display sizes, keep headings restrained (24–32px).
- **Body/UI**: Geist Sans — clean, precise, not the overused Inter default.
- **Data/numbers**: Geist Mono — used specifically for monetary values, dates, and
  counts in tables, so numbers align and feel precise. Not used for general labels.

Type scale: 12px (metadata) / 14px (body, table cells) / 16px (emphasized body) /
20px (section headers) / 28px (page titles). Two weights only: 400 and 500.

Line length for any prose (email previews, requirement summaries): under 80 characters.

## Layout

- Left sidebar: narrow, icon + label navigation (Dashboard, Leads, Conversations,
  Meetings, Settings). No collapsing hamburger — it's always visible on desktop.
- Main content area: generous margins (min 48px), content never touches the viewport edge.
- Tables over cards for lead lists: rows separated by 1px hairlines (`--border`), not
  wrapped in individual card shadows. This is what makes it feel like a ledger rather
  than a SaaS product grid.
- Pipeline view: a quiet horizontal kanban — columns separated by hairlines, not colored
  headers. Stage names in `--text-secondary`, counts in Geist Mono.
- Corners: 6px radius on interactive elements (buttons, inputs), 4px on table cells/rows.
  Nothing pill-shaped except status badges.
- No drop shadows anywhere. Depth comes from the surface tone steps (`--ink` →
  `--surface` → `--surface-raised`), not from box-shadow.

### Wireframe — dashboard home

```
┌──────────┬──────────────────────────────────────────────┐
│          │  Dashboard                                    │
│  Nexus   │  ──────────────────────────────────────────  │
│          │                                                │
│  Board   │  This week          Reply rate    Booked      │
│  Leads   │  14 contacted        18%           3           │
│  Convos  │                                                │
│  Meets   │  Pipeline                                      │
│  Setting │  Sourced │ Contacted │ Replied │ Qualified │... │
│          │   12     │    9      │   4     │    2      │   │
│          │                                                │
│          │  Recent activity                               │
│          │  ─ Acme Co replied · 2h ago                    │
│          │  ─ Meeting booked with Nova Labs · 5h ago       │
└──────────┴──────────────────────────────────────────────┘
```

Left-aligned throughout. No centered hero moment — this is a working tool, not a
landing page.

## Motion

One deliberate moment only: when a lead's stage changes (e.g. a reply comes in), the
row transitions with a brief highlight (background fades from `--accent` at 15% opacity
back to transparent over 600ms) so the owner notices what changed. No hover-lift on
every card, no staggered fade-ins on page load.

## Writing/copy in the UI

- Buttons say exactly what happens: "Send quote," not "Submit." "Book meeting," not
  "Confirm."
- Empty states are instructions, not jokes: "No leads yet — add your ICP criteria in
  Settings to start sourcing."
- Errors state what happened and what to do: "Email failed to send — check your Gmail
  connection in Settings," not "Something went wrong."
