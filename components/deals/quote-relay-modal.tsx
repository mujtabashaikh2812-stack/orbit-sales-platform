"use client";

import { useState } from "react";
import { LeadDetail } from "@/lib/db/leads";
import { DollarSign, Send, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface QuoteRelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadDetail;
  onSent: () => void;
}

export function QuoteRelayModal({
  isOpen,
  onClose,
  lead,
  onSent,
}: QuoteRelayModalProps) {
  const [price, setPrice] = useState<number>(lead.deal?.quoted_amount || 12000);
  const [currency, setCurrency] = useState(lead.deal?.currency || "USD");
  const [subject, setSubject] = useState(
    `Proposal & Quote: Custom Engineering for ${lead.company_name}`
  );
  const [body, setBody] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleGenerateDraft() {
    setIsDrafting(true);
    setError(null);

    try {
      const res = await fetch("/api/deals/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          quotedAmount: Number(price),
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.proposalDraft) {
        setSubject(data.proposalDraft.subject);
        setBody(data.proposalDraft.body);
        setDraftLoaded(true);
      } else {
        setError(data.error || "Failed to generate quote draft");
      }
    } catch {
      setError("Network error connecting to quote engine");
    } finally {
      setIsDrafting(false);
    }
  }

  async function handleSendQuote(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/deals/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          leadId: lead.id,
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          onSent();
          onClose();
        }, 1200);
      } else {
        setError(data.error || "Failed to send quote");
      }
    } catch {
      setError("Network error sending quotation email");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-lg text-text-primary font-medium tracking-tight">
              Sovereign Human Price Quotation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border/60">
          Specify your exact contract valuation. Claude will compile the recorded requirements and format a professional proposal draft for your inspection prior to delivery.
        </p>

        {error && (
          <div className="p-3.5 border border-rose-500/40 bg-rose-500/10 rounded-xl text-xs text-rose-400 font-mono">
            {error}
          </div>
        )}

        {/* Step 1: Set Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-surface p-4 rounded-xl border border-border/80 shadow-sm">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
              Fixed Valuation Amount (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-accent font-semibold">
                $
              </span>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white border border-border pl-8 pr-4 py-2 text-sm text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isDrafting || !price}
              onClick={handleGenerateDraft}
              className="w-full py-2.5 px-4 text-xs font-semibold text-text-primary bg-surface-raised hover:bg-surface border border-border/80 hover:border-accent/40 transition-all rounded-xl inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              {isDrafting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              )}
              <span>{draftLoaded ? "Update AI Draft" : "Format with AI"}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Review & Send Form */}
        {draftLoaded && (
          <form onSubmit={handleSendQuote} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Proposal Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-border px-3.5 py-2 text-xs text-text-primary font-mono rounded-xl focus:outline-none focus:border-accent shadow-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Formal Proposal Body</label>
              <textarea
                rows={7}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-white border border-border p-3.5 text-xs text-text-primary rounded-xl focus:outline-none focus:border-accent resize-none font-sans leading-relaxed shadow-sm transition-colors"
              />
            </div>

            <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-text-secondary bg-surface-raised px-3 py-1.5 rounded-xl border border-border/60 text-center sm:text-left">
                Price relayed: <strong className="text-accent">${price.toLocaleString()} {currency}</strong>
              </span>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 sm:py-2 text-xs text-text-secondary hover:text-text-primary transition-colors rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-md transition-all rounded-xl disabled:opacity-50 active:scale-[0.98] text-center"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSending ? "Dispatching..." : "Transmit Quote (Dry Run)"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
