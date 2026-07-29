import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.join(process.cwd(), "data");
const outputDir = path.join(dataDir, "exports");
const outputFile = path.join(outputDir, "daily-ops-report.md");
const departments = [
  { id: "growth", name: "Growth", lead: "Founder / Growth Operator", slaHours: 24 },
  { id: "product", name: "Product", lead: "Founder / Product Lead", slaHours: 48 },
  { id: "engineering", name: "Engineering", lead: "Codex + Founder", slaHours: 4 },
  { id: "customer-success", name: "Customer Success", lead: "Part-time Support / Ops", slaHours: 12 },
  { id: "finance", name: "Finance & Admin", lead: "Founder / Admin", slaHours: 24 },
];

const orders = await readJsonLines("orders.jsonl");
const events = await readJsonLines("order-events.jsonl");
const latestByOrder = new Map();

for (const order of orders) {
  latestByOrder.set(order.orderId, order);
}

const normalizedOrders = [...latestByOrder.values()].sort((left, right) =>
  (right.updatedAt || right.createdAt).localeCompare(left.updatedAt || left.createdAt),
);
const now = new Date();

const enriched = normalizedOrders.map((order) => {
  const summary = summarizeOrder(order);
  return {
    ...order,
    summary,
    ageHours: Math.round(
      (now.getTime() - new Date(order.updatedAt || order.createdAt).getTime()) /
        (1000 * 60 * 60),
    ),
  };
});

const departmentLoad = departments.map((department) => {
  const openOrders = enriched.filter(
    (order) => order.ownerDepartment === department.id && order.status === "open",
  );
  const breachedOrders = openOrders.filter((order) => order.ageHours > department.slaHours);
  const atRiskOrders = openOrders.filter(
    (order) =>
      order.ageHours <= department.slaHours &&
      order.ageHours >= Math.max(1, Math.floor(department.slaHours * 0.75)),
  );

  return {
    name: department.name,
    lead: department.lead,
    slaHours: department.slaHours,
    openOrders: openOrders.length,
    completedOrders: enriched.filter(
      (order) => order.ownerDepartment === department.id && order.status === "completed",
    ).length,
    breachedOrders: breachedOrders.length,
    atRiskOrders: atRiskOrders.length,
    nextActions: openOrders.slice(0, 3).map((order) => ({
      orderId: order.orderId,
      stageName: order.summary.currentStageName,
      nextAction: order.summary.nextAction,
      productName: order.summary.productName,
      ageHours: order.ageHours,
      slaState:
        order.ageHours > department.slaHours
          ? "breached"
          : order.ageHours >= Math.max(1, Math.floor(department.slaHours * 0.75))
            ? "at-risk"
            : "healthy",
    })),
  };
});

const automatedOrders = new Set(
  events.filter((event) => event.action === "automated").map((event) => event.orderId),
).size;
const manualTouches = events.filter((event) =>
  ["advanced", "moved", "reopened", "completed"].includes(event.action),
).length;
const breachedOrders = departmentLoad.reduce(
  (total, department) => total + department.breachedOrders,
  0,
);
const atRiskOrders = departmentLoad.reduce(
  (total, department) => total + department.atRiskOrders,
  0,
);
const stalledOrders = enriched
  .filter((order) => order.status === "open")
  .map((order) => {
    const department = departments.find((item) => item.id === order.ownerDepartment);
    const slaHours = department?.slaHours || 24;
    const atRiskThreshold = Math.max(1, Math.floor(slaHours * 0.75));

    return {
      ...order,
      slaHours,
      slaState:
        order.ageHours > slaHours
          ? "breached"
          : order.ageHours >= atRiskThreshold
            ? "at-risk"
            : "healthy",
    };
  })
  .filter((order) => order.slaState !== "healthy")
  .slice(0, 5);

