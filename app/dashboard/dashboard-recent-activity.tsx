"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useGetWallet,
  useGetTransactionList,
} from "@chipi-stack/nextjs";
import { Loader2, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWalletAddress } from "@/lib/utils";

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

export function DashboardRecentActivity() {
  const { getToken } = useAuth();
  const { data: walletResponse } = useGetWallet({ getBearerToken: getToken });

  const walletAddress =
    walletResponse?.normalizedPublicKey ?? walletResponse?.publicKey ?? "";

  const { data: txData, isLoading, isError, refetch } = useGetTransactionList(
    walletAddress
      ? {
          query: { walletAddress, page: 1, limit: 20 },
          getBearerToken: getToken,
        }
      : undefined
  );

  const transactions = txData?.data ?? [];

  if (!walletAddress) {
    return (
      <p className="font-body text-sm text-[#111111]/70">
        No wallet found. Create a Chipi wallet to see your transaction history.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-[#111111]/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="font-body text-sm text-[#CC0000]">
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

  if (transactions.length === 0) {
    return (
      <p className="font-body text-sm text-[#111111]/70">
        No transactions yet. Your history will appear here after your first transfer.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse border border-[#111111]">
      <thead>
        <tr className="border-b border-[#111111] bg-[#111111] text-[#4ade80]">
          <th className="border-r border-white/20 px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80]">
            Type
          </th>
          <th className="border-r border-white/20 px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80]">
            Amount
          </th>
          <th className="hidden border-r border-white/20 px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80] sm:table-cell">
            Hash
          </th>
          <th className="border-r border-white/20 px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80]">
            Status
          </th>
          <th className="px-4 py-3 text-right font-headline text-xs font-semibold uppercase tracking-widest text-[#4ade80]">
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
            <td className="border-r border-b border-[#111111] px-4 py-3 font-body text-sm text-[#111111]">
              <span className="flex items-center gap-2">
                {txIcon(tx.type)}
                <span className="capitalize">{tx.type.replace(/_/g, " ")}</span>
              </span>
            </td>
            <td className="border-r border-b border-[#111111] px-4 py-3 font-mono-data text-sm text-[#111111]">
              {tx.amount ?? "—"}{" "}
              {tx.token && <span className="text-[#111111]/60">{tx.token}</span>}
            </td>
            <td className="hidden border-r border-b border-[#111111] px-4 py-3 font-mono-data text-xs text-[#111111]/70 sm:table-cell">
              {tx.transactionHash ? formatWalletAddress(tx.transactionHash, 8, 6) : "—"}
            </td>
            <td className="border-r border-b border-[#111111] px-4 py-3">
              {statusBadge(tx.status)}
            </td>
            <td className="border-b border-[#111111] px-4 py-3 text-right font-mono-data text-xs text-[#111111]/70">
              {tx.createdAt ? timeAgo(new Date(tx.createdAt)) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
