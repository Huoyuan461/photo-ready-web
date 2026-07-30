import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "PhotoReady",
  description:
    "Create American-style passport photos, LinkedIn headshots, resume photos, and China common-size ID outputs from one portrait.",
  applicationName: "PhotoReady",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhotoReady",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport = {
  themeColor: "#0d3b78",
  colorScheme: "light" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#f3f4f8]">
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
