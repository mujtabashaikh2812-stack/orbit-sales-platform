import { 
  getLeadById, 
  updateLead, 
  updateLeadStage, 
  getLeads, 
  LeadDetail 
} from "@/lib/db/leads";
import { draftOutreach, sendOutreach } from "@/lib/email/outreach-service";
import { generateCadenceFollowUpEmail } from "@/lib/ai/claude";
import { sendGmailMessage } from "@/lib/email/gmail";
import { 
  classifyInboundReply, 
  extractConversationRequirements, 
  generateQualifyingDiscoveryReply 
} from "@/lib/ai/reply-ai";
import { CadenceLog, CadenceStatus, Message, LeadStage, Meeting } from "@/lib/types";

const DEFAULT_BOOKING_URL = "https://cal.com/orbit-team/discovery";

/**
 * Enrolls a lead into the autonomous cadence engine.
 * Automatically drafts & dispatches Touch 1 (Cold Pitch) and schedules Touch 2.
 */
export async function enrollLeadInCadence(
  leadId: string,
  bookingUrl: string = DEFAULT_BOOKING_URL
): Promise<{ success: boolean; lead?: LeadDetail; error?: string }> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return { success: false, error: "Lead not found in database" };
  }

  if (!lead.email) {
    return {
      success: false,
      error: "Lead requires an email address before starting cadence.",
    };
  }

  const now = new Date().toISOString();

  // 1. Generate & send Touch 1 (Cold Pitch)
  const coldDraft = await draftOutreach(leadId);
  if (coldDraft.error && !coldDraft.subject) {
    return { success: false, error: coldDraft.error };
  }

  const sendResult = await sendOutreach(leadId, {
    subject: coldDraft.subject,
    body: coldDraft.body,
  });

  if (!sendResult.success) {
    return { success: false, error: sendResult.error || "Failed to dispatch Touch 1" };
  }

  // Next touch in 3 days
  const nextRun = new Date(Date.now() + 3 * 86400 * 1000).toISOString();

  const initialLog: CadenceLog = {
    step: 1,
    action: "Enrolled & Sent Touch 1 (Cold Outreach)",
    timestamp: now,
    details: coldDraft.subject,
  };

  const updatedLead = await updateLead(leadId, {
    cadence_status: "active",
    cadence_step: 1,
    cadence_next_run_at: nextRun,
    cadence_logs: [initialLog],
  });

  return { success: true, lead: updatedLead || undefined };
}

/**
 * Batch enrolls multiple enriched leads into the autonomous cadence.
 */
export async function enrollBatchInCadence(
  leadIds?: string[],
  bookingUrl: string = DEFAULT_BOOKING_URL
): Promise<{ enrolledCount: number; results: Array<{ leadId: string; success: boolean; error?: string }> }> {
  const allLeads = await getLeads();
  const targetLeads = leadIds && leadIds.length > 0
    ? allLeads.filter((l) => leadIds.includes(l.id))
    : allLeads.filter(
        (l) =>
          (l.stage === "enriched" || l.stage === "sourced") &&
          l.email &&
          l.cadence_status !== "active" &&
          l.cadence_status !== "completed_booked" &&
          l.cadence_status !== "completed_lost"
      );

  const results: Array<{ leadId: string; success: boolean; error?: string }> = [];

  for (const lead of targetLeads) {
    const res = await enrollLeadInCadence(lead.id, bookingUrl);
    results.push({
      leadId: lead.id,
      success: res.success,
      error: res.error,
    });
  }

  return {
    enrolledCount: results.filter((r) => r.success).length,
    results,
  };
}

/**
 * Evaluates a lead's cadence and executes the next sequential touch if due.
 * If forceTick is true, executes immediately regardless of scheduled delay.
 */
