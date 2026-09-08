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
    style: "text-text-secondary border-border/80 bg-surface-raised/60",
    dot: "bg-text-muted",
  },
  enriched: {
    label: "Enriched",
    style: "text-text-primary border-border bg-surface-raised",
    dot: "bg-text-secondary",
  },
  contacted: {
    label: "Contacted",
    style: "text-amber-400 border-amber-500/25 bg-amber-500/10",
    dot: "bg-amber-400",
  },
  replied: {
    label: "Replied",
    style: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10 font-medium",
    dot: "bg-emerald-400 animate-pulse",
  },
  qualified: {
    label: "Qualified",
    style: "text-accent border-accent/30 bg-accent/10 font-medium",
    dot: "bg-accent shadow-[0_0_6px_rgba(212,163,89,0.8)]",
  },
  meeting_booked: {
    label: "Meeting booked",
    style: "text-emerald-300 border-emerald-500/35 bg-emerald-500/15 font-semibold",
    dot: "bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.8)]",
  },
  priced: {
    label: "Priced",
    style: "text-accent border-accent/40 bg-accent/15 font-medium",
    dot: "bg-accent",
  },
  won: {
    label: "Won",
    style: "text-emerald-400 border-emerald-500/40 bg-emerald-500/20 font-semibold",
    dot: "bg-emerald-400",
  },
  lost: {
    label: "Lost",
    style: "text-rose-400 border-rose-500/25 bg-rose-500/10",
    dot: "bg-rose-400",
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
