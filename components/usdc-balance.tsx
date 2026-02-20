"use client";

import { useGetTokenBalance, Chain, ChainToken } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";

export function UsdcBalance({ walletPublicKey }: { walletPublicKey: string }) {
  const { getToken } = useAuth();
  const { data: usdcBalance, isLoading, isError } = useGetTokenBalance({
    params: {
      chain: Chain.STARKNET,
      chainToken: ChainToken.USDC,
      walletPublicKey,
    },
    getBearerToken: getToken,
  });

  if (isLoading) {
    return (
      <p className="text-4xl font-semibold tabular-nums text-zinc-500 md:text-5xl animate-pulse">
        $—
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-4xl font-semibold tabular-nums text-zinc-500 md:text-5xl">
        $0.00
      </p>
    );
  }

  const balance = Number(usdcBalance?.balance);

  return (
    <p className="text-4xl font-semibold tabular-nums text-zinc-100 md:text-5xl">
      {!isNaN(balance) ? `$${balance.toFixed(2)}` : "$0.00"}
    </p>
  );
}
