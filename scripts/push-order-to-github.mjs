import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const orderId = process.argv[2];
const token = process.env.GITHUB_TOKEN?.trim();
const owner = process.env.GITHUB_REPO_OWNER?.trim();
const repo = process.env.GITHUB_REPO_NAME?.trim();
const projectId = process.env.GITHUB_PROJECT_ID?.trim();
const stageFieldId = process.env.GITHUB_PROJECT_STAGE_FIELD_ID?.trim();
const departmentFieldId = process.env.GITHUB_PROJECT_DEPARTMENT_FIELD_ID?.trim();
const revenueFieldId = process.env.GITHUB_PROJECT_REVENUE_FIELD_ID?.trim();

if (!token || !owner || !repo) {
  console.error(
    "Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME.",
  );
  process.exit(1);
}

if (!orderId) {
  console.error("Usage: npm run push:order:github -- <orderId>");
  process.exit(1);
}

const dataDir = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.join(process.cwd(), "data");

const stageOptions = parseJsonMap(process.env.GITHUB_PROJECT_STAGE_OPTIONS_JSON);
const departmentOptions = parseJsonMap(
  process.env.GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON,
);
const revenueOptions = parseJsonMap(process.env.GITHUB_PROJECT_REVENUE_OPTIONS_JSON);

const orders = await readJsonLines("orders.jsonl");
const orderSnapshots = orders.filter((record) => record.orderId === orderId);
const order = orderSnapshots.at(-1);

if (!order) {
  console.error(`Order ${orderId} was not found in local storage.`);
  process.exit(1);
}

const issuePayloads = await readJsonLines("github-order-issues.jsonl");
const issuePayload =
  [...issuePayloads].reverse().find((record) => record.orderId === orderId) ?? null;
const orderLinks = await readJsonLines("github-order-links.jsonl");
const existingLink =
  [...orderLinks].reverse().find((record) => record.orderId === orderId) ?? null;

const issueBody = buildIssueBody(order);
const labels = [
  ...new Set([
    ...(Array.isArray(order.githubLabels) ? order.githubLabels : []),
    `stage:${order.currentStage}`,
    `status:${order.status || "open"}`,
  ]),
];

const issue = existingLink
  ? await githubRest(`/repos/${owner}/${repo}/issues/${existingLink.issueNumber}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: order.githubTitle,
        body: issueBody,
        labels,
      }),
    })
  : await githubRest(`/repos/${owner}/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title: issuePayload?.title || order.githubTitle,
        body: issueBody,
        labels,
      }),
    });

let projectItemId = existingLink?.projectItemId;
const fieldsUpdated = [];

if (projectId) {
  if (!projectItemId) {
    projectItemId = await addIssueToProject(projectId, issue.node_id);
  }

  if (await updateSingleSelectField(projectId, projectItemId, stageFieldId, stageOptions[order.currentStage])) {
    fieldsUpdated.push("stage");
  }

  if (
    await updateSingleSelectField(
      projectId,
      projectItemId,
      departmentFieldId,
      departmentOptions[order.ownerDepartment],
    )
  ) {
    fieldsUpdated.push("department");
  }

  if (
    await updateSingleSelectField(
      projectId,
      projectItemId,
      revenueFieldId,
      revenueOptions[getRevenueType(order.productId)],
    )
  ) {
    fieldsUpdated.push("revenueType");
  }
}

await appendJsonLine("github-order-links.jsonl", {
  orderId,
  issueId: issue.node_id,
  issueNumber: issue.number,
  issueUrl: issue.html_url,
  projectItemId,
  syncedAt: new Date().toISOString(),
});

console.log(
  JSON.stringify(
    {
      ok: true,
      orderId,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      created: !existingLink,
      projectEnabled: Boolean(projectId),
      fieldsUpdated,
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

async function appendJsonLine(fileName, payload) {
  await mkdir(dataDir, { recursive: true });
  await appendFile(path.join(dataDir, fileName), `${JSON.stringify(payload)}\n`, "utf8");
}

function parseJsonMap(raw) {
  if (!raw?.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error("Invalid GitHub project option JSON.");
    process.exit(1);
  }
}

async function githubRest(apiPath, init) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "photo-ready-web-cli",
    },
  });

  if (!response.ok) {
    console.error(`GitHub REST request failed: ${response.status} ${await response.text()}`);
    process.exit(1);
  }

  return response.json();
}

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "photo-ready-web-cli",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    console.error(
      `GitHub GraphQL request failed: ${response.status} ${await response.text()}`,
    );
    process.exit(1);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    console.error(payload.errors.map((error) => error.message).join("; "));
    process.exit(1);
  }

  return payload.data;
}

