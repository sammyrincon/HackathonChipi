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
import { CreateWalletDialog } from "@/components/create-wallet.dialog";
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
                className={`flex h-8 w-8 items-center justify-center rounded-none border-2 border-[#111111] text-xs font-semibold transition-all ${
                  done
                    ? "bg-[#CC0000]/20 text-[#CC0000]"
                    : active
                    ? "bg-[#111111] text-[#F9F9F7]"
                    : "bg-[#F9F9F7] text-[#111111]/50"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest ${
                  done ? "text-[#CC0000]" : active ? "text-[#111111]" : "text-[#111111]/60"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-4 h-0.5 w-8 transition-colors ${
                  done ? "bg-[#CC0000]" : "bg-[#111111]/30"
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
  const { data: walletResponse, refetch: refetchWallet } = useGetWallet({ getBearerToken: getToken });
  const { transferAsync, isLoading: loadingTransfer } = useTransfer();
  const { recordSendTransactionAsync, isLoading: loadingRecord } = useRecordSendTransaction();
  const { wallet: customerWallet } = useChipiWallet({
    externalUserId: clerkUserId ?? null,
    getBearerToken: getToken,
  });

  const [stage, setStage] = useState<Stage>("upload");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [kycConfirmed, setKycConfirmed] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [credential, setCredential] = useState<KycCredentialResponse | null>(null);
  const [simulating, setSimulating] = useState(false);

  const demoMode =
    typeof process.env.NEXT_PUBLIC_DEMO_MODE !== "undefined" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const allowFakePayments =
    typeof process.env.NEXT_PUBLIC_ALLOW_FAKE_PAYMENTS !== "undefined" &&
    process.env.NEXT_PUBLIC_ALLOW_FAKE_PAYMENTS === "true";

  const walletAddress =
    walletResponse?.normalizedPublicKey ?? walletResponse?.publicKey ?? "";

  const loadingPayment = loadingTransfer || loadingRecord;

  function handleSubmitDocs(e: React.FormEvent) {
    e.preventDefault();
    if (demoMode) {
      if (!kycConfirmed) {
        toast.error("Please confirm the KYC statements");
        return;
      }
    } else {
      if (!idFile || !selfieFile) {
        toast.error("Please upload both ID and selfie");
        return;
      }
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

        toast.loading("Sending 0 USDC (Demo)...", { id: "kyc-payment" });

        const transactionHash = await transferAsync({
          params: {
            amount: 0,
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
            expectedAmount: "0",
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

      {/* Stage 1: KYC simulated (no real docs stored) */}
      {stage === "upload" && (
        <Card className="border-[#111111] bg-[#F9F9F7]">
          <CardHeader>
            <CardTitle className="font-headline text-[#111111]">
              {demoMode ? "KYC simulated" : "Upload documents"}
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              {demoMode
                ? "Demo only — no documents are stored. Confirm below to continue."
                : "Upload a government-issued ID and a selfie to verify your identity and receive your ZeroPass credential."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitDocs} className="space-y-6">
              {demoMode ? (
                <div className="space-y-4">
                  <p className="font-body text-sm text-[#111111]/80">
                    I confirm that I am over 18 and that the information I provide is accurate for this demo.
                  </p>
                  <label className="flex items-center gap-2 font-body text-sm text-[#111111]">
                    <input
                      type="checkbox"
                      checked={kycConfirmed}
                      onChange={(e) => setKycConfirmed(e.target.checked)}
                      className="rounded border-[#111111]"
                    />
                    I accept the above (demo)
                  </label>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="id-photo">Photo of ID</Label>
                    <Input
                      id="id-photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfie">Selfie</Label>
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </>
              )}
              {walletAddress && (
                <p className="font-body text-xs text-[#111111]/70">
                  Credential will be linked to:{" "}
                  <code className="font-mono-data">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </code>
                </p>
              )}
              <Button
                type="submit"
                disabled={demoMode ? !kycConfirmed : !idFile || !selfieFile}
                className="w-full"
              >
                Continue to payment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stage 2: Pay 0 USDC (Demo) */}
      {stage === "payment" && (
        <Card className="border-[#111111] bg-[#F9F9F7]">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-[#111111]">
              <CreditCard className="h-5 w-5 text-[#CC0000]" />
              Pay to receive your credential
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              A one-time payment of 1 USDC is required to issue your ZeroPass credential.
              {demoMode ? " In demo mode no real transfer is made." : " The transaction is gasless — no ETH or STRK needed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-none border border-[#111111] bg-[#F9F9F7] p-4 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#111111]/70">ZeroPass credential</span>
                <span className="font-medium text-[#111111]">1.00 USDC</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-[#111111]/70">Gas fee</span>
                <span className="font-medium text-[#CC0000]">Free (Chipi paymaster)</span>
              </div>
              <div className="border-t-4 border-[#111111] pt-2 flex justify-between font-body text-sm font-semibold">
                <span className="text-[#111111]">Total</span>
                <span className="text-[#111111]">1.00 USDC</span>
              </div>
            </div>

            {demoMode ? (
              walletAddress ? (
                <Button
                  type="button"
                  disabled={simulating}
                  className="w-full"
                  onClick={async () => {
                    const demoTxHash = "0xDEMO_" + Date.now();
                    setSimulating(true);
                    try {
                      toast.loading("Issuing credential (demo)...", { id: "kyc-demo" });
                      const res = await fetch("/api/kyc", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          walletAddress,
                          transactionHash: demoTxHash,
                        }),
                      });
                      if (!res.ok) {
                        const data = (await res.json().catch(() => ({}))) as { error?: string };
                        throw new Error(data.error ?? "Credential issuance failed");
                      }
                      const data = (await res.json()) as KycCredentialResponse;
                      toast.success("Credential issued ✅", { id: "kyc-demo" });
                      setCredential(data);
                      setStage("issued");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Demo failed", {
                        id: "kyc-demo",
                      });
                    } finally {
                      setSimulating(false);
                    }
                  }}
                >
                  {simulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    "Complete KYC (Demo)"
                  )}
                </Button>
              ) : (
                <div className="rounded-none border border-[#111111] bg-[#F9F9F7] p-4 space-y-3">
                  <p className="font-body text-sm text-[#111111]">
                    No Chipi wallet found. Create one to continue.
                  </p>
                  <CreateWalletDialog
                    onSuccess={() => {
                      toast.success("Wallet created! Now you can pay for your credential.");
                      void refetchWallet();
                    }}
                  />
                </div>
              )
            ) : walletAddress ? (
              <>
                <p className="font-body text-xs text-[#111111]/70">
                  Paying from:{" "}
                  <code className="font-mono-data">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </code>
                </p>

                <Button
                  onClick={() => setPinOpen(true)}
                  disabled={loadingPayment}
                  className="w-full"
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

                {allowFakePayments && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#111111]/50"
                    disabled={loadingPayment || simulating}
                    onClick={async () => {
                      setSimulating(true);
                      try {
                        toast.loading("Simulating payment...", { id: "kyc-sim" });
                        const res = await fetch("/api/kyc", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            walletAddress,
                            transactionHash: "0xsim",
                          }),
                        });
                        if (!res.ok) {
                          const data = (await res.json().catch(() => ({}))) as { error?: string };
                          throw new Error(data.error ?? "Simulation failed");
                        }
                        const data = (await res.json()) as KycCredentialResponse;
                        toast.success("Credential issued (simulated)", { id: "kyc-sim" });
                        setCredential(data);
                        setStage("issued");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Simulation failed", {
                          id: "kyc-sim",
                        });
                      } finally {
                        setSimulating(false);
                      }
                    }}
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      "Simulate payment (dev only)"
                    )}
                  </Button>
                )}
              </>
            ) : (
              <div className="rounded-none border border-[#111111] bg-[#F9F9F7] p-4 space-y-3">
                <p className="font-body text-sm text-[#111111]">
                  No Chipi wallet found. Create one to continue with payment.
                </p>
                <CreateWalletDialog
                  onSuccess={() => {
                    toast.success("Wallet created! Now you can pay for your credential.");
                    void refetchWallet();
                  }}
                />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full border-transparent text-[#111111]/70 hover:bg-[#111111]/10 hover:text-[#111111]"
              onClick={() => setStage("upload")}
              disabled={loadingPayment}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stage 3: Credential issued ✅ */}
      {stage === "issued" && credential && (
        <Card className="border-[#111111] bg-[#F9F9F7]">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-[#CC0000]">
              <ShieldCheck className="h-5 w-5" />
              Credential issued ✅
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              {credential.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-none border border-[#111111] bg-[#F9F9F7] p-3 space-y-2 font-body text-sm">
              <p className="text-[#111111]">
                <span className="text-[#111111]/70">Credential ID: </span>
                <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                  {credential.credentialId}
                </code>
              </p>
              {credential.walletAddress && (
                <p className="text-[#111111]">
                  <span className="text-[#111111]/70">Linked wallet: </span>
                  <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                    {credential.walletAddress.slice(0, 10)}...{credential.walletAddress.slice(-8)}
                  </code>
                </p>
              )}
              {credential.transactionHash && (
                <p className="text-[#111111]">
                  <span className="text-[#111111]/70">Payment tx: </span>
                  <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                    {credential.transactionHash.slice(0, 12)}...{credential.transactionHash.slice(-8)}
                  </code>
                </p>
              )}
            </div>
            <Button asChild className="mt-2 w-full">
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
