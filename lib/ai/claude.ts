import { 
  COLD_OUTREACH_SYSTEM_PROMPT, 
  buildColdOutreachUserPrompt, 
  ColdOutreachPromptVariables 
} from "./prompts/cold-outreach-v1";
import {
  CADENCE_FOLLOWUP_SYSTEM_PROMPT,
  buildFollowUpUserPrompt,
  FollowUpPromptVariables
} from "./prompts/followup-v1";

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

export interface ParsedProspectingIntent {
  query: string;
  location?: string;
  channel: "apollo" | "hunter" | "google_maps" | "contra" | "yellow_pages" | "manual" | "csv_import";
  industryOrNiche: string;
  painPoint: string;
  servicePitch: string;
  model: string;
  simulated: boolean;
  error?: string;
}

export async function parseProspectingPrompt(
  prompt: string
): Promise<ParsedProspectingIntent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = "claude-3-5-sonnet-20241022";
  const cleanPrompt = prompt.trim();

  // 1. Live Claude 3.5 Sonnet parsing if key configured
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
          max_tokens: 400,
          temperature: 0.2,
          system: `You are Orbit's autonomous prospecting intelligence parser.
Translate natural language prospecting instructions into structured parameters.
Return ONLY a valid JSON object with:
- "query": Business category or service keyword (e.g. "Dental Clinic", "Next.js Web App", "Commercial Freight", "Architectural Studio")
- "location": City, state, or region if mentioned (e.g. "Austin, TX", "London, UK", "Chicago, IL"), or null if remote/unspecified
- "channel": One of:
    "google_maps" (for local physical businesses, clinics, doctors, legal practices, restaurants, salons, local contractors)
    "contra" (for tech startups, product briefs, Next.js, mobile apps, AI integrations, freelance briefs)
    "yellow_pages" (for mid-market industrial, logistics, manufacturing, commercial equipment, warehousing)
    "apollo" (for enterprise SaaS, tech executives, founders, CTOs)
- "industryOrNiche": Brief label of the niche (e.g. "Healthcare & Dental", "Creative Architecture", "Freight Logistics")
- "painPoint": Core problem or opportunity angle (e.g. "Outdated website and missing mobile appointment booking")
- "servicePitch": Value proposition angle for cold outreach`,
          messages: [
            {
              role: "user",
              content: `Parse this prospecting prompt: "${cleanPrompt}"`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.content?.[0]?.text || "";
        const cleanedJson = rawText
          .replace(/^```json\s*/, "")
          .replace(/```\s*$/, "")
          .trim();
        const parsed = JSON.parse(cleanedJson);

        return {
          query: parsed.query || cleanPrompt,
          location: parsed.location || undefined,
          channel: parsed.channel || "google_maps",
          industryOrNiche: parsed.industryOrNiche || "Commercial Services",
          painPoint: parsed.painPoint || "Website modernization and automated intake",
          servicePitch: parsed.servicePitch || "Bespoke high-throughput web development and integrations",
          model,
          simulated: false,
        };
      }
    } catch {
      // Fallback to pattern parser on network or API failure
    }
  }

  // 2. High-Accuracy Heuristic & Pattern Parser (Simulation & Offline Fallback)
  const lower = cleanPrompt.toLowerCase();

  // Detect location
  let location: string | undefined;
  const locationMatch = cleanPrompt.match(/(?:in|at|near|around)\s+([A-Za-z\s]+(?:,\s*[A-Za-z]{2,})?)/i);
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim().replace(/\s+(?:that|who|looking|needing|with).*$/i, "");
  } else if (lower.includes("austin")) {
    location = "Austin, TX";
  } else if (lower.includes("chicago")) {
    location = "Chicago, IL";
  } else if (lower.includes("london")) {
    location = "London, UK";
  } else if (lower.includes("new york") || lower.includes("nyc")) {
    location = "New York, NY";
  } else if (lower.includes("miami")) {
    location = "Miami, FL";
  } else if (lower.includes("dallas")) {
    location = "Dallas, TX";
  } else if (lower.includes("seattle")) {
    location = "Seattle, WA";
  }

  // Detect channel & niche
  let channel: "apollo" | "google_maps" | "contra" | "yellow_pages" = "google_maps";
  let industryOrNiche = "Commercial Services";
  let query = "Services";
  let painPoint = "Website modernization and automated customer intake flow";
  let servicePitch = "Custom high-conversion web development and API integration";

  if (
    lower.includes("contra") ||
    lower.includes("startup") ||
    lower.includes("brief") ||
    lower.includes("next.js") ||
    lower.includes("react") ||
    lower.includes("ai") ||
    lower.includes("mobile app")
  ) {
    channel = "contra";
    industryOrNiche = "Tech Startups & Venture Products";
    query = lower.includes("next.js") ? "Next.js Web App" : lower.includes("ai") ? "AI Automation" : "Startup Development";
    painPoint = "Engineering capacity bottleneck and rapid feature shipping";
    servicePitch = "Solo senior engineering consultant delivering high-velocity Next.js & AI workflows without agency overhead";
  } else if (
    lower.includes("yellow") ||
    lower.includes("logistics") ||
    lower.includes("freight") ||
    lower.includes("industrial") ||
    lower.includes("fabricat") ||
    lower.includes("machin") ||
    lower.includes("equipment") ||
    lower.includes("warehous")
  ) {
    channel = "yellow_pages";
    industryOrNiche = "Industrial & Commercial Operations";
    query = lower.includes("freight") || lower.includes("logistics") ? "Commercial Logistics" : "Industrial Fabrication";
    painPoint = "Manual operational dispatch and legacy inventory web tools";
    servicePitch = "Custom cloud telemetry and automated partner API integrations";
  } else if (
    lower.includes("dental") ||
    lower.includes("dentist") ||
    lower.includes("clinic") ||
    lower.includes("doctor") ||
    lower.includes("health") ||
    lower.includes("medical")
  ) {
    channel = "google_maps";
    industryOrNiche = "Healthcare & Specialized Clinics";
    query = "Dental Clinic";
    painPoint = "Outdated patient intake, lack of online booking, and weak mobile speed";
    servicePitch = "Modern HIPAA-compliant web portal with automated patient scheduling reminders";
  } else if (
    lower.includes("law") ||
    lower.includes("attorney") ||
    lower.includes("legal")
  ) {
    channel = "google_maps";
    industryOrNiche = "Legal & Professional Advisory";
    query = "Commercial Law Practice";
    painPoint = "Lead capture friction and manual consultation scheduling";
    servicePitch = "Modern client consultation intake and calendar automation flow";
  } else if (
    lower.includes("architect") ||
    lower.includes("studio") ||
    lower.includes("design agency")
  ) {
    channel = "google_maps";
    industryOrNiche = "Architecture & Spatial Design";
    query = "Architectural Studio";
    painPoint = "Slow portfolio loading speed and lack of interactive project showpiece";
    servicePitch = "Bespoke ultra-fast interactive portfolio website built on Next.js";
  } else if (
    lower.includes("saas") ||
    lower.includes("b2b tech") ||
    lower.includes("cto") ||
    lower.includes("founder")
  ) {
    channel = "apollo";
    industryOrNiche = "B2B Software & SaaS";
    query = "B2B Cloud Infrastructure";
    painPoint = "Technical debt in webhook data pipelines and third-party integrations";
    servicePitch = "High-throughput API adapter pipelines and webhook buffering";
  } else if (lower.includes("website") || lower.includes("web site") || lower.includes("web design")) {
    channel = location ? "google_maps" : "contra";
    industryOrNiche = "Local Businesses Seeking Web Redesign";
    query = cleanPrompt.replace(/^(search|find|get|look for)\s+/i, "").replace(/\s+(in|at|near).*$/i, "");
    painPoint = "Outdated legacy website with poor mobile responsiveness and high bounce rate";
    servicePitch = "Next-generation high-speed website overhaul and SEO performance tuning";
  } else {
    // Default to clean extracted query
    query = cleanPrompt.replace(/^(search|find|get|look for)\s+/i, "").slice(0, 40);
  }

  return {
    query,
    location,
    channel,
    industryOrNiche,
    painPoint,
    servicePitch,
    model: `${model} (autonomous parser)`,
    simulated: true,
  };
}

