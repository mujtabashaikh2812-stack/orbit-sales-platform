import { NextResponse } from "next/server";
import { sourceLeadsFromPrompt } from "@/lib/leads/sourcing-service";
import { getLeads } from "@/lib/db/leads";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const limit = typeof body.limit === "number" ? body.limit : 5;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Please provide a search prompt (e.g., 'Find dental clinics in Austin, TX for website redesign')." },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const result = await sourceLeadsFromPrompt(prompt, limit);

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
        count: result.count,
        leads: result.created,
        allLeads,
        parsed: result.parsed,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute prompt sourcing";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
