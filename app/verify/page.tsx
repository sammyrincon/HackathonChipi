import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { VerifyForm } from "./verify-form";

export const metadata = {
  title: "Verify credential | ZeroPass",
  description: "Verify a ZeroPass credential by wallet address or QR code. No sign-in required.",
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="sticky top-0 z-10 border-b-4 border-[#111111] bg-newsprint px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="border-transparent text-[#111111]/80 hover:bg-[#111111]/10 hover:text-[#111111]"
              asChild
            >
              <Link href="/" aria-label="Back to home">
                <span className="font-headline text-lg">←</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#CC0000]" />
              <span className="font-headline text-lg font-semibold tracking-tight">
                ZeroPass
              </span>
            </div>
            <span className="border border-[#111111] bg-[#F9F9F7] px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest text-[#111111]">
              Verifier
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-newsprint-h3 mb-1 text-[#111111]">
          Verify credential
        </h1>
        <p className="font-body mb-8 text-[#111111]/70">
          Enter a wallet address or scan/paste a QR payload to verify a ZeroPass
          credential. No sign-in required.
        </p>

        <VerifyForm />
      </main>
    </div>
  );
}
