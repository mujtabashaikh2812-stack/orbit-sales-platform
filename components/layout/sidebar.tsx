"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  Sliders 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Settings", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-ink border-r border-border flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="font-serif text-lg tracking-wide text-text-primary font-medium">
              Orbit
            </span>
            <span className="text-[11px] font-mono text-text-secondary ml-auto border border-border px-1.5 py-0.5 rounded-sm">
              solo
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors duration-150",
                  isActive
                    ? "bg-surface text-text-primary font-medium border-l-2 border-accent pl-[10px]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-accent" : "text-text-secondary group-hover:text-text-primary"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            <span>Outreach Engine</span>
          </span>
          <span className="text-[10px] text-text-secondary border border-border px-1 py-0.5 rounded-sm">
            DRY RUN
          </span>
        </div>
      </div>
    </aside>
  );
}
