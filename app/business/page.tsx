import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BusinessVerificationForm } from "./business-verification-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <header className="sticky top-0 z-10 border-b border-[#111111]/20 bg-newsprint px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#111111] hover:opacity-90">
            <ShieldCheck className="h-6 w-6 text-[#CC0000] md:h-7 md:w-7" />
            <span className="font-headline text-xl font-bold tracking-tight uppercase md:text-2xl">
              zeropass
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-md border-[#111111]/30 bg-transparent px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-[#111111]/80"
            >
              Business
            </Badge>
            <Button variant="ghost" size="icon" className="text-[#111111]/80 hover:bg-[#111111]/10 hover:text-[#111111]" asChild>
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 md:py-12">
        <Card className="rounded-lg border-[#111111]/15 shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-headline text-2xl font-bold tracking-tight text-[#111111]">
              Verify credential
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/80">
              Enter a user&apos;s wallet address or scan their QR code to verify their
              ZeroPass credential.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessVerificationForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
