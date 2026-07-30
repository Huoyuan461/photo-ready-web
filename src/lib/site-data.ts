import type { ProductOfferId } from "@/lib/commerce";

export type PhotoPreset = {
  id: "us-passport" | "china-one-inch" | "china-two-inch";
  name: string;
  slug: string;
  description: string;
  width: number;
  height: number;
  sizeLabel: string;
  background: string;
  accent: string;
  promptFocus: string;
  targetRegion: "us" | "china";
};

export type SidePack = {
  id: Extract<ProductOfferId, "pfmea" | "lean" | "office">;
  name: string;
  price: string;
  summary: string;
  badge: string;
};

export type ToolEntry = {
  id: string;
  href: string;
  name: string;
  kind: string;
  status: "ready" | "live" | "custom";
  summary: string;
  badge: string;
};

export type ToolCategory = {
  id: string;
  name: string;
  summary: string;
  accent: string;
  entries: ToolEntry[];
};

export type ShowcaseCard = {
  id: string;
  image: string;
  href: string;
  title: string;
  summary: string;
  bullets: string[];
};

export const siteName = "PhotoReady";
export const companyName = "Shanmu Software";
export const siteTagline =
  "AI passport photos, digital packs, and launch pages in one independent hub";

export const siteBranding = {
  name: siteName,
  legalName: companyName,
  shortName: "PhotoReady",
  tagline: siteTagline,
  description:
    "A focused launch site for AI passport photos, standardized digital packs, and configurable product pages, with editable branding and custom delivery support.",
  supportEmail: "huoyuan461@qq.com",
  supportLabel: "huoyuan461@qq.com",
  logoSquare: "/brand/photo-ready-logo-square.png",
  logoWordmark: "/brand/photo-ready-logo-wordmark.png",
  logoAlt: "PhotoReady logo",
};

export const photoPresets: PhotoPreset[] = [
  {
    id: "us-passport",
    name: "U.S. Passport Photo",
    slug: "us-passport-photo",
    description:
      "American-style passport portrait with neutral lighting, white background, and the common 2 x 2 inch square output.",
    width: 600,
    height: 600,
    sizeLabel: "2 x 2 in",
    background: "#f5f1e7",
    accent: "#1d7a72",
    promptFocus:
      "Create an official U.S.-style passport photo with natural skin tone, a plain white background, balanced studio lighting, and a centered head-and-shoulders composition.",
    targetRegion: "us",
  },
  {
    id: "china-one-inch",
    name: "China One-Inch ID",
    slug: "china-one-inch-id-photo",
    description:
      "Chinese common one-inch ID size with the same polished American-style portrait treatment and formal framing.",
    width: 295,
    height: 413,
    sizeLabel: "295 x 413 px",
    background: "#e6edf6",
    accent: "#2c5c9a",
    promptFocus:
      "Create a formal Chinese one-inch ID photo with a clean white background, calm expression, direct facing pose, and neat official framing.",
    targetRegion: "china",
  },
  {
    id: "china-two-inch",
    name: "China Two-Inch ID",
    slug: "china-two-inch-id-photo",
    description:
      "Chinese common two-inch ID size for forms and applications, using a neutral official portrait style.",
    width: 413,
    height: 579,
    sizeLabel: "413 x 579 px",
    background: "#edf0e8",
    accent: "#a65d2f",
    promptFocus:
      "Create a formal Chinese two-inch ID photo with a bright white background, centered upper body crop, realistic facial detail, and official document proportions.",
    targetRegion: "china",
  },
];

export const sidePacks: SidePack[] = [
  {
    id: "pfmea",
    name: "PFMEA Offline Pack",
    price: "$49",
    summary:
      "Structured offline PFMEA workflow product for engineers who need a reusable deliverable instead of an open-ended service engagement.",
    badge: "Engineering",
  },
  {
    id: "lean",
    name: "Lean Problem Solving Kit",
    price: "$29",
    summary:
      "Digital templates for issue review, 8D, checklist control, and lesson-learn capture in factories and offices.",
    badge: "Operations",
  },
  {
    id: "office",
    name: "Office Ops Checklists",
    price: "$19",
    summary:
      "Downloadable office and operations checklists for handoff, audit readiness, and repeatable admin routines.",
    badge: "Admin",
  },
];

