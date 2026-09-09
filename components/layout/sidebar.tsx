"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  Sliders,
  ShieldCheck,
  Circle
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
  { label: "Conversations", href: "/conversations", icon: MessageSquare, shortcut: "3" },
  { label: "Meetings", href: "/meetings", icon: Calendar, shortcut: "4" },
  { label: "Settings", href: "/settings", icon: Sliders, shortcut: "5" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-ink border-r border-border flex flex-col justify-between select-none z-40">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group w-full">
            {/* Celestial Orbit Icon */}
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center relative shadow-inner group-hover:border-accent/40 transition-colors">
              <div className="w-3.5 h-3.5 rounded-full border border-accent/70 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="absolute -inset-0.5 rounded-lg bg-accent/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg tracking-tight text-text-primary font-medium">
                  Orbit
                </span>
                <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/25 px-1.5 py-0.2 rounded">
                  OS
                </span>
              </div>
              <div className="text-[10px] font-mono text-text-muted -mt-0.5">
                Solo Sales Ledger
              </div>
            </div>
          </Link>
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
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all duration-150 group relative",
                  isActive
                    ? "bg-surface-raised text-text-primary font-medium border border-border shadow-card"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted group-hover:text-text-primary"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(212,163,89,0.8)]" />
                  )}
                  <span className="text-[10px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity border border-border/80 px-1 rounded bg-surface">
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
    </aside>
  );
}
