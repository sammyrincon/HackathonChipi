"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { KycStatusResponse } from "@/app/api/kyc/status/route";

export function DashboardCredentialStatus({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [data, setData] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/kyc/status")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<KycStatusResponse>;
      })
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const isVerified = data?.status === "verified";
  const isExpired = data?.status === "expired";

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        {isVerified ? (
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        ) : (
          <ShieldX className="h-5 w-5 text-zinc-500" />
        )}
        <CardTitle className="text-zinc-100">ZeroPass credential</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking credential...
          </div>
        )}
        {!loading && error && (
          <p className="text-sm text-zinc-500">Could not load credential status.</p>
        )}
        {!loading && !error && isVerified && (
          <>
            <p className="text-sm text-emerald-400">Verified — linked to your wallet</p>
            {data?.credentialId && (
              <p className="text-xs text-zinc-500">
                ID:{" "}
                <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-zinc-400">
                  {data.credentialId}
                </code>
              </p>
            )}
            {data?.expiresAt && (
              <p className="text-xs text-zinc-500">
                Expires:{" "}
                {new Date(data.expiresAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </>
        )}
        {!loading && !error && isExpired && (
          <p className="text-sm text-amber-400">Credential expired. Please complete KYC again.</p>
        )}
        {!loading && !error && !isVerified && !isExpired && (
          <p className="text-sm text-zinc-400">
            No credential yet. Complete KYC to get your ZeroPass credential.
          </p>
        )}
        {walletAddress && (
          <p className="truncate font-mono text-xs text-zinc-500">
            {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
