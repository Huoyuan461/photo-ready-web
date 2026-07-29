import Image from "next/image";
import Link from "next/link";
import { siteBranding, toolCategories } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/8 bg-[#0d1320] text-white/72">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={siteBranding.logoSquare}
              alt={siteBranding.logoAlt}
              width={40}
              height={40}
              className="h-10 w-10 rounded-2xl object-contain"
            />
            <div>
              <Image
                src={siteBranding.logoWordmark}
                alt={siteBranding.name}
                width={240}
                height={64}
                className="h-7 w-auto object-contain"
              />
              <div className="text-sm text-white/46">
                {siteBranding.legalName}
              </div>
            </div>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/56">
            {siteBranding.description}
          </p>
          <p className="text-sm leading-7 text-white/56">
            For custom task delivery, email{" "}
            <a
              href={`mailto:${siteBranding.supportEmail}`}
              className="font-semibold text-[#f3c38d]"
            >
              {siteBranding.supportLabel}
            </a>
            .
          </p>
        </div>

        <FooterColumn
          title={toolCategories[0].name}
          links={toolCategories[0].entries.map((entry) => [entry.href, entry.name])}
        />
        <FooterColumn
          title={toolCategories[1].name}
          links={toolCategories[1].entries.map((entry) => [entry.href, entry.name])}
        />
        <FooterColumn
          title={toolCategories[2].name}
          links={toolCategories[2].entries.map((entry) => [entry.href, entry.name])}
        />
        <FooterColumn
          title={toolCategories[3].name}
          links={[
            ...toolCategories[3].entries.map((entry) => [entry.href, entry.name] as [string, string]),
            ["/refund", "Refund"],
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        {title}
      </h2>
      <div className="space-y-3">
        {links.map(([href, label]) => (
          <Link
            key={`${title}-${href}-${label}`}
            href={href}
            className="block text-sm text-white/66 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
