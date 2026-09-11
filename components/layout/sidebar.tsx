"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp,
  MessageSquare, 
  Calendar, 
  Sliders,
  ShieldCheck,
  Circle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  shortcut: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, shortcut: "1" },
  { label: "Leads", href: "/leads", icon: Users, shortcut: "2" },
  { label: "Analytics", href: "/analytics", icon: TrendingUp, shortcut: "3" },
  { label: "Conversations", href: "/conversations", icon: MessageSquare, shortcut: "4" },
  { label: "Meetings", href: "/meetings", icon: Calendar, shortcut: "5" },
  { label: "Settings", href: "/settings", icon: Sliders, shortcut: "6" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  function renderSidebarContent(isMobile: boolean = false) {
    return (
      <>
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <Link 
              href="/" 
              onClick={() => isMobile && onClose?.()}
              className="flex items-center gap-3 group"
            >
              {/* Celestial Orbit Gradient Icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center relative shadow-sm text-white group-hover:scale-105 transition-transform">
                <div className="w-3.5 h-3.5 rounded-full border border-white/80 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg tracking-tight text-text-primary font-medium">
                    Orbit
                  </span>
                  <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/25 px-1.5 py-0.2 rounded">
                    OS
                  </span>
                </div>
                <div className="text-[10px] font-mono text-text-muted -mt-0.5">
                  Solo Sales Ledger
                </div>
              </div>
            </Link>

            {isMobile && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-mono tracking-wider text-text-muted uppercase">
          Workspace Navigation
        </div>

        {/* Navigation list */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => isMobile && onClose?.()}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all duration-150 group relative",
                  isActive
                    ? "bg-gradient-to-r from-indigo-50/90 to-purple-50/70 text-accent font-semibold border border-indigo-200/60 shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-accent/15 text-accent"
                        : "text-text-muted group-hover:text-text-primary"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                  )}
                  <span className="text-[10px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity border border-border px-1 rounded bg-surface">
                    {item.shortcut}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status Card */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="p-3 rounded-xl bg-surface border border-border/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>AI Engine Active</span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text-secondary">
              Safe Mode
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>Daily Throttle</span>
              <span className="text-text-primary">0 / 15 sent</span>
            </div>
            <div className="w-full h-1 rounded-full bg-ink overflow-hidden border border-border/50">
              <div className="h-full bg-accent w-1/12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 bg-white/85 backdrop-blur-xl border-r border-border flex-col justify-between select-none z-40 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Backdrop Overlay */}
      <div 
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-border flex lg:hidden flex-col justify-between select-none shadow-2xl transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
}
