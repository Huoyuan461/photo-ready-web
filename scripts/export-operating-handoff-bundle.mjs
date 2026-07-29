import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR.trim())
  : path.join(process.cwd(), "data");
const outputDir = path.join(dataDir, "exports");
const outputFile = path.join(outputDir, "operating-handoff-bundle.md");

const githubBootstrapPath = path.join(outputDir, "github-bootstrap-bundle.md");
const dailyOpsPath = path.join(outputDir, "daily-ops-report.md");

const githubBootstrap = await safeRead(
  githubBootstrapPath,
  "# GitHub Bootstrap Bundle\n\nRun `npm run export:github:bootstrap` first.\n",
);
const dailyOps = await safeRead(
  dailyOpsPath,
  "# Daily Ops Report\n\nRun `npm run export:ops:report` first.\n",
);

const body = [
  "# Operating Handoff Bundle",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "This bundle combines the current GitHub bootstrap package and the live daily ops report.",
  "",
  "## Recommended Next Actions",
  "",
  "1. Fill missing GitHub repository credentials in `.env.local`.",
  "2. Create or connect the GitHub Project v2 fields from the bootstrap section.",
  "3. Run a real test order from `/ops` after enabling GitHub auto sync.",
  "4. Use the daily ops section as the default founder or team handoff summary.",
  "",
  githubBootstrap.trim(),
  "",
  "---",
  "",
  dailyOps.trim(),
  "",
].join("\n");

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, body, "utf8");

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

async function safeRead(filePath, fallback) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}