export async function processCadenceStep(
  leadId: string,
  forceTick: boolean = false,
  bookingUrl: string = DEFAULT_BOOKING_URL
): Promise<{
  success: boolean;
  step?: number;
  outcome?: "in_progress" | "completed_lost" | "completed_booked" | "not_due";
  message?: string;
  lead?: LeadDetail;
}> {
  const lead = await getLeadById(leadId);
  if (!lead) return { success: false, message: "Lead not found" };

  if (lead.cadence_status !== "active") {
    return {
      success: false,
      outcome: (lead.cadence_status as any) || "not_due",
      message: `Lead cadence is currently ${lead.cadence_status || "idle"}`,
      lead,
    };
  }

  // Check timing
  const now = new Date();
  if (
    !forceTick &&
    lead.cadence_next_run_at &&
    new Date(lead.cadence_next_run_at) > now
  ) {
    return {
      success: true,
      outcome: "not_due",
      message: `Next step scheduled for ${lead.cadence_next_run_at}`,
      lead,
    };
  }

  const currentStep = lead.cadence_step || 1;
  const currentLogs = lead.cadence_logs || [];
  const currentMessages = lead.messages || [];
  const isoNow = now.toISOString();

  // === STEP 1 -> STEP 2: Gentle Follow-Up ===
  if (currentStep === 1) {
    const previousSubject = currentMessages[0]?.subject || `Quick question regarding ${lead.company_name}`;
    const followUpDraft = await generateCadenceFollowUpEmail({
      step: 2,
      contactName: lead.contact_name,
      contactTitle: lead.contact_title,
      companyName: lead.company_name,
      companySummary: lead.company_summary,
      senderName: "Orbit Autonomous Cadence",
      previousSubject,
      bookingUrl,
    });

    const sendRes = await sendGmailMessage({
      to: lead.email!,
      subject: followUpDraft.subject,
      body: followUpDraft.body,
    });

    const followUpMsg: Message = {
      id: `msg-followup1-${Date.now()}`,
      conversation_id: `conv-${lead.id}`,
      direction: "outbound",
      sender: process.env.GMAIL_SENDER_EMAIL || "operator@orbit.local",
      subject: followUpDraft.subject,
      body: followUpDraft.body,
      ai_generated: true,
      gmail_message_id: sendRes.messageId,
      sent_at: isoNow,
      created_at: isoNow,
    };

    const nextRun = new Date(Date.now() + 4 * 86400 * 1000).toISOString();
    const updatedLead = await updateLead(lead.id, {
      cadence_step: 2,
      cadence_next_run_at: nextRun,
      messages: [...currentMessages, followUpMsg],
      cadence_logs: [
        ...currentLogs,
        {
          step: 2,
          action: "Dispatched Touch 2 (Gentle Follow-Up)",
          timestamp: isoNow,
          details: followUpDraft.subject,
        },
      ],
    });

    return {
      success: true,
      step: 2,
      outcome: "in_progress",
      message: "Touch 2 (Gentle Follow-Up) successfully sent",
      lead: updatedLead || undefined,
    };
  }

  // === STEP 2 -> STEP 3: Final Breakup Email ===
  if (currentStep === 2) {
    const breakupDraft = await generateCadenceFollowUpEmail({
      step: 3,
      contactName: lead.contact_name,
      contactTitle: lead.contact_title,
      companyName: lead.company_name,
      companySummary: lead.company_summary,
      senderName: "Orbit Autonomous Cadence",
      bookingUrl,
    });

    const sendRes = await sendGmailMessage({
      to: lead.email!,
      subject: breakupDraft.subject,
      body: breakupDraft.body,
    });

    const breakupMsg: Message = {
      id: `msg-breakup-${Date.now()}`,
      conversation_id: `conv-${lead.id}`,
      direction: "outbound",
      sender: process.env.GMAIL_SENDER_EMAIL || "operator@orbit.local",
      subject: breakupDraft.subject,
      body: breakupDraft.body,
      ai_generated: true,
      gmail_message_id: sendRes.messageId,
      sent_at: isoNow,
      created_at: isoNow,
    };

    const nextRun = new Date(Date.now() + 4 * 86400 * 1000).toISOString();
    const updatedLead = await updateLead(lead.id, {
      cadence_step: 3,
      cadence_next_run_at: nextRun,
      messages: [...currentMessages, breakupMsg],
      cadence_logs: [
        ...currentLogs,
        {
          step: 3,
          action: "Dispatched Touch 3 (Final Breakup Email)",
          timestamp: isoNow,
          details: breakupDraft.subject,
        },
      ],
    });

    return {
      success: true,
      step: 3,
      outcome: "in_progress",
      message: "Touch 3 (Final Breakup Email) successfully sent",
      lead: updatedLead || undefined,
    };
  }

  // === STEP 3 -> TERMINAL: Unresponsive / Lost ===
  // Max touches elapsed with no reply
  await updateLeadStage(lead.id, "lost", "ai");
  const updatedLead = await updateLead(lead.id, {
    cadence_status: "completed_lost",
    cadence_next_run_at: null,
    cadence_logs: [
      ...currentLogs,
      {
        step: 4,
        action: "Terminated: Max touches (3/3) elapsed with zero reply. Marked as Lost.",
        timestamp: isoNow,
        details: "No response received across cold outreach, follow-up, and breakup emails.",
      },
    ],
  });

  return {
    success: true,
    outcome: "completed_lost",
    message: "Cadence finished: Lead marked as Lost due to non-response",
    lead: updatedLead || undefined,
  };
}

