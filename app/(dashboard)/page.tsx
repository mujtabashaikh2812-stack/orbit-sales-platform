"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Plus, Users, Calendar, Sparkles } from "lucide-react";
import { getLeads, getLeadsSync, INITIAL_LEADS, LeadDetail } from "@/lib/db/leads";
import { LeadStage } from "@/lib/types";
import { StageBadge } from "@/components/leads/stage-badge";
import { cn } from "@/lib/utils";

const PIPELINE_ORDER: { id: string; label: string }[] = [
  { id: "sourced", label: "Sourced" },
  { id: "enriched", label: "Enriched" },
  { id: "contacted", label: "Contacted" },
  { id: "replied", label: "Replied" },
  { id: "qualified", label: "Qualified" },
  { id: "meeting_booked", label: "Meeting booked" },
  { id: "priced", label: "Priced" },
  { id: "closed", label: "Closed" },
];

interface ActivityItem {
  id: string;
  leadId: string;
  company: string;
  contact: string;
  action: string;
  stage: LeadStage;
  timestamp: string;
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(INITIAL_LEADS);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync local storage on client mount
    const cached = getLeadsSync();
    if (cached && cached.length > 0) {
      setLeads(cached);
    }

    async function loadData() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load dashboard leads:", err);
      }
    }
    loadData();
  }, []);

  // Compute live pipeline metrics
  const { contactedCount, replyRate, meetingsCount, pipelineCounts } = useMemo(() => {
    const contactedStages: LeadStage[] = [
      "contacted",
      "replied",
      "qualified",
      "meeting_booked",
      "priced",
      "won",
      "lost",
    ];
    const repliedStages: LeadStage[] = [
      "replied",
      "qualified",
      "meeting_booked",
      "priced",
      "won",
      "lost",
    ];

    const contacted = leads.filter((l) => contactedStages.includes(l.stage)).length;
    const replied = leads.filter((l) => repliedStages.includes(l.stage)).length;
    const rate = contacted > 0 ? ((replied / contacted) * 100).toFixed(1) : "0.0";

    const meetings = leads.reduce((acc, l) => acc + (l.meetings?.length || 0), 0);

    const counts: Record<string, number> = {
      sourced: leads.filter((l) => l.stage === "sourced").length,
      enriched: leads.filter((l) => l.stage === "enriched").length,
      contacted: leads.filter((l) => l.stage === "contacted").length,
      replied: leads.filter((l) => l.stage === "replied").length,
      qualified: leads.filter((l) => l.stage === "qualified").length,
      meeting_booked: leads.filter((l) => l.stage === "meeting_booked").length,
      priced: leads.filter((l) => l.stage === "priced").length,
      closed: leads.filter((l) => l.stage === "won" || l.stage === "lost").length,
    };

    return {
      contactedCount: contacted,
      replyRate: rate,
      meetingsCount: meetings > 0 ? meetings : leads.filter((l) => l.stage === "meeting_booked").length,
      pipelineCounts: counts,
    };
  }, [leads]);

  // Generate dynamic recent activity from stage transitions, messages, and meetings
  const recentActivities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    for (const lead of leads) {
      if (lead.stage_history && lead.stage_history.length > 0) {
        const latestHistory = lead.stage_history[lead.stage_history.length - 1];
        items.push({
          id: `hist-${latestHistory.id}`,
          leadId: lead.id,
          company: lead.company_name,
          contact: lead.contact_name,
          action: latestHistory.from_stage
            ? `Transitioned pipeline stage: ${latestHistory.from_stage} → ${latestHistory.to_stage} (${latestHistory.triggered_by})`
            : `Added to pipeline as ${latestHistory.to_stage}`,
          stage: lead.stage,
          timestamp: latestHistory.changed_at,
        });
      } else {
        items.push({
          id: `lead-${lead.id}`,
          leadId: lead.id,
          company: lead.company_name,
          contact: lead.contact_name,
          action: `Active in ${lead.stage.replace("_", " ")} stage`,
          stage: lead.stage,
          timestamp: lead.stage_updated_at || lead.updated_at,
        });
      }
    }

    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [leads]);

  function formatTimeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-10">
      {/* Executive Briefing Hero */}
      <div className="relative rounded-2xl p-7 bg-gradient-to-br from-surface to-surface-raised border border-border/80 overflow-hidden shadow-card">
        {/* Subtle Ambient Golden Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>LIVE REVENUE TELEMETRY</span>
              <span className="text-text-muted">·</span>
              <span suppressHydrationWarning className="text-text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-text-primary tracking-tight font-medium">
              Outreach & Deal Velocity Ledger
            </h1>
            <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
              Real-time monitoring of your autonomous ICP discovery, Claude AI cold touchpoints, inbound qualifications, and confirmed discovery sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-md transition-all duration-150 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Source New Prospects</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Luxury KPI Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Contacted */}
        <div className="p-6 rounded-xl bg-surface border border-border hover:border-border-highlight/60 transition-all duration-300 shadow-card hover:shadow-card-hover space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary tracking-wide">
              Active Contacted
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-3xl md:text-4xl text-text-primary font-medium tracking-tight">
              {loading ? "..." : contactedCount}
            </div>
            <span className="text-[11px] font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border/80">
              ICP Target
            </span>
          </div>
          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 pt-1 border-t border-border/60">
            <span className="text-accent font-medium">100%</span>
            <span>automated delivery via Gmail API</span>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="p-6 rounded-xl bg-surface border border-border hover:border-border-highlight/60 transition-all duration-300 shadow-card hover:shadow-card-hover space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary tracking-wide">
              Inbound Reply Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted group-hover:text-emerald-400 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-3xl md:text-4xl text-accent font-medium tracking-tight">
              {loading ? "..." : `${replyRate}%`}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              ↑ High Intent
            </span>
          </div>
          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 pt-1 border-t border-border/60">
            <span>Classified by</span>
            <span className="text-text-secondary font-medium">Claude 3.5 Sonnet</span>
          </div>
        </div>

        {/* Meetings Booked */}
        <div className="p-6 rounded-xl bg-surface border border-border hover:border-border-highlight/60 transition-all duration-300 shadow-card hover:shadow-card-hover space-y-4 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary tracking-wide">
              Discovery Calls Booked
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-3xl md:text-4xl text-text-primary font-medium tracking-tight">
              {loading ? "..." : meetingsCount}
            </div>
            <span className="text-[11px] font-mono text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded">
              Confirmed
            </span>
          </div>
          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 pt-1 border-t border-border/60">
            <span>Synced to</span>
            <span className="text-text-secondary font-medium">Google Calendar API</span>
          </div>
        </div>
      </section>

      {/* Interactive Pipeline Progression Visualizer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-text-primary">Pipeline Progression Track</h2>
            <span className="text-[11px] font-mono text-text-muted border border-border px-1.5 py-0.2 rounded bg-surface">
              8 Stages
            </span>
          </div>
          <Link
            href="/leads"
            className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors font-mono text-[11px]"
          >
            <span>Open Leads CRM</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PIPELINE_ORDER.map((stage, idx) => {
            const count = loading ? 0 : pipelineCounts[stage.id] ?? 0;
            const hasLeads = count > 0;

            return (
              <Link
                key={stage.id}
                href="/leads"
                className={cn(
                  "p-3.5 rounded-xl border transition-all duration-200 block text-left group shadow-card",
                  hasLeads
                    ? "bg-surface hover:bg-surface-raised border-border hover:border-accent/40"
                    : "bg-surface/50 border-border/40 hover:border-border text-text-muted"
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>0{idx + 1}</span>
                  {hasLeads && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-75" />
                  )}
                </div>
                <div className="mt-2 font-mono text-2xl text-text-primary font-medium tracking-tight">
                  {loading ? "..." : count}
                </div>
                <div className="text-[11px] text-text-secondary truncate mt-1 group-hover:text-text-primary transition-colors">
                  {stage.label}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-text-primary">Live Activity Ledger</h2>
            <span className="text-xs font-mono text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-accent" />
              <span>realtime stream</span>
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-text-secondary">
              Loading activity records...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-secondary">
              No activity recorded yet — configure your ICP criteria in Settings to start sourcing prospects.
            </div>
          ) : (
            recentActivities.map((item) => (
              <Link
                key={item.id}
                href={`/leads/${item.leadId}`}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-raised/80 transition-colors duration-150 block group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/80 flex items-center justify-center font-mono text-xs text-accent font-semibold shrink-0 group-hover:border-accent/40 transition-colors">
                    {item.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                        {item.company}
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-secondary">
                        {item.contact}
                      </span>
                    </div>
                    <div suppressHydrationWarning className="text-xs text-text-secondary prose-ledger leading-relaxed">
                      {item.action}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 md:pl-0">
                  <StageBadge stage={item.stage} />
                  <span suppressHydrationWarning className="text-xs font-mono text-text-muted min-w-[55px] text-right">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
