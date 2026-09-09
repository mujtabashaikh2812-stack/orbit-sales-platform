import { searchApolloLeads, ApolloSearchParams } from "./apollo";
import { searchGoogleMapsPlaces } from "./google-maps";
import { searchContraClients } from "./contra";
import { searchYellowPages } from "./yellow-pages";
import { findAndVerifyEmail } from "./hunter";
import { parseProspectingPrompt, ParsedProspectingIntent } from "@/lib/ai/claude";
import { LeadSource } from "@/lib/types";
import { 
  getLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  updateLeadStage, 
  LeadDetail 
} from "@/lib/db/leads";

export interface UnifiedSourcingParams extends ApolloSearchParams {
  source?: LeadSource;
  query?: string;
  location?: string;
}

export async function sourceLeads(
  params: UnifiedSourcingParams = {}
): Promise<{ created: LeadDetail[]; count: number; error?: string }> {
  const source = params.source || "apollo";
  const limit = params.limit || 5;

  let candidates: {
    company_name: string;
    contact_name: string;
    contact_title: string;
    company_domain: string;
    company_summary: string;
    phone?: string;
    location?: string;
    source: LeadSource;
  }[] = [];
  let fetchError: string | undefined;

  if (source === "google_maps") {
    const res = await searchGoogleMapsPlaces({
      query: params.query || "Commercial Agency",
      location: params.location || "Austin, TX",
      limit,
    });
    candidates = res.candidates;
    fetchError = res.error;
  } else if (source === "contra") {
    const res = await searchContraClients({
      query: params.query,
      limit,
    });
    candidates = res.candidates;
    fetchError = res.error;
  } else if (source === "yellow_pages") {
    const res = await searchYellowPages({
      category: params.query || "Commercial Services",
      location: params.location || "Chicago, IL",
      limit,
    });
    candidates = res.candidates;
    fetchError = res.error;
  } else {
    // Default: Apollo
    const res = await searchApolloLeads({
      industry: params.industry,
      targetRoles: params.targetRoles,
      minEmployees: params.minEmployees,
      maxEmployees: params.maxEmployees,
      limit,
    });
    candidates = res.candidates;
    fetchError = res.error;
  }

  if (fetchError) {
    return { created: [], count: 0, error: fetchError };
  }

  const existingLeads = await getLeads();
  const existingDomains = new Set(
    existingLeads
      .map((l) => l.company_domain?.toLowerCase())
      .filter(Boolean)
  );
  const existingCompanies = new Set(
    existingLeads.map((l) => l.company_name.toLowerCase())
  );

  const createdLeads: LeadDetail[] = [];

  for (const c of candidates) {
    // Prevent duplicate entries across ledger
    const domainLower = c.company_domain.toLowerCase();
    const companyLower = c.company_name.toLowerCase();

    if (existingDomains.has(domainLower) || existingCompanies.has(companyLower)) {
      continue;
    }

    const newLead = await createLead({
      user_id: "00000000-0000-0000-0000-000000000001",
      company_name: c.company_name,
      contact_name: c.contact_name,
      contact_title: c.contact_title,
      email: null,
      email_verified: false,
      source: c.source || source,
      company_domain: c.company_domain,
      company_summary: c.company_summary,
      phone: c.phone || null,
      location: c.location || null,
      stage: "sourced",
    });

    existingDomains.add(domainLower);
    existingCompanies.add(companyLower);
    createdLeads.push(newLead);
  }

  return { created: createdLeads, count: createdLeads.length };
}

// Backwards-compatible alias for existing callers
export const sourceLeadsFromICP = sourceLeads;

export async function sourceLeadsFromPrompt(
  prompt: string,
  limit: number = 5
): Promise<{
  created: LeadDetail[];
  count: number;
  parsed: ParsedProspectingIntent;
  error?: string;
}> {
  const parsed = await parseProspectingPrompt(prompt);

  const sourcingResult = await sourceLeads({
    source: parsed.channel,
    query: parsed.query,
    location: parsed.location,
    limit,
  });

  return {
    created: sourcingResult.created,
    count: sourcingResult.count,
    parsed,
    error: sourcingResult.error,
  };
}

export async function enrichLeadRecord(
  leadId: string
): Promise<{ lead: LeadDetail | null; error?: string }> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return { lead: null, error: "Lead not found" };
  }

  if (!lead.company_domain) {
    return { lead, error: "Company domain missing — cannot perform email enrichment." };
  }

  const enrichResult = await findAndVerifyEmail(lead.contact_name, lead.company_domain);
  if (enrichResult.error && !enrichResult.email) {
    return { lead, error: enrichResult.error };
  }

  // Update lead with discovered email
  await updateLead(leadId, {
    email: enrichResult.email,
    email_verified: enrichResult.verified,
  });

  // Atomically transition stage to 'enriched'
  const updated = await updateLeadStage(leadId, "enriched", "system");
  return { lead: updated };
}

export async function enrichAllSourcedLeads(): Promise<{
  total: number;
  enriched: number;
  errors: string[];
}> {
  const allLeads = await getLeads();
  const sourcedLeads = allLeads.filter((l) => l.stage === "sourced");

  let enrichedCount = 0;
  const errors: string[] = [];

  for (const lead of sourcedLeads) {
    const res = await enrichLeadRecord(lead.id);
    if (res.lead && res.lead.stage === "enriched") {
      enrichedCount++;
    } else if (res.error) {
      errors.push(`${lead.company_name}: ${res.error}`);
    }
  }

  return {
    total: sourcedLeads.length,
    enriched: enrichedCount,
    errors,
  };
}
