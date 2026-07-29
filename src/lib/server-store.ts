import { mkdir, appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  getOwnerDepartmentForStage,
  type OrderEvent,
  type OrderRecord,
} from "@/lib/ops-data";

function getDataDir() {
  const configured = process.env.DATA_DIR?.trim();
  return configured ? path.resolve(configured) : path.join(process.cwd(), "data");
}

export async function appendJsonLine(fileName: string, payload: unknown) {
  const dir = getDataDir();
  await mkdir(dir, { recursive: true });
  const record = `${JSON.stringify(payload)}\n`;
  await appendFile(path.join(dir, fileName), record, "utf8");
}

export async function readJsonLines<T>(fileName: string) {
  try {
    const content = await readFile(path.join(getDataDir(), fileName), "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function listOrders() {
  const records = await readJsonLines<OrderRecord>("orders.jsonl");
  const latestByOrderId = new Map<string, OrderRecord>();

  for (const record of records) {
    const normalized: OrderRecord = {
      ...record,
      updatedAt: record.updatedAt || record.createdAt,
      notes: record.notes || "",
      ownerDepartment: getOwnerDepartmentForStage(record.currentStage),
      status: record.status || "open",
      lastAction: record.lastAction || "Imported from legacy order log",
    };

    latestByOrderId.set(record.orderId, normalized);
  }

  return [...latestByOrderId.values()].toSorted((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export async function getOrder(orderId: string) {
  const orders = await listOrders();
  const order = orders.find((item) => item.orderId === orderId);

  if (!order) {
    throw new Error(`Order ${orderId} was not found.`);
  }

  return order;
}

export async function appendOrderSnapshot(order: OrderRecord) {
  await appendJsonLine("orders.jsonl", order);
}

export async function appendOrderEvent(event: OrderEvent) {
  await appendJsonLine("order-events.jsonl", event);
}

export async function listOrderEvents(orderId?: string) {
  const events = await readJsonLines<OrderEvent>("order-events.jsonl");
  const filtered = orderId
    ? events.filter((event) => event.orderId === orderId)
    : events;

  return filtered.toSorted((left, right) =>
    right.occurredAt.localeCompare(left.occurredAt),
  );
}
