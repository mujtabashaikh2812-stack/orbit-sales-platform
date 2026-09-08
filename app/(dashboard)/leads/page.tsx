"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLeads, getLeadsSync, createLead, LeadDetail } from "@/lib/db/leads";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadModal } from "@/components/leads/lead-modal";
import { SourcingToolbar } from "@/components/leads/sourcing-toolbar";
import { Plus, Sliders, RefreshCw } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(() => getLeadsSync());
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadLeads() {
    const data = await getLeads();
    setLeads(data);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleCreateLead(
    newLeadData: Parameters<typeof createLead>[0]
  ) {
    const created = await createLead(newLeadData);
    setLeads((prev) => [created, ...prev]);
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
        <div className="flex items-center gap-3">
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
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-all rounded-xl shadow-sm active:scale-[0.98]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Targeting Settings</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 transition-all rounded-xl shadow-sm active:scale-[0.98]"
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
