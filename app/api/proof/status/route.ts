import { NextRequest, NextResponse } from "next/server";
import { CredentialStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeWallet } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * GET /api/proof/status?wallet=0x...
 * Returns proof data for QR payload when DEMO_PROOFS is enabled and credential is VERIFIED.
 */
export async function GET(request: NextRequest) {
  const limit = checkRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", code: "RATE_LIMITED", retryAfter: limit.retryAfter },
      {
        status: 429,
        headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined,
      }
    );
  }

  try {
    if (process.env.DEMO_PROOFS !== "true") {
      return NextResponse.json(
        { error: "Proofs are disabled" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet || !wallet.trim().startsWith("0x")) {
      return NextResponse.json(
        { error: "Missing or invalid wallet query parameter", code: "INVALID_WALLET" },
        { status: 400 }
      );
    }

    const walletLower = normalizeWallet(wallet);

    const credential = await prisma.credential.findFirst({
      where: {
        walletAddress: walletLower,
        status: CredentialStatus.VERIFIED,
      },
      orderBy: { expiresAt: "desc" },
      select: { credentialId: true, expiresAt: true },
    });

    if (!credential) {
      return NextResponse.json({
        hasProof: false,
        credentialId: null,
        commitment: null,
        payload: null,
      });
    }

    const now = new Date();
    if (credential.expiresAt && credential.expiresAt <= now) {
      return NextResponse.json({
        hasProof: false,
        credentialId: null,
        commitment: null,
        payload: null,
      });
    }

    const proof = await prisma.credentialProof.findUnique({
      where: { credentialId: credential.credentialId },
      select: { publicSignals: true },
    });

    if (!proof) {
      return NextResponse.json({
        hasProof: false,
        credentialId: credential.credentialId,
        commitment: null,
        payload: null,
      });
    }

    const publicSignals = proof.publicSignals as Record<string, unknown>;
    const commitment =
      typeof publicSignals?.commitment === "string"
        ? publicSignals.commitment
        : null;

    const payload = commitment
      ? `zp://verify?wallet=${encodeURIComponent(walletLower)}&cred=${encodeURIComponent(credential.credentialId)}&commitment=${encodeURIComponent(commitment)}`
      : null;

    return NextResponse.json({
      hasProof: true,
      credentialId: credential.credentialId,
      commitment,
      payload,
    });
  } catch (err) {
    console.error("[GET /api/proof/status]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
