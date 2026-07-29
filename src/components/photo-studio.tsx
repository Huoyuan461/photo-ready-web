"use client";

import Image from "next/image";
import { startTransition, useState, useSyncExternalStore } from "react";
import {
  getPhotoHistoryServerSnapshot,
  readPhotoHistory,
  subscribePhotoHistory,
  writePhotoHistory,
} from "@/lib/photo-history";
import { photoPresets, siteBranding } from "@/lib/site-data";

type ProcessPhotoResponse = {
  ok?: boolean;
  image?: string;
  error?: string;
};

async function normalizeUploadImage(source: string, maxDimension = 1280) {
  const image = await loadImage(source);
  const longestEdge = Math.max(image.width, image.height);

  if (longestEdge <= maxDimension) {
    return source;
  }

  const scale = maxDimension / longestEdge;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function fitImageToPreset(
  source: string,
  width: number,
  height: number,
  background: string,
) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const imageRatio = image.width / image.height;
  const frameRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let drawX = 0;
  let drawY = 0;

  if (imageRatio > frameRatio) {
    drawHeight = height * 0.94;
    drawWidth = drawHeight * imageRatio;
    drawX = (width - drawWidth) / 2;
    drawY = height * 0.04;
  } else {
    drawWidth = width * 0.92;
    drawHeight = drawWidth / imageRatio;
    drawX = (width - drawWidth) / 2;
    drawY = Math.min(height * 0.06, height - drawHeight);
  }

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.strokeStyle = "rgba(16,32,51,0.08)";
  context.lineWidth = Math.max(1, Math.round(width / 280));
  context.strokeRect(1, 1, width - 2, height - 2);

  return canvas.toDataURL("image/png");
}

