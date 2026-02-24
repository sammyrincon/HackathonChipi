"use client";

import { useGetWallet } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";
import { CreateWalletDialog } from "@/components/create-wallet.dialog";
import { WalletSummary } from "@/components/wallet-summary";
import SendUsdcDialog from "@/components/send-usdc-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { WalletData } from "@chipi-stack/types";

export function CryptoWalletSection() {
  const { getToken } = useAuth();
  const { data: walletResponse, isLoading, isError } = useGetWallet({
    getBearerToken: getToken,
  });

  if (isLoading) {
    return <p className="font-body text-[#111111]/70">Cargando wallet…</p>;
  }

  if (isError) {
    return <p className="font-body text-sm text-[#111111]/70">Could not load wallet. Please refresh.</p>;
  }

  if (!walletResponse) {
    return (
      <div className="space-y-4">
        <p className="font-body text-[#111111]/70">
          Crea tu wallet Chipi para usar USDC y pagos con crypto.
        </p>
        <CreateWalletDialog />
      </div>
    );
  }

  const effectiveWallet = (walletResponse.normalizedPublicKey ?? "").trim();
  const walletForTransfer: WalletData = {
    publicKey: walletResponse.publicKey,
    encryptedPrivateKey: walletResponse.encryptedPrivateKey,
    normalizedPublicKey: walletResponse.normalizedPublicKey,
    walletType: walletResponse.walletType,
  };

  return (
    <div className="space-y-6 w-full">
      <WalletSummary effectiveWallet={effectiveWallet} />
      <div className="flex gap-3 justify-center flex-wrap">
        <SendUsdcDialog wallet={walletForTransfer} />
        <Button variant="outline" asChild>
          <Link href="/skus">Ver productos (SKUs)</Link>
        </Button>
      </div>
    </div>
  );
}
