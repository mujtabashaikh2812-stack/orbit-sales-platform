import { searchApolloLeads, ApolloSearchParams } from "./apollo";
import { findAndVerifyEmail } from "./hunter";
import { 
  getLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  updateLeadStage, 
  LeadDetail 
} from "@/lib/db/leads";

export async function sourceLeadsFromICP(
  params: ApolloSearchParams = {}
): Promise<{ created: LeadDetail[]; count: number; error?: string }> {
  const { candidates, error } = await searchApolloLeads(params);
  if (error) {
    return { created: [], count: 0, error };
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
    // Prevent duplicate entries
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
      source: "apollo",
      company_domain: c.company_domain,
      company_summary: c.company_summary,
      stage: "sourced",
    });

    existingDomains.add(domainLower);
    existingCompanies.add(companyLower);
    createdLeads.push(newLead);
  }

  return { created: createdLeads, count: createdLeads.length };
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
