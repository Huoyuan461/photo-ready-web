import { syncGithubOrder } from "@/lib/github-sync";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as {
      orderId?: string;
    };
    if (!payload.orderId) {
      throw new Error("orderId is required to sync a live order.");
    }
    const result = await syncGithubOrder(payload.orderId, {
      postTimelineComment: true,
    });
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "GitHub sync failed.",
      },
      { status: 500 },
    );
  }
}
