import { NextResponse } from "next/server";
import { closeDealRecord } from "@/lib/deals/deal-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId || !body.outcome || !["won", "lost"].includes(body.outcome)) {
      return NextResponse.json(
        { success: false, error: "leadId and outcome ('won' or 'lost') are required" },
        { status: 400 }
      );
    }

    const result = await closeDealRecord({
      leadId: body.leadId,
      outcome: body.outcome,
      finalAmount: typeof body.finalAmount === "number" ? body.finalAmount : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, outcome: body.outcome });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to close deal";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