/**
 * Handles an inbound reply autonomously:
 * - Classifies reply with Claude (Interested, Question, Not Interested, Out of Office).
 * - Not Interested -> Immediately halts cadence and marks lead as Lost.
 * - Interested / Question -> Auto-generates qualifying answer + booking link, moves to Qualified.
 * - Out of Office -> Postpones next cadence check by 7 days.
 */
export async function handleInboundReplyCadence(
  leadId: string,
  replyText: string,
  bookingUrl: string = DEFAULT_BOOKING_URL
): Promise<{
  success: boolean;
  outcome: "rejected" | "qualified_and_replied" | "postponed";
  classificationReason: string;
  lead?: LeadDetail;
}> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return {
      success: false,
      outcome: "rejected",
      classificationReason: "Lead not found",
    };
  }

  const isoNow = new Date().toISOString();
  const currentLogs = lead.cadence_logs || [];
  const currentMessages = lead.messages || [];

  // 1. Classify with Claude AI
  const classification = await classifyInboundReply(replyText);

  // 2. Persist Inbound Message
  const inboundMsg: Message = {
    id: `msg-inbound-${Date.now()}`,
    conversation_id: `conv-${lead.id}`,
    direction: "inbound",
    sender: lead.email || `${lead.contact_name} <client@external.com>`,
    subject: `Re: Conversation regarding ${lead.company_name}`,
    body: replyText,
    ai_generated: false,
    classified_intent: classification.intent,
    sent_at: isoNow,
    created_at: isoNow,
  };

  // === BRANCH 1: REJECTION (Not Interested / Unsubscribe) ===
  if (classification.intent === "not_interested") {
    await updateLeadStage(lead.id, "lost", "ai");
    const updatedLead = await updateLead(lead.id, {
      cadence_status: "completed_lost",
      cadence_next_run_at: null,
      messages: [...currentMessages, inboundMsg],
      cadence_logs: [
        ...currentLogs,
        {
          step: lead.cadence_step || 1,
          action: "Prospect Opted Out / Rejected — Cadence Immediately Terminated",
          timestamp: isoNow,
          details: classification.reasoning,
        },
      ],
    });

    return {
      success: true,
      outcome: "rejected",
      classificationReason: classification.reasoning,
      lead: updatedLead || undefined,
    };
  }

  // === BRANCH 2: OUT OF OFFICE ===
  if (classification.intent === "out_of_office") {
    const delayedDate = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
    const updatedLead = await updateLead(lead.id, {
      cadence_next_run_at: delayedDate,
      messages: [...currentMessages, inboundMsg],
      cadence_logs: [
        ...currentLogs,
        {
          step: lead.cadence_step || 1,
          action: "Out of Office Auto-Reply Detected — Cadence Postponed 7 Days",
          timestamp: isoNow,
          details: classification.reasoning,
        },
      ],
    });

    return {
      success: true,
      outcome: "postponed",
      classificationReason: classification.reasoning,
      lead: updatedLead || undefined,
    };
  }

  // === BRANCH 3: INTERESTED OR QUESTION ===
  // Move stage to 'replied' then 'qualified'
  await updateLeadStage(lead.id, "qualified", "ai");

  // Extract requirements
  const requirements = await extractConversationRequirements(
    lead.company_summary || lead.company_name,
    [...currentMessages, inboundMsg]
  );

  // Generate qualifying response embedding the booking URL
  const qualifyingDraft = await generateQualifyingDiscoveryReply({
    contactName: lead.contact_name,
    companyName: lead.company_name,
    projectDescription: lead.company_summary || null,
    senderName: "Orbit Engineering Lead",
    inboundMessage: replyText,
  });

  const responseWithBooking = qualifyingDraft.body.includes("calendar") || qualifyingDraft.body.includes("call")
    ? qualifyingDraft.body + `\n\nDirect scheduling link: ${bookingUrl}`
    : qualifyingDraft.body;

  // Dispatch response
  const sendRes = await sendGmailMessage({
    to: lead.email!,
    subject: qualifyingDraft.subject,
    body: responseWithBooking,
  });

  const outboundReplyMsg: Message = {
    id: `msg-qualifying-${Date.now()}`,
    conversation_id: `conv-${lead.id}`,
    direction: "outbound",
    sender: process.env.GMAIL_SENDER_EMAIL || "operator@orbit.local",
    subject: qualifyingDraft.subject,
    body: responseWithBooking,
    ai_generated: true,
    gmail_message_id: sendRes.messageId,
    sent_at: isoNow,
    created_at: isoNow,
  };

  const updatedLead = await updateLead(lead.id, {
    requirements: {
      id: `req-${lead.id}`,
      lead_id: lead.id,
      project_description: requirements.project_description,
      budget_hint: requirements.budget_hint,
      timeline_hint: requirements.timeline_hint,
      key_requirements: requirements.key_requirements,
      extracted_at: isoNow,
      updated_at: isoNow,
    },
    messages: [...currentMessages, inboundMsg, outboundReplyMsg],
    cadence_logs: [
      ...currentLogs,
      {
        step: lead.cadence_step || 1,
        action: "Prospect Inquired — AI Auto-Replied with Qualification & Booking Link",
        timestamp: isoNow,
        details: `${classification.reasoning} | Generated customized discovery reply.`,
      },
    ],
  });

  return {
    success: true,
    outcome: "qualified_and_replied",
    classificationReason: classification.reasoning,
    lead: updatedLead || undefined,
  };
}

