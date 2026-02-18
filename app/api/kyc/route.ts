import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export type KycSubmitBody = {
  walletAddress?: string;
};

export type KycMockCredential = {
  credentialId: string;
  status: "verified";
  walletAddress: string;
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

    const body = (await request.json()) as KycSubmitBody;
    const walletAddress = body.walletAddress ?? "0x0";

    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);

    const credential: KycMockCredential = {
      credentialId: `zp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      status: "verified",
      walletAddress,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      message: "ZeroPass credential issued. Verify once, access anywhere.",
    };

    return NextResponse.json(credential);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
