import {
  REPLY_CLASSIFIER_SYSTEM_PROMPT,
  buildReplyClassifierUserPrompt,
  ReplyClassificationResult,
} from "./prompts/reply-classifier-v1";
import {
  REQUIREMENT_EXTRACTOR_SYSTEM_PROMPT,
  buildRequirementExtractorUserPrompt,
  RequirementExtractionResult,
} from "./prompts/requirement-extractor-v1";
import {
  QUALIFYING_REPLY_SYSTEM_PROMPT,
  buildQualifyingReplyUserPrompt,
  QualifyingReplyPromptVariables,
} from "./prompts/qualifying-reply-v1";
import { Message } from "@/lib/types";

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

async function callClaudeJson<T>(system: string, user: string): Promise<T | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        temperature: 0.2,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.[0]?.text || "";
    const clean = raw.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
}

export async function classifyInboundReply(
  replyText: string
): Promise<ReplyClassificationResult> {
  const claudeResult = await callClaudeJson<ReplyClassificationResult>(
    REPLY_CLASSIFIER_SYSTEM_PROMPT,
    buildReplyClassifierUserPrompt(replyText)
  );

  if (claudeResult) return claudeResult;

  // Intelligent simulation / heuristic fallback
  const lower = replyText.toLowerCase();

  if (
    lower.includes("unsubscribe") ||
    lower.includes("not interested") ||
    lower.includes("remove me") ||
    lower.includes("stop emailing") ||
    lower.includes("no thanks")
  ) {
    return {
      intent: "not_interested",
      confidence: 0.98,
      reasoning: "Prospect requested removal or expressed explicit disinterest.",
    };
  }

  if (
    lower.includes("out of office") ||
    lower.includes("auto-reply") ||
    lower.includes("on vacation") ||
    lower.includes("away from my desk")
  ) {
    return {
      intent: "out_of_office",
      confidence: 0.95,
      reasoning: "Automated away message detected.",
    };
  }

  if (
    lower.includes("?") ||
    lower.includes("what is") ||
    lower.includes("how much") ||
    lower.includes("timeline") ||
    lower.includes("do you have experience")
  ) {
    return {
      intent: "question",
      confidence: 0.88,
      reasoning: "Prospect asked clarifying questions regarding scope or capabilities.",
    };
  }

  return {
    intent: "interested",
    confidence: 0.92,
    reasoning: "Positive interest in discussing requirements or booking a conversation.",
  };
}

export async function extractConversationRequirements(
  companySummary: string,
  messages: Message[]
): Promise<RequirementExtractionResult> {
  const claudeResult = await callClaudeJson<RequirementExtractionResult>(
    REQUIREMENT_EXTRACTOR_SYSTEM_PROMPT,
    buildRequirementExtractorUserPrompt(
      companySummary,
      messages.map((m) => ({
        direction: m.direction,
        sender: m.sender,
        body: m.body,
      }))
    )
  );

  if (claudeResult) return claudeResult;

  // Realistic simulation fallback based on conversation messages
  const lastInbound = messages
    .filter((m) => m.direction === "inbound")
    .pop()?.body || "";

  return {
    project_description: `Custom engineering workflow integration focusing on data synchronization and reliability for ${companySummary.slice(0, 60)}...`,
    budget_hint: lastInbound.includes("$") ? "$10k - $20k" : "Under review",
    timeline_hint: "Targeting delivery within 4-6 weeks",
    key_requirements: [
      { item: "Custom API & webhook ingestion layer", priority: "must-have" },
      { item: "Data validation & retry handling", priority: "must-have" },
      { item: "Admin status monitoring view", priority: "nice-to-have" },
    ],
    is_qualified: true,
  };
}

export async function generateQualifyingDiscoveryReply(
  vars: QualifyingReplyPromptVariables
): Promise<{ subject: string; body: string }> {
  const claudeResult = await callClaudeJson<{ subject: string; body: string }>(
    QUALIFYING_REPLY_SYSTEM_PROMPT,
    buildQualifyingReplyUserPrompt(vars)
  );

  if (claudeResult) return claudeResult;

  const firstName = vars.contactName.split(" ")[0] || vars.contactName;

  return {
    subject: `Re: Conversation regarding ${vars.companyName}`,
    body: [
      `Hi ${firstName},`,
      `Thanks for the context. We typically build custom webhook and API pipelines with idempotency and auto-retry to eliminate packet drops.`,
      `Regarding timing: delivery usually takes 3 to 4 weeks depending on endpoint specifications.`,
      `Would you have 15 minutes this Thursday or Friday for a quick discovery call to map out the exact integration endpoints?`,
      `Best,\n${vars.senderName}`,
    ].join("\n\n"),
  };
}
