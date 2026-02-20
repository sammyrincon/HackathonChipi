import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Verifies a wallet address by looking up a stored Credential in the database.
 * Returns verified: true only if a non-expired credential exists for that address.
 */
export async function POST(request: NextRequest) {
  try {
    let body: { walletAddress?: string; address?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { verified: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const walletAddress = (body.walletAddress ?? body.address ?? "").trim();

    if (!walletAddress) {
      return NextResponse.json(
        { verified: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const credential = await prisma.credential.findFirst({
      where: {
        walletAddress,
        status: "verified",
        expiresAt: { gt: now },
      },
    });

    const verified = !!credential;

    return NextResponse.json({
      verified,
      walletAddress,
      credentialId: credential?.credentialId ?? null,
      message: verified
        ? "ZeroPass credential verified. Verify once, access anywhere."
        : "No valid credential found for this wallet address.",
    });
  } catch (err) {
    console.error("[POST /api/kyc/verify]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
