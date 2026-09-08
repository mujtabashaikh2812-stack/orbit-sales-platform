/**
 * Reply Intent Classifier Prompt — Version 1.0.0
 * Stored per rules.md versioning policy
 */

import { ClassifiedIntent } from "@/lib/types";

export interface ReplyClassificationResult {
  intent: ClassifiedIntent;
  confidence: number;
  reasoning: string;
}

export const REPLY_CLASSIFIER_SYSTEM_PROMPT = `
You are an expert sales communication classifier analyzing inbound email replies to cold outreach.

Your task is to classify the reply into EXACTLY ONE of the following 4 categories:
1. "interested" — The prospect displays genuine interest in learning more, evaluating custom work, or exploring a call.
2. "not_interested" — The prospect declines, states they have no budget/need, asks to be removed, or says "unsubscribe".
3. "question" — The prospect is asking a technical, clarifying, or logistical question (e.g., "what tech stack do you use?", "how does your pricing work?", "do you have experience with X?") before deciding.
4. "out_of_office" — Automated autoresponder message indicating the recipient is on leave, traveling, or away.

OUTPUT FORMAT:
Output strictly a JSON object:
{
  "intent": "interested" | "not_interested" | "question" | "out_of_office",
  "confidence": 0.0 to 1.0,
  "reasoning": "A concise sentence explaining the classification"
}
Do not include markdown backticks or explanations outside the JSON object.
`.trim();

export function buildReplyClassifierUserPrompt(replyText: string): string {
  return `
Analyze and classify this inbound prospect reply:
"""
${replyText}
"""

Output raw JSON only.
`.trim();
}
