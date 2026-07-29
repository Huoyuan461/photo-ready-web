import { appendJsonLine } from "@/lib/server-store";

export async function POST(request: Request) {
  const payload = await request.json();

  await appendJsonLine("leads.jsonl", {
    ...payload,
    ipHint: request.headers.get("x-forwarded-for") || "local",
    userAgent: request.headers.get("user-agent") || "unknown",
  });

  return Response.json({ ok: true });
}