/**
 * Confirms a discovery meeting has been booked:
 * Moves lead stage to 'meeting_booked' and marks cadence as 'completed_booked' (TERMINAL SUCCESS).
 */
export async function confirmMeetingBookedCadence(
  leadId: string,
  meetingTitle: string = "Discovery Technical Architecture Session"
): Promise<{ success: boolean; lead?: LeadDetail }> {
  const lead = await getLeadById(leadId);
  if (!lead) return { success: false };

  const isoNow = new Date().toISOString();
  const currentLogs = lead.cadence_logs || [];
  const currentMeetings = lead.meetings || [];

  await updateLeadStage(leadId, "meeting_booked", "owner");

  const newMeeting: Meeting = {
    id: `meeting-${Date.now()}`,
    lead_id: leadId,
    scheduled_at: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    duration_minutes: 20,
    status: "confirmed",
    notes: meetingTitle,
    created_at: isoNow,
  };

  const updatedLead = await updateLead(leadId, {
    cadence_status: "completed_booked",
    cadence_next_run_at: null,
    meetings: [...currentMeetings, newMeeting],
    cadence_logs: [
      ...currentLogs,
      {
        step: lead.cadence_step || 1,
        action: "Discovery Meeting Booked 🎉 — Cadence Successfully Completed!",
        timestamp: isoNow,
        details: `Scheduled: ${meetingTitle}`,
      },
    ],
  });

  return { success: true, lead: updatedLead || undefined };
}

/**
 * Runs a cadence processing cycle across all active leads.
 */
export async function runBatchCadenceCycle(
  forceAll: boolean = false
): Promise<{
  totalActive: number;
  processed: number;
  results: Array<{ leadId: string; outcome?: string; message?: string }>;
}> {
  const allLeads = await getLeads();
  const activeLeads = allLeads.filter((l) => l.cadence_status === "active");

  const results: Array<{ leadId: string; outcome?: string; message?: string }> = [];

  for (const lead of activeLeads) {
    const res = await processCadenceStep(lead.id, forceAll);
    results.push({
      leadId: lead.id,
      outcome: res.outcome,
      message: res.message,
    });
  }

  return {
    totalActive: activeLeads.length,
    processed: results.length,
    results,
  };
}
