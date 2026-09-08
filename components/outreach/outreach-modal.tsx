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
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-raised border border-border rounded p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-serif text-lg text-text-primary font-medium">
                AI Cold Outreach Draft
              </h2>
              {model && (
                <span className="text-[10px] font-mono text-text-secondary border border-border px-1.5 py-0.5 rounded-sm bg-ink">
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
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="p-3 border border-warning/30 bg-warning/5 rounded text-xs text-text-secondary flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-warning font-medium">Dry-Run Protection Active:</span> No real emails will leave your mailbox. Outbound emails are drafted and logged to the CRM messages ledger with zero delivery risk.
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div
            className={`text-xs px-3 py-2 rounded flex items-center gap-2 border font-mono ${
              statusMessage.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger"
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
          <div className="p-12 text-center text-xs font-mono text-text-secondary flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span>Consulting Claude API & synthesizing company context...</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary">Subject line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-ink border border-border px-3 py-2 text-sm text-text-primary font-mono rounded focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-text-secondary">Email Body</label>
                <button
                  type="button"
                  onClick={generateDraft}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate copy</span>
                </button>
              </div>
              <textarea
                rows={9}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-ink border border-border p-3 text-xs text-text-primary rounded focus:outline-none focus:border-accent resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Actions */}
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
                disabled={sending || !lead.email}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{sending ? "Logging..." : "Send email (Dry Run)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
