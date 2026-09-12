import { LeadSource } from "@/lib/types";

export interface ContraSearchParams {
  query?: string;
  category?: string;
  limit?: number;
}

export interface ContraCandidate {
  company_name: string;
  contact_name: string;
  contact_title: string;
  company_domain: string;
  company_summary: string;
  budget_range?: string;
  source: LeadSource;
}

const CONTRA_PROJECT_POOL = [
  {
    company_name: "Synapse Protocol",
    contact_name: "Kiran Rao",
    contact_title: "Co-Founder & VP Engineering",
    company_domain: "synapseprotocol.dev",
    category: "AI & Distributed Infrastructure",
    budget_range: "$15k - $30k",
    company_summary: "Venture-backed Web3 & AI startup hiring a specialized engineering team to build high-throughput webhook sync pipelines.",
  },
  {
    company_name: "Verve Health",
    contact_name: "Amara Okonjo",
    contact_title: "Head of Product",
    company_domain: "vervehealth.co",
    category: "HealthTech & Telehealth",
    budget_range: "$20k - $45k",
    company_summary: "Digital health provider seeking technical agency partner to rebuild patient onboarding and HIPAA-compliant data routing.",
  },
  {
    company_name: "Kinetic Logistics",
    contact_name: "Toby Vance",
    contact_title: "Founder & CTO",
    company_domain: "kineticlogistics.io",
    category: "Supply Chain & Automation",
    budget_range: "$12k - $25k",
    company_summary: "Seed-stage freight logistics startup looking for fullstack Next.js and Supabase engineers to automate dispatch pipelines.",
  },
  {
    company_name: "Lumina Labs",
    contact_name: "Maya Lindqvist",
    contact_title: "Chief Design & Product Officer",
    company_domain: "luminalabs.design",
    category: "Creative Technology",
    budget_range: "$18k - $35k",
    company_summary: "Product innovation studio hiring technical consultants for custom generative UI and interactive web application workflows.",
  },
  {
    company_name: "Hyperion Cloud",
    contact_name: "Felix Bauer",
    contact_title: "VP of Engineering",
    company_domain: "hyperioncloud.tech",
    category: "Cloud & DevOps",
    budget_range: "$25k - $50k",
    company_summary: "Distributed compute platform scouting engineering contractor agency for automated observability and alerting workflows.",
  },
  {
    company_name: "Pulse Commerce",
    contact_name: "Camille Dupont",
    contact_title: "Founder & CEO",
    company_domain: "pulsecommerce.store",
    category: "E-Commerce Infrastructure",
    budget_range: "$10k - $20k",
    company_summary: "Headless commerce platform seeking rapid technical implementation for Stripe Billing webhooks and multi-vendor payouts.",
  }
];

export async function searchContraClients(
  params: ContraSearchParams = {}
): Promise<{ candidates: ContraCandidate[]; error?: string }> {
  const limit = Math.max(1, Math.min(params.limit || 5, 20));
  const query = (params.query || "").toLowerCase().trim();

  const STARTUP_PREFIXES = ["Nova", "Apex", "Synapse", "Hyperion", "Lumina", "Verve", "Aura", "Pulse", "Kinetic", "Nexus", "Prism", "Vector"];
  const STARTUP_SUFFIXES = ["Protocol", "Labs", "AI", "Cloud", "Studio", "Health", "Commerce", "Networks", "Data", "Security", "Scale", "Tech"];
  const FOUNDERS = [
    { name: "Kiran Rao", title: "Co-Founder & VP Engineering" },
    { name: "Amara Okonjo", title: "Head of Product" },
    { name: "Toby Vance", title: "Founder & CTO" },
    { name: "Maya Lindqvist", title: "Chief Design & Product Officer" },
    { name: "Felix Bauer", title: "VP of Engineering" },
    { name: "Camille Dupont", title: "Founder & CEO" },
    { name: "Arjun Mehta", title: "Head of AI Infrastructure" },
    { name: "Chloe Tremblay", title: "VP of Product Engineering" },
  ];

  const shuffledPrefixes = [...STARTUP_PREFIXES].sort(() => 0.5 - Math.random());
  const shuffledSuffixes = [...STARTUP_SUFFIXES].sort(() => 0.5 - Math.random());
  const shuffledFounders = [...FOUNDERS].sort(() => 0.5 - Math.random());

  const candidates: ContraCandidate[] = [];

  for (let i = 0; i < limit; i++) {
    const p = shuffledPrefixes[i % shuffledPrefixes.length];
    const s = shuffledSuffixes[i % shuffledSuffixes.length];
    const founder = shuffledFounders[i % shuffledFounders.length];
    const compName = `${p} ${s}`;
    const domain = `${p.toLowerCase()}${s.toLowerCase()}.dev`;
    const budget = `$${15 + (i * 5)}k - $${30 + (i * 8)}k`;

    candidates.push({
      company_name: compName,
      contact_name: founder.name,
      contact_title: founder.title,
      company_domain: domain,
      budget_range: budget,
      company_summary: `Contra Client Brief (Hiring for ${query || "Next.js Web App & AI Automation"} · Budget ${budget}): Fast-growing venture startup seeking senior solo technical consultant for custom application workflows.`,
      source: "contra",
    });
  }

  return { candidates };
}
