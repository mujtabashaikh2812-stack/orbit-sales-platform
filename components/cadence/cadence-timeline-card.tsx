"use client";

import { useState } from "react";
import { LeadDetail } from "@/lib/db/leads";
import { 
  Bot, 
  FastForward, 
  Send, 
  CalendarCheck, 
  UserX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CadenceTimelineCardProps {
  lead: LeadDetail;
  onLeadUpdated: (updatedLead: LeadDetail) => void;
}

export function CadenceTimelineCard({ lead, onLeadUpdated }: CadenceTimelineCardProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const status = lead.cadence_status || "idle";
  const step = lead.cadence_step || 0;
  const logs = lead.cadence_logs || [];

  async function callCadenceApi(payload: Record<string, any>, actionName: string) {
    setLoadingAction(actionName);
    setFeedback(null);
    try {
      const res = await fetch("/api/cadence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setFeedback({ type: "error", message: data.error || "Action failed" });
      } else {
        if (data.lead) {
          onLeadUpdated(data.lead);
        }
        setFeedback({ 
          type: "success", 
          message: data.message || data.classificationReason || "Cadence updated successfully." 
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error executing cadence step" });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary text-base">
                Autonomous Cadence & Auto-Pilot
              </h3>
              {status === "active" && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Auto-Pilot
                </span>
              )}
              {status === "completed_booked" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                  🎉 Meeting Booked
                </span>
              )}
              {status === "completed_lost" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/40">
                  🛑 Terminated / Lost
                </span>
              )}
              {status === "idle" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-raised text-text-secondary border border-border">
                  Not Enrolled
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Multi-touch AI outreach loop that runs until client is booked or rejected.
            </p>
          </div>
        </div>

        {/* Top Action Button */}
        {status === "idle" && (
          <button
            onClick={() => callCadenceApi({ action: "enroll" }, "enroll")}
            disabled={loadingAction !== null || !lead.email}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-surface-dark font-medium text-xs shadow-sm transition disabled:opacity-50"
          >
            {loadingAction === "enroll" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Enroll in Autonomous Cadence
          </button>
        )}
      </div>

      {/* Cadence Step Visualization */}
      <div className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1: Cold Outreach */}
          <div className={cn(
            "p-3.5 rounded-lg border text-xs transition",
            step >= 1 ? "bg-surface-raised border-accent/40" : "bg-surface-raised/40 border-border/50 text-text-secondary"
          )}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-text-secondary uppercase">Touch 1</span>
              {step >= 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
              )}
            </div>
            <div className="font-medium text-text-primary mb-1">Cold Outreach</div>
            <div className="text-[11px] text-text-secondary leading-snug">
              Claude 3.5 tailored value proposition dispatched.
            </div>
          </div>

          {/* Step 2: Follow-Up 1 */}
          <div className={cn(
            "p-3.5 rounded-lg border text-xs transition",
            step >= 2 
              ? "bg-surface-raised border-accent/40" 
              : step === 1 
              ? "bg-surface-raised/80 border-amber-500/30 text-amber-300" 
              : "bg-surface-raised/40 border-border/50 text-text-secondary"
          )}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-text-secondary uppercase">Touch 2</span>
              {step >= 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step === 1 ? (
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
              )}
            </div>
            <div className="font-medium text-text-primary mb-1">Gentle Follow-Up</div>
            <div className="text-[11px] text-text-secondary leading-snug">
              {step === 1 ? "Scheduled after 3 days if no reply." : step >= 2 ? "Dispatched" : "Queued"}
            </div>
          </div>

          {/* Step 3: Breakup Email */}
          <div className={cn(
            "p-3.5 rounded-lg border text-xs transition",
            step >= 3 
              ? "bg-surface-raised border-accent/40" 
              : step === 2 
              ? "bg-surface-raised/80 border-amber-500/30 text-amber-300" 
              : "bg-surface-raised/40 border-border/50 text-text-secondary"
          )}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-text-secondary uppercase">Touch 3</span>
              {step >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
              )}
            </div>
            <div className="font-medium text-text-primary mb-1">Final Breakup</div>
            <div className="text-[11px] text-text-secondary leading-snug">
              {step === 2 ? "Scheduled after 4 days." : step >= 3 ? "Dispatched" : "Queued"}
            </div>
          </div>

          {/* Terminal Step */}
          <div className={cn(
            "p-3.5 rounded-lg border text-xs transition",
            status === "completed_booked"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              : status === "completed_lost"
              ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
              : "bg-surface-raised/40 border-border/50 text-text-secondary"
          )}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase">Outcome</span>
              {status === "completed_booked" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : status === "completed_lost" ? (
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
              )}
            </div>
            <div className="font-medium text-text-primary mb-1">
              {status === "completed_booked" ? "Meeting Booked 🎉" : status === "completed_lost" ? "Closed / Lost 🛑" : "Awaiting Terminal State"}
            </div>
            <div className="text-[11px] text-text-secondary leading-snug">
              {status === "completed_booked"
                ? "Converted prospect to scheduled discovery call."
                : status === "completed_lost"
                ? "Disqualified or max follow-ups elapsed."
                : "Active cadence stops on booking or opt-out."}
            </div>
          </div>
        </div>
      </div>

      {/* Simulator & Autonomous Control Panel */}
      <div className="bg-surface-raised/60 rounded-lg p-4 border border-border/60">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary font-semibold flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-accent" />
            Cadence Simulator & Test Triggers
          </span>
          <span className="text-[11px] text-text-secondary">
            Test and fast-forward state transitions without waiting days
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fast Forward Step */}
          {status === "active" && (
            <button
              onClick={() => callCadenceApi({ action: "tick", forceTick: true }, "fast_forward")}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-accent/40 text-text-primary hover:text-accent text-xs font-medium transition disabled:opacity-50"
            >
              {loadingAction === "fast_forward" ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <FastForward className="w-3 h-3 text-amber-400" />
              )}
              ⏩ Fast-Forward to Next Follow-Up
            </button>
          )}

          {/* Simulate Inbound Question */}
          <button
            onClick={() =>
              callCadenceApi(
                {
                  action: "simulate_reply",
                  replyText:
                    "Hi, this looks relevant to our current architecture sprint. What is your typical timeline and how do your rates work?",
                },
                "sim_question"
              )
            }
            disabled={loadingAction !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-emerald-500/40 text-text-primary hover:text-emerald-400 text-xs font-medium transition disabled:opacity-50"
          >
            {loadingAction === "sim_question" ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3 text-emerald-400" />
            )}
            📩 Simulate Interested Client Reply
          </button>

          {/* Simulate Inbound Rejection */}
          <button
            onClick={() =>
              callCadenceApi(
                {
                  action: "simulate_reply",
                  replyText: "We are not looking for outside help right now. Please unsubscribe and remove me from your list.",
                },
                "sim_rejection"
              )
            }
            disabled={loadingAction !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-rose-500/40 text-text-primary hover:text-rose-400 text-xs font-medium transition disabled:opacity-50"
          >
            {loadingAction === "sim_rejection" ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <UserX className="w-3 h-3 text-rose-400" />
            )}
            🛑 Simulate Rejection / Opt-Out
          </button>

          {/* Confirm Meeting Booked */}
          <button
            onClick={() =>
              callCadenceApi(
                { action: "confirm_booking", meetingTitle: "Introductory Discovery Call" },
                "confirm_booking"
              )
            }
            disabled={loadingAction !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:border-emerald-500/40 text-text-primary hover:text-emerald-400 text-xs font-medium transition disabled:opacity-50"
          >
            {loadingAction === "confirm_booking" ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <CalendarCheck className="w-3 h-3 text-emerald-400" />
            )}
            🎉 Confirm Meeting Booked
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={cn(
            "mt-3 text-xs p-2.5 rounded-md border flex items-center gap-2",
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          )}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Cadence Event History */}
      {logs.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-2.5">
            Cadence Transition Log ({logs.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {logs.slice().reverse().map((log, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between text-xs py-1.5 px-2.5 rounded bg-surface-raised/40 border border-border/40 font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-accent font-semibold">[{log.step}/3]</span>
                  <span className="text-text-primary">{log.action}</span>
                  {log.details && (
                    <span className="text-text-secondary text-[11px] truncate max-w-xs">
                      — {log.details}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-secondary shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
