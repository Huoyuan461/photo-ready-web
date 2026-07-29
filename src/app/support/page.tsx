import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Support and setup notes for the first-launch PhotoReady build.",
};

export default function SupportPage() {
  const { supportEmail } = publicConfig;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h1 className="text-5xl font-semibold tracking-tight text-night">
            Support
          </h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-muted">
            <p>
              Contact <a className="font-semibold text-night" href={`mailto:${supportEmail}`}>{supportEmail}</a> for export problems, billing questions, refund requests, or data deletion requests.
            </p>
            <p>
              Target response times for the first public launch: billing and failed export issues within 24 hours, general product questions within 2 business days.
            </p>
            <p>
              Include your order email, the product name, and a short description of the issue so support can verify the purchase quickly.
            </p>
            <p>
              For browser-only testing, open the live preview page and upload a portrait. Draft mode works entirely in the browser. For stronger cleanup, you can still connect the local enhanced photo service later.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "Before purchase",
              "Use the preview flow first, then choose the export pack or unlimited plan once checkout is connected.",
            ],
            [
              "After purchase",
              "If an export fails or looks incorrect, send the order reference and one screenshot so it can be reissued or refunded.",
            ],
            [
              "Policy links",
              "Keep privacy, refund, and terms pages visible in your footer before launch.",
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

        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h2 className="text-3xl font-semibold tracking-tight text-night">
            Next launch actions
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Check pricing readiness
            </Link>
            <Link
              href="/launch"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-night transition hover:border-accent hover:text-accent-strong"
            >
              Open launch checklist
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
