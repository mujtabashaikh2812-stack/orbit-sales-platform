"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getLeadById, 
  updateLeadStage, 
  updateLead, 
  LeadDetail 
} from "@/lib/db/leads";
import { LeadStage } from "@/lib/types";
import { StageBadge } from "@/components/leads/stage-badge";
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Send, 
  Calendar, 
  FileText, 
  Building2, 
  User, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_SEQUENCE: LeadStage[] = [
  "sourced",
  "enriched",
  "contacted",
  "replied",
  "qualified",
  "meeting_booked",
  "priced",
];

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteInput, setQuoteInput] = useState<number | "">("");
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getLeadById(resolvedParams.id);
      setLead(data);
      if (data?.deal?.quoted_amount) {
        setQuoteInput(data.deal.quoted_amount);
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  async function handleStageAdvance(targetStage: LeadStage) {
    if (!lead) return;
    const updated = await updateLeadStage(lead.id, targetStage, "owner");
    if (updated) {
      setLead(updated);
    }
  }

  function handleSaveQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!lead || quoteInput === "") return;

    const updatedDeal = {
      id: lead.deal?.id || `deal-${Date.now()}`,
      lead_id: lead.id,
      quoted_amount: Number(quoteInput),
      currency: "USD",
      status: "draft" as const,
      created_at: lead.deal?.created_at || new Date().toISOString(),
    };

    setLead({
      ...lead,
      deal: updatedDeal,
    });
    setQuoteSaved(true);
    setTimeout(() => setQuoteSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-text-secondary">
        Loading lead ledger dossier...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link
          href="/leads"
          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
        <div className="border border-border bg-surface p-12 text-center rounded text-xs text-text-secondary">
          Lead record not found in ledger.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back link & Actions */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/leads"
          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads Ledger</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
          <span>Source:</span>
          <span className="border border-border px-1.5 py-0.5 rounded-sm bg-surface text-text-primary">
            {lead.source}
          </span>
        </div>
      </div>

      {/* Header Profile set in Fraunces serif per design.md */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-text-primary font-medium tracking-tight">
              {lead.company_name}
            </h1>
            <StageBadge stage={lead.stage} />
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary mt-1.5">
            <span className="text-text-primary font-medium">{lead.contact_name}</span>
            {lead.contact_title && <span>· {lead.contact_title}</span>}
            {lead.company_domain && (
              <>
                <span>·</span>
                <a
                  href={`https://${lead.company_domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent inline-flex items-center gap-1"
                >
                  <span>{lead.company_domain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Quick Advance Controls */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Pipeline stage:</label>
          <select
            value={lead.stage}
            onChange={(e) => handleStageAdvance(e.target.value as LeadStage)}
            className="bg-surface border border-border text-xs font-mono text-text-primary px-3 py-1.5 rounded focus:outline-none focus:border-accent"
          >
            <option value="sourced">Sourced</option>
            <option value="enriched">Enriched</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="qualified">Qualified</option>
            <option value="meeting_booked">Meeting booked</option>
            <option value="priced">Priced</option>
            <option value="won">Closed (Won)</option>
            <option value="lost">Closed (Lost)</option>
          </select>
        </div>
      </div>

      {/* Pipeline Stage Progression Stepper */}
      <div className="border border-border bg-surface p-4 rounded">
        <div className="text-[11px] font-mono text-text-secondary mb-3 flex justify-between items-center">
          <span>PIPELINE PROGRESSION</span>
          <span className="text-[10px]">
            Stage updated: {new Date(lead.stage_updated_at || lead.updated_at).toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {PIPELINE_SEQUENCE.map((s, idx) => {
            const isCurrent = lead.stage === s;
            const currentIndex = PIPELINE_SEQUENCE.indexOf(lead.stage);
            const isPast = currentIndex > idx;

            return (
              <button
                key={s}
                onClick={() => handleStageAdvance(s)}
                className={cn(
                  "p-2 text-left rounded border transition-colors duration-150",
                  isCurrent
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : isPast
                    ? "border-border bg-surface-raised text-text-primary"
                    : "border-border/50 bg-ink/40 text-text-secondary hover:text-text-primary"
                )}
              >
                <div className="text-[10px] font-mono">
                  {isCurrent ? "● ACTIVE" : isPast ? "✓ PASSED" : `0${idx + 1}`}
                </div>
                <div className="text-xs capitalize mt-1 truncate">
                  {s.replace("_", " ")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Company Dossier */}
          <div className="border border-border bg-surface p-6 rounded space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building2 className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium text-text-primary">
                Prospect Dossier & Context
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-secondary">Verified Email:</span>
                <div className="mt-1 flex items-center gap-1.5 font-mono">
                  {lead.email ? (
                    <>
                      {lead.email_verified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-warning" />
                      )}
                      <span className="text-text-primary">{lead.email}</span>
                    </>
                  ) : (
                    <span className="text-text-secondary">Unverified</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-text-secondary">Job Title / Function:</span>
                <div className="mt-1 text-text-primary">
                  {lead.contact_title || "Not recorded"}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs pt-2">
              <span className="text-text-secondary">Company Summary & Problem Focus:</span>
              <p className="text-text-primary leading-relaxed bg-ink/40 border border-border p-3 rounded prose-ledger">
                {lead.company_summary || "No company summary recorded yet."}
              </p>
            </div>
          </div>

          {/* Captured Requirements (AI Extracted) */}
          <div className="border border-border bg-surface p-6 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-medium text-text-primary">
                  AI-Extracted Requirements
                </h2>
              </div>
              {lead.requirements && (
                <span className="text-[10px] font-mono text-text-secondary">
                  Extracted {new Date(lead.requirements.extracted_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {lead.requirements ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs text-text-secondary">Project Overview</div>
                  <div className="text-sm text-text-primary bg-ink/40 border border-border p-3 rounded prose-ledger">
                    {lead.requirements.project_description || "Pending further conversation."}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-border bg-surface-raised p-3 rounded space-y-1">
                    <span className="text-[11px] text-text-secondary font-mono">BUDGET SIGNAL</span>
                    <div className="text-xs text-text-primary font-medium">
                      {lead.requirements.budget_hint || "Not volunteered yet"}
                    </div>
                  </div>

                  <div className="border border-border bg-surface-raised p-3 rounded space-y-1">
                    <span className="text-[11px] text-text-secondary font-mono">TIMELINE SIGNAL</span>
                    <div className="text-xs text-text-primary font-medium">
                      {lead.requirements.timeline_hint || "Not specified"}
                    </div>
                  </div>
                </div>

                {lead.requirements.key_requirements && lead.requirements.key_requirements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-text-secondary font-medium">Key Requirements Checklist</div>
                    <div className="border border-border divide-y divide-border bg-ink/40 rounded">
                      {lead.requirements.key_requirements.map((req, i) => (
                        <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                          <span className="text-text-primary">{req.item}</span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.5 rounded-sm border uppercase",
                              req.priority === "must-have"
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-border text-text-secondary"
                            )}
                          >
                            {req.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-text-secondary border border-dashed border-border rounded">
                Requirements will be automatically synthesized here as the AI conducts discovery over email.
              </div>
            )}
          </div>

          {/* Pricing & Human Quote Step */}
          <div className="border border-border bg-surface p-6 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-medium text-text-primary">
                  Deal Pricing & Quote (Human-in-the-Loop)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-text-secondary border border-border px-1.5 py-0.5 rounded-sm">
                Owner controls price
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Per development rules, the AI never suggests or improvises pricing. Once you review requirements, enter your fixed quote below so the AI can relay it to the lead.
            </p>

            <form onSubmit={handleSaveQuote} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-secondary">
                    $
                  </span>
                  <input
                    type="number"
                    value={quoteInput}
                    onChange={(e) =>
                      setQuoteInput(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 12000"
                    className="w-full bg-ink border border-border pl-7 pr-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
                >
                  Set quote amount
                </button>
                {quoteSaved && (
                  <span className="text-xs text-success font-mono">
                    ✓ Saved to ledger
                  </span>
                )}
              </div>

              {lead.deal && (
                <div className="text-xs font-mono text-text-secondary flex items-center gap-3 pt-2">
                  <span>Current quote: <strong className="text-accent">${lead.deal.quoted_amount.toLocaleString()} {lead.deal.currency}</strong></span>
                  <span>·</span>
                  <span>Status: <strong className="text-text-primary">{lead.deal.status}</strong></span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column (Audit Trail & Activity) */}
        <div className="space-y-6">
          {/* Scheduled Meetings Card */}
          {lead.meetings && lead.meetings.length > 0 && (
            <div className="border border-border bg-surface p-5 rounded space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2 text-sm font-medium text-text-primary">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Scheduled Meeting</span>
              </div>
              {lead.meetings.map((m) => (
                <div key={m.id} className="space-y-1.5 text-xs">
                  <div className="font-mono text-text-primary">
                    {new Date(m.scheduled_at).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-text-secondary">{m.notes}</div>
                  <span className="inline-block text-[10px] font-mono border border-success/30 bg-success/10 text-success px-1.5 py-0.5 rounded-sm">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Immutable Stage Audit Trail */}
          <div className="border border-border bg-surface p-5 rounded space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2 text-sm font-medium text-text-primary">
              <Clock className="w-4 h-4 text-accent" />
              <span>Stage Audit History</span>
            </div>

            <div className="space-y-3">
              {lead.stage_history && lead.stage_history.length > 0 ? (
                lead.stage_history.map((sh) => (
                  <div
                    key={sh.id}
                    className="border-l-2 border-border pl-3 py-1 space-y-0.5 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-text-primary font-medium">
                        {sh.to_stage}
                      </span>
                      {sh.from_stage && (
                        <span className="text-text-secondary text-[10px]">
                          (from {sh.from_stage})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-secondary flex justify-between">
                      <span>{new Date(sh.changed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(sh.changed_at).toLocaleDateString()}</span>
                      <span className="border border-border px-1 rounded-xs bg-ink uppercase">
                        {sh.triggered_by}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-secondary">
                  Initial stage: {lead.stage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
