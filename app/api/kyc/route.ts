import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export type KycSubmitBody = {
  walletAddress?: string;
  transactionHash?: string;
};

export type KycCredentialResponse = {
  credentialId: string;
  status: "verified";
  walletAddress: string;
  transactionHash: string | null;
  issuedAt: string;
  expiresAt: string;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: KycSubmitBody = {};
    try {
      body = (await request.json()) as KycSubmitBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const walletAddress = body.walletAddress ?? "0x0";
    const transactionHash = body.transactionHash ?? null;

    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);

    const credentialId = `zp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const credential = await prisma.credential.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        walletAddress,
        status: "verified",
        credentialId,
        transactionHash,
        issuedAt: now,
        expiresAt: expires,
      },
      update: {
        walletAddress,
        status: "verified",
        credentialId,
        transactionHash,
        issuedAt: now,
        expiresAt: expires,
      },
    });

    const response: KycCredentialResponse = {
      credentialId: credential.credentialId,
      status: "verified",
      walletAddress: credential.walletAddress,
      transactionHash: credential.transactionHash,
      issuedAt: credential.issuedAt.toISOString(),
      expiresAt: credential.expiresAt.toISOString(),
      message: "ZeroPass credential issued. Verify once, access anywhere.",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[POST /api/kyc]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