export const pricingTiers = [
  {
    name: "Preview",
    price: "$0",
    cadence: "free",
    description:
      "Upload one portrait, test the framing, and confirm the official-photo direction before buying export access.",
    features: [
      "Browser draft crop",
      "U.S. and China size switching",
      "Single-session preview",
      "Ready for AI generation upgrade",
    ],
    ctaLabel: "Open preview",
    href: "/preview",
    featured: false,
  },
  {
    name: "Export Pack",
    price: "$15",
    cadence: "one-time",
    description:
      "Best for users who need polished U.S. and China official ID exports from one portrait without a subscription.",
    features: [
      "AI-generated official portrait",
      "U.S. passport plus China common sizes",
      "Clean white-background deliverables",
      "Re-download support",
    ],
    ctaLabel: "Buy export pack",
    href: "#checkout",
    featured: true,
  },
  {
    name: "Custom Tool Delivery",
    price: "Email",
    cadence: "custom",
    description:
      "For buyers who want one of the existing tools re-skinned, expanded, or turned into a dedicated delivery page after describing the task by email.",
    features: [
      "Use existing tool surfaces as a base",
      "Custom content and workflow copy",
      "Screenshot-backed delivery review",
      "Founder-direct scoping by email",
    ],
    ctaLabel: "Request custom delivery",
    href: "/support",
    featured: false,
  },
];

export const toolCategories: ToolCategory[] = [
  {
    id: "photo-tools",
    name: "Photo tools",
    summary:
      "User-facing image tools for fast preview, destination-specific exports, and category-led entry points.",
    accent: "#2c5c9a",
    entries: [
      {
        id: "preview-studio",
        href: "/preview",
        name: "AI Passport Studio",
        kind: "Core tool",
        status: "live",
        badge: "Image 2.0",
        summary:
          "Upload one portrait, choose U.S. or China common sizes, and generate document-ready results.",
      },
      {
        id: "us-passport-size",
        href: "/preview",
        name: "U.S. Passport Size",
        kind: "U.S. standard",
        status: "ready",
        badge: "2 x 2 in",
        summary:
          "American 2 x 2 inch square format with white background and official portrait framing.",
      },
      {
        id: "china-common-sizes",
        href: "/preview",
        name: "China Common Sizes",
        kind: "China standard",
        status: "ready",
        badge: "1 in / 2 in",
        summary:
          "One-inch and two-inch digital outputs with official document composition.",
      },
      {
        id: "history-redownloads",
        href: "/account",
        name: "Local History",
        kind: "Re-download",
        status: "ready",
        badge: "On device",
        summary:
          "Review locally saved generations and download them again on the same device.",
      },
    ],
  },
  {
    id: "digital-packs",
    name: "Digital packs",
    summary:
      "Earlier engineering and operations work kept in a standardized downloadable shelf.",
    accent: "#1d7a72",
    entries: [
      {
        id: "products-catalog",
        href: "/products",
        name: "Products Catalog",
        kind: "Catalog",
        status: "ready",
        badge: "All tools",
        summary:
          "One overview for the photo product plus the side-product shelf.",
      },
      {
        id: "packs-shelf",
        href: "/packs",
        name: "Digital Packs Shelf",
        kind: "Shelf",
        status: "ready",
        badge: "PFMEA / Lean",
        summary:
          "Direct entry for PFMEA, lean, and office operations packs.",
      },
      {
        id: "pfmea-pack",
        href: "/packs",
        name: "PFMEA Offline Pack",
        kind: "Engineering",
        status: "ready",
        badge: "$49",
        summary:
          "Structured offline quality workflow product for engineers.",
      },
      {
        id: "office-checklists",
        href: "/packs",
        name: "Office Ops Checklists",
        kind: "Operations",
        status: "ready",
        badge: "$19",
        summary:
          "Downloadable checklists for office routines, audits, and handoffs.",
      },
    ],
  },
  {
    id: "ops-workspace",
    name: "Ops workspace",
    summary:
      "Founder planning, pricing, launch execution, and legacy operations pages that support delivery.",
    accent: "#a65d2f",
    entries: [
      {
        id: "pricing",
        href: "/pricing",
        name: "Pricing",
        kind: "Revenue",
        status: "ready",
        badge: "Launch",
        summary:
          "Revenue model, checkout readiness, and launch pricing structure.",
      },
      {
        id: "ops-plan",
        href: "/ops",
        name: "Implementation Plan",
        kind: "Planning",
        status: "ready",
        badge: "12 months",
        summary:
          "Founder execution board for launch, staffing, and revenue rhythm.",
      },
      {
        id: "launch",
        href: "/launch",
        name: "Launch Checklist",
        kind: "Launch",
        status: "ready",
        badge: "Go live",
        summary:
          "Go-live checklist and readiness tracking before public release.",
      },
      {
        id: "legacy-ops",
        href: "/ops/legacy",
        name: "Legacy Ops",
        kind: "Legacy",
        status: "custom",
        badge: "Reference",
        summary:
          "Older founder operations references preserved for continuity.",
      },
    ],
  },
  {
    id: "support-center",
    name: "Support and account",
    summary:
      "History, support, and customer-facing policy pages grouped into one obvious area.",
    accent: "#7a5268",
    entries: [
      {
        id: "account",
        href: "/account",
        name: "Local History",
        kind: "Account",
        status: "ready",
        badge: "Saved",
        summary:
          "Re-open local preview sessions and re-download prior outputs on the same device.",
      },
      {
        id: "support",
        href: "/support",
        name: "Support",
        kind: "Help",
        status: "ready",
        badge: "Email",
        summary:
          "Help contact path plus troubleshooting and response-time expectations.",
      },
      {
        id: "privacy",
        href: "/privacy",
        name: "Privacy",
        kind: "Policy",
        status: "ready",
        badge: "Legal",
        summary:
          "Privacy policy page for launch compliance and user trust.",
      },
      {
        id: "terms-refund",
        href: "/terms",
        name: "Terms and Refund",
        kind: "Policy",
        status: "ready",
        badge: "Policy",
        summary:
          "Terms of service and refund rules for purchase clarity.",
      },
    ],
  },
];

