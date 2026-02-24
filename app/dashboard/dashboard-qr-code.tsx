"use client";

import { useState, useEffect } from "react";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ChevronDown, ChevronUp } from "lucide-react";

type ProofStatus = {
  hasProof: boolean;
  payload: string | null;
  credentialId: string | null;
  commitment: string | null;
};

export function DashboardQrCode({ walletAddress }: { walletAddress: string }) {
  const [expanded, setExpanded] = useState(false);
  const [proofStatus, setProofStatus] = useState<ProofStatus | null>(null);

  useEffect(() => {
    if (!expanded || !walletAddress?.trim()) {
      setProofStatus(null);
      return;
    }
    const wallet = walletAddress.trim();
    let cancelled = false;
    fetch(`/api/credential/status?wallet=${encodeURIComponent(wallet)}`)
      .then((r) => r.json())
      .then((cred) => {
        if (cancelled) return;
        if (!cred?.valid) {
          setProofStatus({ hasProof: false, payload: null, credentialId: null, commitment: null });
          return;
        }
        return fetch(`/api/proof/status?wallet=${encodeURIComponent(wallet)}`).then((r) => r.json());
      })
      .then((data: ProofStatus | undefined) => {
        if (!cancelled && data !== undefined) setProofStatus(data);
      })
      .catch(() => {
        if (!cancelled) setProofStatus({ hasProof: false, payload: null, credentialId: null, commitment: null });
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, walletAddress]);

  const address = walletAddress?.trim() ?? "";
  if (!address || !isValidStarknetAddress(address)) return null;

  const qrValue = proofStatus?.payload ?? JSON.stringify({ walletAddress: address });
  const copyableText = proofStatus?.payload ?? address;

  return (
    <Card className="border-[#111111] bg-[#F9F9F7]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#CC0000]" />
          <CardTitle className="font-headline text-[#111111]">My ZeroPass QR</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="border-transparent text-[#111111]/80 hover:bg-[#111111]/10 hover:text-[#111111]"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="flex flex-col items-center gap-4 pt-2">
          <div className="rounded-none border border-[#111111] bg-white p-4">
            <QRCodeSVG
              value={qrValue}
              size={180}
              bgColor="#ffffff"
              fgColor="#111111"
              level="M"
            />
          </div>
          <p className="font-body text-center text-xs text-[#111111]/70 max-w-xs">
            Show this QR to any business using ZeroPass. They scan it to instantly verify your identity — no personal data shared.
          </p>
          <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-2 py-1 text-xs text-[#111111] break-all text-center max-w-xs">
            {copyableText}
          </code>
        </CardContent>
      )}
    </Card>
  );
}
