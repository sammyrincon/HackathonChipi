"use client";

import { useGetTokenBalance, Chain, ChainToken } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";

export function UsdcBalance({ walletPublicKey }: { walletPublicKey: string }) {
  const { getToken } = useAuth();
  const { data: usdcBalance } = useGetTokenBalance({
    params: {
      chain: Chain.STARKNET,
      chainToken: ChainToken.USDC,
      walletPublicKey,
    },
    getBearerToken: getToken,
  });

  return (
    <p className="text-4xl font-semibold tabular-nums text-zinc-100 md:text-5xl">
      {!isNaN(Number(usdcBalance?.balance))
        ? `$${Number(usdcBalance?.balance).toFixed(2)}`
        : "$0.00"}
    </p>
  );
}
