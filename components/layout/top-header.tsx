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
  Zap,
  Menu
} from "lucide-react";

interface TopHeaderProps {
  onOpenMenu?: () => void;
}

export function TopHeader({ onOpenMenu }: TopHeaderProps) {
  const pathname = usePathname();

  function getBreadcrumb() {
    if (pathname === "/") return { title: "Dashboard", category: "Ledger" };
    if (pathname === "/analytics") return { title: "Executive Analytics", category: "Revenue" };
    if (pathname.startsWith("/leads/")) return { title: "Lead Dossier", category: "CRM" };
    if (pathname === "/leads") return { title: "Leads CRM", category: "Prospecting" };
    if (pathname === "/conversations") return { title: "Conversations", category: "Outreach" };
    if (pathname === "/meetings") return { title: "Meetings Ledger", category: "Calendar" };
    if (pathname === "/settings") return { title: "Settings & Safeguards", category: "System" };
    return { title: "Overview", category: "Orbit" };
  }

  const { title, category } = getBreadcrumb();

  return (
    <header className="h-16 border-b border-border bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Hamburger & Breadcrumb Trail */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-mono">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-text-muted hover:text-text-secondary transition-colors hidden sm:inline">
          Orbit
        </span>
        <ChevronRight className="w-3 h-3 text-text-muted hidden sm:inline" />
        <span className="text-text-secondary hidden md:inline">{category}</span>
        <ChevronRight className="w-3 h-3 text-text-muted hidden md:inline" />
        <span className="text-text-primary font-semibold tracking-tight truncate max-w-[150px] sm:max-w-none">
          {title}
        </span>
      </div>

      {/* Right: Operational Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Model Engine Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-text-secondary text-[11px]">Claude 3.5 Sonnet</span>
        </div>

        {/* Dispatch Safeguard Mode */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-accent text-[11px] font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>DRY RUN SAFE</span>
        </div>

        {/* Fast Action CTA */}
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:brightness-105 shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span className="hidden sm:inline">New Lead</span>
          <span className="sm:hidden font-semibold">New</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-border mx-0.5" />

        {/* Operator Profile Chip */}
        <div className="flex items-center gap-2 pl-0.5 sm:pl-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200/80 flex items-center justify-center text-xs font-mono text-accent font-semibold shadow-sm">
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
