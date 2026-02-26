import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LayoutDashboard } from "lucide-react";
import { HowItWorks } from "@/components/home/HowItWorks";

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
        {/* Hero: dark base, editorial texture, centered content */}
        <section className="relative flex min-h-[70vh] flex-col bg-black text-white">
          {/* Background image at 20–30% opacity */}
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          {/* Soft overlay for readability */}
          <div className="absolute inset-0 bg-black/60" aria-hidden />
          {/* Very faint editorial grid (3–5% opacity) */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />

          {/* Demo badge: top-right pill (only if NEXT_PUBLIC_DEMO) */}
          {process.env.NEXT_PUBLIC_DEMO === "true" && (
            <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6" aria-label="Demo build">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-transparent px-3 py-1.5 font-mono text-xs tracking-wide text-emerald-400">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                Demo Build
              </span>
            </div>
          )}

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 md:py-20">
            <div className="mx-auto w-full max-w-4xl text-center">
              <p className="animate-hero-fade-up font-mono-data text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                STARKNET POWERED IDENTITY
              </p>
              <h1 className="animate-hero-fade-up mt-3 font-headline text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                One-time KYC. Zero data leaks.
              </h1>
              <p className="animate-hero-fade-up-delay-100 mt-6 max-w-2xl mx-auto font-sans text-base leading-relaxed text-white/80 md:text-lg">
                Issue a privacy-preserving credential on Starknet and verify anywhere without sharing personal data.
              </p>
              <div className="animate-hero-fade-up-delay-200 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button
                  asChild
                  size="lg"
                  className="hero-cta-glow w-full rounded-md bg-[#CC0000] font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#CC0000]/95 sm:w-auto"
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
                  className="w-full rounded-md border border-white/30 bg-transparent font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link href="/business">Verify a credential</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full rounded-md border border-white/30 bg-transparent font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Go to dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Bottom ticker strip: dark, thin border, subtle scroll */}
        <section className="overflow-hidden border-y border-white/10 bg-[#0a0a0a] py-3" aria-label="Platform stats">
          <div className="animate-ticker-subtle flex w-max items-center gap-12 whitespace-nowrap px-4">
            <span className="font-mono-data text-xs font-medium tracking-[0.15em] text-white/70">
              10,000+ VERIFICATIONS | STARKNET POWERED | GASLESS TRANSACTIONS
            </span>
            <span className="font-mono-data text-xs font-medium tracking-[0.15em] text-white/70">
              10,000+ VERIFICATIONS | STARKNET POWERED | GASLESS TRANSACTIONS
            </span>
          </div>
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
