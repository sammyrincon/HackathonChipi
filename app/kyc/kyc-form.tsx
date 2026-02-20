"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  useGetWallet,
  useTransfer,
  useRecordSendTransaction,
  useChipiWallet,
  ChainToken,
  Chain,
} from "@chipi-stack/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { toast } from "sonner";
import { ShieldCheck, Loader2, CreditCard, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { KycCredentialResponse } from "@/app/api/kyc/route";

type Stage = "upload" | "payment" | "issued";

function StageIndicator({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string; icon: React.ElementType }[] = [
    { key: "upload", label: "Upload docs", icon: Upload },
    { key: "payment", label: "Pay 1 USDC", icon: CreditCard },
    { key: "issued", label: "Credential", icon: ShieldCheck },
  ];
  const currentIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all ${
                  done
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : active
                    ? "border-violet-500 bg-violet-500/20 text-violet-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-500"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              <span
                className={`text-[10px] ${
                  done ? "text-emerald-400" : active ? "text-violet-400" : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-4 h-0.5 w-8 transition-colors ${
                  done ? "bg-emerald-500/60" : "bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function KycForm() {
  const { getToken, userId: clerkUserId } = useAuth();
  const { data: walletResponse } = useGetWallet({ getBearerToken: getToken });
  const { transferAsync, isLoading: loadingTransfer } = useTransfer();
  const { recordSendTransactionAsync, isLoading: loadingRecord } = useRecordSendTransaction();
  const { wallet: customerWallet } = useChipiWallet({
    externalUserId: clerkUserId ?? null,
    getBearerToken: getToken,
  });

  const [stage, setStage] = useState<Stage>("upload");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [credential, setCredential] = useState<KycCredentialResponse | null>(null);

  const walletAddress =
    walletResponse?.normalizedPublicKey ?? walletResponse?.publicKey ?? "";

  const loadingPayment = loadingTransfer || loadingRecord;

  function handleSubmitDocs(e: React.FormEvent) {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      toast.error("Please upload both ID and selfie");
      return;
    }
    if (!walletAddress) {
      toast.error("No Chipi wallet found. Create one from the home page first.");
      return;
    }
    setStage("payment");
  }

  const runPayment = useCallback(
    async (pin: string) => {
      if (!customerWallet) {
        toast.error("Wallet not found");
        return;
      }
      const merchantWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET;
      if (!merchantWallet) {
        toast.error("Merchant wallet not configured");
        return;
      }

      try {
        const jwtToken = await getToken();
        if (!jwtToken) throw new Error("No auth token");

        toast.loading("Sending 1 USDC...", { id: "kyc-payment" });

        const transactionHash = await transferAsync({
          params: {
            amount: 1,
            encryptKey: pin,
            wallet: {
              publicKey: customerWallet.publicKey,
              encryptedPrivateKey: customerWallet.encryptedPrivateKey,
            },
            token: ChainToken.USDC,
            recipient: merchantWallet,
          },
          bearerToken: jwtToken,
        });

        await recordSendTransactionAsync({
          params: {
            transactionHash,
            chain: Chain.STARKNET,
            expectedSender: customerWallet.publicKey,
            expectedRecipient: merchantWallet,
            expectedToken: ChainToken.USDC,
            expectedAmount: "1",
          },
          bearerToken: jwtToken,
        });

        toast.loading("Issuing credential...", { id: "kyc-payment" });

        const res = await fetch("/api/kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress, transactionHash }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error ?? "Credential issuance failed");
        }

        const data = (await res.json()) as KycCredentialResponse;
        toast.success("ZeroPass credential issued!", { id: "kyc-payment" });
        setCredential(data);
        setStage("issued");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Payment failed", {
          id: "kyc-payment",
        });
      }
    },
    [customerWallet, walletAddress, getToken, transferAsync, recordSendTransactionAsync]
  );

  return (
    <div className="space-y-6">
      <StageIndicator stage={stage} />

      {/* Stage 1: Upload documents */}
      {stage === "upload" && (
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-zinc-100">Upload documents</CardTitle>
            <CardDescription className="text-zinc-400">
              Upload a government-issued ID and a selfie to verify your identity and receive your ZeroPass credential.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitDocs} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id-photo" className="text-zinc-300">Photo of ID</Label>
                <Input
                  id="id-photo"
                  type="file"
                  accept="image/*"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 file:text-zinc-300"
                  onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selfie" className="text-zinc-300">Selfie</Label>
                <Input
                  id="selfie"
                  type="file"
                  accept="image/*"
                  className="border-zinc-700 bg-zinc-900 text-zinc-100 file:text-zinc-300"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {walletAddress && (
                <p className="text-xs text-zinc-500">
                  Credential will be linked to:{" "}
                  <code className="font-mono">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </code>
                </p>
              )}
              <Button
                type="submit"
                disabled={!idFile || !selfieFile}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0"
              >
                Continue to payment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stage 2: Pay 1 USDC */}
      {stage === "payment" && (
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <CreditCard className="h-5 w-5 text-violet-400" />
              Pay to receive your credential
            </CardTitle>
            <CardDescription className="text-zinc-400">
              A one-time payment of 1 USDC is required to issue your ZeroPass credential.
              The transaction is gasless — no ETH or STRK needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">ZeroPass credential</span>
                <span className="text-zinc-100 font-medium">1.00 USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Gas fee</span>
                <span className="text-emerald-400 font-medium">Free (Chipi paymaster)</span>
              </div>
              <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-zinc-300">Total</span>
                <span className="text-zinc-100">1.00 USDC</span>
              </div>
            </div>

            {walletAddress && (
              <p className="text-xs text-zinc-500">
                Paying from:{" "}
                <code className="font-mono">
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </code>
              </p>
            )}

            <Button
              onClick={() => setPinOpen(true)}
              disabled={loadingPayment}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0"
            >
              {loadingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay 1 USDC with Chipi Wallet"
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-zinc-500 hover:text-zinc-300"
              onClick={() => setStage("upload")}
              disabled={loadingPayment}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stage 3: Credential issued */}
      {stage === "issued" && credential && (
        <Card className="border-emerald-800/60 bg-emerald-950/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              Credential issued
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {credential.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2 text-sm">
              <p className="text-zinc-300">
                <span className="text-zinc-500">Credential ID: </span>
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                  {credential.credentialId}
                </code>
              </p>
              {credential.walletAddress && (
                <p className="text-zinc-300">
                  <span className="text-zinc-500">Linked wallet: </span>
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                    {credential.walletAddress.slice(0, 10)}...{credential.walletAddress.slice(-8)}
                  </code>
                </p>
              )}
              {credential.transactionHash && (
                <p className="text-zinc-300">
                  <span className="text-zinc-500">Payment tx: </span>
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                    {credential.transactionHash.slice(0, 12)}...{credential.transactionHash.slice(-8)}
                  </code>
                </p>
              )}
            </div>
            <Button asChild className="mt-2 w-full bg-violet-600 hover:bg-violet-500 text-white border-0">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <WalletPinDialog
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onSubmit={async (pin) => {
          setPinOpen(false);
          await runPayment(pin);
        }}
      />
    </div>
  );
}
