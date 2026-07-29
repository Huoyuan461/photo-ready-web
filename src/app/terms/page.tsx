import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicConfig } from "@/lib/public-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Basic terms of service for the PhotoReady launch site.",
};

export default function TermsPage() {
  const { legalName, supportEmail, policyEffectiveDate } = publicConfig;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <h1 className="text-5xl font-semibold tracking-tight text-night">
            Terms of service
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-muted">
            Effective date: {policyEffectiveDate}
          </p>
          <div className="mt-6 space-y-5 text-base leading-8 text-muted">
            <p>
              These terms govern your use of the PhotoReady launch site operated by {legalName}. By using the site, you agree to these terms and to the linked privacy and refund policies.
            </p>
            <p>
              You are responsible for using images you have the right to upload and for checking whether exported photos meet the formal rules of the employer, platform, government office, or visa authority you plan to submit them to.
            </p>
            <p>
              Digital products and side packs are provided as self-serve tools. They do not create a consulting engagement, legal advice relationship, or guaranteed acceptance by any third party.
            </p>
            <p>
              Questions about these terms can be sent to <a className="font-semibold text-night" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            [
              "Acceptable use",
              "Do not upload unlawful, abusive, or infringing content, and do not attempt to disrupt the service.",
            ],
            [
              "No guarantee",
              "Exports are designed to help, but final acceptance depends on the destination platform or authority.",
            ],
            [
              "Service changes",
              "The launch site may change, pause, or remove features as the product is validated and improved.",
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
