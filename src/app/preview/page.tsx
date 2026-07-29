import type { Metadata } from "next";
import { PhotoStudio } from "@/components/photo-studio";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AI Passport Studio",
  description:
    "Upload one portrait and generate U.S. passport plus China common-size official photo outputs in the launch build.",
};

export default function PreviewPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <PhotoStudio />
      </main>
      <SiteFooter />
    </>
  );
}
