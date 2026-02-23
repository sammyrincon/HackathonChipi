"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  useGetWallet,
  useChipiWallet,
  useCreateSessionKey,
  useAddSessionKeyToContract,
} from "@chipi-stack/nextjs";
import { Button } from "@/components/ui/button";
import { WalletPinDialog } from "@/components/wallet-pin-dialog";
import { toast } from "sonner";
import { Loader2, KeyRound, Check } from "lucide-react";

const SESSION_DURATION_SECONDS = 21600; // 6 hours
const SESSION_KEY_STORAGE = "zeropass-session-key";

type SessionKeySetupProps = {
  onDone: () => void;
};

export function SessionKeySetup({ onDone }: SessionKeySetupProps) {
  const { getToken, userId: clerkUserId } = useAuth();
  const { data: walletResponse } = useGetWallet({ getBearerToken: getToken });
  const { wallet: chipiWallet } = useChipiWallet({
    externalUserId: clerkUserId ?? null,
    getBearerToken: getToken,
  });
  const { createSessionKeyAsync } = useCreateSessionKey();
  const { addSessionKeyToContractAsync } = useAddSessionKeyToContract();

  const [pinOpen, setPinOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const hasWallet = !!(walletResponse?.publicKey);

  async function handleSetup(pin: string) {
    if (!chipiWallet) {
      toast.error("Wallet not found");
      return;
    }

    setProcessing(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      toast.loading("Creating session key...", { id: "session-key" });

      const sessionKeyData = await createSessionKeyAsync({
        encryptKey: pin,
        durationSeconds: SESSION_DURATION_SECONDS,
      });

      toast.loading("Registering on-chain...", { id: "session-key" });

      const validUntil = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

      await addSessionKeyToContractAsync({
        params: {
          encryptKey: pin,
          wallet: {
            publicKey: chipiWallet.publicKey,
            encryptedPrivateKey: chipiWallet.encryptedPrivateKey,
          },
          sessionConfig: {
            sessionPublicKey: sessionKeyData.publicKey,
            validUntil,
            maxCalls: 1000,
            allowedEntrypoints: [],
          },
        },
        bearerToken: token,
      });

      localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(sessionKeyData));

      toast.success("Session active for 6 hours", { id: "session-key" });
      setDone(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Session key setup failed",
        { id: "session-key" }
      );
    } finally {
      setProcessing(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-none border border-[#22c55e] bg-[#22c55e]/10 px-4 py-3">
        <Check className="h-4 w-4 text-[#22c55e]" />
        <p className="font-body text-sm text-[#111111]">
          Session key active — sign-free transactions for 6 hours.
        </p>
      </div>
    );
  }

  if (!hasWallet) return null;

  return (
    <>
      <div className="space-y-3 border border-[#111111] bg-[#F9F9F7] p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[#CC0000]" />
          <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-[#111111]">
            Enable session keys
          </h3>
        </div>
        <p className="font-body text-xs text-[#111111]/70">
          Sign once and skip PIN entry for 6 hours. Your session key is stored
          locally and registered on-chain.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-none"
            onClick={() => setPinOpen(true)}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Enable session keys (sign once for 6h)"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-[#111111]/60 hover:text-[#111111]"
            onClick={onDone}
            disabled={processing}
          >
            Skip
          </Button>
        </div>
      </div>
      <WalletPinDialog
        open={pinOpen}
        onCancel={() => setPinOpen(false)}
        onSubmit={(pin) => {
          setPinOpen(false);
          void handleSetup(pin);
        }}
      />
    </>
  );
}
