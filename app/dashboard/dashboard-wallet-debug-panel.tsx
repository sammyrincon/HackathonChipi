"use client";

export function DashboardWalletDebugPanel({
  chipiNormalizedPublicKey,
  credentialWalletAddress,
  effectiveWallet,
}: {
  chipiNormalizedPublicKey: string;
  credentialWalletAddress: string;
  effectiveWallet: string;
}) {
  return (
    <section className="border-t-2 border-[#111111] bg-[#111111]/5 p-4 font-mono-data text-xs">
      <h3 className="mb-2 font-headline text-xs font-semibold uppercase tracking-wider text-[#111111]/70">
        [Dev] Wallet selection
      </h3>
      <dl className="grid gap-1 text-[#111111]/80">
        <div>
          <dt className="text-[#111111]/50">chipi normalizedPublicKey:</dt>
          <dd className="break-all">{chipiNormalizedPublicKey || "(none)"}</dd>
        </div>
        <div>
          <dt className="text-[#111111]/50">credential.walletAddress:</dt>
          <dd className="break-all">{credentialWalletAddress || "(none)"}</dd>
        </div>
        <div>
          <dt className="text-[#111111]/50">effectiveWallet:</dt>
          <dd className="break-all font-medium text-[#111111]">{effectiveWallet || "(none)"}</dd>
        </div>
      </dl>
    </section>
  );
}
