import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BusinessVerificationForm } from "./business-verification-form";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Business verification | ZeroPass",
  description: "Verify a user's ZeroPass credential by wallet address or QR code.",
};

export default async function BusinessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="sticky top-0 z-10 border-b-4 border-[#111111] bg-newsprint px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
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
            <span className="border border-[#111111] bg-[#F9F9F7] px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-[#111111]">
              Business
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-newsprint-h3 mb-1 text-[#111111]">
          Verify credential
        </h1>
        <p className="font-body mb-8 text-[#111111]/70">
          Enter a user&apos;s wallet address or scan their QR code to verify their
          ZeroPass credential.
        </p>

        <BusinessVerificationForm />
      </main>
    </div>
  );
}
