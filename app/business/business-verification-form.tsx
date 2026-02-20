"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, QrCode, Loader2, X } from "lucide-react";

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
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
      } catch {
        // already stopped
      }
      scannerInstanceRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerInstanceRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await stopScanner();
          setScannerOpen(false);
          const address = decodedText.trim();
          setWalletAddress(address);
          toast.success("QR scanned — verifying...");
          await verifyAddress(address);
        },
        () => {}
      );
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
      setScannerOpen(false);
    }
  }, [stopScanner]);

  useEffect(() => {
    if (scannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [scannerOpen, startScanner, stopScanner]);

  async function verifyAddress(address: string) {
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

  async function handleVerifyByAddress(e: React.FormEvent) {
    e.preventDefault();
    await verifyAddress(walletAddress.trim());
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-100">By wallet address</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter the user&apos;s Chipi (Starknet) wallet address to verify their
            ZeroPass credential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyByAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-zinc-300">Wallet address</Label>
              <Input
                id="wallet"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0">
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

      <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <QrCode className="h-5 w-5 text-violet-400" />
            Scan QR code
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Point your camera at the user&apos;s ZeroPass QR code to verify instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scannerOpen ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Open camera scanner
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full overflow-hidden rounded-xl border border-zinc-700">
                <div id="qr-reader" ref={scannerRef} className="w-full" />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => setScannerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-zinc-500">
                Align the QR code within the frame. The scan happens automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card
          className={
            result.verified
              ? "border-emerald-800/60 bg-emerald-950/30 shadow-lg"
              : "border-zinc-800 bg-zinc-900/50 shadow-lg"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
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
            <CardDescription className="text-zinc-400">{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-zinc-400">
              Wallet:{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {result.walletAddress.slice(0, 12)}...{result.walletAddress.slice(-10)}
              </code>
            </p>
            {result.credentialId && (
              <p className="text-zinc-400">
                Credential:{" "}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
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
