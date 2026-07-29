import {
  buildGithubBootstrapManifest,
  buildGithubBootstrapPackage,
  getGithubIntegrationStatus,
} from "@/lib/github-sync";

export async function GET() {
  return Response.json({
    ok: true,
    status: getGithubIntegrationStatus(),
    manifest: buildGithubBootstrapManifest(),
    package: buildGithubBootstrapPackage(),
    generatedAt: new Date().toISOString(),
  });
}
