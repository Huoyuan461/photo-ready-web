import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MealMind AI",
    short_name: "MealMind",
    description: "Daily 3-choice meal recommendations from your delivery history and preferences.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f4f8",
    theme_color: "#ff642f",
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
