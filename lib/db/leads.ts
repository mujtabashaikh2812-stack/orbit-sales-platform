import { 
  Lead, 
  LeadStage, 
  Requirement, 
  Deal, 
  Meeting, 
  StageHistory, 
  Message 
} from "@/lib/types";
import { createClient, isSupabaseConfigured } from "./supabase-client";

export interface LeadDetail extends Lead {
  requirements?: Requirement | null;
  deal?: Deal | null;
  meetings?: Meeting[];
  stage_history?: StageHistory[];
  messages?: Message[];
}

// Initial realistic seed records matching database_schema.md & seed.sql
export const INITIAL_LEADS: LeadDetail[] = [
  {
    id: "lead-acme-101",
    user_id: "00000000-0000-0000-0000-000000000001",
    company_name: "Acme Logistics",
    contact_name: "Sarah Jenkins",
    contact_title: "Chief Technology Officer",
    email: "sarah.jenkins@acmelogistics.example.com",
    email_verified: true,
    source: "apollo",
    company_domain: "acmelogistics.example.com",
    company_summary: "Freight optimization platform scaling cross-border shipments.",
    stage: "replied",
    stage_updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    requirements: {
      id: "req-acme-1",
      lead_id: "lead-acme-101",
      project_description: "Custom webhook adapter service to handle high-frequency 3PL updates without dropped packets.",
      budget_hint: "$10k - $15k project budget mentioned",
      timeline_hint: "Needs delivery within 4 weeks",
      key_requirements: [
        { item: "Idempotent webhook ingestion buffer", priority: "must-have" },
        { item: "Dead-letter queue with auto-retry", priority: "must-have" },
        { item: "Grafana metrics dashboard", priority: "nice-to-have" }
      ],
      extracted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    stage_history: [
      {
        id: "sh-1",
        lead_id: "lead-acme-101",
        from_stage: null,
        to_stage: "sourced",
        changed_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
        triggered_by: "system"
      },
      {
        id: "sh-2",
        lead_id: "lead-acme-101",
        from_stage: "sourced",
        to_stage: "enriched",
        changed_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
        triggered_by: "system"
      },
      {
        id: "sh-3",
        lead_id: "lead-acme-101",
        from_stage: "enriched",
        to_stage: "contacted",
        changed_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        triggered_by: "ai"
      },
      {
        id: "sh-4",
        lead_id: "lead-acme-101",
        from_stage: "contacted",
        to_stage: "replied",
        changed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        triggered_by: "system"
      }
    ],
    messages: [
      {
        id: "msg-1",
        conversation_id: "conv-acme",
        direction: "outbound",
        sender: "operator@orbit.local",
        subject: "Quick question regarding Acme Logistics data pipelines",
        body: "Hi Sarah, noticed your team is scaling shipment integrations. We build custom API workflows that cut sync latency in half. Open to a brief chat this week?",
        ai_generated: true,
        sent_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString()
      },
      {
        id: "msg-2",
        conversation_id: "conv-acme",
        direction: "inbound",
        sender: "sarah.jenkins@acmelogistics.example.com",
        subject: "Re: Quick question regarding Acme Logistics data pipelines",
        body: "Hi, yes this is timely. We are hitting bottle-necks with our 3PL webhooks. What is your typical timeline for a custom adapter?",
        ai_generated: false,
        classified_intent: "interested",
        sent_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: "lead-nova-102",
    user_id: "00000000-0000-0000-0000-000000000001",
    company_name: "Nova Labs",
    contact_name: "David Chen",
    contact_title: "Founder & CEO",
    email: "david@novalabs.example.com",
    email_verified: true,
    source: "hunter",
    company_domain: "novalabs.example.com",
    company_summary: "Clinical data aggregation software for decentralized medical trials.",
    stage: "meeting_booked",
    stage_updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    meetings: [
      {
        id: "meet-1",
        lead_id: "lead-nova-102",
        google_event_id: "gcal_event_nova_202",
        scheduled_at: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
        duration_minutes: 30,
        status: "confirmed",
        notes: "Introductory discovery call on clinical aggregation pipelines.",
        created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      }
    ],
    deal: {
      id: "deal-nova-1",
      lead_id: "lead-nova-102",
      quoted_amount: 12500,
      currency: "USD",
      status: "draft",
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    stage_history: [
      {
        id: "sh-nova-1",
        lead_id: "lead-nova-102",
        from_stage: "qualified",
        to_stage: "meeting_booked",
        changed_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        triggered_by: "system"
      }
    ]
  },
  {
    id: "lead-kestrel-103",
    user_id: "00000000-0000-0000-0000-000000000001",
    company_name: "Kestrel Bio",
    contact_name: "Elena Rostova",
    contact_title: "Head of Product",
    email: "elena@kestrelbio.example.com",
    email_verified: true,
    source: "manual",
    company_domain: "kestrelbio.example.com",
    company_summary: "Bioinformatics research tooling and sequence data analysis.",
    stage: "contacted",
    stage_updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    stage_history: [
      {
        id: "sh-kestrel-1",
        lead_id: "lead-kestrel-103",
        from_stage: "enriched",
        to_stage: "contacted",
        changed_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        triggered_by: "ai"
      }
    ]
  },
  {
    id: "lead-vanguard-104",
    user_id: "00000000-0000-0000-0000-000000000001",
    company_name: "Vanguard Partners",
    contact_name: "Marcus Vance",
    contact_title: "Managing Director",
    email: "marcus@vanguardpartners.example.com",
    email_verified: true,
    source: "apollo",
    company_domain: "vanguardpartners.example.com",
    company_summary: "B2B growth advisory and tech venture incubation.",
    stage: "enriched",
    stage_updated_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    stage_history: [
      {
        id: "sh-vanguard-1",
        lead_id: "lead-vanguard-104",
        from_stage: "sourced",
        to_stage: "enriched",
        changed_at: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
        triggered_by: "system"
      }
    ]
  },
  {
    id: "lead-prism-105",
    user_id: "00000000-0000-0000-0000-000000000001",
    company_name: "Prism Cloud",
    contact_name: "Liam Thorne",
    contact_title: "VP of Engineering",
    email: "liam@prismcloud.example.com",
    email_verified: false,
    source: "apollo",
    company_domain: "prismcloud.example.com",
    company_summary: "Distributed caching and edge compute infrastructure.",
    stage: "sourced",
    stage_updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    stage_history: [
      {
        id: "sh-prism-1",
        lead_id: "lead-prism-105",
        from_stage: null,
        to_stage: "sourced",
        changed_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        triggered_by: "system"
      }
    ]
  }
];

// In-memory / storage bridge for preview & live fallback
let localStore: LeadDetail[] = [...INITIAL_LEADS];

const CACHE_KEY = "orbit_leads_ledger_v1";

function getCachedStore(): LeadDetail[] {
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStore = parsed;
          return localStore;
        }
      }
    } catch {}
  }
  return localStore;
}

