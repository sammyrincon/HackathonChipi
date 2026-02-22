"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { KycStatusResponse } from "@/app/api/kyc/status/route";

type ActivityRow = {
  id: string;
  event: string;
  detail: string;
  time: string;
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardRecentActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kyc/status")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<KycStatusResponse>;
      })
      .then((data) => {
        const out: ActivityRow[] = [];

        if (data.issuedAt) {
          out.push({
            id: "credential-issued",
            event: "Credential issued",
            detail: "ZeroPass identity verified",
            time: timeAgo(data.issuedAt),
          });
        }

        if (data.walletAddress) {
          out.push({
            id: "wallet-linked",
            event: "Wallet linked",
            detail: "Chipi wallet connected",
            time: data.issuedAt ? timeAgo(data.issuedAt) : "—",
          });
        }

        if (data.expiresAt) {
          out.push({
            id: "credential-expires",
            event: "Valid until",
            detail: new Date(data.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: "",
          });
        }

        setRows(out);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-[#111111]/70">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Loading activity...</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="font-body text-sm text-[#111111]/70">
        No activity yet. Complete KYC to see your credential history.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse border border-[#111111]">
      <thead>
        <tr className="border-b border-[#111111] bg-[#F9F9F7]">
          <th className="border-r border-[#111111] px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#111111]">
            Event
          </th>
          <th className="border-r border-[#111111] px-4 py-3 text-left font-headline text-xs font-semibold uppercase tracking-widest text-[#111111]">
            Detail
          </th>
          <th className="px-4 py-3 text-right font-headline text-xs font-semibold uppercase tracking-widest text-[#111111]">
            Time
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id}
            className={
              i % 2 === 0
                ? "bg-[#F5F5F5]"
                : "bg-[#F9F9F7]"
            }
          >
            <td className="border-r border-b border-[#111111] px-4 py-3 font-body text-sm text-[#111111]">
              {row.event}
            </td>
            <td className="border-r border-b border-[#111111] px-4 py-3 font-body text-sm text-[#111111]/80">
              {row.detail}
            </td>
            <td className="border-b border-[#111111] px-4 py-3 text-right font-mono-data text-xs text-[#111111]/70">
              {row.time}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
