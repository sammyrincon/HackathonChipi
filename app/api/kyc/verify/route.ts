import { NextRequest, NextResponse } from "next/server";

/**
 * Mock verification: for demo, any wallet address is considered "verified"
 * if the request includes a valid-looking address. In production this would
 * check a credential registry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const walletAddress = (body.walletAddress ?? body.address ?? "").trim();

    if (!walletAddress) {
      return NextResponse.json(
        { verified: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const looksLikeAddress =
      walletAddress.startsWith("0x") && walletAddress.length >= 40;

    return NextResponse.json({
      verified: looksLikeAddress,
      walletAddress,
      credentialId: looksLikeAddress
        ? `zp_linked_${walletAddress.slice(2, 14)}`
        : null,
      message: looksLikeAddress
        ? "ZeroPass credential verified. Verify once, access anywhere."
        : "Invalid wallet address.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
