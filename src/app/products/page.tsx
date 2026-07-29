import type { Metadata } from "next";
import Link from "next/link";
import { PurchaseLink } from "@/components/purchase-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCommerceLinks } from "@/lib/commerce";
import { photoPresets, sidePacks, siteBranding, toolCategories } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Tool Catalog",
  description:
    "Browse the full Shanmu tool catalog with clear functional categories for photo workflows, digital packs, ops pages, and support.",
};

export default function ProductsPage() {
  const commerce = getCommerceLinks();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-8 lg:px-10 lg:py-12">
        <section className="grid gap-6 rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Tool catalog
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
              One catalog page for every current tool and support surface
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              {siteBranding.description}
            </p>
          </div>

          <div className="rounded-[28px] border border-line bg-paper-soft p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Editable setup
            </p>
            <div className="mt-5 space-y-3">
              {[
                "Logo files are now transparent SVG assets.",
                "All category copy and route grouping lives in src/lib/site-data.ts.",
                `Custom tasks can be scoped by email at ${siteBranding.supportEmail}.`,
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-line bg-white p-4 text-sm leading-7 text-night"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Main B2C product
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
                AI passport photo workflow
              </h2>
            </div>
            <div className="flex gap-3">
              <Link
                href="/preview"
                className="inline-flex h-12 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Open studio
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-night transition hover:border-accent hover:text-accent-strong"
              >
                Review pricing
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <PurchaseLink link={commerce["export-pack"]} />
            <PurchaseLink link={commerce.subscription} variant="secondary" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {photoPresets.map((preset) => (
              <article
                key={preset.id}
                className="rounded-[26px] border border-line p-5"
                style={{ backgroundColor: preset.background }}
              >
                <div
                  className="h-2.5 w-18 rounded-full"
                  style={{ backgroundColor: preset.accent }}
                />
                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-night">
                  {preset.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {preset.description}
                </p>
                <div className="mt-4 text-sm font-semibold text-accent-strong">
                  {preset.sizeLabel}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6">
          {toolCategories.map((category) => (
            <article
              key={category.id}
              className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div
                    className="mb-4 h-2.5 w-18 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                    {category.name}
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
                    {category.entries.length} clearly grouped entries
                  </h2>
                  <p className="mt-4 text-base leading-8 text-muted">
                    {category.summary}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={category.entries[0]?.href ?? "/"}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Open section
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {category.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="group rounded-[26px] border border-line bg-paper-soft p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(33,51,73,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                        {entry.kind}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        {entry.status}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-night transition group-hover:text-accent-strong">
                      {entry.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {entry.summary}
                    </p>
                    <div className="mt-6 text-sm font-semibold text-accent-strong">
                      {entry.badge}
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Standardized digital products
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
            Side packs stay standardized instead of becoming heavy service delivery
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {sidePacks.map((pack) => (
              <article
                key={pack.id}
                className="rounded-[28px] border border-line bg-paper p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                    {pack.badge}
                  </span>
                  <span className="text-3xl font-semibold tracking-tight text-night">
                    {pack.price}
                  </span>
                </div>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-night">
                  {pack.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {pack.summary}
                </p>
                <div className="mt-6">
                  <PurchaseLink link={commerce[pack.id]} variant="secondary" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
