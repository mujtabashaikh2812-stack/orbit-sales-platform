"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, Loader2, Check, AlertCircle } from "lucide-react";

interface SourcingToolbarProps {
  sourcedCount: number;
  onRefresh: () => void;
}

export function SourcingToolbar({ sourcedCount, onRefresh }: SourcingToolbarProps) {
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
        body: JSON.stringify({ limit: 5 }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: data.count > 0 
            ? `Successfully sourced ${data.count} new candidate leads from Apollo.io`
            : "No new unique leads found matching criteria (duplicates skipped)",
        });
        onRefresh();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to source leads from Apollo",
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

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface-raised to-surface p-4.5 shadow-card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-primary">
                Autonomous Prospecting Engine
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/25 px-2 py-0.2 rounded-full">
                Apollo + Hunter
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Sync candidates matching your ICP criteria and score mailbox deliverability.
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={sourcing || enriching}
            onClick={handleSource}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-text-primary bg-surface-raised hover:bg-surface-hover border border-border hover:border-accent/40 transition-all rounded-xl disabled:opacity-50 shadow-sm active:scale-[0.98]"
          >
            {sourcing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            )}
            <span>{sourcing ? "Pulling Candidates..." : "Source from ICP"}</span>
          </button>

          <button
            type="button"
            disabled={sourcing || enriching || sourcedCount === 0}
            onClick={handleEnrichAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 transition-all rounded-xl disabled:opacity-40 shadow-sm active:scale-[0.98]"
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
