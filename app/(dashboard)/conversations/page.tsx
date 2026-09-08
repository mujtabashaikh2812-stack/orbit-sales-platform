import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-baseline justify-between border-b border-border pb-5">
        <div>
          <h1 className="font-serif text-2xl md:text-[28px] text-text-primary tracking-tight font-medium">
            Conversations
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Email outreach threads, AI replies, and requirement extraction
          </p>
        </div>
      </div>

      {/* Empty State per design.md */}
      <div className="border border-border bg-surface p-12 text-center rounded">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-10 h-10 rounded-full border border-border bg-surface-raised flex items-center justify-center mx-auto text-text-secondary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-text-primary">
              No active conversations
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              When outreach emails receive responses, inbound messages and AI-classified intents will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
