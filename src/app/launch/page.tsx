import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export const metadata: Metadata = {
  title: "Launch Checklist",
  description:
    "Founder-facing launch readiness checklist for publishing PhotoReady and the side-product storefront.",
};

export default function LaunchPage() {
  const readiness = getLaunchReadiness();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Founder launch checklist
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Publish the site in the right order and focus on revenue first
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            This page turns the plan into execution. Finish the blocking setup
            items first, then ship the site, then drive traffic into one paid
            offer before expanding anything else.
          </p>
          <div className="mt-6 inline-flex rounded-full bg-mist px-4 py-2 text-sm font-semibold text-night">
            {readiness.readyCount} / {readiness.totalCount} core launch checks ready
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {readiness.checks.map((check) => (
            <article
              key={check.label}
              className="rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-night">
                  {check.label}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    check.ready
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {check.ready ? "Ready" : "Action needed"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                {check.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "Week 1",
              "Connect domain, support email, one-time checkout, and analytics. Publish the site even if subscription and side packs are not ready yet.",
            ],
            [
              "Week 2",
              "Post 3 focused SEO pages, submit Product Hunt assets, and send short-form traffic to the passport and LinkedIn angles first.",
            ],
            [
              "Week 3-4",
              "Measure visits, waitlist signups, and paid conversions. Only expand features after you see repeat purchase intent or clear failure data.",
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
            Revenue target checkpoints
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Month 1", "300 visits, 30 signups, 5 paid users"],
              ["Month 3", "Stable one-time sales plus the first recurring users"],
              ["Month 12", "RMB 17k+ monthly average with side packs as add-on revenue"],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[24px] border border-line bg-paper p-5"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  {title}
                </div>
                <div className="mt-3 text-base font-semibold leading-7 text-night">
                  {body}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Review checkout status
            </Link>
            <Link
              href="/ops"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-night transition hover:border-accent hover:text-accent-strong"
            >
              Open Chinese execution plan
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
