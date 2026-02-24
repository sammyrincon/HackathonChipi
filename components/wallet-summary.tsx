"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CopyIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsdcBalance } from "@/components/usdc-balance";
import { getVoyagerContractUrl, getStarkscanContractUrl } from "@/lib/utils";

export function WalletSummary({
  normalizedPublicKey,
  walletPublicKey,
}: {
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
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" className="font-mono-data border-transparent text-[#111111] hover:bg-[#111111]/10" onClick={copyFullWallet}>
          {shortWallet}
          <CopyIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="font-body text-xs" asChild>
          <Link
            href={getVoyagerContractUrl(normalizedPublicKey)}
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
            href={getStarkscanContractUrl(normalizedPublicKey)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
          >
            Starkscan
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>
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
        <UsdcBalance walletPublicKey={walletPublicKey} />
      </div>
    </div>
  );
}
