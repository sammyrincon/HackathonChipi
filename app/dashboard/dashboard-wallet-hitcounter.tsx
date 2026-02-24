"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CopyIcon, ExternalLink } from "lucide-react";
import { UsdcBalance } from "@/components/usdc-balance";
import { Button } from "@/components/ui/button";
import {
  formatWalletAddress,
  getVoyagerContractUrl,
  getStarkscanContractUrl,
} from "@/lib/utils";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";

function cleanAddress(address: string): string {
  return address?.trim() ?? "";
}

export function DashboardWalletHitCounter({
  hasWallet,
  effectiveWallet,
  isDeployed = false,
}: {
  hasWallet: boolean;
  effectiveWallet: string;
  isDeployed?: boolean;
}) {
  const address = cleanAddress(effectiveWallet);
  const hasValidAddress = isValidStarknetAddress(address);
  const shortWallet = hasValidAddress
    ? formatWalletAddress(address, 6, 4)
    : "";

  const copyFullWallet = async () => {
    if (!hasValidAddress) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  if (!hasWallet) {
    return (
      <div className="flex h-full w-full max-w-sm flex-col items-center justify-center border border-[#111111] bg-[#111111] p-10 text-center">
        <p className="font-mono-data text-sm uppercase tracking-widest text-white/70">
          Wallet balance
        </p>
        <p className="mt-3 font-mono-data text-2xl font-bold tabular-nums text-[#4ade80]/80">
          $0.00
        </p>
        <p className="mt-5 font-body text-sm leading-relaxed text-white/80">
          No wallet. Create one from the home page to link your ZeroPass credential.
        </p>
      </div>
    );
  }

  if (!hasValidAddress) {
    return (
      <div className="flex h-full w-full max-w-sm flex-col items-center justify-center border border-[#111111] bg-[#111111] p-10 text-center">
        <p className="font-mono-data text-sm uppercase tracking-widest text-white/70">
          Wallet balance
        </p>
        <p className="mt-3 font-mono-data text-2xl font-bold tabular-nums text-[#4ade80]/80">
          —
        </p>
        <p className="mt-5 font-body text-sm leading-relaxed text-amber-200/90">
          Wallet address not activated or invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-sm flex-col items-center justify-center border border-[#111111] bg-[#111111] p-10 text-center">
      <p className="font-mono-data text-sm uppercase tracking-widest text-white/70">
        Wallet balance
      </p>
      <div className="mt-3">
        <UsdcBalance
          walletPublicKey={address}
          className="text-2xl font-bold text-[#4ade80] md:text-3xl"
        />
      </div>
      <div className="mt-6 border-t border-white/20 pt-5">
        <p className="font-mono-data text-sm uppercase tracking-widest text-white/70">
          Wallet address
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex w-full items-center justify-between gap-2 rounded-none border-0 font-mono-data text-sm text-[#4ade80] hover:bg-white/10 hover:text-[#4ade80]"
            onClick={copyFullWallet}
          >
            <span className="truncate">{shortWallet}</span>
            <CopyIcon className="h-4 w-4 shrink-0" />
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-0 font-mono-data text-sm text-white/80 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link
                href={getVoyagerContractUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                Voyager
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none border-0 font-mono-data text-sm text-white/80 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link
                href={getStarkscanContractUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                Starkscan
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {!isDeployed ? (
            <p className="mt-3 font-body text-xs leading-relaxed text-amber-200/90">
              Tu wallet aún no está desplegada en StarkNet. No aparecerá en Voyager ni Starkscan hasta que hagas tu primera transacción (ej. enviar USDC desde la app).
            </p>
          ) : (
            <p className="mt-3 font-body text-xs text-white/60">
              Enlaces al explorador (mainnet). Si no aparece, prueba ambos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
