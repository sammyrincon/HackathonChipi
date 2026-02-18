import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getChipiServer } from "@chipi-stack/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletSummary } from "@/components/wallet-summary";
import { DashboardCredentialStatus } from "./dashboard-credential-status";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { ShieldCheck, Wallet, Activity, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Dashboard | ZeroPass",
  description: "Verify once, access anywhere. Your credential status and wallet.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const chipiServer = getChipiServer();
  const walletResponse = await chipiServer.getWallet({
    externalUserId: userId,
  });

  const normalizedPublicKey = walletResponse?.normalizedPublicKey ?? "";
  const walletPublicKey = walletResponse?.publicKey ?? "";
  const hasWallet = Boolean(walletResponse);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-violet-400" />
              <span className="text-lg font-semibold">ZeroPass</span>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
        <p className="mb-8 text-zinc-400">
          Verify once, access anywhere. Your credential status and activity.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <DashboardCredentialStatus walletAddress={normalizedPublicKey || walletPublicKey} />

          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Wallet className="h-5 w-5 text-violet-400" />
              <CardTitle className="text-zinc-100">Wallet balance</CardTitle>
            </CardHeader>
            <CardContent>
              {hasWallet ? (
                <WalletSummary
                  normalizedPublicKey={normalizedPublicKey}
                  walletPublicKey={walletPublicKey}
                />
              ) : (
                <p className="text-sm text-zinc-400">
                  No Chipi wallet yet. Create one from the home page to link your
                  ZeroPass credential.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Activity className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-zinc-100">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardRecentActivity />
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-zinc-700">
            <Link href="/kyc">Complete KYC</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700">
            <Link href="/business">Business verification</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
