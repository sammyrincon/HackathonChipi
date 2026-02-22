"use client";

import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { UsdcBalance } from "@/components/usdc-balance";
import { Button } from "@/components/ui/button";

export function DashboardWalletHitCounter({
  hasWallet,
  normalizedPublicKey,
  walletPublicKey,
}: {
  hasWallet: boolean;
  normalizedPublicKey: string;
  walletPublicKey: string;
}) {
  const shortWallet = normalizedPublicKey
    ? `${normalizedPublicKey.slice(0, 6)}...${normalizedPublicKey.slice(-4)}`
    : "";

  const copyFullWallet = async () => {
    if (!normalizedPublicKey) return;
    try {
      await navigator.clipboard.writeText(normalizedPublicKey);
      toast.success("Wallet copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  if (!hasWallet) {
    return (
      <div className="w-full max-w-sm border-4 border-[#111111] bg-[#111111] p-6">
        <p className="font-mono-data text-xs uppercase tracking-widest text-[#4ade80]/80">
          USDC balance
        </p>
        <p className="mt-1 font-mono-data text-2xl font-bold tabular-nums text-[#4ade80]/80">
          $—
        </p>
        <p className="mt-3 font-body text-xs text-white/70">
          No wallet. Create one from the home page to link your ZeroPass credential.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm border-4 border-[#111111] bg-[#111111] p-6">
      <p className="font-mono-data text-xs uppercase tracking-widest text-white/70">
        USDC balance
      </p>
      <div className="mt-1">
        <UsdcBalance
          walletPublicKey={walletPublicKey}
          className="text-2xl font-bold text-[#4ade80] md:text-3xl"
        />
      </div>
      <div className="mt-3 border-t border-white/20 pt-3">
        <p className="font-mono-data text-xs uppercase tracking-widest text-white/70">
          Wallet address
        </p>
        <Button
          type="button"
          variant="ghost"
          className="mt-1 flex w-full items-center justify-between gap-2 rounded-none border-0 font-mono-data text-xs text-[#4ade80] hover:bg-white/10 hover:text-[#4ade80]"
          onClick={copyFullWallet}
        >
          <span className="truncate">{shortWallet}</span>
          <CopyIcon className="h-3.5 w-3.5 shrink-0" />
        </Button>
      </div>
    </div>
  );
}
