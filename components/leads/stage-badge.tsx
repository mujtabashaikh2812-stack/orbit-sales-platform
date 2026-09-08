import { LeadStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stage: LeadStage;
  className?: string;
}

const STAGE_CONFIG: Record<
  LeadStage,
  { label: string; style: string }
> = {
  sourced: {
    label: "Sourced",
    style: "text-text-secondary border-border bg-surface",
  },
  enriched: {
    label: "Enriched",
    style: "text-text-primary border-border bg-surface-raised",
  },
  contacted: {
    label: "Contacted",
    style: "text-warning border-warning/30 bg-warning/10",
  },
  replied: {
    label: "Replied",
    style: "text-success border-success/30 bg-success/10",
  },
  qualified: {
    label: "Qualified",
    style: "text-accent border-accent/30 bg-accent/10",
  },
  meeting_booked: {
    label: "Meeting booked",
    style: "text-success border-success/40 bg-success/15 font-medium",
  },
  priced: {
    label: "Priced",
    style: "text-accent border-accent/40 bg-accent/15",
  },
  won: {
    label: "Won",
    style: "text-success border-success/60 bg-success/20 font-medium",
  },
  lost: {
    label: "Lost",
    style: "text-danger border-danger/30 bg-danger/10",
  },
};

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage] || {
    label: stage,
    style: "text-text-secondary border-border bg-surface",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap",
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  );
}