function persistStore(data: LeadDetail[]) {
  localStore = data;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}

export function getLeadsSync(): LeadDetail[] {
  return [...getCachedStore()];
}

export function getLeadByIdSync(id: string): LeadDetail | null {
  const list = getCachedStore();
  const found = list.find((l) => l.id === id);
  return found ? { ...found } : null;
}

export async function getLeads(): Promise<LeadDetail[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .select(`
        *,
        requirements (*),
        deals (*),
        meetings (*),
        stage_history (*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      persistStore(data as LeadDetail[]);
      return data as LeadDetail[];
    }
  }

  return getLeadsSync();
}

export async function getLeadById(id: string): Promise<LeadDetail | null> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .select(`
        *,
        requirements (*),
        deals (*),
        meetings (*),
        stage_history (*)
      `)
      .eq("id", id)
      .single();

    if (!error && lead) {
      return lead as LeadDetail;
    }
  }

  return getLeadByIdSync(id);
}

export async function createLead(
  input: Omit<Lead, "id" | "created_at" | "updated_at" | "stage_updated_at">
): Promise<LeadDetail> {
  const now = new Date().toISOString();
  const newLead: LeadDetail = {
    ...input,
    id: `lead-${Date.now()}`,
    stage_updated_at: now,
    created_at: now,
    updated_at: now,
    stage_history: [
      {
        id: `sh-${Date.now()}`,
        lead_id: `lead-${Date.now()}`,
        from_stage: null,
        to_stage: input.stage,
        changed_at: now,
        triggered_by: "owner",
      },
    ],
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        company_name: input.company_name,
        contact_name: input.contact_name,
        contact_title: input.contact_title,
        email: input.email,
        email_verified: input.email_verified,
        source: input.source,
        company_domain: input.company_domain,
        company_summary: input.company_summary,
        stage: input.stage,
      })
      .select()
      .single();

    if (!error && data) {
      return data as LeadDetail;
    }
  }

  localStore.unshift(newLead);
  persistStore([...localStore]);
  return newLead;
}

export async function updateLead(
  id: string,
  partial: Partial<LeadDetail>
): Promise<LeadDetail | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      requirements,
      deal,
      meetings,
      stage_history,
      messages,
      ...leadFields
    } = partial;

    const { data, error } = await supabase
      .from("leads")
      .update({ ...leadFields, updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      return data as LeadDetail;
    }
  }

  const index = localStore.findIndex((l) => l.id === id);
  if (index !== -1) {
    localStore[index] = {
      ...localStore[index],
      ...partial,
      updated_at: now,
    };
    persistStore([...localStore]);
    return localStore[index];
  }

  return null;
}

export async function updateLeadStage(
  id: string,
  newStage: LeadStage,
  triggeredBy: "ai" | "owner" | "system" = "owner"
): Promise<LeadDetail | null> {
  const now = new Date().toISOString();
  const lead = await getLeadById(id);
  if (!lead) return null;

  const oldStage = lead.stage;

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from("leads")
      .update({
        stage: newStage,
        stage_updated_at: now,
        updated_at: now,
      })
      .eq("id", id);

    await supabase.from("stage_history").insert({
      lead_id: id,
      from_stage: oldStage,
      to_stage: newStage,
      changed_at: now,
      triggered_by: triggeredBy,
    });

    return getLeadById(id);
  }

  const historyItem: StageHistory = {
    id: `sh-${Date.now()}`,
    lead_id: id,
    from_stage: oldStage,
    to_stage: newStage,
    changed_at: now,
    triggered_by: triggeredBy,
  };

  const index = localStore.findIndex((l) => l.id === id);
  if (index !== -1) {
    const updatedHistory = [...(localStore[index].stage_history || []), historyItem];
    localStore[index] = {
      ...localStore[index],
      stage: newStage,
      stage_updated_at: now,
      updated_at: now,
      stage_history: updatedHistory,
    };
    persistStore([...localStore]);
    return localStore[index];
  }

  return null;
}
