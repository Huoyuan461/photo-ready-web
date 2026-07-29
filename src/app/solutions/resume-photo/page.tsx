import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Resume Photo Tool",
  description:
    "Create a resume-ready portrait draft with an instant browser preview in the PhotoReady launch build.",
};

export default function ResumePhotoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Search intent page
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-night">
            Resume photo tool for cleaner job applications
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            This launch page supports resume-photo demand and connects directly
            to the live product preview so search traffic has somewhere clear to
            convert.
          </p>
          <Link
            href="/preview"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Open resume preview
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
