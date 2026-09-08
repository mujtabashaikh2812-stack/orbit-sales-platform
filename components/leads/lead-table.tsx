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
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, companies, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border pl-9 pr-3 py-1.5 text-xs text-text-primary rounded focus:outline-none focus:border-accent"
          />
        </div>

        {/* Stage Filter Tabs (horizontal scrollable on mobile) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
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
                  "px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5",
                  isSelected
                    ? "bg-surface-raised text-text-primary font-medium border border-border"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                )}
              >
                <span>{s.label}</span>
                <span className="font-mono text-[10px] text-text-secondary">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-border bg-surface rounded overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-secondary space-y-2">
            {leads.length === 0 ? (
              <p>
                No leads yet — configure your ICP criteria in Settings or click &quot;Source New Leads&quot; above to begin.
              </p>
            ) : (
              <p>
                No leads found matching current search query or stage filter. Try adjusting your query or selecting &quot;All leads&quot;.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-ink/50 text-text-secondary font-medium">
                  <th className="py-2.5 px-4 font-normal">Company</th>
                  <th className="py-2.5 px-4 font-normal">Contact</th>
                  <th className="py-2.5 px-4 font-normal">Email & Status</th>
                  <th className="py-2.5 px-4 font-normal">Source</th>
                  <th className="py-2.5 px-4 font-normal">Pipeline Stage</th>
                  <th className="py-2.5 px-4 font-normal text-right">Updated</th>
                  <th className="py-2.5 px-4 font-normal w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => {
                  const isHighlighted = recentlyChangedId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      className={cn(
                        "group hover:bg-surface-raised transition-colors duration-150",
                        isHighlighted && "stage-transition-pulse"
                      )}
                    >
                      {/* Company */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
                        >
                          <span>{lead.company_name}</span>
                          {lead.company_domain && (
                            <span className="text-[11px] font-mono text-text-secondary">
                              ({lead.company_domain})
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-text-primary">{lead.contact_name}</div>
                        {lead.contact_title && (
                          <div className="text-[11px] text-text-secondary truncate max-w-[180px]">
                            {lead.contact_title}
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        {lead.email ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            {lead.email_verified ? (
                              <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-warning shrink-0" />
                            )}
                            <span className="text-text-primary">{lead.email}</span>
                          </div>
                        ) : (
                          <span className="text-text-secondary font-mono text-[11px]">
                            Pending enrichment
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-text-secondary border border-border px-1.5 py-0.5 rounded-sm bg-ink">
                          {lead.source}
                        </span>
                      </td>

                      {/* Stage Selector */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StageBadge stage={lead.stage} />
                          <select
                            value={lead.stage}
                            onChange={(e) =>
                              handleStageChange(lead.id, e.target.value as LeadStage)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 bg-ink border border-border text-[10px] font-mono text-text-secondary rounded px-1.5 py-0.5 focus:opacity-100 focus:outline-none focus:border-accent transition-opacity cursor-pointer"
                          >
                            <option value="sourced">Move to Sourced</option>
                            <option value="enriched">Move to Enriched</option>
                            <option value="contacted">Move to Contacted</option>
                            <option value="replied">Move to Replied</option>
                            <option value="qualified">Move to Qualified</option>
                            <option value="meeting_booked">Move to Meeting Booked</option>
                            <option value="priced">Move to Priced</option>
                            <option value="won">Mark Won</option>
                            <option value="lost">Mark Lost</option>
                          </select>
                        </div>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-text-secondary">
                        {formatDate(lead.stage_updated_at || lead.updated_at)}
                      </td>

                      {/* Link Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-text-secondary hover:text-accent inline-block p-1"
                          title="Open lead dossier"
                        >
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
