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
import { getLeads, LeadDetail } from "@/lib/db/leads";
import { Meeting } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EnrichedMeeting extends Meeting {
  leadId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function MeetingsPage() {
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load meetings:", err);
      } finally {
        setLoading(false);
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
            Meetings Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Google Calendar synchronizations, discovery sessions, and scheduled prospect calls
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="border border-border bg-surface px-3 py-1.5 rounded flex items-center gap-2">
            <span className="text-text-secondary">UPCOMING:</span>
            <span className="text-accent font-semibold">{upcomingCount}</span>
          </div>
          <div className="border border-border bg-surface px-3 py-1.5 rounded flex items-center gap-2">
            <span className="text-text-secondary">TOTAL RECORDED:</span>
            <span className="text-text-primary font-semibold">{totalBooked}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border border-border bg-surface p-1 rounded">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              filter === "all"
                ? "bg-accent text-ink font-medium"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            All Meetings ({allMeetings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("upcoming")}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              filter === "upcoming"
                ? "bg-accent text-ink font-medium"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("past")}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              filter === "past"
                ? "bg-accent text-ink font-medium"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Past ({allMeetings.length - upcomingCount})
          </button>
        </div>

        <div className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>Google Calendar API: Linked (Simulated)</span>
        </div>
      </div>

      {/* Table or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-text-secondary border border-border bg-surface rounded">
          Loading calendar ledger entries...
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center rounded">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-10 h-10 rounded-full border border-border bg-surface-raised flex items-center justify-center mx-auto text-text-secondary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-text-primary">
                No meetings {filter !== "all" ? `in ${filter}` : "recorded"}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                When prospects agree to discovery calls, schedule them directly from the lead dossier. They will synchronize and be logged in this ledger.
              </p>
            </div>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
            >
              <span>View Leads Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised font-mono text-[11px] text-text-secondary">
                  <th className="py-3 px-4 font-normal">SCHEDULED TIME (UTC)</th>
                  <th className="py-3 px-4 font-normal">PROSPECT / COMPANY</th>
                  <th className="py-3 px-4 font-normal">DURATION</th>
                  <th className="py-3 px-4 font-normal">STATUS</th>
                  <th className="py-3 px-4 font-normal">NOTES & SCOPE</th>
                  <th className="py-3 px-4 font-normal">CONFERENCE</th>
                  <th className="py-3 px-4 font-normal text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMeetings.map((mtg) => {
                  const mtgDate = new Date(mtg.scheduled_at);

                  return (
                    <tr
                      key={mtg.id}
                      className="hover:bg-ink/30 transition-colors duration-150"
                    >
                      {/* Scheduled Time */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-text-primary font-medium">
                          {mtgDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          {mtgDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZoneName: "short",
                          })}
                        </div>
                      </td>

                      {/* Prospect / Company */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/leads/${mtg.leadId}`}
                          className="font-medium text-text-primary hover:text-accent hover:underline block"
                        >
                          {mtg.companyName}
                        </Link>
                        <div className="text-[11px] text-text-secondary flex items-center gap-1.5 mt-0.5">
                          <span>{mtg.contactName}</span>
                          {mtg.contactEmail && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{mtg.contactEmail}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        <span className="border border-border px-1.5 py-0.5 rounded-sm bg-ink">
                          {mtg.duration_minutes} min
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-block font-mono text-[10px] px-2 py-0.5 rounded-sm border uppercase",
                            mtg.status === "confirmed"
                              ? "border-success/40 bg-success/10 text-success"
                              : mtg.status === "completed"
                              ? "border-accent/40 bg-accent/10 text-accent"
                              : mtg.status === "cancelled" || mtg.status === "no_show"
                              ? "border-danger/40 bg-danger/10 text-danger"
                              : "border-border bg-ink text-text-secondary"
                          )}
                        >
                          {mtg.status}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-text-secondary truncate text-[11px]" title={mtg.notes || ""}>
                          {mtg.notes || "Discovery call"}
                        </p>
                      </td>

                      {/* Conference */}
                      <td className="py-3 px-4">
                        <a
                          href="https://meet.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Google Meet</span>
                        </a>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/leads/${mtg.leadId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-text-secondary hover:text-accent transition-colors"
                        >
                          <span>Dossier</span>
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
