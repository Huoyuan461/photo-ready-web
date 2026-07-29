import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  faqItems,
  photoPresets,
  showcaseCards,
  siteBranding,
  toolCategories,
} from "@/lib/site-data";

export default function HomePage() {
  const primaryCategory = toolCategories[0];
  const supportCategory = toolCategories[3];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(240,149,81,0.22),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(109,146,255,0.2),transparent_26%),linear-gradient(145deg,#111821_0%,#182233_44%,#0d1320_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/78">
                Shanmu tool hub
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-warm)]" />
                B2C first
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                  Passport photos,
                  <span className="block text-white/62">
                    tool products, and custom delivery
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                  {siteBranding.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/preview"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-night transition hover:bg-[#f4eadf]"
                >
                  Open AI passport studio
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/14 bg-white/6 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore the catalog
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["U.S. + China", "One upload, multiple official ratios."],
                  ["Tool shelf", "PFMEA, lean, and office packs stay grouped and visible."],
                  ["Custom work", siteBranding.supportEmail],
                ].map(([title, copy]) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-white/10 bg-black/18 p-4 backdrop-blur-sm"
                  >
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/62">
                      {copy}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between text-sm text-white/58">
                  <span>Core product</span>
                  <span>Live preview</span>
                </div>
                <div className="grid gap-3">
                  {photoPresets.map((preset, index) => (
                    <article
                      key={preset.id}
                      className="grid gap-4 rounded-[24px] border border-white/8 p-4 md:grid-cols-[minmax(0,1fr)_120px] md:items-center"
                      style={{ backgroundColor: `${preset.accent}18` }}
                    >
                      <div className="space-y-3">
                        <div
                          className="h-2.5 w-14 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {preset.name}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-white/62">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3 text-left md:text-center">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/48">
                          {index === 0 ? "Main export" : "Preset"}
                        </div>
                        <div className="mt-2 text-base font-semibold text-white">
                          {preset.sizeLabel}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[28px] border border-white/10 bg-[#efe6d8] p-5 text-night">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-night/52">
                    Today&apos;s structure
                  </div>
                  <div className="mt-5 space-y-4">
                    {toolCategories.map((category) => (
                      <div
                        key={category.id}
                        className="rounded-[22px] border border-black/6 bg-white/74 px-4 py-4 shadow-[0_18px_40px_rgba(17,24,39,0.08)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-base font-semibold">{category.name}</div>
                          <div
                            className="h-2.5 w-10 rounded-full"
                            style={{ backgroundColor: category.accent }}
                          />
                        </div>
                        <div className="mt-2 text-sm leading-6 text-night/60">
                          {category.entries.length} visible routes
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/18 p-5 text-white/72 backdrop-blur-sm">
                  <div className="flex h-full flex-col gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.18em] text-white/48">
                        Positioning
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        Sell a clear result, not generic AI language
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/58">
                        Let the first screen explain the photo outcome fast, then
                        route side products and custom delivery into calmer
                        support sections.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["Photo first", "Lead the site with one visible conversion path."],
                        ["Custom later", "Move bespoke requests behind product understanding."],
                      ].map(([title, copy]) => (
                        <div
                          key={title}
                          className="rounded-[22px] border border-white/10 bg-white/5 p-4"
                        >
                          <div className="text-sm font-semibold text-white">{title}</div>
                          <div className="mt-2 text-sm leading-6 text-white/58">
                            {copy}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/support"
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white transition hover:bg-white/8 lg:w-auto"
                    >
                      Request custom delivery
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[34px] border border-white/10 bg-[#111827] p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.25)]">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/46">
              Product architecture
            </div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white">
              One main B2C offer, one secondary tool shelf
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/64">
              The homepage now leads with one commercial path: upload a portrait,
              choose a region, and export a usable official result. Older
              manufacturing and office tools stay discoverable without taking over
              the first-screen decision.
            </p>

            <div className="mt-8 grid gap-4">
              {primaryCategory.entries.map((entry) => (
                <Link
                  key={entry.id}
                  href={entry.href}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold text-white">
                      {entry.name}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/56">
                      {entry.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    {entry.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              {showcaseCards.slice(0, 2).map((card, index) => (
                <article
                  key={card.id}
                  className="overflow-hidden rounded-[34px] border border-black/8 bg-[#f6efe6] shadow-[0_28px_80px_rgba(24,30,38,0.08)]"
                >
                  <div className="relative aspect-[11/8] bg-[#e8dfd1]">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      unoptimized
                      loading={index === 0 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <div className="text-sm uppercase tracking-[0.18em] text-night/46">
                        Delivered page
                      </div>
                      <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-night">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-7 text-night/66">{card.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {card.bullets.map((bullet) => (
                        <span
                          key={bullet}
                          className="rounded-full border border-black/8 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-night/66"
                        >
                          {bullet}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-4 rounded-[34px] border border-black/8 bg-white p-7 shadow-[0_28px_80px_rgba(24,30,38,0.06)] md:grid-cols-[1fr_1fr]">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-night/44">
                  Support zone
                </div>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-night">
                  Keep the rest of the tools organized, not hidden
                </h3>
                <p className="mt-4 text-sm leading-7 text-night/62">
                  Your current engineering and operations tools still matter, but
                  they now live in their own support shelf and custom-delivery
                  lane.
                </p>
              </div>

              <div className="grid gap-3">
                {supportCategory.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={entry.href}
                    className="rounded-[24px] border border-black/8 bg-[#f5efe8] px-4 py-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-night">{entry.name}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-night/46">
                        {entry.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-night/58">
                      {entry.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#161e2d_0%,#111827_100%)] p-7 shadow-[0_28px_100px_rgba(0,0,0,0.24)]">
            <div className="text-sm uppercase tracking-[0.2em] text-white/44">
              Three decisions
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Use the site as a storefront",
                  copy: "Lead with one conversion path instead of a mixed software list.",
                },
                {
                  title: "Route photo work to one studio flow",
                  copy: "Preview, generate, and re-download from one route with obvious presets.",
                },
                {
                  title: "Keep custom work high-intent",
                  copy: "Use email only after visitors understand the finished products already on sale.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {faqItems.slice(0, 3).map((item) => (
              <article
                key={item.question}
                className="rounded-[30px] border border-black/8 bg-[#f7f1e8] p-6 shadow-[0_20px_50px_rgba(24,30,38,0.05)]"
              >
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-night">
                  {item.question}
                </h2>
                <p className="mt-3 text-sm leading-7 text-night/62">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
