"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Refreshes dashboard server data when the window gains focus (e.g. user
 * switched back from another tab after creating a wallet). Ensures new wallet
 * and credential data from Supabase/Chipi are reflected.
 */
export function DashboardRefreshOnFocus() {
  const router = useRouter();
  const lastRefresh = useRef(0);
  const REFRESH_DEBOUNCE_MS = 2000;

  useEffect(() => {
    function onFocus() {
      const now = Date.now();
      if (now - lastRefresh.current < REFRESH_DEBOUNCE_MS) return;
      lastRefresh.current = now;
      router.refresh();
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  return null;
}
