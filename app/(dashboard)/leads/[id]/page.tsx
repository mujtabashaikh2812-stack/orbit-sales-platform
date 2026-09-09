"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getLeadById, 
  getLeadByIdSync,
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
import { OutreachModal } from "@/components/outreach/outreach-modal";
import { ReplySimulatorModal } from "@/components/leads/reply-simulator-modal";
import { MeetingBookingModal } from "@/components/meetings/meeting-booking-modal";
import { QuoteRelayModal } from "@/components/deals/quote-relay-modal";
import { CadenceTimelineCard } from "@/components/cadence/cadence-timeline-card";

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

  const [lead, setLead] = useState<LeadDetail | null>(() => getLeadByIdSync(resolvedParams.id));
  const [loading, setLoading] = useState(false);
  const [quoteInput, setQuoteInput] = useState<number | "">(() => {
    const initial = getLeadByIdSync(resolvedParams.id);
    return initial?.deal?.quoted_amount ?? "";
  });
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  async function loadLead() {
    const data = await getLeadById(resolvedParams.id);
    if (data) {
      setLead(data);
      if (data?.deal?.quoted_amount) {
        setQuoteInput(data.deal.quoted_amount);
      }
    }
  }

  useEffect(() => {
    loadLead();
  }, [resolvedParams.id]);

  async function handleStageAdvance(targetStage: LeadStage) {
    if (!lead) return;
    const updated = await updateLeadStage(lead.id, targetStage, "owner");
    if (updated) {
      setLead(updated);
    }
  }

  async function handleEnrichLead() {
    if (!lead) return;
    setEnriching(true);
    setEnrichError(null);

    try {
      const res = await fetch("/api/leads/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });

      const data = await res.json();
      if (data.success && data.lead) {
        setLead(data.lead);
      } else {
        setEnrichError(data.error || "Enrichment failed");
      }
    } catch {
      setEnrichError("Failed to connect to enrichment service");
    } finally {
      setEnriching(false);
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

  async function handleCloseDeal(outcome: "won" | "lost") {
    if (!lead) return;
    try {
      const res = await fetch("/api/deals/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, outcome }),
      });
      const data = await res.json();
      if (data.success) {
        await loadLead();
      }
    } catch {
      // error handled
    }
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

      {/* Header Profile with Luxury Monogram & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border/80 flex items-center justify-center font-mono text-base text-accent font-semibold shadow-card shrink-0">
            {lead.company_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl md:text-3xl text-text-primary font-medium tracking-tight">
                {lead.company_name}
              </h1>
              <StageBadge stage={lead.stage} />
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-secondary mt-1">
              <span className="text-text-primary font-medium">{lead.contact_name}</span>
              {lead.contact_title && <span>· {lead.contact_title}</span>}
              {lead.company_domain && (
                <>
                  <span>·</span>
                  <a
                    href={`https://${lead.company_domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>{lead.company_domain}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Advance Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOutreachModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 shadow-sm transition-all rounded-xl active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Draft Cold Outreach</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMeetingModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary bg-surface-raised border border-border hover:border-accent/50 hover:text-accent transition-all rounded-xl shadow-sm active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>Book Meeting</span>
          </button>

          <div className="flex items-center gap-2">
            <select
              value={lead.stage}
              onChange={(e) => handleStageAdvance(e.target.value as LeadStage)}
              className="bg-surface-raised border border-border text-xs font-mono text-text-primary px-3 py-2 rounded-xl focus:outline-none focus:border-accent shadow-sm cursor-pointer"
            >
              <option value="sourced">Stage: Sourced</option>
              <option value="enriched">Stage: Enriched</option>
              <option value="contacted">Stage: Contacted</option>
              <option value="replied">Stage: Replied</option>
              <option value="qualified">Stage: Qualified</option>
              <option value="meeting_booked">Stage: Meeting booked</option>
              <option value="priced">Stage: Priced</option>
              <option value="won">Stage: Closed (Won)</option>
              <option value="lost">Stage: Closed (Lost)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Stage Progression Stepper */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-surface to-surface-raised p-5 shadow-card">
        <div className="text-[10px] font-mono text-text-muted mb-3 flex justify-between items-center tracking-wider uppercase">
          <span>PIPELINE PROGRESSION SEQUENCE</span>
          <span>
            Updated: {new Date(lead.stage_updated_at || lead.updated_at).toLocaleString()}
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
                  "p-2.5 text-left rounded-xl border transition-all duration-150 shadow-sm",
                  isCurrent
                    ? "border-accent/60 bg-accent/15 text-accent font-medium shadow-[0_0_15px_rgba(212,163,89,0.15)]"
                    : isPast
                    ? "border-border bg-surface-raised text-text-primary hover:border-text-muted"
                    : "border-border/40 bg-ink/40 text-text-muted hover:text-text-secondary hover:border-border"
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

      {/* Autonomous Cadence & Auto-Pilot Engine */}
      <CadenceTimelineCard
        lead={lead}
        onLeadUpdated={(updated) => setLead(updated)}
      />

      {/* Two-Column Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Company Dossier */}
          <div className="rounded-2xl border border-border bg-surface shadow-card p-6 space-y-5 hover:border-border/80 transition-all">
            <div className="flex items-center gap-2 border-b border-border/80 pb-3.5">
              <Building2 className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium text-text-primary tracking-wide">
                Prospect Dossier & Operational Context
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-raised border border-border/60 space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Direct Email</span>
                <div className="flex items-center gap-2 font-mono pt-0.5">
                  {lead.email ? (
                    <>
                      {lead.email_verified ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="text-text-primary truncate font-medium">{lead.email}</span>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase border shrink-0",
                        lead.email_verified
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      )}>
                        {lead.email_verified ? "Verified" : "Unverified"}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">Not found</span>
                      <button
                        type="button"
                        disabled={enriching}
                        onClick={handleEnrichLead}
                        className="px-2.5 py-1 text-[10px] font-sans font-medium text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 transition-all rounded-lg disabled:opacity-50 shadow-sm"
                      >
                        {enriching ? "Enriching..." : "Enrich via Hunter"}
                      </button>
                    </div>
                  )}
                </div>
                {enrichError && (
                  <div className="text-[10px] text-rose-400 mt-1 font-mono">{enrichError}</div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-surface-raised border border-border/60 space-y-1">
                <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Designation & Role</span>
                <div className="text-text-primary font-medium pt-0.5 truncate">
                  {lead.contact_title || "Executive Contact"}
                </div>
              </div>
            </div>

            {(lead.phone || lead.location) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {lead.phone && (
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border/60 space-y-1">
                    <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Direct Phone / Hotline</span>
                    <div className="text-accent font-mono pt-0.5 font-medium">
                      {lead.phone}
                    </div>
                  </div>
                )}
                {lead.location && (
                  <div className="p-3.5 rounded-xl bg-surface-raised border border-border/60 space-y-1">
                    <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Registered Location</span>
                    <div className="text-text-primary font-medium pt-0.5 truncate">
                      {lead.location}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-xs pt-1">
              <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Executive Intelligence Summary</span>
              <p className="text-text-primary leading-relaxed bg-ink/50 border border-border/70 p-4 rounded-xl shadow-inner text-xs">
                {lead.company_summary || "No company intelligence summary recorded yet. Use Hunter enrichment to fetch real-time metadata."}
              </p>
            </div>
          </div>

          {/* Captured Requirements (AI Extracted) */}
          <div className="rounded-2xl border border-border bg-surface shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-medium text-text-primary tracking-wide">
                  AI-Extracted Client Requirements
                </h2>
              </div>
              {lead.requirements && (
                <span className="text-[10px] font-mono text-text-secondary bg-surface-raised px-2 py-0.5 rounded-md border border-border/60">
                  Extracted {new Date(lead.requirements.extracted_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {lead.requirements ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Discovered Problem Scope</div>
                  <div className="text-xs text-text-primary bg-ink/50 border border-border/70 p-4 rounded-xl shadow-inner leading-relaxed">
                    {lead.requirements.project_description || "Pending discovery conversation."}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-border/70 bg-surface-raised p-4 rounded-xl space-y-1 shadow-sm">
                    <span className="text-[10px] text-text-secondary font-mono tracking-wider uppercase">BUDGET SIGNAL</span>
                    <div className="text-sm text-accent font-medium font-mono">
                      {lead.requirements.budget_hint || "Not volunteered yet"}
                    </div>
                  </div>

                  <div className="border border-border/70 bg-surface-raised p-4 rounded-xl space-y-1 shadow-sm">
                    <span className="text-[10px] text-text-secondary font-mono tracking-wider uppercase">TIMELINE SIGNAL</span>
                    <div className="text-sm text-text-primary font-medium font-mono">
                      {lead.requirements.timeline_hint || "Standard delivery"}
                    </div>
                  </div>
                </div>

                {lead.requirements.key_requirements && lead.requirements.key_requirements.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Key Deliverables Checklist</div>
                    <div className="border border-border/70 divide-y divide-border/60 bg-ink/50 rounded-xl overflow-hidden shadow-inner">
                      {lead.requirements.key_requirements.map((req, i) => (
                        <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors">
                          <span className="text-text-primary font-normal">{req.item}</span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-medium",
                              req.priority === "must-have"
                                ? "border-accent/40 bg-accent/15 text-accent shadow-[0_0_10px_rgba(212,163,89,0.1)]"
                                : "border-border/80 bg-surface-raised text-text-secondary"
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
              <div className="p-8 text-center text-xs text-text-secondary border border-dashed border-border/80 rounded-xl bg-ink/20">
                <Sparkles className="w-5 h-5 text-accent/50 mx-auto mb-2" />
                Requirements will be automatically synthesized here as Claude conducts discovery over email threads.
              </div>
            )}
          </div>

          {/* Pricing & Human Quote Step */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface-raised shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-medium text-text-primary tracking-wide">
                  Deal Valuation & Quote (Human-in-the-Loop)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-accent border border-accent/30 px-2 py-0.5 rounded-md bg-accent/10">
                Owner Sole Authority
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Per strict architecture safeguards, Claude AI never negotiates or fabricates pricing. Set your fixed quote amount below to enable the AI Quote Relay engine.
            </p>

            <form onSubmit={handleSaveQuote} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-56">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-accent font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={quoteInput}
                    onChange={(e) =>
                      setQuoteInput(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 15000"
                    className="w-full bg-ink/70 border border-border/80 pl-8 pr-4 py-2.5 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 shadow-sm transition-all rounded-xl active:scale-[0.98]"
                >
                  Save Quote Amount
                </button>
                {quoteSaved && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    ✓ Saved to ledger
                  </span>
                )}
              </div>

              {lead.deal && (
                <div className="space-y-4 pt-3 border-t border-border/60">
                  <div className="text-xs font-mono text-text-secondary flex flex-wrap items-center gap-3">
                    <span className="p-2 rounded-lg bg-surface-raised border border-border/60">
                      Current valuation: <strong className="text-accent text-sm">${lead.deal.quoted_amount.toLocaleString()} {lead.deal.currency}</strong>
                    </span>
                    <span className="p-2 rounded-lg bg-surface-raised border border-border/60">
                      Status: <strong className="text-text-primary uppercase tracking-wider">{lead.deal.status}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="px-4 py-2 text-xs font-medium text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 shadow-sm transition-all rounded-xl inline-flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Format & Send Quote (AI Relay)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloseDeal("won")}
                      className="px-4 py-2 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all rounded-xl shadow-sm active:scale-[0.98]"
                    >
                      ✓ Mark Won
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloseDeal("lost")}
                      className="px-4 py-2 text-xs font-mono font-medium text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all rounded-xl shadow-sm active:scale-[0.98]"
                    >
                      ✕ Mark Lost
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column (Audit Trail & Activity) */}
        <div className="space-y-6">
          {/* Scheduled Meetings Card */}
          <div className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3 text-sm font-medium text-text-primary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Scheduled Discovery Call</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(true)}
                className="text-[11px] font-mono text-accent hover:underline"
              >
                + Book Meeting
              </button>
            </div>
            {lead.meetings && lead.meetings.length > 0 ? (
              lead.meetings.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-surface-raised border border-border/70 space-y-2 text-xs shadow-sm">
                  <div className="font-mono text-text-primary font-medium flex items-center justify-between">
                    <span>
                      {new Date(m.scheduled_at).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="inline-block text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      {m.status}
                    </span>
                  </div>
                  <div className="text-text-secondary text-[11px]">{m.notes}</div>
                  {m.google_event_id && (
                    <div className="text-[10px] font-mono text-text-muted truncate">
                      Cal ID: {m.google_event_id}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-text-secondary p-4 text-center border border-dashed border-border/70 rounded-xl bg-ink/20">
                No meetings booked. Use &quot;+ Book Meeting&quot; to lock in a discovery session.
              </div>
            )}
          </div>

          {/* Email Outreach Thread Card */}
          <div className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Send className="w-4 h-4 text-accent" />
                <span>Outreach Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(true)}
                  className="text-[10px] font-mono text-emerald-400 hover:underline"
                >
                  + Simulate reply
                </button>
                <span className="text-text-muted text-[10px]">·</span>
                <button
                  type="button"
                  onClick={() => setIsOutreachModalOpen(true)}
                  className="text-[10px] font-mono text-accent hover:underline"
                >
                  + New email
                </button>
              </div>
            </div>

            {lead.messages && lead.messages.length > 0 ? (
              <div className="space-y-3">
                {lead.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3.5 rounded-xl border text-xs space-y-2 shadow-sm transition-all",
                      msg.direction === "outbound"
                        ? "border-border/80 bg-surface-raised"
                        : "border-accent/40 bg-accent/5"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <span className="font-semibold">
                          {msg.direction === "outbound" ? "OUTBOUND (Claude AI)" : "INBOUND REPLY"}
                        </span>
                        {msg.classified_intent && (
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded-full border text-[9px] uppercase font-mono",
                              msg.classified_intent === "interested"
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                                : msg.classified_intent === "not_interested"
                                ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
                                : msg.classified_intent === "question"
                                ? "border-accent/40 bg-accent/15 text-accent"
                                : "border-border bg-ink text-text-secondary"
                            )}
                          >
                            {msg.classified_intent.replace("_", " ")}
                          </span>
                        )}
                      </span>
                      <span className="text-text-muted">
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <div className="font-medium text-text-primary text-[11px] truncate">
                      {msg.subject}
                    </div>
                    <div className="text-text-secondary leading-relaxed line-clamp-3 text-[11px] bg-ink/30 p-2 rounded-lg">
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-secondary p-4 text-center border border-dashed border-border/70 rounded-xl bg-ink/20">
                No emails sent yet. Click &quot;Draft Cold Outreach&quot; above to compose your initial message.
              </div>
            )}
          </div>

          {/* Immutable Stage Audit Trail */}
          <div className="rounded-2xl border border-border bg-surface shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-sm font-medium text-text-primary">
              <Clock className="w-4 h-4 text-accent" />
              <span>Immutable Audit Trail</span>
            </div>

            <div className="space-y-3">
              {lead.stage_history && lead.stage_history.length > 0 ? (
                lead.stage_history.map((sh) => (
                  <div
                    key={sh.id}
                    className="border-l-2 border-accent/40 pl-3 py-1 space-y-1 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-text-primary font-medium capitalize">
                        {sh.to_stage.replace("_", " ")}
                      </span>
                      {sh.from_stage && (
                        <span className="text-text-muted text-[10px]">
                          (from {sh.from_stage.replace("_", " ")})
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-text-muted flex justify-between items-center">
                      <span>{new Date(sh.changed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(sh.changed_at).toLocaleDateString()}</span>
                      <span className="border border-border/80 px-1.5 py-0.2 rounded-md bg-ink text-text-secondary uppercase font-mono text-[9px]">
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

      {/* Cold Outreach Modal */}
      <OutreachModal
        isOpen={isOutreachModalOpen}
        onClose={() => setIsOutreachModalOpen(false)}
        lead={lead}
        onSent={loadLead}
      />

      {/* Inbound Reply Simulator / Logger Modal */}
      <ReplySimulatorModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        lead={lead}
        onProcessed={loadLead}
      />

      {/* Meeting Booking Modal */}
      <MeetingBookingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        lead={lead}
        onBooked={loadLead}
      />

      {/* Quote Relay Modal */}
      <QuoteRelayModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        lead={lead}
        onSent={loadLead}
      />
    </div>
  );
}
