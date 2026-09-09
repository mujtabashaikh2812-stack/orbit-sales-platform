import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-transparent text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader />
        <main className="flex-1 px-8 lg:px-12 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
