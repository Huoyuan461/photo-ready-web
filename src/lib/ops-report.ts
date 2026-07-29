import { departments, getAutomationPlan, summarizeOrder, type OrderEvent } from "@/lib/ops-data";
import { listOrderEvents, listOrders } from "@/lib/server-store";

export type OpsDepartmentLoad = {
  departmentId: string;
  departmentName: string;
  lead: string;
  slaHours: number;
  openOrders: number;
  completedOrders: number;
  breachedOrders: number;
  atRiskOrders: number;
  nextActions: Array<{
    orderId: string;
    productName: string;
    stageName: string;
    nextAction: string;
    ageHours: number;
    slaState: "healthy" | "at-risk" | "breached";
  }>;
};

type SlaState = "healthy" | "at-risk" | "breached";

export type OpsStalledOrder = {
  orderId: string;
  productName: string;
  ownerDepartmentName: string;
  stageName: string;
  ageHours: number;
  slaHours: number;
  slaState: "at-risk" | "breached";
  nextAction: string;
};

export type OpsAutomationSummary = {
  totalOrders: number;
  completedOrders: number;
  automatedOrders: number;
  manualTouches: number;
  breachedOrders: number;
  atRiskOrders: number;
};

export type OpsDashboardData = {
  departmentLoad: OpsDepartmentLoad[];
  stalledOrders: OpsStalledOrder[];
  automationSummary: OpsAutomationSummary;
};

export async function buildOpsDashboardData() {
  const orders = await listOrders();
  const events = await listOrderEvents();
  const eventsByOrder = new Map<string, OrderEvent[]>();
  const now = Date.now();

  for (const event of events) {
    const current = eventsByOrder.get(event.orderId) || [];
    if (current.length < 5) {
      current.push(event);
      eventsByOrder.set(event.orderId, current);
    }
  }

  const enrichedOrders = orders.map((order) => ({
    ...order,
    summary: summarizeOrder(order),
    automationPlan: getAutomationPlan(order.productId, order.currentStage),
    recentEvents: eventsByOrder.get(order.orderId) || [],
    ageHours: Math.max(
      0,
      Math.round((now - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60)),
    ),
  }));

  const departmentLoad = departments.map((department) => {
    const ownedOrders = enrichedOrders.filter(
      (order) => order.ownerDepartment === department.id && order.status === "open",
    );
    const breachedOrders = ownedOrders.filter(
      (order) => order.ageHours > department.slaHours,
    );
    const atRiskOrders = ownedOrders.filter(
      (order) =>
        order.ageHours <= department.slaHours &&
        order.ageHours >= Math.max(1, Math.floor(department.slaHours * 0.75)),
    );

    return {
      departmentId: department.id,
      departmentName: department.name,
      lead: department.lead,
      slaHours: department.slaHours,
      openOrders: ownedOrders.length,
      completedOrders: enrichedOrders.filter(
        (order) => order.ownerDepartment === department.id && order.status === "completed",
      ).length,
      breachedOrders: breachedOrders.length,
      atRiskOrders: atRiskOrders.length,
      nextActions: ownedOrders.slice(0, 3).map((order) => ({
        orderId: order.orderId,
        productName: order.summary.productName,
        stageName: order.summary.currentStageName,
        nextAction: order.summary.nextAction,
        ageHours: order.ageHours,
        slaState: getSlaState(order.ageHours, department.slaHours),
      })),
    };
  });

  const stalledOrders = enrichedOrders
    .filter((order) => order.status === "open")
    .map((order) => {
      const department = departments.find(
        (departmentItem) => departmentItem.id === order.ownerDepartment,
      )!;

      return {
        ...order,
        slaHours: department.slaHours,
        slaState: getSlaState(order.ageHours, department.slaHours),
      };
    })
    .filter(
      (
        order,
      ): order is typeof order & {
        slaState: "at-risk" | "breached";
      } => order.slaState !== "healthy",
    )
    .toSorted((left, right) => {
      if (left.slaState === right.slaState) {
        return right.ageHours - left.ageHours;
      }
      return left.slaState === "breached" ? -1 : 1;
    })
    .slice(0, 5)
    .map((order) => ({
      orderId: order.orderId,
      productName: order.summary.productName,
      ownerDepartmentName: order.summary.ownerDepartmentName,
      stageName: order.summary.currentStageName,
      ageHours: order.ageHours,
      slaHours: order.slaHours,
      slaState: order.slaState,
      nextAction: order.summary.nextAction,
    }));

  const automationSummary = {
    totalOrders: enrichedOrders.length,
    completedOrders: enrichedOrders.filter((order) => order.status === "completed").length,
    automatedOrders: events
      .filter((event) => event.action === "automated")
      .reduce((accumulator, event) => accumulator.add(event.orderId), new Set<string>())
      .size,
    manualTouches: events.filter((event) =>
      ["advanced", "moved", "reopened", "completed"].includes(event.action),
    ).length,
    breachedOrders: departmentLoad.reduce(
      (total, department) => total + department.breachedOrders,
      0,
    ),
    atRiskOrders: departmentLoad.reduce(
      (total, department) => total + department.atRiskOrders,
      0,
    ),
  };

  return {
    orders: enrichedOrders,
    dashboard: {
      departmentLoad,
      stalledOrders,
      automationSummary,
    } satisfies OpsDashboardData,
  };
}

function getSlaState(ageHours: number, slaHours: number): SlaState {
  const atRiskThreshold = Math.max(1, Math.floor(slaHours * 0.75));

  if (ageHours > slaHours) {
    return "breached";
  }

  if (ageHours >= atRiskThreshold) {
    return "at-risk";
  }

  return "healthy";
}

export async function buildOpsDailyReportMarkdown() {
  const { dashboard, orders } = await buildOpsDashboardData();
  const openOrders = orders.filter((order) => order.status === "open");
  const generatedAt = new Date().toISOString();

  return [
    "# Daily Ops Report",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Summary",
    "",
    `- Total orders: ${dashboard.automationSummary.totalOrders}`,
    `- Open orders: ${openOrders.length}`,
    `- Completed orders: ${dashboard.automationSummary.completedOrders}`,
    `- Automated orders: ${dashboard.automationSummary.automatedOrders}`,
    `- Manual touches: ${dashboard.automationSummary.manualTouches}`,
    `- SLA breached orders: ${dashboard.automationSummary.breachedOrders}`,
    `- SLA at-risk orders: ${dashboard.automationSummary.atRiskOrders}`,
    "",
    "## Department Load",
    "",
    ...dashboard.departmentLoad.flatMap((department) => [
      `### ${department.departmentName}`,
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
    ...(dashboard.stalledOrders.length
      ? dashboard.stalledOrders.map(
          (order) =>
            `- ${order.orderId} · ${order.productName} · ${order.ownerDepartmentName} · ${order.stageName} · waiting ${order.ageHours}h / SLA ${order.slaHours}h · ${order.slaState} · ${order.nextAction}`,
        )
      : ["- No stalled orders right now."]),
    "",
    "## Priority Actions",
    "",
    ...(openOrders.length
      ? openOrders.slice(0, 5).map(
          (order) =>
            `- ${order.orderId} · ${order.summary.ownerDepartmentName} · ${order.summary.currentStageName} · ${order.summary.nextAction}`,
        )
      : ["- No open orders in the queue."]),
  ].join("\n");
}
