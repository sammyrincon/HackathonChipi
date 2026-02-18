"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const MOCK_ACTIVITY = [
  { id: "1", type: "credential", label: "ZeroPass credential issued", time: "2 hours ago", icon: ArrowDownRight },
  { id: "2", type: "kyc", label: "KYC verification completed", time: "2 hours ago", icon: ArrowDownRight },
  { id: "3", type: "wallet", label: "Chipi wallet linked", time: "1 day ago", icon: ArrowUpRight },
];

export function DashboardRecentActivity() {
  return (
    <ul className="space-y-3">
      {MOCK_ACTIVITY.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2"
        >
          <item.icon className="h-4 w-4 shrink-0 text-zinc-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-200">{item.label}</p>
            <p className="text-xs text-zinc-500">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
