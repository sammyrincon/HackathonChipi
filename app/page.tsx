import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="border-b-8 border-[#111111] bg-newsprint px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="animate-float h-7 w-7 text-[#CC0000] md:h-8 md:w-8" />
            <span className="font-headline text-xl font-bold tracking-tight uppercase md:text-2xl">
              ZeroPass
            </span>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main>
        {/* Hero section with background image */}
        <section className="relative flex min-h-[60vh] flex-col border-b-4 border-[#111111]">
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-12 md:px-8">
            <h1 className="animate-hero-fade-slide-up font-headline text-6xl font-black uppercase leading-tight tracking-tighter text-[#111111] md:text-8xl">
              Verify once. Access anywhere.
            </h1>
            <p className="mt-6 max-w-2xl font-body text-lg text-[#111111]/80">
              ZeroPass issues a privacy-preserving credential on Starknet. Complete KYC once,
              receive a verifiable credential linked to your wallet, and prove your identity
              anywhere without sharing personal data.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="w-full rounded-none bg-[#111111] font-semibold uppercase tracking-wide text-white hover:bg-[#111111]/90 sm:w-auto"
                variant="default"
              >
                <Link href="/kyc" prefetch={false}>
                  Get verified
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-none border-2 border-[#111111] font-semibold uppercase tracking-wide hover:bg-[#111111] hover:text-white sm:w-auto"
              >
                <Link href="/business">Verify a credential</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-none border-2 border-[#111111] font-semibold uppercase tracking-wide hover:bg-[#111111] hover:text-white sm:w-auto"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Go to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stock-style ticker */}
        <section className="ticker-strip overflow-hidden border-y-2 border-[#111111] bg-[#111111]" aria-hidden>
          <div className="ticker-track flex w-max items-center whitespace-nowrap py-3">
            <span className="ticker-item font-mono-data text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80] md:text-sm">
              || VERIFIED ON STARKNET · GASLESS TRANSACTIONS · PRIVACY PRESERVING · ZK POWERED · CHIPIPAY ||
            </span>
            <span className="ticker-item font-mono-data text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80] md:text-sm">
              || VERIFIED ON STARKNET · GASLESS TRANSACTIONS · PRIVACY PRESERVING · ZK POWERED · CHIPIPAY ||
            </span>
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works-bg border-t-4 border-b-4 border-[#CC0000] py-12 text-white">
          <div className="px-4 md:px-8">
            <h2 className="font-headline mb-8 text-3xl font-bold uppercase text-white md:text-4xl">
              How it works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
              <div className="animate-fade-in-up border-b border-white/20 p-8 md:border-b-0 md:border-r md:border-white/20">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">01</p>
                <h3 className="font-headline mt-4 text-2xl font-bold text-white">
                  Complete KYC
                </h3>
                <p className="mt-2 font-body text-sm text-white/70">
                  Upload your ID and a selfie. Your wallet is created during the flow. One-time payment of 1 USDC to issue your credential.
                </p>
              </div>
              <div className="animate-fade-in-up-delay-150 border-b border-white/20 p-8 md:border-b-0 md:border-r md:border-white/20">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">02</p>
                <h3 className="font-headline mt-4 text-2xl font-bold text-white">
                  Receive credential
                </h3>
                <p className="mt-2 font-body text-sm text-white/70">
                  Your ZeroPass credential is issued on Starknet and linked to your Chipi wallet. No personal data is stored on-chain.
                </p>
              </div>
              <div className="animate-fade-in-up-delay-3 p-8">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">03</p>
                <h3 className="font-headline mt-4 text-2xl font-bold text-white">
                  Access anywhere
                </h3>
                <p className="mt-2 font-body text-sm text-white/70">
                  Show your QR code or share your wallet address. Businesses verify your credential instantly. No forms, no repeated KYC.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b-4 border-[#111111] bg-[#111111] py-6">
          <p className="font-mono-data text-center text-sm font-medium uppercase tracking-widest text-[#4ade80] md:text-base">
            10,000+ VERIFICATIONS | STARKNET POWERED | GASLESS TRANSACTIONS
          </p>
        </section>

        {/* Footer */}
        <footer className="bg-newsprint py-12">
          <p className="font-mono-data text-center text-xs uppercase tracking-widest text-[#166534]">
            ZEROPASS © 2026 | Built on Starknet
          </p>
        </footer>
      </main>
    </div>
  );
}
