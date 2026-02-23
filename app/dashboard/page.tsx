import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateChipiServer } from "@/lib/chipi-server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CredentialStatusPanel } from "./credential-status-panel";
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

  const chipiServer = getOrCreateChipiServer();
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
      <header className="border-b-8 border-[#111111] bg-newsprint py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-xl font-bold uppercase tracking-tight md:text-2xl">
            ZeroPass Identity Network
          </h1>
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="mr-24 gap-2" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Metadata bar */}
      <div className="border-b-2 border-[#111111] bg-newsprint py-2">
        <p className="text-newsprint-meta text-[#111111]/80">
          Vol. 1 | Est. 2026 | Starknet Edition
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-b-2 border-[#111111] bg-newsprint py-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-none border-2 border-[#111111] px-4 py-2 hover:bg-[#111111] hover:text-white transition-colors">
            <Link href="/kyc">Complete KYC</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-none border-2 border-[#111111] px-4 py-2 hover:bg-[#111111] hover:text-white transition-colors">
            <Link href="/business">Business verification</Link>
          </Button>
        </div>
      </nav>

      {/* Main 2-column grid: credential and wallet side by side */}
      <main className="newsprint-texture grid grid-cols-1 border-b-2 border-[#111111] md:grid-cols-2 md:gap-0">
        {/* Left column: Credential card — white bg, p-8, animated border on load */}
        <div className="flex min-h-0 flex-col border-r-0 border-[#111111] md:border-r md:border-[#111111]">
          <div className="flex min-h-0 flex-1 flex-col p-8">
            <div className="relative border border-[#111111] bg-white p-8 animate-fade-in-up">
              {/* Subtle grid pattern background */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="credential-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="24" stroke="#111111" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="24" y2="0" stroke="#111111" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#credential-grid)" />
              </svg>
              {/* SVG overlay: border draws itself on load */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="0.5"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  className="animate-stroke-draw"
                />
              </svg>
              <div className="relative z-10">
                <CredentialStatusPanel
                  walletAddress={normalizedPublicKey || walletPublicKey || null}
                />
              </div>
            </div>
            {(normalizedPublicKey || walletPublicKey) && (
              <div className="mt-6">
                <DashboardQrCode walletAddress={normalizedPublicKey || walletPublicKey} />
              </div>
            )}
          </div>
        </div>

        {/* Right column: Wallet — black bg, max-h-48 centered */}
        <div className="flex max-h-48 flex-col items-center justify-center border-t border-[#111111] bg-[#111111] p-6 md:border-t-0 md:border-l-0">
          <DashboardWalletHitCounter
            hasWallet={hasWallet}
            normalizedPublicKey={normalizedPublicKey}
            walletPublicKey={walletPublicKey}
          />
        </div>
      </main>

      {/* Bottom: Recent activity */}
      <section className="border-b-2 border-[#111111] bg-newsprint py-12">
        <h2 className="text-newsprint-h2 mb-6 uppercase tracking-tight">
            Recent activity
        </h2>
        <DashboardRecentActivity />
      </section>
    </div>
  );
}
