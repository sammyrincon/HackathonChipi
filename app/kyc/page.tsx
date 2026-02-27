import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KycForm } from "./kyc-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
              className="rounded-md border-[#CC0000]/40 bg-[#CC0000]/5 px-2 py-0.5 text-xs font-medium text-[#CC0000]"
            >
              KYC
            </Badge>
            <Button variant="ghost" size="icon" className="text-[#111111]/80 hover:bg-[#111111]/10 hover:text-[#111111]" asChild>
              <Link href="/dashboard" aria-label="Back to dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 md:py-12">
        <Card className="rounded-lg border-[#111111]/15 shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="font-headline text-2xl font-bold tracking-tight text-[#111111]">
              KYC verification
            </CardTitle>
            <CardDescription className="font-body text-[#111111]/80">
              Upload a photo of your government-issued ID and a selfie to receive your
              ZeroPass credential linked to your Chipi wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KycForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