function triggerDownload(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

export function PhotoStudio() {
  const [selectedPreset, setSelectedPreset] = useState(photoPresets[0]);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "drafting" | "generating" | "done" | "error"
  >("idle");
  const [message, setMessage] = useState(
    "Upload one portrait, then generate an American-style official photo that can change outfit, expression, and pose while keeping your identity.",
  );
  const history = useSyncExternalStore(
    subscribePhotoHistory,
    readPhotoHistory,
    getPhotoHistoryServerSnapshot,
  );
  const historyCount = history.length;

  async function buildDraft(nextSource: string, nextPreset = selectedPreset) {
    setStatus("drafting");
    setMessage("Building the exact output frame on this device...");

    startTransition(() => {
      fitImageToPreset(
        nextSource,
        nextPreset.width,
        nextPreset.height,
        nextPreset.background,
      )
        .then((image) => {
          setDraftImage(image);
          setGeneratedImage(null);
          setStatus("done");
          setMessage(
            "Draft crop ready. Generate next to create an American-style official portrait with a changed outfit, expression, and studio pose.",
          );
          writePhotoHistory({
            id: `${Date.now()}-${nextPreset.id}-draft`,
            presetName: nextPreset.name,
            createdAt: new Date().toISOString(),
            mode: "draft",
            image,
          });
        })
        .catch(() => {
          setStatus("error");
          setMessage("The browser draft crop could not be prepared.");
        });
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        startTransition(() => {
          normalizeUploadImage(reader.result as string)
            .then((normalized) => {
              setSourceImage(normalized);
              return buildDraft(normalized, selectedPreset);
            })
            .catch(() => {
              setStatus("error");
              setMessage("The uploaded portrait could not be prepared for official-photo generation.");
            });
        });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerateOfficialPhoto() {
    if (!sourceImage) {
      return;
    }

    setStatus("generating");
    setMessage("Sending your portrait to the local AI engine for American-style official-photo generation...");

    try {
      const response = await fetch("/api/process-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: sourceImage,
          promptFocus: selectedPreset.promptFocus,
          preset: {
            id: selectedPreset.id,
            widthPx: selectedPreset.width,
            heightPx: selectedPreset.height,
            sizeLabel: selectedPreset.sizeLabel,
            targetRegion: selectedPreset.targetRegion,
          },
        }),
      });

      const payload = (await response.json()) as ProcessPhotoResponse;
      if (!response.ok || !payload.ok || !payload.image) {
        throw new Error(payload.error || "Image generation is unavailable.");
      }

      const fitted = await fitImageToPreset(
        payload.image,
        selectedPreset.width,
        selectedPreset.height,
        "#ffffff",
      );

      setGeneratedImage(fitted);
      setStatus("done");
      setMessage(
        `Official ${selectedPreset.name} output ready. Download it now or describe a custom delivery task at ${siteBranding.supportEmail}.`,
      );

      writePhotoHistory({
        id: `${Date.now()}-${selectedPreset.id}-ai`,
        presetName: selectedPreset.name,
        createdAt: new Date().toISOString(),
        mode: "ai-generated",
        image: fitted,
      });
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The official photo could not be generated right now.",
      );
    }
  }

  const visibleImage = generatedImage || draftImage;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
      <aside className="rounded-[32px] border border-line bg-white p-6 shadow-[0_30px_80px_rgba(17,36,60,0.08)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            AI passport studio
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-night">
            Choose an official size and build the photo in one session
          </h2>
        </div>

        <label className="mb-3 block text-sm font-medium text-night">
          Upload portrait
        </label>
        <label className="mb-5 flex cursor-pointer flex-col items-start gap-3 rounded-2xl border border-dashed border-line-strong bg-paper px-4 py-4 transition hover:border-accent">
          <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-night px-5 text-sm font-semibold text-white">
            Choose image
          </span>
          <span className="min-w-0 text-sm text-muted">
            <span className="block truncate font-medium text-night">
              {selectedFileName}
            </span>
            <span className="mt-1 block text-xs leading-5">
              JPG, PNG, or HEIC portrait with visible head and shoulders
            </span>
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <div className="space-y-3">
          {photoPresets.map((preset) => {
            const active = preset.id === selectedPreset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  if (sourceImage) {
                    void buildDraft(sourceImage, preset);
                  }
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  active
                    ? "border-transparent bg-night text-white shadow-[0_24px_50px_rgba(17,36,60,0.24)]"
                    : "border-line bg-paper text-night hover:border-accent"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{preset.name}</div>
                    <div className="mt-1 text-sm leading-6 opacity-80">
                      {preset.description}
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
                      {preset.sizeLabel}
                    </div>
                  </div>
                  <span
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-[36px] border border-line bg-night p-6 text-white shadow-[0_36px_90px_rgba(17,36,60,0.18)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Result surface
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {selectedPreset.name}
            </h2>
          </div>
          <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/80">
            {status === "drafting" && "Preparing frame"}
            {status === "generating" && "Generating official photo"}
            {status === "done" && "Ready to export"}
            {status === "idle" && "Waiting for upload"}
            {status === "error" && "Needs retry"}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,#1f3e64,#13263f_58%,#0f1d31)]">
              {visibleImage ? (
                <Image
                  src={visibleImage}
                  alt={`${selectedPreset.name} preview`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="flex w-full max-w-[16rem] flex-col items-center gap-5 rounded-[28px] border border-white/10 bg-white/6 px-6 py-8 text-center text-white/72">
                    <div className="grid h-18 w-18 place-items-center rounded-full border border-white/12 bg-white/8 text-2xl">
                      ↑
                    </div>
                    <div className="mx-auto">
                      <p className="text-2xl font-semibold leading-tight text-white">
                        Upload one portrait
                      </p>
                      <p className="mt-3 text-sm leading-7">
                        First we frame the selected official size, then we call
                        the local ID-photo engine to produce the white-background ID portrait.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/12 bg-white/8 p-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                Current note
              </div>
              <p className="mt-3 text-sm leading-7 text-white/78">{message}</p>
            </div>

            <div className="space-y-2 text-sm text-white/72">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                <span>Current output</span>
                <span>
                  {generatedImage ? "AI generated" : draftImage ? "Draft crop" : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                <span>Preset size</span>
                <span>{selectedPreset.sizeLabel}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                <span>Saved on device</span>
                <span>{historyCount} session{historyCount === 1 ? "" : "s"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateOfficialPhoto}
              disabled={!sourceImage || status === "generating"}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate official photo
            </button>
            <button
              type="button"
              onClick={() => {
                if (visibleImage) {
                  triggerDownload(
                    visibleImage,
                    `${selectedPreset.slug}-${Date.now()}.png`,
                  );
                }
              }}
              disabled={!visibleImage}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download current image
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-[32px] border border-line bg-white p-6 shadow-[0_30px_80px_rgba(17,36,60,0.08)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            What ships now
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-night">
            Focus the main product on official photo demand
          </h2>
        </div>

        <div className="space-y-4">
          {[
            "Primary product: U.S. passport plus China common ID sizes.",
            "White-background official portrait generation now routes through the local ID-photo engine.",
            `Other finished tools stay visible in the catalog and can be customized after you explain the task at ${siteBranding.supportEmail}.`,
          ].map((item) => (
            <div
              key={item}
              className="rounded-[24px] border border-line bg-paper-soft p-4 text-sm leading-7 text-night"
            >
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
