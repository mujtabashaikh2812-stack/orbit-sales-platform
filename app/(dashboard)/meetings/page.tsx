"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Video, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from "lucide-react";
import { getLeads, getLeadsSync, LeadDetail } from "@/lib/db/leads";
import { Meeting } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EnrichedMeeting extends Meeting {
  leadId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function MeetingsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>(() => getLeadsSync());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load meetings:", err);
      }
    }
    loadData();
  }, []);

  const allMeetings: EnrichedMeeting[] = useMemo(() => {
    const list: EnrichedMeeting[] = [];
    for (const lead of leads) {
      if (lead.meetings && lead.meetings.length > 0) {
        for (const m of lead.meetings) {
          list.push({
            ...m,
            leadId: lead.id,
            companyName: lead.company_name,
            contactName: lead.contact_name,
            contactEmail: lead.email || "",
          });
        }
      }
    }
    return list.sort(
      (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    );
  }, [leads]);

  const now = new Date();

  const filteredMeetings = useMemo(() => {
    if (filter === "upcoming") {
      return allMeetings.filter((m) => new Date(m.scheduled_at) >= now);
    }
    if (filter === "past") {
      return allMeetings.filter((m) => new Date(m.scheduled_at) < now);
    }
    return allMeetings;
  }, [allMeetings, filter, now]);

  const upcomingCount = allMeetings.filter((m) => new Date(m.scheduled_at) >= now).length;
  const totalBooked = allMeetings.length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border pb-5 gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Discovery Meetings Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Google Calendar synchronizations, executive discovery calls, and scheduled client sessions
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="border border-border/80 bg-surface-raised px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-card">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Upcoming</span>
            <span className="text-accent font-bold text-sm">{upcomingCount}</span>
          </div>
          <div className="border border-border/80 bg-surface-raised px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-card">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Total Booked</span>
            <span className="text-text-primary font-bold text-sm">{totalBooked}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 border border-border/80 bg-surface p-1 rounded-xl shadow-card">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3.5 py-1.5 text-xs rounded-lg transition-all font-mono",
              filter === "all"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            All Sessions ({allMeetings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("upcoming")}
            className={cn(
              "px-3.5 py-1.5 text-xs rounded-lg transition-all font-mono",
              filter === "upcoming"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("past")}
            className={cn(
              "px-3.5 py-1.5 text-xs rounded-lg transition-all font-mono",
              filter === "past"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Concluded ({allMeetings.length - upcomingCount})
          </button>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Calendar Gateway: Connected</span>
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-text-secondary border border-border bg-surface rounded-2xl shadow-card">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading calendar ledger entries...
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="border border-border bg-surface p-16 text-center rounded-2xl shadow-card">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl border border-border/80 bg-surface-raised flex items-center justify-center mx-auto text-accent shadow-card">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-medium text-text-primary">
                No meetings {filter !== "all" ? `in ${filter}` : "recorded"}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                When prospects agree to discovery calls, book them directly from the lead dossier. They will synchronize and be logged in this ledger.
              </p>
            </div>
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 transition-all rounded-xl shadow-md active:scale-[0.98]"
            >
              <span>View Leads Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-surface-raised/60 font-mono text-[10px] text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-medium">SCHEDULED TIME (UTC)</th>
                  <th className="py-3.5 px-4 font-medium">PROSPECT / COMPANY</th>
                  <th className="py-3.5 px-4 font-medium">DURATION</th>
                  <th className="py-3.5 px-4 font-medium">STATUS</th>
                  <th className="py-3.5 px-4 font-medium">NOTES & SCOPE</th>
                  <th className="py-3.5 px-4 font-medium">CONFERENCE</th>
                  <th className="py-3.5 px-4 font-medium text-right">DOSSIER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMeetings.map((mtg) => {
                  const mtgDate = new Date(mtg.scheduled_at);

                  return (
                    <tr
                      key={mtg.id}
                      className="hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      {/* Scheduled Time */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-text-primary font-medium">
                          {mtgDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {mtgDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZoneName: "short",
                          })}
                        </div>
                      </td>

                      {/* Prospect / Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-surface-raised border border-border/80 flex items-center justify-center font-mono text-[10px] text-accent font-semibold shrink-0">
                            {mtg.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/leads/${mtg.leadId}`}
                              className="font-medium text-text-primary hover:text-accent transition-colors block"
                            >
                              {mtg.companyName}
                            </Link>
                            <div className="text-[11px] text-text-secondary flex items-center gap-1.5 mt-0.5">
                              <span>{mtg.contactName}</span>
                              {mtg.contactEmail && (
                                <>
                                  <span className="text-text-muted">·</span>
                                  <span className="font-mono text-text-muted">{mtg.contactEmail}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-text-secondary">
                        <span className="border border-border/70 px-2 py-0.5 rounded-md bg-ink/60 text-xs">
                          {mtg.duration_minutes}m
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-medium",
                            mtg.status === "confirmed"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : mtg.status === "completed"
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : mtg.status === "cancelled" || mtg.status === "no_show"
                              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                              : "border-border bg-ink text-text-secondary"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            mtg.status === "confirmed" ? "bg-emerald-400" : mtg.status === "completed" ? "bg-accent" : "bg-rose-400"
                          )} />
                          {mtg.status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-text-secondary truncate text-[11px]" title={mtg.notes || ""}>
                          {mtg.notes || "Executive Discovery Session"}
                        </p>
                      </td>

                      {/* Conference */}
                      <td className="py-3.5 px-4">
                        <a
                          href="https://meet.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-[11px] transition-all shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Google Meet</span>
                        </a>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/leads/${mtg.leadId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/80 bg-surface-raised hover:border-accent/40 hover:text-accent font-mono text-[11px] text-text-secondary transition-all shadow-xs"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
