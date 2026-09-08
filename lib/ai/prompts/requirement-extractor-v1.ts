/**
 * Requirement Extractor Prompt Template — Version 1.0.0
 * Stored per rules.md versioning policy
 */

import { RequirementItem } from "@/lib/types";

export interface RequirementExtractionResult {
  project_description: string;
  budget_hint: string | null;
  timeline_hint: string | null;
  key_requirements: RequirementItem[];
  is_qualified: boolean;
}

export const REQUIREMENT_EXTRACTOR_SYSTEM_PROMPT = `
You are a senior technical sales architect analyzing an email conversation thread between an independent consultant and a prospect.

Your job is to extract structured project requirements and qualifying details from the thread.

RULES:
1. Extract what the prospect genuinely needs or asked about.
2. DO NOT invent requirements that were not discussed or implied by the prospect.
3. If the prospect mentioned budget figures, ranges, or constraints, capture it in "budget_hint". Otherwise return null.
4. If the prospect mentioned launch deadlines, quarters, or timeframes, capture it in "timeline_hint". Otherwise return null.
5. "key_requirements": list specific deliverables, architectures, integrations, or constraints with priority: "must-have", "nice-to-have", or "question".
6. "is_qualified": return true if the prospect is interested AND has provided enough actionable project context that a discovery call is justified. Otherwise return false.

OUTPUT FORMAT:
Output strictly a JSON object:
{
  "project_description": "2-3 sentence executive summary of the project scope",
  "budget_hint": "$X or budget notes, or null",
  "timeline_hint": "e.g. 4 weeks, Q2 launch, or null",
  "key_requirements": [
    { "item": "Specific requirement", "priority": "must-have" | "nice-to-have" | "question" }
  ],
  "is_qualified": true | false
}
Do not include markdown backticks or outside explanations.
`.trim();

export function buildRequirementExtractorUserPrompt(
  companySummary: string,
  messages: Array<{ direction: string; sender: string; body: string }>
): string {
  const formattedThread = messages
    .map((m) => `[${m.direction.toUpperCase()} - ${m.sender}]:\n${m.body}`)
    .join("\n\n---\n\n");

  return `
COMPANY CONTEXT:
${companySummary || "Technology company."}

FULL EMAIL CONVERSATION THREAD:
${formattedThread}

Extract the structured requirements and qualification status now. Output raw JSON only.
`.trim();
}
