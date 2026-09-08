"use client";

import { useState } from "react";
import { Lead, LeadStage } from "@/lib/types";
import { X } from "lucide-react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, "id" | "created_at" | "updated_at" | "stage_updated_at">) => void;
  initialData?: Lead | null;
}

const STAGES: LeadStage[] = [
  "sourced",
  "enriched",
  "contacted",
  "replied",
  "qualified",
  "meeting_booked",
  "priced",
  "won",
  "lost",
];

export function LeadModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: LeadModalProps) {
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [contactName, setContactName] = useState(initialData?.contact_name || "");
  const [contactTitle, setContactTitle] = useState(initialData?.contact_title || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [emailVerified, setEmailVerified] = useState(initialData?.email_verified ?? false);
  const [source, setSource] = useState<"apollo" | "hunter" | "manual">(
    initialData?.source || "manual"
  );
  const [companyDomain, setCompanyDomain] = useState(initialData?.company_domain || "");
  const [companySummary, setCompanySummary] = useState(
    initialData?.company_summary || ""
  );
  const [stage, setStage] = useState<LeadStage>(initialData?.stage || "sourced");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      user_id: initialData?.user_id || "00000000-0000-0000-0000-000000000001",
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      contact_title: contactTitle.trim() || null,
      email: email.trim() || null,
      email_verified: emailVerified,
      source,
      company_domain: companyDomain.trim() || null,
      company_summary: companySummary.trim() || null,
      stage,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-raised border border-border rounded p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif text-xl text-text-primary font-medium">
            {initialData ? "Edit Lead Dossier" : "Add Lead to Ledger"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Domain</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="acme.com"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Contact Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Contact Role / Title</label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="CTO / Founder"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@acme.com"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Lead Source</label>
              <select
                value={source}
                onChange={(e) =>
                  setSource(e.target.value as "apollo" | "hunter" | "manual")
                }
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              >
                <option value="manual">Manual Entry</option>
                <option value="apollo">Apollo.io</option>
                <option value="hunter">Hunter.io</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent font-mono text-xs"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="email_verified"
                checked={emailVerified}
                onChange={(e) => setEmailVerified(e.target.checked)}
                className="rounded border-border bg-ink text-accent focus:ring-0"
              />
              <label htmlFor="email_verified" className="text-xs text-text-secondary cursor-pointer">
                Email is verified & deliverable
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">
              Company Context / Personalization Notes
            </label>
            <textarea
              rows={3}
              value={companySummary}
              onChange={(e) => setCompanySummary(e.target.value)}
              placeholder="What does this company do? What specific problem can we solve for them?"
              className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
            >
              {initialData ? "Save changes" : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
