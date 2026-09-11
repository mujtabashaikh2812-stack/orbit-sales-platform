"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LeadDetail, updateLeadStage, getLeads } from "@/lib/db/leads";
import { LeadStage } from "@/lib/types";
import { StageBadge } from "./stage-badge";
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Check, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  initialLeads: LeadDetail[];
}

const ALL_STAGES: { id: string; label: string }[] = [
  { id: "all", label: "All leads" },
  { id: "sourced", label: "Sourced" },
  { id: "enriched", label: "Enriched" },
  { id: "contacted", label: "Contacted" },
  { id: "replied", label: "Replied" },
  { id: "qualified", label: "Qualified" },
  { id: "meeting_booked", label: "Meeting booked" },
  { id: "priced", label: "Priced" },
  { id: "closed", label: "Closed" },
];

function renderSourceBadge(source: LeadDetail["source"]) {
  switch (source) {
    case "google_maps":
      return (
        <span className="font-mono text-[10px] text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md bg-sky-500/10 whitespace-nowrap">
          Google Maps
        </span>
      );
    case "contra":
      return (
        <span className="font-mono text-[10px] text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md bg-purple-500/10 whitespace-nowrap">
          Contra
        </span>
      );
    case "yellow_pages":
      return (
        <span className="font-mono text-[10px] text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md bg-amber-500/10 whitespace-nowrap">
          YellowPages
        </span>
      );
    case "apollo":
      return (
        <span className="font-mono text-[10px] text-accent border border-accent/30 px-2 py-0.5 rounded-md bg-accent/10 whitespace-nowrap">
          Apollo.io
        </span>
      );
    case "hunter":
      return (
        <span className="font-mono text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md bg-emerald-500/10 whitespace-nowrap">
          Hunter.io
        </span>
      );
    default:
      return (
        <span className="font-mono text-[10px] text-text-secondary border border-border px-2 py-0.5 rounded-md bg-surface-raised uppercase whitespace-nowrap">
          {source}
        </span>
      );
  }
}

