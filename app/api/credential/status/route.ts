import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type CredentialStatusResponse = {
  exists: boolean;
  status: string | null;
  expiresAt: string | null;
};

function normalizeWallet(wallet: string): string {
  return wallet.trim().toLowerCase();
}

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
      where: {
        walletAddress: { equals: walletLower, mode: "insensitive" },
      },
      orderBy: { expiresAt: "desc" },
    });

    if (!credential) {
      const response: CredentialStatusResponse = {
        exists: false,
        status: null,
        expiresAt: null,
      };
      return NextResponse.json(response);
    }

    const now = new Date();
    const isExpired =
      credential.expiresAt != null && credential.expiresAt < now;
    const derivedStatus =
      credential.status === "VERIFIED" && isExpired
        ? "EXPIRED"
        : credential.status;

    const response: CredentialStatusResponse = {
      exists: true,
      status: derivedStatus,
      expiresAt: credential.expiresAt?.toISOString() ?? null,
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
