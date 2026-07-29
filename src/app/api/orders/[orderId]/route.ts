import {
  getAutomationPlan,
  getDepartment,
  getNextStage,
  getOwnerDepartmentForStage,
  getPreviousStage,
  getStage,
  summarizeOrder,
  type OrderEvent,
  type OrderRecord,
  type OrderStage,
} from "@/lib/ops-data";
import { autoSyncGithubOrder } from "@/lib/github-sync";
import {
  appendOrderEvent,
  appendOrderSnapshot,
  getOrder,
  listOrderEvents,
} from "@/lib/server-store";

type OrderMutationPayload = {
  action?:
    | "advance"
    | "move"
    | "complete"
    | "reopen"
    | "rewind"
    | "auto-complete";
  stageId?: OrderStage["id"];
  notes?: string;
  actor?: string;
};

function buildResponseOrder(order: OrderRecord) {
  return {
    ...order,
    summary: summarizeOrder(order),
    automationPlan: getAutomationPlan(order.productId, order.currentStage),
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as OrderMutationPayload;
    const current = await getOrder(orderId);
    const actor = payload.actor?.trim() || "ops-dashboard";
    const note = payload.notes?.trim() || "";
    const now = new Date().toISOString();

    if (payload.action === "auto-complete") {
      const plan = getAutomationPlan(current.productId, current.currentStage);
      if (!plan.length) {
        throw new Error("This order is already at the end of its automation path.");
      }

      let snapshot: OrderRecord = current;
      const automationEvents: OrderEvent[] = [];

      for (const step of plan) {
        const ownerDepartmentId = getOwnerDepartmentForStage(step.stageId);
        const ownerDepartment = getDepartment(ownerDepartmentId);
        const stepOccurredAt = new Date().toISOString();

        snapshot = {
          ...snapshot,
          currentStage: step.stageId,
          ownerDepartment: ownerDepartmentId,
          githubLabels: [
            ...ownerDepartment.githubLabels,
            `product:${snapshot.productId}`,
            "order-intake",
            `stage:${step.stageId}`,
          ],
          updatedAt: stepOccurredAt,
          lastAction: `Automation moved order to ${getStage(step.stageId).name}`,
        };

        await appendOrderSnapshot(snapshot);

        const event: OrderEvent = {
          orderId,
          fromStage: automationEvents.at(-1)?.toStage || current.currentStage,
          toStage: step.stageId,
          action: "automated",
          actor,
          occurredAt: stepOccurredAt,
          notes: `${step.note}${note ? ` ${note}` : ""}`,
        };
        automationEvents.push(event);
        await appendOrderEvent(event);
      }

      const completedAt = new Date().toISOString();
      const completedSnapshot: OrderRecord = {
        ...snapshot,
        status: "completed",
        completedAt,
        updatedAt: completedAt,
        lastAction: "Automation completed the order lifecycle",
      };
      await appendOrderSnapshot(completedSnapshot);
      await appendOrderEvent({
        orderId,
        fromStage: snapshot.currentStage,
        toStage: snapshot.currentStage,
        action: "completed",
        actor,
        occurredAt: completedAt,
        notes: note || "Automation completed the order lifecycle.",
      });

      const githubAutoSync = await autoSyncGithubOrder(orderId);

      return Response.json({
        ok: true,
        order: buildResponseOrder(completedSnapshot),
        automationRun: {
          steps: automationEvents,
          completedAt,
        },
        githubAutoSync,
      });
    }

    let nextStageId = current.currentStage;
    let action: NonNullable<OrderMutationPayload["action"]> = payload.action || "advance";
    let eventAction: OrderEvent["action"] = "advanced";
    let status = current.status;
    let completedAt = current.completedAt;
    let lastAction = current.lastAction;

    if (action === "advance") {
      const nextStage = getNextStage(current.currentStage);
      if (nextStage) {
        nextStageId = nextStage.id;
        lastAction = `Advanced to ${nextStage.name}`;
        eventAction = "advanced";
      } else {
        status = "completed";
        completedAt = now;
        lastAction = "Completed after retention follow-up";
        action = "complete";
        eventAction = "completed";
      }
    } else if (action === "rewind") {
      const previousStage = getPreviousStage(current.currentStage);
      if (!previousStage) {
        throw new Error("This order is already at the first stage.");
      }
      nextStageId = previousStage.id;
      status = "open";
      completedAt = undefined;
      lastAction = `Moved back to ${previousStage.name}`;
      eventAction = "moved";
    } else if (action === "move") {
      if (!payload.stageId) {
        throw new Error("A target stage is required for a manual move.");
      }
      nextStageId = getStage(payload.stageId).id;
      status = "open";
      completedAt = undefined;
      lastAction = `Moved manually to ${getStage(nextStageId).name}`;
      eventAction = "moved";
    } else if (action === "complete") {
      status = "completed";
      completedAt = now;
      lastAction = "Order marked completed";
      eventAction = "completed";
    } else if (action === "reopen") {
      status = "open";
      completedAt = undefined;
      lastAction = "Order reopened";
      eventAction = "reopened";
    }

    const ownerDepartmentId = getOwnerDepartmentForStage(nextStageId);
    const ownerDepartment = getDepartment(ownerDepartmentId);
    const nextSnapshot = {
      ...current,
      currentStage: nextStageId,
      ownerDepartment: ownerDepartmentId,
      githubLabels: [
        ...ownerDepartment.githubLabels,
        `product:${current.productId}`,
        "order-intake",
        `stage:${nextStageId}`,
      ],
      status,
      completedAt,
      updatedAt: now,
      lastAction,
    };

    await appendOrderSnapshot(nextSnapshot);
    await appendOrderEvent({
      orderId,
      fromStage: current.currentStage,
      toStage: nextStageId,
      action: eventAction,
      actor,
      occurredAt: now,
      notes: note || lastAction,
    });

    const githubAutoSync = await autoSyncGithubOrder(orderId);

    return Response.json({
      ok: true,
      order: buildResponseOrder(nextSnapshot),
      githubAutoSync,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "The order could not be updated.",
      },
      { status: 400 },
    );
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await context.params;
    const order = await getOrder(orderId);
    const events = await listOrderEvents(orderId);

    return Response.json({
      ok: true,
      order: buildResponseOrder(order),
      events,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Order lookup failed.",
      },
      { status: 404 },
    );
  }
}
