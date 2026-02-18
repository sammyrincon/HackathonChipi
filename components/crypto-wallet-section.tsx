"use client";

import { useGetWallet } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";
import { CreateWalletDialog } from "@/components/create-wallet.dialog";
import { WalletSummary } from "@/components/wallet-summary";
import SendUsdcDialog from "@/components/send-usdc-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CryptoWalletSection() {
  const { getToken } = useAuth();
  const { data: walletResponse, isLoading } = useGetWallet({
    getBearerToken: getToken,
  });
  const wallet = walletResponse?.wallet;

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando wallet…</p>;
  }

  if (!wallet) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Crea tu wallet Chipi para usar USDC y pagos con crypto.
        </p>
        <CreateWalletDialog />
      </div>
    );
  }

  const normalizedPublicKey = wallet.normalizedPublicKey ?? wallet.walletPublicKey ?? "";
  const walletPublicKey = wallet.walletPublicKey ?? "";

  return (
    <div className="space-y-6 w-full">
      <WalletSummary
        normalizedPublicKey={normalizedPublicKey}
        walletPublicKey={walletPublicKey}
      />
      <div className="flex gap-3 justify-center flex-wrap">
        <SendUsdcDialog wallet={wallet} />
        <Button variant="outline" asChild>
          <Link href="/skus">Ver productos (SKUs)</Link>
        </Button>
      </div>
    </div>
  );
}
