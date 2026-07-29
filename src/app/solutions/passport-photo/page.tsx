import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Passport Photo Tool",
  description:
    "Create a fast passport and visa photo draft from one portrait in the PhotoReady launch build.",
};

export default function PassportPhotoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Search intent page
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Passport photo tool for first-launch validation
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            This page exists so the launch workspace already has a focused SEO
            surface for passport-photo demand. The live preview page handles the
            actual draft generation.
          </p>
          <Link
            href="/preview"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Open passport preview
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
