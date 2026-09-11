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
  Building2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Target
} from "lucide-react";
import { LeadSource } from "@/lib/types";
import { LeadDetail } from "@/lib/db/leads";

interface SourcingToolbarProps {
  sourcedCount: number;
  onRefresh: (newLeads?: LeadDetail[]) => void;
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

const PRESET_PROMPTS = [
  {
    label: "Dental clinics in Austin, TX for web redesign",
    prompt: "Search dental clinics and healthcare practices in Austin, TX needing website modernization and online booking",
  },
  {
    label: "Startups on Contra seeking Next.js & AI",
    prompt: "Find startups on Contra hiring for Next.js web application development and AI automation workflows",
  },
  {
    label: "Commercial logistics in Chicago, IL",
    prompt: "Find commercial logistics and freight forwarding companies in Chicago, IL needing API pipelines",
  },
  {
    label: "Law firms in London needing booking flow",
    prompt: "Find commercial law practices in London, UK looking to automate client consultation booking",
  }
];

export function SourcingToolbar({ sourcedCount, onRefresh }: SourcingToolbarProps) {
  const [prompt, setPrompt] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [showManualFilters, setShowManualFilters] = useState(false);

  // Manual fallback controls
  const [selectedChannel, setSelectedChannel] = useState<SourcingChannel>("apollo");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [manualSourcing, setManualSourcing] = useState(false);

  const [enriching, setEnriching] = useState(false);
  const [parsedMeta, setParsedMeta] = useState<{
    location?: string;
    channel: string;
    industryOrNiche: string;
    painPoint: string;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Natural Language AI Prompt Handler
  async function handleAiPromptSubmit(e?: React.FormEvent, customPrompt?: string) {
    if (e) e.preventDefault();
    const queryPrompt = (customPrompt || prompt).trim();
    if (!queryPrompt) return;

    setAiSearching(true);
    setStatusMessage(null);
    setParsedMeta(null);

    try {
      const res = await fetch("/api/leads/source-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: queryPrompt, limit: 5 }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.parsed) {
          setParsedMeta({
            location: data.parsed.location,
            channel: data.parsed.channel,
            industryOrNiche: data.parsed.industryOrNiche,
            painPoint: data.parsed.painPoint,
          });
        }

        setStatusMessage({
          type: "success",
          text: data.count > 0
            ? `Claude identified target niche and enrolled ${data.count} new prospects into your ledger.`
            : `Search completed. No new unique leads found (duplicates skipped to keep ledger clean).`,
        });
        onRefresh(data.leads);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to execute AI natural language search",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error contacting autonomous sourcing agent",
      });
    } finally {
      setAiSearching(false);
    }
  }

  // Manual Channel Source Trigger
  async function handleManualSource() {
    setManualSourcing(true);
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
        onRefresh(data.leads);
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
      setManualSourcing(false);
    }
  }

  // Hunter Deliverability Verification
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
          text: `Enriched ${data.summary.enriched} of ${data.summary.total} pending leads with verified deliverable emails`,
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

  const activeManualMeta = CHANNELS.find((c) => c.id === selectedChannel)!;

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface via-surface-raised to-surface p-5 shadow-card space-y-4">
      {/* Top AI Command Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary tracking-wide">
                Prompt-to-Pipeline AI Scout
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/25 px-2 py-0.2 rounded-full">
                Claude 3.5 Sonnet Engine
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Type what clients you want in plain English. Orbit parses location, niche, and channels automatically.
            </p>
          </div>
        </div>

        {/* Global Action: Deliverability Checker */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={enriching || sourcedCount === 0}
            onClick={handleEnrichAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 transition-all rounded-xl disabled:opacity-40 shadow-sm active:scale-[0.98]"
            title="Score mailbox deliverability for pending leads"
          >
            {enriching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            )}
            <span>Verify Deliverability ({sourcedCount})</span>
          </button>
        </div>
      </div>

      {/* Main Natural Language Command Prompt Form */}
      <form onSubmit={(e) => handleAiPromptSubmit(e)} className="space-y-2.5">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-accent absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find commercial logistics companies in Chicago, IL needing custom API workflows..."
              className="w-full bg-white border border-border hover:border-accent/40 focus:border-accent pl-10 pr-4 py-2.5 text-xs text-text-primary rounded-xl focus:outline-none shadow-sm transition-colors placeholder:text-text-muted"
            />
          </div>

          <button
            type="submit"
            disabled={aiSearching || !prompt.trim()}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 transition-all rounded-xl disabled:opacity-40 shadow-sm active:scale-[0.98] inline-flex items-center justify-center gap-2 shrink-0"
          >
            {aiSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Claude Scouting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Scout Clients</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Prompt Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-text-muted text-[10px] font-mono uppercase tracking-wider shrink-0 mr-1">
            Try:
          </span>
          {PRESET_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(chip.prompt);
                handleAiPromptSubmit(undefined, chip.prompt);
              }}
              disabled={aiSearching}
              className="px-2.5 py-1 rounded-lg border border-border/80 bg-surface text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-surface-raised transition-colors whitespace-nowrap text-[10px] font-mono shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </form>

      {/* Live AI Interpretation Telemetry Badge */}
      {parsedMeta && (
        <div className="p-3 rounded-xl border border-accent/25 bg-accent/5 flex flex-wrap items-center gap-3 text-[11px] font-mono animate-fadeIn shadow-sm">
          <span className="text-accent font-semibold flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>AI Parsed:</span>
          </span>
          {parsedMeta.location && (
            <span className="text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{parsedMeta.location}</span>
            </span>
          )}
          <span className="text-text-primary bg-surface-raised border border-border px-2 py-0.5 rounded-md">
            🏢 {parsedMeta.industryOrNiche}
          </span>
          <span className="text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded-md uppercase text-[10px]">
            🛰️ {parsedMeta.channel.replace("_", " ")}
          </span>
          <span className="text-text-muted truncate max-w-sm hidden sm:inline">
            🎯 Angle: {parsedMeta.painPoint}
          </span>
        </div>
      )}

      {/* Toggle Manual Platform Filtering */}
      <div className="pt-1 border-t border-border/60">
        <button
          type="button"
          onClick={() => setShowManualFilters(!showManualFilters)}
          className="text-[11px] font-mono text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3 text-accent" />
          <span>{showManualFilters ? "Hide Manual Channel Controls" : "Manual Platform Controls (Google Maps, Contra, Apollo, YellowPages)"}</span>
          {showManualFilters ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {showManualFilters && (
          <div className="mt-3.5 p-4 rounded-xl bg-surface border border-border/80 space-y-3.5 animate-fadeIn">
            {/* Source Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-accent/20 text-accent font-semibold border border-accent/40"
                        : "bg-surface-raised text-text-secondary hover:text-text-primary border border-border/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs & Manual Source Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search keyword for ${activeManualMeta.label}...`}
                  className="flex-1 bg-white border border-border px-3 py-2 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm"
                />
                {(selectedChannel === "google_maps" || selectedChannel === "yellow_pages") && (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location / City..."
                    className="w-full sm:w-40 bg-white border border-border px-3 py-2 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent shadow-sm"
                  />
                )}
              </div>

              <button
                type="button"
                disabled={manualSourcing}
                onClick={handleManualSource}
                className="px-3.5 py-2 text-xs font-medium text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-xl disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                {manualSourcing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Pull from {activeManualMeta.label}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Status Feedback Banner */}
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
