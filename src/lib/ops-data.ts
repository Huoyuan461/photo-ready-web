export type Department = {
  id: "growth" | "product" | "engineering" | "customer-success" | "finance";
  name: string;
  lead: string;
  mission: string;
  responsibilities: string[];
  githubLabels: string[];
  sla: string;
  slaHours: number;
};

export type OrderStage = {
  id:
    | "new"
    | "qualified"
    | "paid"
    | "production"
    | "qa"
    | "delivery"
    | "retention";
  name: string;
  ownerDepartment: Department["id"];
  target: string;
  githubField: string;
};

export type AutomationRule = {
  trigger: string;
  automation: string;
  owner: Department["id"];
  githubAction: string;
};

export type IntakeProduct = {
  id: "export-pack" | "subscription" | "pfmea-pack" | "lean-pack";
  name: string;
  revenueType: "one-time" | "subscription" | "digital-pack";
  defaultDepartment: Department["id"];
  fulfillmentPath: string;
  price: string;
};

export type OrderStatus = "open" | "completed";

export type OrderRecord = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productId: IntakeProduct["id"];
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  currentStage: OrderStage["id"];
  ownerDepartment: Department["id"];
  githubTitle: string;
  githubLabels: string[];
  status: OrderStatus;
  completedAt?: string;
  lastAction: string;
};

export type OrderEvent = {
  orderId: string;
  fromStage: OrderStage["id"] | null;
  toStage: OrderStage["id"];
  action:
    | "created"
    | "advanced"
    | "completed"
    | "reopened"
    | "moved"
    | "automated";
  actor: string;
  occurredAt: string;
  notes: string;
};

export type AutomationPlanStep = {
  stageId: OrderStage["id"];
  note: string;
};

export const departments: Department[] = [
  {
    id: "growth",
    name: "Growth",
    lead: "Founder / Growth Operator",
    mission: "Own acquisition, landing pages, Product Hunt, and content loops.",
    responsibilities: [
      "Manage SEO pages, launch copy, and paid or organic traffic tests.",
      "Qualify new demand and turn user intent into product priorities.",
      "Prepare launch campaigns, offer bundles, and referral pushes.",
    ],
    githubLabels: ["dept:growth", "funnel", "content"],
    sla: "Review inbound demand and conversion anomalies within 24 hours.",
    slaHours: 24,
  },
  {
    id: "product",
    name: "Product",
    lead: "Founder / Product Lead",
    mission: "Translate user demand into roadmap, pricing, and workflows.",
    responsibilities: [
      "Define SKU scope, product packaging, and roadmap tradeoffs.",
      "Keep operational definitions for order stages and service promises.",
      "Approve product changes before engineering execution.",
    ],
    githubLabels: ["dept:product", "roadmap", "pricing"],
    sla: "Triage new product requests and scope changes within 48 hours.",
    slaHours: 48,
  },
  {
    id: "engineering",
    name: "Engineering",
    lead: "Codex + Founder",
    mission: "Build and automate the web product, data flow, and fulfillment paths.",
    responsibilities: [
      "Ship product features, automation routes, and checkout integrations.",
      "Maintain preview engine, cloud storage, and ops dashboard.",
      "Own technical incidents, release QA, and deployment readiness.",
    ],
    githubLabels: ["dept:engineering", "automation", "infra"],
    sla: "Acknowledge production incidents within 4 hours.",
    slaHours: 4,
  },
  {
    id: "customer-success",
    name: "Customer Success",
    lead: "Part-time Support / Ops",
    mission: "Keep delivery, support, and retention smooth from payment to reuse.",
    responsibilities: [
      "Handle order exceptions, refunds, and export delivery quality.",
      "Close feedback loops after delivery and collect retention signals.",
      "Run manual follow-up when automation flags a risky order.",
    ],
    githubLabels: ["dept:success", "delivery", "support"],
    sla: "Respond to paid-user issues within 12 hours.",
    slaHours: 12,
  },
  {
    id: "finance",
    name: "Finance & Admin",
    lead: "Founder / Admin",
    mission: "Own billing integrity, revenue logs, and payout reconciliation.",
    responsibilities: [
      "Reconcile Lemon Squeezy payouts and refund records.",
      "Track monthly revenue against the RMB 200k annual goal.",
      "Keep downloadable side-product invoices and entitlement logs clean.",
    ],
    githubLabels: ["dept:finance", "billing", "reporting"],
    sla: "Review payout mismatches and refund edge cases within 24 hours.",
    slaHours: 24,
  },
];

