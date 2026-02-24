import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateChipiServer } from "@/lib/chipi-server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { OnboardingWalletStep } from "./onboarding-wallet-step";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [walletResponse, secret, credential] = await Promise.all([
    getOrCreateChipiServer()
      .getWallet({ externalUserId: userId })
      .catch(() => null),
    typeof prisma.userWalletSecret?.findUnique === "function"
      ? prisma.userWalletSecret.findUnique({
          where: { clerkUserId: userId },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.credential.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    }),
  ]);

  if (secret ?? credential) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen newsprint-bg text-[#111111] py-12">
      <div className="mx-auto max-w-lg space-y-8 px-4">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">
          Create your wallet
        </h1>
        <p className="font-body text-[#111111]/80">
          Create a Chipi wallet to hold USDC and link your ZeroPass credential. We never create a wallet automatically — only when you confirm here.
        </p>
        <OnboardingWalletStep hasExistingWallet={Boolean(walletResponse)} />
        <p className="font-body text-sm text-[#111111]/60">
          Already have a wallet?{" "}
          <Button variant="link" className="p-0 h-auto font-body text-sm" asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </p>
      </div>
    </div>
  );
}
