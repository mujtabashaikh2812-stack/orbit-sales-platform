"use client";

import { useState } from "react";
import { Lead, LeadStage, LeadSource } from "@/lib/types";
import { X, Sparkles } from "lucide-react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    lead: Omit<Lead, "id" | "created_at" | "updated_at" | "stage_updated_at">,
    options?: { autoContact?: boolean }
  ) => void;
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
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [source, setSource] = useState<LeadSource>(initialData?.source || "manual");
  const [companyDomain, setCompanyDomain] = useState(initialData?.company_domain || "");
  const [companySummary, setCompanySummary] = useState(
    initialData?.company_summary || ""
  );
  const [stage, setStage] = useState<LeadStage>(initialData?.stage || "sourced");
  const [autoContact, setAutoContact] = useState(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(
      {
        user_id: initialData?.user_id || "00000000-0000-0000-0000-000000000001",
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        contact_title: contactTitle.trim() || null,
        email: email.trim() || null,
        email_verified: emailVerified,
        phone: phone.trim() || null,
        location: location.trim() || null,
        source,
        company_domain: companyDomain.trim() || null,
        company_summary: companySummary.trim() || null,
        stage: autoContact && email.trim() ? "contacted" : stage,
      },
      { autoContact }
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <h2 className="font-serif text-xl text-text-primary font-medium tracking-tight">
            {initialData ? "Edit Lead Dossier" : "Enroll Prospect in Ledger"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-raised"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full bg-white border border-border px-3.5 py-2 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Company Domain</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="acme.com"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Contact Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Contact Role / Title</label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="CTO / Founder"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@acme.com"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0199"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Location / City (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Austin, TX / London"
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-ink/70 border border-border/80 px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-inner cursor-pointer"
              >
                <option value="manual">Manual Entry</option>
                <option value="google_maps">Google Maps Places</option>
                <option value="contra">Contra Project</option>
                <option value="yellow_pages">YellowPages Directory</option>
                <option value="apollo">Apollo.io</option>
                <option value="hunter">Hunter.io</option>
                <option value="csv_import">CSV Import</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="email_verified"
                checked={emailVerified}
                onChange={(e) => setEmailVerified(e.target.checked)}
                className="rounded border-border bg-ink text-accent focus:ring-0 cursor-pointer"
              />
              <label htmlFor="email_verified" className="text-xs text-text-secondary cursor-pointer">
                Email is verified & deliverable
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
              Company Context / Personalization Notes
            </label>
            <textarea
              rows={3}
              value={companySummary}
              onChange={(e) => setCompanySummary(e.target.value)}
              placeholder="What does this company do? What specific problem can we solve for them?"
              className="w-full bg-ink/70 border border-border/80 px-3.5 py-2.5 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent resize-none shadow-inner leading-relaxed transition-colors"
            />
          </div>

          {/* Auto-Outreach Dispatch Toggle */}
          <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/50 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="auto_contact"
                checked={autoContact}
                onChange={(e) => setAutoContact(e.target.checked)}
                className="rounded border-border text-accent focus:ring-0 cursor-pointer"
              />
              <label htmlFor="auto_contact" className="text-xs font-medium text-text-primary cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Auto-draft & send cold outreach immediately (Claude AI + Gmail)</span>
              </label>
            </div>
            <p className="text-[11px] text-text-muted pl-6 leading-relaxed">
              Generates a personalized pitch based on company context and dispatches immediately. Protected by <span className="font-mono text-accent font-semibold">DRY_RUN_MODE=true</span> safety shield.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-md transition-all rounded-xl active:scale-[0.98]"
            >
              {initialData ? "Save Changes" : "Enroll Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
