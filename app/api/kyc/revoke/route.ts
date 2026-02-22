import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { CredentialStatus } from "@prisma/client";

export type RevokeResponse = {
  ok: boolean;
  status: CredentialStatus;
  message: string;
};

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credential = await prisma.credential.findUnique({
      where: { clerkUserId: userId },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "No credential found to revoke" },
        { status: 404 }
      );
    }

    if (credential.status === CredentialStatus.REVOKED) {
      return NextResponse.json({
        ok: true,
        status: CredentialStatus.REVOKED,
        message: "Credential was already revoked.",
      });
    }

    const now = new Date();
    await prisma.credential.update({
      where: { clerkUserId: userId },
      data: {
        status: CredentialStatus.REVOKED,
        revokedAt: now,
      },
    });

    const response: RevokeResponse = {
      ok: true,
      status: CredentialStatus.REVOKED,
      message: "Credential revoked successfully.",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[POST /api/kyc/revoke]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
