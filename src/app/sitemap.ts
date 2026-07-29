import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.com/photo-ready";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/products",
    "/preview",
    "/pricing",
    "/packs",
    "/ops",
    "/ops/legacy",
    "/account",
    "/support",
    "/privacy",
    "/refund",
    "/solutions/passport-photo",
    "/solutions/linkedin-headshot",
    "/solutions/resume-photo",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-07-27"),
  }));
}
