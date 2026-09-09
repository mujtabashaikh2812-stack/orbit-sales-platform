"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  BarChart3, 
  RefreshCw, 
  ArrowUpRight,
  Sparkles,
  Layers,
  Bot
} from "lucide-react";
import { getLeads, getLeadsSync, INITIAL_LEADS, LeadDetail } from "@/lib/db/leads";
import { computeAnalytics, Timeframe } from "@/lib/analytics/analytics-service";
import { RevenueAreaChart } from "@/components/analytics/revenue-area-chart";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { CadenceAnalytics } from "@/components/analytics/cadence-analytics";
import { ChannelRoiTable } from "@/components/analytics/channel-roi-table";
import { RevenueSimulator } from "@/components/analytics/revenue-simulator";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(INITIAL_LEADS);
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const cached = getLeadsSync();
    if (cached && cached.length > 0) {
      setLeads(cached);
    }
    async function loadFresh() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch {}
    }
    loadFresh();
  }, []);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }

  const analytics = useMemo(() => {
    return computeAnalytics(leads, timeframe);
  }, [leads, timeframe]);

  return (
    <div className="space-y-7 pb-12">
      {/* Page Header with Timeframe Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm inline-block" />
            <h1 className="font-serif text-2xl lg:text-3xl text-text-primary font-semibold tracking-tight">
              Executive Analytics & Revenue Intelligence
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time cashflow realization, pipeline velocity, and autonomous outreach attribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Timeframe selector pill */}
          <div className="flex items-center gap-1 bg-surface-raised/80 p-1 rounded-xl border border-border text-xs font-mono font-medium shadow-xs">
            {(["7d", "30d", "90d", "1y"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-3 py-1 rounded-lg uppercase text-[11px] transition-all",
                  timeframe === tf
                    ? "bg-white text-indigo-700 shadow-sm font-bold border border-border/40"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised shadow-xs transition-all disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-accent")} />
          </button>
        </div>
      </div>

      {/* Top Financial KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Closed Won Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Closed Won Revenue</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            ${analytics.closedWonRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% cash velocity vs prior period</span>
          </div>
        </div>

        {/* KPI 2: Weighted Pipeline Value */}
        <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Weighted Pipeline Value</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            ${analytics.weightedPipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
            <span>Raw Pipeline:</span>
            <span className="font-bold text-text-primary">${analytics.totalPipelineValue.toLocaleString()}</span>
          </div>
        </div>

        {/* KPI 3: Average Contract Value */}
        <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Average Deal Size (ACV)</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            ${analytics.averageDealSize.toLocaleString()}
          </div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <span>Win Rate:</span>
            <span className="font-bold text-emerald-700 font-mono">{analytics.winRate}%</span>
            <span>across closed quotes</span>
          </div>
        </div>

        {/* KPI 4: Sales Velocity & Cycle */}
        <div className="p-5 rounded-2xl bg-white border border-border/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">Avg Sales Cycle Velocity</span>
            <span className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            {analytics.averageCycleDays} Days
          </div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1">
            <span>Overall Conversion:</span>
            <span className="font-bold text-indigo-700 font-mono">{analytics.overallConversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Revenue & Velocity Area Chart */}
      <RevenueAreaChart data={analytics.timeSeries} timeframe={timeframe} />

      {/* Conversion Funnel & Stage Drop-Off */}
      <ConversionFunnel funnel={analytics.funnel} />

      {/* Autonomous Cadence & Sentiment Performance */}
      <CadenceAnalytics 
        touchpoints={analytics.touchpoints} 
        sentiment={analytics.sentiment} 
      />

      {/* Lead Sourcing ROI Ledger */}
      <ChannelRoiTable channels={analytics.channels} />

      {/* Interactive What-If Revenue Simulator */}
      <RevenueSimulator />
    </div>
  );
}
