import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notes for the first-launch PhotoReady workspace.",
};

export default function PrivacyPage() {
  const { legalName, supportEmail, policyEffectiveDate } = publicConfig;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h1 className="text-5xl font-semibold tracking-tight text-night">
            Privacy
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-muted">
            Effective date: {policyEffectiveDate}
          </p>
          <div className="mt-6 space-y-5 text-base leading-8 text-muted">
            <p>
              {legalName} collects the minimum information needed to operate the PhotoReady launch site, including email addresses submitted through forms, basic checkout information from your payment provider, and support messages you send directly.
            </p>
            <p>
              Uploaded images stay in the browser unless you explicitly route a request through an external processing or storage service that you configure for production.
            </p>
            <p>
              This workspace currently uses local flat-file storage during development. Before public launch, replace it with your production storage, analytics, consent, and retention flow.
            </p>
            <p>
              You may request access, correction, or deletion of your personal data by emailing <a className="font-semibold text-night" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "What we collect",
              "Email submissions, support requests, and purchase records required for delivery and refunds.",
            ],
            [
              "Why we collect it",
              "To deliver exports, respond to support, prevent abuse, and improve the launch funnel.",
            ],
            [
              "How to request deletion",
              `Email ${supportEmail} with the email address or order reference you want removed.`,
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
