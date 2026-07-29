"use client";

import { startTransition, useEffect, useState } from "react";
import {
  automationRules,
  departments,
  intakeProducts,
  orderStages,
  sampleOrders,
  type AutomationPlanStep,
  type OrderEvent,
  type IntakeProduct,
  type OrderRecord,
  type OrderStage,
} from "@/lib/ops-data";

type OrderSummary = {
  productName: string;
  productValue: string;
  currentStageName: string;
  ownerDepartmentName: string;
  ownerLead: string;
  nextAction: string;
  nextStageName: string | null;
  canAdvance: boolean;
};

type OrderView = OrderRecord & {
  summary: OrderSummary;
  automationPlan: AutomationPlanStep[];
  recentEvents?: OrderEvent[];
};

type OrdersResponse = {
  ok: boolean;
  orders: OrderView[];
  dashboard: {
    departmentLoad: Array<{
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
    }>;
    stalledOrders: Array<{
      orderId: string;
      productName: string;
      ownerDepartmentName: string;
      stageName: string;
      ageHours: number;
      slaHours: number;
      slaState: "at-risk" | "breached";
      nextAction: string;
    }>;
    automationSummary: {
      totalOrders: number;
      completedOrders: number;
      automatedOrders: number;
      manualTouches: number;
      breachedOrders: number;
      atRiskOrders: number;
    };
  };
};

type GithubStatusResponse = {
  ok: boolean;
  status: {
    repoConfigured: boolean;
    autoSyncEnabled: boolean;
    projectConfigured: boolean;
    projectFieldCoverage: {
      stage: boolean;
      department: boolean;
      revenueType: boolean;
    };
    optionCoverage: {
      stage: string[];
      department: string[];
      revenueType: string[];
    };
    missing: string[];
  };
};

type GithubProjectSchemaResponse = {
  ok: boolean;
  schema?: {
    projectId: string;
    fields: Array<{
      id: string;
      name: string;
      type: string;
      options?: Array<{ id: string; name: string }>;
    }>;
    suggestedMappings: {
      stageFieldId?: string;
      departmentFieldId?: string;
      revenueFieldId?: string;
      stageOptions: Record<string, string>;
      departmentOptions: Record<string, string>;
      revenueOptions: Record<string, string>;
    };
  };
  error?: string;
};

type GithubBootstrapResponse = {
  ok: boolean;
  manifest: {
    labels: string[];
    projectFields: Array<{
      name: string;
      type: "single_select";
      options: string[];
    }>;
    workflows: Array<{
      file: string;
      purpose: string;
    }>;
    envKeys: string[];
    setupSteps: string[];
  };
};

type GithubBootstrapPackageResponse = {
  ok: boolean;
  package: {
    envTemplate: string;
    labelsText: string;
    projectFieldsText: string;
    workflowsText: string;
    setupChecklist: string;
  };
};

type ArtifactsResponse = {
  ok: boolean;
  generatedAt: string;
  artifacts: Array<{
    id: string;
    label: string;
    fileName: string;
    absolutePath: string;
    exists: boolean;
  }>;
  files: string[];
};

type OrderAutomationResponse = {
  ok: boolean;
  orderId: string;
  ownerDepartment: string;
  ownerLead: string;
  currentStage: string;
  currentStageId: OrderStage["id"];
  githubTitle: string;
  githubLabels: string[];
  githubIssueBody: string;
  status: OrderRecord["status"];
  queueSummary: OrderSummary;
};

type OrderMutationResponse = {
  ok: boolean;
  order?: OrderView;
  automationRun?: {
    steps: OrderEvent[];
    completedAt: string;
  };
  error?: string;
};

type GithubSyncResponse = {
  ok: boolean;
  issueUrl?: string;
  issueNumber?: number;
  created?: boolean;
  timelineCommentPosted?: boolean;
  project?: {
    enabled: boolean;
    itemId?: string;
    fieldsUpdated: string[];
  };
  error?: string;
};

const emptyOrderMessage =
  "No live orders yet. Use the intake form to create the first operational workflow.";

