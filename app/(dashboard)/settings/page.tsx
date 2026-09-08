"use client";

import { useState } from "react";
import { 
  Sliders, 
  ShieldCheck, 
  Mail, 
  Database, 
  Key, 
  Calendar, 
  Search, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  Ban
} from "lucide-react";

export default function SettingsPage() {
  const [icpSaved, setIcpSaved] = useState(false);
  const [targetName, setTargetName] = useState("Q1 Mid-Market SaaS & Dev Agencies");
  const [targetIndustry, setTargetIndustry] = useState("B2B Software, AI Infrastructure, Cloud Consulting");
  const [minSize, setMinSize] = useState(10);
  const [maxSize, setMaxSize] = useState(150);
  const [titles, setTitles] = useState("Founder, CEO, CTO, Head of Product, VP Engineering");
  const [valueProp, setValueProp] = useState(
    "We build bespoke high-throughput API workflows and AI integration pipelines with zero recurring agency overhead. Focus on technical debt elimination and rapid shipping."
  );

  function handleSaveIcp(e: React.FormEvent) {
    e.preventDefault();
    setIcpSaved(true);
    setTimeout(() => setIcpSaved(false), 2500);
  }

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

        <form onSubmit={handleSaveIcp} className="border border-border bg-surface p-6 rounded space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Target Name / Campaign</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Target Industry</label>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Size (Min headcount)</label>
              <input
                type="number"
                value={minSize}
                onChange={(e) => setMinSize(Number(e.target.value))}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Company Size (Max headcount)</label>
              <input
                type="number"
                value={maxSize}
                onChange={(e) => setMaxSize(Number(e.target.value))}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Target Job Titles (comma separated)</label>
            <input
              type="text"
              value={titles}
              onChange={(e) => setTitles(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">
              Personalization Guidance & Value Proposition (Provided to Claude AI)
            </label>
            <textarea
              rows={3}
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary rounded focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            {icpSaved ? (
              <span className="text-xs text-success font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved to ledger configuration</span>
              </span>
            ) : (
              <span className="text-[11px] text-text-secondary font-mono">
                Changes apply to subsequent sourcing batches
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
            >
              Save ICP criteria
            </button>
          </div>
        </form>
      </section>

      {/* Outreach Safeguards & Rate Limiting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary">
            Outreach Safeguards & Compliance Rules
          </h2>
        </div>

        <div className="border border-border bg-surface p-6 rounded space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="border border-border bg-surface-raised p-3.5 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>Daily Outbound Cap</span>
              </div>
              <div className="font-mono text-lg text-text-primary font-semibold">
                15 emails / day
              </div>
              <p className="text-[11px] text-text-secondary">
                Protects Gmail sender score on Google Workspace free tiers.
              </p>
            </div>

            <div className="border border-border bg-surface-raised p-3.5 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Sending Hours</span>
              </div>
              <div className="font-mono text-lg text-text-primary font-semibold">
                09:00 – 17:00
              </div>
              <p className="text-[11px] text-text-secondary">
                Respects prospect timezone; no late evening or weekend sends.
              </p>
            </div>

            <div className="border border-border bg-surface-raised p-3.5 rounded space-y-1.5">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Ban className="w-3.5 h-3.5 text-accent" />
                <span>Auto-Unsubscribe</span>
              </div>
              <div className="font-mono text-sm text-text-primary font-medium">
                Instant Stop
              </div>
              <p className="text-[11px] text-text-secondary">
                Phrases like &quot;not interested&quot; or &quot;stop&quot; atomically transition lead to Lost.
              </p>
            </div>
          </div>

          <div className="p-3 border border-border bg-ink/40 rounded text-xs text-text-secondary flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary">Human-in-the-Loop Pricing Rule:</strong> The AI engine is strictly barred from inventing, negotiating, or quoting pricing. Prices are set exclusively by the owner in the deals ledger and relayed without alteration.
            </div>
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
          {/* Supabase */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Supabase Database & Auth</div>
                <div className="text-xs text-text-secondary">Postgres ledger schema, atomic triggers & Row-Level Security</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 text-success">
              Active / RLS Enabled
            </span>
          </div>

          {/* Claude */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Claude API (Anthropic)</div>
                <div className="text-xs text-text-secondary">Outreach drafting, inbound reply classification & requirement extraction</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 text-success">
              Active (Simulated Fallback)
            </span>
          </div>

          {/* Gmail */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Gmail API & Dispatcher</div>
                <div className="text-xs text-text-secondary">Mailbox connection for outreach delivery & thread synchronization</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-accent/40 bg-accent/10 text-accent">
              Dry-Run Mode (Protected)
            </span>
          </div>

          {/* Google Calendar */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Google Calendar API</div>
                <div className="text-xs text-text-secondary">Discovery meeting booking and Google Meet conference generation</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 text-success">
              Active (Simulated Fallback)
            </span>
          </div>

          {/* Apollo */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Apollo.io Prospecting API</div>
                <div className="text-xs text-text-secondary">B2B search matching ICP industry, title, and headcount criteria</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 text-success">
              Free Tier Active
            </span>
          </div>

          {/* Hunter */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-text-secondary" />
              <div>
                <div className="text-sm font-medium text-text-primary">Hunter.io Verification API</div>
                <div className="text-xs text-text-secondary">Email deliverability scoring and domain MX verification</div>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm border border-success/40 bg-success/10 text-success">
              Free Tier Active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