const report = [
  "# Daily Ops Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Total orders: ${enriched.length}`,
  `- Open orders: ${enriched.filter((order) => order.status === "open").length}`,
  `- Completed orders: ${enriched.filter((order) => order.status === "completed").length}`,
  `- Automated orders: ${automatedOrders}`,
  `- Manual touches: ${manualTouches}`,
  `- SLA breached orders: ${breachedOrders}`,
  `- SLA at-risk orders: ${atRiskOrders}`,
  "",
  "## Department Load",
  "",
  ...departmentLoad.flatMap((department) => [
    `### ${department.name}`,
    `- Lead: ${department.lead}`,
    `- SLA target: ${department.slaHours}h`,
    `- Open orders: ${department.openOrders}`,
    `- Completed orders: ${department.completedOrders}`,
    `- Breached orders: ${department.breachedOrders}`,
    `- At-risk orders: ${department.atRiskOrders}`,
    ...(department.nextActions.length
      ? department.nextActions.map(
          (action) =>
            `- ${action.orderId} · ${action.productName} · ${action.stageName} · ${action.nextAction} · ${action.ageHours}h · ${action.slaState}`,
        )
      : ["- No active queue items."]),
    "",
  ]),
  "## Stalled Orders",
  "",
  ...(stalledOrders.length
    ? stalledOrders.map(
        (order) =>
          `- ${order.orderId} · ${order.summary.productName} · ${order.summary.ownerDepartmentName} · ${order.summary.currentStageName} · waiting ${order.ageHours}h / SLA ${order.slaHours}h · ${order.slaState} · ${order.summary.nextAction}`,
      )
    : ["- No stalled orders right now."]),
].join("\n");

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, report, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      output: outputFile,
    },
    null,
    2,
  ),
);

async function readJsonLines(fileName) {
  try {
    const content = await readFile(path.join(dataDir, fileName), "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function summarizeOrder(order) {
  const products = {
    "export-pack": {
      productName: "PhotoReady Export Pack",
      currentStageName: stageName(order.currentStage),
      ownerDepartmentName: departmentName(order.ownerDepartment),
      nextAction: nextAction(order.productId, order.currentStage),
    },
    subscription: {
      productName: "PhotoReady Unlimited",
      currentStageName: stageName(order.currentStage),
      ownerDepartmentName: departmentName(order.ownerDepartment),
      nextAction: nextAction(order.productId, order.currentStage),
    },
    "pfmea-pack": {
      productName: "PFMEA Offline Pack",
      currentStageName: stageName(order.currentStage),
      ownerDepartmentName: departmentName(order.ownerDepartment),
      nextAction: nextAction(order.productId, order.currentStage),
    },
    "lean-pack": {
      productName: "Lean Problem Solving Kit",
      currentStageName: stageName(order.currentStage),
      ownerDepartmentName: departmentName(order.ownerDepartment),
      nextAction: nextAction(order.productId, order.currentStage),
    },
  };

  return products[order.productId];
}

function stageName(stageId) {
  return {
    new: "New intake",
    qualified: "Qualified",
    paid: "Paid",
    production: "Production",
    qa: "QA",
    delivery: "Delivered",
    retention: "Retention loop",
  }[stageId];
}

function departmentName(departmentId) {
  return {
    growth: "Growth",
    product: "Product",
    engineering: "Engineering",
    "customer-success": "Customer Success",
    finance: "Finance & Admin",
  }[departmentId];
}

function nextAction(productId, stageId) {
  if (stageId === "new") {
    return "Review demand source, confirm user intent, and check for edge-case needs.";
  }
  if (stageId === "qualified") {
    return "Confirm package scope, exceptions, and pricing before payment.";
  }
  if (stageId === "paid") {
    return "Verify payment and create the exact fulfillment queue entry.";
  }
  if (stageId === "production") {
    return productId === "export-pack"
      ? "Generate export variants and package the final files."
      : productId === "subscription"
        ? "Create the account entitlement and onboarding bundle."
        : "Prepare the digital download and invoice handoff.";
  }
  if (stageId === "qa") {
    return "Run the delivery checklist, confirm files, and review support risk.";
  }
  if (stageId === "delivery") {
    return "Send the final asset or entitlement and confirm the receipt path.";
  }
  return "Schedule follow-up, referral ask, or repeat-use prompt, then close the loop.";
}
