"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  useGetWallet,
  useChipiWallet,
  useMigrateWalletToPasskey,
} from "@chipi-stack/nextjs";
import { Loader2, ShieldCheck, ShieldAlert, AlertCircle, Clock, Fingerprint, Ban, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredentialStatus, type CredentialStatusState } from "@/lib/hooks/use-credential-status";
import { formatWalletAddress, getVoyagerContractUrl, getStarkscanContractUrl } from "@/lib/utils";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { toast } from "sonner";

type CredentialStatusPanelProps = {
  /** Funded wallet used for explorer links and QR. Single source of truth for links. */
  effectiveWallet: string | null;
  /** Credential-issued wallet (for display only; never used for links or QR). */
  credentialWalletAddress?: string | null;
  showRevoke?: boolean;
};

function StatusContent({
  state,
  effectiveWallet,
  credentialWalletAddress,
  onRevoke,
  showRevoke,
  revoking,
  passkeySection,
}: {
  state: CredentialStatusState;
  effectiveWallet: string | null;
  credentialWalletAddress: string | null;
  onRevoke?: () => Promise<void>;
  showRevoke?: boolean;
  revoking?: boolean;
  passkeySection?: React.ReactNode;
}) {
  const explorerAddress = (effectiveWallet ?? "").trim();
  const credDisplay = (credentialWalletAddress ?? "").trim();
  const showCredentialIssued =
    credDisplay && credDisplay.toLowerCase() !== explorerAddress.toLowerCase();

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
          {explorerAddress && (
            <p className="font-mono-data flex flex-wrap items-center gap-2 truncate text-xs text-[#111111]/60">
              <span>Wallet: {formatWalletAddress(explorerAddress)}</span>
              {isValidStarknetAddress(explorerAddress) ? (
                <>
                  <Link
                    href={getVoyagerContractUrl(explorerAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[#111111]/70 underline hover:text-[#111111]"
                  >
                    Voyager
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={getStarkscanContractUrl(explorerAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[#111111]/70 underline hover:text-[#111111]"
                  >
                    Starkscan
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </>
              ) : (
                <span className="text-amber-600">Wallet address not activated or invalid.</span>
              )}
            </p>
          )}
          {showCredentialIssued && (
            <p className="font-mono-data text-[10px] text-[#111111]/50">
              Credential-issued wallet: {formatWalletAddress(credDisplay)}
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
          {passkeySection}
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

    case "revoked":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-body text-[#111111]/80">
            <Ban className="h-10 w-10 shrink-0 text-[#CC0000]" />
            <h2 className="font-headline text-xl font-bold uppercase text-[#111111]">
              Credential revoked
            </h2>
          </div>
          <p className="font-body text-sm text-[#111111]/80">
            This credential is no longer valid. Complete KYC again to get a new ZeroPass credential.
          </p>
          <Button asChild className="mt-2">
            <Link href="/kyc" prefetch={false}>Get verified again</Link>
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
          {explorerAddress && (
            <p className="font-mono-data truncate text-xs text-[#111111]/60">
              Wallet: {isValidStarknetAddress(explorerAddress) ? formatWalletAddress(explorerAddress) : "Wallet address not activated or invalid."}
            </p>
          )}
          <Button asChild className="mt-2">
            <Link href="/kyc" prefetch={false}>Get Verified</Link>
          </Button>
        </div>
      );
  }
}

function PasskeyUpgrade() {
  const { getToken, userId: clerkUserId } = useAuth();
  const { data: walletResponse } = useGetWallet({ getBearerToken: getToken });
  const { wallet: chipiWallet } = useChipiWallet({
    externalUserId: clerkUserId ?? null,
    getBearerToken: getToken,
  });
  const { migrateWalletToPasskeyAsync, isLoading: migrating, isSuccess } =
    useMigrateWalletToPasskey();

  const [pinOpen, setPinOpen] = useState(false);

  const hasWallet = !!(walletResponse?.publicKey);
  const walletType = (walletResponse as { walletType?: string } | undefined)?.walletType ?? "";
  const alreadyPasskey = walletType.toLowerCase() === "passkey";

  if (!hasWallet || alreadyPasskey || isSuccess) return null;

  async function handleMigrate(pin: string) {
    if (!chipiWallet || !clerkUserId) {
      toast.error("Wallet not found");
      return;
    }
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      toast.loading("Setting up biometric auth...", { id: "passkey-migrate" });
      await migrateWalletToPasskeyAsync({
        oldEncryptKey: pin,
        externalUserId: clerkUserId,
        wallet: chipiWallet,
        bearerToken: token,
      });
      toast.success("Biometric auth enabled", { id: "passkey-migrate" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Passkey migration failed",
        { id: "passkey-migrate" }
      );
    }
  }

  return (
    <>
      <div className="mt-3 border-t border-[#111111]/20 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 rounded-none border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white"
          onClick={() => setPinOpen(true)}
          disabled={migrating}
        >
          {migrating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              <Fingerprint className="h-4 w-4" />
              Upgrade to biometric auth
            </>
          )}
        </Button>
        <p className="mt-1 font-body text-[10px] text-[#111111]/50 uppercase tracking-wider">
          Replace your PIN with fingerprint or Face ID
        </p>
      </div>
      <WalletPinDialog
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onSubmit={(pin) => {
          setPinOpen(false);
          void handleMigrate(pin);
        }}
      />
    </>
  );
}

export function CredentialStatusPanel({
  effectiveWallet,
  credentialWalletAddress = null,
  showRevoke = true,
}: CredentialStatusPanelProps) {
  const router = useRouter();
  const { state, loading, refetch } = useCredentialStatus(effectiveWallet);
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    try {
      const res = await fetch("/api/kyc/revoke", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Revoke failed");
        return;
      }
      toast.success(body.message ?? "Credential revoked");
      await refetch();
      sessionStorage.removeItem("kyc-form-stage");
      router.refresh();
    } finally {
      setRevoking(false);
    }
  }

  const passkeySection = state.kind === "verified" ? <PasskeyUpgrade /> : null;

  return (
    <div className="relative z-10 space-y-2">
      <StatusContent
        state={state}
        effectiveWallet={effectiveWallet}
        credentialWalletAddress={credentialWalletAddress ?? null}
        onRevoke={handleRevoke}
        showRevoke={showRevoke && state.kind === "verified"}
        revoking={revoking}
        passkeySection={passkeySection}
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
