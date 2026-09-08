"use client";

import { useState } from "react";
import { LeadDetail } from "@/lib/db/leads";
import { MessageSquare, Sparkles, X, Loader2, CheckCircle2 } from "lucide-react";

interface ReplySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadDetail;
  onProcessed: () => void;
}

const PRESET_REPLIES = [
  {
    label: "Interested with requirements",
    subject: "Re: Quick question",
    body: "Hi, thanks for reaching out. Yes, we are actually currently struggling with our webhook syncing pipeline. We have a budget around $15,000 and need this delivered within 4 weeks. What does your availability look like?",
  },
  {
    label: "Technical clarifying question",
    subject: "Re: Quick question",
    body: "Thanks for the note. Do you have direct experience integrating Next.js with Supabase Postgres and high-throughput background queues? What is your typical engagement model?",
  },
  {
    label: "Not interested / Unsubscribe",
    subject: "Re: Quick question",
    body: "Please unsubscribe me from future communications. We handle all engineering in-house.",
  },
  {
    label: "Out of office notice",
    subject: "Automatic reply: Out of office",
    body: "Thank you for your message. I am currently out of the office attending an industry conference with limited email access until next Tuesday.",
  },
];

export function ReplySimulatorModal({
  isOpen,
  onClose,
  lead,
  onProcessed,
}: ReplySimulatorModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [subject, setSubject] = useState(PRESET_REPLIES[0].subject);
  const [replyBody, setReplyBody] = useState(PRESET_REPLIES[0].body);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    intent: string;
    reasoning: string;
  } | null>(null);

  if (!isOpen) return null;

  function handleSelectPreset(index: number) {
    setSelectedPreset(index);
    setSubject(PRESET_REPLIES[index].subject);
    setReplyBody(PRESET_REPLIES[index].body);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/replies/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          senderEmail: lead.email || "prospect@example.com",
          subject,
          replyBody,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({
          intent: data.intent,
          reasoning: data.reasoning,
        });
        setTimeout(() => {
          onProcessed();
          onClose();
        }, 1500);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface-raised border border-border rounded p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg text-text-primary font-medium">
              Record / Simulate Inbound Reply
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

        {/* Preset Selector Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary">Choose scenario or edit below:</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_REPLIES.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(i)}
                className={`p-2 text-left text-xs rounded border transition-colors ${
                  selectedPreset === i
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-border bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Inbound Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-2 text-xs text-text-primary font-mono rounded focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Inbound Message Body</label>
            <textarea
              rows={5}
              required
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full bg-ink border border-border p-3 text-xs text-text-primary rounded focus:outline-none focus:border-accent resize-none font-sans leading-relaxed"
            />
          </div>

          {result && (
            <div className="p-3 border border-success/40 bg-success/10 rounded text-xs text-success space-y-1 font-mono">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Classified Intent: {result.intent.toUpperCase()}</span>
              </div>
              <p className="text-[11px] text-text-secondary">{result.reasoning}</p>
            </div>
          )}

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
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{loading ? "Classifying with Claude..." : "Process reply"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
