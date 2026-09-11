"use client";

import React, { useState, useMemo } from "react";
import { TimeSeriesPoint } from "@/lib/analytics/analytics-service";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueAreaChartProps {
  data: TimeSeriesPoint[];
  timeframe: string;
}

export function RevenueAreaChart({ data, timeframe }: RevenueAreaChartProps) {
  const [activeMetric, setActiveMetric] = useState<"both" | "closed" | "pipeline">("both");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const padding = { top: 25, right: 25, bottom: 35, left: 55 };
  const width = 800;
  const height = 300;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value across datasets for Y-axis scale
  const maxValue = useMemo(() => {
    let max = 10000;
    data.forEach((d) => {
      if (d.closedRevenue > max) max = d.closedRevenue;
      if (d.pipelineValue > max) max = d.pipelineValue;
    });
    // Round up to nearest 10k
    return Math.ceil(max / 10000) * 10000;
  }, [data]);

  // Generate SVG coordinates
  const points = useMemo(() => {
    if (data.length === 0) return { closed: [], pipeline: [] };

    const stepX = chartWidth / (data.length - 1 || 1);

    const closedPts = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartHeight - (d.closedRevenue / maxValue) * chartHeight,
      val: d.closedRevenue,
    }));

    const pipelinePts = data.map((d, i) => ({
      x: padding.left + i * stepX,
      y: padding.top + chartHeight - (d.pipelineValue / maxValue) * chartHeight,
      val: d.pipelineValue,
    }));

    return { closed: closedPts, pipeline: pipelinePts };
  }, [data, maxValue, chartWidth, chartHeight, padding.left, padding.top]);

  // Construct smooth cubic bezier SVG path
  function buildCurvedPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }

  const closedPath = useMemo(() => buildCurvedPath(points.closed), [points.closed]);
  const pipelinePath = useMemo(() => buildCurvedPath(points.pipeline), [points.pipeline]);

  // Closed area polygon closing down to baseline
  const closedAreaPath = useMemo(() => {
    if (points.closed.length === 0) return "";
    const first = points.closed[0];
    const last = points.closed[points.closed.length - 1];
    const baselineY = padding.top + chartHeight;
    return `${closedPath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [closedPath, points.closed, padding.top, chartHeight]);

  const pipelineAreaPath = useMemo(() => {
    if (points.pipeline.length === 0) return "";
    const first = points.pipeline[0];
    const last = points.pipeline[points.pipeline.length - 1];
    const baselineY = padding.top + chartHeight;
    return `${pipelinePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pipelinePath, points.pipeline, padding.top, chartHeight]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    val: Math.round(maxValue * ratio),
    y: padding.top + chartHeight - ratio * chartHeight,
  }));

  const activeHover = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;
  const activeHoverClosedPt = hoverIndex !== null && points.closed[hoverIndex] ? points.closed[hoverIndex] : null;
  const activeHoverPipelinePt = hoverIndex !== null && points.pipeline[hoverIndex] ? points.pipeline[hoverIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-border/80 p-4 sm:p-6 shadow-card space-y-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            <h3 className="font-medium text-sm text-text-primary">
              Revenue & Pipeline Velocity
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Cashflow realization versus probability-weighted active pipeline
          </p>
        </div>

        {/* Series filters */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border/60 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric("both")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all",
              activeMetric === "both"
                ? "bg-white text-text-primary shadow-sm font-semibold"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            All Curves
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("closed")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5",
              activeMetric === "closed"
                ? "bg-white text-emerald-700 shadow-sm font-semibold"
                : "text-text-secondary hover:text-emerald-700"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Closed Won</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("pipeline")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5",
              activeMetric === "pipeline"
                ? "bg-white text-indigo-700 shadow-sm font-semibold"
                : "text-text-secondary hover:text-indigo-700"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Weighted Pipeline</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Gradient for Closed Won Area */}
            <linearGradient id="closedWonAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient for Pipeline Area */}
            <linearGradient id="pipelineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke Gradients */}
            <linearGradient id="closedStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="pipelineStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400 font-medium"
              >
                ${(tick.val / 1000).toFixed(0)}k
              </text>
            </g>
          ))}

          {/* Area Fills */}
          {(activeMetric === "both" || activeMetric === "pipeline") && (
            <path d={pipelineAreaPath} fill="url(#pipelineAreaGradient)" />
          )}

          {(activeMetric === "both" || activeMetric === "closed") && (
            <path d={closedAreaPath} fill="url(#closedWonAreaGradient)" />
          )}

          {/* Lines */}
          {(activeMetric === "both" || activeMetric === "pipeline") && (
            <path
              d={pipelinePath}
              fill="none"
              stroke="url(#pipelineStrokeGradient)"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          )}

          {(activeMetric === "both" || activeMetric === "closed") && (
            <path
              d={closedPath}
              fill="none"
              stroke="url(#closedStrokeGradient)"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          )}

          {/* X-Axis labels & Interactive hover columns */}
          {data.map((d, i) => {
            const x = padding.left + i * (chartWidth / (data.length - 1 || 1));
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* X-axis tick label */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] font-mono transition-colors",
                    isHovered ? "fill-slate-900 font-bold" : "fill-slate-400"
                  )}
                >
                  {d.label}
                </text>

                {/* Hover trigger zone */}
                <rect
                  x={x - (chartWidth / data.length) / 2}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}

          {/* Active Hover Guideline & Indicator Dots */}
          {hoverIndex !== null && activeHoverClosedPt && (
            <g>
              <line
                x1={activeHoverClosedPt.x}
                y1={padding.top}
                x2={activeHoverClosedPt.x}
                y2={padding.top + chartHeight}
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Closed won pulse point */}
              {(activeMetric === "both" || activeMetric === "closed") && (
                <g>
                  <circle
                    cx={activeHoverClosedPt.x}
                    cy={activeHoverClosedPt.y}
                    r="6"
                    fill="#10B981"
                    opacity="0.3"
                    className="animate-ping"
                  />
                  <circle
                    cx={activeHoverClosedPt.x}
                    cy={activeHoverClosedPt.y}
                    r="4.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* Pipeline pulse point */}
              {(activeMetric === "both" || activeMetric === "pipeline") && activeHoverPipelinePt && (
                <g>
                  <circle
                    cx={activeHoverPipelinePt.x}
                    cy={activeHoverPipelinePt.y}
                    r="6"
                    fill="#8B5CF6"
                    opacity="0.3"
                    className="animate-ping"
                  />
                  <circle
                    cx={activeHoverPipelinePt.x}
                    cy={activeHoverPipelinePt.y}
                    r="4.5"
                    fill="#8B5CF6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Floating Glassmorphic Tooltip */}
        {activeHover && activeHoverClosedPt && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-20"
            style={{
              left: `${(activeHoverClosedPt.x / width) * 100}%`,
              top: "15px",
              transform: activeHoverClosedPt.x > width * 0.7 ? "translateX(-105%)" : "translateX(8%)",
            }}
          >
            <div className="bg-white/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl text-xs space-y-2 min-w-[170px]">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/70 text-[11px] font-mono text-text-secondary">
                <span>{activeHover.label} ({activeHover.date})</span>
                <span className="text-[10px] text-accent font-semibold">{timeframe}</span>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between gap-3 text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Closed Won:
                  </span>
                  <span>${activeHover.closedRevenue.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-indigo-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Pipeline:
                  </span>
                  <span>${activeHover.pipelineValue.toLocaleString()}</span>
                </div>

                <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-text-secondary border-t border-border/50">
                  <span>Meetings Booked:</span>
                  <span className="text-text-primary font-bold">{activeHover.meetingsBooked}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Quick metrics footer */}
      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded-full bg-emerald-500" />
            <span className="text-text-secondary">Closed Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 rounded-full bg-indigo-500" />
            <span className="text-text-secondary">Weighted Pipeline</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+24.8% cash velocity vs prior period</span>
        </div>
      </div>
    </div>
  );
}
