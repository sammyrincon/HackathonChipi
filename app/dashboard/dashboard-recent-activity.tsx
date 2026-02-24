"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetTransactionList } from "@chipi-stack/nextjs";
import { Loader2, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWalletAddress, padStarknetAddress } from "@/lib/utils";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function txIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("send") || t.includes("transfer_out") || t.includes("out"))
    return <ArrowUpRight className="h-4 w-4 text-[#CC0000]" />;
  if (t.includes("receive") || t.includes("transfer_in") || t.includes("in"))
    return <ArrowDownLeft className="h-4 w-4 text-[#22c55e]" />;
  return <RefreshCw className="h-3.5 w-3.5 text-[#111111]/60" />;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  const base =
    "inline-block rounded-none px-1.5 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-widest";
  if (s === "success")
    return <span className={`${base} border border-[#22c55e] text-[#22c55e]`}>{status}</span>;
  if (s === "pending" || s === "processing")
    return <span className={`${base} border border-[#eab308] text-[#eab308]`}>{status}</span>;
  if (s === "failed" || s === "cancelled")
    return <span className={`${base} border border-[#CC0000] text-[#CC0000]`}>{status}</span>;
  return <span className={`${base} border border-[#111111]/40 text-[#111111]/60`}>{status}</span>;
}

function isNoDataError(error: unknown): boolean {
  if (!error) return false;
  const msg = typeof (error as Error).message === "string" ? (error as Error).message.toLowerCase() : "";
  const status = (error as { status?: number }).status;
  return (
    status === 404 ||
    msg.includes("not found") ||
    msg.includes("no transaction") ||
    msg.includes("404")
  );
}

export function DashboardRecentActivity({
  effectiveWallet = "",
}: {
  effectiveWallet?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { getToken } = useAuth();
  const rawWallet = effectiveWallet.trim();
  const walletAddress = rawWallet ? padStarknetAddress(rawWallet) : "";

  const { data: txData, isLoading, isError, error, refetch } = useGetTransactionList(
    walletAddress
      ? {
          query: { walletAddress, page: 1, limit: 20 },
          getBearerToken: getToken,
        }
      : undefined
  );

  const transactions = txData?.data ?? [];
  const treatErrorAsEmpty = isError && isNoDataError(error);

  // Avoid hydration mismatch: Radix (Button) and query state can differ server vs client.
  if (!mounted) {
    return (
      <div className="flex items-center gap-3 font-body text-sm leading-relaxed text-[#111111]/80">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <p className="font-body text-sm leading-relaxed text-[#111111]/80">
        No wallet found. Create a Chipi wallet to see your transaction history.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 font-body text-sm leading-relaxed text-[#111111]/80">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (isError && !treatErrorAsEmpty) {
    return (
      <div className="space-y-4">
        <p className="font-body text-sm leading-relaxed text-[#CC0000]">
          Failed to load transaction history.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none border-[#111111]"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (transactions.length === 0 || treatErrorAsEmpty) {
    return (
      <p className="font-body text-sm leading-relaxed text-[#111111]/80">
        No transactions yet. Your history will appear here after your first transfer.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse border border-[#111111]">
      <thead>
        <tr className="border-b border-[#111111] bg-[#111111] text-[#4ade80]">
          <th className="border-r border-white/20 px-5 py-4 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:text-sm">
            Type
          </th>
          <th className="border-r border-white/20 px-5 py-4 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:text-sm">
            Amount
          </th>
          <th className="hidden border-r border-white/20 px-5 py-4 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:table-cell sm:text-sm">
            Hash
          </th>
          <th className="border-r border-white/20 px-5 py-4 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:text-sm">
            Status
          </th>
          <th className="px-5 py-4 text-right font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:text-sm">
            Time
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, i) => (
          <tr
            key={tx.id ?? tx.transactionHash ?? i}
            className={`${i % 2 === 0 ? "bg-[#F5F5F5]" : "bg-[#F9F9F7]"} hover:bg-[#E5E5E0]`}
          >
            <td className="border-r border-b border-[#111111] px-5 py-4 font-body text-sm text-[#111111]">
              <span className="flex items-center gap-2">
                {txIcon(tx.type)}
                <span className="capitalize">{tx.type.replace(/_/g, " ")}</span>
              </span>
            </td>
            <td className="border-r border-b border-[#111111] px-5 py-4 font-mono-data text-sm text-[#111111]">
              {tx.amount ?? "—"}{" "}
              {tx.token && <span className="text-[#111111]/70">{tx.token}</span>}
            </td>
            <td className="hidden border-r border-b border-[#111111] px-5 py-4 font-mono-data text-sm text-[#111111]/80 sm:table-cell">
              {tx.transactionHash ? formatWalletAddress(tx.transactionHash, 10, 8) : "—"}
            </td>
            <td className="border-r border-b border-[#111111] px-5 py-4">
              {statusBadge(tx.status)}
            </td>
            <td className="border-b border-[#111111] px-5 py-4 text-right font-mono-data text-sm text-[#111111]/80">
              {tx.createdAt ? timeAgo(new Date(tx.createdAt)) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
