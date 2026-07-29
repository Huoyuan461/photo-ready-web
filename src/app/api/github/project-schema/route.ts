import { fetchGithubProjectSchema, getGithubIntegrationStatus } from "@/lib/github-sync";

export async function GET() {
  try {
    const status = getGithubIntegrationStatus();
    const schema = await fetchGithubProjectSchema();

    return Response.json({
      ok: true,
      status,
      schema,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        status: getGithubIntegrationStatus(),
        error:
          error instanceof Error
            ? error.message
            : "GitHub project schema lookup failed.",
      },
      { status: 400 },
    );
  }
}
