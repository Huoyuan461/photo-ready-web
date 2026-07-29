import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sourceUrl = process.env.SITE_SOURCE_URL || "http://127.0.0.1:3002";
const outDir = path.join(repoRoot, "site-dist");

const routeFilePatterns = [
  "src/app/page.tsx",
  "src/app/account/page.tsx",
  "src/app/launch/page.tsx",
  "src/app/ops/page.tsx",
  "src/app/ops/legacy/page.tsx",
  "src/app/packs/page.tsx",
  "src/app/preview/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/products/page.tsx",
  "src/app/refund/page.tsx",
  "src/app/solutions/linkedin-headshot/page.tsx",
  "src/app/solutions/passport-photo/page.tsx",
  "src/app/solutions/resume-photo/page.tsx",
  "src/app/support/page.tsx",
  "src/app/terms/page.tsx",
];

function routeFromFile(filePath) {
  const relative = path.relative(path.join(repoRoot, "src/app"), filePath);
  if (relative === "page.tsx") {
    return "/";
  }
  const withoutPage = relative.replace(/(^|\/)page\.tsx$/, "");
  const normalized = withoutPage.split(path.sep).join("/");
  return normalized === "" ? "/" : `/${normalized}`;
}

async function getRouteFiles() {
  const routes = [];
  for (const file of routeFilePatterns) {
    const abs = path.join(repoRoot, file);
    try {
      await fs.access(abs);
      routes.push(routeFromFile(abs));
    } catch {
      // Ignore missing optional routes.
    }
  }
  return routes;
}

async function removeDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDir(src, dest) {
  await fs.cp(src, dest, { recursive: true, force: true });
}

function routeToOutputPath(route) {
  if (route === "/") {
    return path.join(outDir, "index.html");
  }
  return path.join(outDir, route.slice(1), "index.html");
}

async function savePageSnapshot(page, route) {
  const targetPath = routeToOutputPath(route);
  await ensureDir(path.dirname(targetPath));
  const html = await page.content();
  await fs.writeFile(targetPath, html, "utf8");
}

async function main() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1600 },
  });

  const routes = await getRouteFiles();
  await removeDir(outDir);
  await ensureDir(outDir);

  const publicDir = path.join(repoRoot, "public");
  const staticDir = path.join(repoRoot, ".next/static");
  const buildAssetsDir = path.join(outDir, "_next");
  await ensureDir(buildAssetsDir);
  if (await fs.stat(publicDir).catch(() => null)) {
    await copyDir(publicDir, outDir);
  }
  if (await fs.stat(staticDir).catch(() => null)) {
    await copyDir(staticDir, path.join(buildAssetsDir, "static"));
  }

  for (const route of routes) {
    const url = new URL(route, sourceUrl).toString();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await savePageSnapshot(page, route);
    console.log(`saved ${route}`);
  }

  const rootIndex = path.join(outDir, "index.html");
  const notFoundIndex = path.join(outDir, "404.html");
  await fs.copyFile(rootIndex, notFoundIndex);

  await browser.close();
  console.log(`Static site exported to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
