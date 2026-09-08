import { 
  COLD_OUTREACH_SYSTEM_PROMPT, 
  buildColdOutreachUserPrompt, 
  ColdOutreachPromptVariables 
} from "./prompts/cold-outreach-v1";

export interface GeneratedEmailDraft {
  subject: string;
  body: string;
  model: string;
  simulated: boolean;
  error?: string;
}

export async function generateColdOutreachEmail(
  variables: ColdOutreachPromptVariables
): Promise<GeneratedEmailDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = "claude-3-5-sonnet-20241022";

  // Live Claude API call if key is configured
  if (apiKey && !apiKey.includes("placeholder")) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          temperature: 0.3,
          system: COLD_OUTREACH_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: buildColdOutreachUserPrompt(variables),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          subject: "",
          body: "",
          model,
          simulated: false,
          error: `Claude API error (${response.status}): ${errorText || response.statusText}`,
        };
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || "";

      // Clean markdown code fence if model returned ```json ... ```
      const cleanedJson = rawText
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);
      return {
        subject: parsed.subject,
        body: parsed.body,
        model,
        simulated: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error contacting Anthropic Claude API";
      return {
        subject: "",
        body: "",
        model,
        simulated: false,
        error: msg,
      };
    }
  }

  // Simulation mode: Generates tailored, high-converting copy without API costs
  const firstName = variables.contactName.split(" ")[0] || variables.contactName;
  const company = variables.companyName;

  const simulatedSubject = `Quick question regarding ${company}`;
  const simulatedBody = [
    `Hi ${firstName},`,
    `Noticed ${company} is scaling its technical roadmap and operations${variables.companySummary ? ` (${variables.companySummary.slice(0, 70)}...)` : ""}.`,
    `I work with founders and engineering leaders as a solo technical consultant building custom web apps and automated integrations, helping small teams ship without the overhead of an agency.`,
    `Are you open to a brief 15-minute conversation later this week to see if there's alignment?`,
    `Best regards,\n${variables.senderName}`,
    `If this is not relevant to your current priorities, reply 'unsubscribe' and I will not contact you again.`
  ].join("\n\n");

  return {
    subject: simulatedSubject,
    body: simulatedBody,
    model: `${model} (demo simulation)`,
    simulated: true,
  };
}
