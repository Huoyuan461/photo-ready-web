import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PhotoReady",
    short_name: "PhotoReady",
    description:
      "Create passport, visa, LinkedIn, resume, and China common-size ID photos from one upload.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f4f8",
    theme_color: "#0d3b78",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
