import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { CryptoWalletSection } from "@/components/crypto-wallet-section";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-violet-400" />
            <span className="text-lg font-semibold tracking-tight">ZeroPass</span>
            <span className="text-xs text-zinc-500">Verify once, access anywhere</span>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <SignedOut>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-12 text-center shadow-xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
              Bienvenido a Hackathon Chipi
            </h1>
            <p className="mt-3 text-zinc-400">
              Inicia sesión para usar tu wallet y ZeroPass.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <SignInButton mode="modal">
                <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Iniciar sesión
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full sm:w-auto border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                  Crear cuenta
                </Button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
                Tu wallet
              </h1>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
              <CryptoWalletSection />
            </div>

            <div className="flex justify-center">
              <Button
                asChild
                className="bg-violet-600 hover:bg-violet-500 text-white border-0"
              >
                <Link href="/dashboard">ZeroPass dashboard</Link>
              </Button>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
