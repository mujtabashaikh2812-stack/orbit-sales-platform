"use client";

import { useState } from "react";
import Link from "next/link";
import { LeadDetail, updateLeadStage } from "@/lib/db/leads";
import { LeadStage } from "@/lib/types";
import { StageBadge } from "./stage-badge";
import { Search, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
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

export function LeadTable({ initialLeads }: LeadTableProps) {
  const [leads, setLeads] = useState<LeadDetail[]>(initialLeads);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyChangedId, setRecentlyChangedId] = useState<string | null>(null);

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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised/80 font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-5 font-medium">Prospect / Company</th>
                  <th className="py-3 px-5 font-medium">Contact Person</th>
                  <th className="py-3 px-5 font-medium">Deliverability</th>
                  <th className="py-3 px-5 font-medium">Source</th>
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
                            {lead.company_domain && (
                              <div className="text-[11px] font-mono text-text-muted mt-0.5">
                                {lead.company_domain}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-5">
                        <div className="text-text-primary font-medium">{lead.contact_name}</div>
                        {lead.contact_title && (
                          <div className="text-[11px] text-text-muted truncate max-w-[190px] mt-0.5">
                            {lead.contact_title}
                          </div>
                        )}
                      </td>

                      {/* Deliverability Email */}
                      <td className="py-3.5 px-5">
                        {lead.email ? (
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            {lead.email_verified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px]">
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full text-[10px]">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span>Unconfirmed</span>
                              </span>
                            )}
                            <span className="text-text-secondary truncate max-w-[170px]" title={lead.email}>{lead.email}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted font-mono text-[11px] italic">
                            Pending Hunter check
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-[10px] text-text-secondary border border-border px-2 py-0.5 rounded bg-surface-raised uppercase">
                          {lead.source}
                        </span>
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
                            className="opacity-0 group-hover:opacity-100 bg-ink border border-border text-[10px] font-mono text-text-secondary rounded-md px-2 py-0.5 focus:opacity-100 focus:outline-none focus:border-accent transition-all cursor-pointer"
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
        )}
      </div>
    </div>
  );
}
