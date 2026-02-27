import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getOrCreateChipiServer } from "@/lib/chipi-server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="flex min-h-screen flex-col items-center justify-center newsprint-bg text-[#111111] py-12">
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 text-center">
        {/* ZeroPass branding header */}
        <header className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-[#CC0000] md:h-12 md:w-12" aria-hidden />
            <span className="font-headline text-3xl font-bold uppercase tracking-tight text-[#111111] md:text-5xl">
              Zero<span className="text-[#CC0000]">Pass</span>
            </span>
          </div>
  
          <Badge
            variant="outline"
            className="mt-1 rounded-md border-[#CC0000]/40 bg-[#CC0000]/5 px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[#CC0000]"
          >
            Onboarding
          </Badge>
        </header>

        <Card className="rounded-lg border-[#111111]/15 text-center shadow-sm">
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="font-headline text-xl font-bold tracking-tight text-[#111111]">
              Create your wallet
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/80">
              Create a Chipi wallet to hold USDC and link your ZeroPass credential. We never create a wallet automatically — only when you confirm here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <OnboardingWalletStep hasExistingWallet={Boolean(walletResponse)} />
            <p className="font-body text-sm text-[#111111]/60">
              Already have a wallet?{" "}
              <Button variant="link" className="p-0 h-auto font-body text-sm text-[#CC0000] hover:text-[#CC0000]/90" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
