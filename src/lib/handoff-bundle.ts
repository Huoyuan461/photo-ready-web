import { buildGithubBootstrapBundleMarkdown } from "@/lib/github-sync";
import { buildOpsDailyReportMarkdown } from "@/lib/ops-report";

export async function buildOperatingHandoffBundleMarkdown() {
  const githubBundle = buildGithubBootstrapBundleMarkdown();
  const opsReport = await buildOpsDailyReportMarkdown();

  return [
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
    githubBundle,
    "",
    "---",
    "",
    opsReport,
  ].join("\n");
}
