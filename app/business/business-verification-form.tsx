"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, QrCode, Loader2, X } from "lucide-react";
import { formatWalletAddress } from "@/lib/utils";

type VerificationResult = {
  verified: boolean;
  walletAddress: string;
  credentialId: string | null;
  message: string;
};

type ProofVerifyResponse = {
  valid: boolean;
  reason?: string;
  credentialId?: string;
  walletAddress?: string;
  expiresAt?: string | null;
  publicSignals?: { issuer?: string; commitment?: string };
  scheme?: string;
};

export function BusinessVerificationForm() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [proofResult, setProofResult] = useState<ProofVerifyResponse | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
      } catch {
        
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
          const raw = decodedText.trim();
          if (raw.startsWith("zp://")) {
            toast.success("QR scanned — verifying proof...");
            await verifyProofPayload(raw);
            return;
          }
          let address = raw;
          try {
            const parsed = JSON.parse(raw) as { walletAddress?: string };
            if (parsed.walletAddress) address = parsed.walletAddress;
          } catch {
            // use raw as address
          }
          setWalletAddress(address);
          toast.success("QR scanned: verifying...");
          await verifyAddress(address);
        },
        () => {}
      );
    } catch {
      toast.error("Could not access camera.");
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

  async function verifyProofPayload(payload: string) {
    setProofLoading(true);
    setProofResult(null);
    setResult(null);
    try {
      const res = await fetch("/api/proof/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const data = (await res.json().catch(() => ({}))) as ProofVerifyResponse & { error?: string };
      setProofResult(data);
      if (data.valid) toast.success("Proof valid: credential verified");
      else toast.error(data.reason ?? "Proof invalid");
    } catch {
      toast.error("Verification request failed");
      setProofResult({ valid: false, reason: "REQUEST_FAILED" });
    } finally {
      setProofLoading(false);
    }
  }

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
      const data = await res.json().catch(() => ({})) as { verified?: boolean; walletAddress?: string; credentialId?: string | null; message?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Verification failed");
        return;
      }
      setResult({
        verified: data.verified ?? false,
        walletAddress: data.walletAddress ?? address,
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
      <Card className="border border-[#111111] bg-[#F9F9F7] p-8">
        <CardHeader>
          <CardTitle className="font-headline text-[#111111]">By wallet address</CardTitle>
          <CardDescription className="font-body text-[#111111]/70">
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
                className="font-mono-data placeholder:text-[#111111]/50"
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

      <Card className="border border-[#111111] bg-[#F9F9F7] p-8">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-[#111111]">
            <QrCode className="h-5 w-5 text-[#CC0000]" />
            Scan QR code
          </CardTitle>
          <CardDescription className="font-body text-[#111111]/70">
            Point your camera at the user&apos;s ZeroPass QR code to verify instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scannerOpen ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Open camera scanner
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full overflow-hidden rounded-none border border-[#111111]">
                <div id="qr-reader" ref={scannerRef} className="w-full" />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 z-10 border-transparent bg-[#F9F9F7]/90 text-[#111111] hover:bg-[#111111]/10"
                  onClick={() => setScannerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-body text-center text-xs text-[#111111]/70">
                Align the QR code within the frame. The scan happens automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {proofLoading && (
        <Card className="border border-[#111111] bg-[#F9F9F7] p-8">
          <CardContent className="flex items-center gap-2 font-body text-[#111111]/70">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Verifying proof...</span>
          </CardContent>
        </Card>
      )}

      {proofResult && (
        <Card
          className={
            proofResult.valid
              ? "border-2 border-[#CC0000] bg-[#F9F9F7] p-8"
              : "border border-[#111111] bg-[#F9F9F7] p-8"
          }
        >
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-[#111111]">
              {proofResult.valid ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-[#CC0000]" />
                  <span className="text-[#CC0000]">Verified</span>
                </>
              ) : (
                <>
                  <ShieldX className="h-5 w-5 text-[#111111]/70" />
                  Proof invalid
                </>
              )}
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              {proofResult.valid
                ? "Credential and proof match."
                : proofResult.reason ?? "Verification failed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-body text-sm">
            {proofResult.valid && proofResult.walletAddress && (
              <p className="text-[#111111]/80">
                Wallet:{" "}
                <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                  {formatWalletAddress(proofResult.walletAddress, 12, 10)}
                </code>
              </p>
            )}
            {proofResult.valid && proofResult.credentialId && (
              <p className="text-[#111111]/80">
                Credential:{" "}
                <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                  {proofResult.credentialId}
                </code>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card
          className={
            result.verified
              ? "border-2 border-[#CC0000] bg-[#F9F9F7] p-8"
              : "border border-[#111111] bg-[#F9F9F7] p-8"
          }
        >
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-[#111111]">
              {result.verified ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-[#CC0000]" />
                  <span className="text-[#CC0000]">Verified</span>
                </>
              ) : (
                <>
                  <ShieldX className="h-5 w-5 text-[#111111]/70" />
                  Not verified
                </>
              )}
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-body text-sm">
            <p className="text-[#111111]/80">
              Wallet:{" "}
              <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                {formatWalletAddress(result.walletAddress, 12, 10)}
              </code>
            </p>
            {result.credentialId && (
              <p className="text-[#111111]/80">
                Credential:{" "}
                <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
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
