"use client";

import { useState } from "react";
import { LeadDetail } from "@/lib/db/leads";
import { Calendar, Video, X, Loader2, CheckCircle2 } from "lucide-react";

interface MeetingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadDetail;
  onBooked: () => void;
}

export function MeetingBookingModal({
  isOpen,
  onClose,
  lead,
  onBooked,
}: MeetingBookingModalProps) {
  // Default to tomorrow at 2:00 PM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const [dateStr, setDateStr] = useState(tomorrow.toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState("14:00");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState(
    `Initial discovery scoping call with ${lead.contact_name} regarding ${lead.company_name} integration.`
  );
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    meetLink?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduledIso = new Date(`${dateStr}T${timeStr}:00`).toISOString();

      const res = await fetch("/api/meetings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          scheduledAt: scheduledIso,
          durationMinutes: Number(duration),
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessResult({
          meetLink: data.meeting?.notes?.includes("http") ? data.meeting.notes.split("Video link: ")[1] : undefined,
        });
        setTimeout(() => {
          onBooked();
          onClose();
        }, 1500);
      } else {
        setError(data.error || "Failed to book meeting");
      }
    } catch {
      setError("Network error contacting calendar service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-raised border border-border rounded p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg text-text-primary font-medium">
              Schedule Discovery Meeting
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-text-secondary">
          Booking for: <strong className="text-text-primary">{lead.contact_name}</strong> ({lead.company_name})
        </div>

        {error && (
          <div className="p-3 border border-danger/30 bg-danger/10 rounded text-xs text-danger font-mono">
            {error}
          </div>
        )}

        {successResult ? (
          <div className="p-4 border border-success/40 bg-success/10 rounded text-xs text-success space-y-2 font-mono">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Meeting confirmed & added to Google Calendar</span>
            </div>
            {successResult.meetLink && (
              <div className="flex items-center gap-1.5 text-text-primary pt-1">
                <Video className="w-3.5 h-3.5 text-accent" />
                <span className="truncate">{successResult.meetLink}</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary">Meeting Date</label>
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-ink border border-border px-3 py-2 text-xs text-text-primary font-mono rounded focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary">Start Time</label>
                <input
                  type="time"
                  required
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full bg-ink border border-border px-3 py-2 text-xs text-text-primary font-mono rounded focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Call Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-ink border border-border px-3 py-2 text-xs text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              >
                <option value={15}>15 minutes (Quick intro)</option>
                <option value={30}>30 minutes (Standard discovery)</option>
                <option value={45}>45 minutes (In-depth technical scoping)</option>
                <option value={60}>60 minutes (Architecture review)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Calendar Event Notes / Agenda</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-ink border border-border p-3 text-xs text-text-primary rounded focus:outline-none focus:border-accent resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>{loading ? "Booking on calendar..." : "Book meeting"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
