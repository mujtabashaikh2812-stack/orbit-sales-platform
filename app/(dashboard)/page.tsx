import Link from "next/link";
import { ArrowUpRight, Clock, Plus } from "lucide-react";

// The pipeline stages specified in Project_overview.md and database_schema.md
const PIPELINE_STAGES = [
  { id: "sourced", label: "Sourced", count: 12 },
  { id: "enriched", label: "Enriched", count: 8 },
  { id: "contacted", label: "Contacted", count: 14 },
  { id: "replied", label: "Replied", count: 4 },
  { id: "qualified", label: "Qualified", count: 2 },
  { id: "meeting_booked", label: "Meeting booked", count: 3 },
  { id: "priced", label: "Priced", count: 1 },
  { id: "closed", label: "Closed", count: 2 },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    company: "Acme Logistics",
    contact: "Sarah Jenkins",
    action: "Replied to initial outreach (interested in custom API pipeline)",
    time: "2h ago",
    stage: "replied",
    badgeColor: "text-success border-success/30 bg-success/10",
  },
  {
    id: "2",
    company: "Nova Labs",
    contact: "David Chen",
    action: "Meeting booked for Thursday, 2:00 PM",
    time: "5h ago",
    stage: "meeting_booked",
    badgeColor: "text-accent border-accent/30 bg-accent/10",
  },
  {
    id: "3",
    company: "Kestrel Bio",
    contact: "Elena Rostova",
    action: "Cold outreach email drafted (Dry-run mode logged)",
    time: "8h ago",
    stage: "contacted",
    badgeColor: "text-warning border-warning/30 bg-warning/10",
  },
  {
    id: "4",
    company: "Vanguard Partners",
    contact: "Marcus Vance",
    action: "Lead sourced from Apollo and enriched with verified email",
    time: "1d ago",
    stage: "enriched",
    badgeColor: "text-text-secondary border-border bg-surface",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex items-baseline justify-between border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Outreach pipeline and deal activity ledger
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>

      {/* Metric Counters (Ledger Style, Geist Mono) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-surface">
          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              This week contacted
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-text-primary font-medium">
                14
              </span>
              <span className="text-xs text-text-secondary font-mono">leads</span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              Reply rate
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-accent font-medium">
                18.4%
              </span>
              <span className="text-xs text-success font-mono flex items-center">
                ↑ 2.1%
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              Meetings booked
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-text-primary font-medium">
                3
              </span>
              <span className="text-xs text-text-secondary font-mono">confirmed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Overview (Quiet horizontal kanban per design.md) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Pipeline</h2>
          <Link
            href="/leads"
            className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>View all leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border border-border divide-x divide-y sm:divide-y-0 divide-border bg-surface">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="p-4 hover:bg-surface-raised transition-colors">
              <div className="text-xs text-text-secondary truncate">
                {stage.label}
              </div>
              <div className="mt-2 font-mono text-xl text-text-primary">
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Feed (Ledger Rows separated by 1px hairlines) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Recent activity</h2>
          <span className="text-xs font-mono text-text-secondary flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>live ledger</span>
          </span>
        </div>

        <div className="border border-border divide-y divide-border bg-surface rounded">
          {RECENT_ACTIVITY.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-raised transition-colors duration-150"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {item.company}
                  </span>
                  <span className="text-xs text-text-secondary">·</span>
                  <span className="text-xs text-text-secondary">
                    {item.contact}
                  </span>
                </div>
                <div className="text-xs text-text-secondary prose-ledger">
                  {item.action}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border ${item.badgeColor}`}
                >
                  {item.stage}
                </span>
                <span className="text-xs font-mono text-text-secondary min-w-[50px] text-right">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
