import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "data", "exports");
const outFile = path.join(outDir, "github-bootstrap-bundle.md");

const status = getGithubIntegrationStatus();
const manifest = buildGithubBootstrapManifest();
const bootstrapPackage = buildGithubBootstrapPackage();

const body = [
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

await mkdir(outDir, { recursive: true });
await writeFile(outFile, body, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      output: outFile,
    },
    null,
    2,
  ),
);

function getGithubIntegrationStatus() {
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
  const missing = [];

  if (!token) missing.push("GITHUB_TOKEN");
  if (!owner) missing.push("GITHUB_REPO_OWNER");
  if (!repo) missing.push("GITHUB_REPO_NAME");
  if (projectId && !stageFieldId) missing.push("GITHUB_PROJECT_STAGE_FIELD_ID");
  if (projectId && !departmentFieldId) missing.push("GITHUB_PROJECT_DEPARTMENT_FIELD_ID");
  if (projectId && !revenueFieldId) missing.push("GITHUB_PROJECT_REVENUE_FIELD_ID");
  if (projectId && !Object.keys(stageOptions).length)
    missing.push("GITHUB_PROJECT_STAGE_OPTIONS_JSON");
  if (projectId && !Object.keys(departmentOptions).length)
    missing.push("GITHUB_PROJECT_DEPARTMENT_OPTIONS_JSON");
  if (projectId && !Object.keys(revenueOptions).length)
    missing.push("GITHUB_PROJECT_REVENUE_OPTIONS_JSON");

  return {
    repoConfigured: Boolean(token && owner && repo),
    autoSyncEnabled:
      process.env.GITHUB_AUTO_SYNC_ORDERS?.trim().toLowerCase() === "true",
    projectConfigured: Boolean(projectId),
    missing,
  };
}

function parseOptionMap(raw) {
  if (!raw?.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildGithubBootstrapManifest() {
  return {
    labels: [
      "automation",
      "billing",
      "content",
      "delivery",
      "dept:engineering",
      "dept:finance",
      "dept:growth",
      "dept:product",
      "dept:success",
      "funnel",
      "infra",
      "order-intake",
      "pricing",
      "product:export-pack",
      "product:lean-pack",
      "product:pfmea-pack",
      "product:subscription",
      "reporting",
      "roadmap",
      "stage:delivery",
      "stage:new",
      "stage:paid",
      "stage:production",
      "stage:qa",
      "stage:qualified",
      "stage:retention",
      "status:completed",
      "status:open",
      "support",
    ],
    projectFields: [
      {
        name: "Stage",
        type: "single_select",
        options: ["Intake", "Qualified", "Paid", "Production", "QA", "Delivered", "Retention"],
      },
      {
        name: "Department",
        type: "single_select",
        options: ["Growth", "Product", "Engineering", "Customer Success", "Finance & Admin"],
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
  };
}

function buildGithubBootstrapPackage() {
  const manifest = buildGithubBootstrapManifest();
  return {
    envTemplate: manifest.envKeys.map((key) => `${key}=`).join("\n"),
    labelsText: manifest.labels.map((label) => `- ${label}`).join("\n"),
    projectFieldsText: manifest.projectFields
      .map((field) => `- ${field.name} (${field.type}): ${field.options.join(", ")}`)
      .join("\n"),
    workflowsText: manifest.workflows
      .map((workflow) => `- ${workflow.file}: ${workflow.purpose}`)
      .join("\n"),
    setupChecklist: manifest.setupSteps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n"),
  };
}
