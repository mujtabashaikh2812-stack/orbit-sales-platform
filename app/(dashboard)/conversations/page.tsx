"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLeads, LeadDetail } from "@/lib/db/leads";
import { StageBadge } from "@/components/leads/stage-badge";
import { MessageSquare, ArrowUpRight, Sparkles, User, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConversationsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const all = await getLeads();
    // Leads with message history or in outreach stages
    const active = all.filter(
      (l) => (l.messages && l.messages.length > 0) || ["contacted", "replied", "qualified", "meeting_booked"].includes(l.stage)
    );
    setLeads(active);
    if (active.length > 0 && !selectedLeadId) {
      setSelectedLeadId(active[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-baseline justify-between border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Conversations Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Cold outreach threads, AI messages, and prospect replies
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="p-1.5 text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-colors rounded"
          title="Refresh threads"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-text-secondary border border-border bg-surface rounded">
          Loading conversation threads...
        </div>
      ) : leads.length === 0 ? (
        /* Empty State */
        <div className="border border-border bg-surface p-12 text-center rounded">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-10 h-10 rounded-full border border-border bg-surface-raised flex items-center justify-center mx-auto text-text-secondary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-text-primary">
                No active conversations yet
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Send your first cold email from the Leads dossier to populate message threads here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/leads"
                className="px-3.5 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded inline-block"
              >
                View leads ledger
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Split Two-Column Thread View */
        <div className="grid grid-cols-1 md:grid-cols-3 border border-border bg-surface rounded divide-y md:divide-y-0 md:divide-x divide-border min-h-[500px]">
          {/* Left Thread List */}
          <div className="md:col-span-1 divide-y divide-border overflow-y-auto max-h-[600px]">
            {leads.map((lead) => {
              const isSelected = lead.id === selectedLead?.id;
              const lastMsg = lead.messages?.[lead.messages.length - 1];

              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={cn(
                    "w-full p-4 text-left transition-colors duration-150 flex flex-col gap-1.5",
                    isSelected
                      ? "bg-surface-raised border-l-2 border-accent pl-[14px]"
                      : "hover:bg-surface-raised/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-text-primary truncate">
                      {lead.company_name}
                    </span>
                    <StageBadge stage={lead.stage} />
                  </div>
                  <div className="text-xs text-text-secondary">
                    {lead.contact_name}
                  </div>
                  {lastMsg ? (
                    <div className="text-[11px] text-text-secondary truncate mt-1">
                      <span className="font-mono text-[10px] text-accent">
                        {lastMsg.direction === "outbound" ? "Outbound: " : "Inbound: "}
                      </span>
                      {lastMsg.subject}
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-secondary italic mt-1">
                      Awaiting initial outreach
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Message Thread Details */}
          <div className="md:col-span-2 p-6 flex flex-col justify-between space-y-6">
            {selectedLead ? (
              <>
                {/* Thread Header */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg text-text-primary font-medium">
                        {selectedLead.company_name}
                      </h2>
                      <StageBadge stage={selectedLead.stage} />
                    </div>
                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-2 font-mono">
                      <span>{selectedLead.contact_name}</span>
                      <span>·</span>
                      <span>{selectedLead.email || "No email"}</span>
                    </div>
                  </div>
                  <Link
                    href={`/leads/${selectedLead.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Open dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Messages Stream */}
                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                  {selectedLead.messages && selectedLead.messages.length > 0 ? (
                    selectedLead.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-4 rounded border text-xs space-y-2 max-w-xl",
                          msg.direction === "outbound"
                            ? "bg-surface-raised border-border ml-auto"
                            : "bg-ink border-accent/30 mr-auto"
                        )}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/50 pb-1.5">
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            {msg.direction === "outbound" ? (
                              <>
                                <Sparkles className="w-3 h-3 text-accent" />
                                <span>Orbit Operator (Claude AI)</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 text-success" />
                                <span className="text-text-primary">{selectedLead.contact_name}</span>
                              </>
                            )}
                          </span>
                          <span className="text-text-secondary text-[10px]">
                            {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div className="font-medium text-text-primary">
                          {msg.subject}
                        </div>
                        <div className="text-text-secondary whitespace-pre-line leading-relaxed prose-ledger">
                          {msg.body}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-text-secondary border border-dashed border-border rounded">
                      No emails sent yet in this thread.
                    </div>
                  )}
                </div>

                {/* Quick Reply Link */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-secondary font-mono">
                    Gmail Thread: <code className="text-text-primary">{selectedLead.id}</code>
                  </span>
                  <Link
                    href={`/leads/${selectedLead.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded inline-flex items-center gap-1.5"
                  >
                    <span>Manage thread in dossier</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-text-secondary my-auto">
                Select a conversation thread to view message history.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
