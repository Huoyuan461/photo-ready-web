import { companyName, siteBranding, siteName } from "@/lib/site-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: companyName,
      url: siteUrl,
      brand: siteName,
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: siteBranding.description,
      publisher: {
        "@type": "Organization",
        name: companyName,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: siteName,
      applicationCategory: "PhotoApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "49",
        priceCurrency: "USD",
      },
    },
  ],
};

export function SiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
