import { NextResponse } from "next/server";
import { enrichLeadRecord, enrichAllSourcedLeads } from "@/lib/leads/sourcing-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.all) {
      const result = await enrichAllSourcedLeads();
      return NextResponse.json(
        {
          success: true,
          summary: {
            total: result.total,
            enriched: result.enriched,
            errors: result.errors,
          },
          leads: result.leads,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    if (body.leadId) {
      const result = await enrichLeadRecord(body.leadId);
      if (result.error && !result.lead?.email) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
        );
      }

      return NextResponse.json(
        {
          success: true,
          lead: result.lead,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      { success: false, error: "Provide either leadId or all: true" },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to enrich leads";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
