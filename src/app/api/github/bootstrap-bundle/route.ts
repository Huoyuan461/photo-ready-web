import { buildGithubBootstrapBundleMarkdown } from "@/lib/github-sync";

export async function GET() {
  const body = buildGithubBootstrapBundleMarkdown();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
