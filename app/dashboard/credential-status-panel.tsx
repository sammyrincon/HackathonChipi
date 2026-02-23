"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, ShieldAlert, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredentialStatus, type CredentialStatusState } from "@/lib/hooks/use-credential-status";
import { formatWalletAddress } from "@/lib/utils";

type CredentialStatusPanelProps = {
  walletAddress: string | null;
  showRevoke?: boolean;
};

function StatusContent({
  state,
  walletAddress,
  onRevoke,
  showRevoke,
  revoking,
}: {
  state: CredentialStatusState;
  walletAddress: string | null;
  onRevoke?: () => Promise<void>;
  showRevoke?: boolean;
  revoking?: boolean;
}) {
  switch (state.kind) {
    case "loading":
      return (
        <div className="flex items-center gap-2 font-body text-[#111111]/70">
          <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
          <span>Checking credential...</span>
        </div>
      );

    case "error":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-body text-[#CC0000]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Could not load credential status.</span>
          </div>
          <p className="font-body text-sm text-[#111111]/70">{state.message}</p>
        </div>
      );

    case "verified":
      return (
        <div className="space-y-4">
          <span className="animate-badge-pulse inline-block border border-[#CC0000] bg-[#CC0000] px-2 py-0.5 font-mono-data text-xs font-semibold uppercase tracking-widest text-white">
            Verified
          </span>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-12 w-12 shrink-0 text-[#CC0000]" aria-hidden />
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight text-[#111111]">
              Verified Identity
            </h2>
          </div>
          {state.data.expiresAt && (
            <p className="font-mono-data text-xs text-[#111111]/70">
              Expires{" "}
              {new Date(state.data.expiresAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
          {walletAddress && (
            <p className="font-mono-data truncate text-xs text-[#111111]/60">
              Wallet: {formatWalletAddress(walletAddress)}
            </p>
          )}
          {showRevoke && onRevoke && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white"
              onClick={onRevoke}
              disabled={revoking}
            >
              {revoking ? "Revoking…" : "Revoke credential"}
            </Button>
          )}
        </div>
      );

    case "expired":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-body text-[#111111]/80">
            <ShieldAlert className="h-10 w-10 shrink-0 text-[#111111]/60" />
            <h2 className="font-headline text-xl font-bold uppercase text-[#111111]">
              Credential expired
            </h2>
          </div>
          <p className="font-body text-sm text-[#111111]/80">
            Complete KYC again to renew your ZeroPass credential.
          </p>
          <Button asChild className="mt-2">
            <Link href="/kyc" prefetch={false}>Get Verified</Link>
          </Button>
        </div>
      );

    case "pending":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-body text-[#111111]/80">
            <Clock className="h-10 w-10 shrink-0 text-[#111111]/60" />
            <h2 className="font-headline text-xl font-bold uppercase text-[#111111]">
              Credential pending
            </h2>
          </div>
          <p className="font-body text-sm text-[#111111]/80">
            Complete payment to activate your credential.
          </p>
          <Button asChild className="mt-2">
            <Link href="/kyc" prefetch={false}>Complete KYC</Link>
          </Button>
        </div>
      );

    case "idle":
    default:
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-12 w-12 shrink-0 text-[#111111]/30" aria-hidden />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-[#111111]/80">
              No credential yet
            </h2>
          </div>
          <p className="font-body text-sm text-[#111111]/70">
            Complete KYC to receive your ZeroPass identity linked to your wallet.
          </p>
          {walletAddress && (
            <p className="font-mono-data truncate text-xs text-[#111111]/60">
              Wallet: {formatWalletAddress(walletAddress)}
            </p>
          )}
          <Button asChild className="mt-2">
            <Link href="/kyc" prefetch={false}>Get Verified</Link>
          </Button>
        </div>
      );
  }
}

export function CredentialStatusPanel({
  walletAddress,
  showRevoke = true,
}: CredentialStatusPanelProps) {
  const { state, loading, refetch } = useCredentialStatus(walletAddress);
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    try {
      const res = await fetch("/api/kyc/revoke", { method: "POST" });
      if (!res.ok) throw new Error("Revoke failed");
      await refetch();
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="relative z-10 space-y-2">
      <StatusContent
        state={state}
        walletAddress={walletAddress}
        onRevoke={handleRevoke}
        showRevoke={showRevoke && state.kind === "verified"}
        revoking={revoking}
      />
      {state.kind === "error" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => void refetch()}
          disabled={loading}
        >
          {loading ? "Retrying…" : "Retry"}
        </Button>
      )}
    </div>
  );
}
