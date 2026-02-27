"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { CreateWalletDialog } from "@/components/create-wallet.dialog";
import { toast } from "sonner";
import { ShieldCheck, Loader2, CreditCard, Upload, CheckCircle2, UploadCloud, Check } from "lucide-react";
import Link from "next/link";
import type { KycCredentialResponse } from "@/app/api/kyc/route";
import { formatWalletAddress } from "@/lib/utils";
import { isFrontendDemo } from "@/lib/demo";
import { SessionKeySetup } from "./session-key-setup";

type Stage = "upload" | "payment" | "issued";

const KYC_STAGE_KEY = "kyc-form-stage";

function StageIndicator({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string; icon: React.ElementType }[] = [
    { key: "upload", label: "Upload docs", icon: Upload },
    { key: "payment", label: "Pay 1 USDC", icon: CreditCard },
    { key: "issued", label: "Credential", icon: ShieldCheck },
  ];
  const currentIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="mb-12 flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border-2 border-[#111111] text-xs font-semibold transition-all ${
                  done
                    ? "bg-[#CC0000]/20 text-[#CC0000]"
                    : active
                    ? "bg-[#111111] text-[#F9F9F7]"
                    : "bg-[#F9F9F7] text-[#111111]/50"
                }`}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
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
                className={`mb-6 h-0.5 w-8 transition-colors ${
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
  const [kycConfirmed, setKycConfirmed] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [credential, setCredential] = useState<KycCredentialResponse | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [sessionKeyDismissed, setSessionKeyDismissed] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(KYC_STAGE_KEY);
    if (saved === "upload" || saved === "payment" || saved === "issued") setStage(saved);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(KYC_STAGE_KEY, stage);
  }, [stage]);

  const demoMode = isFrontendDemo;
  const demoPayments = isFrontendDemo;
  const allowFakePayments = isFrontendDemo;

  const chipiWalletAddress =
    walletResponse?.normalizedPublicKey ?? walletResponse?.publicKey ?? "";

  const [demoWalletAddress, setDemoWalletAddress] = useState<string | null>(null);

  const walletAddress = chipiWalletAddress || demoWalletAddress || "";

  const isDemoPaymentFlow = demoMode || demoPayments;
  const preparingDemoWallet =
    stage === "payment" && isDemoPaymentFlow && !chipiWalletAddress && !demoWalletAddress;

  const loadingPayment = loadingTransfer || loadingRecord;

  useEffect(() => {
    if (stage !== "payment" || !isDemoPaymentFlow || chipiWalletAddress) return;
    if (demoWalletAddress) return;
    const hex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setDemoWalletAddress("0x" + hex);
  }, [stage, isDemoPaymentFlow, chipiWalletAddress, demoWalletAddress]);

  const [pendingCredentialFetched, setPendingCredentialFetched] = useState(false);
  useEffect(() => {
    if (
      stage !== "payment" ||
      !walletAddress?.trim() ||
      pendingCredentialFetched
    )
      return;
    setPendingCredentialFetched(true);
    const url = "/api/kyc";
    const body: Record<string, string> = {
      wallet: walletAddress.trim(),
      walletAddress: walletAddress.trim(),
    };
    if (isDemoPaymentFlow) body.status = "PENDING";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (r) => {
        if (!r.ok) {
          const resBody = await r.json().catch(() => ({})) as { error?: string };
          console.error("[KYC PENDING] POST failed", {
            status: r.status,
            statusText: r.statusText,
            url,
            body: resBody,
          });
          return Promise.reject(new Error(resBody.error ?? "Failed"));
        }
        return r.json();
      })
      .then(() => {})
      .catch((e) => {
        console.error("[KYC PENDING]", e);
      });
  }, [stage, walletAddress, pendingCredentialFetched, isDemoPaymentFlow]);

  async function handlePay() {
    const effectiveWallet = walletAddress?.trim();
    if (!effectiveWallet) {
      toast.error("Wallet is required");
      return;
    }
    console.log("[KYC handlePay] wallet used:", effectiveWallet.slice(0, 14) + "...");
    const endpoint = "/api/kyc";
    const demoTxHash = "0xDEMO_" + Date.now();
    const payBody = {
      wallet: effectiveWallet,
      walletAddress: effectiveWallet,
      status: "VERIFIED",
      transactionHash: demoTxHash,
    };
    setSimulating(true);
    try {
      toast.loading("Issuing credential (demo)...", { id: "kyc-demo-pay" });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payBody),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? "Credential issuance failed";
        if ((res.status === 403 || res.status === 400) && String(msg).toLowerCase().includes("allow_demo_kyc")) {
          toast.error("Server has demo disabled. Set DEMO=true in server env.", { id: "kyc-demo-pay" });
        } else {
          toast.error(msg, { id: "kyc-demo-pay" });
        }
        return;
      }
      toast.success("Credential issued", { id: "kyc-demo-pay" });
      setCredential(data as KycCredentialResponse);
      setStage("issued");
      window.dispatchEvent(new CustomEvent("zeropass-credential-issued"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Demo payment failed", { id: "kyc-demo-pay" });
    } finally {
      setSimulating(false);
    }
  }

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

        if (!walletAddress?.trim()) {
        toast.error("Wallet is required", { id: "kyc-payment" });
        return;
      }
        toast.loading("Sending 1 USDC…", { id: "kyc-payment" });

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

        toast.loading("Issuing your credential…", { id: "kyc-payment" });

        const res = await fetch("/api/kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: walletAddress.trim(),
            wallet: walletAddress.trim(),
            transactionHash,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(data.error ?? "Credential issuance failed");
        }

        const data = (await res.json()) as KycCredentialResponse;
        toast.success("Credential issued. Verify once, access anywhere.", { id: "kyc-payment" });
        setCredential(data);
        setStage("issued");
        window.dispatchEvent(new CustomEvent("zeropass-credential-issued"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Payment failed", {
          id: "kyc-payment",
        });
      }
    },
    [customerWallet, walletAddress, getToken, transferAsync, recordSendTransactionAsync]
  );

  return (
    <div className="space-y-12">
      <StageIndicator stage={stage} />

      {/* Stage 1: KYC simulated (no real docs stored) */}
      {stage === "upload" && (
        <Card className="animate-fade-in-up border border-[#111111] bg-[#F9F9F7] p-8">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="font-headline text-[#111111]">
              {demoMode ? "KYC simulated" : "Upload documents"}
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              {demoMode
                ? "Demo only — no documents are stored. Confirm below to continue."
                : "Upload a government-issued ID and a selfie to verify your identity and receive your ZeroPass credential."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
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
                    <Label htmlFor="id-photo" className="font-body text-[#111111]">Photo of ID</Label>
                    <label
                      htmlFor="id-photo"
                      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[#111111] bg-[#F9F9F7] p-8 text-center transition-colors hover:bg-[#111111]/5"
                    >
                      <input
                        id="id-photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                      />
                      {idFile ? (
                        <>
                          <span className="animate-checkmark-in flex h-16 w-16 items-center justify-center rounded-none border-2 border-[#CC0000] bg-[#CC0000]/10 text-[#CC0000]">
                            <Check className="h-8 w-8" strokeWidth={3} />
                          </span>
                          <span className="font-mono-data text-sm text-[#111111]">{idFile.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-16 w-16 shrink-0 text-[#111111]/40" aria-hidden />
                          <span className="font-body text-sm text-[#111111]/70">Click to upload ID photo</span>
                        </>
                      )}
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfie" className="font-body text-[#111111]">Selfie</Label>
                    <label
                      htmlFor="selfie"
                      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[#111111] bg-[#F9F9F7] p-8 text-center transition-colors hover:bg-[#111111]/5"
                    >
                      <input
                        id="selfie"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                      />
                      {selfieFile ? (
                        <>
                          <span className="animate-checkmark-in flex h-16 w-16 items-center justify-center rounded-none border-2 border-[#CC0000] bg-[#CC0000]/10 text-[#CC0000]">
                            <Check className="h-8 w-8" strokeWidth={3} />
                          </span>
                          <span className="font-mono-data text-sm text-[#111111]">{selfieFile.name}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-16 w-16 shrink-0 text-[#111111]/40" aria-hidden />
                          <span className="font-body text-sm text-[#111111]/70">Click to upload selfie</span>
                        </>
                      )}
                    </label>
                  </div>
                </>
              )}
              {walletAddress && (
                <p className="font-body text-xs text-[#111111]/70">
                  Credential will be linked to:{" "}
                  <code className="font-mono-data">
                    {formatWalletAddress(walletAddress)}
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

      {/* Stage 2: Pay 1 USDC with Chipi */}
      {stage === "payment" && (
        <Card className="border border-[#111111] bg-[#F9F9F7] p-8">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="font-headline flex items-center gap-2 text-[#111111]">
              <CreditCard className="h-5 w-5 text-[#CC0000]" />
              Pay 1 USDC to receive your credential
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              One-time 1 USDC payment issues your ZeroPass credential. Gasless — Chipi covers fees.
              {demoMode ? " In demo mode no real transfer is made." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <div className="border border-[#111111] bg-[#F9F9F7] p-6 space-y-2">
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

            {isDemoPaymentFlow ? (
              <>
                {preparingDemoWallet ? (
                  <p className="font-body text-sm text-[#111111]/70">
                    Preparing demo wallet...
                  </p>
                ) : (
                  <>
                    {walletAddress ? (
                      <p className="font-body text-xs text-[#111111]/70">
                        Paying from:{" "}
                        <code className="font-mono-data">
                          {formatWalletAddress(walletAddress)}
                        </code>
                        {!chipiWalletAddress && (
                          <span className="ml-1 text-[#111111]/50">(demo wallet)</span>
                        )}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      disabled={simulating || !walletAddress?.trim()}
                      className="w-full"
                      onClick={handlePay}
                    >
                      {simulating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        "Pay 1 USDC"
                      )}
                    </Button>
                  </>
                )}
              </>
            ) : walletAddress ? (
              <>
                <p className="font-body text-xs text-[#111111]/70">
                  Paying from:{" "}
                  <code className="font-mono-data">
                    {formatWalletAddress(walletAddress)}
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
                      Processing payment…
                    </>
                  ) : (
                    "Pay 1 USDC with Chipi"
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
                        if (!walletAddress?.trim()) {
                          toast.error("Wallet is required", { id: "kyc-sim" });
                          setSimulating(false);
                          return;
                        }
                        toast.loading("Simulating payment...", { id: "kyc-sim" });
                        const res = await fetch("/api/kyc", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            walletAddress: walletAddress.trim(),
                            wallet: walletAddress.trim(),
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
                        window.dispatchEvent(new CustomEvent("zeropass-credential-issued"));
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
              <div className="border border-[#111111] bg-[#F9F9F7] p-6 space-y-3">
                <p className="font-body text-sm text-[#111111]">
                  No Chipi wallet found. Create one to continue with payment.
                </p>
                <p className="font-body text-xs text-[#111111]/60">
                  (Demo payments are off. Set NEXT_PUBLIC_DEMO=true to use demo flow.)
                </p>
                <CreateWalletDialog
                  onSuccess={() => {
                    void fetch("/api/activity/log", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "wallet_created" }),
                    });
                    sessionStorage.setItem(KYC_STAGE_KEY, "payment");
                    toast.success("Wallet created! Reloading…");
                    setTimeout(() => window.location.reload(), 100);
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
        <Card className="border border-[#111111] bg-[#F9F9F7] p-8">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="font-headline flex items-center gap-2 text-[#CC0000]">
              <ShieldCheck className="h-5 w-5" />
              Credential issued
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/70">
              {credential.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="border border-[#111111] bg-[#F9F9F7] p-6 space-y-2 font-body text-sm">
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
                    {formatWalletAddress(credential.walletAddress)}
                  </code>
                </p>
              )}
              {credential.transactionHash && (
                <p className="text-[#111111]">
                  <span className="text-[#111111]/70">Payment tx: </span>
                  <code className="font-mono-data rounded-none border border-[#111111] bg-[#F9F9F7] px-1.5 py-0.5 text-xs text-[#111111]">
                    {formatWalletAddress(credential.transactionHash, 12, 8)}
                  </code>
                </p>
              )}
            </div>
            {!sessionKeyDismissed && (
              <SessionKeySetup onDone={() => setSessionKeyDismissed(true)} />
            )}
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
