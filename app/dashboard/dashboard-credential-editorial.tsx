"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { KycStatusResponse } from "@/app/api/kyc/status/route";

export function DashboardCredentialEditorial({
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-[#111111]/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking credential...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="font-body text-[#111111]/70">
        Could not load credential status.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* VERIFIED badge — accent #CC0000 only here */}
      {isVerified && (
        <span className="inline-block border border-[#CC0000] bg-[#CC0000] px-2 py-0.5 font-mono-data text-xs font-semibold uppercase tracking-widest text-white">
          Verified
        </span>
      )}

      {/* Headline: VERIFIED IDENTITY in Playfair Display text-4xl */}
      <h2 className="font-headline text-4xl font-bold uppercase tracking-tight text-[#111111]">
        Verified Identity
      </h2>

      {isVerified && data?.credentialId && (
        <div className="space-y-1">
          <p className="font-body text-xs uppercase tracking-widest text-[#111111]/70">
            Credential ID
          </p>
          <p className="font-mono-data break-all text-sm text-[#111111]">
            {data.credentialId}
          </p>
        </div>
      )}

      {isVerified && data?.expiresAt && (
        <p className="font-mono-data text-xs text-[#111111]/70">
          Expires {new Date(data.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </p>
      )}

      {isExpired && (
        <p className="font-body text-sm text-[#111111]/80">
          Credential expired. Complete KYC again to renew.
        </p>
      )}

      {!isVerified && !isExpired && !error && (
        <p className="font-body text-sm text-[#111111]/70">
          No credential yet. Complete KYC to receive your ZeroPass identity.
        </p>
      )}

      {walletAddress && (
        <p className="font-mono-data truncate pt-2 text-xs text-[#111111]/60">
          Wallet: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
        </p>
      )}
    </div>
  );
}
