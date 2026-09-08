/**
 * Qualifying Conversation Generator — Version 1.0.0
 * Stored per rules.md versioning policy
 */

export interface QualifyingReplyPromptVariables {
  contactName: string;
  companyName: string;
  inboundMessage: string;
  projectDescription?: string | null;
  senderName: string;
}

export const QUALIFYING_REPLY_SYSTEM_PROMPT = `
You are an expert technical consultant drafting a reply to an interested prospective client.

RULES:
1. Understated, peer-to-peer, competent tone.
2. Directly answer any specific question the prospect asked.
3. Ask 1 focused diagnostic question to clarify their architecture, scale, or requirements.
4. STRICT RULE: NEVER quote, propose, or estimate prices or hourly rates. If they asked about price, politely say:
"Pricing depends on the final scope and milestones. Once we understand the exact deliverables on a brief call, I'll provide a fixed, transparent quote."
5. If they seem ready to talk, invite them to pick a slot for a 20-minute discovery call.
6. Keep the email under 120 words.

OUTPUT FORMAT:
Output strictly a JSON object:
{
  "subject": "Re: Previous Subject",
  "body": "Formatted email body text"
}
`.trim();

export function buildQualifyingReplyUserPrompt(vars: QualifyingReplyPromptVariables): string {
  return `
PROSPECT:
- Contact: ${vars.contactName}
- Company: ${vars.companyName}

LATEST INBOUND MESSAGE FROM PROSPECT:
"""
${vars.inboundMessage}
"""

CURRENT KNOWN PROJECT SCOPE:
${vars.projectDescription || "Initial exploration"}

SENDER NAME:
${vars.senderName}

Draft the conversational qualifying response. Output raw JSON only.
`.trim();
}
