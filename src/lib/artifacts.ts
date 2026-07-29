import { access, readdir } from "node:fs/promises";
import path from "node:path";

export type ArtifactRecord = {
  id: "github-bootstrap-bundle" | "daily-ops-report" | "operating-handoff-bundle";
  label: string;
  fileName: string;
  absolutePath: string;
  exists: boolean;
};

export function getExportsDir() {
  const configured = process.env.DATA_DIR?.trim();
  const dataDir = configured ? path.resolve(configured) : path.join(process.cwd(), "data");
  return path.join(dataDir, "exports");
}

export async function listArtifacts() {
  const exportDir = getExportsDir();
  const specs: Array<Omit<ArtifactRecord, "exists" | "absolutePath">> = [
    {
      id: "github-bootstrap-bundle",
      label: "GitHub Bootstrap Bundle",
      fileName: "github-bootstrap-bundle.md",
    },
    {
      id: "daily-ops-report",
      label: "Daily Ops Report",
      fileName: "daily-ops-report.md",
    },
    {
      id: "operating-handoff-bundle",
      label: "Operating Handoff Bundle",
      fileName: "operating-handoff-bundle.md",
    },
  ];

  return Promise.all(
    specs.map(async (spec) => {
      const absolutePath = path.join(exportDir, spec.fileName);
      let exists = false;
      try {
        await access(absolutePath);
        exists = true;
      } catch {
        exists = false;
      }

      return {
        ...spec,
        absolutePath,
        exists,
      } satisfies ArtifactRecord;
    }),
  );
}

export async function listExportDirectoryFiles() {
  try {
    return await readdir(getExportsDir());
  } catch {
    return [];
  }
}
