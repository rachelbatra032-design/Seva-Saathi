import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "identity",
    name: "Identity & Documents",
    description:
      "Aadhaar, passport, voter ID, birth and death certificates, and digital document wallets.",
    icon: "fingerprint",
  },
  {
    slug: "taxes-finance",
    name: "Taxes & Finance",
    description:
      "Income tax, GST, PAN, TDS, pensions, provident fund and consumer finance protection.",
    icon: "landmark",
  },
  {
    slug: "health",
    name: "Health",
    description:
      "Health insurance, digital health IDs, telemedicine, vaccination and affordable medicines.",
    icon: "heart-pulse",
  },
  {
    slug: "education",
    name: "Education & Skills",
    description:
      "Scholarships, free online courses, school boards, entrance exams and skilling programmes.",
    icon: "graduation-cap",
  },
  {
    slug: "jobs-labour",
    name: "Jobs & Labour",
    description:
      "Job portals, government recruitment, worker registration, ESIC and rural employment.",
    icon: "briefcase",
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    description:
      "Farmer income support, crop insurance, soil health, mandi prices and weather advisories.",
    icon: "wheat",
  },
  {
    slug: "transport",
    name: "Transport & Travel",
    description:
      "Driving licences, vehicle registration, e-challans, trains, highways and air travel.",
    icon: "bus-front",
  },
  {
    slug: "housing",
    name: "Housing & Urban",
    description:
      "Affordable housing schemes, urban development and rural housing assistance.",
    icon: "house",
  },
  {
    slug: "social-welfare",
    name: "Social Welfare",
    description:
      "Pensions, food security, cooking gas, disability benefits and direct benefit transfers.",
    icon: "hand-helping",
  },
  {
    slug: "legal-grievances",
    name: "Legal & Grievances",
    description:
      "File complaints, use the Right to Information, check court cases and report cyber crime.",
    icon: "scale",
  },
  {
    slug: "business",
    name: "Business & Enterprise",
    description:
      "Register a company or MSME, trade and import-export services, and government procurement.",
    icon: "store",
  },
  {
    slug: "digital-services",
    name: "Digital Services",
    description:
      "Unified apps, citizen engagement platforms, language tools and the laws of India.",
    icon: "smartphone",
  },
  {
    slug: "state-portals",
    name: "State & UT Portals",
    description:
      "Main portals and citizen-service gateways of state and union territory governments.",
    icon: "map-pinned",
  },
];

export const categoryBySlug = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
) as Record<string, Category>;
