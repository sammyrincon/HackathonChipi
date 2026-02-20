"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ChevronDown, ChevronUp } from "lucide-react";

export function DashboardQrCode({ walletAddress }: { walletAddress: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!walletAddress) return null;

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-violet-400" />
          <CardTitle className="text-zinc-100">My ZeroPass QR</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="flex flex-col items-center gap-4 pt-2">
          <div className="rounded-xl bg-white p-4 shadow-md">
            <QRCodeSVG
              value={walletAddress}
              size={180}
              bgColor="#ffffff"
              fgColor="#09090b"
              level="M"
            />
          </div>
          <p className="text-center text-xs text-zinc-500 max-w-xs">
            Show this QR to any business using ZeroPass. They scan it to instantly verify your identity — no personal data shared.
          </p>
          <code className="rounded bg-zinc-800 px-2 py-1 font-mono text-xs text-zinc-400 break-all text-center max-w-xs">
            {walletAddress}
          </code>
        </CardContent>
      )}
    </Card>
  );
}
