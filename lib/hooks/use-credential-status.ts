"use client";

import { useState, useCallback, useEffect } from "react";

export type CredentialStatusData = {
  exists: boolean;
  status: string | null;
  expiresAt: string | null;
};

export type CredentialStatusState =
  | { kind: "loading" }
  | { kind: "pending"; data: CredentialStatusData }
  | { kind: "verified"; data: CredentialStatusData }
  | { kind: "expired"; data: CredentialStatusData }
  | { kind: "error"; message: string }
  | { kind: "idle"; data: CredentialStatusData | null };

export type UseCredentialStatusResult = {
  state: CredentialStatusState;
  loading: boolean;
  refetch: () => Promise<void>;
};

const CREDENTIAL_STATUS_URL = "/api/credential/status";

function deriveState(
  data: CredentialStatusData | null,
  loading: boolean,
  error: string | null
): CredentialStatusState {
  if (error) return { kind: "error", message: error };
  if (loading) return { kind: "loading" };
  if (!data) return { kind: "idle", data: null };
  if (!data.exists)
    return { kind: "idle", data: { exists: false, status: null, expiresAt: null } };
  const status = (data.status ?? "").toUpperCase();
  if (status === "VERIFIED") return { kind: "verified", data };
  if (status === "EXPIRED") return { kind: "expired", data };
  if (status === "PENDING" || status === "REVOKED")
    return { kind: "pending", data };
  return { kind: "pending", data };
}

export function useCredentialStatus(
  wallet: string | null
): UseCredentialStatusResult {
  const [data, setData] = useState<CredentialStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!wallet || wallet.trim() === "") {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        wallet: wallet.trim(),
      });
      const res = await fetch(`${CREDENTIAL_STATUS_URL}?${params.toString()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as CredentialStatusData;
      if (json == null || typeof json !== "object") {
        setError("Invalid response");
        setData(null);
        return;
      }
      setData({
        exists: Boolean(json.exists),
        status: json.status ?? null,
        expiresAt: json.expiresAt ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet || wallet.trim() === "") {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    void refetch();
  }, [wallet, refetch]);

  useEffect(() => {
    if (!wallet?.trim()) return;
    const onFocus = () => void refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [wallet, refetch]);

  const state = deriveState(data, loading, error);

  return { state, loading, refetch };
}
