"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLeads, getLeadsSync, createLead, LeadDetail } from "@/lib/db/leads";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadModal } from "@/components/leads/lead-modal";
import { SourcingToolbar } from "@/components/leads/sourcing-toolbar";
import { Plus, Sliders, RefreshCw, Check, AlertCircle, Info, Sparkles } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(() => getLeadsSync());
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  async function loadLeads() {
    const data = await getLeads();
    setLeads(data);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleCreateLead(
    newLeadData: Parameters<typeof createLead>[0],
    options?: { autoContact?: boolean }
  ) {
    setStatusBanner(null);
    let created = await createLead(newLeadData);
    setLeads((prev) => [created, ...prev]);

    if (options?.autoContact) {
      setStatusBanner({
        type: "info",
        text: `Initiating autonomous cold outreach for ${created.contact_name}...`,
      });

      // 1. If email missing but domain present, auto-enrich
      if (!created.email && created.company_domain) {
        try {
          const enrichRes = await fetch("/api/leads/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadId: created.id }),
          });
          const enrichData = await enrichRes.json();
          if (enrichData.success && enrichData.lead) {
            created = enrichData.lead;
          }
        } catch {}
      }

      // 2. Draft and send outreach if email is present
      if (created.email) {
        try {
          const draftRes = await fetch("/api/outreach/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadId: created.id }),
          });
          const draftData = await draftRes.json();

          if (draftData.success && draftData.draft) {
            const sendRes = await fetch("/api/outreach/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                leadId: created.id,
                subject: draftData.draft.subject,
                body: draftData.draft.body,
              }),
            });
            const sendData = await sendRes.json();

            if (sendData.success) {
              setStatusBanner({
                type: "success",
                text: `Lead enrolled & cold outreach dispatched to ${created.contact_name} (${created.email}) via Claude AI (Dry-Run Mode safe).`,
              });
            } else {
              setStatusBanner({
                type: "error",
                text: `Lead enrolled, but email dispatch failed: ${sendData.error || "Unknown error"}`,
              });
            }
          }
        } catch {
          setStatusBanner({
            type: "error",
            text: `Lead enrolled, but network error occurred during automated outreach dispatch.`,
          });
        }
      } else {
        setStatusBanner({
          type: "info",
          text: `Lead ${created.company_name} enrolled in ledger. Cold outreach skipped because no verified email was provided or discovered.`,
        });
      }

      // Reload fresh leads ledger state
      await loadLeads();
    } else {
      setStatusBanner({
        type: "success",
        text: `Successfully enrolled ${created.company_name} (${created.contact_name}) into ledger.`,
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Leads Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Prospect directory, contact status, and pipeline stages
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={loadLeads}
            className="p-2 text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-all rounded-xl shadow-sm active:scale-[0.98]"
            title="Refresh leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-all rounded-xl shadow-sm active:scale-[0.98]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">Targeting </span>Settings</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 transition-all rounded-xl shadow-md active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Sourcing & Enrichment Engine Toolbar */}
      <SourcingToolbar
        sourcedCount={leads.filter((l) => l.stage === "sourced").length}
        onRefresh={loadLeads}
      />

      {/* Live Action Status Banner */}
      {statusBanner && (
        <div
          className={`text-xs px-4 py-3 rounded-xl flex items-center gap-3 border font-mono animate-fadeIn ${
            statusBanner.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : statusBanner.type === "info"
              ? "border-accent/35 bg-accent/10 text-accent"
              : "border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {statusBanner.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : statusBanner.type === "info" ? (
            <Sparkles className="w-4 h-4 shrink-0 text-accent" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="leading-relaxed">{statusBanner.text}</span>
        </div>
      )}

      {/* Main Ledger Content */}
      {loading ? (
        <div className="border border-border bg-surface p-12 text-center rounded text-xs text-text-secondary font-mono">
          Loading ledger entries...
        </div>
      ) : leads.length === 0 ? (
        /* Empty State adhering to design.md */
        <div className="border border-border bg-surface p-12 text-center rounded">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-10 h-10 rounded-full border border-border bg-surface-raised flex items-center justify-center mx-auto text-accent">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-text-primary">
                No leads in ledger yet
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add your ICP criteria in Settings to start sourcing, or manually add a prospect to begin your outreach.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
              >
                Add first lead
              </button>
            </div>
          </div>
        </div>
      ) : (
        <LeadTable key={leads.length} initialLeads={leads} />
      )}

      {/* Add Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateLead}
      />
    </div>
  );
}
