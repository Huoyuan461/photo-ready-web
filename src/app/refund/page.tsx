import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund notes for the first-launch PhotoReady product setup.",
};

export default function RefundPage() {
  const { supportEmail, policyEffectiveDate } = publicConfig;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h1 className="text-5xl font-semibold tracking-tight text-night">
            Refund policy
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-muted">
            Effective date: {policyEffectiveDate}
          </p>
          <div className="mt-6 space-y-5 text-base leading-8 text-muted">
            <p>
              The first public launch should keep a simple rule set: refund failed exports, technical defects, duplicate charges, and accidental duplicate purchases quickly.
            </p>
            <p>
              For one-time export packs, request refunds within 7 days of purchase. For subscriptions, cancel future renewals at any time and request billing review for duplicate or failed charges.
            </p>
            <p>
              Requests should be sent to <a className="font-semibold text-night" href={`mailto:${supportEmail}`}>{supportEmail}</a> with the purchase email, order reference, and a short explanation.
            </p>
            <p>
              Once Lemon Squeezy is connected, mirror these rules in checkout confirmations and customer receipts so the policy stays consistent.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "Eligible",
              "Failed delivery, broken exports, duplicate charges, or clear technical defects.",
            ],
            [
              "Not eligible",
              "Normal use after successful delivery unless a technical issue can be reproduced.",
            ],
            [
              "Processing time",
              "Review within 2 business days after support receives a valid request.",
            ],
          ].map(([title, body]) => (
            <article
              key={title}
              className="rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-night">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {body}
              </p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
