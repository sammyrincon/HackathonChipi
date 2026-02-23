import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CredentialStatus } from "@prisma/client";
import { normalizeWallet } from "@/lib/utils";

export type CredentialStatusResponse = {
  exists: boolean;
  status: CredentialStatus | "EXPIRED" | null;
  expiresAt: string | null;
  valid: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet || wallet.trim() === "") {
      return NextResponse.json(
        { error: "Missing wallet query parameter" },
        { status: 400 }
      );
    }

    const walletLower = normalizeWallet(wallet);

    const credential = await prisma.credential.findFirst({
      where: { walletAddress: walletLower },
      orderBy: { expiresAt: "desc" },
      select: { status: true, expiresAt: true },
    });

    if (!credential) {
      const response: CredentialStatusResponse = {
        exists: false,
        status: null,
        expiresAt: null,
        valid: false,
      };
      return NextResponse.json(response);
    }

    const now = new Date();
    const expiresAt = credential.expiresAt;
    const isExpired = !!expiresAt && expiresAt.getTime() <= now.getTime();

    const status =
      credential.status === CredentialStatus.VERIFIED && isExpired
        ? "EXPIRED"
        : credential.status;

    const valid =
      credential.status === CredentialStatus.VERIFIED &&
      !isExpired;

    const response: CredentialStatusResponse = {
      exists: true,
      status,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      valid,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[GET /api/credential/status]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}