export function OrderAutomationBoard() {
  const [customerName, setCustomerName] = useState("Launch Customer");
  const [customerEmail, setCustomerEmail] = useState("customer@example.com");
  const [productId, setProductId] =
    useState<IntakeProduct["id"]>("export-pack");
  const [source, setSource] = useState("SEO landing page");
  const [notes, setNotes] = useState(
    "Need standard export plus receipt automation.",
  );
  const [status, setStatus] = useState<
    "idle" | "saving" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<OrderAutomationResponse | null>(null);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [ordersStatus, setOrdersStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [dashboard, setDashboard] = useState<OrdersResponse["dashboard"] | null>(null);
  const [githubStatus, setGithubStatus] = useState<GithubStatusResponse["status"] | null>(
    null,
  );
  const [githubSchema, setGithubSchema] = useState<
    GithubProjectSchemaResponse["schema"] | null
  >(null);
  const [githubSchemaError, setGithubSchemaError] = useState<string | null>(null);
  const [githubBootstrap, setGithubBootstrap] = useState<
    GithubBootstrapResponse["manifest"] | null
  >(null);
  const [githubBootstrapPackage, setGithubBootstrapPackage] = useState<
    GithubBootstrapPackageResponse["package"] | null
  >(null);
  const [artifacts, setArtifacts] = useState<ArtifactsResponse | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [githubByOrder, setGithubByOrder] = useState<Record<string, GithubSyncResponse>>(
    {},
  );
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [stageDrafts, setStageDrafts] = useState<
    Record<string, OrderStage["id"]>
  >({});

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
    setOrdersStatus("loading");

    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Orders request failed");
      }

      const payload = (await response.json()) as OrdersResponse;
      setOrders(payload.orders);
      setDashboard(payload.dashboard);
      setOrdersStatus("ready");
      setStageDrafts((current) => {
        const nextDrafts = { ...current };
        for (const order of payload.orders) {
          nextDrafts[order.orderId] = order.currentStage;
        }
        return nextDrafts;
      });

      const githubStatusResponse = await fetch("/api/github/status", {
        cache: "no-store",
      });
      if (githubStatusResponse.ok) {
        const githubStatusPayload =
          (await githubStatusResponse.json()) as GithubStatusResponse;
        setGithubStatus(githubStatusPayload.status);

        const githubBootstrapResponse = await fetch("/api/github/bootstrap", {
          cache: "no-store",
        });
        if (githubBootstrapResponse.ok) {
          const githubBootstrapPayload =
            (await githubBootstrapResponse.json()) as GithubBootstrapResponse;
          setGithubBootstrap(githubBootstrapPayload.manifest);
        }

        const githubBootstrapPackageResponse = await fetch(
          "/api/github/bootstrap-package",
          {
            cache: "no-store",
          },
        );
        if (githubBootstrapPackageResponse.ok) {
          const githubBootstrapPackagePayload =
            (await githubBootstrapPackageResponse.json()) as GithubBootstrapPackageResponse;
          setGithubBootstrapPackage(githubBootstrapPackagePayload.package);
        }

        const artifactsResponse = await fetch("/api/ops/artifacts", {
          cache: "no-store",
        });
        if (artifactsResponse.ok) {
          const artifactsPayload = (await artifactsResponse.json()) as ArtifactsResponse;
          setArtifacts(artifactsPayload);
        }

        if (
          githubStatusPayload.status.repoConfigured &&
          githubStatusPayload.status.projectConfigured
        ) {
          const githubSchemaResponse = await fetch("/api/github/project-schema", {
            cache: "no-store",
          });
          const githubSchemaPayload =
            (await githubSchemaResponse.json()) as GithubProjectSchemaResponse;

          if (githubSchemaResponse.ok && githubSchemaPayload.schema) {
            setGithubSchema(githubSchemaPayload.schema);
            setGithubSchemaError(null);
          } else {
            setGithubSchema(null);
            setGithubSchemaError(
              githubSchemaPayload.error || "Project schema lookup failed.",
            );
          }
        } else {
          setGithubSchema(null);
          setGithubSchemaError(null);
        }
      }
    } catch {
      setOrdersStatus("error");
    }
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setQueueMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName,
            customerEmail,
            productId,
            source,
            notes,
          }),
        });

        if (!response.ok) {
          throw new Error("Order automation request failed");
        }

        const payload = (await response.json()) as OrderAutomationResponse;
        setResult(payload);
        setStatus("done");
        await loadOrders();
      } catch {
        setStatus("error");
      }
    });
  }

  async function mutateOrder(
    orderId: string,
    payload: {
      action:
        | "advance"
        | "move"
        | "complete"
        | "reopen"
        | "rewind"
        | "auto-complete";
      stageId?: OrderStage["id"];
      notes?: string;
    },
  ) {
    setBusyOrderId(orderId);
    setQueueMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as OrderMutationResponse;

      if (!response.ok || !result.ok || !result.order) {
        throw new Error(result.error || "Order update failed");
      }

      const updatedOrder = result.order;

      setOrders((current) =>
        current
          .map((order) => (order.orderId === orderId ? updatedOrder : order))
          .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      );
      setStageDrafts((current) => ({
        ...current,
        [orderId]: updatedOrder.currentStage,
      }));
      setQueueMessage(
        result.automationRun
          ? `${orderId} auto-completed with ${result.automationRun.steps.length} automated transitions.`
          : `${orderId} updated to ${updatedOrder.summary.currentStageName}.`,
      );
      await loadOrders();
    } catch (error) {
      setQueueMessage(error instanceof Error ? error.message : "Order update failed.");
    } finally {
      setBusyOrderId(null);
    }
  }

  async function syncOrderToGithub(orderId: string) {
    setSyncingOrderId(orderId);
    setGithubByOrder((current) => ({
      ...current,
      [orderId]: { ok: false, error: "Syncing GitHub issue..." },
    }));

    try {
      const response = await fetch("/api/github/sync-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payload = (await response.json()) as GithubSyncResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "GitHub sync failed");
      }

      setGithubByOrder((current) => ({ ...current, [orderId]: payload }));
    } catch (error) {
      setGithubByOrder((current) => ({
        ...current,
        [orderId]: {
          ok: false,
          error: error instanceof Error ? error.message : "GitHub sync failed",
        },
      }));
    } finally {
      setSyncingOrderId(null);
    }
  }

  const openOrders = orders.filter((order) => order.status === "open");
  const completedOrders = orders.filter((order) => order.status === "completed");

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Open-source company operating system
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Departments, responsibility, and order automation in one workspace
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            This is the internal layer that turns your B2C launch into a
            company workflow. Orders are assigned by department, staged for
            GitHub Projects, and documented so an open-source team can operate
            the same model.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {departments.map((department) => (
              <article
                key={department.id}
                className="rounded-[28px] border border-line bg-paper p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-night">
                      {department.name}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-accent-strong">
                      Lead: {department.lead}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {department.id}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {department.mission}
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-night">
                  {department.responsibilities.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-3 text-sm text-muted">
                  SLA: {department.sla}
                </div>
              </article>
            ))}
          </div>
        </div>

        <form
          onSubmit={submitOrder}
          className="rounded-[34px] border border-line bg-night p-8 text-white shadow-[0_24px_80px_rgba(17,36,60,0.18)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
            Automated intake
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            Create an order and generate the GitHub-ready handoff
          </h2>

          <div className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-white/70">Customer name</span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/7 px-4 text-white outline-none transition focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-white/70">Customer email</span>
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/7 px-4 text-white outline-none transition focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-white/70">Product</span>
              <select
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value as IntakeProduct["id"])
                }
                className="h-12 rounded-2xl border border-white/10 bg-white/7 px-4 text-white outline-none transition focus:border-accent"
              >
                {intakeProducts.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    className="text-night"
                  >
                    {product.name} · {product.price}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-white/70">Source channel</span>
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/7 px-4 text-white outline-none transition focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-white/70">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-white outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "saving"}
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "saving" ? "Building workflow..." : "Create automated order"}
            </button>
            <span className="text-sm text-white/70">
              {status === "done"
                ? "Order routing generated and added to the live queue."
                : status === "error"
                  ? "The order workflow could not be generated."
                  : "Writes local records, queue state, and a GitHub issue payload."}
            </span>
          </div>

          {result ? (
            <div className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/6 p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <InfoCard label="Order ID" value={result.orderId} />
                <InfoCard label="Current stage" value={result.currentStage} />
                <InfoCard label="Department owner" value={result.ownerDepartment} />
                <InfoCard label="Lead" value={result.ownerLead} />
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[color:rgba(255,255,255,0.04)] p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                  Queue next action
                </div>
                <div className="mt-2 text-sm leading-7 text-white/82">
                  {result.queueSummary.nextAction}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[color:rgba(255,255,255,0.04)] p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                  GitHub issue title
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {result.githubTitle}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[color:rgba(255,255,255,0.04)] p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                  Labels
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.githubLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/78"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[color:rgba(255,255,255,0.04)] p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                  GitHub issue body preview
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-white/82">
                  {result.githubIssueBody}
                </pre>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Live order queue
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-night">
                Real order state, stage actions, and GitHub handoff
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-paper"
            >
              Refresh queue
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard label="Open orders" value={String(openOrders.length)} />
            <MetricCard
              label="Completed"
              value={String(completedOrders.length)}
            />
            <MetricCard
              label="Active revenue lines"
              value={String(new Set(openOrders.map((order) => order.productId)).size)}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <QueueMessage message="Export the live company snapshot from `GET /api/ops/daily-report` or run `npm run export:ops:report` for a Markdown handoff." />
            <QueueMessage message="Export the GitHub setup pack from `GET /api/github/bootstrap-bundle`, or run `npm run export:github:bootstrap` / `npm run export:handoff:bundle` for the full operating handoff bundle." />
          </div>

          {dashboard ? (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Automated orders"
                value={String(dashboard.automationSummary.automatedOrders)}
              />
              <MetricCard
                label="Manual touches"
                value={String(dashboard.automationSummary.manualTouches)}
              />
              <MetricCard
                label="Stalled queue"
                value={String(dashboard.stalledOrders.length)}
              />
              <MetricCard
                label="Total orders"
                value={String(dashboard.automationSummary.totalOrders)}
              />
              <MetricCard
                label="SLA breached"
                value={String(dashboard.automationSummary.breachedOrders)}
              />
              <MetricCard
                label="SLA at risk"
                value={String(dashboard.automationSummary.atRiskOrders)}
              />
            </div>
          ) : null}

          {queueMessage ? (
            <div className="mt-6 rounded-[22px] border border-line bg-paper px-4 py-3 text-sm text-night">
              {queueMessage}
            </div>
          ) : null}

          {githubStatus ? (
            <div className="mt-6 rounded-[24px] border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                    GitHub integration readiness
                  </div>
                  <div className="mt-2 text-lg font-semibold text-night">
                    {githubStatus.repoConfigured
                      ? "Repository sync credentials ready"
                      : "Repository sync is not fully configured"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  <span className="rounded-full bg-white px-3 py-1 text-night">
                    Auto sync: {githubStatus.autoSyncEnabled ? "on" : "off"}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-night">
                    Project: {githubStatus.projectConfigured ? "set" : "unset"}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <QueueInfo
                  label="Stage field"
                  value={githubStatus.projectFieldCoverage.stage ? "ready" : "missing"}
                />
                <QueueInfo
                  label="Department field"
                  value={
                    githubStatus.projectFieldCoverage.department ? "ready" : "missing"
                  }
                />
                <QueueInfo
                  label="Revenue field"
                  value={
                    githubStatus.projectFieldCoverage.revenueType ? "ready" : "missing"
                  }
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Missing env
                  </div>
                  <div className="mt-2 text-sm leading-7 text-night">
                    {githubStatus.missing.length
                      ? githubStatus.missing.join(", ")
                      : "No missing required GitHub env values."}
                  </div>
                </div>
                <div className="rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Missing option keys
                  </div>
                  <div className="mt-2 text-sm leading-7 text-night">
                    {renderMissingKeys(githubStatus)}
                  </div>
                </div>
              </div>
              {githubSchema ? (
                <div className="mt-4 rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Suggested Project mappings
                  </div>
                  <div className="mt-2 text-sm leading-7 text-night">
                    Stage field: {githubSchema.suggestedMappings.stageFieldId || "not matched"}
                  </div>
                  <div className="text-sm leading-7 text-night">
                    Department field: {githubSchema.suggestedMappings.departmentFieldId || "not matched"}
                  </div>
                  <div className="text-sm leading-7 text-night">
                    Revenue field: {githubSchema.suggestedMappings.revenueFieldId || "not matched"}
                  </div>
                  <div className="mt-3 text-sm text-muted">
                    Stage options mapped:{" "}
                    {Object.keys(githubSchema.suggestedMappings.stageOptions).length
                      ? Object.keys(githubSchema.suggestedMappings.stageOptions).join(", ")
                      : "none"}
                  </div>
                </div>
              ) : githubSchemaError ? (
                <div className="mt-4 rounded-[18px] border border-line bg-white px-4 py-4 text-sm text-muted">
                  {githubSchemaError}
                </div>
              ) : null}
              {githubBootstrap ? (
                <div className="mt-4 rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Bootstrap manifest
                  </div>
                  <div className="mt-3 text-sm font-semibold text-night">
                    Required labels
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {githubBootstrap.labels.slice(0, 12).map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-night"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-night">
                    Setup steps
                  </div>
                  <div className="mt-2 space-y-2">
                    {githubBootstrap.setupSteps.slice(0, 4).map((step, index) => (
                      <div
                        key={`${index}-${step}`}
                        className="rounded-[16px] border border-line bg-paper px-4 py-3 text-sm text-night"
                      >
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {githubBootstrapPackage ? (
                <div className="mt-4 rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Bootstrap package preview
                  </div>
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    <BootstrapBlock
                      title=".env template"
                      body={githubBootstrapPackage.envTemplate}
                    />
                    <BootstrapBlock
                      title="Setup checklist"
                      body={githubBootstrapPackage.setupChecklist}
                    />
                    <BootstrapBlock
                      title="Project fields"
                      body={githubBootstrapPackage.projectFieldsText}
                    />
                    <BootstrapBlock
                      title="Workflow inventory"
                      body={githubBootstrapPackage.workflowsText}
                    />
                  </div>
                </div>
              ) : null}
              {artifacts ? (
                <div className="mt-4 rounded-[18px] border border-line bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Exported artifacts
                  </div>
                  <div className="mt-3 space-y-3">
                    {artifacts.artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="rounded-[16px] border border-line bg-paper px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-night">
                            {artifact.label}
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                            {artifact.exists ? "ready" : "missing"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-muted">
                          {artifact.fileName}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {artifact.absolutePath}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-muted">
                    Run `npm run export:artifacts` to refresh all exports in one pass.
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {ordersStatus === "loading" ? (
              <QueueMessage message="Loading current order state..." />
            ) : ordersStatus === "error" ? (
              <QueueMessage message="The queue could not be loaded from local order storage." />
            ) : orders.length ? (
              orders.map((order) => {
                const isBusy = busyOrderId === order.orderId;
                const isSyncing = syncingOrderId === order.orderId;
                const githubResult = githubByOrder[order.orderId];

                return (
                  <article
                    key={order.orderId}
                    className="rounded-[24px] border border-line bg-paper p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold tracking-tight text-night">
                            {order.summary.productName}
                          </h3>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                            {order.summary.currentStageName}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted">
                          {order.customerName} · {order.customerEmail} · {order.source}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted">
                        <div>{order.orderId}</div>
                        <div className="mt-1">{order.summary.productValue}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <QueueInfo
                        label="Owner"
                        value={`${order.summary.ownerDepartmentName} · ${order.summary.ownerLead}`}
                      />
                      <QueueInfo
                        label="Last action"
                        value={order.lastAction}
                      />
                      <QueueInfo
                        label="Next action"
                        value={order.summary.nextAction}
                      />
                      <QueueInfo
                        label="Updated"
                        value={formatIso(order.updatedAt)}
                      />
                    </div>

                    <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        Automation path
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.automationPlan.length ? (
                          order.automationPlan.map((step) => (
                            <span
                              key={`${order.orderId}-${step.stageId}`}
                              className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-night"
                            >
                              {step.stageId}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted">
                            No remaining automation steps.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            Manual stage move
                          </div>
                          <p className="mt-2 text-sm leading-7 text-muted">
                            Reassign the order to a different stage if an exception or manual recovery is needed.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <select
                            value={stageDrafts[order.orderId] ?? order.currentStage}
                            onChange={(event) =>
                              setStageDrafts((current) => ({
                                ...current,
                                [order.orderId]: event.target.value as OrderStage["id"],
                              }))
                            }
                            className="h-11 rounded-full border border-line bg-white px-4 text-sm text-night outline-none"
                          >
                            {orderStages.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={
                              isBusy ||
                              (stageDrafts[order.orderId] ?? order.currentStage) ===
                                order.currentStage
                            }
                            onClick={() =>
                              void mutateOrder(order.orderId, {
                                action: "move",
                                stageId: stageDrafts[order.orderId] ?? order.currentStage,
                              })
                            }
                            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move stage
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={isBusy || order.status === "completed"}
                        onClick={() =>
                          void mutateOrder(order.orderId, { action: "advance" })
                        }
                        className="inline-flex h-11 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {order.summary.nextStageName
                          ? `Advance to ${order.summary.nextStageName}`
                          : "Close retention loop"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          void mutateOrder(order.orderId, { action: "rewind" })
                        }
                        className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Move back one stage
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || order.status === "completed"}
                        onClick={() =>
                          void mutateOrder(order.orderId, { action: "complete" })
                        }
                        className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark completed
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || order.status === "open"}
                        onClick={() =>
                          void mutateOrder(order.orderId, { action: "reopen" })
                        }
                        className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reopen
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || order.status === "completed"}
                        onClick={() =>
                          void mutateOrder(order.orderId, {
                            action: "auto-complete",
                          })
                        }
                        className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Run fulfillment automation
                      </button>
                      <button
                        type="button"
                        disabled={isSyncing}
                        onClick={() => void syncOrderToGithub(order.orderId)}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-night transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSyncing ? "Syncing..." : "Push to GitHub"}
                      </button>
                    </div>

                    {githubResult ? (
                      <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-3 text-sm text-night">
                        {githubResult.ok && githubResult.issueUrl ? (
                          <div className="space-y-2">
                            <a
                              href={githubResult.issueUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold underline underline-offset-4"
                            >
                              GitHub issue #{githubResult.issueNumber} {githubResult.created ? "created" : "updated"} for {order.orderId}
                            </a>
                            <div className="text-muted">
                              {githubResult.project?.enabled
                                ? githubResult.project.fieldsUpdated.length
                                  ? `Project fields synced: ${githubResult.project.fieldsUpdated.join(", ")}`
                                  : "Issue synced. Project is enabled but no field ids/options matched."
                                : "Issue synced. GitHub Project automation is not configured yet."}
                            </div>
                            <div className="text-muted">
                              {githubResult.timelineCommentPosted
                                ? "Recent order timeline was also posted to the GitHub issue."
                                : "Timeline comment was not posted in this sync."}
                            </div>
                          </div>
                        ) : (
                          githubResult.error
                        )}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        Recent timeline
                      </div>
                      <div className="mt-3 space-y-3">
                        {order.recentEvents?.length ? (
                          order.recentEvents.map((event) => (
                            <div
                              key={`${order.orderId}-${event.occurredAt}-${event.action}`}
                              className="rounded-[16px] border border-line bg-paper px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-night">
                                  {event.action} {"->"} {event.toStage}
                                </div>
                                <div className="text-xs text-muted">
                                  {formatIso(event.occurredAt)}
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-muted">
                                {event.notes}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted">
                            No events recorded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <QueueMessage message={emptyOrderMessage} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {dashboard ? (
            <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Department control room
              </p>
              <div className="mt-6 grid gap-4">
                {dashboard.departmentLoad.map((item) => (
                  <article
                    key={item.departmentId}
                    className="rounded-[24px] border border-line bg-paper p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-night">
                          {item.departmentName}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {item.lead}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                        <span className="rounded-full bg-white px-3 py-1">
                          Open: {item.openOrders}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Completed: {item.completedOrders}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          SLA: {item.slaHours}h
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Breached: {item.breachedOrders}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          Risk: {item.atRiskOrders}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {item.nextActions.length ? (
                        item.nextActions.map((action) => (
                          <div
                            key={`${item.departmentId}-${action.orderId}`}
                            className="rounded-[18px] border border-line bg-white px-4 py-3"
                          >
                            <div className="text-sm font-semibold text-night">
                              {action.productName} · {action.stageName}
                            </div>
                            <div className="mt-1 text-xs text-muted">
                              {action.orderId} · {action.ageHours}h · {action.slaState}
                            </div>
                            <div className="mt-2 text-sm text-muted">
                              {action.nextAction}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted">
                          No active queue items for this department.
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {dashboard ? (
            <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Stalled orders
              </p>
              <div className="mt-6 space-y-4">
                {dashboard.stalledOrders.length ? (
                  dashboard.stalledOrders.map((item) => (
                    <article
                      key={item.orderId}
                      className="rounded-[24px] border border-line bg-paper p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight text-night">
                            {item.productName}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {item.orderId} · {item.ownerDepartmentName}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                          {item.ageHours}h / {item.slaHours}h · {item.slaState}
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-night">
                        {item.stageName}
                      </div>
                      <div className="mt-2 text-sm leading-7 text-muted">
                        {item.nextAction}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-line bg-paper px-4 py-6 text-sm text-muted">
                    No stalled orders right now.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Order stages
            </p>
            <div className="mt-6 space-y-4">
              {orderStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="rounded-[24px] border border-line bg-paper p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-semibold text-night">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-night">
                          {stage.name}
                        </h3>
                        <p className="text-sm text-muted">
                          Owner:{" "}
                          {
                            departments.find(
                              (department) =>
                                department.id === stage.ownerDepartment,
                            )?.name
                          }
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                      GitHub field: {stage.githubField}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-night">
                    {stage.target}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Automation rules
            </p>
            <div className="mt-6 space-y-4">
              {automationRules.map((rule) => (
                <article
                  key={rule.trigger}
                  className="rounded-[24px] border border-line bg-paper p-5"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-night">
                    {rule.trigger}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {rule.automation}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                    <span className="rounded-full bg-white px-3 py-1">
                      Owner:{" "}
                      {
                        departments.find(
                          (department) => department.id === rule.owner,
                        )?.name
                      }
                    </span>
                    <span className="rounded-full bg-white px-3 py-1">
                      Workflow: {rule.githubAction}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Example queue architecture
            </p>
            <div className="mt-6 space-y-4">
              {sampleOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[24px] border border-line bg-paper p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-night">
                        {order.product}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {order.customer} · {order.channel}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-strong">
                      {order.stage}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-night">
                    {order.nextAction}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                    <span>Order ID: {order.id}</span>
                    <span>Owner: {order.ownerDepartment}</span>
                    <span>Due: {order.dueAt}</span>
                    <span>Value: {order.value}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[color:rgba(255,255,255,0.04)] px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-line bg-paper px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-night">
        {value}
      </div>
    </div>
  );
}

function QueueInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-line bg-white px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className="mt-2 text-sm leading-7 text-night">
        {value}
      </div>
    </div>
  );
}

function QueueMessage({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-line bg-paper px-4 py-6 text-sm text-muted">
      {message}
    </div>
  );
}

function BootstrapBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-line bg-paper px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-night">
        {body}
      </pre>
    </div>
  );
}

function formatIso(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US");
}

function renderMissingKeys(status: GithubStatusResponse["status"]) {
  const chunks = [
    status.optionCoverage.stage.length
      ? `stage: ${status.optionCoverage.stage.join(", ")}`
      : "",
    status.optionCoverage.department.length
      ? `department: ${status.optionCoverage.department.join(", ")}`
      : "",
    status.optionCoverage.revenueType.length
      ? `revenue: ${status.optionCoverage.revenueType.join(", ")}`
      : "",
  ].filter(Boolean);

  return chunks.length ? chunks.join(" | ") : "All tracked option keys are mapped.";
}
