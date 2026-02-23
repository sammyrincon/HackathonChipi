import { NextRequest, NextResponse } from "next/server";
import { CredentialStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeWallet } from "@/lib/utils";

/**
 * Parse ZeroPass payload string: zp://verify?wallet=0x...&cred=<credentialId>&commitment=0x...
 */
function parsePayload(payload: string): {
  wallet: string;
  cred: string;
  commitment: string;
} | null {
  const trimmed = payload.trim();
  if (!trimmed.startsWith("zp://verify")) return null;
  const q = trimmed.indexOf("?");
  if (q === -1) return null;
  const params = new URLSearchParams(trimmed.slice(q + 1));
  const wallet = params.get("wallet") ?? "";
  const cred = params.get("cred") ?? "";
  const commitment = params.get("commitment") ?? "";
  if (!wallet.startsWith("0x") || !cred || !commitment) return null;
  return { wallet, cred, commitment };
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.DEMO_PROOFS !== "true") {
      return NextResponse.json({
        valid: false,
        reason: "PROOFS_DISABLED",
      });
    }

    let body: { payload?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const payload = body.payload;
    if (typeof payload !== "string" || !payload.trim()) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const parsed = parsePayload(payload);
    if (!parsed) {
      return NextResponse.json({
        valid: false,
        reason: "MISMATCH",
      });
    }

    const walletLower = normalizeWallet(parsed.wallet);

    const credential = await prisma.credential.findFirst({
      where: {
        walletAddress: walletLower,
        status: CredentialStatus.VERIFIED,
        credentialId: parsed.cred,
      },
      select: { credentialId: true, walletAddress: true, expiresAt: true },
    });

    if (!credential) {
      const anyCred = await prisma.credential.findFirst({
        where: { walletAddress: walletLower },
        select: { status: true, expiresAt: true },
      });
      if (!anyCred)
        return NextResponse.json({ valid: false, reason: "NO_CREDENTIAL" });
      if (anyCred.status !== CredentialStatus.VERIFIED)
        return NextResponse.json({ valid: false, reason: "NO_CREDENTIAL" });
      const now = new Date();
      if (anyCred.expiresAt && anyCred.expiresAt <= now)
        return NextResponse.json({ valid: false, reason: "EXPIRED" });
      return NextResponse.json({ valid: false, reason: "NO_CREDENTIAL" });
    }

    const now = new Date();
    if (credential.expiresAt && credential.expiresAt <= now) {
      return NextResponse.json({ valid: false, reason: "EXPIRED" });
    }

    const proofRow = await prisma.credentialProof.findFirst({
      where: {
        credentialId: parsed.cred,
        walletAddress: walletLower,
      },
      select: { publicSignals: true, scheme: true },
    });

    if (!proofRow) {
      return NextResponse.json({ valid: false, reason: "NO_PROOF" });
    }

    const publicSignals = proofRow.publicSignals as Record<string, unknown>;
    const commitmentStored =
      typeof publicSignals?.commitment === "string"
        ? publicSignals.commitment
        : "";
    if (commitmentStored !== parsed.commitment) {
      return NextResponse.json({ valid: false, reason: "MISMATCH" });
    }

    const issuer =
      typeof publicSignals?.issuer === "string" ? publicSignals.issuer : "";

    return NextResponse.json({
      valid: true,
      credentialId: credential.credentialId,
      walletAddress: credential.walletAddress,
      expiresAt: credential.expiresAt?.toISOString() ?? null,
      publicSignals: { issuer, commitment: commitmentStored },
      scheme: proofRow.scheme,
    });
  } catch (err) {
    console.error("[POST /api/proof/verify]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