export const editingGuidance = [
  "Change the logo asset path in src/lib/site-data.ts to swap the current icon or wordmark.",
  "Update the siteBranding fields to rename the hub, tagline, or descriptive copy.",
  "Edit toolCategories to add, reorder, hide, or relabel any tool without restructuring page code.",
];

export const homeHighlights = [
  {
    label: "4 sections",
    value: "Clear functional classification for every current page",
  },
  {
    label: "Editable branding",
    value: "Transparent SVG logo, title, tagline, and content come from one config file",
  },
  {
    label: "AI photo workflow",
    value: "Passport generation now supports U.S. and China common sizes from one upload",
  },
];

export const showcaseCards: ShowcaseCard[] = [
  {
    id: "packs-showcase",
    image: "/showcases/packs-showcase.png",
    href: "/packs",
    title: "Digital packs shelf",
    summary:
      "A finished catalog surface for PFMEA, lean templates, and office checklists with productized delivery instead of consulting sprawl.",
    bullets: [
      "Ready-made downloadable pack cards",
      "Pricing and value explanation blocks",
      "Can be re-skinned for your own niche tools",
    ],
  },
  {
    id: "ops-showcase",
    image: "/showcases/ops-showcase.png",
    href: "/ops",
    title: "Ops and launch board",
    summary:
      "A structured execution page for launch planning, milestones, and operating rhythm that can be customized after you describe the task.",
    bullets: [
      "Milestone timeline presentation",
      "Launch checklist and planning sections",
      "Suitable for internal delivery and founder dashboards",
    ],
  },
  {
    id: "history-showcase",
    image: "/showcases/history-showcase.png",
    href: "/account",
    title: "History and re-download",
    summary:
      "A simple account-like page for reviewing previously generated outputs and downloading them again from local history.",
    bullets: [
      "Visual session archive",
      "Lightweight local persistence",
      "Useful pattern for content libraries and archives",
    ],
  },
];

export const faqItems = [
  {
    question: "Can this website show all existing tools without mixing audiences?",
    answer:
      "Yes. The new layout separates photo tools, digital packs, operational pages, and support so each group stays understandable without losing discoverability.",
  },
  {
    question: "How do I replace the current logo and wording later?",
    answer:
      "The header, footer, hero, and catalog now all read from one branding object, so changing asset paths or copy in the shared data file updates the whole site.",
  },
  {
    question: "Does the preview tool now generate American-style official photos with changed styling and pose?",
    answer:
      "Yes. The dedicated preview page now sends your portrait through the local American-style generation flow first, so outfit, expression, and studio pose can change while identity stays recognizable.",
  },
  {
    question: "Why keep PFMEA and office packs on the same site?",
    answer:
      "They are now placed in their own category so they can remain sellable side products without disrupting the main user journey for the photo workflow.",
  },
];