async function addIssueToProject(activeProjectId, contentId) {
  const payload = await githubGraphql(
    `
      mutation AddIssueToProject($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `,
    { projectId: activeProjectId, contentId },
  );

  return payload.addProjectV2ItemById.item.id;
}

async function updateSingleSelectField(activeProjectId, itemId, fieldId, optionId) {
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
    { projectId: activeProjectId, itemId, fieldId, optionId },
  );

  return true;
}

function getRevenueType(productId) {
  switch (productId) {
    case "subscription":
      return "subscription";
    case "pfmea-pack":
    case "lean-pack":
      return "digital-pack";
    default:
      return "one-time";
  }
}

function getProductInfo(productId) {
  switch (productId) {
    case "subscription":
      return {
        name: "PhotoReady Unlimited",
        revenueType: "subscription",
        price: "$10/month",
        fulfillmentPath: "Create entitlement, send welcome flow, open retention watch.",
      };
    case "pfmea-pack":
      return {
        name: "PFMEA Offline Pack",
        revenueType: "digital-pack",
        price: "$49",
        fulfillmentPath: "Grant digital download and invoice.",
      };
    case "lean-pack":
      return {
        name: "Lean Problem Solving Kit",
        revenueType: "digital-pack",
        price: "$29",
        fulfillmentPath: "Grant digital download and invoice.",
      };
    default:
      return {
        name: "PhotoReady Export Pack",
        revenueType: "one-time",
        price: "$15",
        fulfillmentPath: "Generate export assets, send receipt, mark delivered.",
      };
  }
}

function getDepartmentInfo(departmentId) {
  switch (departmentId) {
    case "product":
      return { name: "Product", lead: "Founder / Product Lead" };
    case "engineering":
      return { name: "Engineering", lead: "Codex + Founder" };
    case "customer-success":
      return { name: "Customer Success", lead: "Part-time Support / Ops" };
    case "finance":
      return { name: "Finance & Admin", lead: "Founder / Admin" };
    default:
      return { name: "Growth", lead: "Founder / Growth Operator" };
  }
}

function getStageInfo(stageId) {
  switch (stageId) {
    case "qualified":
      return {
        name: "Qualified",
        target: "Offer and fulfillment path confirmed. Exceptions identified.",
      };
    case "paid":
      return {
        name: "Paid",
        target: "Payment confirmed and order ready for automated work.",
      };
    case "production":
      return {
        name: "Production",
        target: "Photo export or pack entitlement prepared.",
      };
    case "qa":
      return {
        name: "QA",
        target: "Delivery reviewed, support risk checked, and edge cases resolved.",
      };
    case "delivery":
      return {
        name: "Delivered",
        target: "Customer received final output and support link.",
      };
    case "retention":
      return {
        name: "Retention loop",
        target: "Upsell, repeat use, or referral follow-up scheduled.",
      };
    default:
      return {
        name: "New intake",
        target: "Inbound order captured with product, channel, and payment intent.",
      };
  }
}

function buildIssueBody(order) {
  const product = getProductInfo(order.productId);
  const department = getDepartmentInfo(order.ownerDepartment);
  const stage = getStageInfo(order.currentStage);

  return `## Order Intake

- Order ID: ${order.orderId}
- Customer: ${order.customerName}
- Email: ${order.customerEmail}
- Product: ${product.name}
- Revenue Type: ${product.revenueType}
- Value: ${product.price}
- Channel: ${order.source}
- Status: ${order.status || "open"}

## Department Owner

- Current owner: ${department.name}
- Team lead: ${department.lead}
- GitHub labels: ${(order.githubLabels || []).join(", ")}

## Fulfillment Path

- Current stage: ${stage.name}
- Next target: ${stage.target}
- Fulfillment rule: ${product.fulfillmentPath}
- Last action: ${order.lastAction || "No action logged"}

## Notes

${order.notes?.trim() || "No extra notes"}
`;
}
