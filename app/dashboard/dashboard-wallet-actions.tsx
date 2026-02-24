"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import SendUsdcDialog from "@/components/send-usdc-dialog";
import { getVoyagerContractUrl } from "@/lib/utils";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";
import type { WalletData } from "@chipi-stack/types";

export function DashboardWalletActions({
  normalizedPublicKey,
  publicKey,
  encryptedPrivateKey,
  walletType,
}: {
  normalizedPublicKey: string;
  publicKey: string;
  encryptedPrivateKey: string;
  walletType: string;
}) {
  const walletData: WalletData = {
    publicKey,
    encryptedPrivateKey,
    normalizedPublicKey,
    walletType,
  };

  const address = normalizedPublicKey.trim();
  const showVoyagerLink = address && isValidStarknetAddress(address);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-headline text-sm font-semibold uppercase tracking-tight text-[#111111]">
        Wallet actions
      </h3>
      <p className="font-body text-xs text-[#111111]/70">
        Send a small amount of USDC (e.g. to yourself) to deploy your account on StarkNet. Chipi sponsors gas.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <SendUsdcDialog wallet={walletData} />
        {showVoyagerLink && (
          <Link
            href={getVoyagerContractUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-body text-sm text-[#111111]/80 underline hover:text-[#111111]"
          >
            Open in Voyager
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
