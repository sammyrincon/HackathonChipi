"use client";

import { useGetTokenBalance, Chain, ChainToken } from "@chipi-stack/nextjs";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function UsdcBalance({
  walletPublicKey,
  className,
}: {
  walletPublicKey: string;
  className?: string;
}) {
  const { getToken } = useAuth();
  const { data: usdcBalance, isLoading, isError } = useGetTokenBalance({
    params: {
      chain: Chain.STARKNET,
      chainToken: ChainToken.USDC,
      walletPublicKey,
    },
    getBearerToken: getToken,
  });

  const baseClass =
    "font-mono-data text-4xl font-semibold tabular-nums md:text-5xl";

  if (isLoading) {
    return (
      <p
        className={cn(
          baseClass,
          "text-[#111111]/50 animate-pulse",
          className
        )}
      >
        $—
      </p>
    );
  }

  if (isError) {
    return (
      <p className={cn(baseClass, "text-[#111111]/50", className)}>
        $0.00
      </p>
    );
  }

  const balance = Number(usdcBalance?.balance);

  return (
    <p className={cn(baseClass, "text-[#111111]", className)}>
      {!isNaN(balance) ? `$${balance.toFixed(2)}` : "$0.00"}
    </p>
  );
}
