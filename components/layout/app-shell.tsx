"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent text-text-primary">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader onOpenMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-3.5 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
