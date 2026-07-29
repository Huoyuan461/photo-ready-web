import {
  buildGithubIssueBodyFromOrder,
  departments,
  intakeProducts,
  orderStages,
  getProduct,
} from "@/lib/ops-data";
import {
  appendJsonLine,
  getOrder,
  listOrderEvents,
  readJsonLines,
} from "@/lib/server-store";

type GithubOrderIssue = {
  orderId: string;
  title: string;
  labels: string[];
  body: string;
};

type GithubOrderLink = {
  orderId: string;
  issueId: string;
  issueNumber: number;
  issueUrl: string;
  projectItemId?: string;
  syncedAt: string;
};

type GithubIssueRecord = {
  id: number;
  node_id: string;
  number: number;
  html_url: string;
  title: string;
};

type ProjectSyncResult = {
  enabled: boolean;
  itemId?: string;
  fieldsUpdated: string[];
};

export type GithubIntegrationStatus = {
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

export type GithubProjectSchema = {
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

export type GithubEnvTemplate = {
  env: Record<string, string>;
  notes: string[];
};

export type GithubBootstrapManifest = {
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

export type GithubBootstrapPackage = {
  envTemplate: string;
  labelsText: string;
  projectFieldsText: string;
  workflowsText: string;
  setupChecklist: string;
};

export function buildGithubBootstrapBundleMarkdown() {
  const status = getGithubIntegrationStatus();
  const manifest = buildGithubBootstrapManifest();
  const bootstrapPackage = buildGithubBootstrapPackage();

  return [
    "# GitHub Bootstrap Bundle",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Current Readiness",
    "",
    `- Repository configured: ${status.repoConfigured ? "yes" : "no"}`,
    `- Auto sync enabled: ${status.autoSyncEnabled ? "yes" : "no"}`,
    `- Project configured: ${status.projectConfigured ? "yes" : "no"}`,
    `- Missing env: ${status.missing.length ? status.missing.join(", ") : "none"}`,
    "",
    "## Required Labels",
    "",
    bootstrapPackage.labelsText,
    "",
    "## Project Fields",
    "",
    bootstrapPackage.projectFieldsText,
    "",
    "## Workflow Inventory",
    "",
    bootstrapPackage.workflowsText,
    "",
    "## Environment Template",
    "",
    "```dotenv",
    bootstrapPackage.envTemplate,
    "```",
    "",
    "## Setup Checklist",
    "",
    bootstrapPackage.setupChecklist,
    "",
    "## Expected Workflow Files",
    "",
    ...manifest.workflows.map(
      (workflow) => `- \`${workflow.file}\`: ${workflow.purpose}`,
    ),
  ].join("\n");
}

export type GithubOrderSyncResult = {
  orderId: string;
  issueUrl: string;
  issueNumber: number;
  issueTitle: string;
  labels: string[];
  created: boolean;
  project: ProjectSyncResult;
  timelineCommentPosted: boolean;
};

const githubApiUrl = "https://api.github.com";
const githubGraphqlUrl = "https://api.github.com/graphql";

function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();

  if (!token || !owner || !repo) {
    throw new Error(
      "Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME.",
    );
  }

  return { token, owner, repo };
}

function getProjectConfig() {
  const projectId = process.env.GITHUB_PROJECT_ID?.trim();
  const stageFieldId = process.env.GITHUB_PROJECT_STAGE_FIELD_ID?.trim();
  const departmentFieldId = process.env.GITHUB_PROJECT_DEPARTMENT_FIELD_ID?.trim();
  const revenueFieldId = process.env.GITHUB_PROJECT_REVENUE_FIELD_ID?.trim();

  if (!projectId) {
    return null;
  }

  return {
    projectId,
    stageFieldId,
    departmentFieldId,
    revenueFieldId,
    stageOptions: parseOptionMap(process.env.GITHUB_PROJECT_STAGE_OPTIONS_JSON),
    departmentOptions: parseOptionMap(
      process.env.GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON,
    ),
    revenueOptions: parseOptionMap(process.env.GITHUB_PROJECT_REVENUE_OPTIONS_JSON),
  };
}

function parseOptionMap(raw?: string) {
  if (!raw?.trim()) {
    return {} as Record<string, string>;
  }

  try {
    const value = JSON.parse(raw) as Record<string, string>;
    return value;
  } catch {
    throw new Error("GitHub project option JSON is invalid.");
  }
}

function getAutoSyncEnabled() {
  return process.env.GITHUB_AUTO_SYNC_ORDERS?.trim().toLowerCase() === "true";
}

export function getGithubIntegrationStatus(): GithubIntegrationStatus {
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_REPO_OWNER?.trim();
  const repo = process.env.GITHUB_REPO_NAME?.trim();
  const projectId = process.env.GITHUB_PROJECT_ID?.trim();
  const stageFieldId = process.env.GITHUB_PROJECT_STAGE_FIELD_ID?.trim();
  const departmentFieldId = process.env.GITHUB_PROJECT_DEPARTMENT_FIELD_ID?.trim();
  const revenueFieldId = process.env.GITHUB_PROJECT_REVENUE_FIELD_ID?.trim();
  const stageOptions = parseOptionMap(process.env.GITHUB_PROJECT_STAGE_OPTIONS_JSON);
  const departmentOptions = parseOptionMap(
    process.env.GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON,
  );
  const revenueOptions = parseOptionMap(process.env.GITHUB_PROJECT_REVENUE_OPTIONS_JSON);
  const missing: string[] = [];

  if (!token) {
    missing.push("GITHUB_TOKEN");
  }
  if (!owner) {
    missing.push("GITHUB_REPO_OWNER");
  }
  if (!repo) {
    missing.push("GITHUB_REPO_NAME");
  }

  const stageKeys = ["new", "qualified", "paid", "production", "qa", "delivery", "retention"];
  const departmentKeys = [
    "growth",
    "product",
    "engineering",
    "customer-success",
    "finance",
  ];
  const revenueKeys = ["one-time", "subscription", "digital-pack"];

  const missingStageKeys = stageKeys.filter((key) => !stageOptions[key]);
  const missingDepartmentKeys = departmentKeys.filter((key) => !departmentOptions[key]);
  const missingRevenueKeys = revenueKeys.filter((key) => !revenueOptions[key]);

  if (projectId && !stageFieldId) {
    missing.push("GITHUB_PROJECT_STAGE_FIELD_ID");
  }
  if (projectId && !departmentFieldId) {
    missing.push("GITHUB_PROJECT_DEPARTMENT_FIELD_ID");
  }
  if (projectId && !revenueFieldId) {
    missing.push("GITHUB_PROJECT_REVENUE_FIELD_ID");
  }
  if (projectId && !Object.keys(stageOptions).length) {
    missing.push("GITHUB_PROJECT_STAGE_OPTIONS_JSON");
  }
  if (projectId && !Object.keys(departmentOptions).length) {
    missing.push("GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON");
  }
  if (projectId && !Object.keys(revenueOptions).length) {
    missing.push("GITHUB_PROJECT_REVENUE_OPTIONS_JSON");
  }

  return {
    repoConfigured: Boolean(token && owner && repo),
    autoSyncEnabled: getAutoSyncEnabled(),
    projectConfigured: Boolean(projectId),
    projectFieldCoverage: {
      stage: Boolean(stageFieldId),
      department: Boolean(departmentFieldId),
      revenueType: Boolean(revenueFieldId),
    },
    optionCoverage: {
      stage: missingStageKeys,
      department: missingDepartmentKeys,
      revenueType: missingRevenueKeys,
    },
    missing,
  };
}

export async function fetchGithubProjectSchema() {
  const project = getProjectConfig();
  if (!project?.projectId) {
    throw new Error("GITHUB_PROJECT_ID is required to inspect the GitHub Project schema.");
  }

  const result = await githubGraphql<{
    node: {
      fields: {
        nodes: Array<
          | {
              __typename: "ProjectV2Field";
              id: string;
              name: string;
            }
          | {
              __typename: "ProjectV2SingleSelectField";
              id: string;
              name: string;
              options: Array<{ id: string; name: string }>;
            }
          | {
              __typename: "ProjectV2IterationField";
              id: string;
              name: string;
            }
        >;
      };
    };
  }>(
    `
      query GetProjectFieldSchema($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            fields(first: 50) {
              nodes {
                __typename
                ... on ProjectV2Field {
                  id
                  name
                }
                ... on ProjectV2IterationField {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
    { projectId: project.projectId },
  );

  const fields = result.node.fields.nodes.map((field) => ({
    id: field.id,
    name: field.name,
    type: field.__typename,
    options: "options" in field ? field.options : undefined,
  }));

  const stageField = fields.find((field) =>
    field.name.toLowerCase() === "stage" || field.name.toLowerCase() === "status",
  );
  const departmentField = fields.find(
    (field) => field.name.toLowerCase() === "department",
  );
  const revenueField = fields.find(
    (field) => field.name.toLowerCase() === "revenue type",
  );

  return {
    projectId: project.projectId,
    fields,
    suggestedMappings: {
      stageFieldId: stageField?.id,
      departmentFieldId: departmentField?.id,
      revenueFieldId: revenueField?.id,
      stageOptions: buildSuggestedOptionMap(stageField?.options, {
        new: ["intake", "new"],
        qualified: ["qualified"],
        paid: ["paid"],
        production: ["production"],
        qa: ["qa"],
        delivery: ["delivered", "delivery"],
        retention: ["retention"],
      }),
      departmentOptions: buildSuggestedOptionMap(departmentField?.options, {
        growth: ["growth"],
        product: ["product"],
        engineering: ["engineering"],
        "customer-success": ["customer success", "success"],
        finance: ["finance", "finance & admin"],
      }),
      revenueOptions: buildSuggestedOptionMap(revenueField?.options, {
        "one-time": ["one-time", "one time"],
        subscription: ["subscription"],
        "digital-pack": ["digital pack"],
      }),
    },
  } satisfies GithubProjectSchema;
}

export async function buildGithubEnvTemplate() {
  const schema = await fetchGithubProjectSchema();

  return {
    env: {
      GITHUB_PROJECT_ID: schema.projectId,
      GITHUB_PROJECT_STAGE_FIELD_ID: schema.suggestedMappings.stageFieldId || "",
      GITHUB_PROJECT_DEPARTMENT_FIELD_ID:
        schema.suggestedMappings.departmentFieldId || "",
      GITHUB_PROJECT_REVENUE_FIELD_ID:
        schema.suggestedMappings.revenueFieldId || "",
      GITHUB_PROJECT_STAGE_OPTIONS_JSON: JSON.stringify(
        schema.suggestedMappings.stageOptions,
      ),
      GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON: JSON.stringify(
        schema.suggestedMappings.departmentOptions,
      ),
      GITHUB_PROJECT_REVENUE_OPTIONS_JSON: JSON.stringify(
        schema.suggestedMappings.revenueOptions,
      ),
    },
    notes: [
      "Fill any empty field ids manually if the project schema did not auto-match them.",
      "Review JSON option maps before enabling GITHUB_AUTO_SYNC_ORDERS=true.",
      "Stage, department, and revenue mappings are suggested from current Project field names and single-select options.",
    ],
  } satisfies GithubEnvTemplate;
}

export function buildGithubBootstrapManifest() {
  const labels = [
    ...new Set([
      "order-intake",
      ...departments.flatMap((department) => department.githubLabels),
      ...orderStages.map((stage) => `stage:${stage.id}`),
      ...intakeProducts.map((product) => `product:${product.id}`),
      "status:open",
      "status:completed",
    ]),
  ].toSorted();

  return {
    labels,
    projectFields: [
      {
        name: "Stage",
        type: "single_select",
        options: orderStages.map((stage) => stage.githubField),
      },
      {
        name: "Department",
        type: "single_select",
        options: departments.map((department) => department.name),
      },
      {
        name: "Revenue Type",
        type: "single_select",
        options: ["One-time", "Subscription", "Digital Pack"],
      },
      {
        name: "Priority",
        type: "single_select",
        options: ["P0", "P1", "P2"],
      },
    ],
    workflows: [
      {
        file: ".github/workflows/order-intake-sync.yml",
        purpose: "Normalize newly created order issues and add intake guidance.",
      },
      {
        file: ".github/workflows/order-paid-transition.yml",
        purpose: "Post the paid-stage checklist and hand off to fulfillment.",
      },
      {
        file: ".github/workflows/delivery-qa-comment.yml",
        purpose: "Post QA and delivery checks before marking the order delivered.",
      },
      {
        file: ".github/workflows/retention-followup.yml",
        purpose: "Post the retention checklist after delivery is stable.",
      },
    ],
    envKeys: [
      "GITHUB_TOKEN",
      "GITHUB_REPO_OWNER",
      "GITHUB_REPO_NAME",
      "GITHUB_AUTO_SYNC_ORDERS",
      "GITHUB_PROJECT_ID",
      "GITHUB_PROJECT_STAGE_FIELD_ID",
      "GITHUB_PROJECT_DEPARTMENT_FIELD_ID",
      "GITHUB_PROJECT_REVENUE_FIELD_ID",
      "GITHUB_PROJECT_STAGE_OPTIONS_JSON",
      "GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON",
      "GITHUB_PROJECT_REVENUE_OPTIONS_JSON",
    ],
    setupSteps: [
      "Create or choose the GitHub repository that will host the company workflow.",
      "Create a Project v2 with Stage, Department, Revenue Type, and Priority single-select fields.",
      "Create repository labels from the bootstrap manifest.",
      "Add the committed workflow files from .github/workflows/ to the target repository.",
      "Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME in .env.local.",
      "Set GITHUB_PROJECT_ID and either field ids manually or use /api/github/project-schema plus /api/github/env-template to fill them.",
      "Turn on GITHUB_AUTO_SYNC_ORDERS=true only after the project mappings are reviewed.",
      "Run a test order from /ops and verify issue creation, field sync, and timeline comment posting.",
    ],
  } satisfies GithubBootstrapManifest;
}

export function buildGithubBootstrapPackage() {
  const manifest = buildGithubBootstrapManifest();

  const envTemplate = manifest.envKeys.map((key) => `${key}=`).join("\n");
  const labelsText = manifest.labels.map((label) => `- ${label}`).join("\n");
  const projectFieldsText = manifest.projectFields
    .map(
      (field) =>
        `- ${field.name} (${field.type}): ${field.options.join(", ")}`,
    )
    .join("\n");
  const workflowsText = manifest.workflows
    .map((workflow) => `- ${workflow.file}: ${workflow.purpose}`)
    .join("\n");
  const setupChecklist = manifest.setupSteps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return {
    envTemplate,
    labelsText,
    projectFieldsText,
    workflowsText,
    setupChecklist,
  } satisfies GithubBootstrapPackage;
}

function buildSuggestedOptionMap(
  options: Array<{ id: string; name: string }> | undefined,
  aliases: Record<string, string[]>,
) {
  const result: Record<string, string> = {};

  for (const [key, candidates] of Object.entries(aliases)) {
    const match = options?.find((option) =>
      candidates.includes(option.name.toLowerCase()),
    );
    if (match) {
      result[key] = match.id;
    }
  }

  return result;
}

async function githubRest<T>(path: string, init: RequestInit) {
  const { token } = getGithubConfig();
  const response = await fetch(`${githubApiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "photo-ready-web",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub REST request failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T;
}

async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
) {
  const { token } = getGithubConfig();
  const response = await fetch(githubGraphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "photo-ready-web",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("GitHub GraphQL request returned no data.");
  }

  return payload.data;
}

function getIssuePayloadDataFile() {
  return "github-order-issues.jsonl";
}

function getOrderLinkDataFile() {
  return "github-order-links.jsonl";
}

async function readLatestGithubOrderIssue(orderId?: string) {
  const records = await readJsonLines<GithubOrderIssue>(getIssuePayloadDataFile());

  if (!records.length) {
    throw new Error("No GitHub issue payloads have been generated yet.");
  }

  if (!orderId) {
    return records.at(-1)!;
  }

  const match = [...records].reverse().find((record) => record.orderId === orderId);
  if (!match) {
    throw new Error(`No GitHub issue payload found for ${orderId}.`);
  }

  return match;
}

async function readLatestGithubOrderLink(orderId: string) {
  const records = await readJsonLines<GithubOrderLink>(getOrderLinkDataFile());
  return [...records].reverse().find((record) => record.orderId === orderId) ?? null;
}

async function writeGithubOrderLink(link: GithubOrderLink) {
  await appendJsonLine(getOrderLinkDataFile(), link);
}

export async function createGithubIssueFromOrder(orderId?: string) {
  const targetOrderId = orderId ?? (await readLatestGithubOrderIssue()).orderId;
  return syncGithubOrder(targetOrderId);
}

async function ensureGithubIssue(orderId: string) {
  const { owner, repo } = getGithubConfig();
  const order = await getOrder(orderId);
  const storedPayload = await readLatestGithubOrderIssue(orderId).catch(() => null);
  const title = order.githubTitle;
  const body = buildGithubIssueBodyFromOrder(order);
  const labels = [
    ...new Set([...order.githubLabels, `stage:${order.currentStage}`, `status:${order.status}`]),
  ];
  const existingLink = await readLatestGithubOrderLink(orderId);

  if (!existingLink) {
    const issue = await githubRest<GithubIssueRecord>(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title: storedPayload?.title || title,
        body,
        labels,
      }),
    });

    const link: GithubOrderLink = {
      orderId,
      issueId: issue.node_id,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      syncedAt: new Date().toISOString(),
    };

    await writeGithubOrderLink(link);

    return {
      created: true,
      issue,
      link,
      labels,
      body,
    };
  }

  const issue = await githubRest<GithubIssueRecord>(
    `/repos/${owner}/${repo}/issues/${existingLink.issueNumber}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    },
  );

  const link: GithubOrderLink = {
    ...existingLink,
    issueId: issue.node_id,
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    syncedAt: new Date().toISOString(),
  };
  await writeGithubOrderLink(link);

  return {
    created: false,
    issue,
    link,
    labels,
    body,
  };
}

async function addIssueToProject(projectId: string, issueNodeId: string) {
  const result = await githubGraphql<{
    addProjectV2ItemById: { item: { id: string } };
  }>(
    `
      mutation AddIssueToProject($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `,
    { projectId, contentId: issueNodeId },
  );

  return result.addProjectV2ItemById.item.id;
}

async function updateSingleSelectField(
  projectId: string,
  itemId: string,
  fieldId: string | undefined,
  optionId: string | undefined,
) {
  if (!fieldId || !optionId) {
    return false;
  }

  await githubGraphql(
    `
      mutation UpdateProjectField(
        $projectId: ID!
        $itemId: ID!
        $fieldId: ID!
        $optionId: String!
      ) {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $optionId }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }
    `,
    { projectId, itemId, fieldId, optionId },
  );

  return true;
}

async function syncIssueProjectFields(orderId: string, issueId: string) {
  const project = getProjectConfig();
  if (!project) {
    return {
      enabled: false,
      fieldsUpdated: [],
    } satisfies ProjectSyncResult;
  }

  const order = await getOrder(orderId);
  const product = getProduct(order.productId);
  const link = await readLatestGithubOrderLink(orderId);
  const itemId = link?.projectItemId || (await addIssueToProject(project.projectId, issueId));
  const fieldsUpdated: string[] = [];

  const stageUpdated = await updateSingleSelectField(
    project.projectId,
    itemId,
    project.stageFieldId,
    project.stageOptions[order.currentStage],
  );
  if (stageUpdated) {
    fieldsUpdated.push("stage");
  }

  const departmentUpdated = await updateSingleSelectField(
    project.projectId,
    itemId,
    project.departmentFieldId,
    project.departmentOptions[order.ownerDepartment],
  );
  if (departmentUpdated) {
    fieldsUpdated.push("department");
  }

  const revenueUpdated = await updateSingleSelectField(
    project.projectId,
    itemId,
    project.revenueFieldId,
    project.revenueOptions[product.revenueType],
  );
  if (revenueUpdated) {
    fieldsUpdated.push("revenueType");
  }

  if (link) {
    await writeGithubOrderLink({
      ...link,
      issueId,
      projectItemId: itemId,
      syncedAt: new Date().toISOString(),
    });
  }

  return {
    enabled: true,
    itemId,
    fieldsUpdated,
  } satisfies ProjectSyncResult;
}

async function postIssueTimelineComment(issueNumber: number, orderId: string) {
  const { owner, repo } = getGithubConfig();
  const order = await getOrder(orderId);
  const events = (await listOrderEvents(orderId)).slice(0, 5).reverse();
  const lines = [
    "### Order timeline sync",
    "",
    `- Current stage: ${order.currentStage}`,
    `- Status: ${order.status}`,
    `- Owner department: ${order.ownerDepartment}`,
    `- Last action: ${order.lastAction}`,
    "",
    "Recent events:",
    ...events.map(
      (event) =>
        `- ${event.occurredAt}: ${event.action} ${event.fromStage ?? "none"} -> ${event.toStage} (${event.notes})`,
    ),
  ];

  await githubRest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({
      body: lines.join("\n"),
    }),
  });
}

export async function syncGithubOrder(
  orderId: string,
  options?: { postTimelineComment?: boolean },
) {
  const issueResult = await ensureGithubIssue(orderId);
  const project = await syncIssueProjectFields(orderId, issueResult.link.issueId);
  let timelineCommentPosted = false;

  if (options?.postTimelineComment) {
    await postIssueTimelineComment(issueResult.issue.number, orderId);
    timelineCommentPosted = true;
  }

  return {
    orderId,
    issueUrl: issueResult.issue.html_url,
    issueNumber: issueResult.issue.number,
    issueTitle: issueResult.issue.title,
    labels: issueResult.labels,
    created: issueResult.created,
    project,
    timelineCommentPosted,
  } satisfies GithubOrderSyncResult;
}

export async function autoSyncGithubOrder(orderId: string) {
  if (!getAutoSyncEnabled()) {
    return {
      attempted: false,
      ok: false,
      error: "GITHUB_AUTO_SYNC_ORDERS is disabled.",
    };
  }

  try {
    const result = await syncGithubOrder(orderId, { postTimelineComment: true });
    return {
      attempted: true,
      ok: true,
      result,
    };
  } catch (error) {
    return {
      attempted: true,
      ok: false,
      error:
        error instanceof Error ? error.message : "Automatic GitHub sync failed.",
    };
  }
}
