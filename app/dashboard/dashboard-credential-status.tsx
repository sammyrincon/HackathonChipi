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
    <Card className="border-[#111111] bg-[#F9F9F7]">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        {isVerified ? (
          <ShieldCheck className="h-5 w-5 text-[#CC0000]" />
        ) : (
          <ShieldX className="h-5 w-5 text-[#111111]/60" />
        )}
        <CardTitle className="font-headline text-[#111111]">ZeroPass credential</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="flex items-center gap-2 font-body text-sm text-[#111111]/70">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking credential...
          </div>
        )}
        {!loading && error && (
          <p className="font-body text-sm text-[#111111]/70">Could not load credential status.</p>
        )}
        {!loading && !error && isVerified && (
          <>
            <p className="font-body text-sm text-[#CC0000]">Verified — linked to your wallet</p>
            {data?.credentialId && (
              <p className="text-xs text-[#111111]/70">
                ID:{" "}
                <code className="font-mono-data bg-[#111111]/5 border border-[#111111] px-1 py-0.5 text-[#111111]">
                  {data.credentialId}
                </code>
              </p>
            )}
            {data?.expiresAt && (
              <p className="text-xs text-[#111111]/70">
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
          <p className="font-body text-sm text-[#CC0000]">Credential expired. Please complete KYC again.</p>
        )}
        {!loading && !error && !isVerified && !isExpired && (
          <p className="font-body text-sm text-[#111111]/70">
            No credential yet. Complete KYC to get your ZeroPass credential.
          </p>
        )}
        {walletAddress && (
          <p className="truncate font-mono-data text-xs text-[#111111]/70">
            {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
