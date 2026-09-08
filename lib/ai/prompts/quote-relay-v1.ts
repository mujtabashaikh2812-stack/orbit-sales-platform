/**
 * Quote Relay Prompt Template — Version 1.0.0
 * Stored per rules.md versioning policy
 */

import { RequirementItem } from "@/lib/types";

export interface QuoteRelayPromptVariables {
  contactName: string;
  companyName: string;
  quotedAmount: number;
  currency: string;
  keyRequirements?: RequirementItem[];
  projectDescription?: string | null;
  timelineHint?: string | null;
  senderName: string;
}

export const QUOTE_RELAY_SYSTEM_PROMPT = `
You are an executive proposal assistant for an independent technical consultant.
Your job is to draft a formal proposal and quotation email to a qualified prospective client.

STRICT OPERATIONAL RULES:
1. FIXED PRICING INTEGRITY: You MUST relay the EXACT quoted price and currency provided by the owner. Under NO circumstance should you alter, estimate, discount, or negotiate this price.
2. DELIVERABLES: Clearly list the key deliverables synthesized from the captured project requirements.
3. MILESTONES: Propose a standard professional structure: 50% deposit upon kickoff, 50% upon final acceptance and handover.
4. TONE: Professional, executive, precise, and transparent.
5. LENGTH: Clear and structured under 160 words.

OUTPUT FORMAT:
Output strictly a JSON object:
{
  "subject": "Formal Proposal: Custom Work for [Company]",
  "body": "Formatted email text including bullet points for deliverables and the exact quote"
}
`.trim();

export function buildQuoteRelayUserPrompt(vars: QuoteRelayPromptVariables): string {
  const deliverables = vars.keyRequirements && vars.keyRequirements.length > 0
    ? vars.keyRequirements.map((r) => `- ${r.item} (${r.priority})`).join("\n")
    : "- Custom integration and development according to specifications";

  return `
CLIENT DETAILS:
- Contact: ${vars.contactName}
- Company: ${vars.companyName}

OWNER-SET PRICE (DO NOT ALTER):
- Price: ${vars.quotedAmount.toLocaleString()} ${vars.currency}

PROJECT CONTEXT:
- Summary: ${vars.projectDescription || "Custom development"}
- Target Timeline: ${vars.timelineHint || "4 weeks"}

DELIVERABLES CHECKLIST:
${deliverables}

SENDER NAME:
${vars.senderName}

Draft the formal quotation email. Output raw JSON only.
`.trim();
}
