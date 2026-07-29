import { buildOpsDailyReportMarkdown } from "@/lib/ops-report";

export async function GET() {
  const body = await buildOpsDailyReportMarkdown();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
