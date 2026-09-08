"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  ChevronRight, 
  Bell, 
  Search,
  Zap
} from "lucide-react";

export function TopHeader() {
  const pathname = usePathname();

  function getBreadcrumb() {
    if (pathname === "/") return { title: "Dashboard", category: "Ledger" };
    if (pathname.startsWith("/leads/")) return { title: "Lead Dossier", category: "CRM" };
    if (pathname === "/leads") return { title: "Leads CRM", category: "Prospecting" };
    if (pathname === "/conversations") return { title: "Conversations", category: "Outreach" };
    if (pathname === "/meetings") return { title: "Meetings Ledger", category: "Calendar" };
    if (pathname === "/settings") return { title: "Settings & Safeguards", category: "System" };
    return { title: "Overview", category: "Orbit" };
  }

  const { title, category } = getBreadcrumb();

  return (
    <header className="h-16 border-b border-border bg-ink/75 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between transition-colors">
      {/* Left: Breadcrumb Trail */}
      <div className="flex items-center gap-2.5 text-xs font-mono">
        <span className="text-text-muted hover:text-text-secondary transition-colors">
          Orbit
        </span>
        <ChevronRight className="w-3 h-3 text-border-highlight" />
        <span className="text-text-secondary">{category}</span>
        <ChevronRight className="w-3 h-3 text-border-highlight" />
        <span className="text-text-primary font-medium tracking-tight">
          {title}
        </span>
      </div>

      {/* Right: Operational Controls */}
      <div className="flex items-center gap-3.5">
        {/* Model Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-text-secondary text-[11px]">Claude 3.5 Sonnet</span>
        </div>

        {/* Dispatch Safeguard Mode */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>DRY RUN SAFE</span>
        </div>

        {/* Fast Action CTA */}
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-ink bg-gradient-to-r from-accent to-[#E0B268] hover:brightness-110 shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-ink stroke-[2.5]" />
          <span>New Lead</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-border mx-0.5" />

        {/* Operator Profile Chip */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-surface-raised to-border border border-accent/40 flex items-center justify-center text-xs font-mono text-accent font-semibold shadow-inner">
            MS
          </div>
          <div className="hidden xl:block text-left text-xs leading-none space-y-0.5">
            <div className="font-medium text-text-primary text-[11px]">Solo Operator</div>
            <div className="text-[10px] font-mono text-text-muted">Trading Desk</div>
          </div>
        </div>
      </div>
    </header>
  );
}
