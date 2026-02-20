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
    return <p className="text-zinc-400">Cargando wallet…</p>;
  }

  if (isError) {
    return <p className="text-sm text-zinc-500">Could not load wallet. Please refresh.</p>;
  }

  if (!walletResponse) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-400">
          Crea tu wallet Chipi para usar USDC y pagos con crypto.
        </p>
        <CreateWalletDialog />
      </div>
    );
  }

  const normalizedPublicKey = walletResponse.normalizedPublicKey ?? "";
  const walletPublicKey = walletResponse.publicKey ?? "";
  const walletForTransfer: WalletData = {
    publicKey: walletResponse.publicKey,
    encryptedPrivateKey: walletResponse.encryptedPrivateKey,
    normalizedPublicKey: walletResponse.normalizedPublicKey,
    walletType: walletResponse.walletType,
  };

  return (
    <div className="space-y-6 w-full">
      <WalletSummary
        normalizedPublicKey={normalizedPublicKey}
        walletPublicKey={walletPublicKey}
      />
      <div className="flex gap-3 justify-center flex-wrap">
        <SendUsdcDialog wallet={walletForTransfer} />
        <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" asChild>
          <Link href="/skus">Ver productos (SKUs)</Link>
        </Button>
      </div>
    </div>
  );
}
