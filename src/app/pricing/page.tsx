import type { Metadata } from "next";
import Link from "next/link";
import { PurchaseLink } from "@/components/purchase-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCommerceLinks } from "@/lib/commerce";
import { pricingTiers } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Review the launch pricing model for free previews, one-time export packs, and recurring subscriptions.",
};

export default function PricingPage() {
  const commerce = getCommerceLinks();
  const readiness = [
    { label: "One-time export", ready: commerce["export-pack"].ready },
    { label: "Unlimited subscription", ready: commerce.subscription.ready },
    { label: "PFMEA pack", ready: commerce.pfmea.ready },
    { label: "Lean kit", ready: commerce.lean.ready },
    { label: "Office checklists", ready: commerce.office.ready },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Pricing architecture
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Built to validate revenue before you commit to a heavy product stack
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            The first version keeps one free entry point, one clean one-time
            purchase, and one recurring offer. That is enough to validate the
            funnel before you scale ads or build cloud accounts.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={`rounded-[32px] border p-7 shadow-[0_24px_80px_rgba(17,36,60,0.08)] ${
                tier.featured
                  ? "border-transparent bg-night text-white"
                  : "border-line bg-white text-night"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-70">
                {tier.cadence}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {tier.name}
              </h2>
              <div className="mt-5 text-5xl font-semibold tracking-tight">
                {tier.price}
              </div>
              <p className="mt-5 text-sm leading-7 opacity-78">
                {tier.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-7">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {tier.name === "Export Pack" ? (
                  <PurchaseLink
                    link={commerce["export-pack"]}
                    variant={tier.featured ? "secondary" : "primary"}
                    className={
                      tier.featured
                        ? "border-white/30 bg-white text-night hover:border-white hover:bg-paper"
                        : ""
                    }
                  />
                ) : tier.name === "Unlimited" ? (
                  <PurchaseLink
                    link={commerce.subscription}
                    variant={tier.featured ? "secondary" : "primary"}
                    className={
                      tier.featured
                        ? "border-white/30 bg-white text-night hover:border-white hover:bg-paper"
                        : ""
                    }
                  />
                ) : (
                  <Link
                    href={tier.href}
                    className={`inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                      tier.featured
                        ? "bg-white text-night hover:bg-paper"
                        : "bg-night text-white hover:bg-accent-strong"
                    }`}
                  >
                    {tier.ctaLabel}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h2 className="text-3xl font-semibold tracking-tight text-night">
            Checkout wiring
          </h2>
          <p className="mt-4 text-base leading-8 text-muted">
            Use `LEMON_SQUEEZY_CHECKOUT_URL` for the one-time offer and
            `LEMON_SQUEEZY_SUBSCRIPTION_URL` for the recurring plan. Side
            products also support dedicated Lemon Squeezy links, so the full
            storefront can publish from one domain.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {readiness.map(({ label, ready }) => (
              <div
                key={label}
                className="rounded-[24px] border border-line bg-paper p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-night">
                    {label}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      ready
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ready ? "Ready" : "Needs URL"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <PurchaseLink link={commerce["export-pack"]} />
            <PurchaseLink link={commerce.subscription} variant="secondary" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
