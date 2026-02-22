import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { CredentialStatus } from "@prisma/client";

export type KycStatusResponse = {
  hasCredential: boolean;
  credentialId: string | null;
  status: "PENDING" | "VERIFIED" | "REVOKED" | "EXPIRED" | "none";
  walletAddress: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
};

/** Safe value for VERIFIED to avoid runtime undefined when Prisma enum is not available in bundle */
const VERIFIED_STATUS =
  typeof CredentialStatus !== "undefined" && CredentialStatus.VERIFIED != null
    ? CredentialStatus.VERIFIED
    : ("VERIFIED" as const);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credential = await prisma.credential.findUnique({
      where: { clerkUserId: userId },
    });

    if (!credential) {
      const response: KycStatusResponse = {
        hasCredential: false,
        credentialId: null,
        status: "none",
        walletAddress: null,
        issuedAt: null,
        expiresAt: null,
      };
      return NextResponse.json(response);
    }

    const now = new Date();
    const isExpired =
      credential.expiresAt != null && credential.expiresAt < now;
    const derivedStatus: KycStatusResponse["status"] =
      credential.status === VERIFIED_STATUS && isExpired
        ? "EXPIRED"
        : credential.status;

    const response: KycStatusResponse = {
      hasCredential: true,
      credentialId: credential.credentialId,
      status: derivedStatus,
      walletAddress: credential.walletAddress,
      issuedAt: credential.issuedAt?.toISOString() ?? null,
      expiresAt: credential.expiresAt?.toISOString() ?? null,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[GET /api/kyc/status]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
