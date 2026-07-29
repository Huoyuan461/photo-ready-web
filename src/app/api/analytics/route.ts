import { appendJsonLine } from "@/lib/server-store";

export async function POST(request: Request) {
  const payload = await request.json();

  await appendJsonLine("analytics.jsonl", {
    ...payload,
    recordedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "unknown",
  });

  return new Response(null, { status: 204 });
}
