"use client";

import { AlertTriangle } from "lucide-react";
import { formatWalletAddress } from "@/lib/utils";

export function DashboardWalletMismatchWarning({ chipiAddr }: { chipiAddr: string }) {
  return (
    <div
      className="mt-5 flex gap-4 rounded-none border-2 border-amber-500 bg-amber-50 p-5 text-amber-900"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="font-body text-sm leading-relaxed">
        <p className="font-semibold">Wallet mismatch detected.</p>
        <p className="mt-1.5">
          Using funded wallet: <code className="font-mono-data text-sm">{formatWalletAddress(chipiAddr, 12, 10)}</code>. Do not regenerate wallets.
        </p>
      </div>
    </div>
  );
}
