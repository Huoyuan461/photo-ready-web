import {
  buildGithubIssueBody,
  getDepartment,
  getOwnerDepartmentForStage,
  getProduct,
  getStage,
  summarizeOrder,
  type OrderRecord,
} from "@/lib/ops-data";
import { autoSyncGithubOrder } from "@/lib/github-sync";
import { buildOpsDashboardData } from "@/lib/ops-report";
import {
  appendJsonLine,
  appendOrderEvent,
  appendOrderSnapshot,
} from "@/lib/server-store";

function buildOrderId() {
  const now = new Date();
  const y = now.getUTCFullYear().toString().slice(-2);
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const token = Math.random().toString(36).slice(2, 6);
  return `ord_${y}${m}${d}_${token}`;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    customerName: string;
    customerEmail: string;
    productId: "export-pack" | "subscription" | "pfmea-pack" | "lean-pack";
    source: string;
    notes?: string;
  };

  const orderId = buildOrderId();
  const product = getProduct(payload.productId);
  const stage = getStage("new");
  const department = getDepartment(getOwnerDepartmentForStage(stage.id));
  const githubIssueBody = buildGithubIssueBody({
    orderId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    productId: payload.productId,
    source: payload.source,
    notes: payload.notes,
  });

  const now = new Date().toISOString();
  const record: OrderRecord = {
    orderId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    productId: payload.productId,
    source: payload.source,
    notes: payload.notes || "",
    createdAt: now,
    updatedAt: now,
    currentStage: stage.id,
    ownerDepartment: department.id,
    githubTitle: `[Order] ${product.name} · ${payload.customerName}`,
    githubLabels: [...department.githubLabels, `product:${product.id}`, "order-intake"],
    status: "open",
    lastAction: "Order created",
  };

  await appendOrderSnapshot(record);
  await appendJsonLine("github-order-issues.jsonl", {
    orderId,
    title: record.githubTitle,
    labels: record.githubLabels,
    body: githubIssueBody,
  });
  await appendOrderEvent({
    orderId,
    fromStage: null,
    toStage: stage.id,
    action: "created",
    actor: "ops-dashboard",
    occurredAt: now,
    notes: payload.notes || "Order created from automated intake.",
  });

  const summary = summarizeOrder(record);
  const githubAutoSync = await autoSyncGithubOrder(orderId);

  return Response.json({
    ok: true,
    orderId,
    ownerDepartment: department.name,
    ownerLead: department.lead,
    currentStage: stage.name,
    currentStageId: stage.id,
    githubTitle: record.githubTitle,
    githubLabels: record.githubLabels,
    githubIssueBody,
    status: record.status,
    queueSummary: summary,
    githubAutoSync,
  });
}

export async function GET() {
  const { orders, dashboard } = await buildOpsDashboardData();

  return Response.json({
    ok: true,
    orders,
    dashboard,
  });
}
