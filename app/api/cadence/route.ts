import { NextRequest, NextResponse } from "next/server";
import {
  enrollLeadInCadence,
  enrollBatchInCadence,
  processCadenceStep,
  handleInboundReplyCadence,
  confirmMeetingBookedCadence,
  runBatchCadenceCycle,
} from "@/lib/cadence/cadence-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, leadId, leadIds, replyText, forceTick, forceAll, bookingUrl, meetingTitle } = body;

    switch (action) {
      case "enroll": {
        if (leadId) {
          const res = await enrollLeadInCadence(leadId, bookingUrl);
          return NextResponse.json(res);
        } else {
          const res = await enrollBatchInCadence(leadIds, bookingUrl);
          return NextResponse.json(res);
        }
      }

      case "tick":
      case "process_step": {
        if (!leadId) {
          return NextResponse.json(
            { error: "leadId is required for tick action" },
            { status: 400 }
          );
        }
        const res = await processCadenceStep(leadId, Boolean(forceTick), bookingUrl);
        return NextResponse.json(res);
      }

      case "simulate_reply": {
        if (!leadId || !replyText) {
          return NextResponse.json(
            { error: "leadId and replyText are required for simulate_reply" },
            { status: 400 }
          );
        }
        const res = await handleInboundReplyCadence(leadId, replyText, bookingUrl);
        return NextResponse.json(res);
      }

      case "confirm_booking": {
        if (!leadId) {
          return NextResponse.json(
            { error: "leadId is required for confirm_booking" },
            { status: 400 }
          );
        }
        const res = await confirmMeetingBookedCadence(leadId, meetingTitle);
        return NextResponse.json(res);
      }

      case "run_cycle": {
        const res = await runBatchCadenceCycle(Boolean(forceAll));
        return NextResponse.json(res);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal cadence error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
