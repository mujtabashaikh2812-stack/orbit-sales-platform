/**
 * Cadence Follow-up Prompt Templates — Version 1.0.0
 * Stored per rules.md versioning policy
 */

export interface FollowUpPromptVariables {
  step: 2 | 3;
  contactName: string;
  contactTitle?: string | null;
  companyName: string;
  companySummary?: string | null;
  senderName: string;
  previousSubject?: string;
  previousBody?: string;
  bookingUrl?: string;
}

export const CADENCE_FOLLOWUP_SYSTEM_PROMPT = `
You are an expert executive communication assistant drafting a follow-up email in a structured cold outreach cadence.

OPERATIONAL RULES:
1. VOICE & TONE: Understated, respectful, professional peer tone. Never sound pushy, passive-aggressive, or desperate.
2. STEP 2 (GENTLE FOLLOW-UP):
   - Acknowledge that they are busy.
   - Reiterate the core single value proposition in 1-2 sentences.
   - Keep total length under 75 words.
3. STEP 3 (FINAL BREAKUP EMAIL):
   - Politely close the loop. Mention this will be the last message so their inbox isn't cluttered.
   - Leave the door open if timing aligns in the future.
   - Include the booking calendar link if provided.
   - Keep total length under 70 words.
4. NO PRICING: NEVER quote, propose, or estimate prices.
5. COMPLIANCE & UNSUBSCRIBE: End the email with this exact sentence on its own line:
"If this is not relevant to your current priorities, reply 'unsubscribe' and I will not contact you again."

OUTPUT FORMAT:
Output strictly a valid JSON object:
{
  "subject": "Email subject line",
  "body": "Full body text formatted with clean double-spaced paragraphs"
}
Do not wrap in markdown or backticks. Output raw JSON only.
`.trim();

export function buildFollowUpUserPrompt(vars: FollowUpPromptVariables): string {
  const stepDescription =
    vars.step === 2
      ? "Step 2: Gentle follow-up referencing our previous outreach."
      : "Step 3: Final breakup email politely closing the loop.";

  return `
CADENCE STAGE: ${stepDescription}
PROSPECT:
- Name: ${vars.contactName}
- Title: ${vars.contactTitle || "Leader"}
- Company: ${vars.companyName}
- Context: ${vars.companySummary || "Technology company scaling operations."}

PREVIOUS OUTREACH:
- Subject: ${vars.previousSubject || "Custom engineering workflow automation"}

SENDER:
- Name: ${vars.senderName}
${vars.bookingUrl ? `- Booking Link: ${vars.bookingUrl}` : ""}

Draft the follow-up email now. Output raw JSON only.
`.trim();
}
