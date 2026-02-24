"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CopyIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsdcBalance } from "@/components/usdc-balance";
import { getVoyagerContractUrl, getStarkscanContractUrl } from "@/lib/utils";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";

function cleanAddress(address: string): string {
  return address?.trim() ?? "";
}

export function WalletSummary({ effectiveWallet }: { effectiveWallet: string }) {
  const address = cleanAddress(effectiveWallet);
  const hasValidAddress = isValidStarknetAddress(address);
  const shortWallet = hasValidAddress
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          className="font-mono-data border-transparent text-[#111111] hover:bg-[#111111]/10"
          onClick={copyFullWallet}
          disabled={!hasValidAddress}
        >
          {shortWallet || "—"}
          <CopyIcon className="h-4 w-4" />
        </Button>
        {hasValidAddress && (
          <>
            <Button variant="outline" size="sm" className="font-body text-xs" asChild>
              <Link
                href={getVoyagerContractUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Voyager
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="font-body text-xs" asChild>
              <Link
                href={getStarkscanContractUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Starkscan
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </>
        )}
      </div>
      {!hasValidAddress && address && (
        <p className="font-body text-xs text-amber-600">
          Wallet address not activated or invalid.
        </p>
      )}
      <div className="space-y-2">
        <p className="font-headline flex items-center gap-1 text-[#111111]">
          Total
          <Image
            src="https://cdn.prod.website-files.com/66327d2c71b7019a2a9a1b62/667454fd94c7f58e94f4a009_USDC-webclip-256x256.png"
            alt="USDC"
            width={20}
            height={20}
          />
          <span> USDC balance</span>
        </p>
        <UsdcBalance walletPublicKey={address} />
      </div>
    </div>
  );
}
