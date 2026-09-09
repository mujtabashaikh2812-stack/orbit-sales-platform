import { LeadStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stage: LeadStage;
  className?: string;
  showDot?: boolean;
}

const STAGE_CONFIG: Record<
  LeadStage,
  { label: string; style: string; dot: string }
> = {
  sourced: {
    label: "Sourced",
    style: "text-text-secondary border-border bg-surface-raised",
    dot: "bg-text-muted",
  },
  enriched: {
    label: "Enriched",
    style: "text-text-primary border-border bg-surface-raised font-medium",
    dot: "bg-text-secondary",
  },
  contacted: {
    label: "Contacted",
    style: "text-amber-700 border-amber-200 bg-amber-50 font-medium",
    dot: "bg-amber-500",
  },
  replied: {
    label: "Replied",
    style: "text-emerald-700 border-emerald-200 bg-emerald-50 font-medium",
    dot: "bg-emerald-500 animate-pulse",
  },
  qualified: {
    label: "Qualified",
    style: "text-indigo-700 border-indigo-200 bg-indigo-50 font-medium",
    dot: "bg-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.4)]",
  },
  meeting_booked: {
    label: "Meeting booked",
    style: "text-emerald-800 border-emerald-300 bg-emerald-50 font-semibold",
    dot: "bg-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.4)]",
  },
  priced: {
    label: "Priced",
    style: "text-purple-700 border-purple-200 bg-purple-50 font-medium",
    dot: "bg-purple-600",
  },
  won: {
    label: "Won",
    style: "text-emerald-800 border-emerald-300 bg-emerald-100/80 font-semibold",
    dot: "bg-emerald-600",
  },
  lost: {
    label: "Lost",
    style: "text-rose-700 border-rose-200 bg-rose-50",
    dot: "bg-rose-500",
  },
};

export function StageBadge({ stage, className, showDot = true }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage] || {
    label: stage,
    style: "text-text-secondary border-border bg-surface",
    dot: "bg-text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full border whitespace-nowrap tracking-wide uppercase transition-colors shadow-sm",
        config.style,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}