export async function generateCadenceFollowUpEmail(
  variables: FollowUpPromptVariables
): Promise<GeneratedEmailDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = "claude-3-5-sonnet-20241022";

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
          system: CADENCE_FOLLOWUP_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: buildFollowUpUserPrompt(variables),
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.content?.[0]?.text || "";
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
      }
    } catch {
      // fallback to simulation
    }
  }

  const firstName = variables.contactName.split(" ")[0] || variables.contactName;
  const company = variables.companyName;

  if (variables.step === 2) {
    const subject = `Re: ${variables.previousSubject || `Quick question regarding ${company}`}`;
    const body = [
      `Hi ${firstName},`,
      `Circling back briefly on my previous note. I know you're busy running things at ${company}.`,
      `We specialize in building bespoke web applications and API pipelines to help teams scale engineering velocity without agency overhead.`,
      `Would you have 10-15 minutes Thursday or Friday for a quick diagnostic chat?`,
      `Best,\n${variables.senderName}`,
      `If this is not relevant to your current priorities, reply 'unsubscribe' and I will not contact you again.`
    ].join("\n\n");

    return {
      subject,
      body,
      model: `${model} (cadence engine simulation)`,
      simulated: true,
    };
  } else {
    // Step 3: Breakup email
    const subject = `Closing the loop: ${company}`;
    const bookingLine = variables.bookingUrl
      ? `\nIf timing is ever right in the future, feel free to pick a time directly: ${variables.bookingUrl}`
      : "";
    const body = [
      `Hi ${firstName},`,
      `I haven't heard back, so I assume custom software integrations aren't a priority for ${company} right now. I completely understand and won't clutter your inbox further.${bookingLine}`,
      `Wishing you and the team all the best!`,
      `Best,\n${variables.senderName}`,
      `If this is not relevant to your current priorities, reply 'unsubscribe' and I will not contact you again.`
    ].join("\n\n");

    return {
      subject,
      body,
      model: `${model} (cadence engine simulation)`,
      simulated: true,
    };
  }
}
