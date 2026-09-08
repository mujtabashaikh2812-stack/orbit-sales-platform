"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Loader2, 
  Check, 
  AlertCircle, 
  MapPin, 
  Briefcase, 
  Search, 
  Building2 
} from "lucide-react";
import { LeadSource } from "@/lib/types";

interface SourcingToolbarProps {
  sourcedCount: number;
  onRefresh: () => void;
}

type SourcingChannel = "apollo" | "google_maps" | "contra" | "yellow_pages";

const CHANNELS: {
  id: SourcingChannel;
  label: string;
  badge: string;
  icon: typeof Search;
  description: string;
}[] = [
  {
    id: "apollo",
    label: "Apollo.io",
    badge: "B2B Tech ICP",
    icon: Sparkles,
    description: "Target enterprise tech leads matching your ICP industry and executive titles.",
  },
  {
    id: "google_maps",
    label: "Google Maps",
    badge: "Places & Clinics",
    icon: MapPin,
    description: "Extract verified local businesses, clinics, practices, and contractors by location.",
  },
  {
    id: "contra",
    label: "Contra",
    badge: "Startup Projects",
    icon: Briefcase,
    description: "Discover venture-backed startups and companies hiring technical agencies and consultants.",
  },
  {
    id: "yellow_pages",
    label: "YellowPages",
    badge: "Commercial B2B",
    icon: Building2,
    description: "Prospect established mid-market commercial, industrial, and logistics operations.",
  },
];

export function SourcingToolbar({ sourcedCount, onRefresh }: SourcingToolbarProps) {
  const [selectedChannel, setSelectedChannel] = useState<SourcingChannel>("apollo");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sourcing, setSourcing] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSource() {
    setSourcing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/leads/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selectedChannel,
          query: query.trim() || undefined,
          location: location.trim() || undefined,
          limit: 5,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const channelLabel = CHANNELS.find((c) => c.id === selectedChannel)?.label || "Source";
        setStatusMessage({
          type: "success",
          text: data.count > 0 
            ? `Successfully enrolled ${data.count} new candidate leads from ${channelLabel}`
            : `No new unique leads found matching criteria on ${channelLabel} (duplicates skipped)`,
        });
        onRefresh();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || `Failed to source leads from ${selectedChannel}`,
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error connecting to sourcing service",
      });
    } finally {
      setSourcing(false);
    }
  }

  async function handleEnrichAll() {
    setEnriching(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/leads/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Enriched ${data.summary.enriched} of ${data.summary.total} pending leads with verified emails`,
        });
        onRefresh();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to enrich leads via Hunter.io",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error connecting to enrichment service",
      });
    } finally {
      setEnriching(false);
    }
  }

  const activeMeta = CHANNELS.find((c) => c.id === selectedChannel)!;

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface-raised to-surface p-5 shadow-card space-y-4">
      {/* Header & Source Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">
                Multi-Channel Autonomous Prospecting Engine
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded-full">
                {activeMeta.badge}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              {activeMeta.description}
            </p>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.id;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChannel(ch.id);
                  setStatusMessage(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                  isSelected
                    ? "bg-accent/20 text-accent font-semibold border border-accent/40 shadow-[0_0_12px_rgba(212,163,89,0.15)]"
                    : "bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Search Parameters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1">
          {/* Query Input */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                selectedChannel === "google_maps"
                  ? "e.g. Dental clinic, Law firm, Architecture..."
                  : selectedChannel === "contra"
                  ? "e.g. AI automation, Next.js engineering, Web3..."
                  : selectedChannel === "yellow_pages"
                  ? "e.g. Commercial freight, Precision machining..."
                  : "e.g. B2B SaaS, Infrastructure, Cloud..."
              }
              className="w-full bg-ink/70 border border-border/80 pl-9 pr-3 py-2 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors placeholder:text-text-muted"
            />
          </div>

          {/* Location Input (Only for Google Maps & YellowPages) */}
          {(selectedChannel === "google_maps" || selectedChannel === "yellow_pages") && (
            <div className="relative w-full sm:w-56">
              <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={selectedChannel === "google_maps" ? "Austin, TX / London" : "Chicago, IL / Dallas"}
                className="w-full bg-ink/70 border border-border/80 pl-9 pr-3 py-2 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-inner transition-colors placeholder:text-text-muted"
              />
            </div>
          )}
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={sourcing || enriching}
            onClick={handleSource}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-text-primary bg-surface-raised hover:bg-surface-hover border border-border hover:border-accent/40 transition-all rounded-xl disabled:opacity-50 shadow-sm active:scale-[0.98]"
          >
            {sourcing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            )}
            <span>{sourcing ? "Pulling Candidates..." : `Source from ${activeMeta.label}`}</span>
          </button>

          <button
            type="button"
            disabled={sourcing || enriching || sourcedCount === 0}
            onClick={handleEnrichAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 transition-all rounded-xl disabled:opacity-40 shadow-sm active:scale-[0.98]"
          >
            {enriching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-ink" />
            )}
            <span>
              {enriching
                ? "Scoring MX..."
                : `Verify Deliverability (${sourcedCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* Live Feedback Banner */}
      {statusMessage && (
        <div
          className={`text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 border font-mono animate-fadeIn ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
