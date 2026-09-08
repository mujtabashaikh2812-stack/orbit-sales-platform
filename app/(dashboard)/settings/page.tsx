import { Sliders, ShieldCheck, Mail, Database, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-10 max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
          Settings & Targeting
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure your Ideal Customer Profile (ICP), outreach safeguards, and API connections
        </p>
      </div>

      {/* ICP Definition Form */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary">
            Ideal Customer Profile (ICP)
          </h2>
        </div>

        <div className="border border-border bg-surface p-6 rounded space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Target Name / Campaign</label>
              <input
                type="text"
                defaultValue="Q1 Mid-Market SaaS & Dev Agencies"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Target Industry</label>
              <input
                type="text"
                defaultValue="B2B Software, AI Infrastructure, Cloud Consulting"
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Size (Min headcount)</label>
              <input
                type="number"
                defaultValue={10}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Size (Max headcount)</label>
              <input
                type="number"
                defaultValue={150}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Target Job Titles (comma separated)</label>
            <input
              type="text"
              defaultValue="Founder, CEO, CTO, Head of Product, VP Engineering"
              className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">
              Personalization Guidance & Service Value Prop (Notes for Claude)
            </label>
            <textarea
              rows={3}
              defaultValue="We offer custom full-stack web applications and AI workflow automations with zero recurring agency overhead. Focus on tech debt, legacy tooling, and fast shipping."
              className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
            >
              Save ICP criteria
            </button>
          </div>
        </div>
      </section>

      {/* Integration Connections Status */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary">
            Integrations & Service Connections
          </h2>
        </div>

        <div className="border border-border divide-y divide-border bg-surface rounded">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Supabase Database & Auth</div>
                <div className="text-xs text-text-secondary">Postgres database & Row-Level Security</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-warning/30 bg-warning/10 text-warning">
              Pending Schema Migration
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Gmail API</div>
                <div className="text-xs text-text-secondary">OAuth mailbox connection for cold outreach & thread monitoring</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-border bg-ink text-text-secondary">
              Dry Run Active
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Claude API (Anthropic)</div>
                <div className="text-xs text-text-secondary">Outreach drafting, intent classification & discovery questions</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-border bg-ink text-text-secondary">
              Ready for Phase 5
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
