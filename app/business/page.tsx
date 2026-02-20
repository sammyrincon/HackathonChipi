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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" asChild>
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-violet-400" />
              <span className="text-lg font-semibold tracking-tight">ZeroPass</span>
            </div>
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
              Business
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
          Verify credential
        </h1>
        <p className="mb-8 text-zinc-400">
          Enter a user&apos;s wallet address or scan their QR code to verify their
          ZeroPass credential.
        </p>

        <BusinessVerificationForm />
      </main>
    </div>
  );
}
