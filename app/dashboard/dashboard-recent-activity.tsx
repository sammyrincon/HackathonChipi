"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Wallet, Loader2, Clock } from "lucide-react";
import type { KycStatusResponse } from "@/app/api/kyc/status/route";

type ActivityItem = {
  id: string;
  label: string;
  time: string;
  icon: React.ElementType;
  color: string;
};

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DashboardRecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kyc/status")
      .then((r) => r.json())
      .then((data: KycStatusResponse) => {
        const activity: ActivityItem[] = [];

        if (data.issuedAt) {
          activity.push({
            id: "credential-issued",
            label: "ZeroPass credential issued",
            time: timeAgo(data.issuedAt),
            icon: ShieldCheck,
            color: "text-emerald-400",
          });
        }

        if (data.walletAddress) {
          activity.push({
            id: "wallet-linked",
            label: "Chipi wallet linked",
            time: data.issuedAt ? timeAgo(data.issuedAt) : "—",
            icon: Wallet,
            color: "text-violet-400",
          });
        }

        if (data.expiresAt) {
          activity.push({
            id: "credential-expires",
            label: `Credential valid until ${new Date(data.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            time: "",
            icon: Clock,
            color: "text-zinc-400",
          });
        }

        setItems(activity);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading activity...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No activity yet. Complete KYC to see your credential history.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2.5"
        >
          <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-200">{item.label}</p>
            {item.time && <p className="text-xs text-zinc-500">{item.time}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
