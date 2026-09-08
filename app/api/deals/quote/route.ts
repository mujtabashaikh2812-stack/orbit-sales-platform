import { NextResponse } from "next/server";
import { setPriceAndDraftQuote, sendPriceQuote } from "@/lib/deals/deal-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "send") {
      if (!body.leadId || !body.subject || !body.body) {
        return NextResponse.json(
          { success: false, error: "leadId, subject, and body are required to send quote" },
          { status: 400 }
        );
      }

      const sendResult = await sendPriceQuote({
        leadId: body.leadId,
        subject: body.subject,
        body: body.body,
      });

      return NextResponse.json(sendResult);
    }

    // Default action: set price & generate quote draft
    if (!body.leadId || typeof body.quotedAmount !== "number") {
      return NextResponse.json(
        { success: false, error: "leadId and numeric quotedAmount are required" },
        { status: 400 }
      );
    }

    const draftResult = await setPriceAndDraftQuote({
      leadId: body.leadId,
      quotedAmount: body.quotedAmount,
      currency: body.currency || "USD",
    });

    return NextResponse.json({
      success: true,
      deal: draftResult.deal,
      proposalDraft: draftResult.proposalDraft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to handle deal quote";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
