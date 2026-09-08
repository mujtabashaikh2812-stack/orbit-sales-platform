import { getLeadById, updateLead, updateLeadStage, LeadDetail } from "@/lib/db/leads";
import { 
  QUOTE_RELAY_SYSTEM_PROMPT, 
  buildQuoteRelayUserPrompt, 
  QuoteRelayPromptVariables 
} from "@/lib/ai/prompts/quote-relay-v1";
import { sendGmailMessage } from "@/lib/email/gmail";
import { Deal, Message } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/db/supabase-client";

export async function setPriceAndDraftQuote(params: {
  leadId: string;
  quotedAmount: number;
  currency?: string;
}): Promise<{ deal: Deal; proposalDraft: { subject: string; body: string } }> {
  const lead = await getLeadById(params.leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const currency = params.currency || "USD";
  const now = new Date().toISOString();

  const dealRecord: Deal = {
    id: lead.deal?.id || `deal-${Date.now()}`,
    lead_id: lead.id,
    quoted_amount: params.quotedAmount,
    currency,
    status: "draft",
    created_at: lead.deal?.created_at || now,
  };

  // 1. Persist deal draft
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from("deals").upsert({
      lead_id: lead.id,
      quoted_amount: dealRecord.quoted_amount,
      currency: dealRecord.currency,
      status: "draft",
    });
  } else {
    await updateLead(lead.id, { deal: dealRecord });
  }

  // 2. Draft formal quote relay email using Claude
  let proposalDraft = {
    subject: `Proposal & Quote: Custom Engineering for ${lead.company_name}`,
    body: [
      `Hi ${lead.contact_name.split(" ")[0] || lead.contact_name},`,
      `Thank you for taking the time to share your requirements with us. Based on our scoping discussion, here is the formal quote for ${lead.company_name}:`,
      `Deliverables:\n${(lead.requirements?.key_requirements || [{ item: "Full-stack integration & automated pipeline", priority: "must-have" }]).map(r => `• ${r.item}`).join("\n")}`,
      `Total Fixed Investment: $${params.quotedAmount.toLocaleString()} ${currency}\nTerms: 50% upon kickoff, 50% upon milestone completion.`,
      `Estimated timeline: ${lead.requirements?.timeline_hint || "4 weeks from project kickoff"}.`,
      `If this aligns with your expectations, reply to confirm and I'll send over the standard engagement agreement to begin.`,
      `Best regards,\nOrbit Operator`,
    ].join("\n\n"),
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && !apiKey.includes("placeholder")) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 600,
          temperature: 0.2,
          system: QUOTE_RELAY_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: buildQuoteRelayUserPrompt({
                contactName: lead.contact_name,
                companyName: lead.company_name,
                quotedAmount: params.quotedAmount,
                currency,
                keyRequirements: lead.requirements?.key_requirements,
                projectDescription: lead.requirements?.project_description,
                timelineHint: lead.requirements?.timeline_hint,
                senderName: "Orbit Operator",
              }),
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.content?.[0]?.text || "";
        const clean = raw.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
        proposalDraft = JSON.parse(clean);
      }
    } catch {
      // Fall back to generated template
    }
  }

  return { deal: dealRecord, proposalDraft };
}

export async function sendPriceQuote(params: {
  leadId: string;
  subject: string;
  body: string;
}): Promise<{ success: boolean; isDryRun: boolean; error?: string }> {
  const lead = await getLeadById(params.leadId);
  if (!lead) return { success: false, isDryRun: true, error: "Lead not found" };
  if (!lead.email) return { success: false, isDryRun: true, error: "Lead has no email" };
  if (!lead.deal) return { success: false, isDryRun: true, error: "No price quote set for this lead" };

  // 1. Send via Gmail API (dry-run mode compliant)
  const sendRes = await sendGmailMessage({
    to: lead.email,
    subject: params.subject,
    body: params.body,
  });

  if (!sendRes.success) {
    return { success: false, isDryRun: sendRes.isDryRun, error: sendRes.error };
  }

  const now = new Date().toISOString();

  // 2. Update deal status to 'sent'
  const updatedDeal: Deal = {
    ...lead.deal,
    status: "sent",
    quote_sent_at: now,
  };

  // 3. Log proposal email in messages
  const msgRecord: Message = {
    id: `msg-quote-${Date.now()}`,
    conversation_id: `conv-${lead.id}`,
    direction: "outbound",
    sender: "operator@orbit.local",
    subject: params.subject,
    body: params.body,
    ai_generated: true,
    gmail_message_id: sendRes.messageId,
    sent_at: now,
    created_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from("deals")
      .update({ status: "sent", quote_sent_at: now })
      .eq("lead_id", lead.id);

    await supabase.from("messages").insert({
      conversation_id: `conv-${lead.id}`,
      direction: "outbound",
      sender: msgRecord.sender,
      subject: msgRecord.subject,
      body: msgRecord.body,
      ai_generated: true,
      gmail_message_id: sendRes.messageId,
      sent_at: now,
    });
  } else {
    await updateLead(lead.id, {
      deal: updatedDeal,
      messages: [...(lead.messages || []), msgRecord],
    });
  }

  // 4. Atomically transition lead to 'priced'
  await updateLeadStage(lead.id, "priced", "owner");

  return { success: true, isDryRun: sendRes.isDryRun };
}

export async function closeDealRecord(params: {
  leadId: string;
  outcome: "won" | "lost";
  finalAmount?: number;
}): Promise<{ success: boolean; error?: string }> {
  const lead = await getLeadById(params.leadId);
  if (!lead) return { success: false, error: "Lead not found" };

  const now = new Date().toISOString();
  const finalAmount = params.finalAmount ?? lead.deal?.quoted_amount ?? 0;
  const status = params.outcome === "won" ? "accepted" : "declined";

  if (lead.deal) {
    const updatedDeal: Deal = {
      ...lead.deal,
      status,
      final_amount: finalAmount,
      closed_at: now,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase
        .from("deals")
        .update({
          status,
          final_amount: finalAmount,
          closed_at: now,
        })
        .eq("lead_id", lead.id);
    } else {
      await updateLead(lead.id, { deal: updatedDeal });
    }
  }

  // Atomically transition lead stage to 'won' or 'lost'
  await updateLeadStage(lead.id, params.outcome, "owner");

  return { success: true };
}
