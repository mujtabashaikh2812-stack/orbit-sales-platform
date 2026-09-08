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
    <div className="border border-border bg-surface p-4 rounded space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-text-primary">
            Automated Sourcing & Enrichment Engine
          </span>
          <span className="text-[10px] font-mono text-text-secondary border border-border px-1.5 py-0.5 rounded-sm bg-ink">
            Apollo + Hunter
          </span>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={sourcing || enriching}
            onClick={handleSource}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-primary bg-surface-raised hover:bg-border border border-border transition-colors rounded disabled:opacity-50"
          >
            {sourcing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            )}
            <span>{sourcing ? "Sourcing..." : "Source from ICP"}</span>
          </button>

          <button
            type="button"
            disabled={sourcing || enriching || sourcedCount === 0}
            onClick={handleEnrichAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
          >
            {enriching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>
              {enriching
                ? "Verifying..."
                : `Enrich pending (${sourcedCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* Live Feedback Banner */}
      {statusMessage && (
        <div
          className={`text-xs px-3 py-2 rounded flex items-center gap-2 border font-mono ${
            statusMessage.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
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
