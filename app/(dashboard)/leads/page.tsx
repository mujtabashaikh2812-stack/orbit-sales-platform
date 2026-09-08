import Link from "next/link";
import { Plus, Sliders } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-baseline justify-between border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Leads
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Prospect ledger, contact details, and pipeline stages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary border border-border bg-surface hover:bg-surface-raised transition-colors rounded"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Targeting Settings</span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-ink bg-accent hover:bg-accent-hover transition-colors rounded"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Empty State / Placeholder per design.md */}
      <div className="border border-border bg-surface p-12 text-center rounded">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-full border border-border bg-surface-raised flex items-center justify-center mx-auto text-accent">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-text-primary">
              No leads yet
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Add your ICP criteria in Settings to start sourcing, or manually add a prospect to begin your outreach.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/settings"
              className="text-xs text-accent hover:underline font-mono"
            >
              Configure ICP criteria
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
