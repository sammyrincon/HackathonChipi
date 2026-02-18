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
  const { data: walletResponse, isLoading } = useGetWallet({
    getBearerToken: getToken,
  });

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando wallet…</p>;
  }

  if (!walletResponse) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
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
        <Button variant="outline" asChild>
          <Link href="/skus">Ver productos (SKUs)</Link>
        </Button>
      </div>
    </div>
  );
}
