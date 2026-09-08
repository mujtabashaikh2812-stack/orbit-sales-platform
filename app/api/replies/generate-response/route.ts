import { NextResponse } from "next/server";
import { generateQualifyingDiscoveryReply } from "@/lib/ai/reply-ai";
import { getLeadById } from "@/lib/db/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.leadId || !body.inboundMessage) {
      return NextResponse.json(
        { success: false, error: "leadId and inboundMessage are required" },
        { status: 400 }
      );
    }

    const lead = await getLeadById(body.leadId);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const responseDraft = await generateQualifyingDiscoveryReply({
      contactName: lead.contact_name,
      companyName: lead.company_name,
      inboundMessage: body.inboundMessage,
      projectDescription: lead.requirements?.project_description,
      senderName: "Orbit Operator",
    });

    return NextResponse.json({
      success: true,
      response: responseDraft,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate reply";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
