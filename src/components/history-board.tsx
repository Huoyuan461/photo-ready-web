"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  getPhotoHistoryServerSnapshot,
  readPhotoHistory,
  subscribePhotoHistory,
} from "@/lib/photo-history";

function downloadImage(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

export function HistoryBoard() {
  const history = useSyncExternalStore(
    subscribePhotoHistory,
    readPhotoHistory,
    getPhotoHistoryServerSnapshot,
  );

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          Local device history
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-night">
          Export history for the first-launch build
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
          This page stores preview sessions in browser storage so you can review
          the workflow before Supabase-backed accounts are enabled.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {history.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line-strong bg-paper p-8 text-sm leading-7 text-muted">
            No saved previews yet. Visit the live preview page, generate a
            draft, and this board will start filling in automatically.
          </div>
        ) : null}

        {history.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_80px_rgba(17,36,60,0.08)]"
          >
            <div className="relative aspect-[4/5] bg-paper">
              <Image
                src={item.image}
                alt={item.presetName}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-night">
                  {item.presetName}
                </h2>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  {item.mode}
                </span>
              </div>
              <p className="text-sm text-muted">
                Saved {new Date(item.createdAt).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadImage(
                    item.image,
                    `${item.presetName.toLowerCase().replaceAll(" ", "-")}.png`,
                  )
                }
                className="inline-flex h-11 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Download again
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
