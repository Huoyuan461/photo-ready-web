import Image from "next/image";
import Link from "next/link";
import { siteBranding } from "@/lib/site-data";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/products", label: "Tool catalog" },
  { href: "/preview", label: "Photo studio" },
  { href: "/packs", label: "Digital packs" },
  { href: "/ops", label: "Ops workspace" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[rgba(12,18,29,0.72)] px-4 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src={siteBranding.logoSquare}
            alt={siteBranding.logoAlt}
            width={44}
            height={44}
            className="h-10 w-10 shrink-0 rounded-2xl object-contain shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:h-11 sm:w-11"
          />
          <div className="min-w-0">
            <Image
              src={siteBranding.logoWordmark}
              alt={siteBranding.name}
              width={260}
              height={72}
              className="h-6 w-auto max-w-[138px] object-contain sm:h-7 sm:max-w-[190px] lg:h-8 lg:max-w-[260px]"
            />
            <div className="hidden max-w-[320px] text-sm leading-5 text-white/58 xl:block">
              {siteBranding.tagline}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/72 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="hidden rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-white/76 transition hover:bg-white/10 sm:inline-flex"
          >
            All tools
          </Link>
          <Link
            href="/preview"
            className="shrink-0 rounded-full bg-[#efe6d8] px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-night shadow-[0_18px_42px_rgba(0,0,0,0.18)] transition hover:translate-y-[-1px] hover:bg-white sm:px-5"
          >
            Open studio
          </Link>
        </div>
      </div>
    </header>
  );
}
