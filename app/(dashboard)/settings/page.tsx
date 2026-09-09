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
  Ban,
  MapPin,
  Briefcase,
  Building2
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
          <h2 className="text-sm font-medium text-text-primary tracking-wide">
            Ideal Customer Profile (ICP) Parameters
          </h2>
        </div>

        <form onSubmit={handleSaveIcp} className="border border-border bg-surface p-6 rounded-2xl shadow-card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Campaign Target Name</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Target Industry & Verticals</label>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Company Size (Min Headcount)</label>
              <input
                type="number"
                value={minSize}
                onChange={(e) => setMinSize(Number(e.target.value))}
                className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Company Size (Max Headcount)</label>
              <input
                type="number"
                value={maxSize}
                onChange={(e) => setMaxSize(Number(e.target.value))}
                className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Target Executive Titles (Comma Separated)</label>
            <input
              type="text"
              value={titles}
              onChange={(e) => setTitles(e.target.value)}
              className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
              Autonomous Personalization Context & Value Proposition (Provided to Claude AI)
            </label>
            <textarea
              rows={3}
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
              className="w-full bg-white border border-border px-3.5 py-2.5 text-sm text-text-primary rounded-xl focus:outline-none focus:border-accent resize-none shadow-sm leading-relaxed transition-colors"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
            {icpSaved ? (
              <span className="text-xs text-emerald-600 font-mono flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration synchronized with live agent</span>
              </span>
            ) : (
              <span className="text-[11px] text-text-muted font-mono">
                Parameters immediately dictate Apollo sourcing & Claude tone
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-md transition-all rounded-xl active:scale-[0.98] w-fit"
            >
              Save ICP Criteria
            </button>
          </div>
        </form>
      </section>

      {/* Outreach Safeguards & Rate Limiting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary tracking-wide">
            Outreach Safeguards & Protocol Compliance
          </h2>
        </div>

        <div className="border border-border bg-surface p-6 rounded-2xl shadow-card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="border border-border/80 bg-surface-raised p-4 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Mail className="w-4 h-4 text-accent" />
                <span>Daily Outbound Cap</span>
              </div>
              <div className="font-mono text-xl text-accent font-bold">
                15 / day
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Protects Gmail sender reputation on Google Workspace tiers.
              </p>
            </div>

            <div className="border border-border/80 bg-surface-raised p-4 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Clock className="w-4 h-4 text-accent" />
                <span>Dispatch Window</span>
              </div>
              <div className="font-mono text-xl text-text-primary font-bold">
                09:00 – 17:00
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Prospect local timezone adherence; suppresses evening & weekend dispatches.
              </p>
            </div>

            <div className="border border-border/80 bg-surface-raised p-4 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-text-primary font-medium">
                <Ban className="w-4 h-4 text-rose-400" />
                <span>Auto-Suppression</span>
              </div>
              <div className="font-mono text-base text-rose-400 font-semibold pt-1">
                Zero Tolerance
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Phrases like &quot;stop&quot; or &quot;unsubscribe&quot; atomically halt all follow-ups.
              </p>
            </div>
          </div>

          <div className="p-4 border border-accent/30 bg-accent/5 rounded-xl text-xs text-text-secondary flex items-start gap-3 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary font-medium">Human-in-the-Loop Sovereign Pricing:</strong> Claude AI is strictly prohibited from inventing, estimating, or bargaining pricing. Rates and quotes are configured exclusively by the human operator in the deal ledger and relayed without unauthorized variance.
            </div>
          </div>
        </div>
      </section>

      {/* Integration Connections Status */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary tracking-wide">
            Enterprise Infrastructure & API Gateways
          </h2>
        </div>

        <div className="border border-border divide-y divide-border/60 bg-surface rounded-2xl shadow-card overflow-hidden">
          {/* Supabase */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Supabase PostgreSQL Ledger & Auth</div>
                <div className="text-xs text-text-muted">Postgres schema, stage-change triggers & Row-Level Security</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active / RLS Enabled</span>
            </span>
          </div>

          {/* Claude */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Key className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Claude 3.5 Sonnet (Anthropic API)</div>
                <div className="text-xs text-text-muted">Cold outreach generation, reply sentiment analysis & requirements extraction</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Engine Online</span>
            </span>
          </div>

          {/* Gmail */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Mail className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Gmail Dispatcher Gateway</div>
                <div className="text-xs text-text-muted">Direct mailbox synchronization & thread tracking</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Dry-Run Active (Safety Shield)</span>
            </span>
          </div>

          {/* Google Calendar */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Calendar className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Google Calendar Synchronization</div>
                <div className="text-xs text-text-muted">Discovery call scheduling and Google Meet room generation</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Calendar Synchronized</span>
            </span>
          </div>

          {/* Apollo */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Search className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Apollo.io Prospecting Engine</div>
                <div className="text-xs text-text-muted">B2B targeting matching ICP industry, title, and employee size</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Gateway Ready</span>
            </span>
          </div>

          {/* Hunter */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Hunter.io Verification Gateway</div>
                <div className="text-xs text-text-muted">Deliverability scoring, SMTP validation, and MX health checks</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Gateway Ready</span>
            </span>
          </div>

          {/* Google Maps Places */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <MapPin className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Google Maps Places Engine</div>
                <div className="text-xs text-text-muted">Local business extraction, clinics, practices, reviews & phone discovery</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Places Active</span>
            </span>
          </div>

          {/* Contra */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Contra Client & Project Gateway</div>
                <div className="text-xs text-text-muted">High-growth startups and venture-backed companies hiring tech agencies</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Network Active</span>
            </span>
          </div>

          {/* YellowPages */}
          <div className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-text-secondary">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">YellowPages Commercial Directory</div>
                <div className="text-xs text-text-muted">Mid-market industrial, logistics, manufacturing, and commercial contractors</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Directory Ready</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
