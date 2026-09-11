"use client";

import React from "react";
import { FunnelStageMetric } from "@/lib/analytics/analytics-service";
import { AlertCircle, CheckCircle2, ArrowRight, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversionFunnelProps {
  funnel: FunnelStageMetric[];
}

export function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const maxCount = funnel.length > 0 ? funnel[0].count : 1;
  const bottleneck = funnel.find((f) => f.isBottleneck);

  return (
    <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="font-medium text-sm text-text-primary">
              Pipeline Stage Conversion Funnel
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Stage-by-stage progression efficiency and pipeline drop-off rates
          </p>
        </div>

        {funnel.length > 0 && (
          <div className="text-xs font-mono text-text-secondary bg-surface-raised px-2.5 py-1 rounded-lg border border-border/60">
            Overall Conversion: <span className="font-bold text-text-primary">{(funnel[funnel.length - 1].count / (funnel[0].count || 1) * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Funnel Stage Rows */}
      <div className="space-y-2.5">
        {funnel.map((item, idx) => {
          const widthPercent = Math.max(12, Math.round((item.count / maxCount) * 100));

          return (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-secondary w-4">
                    {idx + 1}.
                  </span>
                  <span className="font-medium text-text-primary">{item.label}</span>
                  {item.isBottleneck && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      Conversion Bottleneck
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="font-bold text-text-primary">{item.count}</span>
                  {idx > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded border",
                      item.conversionRate >= 60 
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                        : item.conversionRate >= 40 
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-rose-700 bg-rose-50 border-rose-200 font-medium"
                    )}>
                      {item.conversionRate}% conv.
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottleneck Diagnostic Card */}
      {bottleneck && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-xs text-rose-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-800">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>AI Optimization Diagnostic: {bottleneck.label} Stage Drop-off</span>
          </div>
          <p className="text-[11px] text-rose-800/90 leading-relaxed">
            Largest drop-off observed at <strong>{bottleneck.label} ({bottleneck.dropoffRate}% drop-off)</strong>. 
            Activating Autonomous Cadence follow-up (Touch 2) within 48 hours typically recovers 25-35% of these dormant leads.
          </p>
        </div>
      )}
    </div>
  );
}
