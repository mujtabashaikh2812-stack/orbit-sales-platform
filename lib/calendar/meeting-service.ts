import { getLeadById, updateLead, updateLeadStage, LeadDetail } from "@/lib/db/leads";
import { createGoogleCalendarEvent, CalendarEventResult } from "./google-calendar";
import { Meeting } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/db/supabase-client";

export interface BookMeetingParams {
  leadId: string;
  scheduledAt: string; // ISO string
  durationMinutes?: number;
  notes?: string;
}

export async function bookLeadMeeting(
  params: BookMeetingParams
): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
  const lead = await getLeadById(params.leadId);
  if (!lead) {
    return { success: false, error: "Lead not found" };
  }

  const duration = params.durationMinutes || 30;

  // 1. Create Google Calendar event
  const calResult = await createGoogleCalendarEvent({
    summary: `Discovery Call: Orbit <> ${lead.company_name}`,
    description: `Technical scoping & requirements discussion with ${lead.contact_name}.\n\nLead Notes:\n${lead.company_summary || "None"}\n\nMeeting Notes:\n${params.notes || "None"}`,
    attendeeEmail: lead.email || "prospect@example.com",
    startTime: params.scheduledAt,
    durationMinutes: duration,
  });

  if (!calResult.success && !calResult.isSimulated) {
    return { success: false, error: calResult.error || "Failed to book Google Calendar event" };
  }

  const now = new Date().toISOString();
  const meetingRecord: Meeting = {
    id: `meet-${Date.now()}`,
    lead_id: lead.id,
    google_event_id: calResult.eventId,
    scheduled_at: params.scheduledAt,
    duration_minutes: duration,
    status: "confirmed",
    notes: params.notes || `Discovery appointment. Video link: ${calResult.meetLink || "Google Meet"}`,
    created_at: now,
  };

  // 2. Persist meeting to database
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.from("meetings").insert({
      lead_id: lead.id,
      google_event_id: meetingRecord.google_event_id,
      scheduled_at: meetingRecord.scheduled_at,
      duration_minutes: meetingRecord.duration_minutes,
      status: meetingRecord.status,
      notes: meetingRecord.notes,
    });
  } else {
    const currentMeetings = lead.meetings || [];
    await updateLead(lead.id, {
      meetings: [...currentMeetings, meetingRecord],
    });
  }

  // 3. Atomically transition lead to 'meeting_booked'
  await updateLeadStage(lead.id, "meeting_booked", "system");

  return { success: true, meeting: meetingRecord };
}
