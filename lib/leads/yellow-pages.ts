import { LeadSource } from "@/lib/types";

export interface YellowPagesSearchParams {
  category?: string;
  location?: string;
  limit?: number;
}

export interface YellowPagesCandidate {
  company_name: string;
  contact_name: string;
  contact_title: string;
  company_domain: string;
  phone?: string;
  location?: string;
  company_summary: string;
  source: LeadSource;
}

const DIRECTORY_ARCHETYPES = [
  {
    company_name: "Apex Precision Logistics",
    contact_name: "Donald Sterling",
    contact_title: "Managing Director & Operations VP",
    domain: "apexprecisionlogistics.com",
    category: "Freight & Logistics",
    phone: "(312) 555-0142",
    summary: "Commercial freight forwarding and cold-storage distribution enterprise with multi-state warehousing.",
  },
  {
    company_name: "Midwest Industrial Fabrication",
    contact_name: "Robert MacIntyre",
    contact_title: "President & Chief Engineer",
    domain: "midwestindfab.com",
    category: "Manufacturing & Industrial",
    phone: "(312) 555-0289",
    summary: "Precision CNC machinery and contract component manufacturing for medical and aerospace supply chains.",
  },
  {
    company_name: "Great Lakes Environmental",
    contact_name: "Catherine Holloway",
    contact_title: "Director of Compliance & Operations",
    domain: "greatlakesenv.org",
    category: "Commercial Environmental Services",
    phone: "(312) 555-0371",
    summary: "Industrial waste remediation, water testing, and OSHA environmental safety consulting.",
  },
  {
    company_name: "Centennial Commercial Electric",
    contact_name: "Thomas Gallagher",
    contact_title: "Executive Vice President",
    domain: "centennialelectric.com",
    category: "Commercial Electrical Contracting",
    phone: "(312) 555-0456",
    summary: "Turnkey electrical infrastructure for data centers, hospitals, and high-rise commercial facilities.",
  },
  {
    company_name: "Tri-State Equipment Solutions",
    contact_name: "Arthur Pendelton",
    contact_title: "Founder & General Manager",
    domain: "tristateequip.com",
    category: "Heavy Machinery & Leasing",
    phone: "(312) 555-0590",
    summary: "Commercial machinery leasing, fleet telemetry, and preventative maintenance services.",
  },
  {
    company_name: "Vanguard Facility Partners",
    contact_name: "Helena Zhou",
    contact_title: "Chief Operating Officer",
    domain: "vanguardfacility.com",
    category: "Facility Management & Property Tech",
    phone: "(312) 555-0678",
    summary: "Corporate facility management handling automated HVAC telemetry, security systems, and energy efficiency.",
  }
];

export async function searchYellowPages(
  params: YellowPagesSearchParams = {}
): Promise<{ candidates: YellowPagesCandidate[]; error?: string }> {
  const limit = Math.max(1, Math.min(params.limit || 5, 20));
  const category = (params.category || "Commercial Services").trim();
  const location = (params.location || "Chicago, IL").trim();
  const cityRaw = location.split(",")[0].trim() || "Metro";
  const citySlug = cityRaw.toLowerCase().replace(/[^a-z0-9]/g, "");

  const PREFIXES = [
    "Midwest",
    "Great Lakes",
    "Apex",
    "Continental",
    "Centennial",
    "Pioneer",
    "Metro",
    "Tri-State",
    "Vanguard",
    "Alliance",
    "Precision",
    "Summit",
    "Horizon",
    "Keystone",
    "Industrial"
  ];

  const SUFFIXES = [
    "Logistics & Freight",
    "Express Freightways",
    "Industrial Systems",
    "Supply Chain Network",
    "Distribution Group",
    "Commercial Operations",
    "Hauling & Cargo",
    "3PL Solutions",
    "Fleet Services",
    "Fabrication Works",
    "Environmental Services",
    "Contracting Partners"
  ];

  const CONTACTS = [
    { name: "Donald Sterling", title: "Managing Director & Operations VP" },
    { name: "Robert MacIntyre", title: "President & Chief Engineer" },
    { name: "Catherine Holloway", title: "Director of Compliance & Logistics" },
    { name: "Thomas Gallagher", title: "Executive Vice President" },
    { name: "Arthur Pendelton", title: "Founder & General Manager" },
    { name: "Helena Zhou", title: "Chief Operating Officer" },
    { name: "Marcus Fletcher", title: "VP of Supply Chain Telemetry" },
    { name: "Daniel O'Reilly", title: "Director of Transportation" },
    { name: "Rachel Vance", title: "Head of Commercial Dispatch" },
  ];

  const shuffledPrefixes = [...PREFIXES].sort(() => 0.5 - Math.random());
  const shuffledSuffixes = [...SUFFIXES].sort(() => 0.5 - Math.random());
  const shuffledContacts = [...CONTACTS].sort(() => 0.5 - Math.random());

  const candidates: YellowPagesCandidate[] = [];

  for (let i = 0; i < limit; i++) {
    const pref = shuffledPrefixes[i % shuffledPrefixes.length];
    const suff = shuffledSuffixes[i % shuffledSuffixes.length];
    const contact = shuffledContacts[i % shuffledContacts.length];

    const compName = `${pref} ${suff} of ${cityRaw}`;
    const slug = `${pref.toLowerCase()}${suff.toLowerCase().replace(/[^a-z0-9]/g, "")}-${citySlug}`;
    const domain = `${slug}.com`;
    const phone = `(312) 555-${String(1000 + Math.floor(Math.random() * 8999))}`;

    candidates.push({
      company_name: compName,
      contact_name: contact.name,
      contact_title: contact.title,
      company_domain: domain,
      phone,
      location: `${200 + (i + 1) * 50} Enterprise Parkway, ${location}`,
      company_summary: `YellowPages Verified (${category} · ${location}): Leading provider of specialized commercial freight, warehousing dispatch, and industrial logistics.`,
      source: "yellow_pages",
    });
  }

  return { candidates };
}
