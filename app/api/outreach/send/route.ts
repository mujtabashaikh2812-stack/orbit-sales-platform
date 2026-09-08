import { NextResponse } from "next/server";
import { sendOutreach } from "@/lib/email/outreach-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId || !body.subject || !body.body) {
      return NextResponse.json(
        { success: false, error: "leadId, subject, and body are required" },
        { status: 400 }
      );
    }

    const result = await sendOutreach(body.leadId, {
      subject: body.subject,
      body: body.body,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isDryRun: result.isDryRun,
      message: result.message,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send outreach email";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
