import { NextResponse } from "next/server";
import { processInboundReply } from "@/lib/email/reply-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId || !body.replyBody) {
      return NextResponse.json(
        { success: false, error: "leadId and replyBody are required" },
        { status: 400 }
      );
    }

    const result = await processInboundReply({
      leadId: body.leadId,
      senderEmail: body.senderEmail,
      subject: body.subject || "Re: Quick question",
      replyBody: body.replyBody,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process reply";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
