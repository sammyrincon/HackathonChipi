import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KycForm } from "./kyc-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "KYC Verification | ZeroPass",
  description: "Verify once, access anywhere. Complete KYC to get your ZeroPass credential.",
};

export default async function KycPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="sticky top-0 z-10 border-b-4 border-[#111111] bg-newsprint px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="border-transparent text-[#111111]/80 hover:bg-[#111111]/10 hover:text-[#111111]" asChild>
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#CC0000]" />
              <span className="font-headline text-lg font-semibold tracking-tight">ZeroPass</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-newsprint-h3 mb-1 text-[#111111]">
          KYC verification
        </h1>
        <p className="font-body mb-8 text-[#111111]/70">
          Upload a photo of your government-issued ID and a selfie to receive your
          ZeroPass credential linked to your Chipi wallet.
        </p>

        <KycForm />
      </main>
    </div>
  );
}
