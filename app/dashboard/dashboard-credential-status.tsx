"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardCredentialStatus({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [status, setStatus] = useState<"verified" | "pending" | "not_verified">("not_verified");

  useEffect(() => {
    const stored = localStorage.getItem("zeropass_kyc_status") as "verified" | "pending" | null;
    const value = stored ?? "not_verified";
    const id = requestAnimationFrame(() => setStatus(value));
    return () => cancelAnimationFrame(id);
  }, []);

  const isVerified = status === "verified";
  const isPending = status === "pending";

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        {isVerified ? (
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        ) : (
          <ShieldX className="h-5 w-5 text-zinc-500" />
        )}
        <CardTitle className="text-zinc-100">ZeroPass credential</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isVerified && (
          <p className="text-sm text-emerald-400">Verified — linked to your wallet</p>
        )}
        {isPending && (
          <p className="text-sm text-amber-400">Verification in progress</p>
        )}
        {!isVerified && !isPending && (
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
