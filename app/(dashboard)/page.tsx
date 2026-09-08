"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Plus, Users, Calendar, Sparkles } from "lucide-react";
import { getLeads, LeadDetail } from "@/lib/db/leads";
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
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load dashboard leads:", err);
      } finally {
        setLoading(false);
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
            <span>Manage Leads</span>
          </Link>
        </div>
      </div>

      {/* Metric Counters (Ledger Style, Geist Mono) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-surface">
          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              Active contacted leads
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-text-primary font-medium">
                {contactedCount}
              </span>
              <span className="text-xs text-text-secondary font-mono">leads</span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              Inbound reply rate
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-accent font-medium">
                {replyRate}%
              </span>
              <span className="text-xs text-success font-mono flex items-center">
                ↑ active
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-text-secondary tracking-normal">
              Meetings booked
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl text-text-primary font-medium">
                {meetingsCount}
              </span>
              <span className="text-xs text-text-secondary font-mono">confirmed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Overview (Quiet horizontal kanban per design.md) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Pipeline Progression</h2>
          <Link
            href="/leads"
            className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>View all leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border border-border divide-x divide-y sm:divide-y-0 divide-border bg-surface">
          {PIPELINE_ORDER.map((stage) => (
            <Link
              key={stage.id}
              href={`/leads`}
              className="p-4 hover:bg-surface-raised transition-colors block"
            >
              <div className="text-xs text-text-secondary truncate">
                {stage.label}
              </div>
              <div className="mt-2 font-mono text-xl text-text-primary font-medium">
                {loading ? "..." : pipelineCounts[stage.id] ?? 0}
              </div>
            </Link>
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

        <div className="border border-border divide-y divide-border bg-surface rounded overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-text-secondary">
              Loading activity records...
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-secondary">
              No activity recorded yet — add your ICP criteria in Settings to start sourcing.
            </div>
          ) : (
            recentActivities.map((item) => (
              <Link
                key={item.id}
                href={`/leads/${item.leadId}`}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-raised transition-colors duration-150 block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary hover:text-accent">
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
                  <StageBadge stage={item.stage} />
                  <span className="text-xs font-mono text-text-secondary min-w-[50px] text-right">
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
