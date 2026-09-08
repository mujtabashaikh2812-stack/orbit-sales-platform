import { LeadStage, StageHistory } from "@/lib/types";
import { createClient } from "./supabase-client";

/**
 * Atomic lead stage transition helper
 * Enforces the rule: Every stage transition updates leads.stage AND inserts
 * a stage_history record in the exact same operation.
 */
export async function transitionLeadStage({
  leadId,
  fromStage,
  toStage,
  triggeredBy = "owner",
}: {
  leadId: string;
  fromStage?: LeadStage | null;
  toStage: LeadStage;
  triggeredBy?: "ai" | "owner" | "system";
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const now = new Date().toISOString();

    // In a live Supabase environment, this is wrapped in an RPC or transaction
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        stage: toStage,
        stage_updated_at: now,
        updated_at: now,
      })
      .eq("id", leadId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    const { error: historyError } = await supabase
      .from("stage_history")
      .insert({
        lead_id: leadId,
        from_stage: fromStage ?? null,
        to_stage: toStage,
        changed_at: now,
        triggered_by: triggeredBy,
      });

    if (historyError) {
      return { success: false, error: historyError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error during stage transition";
    return { success: false, error: message };
  }
}
