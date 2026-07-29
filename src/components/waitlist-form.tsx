"use client";

import { startTransition, useState } from "react";

type WaitlistFormProps = {
  source: string;
  title?: string;
  compact?: boolean;
  productIntent?: string;
};

export function WaitlistForm({
  source,
  title = "Join the early access list",
  compact = false,
  productIntent = "photo-ready",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    startTransition(async () => {
      try {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            source,
            intent: productIntent,
            requestedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Could not save lead");
        }

        setStatus("done");
        setEmail("");
        setName("");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel pulse-glow rounded-[32px] ${
        compact ? "p-5" : "p-7"
      }`}
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Capture the first 30 high-intent signups, then route them into
          Lemon Squeezy checkout and PostHog later.
        </p>
      </div>

      <div className="grid gap-3">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-muted focus:border-accent"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dce8ff_0%,#9ab8ff_100%)] px-6 text-sm font-semibold text-[#07111f] shadow-[0_20px_50px_rgba(131,168,255,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_56px_rgba(131,168,255,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Saving..." : "Join launch list"}
        </button>
        <span className="text-sm text-muted">
          {status === "done"
            ? "Saved. You are in the first-launch list."
            : status === "error"
              ? "Could not save just now. Try again."
              : "No spam. Early testers only."}
        </span>
      </div>
    </form>
  );
}
