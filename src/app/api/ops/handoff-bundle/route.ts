import { buildOperatingHandoffBundleMarkdown } from "@/lib/handoff-bundle";

export async function GET() {
  const body = await buildOperatingHandoffBundleMarkdown();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
