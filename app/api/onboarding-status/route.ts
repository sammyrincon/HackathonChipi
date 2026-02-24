import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/onboarding-status
 * Returns whether the user has completed wallet onboarding.
 * Used by OnboardingGuard for redirects. Does NOT create wallet or touch keys.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasOnboarding: false }, { status: 200 });
    }

    const [secret, credential] = await Promise.all([
      typeof prisma.userWalletSecret?.findUnique === "function"
        ? prisma.userWalletSecret.findUnique({
            where: { clerkUserId: userId },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.credential.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      }),
    ]);

    const hasOnboarding = Boolean(secret ?? credential);

    return NextResponse.json({ hasOnboarding });
  } catch (err) {
    console.error("ONBOARDING_STATUS_ERROR:", err);
    return NextResponse.json({ hasOnboarding: false }, { status: 200 });
  }
}
