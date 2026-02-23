"use client";

import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { UsdcBalance } from "@/components/usdc-balance";
import { Button } from "@/components/ui/button";
import { formatWalletAddress } from "@/lib/utils";

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
    ? formatWalletAddress(normalizedPublicKey, 6, 4)
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
      <div className="flex h-full w-full max-w-sm flex-col items-center justify-center border border-[#111111] bg-[#111111] p-8 text-center">
        <p className="font-mono-data text-xs uppercase tracking-widest text-white/70">
          Wallet balance
        </p>
        <p className="mt-2 font-mono-data text-2xl font-bold tabular-nums text-[#4ade80]/80">
          $0.00
        </p>
        <p className="mt-4 font-body text-xs text-white/70">
          No wallet. Create one from the home page to link your ZeroPass credential.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-sm flex-col items-center justify-center border border-[#111111] bg-[#111111] p-8 text-center">
      <p className="font-mono-data text-xs uppercase tracking-widest text-white/70">
        Wallet balance
      </p>
      <div className="mt-2">
        <UsdcBalance
          walletPublicKey={walletPublicKey}
          className="text-2xl font-bold text-[#4ade80] md:text-3xl"
        />
      </div>
      <div className="mt-4 border-t border-white/20 pt-4">
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
