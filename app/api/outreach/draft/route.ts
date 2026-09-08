import { NextResponse } from "next/server";
import { draftOutreach } from "@/lib/email/outreach-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" },
        { status: 400 }
      );
    }

    const draft = await draftOutreach(body.leadId);
    if (draft.error) {
      return NextResponse.json(
        { success: false, error: draft.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to draft outreach email";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
