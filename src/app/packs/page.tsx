import type { Metadata } from "next";
import { PurchaseLink } from "@/components/purchase-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCommerceLinks } from "@/lib/commerce";
import { sidePacks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Digital Packs",
  description:
    "Browse the PFMEA, lean, and office checklist side-product catalog for the first launch.",
};

export default function PacksPage() {
  const commerce = getCommerceLinks();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Side-product catalog
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Productize the earlier engineering work without turning it into a
            full consulting business again
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            These packs live in the same launch system, but they do not own the
            roadmap. They exist to create additional cash flow and proof of
            execution while the B2C photo product stays in front.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {sidePacks.map((pack) => (
            <article
              key={pack.id}
              className="rounded-[32px] border border-line bg-white p-7 shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  {pack.badge}
                </span>
                <span className="text-3xl font-semibold tracking-tight text-night">
                  {pack.price}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-night">
                {pack.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {pack.summary}
              </p>
              <div className="mt-6 rounded-[24px] border border-dashed border-line-strong bg-paper p-4">
                <PurchaseLink link={commerce[pack.id]} variant="secondary" />
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
