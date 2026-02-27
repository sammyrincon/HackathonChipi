import { NextRequest, NextResponse } from "next/server";
import { CredentialStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifySchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rateLimit";
import { normalizeWallet } from "@/lib/utils";

export type VerifyResponse = {
  verified: boolean;
  walletAddress: string;
  credentialId: string | null;
  reason?: string;
  expiresAt?: string;
  message: string;
};

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      {
        verified: false,
        error: "Too many requests",
        code: "RATE_LIMITED",
        retryAfter: limit.retryAfter,
      },
      {
        status: 429,
        headers: limit.retryAfter
          ? { "Retry-After": String(limit.retryAfter) }
          : undefined,
      }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { verified: false, error: "Invalid JSON body", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          verified: false,
          error: "Validation failed",
          code: "VALIDATION_FAILED",
          reason: z.flattenError(parsed.error).formErrors?.[0],
        },
        { status: 400 }
      );
    }

    const { walletAddress } = parsed.data;
    const walletLower = normalizeWallet(walletAddress);
    const now = new Date();

    const credential = await prisma.credential.findFirst({
      where: {
        walletAddress: walletLower,
        status: CredentialStatus.VERIFIED,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "desc" },
    });

    const verified = !!credential;

    const response: VerifyResponse = {
      verified,
      walletAddress: walletLower,
      credentialId: credential?.credentialId ?? null,
      expiresAt: credential?.expiresAt?.toISOString() ?? undefined,
      reason: verified ? undefined : "No valid credential found for this wallet address.",
      message: verified
        ? "ZeroPass credential verified. Verify once, access anywhere."
        : "No valid credential found for this wallet address.",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[POST /api/kyc/verify]", err);
    return NextResponse.json(
      { verified: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
