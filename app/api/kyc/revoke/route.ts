import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CredentialStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export type RevokeResponse = {
  ok: boolean;
  status: string;
  message: string;
};

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const credential = await prisma.credential.findUnique({
      where: { clerkUserId: userId },
    });

    if (!credential) {
      return NextResponse.json(
        { error: "No credential found to revoke", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (credential.status === CredentialStatus.REVOKED) {
      return NextResponse.json({
        ok: true,
        status: "REVOKED",
        message: "Credential was already revoked.",
      });
    }

    await prisma.credential.update({
      where: { clerkUserId: userId },
      data: {
        status: CredentialStatus.REVOKED,
      },
    });

    const response: RevokeResponse = {
      ok: true,
      status: "REVOKED",
      message: "Credential revoked successfully.",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[POST /api/kyc/revoke]", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
