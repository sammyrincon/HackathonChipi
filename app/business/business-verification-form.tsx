"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, QrCode, Loader2 } from "lucide-react";

type VerificationResult = {
  verified: boolean;
  walletAddress: string;
  credentialId: string | null;
  message: string;
};

export function BusinessVerificationForm() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showQrPlaceholder, setShowQrPlaceholder] = useState(false);

  async function handleVerifyByAddress(e: React.FormEvent) {
    e.preventDefault();
    const address = walletAddress.trim();
    if (!address) {
      toast.error("Enter a wallet address");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Verification failed");
        return;
      }
      setResult({
        verified: data.verified,
        walletAddress: data.walletAddress,
        credentialId: data.credentialId ?? null,
        message: data.message ?? "",
      });
      if (data.verified) toast.success("Credential verified");
      else toast.error("Credential not found or invalid");
    } catch {
      toast.error("Verification request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle>By wallet address</CardTitle>
          <CardDescription>
            Enter the user&apos;s Chipi (Starknet) wallet address to verify their
            ZeroPass credential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyByAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet address</Label>
              <Input
                id="wallet"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono border-zinc-700 bg-zinc-900"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify credential"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-violet-400" />
            Scan QR code
          </CardTitle>
          <CardDescription>
            Point your camera at the user&apos;s ZeroPass QR code to verify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showQrPlaceholder ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-700"
              onClick={() => setShowQrPlaceholder(true)}
            >
              Open scanner (demo)
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 py-12">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-zinc-800">
                <QrCode className="h-24 w-24 text-zinc-600" />
              </div>
              <p className="text-center text-sm text-zinc-500">
                QR scanner placeholder. In production, use a camera stream to
                decode the wallet address from the user&apos;s ZeroPass QR.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQrPlaceholder(false)}
              >
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card
          className={
            result.verified
              ? "border-emerald-800 bg-emerald-950/20"
              : "border-zinc-800 bg-zinc-900/50"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.verified ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-emerald-400">Verified</span>
                </>
              ) : (
                <>
                  <ShieldX className="h-5 w-5 text-zinc-400" />
                  Not verified
                </>
              )}
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-zinc-400">
              Wallet:{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">
                {result.walletAddress.slice(0, 12)}...{result.walletAddress.slice(-10)}
              </code>
            </p>
            {result.credentialId && (
              <p className="text-zinc-400">
                Credential:{" "}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">
                  {result.credentialId}
                </code>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
