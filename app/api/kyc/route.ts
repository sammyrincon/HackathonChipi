import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { kycSubmitSchema } from "@/lib/validators";
import { verifyPayment } from "@/lib/payments";

type Status = "PENDING" | "VERIFIED" | "REVOKED" | "EXPIRED";

export type KycCredentialResponse = {
  ok: boolean;
  credentialId: string;
  status: "PENDING" | "VERIFIED" | "REVOKED" | "EXPIRED";
  walletAddress: string;
  transactionHash: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  message: string;
};

const EXPIRY_DAYS = 30;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = kycSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { walletAddress: rawWallet, transactionHash: txHash } = parsed.data;
    const walletAddress = rawWallet?.trim() ?? "";

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    const credentialId = `zp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

    const existing = await prisma.credential.findUnique({
      where: { clerkUserId: userId },
    });

    let status: Status = "PENDING";
    let issuedAt: Date | null = null;
    let finalExpiresAt: Date | null = null;

    if (txHash && walletAddress) {
      const paymentOk = await verifyPayment(txHash, walletAddress);
      if (paymentOk) {
        status = "VERIFIED";
        issuedAt = now;
        finalExpiresAt = expiresAt;
      }
    }

    const credential = await prisma.credential.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        walletAddress,
        status,
        credentialId,
        transactionHash: txHash ?? null,
        issuedAt: status === "VERIFIED" && issuedAt ? issuedAt : now,
        expiresAt: status === "VERIFIED" && finalExpiresAt ? finalExpiresAt : expiresAt,
      },
      update: {
        walletAddress,
        ...(existing?.status === "REVOKED"
          ? {}
          : {
              status,
              transactionHash: txHash ?? undefined,
              ...(status === "VERIFIED" && issuedAt != null && finalExpiresAt != null
                ? { issuedAt, expiresAt: finalExpiresAt }
                : {}),
            }),
      },
    });

    const response: KycCredentialResponse = {
      ok: credential.status === "VERIFIED",
      credentialId: credential.credentialId,
      status: credential.status as KycCredentialResponse["status"],
      walletAddress: credential.walletAddress,
      transactionHash: credential.transactionHash,
      issuedAt: credential.issuedAt?.toISOString() ?? null,
      expiresAt: credential.expiresAt?.toISOString() ?? null,
      message:
        credential.status === "VERIFIED"
          ? "ZeroPass credential issued. Verify once, access anywhere."
          : "Credential created. Complete payment to activate.",
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
