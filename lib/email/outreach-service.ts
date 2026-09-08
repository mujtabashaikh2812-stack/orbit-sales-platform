import { getLeadById, updateLeadStage, updateLead, LeadDetail } from "@/lib/db/leads";
import { generateColdOutreachEmail, GeneratedEmailDraft } from "@/lib/ai/claude";
import { sendGmailMessage, SendEmailResult } from "./gmail";
import { Message, Conversation } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/db/supabase-client";

export async function draftOutreach(
  leadId: string
): Promise<GeneratedEmailDraft> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return {
      subject: "",
      body: "",
      model: "",
      simulated: false,
      error: "Lead not found in ledger",
    };
  }

  return generateColdOutreachEmail({
    contactName: lead.contact_name,
    contactTitle: lead.contact_title,
    companyName: lead.company_name,
    companyDomain: lead.company_domain,
    companySummary: lead.company_summary,
    senderName: "Orbit Operator",
    senderServiceSummary:
      "Custom software engineering and automated pipeline integrations for growing technical businesses.",
  });
}

export async function sendOutreach(
  leadId: string,
  emailContent: { subject: string; body: string }
): Promise<{
  success: boolean;
  isDryRun: boolean;
  message?: Message;
  error?: string;
}> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return { success: false, isDryRun: true, error: "Lead not found" };
  }

  if (!lead.email) {
    return {
      success: false,
      isDryRun: true,
      error: "Cannot send outreach: lead has no email address. Run enrichment first.",
    };
  }

  // 1. Send or simulate via Gmail API
  const sendRes = await sendGmailMessage({
    to: lead.email,
    subject: emailContent.subject,
    body: emailContent.body,
  });

  if (!sendRes.success) {
    return {
      success: false,
      isDryRun: sendRes.isDryRun,
      error: sendRes.error || "Failed to send email via Gmail API",
    };
  }

  const now = new Date().toISOString();
  const convId = `conv-${leadId}`;

  const messageRecord: Message = {
    id: `msg-${Date.now()}`,
    conversation_id: convId,
    direction: "outbound",
    sender: process.env.GMAIL_SENDER_EMAIL || "operator@orbit.local",
    subject: emailContent.subject,
    body: emailContent.body,
    ai_generated: true,
    gmail_message_id: sendRes.messageId,
    sent_at: now,
    created_at: now,
  };

  // 2. Persist to Supabase or in-memory preview
  if (isSupabaseConfigured()) {
    const supabase = createClient();

    // Upsert conversation
    const { data: convData } = await supabase
      .from("conversations")
      .upsert({
        lead_id: leadId,
        gmail_thread_id: sendRes.threadId,
        status: "active",
        last_message_at: now,
      })
      .select()
      .single();

    if (convData) {
      await supabase.from("messages").insert({
        conversation_id: convData.id,
        direction: "outbound",
        sender: messageRecord.sender,
        subject: messageRecord.subject,
        body: messageRecord.body,
        ai_generated: true,
        gmail_message_id: sendRes.messageId,
        sent_at: now,
      });
    }
  } else {
    // Update local preview state
    const currentMessages = lead.messages || [];
    await updateLead(leadId, {
      ...lead,
      messages: [...currentMessages, messageRecord],
    });
  }

  // 3. Atomically transition lead to 'contacted' stage
  await updateLeadStage(leadId, "contacted", "ai");

  return {
    success: true,
    isDryRun: sendRes.isDryRun,
    message: messageRecord,
  };
}
