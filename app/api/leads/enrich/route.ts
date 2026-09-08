import { NextResponse } from "next/server";
import { enrichLeadRecord, enrichAllSourcedLeads } from "@/lib/leads/sourcing-service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.all) {
      const summary = await enrichAllSourcedLeads();
      return NextResponse.json({
        success: true,
        summary,
      });
    }

    if (body.leadId) {
      const result = await enrichLeadRecord(body.leadId);
      if (result.error && !result.lead?.email) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        lead: result.lead,
      });
    }

    return NextResponse.json(
      { success: false, error: "Provide either leadId or all: true" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to enrich leads";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
