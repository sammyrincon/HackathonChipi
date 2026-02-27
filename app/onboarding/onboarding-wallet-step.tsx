"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateWalletDialog } from "@/components/create-wallet.dialog";
import { Button } from "@/components/ui/button";

export function OnboardingWalletStep({
  hasExistingWallet,
}: {
  hasExistingWallet: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markCompleteAndGoToDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding-complete", { method: "POST", credentials: "include" });
      if (res.ok) router.replace("/dashboard");
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleWalletCreated = () => {
    markCompleteAndGoToDashboard();
  };

  if (hasExistingWallet) {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <p className="font-body text-sm text-[#111111]/80">
          You already have a wallet. Mark onboarding complete and go to the dashboard.
        </p>
        <Button
          onClick={markCompleteAndGoToDashboard}
          disabled={loading}
          className="rounded-md border-2 border-[#111111] bg-[#111111] text-white hover:bg-[#111111]/90"
        >
          {loading ? "Redirecting…" : "Go to dashboard"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <CreateWalletDialog onSuccess={handleWalletCreated} />
      <p className="font-body text-xs text-[#111111]/60">
        Takes 30 seconds.
      </p>
    </div>
  );
}
