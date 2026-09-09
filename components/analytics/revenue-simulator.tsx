"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Sparkles, DollarSign, Target, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatorPreset {
  name: string;
  leads: number;
  dealSize: number;
  replyRate: number;
  closeRate: number;
}

const PRESETS: SimulatorPreset[] = [
  {
    name: "Conservative",
    leads: 80,
    dealSize: 8500,
    replyRate: 12,
    closeRate: 18,
  },
  {
    name: "Target Balanced",
    leads: 180,
    dealSize: 14000,
    replyRate: 20,
    closeRate: 28,
  },
  {
    name: "Aggressive Scale",
    leads: 450,
    dealSize: 22000,
    replyRate: 25,
    closeRate: 35,
  },
];

export function RevenueSimulator() {
  const [leadsVolume, setLeadsVolume] = useState<number>(180);
  const [dealSize, setDealSize] = useState<number>(14000);
  const [replyRate, setReplyRate] = useState<number>(20);
  const [closeRate, setCloseRate] = useState<number>(28);

  const calculations = useMemo(() => {
    // Estimated replies
    const replies = Math.round(leadsVolume * (replyRate / 100));
    // 55% of replies convert to booked discovery calls
    const bookedCalls = Math.max(1, Math.round(replies * 0.55));
    // Deals won
    const dealsWon = Math.max(1, Math.round(bookedCalls * (closeRate / 100)));
    // Monthly & Annual Revenue
    const monthlyRevenue = dealsWon * dealSize;
    const annualRevenue = monthlyRevenue * 12;

    return {
      replies,
      bookedCalls,
      dealsWon,
      monthlyRevenue,
      annualRevenue,
    };
  }, [leadsVolume, dealSize, replyRate, closeRate]);

  function applyPreset(preset: SimulatorPreset) {
    setLeadsVolume(preset.leads);
    setDealSize(preset.dealSize);
    setReplyRate(preset.replyRate);
    setCloseRate(preset.closeRate);
  }

  return (
    <div className="bg-white rounded-2xl border border-border/80 p-6 shadow-card space-y-6">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h3 className="font-medium text-sm text-text-primary flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Interactive Revenue Projection & Goal Simulator
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Model pipeline velocity and forecast forward monthly & annual revenue
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border/60 text-xs">
          {PRESETS.map((p) => {
            const isActive =
              leadsVolume === p.leads &&
              dealSize === p.dealSize &&
              replyRate === p.replyRate &&
              closeRate === p.closeRate;

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all text-xs",
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Monthly Outbound Leads */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-text-secondary font-medium">Monthly Outbound Prospects</label>
              <span className="font-mono font-bold text-text-primary">{leadsVolume} leads/mo</span>
            </div>
            <input
              type="range"
              min="20"
              max="800"
              step="10"
              value={leadsVolume}
              onChange={(e) => setLeadsVolume(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>20 leads</span>
              <span>400 leads</span>
              <span>800 leads</span>
            </div>
          </div>

          {/* Slider 2: Average Deal Value */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-text-secondary font-medium">Average Deal Size (ACV)</label>
              <span className="font-mono font-bold text-text-primary">${dealSize.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2500"
              max="40000"
              step="500"
              value={dealSize}
              onChange={(e) => setDealSize(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>$2.5k</span>
              <span>$20k</span>
              <span>$40k</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slider 3: Cadence Reply Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-text-secondary font-medium">Cadence Reply Rate</label>
                <span className="font-mono font-bold text-emerald-700">{replyRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={replyRate}
                onChange={(e) => setReplyRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>5%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Slider 4: Discovery Call to Close Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-text-secondary font-medium">Meeting-to-Close Rate</label>
                <span className="font-mono font-bold text-indigo-700">{closeRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="2"
                value={closeRate}
                onChange={(e) => setCloseRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-text-muted">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projected Output Display Column */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-pink-50/50 border border-indigo-100 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100/80">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-indigo-900">
                Forecast Realization
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Live Modeling
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-indigo-900/80 font-medium">Projected Monthly Revenue</div>
              <div className="font-serif text-3xl font-bold tracking-tight text-slate-900">
                ${calculations.monthlyRevenue.toLocaleString()}
                <span className="text-xs font-mono font-normal text-slate-500"> /mo</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-xs text-indigo-900/80 font-medium">Annualized Run-Rate (ARR)</div>
              <div className="font-serif text-2xl font-bold tracking-tight text-indigo-900">
                ${calculations.annualRevenue.toLocaleString()}
                <span className="text-xs font-mono font-normal text-indigo-600"> /yr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-indigo-100/80 text-[11px] font-mono">
            <div>
              <span className="text-text-secondary block text-[10px]">Replies</span>
              <span className="font-bold text-text-primary">{calculations.replies}</span>
            </div>
            <div>
              <span className="text-text-secondary block text-[10px]">Calls Booked</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" />
                {calculations.bookedCalls}
              </span>
            </div>
            <div>
              <span className="text-text-secondary block text-[10px]">Won Deals</span>
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                {calculations.dealsWon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
