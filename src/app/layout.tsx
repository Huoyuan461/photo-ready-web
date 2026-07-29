import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { SiteSchema } from "@/components/site-schema";
import { siteBranding } from "@/lib/site-data";
import "@/app/globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: siteBranding.name,
    template: `%s | ${siteBranding.name}`,
  },
  description: siteBranding.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AnalyticsBeacon />
        <SiteSchema />
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
