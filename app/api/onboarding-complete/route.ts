import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/onboarding-complete
 * Marks the user as having completed wallet onboarding (creates UserWalletSecret row).
 * Does NOT store or touch private keys. Does NOT create or regenerate wallet.
 * Idempotent: if row exists, no-op. Never overwrites.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (typeof prisma.userWalletSecret?.upsert !== "function") {
      console.error("ONBOARDING_COMPLETE: UserWalletSecret model not available. Run: npx prisma generate");
      return NextResponse.json(
        { error: "Server configuration error", code: "PRISMA_NOT_GENERATED" },
        { status: 503 }
      );
    }
    await prisma.userWalletSecret.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ONBOARDING_COMPLETE_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
