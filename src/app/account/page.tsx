import type { Metadata } from "next";
import { HistoryBoard } from "@/components/history-board";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Local History",
  description:
    "Review locally saved preview sessions and re-download exports on the same device.",
};

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10 lg:py-12">
        <HistoryBoard />
      </main>
      <SiteFooter />
    </>
  );
}
