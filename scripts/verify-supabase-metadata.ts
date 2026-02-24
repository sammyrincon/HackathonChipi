/**
 * Verifies that KYC/credential metadata is stored in Supabase.
 * Run from project root: npx tsx scripts/verify-supabase-metadata.ts
 * Load .env.local first (e.g. export from .env.local or use --env-file in Node 20+).
 */

import { prisma } from "../lib/db";

async function main() {
  console.log("=== Supabase metadata verification ===\n");

  const credentials = await prisma.credential.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      clerkUserId: true,
      walletAddress: true,
      status: true,
      credentialId: true,
      issuedAt: true,
      expiresAt: true,
      transactionHash: true,
      createdAt: true,
    },
  });

  console.log("Credential table (latest 10):");
  console.log("Count:", credentials.length);
  if (credentials.length === 0) {
    console.log(
      "No credentials yet. Complete the KYC flow (Get Verified) to create one.\n"
    );
  } else {
    credentials.forEach((c, i) => {
      console.log(`\n--- ${i + 1} ---`);
      console.log("  clerkUserId:", c.clerkUserId);
      console.log("  walletAddress:", c.walletAddress);
      console.log("  status:", c.status);
      console.log("  credentialId:", c.credentialId);
      console.log("  issuedAt:", c.issuedAt?.toISOString?.() ?? c.issuedAt);
      console.log("  expiresAt:", c.expiresAt?.toISOString?.() ?? c.expiresAt);
      console.log("  createdAt:", c.createdAt?.toISOString?.() ?? c.createdAt);
    });
  }

  const proofs = await prisma.credentialProof.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      credentialId: true,
      walletAddress: true,
      scheme: true,
      createdAt: true,
    },
  });

  console.log("\n\nCredentialProof table (latest 5):");
  console.log("Count:", proofs.length);
  proofs.forEach((p, i) => {
    console.log(
      `  ${i + 1}. credentialId=${p.credentialId} wallet=${p.walletAddress?.slice(0, 18)}... scheme=${p.scheme}`
    );
  });

  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log("\n\nActivityLog table (latest 5):");
  console.log("Count:", activities.length);
  activities.forEach((a, i) => {
    console.log(
      `  ${i + 1}. clerkUserId=${a.clerkUserId} type=${a.type} createdAt=${a.createdAt?.toISOString?.() ?? a.createdAt}`
    );
  });

  console.log("\n=== Verification complete ===");
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
