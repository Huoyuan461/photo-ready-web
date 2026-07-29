import type { Metadata } from "next";
import { OrderAutomationBoard } from "@/components/order-automation-board";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Legacy Ops Dashboard",
  description:
    "Legacy internal operations dashboard for order automation and GitHub workflow experiments.",
};

export default function LegacyOpsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <OrderAutomationBoard />
      </main>
      <SiteFooter />
    </>
  );
}
