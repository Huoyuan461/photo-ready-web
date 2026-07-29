import {
  buildGithubEnvTemplate,
  getGithubIntegrationStatus,
} from "@/lib/github-sync";

export async function GET() {
  try {
    const template = await buildGithubEnvTemplate();

    return Response.json({
      ok: true,
      status: getGithubIntegrationStatus(),
      template,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        status: getGithubIntegrationStatus(),
        error:
          error instanceof Error
            ? error.message
            : "GitHub env template generation failed.",
      },
      { status: 400 },
    );
  }
}
