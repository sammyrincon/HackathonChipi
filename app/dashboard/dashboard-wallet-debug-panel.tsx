"use client";

import { CopyIcon, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  formatWalletAddress,
  getVoyagerContractUrl,
  getStarkscanContractUrl,
} from "@/lib/utils";
import { isValidStarknetAddress } from "@/lib/isValidStarknetAddress";

function WalletRow({
  label,
  address,
  isActive,
}: {
  label: string;
  address: string;
  isActive?: boolean;
}) {
  const raw = (address ?? "").trim();
  const valid = raw && isValidStarknetAddress(raw);
  const short = valid ? formatWalletAddress(raw, 8, 6) : raw || "—";

  const copy = async () => {
    if (!valid) return;
    try {
      await navigator.clipboard.writeText(raw);
      toast.success("Wallet copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div
      className={
        "flex flex-col gap-1 border border-[#111111] bg-[#F9F9F7] p-4 " +
        (isActive ? "border-[#111111] bg-[#F5F5F5] ring-1 ring-[#111111]/20" : "")
      }
    >
      <p className="font-headline text-[10px] font-semibold uppercase tracking-widest text-[#111111]/60">
        {label}
        {isActive && (
          <span className="ml-2 rounded-none border border-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 font-mono-data text-[10px] text-[#22c55e]">
            Active
          </span>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2 font-mono-data text-sm text-[#111111]">
        <span className="break-all">{short}</span>
        {valid && (
          <span className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 min-w-0 rounded-none border-0 p-1 text-[#111111]/60 hover:bg-[#111111]/10 hover:text-[#111111]"
              onClick={copy}
              title="Copy full address"
            >
              <CopyIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 min-w-0 rounded-none border-0 p-1 text-[#111111]/60 hover:bg-[#111111]/10 hover:text-[#111111]"
              asChild
              title="Open in Voyager"
            >
              <a
                href={getVoyagerContractUrl(raw)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardWalletDebugPanel({
  chipiNormalizedPublicKey,
  credentialWalletAddress,
  effectiveWallet,
}: {
  chipiNormalizedPublicKey: string;
  credentialWalletAddress: string;
  effectiveWallet: string;
}) {
  const chipi = (chipiNormalizedPublicKey ?? "").trim();
  const cred = (credentialWalletAddress ?? "").trim();
  const effective = (effectiveWallet ?? "").trim();

  return (
    <section className="border-t-2 border-[#111111] bg-newsprint py-12">
      <div className="mb-6 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-[#111111]/70" aria-hidden />
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight text-[#111111]">
          Wallets
        </h2>
        <span className="rounded-none border border-[#111111]/40 bg-[#111111]/5 px-2 py-0.5 font-mono-data text-[10px] uppercase tracking-widest text-[#111111]/60">
          Dev
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <WalletRow
          label="Chipi wallet"
          address={chipi}
          isActive={effective === chipi && !!effective}
        />
        <WalletRow
          label="Credential wallet"
          address={cred}
          isActive={effective === cred && !!effective}
        />
        <WalletRow
          label="Active wallet"
          address={effective}
          isActive={!!effective}
        />
      </div>
      <p className="mt-4 font-body text-xs text-[#111111]/50">
        Active wallet is used for balance, QR, and explorer links. Shown only in development.
      </p>
    </section>
  );
}
