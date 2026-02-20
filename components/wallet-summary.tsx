"use client";

import Image from "next/image";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsdcBalance } from "@/components/usdc-balance";

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
    await navigator.clipboard.writeText(normalizedPublicKey);
    toast.success("Wallet copied to clipboard");
  };
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100">
      <CardHeader>
        <Button type="button" variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={copyFullWallet}>
          {shortWallet}
          <CopyIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="flex items-center gap-1 text-zinc-100">
          Total
          <Image
            src="https://cdn.prod.website-files.com/66327d2c71b7019a2a9a1b62/667454fd94c7f58e94f4a009_USDC-webclip-256x256.png"
            alt="USDC"
            width={20}
            height={20}
          />
          <span> USDC balance</span>
        </CardTitle>
        <UsdcBalance walletPublicKey={walletPublicKey} />
      </CardContent>
    </Card>
  );
}
