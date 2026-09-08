import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-ink text-text-primary">
      <Sidebar />
      <main className="flex-1 min-w-0 px-12 py-10 overflow-y-auto">
        <div className="max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
