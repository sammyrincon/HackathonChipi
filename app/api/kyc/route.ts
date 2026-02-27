import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CredentialStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { kycSubmitSchema } from "@/lib/validators";
import { verifyPayment } from "@/lib/payments";
import { normalizeWallet } from "@/lib/utils";
import { randomHex } from "@/lib/crypto-utils";
import { isBackendDemo } from "@/lib/demo";

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

function toCredentialStatus(
  status: "PENDING" | "VERIFIED" | "REVOKED" | "EXPIRED"
): CredentialStatus {
  switch (status) {
    case "VERIFIED":
      return CredentialStatus.VERIFIED;
    case "REVOKED":
      return CredentialStatus.REVOKED;
    case "EXPIRED":
      return CredentialStatus.EXPIRED;
    default:
      return CredentialStatus.PENDING;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body", code: "INVALID_BODY" }, { status: 400 });
    }

    const parsed = kycSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_FAILED", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const raw =
      (parsed.data as { wallet?: string; walletAddress?: string }).wallet ??
      parsed.data.walletAddress;
    const walletAddress = normalizeWallet(raw ?? "");
    const txHash = parsed.data.transactionHash;
    const bodyStatus = (parsed.data as { status?: string }).status;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "wallet or walletAddress is required and must be non-empty", code: "MISSING_WALLET" },
        { status: 400 }
      );
    }

    if (bodyStatus !== undefined && bodyStatus !== null && bodyStatus !== "" && !isBackendDemo) {
      return NextResponse.json(
        { error: "Demo KYC disabled: set DEMO=true on the server", code: "DEMO_DISABLED" },
        { status: 403 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

    const existing = await prisma.credential.findUnique({
      where: { clerkUserId: userId },
    });

    const existingWalletNormalized = existing?.walletAddress?.trim().toLowerCase() ?? "";
    const incomingWalletNormalized = walletAddress.trim().toLowerCase();

    if (existing?.walletAddress && existingWalletNormalized !== incomingWalletNormalized) {
      console.error("WALLET_MISMATCH: Credential already linked to a different wallet. Blocking update.", {
        userId,
        existingWalletPrefix: existing.walletAddress.slice(0, 18) + "...",
        incomingWalletPrefix: walletAddress.slice(0, 18) + "...",
      });
      return NextResponse.json(
        {
          error: "Credential already linked to a different wallet. Do not overwrite.",
          code: "WALLET_MISMATCH",
        },
        { status: 400 }
      );
    }

    const credentialId =
      existing?.credentialId ?? `zp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    let status: "PENDING" | "VERIFIED" | "REVOKED" | "EXPIRED" = "PENDING";
    let issuedAt: Date | null = null;
    let finalExpiresAt: Date | null = null;

    if (isBackendDemo && (bodyStatus === "VERIFIED" || bodyStatus === "PENDING" || bodyStatus === "REVOKED" || bodyStatus === "EXPIRED")) {
      status = bodyStatus;
      if (status === "VERIFIED") {
        issuedAt = now;
        finalExpiresAt = expiresAt;
      }
    } else if (txHash && walletAddress) {
      const paymentOk = await verifyPayment(txHash, walletAddress);
      if (paymentOk) {
        status = "VERIFIED";
        issuedAt = now;
        finalExpiresAt = expiresAt;
      }
    }

    const statusEnum = toCredentialStatus(status);
    const createExpiresAt =
      status === "VERIFIED" && finalExpiresAt ? finalExpiresAt : expiresAt;
    const createIssuedAt =
      status === "VERIFIED" && issuedAt ? issuedAt : null;

    const isDemo = isBackendDemo && (bodyStatus === "VERIFIED" || bodyStatus === "PENDING");
    if (process.env.NODE_ENV === "development") {
      console.log("KYC REQUEST", {
        userId,
        walletAddress: walletAddress.slice(0, 14) + "...",
        statusUsed: status,
        isDemo: !!isDemo,
      });
    }
    const credential = await prisma.credential.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        walletAddress,
        status: statusEnum,
        credentialId,
        transactionHash: txHash ?? null,
        ...(createIssuedAt ? { issuedAt: createIssuedAt } : {}),
        expiresAt: createExpiresAt,
      },
      update: {
        ...(existing?.walletAddress ? {} : { walletAddress }),
        credentialId,
        status: statusEnum,
        transactionHash: txHash ?? null,
        ...(status === "VERIFIED" && issuedAt && finalExpiresAt
          ? { issuedAt, expiresAt: finalExpiresAt }
          : {}),
      },
    });

    // When VERIFIED and demo mode enabled, upsert stub proof for QR verification.
    if (
      credential.status === CredentialStatus.VERIFIED &&
      isBackendDemo
    ) {
      const walletLower = normalizeWallet(credential.walletAddress);
      const commitment = "0x" + randomHex(32);
      const issuedAtDate = credential.issuedAt ?? new Date();
      const expiresAtDate = credential.expiresAt ?? new Date();
      const publicSignals = {
        issuer: "ZeroPassDemo",
        walletAddress: walletLower,
        credentialId: credential.credentialId,
        expiresAt: expiresAtDate.toISOString(),
        issuedAt: issuedAtDate.toISOString(),
        commitment,
      };
      const proof = {
        type: "stub",
        nullifier: "0x" + randomHex(32),
        signature: "0x" + randomHex(65),
      };
      await prisma.credentialProof.upsert({
        where: { credentialId: credential.credentialId },
        create: {
          credentialId: credential.credentialId,
          walletAddress: walletLower,
          scheme: "STUB",
          proof,
          publicSignals,
        },
        update: {
          walletAddress: walletLower,
          scheme: "STUB",
          proof,
          publicSignals,
        },
      });
      if (process.env.NODE_ENV === "development") {
        console.log("DEMO_PROOF_UPSERT", { credentialId: credential.credentialId });
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("KYC UPSERT RESULT", {
        credentialId: credential.credentialId,
        status: credential.status,
      });
    }

    const response = {
      ok: credential.status === CredentialStatus.VERIFIED,
      credentialId: credential.credentialId,
      walletAddress: credential.walletAddress,
      status: credential.status as KycCredentialResponse["status"],
      expiresAt: credential.expiresAt?.toISOString() ?? null,
      issuedAt:
        credential.status === CredentialStatus.VERIFIED
          ? (credential.issuedAt?.toISOString() ?? null)
          : null,
      transactionHash: credential.transactionHash,
      message:
        credential.status === CredentialStatus.VERIFIED
          ? "ZeroPass credential issued. Verify once, access anywhere."
          : "Credential created. Complete payment to activate.",
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("CREATE CREDENTIAL ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
