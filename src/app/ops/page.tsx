import type { Metadata } from "next";
import { ImplementationPlanBoard } from "@/components/implementation-plan-board";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Implementation Plan",
  description:
    "Chinese founder-facing implementation plan for launching the PhotoReady B2C product over the next 12 months.",
};

export default function OpsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <ImplementationPlanBoard />
      </main>
      <SiteFooter />
    </>
  );
}
