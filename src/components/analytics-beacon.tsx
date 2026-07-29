"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    const fingerprint = `${pathname}:${window.innerWidth}x${window.innerHeight}`;
    if (lastSentRef.current === fingerprint) {
      return;
    }
    lastSentRef.current = fingerprint;

    const payload = {
      type: "pageview",
      path: pathname,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Ignore analytics failures in the first launch build.
    });
  }, [pathname]);

  return null;
}
