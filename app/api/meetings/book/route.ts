import { NextResponse } from "next/server";
import { bookLeadMeeting } from "@/lib/calendar/meeting-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId || !body.scheduledAt) {
      return NextResponse.json(
        { success: false, error: "leadId and scheduledAt are required" },
        { status: 400 }
      );
    }

    const result = await bookLeadMeeting({
      leadId: body.leadId,
      scheduledAt: body.scheduledAt,
      durationMinutes: body.durationMinutes,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      meeting: result.meeting,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to book meeting";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