export const orderStages: OrderStage[] = [
  {
    id: "new",
    name: "New intake",
    ownerDepartment: "growth",
    target: "Inbound order captured with product, channel, and payment intent.",
    githubField: "Intake",
  },
  {
    id: "qualified",
    name: "Qualified",
    ownerDepartment: "product",
    target: "Offer and fulfillment path confirmed. Exceptions identified.",
    githubField: "Qualified",
  },
  {
    id: "paid",
    name: "Paid",
    ownerDepartment: "finance",
    target: "Payment confirmed and order ready for automated work.",
    githubField: "Paid",
  },
  {
    id: "production",
    name: "Production",
    ownerDepartment: "engineering",
    target: "Photo export or pack entitlement prepared.",
    githubField: "Production",
  },
  {
    id: "qa",
    name: "QA",
    ownerDepartment: "customer-success",
    target: "Delivery reviewed, support risk checked, and edge cases resolved.",
    githubField: "QA",
  },
  {
    id: "delivery",
    name: "Delivered",
    ownerDepartment: "customer-success",
    target: "Customer received final output and support link.",
    githubField: "Delivered",
  },
  {
    id: "retention",
    name: "Retention loop",
    ownerDepartment: "growth",
    target: "Upsell, repeat use, or referral follow-up scheduled.",
    githubField: "Retention",
  },
];

export const automationRules: AutomationRule[] = [
  {
    trigger: "New order intake saved",
    automation:
      "Generate normalized order record, department owner, due dates, and GitHub issue payload.",
    owner: "engineering",
    githubAction: "order-intake-sync.yml",
  },
  {
    trigger: "Payment confirmed",
    automation:
      "Move GitHub Project item to Paid, stamp payout metadata, and queue fulfillment.",
    owner: "finance",
    githubAction: "order-paid-transition.yml",
  },
  {
    trigger: "Fulfillment ready",
    automation:
      "Assign QA checklist to customer success and post delivery checklist comment.",
    owner: "customer-success",
    githubAction: "delivery-qa-comment.yml",
  },
  {
    trigger: "Delivered order reaches 3 days",
    automation:
      "Open retention follow-up task and assign Growth for upsell or referral message.",
    owner: "growth",
    githubAction: "retention-followup.yml",
  },
];

export const intakeProducts: IntakeProduct[] = [
  {
    id: "export-pack",
    name: "PhotoReady Export Pack",
    revenueType: "one-time",
    defaultDepartment: "customer-success",
    fulfillmentPath: "Generate export assets, send receipt, mark delivered.",
    price: "$15",
  },
  {
    id: "subscription",
    name: "PhotoReady Unlimited",
    revenueType: "subscription",
    defaultDepartment: "customer-success",
    fulfillmentPath: "Create entitlement, send welcome flow, open retention watch.",
    price: "$10/month",
  },
  {
    id: "pfmea-pack",
    name: "PFMEA Offline Pack",
    revenueType: "digital-pack",
    defaultDepartment: "finance",
    fulfillmentPath: "Grant digital download and invoice.",
    price: "$49",
  },
  {
    id: "lean-pack",
    name: "Lean Problem Solving Kit",
    revenueType: "digital-pack",
    defaultDepartment: "finance",
    fulfillmentPath: "Grant digital download and invoice.",
    price: "$29",
  },
];

export const sampleOrders = [
  {
    id: "ord_240724_001",
    customer: "Ana Martinez",
    product: "PhotoReady Export Pack",
    channel: "Product Hunt waitlist",
    stage: "production",
    ownerDepartment: "engineering",
    nextAction: "Run enhanced cleanup and printable sheet export.",
    dueAt: "2026-07-24 18:00",
    value: "$15",
  },
  {
    id: "ord_240724_002",
    customer: "Kaito Sato",
    product: "PhotoReady Unlimited",
    channel: "SEO landing page",
    stage: "retention",
    ownerDepartment: "growth",
    nextAction: "Send 3-day repeat-use follow-up and referral prompt.",
    dueAt: "2026-07-27 10:00",
    value: "$10/month",
  },
  {
    id: "ord_240724_003",
    customer: "Maria Keller",
    product: "PFMEA Offline Pack",
    channel: "Direct digital pack storefront",
    stage: "delivery",
    ownerDepartment: "customer-success",
    nextAction: "Check download access and close the entitlement task.",
    dueAt: "2026-07-24 20:00",
    value: "$49",
  },
];

export function getDepartment(departmentId: Department["id"]) {
  const department = departments.find((item) => item.id === departmentId);
  if (!department) {
    throw new Error(`Unknown department: ${departmentId}`);
  }
  return department;
}

export function getProduct(productId: IntakeProduct["id"]) {
  const product = intakeProducts.find((item) => item.id === productId);
  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }
  return product;
}

export function getStage(stageId: OrderStage["id"]) {
  const stage = orderStages.find((item) => item.id === stageId);
  if (!stage) {
    throw new Error(`Unknown stage: ${stageId}`);
  }
  return stage;
}

export function getStageIndex(stageId: OrderStage["id"]) {
  return orderStages.findIndex((item) => item.id === stageId);
}

export function getNextStage(stageId: OrderStage["id"]) {
  const currentIndex = getStageIndex(stageId);
  if (currentIndex < 0) {
    throw new Error(`Unknown stage: ${stageId}`);
  }
  return orderStages[currentIndex + 1] ?? null;
}

