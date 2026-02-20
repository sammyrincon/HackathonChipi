"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export function KycForm() {
  const { getToken } = useAuth();
  const { data: walletResponse } = useGetWallet({ getBearerToken: getToken });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credential, setCredential] = useState<{
    credentialId: string;
    status: string;
    walletAddress: string;
    message: string;
  } | null>(null);

  const walletAddress = walletResponse?.publicKey ?? walletResponse?.normalizedPublicKey ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      toast.error("Please upload both ID and selfie");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddress || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "KYC submission failed");
      }
      const data = await res.json();
      setCredential(data);
      toast.success("ZeroPass credential issued!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (credential) {
    return (
      <Card className="border-emerald-800/60 bg-emerald-950/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            Credential issued
          </CardTitle>
          <CardDescription className="text-zinc-400">{credential.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-500">Credential ID:</span>{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
              {credential.credentialId}
            </code>
          </p>
          {credential.walletAddress && (
            <p className="text-sm text-zinc-300">
              <span className="text-zinc-500">Linked wallet:</span>{" "}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {credential.walletAddress.slice(0, 10)}...{credential.walletAddress.slice(-8)}
              </code>
            </p>
          )}
          <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-500 text-white border-0">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-zinc-100">Upload documents</CardTitle>
        <CardDescription className="text-zinc-400">
          Upload a government-issued ID and a selfie to verify your identity and receive your ZeroPass credential.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="id-photo" className="text-zinc-300">Photo of ID</Label>
            <Input
              id="id-photo"
              type="file"
              accept="image/*"
              className="border-zinc-700 bg-zinc-900 text-zinc-100 file:text-zinc-300"
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selfie" className="text-zinc-300">Selfie</Label>
            <Input
              id="selfie"
              type="file"
              accept="image/*"
              className="border-zinc-700 bg-zinc-900 text-zinc-100 file:text-zinc-300"
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {walletAddress && (
            <p className="text-xs text-zinc-500">
              Credential will be linked to: {walletAddress.slice(0, 10)}...
              {walletAddress.slice(-8)}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting || !idFile || !selfieFile}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit KYC"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