export function LeadTable({ initialLeads }: LeadTableProps) {
  const [leads, setLeads] = useState<LeadDetail[]>(initialLeads);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyChangedId, setRecentlyChangedId] = useState<string | null>(null);
  const [cadenceLoading, setCadenceLoading] = useState(false);
  const [cadenceStatusMsg, setCadenceStatusMsg] = useState<string | null>(null);

  const activeCadenceCount = leads.filter((l) => l.cadence_status === "active").length;

  async function handleRefresh() {
    const fresh = await getLeads();
    setLeads(fresh);
  }

  async function handleBatchEnroll() {
    setCadenceLoading(true);
    setCadenceStatusMsg(null);
    try {
      const res = await fetch("/api/cadence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enroll" }),
      });
      const data = await res.json();
      if (data.enrolledCount > 0) {
        setCadenceStatusMsg(`Enrolled & dispatched Touch 1 for ${data.enrolledCount} prospect(s)!`);
        await handleRefresh();
      } else {
        setCadenceStatusMsg("No un-enrolled leads with emails found.");
      }
    } catch {
      setCadenceStatusMsg("Failed to batch enroll leads.");
    } finally {
      setCadenceLoading(false);
    }
  }

  async function handleRunCadenceCycle() {
    setCadenceLoading(true);
    setCadenceStatusMsg(null);
    try {
      const res = await fetch("/api/cadence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_cycle", forceAll: true }),
      });
      const data = await res.json();
      setCadenceStatusMsg(`Cadence cycle executed across ${data.processed || 0} active lead(s).`);
      await handleRefresh();
    } catch {
      setCadenceStatusMsg("Failed to execute cadence cycle.");
    } finally {
      setCadenceLoading(false);
    }
  }

  // Filter leads based on stage and search query
  const filteredLeads = leads.filter((lead) => {
    const matchesStage =
      selectedStage === "all"
        ? true
        : selectedStage === "closed"
        ? lead.stage === "won" || lead.stage === "lost"
        : lead.stage === selectedStage;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      lead.company_name.toLowerCase().includes(query) ||
      lead.contact_name.toLowerCase().includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.company_domain && lead.company_domain.toLowerCase().includes(query));

    return matchesStage && matchesSearch;
  });

  async function handleStageChange(leadId: string, newStage: LeadStage) {
    const updated = await updateLeadStage(leadId, newStage, "owner");
    if (updated) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
      // Trigger the 600ms transition highlight per design.md
      setRecentlyChangedId(leadId);
      setTimeout(() => {
        setRecentlyChangedId(null);
      }, 600);
    }
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border pl-10 pr-4 py-2 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 shadow-sm transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {ALL_STAGES.map((s) => {
            const count =
              s.id === "all"
                ? leads.length
                : s.id === "closed"
                ? leads.filter((l) => l.stage === "won" || l.stage === "lost").length
                : leads.filter((l) => l.stage === s.id).length;

            const isSelected = selectedStage === s.id;

            return (
              <button
                key={s.id}
                onClick={() => setSelectedStage(s.id)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-all duration-150 whitespace-nowrap flex items-center gap-2 font-mono text-[11px]",
                  isSelected
                    ? "bg-accent/15 text-accent font-medium border border-accent/35 shadow-sm"
                    : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border/80"
                )}
              >
                <span>{s.label}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isSelected ? "bg-accent/20 text-accent font-bold" : "bg-surface-raised text-text-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Pilot Cadence Status & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-surface-raised/40">
        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-text-primary">
              <span>Autonomous Cadence</span>
              {activeCadenceCount > 0 ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeCadenceCount} Active
                </span>
              ) : (
                <span className="text-[10px] font-mono text-text-secondary px-2 py-0.5 rounded-full bg-surface border border-border">
                  0 Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-secondary">
              Contacts leads, sends multi-touch follow-ups, and handles replies until booked or rejected.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            disabled={cadenceLoading}
            onClick={handleBatchEnroll}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
          >
            {cadenceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Enroll All Enriched</span>
          </button>

          <button
            type="button"
            disabled={cadenceLoading || activeCadenceCount === 0}
            onClick={handleRunCadenceCycle}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border hover:border-accent/40 text-text-primary text-xs font-medium transition disabled:opacity-50"
          >
            {cadenceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-accent" />}
            <span>Run Cadence Cycle</span>
          </button>
        </div>
      </div>

      {/* Cadence Status Message */}
      {cadenceStatusMsg && (
        <div className="text-xs px-3.5 py-2.5 rounded-xl border border-accent/40 bg-accent/10 text-accent font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{cadenceStatusMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setCadenceStatusMsg(null)}
            className="text-text-muted hover:text-text-primary text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ledger Table Container */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
        {filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-xs text-text-secondary space-y-2">
            {leads.length === 0 ? (
              <div className="max-w-md mx-auto space-y-2">
                <div className="text-sm text-text-primary font-medium">No prospects in database</div>
                <p className="text-text-muted">
                  Configure your ICP criteria in Settings or click &quot;Source from ICP&quot; above to initiate autonomous prospecting.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-text-primary font-medium">No results found</div>
                <p className="text-text-muted">
                  No prospects matched &quot;{searchQuery}&quot; in stage &quot;{selectedStage}&quot;. Try clearing filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View (< md screens) */}
            <div className="md:hidden divide-y divide-border/60">
              {filteredLeads.map((lead) => {
                const isHighlighted = recentlyChangedId === lead.id;

                return (
                  <div
                    key={lead.id}
                    className={cn(
                      "p-4 space-y-3 transition-colors duration-150 hover:bg-surface-raised/50",
                      isHighlighted && "stage-transition-pulse"
                    )}
                  >
                    {/* Top Row: Company & Action */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="flex items-start gap-2.5 flex-1 min-w-0"
                      >
                        <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border flex items-center justify-center font-mono text-xs text-accent font-semibold shrink-0 mt-0.5">
                          {lead.company_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text-primary text-sm truncate flex items-center gap-1.5">
                            <span>{lead.company_name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          </div>
                          <div className="text-[11px] font-mono text-text-secondary truncate mt-0.5">
                            {lead.contact_name} {lead.contact_title && `· ${lead.contact_title}`}
                          </div>
                        </div>
                      </Link>

                      <div className="shrink-0">
                        <StageBadge stage={lead.stage} />
                      </div>
                    </div>

                    {/* Middle Row: Deliverability & Cadence Status */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      {lead.email ? (
                        <div className="flex items-center gap-1.5 truncate max-w-full">
                          {lead.email_verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Unconfirmed</span>
                            </span>
                          )}
                          <span className="text-text-secondary truncate text-[10px]">{lead.email}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic text-[10px]">No email on file</span>
                      )}

                      {lead.cadence_status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Touch {lead.cadence_step || 1}/3
                        </span>
                      ) : lead.cadence_status === "completed_booked" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🎉 Booked
                        </span>
                      ) : lead.cadence_status === "completed_lost" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          🛑 Lost
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Row: Quick Stage Selector & Details */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-text-muted">Move:</span>
                        <select
                          value={lead.stage}
                          onChange={(e) =>
                            handleStageChange(lead.id, e.target.value as LeadStage)
                          }
                          className="bg-white border border-border text-[11px] font-mono text-text-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-accent shadow-xs cursor-pointer"
                        >
                          <option value="sourced">Sourced</option>
                          <option value="enriched">Enriched</option>
                          <option value="contacted">Contacted</option>
                          <option value="replied">Replied</option>
                          <option value="qualified">Qualified</option>
                          <option value="meeting_booked">Meeting Booked</option>
                          <option value="priced">Priced</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>

                      <span className="text-[10px] font-mono text-text-muted">
                        {formatDate(lead.stage_updated_at || lead.updated_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-raised/80 font-mono text-[10px] text-text-muted uppercase tracking-wider">
                    <th className="py-3 px-5 font-medium">Prospect / Company</th>
                    <th className="py-3 px-5 font-medium">Contact Person</th>
                    <th className="py-3 px-5 font-medium">Deliverability</th>
                    <th className="py-3 px-5 font-medium">Source</th>
                    <th className="py-3 px-5 font-medium">Cadence Auto-Pilot</th>
                    <th className="py-3 px-5 font-medium">Pipeline Stage</th>
                    <th className="py-3 px-5 font-medium text-right">Last Updated</th>
                    <th className="py-3 px-5 font-medium text-right w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {filteredLeads.map((lead) => {
                    const isHighlighted = recentlyChangedId === lead.id;

                    return (
                      <tr
                        key={lead.id}
                        className={cn(
                          "group hover:bg-surface-raised/70 transition-colors duration-150",
                          isHighlighted && "stage-transition-pulse"
                        )}
                      >
                        {/* Company */}
                        <td className="py-3.5 px-5">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="flex items-center gap-3 group/link"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center font-mono text-xs text-accent font-semibold group-hover/link:border-accent/50 transition-colors shrink-0">
                              {lead.company_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary group-hover/link:text-accent transition-colors">
                                {lead.company_name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted mt-0.5">
                                {lead.company_domain && <span>{lead.company_domain}</span>}
                                {lead.location && (
                                  <span className="text-[10px] text-text-secondary truncate max-w-[140px]" title={lead.location}>
                                    · {lead.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-5">
                          <div className="text-text-primary font-medium">{lead.contact_name}</div>
                          <div className="text-[11px] text-text-muted truncate max-w-[190px] mt-0.5 flex items-center gap-1.5">
                            {lead.contact_title && <span>{lead.contact_title}</span>}
                            {lead.phone && !lead.contact_title && <span className="font-mono text-[10px] text-accent">{lead.phone}</span>}
                          </div>
                        </td>

                        {/* Deliverability Email */}
                        <td className="py-3.5 px-5">
                          {lead.email ? (
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              {lead.email_verified ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                  <AlertCircle className="w-3 h-3 shrink-0 text-amber-600" />
                                  <span>Unconfirmed</span>
                                </span>
                              )}
                              <span className="text-text-secondary truncate max-w-[170px]" title={lead.email}>{lead.email}</span>
                            </div>
                          ) : lead.phone ? (
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-accent">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/10 border border-accent/25">Phone</span>
                              <span>{lead.phone}</span>
                            </div>
                          ) : (
                            <span className="text-text-muted font-mono text-[11px] italic">
                              Pending Hunter check
                            </span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-5">
                          {renderSourceBadge(lead.source)}
                        </td>

                        {/* Cadence Status */}
                        <td className="py-3.5 px-5">
                          {lead.cadence_status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Touch {lead.cadence_step || 1}/3
                            </span>
                          ) : lead.cadence_status === "completed_booked" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              🎉 Booked
                            </span>
                          ) : lead.cadence_status === "completed_lost" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                              🛑 Lost
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-text-muted font-mono whitespace-nowrap">
                              Idle
                            </span>
                          )}
                        </td>

                        {/* Stage Selector */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <StageBadge stage={lead.stage} />
                            <select
                              value={lead.stage}
                              onChange={(e) =>
                                handleStageChange(lead.id, e.target.value as LeadStage)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 bg-surface border border-border text-[10px] font-mono text-text-secondary rounded-md px-2 py-0.5 focus:opacity-100 focus:outline-none focus:border-accent shadow-sm transition-all cursor-pointer"
                            >
                              <option value="sourced">Move: Sourced</option>
                              <option value="enriched">Move: Enriched</option>
                              <option value="contacted">Move: Contacted</option>
                              <option value="replied">Move: Replied</option>
                              <option value="qualified">Move: Qualified</option>
                              <option value="meeting_booked">Move: Meeting Booked</option>
                              <option value="priced">Move: Priced</option>
                              <option value="won">Mark: Won</option>
                              <option value="lost">Mark: Lost</option>
                            </select>
                          </div>
                        </td>

                        {/* Updated Date */}
                        <td className="py-3.5 px-5 text-right font-mono text-[11px] text-text-muted">
                          {formatDate(lead.stage_updated_at || lead.updated_at)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-accent p-1 transition-colors"
                            title="Open lead dossier"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
