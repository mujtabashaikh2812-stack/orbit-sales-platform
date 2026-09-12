import { NextResponse } from "next/server";
import { getLeads, createLead, updateLead, updateLeadStage } from "@/lib/db/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json(
      { success: true, leads },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch leads";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.sync && Array.isArray(body.sync)) {
      const existing = await getLeads();
      const map = new Map(existing.map((l) => [l.id, l]));
      for (const item of body.sync) {
        if (item.id) map.set(item.id, item);
      }
      const merged = Array.from(map.values());
      const { syncLeadsToStore } = await import("@/lib/db/leads");
      syncLeadsToStore(merged);
      return NextResponse.json(
        { success: true, leads: merged },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    if (body.lead) {
      const created = await createLead(body.lead);
      return NextResponse.json(
        { success: true, lead: created },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create lead";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing lead ID" }, { status: 400 });
    }
    if (body.stage) {
      const updated = await updateLeadStage(body.id, body.stage, body.triggeredBy || "owner");
      return NextResponse.json(
        { success: true, lead: updated },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    if (body.partial) {
      const updated = await updateLead(body.id, body.partial);
      return NextResponse.json(
        { success: true, lead: updated },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }
    return NextResponse.json({ success: false, error: "No changes provided" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update lead";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
