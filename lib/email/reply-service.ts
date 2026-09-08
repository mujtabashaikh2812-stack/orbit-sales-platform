import { getLeadById, updateLead, updateLeadStage, LeadDetail } from "@/lib/db/leads";
import { 
  classifyInboundReply, 
  extractConversationRequirements, 
  generateQualifyingDiscoveryReply 
} from "@/lib/ai/reply-ai";
import { Message, Requirement } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/db/supabase-client";

export interface ProcessReplyParams {
  leadId: string;
  senderEmail: string;
  subject: string;
  replyBody: string;
}

export interface ProcessReplyResult {
  success: boolean;
  intent: string;
  confidence: number;
  reasoning: string;
  lead: LeadDetail | null;
  requirements?: Requirement | null;
  recommendedReply?: { subject: string; body: string } | null;
  error?: string;
}

export async function processInboundReply(
  params: ProcessReplyParams
): Promise<ProcessReplyResult> {
  const lead = await getLeadById(params.leadId);
  if (!lead) {
    return {
      success: false,
      intent: "",
      confidence: 0,
      reasoning: "",
      lead: null,
      error: "Lead not found in ledger",
    };
  }

  // 1. Classify reply intent (MANDATORY per rules.md before marking processed)
  const classification = await classifyInboundReply(params.replyBody);
  const now = new Date().toISOString();
  const convId = `conv-${lead.id}`;

  const inboundMessage: Message = {
    id: `msg-in-${Date.now()}`,
    conversation_id: convId,
    direction: "inbound",
    sender: params.senderEmail || lead.email || "prospect@example.com",
    subject: params.subject,
    body: params.replyBody,
    ai_generated: false,
    classified_intent: classification.intent,
    sent_at: now,
    created_at: now,
  };

  const updatedMessages = [...(lead.messages || []), inboundMessage];

  // 2. Persist message to database
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from("messages").insert({
      conversation_id: convId,
      direction: "inbound",
      sender: inboundMessage.sender,
      subject: inboundMessage.subject,
      body: inboundMessage.body,
      ai_generated: false,
      classified_intent: classification.intent,
      sent_at: now,
    });
  } else {
    await updateLead(lead.id, { messages: updatedMessages });
  }

  // 3. Process according to classified intent
  if (classification.intent === "not_interested") {
    // Unsubscribe / Opt-out rule: transition to 'lost'
    await updateLeadStage(lead.id, "lost", "system");
    const freshLead = await getLeadById(lead.id);

    return {
      success: true,
      intent: classification.intent,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      lead: freshLead,
      requirements: freshLead?.requirements,
    };
  }

  if (classification.intent === "out_of_office") {
    const freshLead = await getLeadById(lead.id);
    return {
      success: true,
      intent: classification.intent,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      lead: freshLead,
      requirements: freshLead?.requirements,
    };
  }

  // 4. Inbound intent is 'interested' or 'question'
  // Advance to 'replied' if currently in 'contacted'
  if (lead.stage === "contacted" || lead.stage === "sourced" || lead.stage === "enriched") {
    await updateLeadStage(lead.id, "replied", "system");
  }

  // 5. Extract structured requirements from conversation
  const extraction = await extractConversationRequirements(
    lead.company_summary || lead.company_name,
    updatedMessages
  );

  const updatedRequirement: Requirement = {
    id: lead.requirements?.id || `req-${Date.now()}`,
    lead_id: lead.id,
    project_description: extraction.project_description,
    budget_hint: extraction.budget_hint,
    timeline_hint: extraction.timeline_hint,
    key_requirements: extraction.key_requirements,
    extracted_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from("requirements").upsert({
      lead_id: lead.id,
      project_description: updatedRequirement.project_description,
      budget_hint: updatedRequirement.budget_hint,
      timeline_hint: updatedRequirement.timeline_hint,
      key_requirements: updatedRequirement.key_requirements,
      extracted_at: now,
      updated_at: now,
    });
  } else {
    await updateLead(lead.id, {
      requirements: updatedRequirement,
    });
  }

  // 6. If prospect is qualified, advance stage to 'qualified'
  if (extraction.is_qualified) {
    await updateLeadStage(lead.id, "qualified", "ai");
  }

  // 7. Generate recommended qualifying response draft
  const recommendedReply = await generateQualifyingDiscoveryReply({
    contactName: lead.contact_name,
    companyName: lead.company_name,
    inboundMessage: params.replyBody,
    projectDescription: extraction.project_description,
    senderName: "Orbit Operator",
  });

  const freshLead = await getLeadById(lead.id);

  return {
    success: true,
    intent: classification.intent,
    confidence: classification.confidence,
    reasoning: classification.reasoning,
    lead: freshLead,
    requirements: updatedRequirement,
    recommendedReply,
  };
}
