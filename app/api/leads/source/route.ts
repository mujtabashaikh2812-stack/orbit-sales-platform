import { NextResponse } from "next/server";
import { sourceLeadsFromICP } from "@/lib/leads/sourcing-service";
import { getLeads } from "@/lib/db/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = typeof body.limit === "number" ? body.limit : 5;

    const result = await sourceLeadsFromICP({
      source: body.source,
      query: body.query,
      location: body.location,
      limit,
      industry: body.industry,
      targetRoles: body.targetRoles,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const allLeads = await getLeads();

    return NextResponse.json(
      {
        success: true,
        source: body.source || "apollo",
        count: result.count,
        leads: result.created,
        allLeads,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to source leads";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
