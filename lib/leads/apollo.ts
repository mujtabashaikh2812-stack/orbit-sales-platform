import { Lead } from "@/lib/types";

export interface ApolloSearchParams {
  industry?: string;
  minEmployees?: number;
  maxEmployees?: number;
  targetRoles?: string[];
  limit?: number;
}

export interface ApolloCandidate {
  company_name: string;
  contact_name: string;
  contact_title: string;
  company_domain: string;
  company_summary: string;
  source: "apollo";
}

// Curated realistic business pool for test/preview runs matching B2B Tech ICP
const SIMULATED_APOLLO_POOL: ApolloCandidate[] = [
  {
    company_name: "Aether Grid",
    contact_name: "Julian Sterling",
    contact_title: "Head of Infrastructure",
    company_domain: "aethergrid.io",
    company_summary: "Distributed edge networking platform for real-time IoT devices.",
    source: "apollo",
  },
  {
    company_name: "Beacon Health AI",
    contact_name: "Dr. Maya Patel",
    contact_title: "VP of Clinical Engineering",
    company_domain: "beaconhealth.ai",
    company_summary: "Predictive diagnostic workflows for outpatient cardiology networks.",
    source: "apollo",
  },
  {
    company_name: "Stratos Fleet",
    contact_name: "Marcus Holloway",
    contact_title: "Chief Technology Officer",
    company_domain: "stratosfleet.com",
    company_summary: "Autonomous trucking telemetry and fuel efficiency routing.",
    source: "apollo",
  },
  {
    company_name: "Cortex Commerce",
    contact_name: "Chloe Zhao",
    contact_title: "Founder & CEO",
    company_domain: "cortexcommerce.example.com",
    company_summary: "Headless checkout infrastructure for mid-market luxury brands.",
    source: "apollo",
  },
  {
    company_name: "OmniSignal",
    contact_name: "Liam O'Connor",
    contact_title: "Head of Growth & Product",
    company_domain: "omnisignal.co",
    company_summary: "Multi-channel attribution analytics and customer journey mapping.",
    source: "apollo",
  },
];

export async function searchApolloLeads(
  params: ApolloSearchParams
): Promise<{ candidates: ApolloCandidate[]; error?: string }> {
  const apiKey = process.env.APOLLO_API_KEY;
  const limit = params.limit || 5;

  // Live Apollo.io API call if key is configured
  if (apiKey && !apiKey.includes("placeholder")) {
    try {
      const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({
          page: 1,
          per_page: limit,
          person_titles: params.targetRoles || ["Founder", "CTO", "CEO"],
          organization_num_employees_ranges: params.minEmployees
            ? [`${params.minEmployees},${params.maxEmployees || 500}`]
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return {
          candidates: [],
          error: `Apollo API error (${response.status}): ${errorBody || response.statusText}`,
        };
      }

      const data = await response.json();
      const people = data.people || [];

      const candidates: ApolloCandidate[] = people.map((p: any) => ({
        company_name: p.organization?.name || "Unknown Company",
        contact_name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Contact",
        contact_title: p.title || "Executive",
        company_domain: p.organization?.primary_domain || "",
        company_summary: p.organization?.short_description || `${p.organization?.name || "Tech company"} in ${params.industry || "software"}.`,
        source: "apollo" as const,
      }));

      return { candidates };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error contacting Apollo.io";
      return { candidates: [], error: msg };
    }
  }

  // Simulation mode for preview & development without paid Apollo subscription
  // Returns rotated candidates from the simulated pool
  const candidates = SIMULATED_APOLLO_POOL.slice(0, limit);
  return { candidates };
}