export function getPreviousStage(stageId: OrderStage["id"]) {
  const currentIndex = getStageIndex(stageId);
  if (currentIndex < 0) {
    throw new Error(`Unknown stage: ${stageId}`);
  }
  return orderStages[currentIndex - 1] ?? null;
}

export function getOwnerDepartmentForStage(stageId: OrderStage["id"]) {
  return getStage(stageId).ownerDepartment;
}

export function isFinalStage(stageId: OrderStage["id"]) {
  return stageId === orderStages.at(-1)?.id;
}

export function describeNextAction(productId: IntakeProduct["id"], stageId: OrderStage["id"]) {
  const product = getProduct(productId);

  switch (stageId) {
    case "new":
      return "Review demand source, confirm user intent, and check for edge-case needs.";
    case "qualified":
      return "Confirm package scope, exceptions, and pricing before payment.";
    case "paid":
      return "Verify payment and create the exact fulfillment queue entry.";
    case "production":
      return product.id === "export-pack"
        ? "Generate export variants and package the final files."
        : product.id === "subscription"
          ? "Create the account entitlement and onboarding bundle."
          : "Prepare the digital download and invoice handoff.";
    case "qa":
      return "Run the delivery checklist, confirm files, and review support risk.";
    case "delivery":
      return "Send the final asset or entitlement and confirm the receipt path.";
    case "retention":
      return "Schedule follow-up, referral ask, or repeat-use prompt, then close the loop.";
  }
}

export function summarizeOrder(record: OrderRecord) {
  const product = getProduct(record.productId);
  const stage = getStage(record.currentStage);
  const owner = getDepartment(record.ownerDepartment);
  const nextStage = getNextStage(record.currentStage);

  return {
    productName: product.name,
    productValue: product.price,
    currentStageName: stage.name,
    ownerDepartmentName: owner.name,
    ownerLead: owner.lead,
    nextAction: describeNextAction(record.productId, record.currentStage),
    nextStageName: nextStage?.name ?? null,
    canAdvance: record.status === "open",
  };
}

export function getAutomationPlan(
  productId: IntakeProduct["id"],
  currentStage: OrderStage["id"],
) {
  const sequences: Record<IntakeProduct["id"], OrderStage["id"][]> = {
    "export-pack": ["qualified", "paid", "production", "qa", "delivery", "retention"],
    subscription: ["qualified", "paid", "production", "delivery", "retention"],
    "pfmea-pack": ["qualified", "paid", "production", "delivery", "retention"],
    "lean-pack": ["qualified", "paid", "production", "delivery", "retention"],
  };

  const notesByStage: Record<OrderStage["id"], string> = {
    new: "Inbound intent captured and ready for qualification.",
    qualified: "Offer confirmed and exceptions checked.",
    paid: "Payment confirmed and fulfillment unlocked.",
    production: "Entitlement or export assets generated.",
    qa: "QA checklist cleared before delivery.",
    delivery: "Customer delivery sent and receipt path confirmed.",
    retention: "Retention follow-up or upsell task scheduled.",
  };

  const currentIndex = getStageIndex(currentStage);
  const targetStages = sequences[productId].filter(
    (stageId) => getStageIndex(stageId) > currentIndex,
  );

  return targetStages.map((stageId) => ({
    stageId,
    note: notesByStage[stageId],
  })) satisfies AutomationPlanStep[];
}

export function buildGithubIssueBody(input: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productId: IntakeProduct["id"];
  source: string;
  notes?: string;
}) {
  const product = getProduct(input.productId);
  const stage = orderStages[0];
  const department = getDepartment(stage.ownerDepartment);

  return `## Order Intake

- Order ID: ${input.orderId}
- Customer: ${input.customerName}
- Email: ${input.customerEmail}
- Product: ${product.name}
- Revenue Type: ${product.revenueType}
- Value: ${product.price}
- Channel: ${input.source}

## Department Owner

- Current owner: ${department.name}
- Team lead: ${department.lead}
- GitHub labels: ${department.githubLabels.join(", ")}

## Fulfillment Path

- Current stage: ${stage.name}
- Next target: ${stage.target}
- Fulfillment rule: ${product.fulfillmentPath}

## Notes

${input.notes?.trim() || "No extra notes"}
`;
}

export function buildGithubIssueBodyFromOrder(record: OrderRecord) {
  const product = getProduct(record.productId);
  const department = getDepartment(record.ownerDepartment);
  const stage = getStage(record.currentStage);

  return `## Order Intake

- Order ID: ${record.orderId}
- Customer: ${record.customerName}
- Email: ${record.customerEmail}
- Product: ${product.name}
- Revenue Type: ${product.revenueType}
- Value: ${product.price}
- Channel: ${record.source}
- Status: ${record.status}

## Department Owner

- Current owner: ${department.name}
- Team lead: ${department.lead}
- GitHub labels: ${record.githubLabels.join(", ")}

## Fulfillment Path

- Current stage: ${stage.name}
- Next target: ${stage.target}
- Fulfillment rule: ${product.fulfillmentPath}
- Last action: ${record.lastAction}

## Notes

${record.notes.trim() || "No extra notes"}
`;
}
