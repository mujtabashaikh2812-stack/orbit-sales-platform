"use client";

import React from "react";
import { ChannelRoiMetric } from "@/lib/analytics/analytics-service";
import { Layers, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelRoiTableProps {
  channels: ChannelRoiMetric[];
}

export function ChannelRoiTable({ channels }: ChannelRoiTableProps) {
  const totalRevenue = channels.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-border/80 p-6 shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <h3 className="font-medium text-sm text-text-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-pink-600" />
              Lead Sourcing Channel Performance & Revenue Attribution
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Deliverability, meeting generation, and closed revenue by prospect acquisition source
          </p>
        </div>

        <div className="text-xs font-mono text-text-secondary bg-surface-raised px-3 py-1 rounded-xl border border-border/60">
          Total Channel Revenue: <span className="font-bold text-emerald-700">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-raised/70 font-mono text-[10px] text-text-muted uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Acquisition Channel</th>
              <th className="py-3 px-4 font-medium text-right">Leads Sourced</th>
              <th className="py-3 px-4 font-medium text-right">Deliverability</th>
              <th className="py-3 px-4 font-medium text-right">Meetings Booked</th>
              <th className="py-3 px-4 font-medium text-right">Deals Won</th>
              <th className="py-3 px-4 font-medium text-right">Win Rate</th>
              <th className="py-3 px-4 font-medium text-right">Attributed Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {channels.map((channel) => (
              <tr
                key={channel.name}
                className="hover:bg-surface-raised/50 transition-colors"
              >
                {/* Channel Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-50 to-pink-50 border border-indigo-100 flex items-center justify-center font-mono text-[11px] font-bold text-indigo-700">
                      {channel.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{channel.name}</div>
                      <div className="text-[10px] font-mono text-text-secondary capitalize">
                        {channel.source.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Sourced */}
                <td className="py-3.5 px-4 text-right font-mono font-medium text-text-primary">
                  {channel.leadsCount}
                </td>

                {/* Deliverability */}
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {channel.verifiedRate}%
                  </span>
                </td>

                {/* Meetings Booked */}
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-text-primary">
                  {channel.meetingsBooked}
                </td>

                {/* Deals Won */}
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                  {channel.dealsWon}
                </td>

                {/* Win Rate */}
                <td className="py-3.5 px-4 text-right font-mono">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-medium border",
                    channel.winRate >= 35 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-surface-raised text-text-secondary border-border"
                  )}>
                    {channel.winRate}%
                  </span>
                </td>

                {/* Attributed Revenue */}
                <td className="py-3.5 px-4 text-right font-mono font-bold text-text-primary">
                  ${channel.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
