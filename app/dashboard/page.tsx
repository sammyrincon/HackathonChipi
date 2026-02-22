import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getChipiServer } from "@chipi-stack/nextjs/server";
import { Button } from "@/components/ui/button";
import { DashboardCredentialEditorial } from "./dashboard-credential-editorial";
import { DashboardWalletHitCounter } from "./dashboard-wallet-hitcounter";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DashboardQrCode } from "./dashboard-qr-code";

export const metadata = {
  title: "Dashboard | ZeroPass",
  description: "Verify once, access anywhere. Your credential status and wallet.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const chipiServer = getChipiServer();
  let walletResponse = null;
  try {
    walletResponse = await chipiServer.getWallet({ externalUserId: userId });
  } catch {
    // Wallet not found or Chipi API unavailable
  }

  const normalizedPublicKey = walletResponse?.normalizedPublicKey ?? "";
  const walletPublicKey = walletResponse?.publicKey ?? "";
  const hasWallet = Boolean(walletResponse);

  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      {/* Header bar */}
      <header className="border-b-4 border-[#111111] bg-newsprint px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-xl font-bold uppercase tracking-tight md:text-2xl">
            ZeroPass Identity Network
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="border-transparent" asChild>
              <Link href="/">Home</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Metadata bar */}
      <div className="border-b-2 border-[#111111] bg-newsprint px-4 py-2">
        <p className="text-newsprint-meta text-[#111111]/80">
          Vol. 1 | Est. 2026 | Starknet Edition
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-b-2 border-[#111111] bg-newsprint px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-none border-[#111111]">
            <Link href="/kyc">Complete KYC</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-none border-[#111111]">
            <Link href="/business">Business verification</Link>
          </Button>
        </div>
      </nav>

      {/* Main 2-column grid: credential and wallet side by side, equal height */}
      <main className="newsprint-texture grid grid-cols-1 grid-rows-[1fr] border-b-2 border-[#111111] md:grid-cols-2 md:gap-0">
        {/* Left column: Credential card */}
        <div className="flex min-h-0 flex-col border-r-0 border-[#111111] p-6 md:border-r">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-4 border-[#111111] bg-newsprint p-6">
              <DashboardCredentialEditorial walletAddress={normalizedPublicKey || walletPublicKey} />
            </div>
            {(normalizedPublicKey || walletPublicKey) && (
              <div className="mt-4">
                <DashboardQrCode walletAddress={normalizedPublicKey || walletPublicKey} />
              </div>
            )}
          </div>
        </div>

        {/* Right column: Wallet hit-counter */}
        <div className="flex min-h-0 flex-col items-start p-6 md:items-stretch">
          <DashboardWalletHitCounter
            hasWallet={hasWallet}
            normalizedPublicKey={normalizedPublicKey}
            walletPublicKey={walletPublicKey}
          />
        </div>
      </main>

      {/* Bottom: Recent activity as newspaper table */}
      <section className="border-b-2 border-[#111111] bg-newsprint px-4 py-6">
        <h2 className="text-newsprint-h2 mb-4 uppercase tracking-tight">
          Recent activity
        </h2>
        <DashboardRecentActivity />
      </section>
    </div>
  );
}
