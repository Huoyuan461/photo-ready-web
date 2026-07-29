import { publicConfig } from "@/lib/public-config";

type LaunchCheck = {
  label: string;
  ready: boolean;
  detail: string;
};

export function getLaunchReadiness() {
  const checks: LaunchCheck[] = [
    {
      label: "Production site URL",
      ready:
        Boolean(publicConfig.siteUrl) &&
        !publicConfig.siteUrl.includes("localhost"),
      detail:
        "Set NEXT_PUBLIC_SITE_URL to your real production domain before launch.",
    },
    {
      label: "Support email",
      ready:
        Boolean(publicConfig.supportEmail) &&
        publicConfig.supportEmail !== "support@example.com",
      detail:
        "Set NEXT_PUBLIC_SUPPORT_EMAIL to the inbox you will actually monitor.",
    },
    {
      label: "Company legal name",
      ready:
        Boolean(publicConfig.legalName) &&
        publicConfig.legalName !== "Shanmu Software",
      detail:
        "Set NEXT_PUBLIC_COMPANY_LEGAL_NAME to the name you want on policy pages.",
    },
    {
      label: "One-time checkout",
      ready: Boolean(process.env.LEMON_SQUEEZY_CHECKOUT_URL),
      detail:
        "Add LEMON_SQUEEZY_CHECKOUT_URL for the export pack purchase button.",
    },
    {
      label: "Subscription checkout",
      ready: Boolean(process.env.LEMON_SQUEEZY_SUBSCRIPTION_URL),
      detail:
        "Add LEMON_SQUEEZY_SUBSCRIPTION_URL for the unlimited plan.",
    },
    {
      label: "Side-pack checkout URLs",
      ready:
        Boolean(process.env.LEMON_SQUEEZY_PFMEA_PACK_URL) &&
        Boolean(process.env.LEMON_SQUEEZY_LEAN_KIT_URL) &&
        Boolean(process.env.LEMON_SQUEEZY_OFFICE_CHECKLISTS_URL),
      detail:
        "Add all three side-product Lemon Squeezy URLs to sell PFMEA, Lean, and Office packs.",
    },
    {
      label: "Analytics",
      ready: Boolean(process.env.POSTHOG_KEY),
      detail:
        "Set POSTHOG_KEY to measure visit-to-signup and signup-to-paid conversion.",
    },
  ];

  const readyCount = checks.filter((check) => check.ready).length;

  return {
    checks,
    readyCount,
    totalCount: checks.length,
  };
}
