import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen newsprint-bg text-[#111111]">
      <header className="border-b-8 border-[#111111] bg-newsprint py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="animate-float h-6 w-6 text-[#CC0000]" />
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
        {/* Hero with background image overlay */}
        <section className="relative min-h-[60vh] flex items-center border-b-4 border-[#111111] py-20">
          {/* Background image at 10% opacity */}
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <div className="relative z-10">
            <h1 className="animate-hero-fade-slide-up font-headline text-6xl font-black uppercase leading-none tracking-tighter text-[#111111] md:text-8xl">
              Verify once. Access anywhere.
            </h1>
            <p className="mt-8 max-w-2xl font-body text-lg leading-relaxed text-[#111111]/80">
              ZeroPass issues a privacy-preserving credential on Starknet. Complete KYC once,
              receive a verifiable credential linked to your wallet, and prove your identity
              anywhere without sharing personal data.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full rounded-none bg-[#111111] font-semibold uppercase tracking-wide text-white hover:bg-[#111111]/90 sm:w-auto" variant="default">
                <Link href="/kyc">Get verified</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full rounded-none border-2 border-[#111111] font-semibold uppercase tracking-wide hover:bg-[#111111] hover:text-white sm:w-auto">
                <Link href="/business">Verify a credential</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full rounded-none border-2 border-[#111111] font-semibold uppercase tracking-wide hover:bg-[#111111] hover:text-white sm:w-auto">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Go to dashboard
                </Link>
              </Button>
            </div>
          </div>
          {/* Ticker / marquee */}
          <div className="mt-8 overflow-hidden border-t-2 border-[#111111] bg-[#111111] py-3">
            <div className="flex w-max animate-ticker-scroll items-center gap-8 whitespace-nowrap font-mono-data text-sm font-medium uppercase tracking-widest text-white">
              <span>VERIFIED ON STARKNET · GASLESS TRANSACTIONS · PRIVACY PRESERVING · ZK POWERED · </span>
              <span>VERIFIED ON STARKNET · GASLESS TRANSACTIONS · PRIVACY PRESERVING · ZK POWERED · </span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works-bg border-t-4 border-b-4 border-[#CC0000] py-12 text-white">
          <div>
            <h2 className="font-headline mb-8 text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-0">
              <div className="animate-fade-in-up border-b border-white/20 p-10 md:border-b-0 md:border-r md:border-white/20">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">01</p>
                <h3 className="font-headline mt-3 text-2xl font-bold text-white">
                  Complete KYC
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                  Upload your ID and a selfie. Your wallet is created during the flow. One-time payment of 1 USDC to issue your credential.
                </p>
              </div>
              <div className="animate-fade-in-up-delay-150 border-b border-white/20 p-10 md:border-b-0 md:border-r md:border-white/20">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">02</p>
                <h3 className="font-headline mt-3 text-2xl font-bold text-white">
                  Receive credential
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                  Your ZeroPass credential is issued on Starknet and linked to your Chipi wallet. No personal data is stored on-chain.
                </p>
              </div>
              <div className="animate-fade-in-up-delay-3 p-10">
                <p className="font-headline text-8xl font-black leading-none text-[#CC0000]">03</p>
                <h3 className="font-headline mt-3 text-2xl font-bold text-white">
                  Access anywhere
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                  Show your QR code or share your wallet address. Businesses verify your credential instantly—no forms, no repeated KYC.
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
          <p className="font-mono-data text-center text-xs uppercase tracking-widest text-[#111111]/70">
            ZEROPASS © 2026 | Built on Starknet
          </p>
        </footer>
      </main>
    </div>
  );
}
