"use client";

import { useState, useEffect } from "react";
import { LeadDetail } from "@/lib/db/leads";
import { 
  Sparkles, 
  Send, 
  ShieldAlert, 
  X, 
  Loader2, 
  RefreshCw, 
  CheckCircle2 
} from "lucide-react";

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadDetail | null;
  onSent?: () => void;
}

export function OutreachModal({
  isOpen,
  onClose,
  lead,
  onSent,
}: OutreachModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function generateDraft() {
    if (!lead) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });

      const data = await res.json();
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
        setModel(data.draft.model);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to generate email draft",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Error connecting to AI drafting service",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && lead) {
      generateDraft();
    }
  }, [isOpen, lead?.id]);

  if (!isOpen || !lead) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!lead) return;

    setSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: data.isDryRun
            ? "Outreach recorded in Dry-Run mode. Lead advanced to Contacted."
            : "Email successfully transmitted via Gmail API. Lead advanced to Contacted.",
        });
        setTimeout(() => {
          onSent?.();
          onClose();
        }, 1200);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to send email",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error sending email",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-serif text-lg text-text-primary font-medium tracking-tight">
                AI Cold Outreach Draft
              </h2>
              {model && (
                <span className="text-[10px] font-mono text-accent border border-accent/30 px-2 py-0.5 rounded-md bg-accent/10">
                  {model}
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Recipient: <strong className="text-text-primary">{lead.contact_name}</strong> ({lead.email || "No email"}) at <strong className="text-text-primary">{lead.company_name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="p-3.5 border border-amber-500/30 bg-amber-500/10 rounded-xl text-xs text-amber-200/90 flex items-start gap-3 shadow-inner">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-400 font-semibold">Dry-Run Protection Active:</span> Zero risk of unreviewed external transmissions. Outbound emails are drafted, verified, and logged exclusively to the CRM ledger.
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div
            className={`text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 border font-mono ${
              statusMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-text-secondary flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span>Consulting Claude API & synthesizing operational context...</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-border px-3.5 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Executive Copy Body</label>
                <button
                  type="button"
                  onClick={generateDraft}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate copy</span>
                </button>
              </div>
              <textarea
                rows={6}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-white border border-border p-3.5 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent resize-none font-sans leading-relaxed shadow-sm transition-colors sm:rows-9"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 sm:py-2 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-xl text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || !lead.email}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-md transition-all rounded-xl disabled:opacity-50 active:scale-[0.98] text-center"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{sending ? "Logging..." : "Send Email (Dry Run)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
