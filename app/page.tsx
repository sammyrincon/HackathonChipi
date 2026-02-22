import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="border-b-4 border-[#111111] bg-newsprint px-4 py-3">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#CC0000]" />
            <span className="font-headline text-lg font-semibold tracking-tight uppercase">
              ZeroPass
            </span>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b-2 border-[#111111] px-4 py-16 md:py-24">
          <div className="mx-auto max-w-screen-xl">
            <h1 className="font-headline text-5xl font-bold uppercase leading-[0.95] tracking-tight text-[#111111] sm:text-6xl md:text-7xl">
              Verify once. Access anywhere.
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-[#111111]/80">
              ZeroPass issues a privacy-preserving credential on Starknet. Complete KYC once,
              receive a verifiable credential linked to your wallet, and prove your identity
              anywhere without sharing personal data.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <Link href="/kyc">Get verified</Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto" size="lg">
                <Link href="/verify">Verify a credential</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-2 border-[#111111] sm:w-auto"
              >
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b-2 border-[#111111] px-4 py-16">
          <div className="mx-auto max-w-screen-xl">
            <h2 className="font-headline mb-10 text-3xl font-bold uppercase tracking-tight text-[#111111] md:text-4xl">
              How it works
            </h2>
            <div className="grid grid-cols-1 border border-[#111111] md:grid-cols-3">
              <div className="border-b border-[#111111] p-6 md:border-b-0 md:border-r">
                <p className="font-mono-data text-xs uppercase tracking-widest text-[#111111]/70">
                  Step 1
                </p>
                <h3 className="font-headline mt-2 text-xl font-bold text-[#111111] md:text-2xl">
                  Complete KYC
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[#111111]/80">
                  Upload your ID and a selfie. Your wallet is created during the flow. One-time payment of 1 USDC to issue your credential.
                </p>
              </div>
              <div className="border-b border-[#111111] p-6 md:border-b-0 md:border-r">
                <p className="font-mono-data text-xs uppercase tracking-widest text-[#111111]/70">
                  Step 2
                </p>
                <h3 className="font-headline mt-2 text-xl font-bold text-[#111111] md:text-2xl">
                  Receive credential
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[#111111]/80">
                  Your ZeroPass credential is issued on Starknet and linked to your Chipi wallet. No personal data is stored on-chain.
                </p>
              </div>
              <div className="p-6">
                <p className="font-mono-data text-xs uppercase tracking-widest text-[#111111]/70">
                  Step 3
                </p>
                <h3 className="font-headline mt-2 text-xl font-bold text-[#111111] md:text-2xl">
                  Access anywhere
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-[#111111]/80">
                  Show your QR code or share your wallet address. Businesses verify your credential instantly—no forms, no repeated KYC.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b-2 border-[#111111] bg-[#111111] px-4 py-4">
          <div className="mx-auto max-w-screen-xl">
            <p className="font-mono-data text-center text-sm font-medium uppercase tracking-widest text-[#4ade80] md:text-base">
              10,000+ VERIFICATIONS | STARKNET POWERED | GASLESS TRANSACTIONS
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-newsprint px-4 py-6">
          <div className="mx-auto max-w-screen-xl">
            <p className="font-mono-data text-center text-xs uppercase tracking-widest text-[#111111]/70">
              ZEROPASS © 2026 | Built on Starknet
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
