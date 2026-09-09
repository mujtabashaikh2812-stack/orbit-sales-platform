"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLeads, getLeadsSync, LeadDetail } from "@/lib/db/leads";
import { StageBadge } from "@/components/leads/stage-badge";
import { MessageSquare, ArrowUpRight, Sparkles, User, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function filterActiveConversations(all: LeadDetail[]) {
  return all.filter(
    (l) => (l.messages && l.messages.length > 0) || ["contacted", "replied", "qualified", "meeting_booked"].includes(l.stage)
  );
}

export default function ConversationsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(() => filterActiveConversations(getLeadsSync()));
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(() => {
    const initial = filterActiveConversations(getLeadsSync());
    return initial[0]?.id || null;
  });
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const all = await getLeads();
    const active = filterActiveConversations(all);
    setLeads(active);
    if (active.length > 0 && !selectedLeadId) {
      setSelectedLeadId(active[0].id);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border pb-5 gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Communications Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time cold outreach threads, Claude AI telemetry, and prospect inbound replies
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-all rounded-xl shadow-sm active:scale-[0.98] w-fit"
          title="Refresh message threads"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Threads</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-text-secondary border border-border bg-surface rounded-2xl shadow-card">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Synchronizing prospect communication threads...
        </div>
      ) : leads.length === 0 ? (
        /* Empty State */
        <div className="border border-border bg-surface p-16 text-center rounded-2xl shadow-card">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl border border-border/80 bg-surface-raised flex items-center justify-center mx-auto text-accent shadow-card">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-medium text-text-primary">
                No active outreach threads detected
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dispatch your first cold email from the Leads Ledger to view live conversations and AI classification telemetry here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/leads"
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 transition-all rounded-xl shadow-md inline-block active:scale-[0.98]"
              >
                View Leads Ledger
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Split Two-Column Thread View */
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border bg-surface rounded-2xl shadow-card divide-y md:divide-y-0 md:divide-x divide-border/80 min-h-[560px] overflow-hidden">
          {/* Left Thread List */}
          <div className="md:col-span-1 divide-y divide-border/60 overflow-y-auto max-h-[640px] bg-ink/20">
            {leads.map((lead) => {
              const isSelected = lead.id === selectedLead?.id;
              const lastMsg = lead.messages?.[lead.messages.length - 1];

              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={cn(
                    "w-full p-4 text-left transition-all duration-150 flex flex-col gap-2 relative",
                    isSelected
                      ? "bg-surface-raised border-l-2 border-accent pl-[14px] shadow-inner"
                      : "hover:bg-surface-raised/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-surface border border-border/80 flex items-center justify-center font-mono text-[10px] text-accent font-semibold shrink-0">
                        {lead.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-text-primary truncate">
                        {lead.company_name}
                      </span>
                    </div>
                    <StageBadge stage={lead.stage} />
                  </div>
                  
                  <div className="text-xs text-text-secondary pl-9 truncate">
                    {lead.contact_name}
                  </div>

                  {lastMsg ? (
                    <div className="text-[11px] text-text-secondary truncate pl-9 flex items-center gap-1.5">
                      <span className={cn(
                        "font-mono text-[10px] px-1 py-0.2 rounded font-medium",
                        lastMsg.direction === "outbound"
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {lastMsg.direction === "outbound" ? "OUT" : "IN"}
                      </span>
                      <span className="truncate">{lastMsg.subject}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-muted italic pl-9">
                      Awaiting initial outreach
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Message Thread Details */}
          <div className="md:col-span-2 p-6 flex flex-col justify-between space-y-6 bg-surface">
            {selectedLead ? (
              <>
                {/* Thread Header */}
                <div className="flex items-start justify-between border-b border-border/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center font-mono text-sm text-accent font-semibold shadow-card">
                      {selectedLead.company_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-serif text-lg text-text-primary font-medium">
                          {selectedLead.company_name}
                        </h2>
                        <StageBadge stage={selectedLead.stage} />
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-2 font-mono">
                        <span className="text-text-primary">{selectedLead.contact_name}</span>
                        <span>·</span>
                        <span className="text-text-muted">{selectedLead.email || "No email"}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/leads/${selectedLead.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1 font-mono bg-surface-raised border border-border/70 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                  >
                    <span>Open dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Messages Stream */}
                <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
                  {selectedLead.messages && selectedLead.messages.length > 0 ? (
                    selectedLead.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-4 rounded-2xl border text-xs space-y-2.5 max-w-xl shadow-sm transition-all",
                          msg.direction === "outbound"
                            ? "bg-surface-raised border-border/80 ml-auto"
                            : "bg-gradient-to-br from-surface to-ink border-accent/30 mr-auto"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/50 pb-2">
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            {msg.direction === "outbound" ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-accent" />
                                <span className="text-accent font-medium">Orbit Engine (Claude AI)</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-text-primary font-medium">{selectedLead.contact_name}</span>
                              </>
                            )}
                          </span>
                          <span className="text-text-muted text-[10px]">
                            {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div className="font-medium text-text-primary text-xs">
                          {msg.subject}
                        </div>
                        <div className="text-text-secondary whitespace-pre-line leading-relaxed bg-ink/30 p-3 rounded-xl border border-border/40 text-[11px]">
                          {msg.body}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-xs text-text-secondary border border-dashed border-border/80 rounded-2xl bg-ink/20">
                      <Sparkles className="w-5 h-5 text-accent/40 mx-auto mb-2" />
                      No emails transmitted in this thread yet.
                    </div>
                  )}
                </div>

                {/* Quick Reply Link */}
                <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-text-muted font-mono">
                    Thread ID: <code className="text-text-secondary bg-surface-raised px-2 py-0.5 rounded border border-border/60">{selectedLead.id}</code>
                  </span>
                  <Link
                    href={`/leads/${selectedLead.id}`}
                    className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 transition-all rounded-xl shadow-md inline-flex items-center gap-1.5 active:scale-[0.98]"
                  >
                    <span>Manage Thread in Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-text-secondary my-auto p-12">
                Select a conversation thread from the left ledger to view message history.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
