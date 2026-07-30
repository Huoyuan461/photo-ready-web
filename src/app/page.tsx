import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import {
  faqItems,
  homeHighlights,
  photoPresets,
  showcaseCards,
  siteBranding,
  toolCategories,
} from "@/lib/site-data";

export const metadata = {
  title: "PhotoReady",
  description:
    "Independent launch site for AI passport photos, LinkedIn headshots, resume photos, and standardized digital packs.",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="grid gap-8 overflow-hidden rounded-[36px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)] lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-night">
              PhotoReady · B2C first-launch studio
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-night sm:text-6xl">
                {siteBranding.name} is the independent website for AI passport
                photos and downloadable business tools.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                One site, clearly divided into photo tools, digital packs, and
                launch pages. The homepage now stays focused on the photo
                product instead of mixing in the meal agent.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/preview"
                className="inline-flex h-12 items-center justify-center rounded-full bg-night px-6 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Open photo studio
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-6 text-sm font-semibold text-night transition hover:border-accent hover:text-accent-strong"
              >
                Browse all tools
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {homeHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-line bg-paper p-4"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-night">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid gap-4 rounded-[30px] border border-line bg-[linear-gradient(180deg,rgba(10,25,45,0.98),rgba(18,37,61,0.92))] p-5 text-white shadow-[0_28px_90px_rgba(8,20,35,0.22)]">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                Product focus
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {photoPresets.slice(0, 2).map((preset) => (
                  <div key={preset.id} className="rounded-[20px] bg-white/6 p-4">
                    <div className="text-xl font-semibold">{preset.name}</div>
                    <div className="mt-2 text-sm leading-6 text-white/70">
                      {preset.sizeLabel} · {preset.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                Launch flow
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/78">
                <p>1. Upload one portrait.</p>
                <p>2. Preview U.S. and China common sizes.</p>
                <p>3. Generate a polished official-photo draft.</p>
                <p>4. Download or request a custom delivery by email.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {toolCategories.map((category) => (
            <article
              key={category.id}
              className="rounded-[32px] border border-line bg-white p-7 shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
            >
              <div
                className="h-2.5 w-16 rounded-full"
                style={{ backgroundColor: category.accent }}
              />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-night">
                {category.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {category.summary}
              </p>
              <div className="mt-5 space-y-3">
                {category.entries.slice(0, 3).map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="block rounded-[20px] border border-line bg-paper px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(33,51,73,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-night">
                        {entry.name}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                        {entry.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {entry.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Live product surfaces
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
                Photo previews, side packs, and support stay on separate pages
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                The home page now works as a clean entry point. Buyers can move
                into the studio, while PFMEA and lean tools stay in their own
                catalog area.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {showcaseCards.map((card) => (
                <Link
                  key={card.id}
                  href={card.href}
                  className="group overflow-hidden rounded-[26px] border border-line bg-paper transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(33,51,73,0.08)]"
                >
                  <div className="relative aspect-[4/3] bg-[#dfe7f3]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-2xl font-semibold tracking-tight text-night transition group-hover:text-accent-strong">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {card.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <div className="space-y-6">
            <WaitlistForm
              source="homepage-hero"
              title="Join the launch list"
              productIntent="photo-ready"
            />

            <article className="rounded-[34px] border border-line bg-white p-7 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                Custom delivery
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-night">
                Need a custom page or tool skin?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                Email{" "}
                <a
                  href={`mailto:${siteBranding.supportEmail}`}
                  className="font-semibold text-night"
                >
                  {siteBranding.supportEmail}
                </a>{" "}
                with the task details. Existing surfaces can be re-skinned or
                adapted without rebuilding the whole site.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Pricing snapshot
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
              Sell one clear outcome, not a vague AI platform
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-line bg-paper p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  Free preview
                </div>
                <div className="mt-2 text-2xl font-semibold text-night">
                  Upload and preview
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">
                  One portrait, one fast preview, no confusion about the
                  product category.
                </p>
              </div>
              <div className="rounded-[24px] border border-line bg-paper p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  Export pack
                </div>
                <div className="mt-2 text-2xl font-semibold text-night">
                  One-time purchase
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Best for users who need a finished document-ready result and
                  not a long subscription.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
              What changed on this site?
            </h2>
            <div className="mt-6 grid gap-4">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[24px] border border-line bg-paper p-5"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-night">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
