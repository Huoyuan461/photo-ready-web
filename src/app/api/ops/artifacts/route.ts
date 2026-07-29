import { listArtifacts, listExportDirectoryFiles } from "@/lib/artifacts";

export async function GET() {
  const [artifacts, files] = await Promise.all([
    listArtifacts(),
    listExportDirectoryFiles(),
  ]);

  return Response.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    artifacts,
    files,
  });
}
