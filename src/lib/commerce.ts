export type ProductOfferId =
  | "export-pack"
  | "subscription"
  | "pfmea"
  | "lean"
  | "office";

export type CommerceLink = {
  href: string;
  ready: boolean;
  label: string;
  helper: string;
};

const FALLBACKS: Record<ProductOfferId, CommerceLink> = {
  "export-pack": {
    href: "/preview",
    ready: false,
    label: "Start with preview",
    helper:
      "Add LEMON_SQUEEZY_CHECKOUT_URL to enable the one-time export checkout.",
  },
  subscription: {
    href: "/support",
    ready: false,
    label: "Request unlimited access",
    helper:
      "Add LEMON_SQUEEZY_SUBSCRIPTION_URL to enable the monthly plan checkout.",
  },
  pfmea: {
    href: "/support",
    ready: false,
    label: "Request PFMEA pack",
    helper:
      "Add LEMON_SQUEEZY_PFMEA_PACK_URL to sell the PFMEA pack directly.",
  },
  lean: {
    href: "/support",
    ready: false,
    label: "Request lean kit",
    helper:
      "Add LEMON_SQUEEZY_LEAN_KIT_URL to sell the lean toolkit directly.",
  },
  office: {
    href: "/support",
    ready: false,
    label: "Request office pack",
    helper:
      "Add LEMON_SQUEEZY_OFFICE_CHECKLISTS_URL to sell the office checklist pack directly.",
  },
};

function resolveLink(
  envValue: string | undefined,
  readyLabel: string,
  fallback: CommerceLink,
): CommerceLink {
  if (envValue && /^https?:\/\//.test(envValue)) {
    return {
      href: envValue,
      ready: true,
      label: readyLabel,
      helper: "Checkout is configured and ready to publish.",
    };
  }

  return fallback;
}

export function getCommerceLinks(): Record<ProductOfferId, CommerceLink> {
  return {
    "export-pack": resolveLink(
      process.env.LEMON_SQUEEZY_CHECKOUT_URL,
      "Buy export pack",
      FALLBACKS["export-pack"],
    ),
    subscription: resolveLink(
      process.env.LEMON_SQUEEZY_SUBSCRIPTION_URL,
      "Join unlimited plan",
      FALLBACKS.subscription,
    ),
    pfmea: resolveLink(
      process.env.LEMON_SQUEEZY_PFMEA_PACK_URL,
      "Buy PFMEA pack",
      FALLBACKS.pfmea,
    ),
    lean: resolveLink(
      process.env.LEMON_SQUEEZY_LEAN_KIT_URL,
      "Buy lean kit",
      FALLBACKS.lean,
    ),
    office: resolveLink(
      process.env.LEMON_SQUEEZY_OFFICE_CHECKLISTS_URL,
      "Buy office pack",
      FALLBACKS.office,
    ),
  };
}
